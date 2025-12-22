from django.db.models import Q, Count, Value, OuterRef, Subquery, Case, When, IntegerField, ExpressionWrapper
from django.db.models.functions import Trim, Upper, Length, Substr, Coalesce
from django.contrib.postgres.aggregates import StringAgg

from rest_framework import status, generics, viewsets  # Adicionado viewsets aqui
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from drawings.models import Drawing
from .models import Product, SB1010, Sector, ProductType
from django.db.models import F

# Importando serializers (ajuste os caminhos conforme sua estrutura de pastas)
from .serializers import SectorSerializer, ProductTypeSerializer, ProductSerializer
from drawings.serializers import DrawingSerializer


class ProductCatalogView(generics.GenericAPIView):
    """
    Catálogo (somente leitura) baseado na SB1010 (Protheus),
    agrupado por uma chave derivada do desenho:

      product_key = UPPER(TRIM(B1_DESENHO)) removendo os 3 últimos caracteres
                   (ex: SID110-0001-000-01 -> SID110-0001-000)

    Join com o controle local:
      Drawing.code (já vem SEM sufixo) normalizado: UPPER(TRIM(code))
    """

    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None:
            return []
        if isinstance(value, list):
            raw = value
        else:
            raw = [value]

        out = []
        for item in raw:
            if item is None:
                continue
            for p in str(item).split(","):
                p = p.strip()
                if not p:
                    continue
                try:
                    out.append(int(p))
                except ValueError:
                    pass
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(
            request.query_params.getlist("sectors") or request.query_params.get("sectors")
        )
        types = self._parse_id_list(
            request.query_params.getlist("types") or request.query_params.get("types")
        )

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros limit/offset inválidos."}, status=status.HTTP_400_BAD_REQUEST)

        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        # -------------------------
        # 1) Base SB1010 (Protheus)
        # -------------------------
        sb = (
            SB1010.objects
            .exclude(deleted="*")
            .exclude(b1_desenho__isnull=True)
            .exclude(b1_desenho="")
        )

        # Normalização inicial para gerar a chave
        sb = sb.annotate(
            desenho_norm=Upper(Trim("b1_desenho")),
            desenho_len=Length(Upper(Trim("b1_desenho")))
        )

        # Cálculo da product_key (removendo sufixo de 3 chars)
        cut_len = ExpressionWrapper(F("desenho_len") - Value(3), output_field=IntegerField())
        
        sb = sb.annotate(
            product_key=Case(
                When(desenho_len__gt=3, then=Substr("desenho_norm", 1, cut_len)),
                default=F("desenho_norm"),
            )
        )

        # Filtros de texto
        if codigo:
            sb = sb.filter(b1_cod__icontains=codigo)
        if descricao:
            sb = sb.filter(b1_desc__icontains=descricao)
        if desenho:
            sb = sb.filter(b1_desenho__icontains=desenho)

        # ---------------------------------------
        # 2) Controle local: Drawing + Product
        # ---------------------------------------
        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        prod = Product.objects.select_related("drawing", "sector", "product_type")

        if sectors:
            prod = prod.filter(sector_id__in=sectors)
        if types:
            prod = prod.filter(product_type_id__in=types)

        # Filtragem por mapeamento ou filtros de setor/tipo
        only_mapped = (request.query_params.get("only_mapped") or "1") == "1"

        if only_mapped or sectors or types:
            allowed_keys = (
                drawings.filter(id__in=prod.values("drawing_id"))
                        .values("code_key")
                        .distinct()
            )
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        # -----------------------------
        # 3) Pegar sector/type por key
        # -----------------------------
        sb = sb.annotate(
            local_drawing_id=Subquery(
                drawings.filter(code_key=OuterRef("product_key"))
                        .values("id")[:1]
            )
        )

        sector_name_sq = (
            Product.objects
            .filter(drawing_id=OuterRef("local_drawing_id"))
            .values("sector__name")[:1]
        )

        type_name_sq = (
            Product.objects
            .filter(drawing_id=OuterRef("local_drawing_id"))
            .values("product_type__name")[:1]
        )

        # -----------------------------------
        # 4) Paginar por product_key + agregar
        # -----------------------------------
        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("N/A")),
                type_label=Coalesce(Subquery(type_name_sq), Value("N/A")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g:
                continue
            results.append({
                "product_key": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "related_codes": g["related_codes"] or "",
                "technical_descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})


class SectorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Sector.objects.all().order_by("name")
    serializer_class = SectorSerializer
    pagination_class = None


class ProductTypeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ProductType.objects.all().order_by("name")
    serializer_class = ProductTypeSerializer
    pagination_class = None


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Product.objects.select_related("drawing", "sector", "product_type").all().order_by("-created_at")
    serializer_class = ProductSerializer


class DrawingViewSet(viewsets.ModelViewSet):
    """CRUD de desenhos locais (para associar no Product)."""
    permission_classes = [IsAuthenticated]
    queryset = Drawing.objects.all().order_by("code")
    serializer_class = DrawingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        code = self.request.query_params.get("code")
        if code:
            queryset = queryset.filter(code__iexact=code)
        return queryset

    def create(self, request, *args, **kwargs):
        """Cria um desenho ou retorna o existente quando code já estiver cadastrado."""
        code = request.data.get("code")
        if not code:
            return Response({"error": 'Campo "code" é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        existing = Drawing.objects.filter(code__iexact=code).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)
import os
from django.conf import settings
from django.db.models import Q, Count, Value, OuterRef, Subquery
from django.db.models.functions import Trim, Upper, Coalesce
from django.contrib.postgres.aggregates import StringAgg
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# ✅ IMPORTAÇÃO CORRETA (Os modelos ficam no models.py)
from .models import SB1010, Product, Sector, ProductType
from drawings.models import Drawing
from .serializers import SectorSerializer, ProductTypeSerializer, ProductSerializer
from drawings.serializers import DrawingSerializer

# ===== VIEWSETS PARA GESTÃO (CRUD) =====

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all().order_by('name')
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticated]

class ProductTypeViewSet(viewsets.ModelViewSet):
    queryset = ProductType.objects.all().order_by('name')
    serializer_class = ProductTypeSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        drawing_code = self.request.query_params.get('drawing_code')
        if drawing_code:
            queryset = queryset.filter(drawing__code=drawing_code)
        return queryset

class DrawingViewSet(viewsets.ModelViewSet):
    queryset = Drawing.objects.all().order_by('code')
    serializer_class = DrawingSerializer
    permission_classes = [IsAuthenticated]

# ===== VIEW PRINCIPAL DO CATÁLOGO =====

class ProductCatalogView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 500))
        offset = max(0, offset)

        sb = SB1010.objects.exclude(deleted="*")
        drawing_pattern = r'^[A-Z]{2,}[0-9]'
        sb = sb.filter(b1_desenho__iregex=drawing_pattern)
        sb = sb.annotate(product_key=Upper(Trim("b1_desenho")))

        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
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

        products_media_path = settings.MEDIA_ROOT
        try:
            all_files_map = {f.lower(): f for f in os.listdir(products_media_path)}
        except Exception:
            all_files_map = {}

        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            
            final_image_url = f"{settings.MEDIA_URL}padrao.jpg"
            key_lower = k.lower()
            found_filename = None

            for ext in ['.jpg', '.png', '.jpeg']:
                target = f"{key_lower}{ext}"
                if target in all_files_map:
                    found_filename = all_files_map[target]
                    break
            
            if found_filename:
                final_image_url = f"{settings.MEDIA_URL}{found_filename}"

            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
                "imageUrl": final_image_url
            })

        return Response({"count": total, "results": results})
from django.db.models import Q
from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from drawings.models import Drawing
from drawings.serializers import DrawingSerializer

from .models import Sector, ProductType, Product, SB1010
from .serializers import SectorSerializer, ProductTypeSerializer, ProductSerializer


class ProductCatalogView(generics.GenericAPIView):
    """Catálogo (somente leitura) baseado na SB1010 (Protheus).

    Retorna grupos por desenho (B1_DESENHO), no formato:
      { count: <qtd de desenhos>, results: [{drawing_id, drawing_product, drawing_description}, ...] }

    Filtros aceitos (query params):
      - codigo: filtra B1_COD (icontains)
      - descricao: filtra B1_DESC (icontains)
      - desenho: filtra B1_DESENHO (icontains)
      - sectors: lista de IDs (ex.: sectors=1&sectors=2 ou sectors=1,2)
      - types: lista de IDs (ex.: types=1&types=2 ou types=1,2)
      - limit / offset: paginação por grupos de desenho
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
            parts = str(item).split(',')
            for p in parts:
                p = p.strip()
                if not p:
                    continue
                try:
                    out.append(int(p))
                except ValueError:
                    continue
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get('codigo') or '').strip()
        descricao = (request.query_params.get('descricao') or '').strip()
        desenho = (request.query_params.get('desenho') or '').strip()

        sectors = self._parse_id_list(
            request.query_params.getlist('sectors') or request.query_params.get('sectors')
        )
        types = self._parse_id_list(
            request.query_params.getlist('types') or request.query_params.get('types')
        )

        try:
            limit = int(request.query_params.get('limit', '500'))
            offset = int(request.query_params.get('offset', '0'))
        except ValueError:
            return Response({'detail': 'Parâmetros limit/offset inválidos.'}, status=status.HTTP_400_BAD_REQUEST)

        limit = max(1, min(limit, 2000))
        offset = max(0, offset)

        # Base: apenas registros não deletados no Protheus
        qs = SB1010.objects.filter(Q(deleted='') | Q(deleted=None))

        if codigo:
            qs = qs.filter(b1_cod__icontains=codigo)
        if descricao:
            qs = qs.filter(b1_desc__icontains=descricao)
        if desenho:
            qs = qs.filter(b1_desenho__icontains=desenho)

        # Filtro por mapeamento local (Product)
        if sectors or types:
            prod_qs = Product.objects.all()
            if sectors:
                prod_qs = prod_qs.filter(sector_id__in=sectors)
            if types:
                prod_qs = prod_qs.filter(product_type_id__in=types)

            allowed_drawings = prod_qs.values_list('drawing__code', flat=True).distinct()
            qs = qs.filter(b1_desenho__in=allowed_drawings)

        # Paginação por desenho (grupos)
        drawings_qs = qs.values_list('b1_desenho', flat=True).distinct().order_by('b1_desenho')
        total = drawings_qs.count()

        page_drawings = list(drawings_qs[offset: offset + limit])
        if not page_drawings:
            return Response({'count': total, 'results': []})

        rows = (
            qs.filter(b1_desenho__in=page_drawings)
              .values('b1_desenho', 'b1_cod', 'b1_desc')
              .order_by('b1_desenho', 'b1_cod')
        )

        grouped = {}
        for r in rows:
            did = r['b1_desenho']
            grouped.setdefault(did, {'drawing_id': did, 'products': [], 'descriptions': []})
            grouped[did]['products'].append(r['b1_cod'])
            grouped[did]['descriptions'].append(r['b1_desc'])

        results = []
        for did in page_drawings:
            g = grouped.get(did, {'drawing_id': did, 'products': [], 'descriptions': []})
            results.append({
                'drawing_id': g['drawing_id'],
                'drawing_product': ';'.join(g['products']),
                'drawing_description': ';'.join(g['descriptions']),
            })

        return Response({'count': total, 'results': results})


class SectorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Sector.objects.all().order_by('name')
    serializer_class = SectorSerializer


class ProductTypeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ProductType.objects.all().order_by('name')
    serializer_class = ProductTypeSerializer


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Product.objects.select_related('drawing', 'sector', 'product_type').all().order_by('-created_at')
    serializer_class = ProductSerializer


class DrawingViewSet(viewsets.ModelViewSet):
    """CRUD de desenhos locais (para associar no Product)."""
    permission_classes = [IsAuthenticated]
    queryset = Drawing.objects.all().order_by('code')
    serializer_class = DrawingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        code = self.request.query_params.get('code')
        if code:
            queryset = queryset.filter(code__iexact=code)
        return queryset

    def create(self, request, *args, **kwargs):
        """Cria um desenho ou retorna o existente quando code já estiver cadastrado."""
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Campo "code" é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        existing = Drawing.objects.filter(code__iexact=code).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

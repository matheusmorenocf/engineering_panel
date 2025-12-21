import re
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django.db.models import Q

# Imports dos Models e Serializers
from .models import Sector, ProductType, Product, SB1010
from .serializers import SectorSerializer, ProductTypeSerializer, ProductSerializer

class ProductCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Captura de parâmetros
            codigo_query = request.query_params.get('codigo', '').strip().upper()
            descricao_query = request.query_params.get('descricao', '').strip().upper()
            desenho_query = request.query_params.get('desenho', '').strip().upper()
            
            # Filtros de Setor e Tipo (vindos do Frontend como "1,2,3")
            sectors_param = request.query_params.get('sectors', '')
            types_param = request.query_params.get('types', '')
            
            limit = int(request.query_params.get('limit', 100))

            # 1. Filtro Local (Cruzamento com tabela Product)
            valid_drawing_ids = None

            if sectors_param or types_param:
                local_products = Product.objects.all()

                if sectors_param:
                    sector_ids = [int(x) for x in sectors_param.split(',') if x.isdigit()]
                    local_products = local_products.filter(sector__id__in=sector_ids)

                if types_param:
                    type_ids = [int(x) for x in types_param.split(',') if x.isdigit()]
                    local_products = local_products.filter(product_type__id__in=type_ids)
                
                # Pega os códigos dos desenhos filtrados
                valid_drawing_ids = list(local_products.values_list('drawing__code', flat=True))

            # 2. Busca na Tabela SB1010 (Protheus)
            queryset = SB1010.objects.all()
            
            # Ajuste de segurança para coluna deletada (verifique se seu banco usa 'deleted' ou 'd_e_l_e_t_')
            # Aqui assumimos d_e_l_e_t_ que é o padrão TOTVS, se der erro mude para deleted
            try:
                queryset = queryset.filter(Q(d_e_l_e_t_='') | Q(d_e_l_e_t_=' '))
            except:
                # Fallback se a coluna se chamar 'deleted'
                queryset = queryset.filter(Q(deleted='') | Q(deleted=' '))

            # Aplica filtro de ID validos se houver
            if valid_drawing_ids is not None:
                if not valid_drawing_ids:
                    return Response([]) # Filtrou e não achou nada
                queryset = queryset.filter(b1_desenho__in=valid_drawing_ids)

            if codigo_query:
                queryset = queryset.filter(b1_cod__icontains=codigo_query)
            if descricao_query:
                queryset = queryset.filter(b1_desc__icontains=descricao_query)
            if desenho_query:
                queryset = queryset.filter(b1_desenho__icontains=desenho_query)

            # Otimização: Pegamos apenas os campos necessários
            raw_data = list(queryset.values('b1_cod', 'b1_desenho', 'b1_desc')[:limit])

            # 3. Processamento e Agrupamento (Regex)
            pattern = re.compile(r'^[A-Z]+[0-9]+([-][0-9]+)*$')
            grouped_data = {}

            for item in raw_data:
                try:
                    cod = (item.get('b1_cod') or "").strip()
                    des = (item.get('b1_desenho') or "").strip()
                    dsc = (item.get('b1_desc') or "").strip()

                    if not cod or not des: continue
                    
                    # Validação básica de desenho
                    if not pattern.match(des): continue

                    # Normalização (Remove revisão final ex: -01)
                    drawing_id = des
                    if len(des) > 3 and des[-3] == '-' and des[-2:].isdigit():
                        drawing_id = des[:-3]

                    if drawing_id not in grouped_data:
                        grouped_data[drawing_id] = {'drawing_id': drawing_id, 'products': set(), 'descriptions': set()}
                    
                    grouped_data[drawing_id]['products'].add(cod)
                    grouped_data[drawing_id]['descriptions'].add(dsc)
                except:
                    continue

            results = []
            for d_id in sorted(grouped_data.keys()):
                results.append({
                    'drawing_id': d_id,
                    'drawing_product': "; ".join(sorted(grouped_data[d_id]['products'])),
                    'drawing_description': "; ".join(sorted(grouped_data[d_id]['descriptions']))
                })

            return Response(results)

        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)

# --- VIEWSETS DE GESTÃO ---

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticated]

class ProductTypeViewSet(viewsets.ModelViewSet):
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('drawing', 'sector', 'product_type')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        drawing_id = self.request.query_params.get('drawing')
        if drawing_id:
            queryset = queryset.filter(drawing_id=drawing_id)
        return queryset
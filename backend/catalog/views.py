import re
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Sector, ProductType
from .serializers import SectorSerializer, ProductTypeSerializer
from django.db.models import Q
from .models import SB1010

class ProductCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            print("--- INICIANDO BUSCA NO CATÁLOGO ---")
            
            # Captura de parâmetros
            codigo_query = request.query_params.get('codigo', '').strip().upper()
            descricao_query = request.query_params.get('descricao', '').strip().upper()
            desenho_query = request.query_params.get('desenho', '').strip().upper()
            limit = int(request.query_params.get('limit', 100))

            # 1. Busca bruta no Banco
            queryset = SB1010.objects.all()
            
            # Verifique se a coluna de exclusão no seu model é 'deleted' ou 'd_e_l_e_t_'
            # No Protheus padrão é d_e_l_e_t_
            queryset = queryset.filter(Q(deleted='') | Q(deleted=' '))

            if codigo_query:
                queryset = queryset.filter(b1_cod__icontains=codigo_query)
            if descricao_query:
                queryset = queryset.filter(b1_desc__icontains=descricao_query)
            if desenho_query:
                queryset = queryset.filter(b1_desenho__icontains=desenho_query)

            print(f"SQL Gerado: {queryset.query}") # Debug do SQL no terminal

            # Pegamos uma amostra
            raw_data = list(queryset.values('b1_cod', 'b1_desenho', 'b1_desc')[:500])
            print(f"Registros encontrados no banco: {len(raw_data)}")

            # 2. Processamento em Python
            pattern = re.compile(r'^[A-Z]+[0-9]+([-][0-9]+)*$')
            grouped_data = {}

            for index, item in enumerate(raw_data):
                try:
                    cod = (item.get('b1_cod') or "").strip()
                    des = (item.get('b1_desenho') or "").strip()
                    dsc = (item.get('b1_desc') or "").strip()

                    # Regras de Negócio
                    if not cod or not des: continue
                    if not cod[0].isdigit(): continue
                    if len(cod) < 15: continue
                    if len(des) > 18: continue
                    if not pattern.match(des): continue

                    # Normalização
                    drawing_id = des
                    if len(des) > 3 and des[-3] == '-' and des[-2:].isdigit():
                        drawing_id = des[:-3]

                    if drawing_id not in grouped_data:
                        grouped_data[drawing_id] = {'drawing_id': drawing_id, 'products': set(), 'descriptions': set()}
                    
                    grouped_data[drawing_id]['products'].add(cod)
                    grouped_data[drawing_id]['descriptions'].add(dsc)
                except Exception as e:
                    print(f"Erro ao processar item na linha {index}: {str(e)}")
                    continue

            results = []
            for d_id in sorted(grouped_data.keys()):
                results.append({
                    'drawing_id': d_id,
                    'drawing_product': "; ".join(sorted(grouped_data[d_id]['products'])),
                    'drawing_description': "; ".join(sorted(grouped_data[d_id]['descriptions']))
                })

            print(f"Total de grupos gerados: {len(results)}")
            return Response(results[:limit])

        except Exception as e:
            print("--- ERRO CRÍTICO NO BACKEND ---")
            print(traceback.format_exc()) # Imprime o erro completo no terminal
            return Response({"error": str(e), "trace": traceback.format_exc()}, status=500)

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticated]

class ProductTypeViewSet(viewsets.ModelViewSet):
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer
    permission_classes = [IsAuthenticated]
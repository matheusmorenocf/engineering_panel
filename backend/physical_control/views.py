from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Location, PhysicalControl
from .serializers import (
    LocationSerializer, 
    PhysicalControlSerializer, 
    UserSimpleSerializer
)

class LocationViewSet(viewsets.ModelViewSet):
    """
    Interface para gerenciamento de locais de armazenamento.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

class PhysicalControlViewSet(viewsets.ModelViewSet):
    """
    Interface para controle físico de itens e movimentações.
    """
    queryset = PhysicalControl.objects.all()
    serializer_class = PhysicalControlSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        # Ao atualizar um item, definimos o usuário logado como o responsável atual.
        # Isso permite que o model detecte a mudança e grave no histórico quem fez a ação.
        serializer.save(current_responsible=self.request.user)

    @action(detail=False, methods=['POST'], url_path='create-batch')
    def create_batch(self, request):
        """
        Criação de múltiplos itens vinculados a uma única Nota Fiscal.
        Utiliza transação atômica para garantir integridade dos dados e arquivos.
        """
        try:
            with transaction.atomic():
                # Dados comuns extraídos do cabeçalho da NF
                nf_data = {
                    'nf_number': request.data.get('nf_number'),
                    'receipt_date': request.data.get('receipt_date'),
                    'sender': request.data.get('sender'),
                    'nf_notes': request.data.get('general_notes'),
                    'nf_file': request.FILES.get('nf_file')
                }

                index = 0
                created_ids = []

                # Itera enquanto encontrar itens no FormData (formato items[0][product])
                while f'items[{index}][product]' in request.data:
                    prefix = f'items[{index}]'
                    
                    # Validação simples de quantidade
                    qty_raw = request.data.get(f'{prefix}[quantity]', 1)
                    try:
                        quantity = int(qty_raw)
                    except (ValueError, TypeError):
                        quantity = 1

                    item = PhysicalControl(
                        **nf_data,
                        product=request.data.get(f'{prefix}[product]'),
                        quantity=quantity,
                        location_id=request.data.get(f'{prefix}[location]'),
                        item_notes=request.data.get(f'{prefix}[notes]'),
                        current_responsible=request.user,
                        # Processamento dos arquivos de imagem individuais por item
                        photo_top=request.FILES.get(f'{prefix}[photo_top]'),
                        photo_front=request.FILES.get(f'{prefix}[photo_front]'),
                        photo_side=request.FILES.get(f'{prefix}[photo_side]'),
                        photo_iso=request.FILES.get(f'{prefix}[photo_iso]'),
                    )
                    
                    # O save aciona a geração automática do control_id (DUR-XXXX) e histórico inicial
                    item.save()
                    created_ids.append(item.control_id)
                    index += 1

                if not created_ids:
                    return Response(
                        {"error": "Nenhum item foi enviado no lote."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                return Response({
                    "message": f"Lote de {len(created_ids)} itens processado com sucesso.", 
                    "ids": created_ids
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Em caso de erro, a transação faz o rollback automático de tudo o que foi feito no loop
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- VIEW ADICIONAL PARA O LOCATION MANAGER ---

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    Retorna a lista de todos os usuários para seleção de responsáveis no modal de locais.
    """
    users = User.objects.all().order_by('username')
    serializer = UserSimpleSerializer(users, many=True)
    return Response(serializer.data)
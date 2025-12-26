from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Location, PhysicalControl
from .serializers import LocationSerializer, PhysicalControlSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

class PhysicalControlViewSet(viewsets.ModelViewSet):
    queryset = PhysicalControl.objects.all()
    serializer_class = PhysicalControlSerializer
    permission_classes = [IsAuthenticated]

    # Garante que o usuário logado seja o responsável ao editar
    def perform_update(self, serializer):
        serializer.save(current_responsible=self.request.user)

    @action(detail=False, methods=['POST'], url_path='create-batch')
    def create_batch(self, request):
        try:
            with transaction.atomic():
                # Extrai dados do cabeçalho da NF
                nf_data = {
                    'nf_number': request.data.get('nf_number'),
                    'receipt_date': request.data.get('receipt_date'),
                    'sender': request.data.get('sender'),
                    'nf_notes': request.data.get('general_notes'),
                    'nf_file': request.FILES.get('nf_file')
                }

                index = 0
                created_ids = []

                # Itera sobre os itens
                while f'items[{index}][product]' in request.data:
                    prefix = f'items[{index}]'
                    
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
                        photo_top=request.FILES.get(f'{prefix}[photo_top]'),
                        photo_front=request.FILES.get(f'{prefix}[photo_front]'),
                        photo_side=request.FILES.get(f'{prefix}[photo_side]'),
                        photo_iso=request.FILES.get(f'{prefix}[photo_iso]'),
                    )
                    item.save()
                    created_ids.append(item.control_id)
                    index += 1

                if not created_ids:
                    return Response({"error": "Nenhum item enviado."}, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    "message": f"Lote de {len(created_ids)} itens processado.", 
                    "ids": created_ids
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
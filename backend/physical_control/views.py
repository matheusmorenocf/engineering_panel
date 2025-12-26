from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Location, PhysicalControl, ItemProcessing
from .serializers import LocationSerializer, PhysicalControlSerializer, UserSimpleSerializer, ItemProcessingSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

class PhysicalControlViewSet(viewsets.ModelViewSet):
    queryset = PhysicalControl.objects.all().order_by('-created_at')
    serializer_class = PhysicalControlSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['POST'], url_path='create-batch')
    def create_batch(self, request):
        try:
            with transaction.atomic():
                nf_common = {
                    'nf_number': request.data.get('nf_number') or "S/NF",
                    'receipt_date': request.data.get('receipt_date'),
                    'sender': request.data.get('sender'),
                    'nf_notes': request.data.get('general_notes'),
                    'nf_file': request.FILES.get('nf_file'),
                    'current_responsible': request.user
                }
                index = 0
                created_ids = []
                while f'items[{index}][product]' in request.data:
                    p = f'items[{index}]'
                    item = PhysicalControl.objects.create(
                        **nf_common,
                        product=request.data.get(f'{p}[product]'),
                        quantity=request.data.get(f'{p}[quantity]', 1),
                        location_id=request.data.get(f'{p}[location]'),
                        physical_location=request.data.get(f'{p}[physical_location]'),
                        item_notes=request.data.get(f'{p}[notes]'),
                        photo_top=request.FILES.get(f'{p}[photo_top]'),
                        photo_front=request.FILES.get(f'{p}[photo_front]'),
                        photo_side=request.FILES.get(f'{p}[photo_side]'),
                        photo_iso=request.FILES.get(f'{p}[photo_iso]'),
                    )
                    created_ids.append(item.control_id)
                    index += 1
                return Response({"ids": created_ids}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ItemProcessingViewSet(viewsets.ModelViewSet):
    queryset = ItemProcessing.objects.all().order_by('-updated_at')
    serializer_class = ItemProcessingSerializer
    
    def get_permissions(self):
        if self.action in ['retrieve', 'partial_update']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == "Concluído":
            return Response({"error": "Já finalizado."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_users(request):
    users = User.objects.all().order_by('username')
    serializer = UserSimpleSerializer(users, many=True)
    return Response(serializer.data)
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import PhysicalControl, Location
from .serializers import PhysicalControlSerializer, LocationSerializer
from django.db import transaction

class PhysicalControlViewSet(viewsets.ModelViewSet):
    queryset = PhysicalControl.objects.all().order_by('-created_at')
    serializer_class = PhysicalControlSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        is_many = isinstance(data, list)
        
        # Injetar o usuário logado em cada item do payload
        if is_many:
            for item in data:
                item['created_by'] = request.user.id
        else:
            data['created_by'] = request.user.id
            
        serializer = self.get_serializer(data=data, many=is_many)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Atomic garante que se um item falhar, nenhum é salvo (evita lixo no banco)
            with transaction.atomic():
                self.perform_create(serializer)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

# ESTA É A VIEW QUE ESTAVA FALTANDO E CAUSOU O ERRO DE IMPORTAÇÃO
class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
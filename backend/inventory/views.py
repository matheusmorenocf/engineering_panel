from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import PhysicalControl, Location
from .serializers import PhysicalControlSerializer, LocationSerializer

class PhysicalControlViewSet(viewsets.ModelViewSet):
    queryset = PhysicalControl.objects.all().order_by('-created_at')
    serializer_class = PhysicalControlSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Verifica se é uma lista para processar múltiplos itens (Bulk)
        is_many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        # Passa o usuário logado para todos os itens se for lista
        if is_many:
            serializer.save(created_by=self.request.user)
        else:
            self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
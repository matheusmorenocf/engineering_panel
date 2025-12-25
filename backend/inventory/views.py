from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import PhysicalControl, Location
from .serializers import PhysicalControlSerializer, LocationSerializer

class PhysicalControlViewSet(viewsets.ModelViewSet):
    queryset = PhysicalControl.objects.all().order_by('-created_at')
    serializer_class = PhysicalControlSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        is_many = isinstance(request.data, list)
        
        # Se for uma lista, injetamos o ID do usuário em cada item do dado bruto
        if is_many:
            for item in request.data:
                item['created_by'] = request.user.id
        
        serializer = self.get_serializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        
        if is_many:
            # Para listas, o save() não aceita argumentos. 
            # O created_by já foi injetado nos dados acima.
            self.perform_bulk_create(serializer)
        else:
            # Para objeto único, mantemos o comportamento padrão
            serializer.save(created_by=self.request.user)
            
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_bulk_create(self, serializer):
        serializer.save()

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
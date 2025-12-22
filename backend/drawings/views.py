# drawings/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Drawing
from .serializers import DrawingSerializer

class DrawingViewSet(viewsets.ModelViewSet):
    queryset = Drawing.objects.all().order_by('code')
    serializer_class = DrawingSerializer
    permission_classes = [IsAuthenticated]
    
    # ✅ Garante que o ?search= no frontend funcione corretamente
    filter_backends = [filters.SearchFilter]
    search_fields = ['code']
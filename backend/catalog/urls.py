from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductCatalogView, SectorViewSet, ProductTypeViewSet

# Configuração do Router para as rotas de Gestão (CRUD Automático)
router = DefaultRouter()
router.register(r'management/sectors', SectorViewSet, basename='sectors')
router.register(r'management/types', ProductTypeViewSet, basename='types')

urlpatterns = [
    # Rota de busca do catálogo (SB1010)
    # URL Final: /api/catalog/products/
    path('products/', ProductCatalogView.as_view(), name='product-catalog'),
    
    # Rotas do Router (Setores e Tipos)
    # URLs Finais: 
    #   /api/catalog/management/sectors/
    #   /api/catalog/management/types/
    path('', include(router.urls)),
]
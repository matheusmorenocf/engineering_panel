# backend/catalog/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectorViewSet, ProductTypeViewSet, ProductViewSet, ProductCatalogView

# Se o DrawingViewSet estiver no catalog/views.py use este, 
# se estiver no drawings/views.py, importe de lá.
from .views import DrawingViewSet 

router = DefaultRouter()
router.register(r'management/sectors', SectorViewSet, basename='manage-sectors')
router.register(r'management/types', ProductTypeViewSet, basename='manage-types')
router.register(r'management/products', ProductViewSet, basename='manage-products')
router.register(r'management/drawings', DrawingViewSet, basename='manage-drawings')

urlpatterns = [
    # Rota do Smart Catalog (Protheus)
    path('products/', ProductCatalogView.as_view(), name='catalog-products'),
    
    # Rotas de Gestão (Sectores, Tipos, Vínculos, Desenhos)
    path('', include(router.urls)),
]
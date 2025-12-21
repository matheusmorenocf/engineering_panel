from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProductCatalogView,
    SectorViewSet,
    ProductTypeViewSet,
    ProductViewSet,
    DrawingViewSet,
)

router = DefaultRouter()
router.register(r'management/sectors', SectorViewSet, basename='sectors')
router.register(r'management/types', ProductTypeViewSet, basename='types')
router.register(r'management/products', ProductViewSet, basename='products')
router.register(r'management/drawings', DrawingViewSet, basename='drawings')

urlpatterns = [
    # Catálogo (Leitura do Protheus)
    path('products/', ProductCatalogView.as_view(), name='product-catalog'),

    # Gestão (CRUD de Tabelas Locais)
    path('', include(router.urls)),
]

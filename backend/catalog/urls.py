from django.urls import path
from .views import ProductCatalogView

urlpatterns = [
    path('products/', ProductCatalogView.as_view(), name='catalog-products'),
]
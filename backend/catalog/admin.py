from django.contrib import admin
from .models import Sector, ProductType, Product

@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('drawing', 'sector', 'product_type', 'created_at')
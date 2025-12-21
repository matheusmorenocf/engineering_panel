from rest_framework import serializers
from .models import Sector, ProductType, Product
from drawings.models import Drawing

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = '__all__'

class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    # Campos de leitura (opcional, para mostrar o nome em vez de só o ID)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    type_name = serializers.CharField(source='product_type.name', read_only=True)
    drawing_code = serializers.CharField(source='drawing.code', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'drawing', 'drawing_code', 
            'sector', 'sector_name', 
            'product_type', 'type_name', 
            'created_at', 'updated_at'
        ]
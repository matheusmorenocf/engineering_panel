# drawings/serializers.py
from rest_framework import serializers
from .models import Drawing

class DrawingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drawing
        fields = [
            'id', 'code', 'title', 'revision', 'status', 
            'approved_by', 'approval_date', 'file_url', 
            'notes', 'created_at', 'updated_at'
        ]
        # ✅ Importante: Permite que a API processe o POST sem esses campos
        extra_kwargs = {
            'title': {'required': False, 'allow_blank': True},
            'revision': {'required': False},
            'status': {'required': False},
            'notes': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        # ✅ Se o título vier vazio da API, preenchemos com o código para satisfazer o Model
        if not validated_data.get('title'):
            validated_data['title'] = validated_data.get('code')
        return super().create(validated_data)
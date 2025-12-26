from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Location, PhysicalControl

class UserSimpleSerializer(serializers.ModelSerializer):
    """
    Retorna dados básicos do usuário para exibir nos cards e detalhes.
    """
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class LocationSerializer(serializers.ModelSerializer):
    """
    Serializer para Locais de armazenamento.
    Inclui os detalhes dos responsáveis para o LocationManagerModal.
    """
    responsibles_details = UserSimpleSerializer(source='responsibles', many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'responsibles', 'responsibles_details']

class PhysicalControlSerializer(serializers.ModelSerializer):
    """
    Serializer principal do Controle Físico.
    Configurado para retornar URLs absolutas de mídia e nomes de chaves estrangeiras.
    """
    location_name = serializers.ReadOnlyField(source='location.name')
    responsible_name = serializers.ReadOnlyField(source='current_responsible.username')
    
    # Declaramos os campos de arquivo explicitamente para garantir que o DRF
    # use o contexto da request e gere a URL completa: http://localhost:8000/media/...
    nf_file = serializers.FileField(required=False, allow_null=True)
    photo_top = serializers.ImageField(required=False, allow_null=True)
    photo_front = serializers.ImageField(required=False, allow_null=True)
    photo_side = serializers.ImageField(required=False, allow_null=True)
    photo_iso = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = PhysicalControl
        fields = [
            'id', 'control_id', 'nf_number', 'receipt_date', 'sender', 
            'nf_notes', 'nf_file', 'product', 'quantity', 'location', 
            'location_name', 'item_notes', 'photo_top', 'photo_front', 
            'photo_side', 'photo_iso', 'current_responsible', 
            'responsible_name', 'movement_history', 'created_at'
        ]
        read_only_fields = ['control_id', 'created_at', 'movement_history']
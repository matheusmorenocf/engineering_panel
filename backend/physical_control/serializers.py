from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ItemProcessing, Location, PhysicalControl

class UserSimpleSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name']
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class LocationSerializer(serializers.ModelSerializer):
    responsibles_details = UserSimpleSerializer(source='responsibles', many=True, read_only=True)
    responsibles = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    class Meta:
        model = Location
        fields = ['id', 'name', 'responsibles', 'responsibles_details', 'physical_structure']

class ItemProcessingSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='item.product')
    control_id = serializers.ReadOnlyField(source='item.control_id')
    location_name = serializers.ReadOnlyField(source='item.location.name')
    customer = serializers.ReadOnlyField(source='item.customer') # Adicionado: Cliente vindo do item
    responsible_name = serializers.SerializerMethodField()
    receipt_date = serializers.ReadOnlyField(source='item.receipt_date')
    item_notes = serializers.ReadOnlyField(source='item.item_notes')
    nf_file = serializers.FileField(source='item.nf_file', read_only=True)
    photo_top = serializers.ImageField(source='item.photo_top', read_only=True)
    photo_front = serializers.ImageField(source='item.photo_front', read_only=True)
    photo_side = serializers.ImageField(source='item.photo_side', read_only=True)
    photo_iso = serializers.ImageField(source='item.photo_iso', read_only=True)

    class Meta:
        model = ItemProcessing
        fields = '__all__'

    def get_responsible_name(self, obj):
        user = obj.item.current_responsible
        return user.get_full_name() or user.username

class PhysicalControlSerializer(serializers.ModelSerializer):
    location_name = serializers.ReadOnlyField(source='location.name')
    responsible_name = serializers.SerializerMethodField()
    processing = serializers.SerializerMethodField()
    map_coordinates = serializers.SerializerMethodField() # Adicionado para visibilidade no JSON

    class Meta:
        model = PhysicalControl
        fields = '__all__'
        read_only_fields = ['control_id', 'created_at', 'movement_history']

    def get_responsible_name(self, obj):
        return obj.current_responsible.get_full_name() or obj.current_responsible.username

    def get_processing(self, obj):
        try:
            return {'id': obj.processing.id}
        except:
            return None

    def get_map_coordinates(self, obj):
        """
        Converte "ARMARIO 01-1-A" em { closet: "ARMARIO 01", shelf: "1", slot: "A" }
        """
        if not obj.physical_location:
            return None
        try:
            parts = obj.physical_location.upper().split('-')
            if len(parts) >= 3:
                return {
                    'closet': parts[0].strip(),
                    'shelf': parts[1].strip(),
                    'slot': parts[2].strip()
                }
        except:
            pass
        return None

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Padroniza para maiúsculas para o filtro do mapa ser exato
        rep['physical_location'] = (instance.physical_location or "").strip().upper()
        rep['nf_notes'] = instance.nf_notes or ""
        rep['item_notes'] = instance.item_notes or ""
        rep['customer'] = instance.customer or "" # Garante que não retorne null no JSON
        return rep
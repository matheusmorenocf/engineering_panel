from rest_framework import serializers
from .models import PhysicalControl, Location

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'authorized_personnel', 'created_at']

class PhysicalControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalControl
        fields = [
            'id', 'tracking_code', 'product', 'nf_number', 
            'sender', 'client_name', 'client_code', 'quantity', 
            'location', 'responsible_person', 'movement_history', 
            'action_type', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['tracking_code', 'movement_history', 'created_at', 'updated_at']
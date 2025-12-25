from rest_framework import serializers
from .models import PhysicalControl, Location, PhysicalControlAttachment
from django.contrib.auth.models import User
import os

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'authorized_personnel', 'created_at']

class PhysicalControlAttachmentSerializer(serializers.ModelSerializer):
    # Campo calculado para retornar a URL completa do arquivo
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = PhysicalControlAttachment
        fields = ['id', 'file', 'file_url', 'attachment_type', 'created_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

class PhysicalControlSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    attachments = PhysicalControlAttachmentSerializer(many=True, read_only=True)
    
    # Campos write_only para processar o upload via FormData
    uploaded_attachments = serializers.ListField(
        child=serializers.FileField(allow_empty_file=False, use_url=False),
        write_only=True, required=False, allow_empty=True
    )
    attachment_types = serializers.ListField(
        child=serializers.CharField(),
        write_only=True, required=False, allow_empty=True
    )

    class Meta:
        model = PhysicalControl
        fields = [
            'id', 'tracking_code', 'product', 'nf_number', 'sender', 
            'client_name', 'client_code', 'quantity', 'location', 
            'responsible_person', 'movement_history', 'action_type', 
            'notes', 'created_by', 'created_at', 'updated_at',
            'attachments', 'uploaded_attachments', 'attachment_types'
        ]
        read_only_fields = ['tracking_code', 'movement_history', 'created_at', 'updated_at', 'attachments']

    def create(self, validated_data):
        # Extrair arquivos antes de criar o objeto principal
        files = validated_data.pop('uploaded_attachments', [])
        labels = validated_data.pop('attachment_types', [])
        
        # Criar registro de controle físico
        instance = super().create(validated_data)
        
        # Processar cada arquivo
        for index, file in enumerate(files):
            ext = os.path.splitext(file.name)[1]
            label = labels[index] if index < len(labels) else f"ANEXO_{index}"
            
            # Renomeação: ID_DA_PECA_VISTA.extensao
            # O Django salvará na pasta da NF definida no upload_to do Models
            file.name = f"{instance.id}_{label.upper()}{ext}"
            
            PhysicalControlAttachment.objects.create(
                physical_control=instance,
                file=file,
                attachment_type=label
            )
            
        return instance
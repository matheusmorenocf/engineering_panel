import os
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings

# Função para limpar nomes de pastas
def sanitize_path(text):
    return str(text).replace('/', '-').replace('\\', '-').replace(' ', '_')

def get_nf_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    return os.path.join('physical_control', f'NF_{safe_nf}', filename)

def get_photo_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    # Usamos o control_id para criar a subpasta do item
    return os.path.join('physical_control', f'NF_{safe_nf}', instance.control_id, filename)

class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    responsibles = models.ManyToManyField(User, related_name='managed_locations')

    def __str__(self):
        return self.name

class PhysicalControl(models.Model):
    control_id = models.CharField(max_length=25, unique=True, editable=False)
    
    # Invoice Data
    nf_number = models.CharField(max_length=50)
    receipt_date = models.DateField(default=timezone.now)
    sender = models.CharField(max_length=255)
    nf_notes = models.TextField(blank=True, null=True)
    nf_file = models.FileField(upload_to=get_nf_upload_path, blank=True, null=True)
    
    # Item Data
    product = models.CharField(max_length=255)
    quantity = models.IntegerField()
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='items')
    item_notes = models.TextField(blank=True, null=True)
    
    # Photos
    photo_top = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    photo_front = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    photo_side = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    photo_iso = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    
    # Control Fields
    current_responsible = models.ForeignKey(User, on_delete=models.PROTECT)
    movement_history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # 1. Gera o ID sequencial primeiro
        if not self.control_id:
            self.control_id = self.generate_id()
        
        # 2. Configura histórico
        if not self.pk:
            # Entrada Inicial
            self.movement_history = [{
                'date': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'location': self.location.name,
                'responsible': self.current_responsible.get_full_name() or self.current_responsible.username,
                'action': 'Initial Receipt'
            }]
        else:
            # Tenta buscar a instância antiga de forma segura
            try:
                old_instance = PhysicalControl.objects.get(pk=self.pk)
                # Verifica se a localização mudou
                if old_instance.location_id != self.location_id:
                    self.movement_history.append({
                        'date': timezone.now().strftime('%d/%m/%Y %H:%M'),
                        'location': self.location.name,
                        'responsible': self.current_responsible.get_full_name() or self.current_responsible.username,
                        'action': 'Location Transfer'
                    })
            except PhysicalControl.DoesNotExist:
                # Caso de erro raro onde o PK existe mas o objeto não é achado
                pass
        
        super().save(*args, **kwargs)

    def generate_id(self):
        now = timezone.now()
        prefix = f"DUR-{now.strftime('%m%y')}"
        last = PhysicalControl.objects.filter(control_id__startswith=prefix).order_by('created_at').last()
        
        if last:
            try:
                last_seq = int(last.control_id.split('-')[-1])
                new_seq = last_seq + 1
            except (ValueError, IndexError):
                new_seq = 1
        else:
            new_seq = 1
            
        return f"{prefix}-{str(new_seq).zfill(4)}"

    def __str__(self):
        return self.control_id
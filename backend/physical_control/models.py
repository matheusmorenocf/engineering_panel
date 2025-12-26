import os
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- FUNÇÕES DE AUXÍLIO (Devem vir antes das Classes) ---

def sanitize_path(text):
    return str(text).replace('/', '-').replace('\\', '-').replace(' ', '_')

def get_nf_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    return os.path.join('physical_control', f'NF_{safe_nf}', filename)

def get_photo_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    # Se o control_id ainda não existir (na criação), gera um temporário ou usa o prefixo
    cid = sanitize_path(instance.control_id) if instance.control_id else "TEMP"
    return os.path.join('physical_control', f'NF_{safe_nf}', cid, filename)

# --- MODELOS ---

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
    physical_location = models.CharField(max_length=255, blank=True, null=True) # Ex: Armario 1-1-A
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
        # 1. Gera o ID customizado se for novo
        if not self.control_id:
            self.control_id = self.generate_id()
        
        # 2. Captura o Nome Completo do usuário para o histórico
        user = self.current_responsible
        friendly_name = user.get_full_name() if user.get_full_name().strip() else user.username
        
        # 3. Formata a string de localização para o histórico
        loc_display = f"{self.location.name} ({self.physical_location or 'N/I'})"

        if not self.pk:
            # Entrada Inicial
            self.movement_history = [{
                'date': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'location': loc_display,
                'responsible': friendly_name,
                'action': 'Initial Receipt'
            }]
        else:
            try:
                old_instance = PhysicalControl.objects.get(pk=self.pk)
                # Verifica se houve mudança de local ou posição no armário
                if old_instance.location_id != self.location_id or old_instance.physical_location != self.physical_location:
                    self.movement_history.append({
                        'date': timezone.now().strftime('%d/%m/%Y %H:%M'),
                        'location': loc_display,
                        'responsible': friendly_name,
                        'action': 'Location Transfer'
                    })
            except PhysicalControl.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)

    def generate_id(self):
        now = timezone.now()
        prefix = f"DUR-{now.strftime('%m%y')}"
        # Busca o último registro que comece com o prefixo do mês atual
        last = PhysicalControl.objects.filter(control_id__startswith=prefix).order_by('id').last()
        if last:
            try:
                last_parts = last.control_id.split('-')
                last_seq = int(last_parts[-1])
                new_seq = last_seq + 1
            except (ValueError, IndexError):
                new_seq = 1
        else:
            new_seq = 1
        return f"{prefix}-{str(new_seq).zfill(4)}"

    def __str__(self):
        return self.control_id

class ItemProcessing(models.Model):
    item = models.OneToOneField(PhysicalControl, on_delete=models.CASCADE, related_name='processing')
    control_id = models.CharField(max_length=25)
    nf_number = models.CharField(max_length=50)
    sender = models.CharField(max_length=255)
    reason = models.CharField(max_length=255, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default="Pendente") 
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Processamento: {self.control_id}"

# --- SIGNALS ---

@receiver(post_save, sender=PhysicalControl)
def create_item_processing(sender, instance, created, **kwargs):
    if created:
        ItemProcessing.objects.get_or_create(
            item=instance,
            defaults={
                'control_id': instance.control_id, 
                'nf_number': instance.nf_number, 
                'sender': instance.sender
            }
        )
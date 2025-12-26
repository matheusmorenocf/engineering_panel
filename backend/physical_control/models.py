import os
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# 1. FUNÇÕES DE APOIO (Devem vir antes de tudo)
def sanitize_path(text):
    return str(text).replace('/', '-').replace('\\', '-').replace(' ', '_')

def get_nf_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    return os.path.join('physical_control', f'NF_{safe_nf}', filename)

def get_photo_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    return os.path.join('physical_control', f'NF_{safe_nf}', instance.control_id, filename)

# 2. MODELOS
class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    responsibles = models.ManyToManyField(User, related_name='managed_locations')
    def __str__(self): return self.name

class PhysicalControl(models.Model):
    control_id = models.CharField(max_length=25, unique=True, editable=False)
    nf_number = models.CharField(max_length=50)
    receipt_date = models.DateField(default=timezone.now)
    sender = models.CharField(max_length=255)
    nf_notes = models.TextField(blank=True, null=True)
    nf_file = models.FileField(upload_to=get_nf_upload_path, blank=True, null=True)
    product = models.CharField(max_length=255)
    quantity = models.IntegerField()
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='items')
    physical_location = models.CharField(max_length=255, blank=True, null=True)
    item_notes = models.TextField(blank=True, null=True)
    photo_top = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    photo_front = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    photo_side = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    photo_iso = models.ImageField(upload_to=get_photo_upload_path, blank=True, null=True)
    current_responsible = models.ForeignKey(User, on_delete=models.PROTECT)
    movement_history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.control_id:
            self.control_id = self.generate_id()
        user = self.current_responsible
        friendly_name = user.get_full_name() if user.get_full_name().strip() else user.username
        if not self.pk:
            self.movement_history = [{
                'date': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'location': f"{self.location.name} ({self.physical_location or 'N/I'})",
                'responsible': friendly_name,
                'action': 'Initial Receipt'
            }]
        else:
            try:
                old = PhysicalControl.objects.get(pk=self.pk)
                if old.location_id != self.location_id or old.physical_location != self.physical_location:
                    self.movement_history.append({
                        'date': timezone.now().strftime('%d/%m/%Y %H:%M'),
                        'location': f"{self.location.name} ({self.physical_location or 'N/I'})",
                        'responsible': friendly_name,
                        'action': 'Location Transfer'
                    })
            except: pass
        super().save(*args, **kwargs)

    def generate_id(self):
        now = timezone.now()
        prefix = f"DUR-{now.strftime('%m%y')}"
        last = PhysicalControl.objects.filter(control_id__startswith=prefix).order_by('created_at').last()
        seq = (int(last.control_id.split('-')[-1]) + 1) if last else 1
        return f"{prefix}-{str(seq).zfill(4)}"

class ItemProcessing(models.Model):
    item = models.OneToOneField(PhysicalControl, on_delete=models.CASCADE, related_name='processing')
    control_id = models.CharField(max_length=25)
    nf_number = models.CharField(max_length=50)
    sender = models.CharField(max_length=255)
    reason = models.CharField(max_length=255, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default="Pendente") 
    updated_at = models.DateTimeField(auto_now=True)

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
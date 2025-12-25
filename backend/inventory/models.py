import random
import string
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import os

class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    authorized_personnel = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PhysicalControl(models.Model):
    tracking_code = models.CharField(max_length=50, unique=True, editable=False)
    product = models.CharField(max_length=255)
    nf_number = models.CharField(max_length=50, blank=True, null=True)
    sender = models.CharField(max_length=100, blank=True, null=True)
    client_name = models.CharField(max_length=100, blank=True, null=True)
    client_code = models.CharField(max_length=50, blank=True, null=True)
    quantity = models.IntegerField()
    location = models.CharField(max_length=100)
    responsible_person = models.CharField(max_length=100)
    movement_history = models.JSONField(default=list, blank=True)
    action_type = models.CharField(max_length=100, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            now = timezone.now()
            date_str = now.strftime('%d%m%y')
            last_entry = PhysicalControl.objects.filter(tracking_code__icontains=date_str).order_by('-id').first()
            if last_entry and '-' in last_entry.tracking_code:
                try:
                    last_number = int(last_entry.tracking_code.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = PhysicalControl.objects.count() + 1
            else:
                new_number = PhysicalControl.objects.count() + 1
            base_code = f"DURIT-{str(new_number).zfill(4)}-{date_str}"
            if PhysicalControl.objects.filter(tracking_code=base_code).exists():
                random_suffix = ''.join(random.choices(string.ascii_uppercase, k=2))
                self.tracking_code = f"{base_code}-{random_suffix}"
            else:
                self.tracking_code = base_code
        
        if not self.pk:
            self.movement_history = [{
                "timestamp": timezone.now().isoformat(),
                "location": self.location,
                "responsible": self.responsible_person,
                "action": "Entrada Inicial"
            }]
        else:
            old_instance = PhysicalControl.objects.get(pk=self.pk)
            if old_instance.location != self.location or old_instance.responsible_person != self.responsible_person:
                new_log = {
                    "timestamp": timezone.now().isoformat(),
                    "location": self.location,
                    "responsible": self.responsible_person,
                    "action": "Movimentação Interna" if old_instance.location != self.location else "Alteração de Responsável"
                }
                if not isinstance(self.movement_history, list): self.movement_history = []
                self.movement_history.append(new_log)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Controle Físico"
        verbose_name_plural = "Controles Físicos"

def upload_to_nf_folder(instance, filename):
    nf_folder = instance.physical_control.nf_number or "sem_nf"
    nf_folder = str(nf_folder).replace('.', '_').replace('/', '_')
    return os.path.join('inventory', nf_folder, filename)

class PhysicalControlAttachment(models.Model):
    physical_control = models.ForeignKey(PhysicalControl, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to=upload_to_nf_folder)
    attachment_type = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
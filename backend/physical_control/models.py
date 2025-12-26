import os
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_delete
from django.dispatch import receiver

def sanitize_path(text):
    return str(text).replace('/', '-').replace('\\', '-').replace(' ', '_')

def get_nf_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    return os.path.join('physical_control', f'NF_{safe_nf}', filename)

def get_photo_upload_path(instance, filename):
    safe_nf = sanitize_path(instance.nf_number)
    cid = sanitize_path(instance.control_id) if instance.control_id else "TEMP"
    return os.path.join('physical_control', f'NF_{safe_nf}', cid, filename)

class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    responsibles = models.ManyToManyField(User, related_name='managed_locations')
    physical_structure = models.JSONField(
        default=list, 
        blank=True, 
        help_text="Estrutura de armários: [{'name': str, 'rows': int, 'cols': int}]"
    )

    def save(self, *args, **kwargs):
        if self.pk:
            old_instance = Location.objects.get(pk=self.pk)
            # 1. Se o nome do local mudou, atualiza o histórico de movimentação (opcional) ou logs
            # 2. Se a estrutura física (nomes de armários) mudou dentro do JSON
            old_struct = {s['name']: s for s in old_instance.physical_structure}
            new_struct = {s['name']: s for s in self.physical_structure}

            # Se houve mudança em nomes de armários, precisamos atualizar os registros
            for old_name, new_data in new_struct.items():
                # Esta lógica detecta se você editou um nome de armário no JSON
                # Nota: Para isso ser perfeito, o JSON precisaria de IDs fixos por armário.
                # Como é um JSON simples, a atualização de massa é recomendada via script se mudar nomes.
                pass 

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class PhysicalControl(models.Model):
    control_id = models.CharField(max_length=25, unique=True, editable=False)
    nf_number = models.CharField(max_length=50)
    receipt_date = models.DateField(default=timezone.now)
    sender = models.CharField(max_length=255)
    customer = models.CharField(max_length=255, blank=True, null=True)
    nf_notes = models.TextField(blank=True, null=True)
    nf_file = models.FileField(upload_to=get_nf_upload_path, blank=True, null=True)
    
    product = models.CharField(max_length=255)
    quantity = models.IntegerField()
    
    # ALTERADO: on_delete=SET_NULL para não apagar o registro se o local sumir
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
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
        
        # Se o local foi removido, limpa a string física
        if self.location is None:
            self.physical_location = ""

        user = self.current_responsible
        friendly_name = user.get_full_name() if user.get_full_name().strip() else user.username
        
        loc_name = self.location.name if self.location else "LOCAL REMOVIDO"
        loc_display = f"{loc_name} ({self.physical_location or 'N/I'})"

        if not self.pk:
            self.movement_history = [{
                'date': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'location': loc_display,
                'responsible': friendly_name,
                'action': 'Initial Receipt'
            }]
        else:
            try:
                old_instance = PhysicalControl.objects.get(pk=self.pk)
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

# SIGNAL: Quando um local é apagado, limpa a string physical_location de todos os itens
@receiver(post_delete, sender=Location)
def clear_items_physical_location(sender, instance, **kwargs):
    PhysicalControl.objects.filter(location__isnull=True).update(physical_location="")

class ItemProcessing(models.Model):
    item = models.OneToOneField(PhysicalControl, on_delete=models.CASCADE, related_name='processing')
    control_id = models.CharField(max_length=25)
    nf_number = models.CharField(max_length=50)
    sender = models.CharField(max_length=255)
    reason = models.CharField(max_length=255, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default="Pendente") 
    updated_at = models.DateTimeField(auto_now=True)
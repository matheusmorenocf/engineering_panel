from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

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
        is_new = self.pk is None
        if not self.tracking_code:
            now = timezone.now()
            # Reinicia mensalmente: DURIT-0001-251225
            count = PhysicalControl.objects.filter(
                created_at__month=now.month, 
                created_at__year=now.year
            ).count() + 1
            self.tracking_code = f"DURIT-{str(count).zfill(4)}-{now.strftime('%d%m%y')}"
        
        if is_new:
            self.movement_history = [{
                "timestamp": timezone.now().isoformat(),
                "location": self.location,
                "responsible": self.responsible_person,
                "action": "Entrada Inicial"
            }]
        super().save(*args, **kwargs)
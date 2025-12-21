from django.db import models

class ProductionOrder(models.Model):
    STATUS_CHOICES = [
        ('PLANNED', 'Planejado'),
        ('IN_PRODUCTION', 'Em Produção'),
        ('FINISHED', 'Finalizado'),
        ('ON_HOLD', 'Em Espera'),
        ('CANCELED', 'Cancelado'),
    ]

    order_number = models.CharField(max_length=20, unique=True, verbose_name="Número da Ordem")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='PLANNED', 
        verbose_name="Status"
    )
    notes = models.TextField(blank=True, null=True, verbose_name="Observações")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    def __str__(self):
        return f"Ordem: {self.order_number}"

    class Meta:
        verbose_name = "Ordem de Produção"
        verbose_name_plural = "Ordens de Produção"
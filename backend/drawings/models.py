from django.db import models
from django.contrib.auth.models import User

class Drawing(models.Model):
    # O primeiro elemento da tupla é o valor no Banco (Inglês)
    # O segundo elemento é o que o Usuário vê (Português)
    STATUS_CHOICES = [
        ('DRAFT', 'Rascunho'),
        ('IN_REVIEW', 'Em Revisão'),
        ('APPROVED', 'Aprovado'),
        ('OBSOLETE', 'Obsoleto'),
    ]

    code = models.CharField(max_length=50, unique=True, verbose_name="Código")
    title = models.CharField(max_length=255, verbose_name="Título")
    revision = models.CharField(max_length=10, default="00", verbose_name="Revisão")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='DRAFT', 
        verbose_name="Status"
    )
    
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="approved_drawings",
        verbose_name="Aprovado por"
    )
    approval_date = models.DateField(null=True, blank=True, verbose_name="Data de Aprovação")
    
    file_url = models.URLField(blank=True, null=True, verbose_name="URL do Arquivo")
    notes = models.TextField(blank=True, null=True, verbose_name="Observações")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    def __str__(self):
        return f"{self.code} - {self.title}"

    class Meta:
        verbose_name = "Desenho"
        verbose_name_plural = "Desenhos"
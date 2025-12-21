from django.db import models
from drawings.models import Drawing

class Sector(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome do Setor")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Setor"
        verbose_name_plural = "Setores"

class ProductType(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Tipo de Produto")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Tipo de Produto"
        verbose_name_plural = "Tipos de Produtos"

class Product(models.Model):
    drawing = models.ForeignKey(
        Drawing, 
        on_delete=models.CASCADE, 
        related_name="products",
        verbose_name="Desenho"
    )
    
    # Agora apontam para os novos modelos dinâmicos
    sector = models.ForeignKey(
        Sector, 
        on_delete=models.PROTECT, 
        verbose_name="Setor"
    )
    
    product_type = models.ForeignKey(
        ProductType, 
        on_delete=models.PROTECT, 
        verbose_name="Tipo"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.drawing.code} - {self.product_type.name}"

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Catálogo de Produtos"

class SB1010(models.Model):
    # Mudamos o nome da variável para 'deleted' para evitar o erro E001
    # mas mantemos o db_column apontando para 'D_E_L_E_T_'
    b1_cod = models.CharField(max_length=30, db_column='B1_COD', primary_key=True)
    b1_desc = models.CharField(max_length=100, db_column='B1_DESC')
    b1_desenho = models.CharField(max_length=50, db_column='B1_DESENHO')
    deleted = models.CharField(max_length=1, db_column='D_E_L_E_T_')

    class Meta:
        managed = False
        db_table = 'sb1010'
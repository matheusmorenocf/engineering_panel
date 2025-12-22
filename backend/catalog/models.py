from django.db import models
from drawings.models import Drawing

# ===== MODELOS DE APOIO =====

class Sector(models.Model):
    """Setores para categorização de produtos"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome do Setor")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Setor"
        verbose_name_plural = "Setores"
        ordering = ['name']


class ProductType(models.Model):
    """Tipos de produtos para categorização"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Tipo de Produto")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Tipo de Produto"
        verbose_name_plural = "Tipos de Produtos"
        ordering = ['name']


# ===== MODELO PRINCIPAL =====

class Product(models.Model):
    """
    Associação entre Desenho, Setor e Tipo.
    Usado para filtrar produtos do Protheus por categoria.
    """
    drawing = models.ForeignKey(
        Drawing, 
        on_delete=models.CASCADE, 
        related_name="products",
        verbose_name="Desenho"
    )
    
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
        unique_together = [['drawing', 'sector', 'product_type']]  # ✅ Evita duplicatas
        ordering = ['-created_at']


# ===== MODELO LEGADO (PROTHEUS) =====

class SB1010(models.Model):
    """
    Tabela SB1010 do Protheus (Read-Only).
    Contém produtos cadastrados no ERP.
    
    IMPORTANTE: Esta tabela usa campos com nomes específicos do Protheus (B1_*).
    """
    b1_cod = models.CharField(
        max_length=30, 
        db_column='B1_COD', 
        primary_key=True,
        verbose_name="Código do Produto"
    )
    
    b1_desc = models.CharField(
        max_length=100, 
        db_column='B1_DESC',
        verbose_name="Descrição"
    )
    
    b1_desenho = models.CharField(
        max_length=50, 
        db_column='B1_DESENHO',
        verbose_name="Código do Desenho",
        db_index=True  
    )
    
    deleted = models.CharField(
        max_length=1, 
        db_column='D_E_L_E_T_',  
        default='',
        verbose_name="Registro Deletado",
        db_index=True  
    )

    def __str__(self):
        return f"{self.b1_cod} - {self.b1_desc}"

    class Meta:
        managed = False  # ✅ Django não gerencia essa tabela
        db_table = 'sb1010'  # ✅ Nome exato da tabela no banco
        verbose_name = "Produto Protheus"
        verbose_name_plural = "Produtos Protheus (SB1010)"
        
        # ✅ Indexes compostos para melhor performance
        indexes = [
            models.Index(fields=['b1_desenho', 'deleted'], name='idx_desenho_deleted'),
        ]
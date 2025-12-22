from django.db.models import Q, Count, Value, OuterRef, Subquery, Case, When, IntegerField, ExpressionWrapper, F
from django.db.models.functions import Trim, Upper, Length, Substr, Coalesce
from django.contrib.postgres.aggregates import StringAgg
from rest_framework import status, generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from drawings.models import Drawing
from .models import Product, SB1010, Sector, ProductType
from .serializers import SectorSerializer, ProductTypeSerializer, ProductSerializer
from drawings.serializers import DrawingSerializer

print("TESTE: O ARQUIVO NOVO FOI CARREGADO")

class ProductCatalogView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        # Esse print tem que aparecer no log do Docker quando você der F5
        print("\n" + "!"*60)
        print("DOCKER DEBUG: LÓGICA ATUALIZADA - SEM SUBSTRING - COM REGEX")
        print("!"*60 + "\n")

        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 500))
        offset = max(0, offset)

        # 1. Base Protheus
        sb = SB1010.objects.exclude(deleted="*")

        # 2. FILTRO REGEX: 
        # Exige que comece com pelo menos 2 letras maiúsculas e um número.
        # Isso limpa automaticamente os lixos: '.', '-', '1A1', '*', etc.
        drawing_pattern = r'^[A-Z]{2,}[0-9]'
        sb = sb.filter(b1_desenho__iregex=drawing_pattern)

        # 3. Anotação SIMPLES (product_key = b1_desenho limpo)
        sb = sb.annotate(
            product_key=Upper(Trim("b1_desenho"))
        )

        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        # Paginação por chave
        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        # Esse print TEM que aparecer no console quando você der F5
        print("\n" + "="*50)
        print("DEBUG: EXECUTANDO VERSÃO COM REGEX - SEM CORTE")
        print("="*50 + "\n")

        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 500))
        offset = max(0, offset)

        # Base Protheus
        sb = SB1010.objects.exclude(deleted="*")

        # REGEX para o seu padrão: Começa com letras, seguido de números
        # Isso vai eliminar automaticamente '.', '-', '*', etc.
        drawing_pattern = r'^[A-Z]{2,}[0-9]'
        sb = sb.filter(b1_desenho__iregex=drawing_pattern)

        # Anotação SEM CORTE
        sb = sb.annotate(
            product_key=Upper(Trim("b1_desenho"))
        )

        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        # PRINT DE TESTE - Verifique se isso aparece no seu terminal!
        print("\n>>> EXECUTANDO VIEW ATUALIZADA (SEM CORTE E COM REGEX)\n")

        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 500))
        offset = max(0, offset)

        # Base Protheus
        sb = SB1010.objects.exclude(deleted="*")

        # REGEX: Começa com 2+ letras, seguido de número. Exclui lixos como '.', '-', ''
        drawing_pattern = r'^[A-Z]{2,}[0-9]'
        sb = sb.filter(b1_desenho__iregex=drawing_pattern)

        # Anotação SIMPLES (Sem o corte de -3)
        sb = sb.annotate(
            product_key=Upper(Trim("b1_desenho"))
        )

        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_label_sq if 'type_label_sq' in locals() else type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        # 1. Base Protheus - Filtro inicial por Deletados
        sb = SB1010.objects.exclude(deleted="*")
        # DEBUG NO TERMINAL: Vamos ver o que o banco está retornando antes de qualquer filtro
        test_data = sb.values_list('b1_desenho', flat=True)[:5]
        print(f"\n>>> DEBUG PROTHEUS DATA: {list(test_data)}\n")
        # Filtro Manual Rigoroso:
        # 1. Remove nulos e vazios
        # 2. Garante que o primeiro caractere seja uma letra (A-Z)
        # 3. Garante que tenha pelo menos 5 caracteres
        sb = sb.filter(
            b1_desenho__istartswith='P'  # Teste rápido: force começar com P
        ).annotate(
            product_key=Upper(Trim("b1_desenho"))
        ).filter(
            product_key__regex=r'^[A-Z]{2,}' # Força começar com pelo menos 2 letras
        )

        # 2. FILTRO REGEX PARA PADRÃO DE DESENHO:
        # ^[A-Z]{2,3} -> Deve começar com 2 ou 3 letras (PG, SID, NSS, etc)
        # [0-9]       -> Seguido obrigatoriamente por pelo menos um número
        # [A-Z0-9-]* -> Seguido por qualquer combinação de letras, números ou hífens
        # Isso remove automaticamente registros com aspas, espaços ou muito curtos.
        drawing_pattern = r'^[A-Z]{2,}[0-9][A-Z0-9-]*$'
        sb = sb.filter(b1_desenho__iregex=drawing_pattern)

        # 3. Anotação para chave de agrupamento
        sb = sb.annotate(
            product_key=Upper(Trim("b1_desenho"))
        )

        # Filtros de busca manual
        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        # Paginação por chave
        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        # 1. Base Protheus - Filtros agressivos de exclusão
        sb = SB1010.objects.exclude(deleted="*") \
            .exclude(b1_desenho__isnull=True) \
            .exclude(b1_desenho="") \
            .exclude(b1_desenho="'") \
            .exclude(b1_desenho="''")

        # 2. Anotação de limpeza e cálculo de tamanho real
        sb = sb.annotate(
            clean_desenho=Upper(Trim("b1_desenho"))
        ).annotate(
            key_length=Length("clean_desenho")
        )

        # 3. Filtra apenas o que tem conteúdo real (min 5 chars) e define a product_key
        sb = sb.filter(key_length__gte=5).annotate(
            product_key=F("clean_desenho")
        )

        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        # Base Protheus - Exclui deletados, nulos e vazios
        sb = SB1010.objects.exclude(deleted="*").exclude(b1_desenho__isnull=True).exclude(b1_desenho="")
        
        # 1. Normaliza e calcula o tamanho do desenho
        sb = sb.annotate(
            product_key=Upper(Trim("b1_desenho")),
            key_length=Length(Trim("b1_desenho"))
        )

        # 2. NOVA RESTRIÇÃO: Filtra apenas desenhos com 5 ou mais caracteres
        sb = sb.filter(key_length__gte=5)

        # Filtros de busca
        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        # Paginação por chave
        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})

    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        # Base Protheus
        sb = SB1010.objects.exclude(deleted="*").exclude(b1_desenho__isnull=True).exclude(b1_desenho="")
        
        # Anotações para chave - Removido o corte (Substr/ExpressionWrapper)
        sb = sb.annotate(
            product_key=Upper(Trim("b1_desenho"))
        )

        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        # Paginação por chave
        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})
    permission_classes = [IsAuthenticated]

    def _parse_id_list(self, value):
        if value is None: return []
        raw = value if isinstance(value, list) else [value]
        out = []
        for item in raw:
            if not item: continue
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    try: out.append(int(p))
                    except ValueError: pass
        return out

    def get(self, request, *args, **kwargs):
        codigo = (request.query_params.get("codigo") or "").strip()
        descricao = (request.query_params.get("descricao") or "").strip()
        desenho = (request.query_params.get("desenho") or "").strip()

        sectors = self._parse_id_list(request.query_params.getlist("sectors") or request.query_params.get("sectors"))
        types = self._parse_id_list(request.query_params.getlist("types") or request.query_params.get("types"))
        
        # Alterado: default agora é "0" para mostrar tudo do Protheus por padrão
        only_mapped = (request.query_params.get("only_mapped") or "0") == "1"

        try:
            limit = int(request.query_params.get("limit", "50"))
            offset = int(request.query_params.get("offset", "0"))
        except ValueError:
            return Response({"detail": "Parâmetros inválidos."}, status=400)

        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        # Base Protheus - Filtragem inicial
        sb = SB1010.objects.exclude(deleted="*").exclude(b1_desenho__isnull=True).exclude(b1_desenho="")
        
        # Anotações para gerar a chave de agrupamento
        sb = sb.annotate(
            desenho_norm=Upper(Trim("b1_desenho")),
            desenho_len=Length(Upper(Trim("b1_desenho")))
        )
        
        cut_len = ExpressionWrapper(F("desenho_len") - Value(3), output_field=IntegerField())
        sb = sb.annotate(
            product_key=Case(
                When(desenho_len__gt=3, then=Substr("desenho_norm", 1, cut_len)),
                default=F("desenho_norm"),
            )
        )

        # Filtros de busca textual (Protheus)
        if codigo: sb = sb.filter(b1_cod__icontains=codigo)
        if descricao: sb = sb.filter(b1_desc__icontains=descricao)
        if desenho: sb = sb.filter(b1_desenho__icontains=desenho)

        # Lógica de cruzamento com banco local
        drawings = Drawing.objects.annotate(code_key=Upper(Trim("code")))
        
        # Se o usuário pedir apenas mapeados OU filtrar por setor/tipo, aplicamos o filtro restritivo
        if only_mapped or sectors or types:
            local_prods = Product.objects.all()
            if sectors: local_prods = local_prods.filter(sector_id__in=sectors)
            if types: local_prods = local_prods.filter(product_type_id__in=types)
            
            allowed_keys = drawings.filter(id__in=local_prods.values("drawing_id")).values("code_key").distinct()
            sb = sb.filter(product_key__in=Subquery(allowed_keys))

        # Pega o ID do desenho local (se existir) para fazer o join das labels
        sb = sb.annotate(
            local_drawing_id=Subquery(drawings.filter(code_key=OuterRef("product_key")).values("id")[:1])
        )

        sector_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("sector__name")[:1]
        type_name_sq = Product.objects.filter(drawing_id=OuterRef("local_drawing_id")).values("product_type__name")[:1]

        # Paginação por chave (Desenho)
        keys_qs = sb.values("product_key").distinct().order_by("product_key")
        total = keys_qs.count()
        page_keys = [r["product_key"] for r in keys_qs[offset: offset + limit]]

        if not page_keys:
            return Response({"count": total, "results": []})

        # Agrupamento final dos dados do Protheus com as labels locais (se houver)
        grouped = (
            sb.filter(product_key__in=page_keys)
            .annotate(
                # Coalesce garante que se não houver mapeamento, apareça "Não Definido"
                sector_label=Coalesce(Subquery(sector_name_sq), Value("PENDENTE")),
                type_label=Coalesce(Subquery(type_name_sq), Value("PENDENTE")),
            )
            .values("product_key", "sector_label", "type_label")
            .annotate(
                related_codes=StringAgg("b1_cod", delimiter="; ", distinct=True),
                technical_descriptions=StringAgg("b1_desc", delimiter="; ", distinct=True),
                items_count=Count("b1_cod", distinct=True),
            )
            .order_by("product_key")
        )

        by_key = {g["product_key"]: g for g in grouped}
        results = []
        for k in page_keys:
            g = by_key.get(k)
            if not g: continue
            results.append({
                "id": g["product_key"], 
                "drawingId": g["product_key"],
                "sector": g["sector_label"],
                "type": g["type_label"],
                "items_count": g["items_count"],
                "products": g["related_codes"] or "",
                "descriptions": g["technical_descriptions"] or "",
            })

        return Response({"count": total, "results": results})
# ViewSets mantidos para os filtros funcionarem
class SectorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Sector.objects.all().order_by("name")
    serializer_class = SectorSerializer
    pagination_class = None

class ProductTypeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ProductType.objects.all().order_by("name")
    serializer_class = ProductTypeSerializer
    pagination_class = None

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Product.objects.select_related("drawing", "sector", "product_type").all().order_by("-created_at")
    serializer_class = ProductSerializer

class DrawingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Drawing.objects.all().order_by("code")
    serializer_class = DrawingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        code = self.request.query_params.get("code")
        if code: queryset = queryset.filter(code__iexact=code)
        return queryset

    def create(self, request, *args, **kwargs):
        code = request.data.get("code")
        if not code: return Response({"error": 'Campo "code" é obrigatório'}, status=400)
        existing = Drawing.objects.filter(code__iexact=code).first()
        if existing: return Response(self.get_serializer(existing).data, status=200)
        return super().create(request, *args, **kwargs)
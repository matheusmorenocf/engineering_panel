#!/usr/bin/env python3
"""
Script para gerar SECRET_KEY segura para Django
Execute: python generate_secret_key.py
"""

from django.core.management.utils import get_random_secret_key

# Gera uma chave aleatória segura
secret_key = get_random_secret_key()

print("=" * 70)
print("🔐 SECRET_KEY GERADA COM SUCESSO!")
print("=" * 70)
print(f"\n{secret_key}\n")
print("=" * 70)
print("\n📋 COMO USAR:\n")
print("1. Copie a chave acima")
print("2. Cole no arquivo .env do backend:")
print(f"   DJANGO_SECRET_KEY={secret_key}")
print("\n3. Ou adicione no docker-compose.yml:")
print("   environment:")
print(f"     - DJANGO_SECRET_KEY={secret_key}")
print("\n⚠️  NUNCA compartilhe essa chave publicamente!")
print("=" * 70)
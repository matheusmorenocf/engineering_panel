# ============================================
# BACKEND DOCKERFILE - Django
# Painel Engenharia
# PostgreSQL + Script de migração SQL Server (opcional)
# ============================================

FROM python:3.11-slim

# Evitar prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Variáveis de ambiente Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    postgresql-client \
    curl \
    gnupg2 \
    apt-transport-https \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# (Opcional) Driver ODBC para script de migração de dados
# Descomente se precisar rodar migrar_dados.py
# RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
#     && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
#     && apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql17 \
#     && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar o código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p media static

# Dar permissões
RUN chmod +x manage.py

# Expor porta
EXPOSE 8000

# Comando padrão (hot reload em dev)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
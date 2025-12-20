# ============================================
# Makefile - Painel Engenharia
# Comandos úteis para Docker
# ============================================

SHELL := /bin/bash

.PHONY: help up down restart build logs shell-backend shell-frontend migrate makemigrations superuser clean install-backend install-frontend db-shell db-reset status

# Comando padrão
help:
	@echo "🚀 Painel Engenharia - Comandos Docker"
	@echo ""
	@echo "📦 Gestão de Containers:"
	@echo "  make up              - Iniciar todos os serviços"
	@echo "  make down            - Parar todos os serviços"
	@echo "  make restart         - Reiniciar todos os serviços"
	@echo "  make build           - Rebuild todos os containers"
	@echo "  make clean           - Parar e remover tudo (incluindo volumes)"
	@echo ""
	@echo "📋 Logs:"
	@echo "  make logs            - Ver logs de todos os serviços"
	@echo "  make logs-backend    - Ver logs do backend"
	@echo "  make logs-frontend   - Ver logs do frontend"
	@echo "  make logs-db         - Ver logs do banco"
	@echo ""
	@echo "🔧 Backend (Django):"
	@echo "  make shell-backend   - Entrar no container do backend"
	@echo "  make migrate         - Executar migrations"
	@echo "  make makemigrations  - Criar migrations"
	@echo "  make superuser       - Criar superuser Django"
	@echo "  make install-backend - Instalar dependência Python"
	@echo ""
	@echo "🎨 Frontend (Next.js):"
	@echo "  make shell-frontend  - Entrar no container do frontend"
	@echo "  make install-frontend - Instalar dependência NPM"
	@echo ""
	@echo "🗄️ Banco de Dados:"
	@echo "  make db-shell        - Entrar no PostgreSQL"
	@echo "  make db-reset        - Resetar banco de dados (CUIDADO!)"

# Iniciar serviços
up:
	docker-compose up -d
	@echo "✅ Serviços iniciados!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔧 Backend: http://localhost:8000"
	@echo "🗄️ Database: localhost:5433"

# Parar serviços
down:
	docker-compose down
	@echo "⏹️ Serviços parados!"

# Reiniciar serviços
restart:
	docker-compose restart
	@echo "🔄 Serviços reiniciados!"

# Rebuild containers
build:
	docker-compose up -d --build
	@echo "🔨 Containers reconstruídos!"

# Logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f db

# Shells
shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

# Django
migrate:
	docker-compose exec backend python manage.py migrate
	@echo "✅ Migrations aplicadas!"

makemigrations:
	docker-compose exec backend python manage.py makemigrations
	@echo "✅ Migrations criadas!"

superuser:
	docker-compose exec backend python manage.py createsuperuser

# Instalação de pacotes
install-backend:
	@read -p "Nome do pacote: " pkg; \
	docker-compose exec backend pip install $$pkg
	@echo "⚠️ Não esqueça de adicionar ao requirements.txt!"

install-frontend:
	@read -p "Nome do pacote: " pkg; \
	docker-compose exec frontend npm install $$pkg
	@echo "✅ Pacote instalado e adicionado ao package.json!"

# Banco de Dados
db-shell:
	docker-compose exec db psql -U mestre -d dataPanelEng

db-reset:
	@echo "⚠️ ATENÇÃO: Isso vai APAGAR TODOS OS DADOS!"
	@read -p "Tem certeza? (y/N): " confirm; \
	if [ "$$confirm" = "y" ]; then \
		docker-compose down -v; \
		docker-compose up -d db; \
		sleep 5; \
		docker-compose up -d backend; \
		docker-compose exec backend python manage.py migrate; \
		echo "✅ Banco resetado!"; \
	else \
		echo "❌ Operação cancelada"; \
	fi

# Limpeza
clean:
	@echo "🧹 Limpando containers, volumes e imagens órfãs..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ Limpeza completa!"

status:
	docker-compose ps
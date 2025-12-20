# Engineering Panel

## Ambiente (Dev)
1. Copie o arquivo de exemplo:
   - `cp .env.example .env`

2. Suba o ambiente:
   - `docker compose -f docker-compose.dev.yml up --build`

A aplicação ficará em:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Ambiente (Prod)
> Em produção, use **Gunicorn** e settings de produção via `DJANGO_ENV=prod`.

1. Copie o arquivo de exemplo e ajuste:
   - `cp .env.example .env`
   - Defina obrigatoriamente: `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `POSTGRES_*`, `CORS_ALLOWED_ORIGINS`

2. Suba:
   - `docker compose -f docker-compose.prod.yml up --build -d`

## Segurança
- **Nunca** versione `.env` com credenciais.
- Use `backend/.env.example` e `frontend/.env.local.example` como base para arquivos locais.

## Settings (Django)
- `core/settings/`:
  - `base.py`: comum
  - `dev.py`: desenvolvimento
  - `prod.py`: produção (headers e validações)
- Seleção automática via `DJANGO_ENV=dev|prod`.

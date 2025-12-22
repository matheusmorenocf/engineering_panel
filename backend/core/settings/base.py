"""Base Django settings (shared by dev/prod)."""
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# =========================================================
# Environment
# =========================================================
DJANGO_ENV = os.environ.get("DJANGO_ENV", "dev").lower()

def _getenv_required(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        if DJANGO_ENV == "dev":
            return "dev-fallback-value"
        raise RuntimeError(f"Missing required environment variable: {name}")
    return val

# =========================================================
# Security
# =========================================================
DJANGO_SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY") or os.environ.get("SECRET_KEY")
if DJANGO_ENV == "prod":
    SECRET_KEY = _getenv_required("DJANGO_SECRET_KEY")
else:
    SECRET_KEY = DJANGO_SECRET_KEY or "dev-secret-key-change-me"

DEBUG = os.environ.get("DJANGO_DEBUG", os.environ.get("DEBUG", "0")) in ("1", "True", "true", "YES", "yes")

# ✅ CORREÇÃO DOCKER: Permitir acesso do frontend
ALLOWED_HOSTS = ['*']

# =========================================================
# CORS - CONFIGURAÇÃO DOCKER
# =========================================================
# ✅ Em Docker, o frontend chama o backend pelo nome do container
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # Acesso do navegador local
    "http://frontend:3000",       # Container frontend (interno)
    "http://127.0.0.1:3000",      # Fallback
]

# ✅ CRÍTICO: Permitir credenciais (JWT)
CORS_ALLOW_CREDENTIALS = True

# ✅ Headers necessários para JWT
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# ✅ Métodos HTTP permitidos
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# =========================================================
# Applications
# =========================================================
APPEND_SLASH = False  # ✅ Remove trailing slash automático

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_yasg",
    "django_filters",
    
    # Local apps
    'drawings.apps.DrawingsConfig',
    'orders.apps.OrdersConfig',
    'catalog.apps.CatalogConfig',
    'userprefs.apps.UserprefsConfig',
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # ✅ CORS antes do CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"

# =========================================================
# Database - CONFIGURAÇÃO DOCKER
# =========================================================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DATABASE_NAME", "dataPanelEng"),
        "USER": os.environ.get("DATABASE_USER", "mestre"),
        "PASSWORD": os.environ.get("DATABASE_PASSWORD", "35jsJL9d"),
        "HOST": os.environ.get("DATABASE_HOST", "db"),  # ✅ Nome do container no Docker
        "PORT": os.environ.get("DATABASE_PORT", "5432"),
        "CONN_MAX_AGE": 600,  # ✅ Pool de conexões
    }
}

# =========================================================
# Password validation
# =========================================================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = os.environ.get("TIME_ZONE", "America/Bahia")
USE_I18N = True
USE_TZ = True

# =========================================================
# Static files
# =========================================================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =========================================================
# DRF / JWT
# =========================================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        'rest_framework.authentication.SessionAuthentication',
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    # ✅ Paginação padrão
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}

SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ('Bearer',),
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}

# =========================================================
# Logging - CONFIGURAÇÃO DOCKER
# =========================================================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.environ.get("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
        "catalog": {  # ✅ Log específico do app
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# URL pública para o frontend
MEDIA_URL = '/media/'

# Pasta interna onde o Docker vai "montar" o seu disco D:
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
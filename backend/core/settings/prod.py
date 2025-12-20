"""Production settings."""
from .base import *  # noqa
import os

DEBUG = False

# Require explicit allowed hosts in prod
_allowed = os.environ.get("DJANGO_ALLOWED_HOSTS") or os.environ.get("ALLOWED_HOSTS")
if not _allowed:
    raise RuntimeError("DJANGO_ALLOWED_HOSTS (or ALLOWED_HOSTS) is required in production")
ALLOWED_HOSTS = _allowed.split(",")

# Security headers (assumes reverse proxy terminates TLS)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = os.environ.get("DJANGO_SECURE_SSL_REDIRECT", "1") in ("1","True","true","YES","yes")
SECURE_HSTS_SECONDS = int(os.environ.get("DJANGO_HSTS_SECONDS", "3600"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

USE_X_FORWARDED_HOST = True

# In prod we require DB password
if not DATABASES["default"]["PASSWORD"]:
    raise RuntimeError("DATABASE_PASSWORD is required in production")

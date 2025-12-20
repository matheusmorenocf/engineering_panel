"""Development settings."""
from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Convenience defaults for local/dev
DATABASES["default"]["PASSWORD"] = DATABASES["default"]["PASSWORD"] or "postgres"

from .base import *

# ATENÇÃO: Isso é crucial para o Docker. 
# "*" permite que o container do frontend acesse o backend.
ALLOWED_HOSTS = ["*"] 

DEBUG = True

LOGGING = {
  "version": 1,
  "disable_existing_loggers": False,
  "handlers": {"console": {"class": "logging.StreamHandler"}},
  "loggers": {"django.db.backends": {"handlers": ["console"], "level": "DEBUG"}},
}

from .base import *

# ATENÇÃO: Isso é crucial para o Docker. 
# "*" permite que o container do frontend acesse o backend.
ALLOWED_HOSTS = ["*"] 

DEBUG = True
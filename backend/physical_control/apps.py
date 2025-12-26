from django.apps import AppConfig


class PhysicalControlConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'physical_control'

    def ready(self):
        # Isso garante que os @receiver sejam registrados
        import physical_control.models

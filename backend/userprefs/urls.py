from django.urls import path
from .views import preferences_me

urlpatterns = [
    path("me/", preferences_me, name="preferences-me"),
]

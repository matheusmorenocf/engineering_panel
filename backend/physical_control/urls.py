from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, PhysicalControlViewSet

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'items', PhysicalControlViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
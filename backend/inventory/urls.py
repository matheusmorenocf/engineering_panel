from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PhysicalControlViewSet, LocationViewSet

router = DefaultRouter()
router.register(r'physical-control', PhysicalControlViewSet)
router.register(r'locations', LocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
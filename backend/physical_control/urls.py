from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemProcessingViewSet, LocationViewSet, PhysicalControlViewSet
from .views import list_users

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'items', PhysicalControlViewSet)
router.register(r'processing', ItemProcessingViewSet)

urlpatterns = [
    path('users/', list_users, name='list_users'),
    path('', include(router.urls)),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserPreferencesView, preferences_me, UserAdminViewSet, GroupViewSet, PermissionViewSet

router = DefaultRouter()
router.register(r'users', UserAdminViewSet, basename='admin-users')
router.register(r'groups', GroupViewSet, basename='admin-groups')
router.register(r'permissions', PermissionViewSet, basename='admin-permissions')

urlpatterns = [
    path("me/", preferences_me, name="preferences-me"),
    path("preferences/", UserPreferencesView.as_view(), name="global-preferences"),
    path("", include(router.urls)),
]
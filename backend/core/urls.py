from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from userprefs.models import UserPreferences

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user_perms = []
    if request.user.is_authenticated:
        for perm in request.user.get_all_permissions():
            user_perms.append(perm)

    prefs_obj, _ = UserPreferences.objects.get_or_create(
        user=request.user,
        defaults={"data": {}}
    )

    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'first_name': request.user.first_name or request.user.username,
        'last_name': request.user.last_name or "",
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
        'permissions': user_perms,
        'groups': list(request.user.groups.values_list('name', flat=True)),
        'preferences': prefs_obj.data or {}
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Autenticação
    re_path(r'^api/token/?$', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    re_path(r'^api/token/refresh/?$', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Perfil
    re_path(r'^api/user/me/?$', get_user_profile, name='user_profile'),

    # Catálogo
    path('api/catalog/', include('catalog.urls')),

    # UserPrefs - Importante: O prefixo aqui define a URL base do service
    path("api/userprefs/", include("userprefs.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Retorna os dados do usuário e sua lista de permissões simplificada.
    """
    user_perms = []
    if request.user.is_authenticated:
        for perm in request.user.get_all_permissions():
            user_perms.append(perm.split('.')[-1])

    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'first_name': request.user.first_name or request.user.username,
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
        'permissions': user_perms,
        'groups': list(request.user.groups.values_list('name', flat=True))
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Autenticação
    re_path(r'^api/token/?$', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    re_path(r'^api/token/refresh/?$', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Perfil e Permissões
    re_path(r'^api/user/me/?$', get_user_profile, name='user_profile'),

    # ROTAS DO CATÁLOGO E GESTÃO
    # O include delega para o backend/catalog/urls.py
    path('api/catalog/', include('catalog.urls')),
]
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User, Group, Permission

from .models import UserPreferences
from .serializers import (
    UserPreferencesSerializer, 
    UserAdminSerializer, 
    GroupSerializer, 
    PermissionSerializer
)

# --- PREFERÊNCIAS INDIVIDUAIS (USUÁRIO LOGADO) ---
@api_view(["GET", "PATCH", "POST"]) # Adicionei POST pois o front pode tentar enviar assim
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def preferences_me(request):
    prefs_obj, _ = UserPreferences.objects.get_or_create(user=request.user, defaults={"data": {}})

    if request.method == "GET":
        return Response({"data": prefs_obj.data})

    # No PATCH/POST, o front envia { data: { ... } } ou apenas o objeto
    incoming = request.data.get('data') if 'data' in request.data else request.data

    if not isinstance(incoming, dict):
        return Response({"detail": "Body must be a JSON object."}, status=status.HTTP_400_BAD_REQUEST)

    # Lógica de Merge
    current = dict(prefs_obj.data) # Cria uma cópia real
    current.update(incoming)
    
    prefs_obj.data = current
    prefs_obj.save() # Remova o update_fields para garantir que o sinal de post_save funcione se necessário

    return Response({"status": "success", "data": prefs_obj.data})

# --- VIEWS PARA GESTÃO DE USUÁRIOS E GRUPOS ---
class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserAdminSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all().order_by('codename')
    serializer_class = PermissionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    pagination_class = None

# --- CONFIGURAÇÕES GLOBAIS DO SISTEMA (PAGES TAB) ---
class UserPreferencesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_system_user(self):
        # Retorna o primeiro superuser (ID 1 geralmente)
        return User.objects.filter(is_superuser=True).order_by('id').first()

    def get(self, request):
        system_user = self.get_system_user()
        if not system_user:
            return Response({"error": "Admin não encontrado"}, status=404)
            
        prefs, _ = UserPreferences.objects.get_or_create(user=system_user)
        serializer = UserPreferencesSerializer(prefs)
        # Retornamos o envelope 'data' para manter compatibilidade com o front
        return Response({"data": serializer.data['data']})

    def post(self, request):
        if not request.user.is_superuser:
            return Response({"detail": "Não autorizado."}, status=status.HTTP_403_FORBIDDEN)

        system_user = self.get_system_user()
        prefs, _ = UserPreferences.objects.get_or_create(user=system_user)
        
        # O front envia { data: { ... } }
        incoming_data = request.data.get('data', {})
        
        # Garantimos que estamos salvando o objeto limpo e atualizado
        # Se você quiser MERGE total:
        current_data = prefs.data if isinstance(prefs.data, dict) else {}
        current_data.update(incoming_data)
        prefs.data = current_data
        
        # Forçamos a marcação de que o campo JSON foi alterado
        prefs.save() 
        
        return Response({"status": "success", "data": prefs.data})
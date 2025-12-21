from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import UserPreferences
from .serializers import UserPreferencesSerializer


@api_view(["GET", "PATCH"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def preferences_me(request):
    # garante que exista para usuários antigos
    prefs_obj, _ = UserPreferences.objects.get_or_create(user=request.user, defaults={"data": {}})

    if request.method == "GET":
        return Response(UserPreferencesSerializer(prefs_obj).data)

    incoming = request.data or {}
    if not isinstance(incoming, dict):
        return Response({"detail": "Body must be a JSON object."}, status=status.HTTP_400_BAD_REQUEST)

    current = prefs_obj.data or {}
    current.update(incoming)  # merge simples
    prefs_obj.data = current
    prefs_obj.save(update_fields=["data"])

    return Response(UserPreferencesSerializer(prefs_obj).data)

from django.contrib.auth.models import User, Group, Permission
from rest_framework import serializers
from .models import UserPreferences

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ["data", "updated_at"]

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

class GroupSerializer(serializers.ModelSerializer):
    # Opcional: traz detalhes das permissões para o front
    permissions_details = PermissionSerializer(source='permissions', many=True, read_only=True)
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permissions_details']

class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'groups', 'is_active', 'is_superuser', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': True}
        }

    def create(self, validated_data):
        groups_data = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        user.groups.set(groups_data)
        return user

    def update(self, instance, validated_data):
        # 1. Extraímos os grupos e a senha antes de atualizar o restante
        groups_data = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)

        # 2. Atualizamos os campos normais (nome, email, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # 3. Tratamento especial para a senha (Hashing)
        if password:
            instance.set_password(password)

        instance.save()

        # 4. Atualizamos os grupos se eles foram enviados no payload
        if groups_data is not None:
            instance.groups.set(groups_data)

        return instance
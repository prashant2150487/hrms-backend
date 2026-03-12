from rest_framework import serializers
from apps.tenants.models import Tenant
from apps.auth_app.models import User
from django.db import transaction


class TenantRegistrationSerializer(serializers.Serializer):
    # Tenant details
    company_name = serializers.CharField(max_length=255)
    subdomain = serializers.CharField(max_length=255)
    plan = serializers.CharField(max_length=255, default="free")

    # Super Admin details
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)

    def validate_subdomain(self, value):
        if Tenant.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("This subdomain is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            # Create Tenant
            tenant = Tenant.objects.create(
                name=validated_data["company_name"],
                subdomain=validated_data["subdomain"],
                plan=validated_data.get("plan", "free"),
            )

            # Create Super Admin User linked to Tenant
            user = User.objects.create_superuser(
                email=validated_data["email"],
                password=validated_data["password"],
                tenant=tenant,
            )

            # Since User model does not have first_name and last_name currently, we can skip them
            # or add them to User model. Looking at models.py, User does not have them by default.
            # AbstractBaseUser doesn't have first_name, last_name unless added.


            return {"tenant": tenant, "user": user}


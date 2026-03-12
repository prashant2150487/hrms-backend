from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import TenantRegistrationSerializer


class RegisterTenantView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TenantRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(
                {
                    "data": {
                        "tenant_id": result["tenant"].id,
                        "user_id": result["user"].id,
                        "email": result["user"].email,
                    },
                    "success": True,
                    "message": "Tenant and super admin created successfully",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {
                "success": False,
                "message": "Failed to create User",
                "error": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

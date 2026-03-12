from django.urls import path
from .views import RegisterTenantView

urlpatterns = [
    path("register/", RegisterTenantView.as_view(), name="register_tenant"),
]

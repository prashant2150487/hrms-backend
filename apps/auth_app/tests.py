from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.tenants.models import Tenant
from apps.auth_app.models import User


class TenantRegistrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("register_tenant")

    def test_register_tenant_success(self):
        data = {
            "company_name": "Test Company",
            "subdomain": "testcompany",
            "email": "admin@testcompany.com",
            "password": "securepassword123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tenant.objects.count(), 1)
        self.assertEqual(User.objects.count(), 1)

        tenant = Tenant.objects.first()
        self.assertEqual(tenant.name, "Test Company")
        self.assertEqual(tenant.subdomain, "testcompany")

        user = User.objects.first()
        self.assertEqual(user.email, "admin@testcompany.com")
        self.assertEqual(user.tenant, tenant)
        self.assertTrue(user.check_password("securepassword123"))
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

    def test_register_tenant_duplicate_subdomain(self):
        # Create existing tenant
        Tenant.objects.create(name="Existing", subdomain="testcompany")

        data = {
            "company_name": "Test Company",
            "subdomain": "testcompany",
            "email": "admin@testcompany.com",
            "password": "securepassword123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("subdomain", response.data)

import json
from rest_framework.test import APIClient
client = APIClient()
data = {
    "company_name": "Test Company",
    "subdomain": "testcompany12",
    "email": "admin@testcompany12.com",
    "password": "securepassword123"
}
try:
    response = client.post('/api/v1/auth/register/', data=data, format='json')
    print("Status:", response.status_code)
    print("Data:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()

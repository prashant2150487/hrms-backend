from django.db import models
import uuid
# Create your models here.
# 3.1 Tenant
# id (UUID PK), name, subdomain, plan, is_active, created_at, settings (JSONB)
# One tenant = one company/subsidiary. All models FK to Tenant for multi-tenancy.

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    subdomain = models.CharField(max_length=255, unique=True)
    plan = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    settings = models.JSONField(default=dict)

    def __str__(self):
        return self.name

from django.contrib import admin
from .models import Tenant

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'subdomain', 'plan', 'is_active', 'created_at')
    search_fields = ('name', 'subdomain', 'plan')
    list_filter = ('is_active', 'plan', 'created_at')
    readonly_fields = ('id', 'created_at')

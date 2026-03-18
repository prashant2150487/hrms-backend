from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.auth_app.permissions import HasModulePermission
from .models import Employee, Department, Designation, SalaryGrade
from .serializers import (
    EmployeeSerializer, EmployeeCreateSerializer,
    DepartmentSerializer, DesignationSerializer, SalaryGradeSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [HasModulePermission]
    required_module = 'Employee Management'
    
    def get_queryset(self):
        return Department.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class DesignationViewSet(viewsets.ModelViewSet):
    serializer_class = DesignationSerializer
    permission_classes = [HasModulePermission]
    required_module = 'Employee Management'
    
    def get_queryset(self):
        return Designation.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class SalaryGradeViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryGradeSerializer
    permission_classes = [HasModulePermission]
    required_module = 'Employee Management'
    
    def get_queryset(self):
        return SalaryGrade.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [HasModulePermission]
    required_module = 'Employee Management'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeCreateSerializer
        return EmployeeSerializer

    def get_queryset(self):
        return Employee.objects.filter(tenant=self.request.user.tenant)

    def get_permissions(self):
        # Map DRF actions to our MATRIX actions
        action_map = {
            'list': 'view',
            'retrieve': 'view',
            'create': 'add',
            'update': 'change',
            'partial_update': 'change',
            'destroy': 'delete',
        }
        self.required_action = action_map.get(self.action, 'view')
        return super().get_permissions()

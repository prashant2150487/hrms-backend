from rest_framework import serializers
from .models import Employee, Department, Designation, SalaryGrade
from apps.auth_app.models import User

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email')

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = '__all__'

class SalaryGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryGrade
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = (
            'id', 'user', 'tenant', 'tenant_name',
            'emp_code', 'first_name', 'last_name', 'date_of_birth', 'gender', 'nationality',
            'department', 'department_name', 'designation', 'designation_name',
            'employment_type', 'date_of_joining', 'date_of_leaving', 'status',
            'manager', 'manager_name', 'work_location', 'salary_grade',
            'phone_number', 'personal_email', 'created_at', 'updated_at'
        )
        read_only_fields = ('emp_code', 'status')

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}"
        return None

class EmployeeCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Employee
        fields = (
            'email', 'password', 'first_name', 'last_name', 'date_of_birth', 'gender', 'nationality',
            'department', 'designation', 'salary_grade', 'employment_type',
            'date_of_joining', 'manager', 'work_location',
            'phone_number', 'personal_email'
        )

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        
        from django.db import transaction
        with transaction.atomic():
            request = self.context.get('request')
            tenant = request.user.tenant
            
            user = User.objects.create_user(
                email=email,
                password=password,
                tenant=tenant
            )
            
            count = Employee.objects.filter(tenant=tenant).count() + 1
            emp_code = f"EMP-{count:04d}"
            
            employee = Employee.objects.create(
                user=user,
                tenant=tenant,
                emp_code=emp_code,
                **validated_data
            )
            return employee

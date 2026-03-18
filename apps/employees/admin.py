from django.contrib import admin
from .models import Employee, Department, Designation, SalaryGrade

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant')
    list_filter = ('tenant',)

@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant')
    list_filter = ('tenant',)

@admin.register(SalaryGrade)
class SalaryGradeAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'min_salary', 'max_salary')
    list_filter = ('tenant',)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('emp_code', 'first_name', 'last_name', 'tenant', 'department', 'status')
    search_fields = ('emp_code', 'first_name', 'last_name', 'personal_email')
    list_filter = ('tenant', 'status', 'department', 'gender')

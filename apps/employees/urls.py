from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, DepartmentViewSet, DesignationViewSet, SalaryGradeViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'salary-grades', SalaryGradeViewSet, basename='salary-grade')

urlpatterns = [
    path('', include(router.urls)),
]

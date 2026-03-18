import sys
from django.core.management.base import BaseCommand
from apps.auth_app.models import Role, ModulePermission
from django.db import transaction

# Map ✓ to full CRUD permissions
FULL_ACCESS = ["view", "add", "change", "delete"]

MATRIX = {
    "Employee Management": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["view", "own"],
        "Employee": ["view", "own"],
        "Recruiter": [],
        "Finance": ["view"],
        "Auditor": ["view"],
    },
    "Payroll": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": [],
        "Employee": ["view"],
        "Recruiter": [],
        "Finance": FULL_ACCESS,
        "Auditor": ["view"],
    },
    "Leave Management": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["approve"],
        "Employee": FULL_ACCESS,
        "Recruiter": [],
        "Finance": [],
        "Auditor": ["view"],
    },
    "Recruitment / ATS": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["view"],
        "Employee": [],
        "Recruiter": FULL_ACCESS,
        "Finance": [],
        "Auditor": ["view"],
    },
    "Performance Reviews": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": FULL_ACCESS,
        "Employee": ["view"],
        "Recruiter": [],
        "Finance": [],
        "Auditor": ["view"],
    },
    "Attendance": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["team"],
        "Employee": ["own"],
        "Recruiter": [],
        "Finance": [],
        "Auditor": ["view"],
    },
    "Training & LMS": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["assign"],
        "Employee": ["enroll"],
        "Recruiter": [],
        "Finance": [],
        "Auditor": ["view"],
    },
    "Documents": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["team"],
        "Employee": ["own"],
        "Recruiter": ["job"],
        "Finance": [],
        "Auditor": ["view"],
    },
    "Reports & Analytics": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["team"],
        "Employee": [],
        "Recruiter": [],
        "Finance": FULL_ACCESS,
        "Auditor": ["view"],
    },
    "System Config": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": [],
        "Manager": [],
        "Employee": [],
        "Recruiter": [],
        "Finance": [],
        "Auditor": [],
    },
    "Audit Logs": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": ["view"],
        "Manager": [],
        "Employee": [],
        "Recruiter": [],
        "Finance": [],
        "Auditor": ["view"],
    },
    "Expense Claims": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["approve"],
        "Employee": FULL_ACCESS,
        "Recruiter": [],
        "Finance": FULL_ACCESS,
        "Auditor": ["view"],
    },
    "Onboarding / Offboard": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": [],
        "Employee": ["own"],
        "Recruiter": [],
        "Finance": [],
        "Auditor": ["view"],
    },
    "Asset Management": {
        "Super Admin": FULL_ACCESS,
        "HR Admin": FULL_ACCESS,
        "Manager": ["view"],
        "Employee": ["own"],
        "Recruiter": [],
        "Finance": ["view"],
        "Auditor": ["view"],
    },
}

class Command(BaseCommand):
    help = 'Seed roles and permissions based on the PRD matrix.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Starting to seed roles and permissions...")
        
        roles_dict = {}
        for role_name in ["Super Admin", "HR Admin", "Manager", "Employee", "Recruiter", "Finance", "Auditor"]:
            role, created = Role.objects.get_or_create(name=role_name, tenant=None)
            roles_dict[role_name] = role
            role.permissions.clear()

        permissions_cache = {}

        for module, role_actions in MATRIX.items():
            for role_name, actions in role_actions.items():
                role = roles_dict[role_name]
                for action in actions:
                    key = f"{module}_{action}"
                    if key not in permissions_cache:
                        perm, _ = ModulePermission.objects.get_or_create(
                            module_name=module, 
                            action=action
                        )
                        permissions_cache[key] = perm
                    role.permissions.add(permissions_cache[key])

        self.stdout.write(self.style.SUCCESS("Successfully seeded roles and permissions."))

from rest_framework import permissions

class HasModulePermission(permissions.BasePermission):
    """
    Checks if request.user handles the specific module permissions.
    Expects `required_module` and `required_action` on the View.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(request.user, 'is_superuser', False):
            return True
            
        required_module = getattr(view, 'required_module', None)
        required_action = getattr(view, 'required_action', 'view')

        if not required_module:
            # If the view doesn't define a module, fallback to AllowAny equivalent or restrict?
            # We assume it should pass if we don't protect it explicitly here.
            return True

        if not getattr(request.user, 'role', None):
            return False

        # Support checking if the user has the exact action (e.g., 'approve', 'add', 'team')
        # or if checking for 'view', any of full CRUD implicitly allows 'view' in our matrix but we seeded 'view' explicitly
        return request.user.role.permissions.filter(
            module_name=required_module, 
            action=required_action
        ).exists()

    def has_object_permission(self, request, view, obj):
        # Implement contextual logic ('own', 'team', 'approve')
        # This can be expanded based on the obj type. For example:
        # if 'own' within permissions, ensure obj.user == request.user
        required_module = getattr(view, 'required_module', None)
        if not required_module or not getattr(request.user, 'role', None):
            return False

        perms = request.user.role.permissions.filter(module_name=required_module).values_list('action', flat=True)
        perms = set(perms)

        if 'view' in perms or 'add' in perms or 'change' in perms or 'delete' in perms:
            # They have broad permissions
            pass

        # To be implemented on model-by-model basis later:
        if 'own' in perms:
            if hasattr(obj, 'user_id') and obj.user_id == request.user.id:
                return True
            if hasattr(obj, 'employee') and hasattr(obj.employee, 'user_id') and obj.employee.user_id == request.user.id:
                return True
        
        return True # Default to let the view handle specifics, or return False if strict.

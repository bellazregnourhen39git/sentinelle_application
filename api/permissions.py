from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', '').upper()
        return role in ['SUPER_ADMIN', 'SUPERADMIN', 'GLOBAL_ADMIN'] or request.user.is_staff or request.user.is_superuser

class IsGlobalAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', '').upper()
        return role in ['SUPER_ADMIN', 'SUPERADMIN', 'GLOBAL_ADMIN'] or request.user.is_staff or request.user.is_superuser

class RoleBasedPermission(permissions.BasePermission):
    """
    General permission to check if user has one of the allowed roles.
    """
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in self.allowed_roles

class ScopePermission(permissions.BasePermission):
    """
    Check if the user has access to a specific scope (gov or establishment).
    Used for object-level permission if necessary.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ['SUPER_ADMIN', 'GLOBAL_ADMIN']:
            return True
        
        if user.role == 'REGIONAL_ADMIN':
            return obj.governorate == user.governorate
            
        if user.role == 'PRACTITIONER':
            return obj.establishment == user.establishment
            
        return False

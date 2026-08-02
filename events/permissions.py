from rest_framework import permissions


class IsOrganizerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or obj.organizer_id == request.user.id)
        )


class IsEventOrganizerOrStaff(permissions.BasePermission):
    """Allow an event owner or staff member to manage its ticket classes."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        event = getattr(obj, "event", obj)
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or event.organizer_id == request.user.id)
        )


class IsReviewAuthorOrStaff(permissions.BasePermission):
    """Keep review edits with the author, while allowing staff moderation."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or obj.user_id == request.user.id)
        )

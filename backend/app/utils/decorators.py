from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity


def admin_required(fn):
    """
    Decorator: JWT required + role must be 'admin'.
    Optimized: Uses JWT claims instead of DB lookup.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({
                "error": "Forbidden",
                "message": "Admin access required"
            }), 403
        return fn(*args, **kwargs)
    return wrapper


def jwt_roles_required(roles):
    """Generic decorator to check for multiple roles if needed."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify({
                    "error": "Forbidden", 
                    "message": f"Access restricted to: {', '.join(roles)}"
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

from flask import Blueprint, jsonify, request
from app.controllers.auth_controller import AuthController

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    return AuthController.register()


@auth_bp.route("/login", methods=["POST"])
def login():
    return AuthController.login()


@auth_bp.route("/verify-2fa", methods=["POST"])
def verify_2fa():
    return AuthController.verify_2fa()


@auth_bp.route("/admin-login", methods=["POST"])
def admin_login():
    """Dedicated admin login — returns 403 if the user is not an admin."""
    from app.services.auth_service import authenticate_user
    from app.utils.validators import validate_required_fields
    from flask_jwt_extended import create_access_token

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    missing = validate_required_fields(data, ["email", "password"])
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    user, error = authenticate_user(data["email"], data["password"])
    if error:
        return jsonify({"error": error}), 401

    if user.role != "admin":
        return jsonify({"error": "Forbidden", "message": "Admin access only"}), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )
    return jsonify({
        "message": "Admin login successful",
        "token": access_token,
        "role": user.role,
        "user": {
            "id": user.id,
            "username": user.username,
            "name": f"{user.first_name} {user.last_name}" if user.first_name else user.username,
            "role": user.role
        },
    }), 200

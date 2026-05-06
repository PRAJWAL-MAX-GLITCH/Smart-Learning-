from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app.services.auth_service import register_user, authenticate_user
from app.utils.validators import validate_email, validate_password, validate_required_fields


class AuthController:
    @staticmethod
    def register():
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        missing = validate_required_fields(data, ["username", "email", "password"])
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        if not validate_email(data["email"]):
            return jsonify({"error": "Invalid email format"}), 400

        if not validate_password(data["password"]):
            return jsonify({"error": "Password must be at least 8 characters"}), 400

        user, error = register_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            role="student", # Force student role for public registration
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
        )
        if error:
            return jsonify({"error": error}), 409

        return jsonify({"message": "User registered successfully", "user": user.to_dict()}), 201

    @staticmethod
    def login():
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        missing = validate_required_fields(data, ["email", "password"])
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        user, error = authenticate_user(data["email"], data["password"])
        if error:
            return jsonify({"error": error}), 401

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": user.to_dict(),
        }), 200

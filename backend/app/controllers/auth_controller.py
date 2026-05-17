from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app.services.auth_service import register_user, authenticate_user
from app.utils.validators import validate_email, validate_password, validate_strong_password, validate_required_fields
from app.models.settings import SystemSettings


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

        # Check System Policy
        is_strong_required = SystemSettings.get_value("enforce_strong_password", "false") == "true"
        
        if is_strong_required:
            if not validate_strong_password(data["password"]):
                return jsonify({"error": "Password must be 8+ characters and include uppercase, number, and special character"}), 400
        else:
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

        # Check 2FA Policy (Only for Admin in this mock)
        is_2fa_enabled = SystemSettings.get_value("enable_2fa", "false") == "true"
        
        if user.role == 'student' and is_2fa_enabled:
            # Mock: Generate a temporary session and ask for OTP
            return jsonify({
                "message": "2FA required",
                "2fa_required": True,
                "email": user.email,
                "temp_token": create_access_token(identity=str(user.id), additional_claims={"2fa_pending": True}, expires_delta=False)
            }), 200

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "role": user.role,
            "user": user.to_dict(),
        }), 200

    @staticmethod
    def verify_2fa():
        data = request.get_json()
        otp = data.get("otp")
        email = data.get("email")
        
        if not otp or not email:
            return jsonify({"error": "OTP and Email required"}), 400
            
        # Mock OTP Verification (any 6 digit code works in this mock)
        if otp == "123456":
            from app.models.user import User
            user = User.query.filter_by(email=email).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={"role": user.role}
            )
            return jsonify({
                "message": "2FA Verified",
                "token": access_token,
                "role": user.role,
                "user": user.to_dict(),
            }), 200
        else:
            return jsonify({"error": "Invalid OTP. Use 123456 for testing."}), 401

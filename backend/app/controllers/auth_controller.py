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

        email = data["email"].strip().lower()
        username = data["username"].strip()
        
        user, error = register_user(
            username=username,
            email=email,
            password=data["password"],
            role="student", # Force student role for public registration
            first_name=data.get("first_name", "").strip() if data.get("first_name") else None,
            last_name=data.get("last_name", "").strip() if data.get("last_name") else None,
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

        email = data["email"].strip().lower()
        user, error = authenticate_user(email, data["password"])
        if error:
            return jsonify({"error": error}), 401

        # For students, initiate OTP flow
        if user.role == "student":
            from app.services.otp_service import generate_otp, save_otp, send_email_otp
            otp_code = generate_otp()
            save_otp(user.id, otp_code)
            # Send email (fire-and-forget, ignore errors for now)
            try:
                send_email_otp(user.email, otp_code)
            except Exception as e:
                # Log but still proceed
                from app.extensions import db
                db.session.rollback()
                return jsonify({"error": f"Failed to send OTP email: {str(e)}"}), 500

            return jsonify({"status": "OTP_REQUIRED", "user_id": user.id}), 200

        # Admins / others get token directly
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role, "email_verified": True}
        )
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "role": user.role,
            "user": user.to_dict(),
        }), 200

    @staticmethod
    def verify_otp():
        data = request.get_json()
        print(f"[DEBUG] verify_otp called with data: {data}")
        user_id = data.get("user_id")
        otp = data.get("otp")
        if not user_id or not otp:
            return jsonify({"error": "user_id and otp are required"}), 400
        
        try:
            user_id = int(user_id)
            otp = str(otp).strip().replace(" ", "")
        except ValueError:
            return jsonify({"error": "Invalid input format"}), 400

        print(f"[DEBUG] verify_otp parsing: user_id={user_id}, otp={otp}")

        from app.services.otp_service import verify_otp
        success, error = verify_otp(user_id, otp)
        
        print(f"[DEBUG] verify_otp result: success={success}, error={error}")

        if not success:
            return jsonify({"error": error}), 401
        
        # Generate JWT with verified flag
        from app.models.user import User
        user = User.query.get(user_id)
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role, "email_verified": True}
        )
        # Update user email_verified flag
        user.email_verified = True
        from app.extensions import db
        db.session.commit()
        return jsonify({"message": "OTP verified, login successful", "token": access_token, "user": user.to_dict(), "role": user.role}), 200

    @staticmethod
    def resend_otp():
        data = request.get_json()
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        from app.services.otp_service import can_resend, generate_otp, invalidate_old_otps, save_otp, send_email_otp, get_user_email
        if not can_resend(user_id):
            return jsonify({"error": "Resend cooldown active. Please wait before requesting a new OTP."}), 429
        # Invalidate old OTPs
        invalidate_old_otps(user_id)
        otp_code = generate_otp()
        save_otp(user_id, otp_code)
        email = get_user_email(user_id)
        try:
            send_email_otp(email, otp_code)
        except Exception as e:
            return jsonify({"error": f"Failed to send OTP email: {str(e)}"}), 500
        return jsonify({"status": "OTP_SENT"}), 200


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

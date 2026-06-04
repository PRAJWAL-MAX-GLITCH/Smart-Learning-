import random
import string
from datetime import datetime, timedelta
import resend

from app.extensions import db
from app.models.otp_verification import OtpVerification
from app.models.user import User

# Environment variables are loaded via Flask config (app.config)

def _load_resend_config(app):
    return {
        "api_key": app.config.get("RESEND_API_KEY"),
        "email_from": app.config.get("RESEND_EMAIL_FROM", "onboarding@resend.dev"),
    }

def generate_otp():
    """Generate a cryptographically secure 6‑digit OTP."""
    # Use random.SystemRandom for security
    return f"{random.SystemRandom().randint(0, 999999):06d}"

def save_otp(user_id: int, otp_code: str):
    """Persist OTP to the database with a 5‑minute expiry."""
    now = datetime.utcnow()
    expires = now + timedelta(minutes=5)
    otp_entry = OtpVerification(
        user_id=user_id,
        otp_code=otp_code,
        created_at=now,
        expires_at=expires,
        is_used=False,
    )
    db.session.add(otp_entry)
    db.session.commit()
    return otp_entry

def invalidate_old_otps(user_id: int):
    """Mark all existing OTPs for a user as used/invalid.
    This is called before generating a new OTP (e.g., resend)."""
    OtpVerification.query.filter_by(user_id=user_id, is_used=False).update({"is_used": True})
    db.session.commit()

def can_resend(user_id: int) -> bool:
    """Allow resend only if the most recent OTP was generated >60 seconds ago."""
    latest = (
        OtpVerification.query.filter_by(user_id=user_id)
        .order_by(OtpVerification.created_at.desc())
        .first()
    )
    if not latest:
        return True
    elapsed = datetime.utcnow() - latest.created_at
    return elapsed.total_seconds() >= 60

def verify_otp(user_id: int, otp_code: str):
    """Validate OTP.
    Returns (True, None) on success, otherwise (False, error_message)."""
    otp_entry = (
        OtpVerification.query.filter_by(user_id=user_id, otp_code=otp_code, is_used=False)
        .first()
    )
    if not otp_entry:
        return False, "Invalid OTP"
    if otp_entry.expires_at < datetime.utcnow():
        return False, "OTP expired"
    # Mark as used
    otp_entry.is_used = True
    db.session.commit()
    return True, None

def get_user_email(user_id: int) -> str:
    user = User.query.get(user_id)
    return user.email if user else ""

def send_email_otp(recipient_email: str, otp_code: str):
    """Send OTP via Resend API.
    Relies on Flask app config for Resend API settings. Raises on failure.
    """
    from flask import current_app
    import logging

    logger = logging.getLogger(__name__)
    cfg = _load_resend_config(current_app)
    
    if not cfg["api_key"]:
        msg = "RESEND_API_KEY is missing in configuration."
        logger.error(msg)
        raise RuntimeError(msg)

    resend.api_key = cfg["api_key"]

    subject = "SmartLearning Verification Code"
    html_body = f"""
    <p>Hello,</p>
    <p>Your verification code is: <strong>{otp_code}</strong></p>
    <p>This code will expire in 5 minutes. If you did not request this login, please ignore this email.</p>
    <p>SmartLearning Team</p>
    """

    try:
        logger.info(f"Sending OTP email via Resend to {recipient_email}")
        
        response = resend.Emails.send({
            "from": cfg["email_from"],
            "to": recipient_email,
            "subject": subject,
            "html": html_body
        })
        
        logger.info(f"Email sent successfully to {recipient_email}. Resend ID: {response.get('id')}")
            
        return True
    except Exception as e:
        logger.error(f"Resend exception details: {str(e)}")
        raise RuntimeError(f"Failed to send OTP email via Resend: {str(e)}")

import random
import string
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.extensions import db
from app.models.otp_verification import OtpVerification
from app.models.user import User

# Environment variables are loaded via Flask config (app.config)

def _load_smtp_config(app):
    return {
        "server":   app.config.get("SMTP_SERVER"),
        "port":     app.config.get("SMTP_PORT"),
        "email":    app.config.get("SMTP_EMAIL"),
        "password": app.config.get("SMTP_PASSWORD"),
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
    """Send OTP via SMTP.
    Relies on Flask app config for SMTP settings. Raises on failure.
    """
    from flask import current_app

    cfg = _load_smtp_config(current_app)
    missing = [k for k, v in cfg.items() if not v]
    if missing:
        raise RuntimeError(f"SMTP configuration is incomplete. Missing variables: {', '.join(missing).upper()}")

    subject = "SmartLearning Verification Code"
    body = f"""\
Hello,

Your verification code is:

{otp_code}

This code will expire in 5 minutes. If you did not request this login, please ignore this email.

SmartLearning Team
"""
    msg = MIMEMultipart()
    msg["From"] = cfg["email"]
    msg["To"] = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(cfg["server"], int(cfg["port"])) as server:
        server.starttls()
        server.login(cfg["email"], cfg["password"])
        server.send_message(msg)

    return True

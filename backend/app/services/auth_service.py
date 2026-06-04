from app.extensions import db, bcrypt
from app.models.user import User


def register_user(username, email, password, role="student", first_name=None, last_name=None):
    """Register a new user. Returns (user, error_message)."""
    if User.query.filter_by(email=email).first():
        return None, "Email is already registered"
    if User.query.filter_by(username=username).first():
        return None, "Username is already taken"

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(
        username=username,
        email=email,
        password_hash=password_hash,
        role=role,
        first_name=first_name,
        last_name=last_name,
    )
    db.session.add(user)
    db.session.commit()
    return user, None


def authenticate_user(email, password):
    """Verify credentials. Returns (user, error_message)."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"[DEBUG AUTH] Email received: {email}")
    
    user = User.query.filter_by(email=email).first()
    if not user:
        logger.info(f"[DEBUG AUTH] User found: False (Email not in DB)")
        return None, "Invalid email or password"
    
    logger.info(f"[DEBUG AUTH] User found: True (ID: {user.id})")
    
    is_match = bcrypt.check_password_hash(user.password_hash, password)
    logger.info(f"[DEBUG AUTH] Password match: {is_match}")
    logger.info(f"[DEBUG AUTH] DB Hash: {user.password_hash}")
    
    if not is_match:
        return None, "Invalid email or password"
        
    logger.info(f"[DEBUG AUTH] OTP verified/not verified: (email_verified={user.email_verified})")
    logger.info(f"[DEBUG AUTH] Account active/inactive: Active")

    return user, None


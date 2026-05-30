from datetime import datetime, timedelta
from app.extensions import db

class OtpVerification(db.Model):
    __tablename__ = "otp_verifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False, nullable=False)

    user = db.relationship("User", back_populates="otp_entries")

    def __repr__(self):
        return f"<OtpVerification user_id={self.user_id} otp={self.otp_code}>"

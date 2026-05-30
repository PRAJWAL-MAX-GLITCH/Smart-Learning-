import sys
sys.path.append('d:/project/SmartLearning/backend')
import os
import unittest
from datetime import datetime, timedelta

# Set up Flask app for testing
from app import create_app
from app.extensions import db
from app.services.otp_service import (
    generate_otp,
    save_otp,
    verify_otp,
    can_resend,
    invalidate_old_otps,
)
from app.models.user import User
from app.models.otp_verification import OtpVerification

class OtpServiceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use testing config
        cls.app = create_app('development')
        cls.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        cls.app.config['TESTING'] = True
        with cls.app.app_context():
            db.create_all()
            # Create a test user
            user = User(username='testuser', email='test@example.com', password_hash='hashed')
            db.session.add(user)
            db.session.commit()
            cls.user_id = user.id

    def setUp(self):
        # Ensure fresh state before each test
        with self.app.app_context():
            invalidate_old_otps(self.user_id)

    def test_otp_flow(self):
        with self.app.app_context():
            otp = generate_otp()
            save_otp(self.user_id, otp)

            # Cannot resend immediately
            self.assertFalse(can_resend(self.user_id))

            # Verify succeeds
            success, msg = verify_otp(self.user_id, otp)
            self.assertTrue(success)

            # Cannot reuse OTP
            success2, _ = verify_otp(self.user_id, otp)
            self.assertFalse(success2)

            # Fast‑forward time to allow resend
            entry = OtpVerification.query.filter_by(user_id=self.user_id).first()
            entry.created_at = datetime.utcnow() - timedelta(seconds=61)
            db.session.commit()
            self.assertTrue(can_resend(self.user_id))

if __name__ == '__main__':
    unittest.main()

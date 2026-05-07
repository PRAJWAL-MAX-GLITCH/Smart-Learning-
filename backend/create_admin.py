"""
Run this script ONCE to create an admin user in the database.
Usage: python create_admin.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User

app = create_app()

ADMIN_EMAIL    = "admin@smartlearning.com"
ADMIN_PASSWORD = "Admin@1234"
ADMIN_USERNAME = "admin"

with app.app_context():
    # Check if admin already exists
    existing = User.query.filter_by(email=ADMIN_EMAIL).first()
    if existing:
        print(f"⚠️  Admin already exists: {ADMIN_EMAIL}")
        print(f"   Role: {existing.role}")
        sys.exit(0)

    hashed_pw = bcrypt.generate_password_hash(ADMIN_PASSWORD).decode('utf-8')
    admin = User(
        username=ADMIN_USERNAME,
        email=ADMIN_EMAIL,
        password_hash=hashed_pw,
        role="admin",
        first_name="Super",
        last_name="Admin"
    )
    db.session.add(admin)
    db.session.commit()

    print("✅ Admin user created successfully!")
    print(f"   Email   : {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")
    print(f"\n👉 Login at: http://localhost:5173/admin/login")

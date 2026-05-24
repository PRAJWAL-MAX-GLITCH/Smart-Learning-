import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from app.models.user import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print("--- REGISTERED USERS ---")
    for u in users:
        print(f"ID: {u.id} | Username: {u.username} | Email: {u.email} | Role: {u.role}")

"""
Run this script to fix the database schema issue.
It will delete the old database and create a fresh one.
Usage: python fix_database.py
"""
import os
import sys

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Delete old database
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                       "instance", "smartlearning_v3.db")

if os.path.exists(db_path):
    os.remove(db_path)
    print(f"✅ Old database deleted: {db_path}")
else:
    print(f"ℹ️  No old database found at: {db_path}")

# Create fresh database with new schema
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db

app = create_app()
with app.app_context():
    db.create_all()
    print("✅ Fresh database created with all new columns (bio, streak, etc.)!")
    print("\n🎉 Done! Now run: python run.py")
    print("📝 Register a new account on the website to get started.")

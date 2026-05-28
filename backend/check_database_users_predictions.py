import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.services.student_level_service import StudentLevelService
from app.models.user import User

app = create_app()
with app.app_context():
    print("=" * 60)
    print("  SmartLearning User Database ML Level Predictions")
    print("=" * 60)
    
    users = User.query.all()
    if not users:
        print("No users found in database.")
    
    for u in users:
        features = StudentLevelService.calculate_features(u.id)
        level = StudentLevelService.get_student_level(u.id)
        print(f"\nUser: {u.username} (ID: {u.id}, Email: {u.email}, Role: {u.role})")
        print(f"  Calculated ML Features:")
        for key, val in features.items():
            print(f"    - {key}: {val}")
        print(f"  Predicted Level: \033[1;32m{level}\033[0m")
    
    print("\n" + "=" * 60)

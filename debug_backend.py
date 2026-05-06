import requests

# Test data similar to what frontend sends
data = {
    "course_id": 1,
    "question_text": "Debug Test Question",
    "option_a": "A",
    "option_b": "B",
    "option_c": "C",
    "option_d": "D",
    "correct_answer": "A",
    "difficulty": "medium",
    "explanation": "Test explanation"
}

# We need a token since it's admin_required
# assuming we can get a token or just test the service directly
# But I'll try to just call the API if I can find a token

print("Testing backend question creation...")
# For now, I'll just check if the model itself can be created to rule out DB issues
from app import create_app
from app.extensions import db
from app.models.question import Question

app = create_app()
with app.app_context():
    try:
        q = Question(
            course_id=1,
            question_text="Script Test",
            option_a="A",
            option_b="B",
            option_c="C",
            option_d="D",
            correct_answer="A",
            difficulty="easy",
            explanation="None"
        )
        db.session.add(q)
        db.session.commit()
        print("Success! Backend can create questions.")
    except Exception as e:
        print(f"Error: {e}")

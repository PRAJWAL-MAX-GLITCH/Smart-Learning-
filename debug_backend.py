import requests
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

print("Testing backend question creation...")
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

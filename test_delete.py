import sys
import os

# Add the backend dir to path
sys.path.insert(0, os.path.abspath('backend'))

from app import create_app
from app.extensions import db
from app.models.question import Question

app = create_app()

with app.app_context():
    question = Question.query.first()
    if question:
        print(f"Found question {question.id}. Attempting to delete...")
        try:
            db.session.delete(question)
            db.session.commit()
            print("Successfully deleted!")
        except Exception as e:
            print(f"Failed to delete: {e}")
    else:
        print("No questions found.")

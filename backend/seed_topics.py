from app import create_app
from app.extensions import db
from app.models.question import Question

app = create_app()
with app.app_context():
    # Update first 3 questions to 'Arrays'
    questions = Question.query.limit(10).all()
    topics = ["Arrays", "Trees", "Graphs", "Recursion", "Strings"]
    
    for i, q in enumerate(questions):
        q.topic = topics[i % len(topics)]
        print(f"Updated Question ID {q.id} to topic {q.topic}")
    
    db.session.commit()
    print("Successfully updated topics for test questions!")

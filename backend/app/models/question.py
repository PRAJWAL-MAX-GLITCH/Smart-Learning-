from app.extensions import db
from datetime import datetime


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(255), nullable=False)
    option_b = db.Column(db.String(255), nullable=False)
    option_c = db.Column(db.String(255), nullable=False)
    option_d = db.Column(db.String(255), nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)  # A | B | C | D
    difficulty = db.Column(db.String(20), default="medium")  # easy | medium | hard
    explanation = db.Column(db.Text, nullable=True)          # pedagogical feedback
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, include_answer=False):
        data = {
            "id": self.id,
            "course_id": self.course_id,
            "question_text": self.question_text,
            "options": {
                "A": self.option_a,
                "B": self.option_b,
                "C": self.option_c,
                "D": self.option_d,
            },
            "difficulty": self.difficulty,
            "explanation": self.explanation,
            "created_at": self.created_at.isoformat(),
        }
        if include_answer:
            data["correct_answer"] = self.correct_answer
        return data

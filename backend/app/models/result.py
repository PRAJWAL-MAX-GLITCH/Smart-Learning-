from app.extensions import db
from datetime import datetime


class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    score = db.Column(db.Float, nullable=False)          # percentage 0–100
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    feedback = db.Column(db.String(20))                 # Weak | Average | Strong
    time_taken = db.Column(db.Integer, nullable=True)     # in seconds
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    topic_performance = db.Column(db.Text, nullable=True) # JSON string of topic-wise performance

    def to_dict(self):
        import json
        try:
            topic_perf = json.loads(self.topic_performance) if self.topic_performance else {}
        except Exception:
            topic_perf = {}
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "score": self.score,
            "total_questions": self.total_questions,
            "correct_answers": self.correct_answers,
            "feedback": self.feedback,
            "time_taken": self.time_taken,
            "submitted_at": self.submitted_at.isoformat(),
            "topic_performance": topic_perf
        }

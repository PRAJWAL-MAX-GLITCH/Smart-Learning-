from app.extensions import db
from datetime import datetime

class UserTopicStats(db.Model):
    __tablename__ = "user_topic_stats"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    topic = db.Column(db.String(50), nullable=False)
    total_attempted = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'topic', name='_user_topic_uc'),)

    def to_dict(self):
        accuracy = round((self.correct_count / self.total_attempted * 100), 1) if self.total_attempted > 0 else 0
        level = "Weak"
        if accuracy > 75: level = "Strong"
        elif accuracy >= 50: level = "Improving"
        
        return {
            "topic": self.topic,
            "accuracy": accuracy,
            "level": level,
            "total_attempted": self.total_attempted,
            "correct_count": self.correct_count
        }

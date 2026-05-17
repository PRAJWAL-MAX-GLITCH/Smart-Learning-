from app.extensions import db
from datetime import datetime


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    youtube_url = db.Column(db.String(500), nullable=True)
    # New metadata fields
    duration = db.Column(db.String(50), nullable=True)           # e.g. "4.5 Hours"
    total_lessons = db.Column(db.Integer, nullable=True)         # e.g. 12
    difficulty_level = db.Column(db.String(30), nullable=True)   # Beginner/Intermediate/Advanced
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    questions = db.relationship("Question", backref="course", lazy=True, cascade="all, delete-orphan")
    results = db.relationship("Result", backref="course", lazy=True)
    lessons = db.relationship("Lesson", backref="course", lazy=True, order_by="Lesson.order_index", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "youtube_url": self.youtube_url,
            "duration": self.duration,
            "total_lessons": self.total_lessons,
            "difficulty_level": self.difficulty_level,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat(),
        }

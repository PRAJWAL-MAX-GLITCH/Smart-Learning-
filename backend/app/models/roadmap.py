from app.extensions import db
from datetime import datetime

class UserRoadmap(db.Model):
    __tablename__ = "user_roadmaps"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    roadmap_json = db.Column(db.Text, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = db.relationship("User", backref=db.backref("roadmap", uselist=False, lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "roadmap_json": self.roadmap_json,
            "generated_at": self.generated_at.isoformat()
        }

class RoadmapProgress(db.Model):
    __tablename__ = "roadmap_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    week = db.Column(db.Integer, nullable=False)
    task_key = db.Column(db.String(200), nullable=False)  # e.g., "week_1_recursion_basics"
    completed = db.Column(db.Boolean, default=False, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "week": self.week,
            "task_key": self.task_key,
            "completed": self.completed,
            "updated_at": self.updated_at.isoformat()
        }

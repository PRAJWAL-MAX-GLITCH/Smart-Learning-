from app.extensions import db
from datetime import datetime

class UserCourseProgress(db.Model):
    __tablename__ = 'user_course_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    last_watched_lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('course_progress', lazy=True))
    course = db.relationship('Course', backref=db.backref('user_progress', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "last_watched_lesson_id": self.last_watched_lesson_id,
            "updated_at": self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<UserCourseProgress User:{self.user_id} Course:{self.course_id} Completed:{self.completed}>'

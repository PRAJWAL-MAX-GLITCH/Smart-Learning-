from app.extensions import db
from datetime import datetime

class Lesson(db.Model):
    __tablename__ = 'lessons'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    youtube_url = db.Column(db.String(500), nullable=False)
    duration = db.Column(db.String(50)) 
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "description": self.description,
            "youtube_url": self.youtube_url,
            "duration": self.duration,
            "order_index": self.order_index
        }

class UserLessonProgress(db.Model):
    __tablename__ = 'user_lesson_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    watched_at = db.Column(db.DateTime, default=datetime.utcnow)

class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Certificate(db.Model):
    __tablename__ = 'certificates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    certificate_code = db.Column(db.String(100), unique=True)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    score = db.Column(db.Float)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50)) # info, success, warning
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

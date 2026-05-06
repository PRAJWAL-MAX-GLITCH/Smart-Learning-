from app.extensions import db
from datetime import datetime

class UserCourseProgress(db.Model):
    __tablename__ = 'user_course_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    user = db.relationship('User', backref=db.backref('course_progress', lazy=True))
    course = db.relationship('Course', backref=db.backref('user_progress', lazy=True))

    def __repr__(self):
        return f'<UserCourseProgress User:{self.user_id} Course:{self.course_id} Completed:{self.completed}>'

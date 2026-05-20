from app.extensions import db
from datetime import datetime

class CourseTranscript(db.Model):
    __tablename__ = "course_transcripts"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False, unique=True)
    transcript_text = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "transcript_text": self.transcript_text,
            "updated_at": self.updated_at.isoformat()
        }

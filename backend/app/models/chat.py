from app.extensions import db
from datetime import datetime

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "user" or "assistant"
    content = db.Column(db.Text, nullable=False)
    subject = db.Column(db.String(50), nullable=True)  # detected automatically or general
    level = db.Column(db.String(50), nullable=True)    # beginner/intermediate
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role": self.role,
            "content": self.content,
            "subject": self.subject,
            "level": self.level,
            "created_at": self.created_at.isoformat()
        }

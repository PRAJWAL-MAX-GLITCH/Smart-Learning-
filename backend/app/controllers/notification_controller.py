from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.models.premium_models import Notification
from app.extensions import db

class NotificationController:
    @staticmethod
    def get_user_notifications():
        user_id = get_jwt_identity()
        notifications = Notification.query.filter_by(user_id=user_id)\
            .order_by(Notification.created_at.desc()).limit(20).all()
        
        unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        
        return jsonify({
            "notifications": [n.to_dict() if hasattr(n, 'to_dict') else {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            } for n in notifications],
            "unread_count": unread_count
        }), 200

    @staticmethod
    def mark_as_read(notification_id):
        user_id = get_jwt_identity()
        notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        
        if not notification:
            return jsonify({"error": "Notification not found"}), 404
            
        notification.is_read = True
        db.session.commit()
        
        return jsonify({"message": "Marked as read"}), 200

    @staticmethod
    def mark_all_as_read():
        user_id = get_jwt_identity()
        Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
        db.session.commit()
        
        return jsonify({"message": "All notifications marked as read"}), 200

    @staticmethod
    def create_notification(user_id, title, message, n_type="info"):
        """Helper to create notifications from other parts of the app"""
        try:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=n_type
            )
            db.session.add(notification)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Failed to create notification: {e}")
            db.session.rollback()
            return False

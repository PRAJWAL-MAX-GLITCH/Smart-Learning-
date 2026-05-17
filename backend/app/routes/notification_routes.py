from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.notification_controller import NotificationController

notification_bp = Blueprint("notifications", __name__)

@notification_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    return NotificationController.get_user_notifications()

@notification_bp.route("/<int:notification_id>/read", methods=["POST"])
@jwt_required()
def mark_read(notification_id):
    return NotificationController.mark_as_read(notification_id)

@notification_bp.route("/read-all", methods=["POST"])
@jwt_required()
def mark_all_read():
    return NotificationController.mark_all_as_read()

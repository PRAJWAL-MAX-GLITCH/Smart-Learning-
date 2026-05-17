from flask import Blueprint, jsonify
from app.models.user import User
from app.models.course import Course
from app.models.result import Result
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/logs", methods=["GET"])
@admin_required
def list_logs():
    from app.controllers.admin_controller import AdminController
    return AdminController.get_all_logs()

@admin_bp.route("/settings", methods=["GET"])
@admin_required
def get_sys_settings():
    from app.controllers.settings_controller import AdminSettingsController
    return AdminSettingsController.get_all_settings()

@admin_bp.route("/settings", methods=["POST"])
@admin_required
def update_sys_settings():
    from app.controllers.settings_controller import AdminSettingsController
    return AdminSettingsController.update_settings()

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_platform_stats():
    from app.controllers.analytics_controller import AnalyticsController
    return AnalyticsController.get_admin_stats()

@admin_bp.route("/students", methods=["GET"])
@admin_required
def get_students():
    students = User.query.filter_by(role='student').all()
    return jsonify([{
        "id": s.id,
        "username": s.username,
        "email": getattr(s, 'email', 'N/A'),
        "created_at": s.created_at.isoformat() if hasattr(s, 'created_at') else None
    } for s in students]), 200

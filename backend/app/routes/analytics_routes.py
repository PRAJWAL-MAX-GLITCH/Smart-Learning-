from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.analytics_controller import AnalyticsController

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    return AnalyticsController.get_student_dashboard_stats()

@analytics_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    return AnalyticsController.get_learning_recommendations()

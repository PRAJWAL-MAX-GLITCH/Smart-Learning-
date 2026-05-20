from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.ai_controller import AIController

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/weak-topics", methods=["GET"])
@jwt_required()
def get_weak_topics():
    return AIController.get_weak_topics()

@ai_bp.route("/generate-quiz", methods=["POST"])
@jwt_required()
def generate_quiz():
    return AIController.generate_quiz()

@ai_bp.route("/quiz/<int:course_id>", methods=["GET"])
@jwt_required()
def get_ai_quiz(course_id):
    return AIController.get_ai_quiz(course_id)

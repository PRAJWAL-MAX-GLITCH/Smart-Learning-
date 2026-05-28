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

@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    return AIController.chat()

@ai_bp.route("/chat/history", methods=["GET"])
@jwt_required()
def get_chat_history():
    return AIController.get_chat_history()

@ai_bp.route("/chat/clear", methods=["POST"])
@jwt_required()
def clear_chat():
    return AIController.clear_chat()


@ai_bp.route("/roadmap/<int:user_id>", methods=["GET"])
@jwt_required()
def get_roadmap(user_id):
    return AIController.get_roadmap(user_id)

@ai_bp.route("/roadmap/task", methods=["POST"])
@jwt_required()
def update_task_status():
    return AIController.update_task_status()

@ai_bp.route("/roadmap/regenerate", methods=["POST"])
@jwt_required()
def regenerate_roadmap():
    return AIController.regenerate_roadmap()

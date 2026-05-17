from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.ai_controller import AIController

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/weak-topics", methods=["GET"])
@jwt_required()
def get_weak_topics():
    return AIController.get_weak_topics()

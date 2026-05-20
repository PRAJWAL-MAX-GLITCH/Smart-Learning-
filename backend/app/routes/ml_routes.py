from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.ml_controller import MLController

ml_bp = Blueprint("ml", __name__)

@ml_bp.route("/predict/<int:user_id>", methods=["GET"])
@jwt_required()
def get_prediction(user_id):
    return MLController.get_prediction(user_id)

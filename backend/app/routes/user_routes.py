from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.user_controller import UserController

users_bp = Blueprint("users", __name__)


@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile_get():
    return UserController.get_profile()


@users_bp.route("/profile", methods=["PUT"])
@jwt_required()
def profile_update():
    return UserController.update_profile()


@users_bp.route("/progress", methods=["GET"])
@jwt_required()
def learning_progress():
    return UserController.get_learning_progress()

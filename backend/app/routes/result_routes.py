from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.result_controller import ResultController
from app.utils.decorators import admin_required

results_bp = Blueprint("results", __name__)


@results_bp.route("/my", methods=["GET"])
@jwt_required()
def my_results():
    return ResultController.get_my_results()


@results_bp.route("/<int:result_id>", methods=["GET"])
@jwt_required()
def view_result(result_id):
    return ResultController.get_result(result_id)


@results_bp.route("/all", methods=["GET"])
@admin_required
def list_all_results():
    return ResultController.get_all_results()

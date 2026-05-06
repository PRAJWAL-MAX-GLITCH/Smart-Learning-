from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.progress_controller import ProgressController

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_progress(course_id):
    return ProgressController.get_progress(course_id)

@progress_bp.route('/complete', methods=['POST'])
@jwt_required()
def mark_completed():
    return ProgressController.mark_completed()

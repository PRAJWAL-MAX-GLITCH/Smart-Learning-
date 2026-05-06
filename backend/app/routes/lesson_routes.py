from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.lesson_controller import LessonController
from app.utils.decorators import admin_required

lesson_bp = Blueprint('lessons', __name__)

@lesson_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def add_lesson():
    return LessonController.add_lesson()

@lesson_bp.route('/<int:lesson_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_lesson(lesson_id):
    return LessonController.update_lesson(lesson_id)

@lesson_bp.route('/<int:lesson_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_lesson(lesson_id):
    return LessonController.delete_lesson(lesson_id)

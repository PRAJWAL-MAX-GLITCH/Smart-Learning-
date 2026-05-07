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

@lesson_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required()
def get_lessons(course_id):
    return LessonController.get_lessons_by_course(course_id)

@lesson_bp.route('/progress', methods=['POST'])
@jwt_required()
def track_progress():
    return LessonController.track_progress()

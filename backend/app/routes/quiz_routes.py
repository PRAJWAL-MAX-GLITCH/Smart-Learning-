from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.quiz_controller import QuizController
from app.utils.decorators import admin_required

quizzes_bp = Blueprint("quizzes", __name__)


@quizzes_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_quiz(course_id):
    return QuizController.get_quiz(course_id)


@quizzes_bp.route("/course/<int:course_id>/submit", methods=["POST"])
@jwt_required()
def submit_quiz(course_id):
    return QuizController.submit_quiz(course_id)


@quizzes_bp.route("/questions", methods=["POST"])
@admin_required
def add_question():
    return QuizController.add_question()


@quizzes_bp.route("/bulk", methods=["POST"])
@admin_required
def add_questions_bulk():
    return QuizController.add_questions_bulk()


@quizzes_bp.route("/questions/<int:question_id>", methods=["PUT"])
@admin_required
def update_question(question_id):
    return QuizController.update_question(question_id)


@quizzes_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@admin_required
def delete_question(question_id):
    return QuizController.delete_question(question_id)

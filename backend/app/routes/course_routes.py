from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.course_controller import CourseController
from app.utils.decorators import admin_required

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("/", methods=["GET"])
@jwt_required()
def list_courses():
    return CourseController.get_all_courses()


@courses_bp.route("/<int:course_id>", methods=["GET"])
@jwt_required()
def view_course(course_id):
    return CourseController.get_course(course_id)


@courses_bp.route("/", methods=["POST"])
@admin_required
def add_course():
    return CourseController.create_course()


@courses_bp.route("/<int:course_id>", methods=["PUT"])
@admin_required
def modify_course(course_id):
    return CourseController.update_course(course_id)


@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@admin_required
def remove_course(course_id):
    return CourseController.delete_course(course_id)

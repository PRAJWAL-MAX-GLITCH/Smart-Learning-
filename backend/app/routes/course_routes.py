from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.course_controller import CourseController
from app.utils.decorators import admin_required

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("/", methods=["GET"])
def list_courses():
    return CourseController.get_all_courses()


@courses_bp.route("/<int:course_id>", methods=["GET"])
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
@courses_bp.route("/<int:course_id>/seed-lessons", methods=["GET"])
def seed_lessons(course_id):
    from app.models.premium_models import Lesson
    from app.extensions import db
    
    # Delete existing lessons for this course to start fresh
    Lesson.query.filter_by(course_id=course_id).delete()
    db.session.commit()
        
    lessons = [
        {"title": "Lesson 1: Getting Started", "url": "https://www.youtube.com/watch?v=kUMe1FH4CHE"},
        {"title": "Lesson 2: Core Concepts", "url": "https://www.youtube.com/watch?v=MDLn5-zSQQI"},
        {"title": "Lesson 3: Summary", "url": "https://www.youtube.com/watch?v=fNcJuPIZ2WE"}
    ]
    
    for i, l in enumerate(lessons):
        new_l = Lesson(
            course_id=course_id,
            title=l["title"],
            youtube_url=l["url"],
            description=f"Automated test lesson {i+1}",
            order_index=i
        )
        db.session.add(new_l)
    
    db.session.commit()
    return jsonify({"message": "Successfully RE-SEEDED 3 test lessons!"}), 201

from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.services.course_service import CourseService
from app.schemas.schemas import CourseSchema
from marshmallow import ValidationError

course_schema = CourseSchema()
courses_schema = CourseSchema(many=True)


class CourseController:
    @staticmethod
    def get_all_courses():
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        
        result = CourseService.get_paginated_courses(page, per_page)
        
        # Serialize using Marshmallow
        result["items"] = courses_schema.dump(result["items"])
        return jsonify(result), 200

    @staticmethod
    def get_course(course_id):
        course = CourseService.get_course_by_id(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        # Serialize course basic info
        data = course_schema.dump(course)
        
        # Explicitly fetch lessons and convert to dict manually
        from app.models.premium_models import Lesson
        lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.order_index.asc()).all()
        
        data['lessons'] = [l.to_dict() for l in lessons]
        print(f"BULLETPROOF DEBUG: Attached {len(data['lessons'])} lessons to course {course_id}")
            
        return jsonify(data), 200

    @staticmethod
    def create_course():
        user_id = get_jwt_identity()
        try:
            data = course_schema.load(request.get_json())
        except ValidationError as err:
            return jsonify({"error": "Validation failed", "messages": err.messages}), 400

        try:
            course = CourseService.create_course(data, user_id)
            return jsonify({
                "message": "Course created successfully",
                "course": course_schema.dump(course)
            }), 201
        except Exception as e:
            print(f"ERROR creating course: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

    @staticmethod
    def update_course(course_id):
        course = CourseService.get_course_by_id(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        try:
            # partial=True allows omitting required fields for updates
            data = course_schema.load(request.get_json(), partial=True)
        except ValidationError as err:
            return jsonify({"error": "Validation failed", "messages": err.messages}), 400

        updated_course = CourseService.update_course(course, data)
        return jsonify({
            "message": "Course updated successfully",
            "course": course_schema.dump(updated_course)
        }), 200

    @staticmethod
    def delete_course(course_id):
        course = CourseService.get_course_by_id(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        CourseService.delete_course(course)
        return jsonify({"message": "Course deleted successfully"}), 200

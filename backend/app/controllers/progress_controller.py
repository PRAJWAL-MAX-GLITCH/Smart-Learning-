from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.progress import UserCourseProgress
from datetime import datetime

class ProgressController:
    @staticmethod
    def get_progress(course_id):
        user_id = get_jwt_identity()
        progress = UserCourseProgress.query.filter_by(
            user_id=user_id, 
            course_id=course_id
        ).first()

        return jsonify({
            "completed": progress.completed if progress else False,
            "completed_at": progress.completed_at if progress else None
        }), 200

    @staticmethod
    def mark_completed():
        user_id = get_jwt_identity()
        data = request.get_json()
        course_id = data.get("course_id")

        if not course_id:
            return jsonify({"error": "Course ID required"}), 400

        progress = UserCourseProgress.query.filter_by(
            user_id=user_id, 
            course_id=course_id
        ).first()

        if not progress:
            progress = UserCourseProgress(user_id=user_id, course_id=course_id)
            db.session.add(progress)

        progress.completed = True
        progress.completed_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Course marked as completed",
            "completed": True
        }), 200

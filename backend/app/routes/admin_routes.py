from flask import Blueprint, jsonify
from app.models.user import User
from app.models.course import Course
from app.models.result import Result
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_platform_stats():
    total_students = User.query.filter_by(role='student').count()
    total_admins = User.query.filter_by(role='admin').count()
    total_courses = Course.query.count()
    total_results = Result.query.count()
    
    # Calculate average score across platform
    results = Result.query.all()
    avg_score = 0
    if results:
        avg_score = sum(r.score for r in results) / len(results)

    return jsonify({
        "total_students": total_students,
        "total_admins": total_admins,
        "total_courses": total_courses,
        "total_results": total_results,
        "avg_platform_score": round(avg_score, 1)
    }), 200

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.premium_models import Certificate, Lesson, UserLessonProgress
from app.models.progress import UserCourseProgress
from app.models.course import Course
from app.models.user import User
from app.models.result import Result
import uuid
from datetime import datetime

certificate_bp = Blueprint('certificates', __name__)

class CertificateController:
    @staticmethod
    @jwt_required()
    def issue_certificate(course_id):
        user_id = get_jwt_identity()
        
        # Check if already issued
        existing = Certificate.query.filter_by(user_id=user_id, course_id=course_id).first()
        if existing:
            return jsonify(existing.to_dict()), 200

        # Verify completion (all lessons done)
        total_lessons = Lesson.query.filter_by(course_id=course_id).count()
        if total_lessons == 0:
            return jsonify({"error": "Course has no content yet."}), 400

        completed_lessons = UserLessonProgress.query.filter_by(
            user_id=user_id, course_id=course_id, completed=True
        ).count()

        if completed_lessons < total_lessons:
            return jsonify({"error": "You must watch all video lessons first."}), 400

        # Get best quiz score - Must have taken at least one quiz
        best_result = Result.query.filter_by(user_id=user_id, course_id=course_id).order_by(Result.score.desc()).first()
        if not best_result:
            return jsonify({"error": "You must pass a quiz before getting your certificate."}), 400
        
        # Optional: enforce passing score
        if best_result.score < 50:
            return jsonify({"error": f"Your highest score is {best_result.score}%. You need at least 50% to pass."}), 400

        score = best_result.score

        # Issue new certificate
        cert_id = str(uuid.uuid4())[:18].upper()
        new_cert = Certificate(
            user_id=user_id,
            course_id=course_id,
            certificate_code=cert_id,
            issued_at=datetime.utcnow(),
            score=score
        )
        db.session.add(new_cert)
        db.session.commit()

        return jsonify(new_cert.to_dict()), 201

    @staticmethod
    def verify_certificate(cert_code):
        cert = Certificate.query.filter_by(certificate_code=cert_code).first()
        if not cert:
            return jsonify({"error": "Invalid Certificate ID"}), 404

        user = User.query.get(cert.user_id)
        course = Course.query.get(cert.course_id)
        
        # Calculate extra stats for verification page
        total_lessons = Lesson.query.filter_by(course_id=course.id).count()
        
        return jsonify({
            "valid": True,
            "certificate_id": cert.certificate_code,
            "student_name": f"{user.first_name} {user.last_name}" if user.first_name else user.username,
            "course_name": course.title,
            "score": cert.score,
            "issued_at": cert.issued_at.isoformat(),
            "duration": course.duration,
            "total_lessons": total_lessons,
            "verification_status": "Verified by SmartLearning"
        }), 200

# Routes
@certificate_bp.route('/issue/<int:course_id>', methods=['POST'])
@jwt_required()
def issue_cert(course_id):
    return CertificateController.issue_certificate(course_id)

@certificate_bp.route('/verify/<string:cert_code>', methods=['GET'])
def verify_cert(cert_code):
    return CertificateController.verify_certificate(cert_code)

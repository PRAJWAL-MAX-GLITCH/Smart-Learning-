from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.progress import UserCourseProgress
from datetime import datetime

class ProgressController:
    @staticmethod
    def get_progress(course_id):
        from app.models.premium_models import UserLessonProgress
        user_id = get_jwt_identity()
        
        # Course level progress - auto initialize if not found
        progress = UserCourseProgress.query.filter_by(
            user_id=user_id, 
            course_id=course_id
        ).first()

        if not progress:
            try:
                progress = UserCourseProgress(
                    user_id=user_id, 
                    course_id=course_id,
                    updated_at=datetime.utcnow()
                )
                db.session.add(progress)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Progress auto-init failed: {e}")
            else:
                # [NOTIFICATION] Course Started
                from app.controllers.notification_controller import NotificationController
                from app.models.course import Course
                c_data = Course.query.get(course_id)
                NotificationController.create_notification(
                    user_id, 
                    "Course Started!", 
                    f"You have enrolled in {c_data.title if c_data else 'a new course'}. Happy learning!",
                    "info"
                )
                # We continue anyway to not block the user

        # Detailed lesson progress
        lesson_progress = UserLessonProgress.query.filter_by(
            user_id=user_id,
            course_id=course_id,
            completed=True
        ).all()
        
        completed_lesson_ids = [lp.lesson_id for lp in lesson_progress]

        return jsonify({
            "completed": progress.completed if progress else False,
            "completed_at": progress.completed_at if progress else None,
            "completed_lesson_ids": completed_lesson_ids
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

    @staticmethod
    def track_progress():
        from app.models.premium_models import UserLessonProgress, Lesson
        user_id = get_jwt_identity()
        data = request.get_json()
        course_id = data.get("course_id")
        lesson_id = data.get("lesson_id")

        if not course_id or not lesson_id:
            return jsonify({"error": "Course ID and Lesson ID required"}), 400

        # Mark individual lesson as completed
        lp = UserLessonProgress.query.filter_by(
            user_id=user_id,
            course_id=course_id,
            lesson_id=lesson_id
        ).first()

        if not lp:
            lp = UserLessonProgress(
                user_id=user_id,
                course_id=course_id,
                lesson_id=lesson_id,
                completed=True,
                watched_at=datetime.utcnow()
            )
            db.session.add(lp)
            
            # [NOTIFICATION] Lesson Completed
            from app.controllers.notification_controller import NotificationController
            lesson = Lesson.query.get(lesson_id)
            course = Lesson.query.get(lesson_id).course if lesson else None
            NotificationController.create_notification(
                user_id, 
                "Lesson Completed!", 
                f"You finished: {lesson.title if lesson else 'A lesson'}",
                "success"
            )
        else:
            lp.completed = True
            lp.watched_at = datetime.utcnow()

        # Update main course progress record
        cp = UserCourseProgress.query.filter_by(user_id=user_id, course_id=course_id).first()
        if not cp:
            cp = UserCourseProgress(user_id=user_id, course_id=course_id)
            db.session.add(cp)
        
        cp.last_watched_lesson_id = lesson_id
        cp.updated_at = datetime.utcnow()

        # Check if all lessons in course are completed
        total_lessons = Lesson.query.filter_by(course_id=course_id).count()
        completed_count = UserLessonProgress.query.filter_by(
            user_id=user_id,
            course_id=course_id,
            completed=True
        ).count()

        is_fully_completed = False
        if completed_count >= total_lessons and total_lessons > 0:
            if not cp.completed:
                cp.completed = True
                cp.completed_at = datetime.utcnow()
                is_fully_completed = True
                
                # [NOTIFICATION] Course Completed
                from app.models.course import Course
                c_data = Course.query.get(course_id)
                NotificationController.create_notification(
                    user_id, 
                    "Course Finished! 🎉", 
                    f"Congratulations! You completed {c_data.title if c_data else 'the course'}.",
                    "success"
                )

        db.session.commit()

        return jsonify({
            "message": "Progress tracked successfully",
            "fully_completed": is_fully_completed
        }), 200

from flask import request, jsonify
from app.extensions import db
from app.models.premium_models import Lesson
from app.utils.decorators import admin_required

class LessonController:
    @staticmethod
    def add_lesson():
        data = request.get_json()
        new_lesson = Lesson(
            course_id=data['course_id'],
            title=data['title'],
            description=data.get('description', ''),
            youtube_url=data['youtube_url'],
            duration=data.get('duration', 0),
            order_index=data.get('order_index', 0)
        )
        db.session.add(new_lesson)
        db.session.commit()
        return jsonify({"message": "Lesson added successfully"}), 201

    @staticmethod
    def update_lesson(lesson_id):
        data = request.get_json()
        lesson = Lesson.query.get_or_404(lesson_id)
        
        lesson.title = data.get('title', lesson.title)
        lesson.description = data.get('description', lesson.description)
        lesson.youtube_url = data.get('youtube_url', lesson.youtube_url)
        lesson.duration = data.get('duration', lesson.duration)
        lesson.order_index = data.get('order_index', lesson.order_index)
        
        db.session.commit()
        return jsonify({"message": "Lesson updated successfully"}), 200

    @staticmethod
    def delete_lesson(lesson_id):
        lesson = Lesson.query.get_or_404(lesson_id)
        db.session.delete(lesson)
        db.session.commit()
        return jsonify({"message": "Lesson deleted successfully"}), 200

    @staticmethod
    def get_lessons_by_course(course_id):
        lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.order_index.asc()).all()
        return jsonify([l.to_dict() for l in lessons]), 200

    @staticmethod
    def track_progress():
        from flask_jwt_extended import get_jwt_identity
        from app.models.premium_models import UserLessonProgress
        
        data = request.get_json()
        user_id = get_jwt_identity()
        lesson_id = data['lesson_id']
        course_id = data['course_id']
        
        progress = UserLessonProgress.query.filter_by(
            user_id=user_id, 
            lesson_id=lesson_id
        ).first()
        
        if not progress:
            progress = UserLessonProgress(
                user_id=user_id, 
                lesson_id=lesson_id,
                course_id=course_id,
                completed=True
            )
            db.session.add(progress)
        else:
            progress.completed = True
            
        db.session.commit()
        return jsonify({"message": "Progress tracked"}), 200

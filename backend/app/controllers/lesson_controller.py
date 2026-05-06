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

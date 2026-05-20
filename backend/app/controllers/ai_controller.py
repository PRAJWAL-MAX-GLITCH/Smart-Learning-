from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.services.ai_service import AIService
from app.models.question import Question
from app.models.course import Course
from app.extensions import db
import logging

logger = logging.getLogger(__name__)

class AIController:
    @staticmethod
    def get_weak_topics():
        from app.models.user_topic_stats import UserTopicStats
        user_id = get_jwt_identity()
        stats = UserTopicStats.query.filter_by(user_id=user_id).all()
        ai_insights = [s.to_dict() for s in stats]
        level_order = {"Weak": 0, "Improving": 1, "Strong": 2}
        ai_insights.sort(key=lambda x: level_order.get(x['level'], 1))
        return jsonify(ai_insights), 200

    @staticmethod
    def generate_quiz():
        data = request.get_json()
        if not data or "course_id" not in data:
            return jsonify({"error": "course_id is required"}), 400

        course_id = data["course_id"]
        
        # Verify course exists
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        # 1. Get Transcript
        transcript_text = AIService.get_or_extract_transcript(course_id, course.youtube_url)
        
        if not transcript_text:
            return jsonify({"error": "Could not extract or fallback transcript"}), 500

        # 2. Generate Quiz
        questions_data, error = AIService.generate_quiz(transcript_text, course_id)
        
        if error:
            return jsonify({"error": error}), 500

        if not questions_data:
            return jsonify({"error": "No valid questions were generated."}), 500

        # 3. Save Questions (Without deleting old ones)
        try:
            saved_questions = []
            for q_data in questions_data:
                new_q = Question(
                    course_id=course_id,
                    question_text=q_data["question"],
                    option_a=q_data["option_a"],
                    option_b=q_data["option_b"],
                    option_c=q_data["option_c"],
                    option_d=q_data["option_d"],
                    correct_answer=q_data["correct_answer"],
                    difficulty=q_data["difficulty"],
                    explanation=q_data["explanation"],
                    is_ai_generated=True,
                    topic=course.category  # Assign course category as topic
                )
                db.session.add(new_q)
                saved_questions.append(new_q)
            
            db.session.commit()
            
            return jsonify({
                "message": "AI Quiz generated and saved successfully",
                "questions": [q.to_dict(include_answer=True) for q in saved_questions]
            }), 201

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to save AI generated questions: {e}")
            return jsonify({"error": "Failed to save questions to database"}), 500

    @staticmethod
    def get_ai_quiz(course_id):
        """
        Fetches the latest 20 AI generated questions for a given course.
        We don't delete old questions, so we just get the newest 20.
        """
        questions = Question.query.filter_by(
            course_id=course_id, 
            is_ai_generated=True
        ).order_by(Question.created_at.desc()).limit(20).all()

        if not questions:
            return jsonify({"error": "No AI quiz found for this course. Please generate one first."}), 404

        return jsonify({
            "questions": [q.to_dict(include_answer=False) for q in questions]
        }), 200

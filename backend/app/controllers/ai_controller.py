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
        transcript_text = AIService.get_or_extract_transcript(course, course.youtube_url)
        
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

    @staticmethod
    def chat():
        user_id = get_jwt_identity()
        data = request.get_json()
        if not data or "message" not in data or not data["message"].strip():
            return jsonify({"error": "message is required"}), 400

        message = data["message"].strip()
        reply, error = AIService.get_chat_response(user_id, message)
        
        if error:
            return jsonify({"error": error}), 500
            
        return jsonify({"reply": reply}), 200

    @staticmethod
    def get_chat_history():
        from app.models.chat import ChatMessage
        user_id = get_jwt_identity()
        try:
            # Retrieve history ordered chronologically
            messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).all()
            return jsonify({
                "history": [msg.to_dict() for msg in messages]
            }), 200
        except Exception as e:
            logger.error(f"Failed to fetch chat history for user {user_id}: {e}")
            return jsonify({"error": "Failed to load chat history"}), 500

    @staticmethod
    def clear_chat():
        from app.models.chat import ChatMessage
        user_id = get_jwt_identity()
        try:
            ChatMessage.query.filter_by(user_id=user_id).delete()
            db.session.commit()
            return jsonify({"message": "Chat history cleared"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to clear chat history for user {user_id}: {e}")
            return jsonify({"error": "Failed to clear chat history"}), 500

    @staticmethod
    def get_roadmap(user_id):
        from app.services.roadmap_service import RoadmapService
        from app.models.user import User
        
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        try:
            data = RoadmapService.generate_roadmap(user_id)
            return jsonify(data), 200
        except Exception as e:
            logger.error(f"Failed to get study roadmap for user {user_id}: {e}")
            return jsonify({"error": "Failed to load study roadmap"}), 500

    @staticmethod
    def update_task_status():
        from app.services.roadmap_service import RoadmapService
        user_id = get_jwt_identity()
        
        data = request.get_json()
        if not data or "task_key" not in data or "completed" not in data:
            return jsonify({"error": "task_key and completed status are required"}), 400
            
        task_key = data["task_key"]
        completed = bool(data["completed"])
        
        try:
            success = RoadmapService.toggle_task(user_id, task_key, completed)
            if success:
                return jsonify({"message": "Task status updated successfully"}), 200
            else:
                return jsonify({"error": "Failed to update task status"}), 500
        except Exception as e:
            logger.error(f"Failed to update task {task_key} for user {user_id}: {e}")
            return jsonify({"error": "Failed to update task status"}), 500

    @staticmethod
    def regenerate_roadmap():
        from app.services.roadmap_service import RoadmapService
        from app.models.roadmap import UserRoadmap
        from datetime import datetime, timedelta
        
        user_id = get_jwt_identity()
        
        # Cooldown check: 24 hour limit
        cached = UserRoadmap.query.filter_by(user_id=user_id).first()
        if cached:
            cooldown_limit = datetime.utcnow() - timedelta(hours=24)
            if cached.generated_at > cooldown_limit:
                time_elapsed = datetime.utcnow() - cached.generated_at
                hours_remaining = max(1, 24 - int(time_elapsed.total_seconds() / 3600))
                return jsonify({
                    "error": "Cooldown active",
                    "message": f"You can only regenerate your roadmap once every 24 hours. Please wait {hours_remaining} more hours."
                }), 400
                
        try:
            data = RoadmapService.generate_roadmap(user_id, force_regenerate=True)
            return jsonify(data), 200
        except Exception as e:
            logger.error(f"Failed to regenerate study roadmap for user {user_id}: {e}")
            return jsonify({"error": "Failed to regenerate study roadmap"}), 500



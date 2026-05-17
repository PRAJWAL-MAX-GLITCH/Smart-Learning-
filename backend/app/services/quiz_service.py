from app.extensions import db
from app.models.question import Question
from app.models.result import Result
from app.services.feedback_service import generate_feedback
import logging

logger = logging.getLogger(__name__)


class QuizService:
    @staticmethod
    def get_questions_by_course(course_id):
        return Question.query.filter_by(course_id=course_id).all()

    @staticmethod
    def calculate_score(course_id, user_answers):
        """
        user_answers: dict { question_id: answer }
        """
        question_ids = [int(qid) for qid in user_answers.keys()]
        questions = Question.query.filter(
            Question.id.in_(question_ids),
            Question.course_id == course_id
        ).all()

        if not questions:
            return None, "No valid questions found"

        correct_count = 0
        topic_performance = {} # Track correct/total per topic in this quiz
        
        for q in questions:
            is_correct = user_answers.get(str(q.id), "").upper() == q.correct_answer.upper()
            
            # Initialize topic in performance tracker
            if q.topic not in topic_performance:
                topic_performance[q.topic] = {"correct": 0, "total": 0}
            
            topic_performance[q.topic]["total"] += 1
            if is_correct:
                correct_count += 1
                topic_performance[q.topic]["correct"] += 1

        total = len(questions)
        score_pct = round((correct_count / total) * 100, 2)
        return {
            "score": score_pct,
            "correct": correct_count,
            "total": total,
            "topic_performance": topic_performance
        }, None

    @staticmethod
    def save_quiz_result(user_id, course_id, evaluation, time_taken=None):
        score = evaluation["score"]
        feedback = generate_feedback(score)

        import json
        result = Result(
            user_id=user_id,
            course_id=course_id,
            score=score,
            total_questions=evaluation["total"],
            correct_answers=evaluation["correct"],
            feedback=feedback,
            time_taken=time_taken,
            topic_performance=json.dumps(evaluation.get("topic_performance", {}))
        )

        db.session.add(result)
        
        # --- Update Topic Stats ---
        from app.models.user_topic_stats import UserTopicStats
        topic_perf = evaluation.get("topic_performance", {})
        for topic, stats in topic_perf.items():
            topic_record = UserTopicStats.query.filter_by(user_id=user_id, topic=topic).first()
            if not topic_record:
                topic_record = UserTopicStats(
                    user_id=user_id,
                    topic=topic,
                    total_attempted=0,
                    correct_count=0
                )
                db.session.add(topic_record)
            
            if topic_record.total_attempted is None:
                topic_record.total_attempted = 0
            if topic_record.correct_count is None:
                topic_record.correct_count = 0

            topic_record.total_attempted += stats["total"]
            topic_record.correct_count += stats["correct"]

        db.session.commit()
        logger.info(f"Result and Topic Stats saved for user {user_id} on course {course_id}: {score}%")
        return result

    @staticmethod
    def create_question(data):
        question = Question(
            course_id=data["course_id"],
            question_text=data["question_text"],
            option_a=data["option_a"],
            option_b=data["option_b"],
            option_c=data["option_c"],
            option_d=data["option_d"],
            correct_answer=data["correct_answer"].upper(),
            difficulty=data.get("difficulty", "medium"),
            topic=data.get("topic", "General"),
            explanation=data.get("explanation")
        )
        db.session.add(question)
        db.session.commit()
        return question

    @staticmethod
    def update_question(question_id, data):
        question = Question.query.get(question_id)
        if not question:
            return None
        
        for key, value in data.items():
            if hasattr(question, key):
                setattr(question, key, value)
        
        db.session.commit()
        return question

    @staticmethod
    def delete_question(question_id):
        question = Question.query.get(question_id)
        if question:
            db.session.delete(question)
            db.session.commit()
            return True
        return False

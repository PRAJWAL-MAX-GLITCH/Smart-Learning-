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
        for q in questions:
            if user_answers.get(str(q.id), "").upper() == q.correct_answer.upper():
                correct_count += 1

        total = len(questions)
        score_pct = round((correct_count / total) * 100, 2)
        return {
            "score": score_pct,
            "correct": correct_count,
            "total": total
        }, None

    @staticmethod
    def save_quiz_result(user_id, course_id, evaluation, time_taken=None):
        score = evaluation["score"]
        feedback = generate_feedback(score)

        result = Result(
            user_id=user_id,
            course_id=course_id,
            score=score,
            total_questions=evaluation["total"],
            correct_answers=evaluation["correct"],
            feedback=feedback,
            time_taken=time_taken
        )

        db.session.add(result)
        db.session.commit()
        logger.info(f"Result saved for user {user_id} on course {course_id}: {score}%")
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

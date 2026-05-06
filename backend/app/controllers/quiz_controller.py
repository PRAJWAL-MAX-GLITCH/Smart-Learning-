from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.services.quiz_service import QuizService
from app.models.course import Course
from app.schemas.schemas import QuestionSchema, ResultSchema
from marshmallow import ValidationError

question_schema = QuestionSchema()
questions_schema = QuestionSchema(many=True)
result_schema = ResultSchema()


class QuizController:
    @staticmethod
    def get_quiz(course_id):
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        questions = QuizService.get_questions_by_course(course_id)
        return jsonify({
            "course_title": course.title,
            "questions": questions_schema.dump(questions)
        }), 200

    @staticmethod
    def submit_quiz(course_id):
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or "answers" not in data:
            return jsonify({"error": "Missing answers"}), 400

        evaluation, error = QuizService.calculate_score(course_id, data["answers"])
        if error:
            return jsonify({"error": error}), 400

        time_taken = data.get("time_taken")
        result = QuizService.save_quiz_result(user_id, course_id, evaluation, time_taken)
        return jsonify({
            "message": "Quiz submitted",
            "result": result_schema.dump(result)
        }), 201

    @staticmethod
    def add_question():
        print(f"DEBUG: Incoming add question request: {request.get_json()}")
        try:
            data = question_schema.load(request.get_json())
        except ValidationError as err:
            return jsonify({"error": "Validation failed", "messages": err.messages}), 400

        question = QuizService.create_question(data)
        return jsonify({
            "message": "Question added", 
            "question": question_schema.dump(question)
        }), 201

    @staticmethod
    def update_question(question_id):
        try:
            data = question_schema.load(request.get_json(), partial=True)
        except ValidationError as err:
            return jsonify({"error": "Validation failed", "messages": err.messages}), 400

        question = QuizService.update_question(question_id, data)
        if not question:
            return jsonify({"error": "Question not found"}), 404
            
        return jsonify({
            "message": "Question updated",
            "question": question_schema.dump(question)
        }), 200

    @staticmethod
    def delete_question(question_id):
        success = QuizService.delete_question(question_id)
        if not success:
            return jsonify({"error": "Question not found"}), 404
        return jsonify({"message": "Question deleted"}), 200

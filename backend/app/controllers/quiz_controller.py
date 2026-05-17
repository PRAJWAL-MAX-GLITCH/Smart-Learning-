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
        
        # Auto-issue certificate if passed
        if evaluation['score'] >= 80:
            try:
                from app.controllers.certificate_controller import CertificateController
                # We call the logic directly (passing course_id)
                # Since we are already authenticated, we just need the logic
                CertificateController.issue_certificate(course_id)
            except Exception as e:
                print(f"Auto-issue failed: {e}")

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
    def add_questions_bulk():
        data = request.get_json()
        if not data or not isinstance(data, list):
            return jsonify({"error": "Invalid format. Expected a list of questions."}), 400

        results = []
        errors = []
        
        for idx, item in enumerate(data):
            try:
                # Validate individual item
                valid_data = question_schema.load(item)
                question = QuizService.create_question(valid_data)
                results.append(question_schema.dump(question))
            except ValidationError as err:
                errors.append({"index": idx, "messages": err.messages})
            except Exception as e:
                errors.append({"index": idx, "error": str(e)})

        return jsonify({
            "message": f"Bulk upload completed: {len(results)} success, {len(errors)} errors",
            "results": results,
            "errors": errors
        }), 201

    @staticmethod
    def delete_question(question_id):
        success = QuizService.delete_question(question_id)
        if not success:
            return jsonify({"error": "Question not found"}), 404
        return jsonify({"message": "Question deleted"}), 200

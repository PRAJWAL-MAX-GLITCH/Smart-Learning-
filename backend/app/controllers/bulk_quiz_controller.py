from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.question import Question
from app.services.parser_service import ParserService
import os

bulk_quiz_bp = Blueprint('bulk_quiz', __name__)

class BulkQuizController:
    @staticmethod
    @jwt_required()
    def upload_and_preview():
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        course_id = request.form.get('course_id')
        
        if not course_id:
            return jsonify({"error": "Course ID is required"}), 400

        filename = file.filename
        ext = os.path.splitext(filename)[1].lower()
        content = file.read()

        try:
            questions = []
            if ext in ['.csv', '.xlsx']:
                questions = ParserService.parse_csv_excel(content, ext)
            elif ext == '.docx':
                questions = ParserService.parse_docx(content)
            elif ext == '.pdf':
                questions = ParserService.parse_pdf(content)
            else:
                return jsonify({"error": "Unsupported file format"}), 400

            # Basic Validation & Metadata
            validated_questions = []
            for q in questions:
                # Add validation flags
                is_valid = all([q['question_text'], q['option_a'], q['option_b'], q['correct_answer']])
                q['course_id'] = course_id
                q['is_valid'] = is_valid
                q['error_msg'] = "" if is_valid else "Missing required fields (Question/Options/Answer)"
                validated_questions.append(q)

            return jsonify({
                "filename": filename,
                "total": len(validated_questions),
                "questions": validated_questions
            }), 200

        except Exception as e:
            return jsonify({"error": "Parsing Error", "message": str(e)}), 500

    @staticmethod
    @jwt_required()
    def bulk_save():
        data = request.get_json()
        questions_data = data.get('questions', [])
        course_id = data.get('course_id')

        if not questions_data or not course_id:
            return jsonify({"error": "Missing data"}), 400

        saved_count = 0
        try:
            for q_data in questions_data:
                if not q_data.get('is_valid', True): continue
                
                new_q = Question(
                    course_id=course_id,
                    question_text=q_data['question_text'],
                    option_a=q_data['option_a'],
                    option_b=q_data['option_b'],
                    option_c=q_data.get('option_c', ''),
                    option_d=q_data.get('option_d', ''),
                    correct_answer=q_data['correct_answer'],
                    difficulty=q_data.get('difficulty', 'medium'),
                    explanation=q_data.get('explanation', ''),
                    marks=int(q_data.get('marks', 1))
                )
                db.session.add(new_q)
                saved_count += 1
            
            db.session.commit()
            return jsonify({"message": f"Successfully saved {saved_count} questions"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Save Error", "message": str(e)}), 500

# Routes
@bulk_quiz_bp.route('/preview', methods=['POST'])
@jwt_required()
def preview_upload():
    return BulkQuizController.upload_and_preview()

@bulk_quiz_bp.route('/save', methods=['POST'])
@jwt_required()
def bulk_save_questions():
    return BulkQuizController.bulk_save()

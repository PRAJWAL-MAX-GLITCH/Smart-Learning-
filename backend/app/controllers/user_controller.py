from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.result import Result
from app.schemas.schemas import UserSchema, ResultSchema
from marshmallow import ValidationError

user_schema = UserSchema()
results_schema = ResultSchema(many=True)


class UserController:
    @staticmethod
    def get_profile():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user_schema.dump(user)), 200

    @staticmethod
    def update_profile():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        try:
            data = user_schema.load(request.get_json(), partial=True)
        except ValidationError as err:
            return jsonify({"error": "Validation failed", "messages": err.messages}), 400

        for field in ["first_name", "last_name", "username"]:
            if field in data:
                setattr(user, field, data[field])

        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully", 
            "user": user_schema.dump(user)
        }), 200

    @staticmethod
    def get_learning_progress():
        user_id = get_jwt_identity()
        results = Result.query.filter_by(user_id=user_id).order_by(Result.submitted_at.desc()).all()
        
        avg_score = round(sum(r.score for r in results) / len(results), 2) if results else 0
        return jsonify({
            "total_quizzes_taken": len(results),
            "average_score": avg_score,
            "progress": results_schema.dump(results),
        }), 200

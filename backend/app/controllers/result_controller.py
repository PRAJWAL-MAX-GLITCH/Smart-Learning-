from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.result import Result
from app.models.user import User
from app.schemas.schemas import ResultSchema

result_schema = ResultSchema()
results_schema = ResultSchema(many=True)


class ResultController:
    @staticmethod
    def get_my_results():
        user_id = get_jwt_identity()
        results = Result.query.filter_by(user_id=user_id).order_by(Result.submitted_at.desc()).all()
        return jsonify(results_schema.dump(results)), 200

    @staticmethod
    def get_result(result_id):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        result = Result.query.get(result_id)

        if not result:
            return jsonify({"error": "Result not found"}), 404

        # Students may only access their own results
        if user.role != "admin" and str(result.user_id) != str(user_id):
            return jsonify({"error": "Access denied"}), 403

        return jsonify(result_schema.dump(result)), 200

    @staticmethod
    def get_all_results():
        """Admin only – returns every result across all users."""
        results = Result.query.order_by(Result.submitted_at.desc()).all()
        return jsonify(results_schema.dump(results)), 200

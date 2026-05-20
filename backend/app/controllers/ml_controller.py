from flask import jsonify
from app.services.ml_service import MLService
from app.models.user import User

class MLController:
    @staticmethod
    def get_prediction(user_id):
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        features = MLService.get_user_features(user_id)
        
        if features is None:
            return jsonify({
                "prediction": None,
                "confidence": 0.0,
                "message": "Prediction not available"
            }), 200
            
        result = MLService.predict_user_performance(features)
        return jsonify(result), 200

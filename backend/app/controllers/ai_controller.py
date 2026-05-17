from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user_topic_stats import UserTopicStats

class AIController:
    @staticmethod
    def get_weak_topics():
        user_id = get_jwt_identity()
        
        # Fetch all topic stats for this user
        stats = UserTopicStats.query.filter_by(user_id=user_id).all()
        
        # Convert to dictionary using the model's to_dict method
        # which includes accuracy and level logic
        ai_insights = [s.to_dict() for s in stats]
        
        # Sort so weak topics are first
        level_order = {"Weak": 0, "Improving": 1, "Strong": 2}
        ai_insights.sort(key=lambda x: level_order.get(x['level'], 1))
        
        return jsonify(ai_insights), 200

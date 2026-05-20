import os
import joblib
import logging
import pandas as pd
from app.models.result import Result
from app.models.user_topic_stats import UserTopicStats

logger = logging.getLogger(__name__)

# Load model ONCE at application startup/import time
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ml", "model.pkl")

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        logger.info(f"ML Model successfully loaded from {MODEL_PATH}")
    else:
        model = None
        logger.warning(f"ML Model file NOT found at {MODEL_PATH}")
except Exception as e:
    model = None
    logger.error(f"Failed to load ML Model: {e}")


class MLService:
    @staticmethod
    def get_user_features(user_id):
        """
        Calculates ML features for a given user from the database:
        - average_score (0-100)
        - total_attempts (1-5)
        - weak_topics_count (0-5)
        """
        # Fetch all quiz results for this user
        results = Result.query.filter_by(user_id=user_id).all()
        
        if not results:
            return None  # Indicate no data available
            
        scores = [r.score for r in results]
        average_score = sum(scores) / len(scores) if scores else 0.0
        
        # Capped total attempts at range 1-5 to match synthetic training bounds
        total_attempts = min(max(len(results), 1), 5)
        
        # Calculate weak topics (accuracy < 50%)
        topic_stats = UserTopicStats.query.filter_by(user_id=user_id).all()
        weak_topics_count = 0
        for stat in topic_stats:
            if stat.total_attempted > 0:
                accuracy = (stat.correct_count / stat.total_attempted) * 100
                if accuracy < 50:
                    weak_topics_count += 1
                    
        # Capped at range 0-5 to match synthetic training bounds
        weak_topics_count = min(weak_topics_count, 5)
        
        return {
            "average_score": round(average_score, 2),
            "total_attempts": total_attempts,
            "weak_topics_count": weak_topics_count
        }

    @staticmethod
    def predict_user_performance(user_features):
        """
        Predicts if a user will pass or fail the next quiz.
        X = pandas DataFrame with columns matching training features
        """
        if model is None:
            return {
                "prediction": None,
                "confidence": 0.0,
                "message": "Prediction not available"
            }
            
        try:
            # Keep the SAME feature names and order as training
            X = pd.DataFrame([{
                "average_score": user_features["average_score"],
                "total_attempts": user_features["total_attempts"],
                "weak_topics_count": user_features["weak_topics_count"]
            }])
            
            prediction_code = int(model.predict(X)[0])
            probabilities = model.predict_proba(X)[0]
            confidence = float(probabilities[prediction_code])
            
            if prediction_code == 1:
                prediction_str = "Pass"
                message = "You are likely to pass the next quiz"
            else:
                prediction_str = "Fail"
                message = "You may struggle in the next quiz"
                
            return {
                "prediction": prediction_str,
                "confidence": round(confidence, 2),
                "message": message
            }
        except Exception as e:
            logger.error(f"Prediction calculation failed: {e}")
            return {
                "prediction": None,
                "confidence": 0.0,
                "message": "Prediction not available"
            }

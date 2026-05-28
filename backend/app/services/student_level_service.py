import os
import joblib
import logging
import pandas as pd
from app.models.result import Result
from app.models.user_topic_stats import UserTopicStats
from app.models.chat import ChatMessage
from app.models.progress import UserCourseProgress
from app.extensions import db

logger = logging.getLogger(__name__)

# Load models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models", "student_level_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "models", "label_encoder.pkl")

class StudentLevelService:
    model = None
    label_encoder = None

    @classmethod
    def load_model(cls):
        if cls.model is None:
            try:
                cls.model = joblib.load(MODEL_PATH)
                cls.label_encoder = joblib.load(ENCODER_PATH)
                logger.info("Student Level ML Model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load Student Level Model: {e}")

    @classmethod
    def calculate_features(cls, user_id):
        # Default values for new users
        features = {
            "quiz_score": 50.0,
            "accuracy": 50.0,
            "retry_count": 0,
            "avg_quiz_time": 300,
            "course_completion": 0,
            "chat_complexity": 1,
            "learning_speed": 2,
            "weak_topics_count": 0
        }

        # 1. Quiz Score, Avg Quiz Time, Retries
        results = Result.query.filter_by(user_id=user_id).all()
        if results:
            scores = [r.score for r in results]
            features["quiz_score"] = sum(scores) / len(scores)
            
            times = [r.time_taken for r in results if r.time_taken]
            if times:
                features["avg_quiz_time"] = sum(times) / len(times)
                
            features["retry_count"] = max(0, len(results) - 1)  # Rough proxy for retries

        # 2. Accuracy & Weak Topics
        topic_stats = UserTopicStats.query.filter_by(user_id=user_id).all()
        if topic_stats:
            accuracies = []
            weak_topics = 0
            for stat in topic_stats:
                if stat.total_attempted > 0:
                    acc = (stat.correct_count / stat.total_attempted) * 100
                    accuracies.append(acc)
                    if acc < 50:
                        weak_topics += 1
            if accuracies:
                features["accuracy"] = sum(accuracies) / len(accuracies)
            features["weak_topics_count"] = weak_topics

        # 3. Course Completion
        progress = UserCourseProgress.query.filter_by(user_id=user_id).all()
        if progress:
            completed_count = sum(1 for p in progress if p.completed)
            features["course_completion"] = min(100, (completed_count / max(1, len(progress))) * 100)

        # 4. Chat Complexity
        messages = ChatMessage.query.filter_by(user_id=user_id, role="user").all()
        if messages:
            avg_len = sum(len(m.content.split()) for m in messages) / len(messages)
            if avg_len > 30:
                features["chat_complexity"] = 8
            elif avg_len > 15:
                features["chat_complexity"] = 4
            else:
                features["chat_complexity"] = 2

        # 5. Learning Speed (Dynamic inferred)
        if features["avg_quiz_time"] < 150:
            features["learning_speed"] = 3
        elif features["avg_quiz_time"] > 400:
            features["learning_speed"] = 1
        else:
            features["learning_speed"] = 2

        return features

    @classmethod
    def get_student_level(cls, user_id):
        cls.load_model()
        if not cls.model or not cls.label_encoder:
            return "Beginner"  # Safe fallback

        try:
            features = cls.calculate_features(user_id)
            # Ensure columns match training data order exactly:
            # ['quiz_score', 'accuracy', 'retry_count', 'avg_quiz_time', 'course_completion', 'chat_complexity', 'learning_speed', 'weak_topics_count']
            df = pd.DataFrame([{
                "quiz_score": features["quiz_score"],
                "accuracy": features["accuracy"],
                "retry_count": features["retry_count"],
                "avg_quiz_time": features["avg_quiz_time"],
                "course_completion": features["course_completion"],
                "chat_complexity": features["chat_complexity"],
                "learning_speed": features["learning_speed"],
                "weak_topics_count": features["weak_topics_count"]
            }])
            
            # Predict
            pred_idx = cls.model.predict(df)[0]
            level = cls.label_encoder.inverse_transform([pred_idx])[0]
            return level
        except Exception as e:
            logger.error(f"Error predicting student level: {e}")
            return "Beginner"

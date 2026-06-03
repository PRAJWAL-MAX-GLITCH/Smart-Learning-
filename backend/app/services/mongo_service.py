import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def _get_collection(app, name):
    """Helper to fetch a collection from the Flask app's MongoDB instance.
    Returns ``None`` if MongoDB is not configured.
    """
    db = getattr(app, "mongo_db", None)
    if db is None:
        logger.warning("MongoDB not initialized – collection '%s' unavailable.", name)
        return None
    return db[name]


def save_chat_history(app, user_id: int, user_message: str, ai_response: str):
    coll = _get_collection(app, "chatbot_history")
    if coll is None:
        return False
    doc = {
        "user_id": user_id,
        "user_message": user_message,
        "ai_response": ai_response,
        "timestamp": datetime.utcnow(),
    }
    coll.insert_one(doc)
    return True


def get_chat_history(app, user_id: int, limit: int = 50):
    coll = _get_collection(app, "chatbot_history")
    if coll is None:
        return []
    cursor = coll.find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
    return list(cursor)


def save_ai_log(app, course_id: int, transcript_source: str, generated_question_count: int):
    coll = _get_collection(app, "ai_logs")
    if coll is None:
        return False
    doc = {
        "course_id": course_id,
        "transcript_source": transcript_source,
        "generated_question_count": generated_question_count,
        "created_at": datetime.utcnow(),
    }
    coll.insert_one(doc)
    return True


def save_learning_analytics(app, user_id: int, detected_level: str, weak_topics: list, generated_roadmap: dict):
    coll = _get_collection(app, "learning_analytics")
    if coll is None:
        return False
    doc = {
        "user_id": user_id,
        "detected_level": detected_level,
        "weak_topics": weak_topics,
        "generated_roadmap": generated_roadmap,
        "timestamp": datetime.utcnow(),
    }
    coll.insert_one(doc)
    return True

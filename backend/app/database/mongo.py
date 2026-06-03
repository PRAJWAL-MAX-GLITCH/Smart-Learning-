import logging
from pymongo import MongoClient
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)

def init_mongo(app):
    """Initialize MongoDB client and expose it on the Flask app.
    The function reads the MONGO_URI environment variable (via app.config).
    It adds two attributes to ``app``:
        * ``mongo_client`` – the raw MongoClient instance (or None on failure)
        * ``mongo_db`` – the ``smartlearning`` database object (or None)
    Any connection errors are logged but do not prevent the rest of the
    application from starting.
    """
    uri = app.config.get("MONGO_URI")
    if not uri:
        logger.warning("MONGO_URI not configured – MongoDB features disabled.")
        app.mongo_client = None
        app.mongo_db = None
        return

    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Force a quick ping to verify connectivity
        client.admin.command("ping")
        db = client["smartlearning"]
        app.mongo_client = client
        app.mongo_db = db
        logger.info("Connected to MongoDB Atlas – database 'smartlearning' ready.")
    except PyMongoError as exc:
        logger.error(f"Failed to connect to MongoDB: {exc}")
        app.mongo_client = None
        app.mongo_db = None

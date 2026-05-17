import logging
from logging.handlers import RotatingFileHandler
import os
from flask import Flask, jsonify
from app.extensions import db, jwt, bcrypt, cors
from app.config import config


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Setup Logging
    setup_logging(app)

    @app.route("/")
    def index():
        return jsonify({
            "message": "AI Smart Learning Platform API is running",
            "docs": "/api",
            "status": "success"
        })

    # Register Blueprints
    register_blueprints(app)

    # Register Error Handlers
    register_error_handlers(app)

    # Create tables + auto-migrate missing columns
    with app.app_context():
        db.create_all()
        auto_migrate_db(app)

    # Global Error Handler for Debugging
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Unhandled Exception: {str(e)}")
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500

    return app


def auto_migrate_db(app):
    """Safely add missing columns to existing database tables without dropping data."""
    from sqlalchemy import text
    from app.extensions import db

    with app.app_context():
        migrations = {
            "users": [
                ("bio", "TEXT"),
                ("profile_image", "TEXT"),
                ("streak", "INTEGER DEFAULT 0"),
                ("last_active", "TIMESTAMP"),
            ],
            "user_lesson_progress": [
                ("course_id", "INTEGER"),
            ],
            "user_course_progress": [
                ("last_watched_lesson_id", "INTEGER"),
                ("updated_at", "TIMESTAMP"),
            ],
            "lessons": [
                ("duration", "TEXT DEFAULT '10 Mins'"),
                ("order_index", "INTEGER DEFAULT 0"),
            ],
            "questions": [
                ("marks", "INTEGER DEFAULT 1"),
                ("explanation", "TEXT"),
                ("topic", "VARCHAR(50) DEFAULT 'General'"),
            ],
            "courses": [
                ("duration", "TEXT"),
                ("total_lessons", "INTEGER DEFAULT 1"),
                ("difficulty_level", "TEXT DEFAULT 'Intermediate'"),
                ("youtube_url", "TEXT"),
            ],
            "results": [
                ("topic_performance", "TEXT"),
            ],
        }
        for table, columns in migrations.items():
            for col_name, col_type in columns:
                try:
                    db.session.execute(
                        text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
                    )
                    db.session.commit()
                    app.logger.info(f"Migration: Added '{col_name}' to {table}.")
                except Exception:
                    db.session.rollback()  # Column already exists — safe to ignore


def register_blueprints(app):
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import users_bp
    from app.routes.course_routes import courses_bp
    from app.routes.quiz_routes import quizzes_bp
    from app.routes.result_routes import results_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.progress_routes import progress_bp
    from app.routes.analytics_routes import analytics_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.ai_routes import ai_bp
    from app.models.progress import UserCourseProgress 
    from app.models.settings import SystemSettings
    from app.models.premium_models import Lesson, UserLessonProgress, Note, Certificate, Notification

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(quizzes_bp, url_prefix="/api/quizzes")
    app.register_blueprint(results_bp, url_prefix="/api/results")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(notification_bp, url_prefix="/api/notifications")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    from app.routes.lesson_routes import lesson_bp
    app.register_blueprint(lesson_bp, url_prefix="/api/admin/lessons")

    from app.controllers.certificate_controller import certificate_bp
    app.register_blueprint(certificate_bp, url_prefix='/api/certificates')

    from app.controllers.bulk_quiz_controller import bulk_quiz_bp
    app.register_blueprint(bulk_quiz_bp, url_prefix='/api/admin/bulk-quiz')


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad Request", "message": str(e.description)}), 400

    from marshmallow import ValidationError
    @app.errorhandler(ValidationError)
    def handle_marshmallow_error(e):
        return jsonify({"error": "Validation Error", "messages": e.messages}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not Found", "message": "The requested resource was not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        app.logger.error(f"Server Error: {e}")
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred"}), 500

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token Expired", "message": "The token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid Token", "message": "Signature verification failed"}), 401


def setup_logging(app):
    if not os.path.exists("logs"):
        os.makedirs("logs")

    file_handler = RotatingFileHandler("logs/smartlearning.log", maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info("SmartLearning startup")

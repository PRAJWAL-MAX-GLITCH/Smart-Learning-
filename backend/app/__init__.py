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

    # Create tables
    with app.app_context():
        db.create_all()

    return app


def register_blueprints(app):
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import users_bp
    from app.routes.course_routes import courses_bp
    from app.routes.quiz_routes import quizzes_bp
    from app.routes.result_routes import results_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.progress_routes import progress_bp
    from app.models.progress import UserCourseProgress 
    from app.models.premium_models import Lesson, UserLessonProgress, Note, Certificate, Notification

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(quizzes_bp, url_prefix="/api/quizzes")
    app.register_blueprint(results_bp, url_prefix="/api/results")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")
    from app.routes.lesson_routes import lesson_bp
    app.register_blueprint(lesson_bp, url_prefix="/api/admin/lessons")


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

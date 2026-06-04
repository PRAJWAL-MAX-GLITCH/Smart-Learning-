import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# Load .env from the project root (backend folder)
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path, override=True)


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-fallback-secret")
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    
    # Handle database URL overrides and ensure Render uses a writable SQLite path
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
        SQLALCHEMY_DATABASE_URI = "sqlite:////tmp/smartlearning.db"
    else:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL or "sqlite:////tmp/smartlearning.db"
        
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)

    # SMTP Configuration
    SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
    SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    MONGO_URI = os.environ.get("MONGO_URI")

    @classmethod
    def get_smtp_status(cls):
        """Returns SMTP config validation: which vars are set and which are missing."""
        required = {
            "SMTP_SERVER":   cls.SMTP_SERVER,
            "SMTP_PORT":     str(cls.SMTP_PORT),
            "SMTP_EMAIL":    cls.SMTP_EMAIL,
            "SMTP_PASSWORD": cls.SMTP_PASSWORD,
        }
        missing = [k for k, v in required.items() if not v]
        return {
            "smtp_configured": len(missing) == 0,
            "missing_variables": missing,
        }


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}

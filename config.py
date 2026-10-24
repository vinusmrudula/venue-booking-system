import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


class Config:
    # Secret key read from .env (with a secure development fallback)
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")

    # SQLite database URI (placed in Flask's instance/ folder by default)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///venue_booking.db")

    # Disable modification tracking to save resources and remove warnings
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Email configuration (Flask-Mail)
    MAIL_SERVER = os.getenv("MAIL_SERVER", "localhost")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 25))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "false").lower() in ["true", "1", "yes"]
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", None)
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", None)
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", "noreply@venuebooking.coep.ac.in")

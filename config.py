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

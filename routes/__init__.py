from .admin import admin_bp
from .auth import auth_bp
from .availability import availability_bp
from .bookings import bookings_bp
from .email import email_bp
from .venues import venues_bp

__all__ = [
    "admin_bp",
    "auth_bp",
    "availability_bp",
    "bookings_bp",
    "email_bp",
    "venues_bp",
]

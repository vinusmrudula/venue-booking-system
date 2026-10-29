from app.routes.auth import auth_bp
from app.routes.venues import venues_bp
from app.routes.bookings import bookings_bp
from app.routes.admin import admin_bp

__all__ = ['auth_bp', 'venues_bp', 'bookings_bp', 'admin_bp']


from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance
db = SQLAlchemy()

# Import models so they are registered with SQLAlchemy
from app.models.user import User
from app.models.venue import Department, Authority, Venue
from app.models.booking import Booking

__all__ = ['db', 'User', 'Department', 'Authority', 'Venue', 'Booking']


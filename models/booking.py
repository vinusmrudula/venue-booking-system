import enum
from datetime import datetime, timezone
from sqlalchemy.sql import func
from extensions import db


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    venue_id = db.Column(db.Integer, db.ForeignKey("venues.id"), nullable=False)

    # Scheduling columns (ready for clash detection)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

    # Status: pending, approved, or rejected (default: pending)
    status = db.Column(
        db.Enum(BookingStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=BookingStatus.PENDING,
        nullable=False,
    )

    # Creation timestamp (server-side default)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="bookings")
    venue = db.relationship("Venue", back_populates="bookings")

    def to_dict(self):
        status_value = self.status.value if isinstance(self.status, BookingStatus) else self.status
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "venue_id": self.venue_id,
            "venue_name": self.venue.name if self.venue else None,
            "date": self.date.isoformat() if self.date else None,
            "start_time": self.start_time.strftime("%H:%M:%S") if self.start_time else None,
            "end_time": self.end_time.strftime("%H:%M:%S") if self.end_time else None,
            "status": status_value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Booking #{self.id} Venue:{self.venue_id} Date:{self.date} [{self.status}]>"


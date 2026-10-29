from datetime import datetime
from app.models import db

class Booking(db.Model):
    """
    Booking model for scheduling venues and tracking approval status.
    """
    __tablename__ = 'bookings'

    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELLED = 'cancelled'

    id = db.Column(db.Integer, primary_key=True)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Date & Time stored as ISO strings (YYYY-MM-DD and HH:MM in 24hr format)
    # This prevents timezone mismatch bugs across frontends and platforms
    booking_date = db.Column(db.String(10), nullable=False, index=True)  # e.g., '2026-10-30'
    start_time = db.Column(db.String(5), nullable=False)                 # e.g., '09:00'
    end_time = db.Column(db.String(5), nullable=False)                   # e.g., '11:00'
    
    purpose = db.Column(db.Text, nullable=False)
    attendees_count = db.Column(db.Integer, default=0)
    
    # Status lifecycle: pending -> approved / rejected
    status = db.Column(db.String(20), default=STATUS_PENDING, nullable=False, index=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    
    # Authority contact details & email delivery state
    authority_email = db.Column(db.String(120), nullable=True)
    email_status = db.Column(db.String(30), default='pending')  # 'sent', 'failed', 'suppressed'
    mailto_fallback = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Serialize booking to frontend-ready JSON dictionary."""
        return {
            'id': self.id,
            'venue_id': self.venue_id,
            'venue_name': self.venue.name if self.venue else None,
            'venue_category': self.venue.category if self.venue else None,
            'department_name': self.venue.department.name if self.venue and self.venue.department else None,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'booking_date': self.booking_date,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'purpose': self.purpose,
            'attendees_count': self.attendees_count,
            'status': self.status,
            'rejection_reason': self.rejection_reason,
            'authority_email': self.authority_email,
            'email_status': self.email_status,
            'mailto_fallback': self.mailto_fallback,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Booking #{self.id} {self.venue_id} on {self.booking_date} ({self.status})>'


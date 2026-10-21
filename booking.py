from datetime import datetime, timezone

from extensions import db


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    # CHECK: must match the __tablename__ in venue.py (e.g. "venue" or "venues")
    venue_id = db.Column(db.Integer, db.ForeignKey("venues.id"), nullable=False, index=True)
    purpose = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    decided_at = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=_utcnow)

    user = db.relationship("User", back_populates="bookings")
    # CHECK: Venue must define bookings = db.relationship("Booking", back_populates="venue")
    venue = db.relationship("Venue", back_populates="bookings")

    __table_args__ = (
        db.CheckConstraint("end_time > start_time", name="ck_bookings_time_order"),
        db.CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'cancelled')",
            name="ck_bookings_status",
        ),
    )

    @classmethod
    def has_clash(cls, venue_id, start, end, blocking=("approved",)):
        """True if another booking overlaps [start, end) at this venue.

        Overlap rule: new_start < existing_end AND new_end > existing_start.
        Pass blocking=("approved", "pending") if pending requests should
        also hold the slot.
        """
        # TODO (step 5): this check-then-insert can race under concurrent requests
        return (
            cls.query.filter(
                cls.venue_id == venue_id,
                cls.status.in_(blocking),
                cls.start_time < end,
                cls.end_time > start,
            ).first()
            is not None
        )

    def __repr__(self):
        return f"<Booking {self.id} venue={self.venue_id} {self.status}>"

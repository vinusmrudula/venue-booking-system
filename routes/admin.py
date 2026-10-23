from datetime import datetime
from flask import Blueprint, jsonify, request
from extensions import db
from models import Booking, BookingStatus, User
from auth_middleware import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/bookings", methods=["GET"])
@admin_required
def list_all_bookings():
    """Admin endpoint: List all bookings with optional filtering.
    Query parameters:
    - status: pending | approved | rejected
    - venue_id: int
    - date: YYYY-MM-DD
    """
    status_filter = request.args.get("status", type=str)
    venue_id = request.args.get("venue_id", type=int)
    date_str = request.args.get("date", type=str)

    query = Booking.query

    if status_filter:
        status_clean = status_filter.strip().lower()
        try:
            status_enum = BookingStatus(status_clean)
            query = query.filter(Booking.status == status_enum)
        except ValueError:
            return jsonify({
                "error": f"Invalid status '{status_filter}'. Allowed: {[s.value for s in BookingStatus]}"
            }), 400

    if venue_id is not None:
        query = query.filter(Booking.venue_id == venue_id)

    if date_str:
        try:
            filter_date = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
            query = query.filter(Booking.date == filter_date)
        except ValueError:
            return jsonify({"error": "Invalid date format. Expected 'YYYY-MM-DD'."}), 400

    bookings = query.order_by(Booking.date.desc(), Booking.start_time.asc()).all()
    return jsonify({
        "total": len(bookings),
        "bookings": [b.to_dict() for b in bookings]
    }), 200


@admin_bp.route("/bookings/<int:booking_id>/status", methods=["PATCH"])
@admin_required
def update_booking_status(booking_id: int):
    """Admin/Authority endpoint: Update booking status to 'approved' or 'rejected'.
    Expects JSON:
    - status: 'approved' | 'rejected' | 'pending'
    """
    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "").strip().lower()

    if not new_status:
        return jsonify({"error": "Field 'status' is required."}), 400

    try:
        status_enum = BookingStatus(new_status)
    except ValueError:
        return jsonify({
            "error": f"Invalid status '{new_status}'. Allowed: {[s.value for s in BookingStatus]}"
        }), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": f"Booking with ID {booking_id} not found."}), 404

    # Clash detection safeguard when approving a booking
    if status_enum == BookingStatus.APPROVED:
        overlapping_booking = Booking.query.filter(
            Booking.venue_id == booking.venue_id,
            Booking.date == booking.date,
            Booking.id != booking.id,
            Booking.status == BookingStatus.APPROVED,
            Booking.start_time < booking.end_time,
            Booking.end_time > booking.start_time,
        ).first()

        if overlapping_booking:
            return jsonify({
                "error": "Cannot approve booking due to scheduling conflict.",
                "clash": {
                    "conflicting_booking_id": overlapping_booking.id,
                    "date": overlapping_booking.date.isoformat(),
                    "start_time": overlapping_booking.start_time.strftime("%H:%M:%S"),
                    "end_time": overlapping_booking.end_time.strftime("%H:%M:%S"),
                }
            }), 409

    booking.status = status_enum
    db.session.commit()

    return jsonify({
        "message": f"Booking #{booking_id} status updated to '{status_enum.value}'.",
        "booking": booking.to_dict()
    }), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    """Admin endpoint: List all registered college users."""
    users = User.query.order_by(User.id.asc()).all()
    return jsonify({
        "total": len(users),
        "users": [u.to_dict() for u in users]
    }), 200


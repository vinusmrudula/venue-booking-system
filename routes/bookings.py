from datetime import datetime
from flask import Blueprint, jsonify, request
from extensions import db
from models import Booking, BookingStatus, Venue
from auth_middleware import get_current_user, login_required

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")


def parse_time_string(time_str: str):
    """Parses time strings in either 'HH:MM:SS' or 'HH:MM' format."""
    clean_str = str(time_str).strip()
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(clean_str, fmt).time()
        except ValueError:
            pass
    raise ValueError(f"Time '{time_str}' does not match 'HH:MM' or 'HH:MM:SS'.")


@bookings_bp.route("", methods=["POST"])
@bookings_bp.route("/", methods=["POST"])
def create_booking():
    """Create a new venue booking request stub.
    - Reads and validates JSON payload (venue_id, date, start_time, end_time)
    - Returns fake 409 Conflict when a designated dummy clash slot is requested
    - Returns fake 201 Created with status 'pending'
    - Integrates with database when active
    """
    user = get_current_user()
    user_id = user.id if user else 5
    user_name = user.name if user else "Ada Lovelace"

    # 1. Read JSON payload using request.get_json()
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({
            "success": False,
            "error": {
                "code": "BAD_REQUEST",
                "message": "Invalid or missing JSON body. Header 'Content-Type: application/json' is required.",
                "details": None
            }
        }), 400

    # 2. Validate required fields
    required_fields = ["venue_id", "date", "start_time", "end_time"]
    missing = [
        f for f in required_fields
        if f not in data or data[f] is None or str(data[f]).strip() == ""
    ]
    if missing:
        return jsonify({
            "success": False,
            "error": {
                "code": "MISSING_FIELDS",
                "message": f"Fields 'venue_id', 'date', 'start_time', and 'end_time' are all required. Missing: {', '.join(missing)}.",
                "details": {"missing_fields": missing}
            }
        }), 400

    venue_id = data.get("venue_id")
    date_str = str(data.get("date")).strip()
    start_time_str = str(data.get("start_time")).strip()
    end_time_str = str(data.get("end_time")).strip()

    # 3. Parse date and times
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_DATE_FORMAT",
                "message": f"Invalid date '{date_str}'. Expected 'YYYY-MM-DD'.",
                "details": None
            }
        }), 400

    try:
        start_time_obj = parse_time_string(start_time_str)
        end_time_obj = parse_time_string(end_time_str)
    except ValueError as err:
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_TIME_FORMAT",
                "message": str(err),
                "details": None
            }
        }), 400

    # Validate time range (start strictly before end)
    if start_time_obj >= end_time_obj:
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_TIME_RANGE",
                "message": "Field 'start_time' must be strictly before 'end_time'.",
                "details": {
                    "start_time": start_time_str,
                    "end_time": end_time_str
                }
            }
        }), 400

    # 4. Simulated Dummy Clash Trigger for early frontend testing
    # Trigger 1: venue_id is 999 or 'clash'
    # Trigger 2: venue_id is 1, date is '2026-11-15', and start_time overlaps 10:00-12:00
    is_dummy_clash = (
        str(venue_id) in ("999", "clash")
        or (
            str(venue_id) == "1"
            and date_str == "2026-11-15"
            and start_time_str.startswith("10:")
        )
    )

    if is_dummy_clash:
        return jsonify({
            "success": False,
            "error": {
                "code": "BOOKING_CLASH",
                "message": "The requested time slot overlaps with an existing booking.",
                "details": {
                    "conflicting_booking_id": 3,
                    "date": "2026-11-15",
                    "start_time": "10:00:00",
                    "end_time": "12:00:00"
                }
            }
        }), 409

    # 5. Database check and persistence when available
    try:
        int_venue_id = int(venue_id)
        venue = Venue.query.get(int_venue_id)
        if venue:
            conflicting_booking = Booking.query.filter(
                Booking.venue_id == venue.id,
                Booking.date == booking_date,
                Booking.status != BookingStatus.REJECTED,
                Booking.start_time < end_time_obj,
                Booking.end_time > start_time_obj
            ).first()

            if conflicting_booking:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "BOOKING_CLASH",
                        "message": "The requested time slot overlaps with an existing active booking.",
                        "details": {
                            "conflicting_booking_id": conflicting_booking.id,
                            "date": conflicting_booking.date.isoformat(),
                            "start_time": conflicting_booking.start_time.strftime("%H:%M:%S"),
                            "end_time": conflicting_booking.end_time.strftime("%H:%M:%S"),
                            "status": conflicting_booking.status.value
                        }
                    }
                }), 409

            new_booking = Booking(
                user_id=user_id,
                venue_id=venue.id,
                date=booking_date,
                start_time=start_time_obj,
                end_time=end_time_obj,
                status=BookingStatus.PENDING,
            )
            db.session.add(new_booking)
            db.session.commit()

            return jsonify({
                "success": True,
                "message": "Booking request submitted successfully.",
                "booking": new_booking.to_dict()
            }), 201
    except Exception:
        db.session.rollback()

    # 6. Fallback Fake Booking Stub (No database or dummy venue)
    fake_booking = {
        "id": 12,
        "user_id": user_id,
        "user_name": user_name,
        "venue_id": int(venue_id) if str(venue_id).isdigit() else 1,
        "venue_name": "NC 27",
        "date": date_str,
        "start_time": start_time_obj.strftime("%H:%M:%S"),
        "end_time": end_time_obj.strftime("%H:%M:%S"),
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    return jsonify({
        "success": True,
        "message": "Booking request submitted successfully.",
        "booking": fake_booking
    }), 201


@bookings_bp.route("/my", methods=["GET"])
@bookings_bp.route("/mine", methods=["GET"])
def get_my_bookings():
    """Retrieve previous bookings (hardcoded stub with DB fallback)."""
    user = get_current_user()
    user_id = user.id if user else 5
    user_name = user.name if user else "Ada Lovelace"

    hardcoded_bookings = [
        {
            "id": 12,
            "user_id": user_id,
            "user_name": user_name,
            "venue_id": 1,
            "venue_name": "NC 27",
            "date": "2026-11-15",
            "start_time": "14:00:00",
            "end_time": "16:00:00",
            "status": "pending",
            "created_at": "2026-10-24T12:30:00"
        },
        {
            "id": 3,
            "user_id": user_id,
            "user_name": user_name,
            "venue_id": 1,
            "venue_name": "NC 27",
            "date": "2026-11-10",
            "start_time": "10:00:00",
            "end_time": "12:00:00",
            "status": "approved",
            "created_at": "2026-10-20T09:15:00"
        }
    ]

    # If user has bookings in the DB, return them
    if user:
        try:
            db_bookings = Booking.query.filter_by(user_id=user.id)\
                .order_by(Booking.date.desc(), Booking.start_time.asc()).all()
            if db_bookings:
                return jsonify({
                    "success": True,
                    "total": len(db_bookings),
                    "bookings": [b.to_dict() for b in db_bookings]
                }), 200
        except Exception:
            pass

    return jsonify({
        "success": True,
        "total": len(hardcoded_bookings),
        "bookings": hardcoded_bookings
    }), 200


@bookings_bp.route("/<int:booking_id>", methods=["GET"])
@login_required
def get_booking_details(booking_id: int):
    """Retrieve details of a single booking."""
    user = get_current_user()
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({
            "success": false,
            "error": {
                "code": "BOOKING_NOT_FOUND",
                "message": f"Booking with ID {booking_id} not found.",
                "details": None
            }
        }), 404

    # Authorization check: only booking owner or admin can view
    if booking.user_id != user.id and user.role != "admin":
        return jsonify({
            "success": false,
            "error": {
                "code": "FORBIDDEN",
                "message": "You are not authorized to view this booking.",
                "details": None
            }
        }), 403

    return jsonify({
        "success": true,
        "booking": booking.to_dict()
    }), 200


@bookings_bp.route("/<int:booking_id>/email-preview", methods=["GET"])
def booking_email_preview_endpoint(booking_id: int):
    """Stub endpoint returning email preview for authority notification."""
    from routes.email import preview_email
    return preview_email(booking_id)


@bookings_bp.route("/<int:booking_id>/send-email", methods=["POST"])
def booking_send_email_endpoint(booking_id: int):
    """Stub endpoint returning success or fake mailto fallback error."""
    from routes.email import send_email
    return send_email(booking_id)


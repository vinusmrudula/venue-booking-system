from datetime import datetime
from flask import Blueprint, jsonify, request
from models import Booking, BookingStatus, Venue

availability_bp = Blueprint("availability", __name__, url_prefix="/api/availability")


@availability_bp.route("", methods=["GET"])
@availability_bp.route("/", methods=["GET"])
def check_availability():
    """Check venue availability.
    Supports:
    1. Single venue detailed slots check (when 'venue_id' and 'date' are provided)
    2. Multi-venue search overview stub grouped by premises (when 'date' and search filters are queried)
    """
    venue_id = request.args.get("venue_id", type=int)
    date_str = request.args.get("date", type=str)

    # 1. Validation: date parameter is required
    if not date_str:
        return jsonify({
            "success": False,
            "error": {
                "code": "MISSING_PARAM",
                "message": "Query parameter 'date' is required (format: YYYY-MM-DD).",
                "details": None
            }
        }), 400

    # 2. Case A: Single venue detailed slots check
    if venue_id is not None:
        try:
            query_date = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
        except ValueError:
            return jsonify({
                "success": False,
                "error": {
                    "code": "INVALID_DATE_FORMAT",
                    "message": f"Invalid date '{date_str}'. Expected format is 'YYYY-MM-DD'.",
                    "details": None
                }
            }), 400

        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({
                "success": False,
                "error": {
                    "code": "VENUE_NOT_FOUND",
                    "message": f"Venue with ID {venue_id} not found.",
                    "details": None
                }
            }), 404

        day_bookings = Booking.query.filter(
            Booking.venue_id == venue.id,
            Booking.date == query_date,
            Booking.status != BookingStatus.REJECTED
        ).order_by(Booking.start_time.asc()).all()

        booked_slots = [
            {
                "booking_id": b.id,
                "start_time": b.start_time.strftime("%H:%M:%S"),
                "end_time": b.end_time.strftime("%H:%M:%S"),
                "status": b.status.value,
            }
            for b in day_bookings
        ]

        return jsonify({
            "success": True,
            "venue_id": venue.id,
            "venue_name": venue.name,
            "date": query_date.isoformat(),
            "total_booked_slots": len(booked_slots),
            "booked_slots": booked_slots
        }), 200

    # 3. Case B: General multi-venue availability stub grouped by premises
    category = request.args.get("category", default="all", type=str)
    department = request.args.get("department", default=None, type=str)
    min_capacity = request.args.get("capacity", default=0, type=int)

    # Validate date format for stub consistency
    try:
        datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
    except ValueError:
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_DATE_FORMAT",
                "message": f"Invalid date '{date_str}'. Expected format is 'YYYY-MM-DD'.",
                "details": None
            }
        }), 400

    stub_response = {
        "success": True,
        "date": date_str.strip(),
        "filters_applied": {
            "category": category,
            "department": department,
            "capacity": min_capacity
        },
        "premises": [
            {
                "premises_id": 2,
                "premises_name": "New Department of Computer Science and Engineering (New CSE)",
                "venues": [
                    {
                        "id": 1,
                        "name": "NC 27",
                        "category": "classroom",
                        "capacity": 70,
                        "status": "available"
                    },
                    {
                        "id": 2,
                        "name": "NC 28",
                        "category": "classroom",
                        "capacity": 70,
                        "status": "booked"
                    }
                ]
            }
        ]
    }

    return jsonify(stub_response), 200

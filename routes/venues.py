from datetime import datetime
from flask import Blueprint, jsonify, request
from models import Booking, BookingStatus, Premises, Venue, VenueCategory

venues_bp = Blueprint("venues", __name__, url_prefix="/api/venues")


@venues_bp.route("", methods=["GET"])
@venues_bp.route("/", methods=["GET"])
def get_venues():
    """Retrieve list of venues with optional search filters.
    Query parameters:
    - category (str): classroom | seminar_hall | auditorium | lab
    - department_id (int): Department ID filter
    - premises_id (int): Building / Premises ID filter
    - min_capacity (int): Seating capacity greater than or equal to this value
    - search (str): Search in venue name or premise name
    - date (str, YYYY-MM-DD): Filter/annotate bookings for this date
    """
    category = request.args.get("category", type=str)
    department_id = request.args.get("department_id", type=int)
    premises_id = request.args.get("premises_id", type=int)
    min_capacity = request.args.get("min_capacity", type=int)
    if min_capacity is None:
        min_capacity = request.args.get("capacity", type=int)
    search = request.args.get("search", type=str)
    date_str = request.args.get("date", type=str)

    query = Venue.query.join(Premises)

    # 1. Category Filter
    if category:
        category_clean = category.strip().lower()
        try:
            category_enum = VenueCategory(category_clean)
            query = query.filter(Venue.category == category_enum)
        except ValueError:
            valid_cats = [e.value for e in VenueCategory]
            return jsonify({
                "error": f"Invalid category '{category}'. Allowed categories: {valid_cats}"
            }), 400

    # 2. Department Filter
    if department_id is not None:
        query = query.filter(Venue.department_id == department_id)

    # 3. Premises (Building) Filter
    if premises_id is not None:
        query = query.filter(Venue.premises_id == premises_id)

    # 4. Minimum Capacity Filter
    if min_capacity is not None:
        query = query.filter(Venue.capacity >= min_capacity)

    # 5. Search keyword
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            Venue.name.ilike(search_pattern) | Premises.name.ilike(search_pattern)
        )

    # Order results alphabetically
    venues = query.order_by(Venue.name.asc()).all()

    # 6. Optional Date Query: Include day's booked time slots for quick frontend availability check
    filter_date = None
    if date_str:
        try:
            filter_date = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Expected 'YYYY-MM-DD'."}), 400

    results = []
    for venue in venues:
        venue_dict = venue.to_dict()

        if filter_date:
            # Query non-rejected bookings for this venue on this date
            day_bookings = Booking.query.filter(
                Booking.venue_id == venue.id,
                Booking.date == filter_date,
                Booking.status != BookingStatus.REJECTED
            ).order_by(Booking.start_time.asc()).all()

            venue_dict["date_checked"] = filter_date.isoformat()
            venue_dict["booked_slots_count"] = len(day_bookings)
            venue_dict["booked_slots"] = [
                {
                    "id": b.id,
                    "start_time": b.start_time.strftime("%H:%M:%S"),
                    "end_time": b.end_time.strftime("%H:%M:%S"),
                    "status": b.status.value,
                }
                for b in day_bookings
            ]

        results.append(venue_dict)

    return jsonify({
        "total": len(results),
        "venues": results
    }), 200


@venues_bp.route("/<int:venue_id>", methods=["GET"])
def get_venue_detail(venue_id: int):
    """Retrieve full details of a specific venue including premises authority details."""
    venue = Venue.query.get(venue_id)
    if not venue:
        return jsonify({"error": f"Venue with ID {venue_id} not found."}), 404

    data = venue.to_dict()

    # Enrich with authority details directly from premises relationship
    if venue.premises:
        data["authority"] = {
            "name": venue.premises.authority_name,
            "email": venue.premises.authority_email,
        }

    return jsonify({"venue": data}), 200


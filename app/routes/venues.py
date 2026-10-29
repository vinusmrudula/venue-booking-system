from flask import Blueprint, request, jsonify
from app.models import db, Venue, Department, Authority, Booking
from app.utils.clash_detector import validate_booking_inputs, check_clash

venues_bp = Blueprint('venues', __name__, url_prefix='/api/venues')

@venues_bp.route('', methods=['GET'])
def get_venues():
    """
    List all venues with optional filtering by category, department_id, or search term.
    """
    category = request.args.get('category')
    department_id = request.args.get('department_id', type=int)
    search = request.args.get('search', '').strip()

    query = Venue.query

    if category:
        query = query.filter(Venue.category.ilike(f"%{category}%"))
    if department_id:
        query = query.filter(Venue.department_id == department_id)
    if search:
        query = query.filter(Venue.name.ilike(f"%{search}%"))

    venues = query.order_by(Venue.name.asc()).all()

    return jsonify({
        'success': True,
        'count': len(venues),
        'data': [v.to_dict() for v in venues]
    }), 200


@venues_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Get the 4 standard venue categories.
    """
    return jsonify({
        'success': True,
        'data': Venue.CATEGORIES
    }), 200


@venues_bp.route('/departments', methods=['GET'])
def get_departments():
    """
    Get list of all college departments.
    """
    departments = Department.query.order_by(Department.name.asc()).all()
    return jsonify({
        'success': True,
        'count': len(departments),
        'data': [d.to_dict() for d in departments]
    }), 200


@venues_bp.route('/<int:venue_id>', methods=['GET'])
def get_venue_detail(venue_id):
    """
    Get detailed information about a specific venue.
    """
    venue = db.session.get(Venue, venue_id)
    if not venue:
        return jsonify({
            'success': False,
            'message': f'Venue with ID {venue_id} not found.'
        }), 404

    return jsonify({
        'success': True,
        'data': venue.to_dict()
    }), 200


@venues_bp.route('/authority-lookup', methods=['GET'])
def authority_lookup():
    """
    Lookup authority name and email given a premises/hall name.
    Task Step 3: 'given a premises, return the authority's name and email.'
    Example: GET /api/venues/authority-lookup?premises=SC06
    """
    premises = request.args.get('premises') or request.args.get('venue_name') or request.args.get('name')
    venue_id = request.args.get('venue_id', type=int)

    if not premises and not venue_id:
        return jsonify({
            'success': False,
            'message': "Please provide a 'premises' query param (e.g. ?premises=SC06) or 'venue_id'."
        }), 400

    venue = None
    if venue_id:
        venue = db.session.get(Venue, venue_id)
    elif premises:
        venue = Venue.query.filter(Venue.name.ilike(premises.strip())).first()

    if not venue:
        return jsonify({
            'success': False,
            'message': f"Premises '{premises or venue_id}' not found."
        }), 404

    if not venue.authority:
        return jsonify({
            'success': True,
            'data': {
                'venue_name': venue.name,
                'authority_name': 'College Administration',
                'authority_email': 'admin@coeptech.ac.in',
                'department_name': venue.department.name if venue.department else None
            }
        }), 200

    return jsonify({
        'success': True,
        'data': {
            'venue_id': venue.id,
            'venue_name': venue.name,
            'authority_id': venue.authority.id,
            'authority_name': venue.authority.name,
            'authority_email': venue.authority.email,
            'department_id': venue.department_id,
            'department_name': venue.department.name if venue.department else None
        }
    }), 200


@venues_bp.route('/availability', methods=['GET', 'POST'])
def check_availability():
    """
    Check availability of venues for a given category, department, date, and time slot.
    Task Step 3: 'check a venue category, dept, date and time slot against existing bookings.'
    Supports both GET (with query parameters) and POST (with JSON body) for frontend flexibility!
    """
    if request.method == 'POST':
        payload = request.get_json() or {}
    else:
        payload = request.args.to_dict()

    booking_date = payload.get('date') or payload.get('booking_date')
    start_time = payload.get('start_time')
    end_time = payload.get('end_time')
    category = payload.get('category')
    department_id = payload.get('department_id')
    venue_id = payload.get('venue_id')

    if not booking_date or not start_time or not end_time:
        return jsonify({
            'success': False,
            'message': 'Please provide date (YYYY-MM-DD), start_time (HH:MM), and end_time (HH:MM).'
        }), 400

    # Validate inputs & edge cases (past dates, invalid times)
    is_valid, error_msg = validate_booking_inputs(booking_date, start_time, end_time)
    if not is_valid:
        return jsonify({
            'success': False,
            'message': error_msg
        }), 400

    # Build venues query
    query = Venue.query

    if venue_id:
        query = query.filter(Venue.id == int(venue_id))
    if category:
        query = query.filter(Venue.category.ilike(f"%{category}%"))
    if department_id:
        query = query.filter(Venue.department_id == int(department_id))

    candidate_venues = query.all()

    available_venues = []
    booked_venues = []

    for v in candidate_venues:
        has_clash, conflicting_booking = check_clash(v.id, booking_date, start_time, end_time)
        v_data = v.to_dict()
        if has_clash:
            v_data['conflict'] = {
                'booking_id': conflicting_booking.id,
                'status': conflicting_booking.status,
                'start_time': conflicting_booking.start_time,
                'end_time': conflicting_booking.end_time,
                'purpose': conflicting_booking.purpose
            }
            booked_venues.append(v_data)
        else:
            available_venues.append(v_data)

    return jsonify({
        'success': True,
        'query': {
            'date': booking_date,
            'start_time': start_time,
            'end_time': end_time,
            'category': category,
            'department_id': department_id
        },
        'available_count': len(available_venues),
        'booked_count': len(booked_venues),
        'available_venues': available_venues,
        'booked_venues': booked_venues
    }), 200


@venues_bp.route('/active-bookings', methods=['GET'])
def get_active_bookings():
    """
    Get active bookings for a given date so the frontend availability engine
    accurately displays booked vs available slots in real time.
    """
    booking_date = request.args.get('date') or request.args.get('booking_date')
    query = Booking.query.filter(Booking.status.in_([Booking.STATUS_PENDING, Booking.STATUS_APPROVED]))
    if booking_date:
        query = query.filter(Booking.booking_date == booking_date)
    bookings = query.all()
    return jsonify({
        'success': True,
        'count': len(bookings),
        'data': [b.to_dict() for b in bookings]
    }), 200

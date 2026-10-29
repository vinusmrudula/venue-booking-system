from flask import Blueprint, request, jsonify
from app.models import db, Booking, Venue, User
from app.utils.auth_middleware import token_required
from app.utils.clash_detector import validate_booking_inputs, check_clash
from app.utils.email_service import send_booking_email_with_fallback, generate_mailto_link

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')

def _parse_slot_times(slot_str):
    if not slot_str:
        return None, None
    parts = slot_str.split('-')
    if len(parts) == 2:
        try:
            from datetime import datetime
            s_raw = parts[0].strip()
            e_raw = parts[1].strip()
            if 'AM' in s_raw.upper() or 'PM' in s_raw.upper():
                s_dt = datetime.strptime(s_raw, '%I:%M %p')
                e_dt = datetime.strptime(e_raw, '%I:%M %p')
                return s_dt.strftime('%H:%M'), e_dt.strftime('%H:%M')
            elif ':' in s_raw and ':' in e_raw:
                return s_raw, e_raw
        except Exception:
            pass
    return None, None

@bookings_bp.route('', methods=['POST'])
@token_required
def create_booking(current_user):
    """
    Create a new venue booking request.
    Enforces clash detection (concurrency & overlap prevention).
    Sends email notification to the respective department authority with mailto fallback.
    """
    data = request.get_json() or {}

    venue_id = data.get('venue_id') or data.get('venueId')
    booking_date = data.get('booking_date') or data.get('date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    purpose = data.get('purpose', '').strip()
    attendees_count = data.get('attendees_count', 0)

    # Slot string fallback
    if (not start_time or not end_time) and (data.get('timeSlot') or data.get('time_slot')):
        s_parsed, e_parsed = _parse_slot_times(data.get('timeSlot') or data.get('time_slot'))
        start_time = start_time or s_parsed
        end_time = end_time or e_parsed

    if not purpose:
        purpose = 'Classroom / Seminar Activity'

    # 1. Basic validation
    if not venue_id or not booking_date or not start_time or not end_time or not purpose:
        return jsonify({
            'success': False,
            'message': 'venue_id, booking_date, start_time, end_time, and purpose are required.'
        }), 400

    # 2. Check venue existence (by ID, or match code/name)
    venue = None
    if isinstance(venue_id, int) or (isinstance(venue_id, str) and venue_id.isdigit()):
        venue = db.session.get(Venue, int(venue_id))

    if not venue and venue_id:
        lookup_key = str(data.get('venueCode') or venue_id).replace('-', '').replace(' ', '').upper()
        for v in Venue.query.all():
            v_key = v.name.replace('-', '').replace(' ', '').upper()
            if v_key == lookup_key or lookup_key in v_key or v_key in lookup_key:
                venue = v
                break

    if not venue:
        return jsonify({
            'success': False,
            'message': f'Venue with ID {venue_id} does not exist.'
        }), 404

    venue_id = venue.id

    # 3. Validate date/time logic (no past dates, end > start)
    is_valid, error_msg = validate_booking_inputs(booking_date, start_time, end_time)
    if not is_valid:
        return jsonify({
            'success': False,
            'message': error_msg
        }), 400

    # 4. Clash Prevention Check (Double-booking protection)
    has_clash, conflicting_booking = check_clash(venue_id, booking_date, start_time, end_time)
    if has_clash:
        return jsonify({
            'success': False,
            'error_code': 'CLASH_DETECTED',
            'message': f"Slot clash! {venue.name} is already booked from {conflicting_booking.start_time} to {conflicting_booking.end_time} on {booking_date}.",
            'conflict': {
                'booking_id': conflicting_booking.id,
                'status': conflicting_booking.status,
                'start_time': conflicting_booking.start_time,
                'end_time': conflicting_booking.end_time
            }
        }), 409

    # 5. Determine Authority / Admin Email
    authority_email = venue.authority.email if (venue.authority and venue.authority.email) else 'admin@coeptech.ac.in'
    mailto_url = generate_mailto_link(
        authority_email,
        f"Venue Booking Request: {venue.name} on {booking_date}",
        f"A new booking request has been submitted for {venue.name} on {booking_date} ({start_time} - {end_time}) by {current_user.name}."
    )

    # 6. Instantiate new booking in 'pending' status routed to Admin account
    booking = Booking(
        venue_id=venue.id,
        user_id=current_user.id,
        booking_date=booking_date,
        start_time=start_time,
        end_time=end_time,
        purpose=purpose,
        attendees_count=int(attendees_count) if attendees_count else 0,
        status=Booking.STATUS_PENDING,
        authority_email=authority_email,
        email_status='sent_to_admin',
        mailto_fallback=mailto_url
    )

    db.session.add(booking)
    db.session.commit()

    # 7. Dispatch email to venue authority / admin with fallback handling
    email_result = send_booking_email_with_fallback(booking, current_user)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Booking request submitted successfully! Request has been sent to the Admin account for approval.',
        'data': booking.to_dict(),
        'email_notification': email_result
    }), 201


@bookings_bp.route('/my-bookings', methods=['GET'])
@token_required
def get_my_bookings(current_user):
    """
    Retrieve previous bookings query for the authenticated user ('My Bookings').
    Task Step 4: 'the previous bookings query for My Bookings.'
    """
    bookings = Booking.query.filter_by(user_id=current_user.id)\
                            .order_by(Booking.created_at.desc())\
                            .all()

    return jsonify({
        'success': True,
        'count': len(bookings),
        'data': [b.to_dict() for b in bookings]
    }), 200


@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@token_required
def get_booking_details(current_user, booking_id):
    """
    Get details of a specific booking.
    """
    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({
            'success': False,
            'message': f'Booking #{booking_id} not found.'
        }), 404

    # Allow user who made booking or admin to view
    if booking.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'Unauthorized to view this booking.'
        }), 403

    return jsonify({
        'success': True,
        'data': booking.to_dict()
    }), 200


@bookings_bp.route('/<int:booking_id>/send-email', methods=['POST'])
@token_required
def trigger_booking_email(current_user, booking_id):
    """
    One-click email endpoint: fill template, send to authority, and return mailto fallback.
    Task Step 4 requirement.
    """
    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({
            'success': False,
            'message': f'Booking #{booking_id} not found.'
        }), 404

    if booking.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'Unauthorized to trigger email for this booking.'
        }), 403

    email_result = send_booking_email_with_fallback(booking, booking.user)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': email_result['message'],
        'email_status': booking.email_status,
        'mailto_fallback': booking.mailto_fallback
    }), 200


@bookings_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@token_required
def cancel_booking(current_user, booking_id):
    """
    Cancel an active or pending booking request.
    """
    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({
            'success': False,
            'message': f'Booking #{booking_id} not found.'
        }), 404

    if booking.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'Unauthorized to cancel this booking.'
        }), 403

    booking.status = Booking.STATUS_CANCELLED
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Booking #{booking_id} has been cancelled.',
        'data': booking.to_dict()
    }), 200

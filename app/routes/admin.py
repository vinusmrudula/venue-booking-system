from flask import Blueprint, request, jsonify
from app.models import db, Booking, Venue, Department, User
from app.utils.auth_middleware import token_required, admin_required
from app.utils.clash_detector import check_clash

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/bookings', methods=['GET'])
@token_required
@admin_required
def get_all_bookings(current_user):
    """
    Admin endpoint to view all venue booking requests across the institution.
    Filters: status, venue_id, date
    """
    status = request.args.get('status')
    venue_id = request.args.get('venue_id', type=int)
    date = request.args.get('date')

    query = Booking.query

    if status:
        query = query.filter(Booking.status == status.lower())
    if venue_id:
        query = query.filter(Booking.venue_id == venue_id)
    if date:
        query = query.filter(Booking.booking_date == date)

    bookings = query.order_by(Booking.booking_date.desc(), Booking.start_time.asc()).all()

    return jsonify({
        'success': True,
        'count': len(bookings),
        'data': [b.to_dict() for b in bookings]
    }), 200


@admin_bp.route('/bookings/<int:booking_id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_booking(current_user, booking_id):
    """
    Approve a pending booking.
    Performs safety verification to ensure no overlapping booking was approved in the interim.
    """
    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({
            'success': False,
            'message': f'Booking #{booking_id} not found.'
        }), 404

    # Verify that no clash exists with already approved bookings
    clashing_query = Booking.query.filter(
        Booking.venue_id == booking.venue_id,
        Booking.booking_date == booking.booking_date,
        Booking.status == Booking.STATUS_APPROVED,
        Booking.id != booking.id
    ).all()

    for existing in clashing_query:
        if booking.start_time < existing.end_time and booking.end_time > existing.start_time:
            return jsonify({
                'success': False,
                'message': f'Cannot approve! Clashes with an existing approved booking #{existing.id} ({existing.start_time}-{existing.end_time}).'
            }), 409

    booking.status = Booking.STATUS_APPROVED
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Booking #{booking_id} has been APPROVED.',
        'data': booking.to_dict()
    }), 200


@admin_bp.route('/bookings/<int:booking_id>/reject', methods=['POST'])
@token_required
@admin_required
def reject_booking(current_user, booking_id):
    """
    Reject a pending booking request with an optional reason.
    """
    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({
            'success': False,
            'message': f'Booking #{booking_id} not found.'
        }), 404

    data = request.get_json() or {}
    reason = data.get('reason', 'Administrative priority or maintenance schedule.')

    booking.status = Booking.STATUS_REJECTED
    booking.rejection_reason = reason
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Booking #{booking_id} has been REJECTED.',
        'data': booking.to_dict()
    }), 200


@admin_bp.route('/stats', methods=['GET'])
@token_required
@admin_required
def get_stats(current_user):
    """
    Admin dashboard statistics summary.
    """
    total_venues = Venue.query.count()
    total_departments = Department.query.count()
    total_users = User.query.count()
    
    total_bookings = Booking.query.count()
    pending_bookings = Booking.query.filter_by(status=Booking.STATUS_PENDING).count()
    approved_bookings = Booking.query.filter_by(status=Booking.STATUS_APPROVED).count()
    rejected_bookings = Booking.query.filter_by(status=Booking.STATUS_REJECTED).count()

    return jsonify({
        'success': True,
        'data': {
            'venues': total_venues,
            'departments': total_departments,
            'users': total_users,
            'bookings': {
                'total': total_bookings,
                'pending': pending_bookings,
                'approved': approved_bookings,
                'rejected': rejected_bookings
            }
        }
    }), 200

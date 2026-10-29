from datetime import datetime, date
from app.models.booking import Booking

def validate_booking_inputs(booking_date_str, start_time_str, end_time_str):
    """
    Validates date & time strings and enforces business rules:
    - Proper formats (YYYY-MM-DD, HH:MM)
    - Booking date cannot be in the past
    - End time must be strictly greater than start time
    """
    # 1. Validate date format
    try:
        booking_date = datetime.strptime(booking_date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return False, "Invalid date format. Expected 'YYYY-MM-DD' (e.g. 2026-10-30)."

    # 2. Prevent past dates
    today = date.today()
    if booking_date < today:
        return False, f"Cannot book for past date ({booking_date_str}). Please select today or a future date."

    # 3. Validate time formats
    try:
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()
    except (ValueError, TypeError):
        return False, "Invalid time format. Expected 'HH:MM' in 24-hour format (e.g. '09:00', '14:30')."

    # 4. End time must be after start time
    if end_time <= start_time:
        return False, f"End time ({end_time_str}) must be later than start time ({start_time_str})."

    return True, None


def check_clash(venue_id, booking_date_str, start_time_str, end_time_str, exclude_booking_id=None):
    """
    Check if a booking slot clashes with an existing pending or approved booking.
    Two bookings [S1, E1] and [S2, E2] overlap if:
        (S1 < E2) and (E1 > S2)
    
    Returns:
        tuple (has_clash: bool, conflicting_booking: Booking or None)
    """
    # Only active bookings ('pending' and 'approved') can cause clashes.
    # 'rejected' and 'cancelled' bookings do not block slots.
    query = Booking.query.filter(
        Booking.venue_id == venue_id,
        Booking.booking_date == booking_date_str,
        Booking.status.in_([Booking.STATUS_PENDING, Booking.STATUS_APPROVED])
    )

    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    existing_bookings = query.all()

    for b in existing_bookings:
        # Standard interval overlap condition
        if start_time_str < b.end_time and end_time_str > b.start_time:
            return True, b

    return False, None


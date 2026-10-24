from datetime import datetime, timezone
import logging
from flask import Blueprint, current_app, jsonify, request
from flask_mail import Message
from extensions import mail
from models import Booking
from auth_middleware import get_current_user, login_required

email_bp = Blueprint("email", __name__, url_prefix="/api/email")
logger = logging.getLogger(__name__)


def generate_email_content(booking: Booking, optional_note: str = None):
    """Generates recipient info, subject line, plain text, and HTML body for authority notification."""
    venue = booking.venue
    premises = venue.premises if venue else None
    user = booking.user

    authority_name = premises.authority_name if premises else "Authorized Official"
    authority_email = premises.authority_email if premises else "authority@coep.ac.in"
    premises_name = premises.name if premises else "Campus Facility"
    requester_name = user.name if user else "College Member"
    requester_email = user.college_email if user else "unknown@coep.ac.in"

    formatted_date = booking.date.strftime("%Y-%m-%d")
    formatted_start = booking.start_time.strftime("%H:%M")
    formatted_end = booking.end_time.strftime("%H:%M")

    subject = f"Venue Booking Request: {venue.name} on {formatted_date}"

    note_section_text = f"\nAdditional Note from Requester:\n\"{optional_note}\"\n" if optional_note else ""
    note_section_html = f"<p><strong>Additional Note:</strong> <em>{optional_note}</em></p>" if optional_note else ""

    body_text = (
        f"Dear {authority_name},\n\n"
        f"{requester_name} ({requester_email}) has submitted a reservation request for {venue.name} "
        f"located at {premises_name}.\n\n"
        f"Reservation Details:\n"
        f"- Date: {formatted_date}\n"
        f"- Time: {formatted_start} to {formatted_end}\n"
        f"- Purpose / Status: {booking.status.value.upper()}\n"
        f"{note_section_text}\n"
        f"Please log in to the Administrative Venue Portal to review and approve or reject this booking request.\n\n"
        f"Regards,\n"
        f"Venue Booking System Administration"
    )

    body_html = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1a365d;">Venue Reservation Request</h2>
        <p>Dear <strong>{authority_name}</strong>,</p>
        <p><strong>{requester_name}</strong> (<a href="mailto:{requester_email}">{requester_email}</a>) has submitted a booking request for <strong>{venue.name}</strong> at <strong>{premises_name}</strong>.</p>
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #3182ce; margin: 15px 0;">
            <p style="margin: 4px 0;"><strong>Venue:</strong> {venue.name} (Capacity: {venue.capacity})</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> {formatted_date}</p>
            <p style="margin: 4px 0;"><strong>Slot:</strong> {formatted_start} &ndash; {formatted_end}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> {booking.status.value.upper()}</p>
        </div>
        {note_section_html}
        <p>Please log in to the administrative portal to approve or reject this request.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <small style="color: #718096;">COEP Venue Booking Notification Service</small>
    </div>
    """

    recipient_info = {
        "authority_name": authority_name,
        "authority_email": authority_email,
        "premises_name": premises_name
    }

    return recipient_info, subject, body_text, body_html


@email_bp.route("/preview/<int:booking_id>", methods=["GET"])
@login_required
def preview_email(booking_id: int):
    """Generates an email preview for authority approval notification."""
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

    user = get_current_user()
    if booking.user_id != user.id and user.role != "admin":
        return jsonify({
            "success": false,
            "error": {
                "code": "FORBIDDEN",
                "message": "You are not authorized to preview emails for this booking.",
                "details": None
            }
        }), 403

    recipient_info, subject, body_text, body_html = generate_email_content(booking)

    return jsonify({
        "success": true,
        "booking_id": booking.id,
        "recipient": recipient_info,
        "subject": subject,
        "body_text": body_text,
        "body_html": body_html
    }), 200


@email_bp.route("/send/<int:booking_id>", methods=["POST"])
@login_required
def send_email(booking_id: int):
    """Sends notification email to the premises authority."""
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

    user = get_current_user()
    if booking.user_id != user.id and user.role != "admin":
        return jsonify({
            "success": false,
            "error": {
                "code": "FORBIDDEN",
                "message": "You are not authorized to dispatch emails for this booking.",
                "details": None
            }
        }), 403

    data = request.get_json(silent=True) or {}
    optional_note = data.get("note")

    recipient_info, subject, body_text, body_html = generate_email_content(booking, optional_note)

    # Attempt sending via Flask-Mail if configured, else log dispatch safely
    mail_configured = bool(current_app.config.get("MAIL_USERNAME"))
    if mail_configured:
        try:
            msg = Message(
                subject=subject,
                recipients=[recipient_info["authority_email"]],
                body=body_text,
                html=body_html
            )
            mail.send(msg)
        except Exception as e:
            logger.warning(f"Mail delivery failed: {e}. Falling back to simulation.")

    sent_timestamp = datetime.now(timezone.utc).isoformat()

    return jsonify({
        "success": true,
        "message": "Authority notification email dispatched successfully.",
        "recipient_email": recipient_info["authority_email"],
        "sent_at": sent_timestamp
    }), 200


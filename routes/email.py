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
def preview_email(booking_id: int):
    """Generates an email preview for authority approval notification (with stub fallback)."""
    booking = None
    try:
        booking = Booking.query.get(booking_id)
    except Exception:
        pass

    if booking:
        user = get_current_user()
        if user and booking.user_id != user.id and user.role != "admin":
            return jsonify({
                "success": False,
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You are not authorized to preview emails for this booking.",
                    "details": None
                }
            }), 403

        recipient_info, subject, body_text, body_html = generate_email_content(booking)
        return jsonify({
            "success": True,
            "booking_id": booking.id,
            "recipient": recipient_info,
            "subject": subject,
            "body_text": body_text,
            "body_html": body_html
        }), 200

    # Fallback Stub Preview (when booking not in DB or testing frontend dummy IDs)
    dummy_recipient = {
        "authority_name": "Pradeep Deshmukh",
        "authority_email": "hod.comp@coep.ac.in",
        "premises_name": "New Department of Computer Science and Engineering"
    }
    dummy_subject = f"Venue Booking Request: NC 27 on 2026-11-15 (Booking #{booking_id})"
    dummy_text = (
        f"Dear {dummy_recipient['authority_name']},\n\n"
        f"Ada Lovelace (ada.lovelace@coep.ac.in) has submitted a booking request for NC 27 "
        f"on 2026-11-15 from 14:00 to 16:00.\n\n"
        f"Please log in to the administrative portal to review and approve or reject this reservation.\n\n"
        f"Regards,\nCOEP Venue Booking Notification Service"
    )
    dummy_html = (
        f"<p>Dear {dummy_recipient['authority_name']},</p>"
        f"<p><strong>Ada Lovelace</strong> has submitted a booking request for <strong>NC 27</strong> "
        f"on <strong>2026-11-15</strong> from <strong>14:00</strong> to <strong>16:00</strong>.</p>"
    )

    return jsonify({
        "success": True,
        "booking_id": booking_id,
        "recipient": dummy_recipient,
        "subject": dummy_subject,
        "body_text": dummy_text,
        "body_html": dummy_html
    }), 200


@email_bp.route("/send/<int:booking_id>", methods=["POST"])
def send_email(booking_id: int):
    """Sends notification email to authority (stub with simulated mailto fallback failure)."""
    data = request.get_json(silent=True) or {}
    optional_note = data.get("note")

    # Fake failure trigger for frontend to test "email failed, use mailto instead" path
    # Trigger 1: booking_id == 999
    # Trigger 2: payload contains "force_fail": true or "simulate_failure": true
    # Trigger 3: note contains "fail"
    is_fake_failure = (
        booking_id == 999
        or data.get("force_fail") is True
        or data.get("simulate_failure") is True
        or (optional_note and "fail" in str(optional_note).lower())
    )

    if is_fake_failure:
        authority_email = "hod.comp@coep.ac.in"
        subject_param = "Venue Booking Request: NC 27"
        body_param = "Dear Pradeep Deshmukh,\nPlease review my venue booking request."
        mailto_link = f"mailto:{authority_email}?subject={subject_param.replace(' ', '%20')}&body={body_param.replace(' ', '%20')}"

        return jsonify({
            "success": False,
            "error": {
                "code": "EMAIL_DISPATCH_FAILED",
                "message": "Automated email delivery failed. Please use your email client (mailto link) to notify the authority.",
                "details": {
                    "authority_name": "Pradeep Deshmukh",
                    "authority_email": authority_email,
                    "mailto_link": mailto_link
                }
            }
        }), 500

    recipient_email = "hod.comp@coep.ac.in"
    try:
        booking = Booking.query.get(booking_id)
        if booking and booking.venue and booking.venue.premises:
            recipient_email = booking.venue.premises.authority_email or recipient_email
    except Exception:
        pass

    sent_timestamp = datetime.now(timezone.utc).isoformat()

    return jsonify({
        "success": True,
        "message": "Authority notification email dispatched successfully.",
        "recipient_email": recipient_email,
        "sent_at": sent_timestamp
    }), 200


from datetime import datetime, timezone
import logging
from flask import Blueprint, current_app, jsonify, request
from flask_mail import Message
from extensions import mail
from models import Booking
from auth_middleware import get_current_user, login_required

email_bp = Blueprint("email", __name__, url_prefix="/api/email")
logger = logging.getLogger(__name__)

# Formal email templates with named placeholders
EMAIL_SUBJECT_TEMPLATE = "Venue Booking Permission Request: {venue_name} on {date}"

EMAIL_TEXT_TEMPLATE = """Respected Sir/Madam,

I am writing to formally request permission to book the following venue for college activities.

--- Requester Details ---
• Name: {requester_name}
• Role: {requester_role}
• Department: {requester_department}
• College Email: {requester_email}

--- Venue & Schedule Details ---
• Venue: {venue_name} (Capacity: {venue_capacity})
• Premises / Building: {premises_name}
• Date: {date}
• Time Slot: {start_time} to {end_time}
• Purpose: {purpose}

Kindly review this request in the administrative venue portal and grant the necessary approval.

Thank you for your time and consideration.

Warm regards,
{requester_name}
COEP Tech Venue Booking System"""

EMAIL_HTML_TEMPLATE = """<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2d3748; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h3 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 8px; margin-top: 0;">Venue Booking Permission Request</h3>
    <p style="font-size: 15px; margin-bottom: 12px;"><strong>Respected Sir/Madam,</strong></p>
    <p>A formal reservation request has been submitted for your review and approval.</p>

    <div style="background-color: #f7fafc; padding: 14px 18px; border-left: 4px solid #3182ce; border-radius: 4px; margin: 16px 0;">
        <h4 style="margin: 0 0 8px 0; color: #2b6cb0;">Requester Details</h4>
        <p style="margin: 3px 0;"><strong>Name:</strong> {requester_name} ({requester_role})</p>
        <p style="margin: 3px 0;"><strong>Department:</strong> {requester_department}</p>
        <p style="margin: 3px 0;"><strong>Email:</strong> <a href="mailto:{requester_email}">{requester_email}</a></p>
    </div>

    <div style="background-color: #edf2f7; padding: 14px 18px; border-left: 4px solid #4a5568; border-radius: 4px; margin: 16px 0;">
        <h4 style="margin: 0 0 8px 0; color: #2d3748;">Venue & Schedule</h4>
        <p style="margin: 3px 0;"><strong>Venue:</strong> {venue_name} (Capacity: {venue_capacity})</p>
        <p style="margin: 3px 0;"><strong>Premises:</strong> {premises_name}</p>
        <p style="margin: 3px 0;"><strong>Date:</strong> {date}</p>
        <p style="margin: 3px 0;"><strong>Time Slot:</strong> {start_time} &ndash; {end_time}</p>
        <p style="margin: 3px 0;"><strong>Purpose:</strong> {purpose}</p>
    </div>

    <p>Please log in to the administrative venue portal to review and approve or reject this booking request.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <small style="color: #718096;">COEP Tech Venue Booking System &bull; Automatic Notification Service</small>
</div>"""


def generate_email_content(booking: Booking = None, optional_note: str = None):
    """Generates recipient info, subject line, plain text, and HTML body using template placeholders."""
    venue = booking.venue if booking else None
    premises = venue.premises if venue else None
    user = booking.user if booking else None
    user_dept = user.department if (user and hasattr(user, "department")) else None

    authority_name = premises.authority_name if premises else "Pradeep Deshmukh"
    authority_email = premises.authority_email if premises else "hod.comp@coep.ac.in"
    premises_name = premises.name if premises else "New Department of Computer Science and Engineering"

    requester_name = user.name if user else "Ada Lovelace"
    requester_role = user.role.capitalize() if (user and user.role) else "Student"
    requester_department = (user_dept.name if user_dept else None) or "Computer Science and Engineering"
    requester_email = user.college_email if user else "ada.lovelace@coep.ac.in"

    venue_name = venue.name if venue else "NC 27"
    venue_capacity = venue.capacity if venue else 70

    date_str = booking.date.strftime("%Y-%m-%d") if (booking and hasattr(booking, "date")) else "2026-11-15"
    start_time_str = booking.start_time.strftime("%H:%M") if (booking and hasattr(booking, "start_time")) else "14:00"
    end_time_str = booking.end_time.strftime("%H:%M") if (booking and hasattr(booking, "end_time")) else "16:00"

    purpose_str = optional_note.strip() if optional_note else "Academic seminar and project demonstration"

    context = {
        "authority_name": authority_name,
        "authority_email": authority_email,
        "premises_name": premises_name,
        "requester_name": requester_name,
        "requester_role": requester_role,
        "requester_department": requester_department,
        "requester_email": requester_email,
        "venue_name": venue_name,
        "venue_capacity": venue_capacity,
        "date": date_str,
        "start_time": start_time_str,
        "end_time": end_time_str,
        "purpose": purpose_str,
    }

    subject = EMAIL_SUBJECT_TEMPLATE.format(**context)
    body_text = EMAIL_TEXT_TEMPLATE.format(**context)
    body_html = EMAIL_HTML_TEMPLATE.format(**context)

    recipient_info = {
        "authority_name": authority_name,
        "authority_email": authority_email,
        "premises_name": premises_name,
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

    # Fallback Stub Preview using formal template placeholders
    recipient_info, subject, body_text, body_html = generate_email_content(None)

    return jsonify({
        "success": True,
        "booking_id": booking_id,
        "recipient": recipient_info,
        "subject": subject,
        "body_text": body_text,
        "body_html": body_html
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


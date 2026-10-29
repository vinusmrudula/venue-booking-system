import urllib.parse
from flask import current_app
from flask_mail import Mail, Message

# Global Flask-Mail extension instance
mail = Mail()

def generate_mailto_link(recipient_email, subject, body):
    """
    Generate an RFC-compliant mailto: URI with pre-filled subject and body.
    Allows frontend clients to open default mail client as an instant fallback.
    """
    encoded_subject = urllib.parse.quote(subject)
    encoded_body = urllib.parse.quote(body)
    return f"mailto:{recipient_email}?subject={encoded_subject}&body={encoded_body}"


def build_email_content(booking, user):
    """
    Build email subject, plain text body, and HTML body for authority notification.
    """
    venue_name = booking.venue.name if booking.venue else f"Venue #{booking.venue_id}"
    dept_name = booking.venue.department.name if booking.venue and booking.venue.department else "College Department"
    
    subject = f"[Venue Booking Request] {venue_name} on {booking.booking_date} ({booking.start_time} - {booking.end_time})"

    text_body = f"""Dear Authority / HOD,

A new venue booking request has been submitted that requires your approval:

--------------------------------------------------
VENUE DETAILS:
- Venue: {venue_name}
- Department: {dept_name}
- Category: {booking.venue.category if booking.venue else 'Classroom'}
- Seating: {booking.venue.benches if booking.venue else 'N/A'} benches (approx. {booking.venue.capacity if booking.venue else 'N/A'} seats)

SCHEDULE:
- Date: {booking.booking_date}
- Time: {booking.start_time} to {booking.end_time}

REQUESTER DETAILS:
- Name: {user.name}
- Email: {user.email}
- Department: {user.department or 'N/A'}
- Role: {user.role.title()}

PURPOSE OF BOOKING:
{booking.purpose}
Expected Attendees: {booking.attendees_count}

ACTION REQUIRED:
Please review and take action via the Venue Booking System dashboard:
- Approve Booking ID: #{booking.id}
- Reject Booking ID: #{booking.id}
--------------------------------------------------
This is an automated notification from the College Venue Booking System.
"""

    html_body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #2b6cb0; border-bottom: 2px solid #3182ce; padding-bottom: 8px;">Venue Booking Request</h2>
        <p>A new venue booking request requires your review and approval:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #f7fafc;"><td style="padding: 8px; font-weight: bold; width: 35%;">Venue:</td><td style="padding: 8px;">{venue_name} ({dept_name})</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td style="padding: 8px;">{booking.booking_date}</td></tr>
            <tr style="background-color: #f7fafc;"><td style="padding: 8px; font-weight: bold;">Time Slot:</td><td style="padding: 8px;">{booking.start_time} - {booking.end_time}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Requested By:</td><td style="padding: 8px;">{user.name} ({user.email})</td></tr>
            <tr style="background-color: #f7fafc;"><td style="padding: 8px; font-weight: bold;">Purpose:</td><td style="padding: 8px;">{booking.purpose}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Attendees:</td><td style="padding: 8px;">{booking.attendees_count}</td></tr>
        </table>
        
        <div style="margin-top: 20px; padding: 12px; background: #edf2f7; border-radius: 6px; font-size: 0.9em;">
            <strong>Booking ID:</strong> #{booking.id} | Status: <strong>PENDING APPROVAL</strong>
        </div>
        
        <p style="font-size: 0.85em; color: #718096; margin-top: 20px;">
            College Venue Booking Platform - Automated Notification
        </p>
    </div>
    """

    return subject, text_body, html_body


def send_booking_email_with_fallback(booking, user):
    """
    Sends email to the venue authority.
    If SMTP succeeds -> email_status = 'sent'
    If MAIL_SUPPRESS_SEND=True -> email_status = 'suppressed' (logged cleanly)
    If SMTP fails/network down -> logs error, email_status = 'failed'
    
    ALWAYS returns mailto fallback link so frontend users never get stuck!
    """
    recipient_email = booking.authority_email
    if not recipient_email and booking.venue and booking.venue.authority:
        recipient_email = booking.venue.authority.email

    if not recipient_email:
        recipient_email = "admin@coeptech.ac.in"

    subject, text_body, html_body = build_email_content(booking, user)
    mailto_link = generate_mailto_link(recipient_email, subject, text_body)
    
    # Store mailto fallback on booking
    booking.mailto_fallback = mailto_link

    # Check if sending is suppressed (default in dev / testing)
    if current_app.config.get('MAIL_SUPPRESS_SEND', True):
        current_app.logger.info(f"[EMAIL MOCK] Suppressed send to {recipient_email}. Subject: {subject}")
        booking.email_status = 'sent_to_admin'
        return {
            'success': True,
            'status': 'sent_to_admin',
            'message': f'Request routed directly to Admin account. Authority: {recipient_email}',
            'mailto_link': mailto_link
        }

    # Attempt real SMTP transmission
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient_email],
            body=text_body,
            html=html_body,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        mail.send(msg)
        booking.email_status = 'sent'
        current_app.logger.info(f"[EMAIL SENT] Successfully sent notification to {recipient_email}")
        return {
            'success': True,
            'status': 'sent',
            'message': f'Email successfully sent to {recipient_email}',
            'mailto_link': mailto_link
        }
    except Exception as e:
        # Failure path when SMTP is down / wrong credentials: log and do not crash
        current_app.logger.warning(f"[EMAIL ERROR] SMTP failed: {str(e)}. Falling back to mailto.")
        booking.email_status = 'failed'
        return {
            'success': False,
            'status': 'failed',
            'message': f'SMTP server error: {str(e)}. Please use mailto fallback.',
            'mailto_link': mailto_link
        }


def send_admin_registration_request_email(user, host_url='http://127.0.0.1:5000'):
    """
    Send an email to the designated super-admin approvers asking for verification
    to accept or reject the newly requested admin account.
    """
    approvers = current_app.config.get('ADMIN_REGISTRATION_APPROVERS', [
        'vinaynm25.aiml@coeptech.ac.in',
        'vazeba25.comp@coeptech.ac.in',
        'vhankalasph25.comp@coeptech.ac.in'
    ])

    base_url = host_url.rstrip('/')
    accept_url = f"{base_url}/api/auth/admin-verify?token={user.verification_token}&action=accept"
    reject_url = f"{base_url}/api/auth/admin-verify?token={user.verification_token}&action=reject"

    subject = f"[URGENT - Admin Account Verification] New Admin Registration: {user.name} ({user.email})"
    text_body = f"""Dear Administrator,

A new user has requested to create an ADMIN profile on BookIt:

Name: {user.name}
Email: {user.email}
Department: {user.department or 'N/A'}
Requested Role: Administrator

Only ONE verification is required from any of the three authorized approvers.

Click below to take action:
- ACCEPT & ACTIVATE ADMIN ACCOUNT:
  {accept_url}

- REJECT & CANCEL ADMIN ACCOUNT:
  {reject_url}

Thank you,
BookIt Security & Governance System
"""

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px;">Admin Account Authorization Request</h2>
        <p>A user has registered on <strong>BookIt</strong> and requested <strong>Administrator Privileges</strong>:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 6px; font-weight: bold; width: 35%;">Applicant Name:</td><td>{user.name}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Applicant Email:</td><td>{user.email}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Department:</td><td>{user.department or 'N/A'}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Requested Role:</td><td><strong style="color: #b45309;">Administrator</strong></td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Status:</td><td><span style="background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 4px; font-weight: 600;">Pending Approval</span></td></tr>
        </table>

        <p style="font-size: 0.9em; color: #4b5563;">
            <em>Note: Either of the 3 authorized approvers ({", ".join(approvers)}) can verify this request. Only one approval is needed.</em>
        </p>

        <div style="margin: 25px 0; display: flex; gap: 15px;">
            <a href="{accept_url}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 12px;">✓ Accept Admin Account</a>
            <a href="{reject_url}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">✕ Reject Request</a>
        </div>
        
        <p style="font-size: 0.8em; color: #9ca3af; margin-top: 20px;">
            If the buttons above do not work, copy and paste the links below into your browser:<br>
            Accept: {accept_url}<br>
            Reject: {reject_url}
        </p>
    </div>
    """

    mailto_links = []
    for approver in approvers:
        mailto_links.append(generate_mailto_link(approver, subject, text_body))

    # If email sending is suppressed
    if current_app.config.get('MAIL_SUPPRESS_SEND', True):
        current_app.logger.info(f"[ADMIN REGISTRATION NOTICE] Notification for {user.email} logged to approvers: {approvers}")
        return {
            'success': True,
            'status': 'suppressed',
            'approvers': approvers,
            'accept_url': accept_url,
            'reject_url': reject_url,
            'mailto_links': mailto_links
        }

    try:
        msg = Message(
            subject=subject,
            recipients=approvers,
            body=text_body,
            html=html_body,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        mail.send(msg)
        return {
            'success': True,
            'status': 'sent',
            'approvers': approvers,
            'accept_url': accept_url,
            'reject_url': reject_url
        }
    except Exception as e:
        current_app.logger.warning(f"[EMAIL ERROR] Admin verification email failed: {str(e)}")
        return {
            'success': False,
            'status': 'failed',
            'error': str(e),
            'approvers': approvers,
            'accept_url': accept_url,
            'reject_url': reject_url,
            'mailto_links': mailto_links
        }



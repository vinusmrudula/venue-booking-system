import uuid
from flask import Blueprint, request, jsonify, current_app
from app.models import db, User
from app.utils.auth_middleware import generate_token, token_required
from app.utils.email_service import send_admin_registration_request_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user account (Student, Faculty, or Admin).
    Validates college email domain and hashes password.
    """
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    department = data.get('department', '').strip()
    role = data.get('role', 'student').strip().lower()

    # Basic validations
    if not name or not email or not password:
        return jsonify({
            'success': False,
            'message': 'Name, email, and password are required fields.'
        }), 400

    if len(password) < 6:
        return jsonify({
            'success': False,
            'message': 'Password must be at least 6 characters long.'
        }), 400

    # Validate college domain if configured
    allowed_domain = current_app.config.get('ALLOWED_EMAIL_DOMAIN')
    if allowed_domain and not (email.endswith(allowed_domain) or email.endswith('.ac.in')):
        return jsonify({
            'success': False,
            'message': f'Please register using your valid college email ({allowed_domain}).'
        }), 400

    # Ensure role is valid
    if role not in ['student', 'faculty', 'admin']:
        role = 'student'

    # Check for duplicate email
    if User.query.filter_by(email=email).first():
        return jsonify({
            'success': False,
            'message': f'An account with email {email} already exists.'
        }), 409

    # If role is admin, require verification from either of the 3 approvers
    is_admin_req = (role == 'admin')
    user_status = 'pending_approval' if is_admin_req else 'approved'
    v_token = uuid.uuid4().hex if is_admin_req else None

    # Create new user
    new_user = User(
        name=name,
        email=email,
        department=department,
        role=role,
        status=user_status,
        verification_token=v_token
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    if is_admin_req:
        host_url = request.host_url
        email_info = send_admin_registration_request_email(new_user, host_url)
        return jsonify({
            'success': True,
            'requires_approval': True,
            'message': 'Admin account registration submitted! An authorization email has been sent to the designated administrators (vinaynm25.aiml@coeptech.ac.in, vazeba25.comp@coeptech.ac.in, vhankalasph25.comp@coeptech.ac.in). Your profile will be activated once verified.',
            'data': {
                'user': new_user.to_dict(),
                'email_info': email_info
            }
        }), 201

    # Generate JWT token for immediate login (student / faculty)
    token = generate_token(new_user)

    return jsonify({
        'success': True,
        'message': 'User registered successfully!',
        'data': {
            'user': new_user.to_dict(),
            'token': token
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate an existing user and return a JWT bearer token.
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Both email and password are required.'
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({
            'success': False,
            'message': 'Invalid email or password.'
        }), 401

    if user.role == 'admin' and user.status != 'approved':
        return jsonify({
            'success': False,
            'message': 'Your Admin profile is pending authorization from the designated administrators (vinaynm25.aiml@coeptech.ac.in, vazeba25.comp@coeptech.ac.in, vhankalasph25.comp@coeptech.ac.in).'
        }), 403

    token = generate_token(user)

    return jsonify({
        'success': True,
        'message': f'Welcome back, {user.name}!',
        'data': {
            'user': user.to_dict(),
            'token': token
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user_profile(current_user):
    """
    Retrieve profile details of the authenticated user.
    """
    return jsonify({
        'success': True,
        'data': current_user.to_dict()
    }), 200


@auth_bp.route('/admin-verify', methods=['GET', 'POST'])
def admin_verify():
    """
    Verification endpoint for approving or rejecting a newly registered admin account.
    Accessed by either of the 3 super-admin emails via secure verification token.
    Only one verification is needed.
    """
    token = request.args.get('token') or (request.get_json() or {}).get('token')
    action = (request.args.get('action') or (request.get_json() or {}).get('action') or '').lower()

    if not token or action not in ['accept', 'approve', 'reject']:
        return jsonify({
            'success': False,
            'message': 'Invalid verification parameters. Token and valid action (accept/reject) are required.'
        }), 400

    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return """
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2 style="color:#dc2626;">Verification Link Invalid or Already Used</h2>
            <p>This admin authorization request has either already been processed or does not exist.</p>
        </div>
        """, 404

    if action in ['accept', 'approve']:
        user.status = 'approved'
        user.verification_token = None
        db.session.commit()
        return f"""
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2 style="color:#059669;">✓ Admin Account Activated!</h2>
            <p>The administrator profile for <strong>{user.name}</strong> ({user.email}) has been successfully approved.</p>
            <p>They can now sign in with administrative privileges.</p>
            <p><a href="/" style="color:#0f766e; font-weight:bold;">Go to BookIt Portal</a></p>
        </div>
        """, 200
    else:
        # Rejected: delete user or mark rejected
        user_name = user.name
        user_email = user.email
        db.session.delete(user)
        db.session.commit()
        return f"""
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2 style="color:#dc2626;">✕ Admin Request Rejected</h2>
            <p>The administrator registration request for <strong>{user_name}</strong> ({user_email}) has been rejected and removed.</p>
            <p><a href="/" style="color:#0f766e; font-weight:bold;">Go to BookIt Portal</a></p>
        </div>
        """, 200



from flask import Blueprint, request, jsonify, current_app
from app.models import db, User
from app.utils.auth_middleware import generate_token, token_required

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

    # Create new user
    new_user = User(
        name=name,
        email=email,
        department=department,
        role=role
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    # Generate JWT token for immediate login
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


import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from app.models import db, User

def generate_token(user):
    """
    Generate a signed JWT token containing user id, email, and role.
    Valid for the duration specified in Config.
    """
    expiration_hours = current_app.config.get('JWT_EXPIRATION_HOURS', 24)
    now = datetime.now(timezone.utc)
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'name': user.name,
        'exp': now + timedelta(hours=expiration_hours),
        'iat': now
    }
    token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    return token


def token_required(f):
    """
    Decorator for protected endpoints.
    Reads token from 'Authorization: Bearer <token>' header.
    Attaches current_user to request.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        token = None

        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
            elif len(parts) == 1:
                token = parts[0]
        
        # Fallback to query parameter (helpful for testing in browser)
        if not token:
            token = request.args.get('token')

        if not token:
            return jsonify({
                'success': False,
                'message': 'Authentication token is missing. Please log in.'
            }), 401

        try:
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = db.session.get(User, payload['user_id'])
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User belonging to this token no longer exists.'
                }), 401
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired. Please log in again.'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid authentication token.'
            }), 401

        # Pass current_user to route
        return f(current_user, *args, **kwargs)

    return decorated


def admin_required(f):
    """
    Decorator for endpoints restricted strictly to administrators.
    """
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({
                'success': False,
                'message': 'Admin privilege required to perform this action.'
            }), 403
        return f(current_user, *args, **kwargs)

    return decorated

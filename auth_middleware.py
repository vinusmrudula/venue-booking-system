from functools import wraps
from flask import jsonify, request, session
from models import User


def get_current_user():
    """Retrieves the currently authenticated user.

    Supports:
    1. 'Authorization: Bearer <token>' header (standard for SPA / React frontends)
    2. Flask signed session cookie ('user_id')
    3. 'X-User-Id' request header (helpful for Postman/cURL manual testing)
    """
    user_id = session.get("user_id")

    # 1. Check Authorization: Bearer <token>
    if not user_id:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            raw_token = auth_header.split(" ", 1)[1].strip()
            clean_token = raw_token.replace("token_", "").replace("user_", "")
            if clean_token.isdigit():
                user_id = int(clean_token)

    # 2. Fallback to X-User-Id header for direct API testing / tools
    if not user_id:
        user_id_header = request.headers.get("X-User-Id")
        if user_id_header and user_id_header.isdigit():
            user_id = int(user_id_header)

    if user_id:
        return User.query.get(user_id)
    return None


def login_required(f):
    """Decorator ensuring that an endpoint requires an authenticated session."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({
                "error": "Authentication required. Please sign in.",
                "code": "UNAUTHORIZED"
            }), 401
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """Decorator ensuring that an endpoint requires an administrator account."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({
                "error": "Authentication required. Please sign in.",
                "code": "UNAUTHORIZED"
            }), 401
        if user.role != "admin":
            return jsonify({
                "error": "Forbidden: Administrator privileges required.",
                "code": "FORBIDDEN"
            }), 403
        return f(*args, **kwargs)
    return decorated_function


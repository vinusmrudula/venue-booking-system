import re
from flask import Blueprint, jsonify, request, session
from extensions import db
from models import Department, User
from auth_middleware import get_current_user, login_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = re.compile(r"^[\w\.-]+@([\w\.-]+\.)+[a-zA-Z]{2,}$")
VALID_ROLES = {"student", "faculty", "admin"}


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account.
    Expects JSON:
    - name (str, required)
    - college_email (str, required)
    - password (str, required, >= 6 characters)
    - role (str, optional, defaults to 'student')
    - department_id (int, optional)
    """
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    college_email = data.get("college_email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "student").strip().lower()
    department_id = data.get("department_id")

    # Validations
    if not name:
        return jsonify({"error": "Field 'name' is required."}), 400

    if not college_email or not EMAIL_REGEX.match(college_email):
        return jsonify({"error": "A valid 'college_email' is required."}), 400

    if not password or len(password) < 6:
        return jsonify({"error": "Field 'password' must be at least 6 characters long."}), 400

    if role not in VALID_ROLES:
        return jsonify({"error": f"Invalid role '{role}'. Allowed roles: {sorted(list(VALID_ROLES))}"}), 400

    if department_id is not None:
        department = Department.query.get(department_id)
        if not department:
            return jsonify({"error": f"Department with ID {department_id} not found."}), 400

    # Check for existing email
    existing_user = User.query.filter_by(college_email=college_email).first()
    if existing_user:
        return jsonify({"error": "An account with this college email already exists."}), 409

    # Create user
    user = User(
        name=name,
        college_email=college_email,
        role=role,
        department_id=department_id,
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Automatically set session
    session["user_id"] = user.id
    session["user_role"] = user.role

    return jsonify({
        "message": "User registered successfully.",
        "user": user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a user using college email and password.
    Expects JSON:
    - college_email (str, required)
    - password (str, required)
    """
    data = request.get_json(silent=True) or {}

    college_email = data.get("college_email", "").strip().lower()
    password = data.get("password", "")

    if not college_email or not password:
        return jsonify({"error": "Both 'college_email' and 'password' are required."}), 400

    user = User.query.filter_by(college_email=college_email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid college email or password."}), 401

    # Store user in session
    session["user_id"] = user.id
    session["user_role"] = user.role

    return jsonify({
        "message": "Login successful.",
        "user": user.to_dict()
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Logs out the currently active user session."""
    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200


@auth_bp.route("/me", methods=["GET"])
def get_me():
    """Returns the profile of the currently logged-in user."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated. Please sign in."}), 401

    return jsonify({
        "authenticated": True,
        "user": user.to_dict()
    }), 200


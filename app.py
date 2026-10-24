from flask import Flask, jsonify, request
from config import Config
from extensions import db, mail
from models import Department, Premises
from routes import (
    admin_bp,
    auth_bp,
    availability_bp,
    bookings_bp,
    email_bp,
    venues_bp,
)
from routes.admin import update_booking_status
from routes.availability import check_availability
from routes.email import preview_email, send_email


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)

    # Register blueprints for modular features
    app.register_blueprint(auth_bp)
    app.register_blueprint(venues_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(availability_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(email_bp)

    # Base Health Check Route
    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "message": "Venue Booking System API is running!",
            "status": "healthy"
        })

    # Dedicated API Health Endpoint
    @app.route("/api/health", methods=["GET"])
    def api_health():
        return jsonify({
            "status": "healthy",
            "message": "Venue Booking System API is running smoothly!"
        }), 200

    # Metadata routes for frontend search filter dropdowns
    @app.route("/api/departments", methods=["GET"])
    def get_departments():
        departments = Department.query.order_by(Department.name.asc()).all()
        return jsonify([dept.to_dict() for dept in departments])

    @app.route("/api/premises", methods=["GET"])
    def get_premises():
        premises_list = Premises.query.order_by(Premises.name.asc()).all()
        return jsonify([premise.to_dict() for premise in premises_list])

    # REST aliases for search filters and categories dropdown stubs
    @app.route("/api/search-filters", methods=["GET"])
    def search_filters_alias():
        from routes.venues import get_filter_options
        return get_filter_options()

    @app.route("/api/categories", methods=["GET"])
    def categories_alias():
        from routes.venues import get_categories
        return get_categories()

    # REST alias: GET /api/venues/<id>/availability
    @app.route("/api/venues/<int:venue_id>/availability", methods=["GET"])
    def venue_availability_alias(venue_id: int):
        # Injects venue_id into query arguments for consistent availability logic
        request.args = request.args.copy()
        return check_availability()

    # REST alias: GET /api/bookings/mine (matches /api/bookings/my)
    @app.route("/api/bookings/mine", methods=["GET"])
    def booking_mine_alias():
        from routes.bookings import get_my_bookings
        return get_my_bookings()

    # REST alias: GET /api/bookings/<id>/email-preview
    @app.route("/api/bookings/<int:booking_id>/email-preview", methods=["GET"])
    def booking_email_preview_alias(booking_id: int):
        return preview_email(booking_id)

    # REST alias: POST /api/bookings/<id>/send-email
    @app.route("/api/bookings/<int:booking_id>/send-email", methods=["POST"])
    def booking_send_email_alias(booking_id: int):
        return send_email(booking_id)

    # REST alias: PATCH /api/bookings/<id>/status (for admin approvals/rejections)
    @app.route("/api/bookings/<int:booking_id>/status", methods=["PATCH"])
    def patch_booking_status(booking_id: int):
        return update_booking_status(booking_id)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

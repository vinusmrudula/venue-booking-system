from flask import Flask, jsonify
from config import Config
from extensions import db
from models import Department, Premises
from routes import admin_bp, auth_bp, venues_bp
from routes.admin import update_booking_status


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Register blueprints (Auth, Venues Catalog, Admin)
    app.register_blueprint(auth_bp)
    app.register_blueprint(venues_bp)
    app.register_blueprint(admin_bp)

    # Base Health Check Route
    @app.route("/")
    def home():
        return jsonify({
            "message": "Venue Booking System API is running!",
            "status": "healthy"
        })

    # Metadata routes for frontend search filter dropdowns
    @app.route("/api/departments", methods=["GET"])
    def get_departments():
        departments = Department.query.order_by(Department.name.asc()).all()
        return jsonify([dept.to_dict() for dept in departments])

    @app.route("/api/premises", methods=["GET"])
    def get_premises():
        premises_list = Premises.query.order_by(Premises.name.asc()).all()
        return jsonify([premise.to_dict() for premise in premises_list])

    # REST alias for booking approval/rejection (/api/bookings/{id}/status)
    @app.route("/api/bookings/<int:booking_id>/status", methods=["PATCH"])
    def patch_booking_status(booking_id: int):
        return update_booking_status(booking_id)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

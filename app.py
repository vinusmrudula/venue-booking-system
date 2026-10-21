from flask import Flask, jsonify
from config import Config
from extensions import db
from models import Booking, Department, Premises, User, Venue


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with the application
    db.init_app(app)

    @app.route("/")
    def home():
        return jsonify({
            "message": "Venue Booking System API is running!",
            "status": "healthy"
        })

    @app.route("/api/departments", methods=["GET"])
    def get_departments():
        departments = Department.query.all()
        return jsonify([dept.to_dict() for dept in departments])

    @app.route("/api/premises", methods=["GET"])
    def get_premises():
        premises_list = Premises.query.all()
        return jsonify([premise.to_dict() for premise in premises_list])

    @app.route("/api/venues", methods=["GET"])
    def get_venues():
        venues = Venue.query.all()
        return jsonify([venue.to_dict() for venue in venues])

    @app.route("/api/users", methods=["GET"])
    def get_users():
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])

    @app.route("/api/bookings", methods=["GET"])
    def get_bookings():
        bookings = Booking.query.all()
        return jsonify([booking.to_dict() for booking in bookings])

    return app


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

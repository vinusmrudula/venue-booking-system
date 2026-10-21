from flask import Flask, jsonify
from config import Config
from extensions import db
from models import Department, Premises


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

    return app


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

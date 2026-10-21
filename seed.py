from app import create_app
from extensions import db
from models import Department, Premises


def seed_database():
    app = create_app()
    with app.app_context():
        db.create_all()

        print("Seeding departments...")
        departments_data = [
            {"name": "Computer Science & Engineering"},
            {"name": "Electronics & Communication Engineering"},
            {"name": "Mechanical Engineering"},
            {"name": "Information Technology"},
        ]

        for dept in departments_data:
            existing = Department.query.filter_by(name=dept["name"]).first()
            if not existing:
                db.session.add(Department(name=dept["name"]))

        print("Seeding premises (buildings/complexes)...")
        premises_data = [
            {
                "name": "Academic Complex",
                "authority_name": "Dr. Ramesh Sharma",
                "authority_email": "academic.complex@college.edu",
            },
            {
                "name": "New CSE",
                "authority_name": "Prof. Priya Verma",
                "authority_email": "new.cse@college.edu",
            },
            {
                "name": "Sir MV Seminar Complex",
                "authority_name": "Dr. Anand Kumar",
                "authority_email": "seminar.authority@college.edu",
            },
            {
                "name": "Central Auditorium Block",
                "authority_name": "Admin Officer John",
                "authority_email": "auditorium.admin@college.edu",
            },
        ]

        for p in premises_data:
            existing = Premises.query.filter_by(name=p["name"]).first()
            if not existing:
                db.session.add(
                    Premises(
                        name=p["name"],
                        authority_name=p["authority_name"],
                        authority_email=p["authority_email"],
                    )
                )

        db.session.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    seed_database()

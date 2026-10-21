from app import create_app
from extensions import db
from models import Department, Premises, User, Venue, VenueCategory


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

        departments_map = {}
        for dept in departments_data:
            existing = Department.query.filter_by(name=dept["name"]).first()
            if not existing:
                department = Department(name=dept["name"])
                db.session.add(department)
                db.session.flush()
                departments_map[dept["name"]] = department
            else:
                departments_map[dept["name"]] = existing

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

        premises_map = {}
        for p in premises_data:
            existing = Premises.query.filter_by(name=p["name"]).first()
            if not existing:
                premise = Premises(
                    name=p["name"],
                    authority_name=p["authority_name"],
                    authority_email=p["authority_email"],
                )
                db.session.add(premise)
                db.session.flush()
                premises_map[p["name"]] = premise
            else:
                premises_map[p["name"]] = existing

        print("Seeding venues...")
        venues_data = [
            {
                "name": "NC 27",
                "category": VenueCategory.CLASSROOM,
                "capacity": 65,
                "premises": "Academic Complex",
                "department": "Computer Science & Engineering",
            },
            {
                "name": "Main Auditorium Hall",
                "category": VenueCategory.AUDITORIUM,
                "capacity": 850,
                "premises": "Central Auditorium Block",
                "department": None,
            },
            {
                "name": "Sir MV Seminar Hall 1",
                "category": VenueCategory.SEMINAR_HALL,
                "capacity": 200,
                "premises": "Sir MV Seminar Complex",
                "department": "Electronics & Communication Engineering",
            },
            {
                "name": "Advanced IoT Lab",
                "category": VenueCategory.LAB,
                "capacity": 45,
                "premises": "New CSE",
                "department": "Computer Science & Engineering",
            },
        ]

        for v in venues_data:
            existing = Venue.query.filter_by(name=v["name"]).first()
            if not existing:
                dept_obj = departments_map[v["department"]] if v["department"] else None
                venue = Venue(
                    name=v["name"],
                    category=v["category"],
                    capacity=v["capacity"],
                    premises_id=premises_map[v["premises"]].id,
                    department_id=dept_obj.id if dept_obj else None,
                )
                db.session.add(venue)

        print("Seeding sample users with hashed passwords...")
        users_data = [
            {
                "name": "Dr. Alan Turing",
                "college_email": "alan.turing@college.edu",
                "password": "FacultySecurePass@2026",
                "role": "faculty",
                "department": "Computer Science & Engineering",
            },
            {
                "name": "Ada Lovelace",
                "college_email": "ada.lovelace@college.edu",
                "password": "StudentPass@2026",
                "role": "student",
                "department": "Computer Science & Engineering",
            },
        ]

        for u in users_data:
            existing = User.query.filter_by(college_email=u["college_email"]).first()
            if not existing:
                dept_obj = departments_map.get(u["department"])
                user = User(
                    name=u["name"],
                    college_email=u["college_email"],
                    role=u["role"],
                    department_id=dept_obj.id if dept_obj else None,
                )
                user.set_password(u["password"])
                db.session.add(user)

        db.session.commit()
        print("Database seeded successfully with users, venues, departments, and premises!")


if __name__ == "__main__":
    seed_database()

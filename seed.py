from datetime import date, time
from app import create_app
from extensions import db
from models import Booking, BookingStatus, Department, Premises, User, Venue, VenueCategory


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

        venues_map = {}
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
                db.session.flush()
                venues_map[v["name"]] = venue
            else:
                venues_map[v["name"]] = existing

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

        users_map = {}
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
                db.session.flush()
                users_map[u["college_email"]] = user
            else:
                users_map[u["college_email"]] = existing

        print("Seeding sample bookings...")
        bookings_data = [
            {
                "user_email": "alan.turing@college.edu",
                "venue_name": "NC 27",
                "date": date(2026, 11, 10),
                "start_time": time(10, 0, 0),
                "end_time": time(12, 0, 0),
                "status": BookingStatus.APPROVED,
            },
            {
                "user_email": "ada.lovelace@college.edu",
                "venue_name": "Main Auditorium Hall",
                "date": date(2026, 11, 12),
                "start_time": time(14, 0, 0),
                "end_time": time(17, 0, 0),
                "status": BookingStatus.PENDING,
            },
        ]

        for b in bookings_data:
            user = users_map[b["user_email"]]
            venue = venues_map[b["venue_name"]]
            existing = Booking.query.filter_by(
                user_id=user.id, venue_id=venue.id, date=b["date"], start_time=b["start_time"]
            ).first()
            if not existing:
                booking = Booking(
                    user_id=user.id,
                    venue_id=venue.id,
                    date=b["date"],
                    start_time=b["start_time"],
                    end_time=b["end_time"],
                    status=b["status"],
                )
                db.session.add(booking)

        db.session.commit()
        print("Database seeded successfully with bookings!")


if __name__ == "__main__":
    seed_database()

from datetime import date, time
from werkzeug.security import generate_password_hash
from app import create_app
from extensions import db
from models import Booking, BookingStatus, Department, Premises, User, Venue, VenueCategory

# ==============================================================================
# 1. DEPARTMENTS DATA
# ==============================================================================
DEPARTMENTS_DATA = [
    {"name": "Computer Science and Engineering"},
    {"name": "Electrical Engineering"},
    {"name": "Electronics and Telecommunication Engineering"},
    {"name": "Instrumentation and Control Engineering"},
    {"name": "Mechanical Engineering"},
    {"name": "Civil Engineering"},
    {"name": "Metallurgy and Material Engineering"},
    {"name": "Manufacturing Engineering and Industrial Management"},
    {"name": "General Administration"},
]

# ==============================================================================
# 2. PREMISES DATA (COEP Campus Buildings)
# ==============================================================================
PREMISES_DATA = [
    {
        "name": "Old Department of Computer Science and Engineering",
        "authority_name": "Pradeep Deshmukh",
        "authority_email": "hod.comp@coep.ac.in",
    },
    {
        "name": "New Department of Computer Science and Engineering",
        "authority_name": "Pradeep Deshmukh",
        "authority_email": "hod.comp@coep.ac.in",
    },
    {
        "name": "Department of Electrical Engineering",
        "authority_name": "HOD Electrical",
        "authority_email": "hod.elec@coep.ac.in",
    },
    {
        "name": "Department of Electronics and Telecommunication Engineering",
        "authority_name": "HOD ENTC",
        "authority_email": "hod.entc@coep.ac.in",
    },
    {
        "name": "Department of Electronics and Telecommunication Engineering Extension",
        "authority_name": "HOD ENTC",
        "authority_email": "hod.entc@coep.ac.in",
    },
    {
        "name": "Department of Instrumentation and Control Engineering",
        "authority_name": "HOD Instrumentation",
        "authority_email": "hod.instru@coep.ac.in",
    },
    {
        "name": "Old Department of Mechanical Engineering",
        "authority_name": "HOD Mechanical",
        "authority_email": "hod.mech@coep.ac.in",
    },
    {
        "name": "New Department of Mechanical Engineering",
        "authority_name": "HOD Mechanical",
        "authority_email": "hod.mech@coep.ac.in",
    },
    {
        "name": "Department of Civil Engineering",
        "authority_name": "HOD Civil",
        "authority_email": "hod.civil@coep.ac.in",
    },
    {
        "name": "Department of Metallurgy and Material Engineering",
        "authority_name": "HOD Metallurgy",
        "authority_email": "hod.meta@coep.ac.in",
    },
    {
        "name": "Department of Manufacturing Engineering and Industrial Management",
        "authority_name": "HOD Manufacturing",
        "authority_email": "hod.manu@coep.ac.in",
    },
    {
        "name": "Main Building",
        "authority_name": "College Administration",
        "authority_email": "admin@coep.ac.in",
    },
    {
        "name": "Academic Complex",
        "authority_name": "Academic Dean Office",
        "authority_email": "dean.acad@coep.ac.in",
    },
    {
        "name": "Bhau Institute",
        "authority_name": "Talele V. L.",
        "authority_email": "bhau@coep.ac.in",
    },
]

# ==============================================================================
# 3. VENUES DATA (All 4 categories, NC 27/28, and a college-wide auditorium)
# ==============================================================================
VENUES_DATA = [
    {
        "name": "NC 27",
        "category": VenueCategory.CLASSROOM,
        "capacity": 70,
        "premises": "New Department of Computer Science and Engineering",
        "department": "Computer Science and Engineering",
    },
    {
        "name": "NC 28",
        "category": VenueCategory.CLASSROOM,
        "capacity": 70,
        "premises": "New Department of Computer Science and Engineering",
        "department": "Computer Science and Engineering",
    },
    {
        "name": "COEP Main Auditorium",
        "category": VenueCategory.AUDITORIUM,
        "capacity": 950,
        "premises": "Main Building",
        "department": None,  # College-wide venue (belongs to no specific department)
    },
    {
        "name": "Bhau Innovation Seminar Hall",
        "category": VenueCategory.SEMINAR_HALL,
        "capacity": 180,
        "premises": "Bhau Institute",
        "department": None,  # Belongs to no single academic department
    },
    {
        "name": "Advanced Computing & AI Lab",
        "category": VenueCategory.LAB,
        "capacity": 45,
        "premises": "New Department of Computer Science and Engineering",
        "department": "Computer Science and Engineering",
    },
]

# ==============================================================================
# 4. USERS DATA (Passwords hashed with generate_password_hash)
# ==============================================================================
USERS_DATA = [
    {
        "name": "System Administrator",
        "college_email": "admin@coep.ac.in",
        "raw_password": "AdminPassword@123",
        "role": "admin",
        "department": "General Administration",
    },
    {
        "name": "Prof. Rajesh Joshi",
        "college_email": "rjoshi.comp@coep.ac.in",
        "raw_password": "FacultySecurePassword@123",
        "role": "faculty",
        "department": "Computer Science and Engineering",
    },
    {
        "name": "Sneha Kulkarni",
        "college_email": "kulkarnis21.comp@coep.ac.in",
        "raw_password": "StudentPassword@123",
        "role": "student",
        "department": "Computer Science and Engineering",
    },
]

# ==============================================================================
# 5. SAMPLE BOOKINGS (Includes a deliberate overlap for clash testing)
# ==============================================================================
BOOKINGS_DATA = [
    {
        "venue_name": "NC 27",
        "user_email": "rjoshi.comp@coep.ac.in",
        "date": date(2026, 11, 15),
        "start_time": time(10, 0, 0),
        "end_time": time(12, 0, 0),
        "status": BookingStatus.APPROVED,
        "note": "Initial approved morning lecture booking (10:00 - 12:00)",
    },
    {
        "venue_name": "NC 27",
        "user_email": "kulkarnis21.comp@coep.ac.in",
        "date": date(2026, 11, 15),
        "start_time": time(11, 0, 0),
        "end_time": time(13, 0, 0),
        "status": BookingStatus.PENDING,
        "note": "DELIBERATE OVERLAP: Clashes between 11:00 and 12:00 with booking above",
    },
    {
        "venue_name": "COEP Main Auditorium",
        "user_email": "rjoshi.comp@coep.ac.in",
        "date": date(2026, 11, 20),
        "start_time": time(14, 0, 0),
        "end_time": time(17, 0, 0),
        "status": BookingStatus.APPROVED,
        "note": "Annual Tech Symposium session",
    },
]


def seed_departments(data):
    """Idempotently seed departments."""
    print("Seeding departments...")
    dept_map = {}
    for item in data:
        dept = Department.query.filter_by(name=item["name"]).first()
        if not dept:
            dept = Department(name=item["name"])
            db.session.add(dept)
            db.session.flush()
            print(f"  + Added Department: {item['name']}")
        else:
            print(f"  = Department exists: {item['name']}")
        dept_map[item["name"]] = dept
    return dept_map


def seed_premises(data):
    """Idempotently seed premises."""
    print("Seeding premises (buildings)...")
    premise_map = {}
    for item in data:
        premise = Premises.query.filter_by(name=item["name"]).first()
        if not premise:
            premise = Premises(
                name=item["name"],
                authority_name=item["authority_name"],
                authority_email=item["authority_email"],
            )
            db.session.add(premise)
            db.session.flush()
            print(f"  + Added Premises: {item['name']}")
        else:
            premise.authority_name = item["authority_name"]
            premise.authority_email = item["authority_email"]
            print(f"  = Premises exists: {item['name']}")
        premise_map[item["name"]] = premise
    return premise_map


def seed_venues(data, dept_map, premise_map):
    """Idempotently seed venues covering all 4 categories."""
    print("Seeding venues...")
    venue_map = {}
    for item in data:
        premise = premise_map[item["premises"]]
        venue = Venue.query.filter_by(name=item["name"], premises_id=premise.id).first()

        dept = dept_map.get(item["department"]) if item["department"] else None
        dept_id = dept.id if dept else None

        if not venue:
            venue = Venue(
                name=item["name"],
                category=item["category"],
                capacity=item["capacity"],
                premises_id=premise.id,
                department_id=dept_id,
            )
            db.session.add(venue)
            db.session.flush()
            print(f"  + Added Venue: {item['name']} ({item['category'].value}) [{item['capacity']} seats]")
        else:
            venue.category = item["category"]
            venue.capacity = item["capacity"]
            venue.department_id = dept_id
            print(f"  = Venue exists: {item['name']}")

        venue_map[item["name"]] = venue
    return venue_map


def seed_users(data, dept_map):
    """Idempotently seed users with hashed passwords using generate_password_hash."""
    print("Seeding users...")
    user_map = {}
    for item in data:
        user = User.query.filter_by(college_email=item["college_email"]).first()
        dept = dept_map.get(item["department"]) if item["department"] else None

        # Hash password securely using werkzeug.security
        hashed_password = generate_password_hash(item["raw_password"])

        if not user:
            user = User(
                name=item["name"],
                college_email=item["college_email"],
                password_hash=hashed_password,
                role=item["role"],
                department_id=dept.id if dept else None,
            )
            db.session.add(user)
            db.session.flush()
            print(f"  + Added User: {item['name']} <{item['college_email']}> ({item['role']})")
        else:
            user.name = item["name"]
            user.password_hash = hashed_password
            user.role = item["role"]
            user.department_id = dept.id if dept else None
            print(f"  = User exists: {item['college_email']}")

        user_map[item["college_email"]] = user
    return user_map


def seed_bookings(data, user_map, venue_map):
    """Idempotently seed bookings, including deliberate clash test cases."""
    print("Seeding bookings...")
    for item in data:
        venue = venue_map[item["venue_name"]]
        user = user_map[item["user_email"]]

        booking = Booking.query.filter_by(
            venue_id=venue.id,
            date=item["date"],
            start_time=item["start_time"],
            end_time=item["end_time"],
        ).first()

        if not booking:
            booking = Booking(
                user_id=user.id,
                venue_id=venue.id,
                date=item["date"],
                start_time=item["start_time"],
                end_time=item["end_time"],
                status=item["status"],
            )
            db.session.add(booking)
            print(f"  + Added Booking: {venue.name} on {item['date']} {item['start_time']}-{item['end_time']} [{item['status'].value}]")
        else:
            booking.status = item["status"]
            print(f"  = Booking exists: {venue.name} on {item['date']} {item['start_time']}-{item['end_time']}")


def run_seed():
    app = create_app()
    with app.app_context():
        # Create tables if not existing
        db.create_all()

        dept_map = seed_departments(DEPARTMENTS_DATA)
        premise_map = seed_premises(PREMISES_DATA)
        venue_map = seed_venues(VENUES_DATA, dept_map, premise_map)
        user_map = seed_users(USERS_DATA, dept_map)
        seed_bookings(BOOKINGS_DATA, user_map, venue_map)

        db.session.commit()
        print("\nAll departments, premises, venues, users, and clash-test bookings seeded successfully!")


if __name__ == "__main__":
    run_seed()

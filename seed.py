from datetime import date, time
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
# Missing details use placeholders and can be updated anytime.
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
    """Idempotently seed premises (inserts new, updates existing authority details)."""
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
            # Update authority info if it was changed/completed
            premise.authority_name = item["authority_name"]
            premise.authority_email = item["authority_email"]
            print(f"  = Premises exists (authority verified/updated): {item['name']}")
        premise_map[item["name"]] = premise
    return premise_map


def run_seed():
    app = create_app()
    with app.app_context():
        # Ensure database tables exist
        db.create_all()

        seed_departments(DEPARTMENTS_DATA)
        seed_premises(PREMISES_DATA)

        db.session.commit()
        print("\nDatabase seeded successfully with all departments and premises!")


if __name__ == "__main__":
    run_seed()

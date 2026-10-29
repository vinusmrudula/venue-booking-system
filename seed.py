import os
import sys
import csv

# Ensure UTF-8 output on Windows consoles
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app import create_app, db
from app.models import User, Department, Authority, Venue, Booking

app = create_app('development')

def categorize_venue(name, benches):
    """
    Intelligently assign one of the 4 required categories:
    - Auditorium (large scale capacity, like ND01 with 180 benches)
    - Seminar Hall (medium large capacity >= 50 benches)
    - Lab / Facility (passages, special project rooms, labs)
    - Classroom (standard instruction rooms)
    """
    name_upper = name.upper()
    if benches >= 100 or 'AUDITORIUM' in name_upper or 'ND01' in name_upper:
        return 'Auditorium'
    elif benches >= 50 or 'SEMINAR' in name_upper:
        return 'Seminar Hall'
    elif 'PASSAGE' in name_upper or 'LAB' in name_upper:
        return 'Lab / Facility'
    else:
        return 'Classroom'

def seed_database():
    with app.app_context():
        print("🌱 Seeding database with college venue data...")
        db.create_all()

        # 1. Create Default Users (Admin, Faculty, Student)
        users_data = [
            {
                'name': 'College Administrator',
                'email': 'admin@coeptech.ac.in',
                'password': 'Admin@123',
                'department': 'Central Administration',
                'role': 'admin',
                'status': 'approved'
            },
            {
                'name': 'Vinay N M (Super Admin)',
                'email': 'vinaynm25.aiml@coeptech.ac.in',
                'password': 'Admin@123',
                'department': 'Artificial Intelligence & Machine Learning',
                'role': 'admin',
                'status': 'approved'
            },
            {
                'name': 'Vazeba (Super Admin)',
                'email': 'vazeba25.comp@coeptech.ac.in',
                'password': 'Admin@123',
                'department': 'Computer Engineering',
                'role': 'admin',
                'status': 'approved'
            },
            {
                'name': 'Vhankalas P H (Super Admin)',
                'email': 'vhankalasph25.comp@coeptech.ac.in',
                'password': 'Admin@123',
                'department': 'Computer Engineering',
                'role': 'admin',
                'status': 'approved'
            },
            {
                'name': 'Dr. Sharma (Faculty)',
                'email': 'faculty.cs@coeptech.ac.in',
                'password': 'Faculty@123',
                'department': 'Computer New Building',
                'role': 'faculty'
            },
            {
                'name': 'Aarav Patil (Student)',
                'email': 'student.coep@coeptech.ac.in',
                'password': 'Student@123',
                'department': 'Mechanical Engineering',
                'role': 'student'
            },
            {
                'name': 'Aman Sharma',
                'email': 'aman.student@college.ac.in',
                'password': 'password123',
                'department': 'Department of Computer Science and Engineering (new)',
                'role': 'student'
            },
            {
                'name': 'Dr. Sunita Sen',
                'email': 'sunita.faculty@college.ac.in',
                'password': 'password123',
                'department': 'Department of Electrical Engineering',
                'role': 'faculty'
            }
        ]

        for u_data in users_data:
            existing = User.query.filter_by(email=u_data['email']).first()
            if not existing:
                u = User(
                    name=u_data['name'],
                    email=u_data['email'],
                    department=u_data['department'],
                    role=u_data['role'],
                    status=u_data.get('status', 'approved')
                )
                u.set_password(u_data['password'])
                db.session.add(u)
                print(f"  + Added user: {u.email} ({u.role})")

        db.session.commit()

        # 2. Parse CSV and populate Departments, Authorities, and Venues
        csv_path = os.path.join(os.path.dirname(__file__), 'seed_data', 'classroom_information.csv')
        if not os.path.exists(csv_path):
            print(f"❌ Error: CSV file not found at {csv_path}")
            return

        dept_cache = {}
        auth_cache = {}
        venues_added = 0

        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                dept_name = row['Department'].strip()
                hall_name = row['New Hall Name'].strip()
                benches_str = row['Benches'].strip()
                email = row['Email'].strip()

                try:
                    benches = int(benches_str)
                except ValueError:
                    benches = 30

                # Get or create Department
                if dept_name not in dept_cache:
                    dept = Department.query.filter_by(name=dept_name).first()
                    if not dept:
                        code = "".join([w[0] for w in dept_name.split() if w[0].isupper()])[:6]
                        dept = Department(name=dept_name, code=code)
                        db.session.add(dept)
                        db.session.flush()
                        print(f"  + Added Department: {dept.name} [{dept.code}]")
                    dept_cache[dept_name] = dept
                else:
                    dept = dept_cache[dept_name]

                # Get or create Authority (e.g., HOD with official email)
                if email not in auth_cache:
                    auth = Authority.query.filter_by(email=email).first()
                    if not auth:
                        auth_name = f"HOD ({dept_name})"
                        auth = Authority(name=auth_name, email=email, department_id=dept.id)
                        db.session.add(auth)
                        db.session.flush()
                        print(f"  + Added Authority: {auth.name} <{auth.email}>")
                    auth_cache[email] = auth
                else:
                    auth = auth_cache[email]

                # Create Venue if it doesn't already exist
                existing_venue = Venue.query.filter_by(name=hall_name, department_id=dept.id).first()
                if not existing_venue:
                    category = categorize_venue(hall_name, benches)
                    venue = Venue(
                        name=hall_name,
                        category=category,
                        benches=benches,
                        department_id=dept.id,
                        authority_id=auth.id
                    )
                    db.session.add(venue)
                    venues_added += 1

        db.session.commit()
        print(f"✅ Successfully seeded {venues_added} venues across {len(dept_cache)} departments!")

        # 3. Add a sample demo booking if none exist
        if Booking.query.count() == 0:
            student = User.query.filter_by(role='student').first()
            sample_venue = Venue.query.filter_by(name='SC06').first()
            if student and sample_venue:
                demo_booking = Booking(
                    venue_id=sample_venue.id,
                    user_id=student.id,
                    booking_date='2026-11-05',
                    start_time='10:00',
                    end_time='12:00',
                    purpose='Robotics Club Annual Workshop and Induction',
                    attendees_count=45,
                    status=Booking.STATUS_PENDING,
                    authority_email=sample_venue.authority.email if sample_venue.authority else 'hod.civil@coeptech.ac.in',
                    email_status='suppressed'
                )
                db.session.add(demo_booking)
                db.session.commit()
                print(f"  + Added sample demonstration booking for {sample_venue.name}")

        print("🎉 Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()

import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from datetime import date, timedelta
from app import create_app, db
from app.models import User, Department, Authority, Venue, Booking
from app.utils.auth_middleware import generate_token

@pytest.fixture
def app():
    """Create test application configured with in-memory SQLite database."""
    test_app = create_app('testing')
    with test_app.app_context():
        db.create_all()

        # Seed minimal test data
        dept = Department(name="Civil Engineering", code="CE")
        db.session.add(dept)
        db.session.flush()

        auth = Authority(name="HOD Civil", email="hod.civil@coeptech.ac.in", department_id=dept.id)
        db.session.add(auth)
        db.session.flush()

        venue = Venue(
            name="SC06",
            category="Classroom",
            benches=30,
            department_id=dept.id,
            authority_id=auth.id
        )
        venue2 = Venue(
            name="SC07",
            category="Classroom",
            benches=27,
            department_id=dept.id,
            authority_id=auth.id
        )
        db.session.add_all([venue, venue2])

        # Admin user
        admin = User(name="Admin User", email="admin@coeptech.ac.in", role="admin")
        admin.set_password("Admin@123")

        # Student user
        student = User(name="Student User", email="student@coeptech.ac.in", role="student")
        student.set_password("Student@123")

        db.session.add_all([admin, student])
        db.session.commit()

        yield test_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def student_token(app):
    with app.app_context():
        student = User.query.filter_by(email="student@coeptech.ac.in").first()
        return generate_token(student)


@pytest.fixture
def admin_token(app):
    with app.app_context():
        admin = User.query.filter_by(email="admin@coeptech.ac.in").first()
        return generate_token(admin)


# ==========================================
# 1. AUTHENTICATION & EDGE CASE TESTS
# ==========================================

def test_user_registration_success(client):
    res = client.post('/api/auth/register', json={
        'name': 'Rahul Joshi',
        'email': 'rahul.joshi@coeptech.ac.in',
        'password': 'SecurePassword123',
        'department': 'Civil Engineering',
        'role': 'student'
    })
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data['success'] is True
    assert 'token' in json_data['data']


def test_user_registration_duplicate_email(client):
    res = client.post('/api/auth/register', json={
        'name': 'Duplicate User',
        'email': 'student@coeptech.ac.in', # already exists in fixture
        'password': 'AnyPassword123'
    })
    assert res.status_code == 409
    assert res.get_json()['success'] is False


def test_user_registration_invalid_domain(client):
    res = client.post('/api/auth/register', json={
        'name': 'Outside User',
        'email': 'outsider@gmail.com', # invalid domain
        'password': 'ValidPassword123'
    })
    assert res.status_code == 400
    assert 'college email' in res.get_json()['message'].lower()


def test_user_login_success(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@coeptech.ac.in',
        'password': 'Student@123'
    })
    assert res.status_code == 200
    assert 'token' in res.get_json()['data']


def test_user_login_wrong_password(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@coeptech.ac.in',
        'password': 'WrongPassword123'
    })
    assert res.status_code == 401
    assert res.get_json()['success'] is False


def test_protected_route_without_token(client):
    res = client.get('/api/auth/me')
    assert res.status_code == 401


def test_admin_route_forbidden_for_student(client, student_token):
    res = client.get('/api/admin/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert res.status_code == 403


# ==========================================
# 2. VENUE LOOKUP & AVAILABILITY TESTS
# ==========================================

def test_get_venue_categories(client):
    res = client.get('/api/venues/categories')
    assert res.status_code == 200
    data = res.get_json()['data']
    assert 'Classroom' in data
    assert 'Auditorium' in data
    assert 'Seminar Hall' in data
    assert 'Lab / Facility' in data


def test_authority_lookup(client):
    res = client.get('/api/venues/authority-lookup?premises=SC06')
    assert res.status_code == 200
    data = res.get_json()['data']
    assert data['authority_email'] == 'hod.civil@coeptech.ac.in'
    assert 'HOD Civil' in data['authority_name']


def test_authority_lookup_not_found(client):
    res = client.get('/api/venues/authority-lookup?premises=ROOM999')
    assert res.status_code == 404


# ==========================================
# 3. BOOKING CREATION & CLASH PREVENTION TESTS
# ==========================================

def test_booking_past_date_rejected(client, student_token):
    yesterday = (date.today() - timedelta(days=1)).strftime('%Y-%m-%d')
    res = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': yesterday,
        'start_time': '10:00',
        'end_time': '12:00',
        'purpose': 'Past meeting'
    })
    assert res.status_code == 400
    assert 'past date' in res.get_json()['message'].lower()


def test_booking_invalid_time_range(client, student_token):
    future_date = (date.today() + timedelta(days=5)).strftime('%Y-%m-%d')
    res = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '14:00',
        'end_time': '13:00', # End before start!
        'purpose': 'Invalid time range'
    })
    assert res.status_code == 400
    assert 'later than start time' in res.get_json()['message'].lower()


def test_booking_creation_and_clash_detection(client, student_token):
    future_date = (date.today() + timedelta(days=10)).strftime('%Y-%m-%d')
    
    # 1. First booking: 10:00 - 12:00 (Should succeed)
    res1 = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '10:00',
        'end_time': '12:00',
        'purpose': 'Technical Seminar',
        'attendees_count': 40
    })
    assert res1.status_code == 201
    booking1 = res1.get_json()['data']
    assert booking1['status'] == 'pending'
    assert 'mailto:' in booking1['mailto_fallback']

    # 2. Exact overlap clash: 10:00 - 12:00 on same venue (Must Fail)
    res_exact = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '10:00',
        'end_time': '12:00',
        'purpose': 'Clashing Seminar'
    })
    assert res_exact.status_code == 409
    assert res_exact.get_json()['error_code'] == 'CLASH_DETECTED'

    # 3. Partial overlap left clash: 09:30 - 10:30 (Must Fail)
    res_left = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '09:30',
        'end_time': '10:30',
        'purpose': 'Left overlap'
    })
    assert res_left.status_code == 409

    # 4. Partial overlap right clash: 11:30 - 12:30 (Must Fail)
    res_right = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '11:30',
        'end_time': '12:30',
        'purpose': 'Right overlap'
    })
    assert res_right.status_code == 409

    # 5. Enclosing clash: 09:00 - 13:00 (Must Fail)
    res_enclosing = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '09:00',
        'end_time': '13:00',
        'purpose': 'Enclosing overlap'
    })
    assert res_enclosing.status_code == 409

    # 6. Inside clash: 10:15 - 11:45 (Must Fail)
    res_inside = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '10:15',
        'end_time': '11:45',
        'purpose': 'Inside overlap'
    })
    assert res_inside.status_code == 409

    # 7. Adjacent before (back-to-back): 08:30 - 10:00 (Must SUCCEED)
    res_before = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '08:30',
        'end_time': '10:00',
        'purpose': 'Adjacent before'
    })
    assert res_before.status_code == 201

    # 8. Adjacent after (back-to-back): 12:00 - 13:30 (Must SUCCEED)
    res_after = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '12:00',
        'end_time': '13:30',
        'purpose': 'Adjacent after'
    })
    assert res_after.status_code == 201

    # 9. Same time on a DIFFERENT venue: Venue 2 (Must SUCCEED)
    res_diff_venue = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 2,
        'booking_date': future_date,
        'start_time': '10:00',
        'end_time': '12:00',
        'purpose': 'Different venue simultaneous session'
    })
    assert res_diff_venue.status_code == 201


def test_my_bookings_query(client, student_token):
    res = client.get('/api/bookings/my-bookings', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert res.status_code == 200
    assert isinstance(res.get_json()['data'], list)


# ==========================================
# 4. ADMIN APPROVAL & REJECTION TESTS
# ==========================================

def test_admin_approve_and_reject_flow(client, student_token, admin_token):
    future_date = (date.today() + timedelta(days=15)).strftime('%Y-%m-%d')
    
    # Create booking as student
    create_res = client.post('/api/bookings', headers={
        'Authorization': f'Bearer {student_token}'
    }, json={
        'venue_id': 1,
        'booking_date': future_date,
        'start_time': '14:00',
        'end_time': '16:00',
        'purpose': 'Placement Drive Prep'
    })
    booking_id = create_res.get_json()['data']['id']

    # Admin approves booking
    approve_res = client.post(f'/api/admin/bookings/{booking_id}/approve', headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert approve_res.status_code == 200
    assert approve_res.get_json()['data']['status'] == 'approved'

    # Admin rejects booking with reason
    reject_res = client.post(f'/api/admin/bookings/{booking_id}/reject', headers={
        'Authorization': f'Bearer {admin_token}'
    }, json={
        'reason': 'Exam Hall Preparation'
    })
    assert reject_res.status_code == 200
    assert reject_res.get_json()['data']['status'] == 'rejected'
    assert reject_res.get_json()['data']['rejection_reason'] == 'Exam Hall Preparation'


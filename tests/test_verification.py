"""
Comprehensive Verification Test for:
1. Venue model: database stores only benches; capacity is dynamic (2 * benches)
2. to_dict() returns benches, capacity, capacity_formula, and capacity_display
3. Booking creation sends request directly to admin (status: pending, email_status: sent_to_admin)
4. Admin approval/rejection API workflow
"""
import unittest
from datetime import date, timedelta
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import User, Department, Authority, Venue, Booking
from app.utils.auth_middleware import generate_token

class TestVenueAndAdminBooking(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        # Seed test data
        self.dept = Department(name="Computer Science & Engineering", code="CSE")
        db.session.add(self.dept)
        db.session.flush()

        self.auth = Authority(name="HOD CSE", email="hod.cse@coeptech.ac.in", department_id=self.dept.id)
        db.session.add(self.auth)
        db.session.flush()

        # Venue with 38 benches -> 76 capacity
        self.venue = Venue(
            name="NC 27",
            category="Classroom",
            benches=38,
            department_id=self.dept.id,
            authority_id=self.auth.id
        )
        db.session.add(self.venue)

        # Users
        self.admin = User(name="Dean Admin", email="admin@coeptech.ac.in", role="admin")
        self.admin.set_password("Admin@123")

        self.student = User(name="Student Rahul", email="rahul.student@coeptech.ac.in", role="student")
        self.student.set_password("Student@123")

        db.session.add_all([self.admin, self.student])
        db.session.commit()

        self.admin_token = generate_token(self.admin)
        self.student_token = generate_token(self.student)

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_venue_benches_and_capacity_formula(self):
        """Verify that venue stores benches, and capacity is dynamically 2 * benches."""
        v = Venue.query.filter_by(name="NC 27").first()
        self.assertIsNotNone(v)
        self.assertEqual(v.benches, 38)
        self.assertEqual(v.capacity, 76)

        data = v.to_dict()
        self.assertEqual(data['benches'], 38)
        self.assertEqual(data['capacity'], 76)
        self.assertEqual(data['capacity_formula'], "total = (2 * benches)")
        self.assertIn("total = (2 * 38 benches) = 76 Seats", data['capacity_display'])

    def test_book_now_sends_to_admin(self):
        """Verify that 'Book Now' creates a pending booking routed to admin without needing email."""
        tomorrow = (date.today() + timedelta(days=2)).isoformat()
        res = self.client.post('/api/bookings',
            headers={'Authorization': f'Bearer {self.student_token}'},
            json={
                'venue_id': self.venue.id,
                'booking_date': tomorrow,
                'start_time': '09:00',
                'end_time': '11:00',
                'purpose': 'AI Research Group Seminar',
                'attendees_count': 50
            }
        )
        self.assertEqual(res.status_code, 201)
        res_data = res.get_json()
        self.assertTrue(res_data['success'])
        self.assertIn('Admin account for approval', res_data['message'])

        booking_id = res_data['data']['id']
        booking = db.session.get(Booking, booking_id)
        self.assertEqual(booking.status, 'pending')
        self.assertEqual(booking.email_status, 'sent_to_admin')

    def test_admin_approve_booking(self):
        """Verify that admin can approve a pending booking request."""
        tomorrow = (date.today() + timedelta(days=3)).isoformat()
        booking = Booking(
            venue_id=self.venue.id,
            user_id=self.student.id,
            booking_date=tomorrow,
            start_time='10:00',
            end_time='12:00',
            purpose='Guest Lecture',
            attendees_count=40,
            status='pending',
            authority_email=self.admin.email,
            email_status='sent_to_admin'
        )
        db.session.add(booking)
        db.session.commit()

        # Admin approves
        res = self.client.post(f'/api/admin/bookings/{booking.id}/approve',
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        self.assertEqual(res.status_code, 200)
        res_data = res.get_json()
        self.assertTrue(res_data['success'])

        updated = db.session.get(Booking, booking.id)
        self.assertEqual(updated.status, 'approved')

    def test_admin_reject_booking(self):
        """Verify that admin can reject a pending booking request with reason."""
        tomorrow = (date.today() + timedelta(days=4)).isoformat()
        booking = Booking(
            venue_id=self.venue.id,
            user_id=self.student.id,
            booking_date=tomorrow,
            start_time='14:00',
            end_time='16:00',
            purpose='Club Meeting',
            attendees_count=30,
            status='pending',
            authority_email=self.admin.email,
            email_status='sent_to_admin'
        )
        db.session.add(booking)
        db.session.commit()

        # Admin rejects
        res = self.client.post(f'/api/admin/bookings/{booking.id}/reject',
            headers={'Authorization': f'Bearer {self.admin_token}'},
            json={'reason': 'Maintenance scheduled during this time.'}
        )
        self.assertEqual(res.status_code, 200)
        res_data = res.get_json()
        self.assertTrue(res_data['success'])

        updated = db.session.get(Booking, booking.id)
        self.assertEqual(updated.status, 'rejected')
        self.assertEqual(updated.rejection_reason, 'Maintenance scheduled during this time.')

if __name__ == '__main__':
    unittest.main()

"""Database Verification Script
Demonstrates querying models and verifying relationships, authorities, and booking clashes.
"""

from datetime import date
from app import create_app
from models import Booking, Department, Premises, Venue, VenueCategory

app = create_app()

with app.app_context():
    print("=" * 60)
    print("QUERY 1: All labs in Computer Science and Engineering")
    print("=" * 60)
    cse_dept = Department.query.filter(Department.name.ilike("%Computer Science and Engineering%")).first()
    if cse_dept:
        labs = Venue.query.filter_by(department_id=cse_dept.id, category=VenueCategory.LAB).all()
        for lab in labs:
            print(f"- {lab.name} (Building: {lab.premises.name}, Capacity: {lab.capacity} seats)")
    else:
        print("Department not found.")

    print("\n" + "=" * 60)
    print("QUERY 2: All venues in 'New Department of Computer Science and Engineering' with capacity")
    print("=" * 60)
    new_cse = Premises.query.filter(Premises.name.ilike("%New Department of Computer Science%")).first()
    if new_cse:
        for venue in new_cse.venues:
            print(f"- {venue.name:<30} | Category: {venue.category.value:<12} | Capacity: {venue.capacity} seats")
    else:
        print("Premises not found.")

    print("\n" + "=" * 60)
    print("QUERY 3: Authority email for a venue through relationships")
    print("=" * 60)
    venue = Venue.query.filter_by(name="NC 27").filter(Venue.premises.has(name="New Department of Computer Science and Engineering")).first()
    if venue:
        print(f"Venue Name      : {venue.name}")
        print(f"Building/Premise: {venue.premises.name}")
        print(f"Authority Name  : {venue.premises.authority_name}")
        print(f"Authority Email : {venue.premises.authority_email}")

    print("\n" + "=" * 60)
    print("QUERY 4: All bookings for NC 27 on 2026-11-15 (Clash Detection Test)")
    print("=" * 60)
    if venue:
        query_date = date(2026, 11, 15)
        bookings = Booking.query.filter_by(venue_id=venue.id, date=query_date).order_by(Booking.start_time).all()
        print(f"Bookings found for {venue.name} on {query_date}: {len(bookings)}")
        for b in bookings:
            print(f"  * Booking #{b.id}: {b.start_time} to {b.end_time} [{b.status.value.upper()}] - Booked by: {b.user.name}")
        print("\nNote: Booking #3 (10:00-12:00) and Booking #4 (11:00-13:00) deliberately overlap for clash detection testing!")
    print("=" * 60)


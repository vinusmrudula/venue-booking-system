"""Verification script testing /api/health and all newly wired blueprints:
1. availability (routes/availability.py)
2. bookings (routes/bookings.py)
3. email (routes/email.py)
"""

from app import create_app

app = create_app()
client = app.test_client()

print("=" * 70)
print("TESTING WIRED BLUEPRINTS AND HEALTH ENDPOINT")
print("=" * 70)

# 1. Test GET /api/health
res = client.get("/api/health")
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
data = res.get_json()
assert data["status"] == "healthy"
print(f"[PASS] GET /api/health -> {data}")

# 2. Log in as a student to test authenticated routes
login_res = client.post("/api/auth/login", json={
    "college_email": "kulkarnis21.comp@coep.ac.in",
    "password": "StudentPassword@123"
})
assert login_res.status_code == 200, f"Login failed: {login_res.get_json()}"
student = login_res.get_json()["user"]
print(f"[PASS] Logged in as student: {student['name']} (ID: {student['id']})")

# 3. Test Availability Blueprint
res = client.get("/api/availability?venue_id=1&date=2026-11-15")
assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.get_json()}"
avail_data = res.get_json()
print(f"[PASS] GET /api/availability -> Found {avail_data['total_booked_slots']} booked slots for {avail_data['venue_name']}.")

# Test Multi-venue Availability Stub
res = client.get("/api/availability?date=2026-11-15&category=classroom&capacity=50")
assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.get_json()}"
multi_data = res.get_json()
assert multi_data["success"] is True
assert len(multi_data["premises"]) > 0
venues = multi_data["premises"][0]["venues"]
assert any(v["name"] == "NC 27" and v["status"] == "available" for v in venues)
assert any(v["name"] == "NC 28" and v["status"] == "booked" for v in venues)
print(f"[PASS] GET /api/availability (Multi-venue stub) -> Successfully grouped venues under '{multi_data['premises'][0]['premises_name']}'.")

# Test Missing Parameter Validation (date missing)
res = client.get("/api/availability")
assert res.status_code == 400, f"Expected 400, got {res.status_code}"
assert res.get_json()["error"]["code"] == "MISSING_PARAM"
print("[PASS] GET /api/availability (Missing date) -> Correctly rejected with 400 Bad Request.")

# 4. Test Bookings Blueprint: Clash Detection Test
# On 2026-11-15, NC 27 has booking #3 from 10:00 to 12:00
res = client.post("/api/bookings", json={
    "venue_id": 1,
    "date": "2026-11-15",
    "start_time": "10:30:00",
    "end_time": "11:30:00"
})
assert res.status_code == 409, f"Expected 409 Clash, got {res.status_code}: {res.get_json()}"
print(f"[PASS] POST /api/bookings -> Clashing time slot successfully rejected with 409 Conflict.")

# Test Dummy Clash Trigger (venue_id=999)
res = client.post("/api/bookings", json={
    "venue_id": 999,
    "date": "2026-11-20",
    "start_time": "09:00:00",
    "end_time": "11:00:00"
})
assert res.status_code == 409, f"Expected 409 Dummy Clash, got {res.status_code}: {res.get_json()}"
print("[PASS] POST /api/bookings (Dummy clash trigger venue_id=999) -> Returned 409 Conflict.")

# Test Missing Fields Validation
res = client.post("/api/bookings", json={"venue_id": 1})
assert res.status_code == 400, f"Expected 400, got {res.status_code}"
assert res.get_json()["error"]["code"] == "MISSING_FIELDS"
print("[PASS] POST /api/bookings (Missing fields) -> Correctly rejected with 400 Bad Request.")

# 5. Test Bookings Blueprint: Successful Creation
res = client.post("/api/bookings", json={
    "venue_id": 1,
    "date": "2026-11-15",
    "start_time": "14:00:00",
    "end_time": "16:00:00"
})
assert res.status_code == 201, f"Expected 201 Created, got {res.status_code}: {res.get_json()}"
new_booking = res.get_json()["booking"]
print(f"[PASS] POST /api/bookings -> Booking #{new_booking['id']} created successfully.")

# 6. Test Bookings Blueprint: Get My Bookings (and /mine alias)
res = client.get("/api/bookings/my")
assert res.status_code == 200
my_bookings = res.get_json()["bookings"]
assert any(b["id"] == new_booking["id"] for b in my_bookings)
print(f"[PASS] GET /api/bookings/my -> Retrieved {len(my_bookings)} bookings for current user.")

res = client.get("/api/bookings/mine")
assert res.status_code == 200
mine_bookings = res.get_json()["bookings"]
assert len(mine_bookings) > 0
print(f"[PASS] GET /api/bookings/mine -> Alias successfully retrieved {len(mine_bookings)} bookings.")

# 7. Test Email Blueprint: Preview Email
res = client.get(f"/api/bookings/{new_booking['id']}/email-preview")
assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.get_json()}"
preview_data = res.get_json()
assert preview_data["recipient"]["authority_email"] != ""
print(f"[PASS] GET /api/bookings/{new_booking['id']}/email-preview -> Generated preview for {preview_data['recipient']['authority_name']} ({preview_data['recipient']['authority_email']}).")

# 8. Test Email Blueprint: Send Email
res = client.post(f"/api/bookings/{new_booking['id']}/send-email", json={
    "note": "Urgent seminar preparation"
})
assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.get_json()}"
send_data = res.get_json()
print(f"[PASS] POST /api/bookings/{new_booking['id']}/send-email -> Dispatched to {send_data['recipient_email']} at {send_data['sent_at']}.")

print("\n" + "=" * 70)
print("ALL BLUEPRINTS AND HEALTH CHECK TESTED WITH 100% SUCCESS!")
print("=" * 70)


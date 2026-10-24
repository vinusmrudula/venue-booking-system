"""Comprehensive Test Suite for Dheer's API Endpoints:
- Auth: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout
- Venues Catalog: /api/venues, /api/venues/<id>
- Metadata: /api/departments, /api/premises
- Admin: /api/admin/bookings, /api/admin/users, /api/bookings/<id>/status
"""

from app import create_app

app = create_app()
client = app.test_client()

print("=" * 70)
print("RUNNING API TESTS FOR DHEER'S ENDPOINTS")
print("=" * 70)

# 1. Test Metadata Endpoints
res = client.get("/api/departments")
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
departments = res.get_json()
print(f"[PASS] GET /api/departments -> {len(departments)} departments loaded.")

res = client.get("/api/premises")
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
premises = res.get_json()
print(f"[PASS] GET /api/premises -> {len(premises)} premises loaded.")

# Test Stub Filter Options
res = client.get("/api/venues/filter-options")
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
filter_opts = res.get_json()
assert "categories" in filter_opts and len(filter_opts["categories"]) == 4
assert "departments" in filter_opts and len(filter_opts["departments"]) >= 3
print("[PASS] GET /api/venues/filter-options -> Search filter dropdown metadata loaded.")

# 2. Test User Registration
test_email = "test.student@coep.ac.in"
res = client.post("/api/auth/register", json={
    "name": "Test Student",
    "college_email": test_email,
    "password": "Password123!",
    "role": "student",
    "department_id": 1
})
# Might be 201 or 409 if already registered
if res.status_code == 201:
    print(f"[PASS] POST /api/auth/register -> User created successfully.")
elif res.status_code == 409:
    print(f"[PASS] POST /api/auth/register -> Conflict handled properly (already exists).")
else:
    assert False, f"Unexpected status: {res.status_code}: {res.get_json()}"

# Test duplicate registration rejection
res = client.post("/api/auth/register", json={
    "name": "Duplicate Student",
    "college_email": test_email,
    "password": "Password123!",
    "role": "student"
})
assert res.status_code == 409, f"Expected 409, got {res.status_code}"
print("[PASS] POST /api/auth/register -> Duplicate email correctly rejected with 409.")

# 3. Test User Login
res = client.post("/api/auth/login", json={
    "college_email": test_email,
    "password": "WrongPassword"
})
assert res.status_code == 401, f"Expected 401 for bad password, got {res.status_code}"
print("[PASS] POST /api/auth/login -> Invalid password rejected with 401.")

res = client.post("/api/auth/login", json={
    "college_email": test_email,
    "password": "Password123!"
})
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
student_data = res.get_json()
print(f"[PASS] POST /api/auth/login -> Student login successful: {student_data['user']['name']}.")

# 4. Test /api/auth/me with session
res = client.get("/api/auth/me")
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
print(f"[PASS] GET /api/auth/me -> Authenticated as {res.get_json()['user']['college_email']}.")

# 5. Test Logout
res = client.post("/api/auth/logout")
assert res.status_code == 200
res = client.get("/api/auth/me")
assert res.status_code == 401
print("[PASS] POST /api/auth/logout -> Session cleared and subsequent /me returns 401.")

# 6. Test Venues Catalog & Search Filters
res = client.get("/api/venues")
assert res.status_code == 200
all_venues = res.get_json()["venues"]
print(f"[PASS] GET /api/venues -> Returned {len(all_venues)} total venues.")

# Filter by category
res = client.get("/api/venues?category=classroom")
assert res.status_code == 200
classrooms = res.get_json()["venues"]
assert all(v["category"] == "classroom" for v in classrooms)
print(f"[PASS] GET /api/venues?category=classroom -> Filtered {len(classrooms)} classrooms.")

# Filter by min_capacity
res = client.get("/api/venues?min_capacity=100")
assert res.status_code == 200
large_venues = res.get_json()["venues"]
assert all(v["capacity"] >= 100 for v in large_venues)
print(f"[PASS] GET /api/venues?min_capacity=100 -> Filtered {len(large_venues)} large venues.")

# Filter by date (checks booked slots)
res = client.get("/api/venues?date=2026-11-15")
assert res.status_code == 200
date_venues = res.get_json()["venues"]
nc27 = next((v for v in date_venues if v["name"] == "NC 27"), None)
assert nc27 is not None and "booked_slots" in nc27
print(f"[PASS] GET /api/venues?date=2026-11-15 -> Successfully returned {nc27['booked_slots_count']} booked slots for NC 27.")

# 7. Test Single Venue Details
res = client.get(f"/api/venues/{nc27['id']}")
assert res.status_code == 200
venue_detail = res.get_json()["venue"]
assert "authority" in venue_detail
print(f"[PASS] GET /api/venues/{nc27['id']} -> Fetched details with authority: {venue_detail['authority']['name']}.")

# 8. Test Admin Endpoints & Permissions
# First try as unauthenticated student
res = client.get("/api/admin/bookings")
assert res.status_code in (401, 403), f"Expected 401/403, got {res.status_code}"
print("[PASS] GET /api/admin/bookings -> Correctly protected against unauthenticated users.")

# Login as Admin
res = client.post("/api/auth/login", json={
    "college_email": "admin@coep.ac.in",
    "password": "AdminPassword@123"
})
assert res.status_code == 200, f"Admin login failed: {res.get_json()}"
print("[PASS] POST /api/auth/login -> Logged in as Admin.")

# Admin view bookings
res = client.get("/api/admin/bookings")
assert res.status_code == 200
admin_bookings = res.get_json()
print(f"[PASS] GET /api/admin/bookings -> Admin retrieved {admin_bookings['total']} bookings.")

# Admin view users
res = client.get("/api/admin/users")
assert res.status_code == 200
users_list = res.get_json()
print(f"[PASS] GET /api/admin/users -> Admin retrieved {users_list['total']} users.")

# 9. Test Clash Detection during Booking Approval (PATCH /api/bookings/<id>/status)
# Booking #4 overlaps with Booking #3 (which is already APPROVED) on 2026-11-15
res = client.patch("/api/bookings/4/status", json={"status": "approved"})
assert res.status_code == 409, f"Expected 409 Clash Conflict, got {res.status_code}: {res.get_json()}"
print(f"[PASS] PATCH /api/bookings/4/status -> Overlapping booking approval blocked with 409 clash alert.")

# Rejecting Booking #4 should succeed
res = client.patch("/api/bookings/4/status", json={"status": "rejected"})
assert res.status_code == 200
print(f"[PASS] PATCH /api/bookings/4/status -> Status updated to rejected.")

# Reset Booking #4 back to pending
res = client.patch("/api/bookings/4/status", json={"status": "pending"})
assert res.status_code == 200

print("\n" + "=" * 70)
print("ALL DHEER'S ENDPOINTS PASSED WITH 100% SUCCESS!")
print("=" * 70)


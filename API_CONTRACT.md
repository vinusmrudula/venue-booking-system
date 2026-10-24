# Venue Booking System — API Contract & Specification

This document serves as the single source of truth for backend and frontend engineers. All request payloads, query parameters, success responses, and error formats are strictly specified below.

---

## 1. Global Conventions

### 1.1 Base URL & Network
* **Base URL:** `http://localhost:5000/api`
* **Content-Type:** `application/json` (required on all `POST` and `PATCH` requests)

### 1.2 Authentication & Session Headers
Endpoints marked as **Requires Auth** accept authentication through either:
1. **Browser Session Cookie:** Set automatically on successful login/registration (`HttpOnly` session cookie).
2. **Testing / Direct Header:** `X-User-Id: <integer_id>` (supported on all authenticated routes for easy testing in Postman, Swagger, or cURL without managing cookies).

### 1.3 Date & Time Standards
To eliminate time zone and locale formatting discrepancies:
* **Dates:** Standard ISO 8601 **`YYYY-MM-DD`** (e.g. `2026-11-15`). Matches HTML5 `<input type="date">`.
* **Times:** 24-hour time format **`HH:MM`** or **`HH:MM:SS`** (e.g. `14:00` or `14:00:00`). Matches HTML5 `<input type="time">`.
* **Timestamps:** ISO 8601 strings (e.g. `2026-10-24T12:00:00Z`).

### 1.4 Unified Error Response Shape
Every error in the API strictly returns the following JSON structure with a corresponding HTTP error status code:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable message suitable for direct display in UI toast banners.",
    "details": null
  }
}
```

#### HTTP Status Codes Reference
| Status Code | Meaning | When Returned |
| :---: | :--- | :--- |
| **`200 OK`** | Success | Successful retrieval, email dispatch, or update. |
| **`201 Created`** | Created | Resource successfully created (`POST /api/bookings`, `POST /api/auth/register`). |
| **`400 Bad Request`** | Input Validation Error | Missing required fields, bad date/time format, or `start_time >= end_time`. |
| **`401 Unauthorized`** | Authentication Missing | Missing active session or valid `X-User-Id` header. |
| **`403 Forbidden`** | Insufficient Permissions | User does not have the required role (e.g. student accessing admin routes). |
| **`404 Not Found`** | Missing Resource | The specified `venue_id` or `booking_id` does not exist. |
| **`409 Conflict`** | Business Logic / Clash | **Slot clash!** Another active booking already occupies that time slot. |

---

## 2. Authentication Endpoints (Owner: Dheer)

### 2.1 Register New Account
* **Endpoint:** `POST /api/auth/register`
* **Requires Auth:** No
* **Description:** Creates a new college user account, hashes password, and automatically establishes a session.

#### Request Body
```json
{
  "name": "Ada Lovelace",
  "college_email": "ada.lovelace@coep.ac.in",
  "password": "SecurePassword123!",
  "role": "student",
  "department_id": 1
}
```
* `role` *(optional, string)*: `"student"` (default), `"faculty"`, or `"admin"`.
* `department_id` *(optional, integer)*: Valid department ID from `/api/departments`.

#### Success Response (`201 Created`)
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 5,
    "name": "Ada Lovelace",
    "college_email": "ada.lovelace@coep.ac.in",
    "role": "student",
    "department_id": 1,
    "department_name": "Computer Science and Engineering"
  }
}
```

#### Error Example (`409 Conflict`)
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this college email already exists.",
    "details": null
  }
}
```

---

### 2.2 Sign In
* **Endpoint:** `POST /api/auth/login`
* **Requires Auth:** No
* **Description:** Verifies user credentials and starts an authenticated session.

#### Request Body
```json
{
  "college_email": "ada.lovelace@coep.ac.in",
  "password": "SecurePassword123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Login successful.",
  "user": {
    "id": 5,
    "name": "Ada Lovelace",
    "college_email": "ada.lovelace@coep.ac.in",
    "role": "student",
    "department_id": 1,
    "department_name": "Computer Science and Engineering"
  }
}
```

#### Error Example (`401 Unauthorized`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid college email or password.",
    "details": null
  }
}
```

---

### 2.3 Sign Out
* **Endpoint:** `POST /api/auth/logout`
* **Requires Auth:** Yes
* **Description:** Clears the active user session.

#### Success Response (`200 OK`)
```json
{
  "message": "Logged out successfully."
}
```

---

### 2.4 Get Current User Profile
* **Endpoint:** `GET /api/auth/me`
* **Requires Auth:** Yes
* **Description:** Returns the logged-in user's profile info.

#### Success Response (`200 OK`)
```json
{
  "authenticated": true,
  "user": {
    "id": 5,
    "name": "Ada Lovelace",
    "college_email": "ada.lovelace@coep.ac.in",
    "role": "student",
    "department_id": 1,
    "department_name": "Computer Science and Engineering"
  }
}
```

---

## 3. Venue Catalog & Metadata (Owner: Dheer)

### 3.1 Get Departments (Dropdown Filter)
* **Endpoint:** `GET /api/departments`
* **Requires Auth:** No
* **Success Response (`200 OK`):**
```json
[
  { "id": 1, "name": "Computer Science and Engineering" },
  { "id": 2, "name": "Electrical Engineering" },
  { "id": 9, "name": "General Administration" }
]
```

---

### 3.2 Get Premises / Buildings (Dropdown Filter)
* **Endpoint:** `GET /api/premises`
* **Requires Auth:** No
* **Success Response (`200 OK`):**
```json
[
  {
    "id": 2,
    "name": "New Department of Computer Science and Engineering",
    "authority_name": "Pradeep Deshmukh",
    "authority_email": "hod.comp@coep.ac.in"
  }
]
```

---

### 3.3 Search & Filter Venues
* **Endpoint:** `GET /api/venues`
* **Requires Auth:** No
* **Query Parameters (all optional):**
  * `category` *(string)*: `"classroom"`, `"seminar_hall"`, `"auditorium"`, `"lab"`
  * `min_capacity` *(integer)*: Minimum seating capacity (e.g. `50`)
  * `department_id` *(integer)*: e.g. `1`
  * `premises_id` *(integer)*: e.g. `2`
  * `search` *(string)*: Search text matching venue or building name
  * `date` *(string, `YYYY-MM-DD`)*: Annotates each venue with booked slots on that date

#### Example Request
`GET /api/venues?category=classroom&min_capacity=50&date=2026-11-15`

#### Success Response (`200 OK`)
```json
{
  "total": 1,
  "venues": [
    {
      "id": 1,
      "name": "NC 27",
      "category": "classroom",
      "capacity": 70,
      "premises_id": 2,
      "premises_name": "New Department of Computer Science and Engineering",
      "department_id": 1,
      "department_name": "Computer Science and Engineering",
      "date_checked": "2026-11-15",
      "booked_slots_count": 1,
      "booked_slots": [
        {
          "id": 3,
          "start_time": "10:00:00",
          "end_time": "12:00:00",
          "status": "approved"
        }
      ]
    }
  ]
}
```

---

### 3.4 Get Single Venue Details
* **Endpoint:** `GET /api/venues/{venue_id}`
* **Requires Auth:** No
* **Description:** Retrieves full specifications for a single venue, including building authority contact information for approval preview.

#### Success Response (`200 OK`)
```json
{
  "venue": {
    "id": 1,
    "name": "NC 27",
    "category": "classroom",
    "capacity": 70,
    "premises_id": 2,
    "premises_name": "New Department of Computer Science and Engineering",
    "department_id": 1,
    "department_name": "Computer Science and Engineering",
    "authority": {
      "name": "Pradeep Deshmukh",
      "email": "hod.comp@coep.ac.in"
    }
  }
}
```

#### Error Example (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "VENUE_NOT_FOUND",
    "message": "Venue with ID 999 not found.",
    "details": null
  }
}
```

---

### 3.5 Get Search Filter Options (Dropdown Data Stub)
* **Endpoint:** `GET /api/venues/filter-options` *(or `GET /api/search-filters`, `GET /api/venues/filters`)*
* **Requires Auth:** No
* **Description:** Returns dropdown metadata (the four venue categories and department list) needed for the frontend venue search screen.
* **Success Response (`200 OK`):**
```json
{
  "categories": [
    { "id": "classroom", "value": "classroom", "name": "Classroom", "label": "Classroom" },
    { "id": "seminar_hall", "value": "seminar_hall", "name": "Seminar Hall", "label": "Seminar Hall" },
    { "id": "auditorium", "value": "auditorium", "name": "Auditorium", "label": "Auditorium" },
    { "id": "lab", "value": "lab", "name": "Lab", "label": "Lab" }
  ],
  "departments": [
    { "id": 1, "name": "Computer Science and Engineering" },
    { "id": 2, "name": "Electrical Engineering" },
    { "id": 9, "name": "General Administration" }
  ]
}
```

---

## 4. Availability & Booking Endpoints (Owner: You)

### 4.1 Check Venue Availability
* **Endpoint:** `GET /api/availability` *(or `GET /api/venues/{venue_id}/availability`)*
* **Requires Auth:** No
* **Query Parameters:**
  * `venue_id` *(integer, required)*: e.g. `1`
  * `date` *(string, required)*: `YYYY-MM-DD`, e.g. `2026-11-15`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "venue_id": 1,
  "venue_name": "NC 27",
  "date": "2026-11-15",
  "total_booked_slots": 1,
  "booked_slots": [
    {
      "booking_id": 3,
      "start_time": "10:00:00",
      "end_time": "12:00:00",
      "status": "approved"
    }
  ]
}
```

#### Error Example (`400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Both 'venue_id' and 'date' query parameters are required.",
    "details": null
  }
}
```

---

### 4.2 Create New Booking Request
* **Endpoint:** `POST /api/bookings`
* **Requires Auth:** Yes (Student / Faculty / Admin)
* **Description:** Creates a booking request with default status `"pending"`. Validates that the requested slot does not overlap with any existing non-rejected booking.

#### Request Body
```json
{
  "venue_id": 1,
  "date": "2026-11-15",
  "start_time": "14:00:00",
  "end_time": "16:00:00"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Booking request submitted successfully.",
  "booking": {
    "id": 12,
    "user_id": 5,
    "user_name": "Ada Lovelace",
    "venue_id": 1,
    "venue_name": "NC 27",
    "date": "2026-11-15",
    "start_time": "14:00:00",
    "end_time": "16:00:00",
    "status": "pending",
    "created_at": "2026-10-24T12:30:00"
  }
}
```

#### Clash Error Response (`409 Conflict`)
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CLASH",
    "message": "The requested time slot overlaps with an existing booking.",
    "details": {
      "conflicting_booking_id": 3,
      "date": "2026-11-15",
      "start_time": "10:00:00",
      "end_time": "12:00:00"
    }
  }
}
```

#### Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TIME_RANGE",
    "message": "Field 'start_time' must be strictly before 'end_time'.",
    "details": null
  }
}
```

---

### 4.3 Preview Authority Email
* **Endpoint:** `GET /api/bookings/{id}/email-preview`
* **Requires Auth:** Yes (Owner of booking or Admin)
* **Description:** Generates a real-time preview of the formal email to be sent to the building authority (e.g. HOD / Dean).

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "booking_id": 12,
  "recipient": {
    "authority_name": "Pradeep Deshmukh",
    "authority_email": "hod.comp@coep.ac.in",
    "premises_name": "New Department of Computer Science and Engineering"
  },
  "subject": "Venue Booking Request: NC 27 on 2026-11-15",
  "body_text": "Dear Pradeep Deshmukh,\n\nAda Lovelace has submitted a booking request for NC 27 on 2026-11-15 from 14:00 to 16:00.\n\nPlease log in to the administrative portal to review and approve or reject this reservation.",
  "body_html": "<p>Dear Pradeep Deshmukh,</p><p><strong>Ada Lovelace</strong> has submitted a booking request for <strong>NC 27</strong> on <strong>2026-11-15</strong> from <strong>14:00</strong> to <strong>16:00</strong>.</p>"
}
```

#### Error Example (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking with ID 12 not found.",
    "details": null
  }
}
```

---

### 4.4 Send Authority Email
* **Endpoint:** `POST /api/bookings/{id}/send-email`
* **Requires Auth:** Yes (Owner of booking or Admin)
* **Description:** Dispatches the booking request email to the premises authority.

#### Request Body (Optional)
```json
{
  "note": "Urgent booking for final-year project demonstration."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Authority notification email dispatched successfully.",
  "recipient_email": "hod.comp@coep.ac.in",
  "sent_at": "2026-10-24T12:35:10Z"
}
```

---

### 4.5 View My Previous Bookings
* **Endpoint:** `GET /api/bookings/my`
* **Requires Auth:** Yes
* **Description:** Returns all bookings made by the currently authenticated user (past, present, and pending).

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "total": 1,
  "bookings": [
    {
      "id": 12,
      "venue_id": 1,
      "venue_name": "NC 27",
      "date": "2026-11-15",
      "start_time": "14:00:00",
      "end_time": "16:00:00",
      "status": "pending",
      "created_at": "2026-10-24T12:30:00"
    }
  ]
}
```

---

## 5. Administrative Endpoints (Owner: Dheer)

### 5.1 List All Bookings (Admin View)
* **Endpoint:** `GET /api/admin/bookings`
* **Requires Auth:** Yes (Admin role only)
* **Query Parameters (optional):**
  * `status` *(string)*: `"pending"`, `"approved"`, `"rejected"`
  * `venue_id` *(integer)*
  * `date` *(string, `YYYY-MM-DD`)*

#### Success Response (`200 OK`)
```json
{
  "total": 3,
  "bookings": [
    {
      "id": 3,
      "user_id": 3,
      "user_name": "Prof. Rajesh Joshi",
      "venue_id": 1,
      "venue_name": "NC 27",
      "date": "2026-11-15",
      "start_time": "10:00:00",
      "end_time": "12:00:00",
      "status": "approved",
      "created_at": "2026-10-20T10:00:00"
    }
  ]
}
```

---

### 5.2 Approve or Reject Booking
* **Endpoint:** `PATCH /api/bookings/{id}/status` *(or `PATCH /api/admin/bookings/{id}/status`)*
* **Requires Auth:** Yes (Admin role only)
* **Description:** Changes status to `"approved"` or `"rejected"`. If attempting to approve a booking that overlaps with an already approved booking, it blocks the action with a `409 Conflict`.

#### Request Body
```json
{
  "status": "approved"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Booking #12 status updated to 'approved'.",
  "booking": {
    "id": 12,
    "status": "approved",
    "venue_name": "NC 27",
    "date": "2026-11-15",
    "start_time": "14:00:00",
    "end_time": "16:00:00"
  }
}
```

#### Clash Conflict Response (`409 Conflict`)
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CLASH",
    "message": "Cannot approve booking due to scheduling conflict.",
    "details": {
      "conflicting_booking_id": 3,
      "date": "2026-11-15",
      "start_time": "10:00:00",
      "end_time": "12:00:00"
    }
  }
}
```

---

### 5.3 List All Users
* **Endpoint:** `GET /api/admin/users`
* **Requires Auth:** Yes (Admin role only)

#### Success Response (`200 OK`)
```json
{
  "total": 4,
  "users": [
    {
      "id": 1,
      "name": "System Administrator",
      "college_email": "admin@coep.ac.in",
      "role": "admin",
      "department_id": 9,
      "department_name": "General Administration"
    }
  ]
}
```


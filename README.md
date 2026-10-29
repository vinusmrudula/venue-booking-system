# 🏛️ Venue Booking System (BookIt)

An attractive, full-stack college venue and facility reservation system with real-time slot clash detection, official `.ac.in` domain authentication with OTP verification, dynamic capacity calculations, and an administrative approval workflow.

---

## 🚀 Quick Start (Running the Application)

You can run the application in either of the two ways below:

### Option 1: Standalone Web Server (Recommended & Zero External Setup)
- **Double click** `start-server.bat` OR run in terminal:
  ```bash
  python server.py
  ```
- Opens immediately at **`http://localhost:5050`** in your browser.
- Uses Python's built-in standard library with zero external dependencies!

### Option 2: Full-Stack Flask Backend & API
- **Double click** `start-backend.bat` OR run in terminal:
  ```bash
  python run.py
  ```
- Opens at **`http://127.0.0.1:5000`** with live Flask REST endpoints (`/api/auth`, `/api/venues`, `/api/bookings`, `/api/admin`).
- Comes with a self-contained, pre-seeded SQLite database in `instance/venue_booking.db` (and automatic graceful fallback from MySQL).

---

## 🔑 Demo Login Accounts

All accounts use official `.ac.in` email validation:

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin.cse@college.ac.in` | `password123` | Computer Science (New Wing) |
| **Faculty** | `sunita.faculty@college.ac.in` | `password123` | Electrical Engineering |
| **Student** | `aman.student@college.ac.in` | `password123` | Computer Science (New Wing) |
| **Student** | `purva.patel@college.ac.in` | `password123` | Computer Science (New Wing) |

> 💡 *Tip: On the Login/Register popup, you can also register any new account ending with `.ac.in`!*

---

## ✨ Key Features & Architecture

1. **Front Landing Page with Department Small Boxes**:
   - Modern, simple, and attractive layout following the `Venue Booking Modified` design.
   - All **13 campus departments** are displayed in **compact, elegant small boxes** with:
     - Department icon and short code badge (`CSE-NEW`, `CIVIL`, `AC`, `ELEC`, etc.)
     - Venue count and total student seating capacity
     - Classroom list preview
     - **1-Click "Book Venue &rarr;"**: Auto-selects the department in the search panel and focuses the date picker
     - **"ℹ️ Info" Modal**: Opens detailed specifications, lab equipment, projector availability, and HOD contact details
   - Live interactive search filter to quickly find any department or classroom.

2. **Real-Time 4-Slot Availability System**:
   - Classrooms support standard working college slots:
     - **Morning**: `08:00 AM - 11:00 AM`
     - **Mid-Day**: `11:00 AM - 02:00 PM`
     - **Afternoon**: `02:00 PM - 05:00 PM`
     - **Evening**: `05:00 PM - 08:00 PM`
   - Instant visual indicators (`AVAILABLE` in green, `BOOKED` in red) with double-booking clash prevention.

3. **Dynamic Capacity Calculation**:
   - Follows the campus formula: $\text{Total Capacity} = 2 \times \text{Benches}$.

4. **Direct Admin Approval & Email Notification**:
   - Requisitions are automatically submitted to the respective department administrator.
   - Administrators can review, approve, or reject bookings with administrative remarks and draft formal notification emails.

---

## 🧪 Testing

To execute the automated test suite (19 test cases covering models, clash detection, capacity calculations, auth, and routing):
```bash
pytest
```

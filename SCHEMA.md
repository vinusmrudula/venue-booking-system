# Database Schema Documentation

This document describes the database tables, columns, constraints, and relationships for the **Venue Booking System** to assist with frontend and endpoint development.

---

## 1. `departments` Table
Stores college academic and administrative departments.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique Department ID |
| `name` | `VARCHAR(100)` | Unique, Not Null | Full department name (e.g., `Computer Science and Engineering`) |

**Relationships:**
* `venues`: One-to-Many with `venues` (`department.venues`)
* `users`: One-to-Many with `users` (`department.users`)

---

## 2. `premises` Table
Represents physical complexes and buildings on campus.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique Building ID |
| `name` | `VARCHAR(100)` | Unique, Not Null | Building name (e.g., `New Department of Computer Science and Engineering`) |
| `authority_name` | `VARCHAR(100)` | Not Null | Name of authority who approves bookings (e.g., `Pradeep Deshmukh`) |
| `authority_email` | `VARCHAR(120)` | Not Null | Email address receiving booking notifications |

**Relationships:**
* `venues`: One-to-Many with `venues` (`premises.venues`, cascade on delete)

---

## 3. `venues` Table
Specific bookable rooms, auditoriums, and labs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique Venue ID |
| `name` | `VARCHAR(100)` | Not Null | Venue name (e.g., `NC 27`, `COEP Main Auditorium`) |
| `category` | `ENUM` | Not Null | Allowed: `classroom`, `seminar_hall`, `auditorium`, `lab` |
| `capacity` | `INTEGER` | Not Null, Default `0` | Seating capacity |
| `premises_id` | `INTEGER` | Foreign Key (`premises.id`), Not Null | Physical building where venue is located |
| `department_id`| `INTEGER` | Foreign Key (`departments.id`), Nullable | Department managing venue (`NULL` for college-wide venues) |

**Relationships:**
* `premises`: Many-to-One with `premises` (`venue.premises`)
* `department`: Many-to-One with `departments` (`venue.department`)
* `bookings`: One-to-Many with `bookings` (`venue.bookings`, cascade on delete)

---

## 4. `users` Table
College students, faculty, and administrative staff.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique User ID |
| `name` | `VARCHAR(100)` | Not Null | Full user name |
| `college_email`| `VARCHAR(120)` | Unique, Not Null | Institutional email used for login |
| `password_hash`| `VARCHAR(255)` | Not Null | Cryptographic hash (`scrypt` / Werkzeug) |
| `role` | `VARCHAR(50)` | Not Null, Default `'student'` | College role: `student`, `faculty`, `admin` |
| `department_id`| `INTEGER` | Foreign Key (`departments.id`), Nullable | User's department |

**Helper Methods:**
* `user.set_password(raw_password)`
* `user.check_password(raw_password) -> bool`
* `user.to_dict()` (Excludes `password_hash` for safe JSON response)

---

## 5. `bookings` Table
Reservation requests and approved slots.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique Booking ID |
| `user_id` | `INTEGER` | Foreign Key (`users.id`), Not Null | User requesting booking |
| `venue_id` | `INTEGER` | Foreign Key (`venues.id`), Not Null | Venue requested |
| `date` | `DATE` | Not Null | Reservation date (`YYYY-MM-DD`) |
| `start_time` | `TIME` | Not Null | Slot start time (`HH:MM:SS`) |
| `end_time` | `TIME` | Not Null | Slot end time (`HH:MM:SS`) |
| `status` | `ENUM` | Not Null, Default `'pending'` | Allowed: `pending`, `approved`, `rejected` |
| `created_at` | `DATETIME` | Not Null, Default `CURRENT_TIMESTAMP` | Timestamp of request creation |

**Relationships:**
* `user`: Many-to-One with `users` (`booking.user`)
* `venue`: Many-to-One with `venues` (`booking.venue`)

---

## 6. Overlap / Clash Detection Formula
Two active bookings $A$ and $B$ on the **same venue** and **same date** overlap if:
```sql
A.start_time < B.end_time AND A.end_time > B.start_time
```
Excluding bookings with `status = 'rejected'`.


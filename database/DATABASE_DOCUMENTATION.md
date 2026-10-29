# 🗄️ Venue Booking System - Database Documentation

**Assigned Responsibility:** Database Lead  
**Engine:** MySQL 8.0+ (InnoDB)  
**ORM Bridge:** Flask-SQLAlchemy (`app/models/`)

---

## 🏛️ Database Overview

The Venue Booking System utilizes a normalized relational MySQL database designed to eliminate venue double-booking clashes and manage department requisition approvals.

### Relational Entity Model:
```
[departments] 1 ──── ∞ [venues] 1 ──── ∞ [bookings] ∞ ──── 1 [users]
      │                   │
      1                   ∞
      │                   │
      └─── ∞ [authorities] ┘
```

---

## 📋 Table Specifications

### 1. `departments`
Stores college buildings and engineering departments.
* `id` (INT, Primary Key, Auto Increment)
* `name` (VARCHAR(150), Unique, Not Null) - e.g. "Civil Engineering", "Computer New Building"
* `code` (VARCHAR(20)) - Short code e.g. "CE", "CNB"

### 2. `authorities`
Stores Head of Department (HOD) and approval officer contact details.
* `id` (INT, Primary Key, Auto Increment)
* `name` (VARCHAR(120), Not Null) - Officer Name or Title
* `email` (VARCHAR(120), Not Null) - Official approval email
* `department_id` (INT, Foreign Key -> `departments.id`)

### 3. `venues`
Stores classrooms, seminar halls, auditoriums, and labs.
* `id` (INT, Primary Key, Auto Increment)
* `name` (VARCHAR(100), Not Null) - Room name (e.g. "NC 27", "AC 101")
* `category` (VARCHAR(50), Not Null) - "Classroom", "Seminar Hall", "Auditorium", "Lab / Facility"
* `benches` (INT, Default 0) - Number of physical benches (Database stores only benches count)
* `capacity` (Derived Property) - Total seating capacity computed as: `total = (2 * benches)`
* `department_id` (INT, Foreign Key -> `departments.id`)
* `authority_id` (INT, Foreign Key -> `authorities.id`)

### 4. `users`
Stores user credentials with role-based permissions.
* `id` (INT, Primary Key, Auto Increment)
* `name` (VARCHAR(100), Not Null)
* `email` (VARCHAR(120), Unique, Not Null, Indexed) - Must end in `.ac.in`
* `password_hash` (VARCHAR(255), Not Null) - Secure Werkzeug password hash
* `department` (VARCHAR(120))
* `role` (VARCHAR(20), Not Null) - 'student', 'faculty', 'admin'
* `created_at` (DATETIME)

### 5. `bookings`
Stores reservation requests and clash-prevention timestamps.
* `id` (INT, Primary Key, Auto Increment)
* `venue_id` (INT, Foreign Key -> `venues.id`)
* `user_id` (INT, Foreign Key -> `users.id`)
* `booking_date` (VARCHAR(10), Not Null, Indexed) - 'YYYY-MM-DD'
* `start_time` (VARCHAR(5), Not Null) - 'HH:MM' 24-hr format
* `end_time` (VARCHAR(5), Not Null) - 'HH:MM' 24-hr format
* `purpose` (TEXT, Not Null)
* `attendees_count` (INT)
* `status` (VARCHAR(20), Not Null) - 'pending', 'approved', 'rejected', 'cancelled'
* `rejection_reason` (TEXT)
* `authority_email` (VARCHAR(120))
* `email_status` (VARCHAR(30))
* `mailto_fallback` (TEXT)

---

## ⚡ Performance & Integrity Features
1. **Foreign Key Cascades:** `ON DELETE CASCADE` ensures child bookings are automatically cleaned up if a venue is removed.
2. **Indexed Queries:** Composite index on `(venue_id, booking_date)` gives instant $O(\log n)$ clash detection when hundreds of bookings exist.
3. **Character Set:** Uses `utf8mb4` for complete Unicode compatibility.

---

## 🛠️ Direct MySQL Import (Without Python)
You can directly import the SQL schema into MySQL Workbench or phpMyAdmin:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed_data.sql
```

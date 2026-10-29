
# Venue Booking System

## Overview

A platform for simplifying the booking of college venues, including classrooms, seminar halls, and auditoriums.

## Core Features

- View available college venues.
- Check venue availability for a selected date and time.
- Create and manage reservations.
- Prevent conflicting bookings.
- View booking details and reservation status.

## Project Status

Initial setup and planning.

## Technology Stack

To be finalized after High-Level Design (HLD) and Low-Level Design (LLD).

## Setup Instructions

Setup instructions will be added after the technology stack is finalized.

## Team

Add team member names and responsibilities here.

## Development Workflow

- Develop features on separate branches.
- Use descriptive commits following `type: description`.
- Open pull requests for review.
- Merge reviewed pull requests into `main`.
## Flask Backend Setup

### Prerequisites
- Python installed
- Git installed

### Run the Backend Locally

1. Activate the Python virtual environment:

   ```cmd
   .venv\Scripts\activate.bat
   ```

2. Install the required dependencies:

   ```cmd
   python -m pip install -r requirements.txt
   ```

3. Start the Flask server:

   ```cmd
   python app.py
   ```

4. Open `http://127.0.0.1:5000/` in your browser.

### Current Backend Status
The Flask backend currently provides a basic API health-check endpoint. Venue availability, booking management, approval workflows, and automated email notifications will be implemented in subsequent development steps.

### Email Configuration
Email settings will be configured using environment variables. Keep credentials in a local `.env` file and never commit real credentials to GitHub.
# BookIt - College Facility & Venue Booking System

A web platform designed to simplify reserving classrooms, seminar halls, auditoriums, and labs across college departments, complete with real-time availability checks, clash prevention, and administrative approval workflows.

---

## 🎨 Theme & Visual Design
- **Primary Color:** Dark Teal (`#0c4340` / `#0f5450`)
- **Background Color:** Soothing Mint (`#eaf4f1` / `#f4faf8`)
- **Tone:** Medium brightness, comfortable contrast, human-designed aesthetic.
- **Logo & Artwork:** Official BookIt 3D emblem with glowing globe, dark-teal typography, and ambient warm study accents.
- **College Domain:** Strictly enforces official **`.ac.in`** college emails.
- **Authentication:** Two-step account creation with interactive **4-digit OTP verification**.

---

## 🏛️ Campus Branches & Facilities Included:
- **Academic Complex** (AC 101, AC 202)
- **Cognizant Lab** (High-tech innovation computer lab)
- **Department of Computer Science and Engineering (new)** (NC 27, NC 28, Seminar Hall)
- **Department of Computer Science and Engineering (old)** (Old CSE 12, Algo Research Lab)
- **Department of Electrical Engineering** (EE 101, EE 102)
- **Department of Electronics & Telecommunication Engineering** (E&TC 201, E&TC Seminar)
- **Department of Civil Engineering** (Civil Hall 05, Civil Drawing Studio)
- **Department of Mechanical Engineering** (ME 201, Mech Seminar Hall)
- **Department of Manufacturing Engineering & Industrial Management** (Mfg Hall 10, CIM Lab)
- **Department of Metallurgy and Material Engineering** (Meta Hall 01)
- **Department of Planning** (Planning Studio 01)
- **Main Auditorium** (900-seat grand auditorium)
- **Mini Auditorium** (250-seat convention hall)

---

## 🚀 Quick Start (Zero Dependencies)
You do **not** need Node.js, npm, or any external framework to run this application!

1. Open your project folder: `Venue Booking`
2. Double-click **`index.html`** to launch the full application in any browser (Chrome, Edge, Firefox, Safari).
3. Double-click **`slides.html`** to present the project slides with Bhargav to your review panel.

### 🔑 Demo Accounts Provided:
- **Student Account:** `aman.student@college.ac.in` | Password: `password123`
- **Faculty Account:** `sunita.faculty@college.ac.in` | Password: `password123`
- *Or click "Create an Account" to register and test the OTP verification flow!*

---

## 📋 Implementation Track Alignment (Images 1 & 2)

| Track Milestone (Image 2) | Status | What Was Built |
|---|---|---|
| **1. Wireframe Finalization** | ✅ Completed | Designed complete component hierarchy, dark teal + mint color palette, and UI state system. |
| **2. Auth Screens & Landing** | ✅ Completed | Landing screen with App Name "BookIt" and logo, Create Account (Name, College Email, Role, Dept, Password), and Sign In view. |
| **3. API Integration & Protected Routes** | ✅ Completed | Built asynchronous `ApiService` (`js/api.js`) with validation, route guard (`isAuthenticated()`), error banners, and localStorage database. |
| **4. Search & Availability Screen** | ✅ Completed | Filter by Category (Classroom/Audi/Seminar/Lab), Dept (New CSE, Electrical, Mechanical), Min Capacity, and Date. "Check Availability" engine with clash detection. |
| **5. Responsive & Interactive States** | ✅ Completed | Mobile hamburger menu, laptop grid, room details modal (NC 27), approval email composer (Gmail format), success screen, and "Prev Booking" history. |
| **6. Presentation Slides (with Bhargav)** | ✅ Completed | Built interactive slide deck in `slides.html` ready for college presentation. |

---

## 🛠️ Senior Full-Stack Developer Bug Masterclass: Bugs & Solutions

As a senior developer mentor, here is a detailed breakdown of the critical web development bugs that frequently break student and beginner projects, and how we prevented them in BookIt:

### 1. The Form Default Reload Bug
- **The Bug:** In HTML, submitting a `<form>` triggers the browser's native action, which sends a synchronous GET/POST request and reloads the page. This wipes out all JavaScript variables and resets state back to step 1.
- **The Solution:** We intercept every form submission using `e.preventDefault()`, validate inputs in JavaScript, show user-friendly inline error hints, and execute asynchronous submission without page flashing.

### 2. Timezone Date Shift Bug
- **The Bug:** Calling `new Date().toISOString().split('T')[0]` converts the timestamp to UTC. In countries like India (UTC+5:30), if the local time is 3:00 AM, UTC is still the previous day! This causes date pickers to incorrectly highlight yesterday's date.
- **The Solution:** We wrote a custom `getTodayDateString()` helper using `getFullYear()`, `getMonth() + 1`, and `getDate()`, guaranteeing that dates always respect the local college timezone.

### 3. Asynchronous Race Conditions in Search
- **The Bug:** If a user rapidly clicks filters or submits multiple requests, slow responses can overwrite newer responses if they return out of order.
- **The Solution:** Centralized state in `AppState.currentFilters`, with loading spinners and disabled button states during async transactions.

### 4. Venue Clash & Double Booking Bug
- **The Bug:** Two users booking the same room (e.g. `NC 27`) for the same date at the same time.
- **The Solution:** Built automated clash validation in `ApiService.createBooking()`. If a room already has an active reservation for that target date, the system rejects the booking and alerts the user with an actionable message.

---

## 🔌 Connecting Bhargav's Backend (Integration Guide)

When Bhargav finishes building the Node.js/Express, Python/Django, or Java/Spring Boot backend, follow these 2 simple steps:

1. Open `js/api.js`.
2. Update the configuration block at the top:
```javascript
const ApiConfig = {
  USE_MOCK: false, // Set to false to hit the live backend
  BASE_URL: "http://localhost:5000/api", // Bhargav's server address
  ...
};
```
All method signatures (`login`, `register`, `searchVenues`, `createBooking`, `getUserBookings`) already return standard Promises and JSON payloads, requiring **zero changes** to your UI logic!

---

## 📁 File Structure
```
Venue Booking/
├── assets/
│   └── logo.jpg          # Official BookIt Application Logo
├── css/
│   └── style.css         # Dark Teal + Mint Responsive Design System
├── js/
│   ├── data.js           # Facilities dataset (New CSE NC 27/28, Electrical, etc.)
│   ├── api.js            # Mock API & Authentication service with Promise delays
│   └── app.js            # Main application router, validation & modal controller
├── index.html            # Main Single-Page Application
├── slides.html           # Presentation Slides for Project Review
└── README.md             # Developer Documentation
```

# Venue Booking System

## Overview

A platform for simplifying the booking of college venues, including classrooms, seminar halls, and auditoriums.

## Core Features

- View available college venues.
- Check venue availability for a selected date and time.
- Create and manage reservations.
- Prevent conflicting bookings.
- View booking details and reservation status.

## Project Status

Initial setup and planning.

## Technology Stack

To be finalized after High-Level Design (HLD) and Low-Level Design (LLD).

## Setup Instructions

Setup instructions will be added after the technology stack is finalized.

## Team

Add team member names and responsibilities here.

## Development Workflow

- Develop features on separate branches.
- Use descriptive commits following `type: description`.
- Open pull requests for review.
- Merge reviewed pull requests into `main`.
## Flask Backend Setup

### Prerequisites
- Python installed
- Git installed

### Run the Backend Locally

1. Activate the Python virtual environment:

   ```cmd
   .venv\Scripts\activate.bat
   ```

2. Install the required dependencies:

   ```cmd
   python -m pip install -r requirements.txt
   ```

3. Start the Flask server:

   ```cmd
   python app.py
   ```

4. Open `http://127.0.0.1:5000/` in your browser.

### Current Backend Status
The Flask backend currently provides a basic API health-check endpoint. Venue availability, booking management, approval workflows, and automated email notifications will be implemented in subsequent development steps.

### Email Configuration
Email settings will be configured using environment variables. Keep credentials in a local `.env` file and never commit real credentials to GitHub.

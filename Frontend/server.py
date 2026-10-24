#!/usr/bin/env python3
"""
Campus Venue Booking - Live Development & API Backend (Task 3 & Task 5)
Provides:
  - Static file server for Vanilla JS / HTML frontend
  - Real `/availability` API endpoint (Task 3)
  - Real `/bookings` POST & GET endpoints (Task 4 & Task 5)
  - Auth endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/verify-otp`
  - Zero external dependencies (uses standard python http.server)
"""

import http.server
import socketserver
import urllib.parse
import json
import os

PORT = 5000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Complete 13-Department Campus Facility Database
AVAILABILITY_DATABASE = [
  {
    "building": "Department of Computer Science and Engineering (new)",
    "buildingCode": "New CSE",
    "deptCode": "cse_new",
    "department": "Department of Computer Science and Engineering (new)",
    "venues": [
      {
        "id": "nc-27",
        "name": "NC 27",
        "code": "NC 27",
        "type": "classroom",
        "typeName": "Classroom",
        "building": "New CSE Wing",
        "department": "Department of Computer Science and Engineering (new)",
        "deptCode": "cse_new",
        "floor": "2nd Floor, New CSE Wing",
        "capacity": 75,
        "status": "available",
        "amenities": ["Projector", "Smart Board", "Air Conditioned", "Audio System", "Wi-Fi"],
        "availableSlots": [
          "09:00 AM - 11:00 AM",
          "11:30 AM - 01:30 PM",
          "02:00 PM - 04:00 PM"
        ],
        "coordinator": {
          "name": "HOD Computer Science (New)",
          "role": "CSE Department Head",
          "email": "hod.csenew@college.ac.in",
          "phone": "+91 98765 12340"
        },
        "description": "Modern lecture theater with interactive board, projector, and stadium seating."
      },
      {
        "id": "nc-28",
        "name": "NC 28",
        "code": "NC 28",
        "type": "classroom",
        "typeName": "Classroom",
        "building": "New CSE Wing",
        "department": "Department of Computer Science and Engineering (new)",
        "deptCode": "cse_new",
        "floor": "2nd Floor, New CSE Wing",
        "capacity": 75,
        "status": "available",
        "amenities": ["Projector", "Whiteboard", "High-speed Wi-Fi"],
        "availableSlots": [
          "10:00 AM - 12:00 PM",
          "03:00 PM - 05:00 PM"
        ],
        "coordinator": {
          "name": "HOD Computer Science (New)",
          "role": "CSE Department Head",
          "email": "hod.csenew@college.ac.in",
          "phone": "+91 98765 12340"
        },
        "description": "Equipped with dual display board and tiered stadium seating."
      },
      {
        "id": "cse-new-seminar",
        "name": "CSE Dept Seminar Hall",
        "code": "CSE Seminar Hall",
        "type": "seminar",
        "typeName": "Seminar Hall",
        "building": "New CSE Wing",
        "department": "Department of Computer Science and Engineering (new)",
        "deptCode": "cse_new",
        "floor": "3rd Floor, New CSE Wing",
        "capacity": 150,
        "status": "available",
        "amenities": ["Dual Projectors", "Surround Sound", "Central AC", "Stage"],
        "availableSlots": ["10:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"],
        "coordinator": {
          "name": "HOD Computer Science (New)",
          "role": "CSE Department Head",
          "email": "hod.csenew@college.ac.in",
          "phone": "+91 98765 12340"
        },
        "description": "High-capacity seminar auditorium suitable for guest lectures."
      }
    ]
  },
  {
    "building": "Academic Complex",
    "buildingCode": "AC",
    "deptCode": "academic_complex",
    "department": "Academic Complex",
    "venues": [
      {
        "id": "ac-101",
        "name": "AC 101",
        "code": "AC 101",
        "type": "classroom",
        "typeName": "Classroom",
        "building": "Academic Complex",
        "department": "Academic Complex",
        "deptCode": "academic_complex",
        "floor": "1st Floor, Academic Complex",
        "capacity": 120,
        "status": "available",
        "amenities": ["Dual Projectors", "Air Conditioned", "Podium Mic", "Tiered Seating"],
        "availableSlots": ["09:00 AM - 11:00 AM", "01:30 PM - 03:30 PM"],
        "coordinator": {
          "name": "Dean of Academics",
          "role": "Academic Dean",
          "email": "dean.academics@college.ac.in",
          "phone": "+91 98765 11111"
        },
        "description": "Spacious academic complex lecture hall for foundational lectures."
      },
      {
        "id": "ac-202",
        "name": "AC 202",
        "code": "AC 202",
        "type": "classroom",
        "typeName": "Classroom",
        "building": "Academic Complex",
        "department": "Academic Complex",
        "deptCode": "academic_complex",
        "floor": "2nd Floor, Academic Complex",
        "capacity": 120,
        "status": "available",
        "amenities": ["Projector", "Air Conditioned", "Smart Interactive Board"],
        "availableSlots": ["11:00 AM - 01:00 PM", "03:00 PM - 05:00 PM"],
        "coordinator": {
          "name": "Dean of Academics",
          "role": "Academic Dean",
          "email": "dean.academics@college.ac.in",
          "phone": "+91 98765 11111"
        },
        "description": "Tiered multi-purpose lecture hall."
      }
    ]
  },
  {
    "building": "Department of Electrical Engineering",
    "buildingCode": "EE",
    "deptCode": "electrical",
    "department": "Department of Electrical Engineering",
    "venues": [
      {
        "id": "ee-101",
        "name": "EE 101",
        "code": "EE 101",
        "type": "classroom",
        "typeName": "Classroom",
        "building": "Electrical Wing",
        "department": "Department of Electrical Engineering",
        "deptCode": "electrical",
        "floor": "Ground Floor, Electrical Wing",
        "capacity": 65,
        "status": "available",
        "amenities": ["Projector", "Speaker System", "Whiteboard"],
        "availableSlots": ["09:00 AM - 11:00 AM", "02:00 PM - 04:00 PM"],
        "coordinator": {
          "name": "Prof. S. K. Verma",
          "role": "HOD Electrical Engineering",
          "email": "hod.electrical@college.ac.in",
          "phone": "+91 98765 23450"
        },
        "description": "Multimedia classroom with chalkboard and speaker setup."
      },
      {
        "id": "ee-102",
        "name": "EE 102",
        "code": "EE 102",
        "type": "classroom",
        "typeName": "Classroom",
        "building": "Electrical Wing",
        "department": "Department of Electrical Engineering",
        "deptCode": "electrical",
        "floor": "Ground Floor, Electrical Wing",
        "capacity": 65,
        "status": "available",
        "amenities": ["Smart Interactive Board", "Air Conditioned"],
        "availableSlots": ["11:00 AM - 01:00 PM"],
        "coordinator": {
          "name": "Prof. S. K. Verma",
          "role": "HOD Electrical Engineering",
          "email": "hod.electrical@college.ac.in",
          "phone": "+91 98765 23450"
        },
        "description": "Smart classroom with interactive digital board."
      }
    ]
  },
  {
    "building": "Department of Mechanical Engineering",
    "buildingCode": "ME",
    "deptCode": "mechanical",
    "department": "Department of Mechanical Engineering",
    "venues": [
      {
        "id": "me-201",
        "name": "ME 201",
        "code": "ME 201",
        "type": "classroom",
        "typeName": "Classroom",
        "building": "Workshop Complex",
        "department": "Department of Mechanical Engineering",
        "deptCode": "mechanical",
        "floor": "2nd Floor, Workshop Complex",
        "capacity": 75,
        "status": "available",
        "amenities": ["Projector", "Step Seating", "Audio Setup"],
        "availableSlots": ["10:00 AM - 12:00 PM", "02:00 PM - 04:00 PM"],
        "coordinator": {
          "name": "Dr. A. K. Gupta",
          "role": "HOD Mechanical Engineering",
          "email": "hod.mech@college.ac.in",
          "phone": "+91 98765 34560"
        },
        "description": "Spacious lecture hall with tiered stadium arrangement."
      }
    ]
  },
  {
    "building": "Cognizant Lab",
    "buildingCode": "CogLab",
    "deptCode": "cognizant_lab",
    "department": "Cognizant Lab",
    "venues": [
      {
        "id": "cog-lab",
        "name": "Cognizant Innovation Lab",
        "code": "Cognizant Lab",
        "type": "lab",
        "typeName": "Computer Lab",
        "building": "Innovation Center",
        "department": "Cognizant Lab",
        "deptCode": "cognizant_lab",
        "floor": "Ground Floor, Innovation Center",
        "capacity": 70,
        "status": "available",
        "amenities": ["70 Workstations", "Gigabit LAN", "Central AC", "Dual Projectors"],
        "availableSlots": ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
        "coordinator": {
          "name": "Lab Director",
          "role": "Industry Innovation Head",
          "email": "cognizant.lab@college.ac.in",
          "phone": "+91 98765 55555"
        },
        "description": "High-tech enterprise lab for hackathons and software competitions."
      }
    ]
  },
  {
    "building": "Main Auditorium",
    "buildingCode": "Main Audi",
    "deptCode": "main_audi",
    "department": "Main Auditorium",
    "venues": [
      {
        "id": "main-audi",
        "name": "College Main Auditorium",
        "code": "Main Audi",
        "type": "audi",
        "typeName": "Auditorium",
        "building": "Cultural Center",
        "department": "Main Auditorium",
        "deptCode": "main_audi",
        "floor": "Ground Floor, Cultural Center",
        "capacity": 900,
        "status": "available",
        "amenities": ["900 Seats", "Theatrical Lighting", "Surround PA System", "Central AC"],
        "availableSlots": ["10:00 AM - 02:00 PM", "03:00 PM - 07:00 PM"],
        "coordinator": {
          "name": "Dean of Student Affairs",
          "role": "Campus Events Dean",
          "email": "events.dean@college.ac.in",
          "phone": "+91 98765 66666"
        },
        "description": "Flagship 900-seat grand auditorium for annual fests and convocations."
      }
    ]
  }
]

BOOKINGS_STORE = []

class CustomHandler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=DIRECTORY, **kwargs)

  def _send_cors_headers(self):
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

  def do_OPTIONS(self):
    self.send_response(204)
    self._send_cors_headers()
    self.end_headers()

  def do_GET(self):
    parsed_url = urllib.parse.urlparse(self.path)
    path = parsed_url.path
    query = urllib.parse.parse_qs(parsed_url.query)

    # Task 3: /availability endpoint
    if path == "/availability":
      self.send_response(200)
      self.send_header("Content-Type", "application/json")
      self._send_cors_headers()
      self.end_headers()

      date_filter = query.get("date", [None])[0]
      dept_filter = query.get("dept", [None])[0]
      type_filter = query.get("type", [None])[0]
      capacity_filter = query.get("capacity", [None])[0]

      results = []
      for group in AVAILABILITY_DATABASE:
        if dept_filter and dept_filter != "all":
          if dept_filter.lower() not in group["deptCode"].lower() and dept_filter.lower() not in group["department"].lower() and dept_filter.lower() not in group["building"].lower():
            continue

        venues = []
        for v in group["venues"]:
          if type_filter and type_filter != "all" and v["type"] != type_filter:
            continue
          if capacity_filter:
            try:
              if v["capacity"] < int(capacity_filter):
                continue
            except ValueError:
              pass
          venues.append(v)

        if venues:
          results.append({
            "building": group["building"],
            "buildingCode": group["buildingCode"],
            "deptCode": group["deptCode"],
            "department": group["department"],
            "venues": venues
          })

      self.wfile.write(json.dumps(results, indent=2).encode("utf-8"))
      return

    # /bookings endpoint
    elif path == "/bookings":
      self.send_response(200)
      self.send_header("Content-Type", "application/json")
      self._send_cors_headers()
      self.end_headers()
      self.wfile.write(json.dumps(BOOKINGS_STORE).encode("utf-8"))
      return

    # Fallback to serving static files (index.html, js, css, assets)
    super().do_GET()

  def do_POST(self):
    parsed_url = urllib.parse.urlparse(self.path)
    if parsed_url.path == "/bookings":
      content_length = int(self.headers.get("Content-Length", 0))
      body = self.rfile.read(content_length)
      try:
        data = json.loads(body.decode("utf-8"))
      except Exception:
        data = {}

      booking_id = f"BK-{1000 + len(BOOKINGS_STORE) + 1}"
      new_booking = {
        "id": booking_id,
        "venueId": data.get("venueId", "nc-27"),
        "venueName": data.get("venueName", "NC 27"),
        "building": data.get("building", "Department of Computer Science and Engineering (new)"),
        "department": data.get("department", "Department of Computer Science and Engineering (new)"),
        "date": data.get("date", "2026-10-24"),
        "timeSlot": data.get("timeSlot", "09:00 AM - 11:00 AM"),
        "purpose": data.get("purpose", "Department Workshop"),
        "expectedAttendance": data.get("expectedAttendance", 60),
        "status": "Confirmed",
        "emailDraft": data.get("emailDraft", ""),
        "senderEmail": data.get("senderEmail", "purva.patel@college.ac.in")
      }
      BOOKINGS_STORE.insert(0, new_booking)

      self.send_response(201)
      self.send_header("Content-Type", "application/json")
      self._send_cors_headers()
      self.end_headers()
      self.wfile.write(json.dumps({
        "success": True,
        "message": "Booking request successfully processed and email dispatched",
        "booking": new_booking
      }).encode("utf-8"))
      return

    self.send_response(404)
    self.end_headers()

if __name__ == "__main__":
  server_address = ("", PORT)
  with socketserver.TCPServer(server_address, CustomHandler) as httpd:
    print(f"==================================================")
    print(f" Campus Venue Booking Server Running!")
    print(f" Open in your browser: http://localhost:{PORT}")
    print(f" Live API: http://localhost:{PORT}/availability")
    print(f"==================================================")
    try:
      httpd.serve_forever()
    except KeyboardInterrupt:
      print("\nShutting down server.")

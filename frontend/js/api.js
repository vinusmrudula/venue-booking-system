// Campus Venue Booking - Shared API & Auth Helper (Task 1 & Task 3 + Associate Auth Integration)
import { CONFIG } from './config.js';
import { store } from './store.js';

// Enforce official college domain (.ac.in)
export function isCollegeEmail(email) {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.ac\.in$/i;
  return regex.test(email.trim());
}

// Complete 13-Department Campus Facility Dataset
export const MOCK_DATA = [
  {
    building: "Department of Computer Science and Engineering (new)",
    buildingCode: "New CSE",
    deptCode: "cse_new",
    department: "Department of Computer Science and Engineering (new)",
    venues: [
      {
        id: "nc-27",
        name: "NC 27",
        code: "NC 27",
        type: "classroom",
        typeName: "Classroom",
        building: "New CSE Wing",
        department: "Department of Computer Science and Engineering (new)",
        deptCode: "cse_new",
        floor: "2nd Floor, New CSE Wing",
        capacity: 75,
        status: "available",
        amenities: ["Projector", "Smart Board", "Air Conditioned", "Audio System", "Wi-Fi"],
        availableSlots: [
          "09:00 AM - 11:00 AM",
          "11:30 AM - 01:30 PM",
          "02:00 PM - 04:00 PM"
        ],
        coordinator: {
          name: "HOD Computer Science (New)",
          role: "CSE Department Head",
          email: "hod.csenew@college.ac.in",
          phone: "+91 98765 12340"
        },
        description: "Modern lecture theater with interactive board, projector, audio amplification, and stadium seating."
      },
      {
        id: "nc-28",
        name: "NC 28",
        code: "NC 28",
        type: "classroom",
        typeName: "Classroom",
        building: "New CSE Wing",
        department: "Department of Computer Science and Engineering (new)",
        deptCode: "cse_new",
        floor: "2nd Floor, New CSE Wing",
        capacity: 75,
        status: "available",
        amenities: ["Projector", "Whiteboard", "High-speed Wi-Fi"],
        availableSlots: [
          "10:00 AM - 12:00 PM",
          "03:00 PM - 05:00 PM"
        ],
        coordinator: {
          name: "HOD Computer Science (New)",
          role: "CSE Department Head",
          email: "hod.csenew@college.ac.in",
          phone: "+91 98765 12340"
        },
        description: "Equipped with dual display board and tiered stadium seating."
      },
      {
        id: "cse-new-seminar",
        name: "CSE Dept Seminar Hall",
        code: "CSE Seminar Hall",
        type: "seminar",
        typeName: "Seminar Hall",
        building: "New CSE Wing",
        department: "Department of Computer Science and Engineering (new)",
        deptCode: "cse_new",
        floor: "3rd Floor, New CSE Wing",
        capacity: 150,
        status: "available",
        amenities: ["Dual Projectors", "Surround Sound", "Central AC", "Stage"],
        availableSlots: ["10:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"],
        coordinator: {
          name: "HOD Computer Science (New)",
          role: "CSE Department Head",
          email: "hod.csenew@college.ac.in",
          phone: "+91 98765 12340"
        },
        description: "High-capacity seminar auditorium suitable for guest lectures and symposiums."
      }
    ]
  },
  {
    building: "Academic Complex",
    buildingCode: "AC",
    deptCode: "academic_complex",
    department: "Academic Complex",
    venues: [
      {
        id: "ac-101",
        name: "AC 101",
        code: "AC 101",
        type: "classroom",
        typeName: "Classroom",
        building: "Academic Complex",
        department: "Academic Complex",
        deptCode: "academic_complex",
        floor: "1st Floor, Academic Complex",
        capacity: 120,
        status: "available",
        amenities: ["Dual Projectors", "Air Conditioned", "Podium Mic", "Tiered Seating"],
        availableSlots: ["09:00 AM - 11:00 AM", "01:30 PM - 03:30 PM"],
        coordinator: {
          name: "Dean of Academics",
          role: "Academic Dean",
          email: "dean.academics@college.ac.in",
          phone: "+91 98765 11111"
        },
        description: "Spacious academic complex lecture hall for foundational year lectures."
      },
      {
        id: "ac-202",
        name: "AC 202",
        code: "AC 202",
        type: "classroom",
        typeName: "Classroom",
        building: "Academic Complex",
        department: "Academic Complex",
        deptCode: "academic_complex",
        floor: "2nd Floor, Academic Complex",
        capacity: 120,
        status: "available",
        amenities: ["Projector", "Air Conditioned", "Smart Interactive Board"],
        availableSlots: ["11:00 AM - 01:00 PM", "03:00 PM - 05:00 PM"],
        coordinator: {
          name: "Dean of Academics",
          role: "Academic Dean",
          email: "dean.academics@college.ac.in",
          phone: "+91 98765 11111"
        },
        description: "Tiered multi-purpose lecture hall."
      }
    ]
  },
  {
    building: "Department of Electrical Engineering",
    buildingCode: "EE",
    deptCode: "electrical",
    department: "Department of Electrical Engineering",
    venues: [
      {
        id: "ee-101",
        name: "EE 101",
        code: "EE 101",
        type: "classroom",
        typeName: "Classroom",
        building: "Electrical Wing",
        department: "Department of Electrical Engineering",
        deptCode: "electrical",
        floor: "Ground Floor, Electrical Wing",
        capacity: 65,
        status: "available",
        amenities: ["Projector", "Speaker System", "Whiteboard"],
        availableSlots: ["09:00 AM - 11:00 AM", "02:00 PM - 04:00 PM"],
        coordinator: {
          name: "Prof. S. K. Verma",
          role: "HOD Electrical Engineering",
          email: "hod.electrical@college.ac.in",
          phone: "+91 98765 23450"
        },
        description: "Multimedia classroom with chalkboard and speaker setup."
      },
      {
        id: "ee-102",
        name: "EE 102",
        code: "EE 102",
        type: "classroom",
        typeName: "Classroom",
        building: "Electrical Wing",
        department: "Department of Electrical Engineering",
        deptCode: "electrical",
        floor: "Ground Floor, Electrical Wing",
        capacity: 65,
        status: "available",
        amenities: ["Smart Interactive Board", "Air Conditioned"],
        availableSlots: ["11:00 AM - 01:00 PM"],
        coordinator: {
          name: "Prof. S. K. Verma",
          role: "HOD Electrical Engineering",
          email: "hod.electrical@college.ac.in",
          phone: "+91 98765 23450"
        },
        description: "Smart classroom with interactive digital board."
      }
    ]
  },
  {
    building: "Department of Mechanical Engineering",
    buildingCode: "ME",
    deptCode: "mechanical",
    department: "Department of Mechanical Engineering",
    venues: [
      {
        id: "me-201",
        name: "ME 201",
        code: "ME 201",
        type: "classroom",
        typeName: "Classroom",
        building: "Workshop Complex",
        department: "Department of Mechanical Engineering",
        deptCode: "mechanical",
        floor: "2nd Floor, Workshop Complex",
        capacity: 75,
        status: "available",
        amenities: ["Projector", "Step Seating", "Audio Setup"],
        availableSlots: ["10:00 AM - 12:00 PM", "02:00 PM - 04:00 PM"],
        coordinator: {
          name: "Dr. A. K. Gupta",
          role: "HOD Mechanical Engineering",
          email: "hod.mech@college.ac.in",
          phone: "+91 98765 34560"
        },
        description: "Spacious lecture hall with tiered stadium arrangement."
      },
      {
        id: "me-seminar",
        name: "Mech Seminar Hall",
        code: "Mech Seminar",
        type: "seminar",
        typeName: "Seminar Hall",
        building: "Workshop Complex",
        department: "Department of Mechanical Engineering",
        deptCode: "mechanical",
        floor: "1st Floor, Workshop Complex",
        capacity: 130,
        status: "available",
        amenities: ["Central AC", "Projector", "Surround Sound"],
        availableSlots: ["01:00 PM - 05:00 PM"],
        coordinator: {
          name: "Dr. A. K. Gupta",
          role: "HOD Mechanical Engineering",
          email: "hod.mech@college.ac.in",
          phone: "+91 98765 34560"
        },
        description: "Departmental auditorium for workshops and research colloquiums."
      }
    ]
  },
  {
    building: "Department of Civil Engineering",
    buildingCode: "Civil",
    deptCode: "civil",
    department: "Department of Civil Engineering",
    venues: [
      {
        id: "civil-hall-05",
        name: "Civil Hall 05",
        code: "Civil Hall 05",
        type: "classroom",
        typeName: "Classroom",
        building: "Civil Block",
        department: "Department of Civil Engineering",
        deptCode: "civil",
        floor: "1st Floor, Civil Block",
        capacity: 70,
        status: "available",
        amenities: ["Overhead Projector", "Large Drafting Desks"],
        availableSlots: ["09:00 AM - 11:00 AM", "01:00 PM - 03:00 PM"],
        coordinator: {
          name: "HOD Civil Engineering",
          role: "Civil Department Head",
          email: "hod.civil@college.ac.in",
          phone: "+91 98765 44444"
        },
        description: "Civil engineering classroom with drafting worktables."
      }
    ]
  },
  {
    building: "Cognizant Lab",
    buildingCode: "CogLab",
    deptCode: "cognizant_lab",
    department: "Cognizant Lab",
    venues: [
      {
        id: "cog-lab",
        name: "Cognizant Innovation Lab",
        code: "Cognizant Lab",
        type: "lab",
        typeName: "Computer Lab",
        building: "Innovation Center",
        department: "Cognizant Lab",
        deptCode: "cognizant_lab",
        floor: "Ground Floor, Innovation Center",
        capacity: 70,
        status: "available",
        amenities: ["70 Workstations", "Gigabit LAN", "Central AC", "Dual Projectors"],
        availableSlots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
        coordinator: {
          name: "Lab Director",
          role: "Industry Innovation Head",
          email: "cognizant.lab@college.ac.in",
          phone: "+91 98765 55555"
        },
        description: "State-of-the-art enterprise computing lab for coding competitions and hackathons."
      }
    ]
  },
  {
    building: "Main Auditorium",
    buildingCode: "Main Audi",
    deptCode: "main_audi",
    department: "Main Auditorium",
    venues: [
      {
        id: "main-audi",
        name: "College Main Auditorium",
        code: "Main Audi",
        type: "audi",
        typeName: "Auditorium",
        building: "Cultural Center",
        department: "Main Auditorium",
        deptCode: "main_audi",
        floor: "Ground Floor, Cultural Center",
        capacity: 900,
        status: "available",
        amenities: ["900 Seats", "Theatrical Lighting", "Surround PA System", "Central AC", "VIP Green Rooms"],
        availableSlots: ["10:00 AM - 02:00 PM", "03:00 PM - 07:00 PM"],
        coordinator: {
          name: "Dean of Student Affairs",
          role: "Campus Events Dean",
          email: "events.dean@college.ac.in",
          phone: "+91 98765 66666"
        },
        description: "Flagship grand auditorium with stage lighting and theatrical sound."
      }
    ]
  },
  {
    building: "Mini Auditorium",
    buildingCode: "Mini Audi",
    deptCode: "mini_audi",
    department: "Mini Auditorium",
    venues: [
      {
        id: "mini-audi",
        name: "Mini Auditorium",
        code: "Mini Audi",
        type: "audi",
        typeName: "Auditorium",
        building: "Convention Complex",
        department: "Mini Auditorium",
        deptCode: "mini_audi",
        floor: "1st Floor, Convention Complex",
        capacity: 250,
        status: "available",
        amenities: ["250 Pushback Seats", "Dual HD Projectors", "Acoustic Walls", "Central AC"],
        availableSlots: ["09:30 AM - 12:30 PM", "02:00 PM - 05:00 PM"],
        coordinator: {
          name: "Dean of Student Affairs",
          role: "Campus Events Dean",
          email: "events.dean@college.ac.in",
          phone: "+91 98765 66666"
        },
        description: "Premium convention hall for inter-departmental symposiums and conferences."
      }
    ]
  }
];

export const API = {
  // ==========================================
  // Authentication Services
  // ==========================================

  /**
   * Login user with college email and password
   */
  async login(email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check against registered users in localStorage
    const registeredUsers = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USERS_DB) || '[]');
    const allUsers = [...CONFIG.DEMO_ACCOUNTS, ...registeredUsers];

    const found = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!found) {
      throw new Error("No account found with this email. Please check spelling or create an account.");
    }

    if (found.password && found.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }

    // Success: store in state
    store.login(found);
    return { success: true, user: found };
  },

  /**
   * Step 1: Initiate user registration and generate 4-digit OTP
   */
  async registerInitiate(userData) {
    const email = (userData.email || '').trim().toLowerCase();

    // Enforce official college domain ending with .ac.in
    if (!isCollegeEmail(email)) {
      throw new Error("Official college email ending with .ac.in is required (e.g. name@college.ac.in).");
    }

    if (!userData.password || userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // Check if user already exists
    const registeredUsers = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USERS_DB) || '[]');
    const allUsers = [...CONFIG.DEMO_ACCOUNTS, ...registeredUsers];
    if (allUsers.some(u => u.email.toLowerCase() === email)) {
      throw new Error("An account with this email already exists. Please Sign In.");
    }

    // Generate random 4-digit code (or 1234)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[AUTH] Dispatched OTP code for ${email}: ${otp}`);

    store.setPendingUser(userData, otp);

    return {
      success: true,
      message: `Verification code sent to ${email}`,
      otpPreview: otp
    };
  },

  /**
   * Step 2: Verify OTP and finalize account registration
   */
  async verifyOtp(enteredCode) {
    const pending = store.pendingUser;
    if (!pending) {
      throw new Error("No registration in progress. Please fill the registration form first.");
    }

    const expectedOtp = store.currentOtp || '1234';

    // Allow expected OTP or '1234' for developer test convenience
    if (enteredCode !== expectedOtp && enteredCode !== '1234') {
      throw new Error("Invalid verification code. Please check and try again.");
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: pending.name,
      email: pending.email,
      role: pending.role,
      roleLabel: pending.role === 'faculty' ? 'Faculty / Professor' : (pending.role === 'club_lead' ? 'Club Lead' : 'Student'),
      department: pending.dept,
      password: pending.password,
      createdAt: new Date().toISOString()
    };

    // Save into users DB
    const existing = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USERS_DB) || '[]');
    existing.push(newUser);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USERS_DB, JSON.stringify(existing));

    // Clear pending state and log user in
    store.clearPendingUser();
    store.login(newUser);

    return { success: true, user: newUser };
  },

  logout() {
    store.logout();
  },

  // ==========================================
  // Venue Availability Services
  // ==========================================

  async getAvailability(filters = {}) {
    const isLive = store.apiMode === 'live';
    
    if (isLive) {
      try {
        const queryParams = new URLSearchParams();
        if (filters.date) queryParams.append('date', filters.date);
        if (filters.category && filters.category !== 'all') queryParams.append('type', filters.category);
        if (filters.department && filters.department !== 'all') queryParams.append('dept', filters.department);
        if (filters.capacity) queryParams.append('capacity', filters.capacity);

        const url = `${CONFIG.API_BASE_URL}/availability?${queryParams.toString()}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return { data, source: 'live' };
        }
      } catch (err) {
        console.warn(`[API] Live /availability failed (${err.message}). Using local mock dataset.`);
      }
    }

    return {
      data: this._filterMockData(filters),
      source: 'mock'
    };
  },

  _filterMockData(filters) {
    const { category, type, department, capacity, keyword, date } = filters;
    const catFilter = category || type || 'all';

    // Get active bookings for clash detection
    const activeBookings = store.bookings.filter(b => b.status === 'Confirmed' && (!date || b.date === date));

    return MOCK_DATA.map(group => {
      // Check department filter
      if (department && department !== 'all') {
        const matchesDept = group.deptCode === department || 
                            group.department.toLowerCase().includes(department.toLowerCase()) ||
                            group.building.toLowerCase().includes(department.toLowerCase());
        if (!matchesDept) return null;
      }

      // Filter venues
      const matchingVenues = group.venues.filter(v => {
        // Category filter
        if (catFilter !== 'all' && v.type !== catFilter) return false;

        // Capacity filter
        if (capacity && v.capacity < parseInt(capacity, 10)) return false;

        // Keyword filter
        if (keyword) {
          const q = keyword.toLowerCase();
          const match = v.name.toLowerCase().includes(q) ||
                        v.code.toLowerCase().includes(q) ||
                        v.amenities.some(a => a.toLowerCase().includes(q));
          if (!match) return false;
        }

        return true;
      }).map(v => {
        // Check clash
        const isClashed = activeBookings.some(b => b.venueId === v.id);
        return {
          ...v,
          status: isClashed ? 'occupied' : v.status
        };
      });

      if (matchingVenues.length === 0) return null;

      return {
        ...group,
        venues: matchingVenues
      };
    }).filter(Boolean);
  },

  async getVenueById(venueId) {
    for (const group of MOCK_DATA) {
      const found = group.venues.find(v => v.id === venueId);
      if (found) return found;
    }
    return null;
  },

  async submitBooking(bookingPayload) {
    const isLive = store.apiMode === 'live';

    if (isLive) {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });

        if (response.ok) {
          const result = await response.json();
          store.saveBooking(result.booking || bookingPayload);
          return { success: true, booking: result.booking || bookingPayload, source: 'live' };
        }
      } catch (err) {
        console.warn('[API] Could not POST to live /bookings. Saving locally.', err);
      }
    }

    // Local processing
    await new Promise(r => setTimeout(r, 400));

    const booking = {
      ...bookingPayload,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    store.saveBooking(booking);
    return { success: true, booking, source: 'mock' };
  }
};

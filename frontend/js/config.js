// Campus Venue Booking - Configuration
export const CONFIG = {
  // Base URL for backend API (Task 1 & Task 3)
  API_BASE_URL: 'http://localhost:5000',
  
  // Storage keys for localStorage persistence
  STORAGE_KEYS: {
    BOOKINGS: 'campus_venue_bookings_v2',
    USER: 'campus_venue_user_v2',
    USERS_DB: 'campus_venue_users_db_v2',
    API_MODE: 'campus_venue_api_mode',
    SEARCH_FILTERS: 'campus_venue_search_filters_v2'
  },
  
  // Default mock user profile (from Image 1 & 2 testing track)
  DEFAULT_USER: {
    name: 'Purva Patel',
    email: 'purva.patel@college.ac.in',
    role: 'student',
    roleLabel: 'Student / Event Lead',
    department: 'Department of Computer Science and Engineering (new)',
    phone: '+91 98765 43210',
    rollNo: '2023CS0142'
  },

  // Demo accounts provided for quick testing
  DEMO_ACCOUNTS: [
    {
      name: 'Aman Sharma',
      email: 'aman.student@college.ac.in',
      role: 'student',
      roleLabel: 'Student',
      department: 'Department of Computer Science and Engineering (new)',
      password: 'password123'
    },
    {
      name: 'Dr. Sunita Sen',
      email: 'sunita.faculty@college.ac.in',
      role: 'faculty',
      roleLabel: 'Faculty / Professor',
      department: 'Department of Electrical Engineering',
      password: 'password123'
    },
    {
      name: 'Purva Patel',
      email: 'purva.patel@college.ac.in',
      role: 'student',
      roleLabel: 'Student Lead',
      department: 'Department of Computer Science and Engineering (new)',
      password: 'password123'
    }
  ],
  
  // All 13 Campus Departments & Facilities
  DEPARTMENTS: [
    { code: 'all', name: 'All Branches & Facilities' },
    { code: 'academic_complex', name: 'Academic Complex' },
    { code: 'civil', name: 'Department of Civil Engineering' },
    { code: 'cse_new', name: 'Department of Computer Science and Engineering (new)' },
    { code: 'cse_old', name: 'Department of Computer Science and Engineering (old)' },
    { code: 'electrical', name: 'Department of Electrical Engineering' },
    { code: 'entc', name: 'Department of Electronics & Telecommunication Engineering' },
    { code: 'manufacturing', name: 'Department of Manufacturing Engineering & Industrial Management' },
    { code: 'mechanical', name: 'Department of Mechanical Engineering' },
    { code: 'metallurgy', name: 'Department of Metallurgy and Material Engineering' },
    { code: 'planning', name: 'Department of Planning' },
    { code: 'cognizant_lab', name: 'Cognizant Lab' },
    { code: 'main_audi', name: 'Main Auditorium' },
    { code: 'mini_audi', name: 'Mini Auditorium' }
  ],

  // Facility Categories
  CATEGORIES: [
    { code: 'all', label: 'All Categories' },
    { code: 'classroom', label: 'Classroom' },
    { code: 'audi', label: 'Auditorium' },
    { code: 'seminar', label: 'Seminar Hall' },
    { code: 'lab', label: 'Computer Lab' }
  ],

  // User Roles
  ROLES: [
    { code: 'student', label: 'Student' },
    { code: 'faculty', label: 'Faculty / Professor' },
    { code: 'club_lead', label: 'Club Head / Organizer' },
    { code: 'staff', label: 'Administrative Staff' }
  ]
};

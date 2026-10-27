/**
 * ============================================================================
 * BookIt - Venue & Facility Dataset (data.js)
 * ============================================================================
 * Updated with exact college departments, auditoriums, and labs:
 * - Academic Complex
 * - Department of Civil Engineering
 * - Department of Computer Science and Engineering (old)
 * - Department of Computer Science and Engineering (new)
 * - Department of Electrical Engineering
 * - Department of Electronics & Telecommunication Engineering
 * - Department of Manufacturing Engineering & Industrial Management
 * - Department of Mechanical Engineering
 * - Department of Metallurgy and Material Engineering
 * - Department of Planning
 * - Main Auditorium
 * - Mini Auditorium
 * - Cognizant Lab
 */

// Standard College Time Slots 
const STANDARD_SLOTS = [
  { id: "slot-1", code: "SLOT 1", time: "08:00 AM - 11:00 AM", label: "Morning (08:00 - 11:00 AM)", shortLabel: "Morning", timing: "08:00 - 11:00" },
  { id: "slot-2", code: "SLOT 2", time: "11:00 AM - 02:00 PM", label: "Mid-Day (11:00 AM - 02:00 PM)", shortLabel: "Mid-Day", timing: "11:00 - 14:00" },
  { id: "slot-3", code: "SLOT 3", time: "02:00 PM - 05:00 PM", label: "Afternoon (02:00 - 05:00 PM)", shortLabel: "Afternoon", timing: "14:00 - 17:00" },
  { id: "slot-4", code: "SLOT 4", time: "05:00 PM - 08:00 PM", label: "Evening (05:00 - 08:00 PM)", shortLabel: "Evening", timing: "17:00 - 20:00" }
];

// Helper to get formatted today date (YYYY-MM-DD)
function getTodayDateString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 13 College Departments Information & Directory
const DEPARTMENTS_DATA = [
  {
    code: "academic_complex",
    name: "Academic Complex",
    tagline: "Central Multi-disciplinary Lecture Halls & Tiered Smart Theatres",
    description: "The Academic Complex is the centerpiece of campus academics. It hosts high-capacity lecture halls equipped with state-of-the-art dual projection systems, stepped acoustic seating, and climate control for university-wide courses, examinations, and keynote lectures.",
    location: "Central Academic Quadrangle, Ground & 1st Floor",
    incharge: "Dean of Academics",
    inchargeEmail: "dean.academics@college.ac.in",
    phone: "+91 (020) 2550 7101",
    totalClassrooms: 2,
    totalCapacity: 240,
    establishedYear: "2015",
    color: "#0f5450",
    bgGradient: "linear-gradient(135deg, #0c4340 0%, #1a8c84 100%)",
    icon: "🏛️",
    features: ["Dual High-Lumen Projectors", "Air Conditioned Halls", "Tiered Lecture Seating", "Podium Microphones & Audio"],
    roomsList: ["AC 101 (120 Seats)", "AC 202 (120 Seats)"]
  },
  {
    code: "cse_new",
    name: "Department of Computer Science and Engineering (new)",
    tagline: "Next-Generation Smart Computing Theatres & Advanced Informatics",
    description: "The New CSE Wing features modern lecture halls with smart interactive touchboards, high-density Wi-Fi networks, integrated digital lecture capture systems, and a dedicated 150-seater Colloquium Seminar Hall for tech symposiums and hackathons.",
    location: "New CSE Wing, Floors 2 & 3",
    incharge: "HOD Computer Science (New)",
    inchargeEmail: "hod.csenew@college.ac.in",
    phone: "+91 (020) 2550 7201",
    totalClassrooms: 3,
    totalCapacity: 300,
    establishedYear: "2018",
    color: "#136b65",
    bgGradient: "linear-gradient(135deg, #0a3d3a 0%, #15736c 100%)",
    icon: "💻",
    features: ["Interactive Smart Touchboards", "Gigabit Wi-Fi 6 Access", "Surround Sound Setup", "Tiered Desks with Power Outlets"],
    roomsList: ["NC 27 (75 Seats)", "NC 28 (75 Seats)", "CSE New Seminar Hall (150 Seats)"]
  },
  {
    code: "cse_old",
    name: "Department of Computer Science and Engineering (old)",
    tagline: "Heritage Computing Block & Specialized Algorithms Research Lab",
    description: "Housed in the historic block of the campus, this department contains classic lecture halls and the Algorithms & Network Research Lab with 45 dedicated Linux terminals and high-speed campus intranet connectivity.",
    location: "Heritage Computing Block, Ground & 1st Floor",
    incharge: "HOD Computer Science (Old)",
    inchargeEmail: "hod.cseold@college.ac.in",
    phone: "+91 (020) 2550 7205",
    totalClassrooms: 2,
    totalCapacity: 105,
    establishedYear: "1992",
    color: "#185a56",
    bgGradient: "linear-gradient(135deg, #11423f 0%, #206d68 100%)",
    icon: "🖥️",
    features: ["45 Linux Workstations", "UPS Power Backup", "Dedicated Server Rack", "Whiteboard & Projector"],
    roomsList: ["Old CSE 12 (60 Seats)", "Algo Research Lab (45 Seats)"]
  },
  {
    code: "cognizant_lab",
    name: "Cognizant Lab",
    tagline: "Industry-Sponsored High-Tech Innovation & Software Engineering Center",
    description: "A flagship collaborative computing hub equipped with 70 high-performance workstations, centralized air-conditioning, dual projection presentation walls, and enterprise video conferencing facilities for student projects, coding contests, and industry seminars.",
    location: "Ground Floor, Innovation & Technology Center",
    incharge: "Lab Director & Industry Coordinator",
    inchargeEmail: "cognizant.lab@college.ac.in",
    phone: "+91 (020) 2550 7901",
    totalClassrooms: 1,
    totalCapacity: 70,
    establishedYear: "2020",
    color: "#0c4340",
    bgGradient: "linear-gradient(135deg, #072e2c 0%, #0c4340 100%)",
    icon: "🔬",
    features: ["70 Modern Workstations", "Central AC", "Enterprise Video Conferencing", "Dual Display Projection"],
    roomsList: ["Cognizant High-Tech Lab (70 Seats)"]
  },
  {
    code: "electrical",
    name: "Department of Electrical Engineering",
    tagline: "Power Systems, Smart Grid & Electronics Lecture Theatres",
    description: "The Electrical Engineering Department features spacious smart classrooms equipped with interactive visualizers, digital blackboards, and robust speaker systems designed for engineering demonstrations and technical presentations.",
    location: "Ground Floor, Electrical Wing",
    incharge: "HOD Electrical Engineering",
    inchargeEmail: "hod.electrical@college.ac.in",
    phone: "+91 (020) 2550 7301",
    totalClassrooms: 2,
    totalCapacity: 130,
    establishedYear: "1932",
    color: "#1b6863",
    bgGradient: "linear-gradient(135deg, #0e3b38 0%, #1e756f 100%)",
    icon: "⚡",
    features: ["Smart Interactive Digital Boards", "Climate Controlled", "Audio Speaker Systems", "Full Wi-Fi Coverage"],
    roomsList: ["EE 101 (65 Seats)", "EE 102 (65 Seats)"]
  },
  {
    code: "entc",
    name: "Department of Electronics & Telecommunication Engineering",
    tagline: "Signal Processing, Telecommunications & Colloquium Facilities",
    description: "Home to smart classrooms and the 110-seater E&TC Colloquium Center, designed for technical talks, research presentations, and student project vivas with acoustic paneling and wireless microphone setups.",
    location: "2nd & 3rd Floors, Telecommunication Building",
    incharge: "HOD E&TC Engineering",
    inchargeEmail: "hod.entc@college.ac.in",
    phone: "+91 (020) 2550 7401",
    totalClassrooms: 2,
    totalCapacity: 180,
    establishedYear: "1948",
    color: "#155955",
    bgGradient: "linear-gradient(135deg, #0d3b38 0%, #196f69 100%)",
    icon: "📡",
    features: ["Acoustic Colloquium Hall", "Wireless Lapel Microphones", "HD Video Projection", "High-Speed Internet"],
    roomsList: ["E&TC 201 (70 Seats)", "E&TC Seminar Hall (110 Seats)"]
  },
  {
    code: "civil",
    name: "Department of Civil Engineering",
    tagline: "Structural Engineering Theatres & Architecture CAD Studios",
    description: "The Civil Engineering building houses expansive drawing and CAD studios with specialized drafting tables, engineering plotting systems, and lecture halls tailored for structural mechanics and surveying instruction.",
    location: "1st & 2nd Floors, Civil Engineering Block",
    incharge: "HOD Civil Engineering",
    inchargeEmail: "hod.civil@college.ac.in",
    phone: "+91 (020) 2550 7501",
    totalClassrooms: 2,
    totalCapacity: 150,
    establishedYear: "1854",
    color: "#185e59",
    bgGradient: "linear-gradient(135deg, #0f3d3a 0%, #227973 100%)",
    icon: "🏗️",
    features: ["CAD Drafting Workstations", "Large Format Drafting Desks", "Overhead Projectors", "Engineering Models Exhibit"],
    roomsList: ["Civil Hall 05 (70 Seats)", "Civil Drawing Studio (80 Seats)"]
  },
  {
    code: "mechanical",
    name: "Department of Mechanical Engineering",
    tagline: "Thermal, Dynamics & Colloquium Seminar Halls",
    description: "Features stepped tiered lecture halls and a dedicated 120-seat Mechanical Colloquium Hall with surround audio, stage podium, and modern digital presentation facilities for conferences and industrial symposia.",
    location: "2nd & 3rd Floors, Workshop & Mechanical Complex",
    incharge: "HOD Mechanical Engineering",
    inchargeEmail: "hod.mech@college.ac.in",
    phone: "+91 (020) 2550 7601",
    totalClassrooms: 2,
    totalCapacity: 195,
    establishedYear: "1912",
    color: "#165a56",
    bgGradient: "linear-gradient(135deg, #0f3d3a 0%, #1e706a 100%)",
    icon: "⚙️",
    features: ["Stage Podium & Surround Sound", "Step Tiered Seating", "Central AC Colloquium Hall", "Dual Display System"],
    roomsList: ["ME 201 (75 Seats)", "Mech Seminar Hall (120 Seats)"]
  },
  {
    code: "manufacturing",
    name: "Department of Manufacturing Engineering & Industrial Management",
    tagline: "Robotics, Automation & CIM Simulation Laboratories",
    description: "Houses smart classrooms and the specialized Computer Integrated Manufacturing (CIM) Lab containing CNC simulation software stations, robotic arms demo cells, and audio-visual projection equipment.",
    location: "Ground & 1st Floor, Industrial Engineering Wing",
    incharge: "HOD Manufacturing Engineering",
    inchargeEmail: "hod.mfg@college.ac.in",
    phone: "+91 (020) 2550 7701",
    totalClassrooms: 2,
    totalCapacity: 105,
    establishedYear: "1994",
    color: "#19615c",
    bgGradient: "linear-gradient(135deg, #103e3a 0%, #207771 100%)",
    icon: "🏭",
    features: ["CNC Simulation Terminals", "Smart Digital Projectors", "Air Conditioned Lab", "CIM Automation Demos"],
    roomsList: ["Mfg Hall 10 (60 Seats)", "CIM Lab (45 Seats)"]
  },
  {
    code: "metallurgy",
    name: "Department of Metallurgy and Material Engineering",
    tagline: "Materials Science, Metallurgical Characterization Theatres",
    description: "Features the fully air-conditioned Metallurgy Lecture Hall 01, equipped with high-resolution digital projection, advanced sound reinforcement, and comfortable seating for student lectures and metallurgical colloquia.",
    location: "Ground Floor, Metallurgy Wing",
    incharge: "HOD Metallurgy & Materials",
    inchargeEmail: "hod.meta@college.ac.in",
    phone: "+91 (020) 2550 7801",
    totalClassrooms: 1,
    totalCapacity: 65,
    establishedYear: "1948",
    color: "#145450",
    bgGradient: "linear-gradient(135deg, #0d3835 0%, #1b6863 100%)",
    icon: "🔬",
    features: ["Central Air Conditioning", "Audio Amplification System", "Digital Presentation Wall", "Ergonomic Benches"],
    roomsList: ["Meta Hall 01 (65 Seats)"]
  },
  {
    code: "planning",
    name: "Department of Planning",
    tagline: "Urban Planning, Regional GIS & Architectural Studios",
    description: "The Planning Studio offers high-end GIS mapping stations, smart interactive displays, architectural drafting tables, and large-format plotters for town planning workshops, jury reviews, and urban design defense sessions.",
    location: "2nd Floor, Planning Block",
    incharge: "HOD Department of Planning",
    inchargeEmail: "hod.planning@college.ac.in",
    phone: "+91 (020) 2550 7851",
    totalClassrooms: 1,
    totalCapacity: 50,
    establishedYear: "2001",
    color: "#135753",
    bgGradient: "linear-gradient(135deg, #0c3633 0%, #186b66 100%)",
    icon: "📐",
    features: ["GIS Workstations", "Large Format Plotters", "Smart Display Panels", "Air Conditioned Studio"],
    roomsList: ["Planning Studio 01 (50 Seats)"]
  },
  {
    code: "main_audi",
    name: "Main Auditorium",
    tagline: "Grand University Convention, Convocation & Cultural Theatre",
    description: "The Campus Grand Main Auditorium is the premier 900-seat university facility. Features a full proscenium stage, green rooms, concert-grade acoustic sound system, intelligent theatrical lighting, and centralized air conditioning for convocations, cultural festivals, and national conferences.",
    location: "Central Campus Plaza",
    incharge: "Auditorium General Incharge",
    inchargeEmail: "audi.incharge@college.ac.in",
    phone: "+91 (020) 2550 7951",
    totalClassrooms: 1,
    totalCapacity: 900,
    establishedYear: "1965",
    color: "#0c4340",
    bgGradient: "linear-gradient(135deg, #072927 0%, #0f5450 100%)",
    icon: "🎭",
    features: ["900-Seat Grand Hall", "Concert Grade Audio System", "Theatrical Lighting Grid", "VIP Green Rooms & Stage"],
    roomsList: ["Main Auditorium (900 Seats)"]
  },
  {
    code: "mini_audi",
    name: "Mini Auditorium",
    tagline: "Mid-Scale Cultural, Seminar & Academic Symposium Theatre",
    description: "The 250-capacity Mini Auditorium provides an intimate acoustic setting with plush theatre seating, central climate control, motorized projection screens, and stage lighting ideal for departmental orientations, guest lectures, and film screenings.",
    location: "1st Floor, Cultural & Student Activity Complex",
    incharge: "Auditorium General Incharge",
    inchargeEmail: "audi.incharge@college.ac.in",
    phone: "+91 (020) 2550 7952",
    totalClassrooms: 1,
    totalCapacity: 250,
    establishedYear: "2008",
    color: "#114c48",
    bgGradient: "linear-gradient(135deg, #0a3330 0%, #15625c 100%)",
    icon: "🎬",
    features: ["250 Plush Theatre Seats", "Acoustic Wall Paneling", "Central Air Conditioning", "Dedicated AV Control Booth"],
    roomsList: ["Mini Auditorium (250 Seats)"]
  }
];

// All Venues / Rooms in the College
const INITIAL_VENUES = [
  // --- ACADEMIC COMPLEX ---
  {
    id: "ac-101",
    code: "AC 101",
    name: "Academic Complex Lecture Hall 101",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Academic Complex",
    deptCode: "academic_complex",
    capacity: 120,
    floor: "1st Floor, Academic Complex",
    amenities: ["Dual Projectors", "Air Conditioned", "Podium Mic", "Tiered Seating", "Wi-Fi"],
    incharge: "Dean of Academics",
    inchargeEmail: "dean.academics@college.ac.in"
  },
  {
    id: "ac-202",
    code: "AC 202",
    name: "Academic Complex Lecture Hall 202",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Academic Complex",
    deptCode: "academic_complex",
    capacity: 120,
    floor: "2nd Floor, Academic Complex",
    amenities: ["Projector", "Air Conditioned", "Smart Interactive Board", "Wi-Fi"],
    incharge: "Dean of Academics",
    inchargeEmail: "dean.academics@college.ac.in"
  },

  // --- COGNIZANT LAB ---
  {
    id: "cog-lab",
    code: "Cognizant Lab",
    name: "Cognizant High-Tech Innovation Lab",
    type: "lab",
    typeLabel: "Computer Lab",
    dept: "Cognizant Lab",
    deptCode: "cognizant_lab",
    capacity: 70,
    floor: "Ground Floor, Innovation Center",
    amenities: ["70 Workstations", "Gigabit LAN", "Central AC", "Dual Projectors", "Video Conferencing"],
    incharge: "Lab Director & Industry Coordinator",
    inchargeEmail: "cognizant.lab@college.ac.in"
  },

  // --- CSE (NEW) ---
  {
    id: "nc-27",
    code: "NC 27",
    name: "New Classroom 27",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Computer Science and Engineering (new)",
    deptCode: "cse_new",
    capacity: 75,
    floor: "2nd Floor, New CSE Wing",
    amenities: ["Projector", "Air Conditioned", "Smart Board", "Mic & Audio", "Wi-Fi"],
    incharge: "HOD Computer Science (New)",
    inchargeEmail: "hod.csenew@college.ac.in"
  },
  {
    id: "nc-28",
    code: "NC 28",
    name: "New Classroom 28",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Computer Science and Engineering (new)",
    deptCode: "cse_new",
    capacity: 75,
    floor: "2nd Floor, New CSE Wing",
    amenities: ["Projector", "Whiteboard", "High-speed Wi-Fi"],
    incharge: "HOD Computer Science (New)",
    inchargeEmail: "hod.csenew@college.ac.in"
  },
  {
    id: "cse-new-seminar",
    code: "CSE Seminar Hall",
    name: "CSE Dept Seminar Hall",
    type: "seminar",
    typeLabel: "Seminar Hall",
    dept: "Department of Computer Science and Engineering (new)",
    deptCode: "cse_new",
    capacity: 150,
    floor: "3rd Floor, New CSE Wing",
    amenities: ["Dual Projectors", "Surround Sound", "Central AC", "Stage", "Wi-Fi"],
    incharge: "HOD Computer Science (New)",
    inchargeEmail: "hod.csenew@college.ac.in"
  },

  // --- CSE (OLD) ---
  {
    id: "old-cse-12",
    code: "Old CSE 12",
    name: "Old CSE Lecture Room 12",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Computer Science and Engineering (old)",
    deptCode: "cse_old",
    capacity: 60,
    floor: "1st Floor, Heritage Block",
    amenities: ["Projector", "Wi-Fi", "Whiteboard"],
    incharge: "HOD Computer Science (Old)",
    inchargeEmail: "hod.cseold@college.ac.in"
  },
  {
    id: "old-cse-lab",
    code: "Algo Research Lab",
    name: "Algorithms & Network Lab",
    type: "lab",
    typeLabel: "Computer Lab",
    dept: "Department of Computer Science and Engineering (old)",
    deptCode: "cse_old",
    capacity: 45,
    floor: "Ground Floor, Heritage Block",
    amenities: ["45 Linux Terminals", "Air Conditioned", "UPS Backup", "LAN"],
    incharge: "HOD Computer Science (Old)",
    inchargeEmail: "hod.cseold@college.ac.in"
  },

  // --- ELECTRICAL ENGINEERING ---
  {
    id: "ee-101",
    code: "EE 101",
    name: "Electrical Lecture Hall 101",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Electrical Engineering",
    deptCode: "electrical",
    capacity: 65,
    floor: "Ground Floor, Electrical Wing",
    amenities: ["Projector", "Speaker System", "Whiteboard", "Wi-Fi"],
    incharge: "HOD Electrical Engineering",
    inchargeEmail: "hod.electrical@college.ac.in"
  },
  {
    id: "ee-102",
    code: "EE 102",
    name: "Electrical Lecture Hall 102",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Electrical Engineering",
    deptCode: "electrical",
    capacity: 65,
    floor: "Ground Floor, Electrical Wing",
    amenities: ["Smart Interactive Board", "Air Conditioned", "Wi-Fi"],
    incharge: "HOD Electrical Engineering",
    inchargeEmail: "hod.electrical@college.ac.in"
  },

  // --- ELECTRONICS & TELECOMMUNICATION ---
  {
    id: "entc-201",
    code: "E&TC 201",
    name: "E&TC Smart Classroom 201",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Electronics & Telecommunication Engineering",
    deptCode: "entc",
    capacity: 70,
    floor: "2nd Floor, Telecomm Building",
    amenities: ["Smart Board", "Air Conditioned", "Audio System", "Wi-Fi"],
    incharge: "HOD E&TC Engineering",
    inchargeEmail: "hod.entc@college.ac.in"
  },
  {
    id: "entc-seminar",
    code: "E&TC Seminar Hall",
    name: "E&TC Colloquium Center",
    type: "seminar",
    typeLabel: "Seminar Hall",
    dept: "Department of Electronics & Telecommunication Engineering",
    deptCode: "entc",
    capacity: 110,
    floor: "3rd Floor, Telecomm Building",
    amenities: ["Projector", "Wireless Mic", "Air Conditioned", "Surround Sound"],
    incharge: "HOD E&TC Engineering",
    inchargeEmail: "hod.entc@college.ac.in"
  },

  // --- CIVIL ENGINEERING ---
  {
    id: "civil-hall-05",
    code: "Civil Hall 05",
    name: "Civil Engineering Hall 05",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Civil Engineering",
    deptCode: "civil",
    capacity: 70,
    floor: "1st Floor, Civil Block",
    amenities: ["Overhead Projector", "Large Drafting Desks", "Whiteboard"],
    incharge: "HOD Civil Engineering",
    inchargeEmail: "hod.civil@college.ac.in"
  },
  {
    id: "civil-drawing",
    code: "Civil Drawing Studio",
    name: "Civil Architecture & CAD Studio",
    type: "lab",
    typeLabel: "Studio Lab",
    dept: "Department of Civil Engineering",
    deptCode: "civil",
    capacity: 80,
    floor: "2nd Floor, Civil Block",
    amenities: ["AutoCAD Stations", "Drafting Tables", "Projector", "Wi-Fi"],
    incharge: "HOD Civil Engineering",
    inchargeEmail: "hod.civil@college.ac.in"
  },

  // --- MECHANICAL ENGINEERING ---
  {
    id: "me-201",
    code: "ME 201",
    name: "Mechanical Lecture Hall 201",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Mechanical Engineering",
    deptCode: "mechanical",
    capacity: 75,
    floor: "2nd Floor, Workshop Complex",
    amenities: ["Projector", "Step Seating", "Audio Setup", "Wi-Fi"],
    incharge: "HOD Mechanical Engineering",
    inchargeEmail: "hod.mech@college.ac.in"
  },
  {
    id: "me-seminar",
    code: "Mech Seminar Hall",
    name: "Mechanical Colloquium Hall",
    type: "seminar",
    typeLabel: "Seminar Hall",
    dept: "Department of Mechanical Engineering",
    deptCode: "mechanical",
    capacity: 120,
    floor: "3rd Floor, Workshop Complex",
    amenities: ["Air Conditioned", "Podium", "Projector & Surround Sound"],
    incharge: "HOD Mechanical Engineering",
    inchargeEmail: "hod.mech@college.ac.in"
  },

  // --- MANUFACTURING & INDUSTRIAL MANAGEMENT ---
  {
    id: "mfg-10",
    code: "Mfg Hall 10",
    name: "Manufacturing Engineering Hall 10",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Manufacturing Engineering & Industrial Management",
    deptCode: "manufacturing",
    capacity: 60,
    floor: "1st Floor, Industrial Wing",
    amenities: ["Smart Projector", "Whiteboard", "Wi-Fi"],
    incharge: "HOD Manufacturing Engineering",
    inchargeEmail: "hod.mfg@college.ac.in"
  },
  {
    id: "mfg-cim-lab",
    code: "CIM Lab",
    name: "Computer Integrated Manufacturing Lab",
    type: "lab",
    typeLabel: "Lab",
    dept: "Department of Manufacturing Engineering & Industrial Management",
    deptCode: "manufacturing",
    capacity: 45,
    floor: "Ground Floor, Industrial Wing",
    amenities: ["CNC Simulators", "Air Conditioned", "CIM Stations"],
    incharge: "HOD Manufacturing Engineering",
    inchargeEmail: "hod.mfg@college.ac.in"
  },

  // --- METALLURGY AND MATERIAL ENGINEERING ---
  {
    id: "meta-01",
    code: "Meta Hall 01",
    name: "Metallurgy Lecture Hall 01",
    type: "classroom",
    typeLabel: "Classroom",
    dept: "Department of Metallurgy and Material Engineering",
    deptCode: "metallurgy",
    capacity: 65,
    floor: "Ground Floor, Metallurgy Wing",
    amenities: ["Projector", "Air Conditioned", "Audio System", "Wi-Fi"],
    incharge: "HOD Metallurgy & Materials",
    inchargeEmail: "hod.meta@college.ac.in"
  },

  // --- DEPARTMENT OF PLANNING ---
  {
    id: "plan-studio",
    code: "Planning Studio 01",
    name: "Urban & Regional Planning Studio",
    type: "classroom",
    typeLabel: "Studio",
    dept: "Department of Planning",
    deptCode: "planning",
    capacity: 50,
    floor: "2nd Floor, Planning Block",
    amenities: ["GIS Workstations", "Smart Screen", "Plotters", "Air Conditioned"],
    incharge: "HOD Department of Planning",
    inchargeEmail: "hod.planning@college.ac.in"
  },

  // --- AUDITORIUMS ---
  {
    id: "main-audi",
    code: "Main Auditorium",
    name: "Campus Grand Main Auditorium",
    type: "audi",
    typeLabel: "Auditorium",
    dept: "Main Auditorium",
    deptCode: "main_audi",
    capacity: 900,
    floor: "Central Campus Plaza",
    amenities: ["Grand Stage", "Green Rooms", "Central AC", "Concert Grade Audio", "Theatrical Lighting"],
    incharge: "Auditorium General Incharge",
    inchargeEmail: "audi.incharge@college.ac.in"
  },
  {
    id: "mini-audi",
    code: "Mini Auditorium",
    name: "College Mini Auditorium",
    type: "audi",
    typeLabel: "Auditorium",
    dept: "Mini Auditorium",
    deptCode: "mini_audi",
    capacity: 250,
    floor: "1st Floor, Cultural Complex",
    amenities: ["Acoustic Panels", "Stage", "Central AC", "Projector & Sound"],
    incharge: "Auditorium General Incharge",
    inchargeEmail: "audi.incharge@college.ac.in"
  }
];

// Initial pre-booked schedule
// NC 28 has morning & mid-day slots booked today (08:00 AM - 02:00 PM)
const INITIAL_BOOKINGS = [
  {
    id: "BK-1001",
    venueId: "nc-28",
    venueCode: "NC 28",
    venueName: "New Classroom 28",
    dept: "Department of Computer Science and Engineering (new)",
    date: getTodayDateString(),
    timeSlot: "08:00 AM - 11:00 AM",
    slotLabel: "Morning",
    purpose: "Special Lecture on Data Structures",
    bookedBy: "Faculty Dr. Rao",
    applicantEmail: "k.rao@college.ac.in",
    status: "Confirmed",
    timestamp: new Date().toISOString()
  },
  {
    id: "BK-1002",
    venueId: "nc-28",
    venueCode: "NC 28",
    venueName: "New Classroom 28",
    dept: "Department of Computer Science and Engineering (new)",
    date: getTodayDateString(),
    timeSlot: "11:00 AM - 02:00 PM",
    slotLabel: "Mid-Day",
    purpose: "Advanced Algorithms Lab Evaluation",
    bookedBy: "Prof. K. Sen",
    applicantEmail: "k.sen@college.ac.in",
    applicantRole: "faculty",
    status: "Confirmed",
    timestamp: new Date().toISOString()
  },
  {
    id: "BK-1003",
    venueId: "sh-1",
    venueCode: "Seminar Hall 1",
    venueName: "Seminar Hall 1",
    dept: "Department of Computer Science and Engineering (new)",
    date: getTodayDateString(),
    timeSlot: "02:00 PM - 05:00 PM",
    slotLabel: "Afternoon",
    purpose: "Annual Coding Hackathon Technical Briefing",
    bookedBy: "Aman Sharma",
    applicantEmail: "aman.student@college.ac.in",
    applicantRole: "student",
    status: "Pending Approval",
    timestamp: new Date().toISOString()
  },
  {
    id: "BK-1004",
    venueId: "nc-27",
    venueCode: "NC 27",
    venueName: "New Classroom 27",
    dept: "Department of Computer Science and Engineering (new)",
    date: getTodayDateString(),
    timeSlot: "05:00 PM - 08:00 PM",
    slotLabel: "Evening",
    purpose: "Robotics Club Project Exhibition",
    bookedBy: "Purva Patel",
    applicantEmail: "purva.patel@college.ac.in",
    applicantRole: "student",
    status: "Pending Approval",
    timestamp: new Date().toISOString()
  },
  {
    id: "BK-1005",
    venueId: "nc-27",
    venueCode: "NC 27",
    venueName: "New Classroom 27",
    dept: "Department of Computer Science and Engineering (new)",
    date: getTodayDateString(),
    timeSlot: "08:00 AM - 11:00 AM",
    slotLabel: "Morning",
    purpose: "IoT Lab Practical Demo",
    bookedBy: "Dr. Sunita Sen",
    applicantEmail: "sunita.faculty@college.ac.in",
    applicantRole: "faculty",
    status: "Pending Approval",
    timestamp: new Date().toISOString()
  }
];

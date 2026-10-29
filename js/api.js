/**
 * ============================================================================
 * BookIt - API & Authentication Service (api.js)
 * ============================================================================
 * Features:
 * - College email domain validation: strictly enforces .ac.in emails!
 * - Two-step registration with OTP Verification!
 * - Slot-Level Availability Check (Morning, Mid-Day, Afternoon, Evening)
 * - Department Directory API (All 13 departments info & classroom details)
 * - Conflict / Clash detection on specific time slots
 * - LocalStorage persistence with simulated async latency
 */

const ApiConfig = {
  USE_MOCK: true,
  BASE_URL: window.location.origin + "/api",
  MOCK_DELAY_MS: 200,
  STORAGE_KEYS: {
    USERS: "bookit_users_db_v4",
    CURRENT_USER: "bookit_current_user_v4",
    AUTH_TOKEN: "bookit_auth_token_v4",
    VENUES: "bookit_venues_db_v4",
    BOOKINGS: "bookit_bookings_db_v4",
    PENDING_USER: "bookit_pending_user_v4",
    OTP_STORE: "bookit_otp_store_v4"
  }
};

// Initialize Mock Databases in LocalStorage
function initializeDatabase() {
  // Always ensure venues database has the latest college departments with benches & derived capacity
  const venuesWithBenches = INITIAL_VENUES.map((v) => {
    const benches = v.benches || (v.capacity ? Math.round(v.capacity / 2) : 30);
    const cap = benches * 2;
    return {
      ...v,
      benches: benches,
      capacity: cap,
      capacityFormula: "total = (2 * benches)",
      capacityDisplay: `total = (2 * ${benches}) = ${cap} Seats`
    };
  });
  localStorage.setItem(ApiConfig.STORAGE_KEYS.VENUES, JSON.stringify(venuesWithBenches));

  // Bookings Database - seed sample bookings if empty or missing pending samples
  const storedBookings = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");
  if (!storedBookings || storedBookings.length === 0) {
    localStorage.setItem(ApiConfig.STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  } else {
    let updated = false;
    INITIAL_BOOKINGS.forEach((ib) => {
      if (!storedBookings.some((sb) => sb.id === ib.id)) {
        storedBookings.push(ib);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(ApiConfig.STORAGE_KEYS.BOOKINGS, JSON.stringify(storedBookings));
    }
  }

  // Sole designated Super Administrators who can approve requisitions and authorize new admin accounts
  const defaultAuthorizedAdmins = [
    {
      id: "usr-admin-1",
      name: "Purva V",
      email: "PurvaV@college.ac.in",
      role: "admin",
      status: "approved",
      dept: "Department of Computer Science and Engineering (new)",
      password: "Purva@123",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-admin-2",
      name: "Mrudula N",
      email: "MrudulaN@college.ac.in",
      role: "admin",
      status: "approved",
      dept: "Department of Information Technology",
      password: "Mrudula@123",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-admin-3",
      name: "Bhargav V",
      email: "BhargavV@college.ac.in",
      role: "admin",
      status: "approved",
      dept: "Department of Electronics and Telecommunication Engineering",
      password: "Bhargav@123",
      createdAt: new Date().toISOString()
    }
  ];

  const storedUsers = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.USERS) || "[]");
  if (!storedUsers || storedUsers.length === 0) {
    localStorage.setItem(ApiConfig.STORAGE_KEYS.USERS, JSON.stringify(defaultAuthorizedAdmins));
  } else {
    let usersUpdated = false;
    defaultAuthorizedAdmins.forEach((du) => {
      if (!storedUsers.some((su) => su.email.toLowerCase() === du.email.toLowerCase())) {
        storedUsers.push(du);
        usersUpdated = true;
      }
    });
    if (usersUpdated) {
      localStorage.setItem(ApiConfig.STORAGE_KEYS.USERS, JSON.stringify(storedUsers));
    }
  }
}

// Run DB setup
initializeDatabase();

// Network latency delay utility
const delay = (ms = ApiConfig.MOCK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// College email validation (.ac.in strictly required)
function isCollegeEmail(email) {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.ac\.in$/i;
  return regex.test(email.trim());
}

// Centralized API Service Object
const ApiService = {
  // ========================================================================
  // Authentication & OTP Verification Flow
  // ========================================================================

  async registerInitiate(userData) {
    await delay();

    const normalizedEmail = userData.email.trim().toLowerCase();

    if (!isCollegeEmail(normalizedEmail)) {
      throw new Error("Invalid email domain. Please enter an official college email ending with .ac.in (e.g. name@college.ac.in)");
    }

    const users = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.USERS) || "[]");

    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error("An account with this college email already exists. Please sign in.");
    }

    // 4-digit OTP
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));

    const isAdmin = userData.role === "admin";
    const pendingData = {
      id: "usr-" + Date.now(),
      name: userData.name.trim(),
      email: normalizedEmail,
      role: userData.role,
      status: isAdmin ? "pending_approval" : "approved",
      dept: userData.dept,
      password: userData.password,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(ApiConfig.STORAGE_KEYS.PENDING_USER, JSON.stringify(pendingData));
    localStorage.setItem(
      ApiConfig.STORAGE_KEYS.OTP_STORE,
      JSON.stringify({ email: normalizedEmail, otp: generatedOtp, expiresAt: Date.now() + 10 * 60 * 1000 })
    );

    return {
      success: true,
      requiresOtp: true,
      email: normalizedEmail,
      otp: generatedOtp,
      message: `Verification code sent to ${normalizedEmail}`
    };
  },

  async verifyRegistrationOtp(email, enteredOtp) {
    await delay();

    const normalizedEmail = email.trim().toLowerCase();
    const storedOtpDataStr = localStorage.getItem(ApiConfig.STORAGE_KEYS.OTP_STORE);
    const pendingDataStr = localStorage.getItem(ApiConfig.STORAGE_KEYS.PENDING_USER);

    if (!storedOtpDataStr || !pendingDataStr) {
      throw new Error("Registration session expired. Please submit the registration form again.");
    }

    const storedOtpData = JSON.parse(storedOtpDataStr);
    const pendingUser = JSON.parse(pendingDataStr);

    if (storedOtpData.email !== normalizedEmail) {
      throw new Error("Email mismatch. Please restart registration.");
    }

    if (Date.now() > storedOtpData.expiresAt) {
      throw new Error("OTP has expired. Please request a new code.");
    }

    if (storedOtpData.otp !== enteredOtp.trim()) {
      throw new Error("Incorrect verification code. Please check and try again.");
    }

    const users = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.USERS) || "[]");
    users.push(pendingUser);
    localStorage.setItem(ApiConfig.STORAGE_KEYS.USERS, JSON.stringify(users));

    // Also notify backend if active
    try {
      fetch(`${ApiConfig.BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pendingUser.name,
          email: pendingUser.email,
          role: pendingUser.role,
          department: pendingUser.dept,
          password: pendingUser.password
        })
      }).catch(() => {});
    } catch (e) {}

    const isAdminPending = pendingUser.role === "admin" && pendingUser.status === "pending_approval";

    localStorage.removeItem(ApiConfig.STORAGE_KEYS.PENDING_USER);
    localStorage.removeItem(ApiConfig.STORAGE_KEYS.OTP_STORE);

    if (isAdminPending) {
      return {
        success: true,
        requiresApproval: true,
        user: pendingUser,
        message: "Admin registration request sent! An authorization request has been dispatched to Purva (PurvaV@college.ac.in), Mrudula (MrudulaN@college.ac.in), and Bhargav (BhargavV@college.ac.in). Your account will be activated once approved by any of them."
      };
    }

    const token = "mock_jwt_token_" + Date.now();
    localStorage.setItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(ApiConfig.STORAGE_KEYS.CURRENT_USER, JSON.stringify(pendingUser));

    return {
      success: true,
      user: pendingUser,
      token: token,
      message: "Account verified and created successfully!"
    };
  },

  async resendOtp(email) {
    await delay(150);
    const normalizedEmail = email.trim().toLowerCase();
    const newOtp = String(Math.floor(1000 + Math.random() * 9000));

    localStorage.setItem(
      ApiConfig.STORAGE_KEYS.OTP_STORE,
      JSON.stringify({ email: normalizedEmail, otp: newOtp, expiresAt: Date.now() + 10 * 60 * 1000 })
    );

    return {
      success: true,
      otp: newOtp,
      message: `A new code has been sent to ${normalizedEmail}`
    };
  },

  async login(email, password) {
    await delay();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isCollegeEmail(normalizedEmail)) {
      throw new Error("Please enter your official college email ending with .ac.in");
    }

    const users = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.USERS) || "[]");

    const user = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials. Please verify your email and password.");
    }

    if (user.role === "admin" && user.status === "pending_approval") {
      throw new Error("Your Admin account is pending approval from the designated administrators: Purva (PurvaV@college.ac.in), Mrudula (MrudulaN@college.ac.in), or Bhargav (BhargavV@college.ac.in). Please wait for approval before logging in.");
    }

    const token = "mock_jwt_token_" + Date.now();
    localStorage.setItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(ApiConfig.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return {
      success: true,
      user: user,
      token: token,
      message: "Logged in successfully!"
    };
  },

  logout() {
    localStorage.removeItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(ApiConfig.STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(ApiConfig.STORAGE_KEYS.CURRENT_USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    const token = localStorage.getItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN);
    const user = this.getCurrentUser();
    return Boolean(token && user);
  },

  // ========================================================================
  // Department Information & Directory
  // ========================================================================

  getAllDepartments() {
    return DEPARTMENTS_DATA;
  },

  getDepartmentByCode(deptCode) {
    return DEPARTMENTS_DATA.find((d) => d.code === deptCode) || null;
  },

  getVenuesByDepartment(deptCode) {
    const venues = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.VENUES) || "[]");
    return venues.filter((v) => v.deptCode === deptCode);
  },

  // ========================================================================
  // Venue Search & Slot-Level Availability
  // ========================================================================

  async searchVenues(filters) {
    await delay(120);

    const venues = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.VENUES) || "[]");
    const bookings = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");

    const targetDate = filters.date || getTodayDateString();

    // Active bookings on this date (exclude Cancelled and Rejected)
    const activeBookings = bookings.filter((b) => b.date === targetDate && b.status !== "Cancelled" && b.status !== "Rejected");

    // Filter venues
    let results = venues.filter((v) => {
      // Department filter
      if (filters.dept && filters.dept !== "all" && filters.dept !== "") {
        if (v.deptCode !== filters.dept) return false;
      }

      // Category filter
      if (filters.category && filters.category !== "all" && filters.category !== "") {
        if (v.type !== filters.category) return false;
      }

      // Minimum capacity
      if (filters.minCapacity && Number(filters.minCapacity) > 0) {
        if (v.capacity < Number(filters.minCapacity)) return false;
      }

      // Amenity filter (optional)
      if (filters.amenity && filters.amenity.length > 0) {
        const hasAllAmenities = filters.amenity.every((amenity) =>
          v.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Compute availability for each slot for every venue
    results = results.map((v) => {
      const roomBookings = activeBookings.filter((b) => b.venueId === v.id);

      const slots = STANDARD_SLOTS.map((stdSlot) => {
        // Check if any booking covers this slot
        const matchingBooking = roomBookings.find((b) => {
          if (!b.timeSlot) return true; // Full day assumed
          if (b.timeSlot.includes("Full Day")) return true;
          if (b.timeSlot.includes(stdSlot.time) || b.timeSlot === stdSlot.time) return true;
          if (b.slotLabel && b.slotLabel.toLowerCase().includes(stdSlot.shortLabel.toLowerCase())) return true;
          // NC 28 special test booking (08:00 AM - 01:00 PM covers slot 1 and 2)
          if (b.timeSlot === "09:00 AM - 01:00 PM") {
            return stdSlot.id === "slot-1" || stdSlot.id === "slot-2";
          }
          return false;
        });

        const isSlotAvailable = !matchingBooking;

        return {
          id: stdSlot.id,
          code: stdSlot.code,
          time: stdSlot.time,
          label: stdSlot.label,
          shortLabel: stdSlot.shortLabel,
          timing: stdSlot.timing,
          isAvailable: isSlotAvailable,
          statusLabel: isSlotAvailable ? "AVAILABLE" : "BOOKED",
          bookedBy: matchingBooking ? matchingBooking.bookedBy : null,
          bookingId: matchingBooking ? matchingBooking.id : null
        };
      });

      // Overall room availability (true if at least one slot is free)
      const isOverallAvailable = slots.some((s) => s.isAvailable);

      return {
        ...v,
        slots: slots,
        isAvailable: isOverallAvailable,
        statusLabel: isOverallAvailable ? "AVAILABLE" : "BOOKED",
        selectedDate: targetDate
      };
    });

    // If user filtered by a specific time slot ID
    if (filters.slotId && filters.slotId !== "all") {
      results = results.filter((v) => {
        const targetSlot = v.slots.find((s) => s.id === filters.slotId);
        return targetSlot && targetSlot.isAvailable;
      });
    }

    return results;
  },

  async getVenueById(venueId) {
    await delay(60);
    const venues = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.VENUES) || "[]");
    const found = venues.find((v) => v.id === venueId);
    if (!found) throw new Error("Venue not found");
    return found;
  },

  // ========================================================================
  // Booking Management
  // ========================================================================

  async createBooking(bookingPayload) {
    await delay(250);

    const bookings = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");

    // Clash detection on exact venueId + date + slot
    const targetSlot = bookingPayload.timeSlot || "08:00 AM - 11:00 AM";

    const clash = bookings.some((b) => {
      if (b.venueId !== bookingPayload.venueId) return false;
      if (b.date !== bookingPayload.date) return false;
      if (b.status === "Cancelled" || b.status === "Rejected") return false;

      // Check slot collision
      if (b.timeSlot.includes("Full Day") || targetSlot.includes("Full Day")) return true;
      if (b.timeSlot === targetSlot) return true;
      return false;
    });

    if (clash) {
      throw new Error(`Clash Detected! ${bookingPayload.venueCode} is already booked on ${bookingPayload.date} for slot (${targetSlot}). Please pick a different slot or venue.`);
    }

    const newBooking = {
      id: "BK-" + Math.floor(1000 + Math.random() * 9000),
      venueId: bookingPayload.venueId,
      venueCode: bookingPayload.venueCode,
      venueName: bookingPayload.venueName,
      dept: bookingPayload.dept,
      date: bookingPayload.date,
      timeSlot: targetSlot,
      slotLabel: bookingPayload.slotLabel || "Selected Slot",
      purpose: bookingPayload.purpose || "Academic / College Event",
      bookedBy: bookingPayload.bookedBy,
      applicantEmail: bookingPayload.applicantEmail,
      applicantRole: bookingPayload.applicantRole || "student",
      inchargeEmail: bookingPayload.inchargeEmail,
      status: "Pending Approval",
      decisionBy: null,
      decisionDate: null,
      timestamp: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    localStorage.setItem(ApiConfig.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Also forward booking request to backend API if live server is running
    try {
      const authToken = localStorage.getItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN);
      fetch(`${ApiConfig.BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(bookingPayload)
      }).catch(() => {});
    } catch (e) {}

    return newBooking;
  },

  async getAllBookings() {
    await delay(60);
    return JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");
  },

  async getUserBookings(userEmail) {
    await delay(100);
    const bookings = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");
    if (!userEmail) return bookings;

    return bookings.filter(
      (b) => b.applicantEmail && b.applicantEmail.toLowerCase() === userEmail.toLowerCase()
    );
  },

  async approveBooking(bookingId, adminName = "Department Admin", reason = "", adminEmail = "", emailSubject = "", emailBody = "") {
    await delay(120);
    const bookings = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error("Booking record not found");

    bookings[index].status = "Confirmed";
    bookings[index].decisionBy = adminName;
    bookings[index].decisionEmail = adminEmail;
    bookings[index].decisionReason = reason;
    bookings[index].decisionDate = new Date().toISOString();
    bookings[index].emailNotification = {
      type: "confirmation",
      from: adminEmail,
      to: bookings[index].applicantEmail,
      subject: emailSubject,
      body: emailBody,
      sentAt: new Date().toISOString()
    };
    localStorage.setItem(ApiConfig.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[index];
  },

  async rejectBooking(bookingId, adminName = "Department Admin", reason = "", adminEmail = "", emailSubject = "", emailBody = "") {
    await delay(120);
    const bookings = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error("Booking record not found");

    bookings[index].status = "Rejected";
    bookings[index].decisionBy = adminName;
    bookings[index].decisionEmail = adminEmail;
    bookings[index].decisionReason = reason;
    bookings[index].decisionDate = new Date().toISOString();
    bookings[index].emailNotification = {
      type: "rejection",
      from: adminEmail,
      to: bookings[index].applicantEmail,
      subject: emailSubject,
      body: emailBody,
      sentAt: new Date().toISOString()
    };
    localStorage.setItem(ApiConfig.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[index];
  },

  async cancelBooking(bookingId) {
    await delay(100);
    const bookings = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.BOOKINGS) || "[]");
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error("Booking record not found");

    bookings[index].status = "Cancelled";
    localStorage.setItem(ApiConfig.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[index];
  },

  // ========================================================================
  // Administrator Access Approval Management
  // ========================================================================

  async getPendingAdminRequests() {
    await delay(60);
    // Attempt backend query if live
    try {
      const authToken = localStorage.getItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN);
      const res = await fetch(`${ApiConfig.BASE_URL}/admin/pending-admins`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.pending_admins && data.pending_admins.length > 0) {
          return data.pending_admins;
        }
      }
    } catch (e) {}

    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.USERS) || "[]");
    return users.filter((u) => u.role === "admin" && u.status === "pending_approval");
  },

  async approveAdminRequest(userId, approverEmail = "") {
    await delay(120);
    // Forward to backend API if live
    try {
      const authToken = localStorage.getItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN);
      await fetch(`${ApiConfig.BASE_URL}/admin/approve-admin/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
    } catch (e) {}

    const users = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.USERS) || "[]");
    const idx = users.findIndex(
      (u) => String(u.id) === String(userId) || u.email.toLowerCase() === String(userId).toLowerCase()
    );

    if (idx !== -1) {
      users[idx].status = "approved";
      users[idx].approvedBy = approverEmail;
      users[idx].approvedAt = new Date().toISOString();
      localStorage.setItem(ApiConfig.STORAGE_KEYS.USERS, JSON.stringify(users));
      return users[idx];
    }
    return { success: true };
  },

  async rejectAdminRequest(userId, approverEmail = "") {
    await delay(120);
    // Forward to backend API if live
    try {
      const authToken = localStorage.getItem(ApiConfig.STORAGE_KEYS.AUTH_TOKEN);
      await fetch(`${ApiConfig.BASE_URL}/admin/reject-admin/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
    } catch (e) {}

    const users = JSON.parse(localStorage.getItem(ApiConfig.STORAGE_KEYS.USERS) || "[]");
    const idx = users.findIndex(
      (u) => String(u.id) === String(userId) || u.email.toLowerCase() === String(userId).toLowerCase()
    );

    if (idx !== -1) {
      users[idx].status = "rejected";
      users[idx].rejectedBy = approverEmail;
      users[idx].rejectedAt = new Date().toISOString();
      localStorage.setItem(ApiConfig.STORAGE_KEYS.USERS, JSON.stringify(users));
      return users[idx];
    }
    return { success: true };
  }
};

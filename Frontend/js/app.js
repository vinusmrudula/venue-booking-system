/**
 * ============================================================================
 * BookIt - Application Controller (app.js)
 * ============================================================================
 * Features:
 * - Style Search Results view matching user reference (Image 2)
 * - 4 Time Slot Availability Boxes (Morning, Mid-Day, Afternoon, Evening)
 * - Information of Departments Directory (All 13 departments with classrooms & amenities)
 * - About Us & Contact Us interactive features
 * - Previous/Next day date navigation
 * - Pure Vanilla JavaScript with clear, human-readable architecture
 * ============================================================================
 */
console.log("SCRIPT STARTED");
console.log("SCRIPT STARTED");


// Application State Store
const AppState = {
  currentUser: null,
  selectedVenue: null,
  selectedSlot: null,
  currentFilters: {
    category: "all",
    dept: "",
    minCapacity: 0,
    date: "",
    slotId: "all",
    amenities: []
  },
  cachedVenues: [],
  pendingOtpEmail: "",
  otpTimerSeconds: 0,
  otpTimerInterval: null
};

// DOM References Cache
const DOM = {
  // Utility & Header
  utilDatetime:           document.getElementById("util-datetime"),
  brandHomeBtn:           document.getElementById("brand-home-btn"),
  mobileToggleBtn:        document.getElementById("mobile-toggle-btn"),
  navMenu:                document.getElementById("nav-menu"),
  navSearchBtn:           document.getElementById("nav-search-btn"),
  navDeptBtn:             document.getElementById("nav-dept-btn"),
  navAboutBtn:            document.getElementById("nav-about-btn"),
  navContactBtn:          document.getElementById("nav-contact-btn"),
  navPrevBookingsBtn:     document.getElementById("nav-prev-bookings-btn"),
  navUserBadge:           document.getElementById("nav-user-badge"),
  navUserName:            document.getElementById("nav-user-name"),
  userAvatarChar:         document.getElementById("user-avatar-char"),
  navLogoutBtn:           document.getElementById("nav-logout-btn"),
  btnOpenAuth:            document.getElementById("btn-open-auth"),

  // Hero Search Form
  heroSearchForm:         document.getElementById("hero-search-form"),
  filterDept:             document.getElementById("filter-dept"),
  filterDate:             document.getElementById("filter-date"),
  filterCategory:         document.getElementById("filter-category"),
  filterCapacity:         document.getElementById("filter-capacity"),
  searchDeptError:        document.getElementById("search-dept-error"),
  searchDateError:        document.getElementById("search-date-error"),
  btnSearchVenuesSubmit:  document.getElementById("btn-search-venues-submit"),

  // Results Section
  resultsSection:         document.getElementById("results-section"),
  barDeptName:            document.getElementById("bar-dept-name"),
  barDateVal:             document.getElementById("bar-date-val"),
  barTypeVal:             document.getElementById("bar-type-val"),
  barCapVal:              document.getElementById("bar-cap-val"),
  btnToggleModifySearch:  document.getElementById("btn-toggle-modify-search"),
  btnSidebarReset:        document.getElementById("btn-sidebar-reset"),
  resultsCountText:       document.getElementById("results-count-text"),
  resultsMetaSubtitle:    document.getElementById("results-meta-subtitle"),
  btnPrevDay:             document.getElementById("btn-prev-day"),
  btnNextDay:             document.getElementById("btn-next-day"),
  venuesListContainer:    document.getElementById("venues-list-container"),
  emptyState:             document.getElementById("empty-state"),
  btnClearSearch:         document.getElementById("btn-clear-search"),

  // Department Section
  sectionDepartments:     document.getElementById("section-departments"),
  btnToggleDepts:         document.getElementById("btn-toggle-depts"),
  btnToggleDeptsText:     document.getElementById("btn-toggle-depts-text"),
  deptSearchInput:        document.getElementById("dept-search-input"),
  deptFilteredCount:      document.getElementById("dept-filtered-count"),
  departmentsCardsGrid:   document.getElementById("departments-cards-grid"),

  // Department Detail Modal
  deptDetailsModal:       document.getElementById("dept-details-modal"),
  closeDeptModalBtn:      document.getElementById("close-dept-modal-btn"),
  btnCloseDeptModal:      document.getElementById("btn-close-dept-modal"),
  deptModalIcon:          document.getElementById("dept-modal-icon"),
  deptModalTitle:         document.getElementById("dept-modal-title"),
  deptModalTagline:       document.getElementById("dept-modal-tagline"),
  deptModalDesc:          document.getElementById("dept-modal-desc"),
  deptModalLocation:      document.getElementById("dept-modal-location"),
  deptModalIncharge:      document.getElementById("dept-modal-incharge"),
  deptModalEmail:         document.getElementById("dept-modal-email"),
  deptModalCapacity:      document.getElementById("dept-modal-capacity"),
  deptModalRoomsTbody:    document.getElementById("dept-modal-rooms-tbody"),

  // Contact Form
  contactInquiryForm:     document.getElementById("contact-inquiry-form"),
  contactName:            document.getElementById("contact-name"),
  contactEmail:           document.getElementById("contact-email"),
  contactDept:            document.getElementById("contact-dept"),
  contactMsg:             document.getElementById("contact-msg"),

  // Auth Modal
  authModal:              document.getElementById("auth-modal"),
  authModalClose:         document.getElementById("auth-modal-close"),
  tabSignin:              document.getElementById("tab-signin"),
  tabRegister:            document.getElementById("tab-register"),
  panelSignin:            document.getElementById("panel-signin"),
  panelRegister:          document.getElementById("panel-register"),

  // Sign In Form
  signinForm:             document.getElementById("signin-form"),
  signinEmail:            document.getElementById("signin-email"),
  signinPassword:         document.getElementById("signin-password"),
  signinBannerError:      document.getElementById("signin-banner-error"),
  signinBannerErrorText:  document.getElementById("signin-banner-error-text"),
  signinEmailError:       document.getElementById("signin-email-error"),
  signinPasswordError:    document.getElementById("signin-password-error"),
  signinSubmitBtn:        document.getElementById("signin-submit-btn"),
  gotoRegisterLink:       document.getElementById("goto-register-link"),
  forgotPasswordLink:     document.getElementById("forgot-password-link"),

  // Register Form
  registerForm:           document.getElementById("register-form"),
  regName:                document.getElementById("reg-name"),
  regEmail:               document.getElementById("reg-email"),
  regRole:                document.getElementById("reg-role"),
  regDept:                document.getElementById("reg-dept"),
  regPassword:            document.getElementById("reg-password"),
  registerBannerError:    document.getElementById("register-banner-error"),
  registerBannerErrorText:document.getElementById("register-banner-error-text"),
  regNameError:           document.getElementById("reg-name-error"),
  regEmailError:          document.getElementById("reg-email-error"),
  regRoleError:           document.getElementById("reg-role-error"),
  regDeptError:           document.getElementById("reg-dept-error"),
  regPasswordError:       document.getElementById("reg-password-error"),
  registerSubmitBtn:      document.getElementById("register-submit-btn"),
  gotoSigninLink:         document.getElementById("goto-signin-link"),

  // OTP Modal
  otpModal:               document.getElementById("otp-modal"),
  otpForm:                document.getElementById("otp-form"),
  otp1:                   document.getElementById("otp-1"),
  otp2:                   document.getElementById("otp-2"),
  otp3:                   document.getElementById("otp-3"),
  otp4:                   document.getElementById("otp-4"),
  otpDisplayEmail:        document.getElementById("otp-display-email"),
  otpBannerError:         document.getElementById("otp-banner-error"),
  otpBannerErrorText:     document.getElementById("otp-banner-error-text"),
  otpSubmitBtn:           document.getElementById("otp-submit-btn"),
  btnResendOtp:           document.getElementById("btn-resend-otp"),
  otpTimerText:           document.getElementById("otp-timer-text"),
  otpBackBtn:             document.getElementById("otp-back-btn"),

  // Venue Details Modal
  venueDetailsModal:      document.getElementById("venue-details-modal"),
  closeVenueModalBtn:     document.getElementById("close-venue-modal-btn"),
  btnCancelVenueDetail:   document.getElementById("btn-cancel-venue-detail"),
  modalVenueTitle:        document.getElementById("modal-venue-title"),
  specLocation:           document.getElementById("spec-location"),
  specRoomCode:           document.getElementById("spec-room-code"),
  specCapacity:           document.getElementById("spec-capacity"),
  specDate:               document.getElementById("spec-date"),
  specAmenitiesTags:      document.getElementById("spec-amenities-tags"),
  specInchargeName:       document.getElementById("spec-incharge-name"),
  btnStartEmailFlow:      document.getElementById("btn-start-email-flow"),

  // Email Composer Modal
  emailComposerModal:     document.getElementById("email-composer-modal"),
  closeEmailModalBtn:     document.getElementById("close-email-modal-btn"),
  btnBackFromEmail:       document.getElementById("btn-back-from-email"),
  mailTo:                 document.getElementById("mail-to"),
  mailSubject:            document.getElementById("mail-subject"),
  mailBody:               document.getElementById("mail-body"),
  btnSendEmailConfirm:    document.getElementById("btn-send-email-confirm"),
  btnOpenRealMailto:      document.getElementById("btn-open-real-mailto"),

  // Booking Success Modal
  bookingSuccessModal:    document.getElementById("booking-success-modal"),
  ticketId:               document.getElementById("ticket-id"),
  ticketVenue:            document.getElementById("ticket-venue"),
  ticketDept:             document.getElementById("ticket-dept"),
  ticketDate:             document.getElementById("ticket-date"),
  ticketSlot:             document.getElementById("ticket-slot"),
  btnSuccessViewBookings: document.getElementById("btn-success-view-bookings"),
  btnSuccessBookMore:     document.getElementById("btn-success-book-more"),

  // Previous Bookings Modal
  prevBookingsModal:      document.getElementById("prev-bookings-modal"),
  closeHistoryModalBtn:   document.getElementById("close-history-modal-btn"),
  btnCloseHistory:        document.getElementById("btn-close-history"),
  historyTableBody:       document.getElementById("history-table-body"),
  historyEmpty:           document.getElementById("history-empty"),

  // Toast Container
  toastContainer:         document.getElementById("toast-container")
};

// ============================================================================
// Notification Utility (Toasts)
// ============================================================================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "&#10003;" : "&#9888;"}</span>
    <span>${message}</span>
  `;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Live Clock for Top Utility Bar
function updateLiveClock() {
  if (!DOM.utilDatetime) return;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  DOM.utilDatetime.textContent = `${dateStr} [${timeStr}]`;
}

// ============================================================================
// College Email Validation (.ac.in strictly enforced)
// ============================================================================
function isValidCollegeEmail(email) {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.ac\.in$/i;
  return regex.test(email.trim());
}

function setFieldError(inputEl, errorEl, message = "") {
  inputEl.classList.add("is-invalid");
  if (message && errorEl) errorEl.textContent = message;
  if (errorEl) errorEl.classList.add("show");
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove("is-invalid");
  if (errorEl) errorEl.classList.remove("show");
}

function clearAuthErrors() {
  document.querySelectorAll(".field-input.is-invalid, .otp-digit.is-invalid").forEach((el) => {
    el.classList.remove("is-invalid");
  });
  document.querySelectorAll(".field-error.show").forEach((el) => {
    el.classList.remove("show");
  });
  [DOM.signinBannerError, DOM.registerBannerError, DOM.otpBannerError].forEach((el) => {
    if (el) el.classList.remove("show");
  });
}

// ============================================================================
// Top Navigation Bar Auth State
// ============================================================================
function updateNavAuthUI() {
  const user = ApiService.getCurrentUser();
  AppState.currentUser = user;

  if (user) {
    DOM.navPrevBookingsBtn.style.display = "inline-block";
    DOM.navUserBadge.style.display = "inline-flex";
    DOM.navUserName.textContent = user.name;
    DOM.userAvatarChar.textContent = user.name.charAt(0).toUpperCase();
    DOM.navLogoutBtn.style.display = "inline-block";
    DOM.btnOpenAuth.style.display = "none";
  } else {
    DOM.navPrevBookingsBtn.style.display = "none";
    DOM.navUserBadge.style.display = "none";
    DOM.navLogoutBtn.style.display = "none";
    DOM.btnOpenAuth.style.display = "inline-block";
  }
}

// ============================================================================
// Auth & OTP Modals Control
// ============================================================================
function openAuthModal(tab = "signin") {
  clearAuthErrors();
  DOM.authModal.classList.add("active");
  switchAuthTab(tab);
  if (tab === "signin") {
    setTimeout(() => DOM.signinEmail.focus(), 60);
  } else {
    setTimeout(() => DOM.regName.focus(), 60);
  }
}

function closeAuthModal() {
  DOM.authModal.classList.remove("active");
  clearAuthErrors();
}

function switchAuthTab(tab) {
  DOM.tabSignin.classList.toggle("active", tab === "signin");
  DOM.tabRegister.classList.toggle("active", tab === "register");
  DOM.panelSignin.classList.toggle("active", tab === "signin");
  DOM.panelRegister.classList.toggle("active", tab === "register");
}

function openOtpModal() {
  DOM.authModal.classList.remove("active");
  DOM.otpModal.classList.add("active");
  [DOM.otp1, DOM.otp2, DOM.otp3, DOM.otp4].forEach((inp) => {
    inp.value = "";
    inp.classList.remove("is-invalid");
  });
  DOM.otpBannerError.classList.remove("show");
  startOtpCountdown(30);
  setTimeout(() => DOM.otp1.focus(), 60);
}

function closeOtpModal() {
  DOM.otpModal.classList.remove("active");
}

function startOtpCountdown(seconds = 30) {
  if (AppState.otpTimerInterval) clearInterval(AppState.otpTimerInterval);
  AppState.otpTimerSeconds = seconds;

  DOM.btnResendOtp.disabled = true;
  DOM.btnResendOtp.style.opacity = "0.45";
  DOM.otpTimerText.textContent = `(Resend in ${seconds}s)`;

  AppState.otpTimerInterval = setInterval(() => {
    AppState.otpTimerSeconds--;
    if (AppState.otpTimerSeconds <= 0) {
      clearInterval(AppState.otpTimerInterval);
      DOM.btnResendOtp.disabled = false;
      DOM.btnResendOtp.style.opacity = "1";
      DOM.otpTimerText.textContent = "";
    } else {
      DOM.otpTimerText.textContent = `(Resend in ${AppState.otpTimerSeconds}s)`;
    }
  }, 1000);
}

// Date Picker Init
function initDatePicker() {
  const today = getTodayDateString();
  DOM.filterDate.value = today;
  DOM.filterDate.min = today;
  AppState.currentFilters.date = today;
}

// ============================================================================
// SEARCH VENUES & RESULTS DISPLAY (Image 2 Match)
// ============================================================================

// Search form submission
DOM.heroSearchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate mandatory fields: Building / Dept & Date
  let isValid = true;

  if (!DOM.filterDept.value) {
    DOM.searchDeptError.classList.add("show");
    DOM.filterDept.classList.add("is-invalid");
    isValid = false;
  } else {
    DOM.searchDeptError.classList.remove("show");
    DOM.filterDept.classList.remove("is-invalid");
  }

  if (!DOM.filterDate.value) {
    DOM.searchDateError.classList.add("show");
    DOM.filterDate.classList.add("is-invalid");
    isValid = false;
  } else {
    DOM.searchDateError.classList.remove("show");
    DOM.filterDate.classList.remove("is-invalid");
  }

  if (!isValid) return;

  AppState.currentFilters.dept = DOM.filterDept.value;
  AppState.currentFilters.date = DOM.filterDate.value;
  AppState.currentFilters.category = DOM.filterCategory.value;
  AppState.currentFilters.minCapacity = Number(DOM.filterCapacity.value) || 0;
  AppState.currentFilters.slotId = "all";

  await executeSearch();

  // Smooth scroll to Results section
  DOM.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Execute Search and Update Results Area
async function executeSearch() {
  DOM.resultsSection.style.display = "block";

  // Update top modify bar
  const selectedDeptObj = ApiService.getDepartmentByCode(AppState.currentFilters.dept);
  const deptDisplayName = selectedDeptObj ? selectedDeptObj.name : "All Departments";
  DOM.barDeptName.textContent = deptDisplayName;
  DOM.barDateVal.textContent = AppState.currentFilters.date;
  DOM.barTypeVal.textContent = AppState.currentFilters.category === "all" ? "All Types" : AppState.currentFilters.category.toUpperCase();
  DOM.barCapVal.textContent = AppState.currentFilters.minCapacity > 0 ? `${AppState.currentFilters.minCapacity}+ Seats` : "Any";

  // Loading state
  DOM.venuesListContainer.innerHTML = `
    <div style="text-align:center; padding:3rem 1rem; background:#fff; border-radius:8px;">
      <div class="spinner spinner-teal" style="width:36px; height:36px; margin:0 auto;"></div>
      <p style="margin-top:0.85rem; color:var(--text-sec); font-size:0.95rem; font-weight:600;">
        Searching real-time slot availability for ${AppState.currentFilters.date}...
      </p>
    </div>
  `;
  DOM.emptyState.style.display = "none";
  DOM.resultsCountText.textContent = "Checking facilities...";

  try {
    const venues = await ApiService.searchVenues(AppState.currentFilters);
    AppState.cachedVenues = venues;
    renderResults(venues, deptDisplayName);
  } catch (err) {
    console.error("Search error:", err);
    DOM.venuesListContainer.innerHTML = `
      <div class="empty-state">
        <p style="color:#9b2c2c;">An error occurred while loading venues. Please try again.</p>
      </div>
    `;
  }
}

// Render Venue Cards in Train-Card Format (matching Image 2)
function renderResults(venues, deptName) {
  if (!venues || venues.length === 0) {
    DOM.venuesListContainer.innerHTML = "";
    DOM.emptyState.style.display = "block";
    DOM.resultsCountText.textContent = `0 Results for ${deptName} | ${AppState.currentFilters.date}`;
    DOM.resultsMetaSubtitle.textContent = "No facilities match your active filters.";
    return;
  }

  DOM.emptyState.style.display = "none";

  // Format date nicely (e.g. "Sat, 24 Oct 2026")
  const dateParts = AppState.currentFilters.date.split("-");
  const dateObj = new Date(dateParts[0], Number(dateParts[1]) - 1, dateParts[2]);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  DOM.resultsCountText.textContent = `${venues.length} Results for ${deptName} | ${formattedDate}`;
  DOM.resultsMetaSubtitle.textContent = "Click any available slot box to reserve or view timing status";

  let html = "";

  venues.forEach((venue) => {
    // Generate the 4 style slot boxes
    const slotsHTML = venue.slots
      .map((slot) => {
        const isAvail = slot.isAvailable;
        const statusClass = isAvail ? "available" : "booked";
        const statusText = isAvail ? "AVAILABLE" : "BOOKED";

        return `
          <div 
            class="slot-box" 
            data-venue-id="${venue.id}" 
            data-slot-id="${slot.id}" 
            data-slot-time="${slot.time}" 
            data-slot-label="${slot.label}"
            data-available="${isAvail}"
            title="${isAvail ? "Click to select this slot" : `Booked by ${slot.bookedBy || "Faculty"}`}"
          >
            <div class="slot-box-header">
              <span>${slot.shortLabel}</span>
              <span class="slot-refresh-icon">&#8635;</span>
            </div>
            <div class="slot-box-timing">${slot.timing}</div>
            <div class="slot-box-status ${statusClass}">
              <span>${statusText}</span>
              <span style="font-size:0.68rem;">${isAvail ? "&#10003;" : "&#10006;"}</span>
            </div>
          </div>
        `;
      })
      .join("");

    html += `
      <div class="card" data-venue-id="${venue.id}">
        <!-- Top bar: Room name, type, and runs on -->
        <div class="card-top-bar">
          <div class="room-identity">
            <span class="room-identity-name">${venue.code} &bull; ${venue.name}</span>
            <span class="room-identity-type">${venue.typeLabel}</span>
          </div>
          <div class="runs-on-wrapper">
            <span>Runs On:</span>
            <span class="runs-days">M T W T F S</span>
            <span style="margin-left:0.5rem; color:var(--text-muted);">&bull; ${venue.floor}</span>
          </div>
        </div>

        <!-- Middle: Time & Campus Operating Timeline -->
        <div class="timeline-row">
          <div class="timeline-point">
            <span class="timeline-time">08:00 AM</span>
            <span class="timeline-loc">${venue.code}</span>
          </div>

          <div class="timeline-divider">
            <span class="timeline-duration">Operating: 12 hrs</span>
            <div class="timeline-line"></div>
            <span style="font-size:0.72rem; color:var(--text-sec); margin-top:2px;">Capacity: ${venue.capacity} Students</span>
          </div>

          <div class="timeline-point" style="text-align:right;">
            <span class="timeline-time">08:00 PM</span>
            <span class="timeline-loc">${venue.dept.split("(")[0]}</span>
          </div>
        </div>

        <div class="incharge-row">
          Incharge: <strong>${venue.incharge}</strong> &bull; <span style="color:var(--teal-700);">${venue.inchargeEmail}</span>
        </div>

        <!-- Signature 4 Slot Boxes (Morning, Mid-Day, Afternoon, Evening) -->
        <div class="slots-row">
          ${slotsHTML}
        </div>

        <!-- NTES-style notice banner -->
        <div class="notice-bar">
          <span>ℹ️ Official permission requisition will be dispatched to <strong>${venue.inchargeEmail}</strong>. Multi-slot or weekend bookings require Dean approval.</span>
        </div>

        <!-- Action Row (Orange Book Now & Room Details) -->
        <div class="card-actions">
          <div class="selected-slot-preview" id="preview-slot-${venue.id}">
            Select an available time slot box above to proceed with booking.
          </div>

          <div class="action-buttons-group">
            <button class="btn-specs btn-view-specs" data-venue-id="${venue.id}">
              Room Specs
            </button>
            <button class="btn-book btn-book-slot" data-venue-id="${venue.id}" disabled>
              Book Now
            </button>
          </div>
        </div>
      </div>
    `;
  });

  DOM.venuesListContainer.innerHTML = html;

  // Attach Slot Selection Event Listeners
  document.querySelectorAll(".slot-box").forEach((box) => {
    box.addEventListener("click", () => {
      const isAvail = box.getAttribute("data-available") === "true";
      const venueId = box.getAttribute("data-venue-id");
      const slotTime = box.getAttribute("data-slot-time");
      const slotLabel = box.getAttribute("data-slot-label");

      if (!isAvail) {
        showToast("This slot is already reserved for the selected date.", "error");
        return;
      }

      // Remove selected highlight from other slot boxes in this card
      const parentCard = box.closest(".card");
      parentCard.querySelectorAll(".slot-box").forEach((b) => b.classList.remove("is-selected"));
      box.classList.add("is-selected");

      // Update state
      AppState.selectedSlot = { venueId, slotTime, slotLabel };

      // Update preview text and enable Book Now button
      const previewEl = document.getElementById(`preview-slot-${venueId}`);
      if (previewEl) {
        previewEl.innerHTML = `Selected Slot: <strong>${slotLabel}</strong>`;
      }

      const bookBtn = parentCard.querySelector(".btn-book-slot");
      if (bookBtn) {
        bookBtn.disabled = false;
      }
    });
  });

  // Attach "Book Now" Click Listeners
  document.querySelectorAll(".btn-book-slot").forEach((btn) => {
    btn.addEventListener("click", () => {
      const venueId = btn.getAttribute("data-venue-id");
      const venue = AppState.cachedVenues.find((v) => v.id === venueId);
      if (!venue) return;

      // Require user login
      if (!ApiService.isAuthenticated()) {
        showToast("Please sign in or create an account to reserve facilities.", "error");
        openAuthModal("signin");
        return;
      }

      AppState.selectedVenue = venue;
      openEmailComposerModal();
    });
  });

  // Attach "Room Specs" Click Listeners
  document.querySelectorAll(".btn-view-specs").forEach((btn) => {
    btn.addEventListener("click", () => {
      const venueId = btn.getAttribute("data-venue-id");
      openVenueDetailModal(venueId);
    });
  });
}

// Previous Day / Next Day navigation buttons
DOM.btnPrevDay.addEventListener("click", () => {
  shiftSearchDate(-1);
});
DOM.btnNextDay.addEventListener("click", () => {
  shiftSearchDate(1);
});

function shiftSearchDate(days) {
  const currentDate = DOM.filterDate.value || getTodayDateString();
  const parts = currentDate.split("-");
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setDate(d.getDate() + days);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const newDateStr = `${year}-${month}-${day}`;

  DOM.filterDate.value = newDateStr;
  AppState.currentFilters.date = newDateStr;
  executeSearch();
}

// Modify Search Button in bar
DOM.btnToggleModifySearch.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  DOM.filterDept.focus();
});

// Sidebar Refine Filters
document.querySelectorAll('input[name="refine-category"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    AppState.currentFilters.category = e.target.value;
    DOM.filterCategory.value = e.target.value;
    executeSearch();
  });
});

document.querySelectorAll(".slot-filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".slot-filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    AppState.currentFilters.slotId = btn.getAttribute("data-slot");
    executeSearch();
  });
});

document.querySelectorAll(".refine-amenity-cb").forEach((cb) => {
  cb.addEventListener("change", () => {
    const selectedAmenities = Array.from(document.querySelectorAll(".refine-amenity-cb:checked")).map((c) => c.value);
    AppState.currentFilters.amenities = selectedAmenities;
    executeSearch();
  });
});

DOM.btnSidebarReset.addEventListener("click", () => {
  document.querySelectorAll('input[name="refine-category"]')[0].checked = true;
  document.querySelectorAll(".slot-filter-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".slot-filter-btn")[0].classList.add("active");
  document.querySelectorAll(".refine-amenity-cb").forEach((cb) => (cb.checked = false));

  AppState.currentFilters.category = "all";
  AppState.currentFilters.slotId = "all";
  AppState.currentFilters.amenities = [];
  DOM.filterCategory.value = "all";
  executeSearch();
});

DOM.btnClearSearch.addEventListener("click", () => {
  DOM.btnSidebarReset.click();
});

// ============================================================================
// INFORMATION OF DEPTS DIRECTORY (All 13 Departments Grid & Modal)
// ============================================================================

function renderDepartmentsDirectory(filterQuery = "") {
  const allDepts = ApiService.getAllDepartments();
  const q = filterQuery.toLowerCase().trim();

  const filtered = allDepts.filter((dept) => {
    if (!q) return true;
    return (
      dept.name.toLowerCase().includes(q) ||
      dept.tagline.toLowerCase().includes(q) ||
      dept.description.toLowerCase().includes(q) ||
      dept.roomsList.some((r) => r.toLowerCase().includes(q))
    );
  });

  DOM.deptFilteredCount.textContent = `Showing ${filtered.length} of ${allDepts.length} Departments`;

  if (filtered.length === 0) {
    DOM.departmentsCardsGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; background:#fff; border-radius:12px;">
        <p style="color:var(--text-muted); font-size:1rem;">No departments or classrooms match "${filterQuery}".</p>
      </div>
    `;
    return;
  }

  DOM.departmentsCardsGrid.innerHTML = filtered
    .map((dept) => {
      const deptVenues = ApiService.getVenuesByDepartment(dept.code);

      return `
        <div class="dept-card" data-code="${dept.code}">
          <div class="dept-card-visual" style="background:${dept.bgGradient};">
            <div class="dept-visual-left">
              <div class="dept-visual-icon">${dept.icon}</div>
              <div class="dept-visual-info">
                <h3>${dept.name}</h3>
                <span>${dept.location}</span>
              </div>
            </div>
            <span class="dept-year-badge">Est. ${dept.establishedYear}</span>
          </div>

          <div class="dept-card-body">
            <p class="dept-tagline-text">${dept.tagline}</p>
            <p class="dept-desc-text">${dept.description}</p>

            <div class="dept-stats-row">
              <span class="dept-stat-pill">🏛️ ${deptVenues.length} Venues / Rooms</span>
              <span class="dept-stat-pill">👥 Capacity: ${dept.totalCapacity}</span>
              <span class="dept-stat-pill">👤 Incharge: ${dept.incharge}</span>
            </div>

            <div class="dept-rooms-summary">
              <div class="dept-rooms-summary-title">Classrooms &amp; Facilities Available:</div>
              <div class="dept-rooms-tags-list">
                ${dept.roomsList.map((r) => `<span class="dept-room-tag">${r}</span>`).join("")}
              </div>
            </div>
          </div>

          <div class="dept-card-footer">
            <button class="btn-open-dept-modal" data-code="${dept.code}">
              Explore Classrooms &rarr;
            </button>
            <a href="#hero-search-section" class="btn-quick-book-dept" data-code="${dept.code}">
              Quick Search &rarr;
            </a>
          </div>
        </div>
      `;
    })
    .join("");

  // Attach click handlers to "Explore Classrooms" buttons
  document.querySelectorAll(".btn-open-dept-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-code");
      openDepartmentDetailsModal(code);
    });
  });

  // Attach quick search buttons
  document.querySelectorAll(".btn-quick-book-dept").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const code = btn.getAttribute("data-code");
      DOM.filterDept.value = code;
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast(`Selected ${code}. Choose date & click Search Venues.`);
    });
  });
}

// Live Search Filter for Department Directory
DOM.deptSearchInput.addEventListener("input", (e) => {
  renderDepartmentsDirectory(e.target.value);
});

// Toggle button for Department Section
DOM.btnToggleDepts.addEventListener("click", () => {
  DOM.sectionDepartments.scrollIntoView({ behavior: "smooth" });
  DOM.deptSearchInput.focus();
});

// Open Department Details Modal
function openDepartmentDetailsModal(deptCode) {
  const dept = ApiService.getDepartmentByCode(deptCode);
  if (!dept) return;

  const venues = ApiService.getVenuesByDepartment(deptCode);

  DOM.deptModalBanner.style.background = dept.bgGradient;
  DOM.deptModalIcon.textContent = dept.icon;
  DOM.deptModalTitle.textContent = dept.name;
  DOM.deptModalTagline.textContent = dept.tagline;
  DOM.deptModalDesc.textContent = dept.description;
  DOM.deptModalLocation.textContent = dept.location;
  DOM.deptModalIncharge.textContent = dept.incharge;
  DOM.deptModalEmail.textContent = dept.inchargeEmail;
  DOM.deptModalCapacity.textContent = `${dept.totalCapacity} Total Seats across ${venues.length} Facilities`;

  DOM.deptModalRoomsTbody.innerHTML = venues
    .map((v) => {
      return `
        <tr>
          <td><strong>${v.code}</strong><br><span style="font-size:0.75rem; color:var(--text-sec);">${v.name}</span></td>
          <td><span class="room-identity-type">${v.typeLabel}</span></td>
          <td><strong>${v.capacity}</strong> Seats</td>
          <td>${v.amenities.map((a) => `<span class="tag-badge" style="margin:2px;">${a}</span>`).join("")}</td>
          <td>
            <button class="btn btn-sm btn-primary btn-modal-select-room" data-dept-code="${dept.code}" data-room-id="${v.id}">
              Book Now
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  DOM.deptDetailsModal.classList.add("active");

  // Room select in modal
  document.querySelectorAll(".btn-modal-select-room").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-dept-code");
      DOM.deptDetailsModal.classList.remove("active");
      DOM.filterDept.value = code;
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("Department selected. Pick your booking date and click Search Venues.");
    });
  });
}

function closeDepartmentDetailsModal() {
  DOM.deptDetailsModal.classList.remove("active");
}

// ============================================================================
// CONTACT US FORM HANDLER
// ============================================================================
DOM.contactInquiryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = DOM.contactName.value.trim();
  const email = DOM.contactEmail.value.trim();
  const dept = DOM.contactDept.value;
  const msg = DOM.contactMsg.value.trim();

  if (!name || !email || !msg) {
    showToast("Please fill out all required fields.", "error");
    return;
  }

  if (!isValidCollegeEmail(email)) {
    showToast("Please use an official college email ending with .ac.in", "error");
    return;
  }

  showToast(`Thank you, ${name}! Your inquiry has been dispatched to the Venue Administration.`, "success");
  DOM.contactInquiryForm.reset();
});

// ============================================================================
// VENUE DETAILS & REQUISITION MODALS
// ============================================================================
function openVenueDetailModal(venueId) {
  const venue = AppState.cachedVenues.find((v) => v.id === venueId);
  if (!venue) return;
  AppState.selectedVenue = venue;

  DOM.modalVenueTitle.textContent = `${venue.name} (${venue.code})`;
  DOM.specLocation.textContent = venue.dept;
  DOM.specRoomCode.textContent = venue.code;
  DOM.specCapacity.textContent = `${venue.capacity} Students`;
  DOM.specDate.textContent = AppState.currentFilters.date;

  DOM.specAmenitiesTags.innerHTML = venue.amenities
    .map((a) => `<span class="tag-badge" style="font-size:0.82rem; padding:0.3rem 0.6rem;">${a}</span>`)
    .join("");

  DOM.specInchargeName.innerHTML = `
    <strong>${venue.incharge}</strong><br>
    <span style="font-size:0.82rem; color:var(--teal-700);">${venue.inchargeEmail}</span>
  `;

  DOM.venueDetailsModal.classList.add("active");
}

function closeVenueDetailModal() {
  DOM.venueDetailsModal.classList.remove("active");
}

// Email Composer Modal
DOM.btnStartEmailFlow.addEventListener("click", () => {
  if (!ApiService.isAuthenticated()) {
    closeVenueDetailModal();
    openAuthModal("signin");
    showToast("Please sign in or create an account to book this venue.", "error");
    return;
  }
  closeVenueDetailModal();
  openEmailComposerModal();
});

function openEmailComposerModal() {
  const venue = AppState.selectedVenue;
  const user = AppState.currentUser || { name: "Student Organizer", email: "student@college.ac.in", role: "student", dept: "College" };
  const targetDate = AppState.currentFilters.date;
  const slotText = AppState.selectedSlot ? AppState.selectedSlot.slotLabel : "Full Day (08:00 AM - 08:00 PM)";

  DOM.mailTo.value = venue.inchargeEmail;
  DOM.mailSubject.value = `Facility Requisition: Permission for ${venue.code} on ${targetDate} (${slotText})`;

  DOM.mailBody.value = `Respected Sir/Madam,

I am writing to formally request permission to reserve facility ${venue.code} (${venue.dept}) for college academic and club activities.

Reservation Summary:
- Facility: ${venue.name} (${venue.code})
- Location: ${venue.floor}
- Required Capacity: ${venue.capacity} students
- Date: ${targetDate}
- Time Slot: ${slotText}

Applicant Information:
- Full Name: ${user.name}
- Role: ${user.role.toUpperCase()}
- Department: ${user.dept}
- Email: ${user.email}

Kindly grant your kind approval for the venue reservation.

Yours sincerely,
${user.name}
${user.dept}`;

  DOM.emailComposerModal.classList.add("active");
}

function closeEmailComposerModal() {
  DOM.emailComposerModal.classList.remove("active");
}

// Open real mailto
DOM.btnOpenRealMailto.addEventListener("click", () => {
  const to = encodeURIComponent(DOM.mailTo.value);
  const subject = encodeURIComponent(DOM.mailSubject.value);
  const body = encodeURIComponent(DOM.mailBody.value);
  window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
});

// Send Email & Confirm Booking
DOM.btnSendEmailConfirm.addEventListener("click", async () => {
  const venue = AppState.selectedVenue;
  const user = AppState.currentUser;
  const targetDate = AppState.currentFilters.date;
  const slotTime = AppState.selectedSlot ? AppState.selectedSlot.slotTime : "08:00 AM - 11:00 AM";
  const slotLabel = AppState.selectedSlot ? AppState.selectedSlot.slotLabel : "Selected Slot";

  DOM.btnSendEmailConfirm.disabled = true;
  DOM.btnSendEmailConfirm.innerHTML = `<span class="spinner"></span> Dispatching Requisition...`;

  try {
    const bookingResult = await ApiService.createBooking({
      venueId: venue.id,
      venueCode: venue.code,
      venueName: venue.name,
      dept: venue.dept,
      date: targetDate,
      timeSlot: slotTime,
      slotLabel: slotLabel,
      bookedBy: user.name,
      applicantEmail: user.email,
      inchargeEmail: venue.inchargeEmail,
      purpose: "Classroom / Seminar Activity"
    });

    closeEmailComposerModal();

    DOM.ticketId.textContent = `#${bookingResult.id}`;
    DOM.ticketVenue.textContent = `${bookingResult.venueCode} (${bookingResult.venueName})`;
    DOM.ticketDept.textContent = bookingResult.dept;
    DOM.ticketDate.textContent = bookingResult.date;
    DOM.ticketSlot.textContent = bookingResult.timeSlot;

    DOM.bookingSuccessModal.classList.add("active");
    showToast(`Booking Confirmed! Requisition sent to ${venue.inchargeEmail}`);

    executeSearch(); // Refresh results to reflect newly booked slot
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    DOM.btnSendEmailConfirm.disabled = false;
    DOM.btnSendEmailConfirm.innerHTML = `<span>Send Email &bull; Confirm Booking</span>`;
  }
});

// ============================================================================
// PREVIOUS BOOKINGS HISTORY MODAL
// ============================================================================
async function openPreviousBookingsModal() {
  DOM.prevBookingsModal.classList.add("active");
  DOM.historyTableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center; padding:2rem;">
        <div class="spinner spinner-teal" style="margin:0 auto;"></div>
        <div style="margin-top:0.5rem; color:var(--text-sec);">Loading your reservations...</div>
      </td>
    </tr>
  `;
  DOM.historyEmpty.style.display = "none";

  try {
    const email = AppState.currentUser ? AppState.currentUser.email : "";
    const bookings = await ApiService.getUserBookings(email);

    if (!bookings || bookings.length === 0) {
      DOM.historyTableBody.innerHTML = "";
      DOM.historyEmpty.style.display = "block";
      return;
    }

    DOM.historyEmpty.style.display = "none";
    DOM.historyTableBody.innerHTML = bookings
      .map((b) => {
        const isCancelled = b.status === "Cancelled";
        return `
          <tr>
            <td><strong>#${b.id}</strong></td>
            <td>
              <div style="font-weight:600; color:var(--teal-900);">${b.venueCode}</div>
              <div style="font-size:0.75rem; color:var(--text-sec);">${b.venueName}</div>
            </td>
            <td>${b.dept.split("(")[0]}</td>
            <td>${b.date}</td>
            <td><span class="tag-badge">${b.timeSlot}</span></td>
            <td>
              <span class="status-pill ${isCancelled ? "booked" : "available"}" style="font-size:0.72rem;">
                ${b.status}
              </span>
            </td>
            <td>
              ${
                !isCancelled
                  ? `<button class="btn btn-danger btn-sm cancel-booking-btn" data-id="${b.id}" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Cancel</button>`
                  : `<span style="font-size:0.8rem; color:var(--text-muted);">&mdash;</span>`
              }
            </td>
          </tr>
        `;
      })
      .join("");

    // Cancel click handler
    document.querySelectorAll(".cancel-booking-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const bookingId = btn.getAttribute("data-id");
        if (confirm(`Are you sure you want to cancel booking #${bookingId}?`)) {
          try {
            await ApiService.cancelBooking(bookingId);
            showToast(`Booking #${bookingId} cancelled.`);
            openPreviousBookingsModal();
            executeSearch();
          } catch (e) {
            showToast("Failed to cancel booking.", "error");
          }
        }
      });
    });
  } catch (e) {
    DOM.historyTableBody.innerHTML = `
      <tr><td colspan="7" style="text-align:center; color:#9b2c2c;">Error loading history.</td></tr>
    `;
  }
}

function closePreviousBookingsModal() {
  DOM.prevBookingsModal.classList.remove("active");
}

// ============================================================================
// AUTH & REGISTRATION FORM HANDLERS
// ============================================================================
DOM.signinForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAuthErrors();

  const email = DOM.signinEmail.value.trim();
  const password = DOM.signinPassword.value;
  let valid = true;

  if (!email || !isValidCollegeEmail(email)) {
    setFieldError(DOM.signinEmail, DOM.signinEmailError, "Enter official college email ending with .ac.in");
    valid = false;
  }
  if (!password) {
    setFieldError(DOM.signinPassword, DOM.signinPasswordError, "Password is required");
    valid = false;
  }
  if (!valid) return;

  DOM.signinSubmitBtn.disabled = true;
  DOM.signinSubmitBtn.innerHTML = `<span class="spinner"></span> Signing in...`;

  try {
    const result = await ApiService.login(email, password);
    showToast(`Welcome back, ${result.user.name}!`);
    DOM.signinForm.reset();
    closeAuthModal();
    updateNavAuthUI();
  } catch (err) {
    DOM.signinBannerErrorText.textContent = err.message;
    DOM.signinBannerError.classList.add("show");
  } finally {
    DOM.signinSubmitBtn.disabled = false;
    DOM.signinSubmitBtn.innerHTML = `<span>Sign In</span>`;
  }
});

DOM.registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAuthErrors();

  const name = DOM.regName.value.trim();
  const email = DOM.regEmail.value.trim();
  const role = DOM.regRole.value;
  const dept = DOM.regDept.value;
  const password = DOM.regPassword.value;
  let valid = true;

  if (!name || name.length < 2) {
    setFieldError(DOM.regName, DOM.regNameError, "Enter your full name");
    valid = false;
  }
  if (!email || !isValidCollegeEmail(email)) {
    setFieldError(DOM.regEmail, DOM.regEmailError, "Email must end with .ac.in (e.g. name@college.ac.in)");
    valid = false;
  }
  if (!role) {
    setFieldError(DOM.regRole, DOM.regRoleError, "Please select your role");
    valid = false;
  }
  if (!dept) {
    setFieldError(DOM.regDept, DOM.regDeptError, "Please select your department");
    valid = false;
  }
  if (!password || password.length < 6) {
    setFieldError(DOM.regPassword, DOM.regPasswordError, "Password must be at least 6 characters");
    valid = false;
  }
  if (!valid) return;

  DOM.registerSubmitBtn.disabled = true;
  DOM.registerSubmitBtn.innerHTML = `<span class="spinner"></span> Sending OTP...`;

  try {
    const result = await ApiService.registerInitiate({ name, email, role, dept, password });
    AppState.pendingOtpEmail = email;
    DOM.otpDisplayEmail.textContent = email;
    showToast(`Verification code sent! (Simulated OTP: ${result.otp})`);
    openOtpModal();
  } catch (err) {
    DOM.registerBannerErrorText.textContent = err.message;
    DOM.registerBannerError.classList.add("show");
  } finally {
    DOM.registerSubmitBtn.disabled = false;
    DOM.registerSubmitBtn.innerHTML = `<span>Continue → Verify via OTP</span>`;
  }
});

DOM.otpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  DOM.otpBannerError.classList.remove("show");

  const enteredCode = DOM.otp1.value + DOM.otp2.value + DOM.otp3.value + DOM.otp4.value;

  if (enteredCode.length < 4) {
    DOM.otpBannerErrorText.textContent = "Please enter all 4 digits.";
    DOM.otpBannerError.classList.add("show");
    return;
  }

  DOM.otpSubmitBtn.disabled = true;
  DOM.otpSubmitBtn.innerHTML = `<span class="spinner"></span> Verifying...`;

  try {
    const result = await ApiService.verifyRegistrationOtp(AppState.pendingOtpEmail, enteredCode);
    showToast(`Welcome to BookIt, ${result.user.name}! Your account is verified.`);
    DOM.registerForm.reset();
    DOM.otpForm.reset();
    closeOtpModal();
    updateNavAuthUI();
  } catch (err) {
    DOM.otpBannerErrorText.textContent = err.message;
    DOM.otpBannerError.classList.add("show");
    [DOM.otp1, DOM.otp2, DOM.otp3, DOM.otp4].forEach((inp) => inp.classList.add("is-invalid"));
  } finally {
    DOM.otpSubmitBtn.disabled = false;
    DOM.otpSubmitBtn.innerHTML = `<span>Verify &amp; Complete Registration</span>`;
  }
});

// OTP inputs auto-advance & paste
const otpInputs = [DOM.otp1, DOM.otp2, DOM.otp3, DOM.otp4];
otpInputs.forEach((input, idx) => {
  if (!input) return;

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    input.classList.remove("is-invalid");
    DOM.otpBannerError.classList.remove("show");
    if (input.value.length === 1 && idx < otpInputs.length - 1) {
      otpInputs[idx + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && idx > 0) {
      otpInputs[idx - 1].focus();
    }
  });

  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text").trim();
    if (/^\d{4}$/.test(paste)) {
      paste.split("").forEach((char, i) => {
        if (otpInputs[i]) otpInputs[i].value = char;
      });
      otpInputs[3].focus();
    }
  });
});

DOM.btnResendOtp.addEventListener("click", async () => {
  if (AppState.otpTimerSeconds > 0) return;
  try {
    const res = await ApiService.resendOtp(AppState.pendingOtpEmail);
    showToast(`New code sent! (Simulated OTP: ${res.otp})`);
    startOtpCountdown(30);
  } catch (err) {
    showToast("Failed to resend code.", "error");
  }
});

DOM.otpBackBtn.addEventListener("click", () => {
  closeOtpModal();
  openAuthModal("register");
});

// ============================================================================
// GLOBAL EVENT LISTENERS BINDING
// ============================================================================
function setupEventListeners() {
  // Brand logo
  DOM.brandHomeBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Mobile menu
  DOM.mobileToggleBtn.addEventListener("click", () => {
    DOM.navMenu.classList.toggle("show-mobile");
  });

  // Header Nav links
  // DOM.navSearchBtn.addEventListener("click", () => {
  //   DOM.navMenu.classList.remove("show-mobile");
  // });
  // DOM.navDeptBtn.addEventListener("click", () => {
  //   DOM.navMenu.classList.remove("show-mobile");
  // });
  DOM.navAboutBtn.addEventListener("click", () => {
    DOM.navMenu.classList.remove("show-mobile");
  });
  DOM.navContactBtn.addEventListener("click", () => {
    DOM.navMenu.classList.remove("show-mobile");
  });
console.log("loginBtn:", DOM.btnOpenAuth);
  // Login / Register button
  DOM.btnOpenAuth.addEventListener("click", () => {
  console.log("login clicked");
  openAuthModal("signin");
});
  DOM.authModalClose.addEventListener("click", closeAuthModal);

  // Auth tabs
  DOM.tabSignin.addEventListener("click", () => {
    clearAuthErrors();
    switchAuthTab("signin");
    setTimeout(() => DOM.signinEmail.focus(), 50);
  });
  DOM.tabRegister.addEventListener("click", () => {
    clearAuthErrors();
    switchAuthTab("register");
    setTimeout(() => DOM.regName.focus(), 50);
  });

  DOM.gotoRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    clearAuthErrors();
    switchAuthTab("register");
  });
  DOM.gotoSigninLink.addEventListener("click", (e) => {
    e.preventDefault();
    clearAuthErrors();
    switchAuthTab("signin");
  });

  DOM.forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Please contact the Central Administration at venues.admin@college.ac.in to reset password.", "success");
  });

  // Demo quick-fill buttons (inside sign-in panel)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-demo-fill");
    if (!btn) return;
    const email = btn.dataset.email;
    if (!email) return;
    if (DOM.signinEmail) DOM.signinEmail.value = email;
    if (DOM.signinPassword) DOM.signinPassword.value = "password123";
    const friendlyName = btn.textContent.trim().replace(/^👤\s*/, "");
    showToast(`Demo credentials filled — ${friendlyName}`, "success");
    clearAuthErrors();
  });

  // My Bookings
  DOM.navPrevBookingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    DOM.navMenu.classList.remove("show-mobile");
    openPreviousBookingsModal();
  });

  // Logout
  DOM.navLogoutBtn.addEventListener("click", () => {
    ApiService.logout();
    AppState.currentUser = null;
    updateNavAuthUI();
    showToast("You have been signed out.");
    window.scrollTo({ top: 0, behavior: "smooth" });
    DOM.navMenu.classList.remove("show-mobile");
  });

  // Department Modal Closures
  DOM.closeDeptModalBtn.addEventListener("click", closeDepartmentDetailsModal);
  DOM.btnCloseDeptModal.addEventListener("click", closeDepartmentDetailsModal);

  // Venue Details Modal Closures
  DOM.closeVenueModalBtn.addEventListener("click", closeVenueDetailModal);
  DOM.btnCancelVenueDetail.addEventListener("click", closeVenueDetailModal);

  // Email Composer Modal Closures
  DOM.closeEmailModalBtn.addEventListener("click", closeEmailComposerModal);
  DOM.btnBackFromEmail.addEventListener("click", () => {
    closeEmailComposerModal();
    if (AppState.selectedVenue) openVenueDetailModal(AppState.selectedVenue.id);
  });

  // Success Modal
  DOM.btnSuccessViewBookings.addEventListener("click", () => {
    DOM.bookingSuccessModal.classList.remove("active");
    openPreviousBookingsModal();
  });
  DOM.btnSuccessBookMore.addEventListener("click", () => {
    DOM.bookingSuccessModal.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // History Modal Closures
  DOM.closeHistoryModalBtn.addEventListener("click", closePreviousBookingsModal);
  DOM.btnCloseHistory.addEventListener("click", closePreviousBookingsModal);

  // Backdrop overlay click
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });
}

// ============================================================================
// INITIALIZATION ON READY
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initDatePicker();
  setupEventListeners();
  updateNavAuthUI();
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Render the 13 College Departments Directory
  renderDepartmentsDirectory();

  // If user already logged in, show warm welcome
  if (ApiService.isAuthenticated()) {
    showToast(`Welcome back, ${AppState.currentUser.name}!`);
  }
});

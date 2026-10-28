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
  otpTimerInterval: null,
  pendingAdminDecision: null
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

  // Register Form (Create Account)
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

  // OTP Verification Modal
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
  historyModalTitle:      document.getElementById("history-modal-title"),
  historyModalContent:    document.getElementById("history-modal-content"),
  closeHistoryModalBtn:   document.getElementById("close-history-modal-btn"),
  btnCloseHistory:        document.getElementById("btn-close-history"),
  historyTableBody:       document.getElementById("history-table-body"),
  historyEmpty:           document.getElementById("history-empty"),

  // Admin Decision & Email Modal
  adminDecisionModal:     document.getElementById("admin-decision-modal"),
  closeAdminDecisionBtn:  document.getElementById("close-admin-decision-btn"),
  adminDecisionTitle:     document.getElementById("admin-decision-title"),
  adminDecisionSummary:   document.getElementById("admin-decision-summary"),
  adminDecisionReason:    document.getElementById("admin-decision-reason"),
  adminDecisionReasonError: document.getElementById("admin-decision-reason-error"),
  adminMailFrom:          document.getElementById("admin-mail-from"),
  adminMailTo:            document.getElementById("admin-mail-to"),
  adminMailSubject:       document.getElementById("admin-mail-subject"),
  adminMailBody:          document.getElementById("admin-mail-body"),
  btnAdminEmailCancel:    document.getElementById("btn-admin-email-cancel"),
  btnAdminEmailMailto:    document.getElementById("btn-admin-email-mailto"),
  btnAdminEmailConfirm:   document.getElementById("btn-admin-email-confirm"),

  // Toast Container
  toastContainer:         document.getElementById("toast-container")
};

// ============================================================================
// Notification Utility (Toasts)
// ============================================================================
function showToast(message, type = "success") {
  if (!DOM.toastContainer) return;
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
  if (inputEl) inputEl.classList.add("is-invalid");
  if (message && errorEl) errorEl.textContent = message;
  if (errorEl) errorEl.classList.add("show");
}

function clearFieldError(inputEl, errorEl) {
  if (inputEl) inputEl.classList.remove("is-invalid");
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
    if (DOM.navPrevBookingsBtn) DOM.navPrevBookingsBtn.style.display = "inline-block";
    if (DOM.navUserBadge) DOM.navUserBadge.style.display = "inline-flex";
    if (DOM.navUserName) DOM.navUserName.textContent = user.name;
    if (DOM.userAvatarChar) DOM.userAvatarChar.textContent = user.name.charAt(0).toUpperCase();
    if (DOM.navLogoutBtn) DOM.navLogoutBtn.style.display = "inline-block";
    if (DOM.btnOpenAuth) DOM.btnOpenAuth.style.display = "none";
  } else {
    if (DOM.navPrevBookingsBtn) DOM.navPrevBookingsBtn.style.display = "none";
    if (DOM.navUserBadge) DOM.navUserBadge.style.display = "none";
    if (DOM.navLogoutBtn) DOM.navLogoutBtn.style.display = "none";
    if (DOM.btnOpenAuth) DOM.btnOpenAuth.style.display = "inline-block";
  }
}

// ============================================================================
// Auth & OTP Modals Control
// ============================================================================
function openAuthModal(tab = "signin") {
  clearAuthErrors();
  const modal = DOM.authModal || document.getElementById("auth-modal");
  if (modal) modal.classList.add("active");
  switchAuthTab(tab);
  if (tab === "signin") {
    setTimeout(() => {
      const emailEl = DOM.signinEmail || document.getElementById("signin-email");
      if (emailEl) emailEl.focus();
    }, 60);
  } else {
    setTimeout(() => {
      const nameEl = DOM.regName || document.getElementById("reg-name");
      if (nameEl) nameEl.focus();
    }, 60);
  }
}

function closeAuthModal() {
  const modal = DOM.authModal || document.getElementById("auth-modal");
  if (modal) modal.classList.remove("active");
  clearAuthErrors();
}

function switchAuthTab(tab) {
  const tabSignin = DOM.tabSignin || document.getElementById("tab-signin");
  const tabRegister = DOM.tabRegister || document.getElementById("tab-register");
  const panelSignin = DOM.panelSignin || document.getElementById("panel-signin");
  const panelRegister = DOM.panelRegister || document.getElementById("panel-register");

  if (tabSignin) tabSignin.classList.toggle("active", tab === "signin");
  if (tabRegister) tabRegister.classList.toggle("active", tab === "register");
  if (panelSignin) {
    panelSignin.classList.toggle("active", tab === "signin");
    panelSignin.style.display = tab === "signin" ? "block" : "none";
  }
  if (panelRegister) {
    panelRegister.classList.toggle("active", tab === "register");
    panelRegister.style.display = tab === "register" ? "block" : "none";
  }
}

function openOtpModal() {
   if (DOM.authModal) DOM.authModal.classList.remove("active");
  if (DOM.otpModal) DOM.otpModal.classList.add("active");
  [DOM.otp1, DOM.otp2, DOM.otp3, DOM.otp4].forEach((inp) => {
    if (inp) {
      inp.value = "";
      inp.classList.remove("is-invalid");
    }
  });
  if (DOM.otpBannerError) DOM.otpBannerError.classList.remove("show");
  startOtpCountdown(30);
  setTimeout(() => { if (DOM.otp1) DOM.otp1.focus(); }, 80);
}
}

function closeOtpModal() {
  DOM.otpModal.classList.remove("active");
}

function startOtpCountdown(seconds = 30) {
  if (AppState.otpTimerInterval) clearInterval(AppState.otpTimerInterval);
  AppState.otpTimerSeconds = seconds;

  if (DOM.btnResendOtp) {
    DOM.btnResendOtp.disabled = true;
    DOM.btnResendOtp.style.opacity = "0.45";
  }
  if (DOM.otpTimerText) {
    DOM.otpTimerText.textContent = `(Resend in ${seconds}s)`;
  }

  AppState.otpTimerInterval = setInterval(() => {
    AppState.otpTimerSeconds--;
    if (AppState.otpTimerSeconds <= 0) {
      clearInterval(AppState.otpTimerInterval);
      if (DOM.btnResendOtp) {
        DOM.btnResendOtp.disabled = false;
        DOM.btnResendOtp.style.opacity = "1";
      }
      if (DOM.otpTimerText) DOM.otpTimerText.textContent = "";
    } else {
      if (DOM.otpTimerText) DOM.otpTimerText.textContent = `(Resend in ${AppState.otpTimerSeconds}s)`;
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
          <!-- 
          <button class="btn-open-dept-modal" data-code="${dept.code}">
              Explore Classrooms &rarr;
            </button> -->
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
      applicantRole: user.role || "student",
      inchargeEmail: venue.inchargeEmail,
      purpose: "Classroom / Seminar Activity"
    });

    closeEmailComposerModal();

    DOM.ticketId.textContent = `#${bookingResult.id}`;
    DOM.ticketVenue.textContent = `${bookingResult.venueCode} (${bookingResult.venueName})`;
    DOM.ticketDept.textContent = bookingResult.dept;
    DOM.ticketDate.textContent = bookingResult.date;
    DOM.ticketSlot.textContent = `${bookingResult.timeSlot} (Pending Approval)`;

    DOM.bookingSuccessModal.classList.add("active");
    showToast(`Requisition Submitted! Sent for Department Admin approval.`);

    executeSearch(); // Refresh results to reflect newly booked slot
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    DOM.btnSendEmailConfirm.disabled = false;
    DOM.btnSendEmailConfirm.innerHTML = `<span>Send Email &bull; Confirm Booking</span>`;
  }
});

// ============================================================================
// PREVIOUS BOOKINGS & DEPARTMENT ADMIN REQUISITIONS MODAL
// ============================================================================
async function openPreviousBookingsModal() {
  const user = AppState.currentUser || ApiService.getCurrentUser();
  if (!user) {
    showToast("Please sign in to view your bookings.", "error");
    openAuthModal("signin");
    return;
  }

  const modal = DOM.prevBookingsModal || document.getElementById("prev-bookings-modal");
  const modalTitle = DOM.historyModalTitle || document.getElementById("history-modal-title");
  const contentContainer = DOM.historyModalContent || document.getElementById("history-modal-content");

  if (modal) modal.classList.add("active");

  if (contentContainer) {
    contentContainer.innerHTML = `
      <div style="text-align:center; padding:2.5rem 1rem;">
        <div class="spinner spinner-teal" style="margin:0 auto;"></div>
        <div style="margin-top:0.75rem; color:var(--text-sec); font-weight:500;">Retrieving booking records &amp; requisitions...</div>
      </div>
    `;
  }

  try {
    const allBookings = await ApiService.getAllBookings();

    if (user.role === "admin") {
      // -------------------------------------------------------------
      // DEPARTMENT ADMIN PORTAL
      // -------------------------------------------------------------
      if (modalTitle) modalTitle.innerHTML = `🏛️ Department Requisition &amp; Approval Portal`;

      // Filter pending requests for this department (or all if Central/none)
      const pendingList = allBookings.filter((b) => {
        const isPending = b.status === "Pending Approval" || b.status === "Pending";
        if (!isPending) return false;
        if (!user.dept || user.dept === "all" || user.dept === "Academic Complex") return true;
        return b.dept && (b.dept.toLowerCase().includes(user.dept.toLowerCase()) || user.dept.toLowerCase().includes(b.dept.toLowerCase()));
      });

      // Filter processed bookings for this department
      const historyList = allBookings.filter((b) => {
        const isPending = b.status === "Pending Approval" || b.status === "Pending";
        if (isPending) return false;
        if (!user.dept || user.dept === "all" || user.dept === "Academic Complex") return true;
        return b.dept && (b.dept.toLowerCase().includes(user.dept.toLowerCase()) || user.dept.toLowerCase().includes(b.dept.toLowerCase()));
      });

      contentContainer.innerHTML = `
        <!-- Admin Profile Banner -->
        <div style="background:#f0fdfa; border:1px solid #99f6e4; border-radius:8px; padding:0.85rem 1rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; color:#0f766e; font-weight:800;">Department Administrator View</div>
            <div style="font-weight:700; color:#0c4340; font-size:1.05rem;">🛡️ ${user.name}</div>
            <div style="font-size:0.8rem; color:#134e4a;">${user.dept}</div>
          </div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <span class="tag-badge" style="background:#fef3c7; color:#92400e; border-color:#fcd34d; font-weight:700;">⚡ ${pendingList.length} Pending Approval</span>
            <span class="tag-badge" style="background:#f1f5f9; color:#475569; border-color:#cbd5e1;">📋 ${historyList.length} Processed</span>
          </div>
        </div>

        <!-- SECTION 1: PENDING APPROVAL (ADMIN ACTION) -->
        <div style="margin-bottom:1.75rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
            <h3 style="font-size:0.96rem; font-weight:800; color:#92400e; margin:0; display:flex; align-items:center; gap:0.4rem;">
              <span>⏳</span> Pending Requisitions Awaiting Your Approval (${pendingList.length})
            </h3>
          </div>
          <p style="font-size:0.8rem; color:var(--text-sec); margin-bottom:0.75rem;">
            Review reservation requests submitted by students and faculty for facilities in your department. Accepting a request confirms the reservation; rejecting it frees the slot.
          </p>

          ${
            pendingList.length === 0
              ? `<div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:1.25rem; text-align:center; color:#64748b; font-size:0.85rem;">
                  ✓ No pending requisitions for ${user.dept}. All venue requests have been reviewed!
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Applicant</th>
                        <th>Venue</th>
                        <th>Date &amp; Slot</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th style="text-align:center; min-width:150px;">Admin Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pendingList
                        .map(
                          (b) => `
                        <tr>
                          <td><strong>#${b.id}</strong></td>
                          <td>
                            <div style="font-weight:700; color:var(--teal-900);">${b.bookedBy || "Applicant"}</div>
                            <div style="font-size:0.75rem; color:var(--text-sec);">${b.applicantEmail || ""}</div>
                            <span class="tag-badge" style="font-size:0.68rem; padding:0.1rem 0.4rem; text-transform:uppercase;">${b.applicantRole || "student"}</span>
                          </td>
                          <td>
                            <div style="font-weight:700; color:var(--teal-900);">${b.venueCode}</div>
                            <div style="font-size:0.74rem; color:var(--text-sec);">${b.venueName}</div>
                          </td>
                          <td>
                            <div style="font-weight:600;">${b.date}</div>
                            <span class="tag-badge" style="font-size:0.72rem;">${b.timeSlot}</span>
                          </td>
                          <td style="font-size:0.8rem; color:var(--text-sec); max-width:170px;">${b.purpose || "Classroom / Seminar Activity"}</td>
                          <td>
                            <span class="status-pill status-pending" style="font-size:0.72rem;">⏳ Pending</span>
                          </td>
                          <td style="text-align:center; white-space:nowrap;">
                            <button class="btn btn-approve btn-admin-approve" data-id="${b.id}" title="Approve and confirm this reservation">✓ Accept</button>
                            <button class="btn btn-reject btn-admin-reject" data-id="${b.id}" title="Reject this requisition">✕ Reject</button>
                          </td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>`
          }
        </div>

        <!-- SECTION 2: DEPARTMENT BOOKING RECORDS -->
        <div>
          <h3 style="font-size:0.96rem; font-weight:800; color:var(--teal-900); margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
            <span>📋</span> Processed Department Records (${historyList.length})
          </h3>
          <p style="font-size:0.8rem; color:var(--text-sec); margin-bottom:0.75rem;">
            Archive of approved, rejected, and cancelled requisitions for your department facilities.
          </p>

          ${
            historyList.length === 0
              ? `<div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:1.25rem; text-align:center; color:#64748b; font-size:0.85rem;">
                  No past records found for this department.
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Applicant</th>
                        <th>Venue</th>
                        <th>Date &amp; Slot</th>
                        <th>Status</th>
                        <th>Review Log</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${historyList
                        .map((b) => {
                          const isConf = b.status === "Confirmed" || b.status === "Approved";
                          const isRej = b.status === "Rejected";
                          const statusClass = isConf ? "available" : isRej ? "rejected" : "booked";
                          const statusLabel = isConf ? "✓ Confirmed" : isRej ? "✕ Rejected" : b.status;
                          return `
                          <tr>
                            <td><strong>#${b.id}</strong></td>
                            <td>
                              <div style="font-weight:600;">${b.bookedBy || "Applicant"}</div>
                              <div style="font-size:0.73rem; color:var(--text-sec);">${b.applicantEmail || ""}</div>
                            </td>
                            <td>
                              <strong>${b.venueCode}</strong>
                              <div style="font-size:0.74rem; color:var(--text-sec);">${b.venueName}</div>
                            </td>
                            <td>
                              <div>${b.date}</div>
                              <span class="tag-badge" style="font-size:0.7rem;">${b.timeSlot}</span>
                            </td>
                            <td>
                              <span class="status-pill ${statusClass}" style="font-size:0.72rem;">${statusLabel}</span>
                            </td>
                            <td style="font-size:0.76rem; color:var(--text-sec);">
                              ${b.decisionBy ? `Reviewed by ${b.decisionBy}` : (isConf ? "Approved" : isRej ? "Rejected" : b.status)}
                            </td>
                          </tr>
                        `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                </div>`
          }
        </div>
      `;

      // Attach Admin Approve & Reject Listeners — opens decision+email modal
      contentContainer.querySelectorAll(".btn-admin-approve").forEach((btn) => {
        btn.addEventListener("click", () => {
          const bookingId = btn.getAttribute("data-id");
          const booking = allBookings.find((b) => b.id === bookingId);
          if (booking) openAdminDecisionModal(booking, "approve", user);
        });
      });

      contentContainer.querySelectorAll(".btn-admin-reject").forEach((btn) => {
        btn.addEventListener("click", () => {
          const bookingId = btn.getAttribute("data-id");
          const booking = allBookings.find((b) => b.id === bookingId);
          if (booking) openAdminDecisionModal(booking, "reject", user);
        });
      });

    } else {
      // -------------------------------------------------------------
      // STUDENT / FACULTY APPLICANT VIEW
      // -------------------------------------------------------------
      if (modalTitle) modalTitle.innerHTML = `📋 My Booking History &amp; Requisitions`;

      const userBookings = allBookings.filter(
        (b) => b.applicantEmail && b.applicantEmail.toLowerCase() === user.email.toLowerCase()
      );

      const pendingBookings = userBookings.filter(
        (b) => b.status === "Pending Approval" || b.status === "Pending"
      );

      const historyBookings = userBookings.filter(
        (b) => b.status !== "Pending Approval" && b.status !== "Pending"
      );

      contentContainer.innerHTML = `
        <!-- Applicant User Banner -->
        <div style="background:#f0fdfa; border:1px solid #99f6e4; border-radius:8px; padding:0.85rem 1rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; color:#0f766e; font-weight:800;">Applicant Dashboard</div>
            <div style="font-weight:700; color:#0c4340; font-size:1.05rem;">👤 ${user.name}</div>
            <div style="font-size:0.8rem; color:#134e4a;">${user.role.toUpperCase()} &bull; ${user.dept}</div>
          </div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <span class="tag-badge" style="background:#fef3c7; color:#92400e; border-color:#fcd34d; font-weight:700;">⏳ ${pendingBookings.length} Pending Approval</span>
            <span class="tag-badge" style="background:#f1f5f9; color:#475569; border-color:#cbd5e1;">📋 ${historyBookings.length} Processed</span>
          </div>
        </div>

        <!-- SECTION 1: PENDING APPROVAL FOR STUDENT -->
        <div style="margin-bottom:1.75rem;">
          <h3 style="font-size:0.96rem; font-weight:800; color:#92400e; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
            <span>⏳</span> Requisitions Pending Department Approval (${pendingBookings.length})
          </h3>
          <p style="font-size:0.8rem; color:var(--text-sec); margin-bottom:0.75rem;">
            These facility requisitions have been dispatched to the Department Administration. As soon as the Department Admin accepts or rejects your request, the status updates here automatically.
          </p>

          ${
            pendingBookings.length === 0
              ? `<div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:1.25rem; text-align:center; color:#64748b; font-size:0.85rem;">
                  No requisitions currently pending approval.
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Venue</th>
                        <th>Department</th>
                        <th>Date</th>
                        <th>Slot</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pendingBookings
                        .map(
                          (b) => `
                        <tr>
                          <td><strong>#${b.id}</strong></td>
                          <td>
                            <div style="font-weight:700; color:var(--teal-900);">${b.venueCode}</div>
                            <div style="font-size:0.74rem; color:var(--text-sec);">${b.venueName}</div>
                          </td>
                          <td>${b.dept.split("(")[0]}</td>
                          <td>${b.date}</td>
                          <td><span class="tag-badge">${b.timeSlot}</span></td>
                          <td>
                            <span class="status-pill status-pending" style="font-size:0.72rem;">
                              ⏳ Pending Admin Approval
                            </span>
                          </td>
                          <td>
                            <button class="btn btn-danger btn-sm cancel-booking-btn" data-id="${b.id}" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Cancel Request</button>
                          </td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>`
          }
        </div>

        <!-- SECTION 2: CONFIRMED & PAST BOOKINGS -->
        <div>
          <h3 style="font-size:0.96rem; font-weight:800; color:var(--teal-900); margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
            <span>📋</span> Confirmed &amp; Past Bookings (${historyBookings.length})
          </h3>
          <p style="font-size:0.8rem; color:var(--text-sec); margin-bottom:0.75rem;">
            Official records of accepted reservations, rejected requisitions, and cancelled bookings.
          </p>

          ${
            historyBookings.length === 0
              ? `<div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:1.25rem; text-align:center; color:#64748b; font-size:0.85rem;">
                  No past booking records found.
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Venue</th>
                        <th>Department</th>
                        <th>Date</th>
                        <th>Slot</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${historyBookings
                        .map((b) => {
                          const isConf = b.status === "Confirmed" || b.status === "Approved";
                          const isRej = b.status === "Rejected";
                          const isCanc = b.status === "Cancelled";
                          const statusClass = isConf ? "available" : isRej ? "rejected" : "booked";
                          const statusLabel = isConf ? "✓ Confirmed" : isRej ? "✕ Rejected by Admin" : b.status;
                          return `
                          <tr>
                            <td><strong>#${b.id}</strong></td>
                            <td>
                              <div style="font-weight:700; color:var(--teal-900);">${b.venueCode}</div>
                              <div style="font-size:0.74rem; color:var(--text-sec);">${b.venueName}</div>
                            </td>
                            <td>${b.dept.split("(")[0]}</td>
                            <td>${b.date}</td>
                            <td><span class="tag-badge">${b.timeSlot}</span></td>
                            <td>
                              <span class="status-pill ${statusClass}" style="font-size:0.72rem;">
                                ${statusLabel}
                              </span>
                            </td>
                            <td>
                              ${
                                isConf
                                  ? `<button class="btn btn-danger btn-sm cancel-booking-btn" data-id="${b.id}" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Cancel</button>`
                                  : `<span style="font-size:0.8rem; color:var(--text-muted);">&mdash;</span>`
                              }
                            </td>
                          </tr>
                        `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                </div>`
          }
        </div>
      `;

      // Attach cancel click handler
      contentContainer.querySelectorAll(".cancel-booking-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const bookingId = btn.getAttribute("data-id");
          if (confirm(`Are you sure you want to cancel requisition #${bookingId}?`)) {
            try {
              await ApiService.cancelBooking(bookingId);
              showToast(`Requisition #${bookingId} cancelled.`);
              openPreviousBookingsModal();
              if (typeof executeSearch === "function") executeSearch();
            } catch (e) {
              showToast("Failed to cancel requisition.", "error");
            }
          }
        });
      });
    }
  } catch (e) {
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div style="text-align:center; padding:2rem; color:#9b2c2c;">
          <p>Error loading booking records: ${e.message}</p>
        </div>
      `;
    }
  }
}

// ============================================================================
// ADMIN REQUISITION DECISION & EMAIL MODAL
// ============================================================================
function openAdminDecisionModal(booking, decisionType, adminUser) {
  AppState.pendingAdminDecision = { booking, decisionType, adminUser };

  const isApprove = decisionType === "approve";
  const decisionVerb = isApprove ? "ACCEPT" : "REJECT";
  const decisionEmoji = isApprove ? "✅" : "❌";

  // Title
  if (DOM.adminDecisionTitle) {
    DOM.adminDecisionTitle.innerHTML = `${decisionEmoji} ${decisionVerb} Requisition &amp; Dispatch Email`;
  }

  // Summary card
  if (DOM.adminDecisionSummary) {
    DOM.adminDecisionSummary.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.84rem;">
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">APPLICANT</span>
          <strong>${booking.bookedBy}</strong>
          <span style="font-size:0.75rem; color:var(--text-sec);">(${booking.applicantRole || "student"})</span><br>
          <span style="font-size:0.78rem;">${booking.applicantEmail}</span>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">VENUE</span>
          <strong>${booking.venueCode}</strong> — ${booking.venueName}
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">DATE &amp; SLOT</span>
          ${booking.date} &bull; <span class="tag-badge" style="font-size:0.73rem;">${booking.timeSlot}</span>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">PURPOSE</span>
          ${booking.purpose || "Classroom / Seminar Activity"}
        </div>
      </div>
    `;
  }

  // Clear reason field & hide error
  if (DOM.adminDecisionReason) DOM.adminDecisionReason.value = "";
  if (DOM.adminDecisionReasonError) DOM.adminDecisionReasonError.style.display = "none";

  // Build email draft
  const subject = isApprove
    ? `[APPROVED] Venue Requisition: ${booking.venueCode} on ${booking.date} (${booking.timeSlot})`
    : `[REJECTED] Venue Requisition: ${booking.venueCode} on ${booking.date} (${booking.timeSlot})`;

  const bodyIntro = isApprove
    ? `Your facility requisition has been APPROVED. The venue has been officially reserved for the stated purpose.`
    : `Your facility requisition has been REJECTED. The time slot is now available for others to book.`;

  const emailBodyTemplate = `Dear ${booking.bookedBy},

${bodyIntro}

Requisition Details:
- Venue: ${booking.venueCode} (${booking.venueName})
- Date: ${booking.date}
- Slot: ${booking.timeSlot}
- Purpose: ${booking.purpose || "Classroom / Seminar Activity"}

Administrative Remarks:
[Please type your reason above — it will appear here]

${isApprove
    ? "Please ensure the facility is used strictly for the stated purpose.\nIn case of any changes, notify this office at least 24 hours in advance."
    : "If you believe this decision was made in error, please contact the department office directly."}

Regards,
${adminUser.name}
${adminUser.dept} — Department Administration
${adminUser.email}`;

  if (DOM.adminMailFrom) DOM.adminMailFrom.value = adminUser.email;
  if (DOM.adminMailTo) DOM.adminMailTo.value = booking.applicantEmail;
  if (DOM.adminMailSubject) DOM.adminMailSubject.value = subject;
  if (DOM.adminMailBody) DOM.adminMailBody.value = emailBodyTemplate;

  // Live-update email body when admin types reason
  if (DOM.adminDecisionReason && DOM.adminMailBody) {
    DOM.adminDecisionReason.oninput = () => {
      const reason = DOM.adminDecisionReason.value.trim() || "[Please type your reason above — it will appear here]";
      DOM.adminMailBody.value = DOM.adminMailBody.value.replace(
        /Administrative Remarks:\n[\s\S]*?\n\n/,
        `Administrative Remarks:\n${reason}\n\n`
      );
    };
  }

  // Style confirm button
  if (DOM.btnAdminEmailConfirm) {
    DOM.btnAdminEmailConfirm.className = isApprove ? "btn btn-primary" : "btn btn-reject";
    DOM.btnAdminEmailConfirm.innerHTML = isApprove
      ? `<span>✓ Confirm Approval &amp; Send Email</span>`
      : `<span>✕ Confirm Rejection &amp; Send Email</span>`;
    DOM.btnAdminEmailConfirm.disabled = false;
  }

  // Show the modal (sits above the bookings modal)
  if (DOM.adminDecisionModal) DOM.adminDecisionModal.classList.add("active");
}

function closeAdminDecisionModal() {
  if (DOM.adminDecisionModal) DOM.adminDecisionModal.classList.remove("active");
  AppState.pendingAdminDecision = null;
}

function closePreviousBookingsModal() {
  const modal = DOM.prevBookingsModal || document.getElementById("prev-bookings-modal");
  if (modal) modal.classList.remove("active");
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
  if (DOM.brandHomeBtn) {
    DOM.brandHomeBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Mobile menu
  if (DOM.mobileToggleBtn) {
    DOM.mobileToggleBtn.addEventListener("click", () => {
      DOM.navMenu.classList.toggle("show-mobile");
    });
  }

  // Header Nav links
  if (DOM.navContactBtn) DOM.navContactBtn.addEventListener("click", () => DOM.navMenu.classList.remove("show-mobile"));

  // Single Header Auth Button: "Sign In / Create Account"
  if (DOM.btnOpenAuth) {
    DOM.btnOpenAuth.addEventListener("click", (e) => {
      e.preventDefault();
      openAuthModal("signin");
    });
  }

  if (DOM.authModalClose) {
    DOM.authModalClose.addEventListener("click", closeAuthModal);
  }

  // Auth tabs
  if (DOM.tabSignin) {
    DOM.tabSignin.addEventListener("click", (e) => {
      e.preventDefault();
      clearAuthErrors();
      switchAuthTab("signin");
      setTimeout(() => { if (DOM.signinEmail) DOM.signinEmail.focus(); }, 50);
    });
  }

  if (DOM.tabRegister) {
    DOM.tabRegister.addEventListener("click", (e) => {
      e.preventDefault();
      clearAuthErrors();
      switchAuthTab("register");
      setTimeout(() => { if (DOM.regName) DOM.regName.focus(); }, 50);
    });
  }

  if (DOM.gotoRegisterLink) {
    DOM.gotoRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearAuthErrors();
      switchAuthTab("register");
      setTimeout(() => { if (DOM.regName) DOM.regName.focus(); }, 50);
    });
  }

  if (DOM.gotoSigninLink) {
    DOM.gotoSigninLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearAuthErrors();
      switchAuthTab("signin");
      setTimeout(() => { if (DOM.signinEmail) DOM.signinEmail.focus(); }, 50);
    });
  }

  if (DOM.forgotPasswordLink) {
    DOM.forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Please contact the Central Administration at venues.admin@college.ac.in to reset password.", "success");
    });
  }

  // Demo quick-fill buttons (inside sign-in panel)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-demo-fill");
    if (!btn) return;
    const email = btn.dataset.email;
    if (!email) return;
    if (DOM.signinEmail) DOM.signinEmail.value = email;
    if (DOM.signinPassword) DOM.signinPassword.value = "password123";
    const friendlyName = btn.textContent.trim().replace(/^[^a-zA-Z0-9]+\s*/, "");
    showToast(`Demo credentials filled — ${friendlyName}`, "success");
    clearAuthErrors();
  });

  // Global delegated click listener for resilient button/tab behaviors
  document.addEventListener("click", (e) => {
    // Header Login/Register button
    if (e.target.closest("#btn-open-auth")) {
      e.preventDefault();
      openAuthModal("signin");
      return;
    }
    // Auth Modal close
    if (e.target.closest("#auth-modal-close")) {
      e.preventDefault();
      closeAuthModal();
      return;
    }
    // Tab signin or link
    if (e.target.closest("#tab-signin") || e.target.closest("#goto-signin-link")) {
      e.preventDefault();
      clearAuthErrors();
      switchAuthTab("signin");
      setTimeout(() => {
        const el = DOM.signinEmail || document.getElementById("signin-email");
        if (el) el.focus();
      }, 50);
      return;
    }
    // Tab register or link
    if (e.target.closest("#tab-register") || e.target.closest("#goto-register-link")) {
      e.preventDefault();
      clearAuthErrors();
      switchAuthTab("register");
      setTimeout(() => {
        const el = DOM.regName || document.getElementById("reg-name");
        if (el) el.focus();
      }, 50);
      return;
    }
  });

  // My Bookings
  if (DOM.navPrevBookingsBtn) {
    DOM.navPrevBookingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (DOM.navMenu) DOM.navMenu.classList.remove("show-mobile");
      openPreviousBookingsModal();
    });
  }

  // Logout
  if (DOM.navLogoutBtn) {
    DOM.navLogoutBtn.addEventListener("click", () => {
      ApiService.logout();
      AppState.currentUser = null;
      updateNavAuthUI();
      showToast("You have been signed out.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (DOM.navMenu) DOM.navMenu.classList.remove("show-mobile");
    });
  }

  // Department Modal Closures
  if (DOM.closeDeptModalBtn) DOM.closeDeptModalBtn.addEventListener("click", closeDepartmentDetailsModal);
  if (DOM.btnCloseDeptModal) DOM.btnCloseDeptModal.addEventListener("click", closeDepartmentDetailsModal);

  // Venue Details Modal Closures
  if (DOM.closeVenueModalBtn) DOM.closeVenueModalBtn.addEventListener("click", closeVenueDetailModal);
  if (DOM.btnCancelVenueDetail) DOM.btnCancelVenueDetail.addEventListener("click", closeVenueDetailModal);

  // Email Composer Modal Closures
  if (DOM.closeEmailModalBtn) DOM.closeEmailModalBtn.addEventListener("click", closeEmailComposerModal);
  if (DOM.btnBackFromEmail) {
    DOM.btnBackFromEmail.addEventListener("click", () => {
      closeEmailComposerModal();
      if (AppState.selectedVenue) openVenueDetailModal(AppState.selectedVenue.id);
    });
  }

  // Success Modal
  if (DOM.btnSuccessViewBookings) {
    DOM.btnSuccessViewBookings.addEventListener("click", () => {
      if (DOM.bookingSuccessModal) DOM.bookingSuccessModal.classList.remove("active");
      openPreviousBookingsModal();
    });
  }
  if (DOM.btnSuccessBookMore) {
    DOM.btnSuccessBookMore.addEventListener("click", () => {
      if (DOM.bookingSuccessModal) DOM.bookingSuccessModal.classList.remove("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // History Modal Closures
  if (DOM.closeHistoryModalBtn) DOM.closeHistoryModalBtn.addEventListener("click", closePreviousBookingsModal);
  if (DOM.btnCloseHistory) DOM.btnCloseHistory.addEventListener("click", closePreviousBookingsModal);

  // ---- Admin Decision & Email Modal ----
  if (DOM.closeAdminDecisionBtn) DOM.closeAdminDecisionBtn.addEventListener("click", closeAdminDecisionModal);
  if (DOM.btnAdminEmailCancel) DOM.btnAdminEmailCancel.addEventListener("click", closeAdminDecisionModal);

  if (DOM.btnAdminEmailMailto) {
    DOM.btnAdminEmailMailto.addEventListener("click", () => {
      const to      = encodeURIComponent(DOM.adminMailTo      ? DOM.adminMailTo.value      : "");
      const subject = encodeURIComponent(DOM.adminMailSubject ? DOM.adminMailSubject.value : "");
      const body    = encodeURIComponent(DOM.adminMailBody    ? DOM.adminMailBody.value    : "");
      window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
    });
  }

  if (DOM.btnAdminEmailConfirm) {
    DOM.btnAdminEmailConfirm.addEventListener("click", async () => {
      if (!AppState.pendingAdminDecision) return;

      // Require a reason before proceeding
      const reason = DOM.adminDecisionReason ? DOM.adminDecisionReason.value.trim() : "";
      if (!reason) {
        if (DOM.adminDecisionReasonError) DOM.adminDecisionReasonError.style.display = "block";
        if (DOM.adminDecisionReason) DOM.adminDecisionReason.focus();
        return;
      }
      if (DOM.adminDecisionReasonError) DOM.adminDecisionReasonError.style.display = "none";

      const { booking, decisionType, adminUser } = AppState.pendingAdminDecision;
      const isApprove = decisionType === "approve";
      const subject   = DOM.adminMailSubject ? DOM.adminMailSubject.value : "";
      const emailBody = DOM.adminMailBody    ? DOM.adminMailBody.value    : "";

      // Disable button while processing
      DOM.btnAdminEmailConfirm.disabled = true;
      DOM.btnAdminEmailConfirm.innerHTML = `<span class="spinner"></span> Processing...`;

      try {
        if (isApprove) {
          await ApiService.approveBooking(booking.id, adminUser.name, reason, adminUser.email, subject, emailBody);
          showToast(`✅ Requisition #${booking.id} APPROVED. Opening email client to notify ${booking.applicantEmail}…`);
        } else {
          await ApiService.rejectBooking(booking.id, adminUser.name, reason, adminUser.email, subject, emailBody);
          showToast(`Requisition #${booking.id} REJECTED. Opening email client…`, "error");
        }

        // Open the user's mail client with the pre-filled message
        const to         = encodeURIComponent(booking.applicantEmail);
        const subjEnc    = encodeURIComponent(subject);
        const bodyEnc    = encodeURIComponent(emailBody);
        window.open(`mailto:${to}?subject=${subjEnc}&body=${bodyEnc}`, "_blank");

        closeAdminDecisionModal();
        openPreviousBookingsModal();
        if (typeof executeSearch === "function") executeSearch();
      } catch (err) {
        showToast("Failed to process decision: " + err.message, "error");
        DOM.btnAdminEmailConfirm.disabled = false;
        DOM.btnAdminEmailConfirm.innerHTML = isApprove
          ? `<span>✓ Confirm Approval &amp; Send Email</span>`
          : `<span>✕ Confirm Rejection &amp; Send Email</span>`;
      }
    });
  }

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
function initApp() {
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

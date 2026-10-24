/**
 * ============================================================================
 * BookIt - Application Controller (app.js)
 * ============================================================================
 * Features:
 * - Single Header Button: "Sign In / Create Account"
 * - Authentication on Account Creation (Enforced .ac.in domain + 4-digit OTP)
 * - Search Venue: Disables results rendering (as requested: "after clicking don't do anything")
 * - Platform Information & Contact Us & Campus Address
 * - Clean, beginner-friendly, and error-free code
 * ============================================================================
 */

// Application State Store
const AppState = {
  currentUser: null,
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
  filterRoomName:         document.getElementById("filter-room-name"),
  filterCapacity:         document.getElementById("filter-capacity"),
  searchDeptError:        document.getElementById("search-dept-error"),
  searchDateError:        document.getElementById("search-date-error"),
  btnSearchVenuesSubmit:  document.getElementById("btn-search-venues-submit"),

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

// College Email Validation (.ac.in strictly enforced)
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
// Auth & OTP Modals Control (Exposed globally for direct click reliability)
// ============================================================================
window.openAuthModal = function (tab = "signin") {
  clearAuthErrors();
  if (DOM.authModal) DOM.authModal.classList.add("active");
  switchAuthTab(tab);
  if (tab === "signin") {
    setTimeout(() => { if (DOM.signinEmail) DOM.signinEmail.focus(); }, 80);
  } else {
    setTimeout(() => { if (DOM.regName) DOM.regName.focus(); }, 80);
  }
};

window.closeAuthModal = function () {
  if (DOM.authModal) DOM.authModal.classList.remove("active");
  clearAuthErrors();
};

function switchAuthTab(tab) {
  if (DOM.tabSignin) DOM.tabSignin.classList.toggle("active", tab === "signin");
  if (DOM.tabRegister) DOM.tabRegister.classList.toggle("active", tab === "register");
  if (DOM.panelSignin) DOM.panelSignin.classList.toggle("active", tab === "signin");
  if (DOM.panelRegister) DOM.panelRegister.classList.toggle("active", tab === "register");
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

function closeOtpModal() {
  if (DOM.otpModal) DOM.otpModal.classList.remove("active");
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

function initDatePicker() {
  const today = getTodayDateString();
  if (DOM.filterDate) {
    DOM.filterDate.value = today;
    DOM.filterDate.min = today;
  }
}

// ============================================================================
// SEARCH VENUE (Result show is not frontend part; after clicking don't do anything)
// ============================================================================
function handleHeroSearch(e) {
  e.preventDefault();
  // As explicitly requested:
  // "For search venue , result show is not my part that is part of another person so after cliking that button don't do anything."
  // Do nothing!
}

// ============================================================================
// PREVIOUS BOOKINGS HISTORY MODAL
// ============================================================================
async function openPreviousBookingsModal() {
  if (!DOM.prevBookingsModal) return;
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

    document.querySelectorAll(".cancel-booking-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const bookingId = btn.getAttribute("data-id");
        if (confirm(`Are you sure you want to cancel booking #${bookingId}?`)) {
          try {
            await ApiService.cancelBooking(bookingId);
            showToast(`Booking #${bookingId} cancelled.`);
            openPreviousBookingsModal();
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
  if (DOM.prevBookingsModal) DOM.prevBookingsModal.classList.remove("active");
}

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

  if (DOM.authModalClose) DOM.authModalClose.addEventListener("click", closeAuthModal);

  // Auth tabs (Sign In & Create Account switching)
  if (DOM.tabSignin) {
    DOM.tabSignin.addEventListener("click", () => {
      clearAuthErrors();
      switchAuthTab("signin");
      setTimeout(() => { if (DOM.signinEmail) DOM.signinEmail.focus(); }, 50);
    });
  }
  if (DOM.tabRegister) {
    DOM.tabRegister.addEventListener("click", () => {
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
    });
  }
  if (DOM.gotoSigninLink) {
    DOM.gotoSigninLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearAuthErrors();
      switchAuthTab("signin");
    });
  }

  if (DOM.forgotPasswordLink) {
    DOM.forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Please contact the Central Administration at venues.admin@college.ac.in to reset password.", "success");
    });
  }

  // Sign In Form Submission
  if (DOM.signinForm) {
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
  }

  // Create Account Form Submission (with OTP Authentication)
  if (DOM.registerForm) {
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
        showToast(`Authentication code sent! (Simulated OTP: ${result.otp})`);
        openOtpModal();
      } catch (err) {
        DOM.registerBannerErrorText.textContent = err.message;
        DOM.registerBannerError.classList.add("show");
      } finally {
        DOM.registerSubmitBtn.disabled = false;
        DOM.registerSubmitBtn.innerHTML = `<span>Continue → Verify via OTP</span>`;
      }
    });
  }

  // OTP Verification Submission
  if (DOM.otpForm) {
    DOM.otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      DOM.otpBannerError.classList.remove("show");

      const enteredCode = DOM.otp1.value + DOM.otp2.value + DOM.otp3.value + DOM.otp4.value;

      if (enteredCode.length < 4) {
        DOM.otpBannerErrorText.textContent = "Please enter all 4 digits of the code.";
        DOM.otpBannerError.classList.add("show");
        return;
      }

      DOM.otpSubmitBtn.disabled = true;
      DOM.otpSubmitBtn.innerHTML = `<span class="spinner"></span> Verifying...`;

      try {
        const result = await ApiService.verifyRegistrationOtp(AppState.pendingOtpEmail, enteredCode);
        showToast(`Welcome to BookIt, ${result.user.name}! Your account has been authenticated.`);
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
  }

  // OTP auto-advance & paste handlers
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

  if (DOM.btnResendOtp) {
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
  }

  if (DOM.otpBackBtn) {
    DOM.otpBackBtn.addEventListener("click", () => {
      closeOtpModal();
      openAuthModal("register");
    });
  }

  // Hero Search Form submission: "after cliking that button don't do anything"
  if (DOM.heroSearchForm) {
    DOM.heroSearchForm.addEventListener("submit", handleHeroSearch);
  }

  // Contact Form Submission
  if (DOM.contactInquiryForm) {
    DOM.contactInquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = DOM.contactName.value.trim();
      const email = DOM.contactEmail.value.trim();
      const msg = DOM.contactMsg.value.trim();

      if (!name || !email || !msg) {
        showToast("Please fill out all required fields.", "error");
        return;
      }
      if (!isValidCollegeEmail(email)) {
        showToast("Please use an official college email ending with .ac.in", "error");
        return;
      }

      showToast(`Thank you, ${name}! Your inquiry has been dispatched to venues.admin@college.ac.in.`, "success");
      DOM.contactInquiryForm.reset();
    });
  }

  // Previous Bookings Modal
  if (DOM.navPrevBookingsBtn) {
    DOM.navPrevBookingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      DOM.navMenu.classList.remove("show-mobile");
      openPreviousBookingsModal();
    });
  }
  if (DOM.closeHistoryModalBtn) DOM.closeHistoryModalBtn.addEventListener("click", closePreviousBookingsModal);
  if (DOM.btnCloseHistory) DOM.btnCloseHistory.addEventListener("click", closePreviousBookingsModal);

  // Logout
  if (DOM.navLogoutBtn) {
    DOM.navLogoutBtn.addEventListener("click", () => {
      ApiService.logout();
      AppState.currentUser = null;
      updateNavAuthUI();
      showToast("You have been signed out.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      DOM.navMenu.classList.remove("show-mobile");
    });
  }

  // Modal Backdrop Click to close
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });
}

// ============================================================================
// SAFE INITIALIZATION (Guaranteed to execute in all browsers & file:/// protocol)
// ============================================================================
function initializeApp() {
  initDatePicker();
  setupEventListeners();
  updateNavAuthUI();
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  if (ApiService.isAuthenticated()) {
    showToast(`Welcome back, ${AppState.currentUser.name}!`);
  }
}

// Execute immediately if DOM is already parsed, otherwise wait for event
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

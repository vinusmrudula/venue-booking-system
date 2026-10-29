/**
 * ============================================================================
 * BookIt - Dedicated Bookings & Admin Dashboard Controller (bookings.js)
 * ============================================================================
 * Handles real-time requisition updates, booking cancellations for students,
 * campus-wide pending requisition approvals for Administrators,
 * and admin registration authorization workflow for designated supervisors.
 */

// Toast notification helper
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1.25rem;
    border-radius: 8px;
    margin-bottom: 0.6rem;
    font-size: 0.88rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: fadeIn 0.25s ease-out;
    background: ${type === "error" ? "#fee2e2" : "#ecfdf5"};
    color: ${type === "error" ? "#991b1b" : "#065f46"};
    border: 1px solid ${type === "error" ? "#fca5a5" : "#6ee7b7"};
  `;

  const icon = type === "error" ? "⚠️" : "✓";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Live Clock in Utility Bar
function initLiveClock() {
  const clockEl = document.getElementById("util-datetime");
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const opts = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    };
    clockEl.innerHTML = `<span style="font-size:0.75rem; color:#a7f3d0;">LIVE 🟢</span> ${now.toLocaleString("en-US", opts)}`;
  }
  update();
  setInterval(update, 1000);
}

// Global modal state
let activeDecisionState = null;

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initLiveClock();
  initBookingsPage();
  setupDecisionModalHandlers();
});

async function initBookingsPage() {
  const currentUser = ApiService.getCurrentUser();

  if (!currentUser) {
    // Unauthenticated
    const content = document.getElementById("bookings-dynamic-content");
    if (content) {
      content.innerHTML = `
        <div class="empty-placeholder" style="max-width:550px; margin:3rem auto; background:#ffffff;">
          <div class="empty-placeholder-icon">🔒</div>
          <h2 style="font-size:1.25rem; font-weight:800; color:var(--teal-900); margin-bottom:0.5rem;">Authentication Required</h2>
          <p style="color:var(--text-sec); margin-bottom:1.5rem; font-size:0.9rem;">
            Please log in with your official college account to view your bookings and access real-time requisition updates.
          </p>
          <a href="index.html" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.5rem;">
            <span>Go to Login / Sign In</span>
          </a>
        </div>
      `;
    }
    return;
  }

  // Populate Header User Info
  const navUserName = document.getElementById("nav-user-name");
  const navUserRoleBadge = document.getElementById("nav-user-role-badge");
  const userAvatarChar = document.getElementById("user-avatar-char");
  const navLogoutBtn = document.getElementById("nav-logout-btn");

  if (navUserName) navUserName.textContent = currentUser.name;
  if (userAvatarChar) userAvatarChar.textContent = currentUser.name.charAt(0).toUpperCase();
  if (navUserRoleBadge) {
    navUserRoleBadge.textContent = currentUser.role;
    if (currentUser.role === "admin") {
      navUserRoleBadge.style.background = "#fef3c7";
      navUserRoleBadge.style.color = "#92400e";
    }
  }

  if (navLogoutBtn) {
    navLogoutBtn.addEventListener("click", () => {
      ApiService.logout();
      window.location.href = "index.html";
    });
  }

  // Route between Admin Dashboard or Student View
  if (currentUser.role === "admin") {
    await renderAdminDashboard(currentUser);
  } else {
    await renderStudentDashboard(currentUser);
  }
}

// ============================================================================
// STUDENT / FACULTY VIEW
// ============================================================================
async function renderStudentDashboard(user) {
  const heroTitle = document.getElementById("page-hero-title");
  const heroSubtitle = document.getElementById("page-hero-subtitle");
  const statsSummary = document.getElementById("page-stats-summary");
  const content = document.getElementById("bookings-dynamic-content");

  if (heroTitle) heroTitle.innerHTML = `📋 My Venue Requisitions &amp; Bookings`;
  if (heroSubtitle) {
    heroSubtitle.innerHTML = `Welcome, <strong>${user.name}</strong>! Real-time status updates of your facility reservation requests.`;
  }

  try {
    const allBookings = await ApiService.getUserBookings(user.email);

    const pending = allBookings.filter(
      (b) => b.status === "Pending Approval" || b.status === "Pending"
    );
    const confirmed = allBookings.filter(
      (b) => b.status === "Confirmed" || b.status === "Approved"
    );
    const pastOrRejected = allBookings.filter(
      (b) => b.status === "Rejected" || b.status === "Cancelled"
    );

    // Render Stats
    if (statsSummary) {
      statsSummary.innerHTML = `
        <div class="stat-chip">
          <span class="stat-chip-num">${allBookings.length}</span>
          <span class="stat-chip-lbl">Total Requisitions</span>
        </div>
        <div class="stat-chip" style="background:#fffbeb; border-color:#fde68a;">
          <span class="stat-chip-num" style="color:#b45309;"><span class="live-indicator"></span>${pending.length}</span>
          <span class="stat-chip-lbl" style="color:#92400e;">Pending Approval</span>
        </div>
        <div class="stat-chip" style="background:#ecfdf5; border-color:#a7f3d0;">
          <span class="stat-chip-num" style="color:#047857;">${confirmed.length}</span>
          <span class="stat-chip-lbl" style="color:#065f46;">Confirmed</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip-num" style="color:#64748b;">${pastOrRejected.length}</span>
          <span class="stat-chip-lbl">Past / Cancelled</span>
        </div>
      `;
    }

    if (allBookings.length === 0) {
      if (content) {
        content.innerHTML = `
          <div class="empty-placeholder">
            <div class="empty-placeholder-icon">📅</div>
            <h3 style="font-weight:700; color:var(--teal-900); margin-bottom:0.4rem;">No Requisitions Yet</h3>
            <p style="margin-bottom:1.5rem; max-width:450px; margin-left:auto; margin-right:auto;">
              You have not submitted any venue or facility booking requests. Find and book an available campus venue today.
            </p>
            <a href="index.html" class="btn btn-primary">Find &amp; Book a Venue</a>
          </div>
        `;
      }
      return;
    }

    if (content) {
      content.innerHTML = `
        <!-- Section 1: Pending Requisitions -->
        <div class="section-box">
          <div class="section-box-header">
            <div class="section-box-title" style="color:#92400e;">
              <span class="live-indicator"></span>
              <span>Pending Administrative Review (${pending.length})</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-sec);">Awaiting Department Admin Decision</span>
          </div>

          ${
            pending.length === 0
              ? `<div class="empty-placeholder" style="padding:1.5rem; font-size:0.88rem;">
                   ✓ You have no requisitions awaiting review at this time.
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Venue / Facility</th>
                        <th>Department</th>
                        <th>Date &amp; Slot</th>
                        <th>Purpose</th>
                        <th>Real-time Status</th>
                        <th style="text-align:center;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pending
                        .map(
                          (b) => `
                        <tr>
                          <td><strong>#${b.id}</strong></td>
                          <td>
                            <div style="font-weight:700; color:var(--teal-900);">${b.venueCode}</div>
                            <div style="font-size:0.75rem; color:var(--text-sec);">${b.venueName}</div>
                          </td>
                          <td><span style="font-size:0.85rem;">${(b.dept || "").split("(")[0]}</span></td>
                          <td>
                            <div style="font-weight:600;">${b.date}</div>
                            <span class="tag-badge" style="font-size:0.72rem;">${b.timeSlot}</span>
                          </td>
                          <td style="font-size:0.82rem; color:var(--text-sec); max-width:180px;">${b.purpose || "Academic / Event"}</td>
                          <td>
                            <span class="status-pill status-pending" style="font-size:0.75rem; display:inline-flex; align-items:center; gap:0.35rem;">
                              <span class="live-indicator" style="width:6px; height:6px;"></span> Awaiting Approval
                            </span>
                          </td>
                          <td style="text-align:center;">
                            <button class="btn btn-danger btn-sm btn-cancel-booking" data-id="${b.id}" style="padding:0.3rem 0.7rem; font-size:0.75rem;">
                              Cancel Request
                            </button>
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

        <!-- Section 2: Confirmed & Past Bookings -->
        <div class="section-box">
          <div class="section-box-header">
            <div class="section-box-title">
              <span>📋</span>
              <span>Confirmed &amp; Previous Requisitions (${confirmed.length + pastOrRejected.length})</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-sec);">Official Approval Records</span>
          </div>

          ${
            confirmed.length + pastOrRejected.length === 0
              ? `<div class="empty-placeholder" style="padding:1.5rem; font-size:0.88rem;">
                   No previous approved or processed bookings.
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Venue / Facility</th>
                        <th>Department</th>
                        <th>Date &amp; Slot</th>
                        <th>Status</th>
                        <th>Decision / Review Note</th>
                        <th style="text-align:center;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${[...confirmed, ...pastOrRejected]
                        .map((b) => {
                          const isConf = b.status === "Confirmed" || b.status === "Approved";
                          const isRej = b.status === "Rejected";
                          const statusClass = isConf ? "available" : isRej ? "rejected" : "booked";
                          const statusLabel = isConf ? "✓ Confirmed" : isRej ? "✕ Rejected" : b.status;
                          return `
                          <tr>
                            <td><strong>#${b.id}</strong></td>
                            <td>
                              <div style="font-weight:700; color:var(--teal-900);">${b.venueCode}</div>
                              <div style="font-size:0.75rem; color:var(--text-sec);">${b.venueName}</div>
                            </td>
                            <td><span style="font-size:0.85rem;">${(b.dept || "").split("(")[0]}</span></td>
                            <td>
                              <div style="font-weight:600;">${b.date}</div>
                              <span class="tag-badge" style="font-size:0.72rem;">${b.timeSlot}</span>
                            </td>
                            <td>
                              <span class="status-pill ${statusClass}" style="font-size:0.75rem;">
                                ${statusLabel}
                              </span>
                            </td>
                            <td style="font-size:0.78rem; color:var(--text-sec); max-width:200px;">
                              ${
                                b.decisionReason
                                  ? `<strong>Reason:</strong> ${b.decisionReason}`
                                  : b.decisionBy
                                  ? `Reviewed by ${b.decisionBy}`
                                  : isConf
                                  ? "Approved by Administration"
                                  : isRej
                                  ? "Rejected by Administration"
                                  : "Completed"
                              }
                            </td>
                            <td style="text-align:center;">
                              ${
                                isConf
                                  ? `<button class="btn btn-danger btn-sm btn-cancel-booking" data-id="${b.id}" style="padding:0.3rem 0.7rem; font-size:0.75rem;">Cancel Ticket</button>`
                                  : `<span style="color:var(--text-muted); font-size:0.8rem;">&mdash;</span>`
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

      // Attach cancel handlers
      content.querySelectorAll(".btn-cancel-booking").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          if (confirm(`Are you sure you want to cancel requisition #${id}?`)) {
            try {
              await ApiService.cancelBooking(id);
              showToast(`Requisition #${id} cancelled successfully.`);
              renderStudentDashboard(user);
            } catch (err) {
              showToast(err.message || "Failed to cancel booking.", "error");
            }
          }
        });
      });
    }
  } catch (err) {
    if (content) {
      content.innerHTML = `
        <div class="empty-placeholder" style="color:#b91c1c; border-color:#fca5a5; background:#fef2f2;">
          <p>Error retrieving booking records: ${err.message}</p>
        </div>
      `;
    }
  }
}

// ============================================================================
// ADMIN DASHBOARD & APPROVAL PORTAL
// ============================================================================

// The 3 designated Super-Admins who can approve Admin signup requests
const SUPER_ADMIN_EMAILS = [
  "purvav@college.ac.in",
  "mrudulan@college.ac.in",
  "bhargavv@college.ac.in"
];

/**
 * Returns true if the booking's department matches the admin's department.
 * Uses partial/case-insensitive matching to handle slight naming differences.
 */
function bookingMatchesAdminDept(booking, adminUser) {
  if (!booking.dept || !adminUser.dept) return false;
  const bookingDept = booking.dept.toLowerCase().replace(/\(.*?\)/g, "").trim();
  const adminDept = adminUser.dept.toLowerCase().replace(/\(.*?\)/g, "").trim();
  // Match if either contains the other (handles shortened vs full names)
  return bookingDept.includes(adminDept) || adminDept.includes(bookingDept) ||
         bookingDept.split(" ").filter(w => w.length > 3).some(w => adminDept.includes(w));
}

async function renderAdminDashboard(user) {
  const heroTitle = document.getElementById("page-hero-title");
  const heroSubtitle = document.getElementById("page-hero-subtitle");
  const statsSummary = document.getElementById("page-stats-summary");
  const content = document.getElementById("bookings-dynamic-content");

  // Check if this admin is one of the 3 designated super-admins
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());

  if (heroTitle) heroTitle.innerHTML = `🛡️ Department Admin &amp; Approval Portal`;
  if (heroSubtitle) {
    heroSubtitle.innerHTML = `Welcome Administrator <strong>${user.name}</strong> &bull; <span style="color:#047857;">${user.dept || "Campus Administration"}</span><br>
      <span style="font-size:0.82rem; color:var(--text-sec);">
        ${isSuperAdmin
          ? "You are a <strong>Designated Super-Admin</strong>. You can approve Admin signup requests &amp; your department's venue bookings."
          : "You can review and approve venue booking requests for your department."
        }
      </span>`;
  }

  try {
    const allBookings = await ApiService.getAllBookings();

    // VENUE BOOKINGS: Show only THIS admin's department requests
    const myDeptPendingVenues = allBookings.filter((b) => {
      const isPending = b.status === "Pending Approval" || b.status === "Pending";
      if (!isPending) return false;
      return bookingMatchesAdminDept(b, user);
    });

    const myDeptProcessedVenues = allBookings.filter((b) => {
      const isPending = b.status === "Pending Approval" || b.status === "Pending";
      if (isPending) return false;
      return bookingMatchesAdminDept(b, user);
    });

    const myDeptConfirmedVenues = myDeptProcessedVenues.filter(
      (b) => b.status === "Confirmed" || b.status === "Approved"
    );

    // ADMIN SIGNUP REQUESTS: Only super-admins see these
    let pendingAdmins = [];
    if (isSuperAdmin) {
      try {
        pendingAdmins = await ApiService.getPendingAdminRequests();
      } catch (e) {
        pendingAdmins = [];
      }
    }

    // Stats Summary
    if (statsSummary) {
      statsSummary.innerHTML = `
        <div class="stat-chip" style="background:#fffbeb; border-color:#fde68a;">
          <span class="stat-chip-num" style="color:#b45309;">
            <span class="live-indicator"></span>${myDeptPendingVenues.length}
          </span>
          <span class="stat-chip-lbl" style="color:#92400e;">My Dept Pending</span>
        </div>
        ${isSuperAdmin ? `
        <div class="stat-chip" style="background:#fef2f2; border-color:#fecaca;">
          <span class="stat-chip-num" style="color:#b91c1c;">${pendingAdmins.length}</span>
          <span class="stat-chip-lbl" style="color:#991b1b;">Pending Admin Signups</span>
        </div>` : ""}
        <div class="stat-chip" style="background:#ecfdf5; border-color:#a7f3d0;">
          <span class="stat-chip-num" style="color:#047857;">${myDeptConfirmedVenues.length}</span>
          <span class="stat-chip-lbl" style="color:#065f46;">Confirmed Bookings</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip-num">${allBookings.length}</span>
          <span class="stat-chip-lbl">Total Records</span>
        </div>
      `;
    }

    if (content) {
      content.innerHTML = `
        <!-- DEPT INFO BANNER -->
        <div style="background:#f0fdfa; border:1px solid #99f6e4; border-radius:10px; padding:1rem 1.25rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <div style="font-size:0.72rem; font-weight:800; color:#0f766e; text-transform:uppercase; letter-spacing:0.05em;">Your Department Authority</div>
            <div style="font-size:1.02rem; font-weight:800; color:#0c4340;">🛡️ ${user.name} &mdash; ${user.dept || "Campus Administration"}</div>
            <div style="font-size:0.8rem; color:#134e4a; margin-top:0.2rem;">
              You can approve or reject venue reservation requests submitted for facilities in <strong>${(user.dept || "your department").split("(")[0].trim()}</strong>.
              ${isSuperAdmin ? "<br><span style='color:#1d4ed8;'>✦ You are also authorized to approve/reject new Admin account requests.</span>" : ""}
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <span class="tag-badge" style="background:#14b8a6; color:#ffffff; font-weight:700; border:none; padding:0.35rem 0.75rem;">
              ${isSuperAdmin ? "⚡ Super Admin" : "🏢 Dept Admin"}
            </span>
          </div>
        </div>

        <!-- SECTION 1: MY DEPARTMENT'S PENDING VENUE BOOKINGS -->
        <div class="section-box" style="border-top: 4px solid #f59e0b;">
          <div class="section-box-header">
            <div class="section-box-title" style="color:#92400e;">
              <span class="live-indicator"></span>
              <span>Pending Venue Requests — ${(user.dept || "Your Dept").split("(")[0].trim()} (${myDeptPendingVenues.length})</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-sec);">Action Required: Accept or Reject</span>
          </div>
          <p style="font-size:0.82rem; color:var(--text-sec); margin-bottom:0.9rem;">
            Showing only venue booking requests for facilities belonging to <strong>${(user.dept || "your department").split("(")[0].trim()}</strong>.
            Booking requests for other departments are directed to their respective admins.
          </p>

          ${
            myDeptPendingVenues.length === 0
              ? `<div class="empty-placeholder" style="padding:2rem;">
                   <div style="font-size:1.8rem; margin-bottom:0.4rem;">🎉</div>
                   <div style="font-weight:700; color:var(--teal-900);">All clear! No pending requests for your department.</div>
                   <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">No facility requisitions are currently awaiting your review.</div>
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Applicant</th>
                        <th>Venue / Facility</th>
                        <th>Department</th>
                        <th>Date &amp; Slot</th>
                        <th>Purpose</th>
                        <th style="text-align:center; min-width:180px;">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${myDeptPendingVenues
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
                            <div style="font-size:0.75rem; color:var(--text-sec);">${b.venueName}</div>
                          </td>
                          <td><span style="font-size:0.85rem;">${(b.dept || "").split("(")[0]}</span></td>
                          <td>
                            <div style="font-weight:600;">${b.date}</div>
                            <span class="tag-badge" style="font-size:0.72rem;">${b.timeSlot}</span>
                          </td>
                          <td style="font-size:0.8rem; color:var(--text-sec); max-width:170px;">
                            ${b.purpose || "Academic / Event"}
                          </td>
                          <td style="text-align:center; white-space:nowrap;">
                            <button class="btn btn-admin-approve" data-id="${b.id}" style="padding:0.35rem 0.75rem; font-size:0.78rem; font-weight:700; background:#059669; color:#fff; border:none; border-radius:6px; cursor:pointer; margin-right:4px;">
                              ✓ Accept
                            </button>
                            <button class="btn btn-admin-reject" data-id="${b.id}" style="padding:0.35rem 0.75rem; font-size:0.78rem; font-weight:700; background:#dc2626; color:#fff; border:none; border-radius:6px; cursor:pointer;">
                              ✕ Reject
                            </button>
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

        <!-- SECTION 2: PENDING ADMIN SIGNUP REQUESTS (Only for Purva / Mrudula / Bhargav) -->
        ${isSuperAdmin ? `
        <div class="section-box" style="border-top: 4px solid #3b82f6;">
          <div class="section-box-header">
            <div class="section-box-title" style="color:#1e40af;">
              <span>🔑</span>
              <span>Pending Admin Registration Requests (${pendingAdmins.length})</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-sec);">Only visible to: Purva, Mrudula, Bhargav</span>
          </div>
          <p style="font-size:0.82rem; color:var(--text-sec); margin-bottom:1rem;">
            When a user registers with the <strong>Admin</strong> role, their signup request is sent here for authorization.
            Approving their request will activate their admin account.
          </p>

          ${
            pendingAdmins.length === 0
              ? `<div class="empty-placeholder" style="padding:1.5rem; font-size:0.88rem;">
                   ✓ No pending admin signup requests at this time.
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Applicant Name</th>
                        <th>College Email</th>
                        <th>Department</th>
                        <th>Requested On</th>
                        <th>Status</th>
                        <th style="text-align:center; min-width:190px;">Authorize Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pendingAdmins
                        .map(
                          (adm) => `
                        <tr>
                          <td><strong>${adm.name}</strong></td>
                          <td><code>${adm.email}</code></td>
                          <td>${adm.department || adm.dept || "Campus Staff"}</td>
                          <td>${adm.created_at || adm.createdAt ? new Date(adm.created_at || adm.createdAt).toLocaleDateString() : "Recent"}</td>
                          <td>
                            <span class="status-pill status-pending" style="font-size:0.72rem;">⏳ Awaiting Approval</span>
                          </td>
                          <td style="text-align:center; white-space:nowrap;">
                            <button class="btn btn-sm btn-approve-admin" data-id="${adm.id || adm.email}" style="padding:0.35rem 0.8rem; font-size:0.78rem; font-weight:700; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer; margin-right:4px;">
                              ✓ Approve as Admin
                            </button>
                            <button class="btn btn-sm btn-reject-admin" data-id="${adm.id || adm.email}" style="padding:0.35rem 0.75rem; font-size:0.78rem; font-weight:700; background:#ef4444; color:#fff; border:none; border-radius:6px; cursor:pointer;">
                              ✕ Reject
                            </button>
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
        ` : ""}

        <!-- SECTION 3: MY DEPT PROCESSED RECORDS HISTORY -->
        <div class="section-box">
          <div class="section-box-header">
            <div class="section-box-title">
              <span>📚</span>
              <span>Processed Records — ${(user.dept || "Your Dept").split("(")[0].trim()} (${myDeptProcessedVenues.length})</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-sec);">Confirmed, Rejected &amp; Cancelled Requisitions for Your Dept</span>
          </div>

          ${
            myDeptProcessedVenues.length === 0
              ? `<div class="empty-placeholder" style="padding:1.5rem; font-size:0.88rem;">
                   No processed booking records for your department yet.
                 </div>`
              : `<div class="table-wrapper">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>Applicant</th>
                        <th>Venue / Facility</th>
                        <th>Date &amp; Slot</th>
                        <th>Status</th>
                        <th>Decision / Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${myDeptProcessedVenues
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
                              <div style="font-size:0.72rem; color:var(--text-sec);">${b.applicantEmail || ""}</div>
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
                            <td style="font-size:0.75rem; color:var(--text-sec); max-width:200px;">
                              ${
                                b.decisionReason
                                  ? `<strong>Reason:</strong> ${b.decisionReason}`
                                  : b.decisionBy
                                  ? `By ${b.decisionBy}`
                                  : isConf ? "Confirmed" : isRej ? "Rejected" : b.status
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

      // Wire Admin Approve & Reject Venue Request Buttons
      content.querySelectorAll(".btn-admin-approve").forEach((btn) => {
        btn.addEventListener("click", () => {
          const bookingId = btn.getAttribute("data-id");
          const booking = allBookings.find((b) => String(b.id) === String(bookingId));
          if (booking) openAdminDecisionModal(booking, "approve", user);
        });
      });

      content.querySelectorAll(".btn-admin-reject").forEach((btn) => {
        btn.addEventListener("click", () => {
          const bookingId = btn.getAttribute("data-id");
          const booking = allBookings.find((b) => String(b.id) === String(bookingId));
          if (booking) openAdminDecisionModal(booking, "reject", user);
        });
      });

      // Wire Approve / Reject Admin Signup Request Buttons (super-admins only)
      content.querySelectorAll(".btn-approve-admin").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const admId = btn.getAttribute("data-id");
          btn.disabled = true;
          btn.textContent = "Approving...";
          try {
            await ApiService.approveAdminRequest(admId, user.email);
            showToast(`Admin account approved for ${admId}!`);
            renderAdminDashboard(user);
          } catch (err) {
            showToast(err.message || "Failed to approve admin request.", "error");
            btn.disabled = false;
            btn.textContent = "✓ Approve as Admin";
          }
        });
      });

      content.querySelectorAll(".btn-reject-admin").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const admId = btn.getAttribute("data-id");
          if (confirm(`Are you sure you want to reject admin access for ${admId}?`)) {
            btn.disabled = true;
            btn.textContent = "Rejecting...";
            try {
              await ApiService.rejectAdminRequest(admId, user.email);
              showToast(`Admin registration rejected for ${admId}.`);
              renderAdminDashboard(user);
            } catch (err) {
              showToast(err.message || "Failed to reject admin request.", "error");
              btn.disabled = false;
              btn.textContent = "✕ Reject";
            }
          }
        });
      });
    }
  } catch (err) {
    if (content) {
      content.innerHTML = `
        <div class="empty-placeholder" style="color:#b91c1c; border-color:#fca5a5; background:#fef2f2;">
          <p>Error retrieving admin records: ${err.message}</p>
        </div>
      `;
    }
  }
}

// ============================================================================
// ADMIN DECISION & EMAIL MODAL
// ============================================================================
function openAdminDecisionModal(booking, decisionType, adminUser) {
  activeDecisionState = { booking, decisionType, adminUser };

  const modal = document.getElementById("admin-decision-modal");
  const title = document.getElementById("admin-decision-title");
  const summary = document.getElementById("admin-decision-summary");
  const reasonInput = document.getElementById("admin-decision-reason");
  const reasonError = document.getElementById("admin-decision-reason-error");
  const mailFrom = document.getElementById("admin-mail-from");
  const mailTo = document.getElementById("admin-mail-to");
  const mailSubject = document.getElementById("admin-mail-subject");
  const mailBody = document.getElementById("admin-mail-body");

  const isApprove = decisionType === "approve";
  const verb = isApprove ? "ACCEPT" : "REJECT";
  const emoji = isApprove ? "✅" : "❌";

  if (title) title.innerHTML = `${emoji} ${verb} Venue Requisition &amp; Dispatch Email`;

  if (summary) {
    summary.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.84rem;">
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">APPLICANT</span>
          <strong>${booking.bookedBy}</strong> (${booking.applicantRole || "student"})<br>
          <span style="font-size:0.78rem; color:var(--text-sec);">${booking.applicantEmail}</span>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">VENUE / FACILITY</span>
          <strong>${booking.venueCode}</strong> &bull; ${booking.venueName}
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">DATE &amp; SLOT</span>
          ${booking.date} &bull; <span class="tag-badge" style="font-size:0.73rem;">${booking.timeSlot}</span>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:0.75rem; display:block;">PURPOSE</span>
          ${booking.purpose || "Academic / College Event"}
        </div>
      </div>
    `;
  }

  if (reasonInput) reasonInput.value = "";
  if (reasonError) reasonError.style.display = "none";

  const subject = isApprove
    ? `[APPROVED] Venue Requisition: ${booking.venueCode} on ${booking.date} (${booking.timeSlot})`
    : `[REJECTED] Venue Requisition: ${booking.venueCode} on ${booking.date} (${booking.timeSlot})`;

  const bodyIntro = isApprove
    ? `Your facility requisition has been APPROVED by the Administration. The venue is officially confirmed for your scheduled event.`
    : `Your facility requisition has been REJECTED by the Administration. The requested time slot remains open for other academic schedules.`;

  const bodyText = `Dear ${booking.bookedBy},

${bodyIntro}

Requisition Details:
- Venue: ${booking.venueCode} (${booking.venueName})
- Department: ${booking.dept || "Campus Administration"}
- Date: ${booking.date}
- Time Slot: ${booking.timeSlot}
- Requisition ID: #${booking.id}

Official Administrative Remarks:
[Reason entered above will be inserted here]

Dispatched by:
${adminUser.name} (Administrator)
Official Email: ${adminUser.email}
College Venue & Facility Booking System`;

  if (mailFrom) mailFrom.value = `${adminUser.name} <${adminUser.email}>`;
  if (mailTo) mailTo.value = `${booking.bookedBy} <${booking.applicantEmail}>`;
  if (mailSubject) mailSubject.value = subject;
  if (mailBody) mailBody.value = bodyText;

  // Sync reason live to body
  if (reasonInput) {
    reasonInput.oninput = () => {
      const currentReason = reasonInput.value.trim() || "[Reason entered above will be inserted here]";
      if (mailBody) {
        mailBody.value = bodyText.replace("[Reason entered above will be inserted here]", currentReason);
      }
    };
  }

  if (modal) modal.classList.add("active");
}

function closeAdminDecisionModal() {
  const modal = document.getElementById("admin-decision-modal");
  if (modal) modal.classList.remove("active");
  activeDecisionState = null;
}

function setupDecisionModalHandlers() {
  const modal = document.getElementById("admin-decision-modal");
  const closeBtn = document.getElementById("close-admin-decision-btn");
  const cancelBtn = document.getElementById("btn-admin-email-cancel");
  const confirmBtn = document.getElementById("btn-admin-email-confirm");
  const reasonInput = document.getElementById("admin-decision-reason");
  const reasonError = document.getElementById("admin-decision-reason-error");
  const mailSubject = document.getElementById("admin-mail-subject");
  const mailBody = document.getElementById("admin-mail-body");

  if (closeBtn) closeBtn.addEventListener("click", closeAdminDecisionModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeAdminDecisionModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAdminDecisionModal();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!activeDecisionState) return;

      const reason = reasonInput ? reasonInput.value.trim() : "";
      if (!reason) {
        if (reasonError) {
          reasonError.textContent = "Please provide an administrative reason or remarks before confirming.";
          reasonError.style.display = "block";
        }
        if (reasonInput) reasonInput.focus();
        return;
      }

      const { booking, decisionType, adminUser } = activeDecisionState;
      const subject = mailSubject ? mailSubject.value : "";
      const body = mailBody ? mailBody.value : "";

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span class="spinner"></span> Dispatching...`;

      try {
        if (decisionType === "approve") {
          await ApiService.approveBooking(
            booking.id,
            adminUser.name,
            reason,
            adminUser.email,
            subject,
            body
          );
          showToast(`Requisition #${booking.id} ACCEPTED and confirmation notice dispatched.`);
        } else {
          await ApiService.rejectBooking(
            booking.id,
            adminUser.name,
            reason,
            adminUser.email,
            subject,
            body
          );
          showToast(`Requisition #${booking.id} REJECTED and notice dispatched.`);
        }

        closeAdminDecisionModal();
        renderAdminDashboard(adminUser);
      } catch (err) {
        showToast(err.message || "Failed to process decision.", "error");
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<span>Confirm &amp; Send Decision</span>`;
      }
    });
  }
}

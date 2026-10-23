// Campus Venue Booking - Email Preview Modal (Screen 3 from Wireframe & Task 4)
import { API } from '../api.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { toast } from '../components/toast.js';

let activeOverlay = null;

export function openEmailModal(bookingDraft) {
  closeEmailModal(); // Ensure no duplicates

  const user = store.currentUser || store.user || {
    name: 'Student',
    email: 'student@college.ac.in',
    role: 'student',
    department: 'Computer Science'
  };
  const coordinator = bookingDraft.coordinator || {
    name: 'Venue In-Charge',
    email: 'venue.coordinator@college.edu'
  };

  // Generate the formal email draft (as wireframed: "Respected sir, I want classroom... Yours...")
  const emailSubject = `Request for Booking Classroom ${bookingDraft.venueName} on ${bookingDraft.date}`;
  
  const defaultBody = `Respected Sir,

I am writing to formally request the booking of classroom ${bookingDraft.venueName} in the ${bookingDraft.building} block for our departmental activity:

• Date: ${bookingDraft.date}
• Time Slot: ${bookingDraft.timeSlot}
• Purpose / Event: ${bookingDraft.purpose}
• Expected Attendance: ${bookingDraft.expectedAttendance} attendees

We assure that the venue and all equipment will be maintained with the utmost care and vacated promptly after the session.

Kindly review and grant approval for this booking.

Yours sincerely,
${user.name}
${user.role} - ${user.department}
College Roll No: ${user.rollNo || '2023CS0142'}
Phone: ${user.phone || '+91 98765 43210'}`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'email-preview-modal';

  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.25rem;">✉️</span>
          <div>
            <h3 class="modal-title">Email Approval Preview</h3>
            <p style="font-size: 0.75rem; color: var(--text-muted);">
              Review and edit your official booking draft before dispatching
            </p>
          </div>
        </div>
        <button class="modal-close-btn" id="modal-close-x" title="Close modal">✕</button>
      </div>

      <div class="modal-body">
        <!-- Notice matching wireframe: "To book this venue, you need to send email" -->
        <div class="email-notice-box">
          📢 <strong>Campus Booking Protocol:</strong> To finalize the booking for 
          <strong>${bookingDraft.venueName}</strong>, an official request is sent directly to 
          the venue incharge.
        </div>

        <!-- Email Metadata Header -->
        <div class="email-meta-header">
          <div class="email-meta-row">
            <span class="email-meta-label">To:</span>
            <span class="email-meta-value">
              <strong>${coordinator.name}</strong> &lt;${coordinator.email}&gt;
            </span>
          </div>
          <div class="email-meta-row">
            <span class="email-meta-label">From:</span>
            <span class="email-meta-value">${user.name} &lt;${user.email}&gt;</span>
          </div>
          <div class="email-meta-row">
            <span class="email-meta-label">Subject:</span>
            <span class="email-meta-value"><strong>${emailSubject}</strong></span>
          </div>
        </div>

        <!-- Editable Draft Textarea -->
        <div class="form-group" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <label class="form-label" for="email-draft-body">
              <span>Editable Draft Body:</span>
            </label>
            <button type="button" class="btn btn-outline btn-sm" id="reset-email-draft-btn" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">
              ↺ Reset Template
            </button>
          </div>
          <textarea 
            id="email-draft-body" 
            class="email-draft-textarea" 
            rows="10"
          >${defaultBody}</textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="modal-cancel-btn">
          Cancel
        </button>

        <a 
          href="#" 
          id="open-in-gmail-btn" 
          class="btn btn-outline" 
          target="_blank" 
          title="Open in native mail client"
        >
          📧 Open in Gmail
        </a>

        <button type="button" class="btn btn-primary" id="modal-send-btn">
          <span>🚀 Send Email & Confirm Booking</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeOverlay = overlay;

  // Trigger animation
  requestAnimationFrame(() => {
    overlay.classList.add('active');
  });

  // Update mailto link dynamically
  const textarea = overlay.querySelector('#email-draft-body');
  const gmailBtn = overlay.querySelector('#open-in-gmail-btn');

  function updateMailtoLink() {
    const bodyContent = textarea.value;
    const mailtoUrl = `mailto:${encodeURIComponent(coordinator.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(bodyContent)}`;
    gmailBtn.setAttribute('href', mailtoUrl);
  }
  updateMailtoLink();
  textarea.addEventListener('input', updateMailtoLink);

  // Close handlers
  overlay.querySelector('#modal-close-x').addEventListener('click', closeEmailModal);
  overlay.querySelector('#modal-cancel-btn').addEventListener('click', closeEmailModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeEmailModal();
  });

  // Reset draft template
  overlay.querySelector('#reset-email-draft-btn').addEventListener('click', () => {
    textarea.value = defaultBody;
    updateMailtoLink();
    toast.info('Email draft reset to default template.');
  });

  // Submit / Send Button (Wireframe: [Send] button -> leads to "Your successfully booked!")
  const sendBtn = overlay.querySelector('#modal-send-btn');
  sendBtn.addEventListener('click', async () => {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span>⏳ Sending Request...</span>';

    const finalDraft = textarea.value;
    const completeBookingPayload = {
      ...bookingDraft,
      emailSubject,
      emailDraft: finalDraft,
      senderName: user.name,
      senderEmail: user.email,
      coordinatorEmail: coordinator.email
    };

    try {
      const response = await API.submitBooking(completeBookingPayload);
      toast.success(`Booking request sent to ${coordinator.email}`);
      closeEmailModal();
      
      // Navigate to Screen 4: Success Screen
      router.navigate(`/success?id=${response.booking.id}`);
    } catch (err) {
      toast.error('Failed to submit booking. Please try again.');
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<span>🚀 Send Email & Confirm Booking</span>';
    }
  });
}

export function closeEmailModal() {
  if (activeOverlay) {
    activeOverlay.classList.remove('active');
    setTimeout(() => {
      if (activeOverlay && activeOverlay.parentNode) {
        activeOverlay.parentNode.removeChild(activeOverlay);
      }
      activeOverlay = null;
    }, 200);
  }
}

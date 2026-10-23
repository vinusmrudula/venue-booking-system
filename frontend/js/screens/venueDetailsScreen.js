// Campus Venue Booking - Venue Details Screen (Screen 2 from Wireframe)
import { API } from '../api.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { openEmailModal } from './emailModal.js';
import { toast } from '../components/toast.js';

export async function renderVenueDetailsScreen() {
  const container = document.getElementById('app-view');
  
  // Extract venue ID from hash query params, default to 'nc-27'
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.split('?')[1] || '');
  const venueId = urlParams.get('id') || 'nc-27';

  // Fetch venue details
  const venue = await API.getVenueById(venueId);

  if (!venue) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h3>Venue Not Found</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">
          Could not locate venue with ID: <strong>${venueId}</strong>
        </p>
        <button class="btn btn-primary" onclick="window.location.hash='#/results'">
          Back to Results
        </button>
      </div>
    `;
    return;
  }

  // Save selected venue in store
  store.setSelectedVenue(venue);

  const selectedDate = store.searchFilters.date || new Date().toISOString().split('T')[0];
  const isAvailable = venue.status === 'available';

  container.innerHTML = `
    <div class="venue-details-container">
      <!-- Breadcrumb nav -->
      <div class="back-nav-bar">
        <button class="btn btn-secondary btn-sm" id="back-to-results-btn">
          ← Back to Results
        </button>
      </div>

      <div class="details-card">
        <!-- Hero banner -->
        <div class="details-hero">
          <div>
            <span class="badge ${isAvailable ? 'badge-available' : 'badge-occupied'}" style="background: rgba(255,255,255,0.2); color: white; border-color: rgba(255,255,255,0.4); margin-bottom: 0.5rem;">
              ● ${isAvailable ? 'Available for Reservation' : 'Currently Occupied'}
            </span>
            <h1 class="details-title">${venue.code || venue.name}</h1>
            <p class="details-subtitle">${venue.building} • ${venue.floor}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 2rem; font-weight: 800;">${venue.capacity}</div>
            <div style="font-size: 0.8rem; opacity: 0.85; text-transform: uppercase; font-weight: 600;">Seating Capacity</div>
          </div>
        </div>

        <div class="details-body">
          <!-- Left Column: Venue Specifications (matching wireframe location, classroom, capacity) -->
          <div class="spec-list">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">
              Venue Specifications
            </h3>

            <div class="spec-item">
              <span class="spec-icon">📍</span>
              <div class="spec-content">
                <span class="spec-label">Location</span>
                <span class="spec-value">${venue.building} (${venue.floor})</span>
              </div>
            </div>

            <div class="spec-item">
              <span class="spec-icon">🏫</span>
              <div class="spec-content">
                <span class="spec-label">Classroom / Venue Code</span>
                <span class="spec-value">${venue.name}</span>
              </div>
            </div>

            <div class="spec-item">
              <span class="spec-icon">👥</span>
              <div class="spec-content">
                <span class="spec-label">Capacity</span>
                <span class="spec-value">${venue.capacity} Students / Attendees</span>
              </div>
            </div>

            <div class="spec-item">
              <span class="spec-icon">🏛️</span>
              <div class="spec-content">
                <span class="spec-label">Department</span>
                <span class="spec-value">${venue.department}</span>
              </div>
            </div>

            <div class="spec-item">
              <span class="spec-icon">👤</span>
              <div class="spec-content">
                <span class="spec-label">Venue In-Charge</span>
                <span class="spec-value">${venue.coordinator.name}</span>
                <span style="font-size: 0.8rem; color: var(--primary);">${venue.coordinator.email}</span>
              </div>
            </div>

            <div style="margin-top: 0.5rem;">
              <span class="spec-label" style="display: block; margin-bottom: 0.5rem;">Equipped Amenities</span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                ${venue.amenities.map(a => `
                  <span class="amenity-tag" style="background: var(--bg-subtle); padding: 0.35rem 0.65rem; font-weight: 600;">
                    ✓ ${a}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column: Booking Configuration & "Book Now" Button -->
          <div class="booking-form-panel">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">
              Reserve This Venue
            </h3>

            <form id="venue-booking-form">
              <!-- Selected Date -->
              <div class="form-group">
                <label class="form-label" for="booking-date">
                  <span class="required">*</span>
                  <span>Date for Booking</span>
                </label>
                <input 
                  type="date" 
                  id="booking-date" 
                  class="form-control" 
                  value="${selectedDate}" 
                  required
                />
              </div>

              <!-- Available Time Slots -->
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  <span>Select Time Slot</span>
                </label>
                
                ${venue.availableSlots && venue.availableSlots.length > 0 ? `
                  <div class="slot-selection-grid">
                    ${venue.availableSlots.map((slot, index) => `
                      <label class="slot-radio-card">
                        <input 
                          type="radio" 
                          name="time-slot" 
                          value="${slot}" 
                          ${index === 0 ? 'checked' : ''} 
                          required
                        />
                        <span class="slot-label">${slot}</span>
                      </label>
                    `).join('')}
                  </div>
                ` : `
                  <p style="color: var(--danger); font-size: 0.85rem; padding: 0.75rem; background: var(--danger-light); border-radius: var(--radius-sm);">
                    No slots available for this venue on the selected date.
                  </p>
                `}
              </div>

              <!-- Purpose of Booking -->
              <div class="form-group">
                <label class="form-label" for="booking-purpose">
                  <span class="required">*</span>
                  <span>Purpose / Event Name</span>
                </label>
                <input 
                  type="text" 
                  id="booking-purpose" 
                  class="form-control" 
                  placeholder="e.g. Machine Learning Workshop & Hands-on"
                  value="Machine Learning Workshop & Lab"
                  required
                />
              </div>

              <!-- Expected Attendees -->
              <div class="form-group">
                <label class="form-label" for="booking-attendees">
                  <span>Expected Attendees</span>
                </label>
                <input 
                  type="number" 
                  id="booking-attendees" 
                  class="form-control" 
                  min="1" 
                  max="${venue.capacity}" 
                  value="${Math.min(65, venue.capacity)}"
                />
              </div>

              <!-- Book Now Action (Wireframe: [Book Now] button) -->
              <div style="margin-top: 1.5rem;">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg" 
                  style="width: 100%;" 
                  ${!isAvailable || !venue.availableSlots.length ? 'disabled' : ''}
                  id="details-book-now-btn"
                >
                  Book Now →
                </button>
                <p style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 0.65rem;">
                  ℹ️ Per campus policy, an approval email will be prepared for the venue coordinator.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Back button handler
  container.querySelector('#back-to-results-btn')?.addEventListener('click', () => {
    router.navigate('/results');
  });

  const bookNowBtn = container.querySelector('#details-book-now-btn');
  const form = container.querySelector('#venue-booking-form');

  // Intercept click on Book Now button if not signed in
  bookNowBtn?.addEventListener('click', (e) => {
    if (!store.isAuthenticated()) {
      e.preventDefault();
      e.stopPropagation();
      openAuthRequiredModal(venue);
    }
  });

  // Booking Form Submission -> Opens Screen 3: Email Preview Modal (or Auth modal if unauthenticated)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!store.isAuthenticated()) {
      openAuthRequiredModal(venue);
      return;
    }

    const selectedSlotEl = form.querySelector('input[name="time-slot"]:checked');
    if (!selectedSlotEl) {
      toast.error('Please select an available time slot.');
      return;
    }

    const bookingDraft = {
      venueId: venue.id,
      venueName: venue.name,
      building: venue.building,
      department: venue.department,
      coordinator: venue.coordinator,
      date: form.querySelector('#booking-date').value,
      timeSlot: selectedSlotEl.value,
      purpose: form.querySelector('#booking-purpose').value,
      expectedAttendance: parseInt(form.querySelector('#booking-attendees').value, 10) || venue.capacity
    };

    // Open Screen 3: Email Preview Modal
    openEmailModal(bookingDraft);
  });
}

/**
 * Modal popup displayed when unauthenticated user attempts to book a venue
 */
export function openAuthRequiredModal(venue) {
  // Remove existing modal if present
  const existing = document.getElementById('auth-required-modal');
  if (existing) existing.remove();

  const venueName = venue?.name || venue?.code || 'this venue';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'auth-required-modal';

  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 440px; text-align: center; padding: 2.25rem 2rem;">
      <div style="width: 68px; height: 68px; background: var(--mint-light); border: 2.5px solid var(--mint-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.25rem; box-shadow: 0 4px 14px rgba(20, 184, 166, 0.2);">
        🔒
      </div>

      <h3 style="font-size: 1.45rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem; letter-spacing: -0.01em;">
        Sign In Required
      </h3>
      
      <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.75rem; line-height: 1.55;">
        You are not signed in. An official college account is required to reserve <strong>${venueName}</strong> and generate the formal approval email.
      </p>

      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
        <button class="btn btn-primary btn-block btn-lg" id="auth-modal-signin-btn">
          Sign In to Your Account
        </button>
        <button class="btn btn-secondary btn-block btn-lg" id="auth-modal-register-btn">
          Create an Account
        </button>
      </div>

      <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); width: 100%;">
        <button type="button" class="btn btn-outline btn-sm" id="auth-modal-cancel-btn" style="border: none; color: var(--text-muted); cursor: pointer;">
          ← Return to Venue Details
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('active');
  });

  const closeModal = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('#auth-modal-signin-btn').addEventListener('click', () => {
    closeModal();
    router.navigate('/signin');
  });

  overlay.querySelector('#auth-modal-register-btn').addEventListener('click', () => {
    closeModal();
    router.navigate('/register');
  });

  overlay.querySelector('#auth-modal-cancel-btn').addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

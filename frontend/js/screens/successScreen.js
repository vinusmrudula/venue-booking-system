// Campus Venue Booking - Success Screen (Screen 4 from Wireframe: "Your successfully booked!")
import { store } from '../store.js';
import { router } from '../router.js';
import { toast } from '../components/toast.js';

export function renderSuccessScreen() {
  const container = document.getElementById('app-view');
  
  // Extract booking ID from hash or fallback to store.lastBooking or most recent booking
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.split('?')[1] || '');
  const bookingId = urlParams.get('id');

  let booking = null;
  if (bookingId) {
    booking = store.bookings.find(b => b.id === bookingId);
  }
  if (!booking && store.lastBooking) {
    booking = store.lastBooking;
  }
  if (!booking && store.bookings.length > 0) {
    booking = store.bookings[0];
  }

  // Fallback defaults if accessed directly
  if (!booking) {
    booking = {
      id: 'VB-2026-9921',
      venueName: 'NC 27',
      building: 'New CSE',
      department: 'Computer Science',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '09:00 AM - 11:00 AM',
      purpose: 'Technical Seminar & Hands-on Lab',
      expectedAttendance: 65,
      status: 'Confirmed'
    };
  }

  container.innerHTML = `
    <div class="success-screen-wrapper">
      <!-- Animated Check Icon -->
      <div class="success-badge-icon">
        ✓
      </div>

      <!-- Headline matching wireframe: "Your successfully booked!" -->
      <h1 class="success-headline">You're Successfully Booked!</h1>
      <p class="success-subtext">
        Your reservation request has been dispatched to the venue coordinator. A copy has been saved to your account.
      </p>

      <!-- Confirmation Ticket Card -->
      <div class="confirmation-ticket">
        <div class="ticket-header">
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">
              Booking Reference
            </span>
            <div class="ticket-id">${booking.id}</div>
          </div>
          <span class="badge badge-available">
            ● Status: ${booking.status || 'Confirmed'}
          </span>
        </div>

        <div class="ticket-details-grid">
          <div class="ticket-row">
            <span class="ticket-label">Venue</span>
            <span class="ticket-value">🏫 ${booking.venueName}</span>
          </div>

          <div class="ticket-row">
            <span class="ticket-label">Location</span>
            <span class="ticket-value">📍 ${booking.building}</span>
          </div>

          <div class="ticket-row">
            <span class="ticket-label">Date</span>
            <span class="ticket-value">📅 ${booking.date}</span>
          </div>

          <div class="ticket-row">
            <span class="ticket-label">Time Slot</span>
            <span class="ticket-value">🕒 ${booking.timeSlot}</span>
          </div>

          <div class="ticket-row" style="grid-column: span 2;">
            <span class="ticket-label">Purpose of Reservation</span>
            <span class="ticket-value">${booking.purpose || 'Departmental Session'}</span>
          </div>

          <div class="ticket-row" style="grid-column: span 2;">
            <span class="ticket-label">Booked By</span>
            <span class="ticket-value" style="font-size: 0.85rem; font-weight: 500;">
              ${(store.currentUser || store.user)?.name || 'Student'} (${(store.currentUser || store.user)?.department || 'Engineering'}) • ${(store.currentUser || store.user)?.email || 'student@college.ac.in'}
            </span>
          </div>
        </div>

        <div style="background: var(--bg-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
          <span>📧 Notification sent to In-charge</span>
          <button class="btn btn-outline btn-sm" id="copy-ticket-info-btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
            📋 Copy Info
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="success-actions">
        <button class="btn btn-primary btn-lg" id="go-to-my-bookings-btn">
          📑 View in My Bookings
        </button>
        <button class="btn btn-secondary btn-lg" id="book-another-btn">
          🔍 Book Another Venue
        </button>
      </div>
    </div>
  `;

  // Attach button events
  container.querySelector('#go-to-my-bookings-btn').addEventListener('click', () => {
    router.navigate('/my-bookings');
  });

  container.querySelector('#book-another-btn').addEventListener('click', () => {
    router.navigate('/results');
  });

  container.querySelector('#copy-ticket-info-btn').addEventListener('click', () => {
    const text = `Booking Confirmed: ${booking.venueName} (${booking.building}) on ${booking.date} [${booking.timeSlot}]. Ref: ${booking.id}`;
    navigator.clipboard?.writeText(text);
    toast.success('Booking details copied to clipboard!');
  });
}

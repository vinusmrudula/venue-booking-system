// Campus Venue Booking - My Bookings Screen (Task 4 & Wireframe "Prev Booking")
import { store } from '../store.js';
import { router } from '../router.js';
import { toast } from '../components/toast.js';

let activeFilter = 'all';

export function renderMyBookingsScreen() {
  const container = document.getElementById('app-view');
  const allBookings = store.bookings;

  const filtered = allBookings.filter(b => {
    if (activeFilter === 'all') return true;
    return (b.status || '').toLowerCase() === activeFilter.toLowerCase();
  });

  container.innerHTML = `
    <div class="my-bookings-container">
      <div class="my-bookings-header">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800;">My Venue Bookings</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">
            Manage and review all your classroom and auditorium reservations.
          </p>
        </div>

        <button class="btn btn-primary btn-sm" id="new-booking-btn">
          ➕ Book New Venue
        </button>
      </div>

      <!-- Filter tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        <button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
          All (${allBookings.length})
        </button>
        <button class="filter-chip ${activeFilter === 'confirmed' ? 'active' : ''}" data-filter="confirmed">
          Confirmed (${allBookings.filter(b => (b.status || '').toLowerCase() === 'confirmed').length})
        </button>
        <button class="filter-chip ${activeFilter === 'cancelled' ? 'active' : ''}" data-filter="cancelled">
          Cancelled (${allBookings.filter(b => (b.status || '').toLowerCase() === 'cancelled').length})
        </button>
      </div>

      <!-- Bookings List -->
      <div class="bookings-list">
        ${filtered.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3>No Reservations Found</h3>
            <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">
              You do not have any bookings in this category.
            </p>
            <button class="btn btn-primary" onclick="window.location.hash='#/results'">
              Find & Book a Classroom
            </button>
          </div>
        ` : filtered.map(b => {
          const isCancelled = (b.status || '').toLowerCase() === 'cancelled';
          return `
            <div class="booking-item-card" style="${isCancelled ? 'opacity: 0.65; background: #fbfbfb;' : ''}">
              <div class="booking-item-left">
                <div class="booking-item-icon" style="${isCancelled ? 'background: #f1f5f9; color: #94a3b8;' : ''}">
                  ${b.venueName.toLowerCase().includes('audi') ? '🎭' : '🏫'}
                </div>
                <div class="booking-item-info">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="booking-item-title">${b.venueName}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">(${b.building})</span>
                    <span class="badge ${isCancelled ? 'badge-occupied' : 'badge-available'}">
                      ${b.status || 'Confirmed'}
                    </span>
                  </div>

                  <div class="booking-item-meta" style="margin-top: 0.25rem;">
                    <span>📅 <strong>${b.date}</strong></span>
                    <span>•</span>
                    <span>🕒 <strong>${b.timeSlot}</strong></span>
                    <span>•</span>
                    <span style="font-family: monospace;">Ref: ${b.id}</span>
                  </div>

                  <div style="font-size: 0.8rem; color: var(--text-main); margin-top: 0.35rem;">
                    Purpose: <em>${b.purpose || 'Session'}</em>
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem; align-items: center;">
                ${!isCancelled ? `
                  <button class="btn btn-outline btn-sm cancel-booking-btn" data-id="${b.id}" style="color: var(--danger); border-color: var(--danger);">
                    Cancel
                  </button>
                ` : `
                  <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">
                    Booking Cancelled
                  </span>
                `}
                <button class="btn btn-secondary btn-sm view-draft-btn" data-id="${b.id}">
                  View Email
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach handlers
  container.querySelector('#new-booking-btn')?.addEventListener('click', () => {
    router.navigate('/results');
  });

  // Filter tabs
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.getAttribute('data-filter');
      renderMyBookingsScreen();
    });
  });

  // Cancel booking buttons
  container.querySelectorAll('.cancel-booking-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`Are you sure you want to cancel booking ${id}?`)) {
        store.cancelBooking(id);
        toast.info(`Booking ${id} was cancelled.`);
        renderMyBookingsScreen();
      }
    });
  });

  // View Email draft button
  container.querySelectorAll('.view-draft-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = store.bookings.find(b => b.id === id);
      if (item && item.emailDraft) {
        alert(`Dispatched Email Draft for ${item.venueName}:\n\n${item.emailDraft}`);
      } else {
        toast.info(`Official approval email was submitted for ${item?.venueName || id}.`);
      }
    });
  });
}

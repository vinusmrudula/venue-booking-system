// Campus Venue Booking - Results Screen (Task 2 & Task 3, Wireframe: Cards grouped by Building & Dept)
import { API } from '../api.js';
import { store } from '../store.js';
import { router } from '../router.js';

export async function renderResultsScreen() {
  const container = document.getElementById('app-view');
  const filters = store.searchFilters;

  // Render initial loading state
  container.innerHTML = `
    <div style="text-align: center; padding: 4rem 1rem;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem; animation: spin 1s linear infinite;">⏳</div>
      <p style="font-weight: 600; color: var(--text-muted);">Checking classroom availability across campus...</p>
      <p style="font-size: 0.8rem; color: var(--text-subtle); margin-top: 0.25rem;">
        Source: ${store.apiMode === 'live' ? 'Live /availability API' : 'Local Mock Data'}
      </p>
    </div>
  `;

  // Fetch data via shared API helper
  const { data: groups, source } = await API.getAvailability(filters);

  // Build Results UI
  const totalVenues = groups.reduce((acc, g) => acc + g.venues.length, 0);

  let html = `
    <!-- Top summary bar -->
    <div class="results-header-bar">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <h2 style="font-size: 1.4rem; font-weight: 800;">Available Venues</h2>
          <span class="badge ${source === 'live' ? 'badge-available' : 'badge-building'}">
            ${source === 'live' ? '● Live API' : '● Mock Data'}
          </span>
        </div>
        <p class="results-summary-info">
          <span>Date: <strong>${filters.date || 'Today'}</strong></span>
          <span>•</span>
          <span>Min Capacity: <strong>${filters.capacity || 0}+ seats</strong></span>
          <span>•</span>
          <span>Found <strong>${totalVenues}</strong> venues</span>
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary btn-sm" id="results-modify-search-btn">
          ✏️ Modify Search
        </button>
      </div>
    </div>

    <!-- Filter chips -->
    <div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button class="filter-chip ${(filters.category || filters.type || 'all') === 'all' ? 'active' : ''}" data-type="all">
        All Venues
      </button>
      <button class="filter-chip ${(filters.category || filters.type) === 'classroom' ? 'active' : ''}" data-type="classroom">
        🏫 Classrooms
      </button>
      <button class="filter-chip ${(filters.category || filters.type) === 'audi' ? 'active' : ''}" data-type="audi">
        🎭 Auditoriums
      </button>
      <button class="filter-chip ${(filters.category || filters.type) === 'seminar' ? 'active' : ''}" data-type="seminar">
        🎤 Seminar Halls
      </button>
      <button class="filter-chip ${(filters.category || filters.type) === 'lab' ? 'active' : ''}" data-type="lab">
        💻 Computer Labs
      </button>
    </div>
  `;

  if (groups.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-state-icon">🏢</div>
        <h3>No Venues Found</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">
          No classrooms or auditoriums matched your current filter criteria.
        </p>
        <button class="btn btn-primary" id="empty-reset-filters-btn">
          Clear Filters & Show All
        </button>
      </div>
    `;
    container.innerHTML = html;

    container.querySelector('#empty-reset-filters-btn')?.addEventListener('click', () => {
      store.setSearchFilters({ type: 'all', department: 'All Departments', capacity: 0 });
      renderResultsScreen();
    });
    return;
  }

  // Render grouped sections (Building & Department) as shown in wireframe
  // Wireframe: Header "New CSE" -> NC 27 Available, NC 28 -> Header "Electrical" -> etc.
  groups.forEach(group => {
    html += `
      <section class="building-group-section">
        <div class="building-group-header">
          <div class="building-name">
            <span>🏛️</span>
            <span>${group.building}</span>
          </div>
          <div class="building-dept-tag">
            Department: <strong>${group.department}</strong>
          </div>
        </div>

        <div class="venue-cards-grid">
          ${group.venues.map(venue => {
            const isAvail = venue.status === 'available';
            return `
              <div class="venue-card ${!isAvail ? 'occupied-card' : ''}" data-id="${venue.id}">
                <div>
                  <div class="venue-card-header">
                    <div>
                      <h4 class="venue-code">${venue.code || venue.name}</h4>
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${venue.floor}</span>
                    </div>
                    <span class="badge ${isAvail ? 'badge-available' : 'badge-occupied'}">
                      ${isAvail ? 'Available' : 'Occupied'}
                    </span>
                  </div>

                  <div class="venue-meta">
                    <div class="venue-meta-row">
                      <span>👥</span>
                      <span>Capacity: <strong>${venue.capacity} seats</strong></span>
                    </div>
                    <div class="venue-meta-row">
                      <span>🏷️</span>
                      <span>Type: <strong>${venue.typeName || venue.type}</strong></span>
                    </div>
                  </div>

                  <div class="venue-amenities-tags">
                    ${venue.amenities.slice(0, 3).map(a => `
                      <span class="amenity-tag">${a}</span>
                    `).join('')}
                    ${venue.amenities.length > 3 ? `<span class="amenity-tag">+${venue.amenities.length - 3}</span>` : ''}
                  </div>
                </div>

                <div class="venue-card-footer">
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    ${isAvail ? `🕒 ${venue.availableSlots.length} slots open` : '🔒 Fully booked today'}
                  </div>
                  <button class="btn ${isAvail ? 'btn-primary' : 'btn-secondary'} btn-sm view-venue-btn" data-id="${venue.id}">
                    ${isAvail ? 'Book Now →' : 'View Details'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;

  // Attach card click handlers
  container.querySelectorAll('.venue-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const venueId = card.getAttribute('data-id');
      router.navigate(`/venue?id=${venueId}`);
    });
  });

  // Filter chips
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.getAttribute('data-type');
      store.setSearchFilters({ type });
      renderResultsScreen();
    });
  });

  // Modify Search button
  container.querySelector('#results-modify-search-btn')?.addEventListener('click', () => {
    router.navigate('/');
  });
}

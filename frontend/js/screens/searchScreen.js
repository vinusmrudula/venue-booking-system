// Campus Venue Booking - Search Screen (Screen 4 from Wireframe & Associate Integration)
import { store } from '../store.js';
import { router } from '../router.js';
import { CONFIG } from '../config.js';

export function renderSearchScreen() {
  const container = document.getElementById('app-view');
  const filters = store.searchFilters;
  const user = store.currentUser || CONFIG.DEFAULT_USER;

  container.innerHTML = `
    <!-- Top Welcome & Search Header -->
    <div class="search-header-bar">
      <div>
        <h2 class="page-title">
          👋 Welcome, ${user.name || 'Student'}!
        </h2>
        <p class="page-subtitle" style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
          Find and reserve classrooms, seminar halls, auditoriums, and labs across campus.
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="btn btn-secondary btn-sm" id="quick-prev-bookings-btn">
          📑 Prev Booking
        </button>
      </div>
    </div>

    <!-- Search Form Card -->
    <div class="search-hero-card">
      <div class="search-hero-header">
        <div>
          <h3 class="search-title">🔍 Check Venue Availability</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">
            Select facility category, department, and target date to inspect open rooms.
          </p>
        </div>
        <span class="badge badge-available">
          ● Live Verification Active
        </span>
      </div>

      <form id="search-form">
        <div class="search-form-grid">
          <!-- 1. Category (Classroom / Audi / Seminar / Lab) -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="filter-category">
              <span>* Classroom / Audi</span>
            </label>
            <select class="form-control" id="filter-category" required>
              ${CONFIG.CATEGORIES.map(c => `
                <option value="${c.code}" ${(filters.category || 'classroom') === c.code ? 'selected' : ''}>${c.label}</option>
              `).join('')}
            </select>
          </div>

          <!-- 2. Branch / Department -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="filter-dept">
              <span>Branch / Department</span>
            </label>
            <select class="form-control" id="filter-dept">
              ${CONFIG.DEPARTMENTS.map(dept => `
                <option value="${dept.code}" ${(filters.department || 'all') === dept.code ? 'selected' : ''}>${dept.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- 3. Min Capacity -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="filter-capacity">
              <span>Min. Capacity</span>
            </label>
            <select class="form-control" id="filter-capacity">
              <option value="0" ${filters.capacity == 0 ? 'selected' : ''}>Any Capacity</option>
              <option value="50" ${filters.capacity == 50 ? 'selected' : ''}>50+ seats</option>
              <option value="70" ${filters.capacity == 70 ? 'selected' : ''}>70+ seats</option>
              <option value="100" ${filters.capacity == 100 ? 'selected' : ''}>100+ seats</option>
              <option value="200" ${filters.capacity == 200 ? 'selected' : ''}>200+ seats</option>
            </select>
          </div>

          <!-- 4. Date Picker -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="filter-date">
              <span class="required">*</span>
              <span>Date</span>
            </label>
            <input 
              type="date" 
              class="form-control" 
              id="filter-date" 
              value="${filters.date || store.getLocalDateString()}" 
              required
            />
          </div>
        </div>

        <div class="search-actions-row">
          <div style="font-size: 0.85rem; color: var(--text-muted); align-self: center;">
            Tip: Rooms marked with <span class="badge badge-available" style="padding: 0.15rem 0.5rem; font-size: 0.72rem;">Available</span> can be reserved immediately.
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary" id="search-reset-btn">
              Reset
            </button>
            <button type="submit" class="btn btn-primary btn-lg" id="check-availability-btn">
              Check Availability →
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Quick Shortcuts Card -->
    <div style="background: white; border: 1.5px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
      <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: var(--primary); display: flex; align-items: center; gap: 0.4rem;">
        ⚡ Frequently Booked Campus Venues
      </h3>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm quick-venue-jump" data-venue="nc-27">
          🏫 NC 27 - New CSE (75 seats)
        </button>
        <button class="btn btn-outline btn-sm quick-venue-jump" data-venue="nc-28">
          🏫 NC 28 - New CSE (75 seats)
        </button>
        <button class="btn btn-outline btn-sm quick-venue-jump" data-venue="ee-101">
          ⚡ EE 101 - Electrical (65 seats)
        </button>
        <button class="btn btn-outline btn-sm quick-venue-jump" data-venue="cog-lab">
          💻 Cognizant Innovation Lab (70 seats)
        </button>
        <button class="btn btn-outline btn-sm quick-venue-jump" data-venue="ac-101">
          🏛️ AC 101 - Academic Complex (120 seats)
        </button>
        <button class="btn btn-outline btn-sm quick-venue-jump" data-venue="main-audi">
          🎭 Main Auditorium (900 seats)
        </button>
      </div>
    </div>
  `;

  // Event handlers
  const form = container.querySelector('#search-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const category = container.querySelector('#filter-category').value;
    const department = container.querySelector('#filter-dept').value;
    const capacity = parseInt(container.querySelector('#filter-capacity').value, 10) || 0;
    const date = container.querySelector('#filter-date').value;

    store.setSearchFilters({ category, type: category, department, capacity, date });
    router.navigate('/results');
  });

  // Prev Booking button (wireframe)
  container.querySelector('#quick-prev-bookings-btn').addEventListener('click', () => {
    router.navigate('/my-bookings');
  });

  // Reset button
  container.querySelector('#search-reset-btn').addEventListener('click', () => {
    store.setSearchFilters({
      category: 'classroom',
      type: 'classroom',
      department: 'all',
      capacity: 0,
      date: store.getLocalDateString()
    });
    renderSearchScreen();
  });

  // Quick jump buttons
  container.querySelectorAll('.quick-venue-jump').forEach(btn => {
    btn.addEventListener('click', () => {
      const venueId = btn.getAttribute('data-venue');
      router.navigate(`/venue?id=${venueId}`);
    });
  });
}

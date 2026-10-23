// Campus Venue Booking - Landing Screen (Screen 1 from Wireframe & Associate Integration)
import { router } from '../router.js';
import { store } from '../store.js';

export function renderLandingScreen() {
  const container = document.getElementById('app-view');

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: calc(80vh - 80px); padding: 1.5rem 1rem;">
      <div class="landing-card">
        <img src="assets/logo.jpg" alt="book it - Facility Booking App" class="landing-logo" onerror="this.style.display='none'" />
        <h1 style="font-size: 2rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem; letter-spacing: -0.02em;">
          book it
        </h1>
        <span class="landing-tagline">College Facility &amp; Venue Booking</span>

        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; max-width: 340px; line-height: 1.5;">
          Quickly reserve classrooms, auditoriums, seminar halls, and computer labs across all college departments.
        </p>

        <div class="landing-buttons">
          <button class="btn btn-primary btn-block btn-lg" id="landing-create-acc-btn">
            Create an Account
          </button>
          <button class="btn btn-secondary btn-block btn-lg" id="landing-signin-btn">
            Sign In
          </button>
        </div>

        <div style="margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); width: 100%; display: flex; justify-content: center; gap: 1rem; font-size: 0.8rem; color: var(--text-muted);">
          <span>🏛️ 13 Campus Departments</span>
          <span>•</span>
          <span>⚡ Live Availability</span>
        </div>
      </div>
    </div>
  `;

  // Attach button event handlers
  container.querySelector('#landing-create-acc-btn').addEventListener('click', () => {
    router.navigate('/register');
  });

  container.querySelector('#landing-signin-btn').addEventListener('click', () => {
    router.navigate('/signin');
  });
}

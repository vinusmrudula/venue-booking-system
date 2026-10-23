// Campus Venue Booking - Header Navbar Component
import { store } from '../store.js';
import { router } from '../router.js';
import { toast } from './toast.js';

export function renderNavbar() {
  const header = document.getElementById('app-header');
  if (!header) return;

  const currentRoute = window.location.hash.slice(1).split('?')[0] || '/';
  const isAuth = store.isAuthenticated();
  const user = store.currentUser;
  const bookingsCount = store.bookings.length;
  const isMock = store.apiMode === 'mock';

  header.innerHTML = `
    <div class="header-container">
      <a href="#/" class="brand-section">
        <img src="assets/logo.jpg" alt="book it" class="brand-logo-img" style="width: 38px; height: 38px; border-radius: var(--radius-md); object-fit: cover; box-shadow: 0 2px 6px rgba(15, 76, 92, 0.2);" onerror="this.outerHTML='<div class=\\'brand-logo\\'>🏫</div>'" />
        <div>
          <div class="brand-title">book it</div>
          <div class="brand-subtitle">College Facility Booking</div>
        </div>
      </a>

      ${isAuth ? `
        <!-- Authenticated Navigation Links -->
        <nav class="nav-links">
          <a href="#/search" class="nav-item ${currentRoute === '/' || currentRoute === '/search' ? 'active' : ''}">
            🔍 Find Venue
          </a>
          <a href="#/results" class="nav-item ${currentRoute === '/results' ? 'active' : ''}">
            📋 Results
          </a>
          <a href="#/my-bookings" class="nav-item ${currentRoute === '/my-bookings' ? 'active' : ''}">
            📑 Prev Booking 
            <span class="badge-count" id="nav-bookings-count">${bookingsCount}</span>
          </a>
        </nav>

        <div class="header-actions">
          <!-- API Mode Switcher (Task 3 helper) -->
          <button id="toggle-api-mode-btn" class="api-mode-pill" title="Click to toggle Mock vs Live /availability mode">
            <span class="api-mode-dot ${isMock ? 'mock' : ''}"></span>
            <span id="api-mode-text">${isMock ? 'Mock API' : 'Live: /availability'}</span>
          </button>

          <!-- User Profile Badge -->
          <div class="user-profile-badge" title="Logged in as ${user.name} (${user.email})">
            <div class="user-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
            <span class="user-name">${user.name || 'User'}</span>
          </div>

          <!-- Sign Out Button -->
          <button class="btn btn-outline btn-sm" id="nav-signout-btn" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
            Sign Out
          </button>
        </div>
      ` : `
        <!-- Unauthenticated Navigation Links -->
        <div class="header-actions">
          <a href="#/signin" class="btn btn-secondary btn-sm">
            Sign In
          </a>
          <a href="#/register" class="btn btn-primary btn-sm">
            Create Account
          </a>
        </div>
      `}
    </div>
  `;

  // Attach handlers
  if (isAuth) {
    const toggleBtn = header.querySelector('#toggle-api-mode-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const newMode = store.apiMode === 'mock' ? 'live' : 'mock';
        store.setApiMode(newMode);
        toast.info(`Switched API mode to: ${newMode.toUpperCase()}`);
        renderNavbar();
        
        if (window.location.hash.startsWith('#/results')) {
          window.dispatchEvent(new CustomEvent('app:refresh-results'));
        }
      });
    }

    const signoutBtn = header.querySelector('#nav-signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => {
        store.logout();
        toast.info('Signed out successfully.');
        router.navigate('/');
      });
    }
  }
}

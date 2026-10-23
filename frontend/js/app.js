// Campus Venue Booking - Main Application Entrypoint
import { router } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { store } from './store.js';
import { renderResultsScreen } from './screens/resultsScreen.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[App] Initializing BookIt Facility Booking System...');

  // Initial render of header navigation
  renderNavbar();

  // Subscribe navbar to store updates (user login/logout & booking count)
  store.subscribe(() => {
    renderNavbar();
  });

  // Listen to refresh events (e.g. when toggling between mock and live API)
  window.addEventListener('app:refresh-results', () => {
    renderResultsScreen();
  });

  // Initialize client router
  router.init();
});

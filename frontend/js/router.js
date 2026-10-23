// Campus Venue Booking - Client Side SPA Router (All 8 Screens Integrated)
import { renderNavbar } from './components/navbar.js';
import { renderLandingScreen } from './screens/landingScreen.js';
import { renderSigninScreen } from './screens/signinScreen.js';
import { renderRegisterScreen } from './screens/registerScreen.js';
import { renderOtpScreen } from './screens/otpScreen.js';
import { renderSearchScreen } from './screens/searchScreen.js';
import { renderResultsScreen } from './screens/resultsScreen.js';
import { renderVenueDetailsScreen } from './screens/venueDetailsScreen.js';
import { renderSuccessScreen } from './screens/successScreen.js';
import { renderMyBookingsScreen } from './screens/myBookingsScreen.js';
import { store } from './store.js';

class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    const formatted = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : '/' + path}`;
    window.location.hash = formatted;
  }

  handleRoute() {
    const fullHash = window.location.hash || '#/';
    const cleanHash = fullHash.startsWith('#') ? fullHash.slice(1) : fullHash;
    const [path] = cleanHash.split('?');
    const routeKey = path || '/';

    // Route default on root '/': If logged in -> search, otherwise -> landing
    if (routeKey === '/' || routeKey === '') {
      renderNavbar();
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (store.isAuthenticated()) {
        renderSearchScreen();
      } else {
        renderLandingScreen();
      }
      return;
    }

    const handler = this.routes[routeKey];

    // Update active state in navbar
    renderNavbar();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Execute route handler
    if (handler) {
      handler();
    } else {
      console.warn(`[Router] No route registered for ${routeKey}. Defaulting to landing.`);
      renderLandingScreen();
    }
  }

  init() {
    this.handleRoute();
  }
}

export const router = new Router();

// Register all screen routes
router.register('/', renderLandingScreen);
router.register('/landing', renderLandingScreen);
router.register('/signin', renderSigninScreen);
router.register('/register', renderRegisterScreen);
router.register('/otp', renderOtpScreen);
router.register('/search', renderSearchScreen);
router.register('/results', renderResultsScreen);
router.register('/venue', renderVenueDetailsScreen);
router.register('/success', renderSuccessScreen);
router.register('/my-bookings', renderMyBookingsScreen);

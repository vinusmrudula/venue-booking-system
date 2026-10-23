// Campus Venue Booking - Central Store & State Management
import { CONFIG } from './config.js';

class Store {
  constructor() {
    this.apiMode = localStorage.getItem(CONFIG.STORAGE_KEYS.API_MODE) || 'mock';
    this.currentUser = this._loadCurrentUser();
    this.pendingUser = this._loadPendingUser();
    this.currentOtp = localStorage.getItem('bookit_current_otp') || '1234';
    
    // Timezone-safe local date string
    const today = this.getLocalDateString();

    // Default search filters
    this.searchFilters = this._loadFilters() || {
      date: today,
      department: 'all',
      category: 'classroom',
      capacity: 0,
      keyword: ''
    };

    this.selectedVenue = null;
    this.lastBooking = null;
    this.bookings = this._loadBookings();
    this.listeners = [];
  }

  // Subscribe to state updates
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // Backward compatibility getter for user
  get user() {
    return this.currentUser;
  }
  getLocalDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // Authentication & Session Management
  // ==========================================
  _loadCurrentUser() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null;
  }

  _loadPendingUser() {
    const saved = localStorage.getItem('bookit_pending_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null;
  }

  setPendingUser(data, otp) {
    this.pendingUser = data;
    this.currentOtp = otp || '1234';
    localStorage.setItem('bookit_pending_user', JSON.stringify(data));
    localStorage.setItem('bookit_current_otp', this.currentOtp);
    this.notify();
  }

  clearPendingUser() {
    this.pendingUser = null;
    this.currentOtp = '1234';
    localStorage.removeItem('bookit_pending_user');
    localStorage.removeItem('bookit_current_otp');
    this.notify();
  }

  login(user) {
    this.currentUser = user;
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem('bookit_auth_token', `tok_${Date.now()}`);
    this.notify();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem('bookit_auth_token');
    this.notify();
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  // API Mode toggle (Mock vs Live /availability)
  setApiMode(mode) {
    this.apiMode = mode;
    localStorage.setItem(CONFIG.STORAGE_KEYS.API_MODE, mode);
    this.notify();
  }

  // Search Filters
  _loadFilters() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SEARCH_FILTERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null;
  }

  setSearchFilters(filters) {
    this.searchFilters = { ...this.searchFilters, ...filters };
    localStorage.setItem(CONFIG.STORAGE_KEYS.SEARCH_FILTERS, JSON.stringify(this.searchFilters));
    this.notify();
  }

  // Selected Venue
  setSelectedVenue(venue) {
    this.selectedVenue = venue;
    this.notify();
  }

  // Bookings management
  _loadBookings() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.BOOKINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    
    // Initial sample booking to populate My Bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const sample = [
      {
        id: 'BK-1024',
        venueId: 'nc-27',
        venueName: 'NC 27',
        building: 'Department of Computer Science and Engineering (new)',
        department: 'Department of Computer Science and Engineering (new)',
        date: tomorrowStr,
        timeSlot: '09:00 AM - 11:00 AM',
        purpose: 'Machine Learning Workshop & Lab',
        expectedAttendance: 65,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        coordinator: 'HOD Computer Science (New) (hod.csenew@college.ac.in)',
        emailDraft: 'Respected Sir,\nRequest for NC 27 booking confirmed.'
      }
    ];
    localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKINGS, JSON.stringify(sample));
    return sample;
  }

  saveBooking(booking) {
    this.bookings.unshift(booking);
    localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
    this.lastBooking = booking;
    this.notify();
    return booking;
  }

  cancelBooking(bookingId) {
    const item = this.bookings.find(b => b.id === bookingId);
    if (item) {
      item.status = 'Cancelled';
      localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      this.notify();
    }
  }
}

export const store = new Store();

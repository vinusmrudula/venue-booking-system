// Campus Venue Booking - Sign In Screen (Screen 2 from Wireframe & Associate Integration)
import { API } from '../api.js';
import { router } from '../router.js';
import { toast } from '../components/toast.js';
import { CONFIG } from '../config.js';

export function renderSigninScreen() {
  const container = document.getElementById('app-view');

  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <button class="btn-back-link" id="signin-back-btn">
          ← Back to Home
        </button>

        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in with your college credentials to manage bookings</p>
        </div>

        <!-- Alert error banner -->
        <div class="auth-banner-error" id="signin-banner-error">
          <span style="font-size: 1.1rem;">⚠️</span>
          <span id="signin-banner-error-text">Invalid email or password</span>
        </div>

        <form id="signin-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="signin-email">
              College Email <span class="required">*</span>
            </label>
            <input 
              type="email" 
              id="signin-email" 
              class="form-control" 
              placeholder="e.g. aman.student@college.ac.in" 
              value="aman.student@college.ac.in"
              required 
            />
            <span class="error-message" id="signin-email-error">Official college email ending with .ac.in is required.</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="signin-password">
              Password <span class="required">*</span>
            </label>
            <input 
              type="password" 
              id="signin-password" 
              class="form-control" 
              placeholder="Enter your password" 
              value="password123"
              required 
            />
            <span class="error-message" id="signin-password-error">Password is required.</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; font-size: 0.85rem;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: var(--text-muted);">
              <input type="checkbox" id="signin-remember" checked />
              <span>Remember me</span>
            </label>
            <a href="#" id="forgot-password-link" style="color: var(--primary); font-weight: 600; text-decoration: none;">Forgot Password?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" id="signin-submit-btn">
            <span>Sign In</span>
          </button>
        </form>

        <!-- Quick 1-Click Demo Accounts (from Associate code) -->
        <div style="margin-top: 1.5rem; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem;">
          <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
            ⚡ Quick Demo Accounts (1-Click Fill)
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <button type="button" class="btn btn-secondary btn-sm quick-fill-account" data-email="aman.student@college.ac.in" style="justify-content: space-between; font-size: 0.75rem; padding: 0.35rem 0.65rem;">
              <span>🎓 <strong>Aman Sharma</strong> (Student)</span>
              <span style="color: var(--text-muted);">aman.student@college.ac.in</span>
            </button>
            <button type="button" class="btn btn-secondary btn-sm quick-fill-account" data-email="sunita.faculty@college.ac.in" style="justify-content: space-between; font-size: 0.75rem; padding: 0.35rem 0.65rem;">
              <span>👩‍🏫 <strong>Dr. Sunita Sen</strong> (Faculty)</span>
              <span style="color: var(--text-muted);">sunita.faculty@college.ac.in</span>
            </button>
            <button type="button" class="btn btn-secondary btn-sm quick-fill-account" data-email="purva.patel@college.ac.in" style="justify-content: space-between; font-size: 0.75rem; padding: 0.35rem 0.65rem;">
              <span>⭐ <strong>Purva Patel</strong> (Student Lead)</span>
              <span style="color: var(--text-muted);">purva.patel@college.ac.in</span>
            </button>
          </div>
        </div>

        <div class="auth-footer">
          Don't have an account? 
          <a href="#/register" id="goto-register-link" style="color: var(--primary); font-weight: 700;">Create an account</a>
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  const emailInput = container.querySelector('#signin-email');
  const passwordInput = container.querySelector('#signin-password');
  const errorBanner = container.querySelector('#signin-banner-error');
  const errorBannerText = container.querySelector('#signin-banner-error-text');

  container.querySelector('#signin-back-btn').addEventListener('click', () => {
    router.navigate('/');
  });

  // Quick fill buttons
  container.querySelectorAll('.quick-fill-account').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      emailInput.value = email;
      passwordInput.value = 'password123';
      errorBanner.classList.remove('show');
    });
  });

  // Forgot password
  container.querySelector('#forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    alert('For demo purposes, you can use any of the quick demo accounts or password "password123".');
  });

  // Form submit
  const form = container.querySelector('#signin-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.remove('show');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      container.querySelector('#signin-email-error').classList.add('show');
      emailInput.focus();
      return;
    }

    try {
      const submitBtn = container.querySelector('#signin-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Signing In...</span>';

      await API.login(email, password);
      toast.success(`Welcome back, ${email}!`);
      router.navigate('/search');
    } catch (err) {
      errorBannerText.textContent = err.message || 'Invalid credentials.';
      errorBanner.classList.add('show');
      const submitBtn = container.querySelector('#signin-submit-btn');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Sign In</span>';
    }
  });
}

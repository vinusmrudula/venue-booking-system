// Campus Venue Booking - Create Account Screen (Screen 3 from Wireframe & Associate Integration)
import { API } from '../api.js';
import { router } from '../router.js';
import { toast } from '../components/toast.js';
import { CONFIG } from '../config.js';

export function renderRegisterScreen() {
  const container = document.getElementById('app-view');

  container.innerHTML = `
    <div class="auth-container" style="max-width: 520px;">
      <div class="auth-card">
        <button class="btn-back-link" id="register-back-btn">
          ← Back to Home
        </button>

        <div class="auth-header">
          <h2>Create Your Account</h2>
          <p>Register with your college details to start reserving facilities</p>
        </div>

        <!-- Alert error banner -->
        <div class="auth-banner-error" id="register-banner-error">
          <span style="font-size: 1.1rem;">⚠️</span>
          <span id="register-banner-error-text">Validation error</span>
        </div>

        <form id="register-form" novalidate>
          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label" for="reg-name">
              Full Name <span class="required">*</span>
            </label>
            <input 
              type="text" 
              id="reg-name" 
              class="form-control" 
              placeholder="e.g. Priya Sharma" 
              required 
            />
            <span class="error-message" id="reg-name-error">Please enter your full name.</span>
          </div>

          <!-- College Email -->
          <div class="form-group">
            <label class="form-label" for="reg-email">
              College Email (.ac.in) <span class="required">*</span>
            </label>
            <input 
              type="email" 
              id="reg-email" 
              class="form-control" 
              placeholder="e.g. priya.student@college.ac.in" 
              required 
            />
            <span class="error-message" id="reg-email-error">Official college email ending with .ac.in is required.</span>
          </div>

          <!-- Role & Department Grid -->
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="reg-role">
                Role <span class="required">*</span>
              </label>
              <select id="reg-role" class="form-control" required>
                <option value="">Select Role</option>
                ${CONFIG.ROLES.map(r => `
                  <option value="${r.code}">${r.label}</option>
                `).join('')}
              </select>
              <span class="error-message" id="reg-role-error">Please select your role.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-dept">
                Branch / Department <span class="required">*</span>
              </label>
              <select id="reg-dept" class="form-control" required>
                <option value="">Select Branch / Dept</option>
                ${CONFIG.DEPARTMENTS.filter(d => d.code !== 'all').map(d => `
                  <option value="${d.name}">${d.name}</option>
                `).join('')}
              </select>
              <span class="error-message" id="reg-dept-error">Please select your department.</span>
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label" for="reg-password">
              Password <span class="required">*</span>
            </label>
            <input 
              type="password" 
              id="reg-password" 
              class="form-control" 
              placeholder="Minimum 6 characters" 
              required 
            />
            <span class="error-message" id="reg-password-error">Password must be at least 6 characters long.</span>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" id="register-submit-btn">
            <span>Continue → Verify via OTP</span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? 
          <a href="#/signin" id="goto-signin-link" style="color: var(--primary); font-weight: 700;">Sign In</a>
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  const form = container.querySelector('#register-form');
  const nameInput = container.querySelector('#reg-name');
  const emailInput = container.querySelector('#reg-email');
  const roleSelect = container.querySelector('#reg-role');
  const deptSelect = container.querySelector('#reg-dept');
  const passwordInput = container.querySelector('#reg-password');
  const errorBanner = container.querySelector('#register-banner-error');
  const errorBannerText = container.querySelector('#register-banner-error-text');

  container.querySelector('#register-back-btn').addEventListener('click', () => {
    router.navigate('/');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.remove('show');

    // Validation
    let valid = true;
    if (!nameInput.value.trim()) {
      container.querySelector('#reg-name-error').classList.add('show');
      valid = false;
    } else {
      container.querySelector('#reg-name-error').classList.remove('show');
    }

    if (!emailInput.value.trim() || !emailInput.value.trim().toLowerCase().endsWith('.ac.in')) {
      container.querySelector('#reg-email-error').classList.add('show');
      valid = false;
    } else {
      container.querySelector('#reg-email-error').classList.remove('show');
    }

    if (!roleSelect.value) {
      container.querySelector('#reg-role-error').classList.add('show');
      valid = false;
    } else {
      container.querySelector('#reg-role-error').classList.remove('show');
    }

    if (!deptSelect.value) {
      container.querySelector('#reg-dept-error').classList.add('show');
      valid = false;
    } else {
      container.querySelector('#reg-dept-error').classList.remove('show');
    }

    if (!passwordInput.value || passwordInput.value.length < 6) {
      container.querySelector('#reg-password-error').classList.add('show');
      valid = false;
    } else {
      container.querySelector('#reg-password-error').classList.remove('show');
    }

    if (!valid) return;

    try {
      const submitBtn = container.querySelector('#register-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Sending OTP...</span>';

      const userData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        role: roleSelect.value,
        dept: deptSelect.value,
        password: passwordInput.value
      };

      const res = await API.registerInitiate(userData);
      toast.info(`Verification code sent! (Demo OTP: ${res.otpPreview})`);
      router.navigate('/otp');
    } catch (err) {
      errorBannerText.textContent = err.message || 'Registration failed.';
      errorBanner.classList.add('show');
      const submitBtn = container.querySelector('#register-submit-btn');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Continue → Verify via OTP</span>';
    }
  });
}

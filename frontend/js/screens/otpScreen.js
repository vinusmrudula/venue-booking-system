// Campus Venue Booking - OTP Verification Screen (Screen 3b from Associate Integration)
import { API } from '../api.js';
import { router } from '../router.js';
import { store } from '../store.js';
import { toast } from '../components/toast.js';

let countdownTimer = null;

export function renderOtpScreen() {
  const container = document.getElementById('app-view');
  const pending = store.pendingUser;

  if (!pending) {
    toast.error('No pending registration found. Please register first.');
    router.navigate('/register');
    return;
  }

  const expectedOtp = store.currentOtp || '1234';

  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card" style="text-align: center;">
        <button class="btn-back-link" id="otp-back-btn">
          ← Back to Registration
        </button>

        <div class="auth-header">
          <div class="otp-badge-icon">🔒</div>
          <h2>Verify Your Email</h2>
          <p>We've sent a 4-digit verification code to your college email:</p>
          <div class="otp-target-email-pill">${pending.email}</div>
        </div>

        <!-- Alert error banner -->
        <div class="auth-banner-error" id="otp-banner-error">
          <span style="font-size: 1.1rem;">⚠️</span>
          <span id="otp-banner-error-text">Invalid verification code</span>
        </div>

        <!-- Helper hint showing demo OTP -->
        <div style="background: var(--mint-light); border: 1px solid var(--mint-border); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; margin-bottom: 1.25rem; font-size: 0.8rem; color: var(--primary);">
          ℹ️ <strong>Demo Test Code:</strong> Use <strong>${expectedOtp}</strong> or <strong>1234</strong> to verify.
        </div>

        <form id="otp-form" novalidate>
          <div class="otp-inputs-wrapper">
            <input type="text" maxlength="1" class="otp-digit" id="otp-1" inputmode="numeric" autocomplete="one-time-code" autofocus />
            <input type="text" maxlength="1" class="otp-digit" id="otp-2" inputmode="numeric" />
            <input type="text" maxlength="1" class="otp-digit" id="otp-3" inputmode="numeric" />
            <input type="text" maxlength="1" class="otp-digit" id="otp-4" inputmode="numeric" />
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" id="otp-submit-btn" style="margin-top: 1.5rem;">
            <span>Verify &amp; Complete Registration</span>
          </button>
        </form>

        <div style="margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted);">
          <span>Didn't receive the code?</span>
          <button type="button" class="btn-link" id="btn-resend-otp" style="font-weight: 700; color: var(--primary); margin-left: 0.35rem; cursor: pointer; background: none; border: none; text-decoration: underline;">
            Resend OTP
          </button>
          <div id="otp-timer-text" style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.4rem;"></div>
        </div>
      </div>
    </div>
  `;

  const inputs = [
    container.querySelector('#otp-1'),
    container.querySelector('#otp-2'),
    container.querySelector('#otp-3'),
    container.querySelector('#otp-4')
  ];

  // Auto-advance and backspace navigation
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val;
      if (val && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const digits = pasteData.replace(/[^0-9]/g, '').slice(0, 4).split('');
      digits.forEach((digit, i) => {
        if (inputs[i]) inputs[i].value = digit;
      });
      if (digits.length > 0) {
        const nextIdx = Math.min(digits.length, inputs.length - 1);
        inputs[nextIdx].focus();
      }
    });
  });

  // Countdown timer for resend
  let secondsLeft = 30;
  const timerText = container.querySelector('#otp-timer-text');
  const resendBtn = container.querySelector('#btn-resend-otp');

  if (countdownTimer) clearInterval(countdownTimer);

  function startTimer() {
    secondsLeft = 30;
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.5';
    timerText.textContent = `You can request a new code in ${secondsLeft}s`;

    countdownTimer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        timerText.textContent = '';
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
      } else {
        timerText.textContent = `You can request a new code in ${secondsLeft}s`;
      }
    }, 1000);
  }
  startTimer();

  resendBtn.addEventListener('click', () => {
    if (secondsLeft > 0) return;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    store.setPendingUser(pending, newOtp);
    toast.info(`New OTP dispatched! (Code: ${newOtp})`);
    startTimer();
  });

  container.querySelector('#otp-back-btn').addEventListener('click', () => {
    if (countdownTimer) clearInterval(countdownTimer);
    router.navigate('/register');
  });

  // Submit Handler
  const form = container.querySelector('#otp-form');
  const errorBanner = container.querySelector('#otp-banner-error');
  const errorBannerText = container.querySelector('#otp-banner-error-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.remove('show');

    const enteredCode = inputs.map(i => i.value).join('');

    if (enteredCode.length < 4) {
      errorBannerText.textContent = 'Please enter all 4 digits of your verification code.';
      errorBanner.classList.add('show');
      inputs.find(i => !i.value)?.focus();
      return;
    }

    try {
      const submitBtn = container.querySelector('#otp-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Verifying...</span>';

      await API.verifyOtp(enteredCode);
      if (countdownTimer) clearInterval(countdownTimer);

      toast.success('Account successfully verified & signed in!');
      router.navigate('/search');
    } catch (err) {
      errorBannerText.textContent = err.message || 'Invalid code.';
      errorBanner.classList.add('show');
      inputs.forEach(i => i.classList.add('is-invalid'));
      const submitBtn = container.querySelector('#otp-submit-btn');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Verify &amp; Complete Registration</span>';
    }
  });
}

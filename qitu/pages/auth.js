// ================================================================
//  TransformAI — Modern Authentication Pages (Login & Signup)
//  Matches the core design system: Glassmorphism, Gradient Accents, Inter
// ================================================================

function renderLoginPage(opts = {}) {
  const redirect = opts.redirect || 'dashboard';

  return `
  <div class="auth-page-wrapper">
    <div class="auth-container">
      
      <!-- Auth Header / Branding -->
      <div class="auth-brand" onclick="App.navigate('dashboard')" style="cursor:pointer;">
        <div class="auth-brand-icon">
          <i class="ri-sparkling-2-fill"></i>
        </div>
        <div class="auth-brand-text">
          <span class="auth-brand-name">TransformAI</span>
          <span class="auth-brand-badge">Enterprise SaaS</span>
        </div>
      </div>

      <!-- Main Auth Card -->
      <div class="auth-card">
        
        <!-- Tab Segment -->
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabLogin" onclick="App.navigate('login', { redirect: '${redirect}' })">
            <i class="ri-login-box-line"></i> Sign In
          </button>
          <button class="auth-tab" id="tabSignup" onclick="App.navigate('signup', { redirect: '${redirect}' })">
            <i class="ri-user-add-line"></i> Create Account
          </button>
        </div>

        <div class="auth-card-header">
          <h2 class="auth-title">Welcome back</h2>
          <p class="auth-subtitle">Sign in to access your transformation history, AI quizzes, and custom pipelines.</p>
        </div>

        <!-- Alert Banner -->
        <div class="auth-alert" id="authAlert" style="display:none;"></div>

        <!-- Login Form -->
        <form class="auth-form" id="loginForm" onsubmit="AuthPage.handleLoginSubmit(event, '${redirect}')" novalidate>
          
          <!-- Email Field -->
          <div class="form-group">
            <label class="form-label" for="loginEmail">Email Address</label>
            <div class="auth-input-wrapper">
              <i class="ri-mail-line auth-input-icon"></i>
              <input 
                type="email" 
                id="loginEmail" 
                class="form-input auth-input" 
                placeholder="name@company.com" 
                required 
                autocomplete="email"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <div class="form-label-row">
              <label class="form-label" for="loginPassword">Password</label>
              <a href="#" class="auth-link-sm" onclick="Toast.show('info', 'Password Reset', 'Password recovery instructions have been sent to your administrator.'); return false;">
                Forgot password?
              </a>
            </div>
            <div class="auth-input-wrapper">
              <i class="ri-lock-line auth-input-icon"></i>
              <input 
                type="password" 
                id="loginPassword" 
                class="form-input auth-input" 
                placeholder="••••••••" 
                required 
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="auth-input-toggle" 
                id="loginPasswordToggle" 
                onclick="AuthPage.togglePassword('loginPassword', 'loginPasswordIcon')"
                title="Show/Hide Password"
              >
                <i class="ri-eye-line" id="loginPasswordIcon"></i>
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="auth-remember-row">
            <label class="auth-checkbox-label">
              <input type="checkbox" id="loginRemember" checked />
              <span>Keep me signed in on this device</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary btn-block btn-lg auth-submit-btn" id="loginSubmitBtn">
            <span class="btn-spinner" id="loginSpinner"></span>
            <span class="btn-label"><i class="ri-login-circle-line"></i> Sign In to TransformAI</span>
          </button>
        </form>

        <!-- Quick Demo Tester Credentials Pill -->
        <div class="auth-demo-box">
          <div class="demo-box-header">
            <span><i class="ri-flashlight-line" style="color:var(--warning);"></i> Instant Evaluator Login</span>
            <button class="btn-text-xs" onclick="AuthPage.fillDemoCredentials()">Fill Demo Account</button>
          </div>
          <div class="demo-box-sub">Click above to auto-populate test evaluator credentials.</div>
        </div>

        <div class="auth-footer-link">
          Don't have an account? 
          <a href="#" onclick="App.navigate('signup', { redirect: '${redirect}' }); return false;">
            Create a free account <i class="ri-arrow-right-line"></i>
          </a>
        </div>

      </div>

      <!-- Security Trust Badges -->
      <div class="auth-security-badges">
        <span><i class="ri-shield-check-line"></i> Scrypt Salted Encryption</span>
        <span><i class="ri-database-2-line"></i> Isolated User SQLite Storage</span>
        <span><i class="ri-lock-password-line"></i> Zero Plaintext Passwords</span>
      </div>

    </div>
  </div>
  `;
}

function renderSignupPage(opts = {}) {
  const redirect = opts.redirect || 'dashboard';

  return `
  <div class="auth-page-wrapper">
    <div class="auth-container">
      
      <!-- Auth Header / Branding -->
      <div class="auth-brand" onclick="App.navigate('dashboard')" style="cursor:pointer;">
        <div class="auth-brand-icon">
          <i class="ri-sparkling-2-fill"></i>
        </div>
        <div class="auth-brand-text">
          <span class="auth-brand-name">TransformAI</span>
          <span class="auth-brand-badge">Enterprise SaaS</span>
        </div>
      </div>

      <!-- Main Auth Card -->
      <div class="auth-card">
        
        <!-- Tab Segment -->
        <div class="auth-tabs">
          <button class="auth-tab" id="tabLogin" onclick="App.navigate('login', { redirect: '${redirect}' })">
            <i class="ri-login-box-line"></i> Sign In
          </button>
          <button class="auth-tab active" id="tabSignup" onclick="App.navigate('signup', { redirect: '${redirect}' })">
            <i class="ri-user-add-line"></i> Create Account
          </button>
        </div>

        <div class="auth-card-header">
          <h2 class="auth-title">Create your account</h2>
          <p class="auth-subtitle">Get instant access to AI transformations, quiz generation, and personalized pipelines.</p>
        </div>

        <!-- Alert Banner -->
        <div class="auth-alert" id="authAlert" style="display:none;"></div>

        <!-- Signup Form -->
        <form class="auth-form" id="signupForm" onsubmit="AuthPage.handleSignupSubmit(event, '${redirect}')" novalidate>
          
          <!-- Full Name Field -->
          <div class="form-group">
            <label class="form-label" for="signupFullName">Full Name</label>
            <div class="auth-input-wrapper">
              <i class="ri-user-line auth-input-icon"></i>
              <input 
                type="text" 
                id="signupFullName" 
                class="form-input auth-input" 
                placeholder="Dr. Alex Vance" 
                required 
                autocomplete="name"
              />
            </div>
          </div>

          <!-- Email Address Field -->
          <div class="form-group">
            <label class="form-label" for="signupEmail">Email Address</label>
            <div class="auth-input-wrapper">
              <i class="ri-mail-line auth-input-icon"></i>
              <input 
                type="email" 
                id="signupEmail" 
                class="form-input auth-input" 
                placeholder="alex.vance@enterprise.ai" 
                required 
                autocomplete="email"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label class="form-label" for="signupPassword">Password</label>
            <div class="auth-input-wrapper">
              <i class="ri-lock-line auth-input-icon"></i>
              <input 
                type="password" 
                id="signupPassword" 
                class="form-input auth-input" 
                placeholder="At least 8 characters..." 
                required 
                autocomplete="new-password"
                oninput="AuthPage.onPasswordInput(this.value)"
              />
              <button 
                type="button" 
                class="auth-input-toggle" 
                id="signupPasswordToggle" 
                onclick="AuthPage.togglePassword('signupPassword', 'signupPasswordIcon')"
                title="Show/Hide Password"
              >
                <i class="ri-eye-line" id="signupPasswordIcon"></i>
              </button>
            </div>

            <!-- Password Strength Indicator -->
            <div class="password-meter-container" id="passwordMeterContainer">
              <div class="meter-bar-track">
                <div class="meter-bar-fill" id="meterFill" style="width:0%;"></div>
              </div>
              <div class="meter-status-row">
                <span class="meter-label">Password strength:</span>
                <span class="meter-value" id="meterValue">Enter password</span>
              </div>
              <div class="meter-requirements">
                <div class="req-item" id="reqLength"><i class="ri-checkbox-blank-circle-line"></i> 8+ characters</div>
                <div class="req-item" id="reqCases"><i class="ri-checkbox-blank-circle-line"></i> Uppercase & lowercase</div>
                <div class="req-item" id="reqNumber"><i class="ri-checkbox-blank-circle-line"></i> At least 1 number</div>
                <div class="req-item" id="reqSpecial"><i class="ri-checkbox-blank-circle-line"></i> Special character (!@#$%^&*)</div>
              </div>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div class="form-group">
            <label class="form-label" for="signupConfirmPassword">Confirm Password</label>
            <div class="auth-input-wrapper">
              <i class="ri-lock-check-line auth-input-icon"></i>
              <input 
                type="password" 
                id="signupConfirmPassword" 
                class="form-input auth-input" 
                placeholder="Re-enter your password..." 
                required 
                autocomplete="new-password"
                oninput="AuthPage.onConfirmPasswordInput(this.value)"
              />
              <button 
                type="button" 
                class="auth-input-toggle" 
                id="signupConfirmToggle" 
                onclick="AuthPage.togglePassword('signupConfirmPassword', 'signupConfirmIcon')"
                title="Show/Hide Password"
              >
                <i class="ri-eye-line" id="signupConfirmIcon"></i>
              </button>
            </div>
            <div class="confirm-match-status" id="confirmMatchStatus"></div>
          </div>

          <!-- Terms acceptance note -->
          <div class="auth-terms-note">
            By creating an account, you agree to TransformAI's Terms of Service and Privacy Policy. All user records are stored strictly isolated.
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary btn-block btn-lg auth-submit-btn" id="signupSubmitBtn">
            <span class="btn-spinner" id="signupSpinner"></span>
            <span class="btn-label"><i class="ri-user-add-line"></i> Create Free Account</span>
          </button>
        </form>

        <div class="auth-footer-link">
          Already have an account? 
          <a href="#" onclick="App.navigate('login', { redirect: '${redirect}' }); return false;">
            Sign in here <i class="ri-arrow-right-line"></i>
          </a>
        </div>

      </div>

      <!-- Security Trust Badges -->
      <div class="auth-security-badges">
        <span><i class="ri-shield-check-line"></i> Scrypt Salted Encryption</span>
        <span><i class="ri-database-2-line"></i> Isolated User SQLite Storage</span>
        <span><i class="ri-lock-password-line"></i> Zero Plaintext Passwords</span>
      </div>

    </div>
  </div>
  `;
}

// ================================================================
//  AuthPage Controller & Validation Logic
// ================================================================

const AuthPage = {
  // Toggle password visibility
  togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'ri-eye-off-line';
    } else {
      input.type = 'password';
      icon.className = 'ri-eye-line';
    }
  },

  // Password Strength Calculation
  calculateStrength(password) {
    if (!password) {
      return { score: 0, text: 'Empty', color: 'transparent', length: false, cases: false, number: false, special: false };
    }

    const length = password.length >= 8;
    const cases = /[A-Z]/.test(password) && /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let score = 0;
    if (length) score += 25;
    if (cases) score += 25;
    if (number) score += 25;
    if (special) score += 25;

    let text = 'Weak';
    let color = '#ef4444'; // Red

    if (score === 50) {
      text = 'Fair';
      color = '#f59e0b'; // Amber
    } else if (score === 75) {
      text = 'Good';
      color = '#3b82f6'; // Blue
    } else if (score === 100) {
      text = 'Strong';
      color = '#10b981'; // Green
    }

    return { score, text, color, length, cases, number, special };
  },

  onPasswordInput(val) {
    const res = this.calculateStrength(val);
    const fill = document.getElementById('meterFill');
    const valueEl = document.getElementById('meterValue');

    if (fill) {
      fill.style.width = `${res.score}%`;
      fill.style.backgroundColor = res.color;
    }
    if (valueEl) {
      valueEl.textContent = res.text;
      valueEl.style.color = res.color;
    }

    // Update criteria items
    this.updateReqItem('reqLength', res.length);
    this.updateReqItem('reqCases', res.cases);
    this.updateReqItem('reqNumber', res.number);
    this.updateReqItem('reqSpecial', res.special);

    // Also revalidate confirm password if it has value
    const confirmInput = document.getElementById('signupConfirmPassword');
    if (confirmInput && confirmInput.value) {
      this.onConfirmPasswordInput(confirmInput.value);
    }
  },

  updateReqItem(elId, isMet) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (isMet) {
      el.className = 'req-item met';
      el.innerHTML = `<i class="ri-checkbox-circle-fill text-green"></i> ${el.textContent.trim()}`;
    } else {
      el.className = 'req-item';
      el.innerHTML = `<i class="ri-checkbox-blank-circle-line"></i> ${el.textContent.trim()}`;
    }
  },

  onConfirmPasswordInput(confirmVal) {
    const pwdInput = document.getElementById('signupPassword');
    const statusEl = document.getElementById('confirmMatchStatus');
    if (!pwdInput || !statusEl) return;

    if (!confirmVal) {
      statusEl.innerHTML = '';
      return;
    }

    if (confirmVal === pwdInput.value) {
      statusEl.innerHTML = `<span class="text-green"><i class="ri-checkbox-circle-fill"></i> Passwords match</span>`;
    } else {
      statusEl.innerHTML = `<span class="text-red"><i class="ri-close-circle-fill"></i> Passwords do not match</span>`;
    }
  },

  showAlert(message, type = 'error') {
    const alertEl = document.getElementById('authAlert');
    if (!alertEl) return;

    const icon = type === 'error' ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill';
    alertEl.className = `auth-alert ${type}`;
    alertEl.innerHTML = `
      <i class="${icon}"></i>
      <div class="auth-alert-text">${escapeHtml(message)}</div>
      <button type="button" class="auth-alert-close" onclick="this.parentElement.style.display='none'">
        <i class="ri-close-line"></i>
      </button>
    `;
    alertEl.style.display = 'flex';
  },

  hideAlert() {
    const alertEl = document.getElementById('authAlert');
    if (alertEl) alertEl.style.display = 'none';
  },

  setLoading(btnId, spinnerId, isLoading, defaultLabel) {
    const btn = document.getElementById(btnId);
    const spinner = document.getElementById(spinnerId);
    if (!btn) return;

    btn.disabled = isLoading;
    if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
    const labelEl = btn.querySelector('.btn-label');
    if (labelEl && defaultLabel && !isLoading) {
      labelEl.innerHTML = defaultLabel;
    }
  },

  // Instant demo account loader for test evaluators
  fillDemoCredentials() {
    const email = document.getElementById('loginEmail');
    const pwd = document.getElementById('loginPassword');
    if (email) email.value = 'evaluator@transformai.com';
    if (pwd) pwd.value = 'Evaluator2026!@#';
    Toast.show('info', 'Demo Credentials Loaded', 'Evaluator credentials filled. Click "Sign In" to proceed.');
  },

  // --- Handle Login Form Submission ---
  async handleLoginSubmit(event, redirectPage = 'dashboard') {
    if (event) event.preventDefault();
    this.hideAlert();

    const emailInput = document.getElementById('loginEmail');
    const pwdInput = document.getElementById('loginPassword');
    const rememberInput = document.getElementById('loginRemember');

    const email = (emailInput?.value || '').trim();
    const password = pwdInput?.value || '';

    // Validation
    if (!email) {
      this.showAlert('Please enter your email address.');
      emailInput?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showAlert('Please enter a valid email address (e.g. name@domain.com).');
      emailInput?.focus();
      return;
    }

    if (!password) {
      this.showAlert('Please enter your password.');
      pwdInput?.focus();
      return;
    }

    this.setLoading('loginSubmitBtn', 'loginSpinner', true);

    try {
      const result = await AuthManager.login(email, password, rememberInput?.checked);
      Toast.show('success', 'Sign In Successful', `Welcome back, ${result.user.full_name}!`);
      App.navigate(redirectPage || 'dashboard');
    } catch (err) {
      this.showAlert(err.message || 'Login failed. Please check your credentials.');
    } finally {
      this.setLoading('loginSubmitBtn', 'loginSpinner', false, '<i class="ri-login-circle-line"></i> Sign In to TransformAI');
    }
  },

  // --- Handle Signup Form Submission ---
  async handleSignupSubmit(event, redirectPage = 'dashboard') {
    if (event) event.preventDefault();
    this.hideAlert();

    const nameInput = document.getElementById('signupFullName');
    const emailInput = document.getElementById('signupEmail');
    const pwdInput = document.getElementById('signupPassword');
    const confirmInput = document.getElementById('signupConfirmPassword');

    const fullName = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const password = pwdInput?.value || '';
    const confirmPassword = confirmInput?.value || '';

    // Field Validations
    if (!fullName || fullName.length < 2) {
      this.showAlert('Please enter your full name (minimum 2 characters).');
      nameInput?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.showAlert('Please enter a valid email address.');
      emailInput?.focus();
      return;
    }

    // Password requirements check
    const strength = this.calculateStrength(password);
    if (strength.score < 100) {
      this.showAlert('Password must meet all security requirements: 8+ characters, uppercase, lowercase, numbers, and a special character.');
      pwdInput?.focus();
      return;
    }

    if (password !== confirmPassword) {
      this.showAlert('Passwords do not match. Please re-enter your password.');
      confirmInput?.focus();
      return;
    }

    this.setLoading('signupSubmitBtn', 'signupSpinner', true);

    try {
      const result = await AuthManager.signup(fullName, email, password, confirmPassword);
      Toast.show('success', 'Account Created', `Welcome to TransformAI, ${result.user.full_name}!`);
      App.navigate(redirectPage || 'dashboard');
    } catch (err) {
      this.showAlert(err.message || 'Registration failed. Please check your information.');
    } finally {
      this.setLoading('signupSubmitBtn', 'signupSpinner', false, '<i class="ri-user-add-line"></i> Create Free Account');
    }
  }
};

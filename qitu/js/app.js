// ================================================================
//  TransformAI — Core SaaS Application Router, Auth & State Manager
//  Features: User Authentication, Session Persistence, User-Specific Data,
//            SQLite Backend Sync, Protected Routes & Real-time Telemetry
// ================================================================

// ================================================================
//  1. Authentication & Session Manager
// ================================================================

const AuthManager = {
  _tokenKey: 'transformai_auth_token',
  _userKey: 'transformai_auth_user',
  _currentUser: null,
  _token: null,

  getToken() {
    if (this._token) return this._token;
    try {
      this._token = localStorage.getItem(this._tokenKey) || null;
    } catch {
      this._token = null;
    }
    return this._token;
  },

  getUser() {
    if (this._currentUser) return this._currentUser;
    try {
      const data = localStorage.getItem(this._userKey);
      if (data) this._currentUser = JSON.parse(data);
    } catch {
      this._currentUser = null;
    }
    return this._currentUser;
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  async init() {
    const token = this.getToken();
    if (!token) {
      this.clearSession(false);
      App.updateAuthUI();
      return;
    }

    try {
      // Validate session with backend
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        this._currentUser = data.user;
        localStorage.setItem(this._userKey, JSON.stringify(data.user));

        // Load isolated user data bundle from SQLite backend
        await AppState.syncUserDataFromBackend();
      } else {
        // Session invalid or expired
        this.clearSession(false);
        Toast.show('info', 'Session Expired', 'Your previous session has expired. Please sign in again.');
      }
    } catch (err) {
      // Network/offline fallback: trust cached user if available
      console.warn('[AuthManager] Session check offline fallback:', err);
    }

    App.updateAuthUI();
  },

  async login(email, password, remember = true) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    this._token = data.token;
    this._currentUser = data.user;

    if (remember) {
      localStorage.setItem(this._tokenKey, data.token);
      localStorage.setItem(this._userKey, JSON.stringify(data.user));
    } else {
      sessionStorage.setItem(this._tokenKey, data.token);
      localStorage.setItem(this._userKey, JSON.stringify(data.user));
    }

    // Load user data into AppState
    await AppState.syncUserDataFromBackend();
    App.updateAuthUI();

    return data;
  },

  async signup(fullName, email, password, confirmPassword) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed. Please check your information.');
    }

    this._token = data.token;
    this._currentUser = data.user;

    localStorage.setItem(this._tokenKey, data.token);
    localStorage.setItem(this._userKey, JSON.stringify(data.user));

    // Load initial user data into AppState
    await AppState.syncUserDataFromBackend();
    App.updateAuthUI();

    return data;
  },

  async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('[AuthManager] Logout API error:', err);
      }
    }

    this.clearSession(true);
    AppState.resetForLogout();
    App.updateAuthUI();
    Toast.show('info', 'Signed Out', 'You have been signed out successfully.');
    App.navigate('login');
  },

  clearSession(clearStorage = true) {
    this._token = null;
    this._currentUser = null;
    if (clearStorage) {
      try {
        localStorage.removeItem(this._tokenKey);
        localStorage.removeItem(this._userKey);
        sessionStorage.removeItem(this._tokenKey);
      } catch (e) {}
    }
  }
};

// ================================================================
//  2. User-Scoped State Manager (AppState)
// ================================================================

const AppState = {
  _defaults() {
    return {
      provider: 'local',
      keys: { openai: '', gemini: '', anthropic: '' },
      models: { openai: 'gpt-4o-mini', gemini: 'gemini-1.5-flash', anthropic: 'claude-3-5-sonnet-20241022', local: 'local-nlp-v1' },
      brand: { name: 'TransformAI Enterprise', voice: 'Clear, direct, and outcome-focused.' },
      prefs: {
        streaming: true,
        autoSave: true,
        theme: 'dark',
        defaultType: 'summarize',
        defaultLang: 'hi',
        defaultTone: 'professional',
        defaultLength: 'medium'
      },
      history: [],
      notifications: [
        {
          id: 'notif_welcome',
          title: 'TransformAI Initialized',
          message: 'The zero-config Local Fallback NLP Engine is active and ready for transformations.',
          time: Date.now() - 1000 * 60 * 15,
          read: false
        }
      ],
      savedPipelines: [
        {
          id: 'pipe_blog_social',
          name: 'Blog → Social Media Kit',
          desc: 'Turn long-form content into polished social media takeaways.',
          stages: [
            { type: 'grammar', opts: { showDiff: 'no' }, enabled: true },
            { type: 'tone', opts: { targetTone: 'professional' }, enabled: true },
            { type: 'summarize', opts: { length: 'short' }, enabled: true },
            { type: 'convert', opts: { targetFormat: 'bullets' }, enabled: true }
          ],
          lastExecuted: Date.now() - 1000 * 60 * 60 * 2,
          status: 'Ready'
        },
        {
          id: 'pipe_exec_brief',
          name: 'Report → Executive Briefing',
          desc: 'Condense complex technical reports into formal briefings.',
          stages: [
            { type: 'summarize', opts: { length: 'detailed' }, enabled: true },
            { type: 'tone', opts: { targetTone: 'formal' }, enabled: true },
            { type: 'convert', opts: { targetFormat: 'report' }, enabled: true },
            { type: 'quality', opts: { evaluationStandard: 'business' }, enabled: true }
          ],
          lastExecuted: null,
          status: 'Ready'
        },
        {
          id: 'pipe_multilang',
          name: 'Global Dispatch (EN → HI)',
          desc: 'Proofread and translate English text into regional Hindi.',
          stages: [
            { type: 'grammar', opts: { showDiff: 'no' }, enabled: true },
            { type: 'tone', opts: { targetTone: 'friendly' }, enabled: true },
            { type: 'translate', opts: { sourceLang: 'en', targetLang: 'hi' }, enabled: true }
          ],
          lastExecuted: null,
          status: 'Ready'
        }
      ],
      stats: {
        successfulOperations: 0,
        failedOperations: 0,
        totalTransforms: 0,
        wordsProcessed: 0,
        usageByType: {}
      },
      practiceSets: [],
      practiceAttempts: []
    };
  },

  _getKey() {
    const user = AuthManager.getUser();
    return user ? `transformai_user_${user.id}_state_v3` : 'transformai_guest_state_v3';
  },

  _load() {
    try {
      const key = this._getKey();
      const data = localStorage.getItem(key);
      if (!data) return this._defaults();
      const parsed = JSON.parse(data);
      return {
        ...this._defaults(),
        ...parsed,
        stats: { ...this._defaults().stats, ...(parsed.stats || {}) },
        prefs: { ...this._defaults().prefs, ...(parsed.prefs || {}) },
        savedPipelines: parsed.savedPipelines && parsed.savedPipelines.length ? parsed.savedPipelines : this._defaults().savedPipelines,
        practiceSets: parsed.practiceSets || [],
        practiceAttempts: parsed.practiceAttempts || []
      };
    } catch {
      return this._defaults();
    }
  },

  _save(state) {
    try {
      const key = this._getKey();
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn('[AppState] Failed to save state to localStorage:', e);
    }
  },

  // Reset in-memory / cache when logging out
  resetForLogout() {
    const guestDefaults = this._defaults();
    try {
      localStorage.removeItem('transformai_guest_state_v3');
    } catch (e) {}
  },

  // Synchronize user-specific data from SQLite backend
  async syncUserDataFromBackend() {
    if (!AuthManager.isAuthenticated()) return;

    try {
      const headers = AuthManager.getAuthHeaders();
      const res = await fetch('/api/user/data', { headers });
      if (!res.ok) return;

      const result = await res.json();
      const bundle = result.data;
      if (!bundle) return;

      const s = this._load();
      if (bundle.history) s.history = bundle.history;
      if (bundle.practiceSets) s.practiceSets = bundle.practiceSets;
      if (bundle.savedPipelines && bundle.savedPipelines.length > 0) s.savedPipelines = bundle.savedPipelines;

      if (bundle.settings) {
        if (bundle.settings.provider) s.provider = bundle.settings.provider;
        if (bundle.settings.keys) s.keys = bundle.settings.keys;
        if (bundle.settings.models) s.models = bundle.settings.models;
        if (bundle.settings.brand) s.brand = bundle.settings.brand;
        if (bundle.settings.prefs) s.prefs = { ...s.prefs, ...bundle.settings.prefs };
        if (bundle.settings.stats) s.stats = { ...s.stats, ...bundle.settings.stats };
      }

      this._save(s);
    } catch (err) {
      console.warn('[AppState] Failed to sync data from backend:', err);
    }
  },

  getAll() { return this._load(); },

  getSettings() {
    const s = this._load();
    return {
      provider: s.provider,
      keys: s.keys,
      models: s.models,
      brand: s.brand,
      prefs: s.prefs
    };
  },

  getSetting(key) {
    const s = this._load();
    return s[key];
  },

  getPref(key, defaultVal) {
    const s = this._load();
    if (!s.prefs) return defaultVal;
    return s.prefs[key] !== undefined ? s.prefs[key] : defaultVal;
  },

  updateSetting(key, val) {
    const s = this._load();
    s[key] = val;
    this._save(s);
    this._syncSettingsToBackend();
  },

  updatePref(key, val) {
    const s = this._load();
    if (!s.prefs) s.prefs = {};
    s.prefs[key] = val;
    this._save(s);
    this._syncSettingsToBackend();
  },

  async _syncSettingsToBackend() {
    if (!AuthManager.isAuthenticated()) return;
    try {
      const s = this._load();
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
        body: JSON.stringify({
          provider: s.provider,
          keys: s.keys,
          models: s.models,
          brand: s.brand,
          prefs: s.prefs,
          stats: s.stats
        })
      });
    } catch (e) {
      console.warn('[AppState] Error syncing settings to backend:', e);
    }
  },

  // --- History Records ---
  getHistory() {
    return (this._load().history || []).slice().reverse();
  },

  addHistory(item) {
    const s = this._load();
    if (!s.history) s.history = [];
    s.history.push(item);

    // Compute metrics
    if (!s.stats) s.stats = this._defaults().stats;
    s.stats.totalTransforms = (s.stats.totalTransforms || 0) + 1;
    s.stats.successfulOperations = (s.stats.successfulOperations || 0) + 1;

    const wc = item.input ? item.input.trim().split(/\s+/).filter(Boolean).length : 0;
    s.stats.wordsProcessed = (s.stats.wordsProcessed || 0) + wc;

    if (!s.stats.usageByType) s.stats.usageByType = {};
    s.stats.usageByType[item.type] = (s.stats.usageByType[item.type] || 0) + 1;

    this._save(s);

    // Sync to SQLite backend if authenticated
    if (AuthManager.isAuthenticated()) {
      fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
        body: JSON.stringify({ item })
      }).catch(e => console.warn('[AppState] History sync error:', e));
    }

    // Trigger Notification
    const def = (typeof TRANSFORMATIONS !== 'undefined') ? TRANSFORMATIONS[item.type] : null;
    this.addNotification(
      'Transformation Completed',
      `${def ? def.label : item.type} finished successfully (${wc} words).`,
      'success'
    );
  },

  deleteHistoryItem(idx) {
    const s = this._load();
    const reversed = (s.history || []).slice().reverse();
    const targetItem = reversed[idx];
    reversed.splice(idx, 1);
    s.history = reversed.slice().reverse();
    this._save(s);

    if (AuthManager.isAuthenticated() && targetItem && targetItem.id) {
      fetch(`/api/user/history/${targetItem.id}`, {
        method: 'DELETE',
        headers: AuthManager.getAuthHeaders()
      }).catch(e => console.warn('[AppState] History item delete error:', e));
    }
  },

  clearHistory() {
    const s = this._load();
    s.history = [];
    this._save(s);

    if (AuthManager.isAuthenticated()) {
      fetch('/api/user/history', {
        method: 'DELETE',
        headers: AuthManager.getAuthHeaders()
      }).catch(e => console.warn('[AppState] Clear history error:', e));
    }
  },

  // --- Notifications ---
  getNotifications() {
    return (this._load().notifications || []).slice().reverse();
  },

  addNotification(title, message, type = 'info') {
    const s = this._load();
    if (!s.notifications) s.notifications = [];
    s.notifications.push({
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      time: Date.now(),
      read: false
    });
    if (s.notifications.length > 50) s.notifications.shift();
    this._save(s);
    if (typeof App !== 'undefined' && App.updateNotificationBadge) {
      App.updateNotificationBadge();
    }
  },

  markNotificationsRead() {
    const s = this._load();
    if (!s.notifications) return;
    s.notifications.forEach(n => { n.read = true; });
    this._save(s);
    if (typeof App !== 'undefined' && App.updateNotificationBadge) {
      App.updateNotificationBadge();
    }
  },

  clearNotifications() {
    const s = this._load();
    s.notifications = [];
    this._save(s);
    if (typeof App !== 'undefined' && App.updateNotificationBadge) {
      App.updateNotificationBadge();
    }
  },

  getUnreadNotificationCount() {
    const notifs = this._load().notifications || [];
    return notifs.filter(n => !n.read).length;
  },

  // --- Saved Pipelines ---
  getSavedPipelines() {
    return (this._load().savedPipelines || []).slice();
  },

  savePipeline(pipeline) {
    const s = this._load();
    if (!s.savedPipelines) s.savedPipelines = [];
    const existingIdx = s.savedPipelines.findIndex(p => p.id === pipeline.id);
    if (existingIdx !== -1) {
      s.savedPipelines[existingIdx] = pipeline;
    } else {
      s.savedPipelines.push(pipeline);
    }
    this._save(s);

    if (AuthManager.isAuthenticated()) {
      fetch('/api/user/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
        body: JSON.stringify({ pipeline })
      }).catch(e => console.warn('[AppState] Pipeline sync error:', e));
    }

    this.addNotification('Pipeline Saved', `Pipeline "${pipeline.name}" saved to library.`, 'success');
  },

  duplicateSavedPipeline(id) {
    const s = this._load();
    const orig = (s.savedPipelines || []).find(p => p.id === id);
    if (!orig) return null;
    const copy = {
      ...JSON.parse(JSON.stringify(orig)),
      id: `pipe_${Date.now()}`,
      name: `${orig.name} (Copy)`,
      lastExecuted: null,
      status: 'Ready'
    };
    s.savedPipelines.push(copy);
    this._save(s);

    if (AuthManager.isAuthenticated()) {
      fetch('/api/user/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
        body: JSON.stringify({ pipeline: copy })
      }).catch(e => console.warn('[AppState] Pipeline copy sync error:', e));
    }

    this.addNotification('Pipeline Duplicated', `Created copy "${copy.name}".`, 'info');
    return copy;
  },

  deleteSavedPipeline(id) {
    const s = this._load();
    s.savedPipelines = (s.savedPipelines || []).filter(p => p.id !== id);
    this._save(s);

    if (AuthManager.isAuthenticated()) {
      fetch(`/api/user/pipelines/${id}`, {
        method: 'DELETE',
        headers: AuthManager.getAuthHeaders()
      }).catch(e => console.warn('[AppState] Pipeline delete sync error:', e));
    }

    this.addNotification('Pipeline Deleted', 'Pipeline removed from library.', 'info');
  },

  updatePipelineExecution(id, success = true) {
    const s = this._load();
    const p = (s.savedPipelines || []).find(x => x.id === id);
    if (p) {
      p.lastExecuted = Date.now();
      p.status = success ? 'Success' : 'Failed';
      this._save(s);

      if (AuthManager.isAuthenticated()) {
        fetch('/api/user/pipelines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
          body: JSON.stringify({ pipeline: p })
        }).catch(e => console.warn('[AppState] Pipeline exec sync error:', e));
      }
    }
  },

  // --- Real Stats Helpers ---
  getStats() {
    const s = this._load();
    const history = s.history || [];
    const savedPipelines = s.savedPipelines || [];

    let realWords = 0;
    history.forEach(item => {
      if (item.input) {
        realWords += item.input.trim().split(/\s+/).filter(Boolean).length;
      }
    });

    const success = s.stats?.successfulOperations || history.length;
    const failed = s.stats?.failedOperations || 0;
    const totalOps = success + failed;

    let successRateStr = '100%';
    if (totalOps === 0) {
      successRateStr = 'No data yet';
    } else {
      const pct = Math.round((success / totalOps) * 100);
      successRateStr = `${pct}%`;
    }

    return {
      totalTransforms: history.length,
      pipelinesCreated: savedPipelines.length,
      wordsProcessed: realWords,
      successRate: successRateStr,
      successfulOperations: success,
      failedOperations: failed,
      usageByType: s.stats?.usageByType || {}
    };
  },

  // --- Practice Sets & Quiz Storage ---
  getPracticeSets() {
    const s = this._load();
    let sets = s.practiceSets || [];
    return sets.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  getPracticeSet(id) {
    const sets = this.getPracticeSets();
    return sets.find(s => s.id === id) || null;
  },

  savePracticeSet(set) {
    const s = this._load();
    if (!s.practiceSets) s.practiceSets = [];
    if (!set.id) set.id = `pset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    if (!set.createdAt) set.createdAt = Date.now();
    if (!set.attempts) set.attempts = [];
    set.questionCount = Array.isArray(set.questions) ? set.questions.length : (set.questionCount || 0);

    const idx = s.practiceSets.findIndex(x => x.id === set.id);
    if (idx !== -1) {
      s.practiceSets[idx] = set;
    } else {
      s.practiceSets.unshift(set);
    }

    this._save(s);

    if (AuthManager.isAuthenticated()) {
      fetch('/api/user/practice-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
        body: JSON.stringify({ set })
      }).catch(e => console.warn('[AppState] Quiz set sync error:', e));
    }

    this.addNotification('Practice Set Saved', `Practice set "${set.title}" saved with ${set.questions?.length || 0} questions.`, 'success');
    return set;
  },

  renamePracticeSet(id, newTitle) {
    const s = this._load();
    const set = (s.practiceSets || []).find(x => x.id === id);
    if (set) {
      set.title = newTitle.trim();
      this._save(s);

      if (AuthManager.isAuthenticated()) {
        fetch('/api/user/practice-sets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
          body: JSON.stringify({ set })
        }).catch(e => console.warn('[AppState] Quiz set rename sync error:', e));
      }

      this.addNotification('Practice Set Renamed', `Renamed to "${set.title}".`, 'info');
      return true;
    }
    return false;
  },

  deletePracticeSet(id) {
    const s = this._load();
    s.practiceSets = (s.practiceSets || []).filter(x => x.id !== id);
    this._save(s);

    if (AuthManager.isAuthenticated()) {
      fetch(`/api/user/practice-sets/${id}`, {
        method: 'DELETE',
        headers: AuthManager.getAuthHeaders()
      }).catch(e => console.warn('[AppState] Quiz set delete sync error:', e));
    }

    this.addNotification('Practice Set Deleted', 'Practice set removed from your library.', 'info');
  },

  recordQuizAttempt(setId, attempt) {
    const s = this._load();
    const set = (s.practiceSets || []).find(x => x.id === setId);
    if (set) {
      if (!set.attempts) set.attempts = [];
      if (!attempt.id) attempt.id = `att_${Date.now()}`;
      if (!attempt.timestamp) attempt.timestamp = Date.now();
      set.attempts.unshift(attempt);
      set.lastAttempt = attempt;
      this._save(s);

      if (AuthManager.isAuthenticated()) {
        fetch('/api/user/practice-attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...AuthManager.getAuthHeaders() },
          body: JSON.stringify({ setId, attempt })
        }).catch(e => console.warn('[AppState] Quiz attempt sync error:', e));
      }

      this.addNotification(
        'Quiz Attempt Saved',
        `Completed "${set.title}" with score ${attempt.score}% (${attempt.correctCount}/${attempt.totalQuestions}).`,
        attempt.score >= 70 ? 'success' : 'info'
      );
      return attempt;
    }
    return null;
  },

  getPracticeStats() {
    const sets = this.getPracticeSets();
    let totalAttempts = 0;
    let scoreSum = 0;
    let bestScore = 0;
    let lastActivity = null;

    sets.forEach(s => {
      if (s.createdAt && (!lastActivity || s.createdAt > lastActivity)) {
        lastActivity = s.createdAt;
      }
      (s.attempts || []).forEach(att => {
        totalAttempts++;
        scoreSum += (att.score || 0);
        if (att.score > bestScore) bestScore = att.score;
        if (att.timestamp && (!lastActivity || att.timestamp > lastActivity)) {
          lastActivity = att.timestamp;
        }
      });
    });

    const avgScore = totalAttempts > 0 ? Math.round(scoreSum / totalAttempts) : 0;

    return {
      totalSets: sets.length,
      totalAttempts,
      avgScore,
      bestScore: totalAttempts > 0 ? bestScore : 0,
      lastActivity,
      recentSets: sets.slice(0, 3)
    };
  },

  recordFailure() {
    const s = this._load();
    if (!s.stats) s.stats = this._defaults().stats;
    s.stats.failedOperations = (s.stats.failedOperations || 0) + 1;
    this._save(s);
  }
};

// ================================================================
//  3. Theme & UI Feedback Components
// ================================================================

const ThemeManager = {
  init() {
    const savedTheme = AppState.getPref('theme', 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateIcon(savedTheme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    AppState.updatePref('theme', next);
    this.updateIcon(next);
    Toast.show('info', 'Theme Switched', `${next === 'dark' ? 'Dark' : 'Light'} mode activated.`);
  },

  updateIcon(theme) {
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    }
  }
};

const Toast = {
  show(type, title, message, duration = 4000) {
    const icons = {
      success: 'ri-checkbox-circle-fill',
      error: 'ri-close-circle-fill',
      info: 'ri-information-fill',
      warning: 'ri-alert-fill'
    };
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="toast-icon ${icons[type] || icons.info}"></i>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-msg">${message}</div>` : ''}
      </div>
      <i class="toast-close ri-close-line" onclick="this.closest('.toast').remove()"></i>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ================================================================
//  4. Page Declarations & Route Configurations
// ================================================================

const PAGES = {
  // Public Landing / Overview
  dashboard: {
    title: 'Dashboard',
    icon: 'ri-dashboard-3-line',
    isProtected: false,
    render: () => renderDashboard(),
    afterRender: () => {}
  },

  // Authentication Pages
  login: {
    title: 'Sign In',
    icon: 'ri-login-box-line',
    isProtected: false,
    render: (opts) => renderLoginPage(opts),
    afterRender: () => {}
  },
  signup: {
    title: 'Create Account',
    icon: 'ri-user-add-line',
    isProtected: false,
    render: (opts) => renderSignupPage(opts),
    afterRender: () => {}
  },

  // Core Protected Features
  practice: {
    title: 'My Practice & Quizzes',
    icon: 'ri-questionnaire-line',
    isProtected: true,
    render: (opts) => renderPracticePage(opts),
    afterRender: () => { if (window.PracticePage) PracticePage.afterRender(); }
  },
  transform: {
    title: 'AI Transformer',
    icon: 'ri-magic-line',
    isProtected: true,
    render: (opts) => renderTransformPage(opts?.type),
    afterRender: () => {}
  },
  pipelines: {
    title: 'Pipeline Studio',
    icon: 'ri-flow-chart',
    isProtected: true,
    render: (opts) => renderPipelinesPage(opts),
    afterRender: () => {}
  },
  'saved-pipelines': {
    title: 'Saved Pipelines',
    icon: 'ri-folder-shared-line',
    isProtected: true,
    render: () => renderSavedPipelinesPage(),
    afterRender: () => {}
  },
  history: {
    title: 'Transformation History',
    icon: 'ri-history-line',
    isProtected: true,
    render: () => renderHistoryPage(),
    afterRender: () => {}
  },
  providers: {
    title: 'AI Providers',
    icon: 'ri-cpu-line',
    isProtected: true,
    render: () => renderProvidersPage(),
    afterRender: () => {}
  },
  analytics: {
    title: 'Analytics',
    icon: 'ri-bar-chart-2-line',
    isProtected: true,
    render: () => renderAnalyticsPage(),
    afterRender: () => {}
  },
  settings: {
    title: 'Settings',
    icon: 'ri-settings-4-line',
    isProtected: true,
    render: () => renderSettingsPage(),
    afterRender: () => {}
  },
  help: {
    title: 'Help & Support',
    icon: 'ri-question-line',
    isProtected: false,
    render: () => renderHelpPage(),
    afterRender: () => {}
  }
};

// ================================================================
//  5. Main Application Controller (App)
// ================================================================

const App = {
  _currentPage: 'dashboard',

  async init() {
    ThemeManager.init();
    this.initEventListeners();
    this.updateNotificationBadge();
    this.updateAPIStatus();

    // Initialize Authentication System
    await AuthManager.init();

    // Check URL Hash route if present (e.g. #login, #signup, #practice)
    const hash = (typeof window !== 'undefined' && window.location && window.location.hash) ? window.location.hash.replace('#', '').trim() : '';
    if (hash && PAGES[hash]) {
      this.navigate(hash);
    } else {
      this.navigate('dashboard');
    }
  },

  initEventListeners() {
    // Sidebar toggle (desktop collapse)
    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('collapsed');
      });
    }

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('mobile-open');
      });
    }

    // Sidebar navigation clicks
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) {
          this.navigate(page);
          document.getElementById('sidebar')?.classList.remove('mobile-open');
        }
      });
    });

    // Topbar Profile Dropdown Toggle
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', e => {
        e.stopPropagation();
        const menu = document.getElementById('profileDropdown');
        const notifMenu = document.getElementById('notifDropdown');
        notifMenu?.classList.remove('show');
        menu?.classList.toggle('show');
      });
    }

    // Notifications Dropdown Toggle
    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', e => {
        e.stopPropagation();
        const menu = document.getElementById('notifDropdown');
        const profileMenu = document.getElementById('profileDropdown');
        profileMenu?.classList.remove('show');
        menu?.classList.toggle('show');
        this.renderNotificationDropdown();
        AppState.markNotificationsRead();
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.topbar-dropdown-anchor')) {
        this.closeAllDropdowns();
      }
    });

    // Global Search Shortcut (Cmd+K / Ctrl+K)
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const s = document.getElementById('globalSearch');
        if (s) { s.focus(); s.select(); }
      }
    });

    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const val = searchInput.value.trim().toLowerCase();
          if (!val) return;
          if (typeof TRANSFORMATIONS !== 'undefined') {
            const matchOp = Object.values(TRANSFORMATIONS).find(t => t.id.includes(val) || t.label.toLowerCase().includes(val));
            if (matchOp) {
              this.navigateToTransform(matchOp.id);
              Toast.show('info', 'Command Search', `Opened ${matchOp.label}.`);
              return;
            }
          }
          this.navigate('history');
          setTimeout(() => {
            const hSearch = document.getElementById('historySearchInput');
            if (hSearch && window.HistoryPage) { hSearch.value = val; HistoryPage.onSearch(val); }
          }, 200);
        }
      });
    }
  },

  closeAllDropdowns() {
    document.getElementById('notifDropdown')?.classList.remove('show');
    document.getElementById('profileDropdown')?.classList.remove('show');
  },

  // Update Topbar and Profile UI according to Auth State
  updateAuthUI() {
    const isAuth = AuthManager.isAuthenticated();
    const user = AuthManager.getUser();

    // 1. Topbar Auth Actions Container
    let topbarAuthContainer = document.getElementById('topbarAuthActions');
    if (!topbarAuthContainer) {
      // Find where to insert it in topbar-right (before themeToggleBtn)
      const topbarRight = document.querySelector('.topbar-right');
      const themeBtn = document.getElementById('themeToggleBtn');
      if (topbarRight && themeBtn) {
        topbarAuthContainer = document.createElement('div');
        topbarAuthContainer.id = 'topbarAuthActions';
        topbarAuthContainer.className = 'topbar-auth-actions';
        topbarRight.insertBefore(topbarAuthContainer, themeBtn);
      }
    }

    if (topbarAuthContainer) {
      if (isAuth) {
        topbarAuthContainer.innerHTML = '';
      } else {
        topbarAuthContainer.innerHTML = `
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('login')" title="Sign In">
            <i class="ri-login-box-line"></i> <span>Sign In</span>
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('signup')" title="Create Account">
            <i class="ri-user-add-line"></i> <span>Sign Up</span>
          </button>
        `;
      }
    }

    // 2. User Avatar in Topbar
    const avatarEl = document.getElementById('profileBtn');
    if (avatarEl) {
      if (isAuth && user) {
        const initials = user.full_name
          ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
          : 'U';
        avatarEl.innerHTML = `<span>${initials}</span>`;
        avatarEl.className = 'user-avatar auth-logged-in';
        avatarEl.title = `${user.full_name} (${user.email})`;
      } else {
        avatarEl.innerHTML = `<i class="ri-user-line"></i>`;
        avatarEl.className = 'user-avatar auth-guest';
        avatarEl.title = 'Guest User — Click to Sign In';
      }
    }

    // 3. User Profile Dropdown Menu Content
    const dropdownMenu = document.getElementById('profileDropdown');
    if (dropdownMenu) {
      if (isAuth && user) {
        dropdownMenu.innerHTML = `
          <div class="profile-menu-header">
            <div class="profile-name">${escapeHtml(user.full_name)}</div>
            <div class="profile-sub">${escapeHtml(user.email)}</div>
            <div class="profile-badge-pill"><i class="ri-shield-check-fill text-green"></i> Authenticated Session</div>
          </div>
          <a href="#" onclick="App.navigate('settings'); return false;"><i class="ri-settings-4-line"></i> Settings & Preferences</a>
          <a href="#" onclick="App.navigate('practice'); return false;"><i class="ri-questionnaire-line"></i> My Practice & Quizzes</a>
          <a href="#" onclick="App.navigate('history'); return false;"><i class="ri-history-line"></i> Transformation History</a>
          <a href="#" onclick="App.navigate('providers'); return false;"><i class="ri-cpu-line"></i> AI Provider Setup</a>
          <a href="#" onclick="App.navigate('saved-pipelines'); return false;"><i class="ri-folder-shared-line"></i> Saved Pipelines</a>
          <a href="#" onclick="App.navigate('help'); return false;"><i class="ri-question-line"></i> Documentation & Support</a>
          <div class="dropdown-divider"></div>
          <a href="#" onclick="AuthManager.logout(); return false;" class="text-danger profile-logout-link">
            <i class="ri-logout-box-r-line"></i> Sign Out
          </a>
        `;
      } else {
        dropdownMenu.innerHTML = `
          <div class="profile-menu-header">
            <div class="profile-name">Guest User</div>
            <div class="profile-sub">Sign in to save quizzes & history</div>
          </div>
          <a href="#" onclick="App.navigate('login'); return false;" class="text-primary font-weight-bold">
            <i class="ri-login-box-line"></i> Sign In to Account
          </a>
          <a href="#" onclick="App.navigate('signup'); return false;">
            <i class="ri-user-add-line"></i> Create Free Account
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" onclick="App.navigate('help'); return false;"><i class="ri-question-line"></i> Documentation & Help</a>
        `;
      }
    }

    // 4. Sidebar User Status / Quick Logout Pill
    let sidebarUserPill = document.getElementById('sidebarUserPill');
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter && !sidebarUserPill) {
      sidebarUserPill = document.createElement('div');
      sidebarUserPill.id = 'sidebarUserPill';
      sidebarUserPill.className = 'sidebar-user-pill';
      sidebarFooter.prepend(sidebarUserPill);
    }

    if (sidebarUserPill) {
      if (isAuth && user) {
        sidebarUserPill.innerHTML = `
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${escapeHtml(user.full_name)}</div>
            <div class="sidebar-user-role">Active Account</div>
          </div>
          <button class="sidebar-logout-btn" onclick="AuthManager.logout()" title="Sign Out">
            <i class="ri-logout-box-r-line"></i>
          </button>
        `;
        sidebarUserPill.style.display = 'flex';
      } else {
        sidebarUserPill.innerHTML = `
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">Guest Mode</div>
          </div>
          <button class="sidebar-login-btn" onclick="App.navigate('login')" title="Sign In">
            <i class="ri-login-box-line"></i>
          </button>
        `;
        sidebarUserPill.style.display = 'flex';
      }
    }
  },

  updateNotificationBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    const count = AppState.getUnreadNotificationCount();
    if (count > 0) {
      badge.style.display = 'flex';
      badge.textContent = count > 9 ? '9+' : count;
    } else {
      badge.style.display = 'none';
    }
  },

  renderNotificationDropdown() {
    const listEl = document.getElementById('notifList');
    if (!listEl) return;
    const notifs = AppState.getNotifications();

    if (notifs.length === 0) {
      listEl.innerHTML = `
        <div class="empty-notif-box">
          <i class="ri-notification-off-line"></i>
          <div>No notifications yet</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map(n => {
      const typeIcons = {
        success: 'ri-checkbox-circle-fill text-green',
        error: 'ri-close-circle-fill text-red',
        info: 'ri-information-fill text-blue'
      };
      const timeAgo = formatTimeAgo(n.time);

      return `
        <div class="notif-item ${!n.read ? 'unread' : ''}">
          <div class="notif-icon"><i class="${typeIcons[n.type] || typeIcons.info}"></i></div>
          <div class="notif-content">
            <div class="notif-title">${escapeHtml(n.title)}</div>
            <div class="notif-msg">${escapeHtml(n.message)}</div>
            <div class="notif-time">${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Access Restriction Gate Card for Unauthenticated Users
  renderAccessGate(pageId) {
    const page = PAGES[pageId] || { title: 'Protected Feature', icon: 'ri-lock-2-line' };

    return `
    <div class="access-gate-wrapper">
      <div class="access-gate-card">
        <div class="access-gate-icon">
          <i class="ri-shield-keyhole-line"></i>
        </div>
        <div class="access-gate-badge">
          <i class="ri-lock-line"></i> Authentication Required
        </div>
        <h2 class="access-gate-title">Sign In to Access ${escapeHtml(page.title)}</h2>
        <p class="access-gate-desc">
          The <strong>${escapeHtml(page.title)}</strong> feature requires an active TransformAI user account. 
          Sign in to save your transformation records, generate personalized AI quizzes, and track your metrics securely.
        </p>

        <div class="access-gate-features">
          <div class="gate-feat-item"><i class="ri-check-line text-green"></i> Strict user-level data isolation via SQLite</div>
          <div class="gate-feat-item"><i class="ri-check-line text-green"></i> Automatic transformation history tracking</div>
          <div class="gate-feat-item"><i class="ri-check-line text-green"></i> Custom practice sets & interactive scoring</div>
        </div>

        <div class="access-gate-actions">
          <button class="btn btn-primary btn-lg" onclick="App.navigate('login', { redirect: '${pageId}' })">
            <i class="ri-login-box-line"></i> Sign In to Account
          </button>
          <button class="btn btn-secondary btn-lg" onclick="App.navigate('signup', { redirect: '${pageId}' })">
            <i class="ri-user-add-line"></i> Create Free Account
          </button>
        </div>

        <div class="access-gate-footer">
          <a href="#" onclick="App.navigate('dashboard'); return false;">
            <i class="ri-arrow-left-line"></i> Back to Public Dashboard
          </a>
        </div>
      </div>
    </div>
    `;
  },

  navigate(pageId, opts = {}) {
    const page = PAGES[pageId];
    if (!page) return;

    this.closeAllDropdowns();
    this._currentPage = pageId;

    // Check Route Protection
    if (page.isProtected && !AuthManager.isAuthenticated()) {
      const container = document.getElementById('pageContainer');
      if (container) {
        container.innerHTML = this.renderAccessGate(pageId);
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Update active nav items
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === pageId);
      });

      // Update topbar breadcrumbs
      const bcIcon = document.querySelector('.breadcrumb-icon i');
      const bcLabel = document.getElementById('breadcrumbLabel');
      if (bcIcon) bcIcon.className = page.icon;
      if (bcLabel) bcLabel.textContent = `${page.title} (Authentication Required)`;

      Toast.show('warning', 'Access Restricted', `Please sign in to access ${page.title}.`);
      return;
    }

    // Update active nav items
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });

    // Update topbar breadcrumbs
    const bcIcon = document.querySelector('.breadcrumb-icon i');
    const bcLabel = document.getElementById('breadcrumbLabel');
    if (bcIcon) bcIcon.className = page.icon;
    if (bcLabel) bcLabel.textContent = page.title;

    // Render into page container
    const container = document.getElementById('pageContainer');
    if (container) {
      container.innerHTML = page.render(opts);
      page.afterRender?.();
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  navigateToTransform(type) {
    this.navigate('transform', { type });
  },

  updateAPIStatus() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (!dot || !text) return;

    if (typeof API === 'undefined') return;

    const provider = API.getProvider();
    const model = API.getModel ? API.getModel() : 'v1';

    if (provider === 'local') {
      dot.className = 'status-dot online';
      text.textContent = 'Local Engine (Active)';
    } else if (API.isConfigured(provider)) {
      dot.className = 'status-dot online';
      text.textContent = `${provider.toUpperCase()} (${model})`;
    } else {
      dot.className = 'status-dot offline';
      text.textContent = `${provider.toUpperCase()} (No Key)`;
    }
  }
};

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => App.init());
}

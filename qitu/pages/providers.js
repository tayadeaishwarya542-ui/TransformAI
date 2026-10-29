// ================================================================
//  AI Providers Page — Dedicated Provider Hub & Credentials
// ================================================================

function renderProvidersPage() {
  const currentProvider = API.getProvider();
  const currentModel = API.getModel();

  return `
  <div class="page-view">
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <div class="page-title">AI Provider Hub <span class="grad-text">✦</span></div>
          <div class="page-desc">Configure multi-provider routing across Local NLP Fallback, OpenAI, Gemini, and Claude.</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="ProvidersPage.saveAll()">
          <i class="ri-save-line"></i> Save Configurations
        </button>
      </div>
    </div>

    <!-- Provider Selection Cards Grid -->
    <div class="provider-cards-grid">
      ${API.PROVIDERS.map(p => `
        <div class="provider-card ${p.id === currentProvider ? 'active' : ''}" onclick="ProvidersPage.selectProvider('${p.id}')">
          <div class="flex items-center justify-between mb-2">
            <span class="provider-card-name">${p.name}</span>
            <span class="badge ${p.id === 'local' ? 'badge-green' : 'badge-purple'}">${p.badge}</span>
          </div>
          <div class="provider-card-desc">${p.desc}</div>
          <div style="margin-top:12px;font-size:12px;font-weight:600;color:${p.id === currentProvider ? 'var(--accent-primary)' : 'var(--text-muted)'}">
            ${p.id === currentProvider ? '✓ Currently Active' : 'Click to Activate'}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Active Provider Detailed Configuration -->
    <div class="settings-card full-width" style="margin-top:24px;">
      <div class="settings-card-header">
        <div class="settings-card-title">
          <i class="ri-key-2-line" style="color:var(--accent-primary)"></i> Credentials & Model Routing
        </div>
        <div class="settings-card-desc">Keys are stored locally in your browser or can be set as environment variables on your server.</div>
      </div>
      <div class="settings-card-body">
        ${currentProvider === 'local' ? `
          <div class="p-4" style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.25);border-radius:var(--radius-md);color:#6ee7b7;line-height:1.6;">
            <div style="font-weight:700;font-size:15px;margin-bottom:6px;"><i class="ri-shield-check-fill"></i> Local Fallback Engine is Fully Operational</div>
            <div>The built-in deterministic NLP engine executes 100% offline directly in your browser. All 8 transformations (Summarization, Tone, Polyglot Translation, Format Conversion, Grammar Diff, Expansion, Simplification, Quality Scoring) function with zero external API calls or latency.</div>
          </div>
        ` : `
          <div class="grid grid-2 gap-4">
            <div class="form-group mb-0">
              <label class="form-label">${currentProvider.toUpperCase()} API Key</label>
              <div class="input-with-icon">
                <input type="password" class="form-input" id="activeProviderKeyInput"
                  placeholder="Paste your ${currentProvider.toUpperCase()} API key..."
                  value="${escapeHtml(API.getKey(currentProvider))}" />
                <button class="icon-toggle" id="activeKeyEyeBtn" onclick="ProvidersPage.toggleKeyVisibility()">
                  <i class="ri-eye-line"></i>
                </button>
              </div>
            </div>

            <div class="form-group mb-0">
              <label class="form-label">Default Model</label>
              <select class="form-select" id="activeProviderModelSelect">
                ${(API.PROVIDERS.find(p => p.id === currentProvider)?.models || []).map(m => `
                  <option value="${m.id}" ${m.id === currentModel ? 'selected' : ''}>${m.label}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="flex gap-2 items-center" style="margin-top:16px;">
            <button class="btn btn-secondary btn-sm" onclick="ProvidersPage.testConnection()">
              <i class="ri-pulse-line"></i> Test Provider Connection
            </button>
            <div id="providerTestStatus" style="font-size:13px;font-weight:500;"></div>
          </div>
        `}
      </div>
    </div>

    <!-- Security & Architecture Guarantee -->
    <div class="settings-card full-width" style="margin-top:20px;">
      <div class="settings-card-header">
        <div class="settings-card-title"><i class="ri-lock-line" style="color:#6ee7b7"></i> Security Architecture</div>
      </div>
      <div class="settings-card-body" style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
        TransformAI operates under a strict privacy-first architecture. Any credentials you provide remain encrypted in your browser's private local storage and are transmitted directly over HTTPS to provider endpoints, or routed through your self-hosted backend proxy.
      </div>
    </div>

  </div>`;
}

const ProvidersPage = {
  selectProvider(id) {
    API.setProvider(id);
    App.updateAPIStatus();
    App.navigate('providers');
    Toast.show('info', 'Active Provider Updated', `Switched to ${id.toUpperCase()}.`);
  },

  toggleKeyVisibility() {
    const inp = document.getElementById('activeProviderKeyInput');
    const btn = document.getElementById('activeKeyEyeBtn');
    if (!inp || !btn) return;
    if (inp.type === 'password') {
      inp.type = 'text';
      btn.innerHTML = '<i class="ri-eye-off-line"></i>';
    } else {
      inp.type = 'password';
      btn.innerHTML = '<i class="ri-eye-line"></i>';
    }
  },

  async testConnection() {
    const current = API.getProvider();
    const key = document.getElementById('activeProviderKeyInput')?.value?.trim();
    if (current !== 'local') {
      API.setKey(current, key);
    }

    const st = document.getElementById('providerTestStatus');
    if (st) st.innerHTML = '<span style="color:var(--text-muted);"><i class="ri-loader-4-line spinner"></i> Testing...</span>';

    const res = await API.testConnection(current);
    if (st) {
      if (res.success) {
        st.innerHTML = `<span style="color:#34d399;"><i class="ri-check-line"></i> ${res.message}</span>`;
        Toast.show('success', 'Verified', res.message);
      } else {
        st.innerHTML = `<span style="color:#f87171;"><i class="ri-close-line"></i> ${res.message}</span>`;
        Toast.show('error', 'Verification Failed', res.message);
      }
    }
  },

  saveAll() {
    const current = API.getProvider();
    if (current !== 'local') {
      const key = document.getElementById('activeProviderKeyInput')?.value?.trim();
      const model = document.getElementById('activeProviderModelSelect')?.value;
      if (key !== undefined) API.setKey(current, key);
      if (model) API.setModel(current, model);
    }
    App.updateAPIStatus();
    Toast.show('success', 'Saved', 'Provider settings persisted.');
  }
};

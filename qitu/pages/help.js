// ================================================================
//  Help & Support Page — Documentation, Shortcuts, and FAQ
// ================================================================

function renderHelpPage() {
  return `
  <div class="page-view">
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <div class="page-title">Help & Documentation <span class="grad-text">✦</span></div>
          <div class="page-desc">Complete user guide, transformation specifications, and workflow shortcuts.</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigate('dashboard')">
          <i class="ri-home-4-line"></i> Back to Dashboard
        </button>
      </div>
    </div>

    <!-- Quick Shortcuts Card -->
    <div class="settings-card full-width" style="margin-bottom:24px;">
      <div class="settings-card-header">
        <div class="settings-card-title"><i class="ri-command-line" style="color:var(--accent-primary)"></i> Keyboard Shortcuts</div>
      </div>
      <div class="settings-card-body">
        <div class="grid grid-2 gap-4">
          <div class="flex items-center justify-between p-3" style="background:var(--bg-elevated);border-radius:var(--radius-sm);">
            <span style="font-size:13.5px;color:var(--text-primary);">Global Command Search</span>
            <kbd class="badge badge-purple" style="font-size:12px;padding:3px 8px;">⌘ K / Ctrl K</kbd>
          </div>
          <div class="flex items-center justify-between p-3" style="background:var(--bg-elevated);border-radius:var(--radius-sm);">
            <span style="font-size:13.5px;color:var(--text-primary);">Search Submission</span>
            <kbd class="badge badge-purple" style="font-size:12px;padding:3px 8px;">Enter</kbd>
          </div>
        </div>
      </div>
    </div>

    <!-- 8 Engines Reference -->
    <div class="settings-card full-width" style="margin-bottom:24px;">
      <div class="settings-card-header">
        <div class="settings-card-title"><i class="ri-book-read-line" style="color:#6ee7b7"></i> 8 Core Transformation Specifications</div>
      </div>
      <div class="settings-card-body">
        <div class="grid grid-2 gap-4">
          ${getTransformationTypes().map(t => `
            <div class="p-3" style="background:var(--bg-elevated);border-radius:var(--radius-sm);">
              <div class="flex items-center gap-2 mb-1">
                <i class="${t.icon}" style="color:var(--accent-primary);font-size:18px;"></i>
                <strong style="color:var(--text-primary);">${t.label}</strong>
              </div>
              <div style="font-size:12px;color:var(--text-muted);">${t.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="settings-card full-width">
      <div class="settings-card-header">
        <div class="settings-card-title"><i class="ri-questionnaire-line" style="color:#fbbf24"></i> Frequently Asked Questions</div>
      </div>
      <div class="settings-card-body">
        <div style="display:flex;flex-direction:column;gap:14px;font-size:13.5px;color:var(--text-secondary);line-height:1.6;">
          <div>
            <strong style="color:var(--text-primary);">How does the Local Fallback Engine work?</strong>
            <p style="margin-top:2px;color:var(--text-muted);">TransformAI incorporates pure JavaScript analytical NLP algorithms (extractive sentence frequency ranking, lexical dictionaries, grammar rules, Flesch readability scoring) that execute entirely in-browser with zero API keys and zero cost.</p>
          </div>
          <div>
            <strong style="color:var(--text-primary);">What is the benefit of Multi-Step Pipelines?</strong>
            <p style="margin-top:2px;color:var(--text-muted);">Pipelines allow you to chain transformations in a single pass. For example: Grammar Correction → Professional Tone → Executive Summary → Hindi Translation. Each stage automatically passes its output to the next.</p>
          </div>
          <div>
            <strong style="color:var(--text-primary);">Are my API keys secure?</strong>
            <p style="margin-top:2px;color:var(--text-muted);">Yes. Keys entered in Settings are kept only in your private browser localStorage or can be passed via `.env` to the Node.js server proxy. They are never sent to external servers other than the selected provider.</p>
          </div>
        </div>
      </div>
    </div>

  </div>`;
}

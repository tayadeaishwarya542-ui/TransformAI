// ================================================================
//  Transform Page — All 8 Operations, Dynamic Options & Visual Diff
// ================================================================

let _currentTransformType = 'summarize';
let _isTransforming = false;
let _outputText = '';
let _outputExtraMeta = null;
let _activeOutputTab = 'clean'; // 'clean' | 'diff' | 'json'

function renderTransformPage(preSelectedType) {
  if (preSelectedType && TRANSFORMATIONS[preSelectedType]) {
    _currentTransformType = preSelectedType;
  }

  const types = getTransformationTypes();
  const provider = API.getProvider();
  const model = API.getModel();
  const providerNames = { local: 'Local Fallback Engine', openai: 'OpenAI', gemini: 'Google Gemini', anthropic: 'Anthropic Claude' };

  return `
  <div class="page-view">
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <div class="page-title">Transform Content <span class="grad-text">✦</span></div>
          <div class="page-desc">Execute state-of-the-art content transformation with verified deterministic fallback.</div>
        </div>
        <div class="flex gap-2 items-center flex-wrap">
          <div class="badge badge-purple" style="cursor:pointer;" onclick="App.navigate('settings')" title="Click to configure AI providers in Settings">
            <i class="ri-cpu-line"></i> ${providerNames[provider] || provider} (${model})
          </div>
          <button class="btn btn-secondary btn-sm" onclick="TransformPage.clearAll()">
            <i class="ri-delete-bin-line"></i> Clear
          </button>
          <button class="btn btn-secondary btn-sm" onclick="TransformPage.loadExample()">
            <i class="ri-lightbulb-flash-line"></i> Load Example
          </button>
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;margin:0;">
            <i class="ri-upload-2-line"></i> Import File
            <input type="file" id="fileImporter" accept=".txt,.md,.json,.csv" style="display:none;" onchange="TransformPage.loadFile(event)" />
          </label>
        </div>
      </div>
    </div>

    <!-- Transformation Type Selector (All 8 Operations) -->
    <div class="transform-options">
      <div>
        <div class="form-label" style="margin-bottom:10px">Choose Transformation Operation</div>
        <div class="transform-grid" id="transformGrid">
          ${types.map(t => `
            <button class="transform-type-btn ${t.id === _currentTransformType ? 'selected' : ''}"
              onclick="TransformPage.selectType('${t.id}')"
              id="type-btn-${t.id}" title="${t.desc}">
              <span class="t-icon"><i class="${t.icon}"></i></span>
              <span class="t-label">${t.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Dynamic Options Panel -->
      <div class="transform-extra-options" id="extraOptions">
        ${renderExtraOptions(_currentTransformType)}
      </div>

      <!-- Run Action -->
      <button class="btn btn-primary btn-lg w-full transform-run-btn" id="runTransformBtn" onclick="TransformPage.run()">
        <span class="btn-text"><i class="ri-magic-line"></i> Transform Content</span>
        <span class="btn-spinner"><i class="ri-loader-4-line"></i> Processing...</span>
      </button>
    </div>

    <!-- Split Input / Output Workspace -->
    <div class="transform-workspace">
      <!-- Input Panel -->
      <div class="editor-panel">
        <div class="editor-header">
          <div class="editor-title">
            <i class="ri-input-cursor-move"></i> Input Content
          </div>
          <div class="editor-actions">
            <button class="btn btn-primary btn-xs" onclick="QuizModal.openFromInput()" id="btnGenerateQuizTop" style="background: linear-gradient(135deg, #7c3aed, #06b6d4); font-weight: 600; padding: 4px 10px; border-radius: 6px; box-shadow: 0 2px 8px rgba(124,58,237,0.3);" title="Analyze content & generate practice questions">
              <i class="ri-questionnaire-line"></i> Generate MCQs & Practice Questions
            </button>
            <span class="word-count" id="inputWordCount">0 words</span>
            <span class="char-count" id="inputCharCount">0 chars</span>
            <button class="icon-btn" onclick="TransformPage.pasteFromClipboard()" title="Paste from clipboard">
              <i class="ri-clipboard-line"></i>
            </button>
          </div>
        </div>
        <textarea
          class="editor-textarea"
          id="inputContent"
          placeholder="Paste or type your content here, or load a sample above..."
          oninput="TransformPage.updateWordCount()"></textarea>
      </div>

      <!-- Output Panel -->
      <div class="editor-panel">
        <div class="editor-header">
          <div class="editor-title">
            <i class="ri-sparkling-fill" style="color:var(--accent-primary)"></i> Generated Output
            <span class="badge badge-green" id="outputModelBadge" style="display:none;margin-left:8px;"></span>
          </div>
          <div class="editor-actions" id="outputActions" style="display:none;">
            <span class="word-count" id="outputWordCount" style="display:none;"><strong id="outputWC">0 words</strong></span>
            <button class="icon-btn" onclick="TransformPage.copyOutput()" title="Copy to clipboard">
              <i class="ri-file-copy-line"></i>
            </button>
            <div class="dropdown" style="position:relative;display:inline-block;">
              <button class="icon-btn" onclick="TransformPage.toggleExportMenu()" title="Export formats">
                <i class="ri-download-2-line"></i>
              </button>
              <div class="dropdown-menu" id="exportDropdown" style="display:none;">
                <a href="#" onclick="TransformPage.exportAs('txt'); return false;"><i class="ri-file-text-line"></i> Plain Text (.txt)</a>
                <a href="#" onclick="TransformPage.exportAs('md'); return false;"><i class="ri-markdown-line"></i> Markdown (.md)</a>
                <a href="#" onclick="TransformPage.exportAs('json'); return false;"><i class="ri-code-s-slash-line"></i> JSON (.json)</a>
                <a href="#" onclick="TransformPage.exportAs('html'); return false;"><i class="ri-html5-line"></i> Standalone HTML (.html)</a>
              </div>
            </div>
            <button class="icon-btn" onclick="TransformPage.sendToInput()" title="Send output back to input for iterative refinement">
              <i class="ri-arrow-left-line"></i>
            </button>
          </div>
        </div>

        <!-- Output Tabs (if diff or special format available) -->
        <div class="output-tabs-bar" id="outputTabsBar" style="display:none;">
          <button class="output-tab active" id="tabBtnClean" onclick="TransformPage.switchTab('clean')">Clean Output</button>
          <button class="output-tab" id="tabBtnDiff" onclick="TransformPage.switchTab('diff')" style="display:none;">Visual Diff</button>
        </div>

        <div class="output-placeholder" id="outputPlaceholder">
          <i class="ri-magic-line"></i>
          <div>Transformed content will appear here</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Select an operation above and click "Transform Content"</div>
        </div>

        <div class="output-content" id="outputText" style="display:none;"></div>
        <div class="output-content diff-view" id="outputDiffView" style="display:none;"></div>
      </div>
    </div>
  </div>`;
}

// Render dynamic options for current transformation
function renderExtraOptions(typeId) {
  const def = TRANSFORMATIONS[typeId];
  if (!def || !def.extraOptions || def.extraOptions.length === 0) return '';

  return `
    <div class="extra-options-row">
      ${def.extraOptions.map(opt => `
        <div class="form-group mb-0" style="min-width:180px;flex:1;">
          <label class="form-label">${opt.label}</label>
          ${opt.type === 'select' ? `
            <select class="form-select" id="opt-${opt.id}">
              ${opt.choices.map(c => {
                const val = typeof c === 'object' ? c.value : c;
                const lbl = typeof c === 'object' ? c.label : capitalize(c);
                const isSelected = val === opt.default ? 'selected' : '';
                return `<option value="${val}" ${isSelected}>${lbl}</option>`;
              }).join('')}
            </select>
          ` : `
            <input type="${opt.type || 'text'}" class="form-input" id="opt-${opt.id}" value="${opt.default || ''}" />
          `}
        </div>
      `).join('')}
    </div>
  `;
}

// Controller
const TransformPage = {
  selectType(typeId) {
    if (!TRANSFORMATIONS[typeId]) return;
    _currentTransformType = typeId;

    document.querySelectorAll('.transform-type-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.id === `type-btn-${typeId}`);
    });

    const extra = document.getElementById('extraOptions');
    if (extra) extra.innerHTML = renderExtraOptions(typeId);
  },

  getOptions() {
    const def = TRANSFORMATIONS[_currentTransformType];
    const opts = {};
    if (!def || !def.extraOptions) return opts;

    def.extraOptions.forEach(opt => {
      const el = document.getElementById(`opt-${opt.id}`);
      if (el) opts[opt.id] = el.value;
    });
    return opts;
  },

  async run() {
    if (_isTransforming) return;
    const inp = document.getElementById('inputContent');
    const input = inp?.value?.trim();

    if (!input) {
      Toast.show('warning', 'Empty Input', 'Please enter or paste content to transform.');
      inp?.focus();
      return;
    }

    const opts = this.getOptions();
    _isTransforming = true;
    const btn = document.getElementById('runTransformBtn');
    btn?.classList.add('loading');
    if (btn) btn.disabled = true;

    const placeholder = document.getElementById('outputPlaceholder');
    const outputText  = document.getElementById('outputText');
    const diffView    = document.getElementById('outputDiffView');
    const outputActions = document.getElementById('outputActions');
    const outputModelBadge = document.getElementById('outputModelBadge');
    const outputWC = document.getElementById('outputWordCount');
    const tabsBar = document.getElementById('outputTabsBar');
    const tabDiff = document.getElementById('tabBtnDiff');

    if (placeholder) placeholder.style.display = 'none';
    if (diffView) diffView.style.display = 'none';
    if (outputText) {
      outputText.style.display = 'block';
      outputText.innerHTML = '<span class="cursor-blink"></span>';
    }
    _outputText = '';
    _outputExtraMeta = null;

    try {
      const response = await API.executeTransform({
        type: _currentTransformType,
        input,
        opts,
        onChunk: (chunk, full) => {
          _outputText = full;
          if (outputText && _currentTransformType !== 'quality') {
            outputText.innerHTML = escapeHtml(full).replace(/\n/g, '<br>') + '<span class="cursor-blink"></span>';
            outputText.scrollTop = outputText.scrollHeight;
          }
        },
        onDone: (full, extraMeta) => {
          _outputText = full;
          _outputExtraMeta = extraMeta;

          // Render output appropriately
          this.renderFormattedOutput(full, extraMeta);

          if (outputActions) outputActions.style.display = 'flex';
          if (outputModelBadge) {
            outputModelBadge.style.display = 'inline-flex';
            outputModelBadge.textContent = `${API.getProvider().toUpperCase()}: ${API.getModel()}`;
          }
          if (outputWC) {
            outputWC.style.display = 'block';
            document.getElementById('outputWC').textContent = wordCount(full) + ' words';
          }

          // Handle diff tab for grammar
          if (_currentTransformType === 'grammar' && extraMeta?.diffHtml) {
            if (tabsBar) tabsBar.style.display = 'flex';
            if (tabDiff) tabDiff.style.display = 'inline-block';
            if (diffView) diffView.innerHTML = extraMeta.diffHtml.replace(/\n/g, '<br>');
          } else {
            if (tabsBar) tabsBar.style.display = 'none';
          }

          // Save to AppState history
          AppState.addHistory({
            type: _currentTransformType,
            opts,
            input,
            output: full,
            provider: API.getProvider(),
            model: API.getModel(),
            timestamp: Date.now()
          });

          Toast.show('success', 'Transformation Complete', `${TRANSFORMATIONS[_currentTransformType].label} generated.`);
        }
      });
    } catch (err) {
      if (outputText) {
        outputText.innerHTML = `
          <div class="error-banner">
            <i class="ri-error-warning-line"></i>
            <div style="flex:1;">
              <strong>Transformation Error:</strong> ${escapeHtml(err.message)}
              <div style="margin-top:10px;display:flex;gap:8px;">
                <button class="btn btn-sm btn-outline" onclick="TransformPage.run()"><i class="ri-restart-line"></i> Retry Request</button>
                ${_currentTransformType === 'grammar' ? '<button class="btn btn-sm btn-primary" onclick="TransformPage.fallbackToOffline()"><i class="ri-cpu-line"></i> Use Offline Fallback</button>' : ''}
              </div>
            </div>
          </div>
        `;
      }
      Toast.show('error', 'Transformation Failed', err.message);
    } finally {
      _isTransforming = false;
      btn?.classList.remove('loading');
      if (btn) btn.disabled = false;
    }
  },

  renderFormattedOutput(text, extraMeta) {
    const outputText = document.getElementById('outputText');
    if (!outputText) return;

    // Quality Scoring visual cards
    // Grammar engine attribution & badge handling
    if (_currentTransformType === 'grammar') {
      const modelBadge = document.getElementById('outputModelBadge');
      if (modelBadge && extraMeta) {
        modelBadge.style.display = 'inline-flex';
        if (extraMeta.engineUsed === 'ai') {
          modelBadge.className = 'badge badge-green';
          modelBadge.innerHTML = `<i class="ri-sparkling-fill"></i> ${extraMeta.engineLabel || 'AI-Powered'}`;
        } else if (extraMeta.engineUsed === 'offline-fallback') {
          modelBadge.className = 'badge badge-amber';
          modelBadge.innerHTML = `<i class="ri-alert-line"></i> ${extraMeta.engineLabel || 'Offline Fallback'} <button class="retry-ai-btn" onclick="TransformPage.retryWithAI()" title="Retry with AI"><i class="ri-restart-line"></i> Retry AI</button>`;
        } else {
          modelBadge.className = 'badge badge-gray';
          modelBadge.innerHTML = `<i class="ri-cpu-line"></i> ${extraMeta.engineLabel || 'Offline Rule-Based'}`;
        }
      }
    }

    if (_currentTransformType === 'quality') {
      try {
        const scoreData = extraMeta?.scoreData || JSON.parse(text);
        outputText.innerHTML = this.buildQualityCardHtml(scoreData);
        return;
      } catch (e) {
        outputText.innerHTML = `<pre class="code-block">${escapeHtml(text)}</pre>`;
        return;
      }
    }

    // JSON Formatting & Validation
    if (_currentTransformType === 'convert' && this.getOptions().targetFormat === 'json') {
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        outputText.innerHTML = `
          <div class="json-header-badge"><i class="ri-check-line"></i> Valid JSON Output (RFC 8259)</div>
          <pre class="code-block">${escapeHtml(formatted)}</pre>
        `;
        return;
      } catch {
        outputText.innerHTML = `<pre class="code-block">${escapeHtml(text)}</pre>`;
        return;
      }
    }

    // Markdown or Standard text formatting
    const formatted = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)(<br>|\n|$)/g, '<h4 class="out-h4">$1</h4>')
      .replace(/## (.*?)(<br>|\n|$)/g, '<h3 class="out-h3">$1</h3>')
      .replace(/# (.*?)(<br>|\n|$)/g, '<h2 class="out-h2">$1</h2>')
      .replace(/\n/g, '<br>');

    outputText.innerHTML = formatted;
  },

  buildQualityCardHtml(data) {
    const score = data.overall || 0;
    const scoreColor = score >= 80 ? '#34d399' : (score >= 60 ? '#fbbf24' : '#f87171');
    const badgeText = data.isHeuristic ? 'Analytical Heuristic Engine' : 'AI Evaluator';

    const b = data.breakdown || {};
    const categories = [
      { key: 'grammar', label: 'Grammar & Mechanics', val: b.grammar || 0 },
      { key: 'clarity', label: 'Clarity & Conciseness', val: b.clarity || 0 },
      { key: 'readability', label: 'Readability (Flesch Index)', val: b.readability || 0 },
      { key: 'coherence', label: 'Coherence & Logical Flow', val: b.coherence || 0 },
      { key: 'structure', label: 'Structural Formatting', val: b.structure || 0 },
      { key: 'relevance', label: 'Vocabulary & Relevance', val: b.relevance || 0 }
    ];

    return `
      <div class="quality-report-card">
        <div class="quality-top-row">
          <div class="quality-gauge" style="border-color:${scoreColor}">
            <div class="quality-gauge-score" style="color:${scoreColor}">${score}</div>
            <div class="quality-gauge-label">/100</div>
          </div>
          <div class="quality-summary-info">
            <div class="flex items-center gap-2">
              <span class="badge badge-purple">${badgeText}</span>
              <span class="badge badge-cyan">Flesch Ease: ${data.fleschScore || score}/100</span>
            </div>
            <div class="quality-explanation">${data.explanation || ''}</div>
          </div>
        </div>

        <div class="quality-metrics-grid">
          ${categories.map(c => `
            <div class="metric-row">
              <div class="metric-label">
                <span>${c.label}</span>
                <span class="metric-val">${c.val}%</span>
              </div>
              <div class="metric-bar-bg">
                <div class="metric-bar-fill" style="width:${c.val}%;background:${c.val >= 75 ? '#34d399' : (c.val >= 55 ? '#fbbf24' : '#f87171')}"></div>
              </div>
            </div>
          `).join('')}
        </div>

        ${data.suggestions && data.suggestions.length > 0 ? `
          <div class="quality-suggestions">
            <div class="suggestions-title"><i class="ri-lightbulb-line"></i> Actionable Improvement Suggestions</div>
            <ul>
              ${data.suggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  },

  switchTab(tab) {
    _activeOutputTab = tab;
    const tabClean = document.getElementById('tabBtnClean');
    const tabDiff = document.getElementById('tabBtnDiff');
    const outputText = document.getElementById('outputText');
    const diffView = document.getElementById('outputDiffView');

    if (tab === 'clean') {
      tabClean?.classList.add('active');
      tabDiff?.classList.remove('active');
      if (outputText) outputText.style.display = 'block';
      if (diffView) diffView.style.display = 'none';
    } else {
      tabDiff?.classList.add('active');
      tabClean?.classList.remove('active');
      if (outputText) outputText.style.display = 'none';
      if (diffView) diffView.style.display = 'block';
    }
  },

  clearAll() {
    const inp = document.getElementById('inputContent');
    const outputText = document.getElementById('outputText');
    const diffView = document.getElementById('outputDiffView');
    const placeholder = document.getElementById('outputPlaceholder');
    const outputActions = document.getElementById('outputActions');
    const outputModelBadge = document.getElementById('outputModelBadge');
    const outputWC = document.getElementById('outputWordCount');
    const tabsBar = document.getElementById('outputTabsBar');

    if (inp) { inp.value = ''; this.updateWordCount(); }
    if (outputText) { outputText.style.display = 'none'; outputText.innerHTML = ''; }
    if (diffView) { diffView.style.display = 'none'; diffView.innerHTML = ''; }
    if (placeholder) placeholder.style.display = 'flex';
    if (outputActions) outputActions.style.display = 'none';
    if (outputModelBadge) outputModelBadge.style.display = 'none';
    if (outputWC) outputWC.style.display = 'none';
    if (tabsBar) tabsBar.style.display = 'none';
    _outputText = '';
    _outputExtraMeta = null;
  },

  loadExample() {
    const examples = {
      summarize: "Artificial intelligence (AI) is transforming software development through deterministic algorithms and machine learning models. Narrow AI tools automate repetitive workflows like code formatting and test generation. In contrast, Generative AI models synthesize complex reasoning to produce whole features and documentation. By 2026, over 80% of enterprise software teams report relying on multi-step AI orchestration pipelines to improve development velocity while reducing cognitive overhead.",
      tone: "Our platform is really good and users like it a lot. You should definitely try it out because it helps save time and does not cost very much. If you need any help just ask our support team.",
      translate: "TransformAI is an intelligent, high-efficiency platform engineered for real-time automated content transformation across multiple global languages.",
      convert: "TransformAI automatically converts documents into structured formats. It supports executive summaries, bullet points, numbered lists, structured JSON, professional emails, and formal reports.",
      grammar: "The team have completed teh assignment , and they was recieveing very good feedback from there client on tommorrow presentation .",
      expand: "Distributed systems require resilient queue management and predictable slot allocation.",
      simplify: "The physiological utility of exogenous adenosine triphosphate facilitates intracellular metabolic phosphorylation cascades within heterogeneous mitochondrial membrane matrices.",
      quality: "TransformAI provides robust automated content transformation pipelines. Furthermore, the architecture decouples presentation from backend execution, delivering high throughput and verified quality benchmarks."
    };

    const inp = document.getElementById('inputContent');
    if (inp) {
      inp.value = examples[_currentTransformType] || examples.summarize;
      this.updateWordCount();
      Toast.show('info', 'Sample Loaded', `Loaded sample text for ${TRANSFORMATIONS[_currentTransformType].label}.`);
    }
  },

  updateWordCount() {
    const inp = document.getElementById('inputContent');
    const wcEl = document.getElementById('inputWordCount');
    const ccEl = document.getElementById('inputCharCount');
    if (!inp || !wcEl || !ccEl) return;
    const text = inp.value;
    wcEl.textContent = wordCount(text) + ' words';
    ccEl.textContent = text.length + ' chars';
  },

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const inp = document.getElementById('inputContent');
      if (inp) {
        inp.value = text;
        this.updateWordCount();
        Toast.show('info', 'Pasted', 'Clipboard content loaded.');
      }
    } catch {
      Toast.show('warning', 'Clipboard Access', 'Clipboard read permission unavailable. Please use Ctrl+V directly.');
    }
  },

  loadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      Toast.show('error', 'File Too Large', 'Maximum file size is 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const inp = document.getElementById('inputContent');
      if (inp) {
        inp.value = e.target.result;
        this.updateWordCount();
        Toast.show('success', 'File Imported', `${file.name} (${wordCount(e.target.result)} words)`);
      }
    };
    reader.onerror = () => Toast.show('error', 'Import Failed', 'Could not read file.');
    reader.readAsText(file);
  },

  async copyOutput() {
    if (!_outputText) return;
    try {
      await navigator.clipboard.writeText(_outputText);
      Toast.show('success', 'Copied!', 'Output copied to clipboard.');
    } catch {
      Toast.show('error', 'Copy Failed', 'Unable to write to clipboard.');
    }
  },

  toggleExportMenu() {
    const menu = document.getElementById('exportDropdown');
    if (menu) {
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
  },

  exportAs(format) {
    const menu = document.getElementById('exportDropdown');
    if (menu) menu.style.display = 'none';

    if (!_outputText) {
      Toast.show('warning', 'No Content', 'No output available to export.');
      return;
    }

    let mime = 'text/plain';
    let ext = 'txt';
    let fileContent = _outputText;

    if (format === 'md') {
      mime = 'text/markdown';
      ext = 'md';
      fileContent = `# Transformed Output\n\n${_outputText}\n\n---\n*Exported from TransformAI on ${new Date().toLocaleString()}*`;
    } else if (format === 'json') {
      mime = 'application/json';
      ext = 'json';
      try {
        // Validate if already valid JSON
        JSON.parse(_outputText);
        fileContent = _outputText;
      } catch {
        fileContent = JSON.stringify({
          type: _currentTransformType,
          output: _outputText,
          exportedAt: new Date().toISOString()
        }, null, 2);
      }
    } else if (format === 'html') {
      mime = 'text/html';
      ext = 'html';
      fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TransformAI Export - ${_currentTransformType}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    .meta { font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
    pre { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>TransformAI Export</h1>
  <div class="meta">Operation: <strong>${_currentTransformType}</strong> | Exported: ${new Date().toLocaleString()}</div>
  <div class="content">${escapeHtml(_outputText).replace(/\n/g, '<br>')}</div>
</body>
</html>`;
    }

    const blob = new Blob([fileContent], { type: `${mime};charset=utf-8` });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transformai-${_currentTransformType}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    Toast.show('success', 'Exported', `Saved as .${ext} file.`);
  },

  sendToInput() {
    if (!_outputText) return;
    const inp = document.getElementById('inputContent');
    if (inp) {
      inp.value = _outputText;
      this.updateWordCount();
      Toast.show('info', 'Sent to Input', 'Output is now loaded into Input for further transformation.');
    }
  }
};

function wordCount(text) {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ================================================================
//  QuizModal — Interactive Practice Set Generation & Review Drawer
// ================================================================

let _currentGeneratedQuiz = null;

const QuizModal = {
  openFromInput() {
    const inputEl = document.getElementById('inputContent');
    const text = inputEl ? inputEl.value.trim() : '';
    this.open(text);
  },

  open(initialText = '') {
    const existing = document.getElementById('quizGenModalOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'quizGenModalOverlay';
    overlay.innerHTML = `
      <div class="modal-box quiz-modal-box">
        <div class="modal-header">
          <div class="modal-title flex items-center gap-2">
            <i class="ri-sparkling-fill text-purple"></i>
            <span>AI Quiz & Practice Generator</span>
          </div>
          <button class="icon-btn" onclick="document.getElementById('quizGenModalOverlay').remove()">
            <i class="ri-close-line"></i>
          </button>
        </div>

        <div class="modal-body" id="quizModalBody">
          <!-- Step 1: Configuration Form -->
          <div id="quizConfigStep">
            <div class="form-group">
              <label class="form-label">Source Content for Questions</label>
              <textarea class="editor-textarea" id="quizSourceText" style="min-height:120px;" 
                placeholder="Paste or type notes, articles, or text to extract questions from...">${escapeHtml(initialText)}</textarea>
              <div id="quizInputValidation" class="text-danger" style="display:none;font-size:12px;margin-top:4px;">
                <i class="ri-error-warning-line"></i> Please enter at least 30 characters of content or study notes to generate grounded questions.
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group mb-0">
                <label class="form-label" for="quizCountSelect">Number of Questions</label>
                <select class="form-select" id="quizCountSelect" onchange="QuizModal.handleCountChange(this.value)">
                  <option value="5" selected>5 Questions (Standard)</option>
                  <option value="10">10 Questions (Comprehensive)</option>
                  <option value="15">15 Questions (Mastery Drill)</option>
                  <option value="20">20 Questions (Extended Test)</option>
                  <option value="custom">Custom Number...</option>
                </select>
                <div id="quizCustomCountWrap" style="display:none;margin-top:6px;">
                  <input type="number" class="form-input" id="quizCustomCountInput" min="1" max="50" placeholder="Enter count (e.g. 12)" style="font-size:13px;padding:6px 10px;" />
                </div>
              </div>

              <div class="form-group mb-0">
                <label class="form-label">Difficulty Level</label>
                <select class="form-select" id="quizDiffSelect">
                  <option value="easy">Easy (Direct Recall)</option>
                  <option value="medium" selected>Medium (Application & Concepts)</option>
                  <option value="hard">Hard (Synthesis & Analysis)</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top:14px;">
              <label class="form-label">Allowed Question Types</label>
              <div class="flex gap-3 flex-wrap" style="display:flex;gap:10px;flex-wrap:wrap;">
                <label class="flex items-center gap-1" style="font-size:13px;cursor:pointer;">
                  <input type="checkbox" id="qType_mcq" checked /> Multiple Choice (MCQ)
                </label>
                <label class="flex items-center gap-1" style="font-size:13px;cursor:pointer;">
                  <input type="checkbox" id="qType_tf" checked /> True / False
                </label>
                <label class="flex items-center gap-1" style="font-size:13px;cursor:pointer;">
                  <input type="checkbox" id="qType_blanks" checked /> Fill in the Blanks
                </label>
                <label class="flex items-center gap-1" style="font-size:13px;cursor:pointer;">
                  <input type="checkbox" id="qType_short" checked /> Short Answer
                </label>
              </div>
            </div>

            <div class="modal-footer" style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;">
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('quizGenModalOverlay').remove()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="QuizModal.generate()">
                <i class="ri-sparkling-fill"></i> Generate Questions
              </button>
            </div>
          </div>

          <!-- Loading State (Hidden by default) -->
          <div id="quizLoadingStep" style="display:none;text-align:center;padding:40px 20px;">
            <div class="spinner-xl" style="font-size:32px;color:var(--accent-primary);animation:spin 1s linear infinite;">
              <i class="ri-loader-4-line"></i>
            </div>
            <div style="font-size:16px;font-weight:600;margin-top:16px;">Analyzing Content & Grounding Questions...</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:6px;">Extracting key concepts, validating facts, and constructing answers.</div>
          </div>

          <!-- Step 2: Generated Preview (Hidden by default) -->
          <div id="quizPreviewStep" style="display:none;">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  handleCountChange(val) {
    const customWrap = document.getElementById('quizCustomCountWrap');
    const customInput = document.getElementById('quizCustomCountInput');
    if (customWrap) {
      if (val === 'custom') {
        customWrap.style.display = 'block';
        if (customInput) customInput.focus();
      } else {
        customWrap.style.display = 'none';
      }
    }
  },

  getRequestedCount() {
    const select = document.getElementById('quizCountSelect');
    const val = select ? select.value : '5';
    if (val === 'custom') {
      const customInput = document.getElementById('quizCustomCountInput');
      const num = parseInt(customInput?.value, 10);
      if (!num || isNaN(num) || num < 1) {
        return null;
      }
      return Math.min(50, Math.max(1, num));
    }
    return parseInt(val || '5', 10);
  },

  async generate() {
    const textEl = document.getElementById('quizSourceText');
    const valMsg = document.getElementById('quizInputValidation');
    const text = textEl ? textEl.value.trim() : '';

    if (!text || text.length < 30) {
      if (valMsg) {
        valMsg.textContent = 'Please enter at least 30 characters of content or study notes to generate grounded questions.';
        valMsg.style.display = 'block';
      }
      return;
    }
    if (valMsg) valMsg.style.display = 'none';

    const count = this.getRequestedCount();
    if (count === null) {
      Toast.show('warning', 'Invalid Question Count', 'Please enter a valid positive number for custom question count (e.g. 1 to 50).');
      const customInput = document.getElementById('quizCustomCountInput');
      if (customInput) customInput.focus();
      return;
    }
    const difficulty = document.getElementById('quizDiffSelect')?.value || 'medium';

    const types = [];
    if (document.getElementById('qType_mcq')?.checked) types.push('mcq');
    if (document.getElementById('qType_tf')?.checked) types.push('true_false');
    if (document.getElementById('qType_blanks')?.checked) types.push('blanks');
    if (document.getElementById('qType_short')?.checked) types.push('short');

    if (types.length === 0) {
      types.push('mcq', 'true_false');
    }

    // Show loading
    document.getElementById('quizConfigStep').style.display = 'none';
    document.getElementById('quizLoadingStep').style.display = 'block';

    try {
      const result = await API.generateQuiz({ input: text, count, types, difficulty });
      _currentGeneratedQuiz = result;
      this.renderPreview(result);
    } catch (err) {
      console.error('[QuizModal] Generation failed:', err);
      document.getElementById('quizLoadingStep').style.display = 'none';
      document.getElementById('quizConfigStep').style.display = 'block';
      Toast.show('error', 'Generation Failed', err.message || 'Could not generate questions from the input.');
    }
  },

  renderPreview(quiz) {
    document.getElementById('quizLoadingStep').style.display = 'none';
    const previewStep = document.getElementById('quizPreviewStep');
    if (!previewStep) return;

    previewStep.style.display = 'block';
    previewStep.innerHTML = `
      <div class="quiz-preview-header" style="margin-bottom:16px;">
        <label class="form-label">Practice Set Title (Editable)</label>
        <div class="flex gap-2">
          <input type="text" class="form-input" id="previewQuizTitle" value="${escapeHtml(quiz.title)}" style="font-weight:600;" />
        </div>
        <div class="flex gap-2 items-center" style="margin-top:8px;">
          <span class="badge badge-purple">${capitalize(quiz.difficulty)}</span>
          <span class="badge badge-cyan">${quiz.questions.length} Questions Generated</span>
          <span style="font-size:12px;color:var(--text-muted);">${quiz.engine || 'Local NLP Engine'}</span>
        </div>
      </div>

      <div class="quiz-preview-scroll-list" style="max-height:360px;overflow-y:auto;padding-right:6px;">
        ${quiz.questions.map((q, idx) => `
          <div class="preview-q-card" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:10px;">
            <div class="flex justify-between items-center" style="margin-bottom:6px;">
              <span style="font-weight:700;font-size:13px;color:var(--accent-primary);">Question ${idx + 1} (${q.type.toUpperCase()})</span>
            </div>
            <div style="font-size:14px;font-weight:500;margin-bottom:8px;">${escapeHtml(q.question)}</div>
            ${q.options ? `
              <div style="margin-left:12px;font-size:13px;color:var(--text-secondary);margin-bottom:8px;">
                ${q.options.map(o => `<div style="margin-bottom:2px;">• ${escapeHtml(o)}</div>`).join('')}
              </div>
            ` : ''}
            <div style="font-size:12px;color:var(--success);font-weight:600;">
              <i class="ri-check-line"></i> Correct Answer: ${escapeHtml(String(q.answer))}
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
              <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="modal-footer" style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
        <button class="btn btn-secondary btn-sm" onclick="QuizModal.backToConfig()">
          <i class="ri-arrow-left-line"></i> Reconfigure
        </button>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="QuizModal.saveSet(false)">
            <i class="ri-folder-add-line"></i> Save to My Practice
          </button>
          <button class="btn btn-primary btn-sm" onclick="QuizModal.saveSet(true)">
            <i class="ri-play-circle-line"></i> Save & Start Quiz
          </button>
        </div>
      </div>
    `;
  },

  backToConfig() {
    document.getElementById('quizPreviewStep').style.display = 'none';
    document.getElementById('quizConfigStep').style.display = 'block';
  },

  saveSet(startNow = false) {
    if (!_currentGeneratedQuiz) return;

    const titleInput = document.getElementById('previewQuizTitle');
    if (titleInput && titleInput.value.trim()) {
      _currentGeneratedQuiz.title = titleInput.value.trim();
    }

    const saved = AppState.savePracticeSet(_currentGeneratedQuiz);
    document.getElementById('quizGenModalOverlay')?.remove();

    if (startNow) {
      PracticePage.startQuiz(saved.id, 'test');
    } else {
      App.navigate('practice');
    }
  }
};

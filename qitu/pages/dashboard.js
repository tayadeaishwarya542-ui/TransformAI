// ================================================================
//  Dashboard Page — Modern SaaS Analytics & Operational Workspace
// ================================================================

function renderDashboard() {
  const stats = AppState.getStats();
  const history = AppState.getHistory();
  const savedPipelines = AppState.getSavedPipelines();
  const user = (typeof AuthManager !== 'undefined') ? AuthManager.getUser() : null;
  const isAuth = (typeof AuthManager !== 'undefined') ? AuthManager.isAuthenticated() : false;

  return `
  <div class="page-view">

    <!-- 1. Welcome Section (Personalized by Auth State) -->
    <div class="dashboard-hero-card">
      <div class="hero-content">
        ${isAuth && user ? `
          <div class="hero-badge" style="background:rgba(16, 185, 129, 0.15);border-color:rgba(16, 185, 129, 0.35);color:#34d399;">
            <i class="ri-shield-check-fill"></i> Authenticated Workspace · ${escapeHtml(user.full_name)}
          </div>
          <h1 class="hero-title">Welcome back, <span class="grad-text">${escapeHtml(user.full_name)}</span></h1>
          <p class="hero-subtitle">
            Your personal workspace is active. Access your transformation history, AI practice sets, and custom pipeline workflows.
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary" onclick="App.navigate('transform')">
              <i class="ri-magic-line"></i> Open Transformer
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('practice')">
              <i class="ri-questionnaire-line"></i> My Practice & Quizzes
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('pipelines')">
              <i class="ri-flow-chart"></i> Pipeline Studio
            </button>
            <button class="btn btn-ghost text-danger" onclick="AuthManager.logout()" title="Sign Out of Account">
              <i class="ri-logout-box-r-line"></i> Sign Out
            </button>
          </div>
        ` : `
          <div class="hero-badge">
            <i class="ri-sparkling-fill"></i> Enterprise Gen AI Content Platform
          </div>
          <h1 class="hero-title">Welcome to <span class="grad-text">TransformAI</span></h1>
          <p class="hero-subtitle">
            Transform your content intelligently, automate repetitive writing tasks, and build powerful AI workflows. Sign in or create an account to unlock your personalized transformation records and AI quizzes.
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary" onclick="App.navigate('signup')">
              <i class="ri-user-add-line"></i> Get Started Free
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('login')">
              <i class="ri-login-box-line"></i> Sign In to Account
            </button>
            <button class="btn btn-ghost" onclick="App.navigate('help')">
              <i class="ri-book-open-line"></i> Documentation & Guide
            </button>
          </div>
        `}
      </div>
    </div>

    <!-- 2. Dashboard Analytics Cards (Real Computed Data) -->
    <div class="section-header" style="margin-top:24px;">
      <div class="section-title"><i class="ri-bar-chart-box-line"></i> Platform Analytics & Metrics</div>
      <span class="badge badge-green"><i class="ri-pulse-line"></i> Real-time Telemetry</span>
    </div>

    <div class="stats-grid">
      <!-- Card 1: Total Transformations -->
      <div class="stat-card">
        <div class="stat-icon purple"><i class="ri-magic-line"></i></div>
        <div class="stat-value" id="statTotalTransforms">${stats.totalTransforms}</div>
        <div class="stat-label">Total Transformations</div>
        <div class="stat-subtext"><i class="ri-database-2-line"></i> Logged in local history</div>
      </div>

      <!-- Card 2: Pipelines Created -->
      <div class="stat-card">
        <div class="stat-icon cyan"><i class="ri-flow-chart"></i></div>
        <div class="stat-value" id="statPipelinesCreated">${stats.pipelinesCreated}</div>
        <div class="stat-label">Pipelines Created</div>
        <div class="stat-subtext"><i class="ri-folder-shared-line"></i> Active pipeline library</div>
      </div>

      <!-- Card 3: Content Processed -->
      <div class="stat-card">
        <div class="stat-icon green"><i class="ri-file-word-line"></i></div>
        <div class="stat-value" id="statWordsProcessed">${stats.wordsProcessed.toLocaleString()}</div>
        <div class="stat-label">Words Processed</div>
        <div class="stat-subtext"><i class="ri-speed-up-line"></i> Cumulative word count</div>
      </div>

      <!-- Card 4: Success Rate -->
      <div class="stat-card">
        <div class="stat-icon orange"><i class="ri-shield-check-line"></i></div>
        <div class="stat-value" id="statSuccessRate">${stats.successRate}</div>
        <div class="stat-label">Success Rate</div>
        <div class="stat-subtext"><i class="ri-check-double-line"></i> Verified operations</div>
      </div>

      <!-- Card 5: Practice & Quizzes (Computed Live) -->
      <div class="stat-card" style="cursor:pointer;" onclick="App.navigate('practice')" title="Open My Practice">
        <div class="stat-icon cyan"><i class="ri-questionnaire-line"></i></div>
        <div class="stat-value" id="statPracticeSetsDash">${AppState.getPracticeStats().totalSets} Sets</div>
        <div class="stat-label">Practice Sets (${AppState.getPracticeStats().totalAttempts} Quizzes Taken)</div>
        <div class="stat-subtext"><i class="ri-award-line"></i> Avg: ${AppState.getPracticeStats().totalAttempts > 0 ? AppState.getPracticeStats().avgScore + '%' : 'None yet'}</div>
      </div>
    </div>

    <!-- 3. Quick Actions Section (6 Clickable Transformation Cards) -->
    <div class="section-header" style="margin-top:32px;">
      <div class="section-title"><i class="ri-flashlight-line" style="color:#fbbf24"></i> Quick Actions</div>
      <span style="font-size:12px;color:var(--text-muted);">Launch dedicated transformation engine</span>
    </div>

    <div class="quick-actions-grid">
      <!-- 1. Summarize -->
      <div class="quick-action-card" onclick="App.navigateToTransform('summarize')">
        <div class="qa-icon-box purple"><i class="ri-file-reduce-line"></i></div>
        <div class="qa-title">Summarize Content</div>
        <div class="qa-desc">Condense long articles and documents into concise executive takeaways.</div>
        <div class="qa-link">Open Summarizer <i class="ri-arrow-right-line"></i></div>
      </div>

      <!-- 2. Tone -->
      <div class="quick-action-card" onclick="App.navigateToTransform('tone')">
        <div class="qa-icon-box cyan"><i class="ri-chat-voice-line"></i></div>
        <div class="qa-title">Change Writing Tone</div>
        <div class="qa-desc">Adapt prose across Professional, Formal, Casual, Academic, or Creative.</div>
        <div class="qa-link">Open Tone Studio <i class="ri-arrow-right-line"></i></div>
      </div>

      <!-- 3. Translate -->
      <div class="quick-action-card" onclick="App.navigateToTransform('translate')">
        <div class="qa-icon-box green"><i class="ri-global-line"></i></div>
        <div class="qa-title">Translate Text</div>
        <div class="qa-desc">Polyglot translation into Hindi, Marathi, Spanish, French, German, Japanese.</div>
        <div class="qa-link">Open Translator <i class="ri-arrow-right-line"></i></div>
      </div>

      <!-- 4. Grammar -->
      <div class="quick-action-card" onclick="App.navigateToTransform('grammar')">
        <div class="qa-icon-box purple"><i class="ri-spell-check-line"></i></div>
        <div class="qa-title">Fix Grammar</div>
        <div class="qa-desc">Detect and correct spelling and syntax faults with a visual word-level diff.</div>
        <div class="qa-link">Open Grammar Fixer <i class="ri-arrow-right-line"></i></div>
      </div>

      <!-- 5. Convert -->
      <div class="quick-action-card" onclick="App.navigateToTransform('convert')">
        <div class="qa-icon-box orange"><i class="ri-file-transfer-line"></i></div>
        <div class="qa-title">Convert Format</div>
        <div class="qa-desc">Restructure into Paragraphs, Bullets, Markdown, Validated JSON, or Reports.</div>
        <div class="qa-link">Open Converter <i class="ri-arrow-right-line"></i></div>
      </div>

      <!-- 6. Quality -->
      <div class="quick-action-card" onclick="App.navigateToTransform('quality')">
        <div class="qa-icon-box cyan"><i class="ri-award-line"></i></div>
        <div class="qa-title">Score Content Quality</div>
        <div class="qa-desc">Audit Readability, Clarity, Coherence, and Structure with score breakdown (0-100).</div>
        <div class="qa-link">Open Quality Auditor <i class="ri-arrow-right-line"></i></div>
      </div>

      <!-- 7. AI Quiz & Practice Generator -->
      <div class="quick-action-card" onclick="QuizModal.open()" style="border:1px solid rgba(124,58,237,0.3);background:linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.06));">
        <div class="qa-icon-box purple" style="background:linear-gradient(135deg, #7c3aed, #06b6d4);color:#fff;"><i class="ri-questionnaire-line"></i></div>
        <div class="qa-title">AI Quiz & Practice Generator <span class="badge badge-purple" style="font-size:10px;">New</span></div>
        <div class="qa-desc">Generate grounded MCQs, True/False, Blanks, and Short Answer questions with interactive quizzes.</div>
        <div class="qa-link">Generate Practice Questions <i class="ri-arrow-right-line"></i></div>
      </div>
    </div>

    <!-- 4. Pipeline Overview Section -->
    <div class="section-header" style="margin-top:36px;">
      <div class="section-title"><i class="ri-flow-chart"></i> Saved Pipelines Library</div>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-xs" onclick="App.navigate('saved-pipelines')">View All Pipelines</button>
        <button class="btn btn-primary btn-xs" onclick="App.navigate('pipelines')"><i class="ri-add-line"></i> Create New</button>
      </div>
    </div>

    <div class="pipeline-overview-grid" id="dashboardPipelinesGrid">
      ${renderDashboardPipelinesHtml(savedPipelines)}
    </div>

    <!-- 5. Recent Activity Section -->
    <div class="section-header" style="margin-top:36px;">
      <div class="section-title"><i class="ri-history-line"></i> Recent Activity</div>
      <button class="btn btn-secondary btn-xs" onclick="App.navigate('history')">View All History</button>
    </div>

    <div class="recent-activity-container">
      ${renderDashboardRecentHtml(history)}
    </div>

  </div>`;
}

function renderDashboardPipelinesHtml(pipelines) {
  if (!pipelines || pipelines.length === 0) {
    return `
      <div class="empty-state-box full-width">
        <i class="ri-flow-chart"></i>
        <div class="empty-state-title">No Saved Pipelines Yet</div>
        <div class="empty-state-desc">Compose multi-stage transformation workflows and save them for instant reuse.</div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('pipelines')" style="margin-top:12px;">
          <i class="ri-add-line"></i> Create First Pipeline
        </button>
      </div>
    `;
  }

  return pipelines.slice(0, 4).map(p => {
    const stageNames = (p.stages || []).map(s => TRANSFORMATIONS[s.type]?.label || s.type);
    const lastRunStr = p.lastExecuted ? formatTimeAgo(p.lastExecuted) : 'Never executed';

    return `
      <div class="dashboard-pipeline-card">
        <div class="dash-pipe-top">
          <div>
            <div class="dash-pipe-name">${escapeHtml(p.name)}</div>
            <div class="dash-pipe-desc">${escapeHtml(p.desc || `${p.stages?.length || 0} sequential transformation stages`)}</div>
          </div>
          <span class="badge ${p.status === 'Success' ? 'badge-green' : 'badge-purple'}">${p.status || 'Ready'}</span>
        </div>

        <div class="dash-pipe-sequence">
          ${stageNames.map((name, i) => `
            <span class="pipe-seq-chip">${escapeHtml(name)}</span>
            ${i < stageNames.length - 1 ? '<span class="pipe-seq-arrow"><i class="ri-arrow-right-s-line"></i></span>' : ''}
          `).join('')}
        </div>

        <div class="dash-pipe-footer">
          <div class="dash-pipe-meta">
            <i class="ri-time-line"></i> Last run: <span>${lastRunStr}</span>
          </div>
          <div class="dash-pipe-actions">
            <button class="btn btn-primary btn-xs" onclick="DashboardPage.runPipeline('${p.id}')" title="Run pipeline now">
              <i class="ri-play-fill"></i> Run
            </button>
            <button class="icon-btn-xs" onclick="DashboardPage.editPipeline('${p.id}')" title="Edit in Studio">
              <i class="ri-edit-line"></i>
            </button>
            <button class="icon-btn-xs" onclick="DashboardPage.duplicatePipeline('${p.id}')" title="Duplicate pipeline">
              <i class="ri-file-copy-line"></i>
            </button>
            <button class="icon-btn-xs btn-delete" onclick="DashboardPage.deletePipeline('${p.id}')" title="Delete pipeline">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDashboardRecentHtml(history) {
  if (!history || history.length === 0) {
    return `
      <div class="empty-state-box">
        <i class="ri-history-line"></i>
        <div class="empty-state-title">No Transformation Activity Yet</div>
        <div class="empty-state-desc">Your completed transformations and pipeline runs will appear here automatically.</div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('transform')" style="margin-top:12px;">
          <i class="ri-magic-line"></i> Run Your First Transformation
        </button>
      </div>
    `;
  }

  return `
    <div class="recent-table-card">
      <div class="recent-table-header">
        <div class="col-type">Operation</div>
        <div class="col-input">Input Preview</div>
        <div class="col-date">Date & Time</div>
        <div class="col-provider">Provider</div>
        <div class="col-status">Status</div>
        <div class="col-action">Action</div>
      </div>
      <div class="recent-table-body">
        ${history.slice(0, 5).map((item, idx) => {
          const def = TRANSFORMATIONS[item.type] || { label: capitalize(item.type), icon: 'ri-magic-line' };
          const dateStr = new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

          return `
            <div class="recent-table-row">
              <div class="col-type">
                <span class="badge badge-purple"><i class="${def.icon}"></i> ${def.label}</span>
              </div>
              <div class="col-input">
                <span class="input-cell-text">${escapeHtml(item.input ? item.input.slice(0, 75) : '')}...</span>
              </div>
              <div class="col-date">${dateStr}</div>
              <div class="col-provider">
                <span class="provider-pill">${item.model || item.provider || 'local'}</span>
              </div>
              <div class="col-status">
                <span class="status-pill success"><i class="ri-checkbox-circle-fill"></i> Success</span>
              </div>
              <div class="col-action">
                <button class="btn btn-secondary btn-xs" onclick="HistoryPage.reopen(${idx})">
                  <i class="ri-eye-line"></i> View Result
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Controller
const DashboardPage = {
  runPipeline(id) {
    App.navigate('pipelines', { runId: id });
  },

  editPipeline(id) {
    App.navigate('pipelines', { editId: id });
  },

  duplicatePipeline(id) {
    const copy = AppState.duplicateSavedPipeline(id);
    if (copy) {
      Toast.show('success', 'Pipeline Duplicated', `Created "${copy.name}".`);
      App.navigate('dashboard');
    }
  },

  deletePipeline(id) {
    if (!confirm('Are you sure you want to delete this pipeline?')) return;
    AppState.deleteSavedPipeline(id);
    Toast.show('info', 'Pipeline Deleted', 'Pipeline removed.');
    App.navigate('dashboard');
  }
};

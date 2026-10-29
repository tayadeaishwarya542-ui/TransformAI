// ================================================================
//  Saved Pipelines Page — Dedicated Workflow Library Management
// ================================================================

function renderSavedPipelinesPage() {
  const saved = AppState.getSavedPipelines();

  return `
  <div class="page-view">
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <div class="page-title">Saved Pipelines Library <span class="grad-text">✦</span></div>
          <div class="page-desc">Manage, execute, duplicate, and export your multi-stage automated workflows.</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="SavedPipelinesPage.exportAllJSON()">
            <i class="ri-code-s-slash-line"></i> Export All
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('pipelines')">
            <i class="ri-add-line"></i> + Create New Pipeline
          </button>
        </div>
      </div>
    </div>

    <div class="pipeline-library-grid" id="savedPipelinesGrid">
      ${renderSavedPipelinesGridHtml(saved)}
    </div>
  </div>`;
}

function renderSavedPipelinesGridHtml(pipelines) {
  if (!pipelines || pipelines.length === 0) {
    return `
      <div class="empty-state-box full-width">
        <i class="ri-folder-shared-line"></i>
        <div class="empty-state-title">No Saved Pipelines in Library</div>
        <div class="empty-state-desc">Create custom multi-stage pipelines in the Pipeline Studio and save them here.</div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('pipelines')" style="margin-top:12px;">
          <i class="ri-add-line"></i> Open Pipeline Studio
        </button>
      </div>
    `;
  }

  return pipelines.map(p => {
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
            <button class="btn btn-primary btn-xs" onclick="SavedPipelinesPage.run('${p.id}')">
              <i class="ri-play-fill"></i> Run
            </button>
            <button class="icon-btn-xs" onclick="SavedPipelinesPage.edit('${p.id}')" title="Edit in Studio">
              <i class="ri-edit-line"></i>
            </button>
            <button class="icon-btn-xs" onclick="SavedPipelinesPage.duplicate('${p.id}')" title="Duplicate">
              <i class="ri-file-copy-line"></i>
            </button>
            <button class="icon-btn-xs btn-delete" onclick="SavedPipelinesPage.delete('${p.id}')" title="Delete">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

const SavedPipelinesPage = {
  run(id) {
    App.navigate('pipelines', { runId: id });
    Toast.show('info', 'Loaded Pipeline', 'Pipeline loaded into Studio. Enter source content and run.');
  },

  edit(id) {
    App.navigate('pipelines', { editId: id });
  },

  duplicate(id) {
    const copy = AppState.duplicateSavedPipeline(id);
    if (copy) {
      Toast.show('success', 'Pipeline Duplicated', `Created "${copy.name}".`);
      App.navigate('saved-pipelines');
    }
  },

  delete(id) {
    if (!confirm('Are you sure you want to remove this saved pipeline from your library?')) return;
    AppState.deleteSavedPipeline(id);
    Toast.show('info', 'Pipeline Deleted', 'Pipeline removed.');
    App.navigate('saved-pipelines');
  },

  exportAllJSON() {
    const list = AppState.getSavedPipelines();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transformai-saved-pipelines-${Date.now()}.json`;
    a.click();
    Toast.show('success', 'Exported', 'Saved pipelines exported as JSON.');
  }
};

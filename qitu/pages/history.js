// ================================================================
//  History Page — Filter, Search, Reopen, and Export
// ================================================================

let _historyFilterType = '';
let _historySearchQuery = '';

function renderHistoryPage() {
  const history = AppState.getHistory();

  return `
  <div class="page-view">
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <div class="page-title">Transformation History <span class="grad-text">✦</span></div>
          <div class="page-desc">Every transformation and pipeline result is securely persisted in your browser.</div>
        </div>
        <div class="flex gap-2 items-center flex-wrap">
          <button class="btn btn-secondary btn-sm" onclick="HistoryPage.exportCSV()">
            <i class="ri-file-excel-2-line"></i> Export CSV
          </button>
          <button class="btn btn-secondary btn-sm" onclick="HistoryPage.exportJSON()">
            <i class="ri-code-s-slash-line"></i> Export JSON
          </button>
          <button class="btn btn-danger btn-sm" onclick="HistoryPage.clearAll()">
            <i class="ri-delete-bin-line"></i> Clear All History
          </button>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="history-filter-bar">
      <div class="search-bar" style="flex:1;min-width:240px;">
        <i class="ri-search-line"></i>
        <input type="text" placeholder="Search inputs, outputs, models..." id="historySearchInput" oninput="HistoryPage.onSearch(this.value)" />
      </div>
      <select class="form-select" id="historyTypeFilter" onchange="HistoryPage.onFilter(this.value)" style="width:auto;min-width:180px;">
        <option value="">All Transformation Types</option>
        ${Object.keys(TRANSFORMATIONS).map(k => `
          <option value="${k}">${TRANSFORMATIONS[k].label}</option>
        `).join('')}
        <option value="pipeline">Sequential Pipeline</option>
      </select>
    </div>

    <!-- History Items Container -->
    <div class="history-list" id="historyListContainer">
      ${renderHistoryItemsHtml()}
    </div>
  </div>`;
}

function renderHistoryItemsHtml() {
  let items = AppState.getHistory();

  if (_historyFilterType) {
    items = items.filter(i => i.type === _historyFilterType);
  }
  if (_historySearchQuery) {
    const q = _historySearchQuery.toLowerCase();
    items = items.filter(i =>
      (i.input && i.input.toLowerCase().includes(q)) ||
      (i.output && i.output.toLowerCase().includes(q)) ||
      (i.type && i.type.toLowerCase().includes(q)) ||
      (i.model && i.model.toLowerCase().includes(q))
    );
  }

  if (items.length === 0) {
    return `
      <div class="empty-history-box">
        <i class="ri-history-line"></i>
        <div>No history records found</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Transformations you execute will appear here automatically.</div>
      </div>
    `;
  }

  return items.map((item, idx) => {
    const def = TRANSFORMATIONS[item.type] || { label: capitalize(item.type), icon: 'ri-magic-line' };
    const dateStr = new Date(item.timestamp).toLocaleString();
    const inWords = wordCount(item.input);
    const outWords = wordCount(item.output);

    return `
      <div class="history-item-card">
        <div class="history-card-header">
          <div class="flex items-center gap-2">
            <span class="badge badge-purple"><i class="${def.icon}"></i> ${def.label}</span>
            <span class="history-meta-tag"><i class="ri-time-line"></i> ${dateStr}</span>
            <span class="history-meta-tag">${item.model || 'local'}</span>
            <span class="history-meta-tag">${inWords} → ${outWords} words</span>
          </div>
          <div class="history-item-actions">
            <button class="icon-btn-sm" onclick="HistoryPage.reopen(${idx})" title="Open in Transform Studio"><i class="ri-external-link-line"></i> Reopen</button>
            <button class="icon-btn-sm" onclick="HistoryPage.copyItem(${idx})" title="Copy output"><i class="ri-file-copy-line"></i></button>
            <button class="icon-btn-sm btn-delete" onclick="HistoryPage.deleteItem(${idx})" title="Delete"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>

        <div class="history-card-body">
          <div class="history-snippet input-snip">
            <strong>Input:</strong> ${escapeHtml(item.input ? item.input.slice(0, 160) : '')}${item.input && item.input.length > 160 ? '...' : ''}
          </div>
          <div class="history-snippet output-snip">
            <strong>Output:</strong> ${escapeHtml(item.output ? item.output.slice(0, 200) : '')}${item.output && item.output.length > 200 ? '...' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

const HistoryPage = {
  onSearch(query) {
    _historySearchQuery = query;
    const c = document.getElementById('historyListContainer');
    if (c) c.innerHTML = renderHistoryItemsHtml();
  },

  onFilter(type) {
    _historyFilterType = type;
    const c = document.getElementById('historyListContainer');
    if (c) c.innerHTML = renderHistoryItemsHtml();
  },

  reopen(idx) {
    const items = AppState.getHistory();
    const item = items[idx];
    if (!item) return;

    if (item.type === 'pipeline') {
      App.navigate('pipelines');
      setTimeout(() => {
        const inp = document.getElementById('pipelineInputText');
        if (inp) {
          inp.value = item.input || '';
          PipelinesPage.updateInputWC();
          Toast.show('info', 'Loaded Pipeline', 'History item loaded into Pipeline Initial Content.');
        }
      }, 200);
      return;
    }

    App.navigate('transform', { type: item.type });
    setTimeout(() => {
      const inp = document.getElementById('inputContent');
      if (inp) {
        inp.value = item.input || '';
        TransformPage.updateWordCount();
      }
      if (item.output) {
        TransformPage.renderFormattedOutput(item.output);
        _outputText = item.output;
        const act = document.getElementById('outputActions');
        if (act) act.style.display = 'flex';
        const pl = document.getElementById('outputPlaceholder');
        if (pl) pl.style.display = 'none';
        const ot = document.getElementById('outputText');
        if (ot) ot.style.display = 'block';
      }
      Toast.show('info', 'Record Restored', `Restored ${TRANSFORMATIONS[item.type]?.label || item.type} session.`);
    }, 250);
  },

  async copyItem(idx) {
    const items = AppState.getHistory();
    const item = items[idx];
    if (!item || !item.output) return;
    try {
      await navigator.clipboard.writeText(item.output);
      Toast.show('success', 'Copied!', 'Item output copied to clipboard.');
    } catch {
      Toast.show('error', 'Copy Failed', 'Unable to write to clipboard.');
    }
  },

  deleteItem(idx) {
    AppState.deleteHistoryItem(idx);
    const c = document.getElementById('historyListContainer');
    if (c) c.innerHTML = renderHistoryItemsHtml();
    Toast.show('success', 'Item Deleted', 'History record removed.');
  },

  clearAll() {
    if (!confirm('Are you sure you want to delete all transformation history?')) return;
    AppState.clearHistory();
    const c = document.getElementById('historyListContainer');
    if (c) c.innerHTML = renderHistoryItemsHtml();
    Toast.show('success', 'History Cleared', 'All transformation history has been cleared.');
  },

  exportCSV() {
    const items = AppState.getHistory();
    if (items.length === 0) {
      Toast.show('warning', 'No Records', 'History is empty.');
      return;
    }

    let csv = 'ID,Timestamp,Type,Model,InputWordCount,OutputWordCount,Input,Output\n';
    items.forEach((item, idx) => {
      const date = new Date(item.timestamp).toISOString();
      const inW = wordCount(item.input);
      const outW = wordCount(item.output);
      const cleanIn = (item.input || '').replace(/"/g, '""').replace(/\n/g, ' ');
      const cleanOut = (item.output || '').replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `"${idx + 1}","${date}","${item.type}","${item.model || 'local'}","${inW}","${outW}","${cleanIn}","${cleanOut}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transformai-history-${Date.now()}.csv`;
    a.click();
    Toast.show('success', 'CSV Exported', 'Downloaded transformation history as CSV.');
  },

  exportJSON() {
    const items = AppState.getHistory();
    if (items.length === 0) {
      Toast.show('warning', 'No Records', 'History is empty.');
      return;
    }

    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transformai-history-${Date.now()}.json`;
    a.click();
    Toast.show('success', 'JSON Exported', 'Downloaded transformation history as JSON.');
  }
};

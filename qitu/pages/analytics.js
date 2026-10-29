// ================================================================
//  Analytics Page — Real Metrics & Usage Insights
// ================================================================

function renderAnalyticsPage() {
  const history = AppState.getHistory();
  const stats = AppState.getStats();

  if (history.length === 0) {
    return `
    <div class="page-view">
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <div class="page-title">Analytics & Intelligence Telemetry <span class="grad-text">✦</span></div>
            <div class="page-desc">Comprehensive monitoring of content throughput, operation distribution, and efficiency.</div>
          </div>
          <span class="badge badge-secondary"><i class="ri-pause-circle-line"></i> Awaiting Data</span>
        </div>
      </div>

      <div class="empty-state-box full-width" style="margin-top:20px;">
        <i class="ri-bar-chart-2-line"></i>
        <div class="empty-state-title">No Transformation Analytics Recorded</div>
        <div class="empty-state-desc">Once you execute content transformations or pipelines, live metrics, provider usage distribution, and volume trends will be calculated here in real time.</div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('transform')" style="margin-top:14px;">
          <i class="ri-magic-line"></i> Launch AI Transformer
        </button>
      </div>
    </div>`;
  }

  // Calculate real metrics from history
  const typeCounts = {};
  const providerCounts = {};
  history.forEach(item => {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    const prov = item.provider || item.model || 'local';
    providerCounts[prov] = (providerCounts[prov] || 0) + 1;
  });

  const total = history.length;
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  return `
  <div class="page-view">
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <div class="page-title">Analytics & Intelligence Telemetry <span class="grad-text">✦</span></div>
          <div class="page-desc">Derived strictly from active local transformation records and pipeline executions.</div>
        </div>
        <span class="badge badge-green"><i class="ri-checkbox-circle-fill"></i> Live Real Data</span>
      </div>
    </div>

    <!-- Top Telemetry Stats Grid -->
    <div class="stats-grid" style="margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-icon purple"><i class="ri-bar-chart-2-line"></i></div>
        <div class="stat-value">${stats.totalTransforms}</div>
        <div class="stat-label">Total Transformations</div>
        <div class="stat-subtext"><i class="ri-database-2-line"></i> Executed operations</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon cyan"><i class="ri-file-word-line"></i></div>
        <div class="stat-value">${stats.wordsProcessed.toLocaleString()}</div>
        <div class="stat-label">Words Processed</div>
        <div class="stat-subtext"><i class="ri-speed-up-line"></i> Verified throughput</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="ri-checkbox-circle-line"></i></div>
        <div class="stat-value">${stats.successRate}</div>
        <div class="stat-label">Success Rate</div>
        <div class="stat-subtext">${stats.successfulOperations} success / ${stats.failedOperations} fail</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="ri-timer-line"></i></div>
        <div class="stat-value">${stats.pipelinesCreated}</div>
        <div class="stat-label">Saved Pipelines</div>
        <div class="stat-subtext"><i class="ri-folder-shared-line"></i> Workflow library</div>
      </div>
    </div>

    <div class="grid grid-2 gap-4" style="margin-bottom:24px;">
      <!-- Most Frequently Used Operations -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-title"><i class="ri-pie-chart-line" style="color:var(--accent-primary)"></i> Operation Distribution</div>
          <div class="settings-card-desc">Volume of transformations segmented by individual operation.</div>
        </div>
        <div class="settings-card-body">
          <div class="quality-metrics-grid" style="grid-template-columns:1fr;">
            ${sortedTypes.map(([type, count]) => {
              const def = TRANSFORMATIONS[type] || { label: capitalize(type), icon: 'ri-magic-line' };
              const pct = Math.round((count / total) * 100);
              return `
                <div class="metric-row">
                  <div class="metric-label">
                    <span><i class="${def.icon}"></i> ${def.label}</span>
                    <span class="metric-val">${count} (${pct}%)</span>
                  </div>
                  <div class="metric-bar-bg">
                    <div class="metric-bar-fill" style="width:${pct}%;background:var(--accent-primary);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Provider Usage Statistics -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-title"><i class="ri-cpu-line" style="color:#67e8f9"></i> Provider Utilization</div>
          <div class="settings-card-desc">Routing telemetry across configured AI engines.</div>
        </div>
        <div class="settings-card-body">
          <div class="quality-metrics-grid" style="grid-template-columns:1fr;">
            ${Object.entries(providerCounts).map(([prov, count]) => {
              const pct = Math.round((count / total) * 100);
              return `
                <div class="metric-row">
                  <div class="metric-label">
                    <span>${prov.toUpperCase()}</span>
                    <span class="metric-val">${count} (${pct}%)</span>
                  </div>
                  <div class="metric-bar-bg">
                    <div class="metric-bar-fill" style="width:${pct}%;background:#34d399;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

  </div>`;
}

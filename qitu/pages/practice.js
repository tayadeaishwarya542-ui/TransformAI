// ================================================================
//  TransformAI — My Practice & Interactive Quiz Experience
//  Features: Persistent Sets, Live Analytics, Multi-type Quiz Engine,
//            Practice vs Test Mode, Scoring, Attempts History,
//            Search, Filters, Inline Rename, Confirm Delete,
//            and Text / PDF Export.
// ================================================================

let _practiceSearchQuery = '';
let _practiceDifficultyFilter = '';
let _practiceTypeFilter = '';
let _practiceStatusFilter = '';
let _practiceSortBy = 'newest';

// Current active quiz session state
let _activeQuizState = null;

function renderPracticePage(opts = {}) {
  // If navigating directly to a quiz session
  if (opts && opts.quizSetId) {
    return renderQuizSessionHtml(opts.quizSetId, opts.mode || 'test');
  }
  // If navigating to quiz results review
  if (opts && opts.resultsSetId && opts.attemptId) {
    return renderQuizResultsHtml(opts.resultsSetId, opts.attemptId);
  }

  // Default: Practice Sets List & Analytics
  return renderPracticeDashboardHtml();
}

// ── 1. Practice Dashboard View ──
function renderPracticeDashboardHtml() {
  const stats = AppState.getPracticeStats();
  const sets = AppState.getPracticeSets();

  return `
  <div class="page-view practice-page-view">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-top">
        <div>
          <div class="page-title">My Practice & Quizzes <span class="grad-text">✦</span></div>
          <div class="page-desc">Generate grounded practice sets from any text, test your mastery, and track progress over time.</div>
        </div>
        <div class="flex gap-2 items-center flex-wrap">
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('transform')" title="Open Transformer to input content">
            <i class="ri-edit-line"></i> Input Content
          </button>
          <button class="btn btn-primary btn-sm" onclick="QuizModal.open()" title="Generate practice questions immediately">
            <i class="ri-sparkling-fill"></i> + Generate Practice Set
          </button>
        </div>
      </div>
    </div>

    <!-- Analytics Dashboard Cards -->
    <div class="section-header" style="margin-top:16px;">
      <div class="section-title"><i class="ri-bar-chart-box-line"></i> Practice Analytics</div>
      <span class="badge badge-green"><i class="ri-shield-check-line"></i> Real Computed Telemetry</span>
    </div>

    <div class="stats-grid practice-stats-grid">
      <div class="stat-card">
        <div class="stat-icon purple"><i class="ri-folder-check-line"></i></div>
        <div class="stat-value" id="statPracticeSets">${stats.totalSets}</div>
        <div class="stat-label">Practice Sets</div>
        <div class="stat-subtext"><i class="ri-database-2-line"></i> Saved locally in library</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon cyan"><i class="ri-play-circle-line"></i></div>
        <div class="stat-value" id="statPracticeAttempts">${stats.totalAttempts}</div>
        <div class="stat-label">Quiz Attempts</div>
        <div class="stat-subtext"><i class="ri-history-line"></i> Completed assessments</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green"><i class="ri-pie-chart-line"></i></div>
        <div class="stat-value" id="statPracticeAvgScore">${stats.totalAttempts > 0 ? stats.avgScore + '%' : '—'}</div>
        <div class="stat-label">Average Score</div>
        <div class="stat-subtext"><i class="ri-calculator-line"></i> Across all attempts</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange"><i class="ri-trophy-line"></i></div>
        <div class="stat-value" id="statPracticeBestScore">${stats.totalAttempts > 0 ? stats.bestScore + '%' : '—'}</div>
        <div class="stat-label">Best Score</div>
        <div class="stat-subtext"><i class="ri-award-line"></i> Peak mastery achieved</div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="history-filter-bar practice-toolbar" style="margin-top:24px;">
      <div class="search-bar" style="flex:2;min-width:240px;">
        <i class="ri-search-line"></i>
        <input type="text" placeholder="Search practice titles, questions, or source content..." 
          id="practiceSearchInput" value="${escapeHtml(_practiceSearchQuery)}" 
          oninput="PracticePage.onSearch(this.value)" />
      </div>

      <select class="form-select" id="practiceDiffFilter" onchange="PracticePage.onFilterDifficulty(this.value)" style="min-width:140px;">
        <option value="" ${_practiceDifficultyFilter === '' ? 'selected' : ''}>All Difficulties</option>
        <option value="easy" ${_practiceDifficultyFilter === 'easy' ? 'selected' : ''}>Easy</option>
        <option value="medium" ${_practiceDifficultyFilter === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="hard" ${_practiceDifficultyFilter === 'hard' ? 'selected' : ''}>Hard</option>
      </select>

      <select class="form-select" id="practiceTypeFilter" onchange="PracticePage.onFilterType(this.value)" style="min-width:150px;">
        <option value="" ${_practiceTypeFilter === '' ? 'selected' : ''}>All Question Types</option>
        <option value="mcq" ${_practiceTypeFilter === 'mcq' ? 'selected' : ''}>Multiple Choice (MCQ)</option>
        <option value="true_false" ${_practiceTypeFilter === 'true_false' ? 'selected' : ''}>True / False</option>
        <option value="blanks" ${_practiceTypeFilter === 'blanks' ? 'selected' : ''}>Fill in the Blanks</option>
        <option value="short" ${_practiceTypeFilter === 'short' ? 'selected' : ''}>Short Answer</option>
      </select>

      <select class="form-select" id="practiceStatusFilter" onchange="PracticePage.onFilterStatus(this.value)" style="min-width:150px;">
        <option value="" ${_practiceStatusFilter === '' ? 'selected' : ''}>All Status</option>
        <option value="attempted" ${_practiceStatusFilter === 'attempted' ? 'selected' : ''}>Attempted</option>
        <option value="unattempted" ${_practiceStatusFilter === 'unattempted' ? 'selected' : ''}>Not Attempted</option>
      </select>

      <select class="form-select" id="practiceSortSelect" onchange="PracticePage.onSort(this.value)" style="min-width:140px;">
        <option value="newest" ${_practiceSortBy === 'newest' ? 'selected' : ''}>Newest First</option>
        <option value="oldest" ${_practiceSortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
        <option value="title_asc" ${_practiceSortBy === 'title_asc' ? 'selected' : ''}>Title (A → Z)</option>
        <option value="title_desc" ${_practiceSortBy === 'title_desc' ? 'selected' : ''}>Title (Z → A)</option>
        <option value="score_high" ${_practiceSortBy === 'score_high' ? 'selected' : ''}>Score (High → Low)</option>
      </select>
    </div>

    <!-- Sets List / Grid -->
    <div class="practice-sets-container" id="practiceSetsContainer" style="margin-top:20px;">
      ${renderPracticeCardsHtml()}
    </div>
  </div>

  <!-- Shared Modals Container -->
  <div id="practiceModalsContainer"></div>
  `;
}

function renderPracticeCardsHtml() {
  let sets = AppState.getPracticeSets();

  // Search filter
  if (_practiceSearchQuery) {
    const q = _practiceSearchQuery.toLowerCase();
    sets = sets.filter(s =>
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.sourceText && s.sourceText.toLowerCase().includes(q)) ||
      (s.questions && s.questions.some(qn => qn.question.toLowerCase().includes(q)))
    );
  }

  // Difficulty filter
  if (_practiceDifficultyFilter) {
    sets = sets.filter(s => s.difficulty === _practiceDifficultyFilter);
  }

  // Question Type filter
  if (_practiceTypeFilter) {
    sets = sets.filter(s => s.questions && s.questions.some(qn => qn.type === _practiceTypeFilter));
  }

  // Status filter
  if (_practiceStatusFilter === 'attempted') {
    sets = sets.filter(s => s.attempts && s.attempts.length > 0);
  } else if (_practiceStatusFilter === 'unattempted') {
    sets = sets.filter(s => !s.attempts || s.attempts.length === 0);
  }

  // Sorting
  if (_practiceSortBy === 'newest') {
    sets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (_practiceSortBy === 'oldest') {
    sets.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  } else if (_practiceSortBy === 'title_asc') {
    sets.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (_practiceSortBy === 'title_desc') {
    sets.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  } else if (_practiceSortBy === 'score_high') {
    sets.sort((a, b) => {
      const aMax = (a.attempts || []).reduce((max, att) => Math.max(max, att.score || 0), -1);
      const bMax = (b.attempts || []).reduce((max, att) => Math.max(max, att.score || 0), -1);
      return bMax - aMax;
    });
  }

  // Empty state
  if (sets.length === 0) {
    const hasFilters = _practiceSearchQuery || _practiceDifficultyFilter || _practiceTypeFilter || _practiceStatusFilter;
    return `
      <div class="empty-state-box full-width" style="padding:48px 24px;">
        <i class="ri-questionnaire-line" style="font-size:48px;color:var(--accent-primary);"></i>
        <div class="empty-state-title" style="margin-top:12px;">${hasFilters ? 'No Matching Practice Sets' : 'No Practice Sets Created Yet'}</div>
        <div class="empty-state-desc">
          ${hasFilters 
            ? 'Try adjusting your search criteria or resetting filters.' 
            : 'Enter or paste study notes, articles, or documentation in the Transformer to automatically generate practice questions.'}
        </div>
        ${hasFilters ? `
          <button class="btn btn-secondary btn-sm" onclick="PracticePage.resetFilters()" style="margin-top:16px;">
            <i class="ri-refresh-line"></i> Reset Filters
          </button>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="QuizModal.open()" style="margin-top:16px;">
            <i class="ri-sparkling-fill"></i> Generate Your First Set
          </button>
        `}
      </div>
    `;
  }

  return `
    <div class="practice-cards-grid">
      ${sets.map(s => {
        const diffClasses = { easy: 'badge-green', medium: 'badge-purple', hard: 'badge-orange' };
        const diffBadge = diffClasses[s.difficulty] || 'badge-purple';
        const qCount = s.questions?.length || 0;
        const attempts = s.attempts || [];
        const lastAtt = s.lastAttempt || attempts[0];
        const timeAgo = formatTimeAgo(s.createdAt);

        // Collect question types
        const typesPresent = Array.from(new Set((s.questions || []).map(q => q.type)));
        const typeLabels = { mcq: 'MCQ', true_false: 'T/F', blanks: 'Blanks', short: 'Short' };

        return `
          <div class="practice-set-card" id="pset-${s.id}">
            <div class="practice-card-header">
              <div class="practice-card-title-row">
                <h3 class="practice-card-title" title="${escapeHtml(s.title)}">${escapeHtml(s.title)}</h3>
                <button class="icon-btn-xs" onclick="PracticePage.showRenameModal('${s.id}')" title="Rename Practice Set">
                  <i class="ri-edit-line"></i>
                </button>
              </div>
              <div class="practice-card-badges">
                <span class="badge ${diffBadge}">${capitalize(s.difficulty || 'medium')}</span>
                <span class="badge badge-cyan"><i class="ri-question-line"></i> ${qCount} Questions</span>
                <span class="practice-date"><i class="ri-time-line"></i> ${timeAgo}</span>
              </div>
            </div>

            <div class="practice-card-types">
              ${typesPresent.map(t => `<span class="type-pill">${typeLabels[t] || t}</span>`).join('')}
            </div>

            <div class="practice-card-preview">
              "${escapeHtml(s.sourcePreview || s.sourceText?.slice(0, 140) || '')}"
            </div>

            <div class="practice-card-status">
              ${lastAtt ? `
                <div class="attempt-status-box attempted">
                  <span class="score-badge ${lastAtt.score >= 80 ? 'high' : lastAtt.score >= 60 ? 'mid' : 'low'}">
                    <i class="ri-award-line"></i> ${lastAtt.score}%
                  </span>
                  <span class="attempt-details">
                    ${lastAtt.correctCount}/${lastAtt.totalQuestions} correct · ${attempts.length} attempt${attempts.length > 1 ? 's' : ''}
                  </span>
                </div>
              ` : `
                <div class="attempt-status-box unattempted">
                  <i class="ri-checkbox-blank-circle-line"></i> Not attempted yet
                </div>
              `}
            </div>

            <div class="practice-card-actions">
              <button class="btn btn-primary btn-sm flex-1" onclick="PracticePage.startQuiz('${s.id}', 'test')">
                <i class="ri-play-circle-line"></i> Start Quiz
              </button>
              <button class="btn btn-secondary btn-sm" onclick="PracticePage.startQuiz('${s.id}', 'practice')" title="Immediate feedback per question">
                <i class="ri-flashlight-line"></i> Practice
              </button>
              <button class="icon-btn" onclick="PracticePage.exportText('${s.id}')" title="Export as Formatted Text">
                <i class="ri-file-text-line"></i>
              </button>
              <button class="icon-btn" onclick="PracticePage.exportPDF('${s.id}')" title="Printable / PDF format">
                <i class="ri-printer-line"></i>
              </button>
              <button class="icon-btn text-danger" onclick="PracticePage.showDeleteModal('${s.id}')" title="Delete Practice Set">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── 2. Interactive Quiz Player View ──
function renderQuizSessionHtml(setId, mode = 'test') {
  const set = AppState.getPracticeSet(setId);
  if (!set || !set.questions || set.questions.length === 0) {
    return `
      <div class="page-view">
        <div class="empty-state-box full-width">
          <i class="ri-error-warning-line text-red" style="font-size:48px;"></i>
          <div class="empty-state-title">Practice Set Not Found</div>
          <div class="empty-state-desc">The requested practice set could not be loaded or has no questions.</div>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('practice')">
            <i class="ri-arrow-left-line"></i> Return to My Practice
          </button>
        </div>
      </div>
    `;
  }

  // Initialize or resume session state
  if (!_activeQuizState || _activeQuizState.setId !== setId) {
    _activeQuizState = {
      setId,
      mode, // 'test' | 'practice'
      currentIndex: 0,
      userAnswers: {},
      practiceFeedbackRevealed: {},
      startTime: Date.now()
    };
  } else if (mode && _activeQuizState.mode !== mode) {
    _activeQuizState.mode = mode;
  }

  const qIndex = _activeQuizState.currentIndex;
  const totalQ = set.questions.length;
  const currentQ = set.questions[qIndex];
  const answeredCount = Object.keys(_activeQuizState.userAnswers).length;
  const progressPct = Math.round((answeredCount / totalQ) * 100);

  const typeLabels = {
    mcq: 'Multiple Choice (4 Options)',
    true_false: 'True / False Question',
    blanks: 'Fill in the Blank',
    short: 'Short-Answer Concept'
  };

  const isPracticeMode = _activeQuizState.mode === 'practice';
  const hasRevealedPractice = isPracticeMode && _activeQuizState.practiceFeedbackRevealed[currentQ.id];
  const userAnswer = _activeQuizState.userAnswers[currentQ.id];

  return `
  <div class="page-view quiz-player-view">
    <!-- Quiz Top Bar -->
    <div class="quiz-topbar">
      <button class="btn btn-secondary btn-sm" onclick="PracticePage.confirmExitQuiz('${setId}')">
        <i class="ri-arrow-left-line"></i> Exit Quiz
      </button>

      <div class="quiz-top-info">
        <div class="quiz-set-title">${escapeHtml(set.title)}</div>
        <div class="quiz-set-meta">
          <span class="badge ${set.difficulty === 'easy' ? 'badge-green' : set.difficulty === 'hard' ? 'badge-orange' : 'badge-purple'}">
            ${capitalize(set.difficulty || 'medium')}
          </span>
          <span class="meta-dot">·</span>
          <span>Question ${qIndex + 1} of ${totalQ}</span>
        </div>
      </div>

      <!-- Mode Switcher -->
      <div class="quiz-mode-toggle">
        <label class="mode-switch-label" title="${isPracticeMode ? 'Immediate feedback after each answer' : 'Answers submitted and scored at the end'}">
          <input type="checkbox" id="quizModeToggle" ${isPracticeMode ? 'checked' : ''} 
            onchange="PracticePage.toggleQuizMode('${setId}', this.checked)" />
          <span class="mode-switch-slider"></span>
          <span class="mode-switch-text">${isPracticeMode ? 'Practice Mode (Live Feedback)' : 'Test Mode (Grade on Submit)'}</span>
        </label>
      </div>
    </div>

    <!-- Stepper Navigation Pills & Progress Bar -->
    <div class="quiz-progress-bar-container">
      <div class="quiz-progress-bar" style="width: ${progressPct}%;"></div>
    </div>

    <div class="quiz-stepper-container">
      <div class="quiz-stepper-list">
        ${set.questions.map((q, idx) => {
          const isAnswered = _activeQuizState.userAnswers[q.id] !== undefined && _activeQuizState.userAnswers[q.id] !== '';
          const isCurrent = idx === qIndex;
          let pillClass = 'stepper-pill';
          if (isCurrent) pillClass += ' current';
          if (isAnswered) pillClass += ' answered';

          return `
            <button class="${pillClass}" onclick="PracticePage.jumpToQuestion(${idx})" title="Question ${idx + 1}">
              ${idx + 1}
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Active Question Card -->
    <div class="quiz-question-card">
      <div class="question-header">
        <span class="question-num-tag">Question ${qIndex + 1}</span>
        <span class="badge badge-purple">${typeLabels[currentQ.type] || currentQ.type.toUpperCase()}</span>
      </div>

      <div class="question-prompt-text">
        ${escapeHtml(currentQ.question)}
      </div>

      <!-- Question Answer Options according to type -->
      <div class="question-answers-area" id="answersArea">
        ${renderQuestionInputHtml(currentQ, userAnswer, hasRevealedPractice, isPracticeMode)}
      </div>

      <!-- Practice Mode Instant Feedback Box -->
      ${hasRevealedPractice ? renderPracticeFeedbackBoxHtml(currentQ, userAnswer) : ''}

      <!-- Bottom Question Navigation Buttons -->
      <div class="quiz-navigation-footer">
        <button class="btn btn-secondary" onclick="PracticePage.prevQuestion()" ${qIndex === 0 ? 'disabled' : ''}>
          <i class="ri-arrow-left-s-line"></i> Previous
        </button>

        <div class="flex gap-2 items-center">
          ${isPracticeMode && !hasRevealedPractice && userAnswer ? `
            <button class="btn btn-secondary" onclick="PracticePage.revealPracticeFeedback('${currentQ.id}')">
              <i class="ri-check-line"></i> Check Answer
            </button>
          ` : ''}

          ${qIndex === totalQ - 1 ? `
            <button class="btn btn-primary btn-lg" onclick="PracticePage.submitQuiz('${setId}')">
              <i class="ri-checkbox-circle-line"></i> Submit Quiz (${answeredCount}/${totalQ})
            </button>
          ` : `
            <button class="btn btn-primary" onclick="PracticePage.nextQuestion()">
              Next <i class="ri-arrow-right-s-line"></i>
            </button>
          `}
        </div>
      </div>
    </div>
  </div>
  `;
}

// Render dynamic input based on question type
function renderQuestionInputHtml(q, userAnswer, hasRevealed, isPracticeMode) {
  // 1. Multiple Choice Questions (MCQ)
  if (q.type === 'mcq') {
    const letters = ['A', 'B', 'C', 'D'];
    return `
      <div class="mcq-options-list">
        ${(q.options || []).map((opt, optIdx) => {
          const letter = letters[optIdx] || (optIdx + 1);
          const isSelected = userAnswer === opt;
          let btnClass = 'mcq-option-btn';
          if (isSelected) btnClass += ' selected';

          if (hasRevealed) {
            const isCorrectOption = opt.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
            if (isCorrectOption) btnClass += ' option-correct';
            else if (isSelected && !isCorrectOption) btnClass += ' option-wrong';
          }

          return `
            <button type="button" class="${btnClass}" onclick="PracticePage.selectOptionByIndex('${q.id}', ${optIdx})">
              <span class="option-letter">${letter}</span>
              <span class="option-text">${escapeHtml(opt)}</span>
              ${isSelected ? `<i class="ri-checkbox-circle-fill option-check"></i>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  // 2. True / False Questions
  if (q.type === 'true_false') {
    const options = ['True', 'False'];
    return `
      <div class="tf-options-grid">
        ${options.map((opt, optIdx) => {
          const isSelected = userAnswer === opt;
          let btnClass = 'tf-option-btn';
          if (isSelected) btnClass += ' selected';

          if (hasRevealed) {
            const isCorrectOption = opt.toLowerCase() === String(q.answer).toLowerCase();
            if (isCorrectOption) btnClass += ' option-correct';
            else if (isSelected && !isCorrectOption) btnClass += ' option-wrong';
          }

          return `
            <button type="button" class="${btnClass}" onclick="PracticePage.selectOptionByIndex('${q.id}', ${optIdx})">
              <i class="${opt === 'True' ? 'ri-check-line text-green' : 'ri-close-line text-red'}"></i>
              <span>${opt}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  // 3. Fill in the Blanks
  if (q.type === 'blanks') {
    return `
      <div class="blanks-input-box">
        <label class="form-label">Type the missing term:</label>
        <div class="flex gap-2">
          <input type="text" class="form-input" id="blankInput_${q.id}" 
            placeholder="Enter missing word(s)..." 
            value="${escapeHtml(userAnswer || '')}" 
            onchange="PracticePage.selectOption('${q.id}', this.value)"
            ${hasRevealed ? 'disabled' : ''} />
          ${!hasRevealed ? `
            <button class="btn btn-secondary btn-sm" onclick="PracticePage.selectOption('${q.id}', document.getElementById('blankInput_${q.id}').value)">
              Confirm
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 4. Short Answer
  if (q.type === 'short') {
    return `
      <div class="short-answer-box">
        <label class="form-label">Type your explanation or summary based on the text:</label>
        <textarea class="editor-textarea" style="min-height:110px;" id="shortInput_${q.id}"
          placeholder="Write your answer..."
          onchange="PracticePage.selectOption('${q.id}', this.value)"
          ${hasRevealed ? 'disabled' : ''}>${escapeHtml(userAnswer || '')}</textarea>
        ${!hasRevealed ? `
          <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="PracticePage.selectOption('${q.id}', document.getElementById('shortInput_${q.id}').value)">
            Save Answer
          </button>
        ` : ''}
      </div>
    `;
  }

  return '';
}

// Feedback box for practice mode
function renderPracticeFeedbackBoxHtml(q, userAnswer) {
  const isCorrect = isAnswerCorrect(q, userAnswer);

  return `
    <div class="practice-feedback-banner ${isCorrect ? 'correct' : 'incorrect'}">
      <div class="feedback-status-row">
        <i class="${isCorrect ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}"></i>
        <span class="feedback-title">${isCorrect ? 'Correct Answer!' : 'Incorrect'}</span>
      </div>
      <div class="feedback-answer-line">
        <strong>Expected Answer:</strong> ${escapeHtml(String(q.answer))}
      </div>
      <div class="feedback-explanation">
        <strong>Explanation:</strong> ${escapeHtml(q.explanation || 'Directly grounded in the source text.')}
      </div>
    </div>
  `;
}

// ── 3. Quiz Results & Review View ──
function renderQuizResultsHtml(setId, attemptId) {
  const set = AppState.getPracticeSet(setId);
  if (!set) return renderPracticeDashboardHtml();

  const attempt = (set.attempts || []).find(a => a.id === attemptId) || set.lastAttempt;
  if (!attempt) return renderPracticeDashboardHtml();

  const scorePct = attempt.score || 0;
  let gradeClass = 'high';
  let gradeBadge = 'Outstanding Performance! 🎉';
  let gradeDesc = 'You have mastered the concepts in this material with excellent precision.';

  if (scorePct < 60) {
    gradeClass = 'low';
    gradeBadge = 'Needs Further Review 📚';
    gradeDesc = 'Consider reviewing the source material and retrying the quiz to reinforce key concepts.';
  } else if (scorePct < 85) {
    gradeClass = 'mid';
    gradeBadge = 'Good Understanding! 👍';
    gradeDesc = 'Solid grasp of core facts. Review the missed questions below to aim for 100%.';
  }

  return `
  <div class="page-view quiz-results-view">
    <!-- Top actions -->
    <div class="page-header-top">
      <button class="btn btn-secondary btn-sm" onclick="App.navigate('practice')">
        <i class="ri-arrow-left-line"></i> Return to My Practice
      </button>
      <div class="flex gap-2">
        <button class="btn btn-primary btn-sm" onclick="PracticePage.startQuiz('${setId}', 'test')">
          <i class="ri-refresh-line"></i> Retry Quiz
        </button>
        <button class="btn btn-secondary btn-sm" onclick="PracticePage.exportText('${setId}')">
          <i class="ri-file-text-line"></i> Export Results
        </button>
      </div>
    </div>

    <!-- Results Score Banner -->
    <div class="quiz-score-banner ${gradeClass}">
      <div class="score-circle">
        <span class="score-number">${scorePct}%</span>
        <span class="score-label">Final Score</span>
      </div>
      <div class="score-narrative">
        <div class="grade-badge">${gradeBadge}</div>
        <h2 class="score-set-title">${escapeHtml(set.title)}</h2>
        <p class="score-desc">${gradeDesc}</p>
        <div class="score-stats-row">
          <span><i class="ri-checkbox-circle-line text-green"></i> <strong>${attempt.correctCount}</strong> of ${attempt.totalQuestions} Correct</span>
          <span class="meta-dot">·</span>
          <span><i class="ri-time-line"></i> ${new Date(attempt.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
          <span class="meta-dot">·</span>
          <span><i class="ri-flashlight-line"></i> ${attempt.mode === 'practice' ? 'Practice Mode' : 'Test Assessment'}</span>
        </div>
      </div>
    </div>

    <!-- Detailed Question-by-Question Review -->
    <div class="section-header" style="margin-top:32px;">
      <div class="section-title"><i class="ri-file-list-3-line"></i> Question-by-Question Review</div>
      <span class="badge badge-purple">${set.questions.length} Items Audited</span>
    </div>

    <div class="quiz-review-list">
      ${set.questions.map((q, idx) => {
        const res = attempt.results?.[q.id] || {};
        const isCorrect = res.correct;
        const uAns = attempt.answers?.[q.id];

        return `
          <div class="review-question-card ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="review-q-header">
              <span class="review-q-num">Question ${idx + 1}</span>
              <span class="status-badge ${isCorrect ? 'status-correct' : 'status-incorrect'}">
                <i class="${isCorrect ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}"></i>
                ${isCorrect ? 'Correct (+100%)' : 'Incorrect (0%)'}
              </span>
            </div>

            <div class="review-q-prompt">
              ${escapeHtml(q.question)}
            </div>

            <div class="review-comparison-box">
              <div class="comp-item user-ans ${isCorrect ? 'text-green' : 'text-red'}">
                <span class="comp-label">Your Answer:</span>
                <span class="comp-val">${uAns !== undefined && uAns !== '' ? escapeHtml(String(uAns)) : '<em>(No Answer Provided)</em>'}</span>
              </div>
              <div class="comp-item correct-ans">
                <span class="comp-label">Correct Answer:</span>
                <span class="comp-val text-green">${escapeHtml(String(q.answer))}</span>
              </div>
            </div>

            <div class="review-explanation-box">
              <div class="exp-title"><i class="ri-lightbulb-line"></i> Explanation & Evidence</div>
              <div class="exp-text">${escapeHtml(q.explanation || 'Grounded directly in source text.')}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="quiz-results-footer" style="margin-top:32px;display:flex;justify-content:center;gap:12px;">
      <button class="btn btn-primary btn-lg" onclick="PracticePage.startQuiz('${setId}', 'test')">
        <i class="ri-refresh-line"></i> Retake This Quiz
      </button>
      <button class="btn btn-secondary btn-lg" onclick="App.navigate('practice')">
        <i class="ri-arrow-left-line"></i> Return to My Practice
      </button>
    </div>
  </div>
  `;
}

// ── 4. Helper Answer Verifier ──
function isAnswerCorrect(q, userAnswer) {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') return false;
  const user = String(userAnswer).trim().toLowerCase();
  const correct = String(q.answer).trim().toLowerCase();

  if (q.type === 'mcq' || q.type === 'true_false') {
    return user === correct;
  }

  if (q.type === 'blanks') {
    // Exact or trimmed match
    return user === correct || user.replace(/[^a-z0-9]/g, '') === correct.replace(/[^a-z0-9]/g, '');
  }

  if (q.type === 'short') {
    // Check if key words of correct answer are present in user answer
    const stopWords = new Set(['the', 'is', 'a', 'an', 'and', 'in', 'of', 'to', 'for', 'it', 'that', 'with']);
    const targetWords = correct.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    if (targetWords.length === 0) return user.length > 5;
    const matches = targetWords.filter(w => user.includes(w));
    return (matches.length / targetWords.length) >= 0.4 || user.length >= 20;
  }

  return user === correct;
}

// ── 5. Main PracticePage Controller ──
const PracticePage = {
  afterRender() {
    // Optional focus or re-attachment
  },

  onSearch(query) {
    _practiceSearchQuery = query;
    const container = document.getElementById('practiceSetsContainer');
    if (container) container.innerHTML = renderPracticeCardsHtml();
  },

  onFilterDifficulty(diff) {
    _practiceDifficultyFilter = diff;
    const container = document.getElementById('practiceSetsContainer');
    if (container) container.innerHTML = renderPracticeCardsHtml();
  },

  onFilterType(type) {
    _practiceTypeFilter = type;
    const container = document.getElementById('practiceSetsContainer');
    if (container) container.innerHTML = renderPracticeCardsHtml();
  },

  onFilterStatus(status) {
    _practiceStatusFilter = status;
    const container = document.getElementById('practiceSetsContainer');
    if (container) container.innerHTML = renderPracticeCardsHtml();
  },

  onSort(sortBy) {
    _practiceSortBy = sortBy;
    const container = document.getElementById('practiceSetsContainer');
    if (container) container.innerHTML = renderPracticeCardsHtml();
  },

  resetFilters() {
    _practiceSearchQuery = '';
    _practiceDifficultyFilter = '';
    _practiceTypeFilter = '';
    _practiceStatusFilter = '';
    _practiceSortBy = 'newest';
    App.navigate('practice');
  },

  // --- Quiz Session Execution ---
  startQuiz(setId, mode = 'test') {
    _activeQuizState = {
      setId,
      mode,
      currentIndex: 0,
      userAnswers: {},
      practiceFeedbackRevealed: {},
      startTime: Date.now()
    };
    App.navigate('practice', { quizSetId: setId, mode });
  },

  toggleQuizMode(setId, isPractice) {
    const nextMode = isPractice ? 'practice' : 'test';
    if (_activeQuizState) _activeQuizState.mode = nextMode;
    App.navigate('practice', { quizSetId: setId, mode: nextMode });
  },

  jumpToQuestion(index) {
    if (_activeQuizState) {
      _activeQuizState.currentIndex = index;
      const set = AppState.getPracticeSet(_activeQuizState.setId);
      if (set) {
        const pageContainer = document.getElementById('pageContainer');
        if (pageContainer) pageContainer.innerHTML = renderQuizSessionHtml(set.id, _activeQuizState.mode);
      }
    }
  },

  prevQuestion() {
    if (_activeQuizState && _activeQuizState.currentIndex > 0) {
      this.jumpToQuestion(_activeQuizState.currentIndex - 1);
    }
  },

  nextQuestion() {
    if (_activeQuizState) {
      const set = AppState.getPracticeSet(_activeQuizState.setId);
      if (set && _activeQuizState.currentIndex < set.questions.length - 1) {
        this.jumpToQuestion(_activeQuizState.currentIndex + 1);
      }
    }
  },

  selectOptionByIndex(qId, optIdx) {
    if (!_activeQuizState) return;
    const set = AppState.getPracticeSet(_activeQuizState.setId);
    if (!set) return;
    const q = (set.questions || []).find(item => item.id === qId);
    if (q) {
      const opt = q.type === 'true_false' ? ['True', 'False'][optIdx] : (q.options ? q.options[optIdx] : null);
      if (opt !== null && opt !== undefined) {
        this.selectOption(qId, opt);
      }
    }
  },

  selectOption(qId, val) {
    if (!_activeQuizState) return;
    _activeQuizState.userAnswers[qId] = val;

    // In practice mode, automatically reveal feedback
    if (_activeQuizState.mode === 'practice') {
      _activeQuizState.practiceFeedbackRevealed[qId] = true;
    }

    // Refresh current question view smoothly
    const set = AppState.getPracticeSet(_activeQuizState.setId);
    if (set) {
      const container = document.getElementById('pageContainer');
      if (container) container.innerHTML = renderQuizSessionHtml(set.id, _activeQuizState.mode);
    }
  },

  revealPracticeFeedback(qId) {
    if (_activeQuizState) {
      _activeQuizState.practiceFeedbackRevealed[qId] = true;
      const set = AppState.getPracticeSet(_activeQuizState.setId);
      if (set) {
        const container = document.getElementById('pageContainer');
        if (container) container.innerHTML = renderQuizSessionHtml(set.id, _activeQuizState.mode);
      }
    }
  },

  confirmExitQuiz(setId) {
    if (confirm('Are you sure you want to exit this quiz session? Unsubmitted answers will be discarded.')) {
      _activeQuizState = null;
      App.navigate('practice');
    }
  },

  submitQuiz(setId) {
    const set = AppState.getPracticeSet(setId);
    if (!set || !_activeQuizState) return;

    const totalQ = set.questions.length;
    const answeredCount = Object.keys(_activeQuizState.userAnswers).length;

    if (answeredCount < totalQ) {
      const proceed = confirm(`You have answered ${answeredCount} of ${totalQ} questions. Are you sure you want to submit? Unanswered questions will receive 0 points.`);
      if (!proceed) return;
    }

    // Calculate score
    let correctCount = 0;
    const results = {};

    set.questions.forEach(q => {
      const userAns = _activeQuizState.userAnswers[q.id];
      const correct = isAnswerCorrect(q, userAns);
      if (correct) correctCount++;
      results[q.id] = {
        correct,
        userAnswer: userAns,
        correctAnswer: q.answer,
        explanation: q.explanation
      };
    });

    const scorePct = Math.round((correctCount / totalQ) * 100);

    const attempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      mode: _activeQuizState.mode,
      score: scorePct,
      correctCount,
      totalQuestions: totalQ,
      answers: { ..._activeQuizState.userAnswers },
      results
    };

    AppState.recordQuizAttempt(setId, attempt);
    _activeQuizState = null;

    Toast.show(scorePct >= 70 ? 'success' : 'info', 'Quiz Submitted', `You scored ${scorePct}% (${correctCount}/${totalQ} correct).`);
    App.navigate('practice', { resultsSetId: setId, attemptId: attempt.id });
  },

  // --- Modals: Rename & Delete ---
  showRenameModal(setId) {
    const set = AppState.getPracticeSet(setId);
    if (!set) return;

    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.id = 'renameModal';
    modal.innerHTML = `
      <div class="custom-modal-card">
        <div class="modal-header">
          <div class="modal-title"><i class="ri-edit-line"></i> Rename Practice Set</div>
          <button class="modal-close" onclick="document.getElementById('renameModal').remove()"><i class="ri-close-line"></i></button>
        </div>
        <div class="modal-body">
          <label class="form-label">Practice Set Title</label>
          <input type="text" class="form-input" id="renameTitleInput" value="${escapeHtml(set.title)}" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('renameModal').remove()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="PracticePage.executeRename('${setId}')">Save Title</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
      const input = document.getElementById('renameTitleInput');
      input?.focus();
      input?.select();
    }, 100);
  },

  executeRename(setId) {
    const input = document.getElementById('renameTitleInput');
    const val = input?.value?.trim();
    if (val) {
      AppState.renamePracticeSet(setId, val);
      document.getElementById('renameModal')?.remove();
      App.navigate('practice');
    }
  },

  showDeleteModal(setId) {
    const set = AppState.getPracticeSet(setId);
    if (!set) return;

    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.id = 'deleteModal';
    modal.innerHTML = `
      <div class="custom-modal-card">
        <div class="modal-header">
          <div class="modal-title text-danger"><i class="ri-alert-line"></i> Delete Practice Set</div>
          <button class="modal-close" onclick="document.getElementById('deleteModal').remove()"><i class="ri-close-line"></i></button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:12px;">Are you sure you want to permanently delete <strong>"${escapeHtml(set.title)}"</strong>?</p>
          <p style="font-size:12px;color:var(--text-muted);">This will remove all ${set.questions?.length || 0} questions and all ${set.attempts?.length || 0} recorded attempts. This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('deleteModal').remove()">Cancel</button>
          <button class="btn btn-danger btn-sm" onclick="PracticePage.executeDelete('${setId}')">Permanently Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  executeDelete(setId) {
    AppState.deletePracticeSet(setId);
    document.getElementById('deleteModal')?.remove();
    App.navigate('practice');
  },

  // --- Exports ---
  exportText(setId) {
    const set = AppState.getPracticeSet(setId);
    if (!set) return;

    let text = `================================================================\n`;
    text += ` TransformAI — Practice Quiz & Assessment\n`;
    text += ` Title: ${set.title}\n`;
    text += ` Difficulty: ${set.difficulty.toUpperCase()} | Questions: ${set.questions.length}\n`;
    text += ` Created: ${new Date(set.createdAt).toLocaleString()}\n`;
    text += `================================================================\n\n`;

    text += `--- SOURCE CONTENT OVERVIEW ---\n`;
    text += `${set.sourceText || set.sourcePreview}\n\n`;

    text += `--- PRACTICE QUESTIONS ---\n\n`;

    const letters = ['A', 'B', 'C', 'D'];
    set.questions.forEach((q, idx) => {
      text += `Question ${idx + 1} [${q.type.toUpperCase()}]:\n`;
      text += `${q.question}\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, oIdx) => {
          text += `  (${letters[oIdx] || oIdx + 1}) ${opt}\n`;
        });
      }
      text += `\n`;
    });

    text += `================================================================\n`;
    text += ` ANSWER KEY & GROUNDED EXPLANATIONS\n`;
    text += `================================================================\n\n`;

    set.questions.forEach((q, idx) => {
      text += `Q${idx + 1} Answer: ${q.answer}\n`;
      text += `Explanation: ${q.explanation}\n\n`;
    });

    if (set.attempts && set.attempts.length > 0) {
      text += `--- PREVIOUS ATTEMPTS RECORD ---\n`;
      set.attempts.forEach((a, aIdx) => {
        text += `Attempt #${set.attempts.length - aIdx}: ${a.score}% (${a.correctCount}/${a.totalQuestions} correct) on ${new Date(a.timestamp).toLocaleString()}\n`;
      });
    }

    // Download Blob
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Quiz.txt`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('success', 'Export Succeeded', 'Practice set exported as formatted text file.');
  },

  exportPDF(setId) {
    const set = AppState.getPracticeSet(setId);
    if (!set) return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      Toast.show('error', 'Popup Blocked', 'Please allow popups to generate the printable PDF.');
      return;
    }

    const letters = ['A', 'B', 'C', 'D'];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(set.title)} — TransformAI Quiz</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: bold; margin: 0; }
          .meta { color: #555; font-size: 13px; margin-top: 6px; }
          .question-card { margin-bottom: 24px; page-break-inside: avoid; }
          .q-title { font-weight: 600; font-size: 15px; margin-bottom: 8px; }
          .options { margin-left: 20px; }
          .opt-item { margin-bottom: 4px; }
          .answer-key-section { margin-top: 40px; page-break-before: always; border-top: 2px solid #333; padding-top: 20px; }
          .exp-box { font-size: 13px; color: #444; margin-top: 4px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:20px;padding:10px;background:#e2e8f0;border-radius:6px;">
          <button onclick="window.print()" style="padding:8px 16px;font-weight:bold;cursor:pointer;">🖨️ Print or Save as PDF</button>
        </div>
        <div class="header">
          <div class="title">${escapeHtml(set.title)}</div>
          <div class="meta">
            TransformAI Practice Quiz · Difficulty: ${set.difficulty.toUpperCase()} · ${set.questions.length} Questions
          </div>
        </div>

        <div class="questions-section">
          ${set.questions.map((q, idx) => `
            <div class="question-card">
              <div class="q-title">Q${idx + 1}. [${q.type.toUpperCase()}] ${escapeHtml(q.question)}</div>
              ${q.options ? `
                <div class="options">
                  ${q.options.map((opt, oIdx) => `
                    <div class="opt-item">(${letters[oIdx] || oIdx + 1}) ${escapeHtml(opt)}</div>
                  `).join('')}
                </div>
              ` : `
                <div style="margin-top:16px;border-bottom:1px dashed #ccc;height:24px;"></div>
              `}
            </div>
          `).join('')}
        </div>

        <div class="answer-key-section">
          <h2>Answer Key & Explanations</h2>
          ${set.questions.map((q, idx) => `
            <div style="margin-bottom:16px;">
              <strong>Q${idx + 1} Answer:</strong> ${escapeHtml(String(q.answer))}
              <div class="exp-box"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
    Toast.show('success', 'Print Window Opened', 'Use the print dialogue to Save as PDF.');
  }
};

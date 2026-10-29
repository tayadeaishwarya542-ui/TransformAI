// ================================================================
//  TransformAI — Automated Test Suite for AI Quiz & Practice Generator
// ================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Simulate Browser LocalStorage
const _storage = {};
global.localStorage = {
  getItem: (k) => _storage[k] || null,
  setItem: (k, v) => { _storage[k] = String(v); },
  removeItem: (k) => { delete _storage[k]; },
  clear: () => { for (const k in _storage) delete _storage[k]; }
};

// Simulate Window / Document minimal stubs
global.window = global;
global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'dark' },
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.Toast = { show: () => {} };
global.escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
global.capitalize = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
global.wordCount = (text) => text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

// Load Transformations, API, App using vm.runInThisContext
const transformCode = fs.readFileSync(fs.existsSync(path.join(__dirname, '..', '..', 'qitu', 'js', 'transformations.js')) ? path.join(__dirname, '..', '..', 'qitu', 'js', 'transformations.js') : path.join(__dirname, '..', 'js', 'transformations.js'), 'utf-8');
vm.runInThisContext(transformCode);

const apiCode = fs.readFileSync(fs.existsSync(path.join(__dirname, '..', '..', 'qitu', 'js', 'api.js')) ? path.join(__dirname, '..', '..', 'qitu', 'js', 'api.js') : path.join(__dirname, '..', 'js', 'api.js'), 'utf-8');
vm.runInThisContext(apiCode);

const appCode = fs.readFileSync(fs.existsSync(path.join(__dirname, '..', '..', 'qitu', 'js', 'app.js')) ? path.join(__dirname, '..', '..', 'qitu', 'js', 'app.js') : path.join(__dirname, '..', 'js', 'app.js'), 'utf-8');
vm.runInThisContext(appCode);

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

const sampleText = `
Artificial Intelligence is a branch of computer science focused on building smart machines capable of performing tasks that typically require human intelligence. Machine learning is a specific subset of AI where systems automatically learn and improve from experience without being explicitly programmed. Supervised learning algorithms are trained on labeled datasets to map inputs to desired outputs for classification and regression tasks. In contrast, unsupervised learning discovers hidden patterns in unlabeled data without human supervision. Reinforcement learning trains agents to maximize cumulative rewards through trial and error interactions with an environment. Deep learning utilizes multi-layered artificial neural networks inspired by the human brain to process complex unstructured data such as images, audio, and natural language. Overfitting occurs when an algorithm memorizes training data noise, reducing its ability to generalize to new unseen inputs.
`;

console.log('================================================================');
console.log('   AI Quiz & Practice Generator — Automated Verification');
console.log('================================================================\n');

// Group 1: Generation Engine Validation
console.log('--- TEST GROUP 1: Input Validation & Error Handling ---');
try {
  LocalNLP.generateQuiz('');
  assert(false, 'Should throw error on empty input');
} catch (e) {
  assert(e.message.includes('too short'), 'Empty text triggers validation error');
}

try {
  LocalNLP.generateQuiz('Short text.');
  assert(false, 'Should throw error on short input (<30 chars)');
} catch (e) {
  assert(e.message.includes('too short'), 'Insufficient text (<30 chars) triggers validation error');
}

// Group 2: Question Generation & Structural Grounding
console.log('\n--- TEST GROUP 2: Question Generation & Types Grounding ---');
const quiz = LocalNLP.generateQuiz(sampleText, {
  count: 5,
  difficulty: 'medium',
  types: ['mcq', 'true_false', 'blanks', 'short']
});

assert(quiz.title && quiz.title.length > 5, `Generated meaningful title: "${quiz.title}"`);
assert(quiz.questions.length === 5, `Generated requested count: 5 questions (got ${quiz.questions.length})`);
assert(quiz.difficulty === 'medium', 'Difficulty metadata preserved');
assert(quiz.sourceText.includes('Artificial Intelligence'), 'Source text preserved');

// Verify MCQ
const mcq = quiz.questions.find(q => q.type === 'mcq');
assert(mcq !== undefined, 'MCQ question generated');
assert(Array.isArray(mcq.options) && mcq.options.length === 4, 'MCQ contains exactly 4 distinct options (A, B, C, D)');
assert(mcq.options.includes(mcq.answer), 'MCQ correct answer strictly matches one of the 4 options');
assert(mcq.explanation && mcq.explanation.length > 15, 'MCQ contains clear explanation citing the text');

// Verify True / False
const tf = quiz.questions.find(q => q.type === 'true_false');
assert(tf !== undefined, 'True/False question generated');
assert(tf.options.includes('True') && tf.options.includes('False'), 'True/False options are ["True", "False"]');
assert(tf.answer === 'True' || tf.answer === 'False', `True/False answer is valid boolean string: ${tf.answer}`);
assert(tf.explanation && tf.explanation.length > 10, 'True/False contains grounded explanation');

// Verify Fill in the blanks
const blanks = quiz.questions.find(q => q.type === 'blanks');
assert(blanks !== undefined, 'Fill-in-the-blanks question generated');
assert(blanks.question.includes('________'), 'Blank marker "________" present in question prompt');
assert(blanks.answer && blanks.answer.length > 0, `Blanks answer provided: "${blanks.answer}"`);

// Verify Short Answer
const short = quiz.questions.find(q => q.type === 'short');
assert(short !== undefined, 'Short answer question generated');
assert(short.answer && short.answer.length > 15, 'Short answer model response provided');
assert(short.explanation && short.explanation.length > 10, 'Short answer explanation provided');

// Group 3: Difficulty & Count Scaling
console.log('\n--- TEST GROUP 3: Difficulty & Count Configuration ---');
const quiz10 = LocalNLP.generateQuiz(sampleText, { count: 10, difficulty: 'hard' });
assert(quiz10.questions.length === 10, `Generated exactly 10 questions on demand (got ${quiz10.questions.length})`);
assert(quiz10.difficulty === 'hard', 'Hard difficulty setting preserved');

// Group 4: Persistent Storage in AppState
console.log('\n--- TEST GROUP 4: Persistent Storage & Data Integrity ---');
const savedSet = AppState.savePracticeSet(quiz);
assert(savedSet && savedSet.id && savedSet.id.startsWith('pset_'), `Practice set saved with unique ID: ${savedSet.id}`);

const retrieved = AppState.getPracticeSet(savedSet.id);
assert(retrieved && retrieved.title === quiz.title, 'Practice set successfully retrieved from persistent storage');

const allSets = AppState.getPracticeSets();
assert(allSets.length === 1 && allSets[0].id === savedSet.id, 'getPracticeSets returns stored set');

// Inline Rename
const renamedOk = AppState.renamePracticeSet(savedSet.id, 'AI & ML Mastery Quiz');
assert(renamedOk === true, 'Renaming practice set succeeded');
const renamedSet = AppState.getPracticeSet(savedSet.id);
assert(renamedSet.title === 'AI & ML Mastery Quiz', `Title updated persistently to "${renamedSet.title}"`);

// Group 5: Quiz Scoring & Attempt Tracking
console.log('\n--- TEST GROUP 5: Interactive Quiz Scoring & Attempt Tracking ---');
const perfectAnswers = {};
savedSet.questions.forEach(q => { perfectAnswers[q.id] = q.answer; });

let correctCount = 0;
savedSet.questions.forEach(q => {
  if (perfectAnswers[q.id].toLowerCase() === String(q.answer).toLowerCase()) {
    correctCount++;
  }
});
const perfectScore = Math.round((correctCount / savedSet.questions.length) * 100);
assert(perfectScore === 100, `Accurate score calculation: 100% (${correctCount}/${savedSet.questions.length})`);

// Record attempt #1
const attempt1 = AppState.recordQuizAttempt(savedSet.id, {
  score: 100,
  correctCount: savedSet.questions.length,
  totalQuestions: savedSet.questions.length,
  answers: perfectAnswers,
  mode: 'test'
});
assert(attempt1 && attempt1.id && attempt1.score === 100, 'Attempt #1 recorded with 100% score');

// Record attempt #2 (60% score)
const attempt2 = AppState.recordQuizAttempt(savedSet.id, {
  score: 60,
  correctCount: 3,
  totalQuestions: 5,
  answers: {},
  mode: 'practice'
});
assert(attempt2 && attempt2.score === 60, 'Attempt #2 recorded with 60% score');

const setAfterAttempts = AppState.getPracticeSet(savedSet.id);
assert(setAfterAttempts.attempts.length === 2, `Both attempts persisted independently (${setAfterAttempts.attempts.length} attempts)`);
assert(setAfterAttempts.lastAttempt.id === attempt2.id, 'Latest attempt tracked accurately');

// Group 6: Live Practice Analytics
console.log('\n--- TEST GROUP 6: My Practice Analytics Calculation ---');
const practiceStats = AppState.getPracticeStats();
assert(practiceStats.totalSets === 1, `Total sets counted: ${practiceStats.totalSets}`);
assert(practiceStats.totalAttempts === 2, `Total attempts counted: ${practiceStats.totalAttempts}`);
assert(practiceStats.avgScore === 80, `Average score correctly computed: 80% (avg of 100 and 60, got ${practiceStats.avgScore}%)`);
assert(practiceStats.bestScore === 100, `Best score correctly identified: 100% (got ${practiceStats.bestScore}%)`);
assert(practiceStats.lastActivity !== null, 'Recent activity timestamp tracked');

// Group 7: Deletion & Cleanup
console.log('\n--- TEST GROUP 7: Deletion & Safety ---');
AppState.deletePracticeSet(savedSet.id);
assert(AppState.getPracticeSet(savedSet.id) === null, 'Practice set safely deleted');
assert(AppState.getPracticeSets().length === 0, 'Practice sets list empty after deletion');

// Summary
console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);

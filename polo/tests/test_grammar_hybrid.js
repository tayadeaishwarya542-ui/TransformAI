// ================================================================
//  TransformAI — Comprehensive Hybrid Grammar Engine Test Suite
//  Validates:
//    - 9 Mandatory Offline Test Cases
//    - Generalized English Rules & Idempotency
//    - Word-Level Visual Diff (LCS alignment)
//    - Mode A (AI-Powered) with Mocks
//    - Automatic Fallback Engine Attribution & Retry Flow
//    - Mode B (Offline Only) No Network Call
// ================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser globals for Node.js test environment
global.escapeHtml = (str) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
global.wordCount = (text) => text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
global.AppState = {
  _settings: {
    provider: 'local',
    keys: { openai: '', gemini: '', anthropic: '' },
    models: { openai: 'gpt-4o-mini', gemini: 'gemini-1.5-flash', anthropic: 'claude-3-5-sonnet-20241022' }
  },
  getSetting(key) { return this._settings[key]; },
  getSettings() { return this._settings; },
  getPref() { return true; },
  updateSetting(k, v) { this._settings[k] = v; },
  addHistory() {}
};
global.Toast = { show: () => {} };

// Load transformations.js and api.js
const transCode = fs.readFileSync(fs.existsSync(path.join(__dirname, '..', '..', 'qitu', 'js', 'transformations.js')) ? path.join(__dirname, '..', '..', 'qitu', 'js', 'transformations.js') : path.join(__dirname, '..', 'js', 'transformations.js'), 'utf-8');
vm.runInThisContext(transCode);

const apiCode = fs.readFileSync(fs.existsSync(path.join(__dirname, '..', '..', 'qitu', 'js', 'api.js')) ? path.join(__dirname, '..', '..', 'qitu', 'js', 'api.js') : path.join(__dirname, '..', 'js', 'api.js'), 'utf-8');
vm.runInThisContext(apiCode);

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName}\n     Expected: "${expected}"\n     Actual:   "${actual}"`);
  }
}

function assertTrue(cond, testName, details = '') {
  if (cond) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('  TransformAI — Hybrid Grammar Engine Comprehensive Test Suite');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test Group 1: The 9 Mandatory Test Cases
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: The 9 Explicit Test Cases ---');
  const mandatoryCases = [
    { input: "she am girl", expected: "She is a girl." },
    { input: "he are happy", expected: "He is happy." },
    { input: "they is playing", expected: "They are playing." },
    { input: "i has a book", expected: "I have a book." },
    { input: "she go to school", expected: "She goes to school." },
    { input: "i am going to college", expected: "I am going to college." },
    { input: "this are my books", expected: "These are my books." },
    { input: "hello how are you", expected: "Hello, how are you?" },
    { input: "She is a girl.", expected: "She is a girl." }
  ];

  mandatoryCases.forEach(({ input, expected }, idx) => {
    const res = LocalNLP.grammar(input, {});
    assertEqual(res.correctedText, expected, `Test Case ${idx + 1}: "${input}" -> "${expected}"`);
    assertTrue(res.diffHtml !== undefined && res.diffHtml.length > 0, `Test Case ${idx + 1}: Diff HTML generated`);
  });

  // -------------------------------------------------------------
  // Test Group 2: Generalized Rules & Edge Cases
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Generalized Rules & Edge Cases ---');
  
  // Demonstrative agreement
  assertEqual(
    LocalNLP.grammar("that are my keys", {}).correctedText,
    "Those are my keys.",
    "Demonstrative agreement: 'that are' -> 'Those are'"
  );

  // 3rd person singular verb inflections
  assertEqual(
    LocalNLP.grammar("he play football", {}).correctedText,
    "He plays football.",
    "Verb inflection (-s): 'he play' -> 'He plays'"
  );
  assertEqual(
    LocalNLP.grammar("she try hard", {}).correctedText,
    "She tries hard.",
    "Verb inflection (-ies): 'she try' -> 'She tries'"
  );
  assertEqual(
    LocalNLP.grammar("he watch television", {}).correctedText,
    "He watches television.",
    "Verb inflection (-es): 'he watch' -> 'He watches'"
  );

  // Count noun article insertion
  assertEqual(
    LocalNLP.grammar("he is boy", {}).correctedText,
    "He is a boy.",
    "Indefinite article: 'he is boy' -> 'He is a boy.'"
  );
  assertEqual(
    LocalNLP.grammar("she is engineer", {}).correctedText,
    "She is an engineer.",
    "Vowel article: 'she is engineer' -> 'She is an engineer.'"
  );

  // Question mark detection
  assertEqual(
    LocalNLP.grammar("where do you live", {}).correctedText,
    "Where do you live?",
    "Interrogative punctuation: 'where do you live' ends with '?'"
  );
  assertEqual(
    LocalNLP.grammar("what is your name", {}).correctedText,
    "What is your name?",
    "Interrogative punctuation: 'what is your name' ends with '?'"
  );

  // Idempotency: Pristine text untouched
  const pristine = "The architecture safely decouples local offline NLP from cloud intelligence.";
  assertEqual(
    LocalNLP.grammar(pristine, {}).correctedText,
    pristine,
    "Idempotency: Correct text remains completely unaltered"
  );

  // -------------------------------------------------------------
  // Test Group 3: Word-Level Visual Diff Inspection
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Visual Diff LCS Alignment ---');
  const diffTest = LocalNLP.grammar("she am girl", {});
  assertTrue(diffTest.diffHtml.includes('<del class="diff-del">am</del>'), 'Visual diff marks deleted token "am"');
  assertTrue(diffTest.diffHtml.includes('<ins class="diff-ins">is</ins>'), 'Visual diff marks inserted token "is"');
  assertTrue(diffTest.diffHtml.includes('<ins class="diff-ins">a</ins>'), 'Visual diff marks inserted article "a"');

  // -------------------------------------------------------------
  // Test Group 4: Mode B (Offline Only) via API layer
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Mode B (Offline Grammar Correction) ---');
  const offlineResult = await API.executeTransform({
    type: 'grammar',
    input: 'he are happy',
    opts: { mode: 'offline' }
  });
  assertEqual(offlineResult.output, 'He is happy.', 'Mode B returns clean corrected text');
  assertEqual(offlineResult.extraMeta.engineUsed, 'offline', 'Mode B sets engineUsed to "offline"');
  assertEqual(offlineResult.extraMeta.isFallback, false, 'Mode B is not marked as fallback');
  assertTrue(offlineResult.extraMeta.diffHtml.includes('<del class="diff-del">are</del>'), 'Mode B includes visual diff');

  // -------------------------------------------------------------
  // Test Group 5: Mode A (AI-Powered) with Mocked Provider Success
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Mode A (AI-Powered) Provider Success ---');
  // Mock OpenAI call
  API.setProvider('openai');
  API.setKey('openai', 'sk-mock-valid-test-key-12345');
  const originalCallOpenAI = API._callOpenAI;
  API._callOpenAI = async ({ prompt }) => {
    return "She is a girl.";
  };

  const aiSuccessRes = await API.executeTransform({
    type: 'grammar',
    input: 'she am girl',
    opts: { mode: 'ai' }
  });
  assertEqual(aiSuccessRes.output, 'She is a girl.', 'AI Mode returns AI corrected output');
  assertEqual(aiSuccessRes.extraMeta.engineUsed, 'ai', 'Engine attributed honestly to AI');
  assertEqual(aiSuccessRes.extraMeta.isFallback, false, 'Success is not a fallback');
  assertTrue(aiSuccessRes.extraMeta.diffHtml.includes('<del class="diff-del">am</del>'), 'AI output generates visual diff against original input');

  // -------------------------------------------------------------
  // Test Group 6: AI Failure with Automatic Fallback DISABLED
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: AI Failure with Fallback DISABLED (No Silent Replace) ---');
  API._callOpenAI = async () => {
    const err = new Error('Rate limit exceeded (HTTP 429)');
    err.status = 429;
    throw err;
  };

  let threwExpectedError = false;
  try {
    await API.executeTransform({
      type: 'grammar',
      input: 'they is playing',
      opts: { mode: 'ai', autoFallback: 'no' }
    });
  } catch (err) {
    threwExpectedError = true;
    assertTrue(err.message.includes('Rate limit') || err.message.includes('AI Grammar Correction Failed'), 'Error message preserved for user visibility');
    assertTrue(err.canRetryAI === true, 'Error allows user retry');
  }
  assertTrue(threwExpectedError, 'AI failure without fallback threw error instead of silently replacing output');

  // -------------------------------------------------------------
  // Test Group 7: AI Failure with Automatic Fallback ENABLED
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 7: AI Failure with Fallback ENABLED (Honest Attribution) ---');
  const fallbackRes = await API.executeTransform({
    type: 'grammar',
    input: 'they is playing',
    opts: { mode: 'hybrid', autoFallback: 'yes' }
  });
  assertEqual(fallbackRes.output, 'They are playing.', 'Fallback correctly recovers using offline rule engine');
  assertEqual(fallbackRes.extraMeta.engineUsed, 'offline-fallback', 'Engine attribution honest: offline-fallback');
  assertEqual(fallbackRes.extraMeta.isFallback, true, 'isFallback is true');
  assertTrue(fallbackRes.extraMeta.engineLabel.includes('Offline Fallback'), 'Label clearly indicates Offline Fallback');
  assertTrue(fallbackRes.extraMeta.canRetryAI === true, 'Fallback metadata flags that AI can be retried');

  // -------------------------------------------------------------
  // Test Group 8: Provider Not Configured with Hybrid Fallback
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 8: Unconfigured Cloud Provider with Hybrid Fallback ---');
  API.setKey('openai', ''); // clear key
  const unconfiguredRes = await API.executeTransform({
    type: 'grammar',
    input: 'this are my books',
    opts: { mode: 'hybrid', autoFallback: 'yes' }
  });
  assertEqual(unconfiguredRes.output, 'These are my books.', 'Unconfigured cloud provider gracefully uses offline fallback');
  assertEqual(unconfiguredRes.extraMeta.engineUsed, 'offline-fallback', 'Engine attribution honest: offline-fallback');

  // Restore mock
  API._callOpenAI = originalCallOpenAI;

  console.log('\n================================================================');
  console.log(`TOTAL GRAMMAR SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runAllTests();

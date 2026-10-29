// ================================================================
//  TransformAI — Automated Test Suite for Authentication & Data Isolation
//  Verifies: Registration, Scrypt Password Hashing, Validation,
//            Duplicate Rejection, Session Management, Endpoint Protection,
//            and 100% Strict User Data Isolation in SQLite.
// ================================================================

const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const DB = require('../db.js');
const server = require('../server.js');

let TEST_PORT = 5199;
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
}

function requestJson(method, pathname, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: pathname,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body || '{}');
        } catch (e) {
          parsed = body;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runAuthTests() {
  console.log('================================================================');
  console.log('       TransformAI — Authentication & Data Isolation Suite       ');
  console.log('================================================================\n');

  // Start test server instance
  await new Promise((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`[Test Harness] Live test server listening on port ${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // GROUP 1: Health Check Telemetry
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: Health Check Telemetry ---');
    const healthRes = await requestJson('GET', '/api/health');
    assert(healthRes.status === 200, 'Health endpoint responds with HTTP 200');
    assert(healthRes.data.status === 'healthy', 'Health check status is healthy');
    assert(healthRes.data.database && healthRes.data.database.database.includes('SQLite'), 'SQLite database reported active');

    // -------------------------------------------------------------
    // GROUP 2: Registration Validation & Security Constraints
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Registration Validation & Error Handling ---');
    
    // Test 2.1: Missing Full Name
    const resNoName = await requestJson('POST', '/api/auth/signup', {
      full_name: '',
      email: 'user@test.com',
      password: 'ValidPassword123!@#'
    });
    assert(resNoName.status === 400, 'Rejects registration with empty full name (HTTP 400)');
    assert(resNoName.data.error.includes('Full Name'), 'Returns clear name validation error message');

    // Test 2.2: Invalid Email format
    const resBadEmail = await requestJson('POST', '/api/auth/signup', {
      full_name: 'John Doe',
      email: 'notanemail',
      password: 'ValidPassword123!@#'
    });
    assert(resBadEmail.status === 400, 'Rejects invalid email format (HTTP 400)');

    // Test 2.3: Password too short (<8 characters)
    const resShortPwd = await requestJson('POST', '/api/auth/signup', {
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'Pass1!'
    });
    assert(resShortPwd.status === 400, 'Rejects password shorter than 8 chars (HTTP 400)');

    // Test 2.4: Password missing special characters
    const resNoSpecial = await requestJson('POST', '/api/auth/signup', {
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'Password12345'
    });
    assert(resNoSpecial.status === 400, 'Rejects password without special characters (HTTP 400)');

    // Test 2.5: Confirm password mismatch
    const resMismatch = await requestJson('POST', '/api/auth/signup', {
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'ValidPassword123!@#',
      confirm_password: 'DifferentPassword123!@#'
    });
    assert(resMismatch.status === 400, 'Rejects password and confirm_password mismatch (HTTP 400)');

    // -------------------------------------------------------------
    // GROUP 3: Successful User Registration & Scrypt Hashing
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Account Creation & Scrypt Password Security ---');
    
    const userAliceEmail = `alice_${Date.now()}@transformai.com`;
    const userAlicePass = 'AliceSuperSecret2026!@#';
    
    const regAlice = await requestJson('POST', '/api/auth/signup', {
      full_name: 'Alice Johnson',
      email: userAliceEmail,
      password: userAlicePass,
      confirm_password: userAlicePass
    });

    assert(regAlice.status === 201, 'Successful registration returns HTTP 201 Created');
    assert(regAlice.data.token && regAlice.data.token.length >= 32, 'Returns cryptographically secure session token');
    assert(regAlice.data.user && regAlice.data.user.email === userAliceEmail, 'Returns created user profile');
    const aliceToken = regAlice.data.token;
    const aliceId = regAlice.data.user.id;

    // Direct SQLite Inspection: Verify password hashing
    const rawAlice = DB.findUserByEmail(userAliceEmail);
    assert(rawAlice !== null, 'Alice record exists in SQLite database');
    assert(rawAlice.password_hash !== userAlicePass, 'Plaintext password is NEVER stored in database');
    assert(rawAlice.password_salt && rawAlice.password_salt.length === 32, 'Unique 16-byte cryptographic salt generated');
    assert(rawAlice.password_hash.length === 128, 'Password stored as 64-byte Scrypt derived key (128 hex chars)');

    // Test 3.2: Duplicate Email Rejection
    const regDuplicate = await requestJson('POST', '/api/auth/signup', {
      full_name: 'Alice Imposter',
      email: userAliceEmail.toUpperCase(), // Test case-insensitivity
      password: 'AnotherPassword123!@#'
    });
    assert(regDuplicate.status === 409, 'Rejects duplicate email registration with HTTP 409 Conflict');
    assert(regDuplicate.data.error.includes('already exists'), 'Provides friendly duplicate explanation');

    // -------------------------------------------------------------
    // GROUP 4: Login Authentication & Credential Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: User Login & Credential Verification ---');
    
    // Test 4.1: Login with correct credentials
    const loginSuccess = await requestJson('POST', '/api/auth/login', {
      email: userAliceEmail,
      password: userAlicePass
    });
    assert(loginSuccess.status === 200, 'Login with correct credentials returns HTTP 200');
    assert(loginSuccess.data.token, 'Returns new valid session token on login');
    assert(loginSuccess.data.user.id === aliceId, 'Returns matching authenticated user profile');
    const aliceActiveToken = loginSuccess.data.token;

    // Test 4.2: Login with wrong password
    const loginWrongPass = await requestJson('POST', '/api/auth/login', {
      email: userAliceEmail,
      password: 'WrongPassword123!@#'
    });
    assert(loginWrongPass.status === 401, 'Rejects invalid password with HTTP 401 Unauthorized');
    assert(loginWrongPass.data.error.includes('Invalid email or password'), 'Uses timing-safe, enumeration-safe error');

    // Test 4.3: Login with non-existent email
    const loginBadEmail = await requestJson('POST', '/api/auth/login', {
      email: 'nonexistent_account@domain.org',
      password: 'SomePassword123!@#'
    });
    assert(loginBadEmail.status === 401, 'Rejects non-existent email with HTTP 401 Unauthorized');

    // -------------------------------------------------------------
    // GROUP 5: Session Verification & Logout Revocation
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Active Session Verification & Logout ---');
    
    // Test 5.1: Check session profile with valid token
    const meRes = await requestJson('GET', '/api/auth/me', null, aliceActiveToken);
    assert(meRes.status === 200, 'GET /api/auth/me returns HTTP 200 with valid session token');
    assert(meRes.data.user.id === aliceId, 'Profile user ID matches authenticated user');

    // Test 5.2: Check session with invalid / malformed token
    const meBadToken = await requestJson('GET', '/api/auth/me', null, 'fake_invalid_token_xyz');
    assert(meBadToken.status === 401, 'Rejects invalid bearer token with HTTP 401 Unauthorized');

    // Test 5.3: Check session without token
    const meNoToken = await requestJson('GET', '/api/auth/me');
    assert(meNoToken.status === 401, 'Rejects unauthenticated request with HTTP 401 Unauthorized');

    // Test 5.4: Logout revokes session token
    const logoutRes = await requestJson('POST', '/api/auth/logout', null, aliceActiveToken);
    assert(logoutRes.status === 200, 'Logout returns HTTP 200 Success');

    // Test 5.5: Verify revoked token can no longer authenticate
    const meAfterLogout = await requestJson('GET', '/api/auth/me', null, aliceActiveToken);
    assert(meAfterLogout.status === 401, 'Revoked token immediately fails with HTTP 401 Unauthorized');

    // -------------------------------------------------------------
    // GROUP 6: Protected Endpoints Reject Unauthenticated Access
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Protected Routes Reject Unauthenticated Access (HTTP 401) ---');
    
    const protectedRoutes = [
      ['GET', '/api/user/data'],
      ['POST', '/api/user/history', { item: { type: 'summarize', input: 'test' } }],
      ['DELETE', '/api/user/history'],
      ['POST', '/api/user/practice-sets', { set: { title: 'Test Quiz' } }],
      ['POST', '/api/user/practice-attempts', { setId: '1', attempt: { score: 100 } }],
      ['POST', '/api/user/pipelines', { pipeline: { name: 'Test Pipe' } }],
      ['POST', '/api/user/settings', { settings: {} }]
    ];

    for (const [m, route, payload] of protectedRoutes) {
      const resp = await requestJson(m, route, payload, null);
      assert(resp.status === 401, `Route ${m} ${route} rejects unauthenticated request with HTTP 401`);
    }

    // -------------------------------------------------------------
    // GROUP 7: User-Specific Data Isolation & Zero Leakage
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: User-Specific Data Isolation in SQLite ---');
    
    // Create new login session for Alice
    const aliceSession = await requestJson('POST', '/api/auth/login', {
      email: userAliceEmail,
      password: userAlicePass
    });
    const aToken = aliceSession.data.token;

    // Register User Bob
    const userBobEmail = `bob_${Date.now()}@transformai.com`;
    const userBobPass = 'BobSuperSecret2026!@#';
    const regBob = await requestJson('POST', '/api/auth/signup', {
      full_name: 'Bob Miller',
      email: userBobEmail,
      password: userBobPass
    });
    const bToken = regBob.data.token;
    const bobId = regBob.data.user.id;
    assert(bobId !== aliceId, 'Alice and Bob have distinct user IDs');

    // 1. Initial State: Bob has empty history and empty practice sets
    const bobInitialData = await requestJson('GET', '/api/user/data', null, bToken);
    assert(bobInitialData.status === 200, 'Bob fetches his user bundle successfully');
    assert(Array.isArray(bobInitialData.data.data.history) && bobInitialData.data.data.history.length === 0, 'Bob starts with empty history');
    assert(Array.isArray(bobInitialData.data.data.practiceSets) && bobInitialData.data.data.practiceSets.length === 0, 'Bob starts with empty practice sets');

    // 2. Alice adds 2 transformation history records
    const aliceHist1 = await requestJson('POST', '/api/user/history', {
      item: { id: `hist_alice_1_${Date.now()}`, type: 'summarize', input: 'Alice secret document about quantum computing', output: 'Quantum summary' }
    }, aToken);
    assert(aliceHist1.status === 200, 'Alice saves history item #1');

    const aliceHist2 = await requestJson('POST', '/api/user/history', {
      item: { id: `hist_alice_2_${Date.now()}`, type: 'grammar', input: 'Alice grammar check text', output: 'Alice corrected' }
    }, aToken);
    assert(aliceHist2.status === 200, 'Alice saves history item #2');

    // 3. Alice saves an AI practice set and attempt
    const aliceSetId = `pset_alice_${Date.now()}`;
    const alicePracticeSet = await requestJson('POST', '/api/user/practice-sets', {
      set: {
        id: aliceSetId,
        title: "Alice's Advanced Algorithms Quiz",
        topic: 'Computer Science',
        questions: [{ q: 'What is O(1)?', options: ['Constant', 'Linear'], answer: 'Constant' }]
      }
    }, aToken);
    assert(alicePracticeSet.status === 200, 'Alice saves custom practice quiz set');

    const aliceAttempt = await requestJson('POST', '/api/user/practice-attempts', {
      setId: aliceSetId,
      attempt: { id: `att_alice_1_${Date.now()}`, score: 95, correctCount: 1, totalQuestions: 1 }
    }, aToken);
    assert(aliceAttempt.status === 200, 'Alice records quiz attempt with 95% score');

    // 4. Bob adds his own transformation and practice set
    const bobHistId = `hist_bob_1_${Date.now()}`;
    const bobHist1 = await requestJson('POST', '/api/user/history', {
      item: { id: bobHistId, type: 'tone', input: 'Bob marketing proposal', output: 'Bob polished proposal' }
    }, bToken);
    assert(bobHist1.status === 200, 'Bob saves his own history item');

    const bobSetId = `pset_bob_${Date.now()}`;
    const bobPracticeSet = await requestJson('POST', '/api/user/practice-sets', {
      set: {
        id: bobSetId,
        title: "Bob's Marketing Fundamentals Quiz",
        topic: 'Marketing',
        questions: [{ q: 'What is SEO?', options: ['Search Optimization', 'Sales Order'], answer: 'Search Optimization' }]
      }
    }, bToken);
    assert(bobPracticeSet.status === 200, 'Bob saves his own practice quiz set');

    // 5. Verify Alice only sees Alice's data
    const aliceData = await requestJson('GET', '/api/user/data', null, aToken);
    const aliceBundle = aliceData.data.data;
    assert(aliceBundle.history.length === 2, `Alice has exactly 2 history items (got ${aliceBundle.history.length})`);
    assert(aliceBundle.history.every(h => h.input.includes('Alice')), "All of Alice's history items belong to Alice");
    assert(!aliceBundle.history.some(h => h.input.includes('Bob')), "Alice does NOT see any of Bob's history items");
    assert(aliceBundle.practiceSets.length === 1 && aliceBundle.practiceSets[0].id === aliceSetId, "Alice sees only her practice quiz set");

    // 6. Verify Bob only sees Bob's data
    const bobData = await requestJson('GET', '/api/user/data', null, bToken);
    const bobBundle = bobData.data.data;
    assert(bobBundle.history.length === 1, `Bob has exactly 1 history item (got ${bobBundle.history.length})`);
    assert(bobBundle.history[0].input.includes('Bob'), "Bob's history item belongs to Bob");
    assert(!bobBundle.history.some(h => h.input.includes('Alice')), "Bob does NOT see any of Alice's history items");
    assert(bobBundle.practiceSets.length === 1 && bobBundle.practiceSets[0].id === bobSetId, "Bob sees only his practice quiz set");

    // 7. Security Test: Cross-User Tampering Prevention
    // Bob attempts to delete Alice's history item
    const bobHacksAlice = await requestJson('DELETE', `/api/user/history/${aliceHist1.data.item.id}`, null, bToken);
    // Even if it returns 200 success message, it MUST NOT delete Alice's row
    const aliceDataAfterTamper = await requestJson('GET', '/api/user/data', null, aToken);
    assert(
      aliceDataAfterTamper.data.data.history.length === 2,
      "Alice's history item was NOT deleted when Bob sent a delete request with Alice's ID"
    );

    // 8. Alice clears her history — Bob's history remains intact
    const aliceClear = await requestJson('DELETE', '/api/user/history', null, aToken);
    assert(aliceClear.status === 200, 'Alice clears her history');
    
    const aliceAfterClear = await requestJson('GET', '/api/user/data', null, aToken);
    assert(aliceAfterClear.data.data.history.length === 0, "Alice's history is now empty");

    const bobAfterAliceClear = await requestJson('GET', '/api/user/data', null, bToken);
    assert(bobAfterAliceClear.data.data.history.length === 1, "Bob's history remains completely intact after Alice cleared hers");

    console.log('\n================================================================');
    console.log(`AUTH TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

  } finally {
    // Teardown test server
    server.close();
  }
}

runAuthTests().then(() => {
  if (failed > 0) process.exit(1);
  process.exit(0);
}).catch(err => {
  console.error('[TEST SUITE CRASHED]:', err);
  server.close();
  process.exit(1);
});

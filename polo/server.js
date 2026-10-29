// ================================================================
//  TransformAI — Production Gateway & Static HTTP Server
//  With SQLite Authentication, Session Management & User-Data APIs
//  Zero external dependencies (Node.js standard library + node:sqlite)
// ================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const DB = require('./db.js');

const PORT = process.env.PORT || 5174;
const PUBLIC_DIR = path.resolve(__dirname, '..', 'qitu');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// --- HTTP Helpers ---
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // 10MB limit guard
      if (body.length > 10 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Malformed JSON payload: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

function requireAuthUser(req, res) {
  const authHeader = req.headers.authorization || '';
  const user = DB.getUserByToken(authHeader);
  if (!user) {
    sendJson(res, 401, {
      status: 'error',
      error: 'Authentication required. Active session expired or invalid. Please sign in.'
    });
    return null;
  }
  return user;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ---------------------------------------------------------------
  // Public Health & System Telemetry
  // ---------------------------------------------------------------
  if (pathname === '/api/health' && method === 'GET') {
    sendJson(res, 200, {
      status: 'healthy',
      platform: 'TransformAI',
      version: '1.0.0',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: DB.getSystemMetrics(),
      serverProxyActive: true,
      configuredServerKeys: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY
      }
    });
    return;
  }

  // ---------------------------------------------------------------
  // Authentication Routes
  // ---------------------------------------------------------------

  // POST /api/auth/signup — Register new account
  if (pathname === '/api/auth/signup' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { full_name, email, password, confirm_password } = body;

      // Validation
      if (!full_name || full_name.trim().length < 2) {
        return sendJson(res, 400, { error: 'Full Name must be at least 2 characters.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        return sendJson(res, 400, { error: 'Please provide a valid email address.' });
      }

      if (!password || password.length < 8) {
        return sendJson(res, 400, { error: 'Password must be at least 8 characters long.' });
      }

      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNum = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!hasUpper || !hasLower || !hasNum || !hasSpecial) {
        return sendJson(res, 400, {
          error: 'Password must include uppercase, lowercase, numbers, and at least one special character.'
        });
      }

      if (confirm_password !== undefined && password !== confirm_password) {
        return sendJson(res, 400, { error: 'Confirm password does not match password.' });
      }

      // Create user in DB
      let newUser;
      try {
        newUser = DB.createUser(full_name, email, password);
      } catch (dbErr) {
        if (dbErr.code === 'DUPLICATE_EMAIL') {
          return sendJson(res, 409, {
            error: 'An account with this email address already exists. Please sign in instead.'
          });
        }
        return sendJson(res, 400, { error: dbErr.message });
      }

      // Generate Session Token
      const session = DB.createSession(newUser.id);

      sendJson(res, 201, {
        status: 'success',
        message: 'Account created successfully! Welcome to TransformAI.',
        token: session.token,
        expiresAt: session.expiresAt,
        user: newUser
      });
    } catch (err) {
      sendJson(res, 500, { error: 'Server error during registration: ' + err.message });
    }
    return;
  }

  // POST /api/auth/login — User sign in
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Please enter both email address and password.' });
      }

      const user = DB.verifyCredentials(email, password);
      if (!user) {
        return sendJson(res, 401, {
          error: 'Invalid email or password. Please verify your credentials and try again.'
        });
      }

      // Create Session
      const session = DB.createSession(user.id);

      sendJson(res, 200, {
        status: 'success',
        message: 'Signed in successfully!',
        token: session.token,
        expiresAt: session.expiresAt,
        user
      });
    } catch (err) {
      sendJson(res, 500, { error: 'Server error during login: ' + err.message });
    }
    return;
  }

  // POST /api/auth/logout — Revoke active session
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const authHeader = req.headers.authorization || '';
    DB.revokeSession(authHeader);
    sendJson(res, 200, {
      status: 'success',
      message: 'Active session terminated. Logged out successfully.'
    });
    return;
  }

  // GET /api/auth/me — Check active session & profile
  if (pathname === '/api/auth/me' && method === 'GET') {
    const user = requireAuthUser(req, res);
    if (!user) return;
    sendJson(res, 200, { status: 'success', user });
    return;
  }

  // ---------------------------------------------------------------
  // User-Specific Data Operations (Protected by Session)
  // ---------------------------------------------------------------

  // GET /api/user/data — Fetch full bundle for logged-in user
  if (pathname === '/api/user/data' && method === 'GET') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    const bundle = DB.getUserFullBundle(user.id);
    sendJson(res, 200, {
      status: 'success',
      userId: user.id,
      data: bundle
    });
    return;
  }

  // POST /api/user/history — Add transformation to user history
  if (pathname === '/api/user/history' && method === 'POST') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    try {
      const body = await parseJsonBody(req);
      const item = body.item || body;
      const savedItem = DB.addUserHistory(user.id, item);
      sendJson(res, 200, { status: 'success', item: savedItem });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // DELETE /api/user/history — Clear all transformation history for user
  if (pathname === '/api/user/history' && method === 'DELETE') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    DB.clearUserHistory(user.id);
    sendJson(res, 200, { status: 'success', message: 'History cleared successfully.' });
    return;
  }

  // DELETE /api/user/history/:id — Delete specific history item
  if (pathname.startsWith('/api/user/history/') && method === 'DELETE') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    const itemId = pathname.replace('/api/user/history/', '');
    DB.deleteUserHistoryItem(user.id, itemId);
    sendJson(res, 200, { status: 'success', message: 'History item removed.' });
    return;
  }

  // POST /api/user/practice-sets — Save or update practice set
  if (pathname === '/api/user/practice-sets' && method === 'POST') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    try {
      const body = await parseJsonBody(req);
      const set = body.set || body;
      const savedSet = DB.saveUserPracticeSet(user.id, set);
      sendJson(res, 200, { status: 'success', set: savedSet });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // DELETE /api/user/practice-sets/:id — Delete practice set
  if (pathname.startsWith('/api/user/practice-sets/') && method === 'DELETE') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    const setId = pathname.replace('/api/user/practice-sets/', '');
    DB.deleteUserPracticeSet(user.id, setId);
    sendJson(res, 200, { status: 'success', message: 'Practice set deleted.' });
    return;
  }

  // POST /api/user/practice-attempts — Record a quiz attempt
  if (pathname === '/api/user/practice-attempts' && method === 'POST') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    try {
      const body = await parseJsonBody(req);
      const { setId, attempt } = body;
      const recorded = DB.recordUserPracticeAttempt(user.id, setId, attempt);
      sendJson(res, 200, { status: 'success', attempt: recorded });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // POST /api/user/pipelines — Save or update a pipeline
  if (pathname === '/api/user/pipelines' && method === 'POST') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    try {
      const body = await parseJsonBody(req);
      const pipeline = body.pipeline || body;
      const saved = DB.saveUserPipeline(user.id, pipeline);
      sendJson(res, 200, { status: 'success', pipeline: saved });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // DELETE /api/user/pipelines/:id — Delete pipeline
  if (pathname.startsWith('/api/user/pipelines/') && method === 'DELETE') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    const pipeId = pathname.replace('/api/user/pipelines/', '');
    DB.deleteUserPipeline(user.id, pipeId);
    sendJson(res, 200, { status: 'success', message: 'Pipeline removed from library.' });
    return;
  }

  // POST /api/user/settings — Save user settings & preferences
  if (pathname === '/api/user/settings' && method === 'POST') {
    const user = requireAuthUser(req, res);
    if (!user) return;

    try {
      const body = await parseJsonBody(req);
      DB.saveUserSettings(user.id, body.settings || body);
      sendJson(res, 200, { status: 'success', message: 'User settings persisted.' });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // ---------------------------------------------------------------
  // AI Transformation Proxy (Cloud Provider Gate)
  // ---------------------------------------------------------------
  if (pathname === '/api/transform' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { provider, model, prompt, systemPrompt } = body;

      let apiKey = '';
      if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY;
      else if (provider === 'gemini') apiKey = process.env.GEMINI_API_KEY;
      else if (provider === 'anthropic') apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return sendJson(res, 400, {
          error: `Server-side credentials for "${provider}" not configured. Set ${provider.toUpperCase()}_API_KEY in server environment.`,
          serverProxyActive: false
        });
      }

      // OpenAI Proxy Implementation
      let outputText = '';
      if (provider === 'openai') {
        const https = require('https');
        const postData = JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        });

        outputText = await new Promise((resolve, reject) => {
          const clientReq = https.request({
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'Content-Length': Buffer.byteLength(postData)
            }
          }, (clientRes) => {
            let resData = '';
            clientRes.on('data', c => { resData += c; });
            clientRes.on('end', () => {
              try {
                const parsed = JSON.parse(resData);
                if (clientRes.statusCode >= 200 && clientRes.statusCode < 300) {
                  resolve(parsed.choices?.[0]?.message?.content || '');
                } else {
                  reject(new Error(parsed.error?.message || `OpenAI Error: HTTP ${clientRes.statusCode}`));
                }
              } catch (e) { reject(e); }
            });
          });
          clientReq.on('error', reject);
          clientReq.write(postData);
          clientReq.end();
        });
      }

      sendJson(res, 200, { status: 'success', output: outputText, provider, model });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // ---------------------------------------------------------------
  // Static File Serving & SPA Fallback
  // ---------------------------------------------------------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[TransformAI] Production Server running at http://localhost:${PORT}`);
    console.log(`[TransformAI] SQLite Authentication & Data Store ready.`);
  });
}

module.exports = server;

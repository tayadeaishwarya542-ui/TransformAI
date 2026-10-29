// ================================================================
//  TransformAI — SQLite Database & Authentication Data Access Layer
//  Zero external dependencies (Node.js standard library: node:sqlite, node:crypto)
// ================================================================

const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

// Ensure database directory exists
// Persistent SQLite Database Storage
// Supports configurable DATABASE_PATH in production (e.g. Render Persistent Disk: /var/data/transformai.db)
// Default: ../data/transformai.db at project root level
const DEFAULT_DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DEFAULT_DATA_DIR, 'transformai.db');
const DATA_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for performance and referential integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
db.exec(`
  -- Users Table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  -- Sessions Table (Bearer Tokens with TTL)
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

  -- User-Specific Transformation History
  CREATE TABLE IF NOT EXISTS user_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    metrics_json TEXT,
    options_json TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_history_user_id ON user_history(user_id);

  -- User-Specific Saved AI Practice Sets & Quizzes
  CREATE TABLE IF NOT EXISTS user_practice_sets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT,
    difficulty TEXT,
    question_count INTEGER,
    questions_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_practice_sets_user_id ON user_practice_sets(user_id);

  -- User-Specific Quiz Scores & Practice Attempts
  CREATE TABLE IF NOT EXISTS user_practice_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    set_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers_json TEXT,
    timestamp INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON user_practice_attempts(user_id);

  -- User-Specific Settings & Preferences
  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'local',
    keys_json TEXT,
    models_json TEXT,
    brand_json TEXT,
    prefs_json TEXT,
    stats_json TEXT,
    updated_at INTEGER NOT NULL
  );

  -- User-Specific Saved Pipelines
  CREATE TABLE IF NOT EXISTS user_saved_pipelines (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    desc TEXT,
    stages_json TEXT NOT NULL,
    status TEXT DEFAULT 'Ready',
    last_executed INTEGER,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON user_saved_pipelines(user_id);
`);

// Password Hashing with Scrypt (OWASP Recommended)
const SCRYPT_CONFIG = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_CONFIG).toString('hex');
}

function verifyPassword(password, salt, storedHash) {
  try {
    const computedHash = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_CONFIG).toString('hex');
    const compBuf = Buffer.from(computedHash, 'hex');
    const storBuf = Buffer.from(storedHash, 'hex');
    if (compBuf.length !== storBuf.length) return false;
    return crypto.timingSafeEqual(compBuf, storBuf);
  } catch (err) {
    return false;
  }
}

// Generate Secure Random Tokens
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateId(prefix = 'usr') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// Default Starter Pipelines for new users
function getDefaultStarterPipelines() {
  return [
    {
      id: 'pipe_blog_social',
      name: 'Blog → Social Media Kit',
      desc: 'Turn long-form content into polished social media takeaways.',
      stages: [
        { type: 'grammar', opts: { showDiff: 'no' }, enabled: true },
        { type: 'tone', opts: { targetTone: 'professional' }, enabled: true },
        { type: 'summarize', opts: { length: 'short' }, enabled: true },
        { type: 'convert', opts: { targetFormat: 'bullets' }, enabled: true }
      ],
      lastExecuted: null,
      status: 'Ready'
    },
    {
      id: 'pipe_exec_brief',
      name: 'Report → Executive Briefing',
      desc: 'Condense complex technical reports into formal briefings.',
      stages: [
        { type: 'summarize', opts: { length: 'detailed' }, enabled: true },
        { type: 'tone', opts: { targetTone: 'formal' }, enabled: true },
        { type: 'convert', opts: { targetFormat: 'report' }, enabled: true },
        { type: 'quality', opts: { evaluationStandard: 'business' }, enabled: true }
      ],
      lastExecuted: null,
      status: 'Ready'
    },
    {
      id: 'pipe_multilang',
      name: 'Global Dispatch (EN → HI)',
      desc: 'Proofread and translate English text into regional Hindi.',
      stages: [
        { type: 'grammar', opts: { showDiff: 'no' }, enabled: true },
        { type: 'tone', opts: { targetTone: 'friendly' }, enabled: true },
        { type: 'translate', opts: { sourceLang: 'en', targetLang: 'hi' }, enabled: true }
      ],
      lastExecuted: null,
      status: 'Ready'
    }
  ];
}

const DB = {
  // Expose underlying db instance
  _db: db,

  // --- User Operations ---
  findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const query = db.prepare('SELECT * FROM users WHERE email = ?');
    return query.get(cleanEmail) || null;
  },

  findUserById(id) {
    if (!id) return null;
    const query = db.prepare('SELECT id, email, full_name, created_at, updated_at FROM users WHERE id = ?');
    return query.get(id) || null;
  },

  createUser(fullName, email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();

    if (!cleanName || cleanName.length < 2) {
      const err = new Error('Full Name must be at least 2 characters.');
      err.code = 'INVALID_NAME';
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      const err = new Error('Please enter a valid email address.');
      err.code = 'INVALID_EMAIL';
      throw err;
    }

    // Password security check: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!password || password.length < minLength || !hasUpper || !hasLower || !hasNum || !hasSpecial) {
      const err = new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.');
      err.code = 'WEAK_PASSWORD';
      throw err;
    }

    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      const err = new Error('An account with this email address already exists. Please log in.');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const userId = generateId('usr');
    const now = Date.now();

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, full_name, password_hash, password_salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(userId, cleanEmail, cleanName, hash, salt, now, now);

    // Initialize Default User Settings
    const defaultSettings = {
      provider: 'local',
      keys: { openai: '', gemini: '', anthropic: '' },
      models: { openai: 'gpt-4o-mini', gemini: 'gemini-1.5-flash', anthropic: 'claude-3-5-sonnet-20241022', local: 'local-nlp-v1' },
      brand: { name: 'TransformAI Enterprise', voice: 'Clear, direct, and outcome-focused.' },
      prefs: {
        streaming: true,
        autoSave: true,
        theme: 'dark',
        defaultType: 'summarize',
        defaultLang: 'hi',
        defaultTone: 'professional',
        defaultLength: 'medium'
      },
      stats: {
        successfulOperations: 0,
        failedOperations: 0,
        totalTransforms: 0,
        wordsProcessed: 0,
        usageByType: {}
      }
    };

    const insertSettings = db.prepare(`
      INSERT INTO user_settings (user_id, provider, keys_json, models_json, brand_json, prefs_json, stats_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertSettings.run(
      userId,
      defaultSettings.provider,
      JSON.stringify(defaultSettings.keys),
      JSON.stringify(defaultSettings.models),
      JSON.stringify(defaultSettings.brand),
      JSON.stringify(defaultSettings.prefs),
      JSON.stringify(defaultSettings.stats),
      now
    );

    // Seed Starter Pipelines for this user
    const insertPipeline = db.prepare(`
      INSERT INTO user_saved_pipelines (id, user_id, name, desc, stages_json, status, last_executed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const pipe of getDefaultStarterPipelines()) {
      insertPipeline.run(
        pipe.id + '_' + userId.slice(-6),
        userId,
        pipe.name,
        pipe.desc,
        JSON.stringify(pipe.stages),
        pipe.status,
        pipe.lastExecuted,
        now
      );
    }

    return this.findUserById(userId);
  },

  verifyCredentials(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) return null;

    const user = this.findUserByEmail(cleanEmail);
    if (!user) return null;

    const isValid = verifyPassword(password, user.password_salt, user.password_hash);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  },

  // --- Session Operations ---
  createSession(userId, ttlMs = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + ttlMs;

    const stmt = db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(token, userId, expiresAt, now);

    return { token, expiresAt };
  },

  getUserByToken(token) {
    if (!token) return null;
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    if (!cleanToken) return null;

    const sessionQuery = db.prepare('SELECT * FROM sessions WHERE token = ?');
    const session = sessionQuery.get(cleanToken);
    if (!session) return null;

    if (session.expires_at < Date.now()) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(cleanToken);
      return null;
    }

    return this.findUserById(session.user_id);
  },

  revokeSession(token) {
    if (!token) return false;
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    stmt.run(cleanToken);
    return true;
  },

  revokeAllUserSessions(userId) {
    if (!userId) return false;
    const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
    stmt.run(userId);
    return true;
  },

  // --- User-Specific Transformation History ---
  getUserHistory(userId) {
    const stmt = db.prepare(`
      SELECT id, type, input_text, output_text, metrics_json, options_json, created_at
      FROM user_history
      WHERE user_id = ?
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(userId);
    return rows.map(r => ({
      id: r.id,
      type: r.type,
      input: r.input_text,
      output: r.output_text,
      metrics: r.metrics_json ? JSON.parse(r.metrics_json) : null,
      options: r.options_json ? JSON.parse(r.options_json) : {},
      timestamp: r.created_at
    }));
  },

  addUserHistory(userId, item) {
    const id = item.id || generateId('hist');
    const now = item.timestamp || Date.now();
    const metricsJson = item.metrics ? JSON.stringify(item.metrics) : null;
    const optionsJson = item.options ? JSON.stringify(item.options) : null;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_history (id, user_id, type, input_text, output_text, metrics_json, options_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, item.type, item.input || '', item.output || '', metricsJson, optionsJson, now);

    this.incrementUserStats(userId, item);

    return { id, ...item, timestamp: now };
  },

  deleteUserHistoryItem(userId, itemId) {
    const stmt = db.prepare('DELETE FROM user_history WHERE id = ? AND user_id = ?');
    stmt.run(itemId, userId);
  },

  clearUserHistory(userId) {
    const stmt = db.prepare('DELETE FROM user_history WHERE user_id = ?');
    stmt.run(userId);
  },

  // --- User-Specific Practice Sets & Quizzes ---
  getUserPracticeSets(userId) {
    const setsStmt = db.prepare(`
      SELECT id, title, topic, difficulty, question_count, questions_json, created_at
      FROM user_practice_sets
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const setRows = setsStmt.all(userId);

    const attemptsStmt = db.prepare(`
      SELECT id, set_id, score, correct_count, total_questions, answers_json, timestamp
      FROM user_practice_attempts
      WHERE user_id = ?
      ORDER BY timestamp DESC
    `);
    const allAttempts = attemptsStmt.all(userId);

    return setRows.map(s => {
      const setAttempts = allAttempts.filter(a => a.set_id === s.id).map(a => ({
        id: a.id,
        score: a.score,
        correctCount: a.correct_count,
        totalQuestions: a.total_questions,
        answers: a.answers_json ? JSON.parse(a.answers_json) : [],
        timestamp: a.timestamp
      }));

      return {
        id: s.id,
        title: s.title,
        topic: s.topic,
        difficulty: s.difficulty,
        questionCount: s.question_count,
        questions: s.questions_json ? JSON.parse(s.questions_json) : [],
        createdAt: s.created_at,
        attempts: setAttempts,
        lastAttempt: setAttempts[0] || null
      };
    });
  },

  saveUserPracticeSet(userId, set) {
    const id = set.id || generateId('pset');
    const now = set.createdAt || Date.now();
    const qCount = Array.isArray(set.questions) ? set.questions.length : (set.questionCount || 0);
    const qJson = JSON.stringify(set.questions || []);

    const existing = db.prepare('SELECT id FROM user_practice_sets WHERE id = ? AND user_id = ?').get(id, userId);
    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE user_practice_sets
        SET title = ?, topic = ?, difficulty = ?, question_count = ?, questions_json = ?
        WHERE id = ? AND user_id = ?
      `);
      updateStmt.run(set.title, set.topic || '', set.difficulty || 'medium', qCount, qJson, id, userId);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO user_practice_sets (id, user_id, title, topic, difficulty, question_count, questions_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(id, userId, set.title, set.topic || '', set.difficulty || 'medium', qCount, qJson, now);
    }

    return { ...set, id, createdAt: now, questionCount: qCount };
  },

  deleteUserPracticeSet(userId, setId) {
    db.prepare('DELETE FROM user_practice_attempts WHERE set_id = ? AND user_id = ?').run(setId, userId);
    db.prepare('DELETE FROM user_practice_sets WHERE id = ? AND user_id = ?').run(setId, userId);
  },

  recordUserPracticeAttempt(userId, setId, attempt) {
    const id = attempt.id || generateId('att');
    const now = attempt.timestamp || Date.now();
    const answersJson = attempt.answers ? JSON.stringify(attempt.answers) : null;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_practice_attempts (id, user_id, set_id, score, correct_count, total_questions, answers_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      userId,
      setId,
      Number(attempt.score) || 0,
      Number(attempt.correctCount) || 0,
      Number(attempt.totalQuestions) || 0,
      answersJson,
      now
    );

    return { id, setId, ...attempt, timestamp: now };
  },

  // --- User-Specific Saved Pipelines ---
  getUserPipelines(userId) {
    const stmt = db.prepare(`
      SELECT id, name, desc, stages_json, status, last_executed, created_at
      FROM user_saved_pipelines
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId);
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      desc: r.desc,
      stages: r.stages_json ? JSON.parse(r.stages_json) : [],
      status: r.status,
      lastExecuted: r.last_executed,
      createdAt: r.created_at
    }));
  },

  saveUserPipeline(userId, pipeline) {
    const id = pipeline.id || generateId('pipe');
    const now = pipeline.createdAt || Date.now();
    const stagesJson = JSON.stringify(pipeline.stages || []);

    const existing = db.prepare('SELECT id FROM user_saved_pipelines WHERE id = ? AND user_id = ?').get(id, userId);
    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE user_saved_pipelines
        SET name = ?, desc = ?, stages_json = ?, status = ?, last_executed = ?
        WHERE id = ? AND user_id = ?
      `);
      updateStmt.run(
        pipeline.name,
        pipeline.desc || '',
        stagesJson,
        pipeline.status || 'Ready',
        pipeline.lastExecuted || null,
        id,
        userId
      );
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO user_saved_pipelines (id, user_id, name, desc, stages_json, status, last_executed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        id,
        userId,
        pipeline.name,
        pipeline.desc || '',
        stagesJson,
        pipeline.status || 'Ready',
        pipeline.lastExecuted || null,
        now
      );
    }

    return { ...pipeline, id };
  },

  deleteUserPipeline(userId, pipelineId) {
    db.prepare('DELETE FROM user_saved_pipelines WHERE id = ? AND user_id = ?').run(pipelineId, userId);
  },

  // --- User-Specific Settings & Stats ---
  getUserSettings(userId) {
    const stmt = db.prepare('SELECT * FROM user_settings WHERE user_id = ?');
    const row = stmt.get(userId);
    if (!row) return null;

    return {
      provider: row.provider || 'local',
      keys: row.keys_json ? JSON.parse(row.keys_json) : {},
      models: row.models_json ? JSON.parse(row.models_json) : {},
      brand: row.brand_json ? JSON.parse(row.brand_json) : {},
      prefs: row.prefs_json ? JSON.parse(row.prefs_json) : {},
      stats: row.stats_json ? JSON.parse(row.stats_json) : {
        successfulOperations: 0,
        failedOperations: 0,
        totalTransforms: 0,
        wordsProcessed: 0,
        usageByType: {}
      }
    };
  },

  saveUserSettings(userId, settings) {
    const now = Date.now();
    const existing = db.prepare('SELECT user_id FROM user_settings WHERE user_id = ?').get(userId);

    const keysJson = JSON.stringify(settings.keys || {});
    const modelsJson = JSON.stringify(settings.models || {});
    const brandJson = JSON.stringify(settings.brand || {});
    const prefsJson = JSON.stringify(settings.prefs || {});
    const statsJson = JSON.stringify(settings.stats || {});
    const provider = settings.provider || 'local';

    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE user_settings
        SET provider = ?, keys_json = ?, models_json = ?, brand_json = ?, prefs_json = ?, stats_json = ?, updated_at = ?
        WHERE user_id = ?
      `);
      updateStmt.run(provider, keysJson, modelsJson, brandJson, prefsJson, statsJson, now, userId);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO user_settings (user_id, provider, keys_json, models_json, brand_json, prefs_json, stats_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(userId, provider, keysJson, modelsJson, brandJson, prefsJson, statsJson, now);
    }
  },

  incrementUserStats(userId, item) {
    try {
      const current = this.getUserSettings(userId) || {};
      const stats = current.stats || {
        successfulOperations: 0,
        failedOperations: 0,
        totalTransforms: 0,
        wordsProcessed: 0,
        usageByType: {}
      };

      stats.totalTransforms = (stats.totalTransforms || 0) + 1;
      stats.successfulOperations = (stats.successfulOperations || 0) + 1;

      const words = item.input ? item.input.trim().split(/\s+/).filter(Boolean).length : 0;
      stats.wordsProcessed = (stats.wordsProcessed || 0) + words;

      if (!stats.usageByType) stats.usageByType = {};
      if (item.type) {
        stats.usageByType[item.type] = (stats.usageByType[item.type] || 0) + 1;
      }

      current.stats = stats;
      this.saveUserSettings(userId, current);
    } catch (e) {
      console.warn('[DB] Failed to increment user stats:', e.message);
    }
  },

  // --- Aggregate / Full User Data Package ---
  getUserFullBundle(userId) {
    return {
      history: this.getUserHistory(userId),
      practiceSets: this.getUserPracticeSets(userId),
      savedPipelines: this.getUserPipelines(userId),
      settings: this.getUserSettings(userId)
    };
  },

  // --- System Metrics ---
  getSystemMetrics() {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?').get(Date.now()).count;
    const historyCount = db.prepare('SELECT COUNT(*) as count FROM user_history').get().count;
    const practiceCount = db.prepare('SELECT COUNT(*) as count FROM user_practice_sets').get().count;

    return {
      totalUsers: userCount,
      activeSessions: sessionCount,
      totalTransformationsSaved: historyCount,
      totalPracticeSetsSaved: practiceCount,
      database: 'SQLite (node:sqlite)'
    };
  }
};

module.exports = DB;

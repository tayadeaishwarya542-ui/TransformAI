# TransformAI — Enterprise Gen AI Content Platform

A modern, full-stack Gen AI SaaS platform for multi-format content transformation, automated quiz and practice generation, chained pipeline orchestration, and multi-tenant user authentication with SQLite data persistence.

---

## 1. Directory Structure

The project is cleanly divided into a modular frontend (`qitu/`) and backend (`polo/`), with root configuration files:

```text
content-transformer/
├── qitu/                       # [Frontend] Client-Side Application
│   ├── index.html              # Main application shell and layout
│   ├── css/
│   │   └── styles.css          # Design system, themes, and responsive styling
│   ├── js/
│   │   ├── api.js              # Multi-provider AI abstraction layer & hybrid fallback
│   │   ├── app.js              # Application state, router, and session management
│   │   └── transformations.js  # NLP rules, diff algorithms & prompt builders
│   └── pages/                  # Modular view controllers
│       ├── analytics.js        # User productivity metrics & usage charts
│       ├── auth.js             # Authentication view (Sign In, Sign Up, Password reset)
│       ├── dashboard.js        # Overview dashboard with live stats & shortcuts
│       ├── help.js             # Documentation, user guides & FAQ
│       ├── history.js          # User transformation history with search & filters
│       ├── pipelines.js        # Multi-stage transformation pipeline builder
│       ├── practice.js         # Interactive quiz generator & practice sets
│       ├── providers.js        # AI provider key management (OpenAI, Gemini, Claude)
│       ├── saved_pipelines.js  # Library of custom saved pipelines
│       ├── settings.js         # User profile, theme, export & account preferences
│       └── transform.js        # Studio for single-shot transformations
│
├── polo/                       # [Backend] Server & Data Storage Layer
│   ├── server.js               # Production HTTP gateway & static file server
│   ├── db.js                   # SQLite data access layer & Scrypt authentication
│   └── tests/                  # Automated test suites
│       ├── test_auth_system.js     # Auth, session, password hashing & isolation tests
│       ├── test_grammar_hybrid.js  # Hybrid grammar, LCS visual diff & fallback tests
│       ├── test_quiz_generator.js  # AI quiz generator, question count & scoring tests
│       └── test_suite.js           # Core transformation regression suite
│
├── data/                       # [Storage] Persistent SQLite database directory (git-ignored)
│   └── transformai.db          # Auto-initialized SQLite database file
│
├── .env.example                # Server environment variables template
├── .gitignore                  # Git exclusions for databases, secrets, and dependencies
├── package.json                # Project configuration & npm scripts
├── package-lock.json           # Deterministic dependency lockfile
└── README.md                   # System documentation & deployment guide
```

---

## 2. Core Features & Capabilities

### A. Authentication & Multi-Tenant Data Isolation
* **User Accounts**: Registration with validation (name, email format, complex passwords) and login.
* **Security**: Passwords salted and hashed with Node.js native cryptographic `Scrypt` (64-byte key, 16-byte salt). Plaintext passwords are never stored.
* **Session Management**: Cryptographically secure Bearer tokens with expiration.
* **Data Isolation**: Strict user-level foreign keys ensuring users only access their own history, practice sets, attempts, settings, and saved pipelines.

### B. Content Transformation Engines
* **Executive Summarization**: Short, medium, and comprehensive briefing formats.
* **Tone Adaptation**: Professional, casual, persuasive, academic, and creative tones.
* **Multi-Language Translation**: Seamless translation into Hindi, Marathi, Spanish, German, French, and Japanese.
* **Format Conversion**: Markdown, structured bullet points, RFC 8259 JSON, and formal email.
* **Hybrid Grammar Correction**: Two-mode architecture (Mode A AI + Mode B offline deterministic grammar) with LCS (Longest Common Subsequence) word-level visual diff highlighting changes in real time.
* **Content Quality Scoring**: 100-point rubric analyzing clarity, engagement, grammar, tone consistency, structure, and vocabulary.
* **Expansion & Simplification**: Multiplies depth without repetitive fluff, or strips jargon for universal readability.

### C. AI Quiz & Interactive Practice Generator
* **Topic-Based Generation**: Generates comprehensive multiple-choice question sets from any topic or document text.
* **User-Selected Question Counts**: Configurable question count (3, 5, 10, or custom).
* **Interactive Navigation**: Step-by-step question progress with live indicator.
* **Immediate Feedback & Explanations**: Instant visual feedback on selection with detailed rationales.
* **Scoring & Performance Tracking**: Final results card, percentage score, retakes, and saved score history.

### D. Pipeline Studio & Saved Workflows
* Multi-stage sequential transformation chaining (e.g., Grammar Correction -> Tone Adjustment -> Bullet Points).
* Reusable pipeline templates saved to user profiles.

---

## 3. Quick Start & Local Development

### Prerequisites
* **Node.js**: v18.0.0 or later (uses standard library `node:sqlite`, `node:crypto`, `node:http`).
* Zero external runtime npm dependencies required.

### 1. Start the Server
```bash
npm start
```
The server will start at `http://localhost:5174` and automatically serve the frontend from `qitu/`.

### 2. Run the Automated Test Suite
```bash
npm test
```
Runs all 4 test suites (158 passing test assertions):
```bash
# Or run individual test suites:
npm run test:auth        # Authentication & Data Isolation (59 tests)
npm run test:grammar     # Hybrid Grammar & Visual Diff (30 tests)
npm run test:quiz        # Quiz Generator & Question Navigation (39 tests)
npm run test:regression  # Core Transformation Engines (30 tests)
```

---

## 4. Deployment on Render

This project is configured for one-click deployment on **Render** (or any Node.js PaaS):

| Setting | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Service Type** | Web Service | Node.js runtime |
| **Build Command** | `npm install` | Fast zero-dependency install |
| **Start Command** | `npm start` | Runs `node polo/server.js` |
| **Health Check Path** | `/api/health` | Returns HTTP 200 with platform telemetry |

### Environment Variables on Render

* `PORT`: Automatically provided by Render.
* `DATABASE_PATH`: Set this to `/var/data/transformai.db` if using a **Render Persistent Disk** mounted at `/var/data` so user accounts and data persist across redeployments.
* `OPENAI_API_KEY`: (Optional) Server-side OpenAI API key for proxying requests.
* `GEMINI_API_KEY`: (Optional) Server-side Google Gemini API key.
* `ANTHROPIC_API_KEY`: (Optional) Server-side Anthropic Claude API key.

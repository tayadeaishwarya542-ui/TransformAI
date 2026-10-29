# Gen AI Platform — Automated Content Transformation
### Exam Answers | 4 Marks Each Section

---

---

## ✅ SECTION 1 — ALGORITHM (4 Marks)
### *Pointwise Format*

---

**Algorithm Name:** AutoContentTransform

**Input:** raw_content, source_type, target_type, options
**Output:** transformed_content, quality_metrics

---

**Step 1 — Validate Input**
- Check if raw_content is not NULL or empty
- Check if source_type and target_type are in supported list
- If invalid → raise InputValidationError and stop

**Step 2 — Preprocess Content**
- Trim and sanitize the input text
- Count total words and tokens
- If token count > limit → split content into smaller chunks

**Step 3 — Build Prompt**
- Fetch matching prompt template from PromptLibrary using (source_type, target_type)
- Inject user options (tone, language, style) into template
- Combine system_prompt + user_content → final_prompt

**Step 4 — Call LLM API**
- Send POST request to OpenAI API (model: gpt-4o)
- Include: system_prompt, final_prompt, temperature, max_tokens
- If API fails → retry up to 3 times with exponential backoff (1s → 2s → 4s)
- If all retries fail → return API Error to user

**Step 5 — Post-Process Output**
- Extract text from API response object
- Apply target-type formatting (e.g., bullet points for Twitter, paragraphs for blog)
- Adjust tone based on user selection

**Step 6 — Calculate Quality Metrics**
- Compute: readability score, compression ratio, sentiment, tokens used, time taken

**Step 7 — Save to History**
- Create a record with: input, output, types, metrics, timestamp, UUID
- Save record to LocalStorage (history store)

**Step 8 — Return Result**
- Return: transformed_content + metadata to the UI for display

---

---

## ✅ SECTION 2 — SYSTEM ARCHITECTURE (4 Marks)
### *Diagram Format*

---

```
╔══════════════════════════════════════════════════════╗
║               LAYER 1: PRESENTATION LAYER            ║
║                                                      ║
║  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌───────┐ ║
║  │ Dashboard │ │ Transform │ │ Pipeline │ │History│ ║
║  │   Page    │ │   Page    │ │  Page    │ │ Page  │ ║
║  └─────┬─────┘ └─────┬─────┘ └────┬─────┘ └───┬───┘ ║
╚════════╪═════════════╪════════════╪════════════╪═════╝
         │             │            │            │
         ▼             ▼            ▼            ▼
╔══════════════════════════════════════════════════════╗
║              LAYER 2: APPLICATION LAYER              ║
║                                                      ║
║  ┌──────────────────────────────────────────────┐   ║
║  │           app.js  (SPA Router)                │   ║
║  │  Route Manager → Page Loader → State Manager  │   ║
║  └──────────────────┬───────────────────────────┘   ║
║                     │                                ║
║  ┌──────────────────▼───────────────────────────┐   ║
║  │        transformations.js (Core Logic)        │   ║
║  │  Prompt Builder | Post Processor | Metrics    │   ║
║  └──────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════╝
                      │
                      ▼
╔══════════════════════════════════════════════════════╗
║                LAYER 3: SERVICE LAYER                ║
║                                                      ║
║  ┌──────────────────────────────────────────────┐   ║
║  │             api.js (API Client)               │   ║
║  │   OpenAI REST Caller | Retry Handler          │   ║
║  └──────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════╝
                      │ HTTPS / REST
                      ▼
╔══════════════════════════════════════════════════════╗
║              LAYER 4: EXTERNAL SERVICES              ║
║                                                      ║
║   ┌────────────────────┐  ┌───────────────────────┐ ║
║   │   OpenAI GPT-4o    │  │  Browser LocalStorage │ ║
║   │  (AI Model API)    │  │  History | Pipelines  │ ║
║   │  api.openai.com    │  │  Settings | API Key   │ ║
║   └────────────────────┘  └───────────────────────┘ ║
╚══════════════════════════════════════════════════════╝
```

**Key Components Summary:**

| Component | File | Role |
|---|---|---|
| Router | `app.js` | Handles page navigation (SPA) |
| Core Engine | `transformations.js` | Builds prompts, computes metrics |
| API Client | `api.js` | Calls OpenAI, handles retries |
| Storage | `LocalStorage` | Persists history, settings, pipelines |
| AI Model | `OpenAI GPT-4o` | Generates transformed content |

---

---

## ✅ SECTION 3 — WORKFLOW (4 Marks)
### *Arrow Format*

---

```
USER opens platform
        │
        ▼
Enter API Key in Settings page
        │
        ▼
Navigate to Transform Page
        │
        ▼
Paste raw content in Input Panel
        │
        ▼
Select Source Type  (e.g., Blog Post)
        │
        ▼
Select Target Type  (e.g., Twitter Thread)
        │
        ▼
Set Advanced Options  (Tone / Temperature / Max Tokens)
        │
        ▼
Click "Transform" button
        │
        ▼
Platform validates input
        │
        ├──── Invalid ──────► Show error message  ──► Back to input
        │
        ▼ Valid
Platform builds prompt from template
        │
        ▼
API call sent to OpenAI GPT-4o
        │
        ├──── API Error ─────► Retry (up to 3 times with delay)
        │                            │
        │                            └── All failed ──► Show Error Toast
        │
        ▼ Success
AI response received and extracted
        │
        ▼
Post-processing applied (formatting + tone)
        │
        ▼
Quality metrics calculated
(Readability | Compression | Tokens Used | Time)
        │
        ▼
Output displayed in Output Panel
        │
        ▼
Record auto-saved to History
        │
        ▼
Analytics dashboard updated
        │
        ▼
User actions available:
  ├──► Copy to Clipboard
  ├──► Download as .txt file
  ├──► Regenerate (new attempt)
  └──► Add as Pipeline Step
```

---

---

## ✅ SECTION 4 — FLOWCHART (4 Marks)
### *Arrow Format*

---

```
              ┌─────────────────┐
              │   START / OPEN  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  API Key Saved? │
              └────────┬────────┘
                       │
             ┌─────────┴──────────┐
           NO│                    │YES
             ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐
    │ Redirect to     │  │ Show Dashboard  │
    │ Settings Page   │  └────────┬────────┘
    └─────────────────┘           │
                                  ▼
                         ┌─────────────────┐
                         │  User Clicks     │
                         │  "Transform"     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Input Valid?    │
                         └────────┬────────┘
                                  │
                       ┌──────────┴──────────┐
                     NO│                     │YES
                       ▼                     ▼
              ┌─────────────────┐   ┌─────────────────┐
              │ Show Validation │   │  Build Prompt    │
              │ Error Message   │   │  from Template   │
              └─────────────────┘   └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │  Call OpenAI    │
                                    │  GPT-4o API     │
                                    └────────┬────────┘
                                             │
                                   ┌─────────┴──────────┐
                                SUCCESS                FAIL
                                   │                    │
                                   │           ┌────────▼────────┐
                                   │           │ Retry Count < 3? │
                                   │           └────────┬─────────┘
                                   │                    │
                                   │          ┌─────────┴──────────┐
                                   │        YES│                   │NO
                                   │           ▼                   ▼
                                   │    ┌──────────────┐  ┌────────────────┐
                                   │    │ Wait & Retry │  │ Show Error     │
                                   │    │ (2^n seconds)│  │ Toast & STOP   │
                                   │    └──────────────┘  └────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Post-Process    │
                          │ Format Output   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Display Output  │
                          │ + Show Metrics  │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  Save to        │
                          │  History Store  │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Update Analytics│
                          │  Dashboard      │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ User Action:     │
                          │ Copy/Download/  │
                          │ Regenerate      │
                          └────────┬────────┘
                                   │
                                   ▼
                              ┌─────────┐
                              │   END   │
                              └─────────┘
```

---

*Platform: Gen AI Content Transformation Platform | Each section = 4 Marks*

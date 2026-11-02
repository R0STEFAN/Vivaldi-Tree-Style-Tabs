# Gemini AI Tab Grouping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide one-click AI tab organization via Google Gemini API that analyzes ungrouped tabs and categorizes them into thematic folders with native icons/colors, seamlessly matching or expanding existing folders.

**Architecture:** A standalone Gemini API service (`src/services/gemini-api.js`) handles prompt composition with privacy sanitization and structured JSON output. `tab-store.js` orchestrates tab filtering, folder creation, and hierarchy parenting (`moveTreeTabs`). `render.js` and `styles.js` add settings configuration and a header action button with loading states.

**Tech Stack:** JavaScript (ES6+ CommonJS for NodeJS/Chrome extension), Vivaldi Tabs/VivExtData API, Google Generative Language REST API (`gemini-2.5-flash`), Node.js test runner (`node:test`).

---

## Global Constraints

- Never send query strings, authentication credentials, or internal browser URLs (`vivaldi://`, `chrome://`, `file://`) to Gemini.
- Strictly preserve Anti-Orphan Logic and Context Locking from `GEMINI.md`.
- Pinned tabs and pinned folders must never be modified by AI grouping.
- Tabs already inside an existing folder (`isFolder: true`) must not be moved out.
- Any root tab that is NOT a folder tab (`!isFolder`), whether solo or having its own subtree of children, is an eligible candidate for grouping. Moving a root parent moves its entire subtree into the target folder.
- Existing folders (`isFolder: true`) must be supplied to the model to prioritize putting new tabs/trees into existing categories.
- New folders are created only for groups of 2 or more root items.
- Created folders must be expanded.

---

### Task 1: Gemini API Client Service (`src/services/gemini-api.js`)

**Files:**
- Create: `src/services/gemini-api.js`
- Test: `tests/gemini-api.test.js`

**Interfaces:**
- Produces:
  - `fetchAvailableModels(apiKey, fetchFn)`: Promise<string[]>
  - `sanitizeTabForPrompt(tab)`: `{ id: number, title: string, domain: string }`
  - `groupTabsWithGemini({ apiKey, model, language, ungroupedTabs, existingFolders, fetchFn })`: Promise<{ groups: Array<{ folderId?: number, newFolderName?: string, color?: string, tabIds: number[] }> }>

- [ ] **Step 1: Write failing tests for URL sanitization and payload formatting**
  Verify `sanitizeTabForPrompt` strips URL queries, discards internal schemes, and returns safe title and domain.
- [ ] **Step 2: Implement `sanitizeTabForPrompt` and `fetchAvailableModels`**
  Implement model fetching from `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}` with fallback list (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-flash-8b`, `gemini-2.5-pro`).
- [ ] **Step 3: Write failing tests for `groupTabsWithGemini` with mocked fetch**
  Verify proper prompt construction including `existingFolders` and `language`, and correct parsing of structured JSON output.
- [ ] **Step 4: Implement `groupTabsWithGemini`**
  Send structured system instructions and JSON schema constraint (`responseMimeType: "application/json"`). Parse response and return normalized groups.
- [ ] **Step 5: Run tests and verify all pass**
  Run `node --test tests/gemini-api.test.js`.
- [ ] **Step 6: Commit**
  `feat(ai): implement Gemini API client service with privacy sanitization`

---

### Task 2: Settings Store Integration

**Files:**
- Modify: `src/store/settings-store.js`
- Test: `tests/settings-store.test.js`

**Interfaces:**
- Consumes: `DEFAULT_SETTINGS`
- Produces: `geminiApiKey`, `geminiModel`, `geminiFolderLanguage` in settings

- [ ] **Step 1: Write failing tests for new Gemini settings**
  Add test asserting `geminiApiKey` (default `''`), `geminiModel` (default `'gemini-2.5-flash'`), and `geminiFolderLanguage` (default `'uk'`).
- [ ] **Step 2: Update `DEFAULT_SETTINGS` in `src/store/settings-store.js`**
  Add the 3 fields to `DEFAULT_SETTINGS`.
- [ ] **Step 3: Run tests and verify all pass**
  Run `node --test tests/settings-store.test.js`.
- [ ] **Step 4: Commit**
  `feat(settings): add Gemini API key, model and folder language settings`

---

### Task 3: Tab Store AI Grouping Execution (`src/store/tab-store.js`)

**Files:**
- Modify: `src/store/tab-store.js`
- Test: `tests/ai-grouping-store.test.js`

**Interfaces:**
- Consumes: `groupTabsWithGemini` from `src/services/gemini-api.js`
- Produces: `store.aiGroupTabs()`: Promise<{ success: boolean, count?: number, error?: string }>

- [ ] **Step 1: Write failing tests for `store.aiGroupTabs()`**
  Mock API and tabs (some loose tabs, some existing folders). Verify:
  - Loose tabs matching existing folder are moved into existing folder via `moveTreeTabs`.
  - Loose tabs forming new group of >= 2 create a new `svb-folder` tab and move tabs inside.
  - Solo loose tabs without a match remain untouched.
- [ ] **Step 2: Implement `aiGroupTabs()` in `tab-store.js`**
  - Collect unpinned root tabs without children in active workspace.
  - Collect existing folders (tabs with `isFolder` or children) with titles and IDs.
  - Call `groupTabsWithGemini`.
  - For each group with `folderId`, call `moveTreeTabs(tabIds, folderId, 'inside')`.
  - For each new group, create a folder tab with title/color, then call `moveTreeTabs(tabIds, newFolder.id, 'inside')`.
- [ ] **Step 3: Run tests and verify all pass**
  Run `node --test tests/ai-grouping-store.test.js`.
- [ ] **Step 4: Commit**
  `feat(store): implement aiGroupTabs orchestrator in tab-store`

---

### Task 4: UI Settings & Header Action Button (`src/ui/render.js` & `src/ui/styles.js`)

**Files:**
- Modify: `src/ui/render.js`
- Modify: `src/ui/styles.js`
- Modify: `src/entry.js`

**Interfaces:**
- Produces:
  - Settings fields for API key, model, language.
  - Sparkles button `data-role="ai-group-tabs"` in header actions.
  - Loading animation when grouping is in progress.

- [ ] **Step 1: Add Sparkles icon helper and styles**
  Add `renderSparklesIcon()` in `render.js` and styles for `#svb-root .svb-icon-button[data-role="ai-group-tabs"]` with loading spin/pulse animation.
- [ ] **Step 2: Add AI Settings block in `svb-settings-view`**
  Add password input for API key, model dropdown with refresh button, and language select (Українська, English, Deutsch, Polski, Auto).
- [ ] **Step 3: Connect header click and settings events in `render.js` and `entry.js`**
  Clicking `ai-group-tabs` triggers `onAiGroupTabs()`. If key is missing, toggles settings view open and focuses key input.
- [ ] **Step 4: Build dist bundle and test manually**
  Run `node build/build.mjs` and run full test suite `node --test tests/*.test.js`.
- [ ] **Step 5: Commit**
  `feat(ui): add AI tab grouping button and settings panel`

---

### Task 5: Verification & Full Regression Testing

- [ ] **Step 1: Run all tests in the repository**
  `node --test tests/*.test.js`
- [ ] **Step 2: Run build**
  `node build/build.mjs`
- [ ] **Step 3: Check git status and commit final dist bundle**
- [ ] **Step 4: Push to origin `feat/gemini-ai-tab-grouping`**

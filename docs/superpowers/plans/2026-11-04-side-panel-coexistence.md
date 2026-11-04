# Side Panel Coexistence & Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure Vivaldi's native side panel (`#panels-container`) appears first (at the outer window edge) and the custom vertical tab panel (`#svb-root`) appears second, eliminating visual occlusion and adapting auto-hide trigger positions.

**Architecture:** 
1. Dynamically observe `#panels-container` dimensions and placement via `ResizeObserver` / DOM inspection in `layout.js`, exporting `--svb-panels-offset`.
2. Update CSS positioning in `styles.js` for `#svb-root` and `#svb-root-trigger` using `var(--svb-panels-offset, 0px)`.
3. In `mount-root.js`, insert `#svb-root` after `#panels-container` rather than blindly prepending to `.inner`.
4. Update cursor edge-detection and drag resizing calculations in `layout.js` to account for `--svb-panels-offset`.

**Tech Stack:** Vanilla JavaScript (ES6+), DOM APIs (`ResizeObserver`, `getBoundingClientRect`), CSS Variables, Node test runner (`node:test`).

**Spec:** [`C:\Users\Rostyslav\.gemini\antigravity-cli\brain\72d534cd-7766-4b8f-a30d-7731ac352c9f\vivaldi-side-panel-coexistence-report.md`](file:///C:/Users/Rostyslav/.gemini/antigravity-cli/brain/72d534cd-7766-4b8f-a30d-7731ac352c9f/vivaldi-side-panel-coexistence-report.md)

## Global Constraints
- Do not break existing full overlay and compact icon strip (`svb-autohide-icons`) auto-hide modes.
- Preserve right-side panel positioning support (`settingsStore.panelPosition === 'right'`).
- Preserve fullscreen layout handling (`.svb-is-fullscreen` resets offsets).
- All 96 existing tests must continue to pass.

---

### Task 1: Add Unit Tests for Native Panel Offset & Dynamic Positioning

**Files:**
- Create: `tests/side-panel-coexistence.test.js`
- Test: `tests/side-panel-coexistence.test.js`

**Interfaces:**
- Consumes: `createLayoutAdapter` in `src/adapters/layout.js`, `STYLE_TEXT` in `src/ui/styles.js`, `mountRoot` in `src/bootstrap/mount-root.js`.
- Produces: Verified unit tests for `--svb-panels-offset` calculations and CSS styles.

- [ ] **Step 1: Write the failing test for layout CSS and offset properties**

```javascript
const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const { STYLE_TEXT } = require('../src/ui/styles.js')
const { createLayoutAdapter } = require('../src/adapters/layout.js')

describe('Side Panel Coexistence', () => {
  it('defines --svb-panels-offset in CSS for shell and edge trigger', () => {
    assert.ok(STYLE_TEXT.includes('left: var(--svb-panels-offset, 0px) !important;'))
    assert.ok(STYLE_TEXT.includes('right: var(--svb-panels-offset, 0px) !important;'))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/side-panel-coexistence.test.js`
Expected: FAIL (missing `--svb-panels-offset` in `STYLE_TEXT`)

- [ ] **Step 3: Update `src/ui/styles.js` with `--svb-panels-offset`**

Update `#svb-root.svb-shell`, `.svb-position-right #svb-root.svb-shell`, `#svb-root-trigger.svb-edge-trigger`, and `#svb-root-trigger.svb-edge-trigger.svb-position-right` to position against `var(--svb-panels-offset, 0px)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/side-panel-coexistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/side-panel-coexistence.test.js src/ui/styles.js
git commit -m "feat(styles): add --svb-panels-offset positioning for shell and trigger"
```

---

### Task 2: Implement Dynamic Offset Tracking & Resize Observer in `layout.js`

**Files:**
- Modify: `src/adapters/layout.js:40-120, 220-375`
- Test: `tests/side-panel-coexistence.test.js`

**Interfaces:**
- Consumes: `#panels-container` in DOM, `settingsStore.get('panelPosition')`.
- Produces: `--svb-panels-offset` CSS variable on `.svb-layout-host` and `#svb-root-trigger`, offset-aware `startDragging` and `isCursorAtScreenEdge`.

- [ ] **Step 1: Add unit test verifying `layout.js` sets `--svb-panels-offset` from `#panels-container`**

In `tests/side-panel-coexistence.test.js`, test that when `#panels-container` exists and has width 280px on the left, `layoutAdapter.apply()` sets `--svb-panels-offset: 280px` on host and trigger. When `#panels-container` is absent or on opposite side, it sets `0px`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/side-panel-coexistence.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `getNativePanelsOffset()` and wire into `apply()` and `start()`**

Implement `getNativePanelsOffset()`, observe `#panels-container` with `ResizeObserver` in `start()`, update `startDragging` and mouse edge checking to account for `nativeOffset`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/side-panel-coexistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/adapters/layout.js tests/side-panel-coexistence.test.js
git commit -m "feat(layout): dynamically track native side panel offset and adapt edge triggers"
```

---

### Task 3: Update `mountRoot` in `mount-root.js` to Preserve Proper DOM Hierarchy

**Files:**
- Modify: `src/bootstrap/mount-root.js:25-40`
- Test: `tests/side-panel-coexistence.test.js`

**Interfaces:**
- Consumes: `host.querySelector('#panels-container')`.
- Produces: DOM order where `#svb-root` is inserted after `#panels-container` rather than before it.

- [ ] **Step 1: Add unit test in `tests/side-panel-coexistence.test.js` verifying DOM order**

Test that when `host` already has `#panels-container`, calling `mountRoot` places `#svb-root` AFTER `#panels-container`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/side-panel-coexistence.test.js`
Expected: FAIL (`root` is currently prepended before `panels`)

- [ ] **Step 3: Update `mountRoot` in `src/bootstrap/mount-root.js`**

Insert after `#panels-container` if present, else prepend or append.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/side-panel-coexistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/bootstrap/mount-root.js tests/side-panel-coexistence.test.js
git commit -m "fix(mount): insert svb-root after panels-container for correct DOM order"
```

---

### Task 4: Full Verification and Build

**Files:**
- Rebuild: `dist/custom.js` via `npm run build`
- Verify: Full test suite `node --test tests/*.test.js`

- [ ] **Step 1: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: 97+ tests passing with 0 failures

- [ ] **Step 2: Rebuild distribution file**

Run: `npm run build`
Verify `dist/custom.js` is up to date

- [ ] **Step 3: Commit and push**

```bash
git add dist/custom.js
git commit -m "build: compile custom.js with side panel coexistence and ordering fix"
git push origin main
```

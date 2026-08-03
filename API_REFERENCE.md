# Vivaldi Tree Style Tabs API Reference

This document serves as a cheat sheet for the core modules and their exported interfaces in the Vivaldi Tree Style Tabs codebase. It is designed to help maintainers and AI assistants quickly navigate cross-module dependencies and use the correct function names.

---

## 1. `src/adapters/tabs-api.js` (or `api.js`)

Provides the abstraction layer over Chrome/Vivaldi extensions APIs, managing the browser state and bridging `vivExtData`.

**Key Exported Methods:**
- `async getCurrentWindowId()`: Returns the ID of the current window.
- `async getTabs(windowId)`: Fetches all tabs in a specific window, including parsed `vivExtData`.
- `async getWorkspaces()`: Fetches available workspaces.
- `async updateTab(tabId, properties)`: Updates native tab properties (like `active`, `pinned`).
- `async moveTab(tabId, index)`: Moves a tab natively in the tab strip.
- `async duplicateTab(tabId)`: Duplicates a tab.
- `async discardTab(tabId)`: Hibernates a tab.
- `async bookmarkTab({ title, url } = {})`: Creates a bookmark.
- `async restoreLastClosedTab()`: Restores the last closed tab (Ctrl+Shift+T).
- `async updateVivExtData(tabId, vivExtData)`: **(CRITICAL)** Merges and updates the `vivExtData` field for a tab. *Do not use `setTabExtData`.*
- `async createRestoredTab(windowId, options)`: Creates a new tab restoring a specific context.

---

## 2. `src/controllers/tree-controller.js`

Manages the logical tree state (hierarchy, collapsed state) separately from the linear tab state. It wraps `tree-store.js`.

**Key Exported Methods:**
- `makeContextKey(tabState)`: Derives a unique key for the current workspace/window context.
- `registerExpectedCreation(intent)`: Pre-registers intent for new tabs (e.g. from folders).
- `capturePendingCreation(tab, sourceActiveTabId, meta)`: Captures the moment a tab is created to infer its parent.
- `handleRemovedTab(tabId)`: Handles tree updates when a tab is natively closed.
- `handleReplacedTab(addedTabId, removedTabId)`: Migrates tree state if Vivaldi replaces a tab ID.
- `getCreateChildIndex(parentTabId, tabs)`: Determines where natively a new child should be inserted.
- `getCloseTargetIds(tabId)`: Recursively returns all descendant IDs (used to close whole branches).
- `deriveNextView(contextKey, activeTabId, tabs)`: Computes the next visual tree representation (returns `treeTabs`, `fullTreeOrderIds`, etc.).
- `async toggleCollapsed(tabId, activeTabId, tabs)`: Toggles the folded state of a subtree.
- `async moveTabs(tabIds, targetId, position, tabs)`: Relocates tabs in the tree (positions: 'before', 'after', 'inside').
- `getState()`: Returns a snapshot of the raw tree state (`rootIds`, `nodesById`).

---

## 3. `src/store/tab-store.js`

The central state manager (Flux-like). It aggregates `tabs-api.js` events and `tree-controller.js` calculations to expose a single unified state to the UI renderer.

**Key Exported Methods:**
- `subscribe(listener)`: Allows the UI (e.g., `render.js`) to subscribe to state changes.
- `async init()`: Initializes the store, fetching initial tabs and binding events.
- `async reload()`: Forces a full resync of tabs from the browser.
- `dispose()`: Cleans up listeners.
- `startAutoCloseJob()`: Initializes the background interval that auto-closes old tabs.
- `async repairMissingCreatedAt()`: Migrates legacy tabs by assigning `Date.now()` to missing timestamps.
- **Getters**:
  - `getTabById(id)`: Returns the tab object.
  - `getTreeTabById(id)`: Returns the UI tree node (with `depth`, `hasChildren`, etc.).
  - `getVisibleTreeTabs()`: Returns the flat ordered list of visually rendered tabs.
- **Actions** (Triggers native API calls):
  - `async closeTabs(tabIds)`
  - `async activateTab(tabId)`
  - `async createChildTab(parentTabId)`
  - `async createSiblingTab(tabId)`
  - `async moveTabs(tabIds, targetTabId, dropPosition)`
  - `async toggleCollapsed(tabId)`
  - `async hibernateTabs(tabIds)`
  - `async convertToFolder(tabId)`

---

## 4. `src/store/tree-store.js`

A low-level synchronous store that actually mutates the tree map (`nodesById`, `rootIds`, `childIds`). *Rarely accessed directly outside `tree-controller.js`.*

**Core state structure:**
```javascript
{
  contextKey: string,
  rootIds: number[],
  nodesById: {
    [tabId]: { parentId: number | null, childIds: number[], collapsed: boolean }
  }
}
```

---

## 5. `src/store/tree-persistence.js`

Handles the serialization and deserialization of the tree structure to and from Vivaldi's `vivExtData` string payloads, ensuring the tree survives browser restarts.

**Key Concepts:**
- `TREE_NAMESPACE_KEY = 'svbTree'`
- `svbTreeBackup` is saved to `localStorage` (guarded safely for background context) as a fallback mechanism if Vivaldi fails to load `vivExtData` properly.

---

## 6. `src/store/settings-store.js`

Handles user preferences. 
- `get(key)`: Returns the setting value.
- `set(key, value)`: Updates and persists the setting to `localStorage`.
- Available keys include `autoCloseTabsDays`, `childPosition`, `theme`, etc.

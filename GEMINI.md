# Project Architecture & Safety Mechanisms

This document outlines the core architectural principles and safety mechanisms implemented in the Vivaldi Tree Style Tabs project to ensure stability, prevent data loss, and maintain synchronization with the native browser UI.

## 1. Tab Closing Safety (Anti-Orphan Logic)
To prevent "orphaned" child tabs (tabs that remain in memory but are hidden because their parent was closed), the project employs a strict cleanup strategy:
- **UI-Triggered Closure:** When a parent tab is closed via the custom panel, `treeController.getCloseTargetIds` recursively identifies all descendants. A single bulk request is sent to the Vivaldi API to close the entire subtree.
- **Native-Triggered Closure:** If a tab is closed via native Vivaldi UI, `treeController.removeTab` automatically promotes its children to the next higher level in the hierarchy, preventing the tree structure from breaking.

## 2. Native Reconciliation (Infinite Loop & Workspace Protection)
Synchronization between the linear native tab strip and the hierarchical custom panel is managed by `native-reconcile.js`.
- **Mechanism:** To avoid infinite loops where the mod moves a tab, Vivaldi emits a move event, and the mod reacts by moving it again, the controller uses an "own move" tracking system.
- **Implementation:** Before calling `api.moveTab`, the mod registers the Tab ID in an internal `Set`. Incoming `onMoved` events are ignored if the ID is present in this set, effectively breaking the feedback loop.
- **Workspace Sync:** To prevent "context sticking" when moving tabs between workspaces, the system employs **Active-Tab-First Resolution**. If the active tab's `workspaceId` changes, the panel immediately follows it to the new workspace, overriding any cached "visible tabs" context. This prevents the extension from erroneously activating tabs in the previous workspace.

## 3. Workspace Context Locking
Rapid tab closures or switching can cause Vivaldi to momentarily activate tabs in different workspaces, leading to visual flickering.
- **Mechanism:** `tab-store.js` implements a "Context Lock".
- **Implementation:** During batch operations (like closing multiple tabs), the current workspace view is "frozen" for ~800ms. Any temporary background activations triggered by Vivaldi during this window are suppressed by the renderer, maintaining a stable UI for the user.

## 4. State Immutability & Render Efficiency
The UI renderer (`ui/render.js`) relies on shallow comparisons for high-performance updates.
- **Pattern:** `tab-store.js` strictly follows the `state = { ...state, ...nextPatch }` pattern.
- **Result:** Arrays and objects are never mutated in place; new references are created, allowing the renderer to instantly identify changed tabs and perform surgical DOM updates instead of a full re-render.

## 5. Tree Persistence
The hierarchical structure is persisted across browser restarts and window moves without an external database.
- **Storage:** Metadata (parent ID, collapsed state) is stored directly in Vivaldi's native `vivExtData` field for each tab.
- **Benefit:** The tree structure is intrinsically tied to the tab itself, allowing it to survive browser updates, crashes, and movement between windows or workspaces.

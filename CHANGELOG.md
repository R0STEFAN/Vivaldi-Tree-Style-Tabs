# Release Notes (v2.3.5)

## 🛠️ Fixes & Improvements

* **Dropped Links**: Dropped links now open directly in the active workspace.
* **Child and Sibling Tabs**: New child and sibling tabs now stay in the active workspace.
* **Workspace Auto-Adoption**: Automatically moves newly opened tabs into the current workspace.

---

# Release Notes (v2.3.4)

## 🛠️ Fixes & Improvements

* **Створення нової вкладки**: нова вкладка створюється в поточному просторі замість Default.
* **Переміщення вкладок (Move to)**: виправлено переміщення вкладок у будь-який простір та Default.
* **Створення простору з вкладками**: виправлено створення нового простору з виділеними вкладками.

---

* **New Tab in Active Workspace**: New tabs now open in the active workspace instead of Default.
* **Move Tabs to Workspace**: Fixed moving tabs to any existing workspace and Default window.
* **Create Workspace with Tabs**: Fixed creating a new workspace with selected tabs.

---

# Release Notes (v2.3.3)

## 🛠️ Fixes & Stability Improvements

### ⚙️ Respect Native Vivaldi "New Tab Page" Preference
* **Unwrap Vivaldi Preference Objects**: Fixed an issue where `vivaldi.prefs.get()` returns a wrapped object `{ path, value }` instead of a primitive value. Previously, this caused `String(value)` to evaluate to `"[object Object]"`, failing preference matches and forcing new tabs to fall back to the Start Page (Speed Dials).
* **Support All New Tab Page Configurations**: The mod panel's New Tab (`+`) button and "New Child Tab" action now strictly respect the settings configured in `Settings > Tabs > New Tab Page`:
  * **Start Page / Speed Dial**
  * **Homepage** (resolves configured `vivaldi.homepage`)
  * **Blank Page** (`about:blank`)
  * **Specific Page** (resolves configured `vivaldi.tabs.new_page.custom_url`)
  * **Controlled by Extension** (delegates new tab opening to active new tab override extensions)
* **Custom URL Normalization**: Automatically prepends `http://` if the user configured a custom URL without an explicit protocol scheme (e.g. `google.com` or `intranet.local`), preventing relative URI resolution errors, and safely defaults to `about:blank` if the custom URL field is empty.
* **Dual API Compatibility**: Handles both Promise-based and callback-based `vivaldi.prefs.get` invocations across Vivaldi versions.

---

# Release Notes (v2.3.2)

## 🛠️ Fixes & Stability Improvements

### 🎯 Clean Tab Close Without "Fly-Down" Jump
* **Eliminated Bottom-Jump Animation**: Closing an active or background tab previously caused it to visually fly down to the very bottom of the sidebar before disappearing due to an IPC race condition with Chromium and fallback tree sorting.
* **Optimistic Instant Removal**: Closing tabs (via the `×` button, middle-click, or `Ctrl+W`) are now immediately removed from active tree state and hidden in-place (`.is-closing`, `opacity: 0`, `pointer-events: none`).
* **Closing Tab Tracking Registry**: Added `markClosingTab` and `isClosing` in `treeController` with TTL protection to ensure subsequent syncs during browser IPC delays never resurrect or reposition closed tabs at the bottom.
* **Smooth Upward FLIP Transition**: Remaining tabs below the closed tab slide smoothly upward into place without visual jarring.

### 🛡️ Unified Side Panel Hover Zone in Full Auto-Hide Mode
* **Eliminated Rapid Open/Close Flickering**: In full auto-hide mode, moving the mouse across Vivaldi's native side panel previously caused the tab panel to continuously flicker open and closed with every micro-movement.
* **Unified Same-Side Dock**: When Vivaldi's native side panel and the custom vertical tabs panel are on the same side, hovering over the side panel (including `#switch` icon strip and expanded panel content like Bookmarks, History, Notes, Web Panels) now displays and steadily maintains the vertical tab panel open as a single cohesive unit.
* **Smooth Cross-Panel Navigation**: Moving the cursor between the native side panel and the tab panel never triggers auto-collapse. The panel closes only when the cursor completely leaves both panels (e.g., into the web page).
* **Opposite-Side Isolation**: When the native side panel is on the opposite side of the browser, side panel hover has zero effect on the vertical tab panel.

---

# Release Notes (v2.3.1)

## 🛠️ Fixes & Stability Improvements

### 🧩 Native Side Panel Coexistence & Dynamic Layout Offset
* **`--svb-panels-offset` CSS Variable**: Dynamically calculates and applies the native side panel width in real time via `ResizeObserver`, pushing the vertical tabs panel and auto-hide edge trigger cleanly beside the side panel when both are on the same side.
* **DOM Placement Order**: Corrected DOM insertion in `mountRoot` so that `#panels-container` precedes `#svb-root`, ensuring the native side panel renders first and the tab panel follows in natural visual order.
* **Floating Panel Support**: Correctly detects floating/overlay panels (`.overlay`) to ensure layout margins only push when the side panel is docked.

### 🌐 Prevent UI Date Format & Locale Corruption & Restored Workspaces
* **Safe Webpack Discovery**: Switched `findModuleByExports` in the Vivaldi bridge to inspect only already-cached modules in `require.c` instead of scanning `require.m` and executing `require(moduleId)`, keeping native Vivaldi UI (History, Downloads, Bookmarks) in the configured language.
* **Restored Workspaces in Header**: Reconnected native workspace discovery via known module ID fallback, restoring full functionality to the in-panel workspace switcher and "Move To" menu.
* **Faster Startup**: Eliminates eager evaluation of hundreds of Webpack module factories on browser startup.

### 🧭 Address Bar Dropdown & Popup Stacking Fix
* **Dropdown Layering**: Elevated `#browser .toolbar.toolbar-addressbar` and `#addressbar` `z-index` to `1000002 !important`.
* **Unobstructed Omnibox**: Ensures native Vivaldi address bar suggestions, autocomplete dropdowns, and extension popups always render cleanly above the vertical tab panel (including when context menus are open).

---

# Release Notes (v2.3.0)

## 🚀 What's New

### 🤖 Gemini AI Tab Grouping
* **Intelligent Thematic Folders**: One-click clustering of loose tabs into clean, colored folders powered by Google Gemini.
* **Preserve Tree Hierarchies**: Entire tab subtrees and child branches move together under their parent tab without breaking hierarchy.
* **Topic-Based Search Query Grouping**: Search queries (Google, DuckDuckGo, Bing, Brave, Ecosia, Yandex) are categorized by their specific search subject rather than grouped into a generic "Search" folder.
* **Exhaustive Multi-Grouping**: Analyzes all tabs across multiple distinct topics in a single request with an expanded token limit (up to 8,192 output tokens).
* **Privacy-First Sanitization**: URL queries, fragments, auth tokens, and internal browser pages are completely stripped before sending to the model.
* **Configurable Language & Models**: Choose folder naming language (Ukrainian, English, German, Polish, etc.) and model (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-2.5-pro`) with real-time model list fetching.
* **Interactive UI Feedback**: Added header AI action button with tactile active state, rotating SVG spinner animation during requests, and floating toast notifications in English reporting organized counts or errors.

---

# Release Notes (v2.2.0)

## 🚀 What's New

### 🔹 Native Workspaces Integration & In-Panel Switcher
* **In-Panel Workspace Switcher**: Switch between native Vivaldi workspaces directly from the sidebar header.
* **Native Icons & Emojis**: Displays custom SVG icons, emoji icons, and standard icons exactly as configured in Vivaldi.
* **Inline Creation & Renaming**: Easily create and rename workspaces directly in the panel with native synchronization.
* **Unified "Move To" Context Menu**: Move tabs to specific workspaces or back to default window context with native icons and ordering.
* **Active-Tab-First Workspace Reconciliation**: Prevents context-sticking or visual flickering when navigating tabs across workspaces.

### 🔹 Tab Hibernation & Memory Management
* **Hierarchy-Aware Tab Hibernation**: Discard active tabs while automatically switching focus to an adjacent sibling or parent, preventing accidental activation of children.
* **Auto-Close Inactive Tabs & Trees**: Configurable automatic cleanup of inactive tabs older than 1–30 days while protecting pinned tabs and folders.

### 🔹 Performance & Tree Responsiveness
* **Zero-Latency Tree Collapse**: Synchronous DOM collapsing and expanding without waiting for browser roundtrips.

---

# Release Notes (v2.1.0)

## 🚀 What's New

### 🔹 Compact Icon Strip Auto-Hide Mode
* **New Layout Setting**: Choose between **Full Auto-Hide** and **Icon Strip (`icons`)** mode in panel settings.
* **Docked 42px Icon Strip**: Leaves a clean 42px column of tab favicons docked beside your web pages without shifting web content on hover.
* **Smooth Overlay Reveal**: Hovering expands the panel to full width as an elevated overlay with synchronized easing.
* **Zero Horizontal/Vertical Jitter**: Favicons and folder icons remain strictly anchored at `x = 21px`, and header height is locked to eliminate micro-shifts.
* **Folded Tree & Badge Indicators**: Preserved chevron arrows and child count mini-badges on folded tree branches in collapsed mode.
* **Refined Animations**: Soft, synchronized fade-in for header actions, centered tab count badge, "New Tab" text, and "New Folder" button.

### 🔹 Tab Management & Navigation
* **Adaptive Tab Close Activation**: Closing an active tab automatically activates its closest tree sibling or parent instead of random tabs.
* **Move to Top / Bottom Actions**: New context menu options to quickly move selected tabs to the top or bottom of the tree hierarchy.
* **New Tab Placement (Top / Bottom)**: Configure new root tabs to open at the top (under pinned folders) or bottom of the list.
* **Reliable Tab Detachment**: Smoothly move tabs and trees to new windows with full session and audio state preservation.

---

## 🛠️ Fixes & Improvements
* **Context Menu Stability**: Prevented panel auto-collapse when right-clicking tabs or navigating deep submenus.
* **Centered Folder Icons**: Perfectly aligned 16x16px folder SVG icons to match standard browser favicons.
* **Full Test Coverage**: Added 34 automated unit and integration tests for layout, tree operations, and persistence.

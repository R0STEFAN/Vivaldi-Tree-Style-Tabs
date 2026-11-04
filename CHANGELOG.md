# Release Notes (v2.3.1)

## 🛠️ Fixes & Stability Improvements

### 🌐 Prevent UI Date Format & Locale Corruption
* **Safe Webpack Discovery**: Switched `findModuleByExports` in the Vivaldi bridge to inspect only already-cached modules in `require.c` instead of scanning `require.m` and executing `require(moduleId)`.
* **Preserve Native Locale**: Prevents unintended execution of uninitialized locale modules (such as Chinese or French date formatters in `date-fns`/`moment`), keeping Vivaldi UI areas like History, Downloads, and Bookmarks in the user's configured language.
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

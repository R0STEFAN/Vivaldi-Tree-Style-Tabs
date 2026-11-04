# Release Notes (v2.3.2)

This release includes critical visual polish, stability fixes for tab closing, native Vivaldi side panel coexistence improvements, and fixes carried over from the recent v2.3.1 update.

---

## 🚀 What's New & Fixed in v2.3.2

### 🎯 Clean Tab Close Without "Fly-Down" Jump
* **Eliminated Bottom-Jump Animation**: Previously, closing an active or background tab caused it to visually fly down to the very bottom of the sidebar before disappearing. This was caused by an IPC race condition where Chromium continues returning the tab for ~50ms while tearing down its WebContents, and the tree selector sorted unrecognized tabs to the bottom of the list.
* **Optimistic Instant Removal**: Closing tabs (via the `×` button, middle-click, or `Ctrl+W`) are now immediately removed from the active tree state and marked `.is-closing` with zero opacity and disabled pointer events.
* **Closing Tab Tracking Registry**: Added `markClosingTab` and `isClosing` in `treeController` with TTL protection to ensure subsequent syncs during browser IPC delays never resurrect or reposition closed tabs at the bottom.
* **Smooth Upward FLIP Transition**: Remaining tabs below the closed tab slide smoothly upward into place without visual jarring.

### 🛡️ Unified Side Panel Hover Zone in Full Auto-Hide Mode
* **Eliminated Rapid Open/Close Flickering**: In full auto-hide mode, moving the mouse across Vivaldi's native side panel previously caused the tab panel to continuously flicker open and closed with every micro-movement.
* **Unified Same-Side Dock**: When Vivaldi's native side panel and the custom vertical tabs panel are on the same side, hovering over the side panel (including `#switch` icon strip and expanded panel content like Bookmarks, History, Notes, Web Panels) now displays and steadily maintains the vertical tab panel open as a single cohesive unit.
* **Smooth Cross-Panel Navigation**: Moving the cursor between the native side panel and the tab panel never triggers auto-collapse. The panel closes only when the cursor completely leaves both panels (e.g., into the web page).
* **Opposite-Side Isolation**: When the native side panel is on the opposite side of the browser, side panel hover has zero effect on the vertical tab panel.

---

## 🛠️ Fixes Carried Over from v2.3.1

### 🧩 Native Side Panel Coexistence & Dynamic Layout Offset
* **`--svb-panels-offset` CSS Variable**: Dynamically calculates and applies the native side panel width in real time via `ResizeObserver`, pushing the vertical tabs panel and auto-hide edge trigger cleanly beside the side panel when both are on the same side.
* **DOM Placement Order**: Corrected DOM insertion in `mountRoot` so that `#panels-container` precedes `#svb-root`, ensuring the native side panel renders first and the tab panel follows in natural visual order.
* **Floating Panel Support**: Correctly detects floating/overlay panels (`.overlay`) to ensure layout margins only push when the side panel is docked.

### 🌐 Workspaces Discovery & Native Locale Protection
* **Safe Webpack Discovery**: Switched module discovery in `vivaldi-bridge.js` to inspect only cached modules in `require.c` rather than triggering uninitialized module factories in `require.m`, preventing date format and UI language corruption in native Vivaldi menus (History, Downloads, Bookmarks).
* **Restored Workspaces in Header**: Reconnected native workspace discovery via known module ID fallback, restoring full functionality to the in-panel workspace switcher and "Move To" menu.

### 🧭 Address Bar Dropdown & Popup Stacking Fix
* **Dropdown Layering**: Elevated `#browser .toolbar.toolbar-addressbar` and `#addressbar` `z-index` to `1000002 !important` to ensure Omnibox autocomplete suggestions and extension popups render above vertical tabs.

---

## 📦 Automated Tests
* Full test suite passing with **108 automated unit and integration tests** covering layout adaptation, tab closing, tree persistence, side panel coexistence, and AI grouping.

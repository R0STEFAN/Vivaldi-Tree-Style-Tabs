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

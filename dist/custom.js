(function(){
  const __modules = {
    "bootstrap/wait-for-browser.js": function(require, module, exports) {
function waitForBrowser() {
  return new Promise(resolve => {
    const tryResolve = () => {
      const app = document.querySelector('#app')
      const browser = document.querySelector('#browser')
      const mainInner = document.querySelector('#browser > #main > .inner')
      if (app && browser && mainInner) {
        resolve({ app, browser, mainInner })
        return true
      }
      return false
    }

    if (tryResolve()) return

    const observer = new MutationObserver(() => {
      if (!tryResolve()) return
      observer.disconnect()
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  })
}

module.exports = { waitForBrowser }

    },
    "ui/styles.js": function(require, module, exports) {
const STYLE_TEXT = `
#browser > #main > .inner.svb-layout-host.svb-mode-docked {
  padding-left: var(--svb-sidebar-width, 300px);
}

#browser > #main > .inner.svb-layout-host.svb-is-fullscreen {
  padding-left: 0 !important;
}

#browser > #main > .inner.svb-layout-host.svb-mode-overlay {
  padding-left: 0;
}

#browser > #main > .inner.svb-layout-host.svb-mode-docked #webview-container ~ .StatusInfo {
  left: calc(var(--svb-sidebar-width, 300px) + 6px);
}

#svb-root.svb-shell {
  --svb-bg: var(--svb-theme-panel-bg, #232629);
  --svb-panel: var(--svb-theme-tab-bg, #2d3136);
  --svb-panel-hover: var(--svb-theme-tab-hover-bg, #343a40);
  --svb-panel-active: var(--svb-theme-tab-active-bg, #4b5259);
  --svb-border: var(--svb-theme-panel-border, rgba(255, 255, 255, 0.08));
  --svb-text: var(--svb-theme-panel-fg, #d8d8d8);
  --svb-text-strong: var(--svb-theme-tab-active-fg, #f2f2f2);
  --svb-text-muted: color-mix(in srgb, var(--svb-text) 58%, transparent);
  --svb-accent: var(--svb-theme-accent, #47cfff);
  --svb-accent-soft: color-mix(in srgb, var(--svb-accent) 18%, transparent);
  --svb-shadow: none;
  --svb-radius: var(--svb-theme-radius, 5px);
  --svb-gap: 2px;
  --svb-tree-indent: 14px;
  --svb-guide-opacity: 0.18;
  --svb-d-swift: 100ms;
  --svb-d-fast: 120ms;
  --svb-d-norm: 200ms;
  --svb-ease: cubic-bezier(0.2, 0, 0, 1);
  --svb-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--svb-sidebar-width, 300px);
  z-index: 1;
  pointer-events: auto;
  font-family: "Segoe UI", "Noto Sans", sans-serif;
  font-size: 13px;
  opacity: 0;
  transform: translateX(calc(-100% + 2px));
  transition:
    transform var(--svb-d-norm) var(--svb-ease-out),
    opacity var(--svb-d-fast) linear;
}

#svb-root.svb-shell.is-menu-open {
  z-index: 999999;
}

#browser > #main > .inner.svb-layout-host.svb-is-fullscreen #svb-root.svb-shell,
#browser > #main > .inner.svb-layout-host.svb-is-fullscreen #svb-root-trigger.svb-edge-trigger,
#browser > #main > .inner.svb-layout-host.svb-is-fullscreen #svb-root-drag-shield.svb-drag-shield {
  display: none !important;
}

body.svb-is-resizing {
  cursor: ew-resize;
  user-select: none;
}

#browser > #main > .inner.svb-layout-host.svb-mode-docked #svb-root.svb-shell,
#svb-root.svb-shell.is-revealed {
  opacity: 1;
  transform: translateX(0);
}

#svb-root-trigger.svb-edge-trigger {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 8px;
  z-index: 1;
  display: none;
  pointer-events: auto;
}

#svb-root-trigger.svb-edge-trigger.is-enabled {
  display: block;
}

#svb-root-drag-shield.svb-drag-shield {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: none;
  cursor: ew-resize;
  background: transparent;
}

#svb-root-drag-shield.svb-drag-shield.is-active {
  display: block;
}

#svb-root .svb-frame {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--svb-border);
  border-radius: 0;
  color: var(--svb-text);
  background: var(--svb-bg);
  box-shadow: var(--svb-shadow);
}

#svb-root .svb-resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  z-index: 20;
}

#svb-root .svb-drag-ghost {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 80;
  width: min(220px, calc(100% - 16px));
  opacity: 0;
  pointer-events: none;
  transform: translate(-9999px, -9999px);
  transition: opacity var(--svb-d-fast) linear;
}

#svb-root .svb-drag-ghost.is-visible {
  opacity: 0.82;
}

#svb-root .svb-drag-ghost__stack {
  position: relative;
  min-height: 30px;
}

#svb-root .svb-drag-ghost__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
  padding: 0 8px;
  border: 1px dashed color-mix(in srgb, var(--svb-accent) 62%, var(--svb-border));
  border-radius: var(--svb-radius);
  color: var(--svb-text-strong);
  background: color-mix(in srgb, var(--svb-bg) 76%, transparent);
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.24),
    inset 0 0 0 1px color-mix(in srgb, var(--svb-text-strong) 8%, transparent);
  backdrop-filter: blur(8px);
}

#svb-root .svb-drag-ghost__stack.is-multi {
  min-height: 56px;
}

#svb-root .svb-drag-ghost__stack.is-multi .svb-drag-ghost__card {
  position: absolute;
  top: var(--svb-ghost-y);
  left: var(--svb-ghost-x);
  right: 0;
}

#svb-root .svb-drag-ghost__stack.is-multi .svb-drag-ghost__card:nth-child(1) {
  z-index: 4;
}

#svb-root .svb-drag-ghost__stack.is-multi .svb-drag-ghost__card:nth-child(2) {
  z-index: 3;
  opacity: 0.86;
}

#svb-root .svb-drag-ghost__stack.is-multi .svb-drag-ghost__card:nth-child(3) {
  z-index: 2;
  opacity: 0.72;
}

#svb-root .svb-drag-ghost__stack.is-multi .svb-drag-ghost__card:nth-child(4) {
  z-index: 1;
  opacity: 0.58;
}

#svb-root .svb-drag-ghost__icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  border: 1px solid color-mix(in srgb, var(--svb-accent) 70%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--svb-accent) 24%, transparent);
}

#svb-root .svb-drag-ghost__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

#svb-root .svb-drag-ghost__count {
  flex: 0 0 auto;
  min-width: 18px;
  padding: 0 5px;
  border-radius: 99px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: var(--svb-bg);
  background: var(--svb-accent);
}

#svb-root .svb-drag-ghost__more {
  position: absolute;
  right: 8px;
  top: 34px;
  z-index: 5;
  min-width: 20px;
  padding: 0 5px;
  border-radius: 99px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: var(--svb-bg);
  background: var(--svb-accent);
}

#svb-root .svb-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0 8px;
  align-items: center;
  padding: 6px;
  border-bottom: 0;
}

#svb-root .svb-header__count {
  grid-column: 2;
  grid-row: 1;
  align-self: center;
  justify-self: end;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 99px;
  font-size: 10px;
  line-height: 16px;
  color: var(--svb-text-muted);
  background: color-mix(in srgb, var(--svb-text) 8%, transparent);
}

#svb-root .svb-header__actions {
  grid-row: 1;
  grid-column: 3;
  display: flex;
  gap: 2px;
  align-items: center;
}

#svb-root .svb-icon-button {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--svb-radius);
  color: var(--svb-text);
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

#svb-root .svb-icon-button:hover {
  background: color-mix(in srgb, var(--svb-text) 10%, transparent);
}

#svb-root .svb-icon-button.is-active {
  color: var(--svb-text-strong);
  background: color-mix(in srgb, var(--svb-text) 10%, transparent);
}

#svb-root .svb-icon-button:disabled,
#svb-root .svb-icon-button.is-disabled {
  opacity: 0.42;
  cursor: default;
}

#svb-root .svb-icon-button:disabled:hover,
#svb-root .svb-icon-button.is-disabled:hover {
  background: transparent;
}

#svb-root .svb-pin-icon {
  width: 14px;
  height: 14px;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

#svb-root .svb-collapse-all-icon {
  width: 15px;
  height: 15px;
  display: block;
  margin: auto;
}

#svb-root .svb-section {
  padding: 0 2px;
}

#svb-root .svb-section--fill {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  padding-bottom: 2px;
}

#svb-root .svb-section__label {
  margin: 0 6px 4px;
  font-size: 10px;
  color: var(--svb-text-muted);
  text-transform: uppercase;
}

#svb-root .svb-pinned-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--svb-gap);
  padding: 0 0 11px;
  position: relative;
}

#svb-root .svb-pinned-grid::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 4px;
  height: 1px;
  opacity: 0.22;
  background-image: linear-gradient(90deg, transparent, color-mix(in srgb, var(--svb-text) 70%, transparent) 10%, color-mix(in srgb, var(--svb-text) 70%, transparent) 90%, transparent);
}

#svb-root .svb-tab-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 0;
  overflow: auto;
  padding-right: 0;
  padding-bottom: 2px;
}

#svb-root .svb-tab {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  padding: 0 2px 2px;
  border: 0;
  outline: 0;
  border-radius: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  text-align: left;
  box-shadow: none;
  transition:
    transform var(--svb-d-norm) var(--svb-ease-out),
    opacity var(--svb-d-fast) linear;
}

#svb-root .svb-tab:focus,
#svb-root .svb-tab:focus-visible,
#svb-root .svb-tab:active {
  outline: 0;
  box-shadow: none;
}

#svb-root .svb-tab__outer {
  --svb-depth: 0;
  position: relative;
  display: block;
  width: calc(100% - (var(--svb-depth) * var(--svb-tree-indent)));
  margin-left: calc(var(--svb-depth) * var(--svb-tree-indent));
}

#svb-root .svb-tab__guides {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

#svb-root .svb-tab__guide {
  position: absolute;
  width: 1px;
  opacity: var(--svb-guide-opacity);
  background: color-mix(in srgb, var(--svb-text) 90%, transparent);
}

#svb-root .svb-tab__guide--branch {
  top: 0;
  left: calc(var(--svb-tree-indent) * 0.5);
  height: calc(var(--svb-guide-branch-size) * 32px - 2px);
}

#svb-root .svb-tab__body {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  padding: 0 6px 0 7px;
  border: 1px solid transparent;
  border-radius: var(--svb-radius);
  background: var(--svb-panel);
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.12);
  z-index: 1;
}

#svb-root .svb-tab.is-dragging {
  opacity: 0.72;
}

#svb-root .svb-tab:hover .svb-tab__body {
  background: var(--svb-panel-hover);
}

#svb-root .svb-tab.is-colored .svb-tab__body {
  border-color: color-mix(in srgb, var(--svb-tab-color) 34%, var(--svb-border));
  background: color-mix(in srgb, var(--svb-tab-color) 14%, var(--svb-panel));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--svb-tab-color) 14%, transparent);
}

#svb-root .svb-tab.is-colored:hover .svb-tab__body {
  background: color-mix(in srgb, var(--svb-tab-color) 18%, var(--svb-panel-hover));
}

#svb-root .svb-tab.is-tiled .svb-tab__body {
  border-color: color-mix(in srgb, var(--svb-tile-accent, var(--svb-accent)) 30%, var(--svb-border));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--svb-tile-accent, var(--svb-accent)) 18%, transparent);
}

#svb-root .svb-tab.is-selected .svb-tab__body {
  border-color: color-mix(in srgb, var(--svb-accent) 35%, transparent);
  background: color-mix(in srgb, var(--svb-accent) 12%, var(--svb-panel));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--svb-accent) 28%, transparent);
}

#svb-root .svb-tab.is-active .svb-tab__body {
  border-color: transparent;
  background: var(--svb-panel-active);
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.45), inset 0 0 0 1px color-mix(in srgb, var(--svb-text-strong) 10%, transparent);
}

#svb-root .svb-tab.is-colored.is-active .svb-tab__body {
  border-color: color-mix(in srgb, var(--svb-tab-color) 24%, transparent);
  background: color-mix(in srgb, var(--svb-tab-color) 18%, var(--svb-panel-active));
  box-shadow:
    0 1px 4px -1px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px color-mix(in srgb, var(--svb-text-strong) 10%, transparent),
    inset 0 0 0 2px color-mix(in srgb, var(--svb-tab-color) 18%, transparent);
}

#svb-root .svb-tab.is-tiled.is-active .svb-tab__body {
  border-color: color-mix(in srgb, var(--svb-tile-accent, var(--svb-accent)) 24%, transparent);
  box-shadow:
    0 1px 4px -1px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px color-mix(in srgb, var(--svb-text-strong) 10%, transparent),
    inset 0 0 0 2px color-mix(in srgb, var(--svb-tile-accent, var(--svb-accent)) 16%, transparent);
}

#svb-root .svb-tab.is-drop-target .svb-tab__body {
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.32), inset 0 0 0 1px color-mix(in srgb, var(--svb-accent) 35%, transparent);
}

#svb-root .svb-tab.is-discarded .svb-tab__body {
  color: var(--svb-text-muted);
}

#svb-root .svb-tab.is-compact .svb-tab__outer {
  width: 100%;
  margin-left: 0;
}

#svb-root .svb-tab.is-compact .svb-tab__body {
  justify-content: center;
  min-height: 30px;
  padding: 0;
}

#svb-root .svb-tab__drop-indicator {
  position: absolute;
  left: 6px;
  right: 6px;
  height: 2px;
  border-radius: 99px;
  background: var(--svb-accent);
  opacity: 0;
  pointer-events: none;
}

#svb-root .svb-tab.is-drop-target .svb-tab__drop-indicator {
  opacity: 1;
}

#svb-root .svb-tab__drop-indicator.is-before {
  top: -1px;
}

#svb-root .svb-tab__drop-indicator.is-after {
  bottom: -1px;
}

#svb-root .svb-tab__drop-indicator.is-inside {
  top: 50%;
  left: 28px;
  right: 10px;
  transform: translateY(-50%);
}

#svb-root .svb-pinned-tab {
  width: 30px;
  min-width: 30px;
  flex: 0 0 30px;
  padding: 0;
}

#svb-root .svb-tab__lead {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  z-index: 1;
}

#svb-root .svb-tab__favicon {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

#svb-root .svb-tab__spinner {
  display: block;
  width: 14px;
  height: 14px;
  border: 2.2px solid color-mix(in srgb, var(--svb-text) 18%, transparent);
  border-top-color: color-mix(in srgb, var(--svb-accent) 78%, var(--svb-text));
  border-right-color: color-mix(in srgb, var(--svb-accent) 42%, transparent);
  border-radius: 999px;
  animation: svb-spinner-rotate 700ms linear infinite;
}

#svb-root .svb-tab.is-discarded .svb-tab__favicon {
  opacity: 0.48;
  filter: grayscale(0.65) saturate(0.55);
}

#svb-root .svb-tab.is-discarded .svb-tab__spinner {
  opacity: 0.72;
}

#svb-root .svb-tab__favicon--fallback {
  background: linear-gradient(135deg, color-mix(in srgb, var(--svb-accent) 70%, white), var(--svb-accent));
}

@keyframes svb-spinner-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

#svb-root .svb-tab__exp {
  position: absolute;
  inset: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
}

#svb-root .svb-tab__exp-icon {
  width: 14px;
  height: 14px;
  color: color-mix(in srgb, var(--svb-text-strong) 80%, var(--svb-text));
  transform: rotate(0deg);
  opacity: 0.92;
}

#svb-root .svb-tab__exp.is-collapsed .svb-tab__exp-icon {
  transform: rotate(-90deg);
}

#svb-root .svb-tab.is-active .svb-tab__exp-icon,
#svb-root .svb-tab__lead:hover .svb-tab__exp-icon {
  color: var(--svb-text-strong);
  opacity: 1;
}

#svb-root .svb-tab[data-parent="true"] .svb-tab__lead:hover .svb-tab__exp,
#svb-root .svb-tab[data-parent="true"][data-folded="true"] .svb-tab__exp {
  opacity: 1;
}

#svb-root .svb-tab[data-parent="true"] .svb-tab__lead:hover .svb-tab__favicon,
#svb-root .svb-tab[data-parent="true"][data-folded="true"] .svb-tab__favicon {
  opacity: 0.2;
}

#svb-root .svb-tab__child-count {
  position: absolute;
  right: -2px;
  bottom: -5px;
  min-width: 8px;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  color: color-mix(in srgb, var(--svb-text-strong) 88%, var(--svb-text));
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
  z-index: 2;
  pointer-events: none;
}

#svb-root .svb-tab.is-active .svb-tab__child-count {
  color: var(--svb-text-strong);
}

#svb-root .svb-tab__content {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  flex: 1;
  padding-right: 0;
}

#svb-root .svb-tab.has-add.is-active .svb-tab__content,
#svb-root .svb-tab.has-add:hover .svb-tab__content {
  padding-right: 24px;
}

#svb-root .svb-tab.has-close.is-active .svb-tab__content,
#svb-root .svb-tab.has-close:hover .svb-tab__content {
  padding-right: 46px;
}

#svb-root .svb-tab.has-close.has-add.is-active .svb-tab__content,
#svb-root .svb-tab.has-close.has-add:hover .svb-tab__content {
  padding-right: 46px;
}

#svb-root .svb-tab__title {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--svb-text);
}

#svb-root .svb-tab__title-input {
  min-width: 0;
  width: 100%;
  flex: 1;
  margin: 0;
  padding: 2px 6px;
  border: 1px solid color-mix(in srgb, var(--svb-accent) 72%, transparent);
  border-radius: 6px;
  outline: none;
  background: color-mix(in srgb, var(--svb-bg-elevated) 86%, var(--svb-accent-soft));
  color: var(--svb-text-strong);
  font: inherit;
  line-height: 1.3;
}

#svb-root .svb-tab__title-input::selection {
  background: color-mix(in srgb, var(--svb-accent) 28%, transparent);
}

#svb-root .svb-tab.is-active .svb-tab__title {
  color: var(--svb-text-strong);
}

#svb-root .svb-tab.is-discarded .svb-tab__title {
  color: var(--svb-text-muted);
}

#svb-root .svb-tab.is-discarded.is-active .svb-tab__title {
  color: color-mix(in srgb, var(--svb-text-strong) 72%, var(--svb-text-muted));
}

#svb-root .svb-tab.is-discarded .svb-tab__badge {
  opacity: 0.72;
}

#svb-root .svb-tab__badge {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 14px;
  color: var(--svb-accent);
  background: var(--svb-accent-soft);
}

#svb-root .svb-tab__close {
  position: absolute;
  top: 50%;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  color: var(--svb-text-muted);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
}

#svb-root .svb-tab__add {
  position: absolute;
  top: 50%;
  right: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: var(--svb-text-muted);
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
}

#svb-root .svb-tab.is-active .svb-tab__add,
#svb-root .svb-tab:hover .svb-tab__add,
#svb-root .svb-tab.is-active .svb-tab__close,
#svb-root .svb-tab:hover .svb-tab__close {
  opacity: 1;
  pointer-events: auto;
}

#svb-root .svb-tab__add:hover,
#svb-root .svb-tab__close:hover {
  color: var(--svb-text-strong);
  background: color-mix(in srgb, var(--svb-text) 10%, transparent);
}

#svb-root .svb-empty {
  margin: 0 2px;
  padding: 14px 12px;
  border-radius: var(--svb-radius);
  color: var(--svb-text-muted);
  background: var(--svb-panel);
  text-align: center;
}

#svb-root .svb-footer {
  display: none;
  padding: 6px 2px 2px;
  border-top: 1px solid color-mix(in srgb, var(--svb-border) 75%, transparent);
  background: var(--svb-bg);
}

#svb-root .svb-frame.has-scroll .svb-footer {
  display: block;
}

#svb-root .svb-frame.has-scroll .svb-new-tab-button.is-inline {
  display: none;
}

#svb-root .svb-new-tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% - 4px);
  min-height: 30px;
  margin: 0 2px 2px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: var(--svb-radius);
  color: var(--svb-text-strong);
  background: var(--svb-panel);
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;
  text-align: left;
}

#svb-root .svb-new-tab-button:hover {
  background: var(--svb-panel-hover);
}

#svb-root .svb-new-tab-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 15px;
  line-height: 1;
}

#svb-root .svb-new-tab-button__label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

#svb-root .svb-tab-list::-webkit-scrollbar {
  width: 6px;
}

#svb-root .svb-tab-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--svb-text) 18%, transparent);
}

#svb-root .svb-tab-list::-webkit-scrollbar-track {
  background: transparent;
}

#svb-root .svb-menu {
  position: fixed;
  z-index: 2147483647;
  min-width: 238px;
  max-width: 320px;
  padding: 5px;
  border: 1px solid var(--svb-border, rgba(255, 255, 255, 0.12));
  border-radius: 8px;
  border-radius: calc(var(--svb-radius, 5px) + 3px);
  color: var(--svb-text, #d8d8d8);
  background: #202327;
  background: color-mix(in srgb, var(--svb-bg, #232629) 94%, black);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.42), 0 2px 6px rgba(0, 0, 0, 0.24);
}

#svb-root .svb-menu__item {
  position: relative;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--svb-radius, 5px);
  color: inherit;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

#svb-root .svb-menu__item:hover,
#svb-root .svb-menu__item.has-submenu:hover {
  background: var(--svb-panel-hover);
}

#svb-root .svb-menu__item.is-danger {
  color: color-mix(in srgb, #ff6b6b 72%, var(--svb-text));
}

#svb-root .svb-menu__item.is-disabled {
  opacity: 0.42;
  pointer-events: none;
}

#svb-root .svb-menu__item--color {
  gap: 10px;
}

#svb-root .svb-menu__icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.85;
  stroke-linecap: round;
  stroke-linejoin: round;
}

#svb-root .svb-menu__label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

#svb-root .svb-menu__swatch {
  width: 12px;
  height: 12px;
  border: 1px solid color-mix(in srgb, var(--svb-text) 24%, transparent);
  border-radius: 999px;
  background: var(--svb-menu-swatch, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, white 10%, transparent);
}

#svb-root .svb-menu__swatch.is-clear {
  position: relative;
  background: transparent;
}

#svb-root .svb-menu__swatch.is-clear::after {
  content: '';
  position: absolute;
  top: 5px;
  left: -1px;
  width: 12px;
  height: 1.5px;
  background: color-mix(in srgb, var(--svb-text) 70%, transparent);
  transform: rotate(-40deg);
  transform-origin: center;
}

#svb-root .svb-menu__item--color.is-current {
  background: color-mix(in srgb, var(--svb-accent) 12%, transparent);
}

#svb-root .svb-menu__saved-tree {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 26px;
  align-items: center;
  gap: 2px;
}

#svb-root .svb-menu__saved-tree-open {
  grid-template-columns: 18px minmax(0, 1fr);
}

#svb-root .svb-menu__saved-tree-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: var(--svb-radius, 5px);
  color: color-mix(in srgb, #ff6b6b 72%, var(--svb-text));
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

#svb-root .svb-menu__saved-tree-delete:hover {
  background: color-mix(in srgb, #ff6b6b 18%, transparent);
}

#svb-root .svb-menu__separator {
  height: 1px;
  margin: 5px 6px;
  background: color-mix(in srgb, var(--svb-text) 12%, transparent);
}

#svb-root .svb-menu__submenu {
  position: absolute;
  top: -5px;
  left: calc(100% - 4px);
  display: none;
  min-width: 230px;
  padding: 5px;
  border: 1px solid var(--svb-border, rgba(255, 255, 255, 0.12));
  border-radius: 8px;
  border-radius: calc(var(--svb-radius, 5px) + 3px);
  color: var(--svb-text, #d8d8d8);
  background: #202327;
  background: color-mix(in srgb, var(--svb-bg, #232629) 94%, black);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.42), 0 2px 6px rgba(0, 0, 0, 0.24);
  opacity: 0;
  overscroll-behavior: contain;
}

#svb-root .svb-menu__item.has-submenu:hover > .svb-menu__submenu {
  display: block;
  opacity: 1;
}

#svb-root .svb-menu__item.has-submenu.is-submenu-up > .svb-menu__submenu {
  top: auto;
  bottom: -5px;
}

#svb-root .svb-menu__empty {
  padding: 7px 8px;
  color: var(--svb-text-muted);
}

`

module.exports = { STYLE_TEXT }

    },
    "bootstrap/mount-root.js": function(require, module, exports) {
const { STYLE_TEXT } = require('../ui/styles.js')

function ensureStyleTag() {
  let style = document.getElementById('svb-styles')
  if (style) return style

  style = document.createElement('style')
  style.id = 'svb-styles'
  style.textContent = STYLE_TEXT
  document.head.appendChild(style)
  return style
}

function mountRoot(id) {
  ensureStyleTag()

  const host = document.querySelector('#browser > #main > .inner')
  if (!host) {
    return null
  }

  host.classList.add('svb-layout-host')

  let root = document.getElementById(id)
  if (!root) {
    root = document.createElement('aside')
    root.id = id
    root.className = 'svb-shell'
    host.prepend(root)
  }

  let trigger = document.getElementById(`${id}-trigger`)
  if (!trigger) {
    trigger = document.createElement('div')
    trigger.id = `${id}-trigger`
    trigger.className = 'svb-edge-trigger'
    host.prepend(trigger)
  }

  let dragShield = document.getElementById(`${id}-drag-shield`)
  if (!dragShield) {
    dragShield = document.createElement('div')
    dragShield.id = `${id}-drag-shield`
    dragShield.className = 'svb-drag-shield'
    host.appendChild(dragShield)
  }

  return { root, host, trigger, dragShield }
}

module.exports = { mountRoot }

    },
    "store/tree-store.js": function(require, module, exports) {
function normalizeTabId(value) {
  if (value == null || value === '') return null
  const tabId = Number(value)
  return Number.isFinite(tabId) ? tabId : null
}

function normalizeUniqueIds(values) {
  const seen = new Set()
  const result = []

  for (const value of Array.isArray(values) ? values : []) {
    const tabId = normalizeTabId(value)
    if (tabId == null || seen.has(tabId)) continue
    seen.add(tabId)
    result.push(tabId)
  }

  return result
}

function createNode(value) {
  const parentId = normalizeTabId(value && value.parentId)
  const childIds = normalizeUniqueIds(value && (value.childIds || value.children))
    .filter(childId => childId !== parentId)

  return {
    parentId,
    childIds,
    collapsed: !!(value && value.collapsed),
  }
}

function cloneTreeState(treeState) {
  const nodesById = {}
  for (const [tabId, node] of Object.entries((treeState && treeState.nodesById) || {})) {
    const normalizedTabId = normalizeTabId(tabId)
    if (normalizedTabId == null) continue
    nodesById[normalizedTabId] = createNode(node)
  }

  const explicitRootIds = normalizeUniqueIds(treeState && treeState.rootIds)
  const derivedRootIds = []

  for (const tabId of explicitRootIds) {
    if (nodesById[tabId]) derivedRootIds.push(tabId)
  }

  for (const [tabId, node] of Object.entries(nodesById)) {
    if (node.parentId == null && !derivedRootIds.includes(Number(tabId))) {
      derivedRootIds.push(Number(tabId))
    }
  }

  return {
    contextKey: treeState && treeState.contextKey ? treeState.contextKey : null,
    rootIds: derivedRootIds,
    nodesById,
  }
}

function createTreeStore() {
  let state = cloneTreeState(null)

  function getNode(tabId) {
    return state.nodesById[tabId] || null
  }

  function hasNode(tabId) {
    return !!getNode(tabId)
  }

  function setNode(tabId, node) {
    state.nodesById[tabId] = node
  }

  function deleteNode(tabId) {
    delete state.nodesById[tabId]
  }

  function removeRootId(tabId) {
    const previousLength = state.rootIds.length
    state.rootIds = state.rootIds.filter(rootId => rootId !== tabId)
    return state.rootIds.length !== previousLength
  }

  function insertRootId(tabId, index) {
    removeRootId(tabId)

    if (typeof index === 'number' && index >= 0 && index < state.rootIds.length) {
      state.rootIds.splice(index, 0, tabId)
    } else {
      state.rootIds.push(tabId)
    }
  }

  function removeFromParent(tabId) {
    const node = getNode(tabId)
    if (!node) return false

    if (node.parentId == null) {
      return removeRootId(tabId)
    }

    const parent = getNode(node.parentId)
    if (!parent) {
      node.parentId = null
      return false
    }

    const previousLength = parent.childIds.length
    parent.childIds = parent.childIds.filter(childId => childId !== tabId)
    node.parentId = null
    return parent.childIds.length !== previousLength
  }

  function insertChild(parentId, tabId, index) {
    const parent = getNode(parentId)
    const node = getNode(tabId)
    if (!parent || !node) return false

    parent.childIds = parent.childIds.filter(childId => childId !== tabId)

    if (typeof index === 'number' && index >= 0 && index < parent.childIds.length) {
      parent.childIds.splice(index, 0, tabId)
    } else {
      parent.childIds.push(tabId)
    }

    node.parentId = parentId
    return true
  }

  function isDescendant(parentId, tabId) {
    const visited = new Set()
    let currentId = normalizeTabId(parentId)

    while (currentId != null && !visited.has(currentId)) {
      if (currentId === tabId) return true
      visited.add(currentId)
      const current = getNode(currentId)
      currentId = current ? current.parentId : null
    }

    return false
  }

  function moveChildrenToParentOrRoot(tabId, parentId, childIds, insertionIndex) {
    if (parentId == null) {
      let offset = 0
      for (const childId of childIds) {
        const child = getNode(childId)
        if (!child) continue
        child.parentId = null
        insertRootId(childId, insertionIndex + offset)
        offset += 1
      }
      return
    }

    const parent = getNode(parentId)
    if (!parent) {
      for (const childId of childIds) {
        const child = getNode(childId)
        if (child) {
          child.parentId = null
          state.rootIds.push(childId)
        }
      }
      return
    }

    let offset = 0
    for (const childId of childIds) {
      const child = getNode(childId)
      if (!child) continue
      child.parentId = parentId
      parent.childIds.splice(insertionIndex + offset, 0, childId)
      offset += 1
    }
  }

  return {
    getState() {
      return cloneTreeState(state)
    },

    load(contextKey, treeState) {
      state = cloneTreeState({
        contextKey,
        rootIds: treeState && treeState.rootIds,
        nodesById: treeState && treeState.nodesById,
      })
    },

    reset(contextKey) {
      state = cloneTreeState({ contextKey, rootIds: [], nodesById: {} })
    },

    exportState() {
      return cloneTreeState(state)
    },

    getParentId(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      return node ? node.parentId : null
    },

    hasTab(tabId) {
      return hasNode(tabId)
    },

    ensureTab(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      if (normalizedTabId == null) return false
      if (hasNode(normalizedTabId)) return false
      setNode(normalizedTabId, createNode(null))
      state.rootIds.push(normalizedTabId)
      return true
    },

    removeTab(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      if (!node) return false

      const parentId = node.parentId
      const childIds = node.childIds.slice()

      let insertionIndex = 0
      if (parentId == null) {
        insertionIndex = state.rootIds.indexOf(normalizedTabId)
      } else {
        const parent = getNode(parentId)
        insertionIndex = parent ? parent.childIds.indexOf(normalizedTabId) : 0
      }
      if (insertionIndex < 0) insertionIndex = 0

      removeFromParent(normalizedTabId)
      moveChildrenToParentOrRoot(normalizedTabId, parentId, childIds, insertionIndex)

      deleteNode(normalizedTabId)
      return true
    },

    attachTab(tabId, parentId, index) {
      const normalizedTabId = normalizeTabId(tabId)
      const normalizedParentId = normalizeTabId(parentId)
      if (normalizedTabId == null) return false

      this.ensureTab(normalizedTabId)
      if (normalizedParentId == null || normalizedParentId === normalizedTabId) {
        return this.moveRoot(normalizedTabId, index)
      }

      this.ensureTab(normalizedParentId)
      if (isDescendant(normalizedParentId, normalizedTabId)) {
        return false
      }

      let insertionIndex = index
      const node = getNode(normalizedTabId)
      const parent = getNode(normalizedParentId)
      if (
        node
        && parent
        && node.parentId === normalizedParentId
        && typeof insertionIndex === 'number'
      ) {
        const previousIndex = parent.childIds.indexOf(normalizedTabId)
        if (previousIndex >= 0 && previousIndex < insertionIndex) {
          insertionIndex -= 1
        }
      }

      removeFromParent(normalizedTabId)
      return insertChild(normalizedParentId, normalizedTabId, insertionIndex)
    },

    attachBefore(tabId, targetId) {
      const normalizedTabId = normalizeTabId(tabId)
      const normalizedTargetId = normalizeTabId(targetId)
      if (normalizedTabId == null || normalizedTargetId == null || normalizedTabId === normalizedTargetId) return false

      const targetNode = getNode(normalizedTargetId)
      if (!targetNode) return false

      if (targetNode.parentId == null) {
        return this.moveRoot(normalizedTabId, state.rootIds.indexOf(normalizedTargetId))
      }

      const parent = getNode(targetNode.parentId)
      if (!parent) return false
      return this.attachTab(normalizedTabId, targetNode.parentId, parent.childIds.indexOf(normalizedTargetId))
    },

    attachAfter(tabId, targetId) {
      const normalizedTabId = normalizeTabId(tabId)
      const normalizedTargetId = normalizeTabId(targetId)
      if (normalizedTabId == null || normalizedTargetId == null || normalizedTabId === normalizedTargetId) return false

      const targetNode = getNode(normalizedTargetId)
      if (!targetNode) return false

      if (targetNode.parentId == null) {
        const targetIndex = state.rootIds.indexOf(normalizedTargetId)
        return this.moveRoot(normalizedTabId, targetIndex === -1 ? undefined : targetIndex + 1)
      }

      const parent = getNode(targetNode.parentId)
      if (!parent) return false
      const targetIndex = parent.childIds.indexOf(normalizedTargetId)
      return this.attachTab(normalizedTabId, targetNode.parentId, targetIndex === -1 ? undefined : targetIndex + 1)
    },

    detachTab(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      if (normalizedTabId == null) return false
      this.ensureTab(normalizedTabId)

      const node = getNode(normalizedTabId)
      if (!node || node.parentId == null) {
        if (!state.rootIds.includes(normalizedTabId)) {
          state.rootIds.push(normalizedTabId)
          return true
        }
        return false
      }

      removeFromParent(normalizedTabId)
      node.parentId = null
      state.rootIds.push(normalizedTabId)
      return true
    },

    moveRoot(tabId, index) {
      const normalizedTabId = normalizeTabId(tabId)
      if (normalizedTabId == null) return false
      this.ensureTab(normalizedTabId)
      let insertionIndex = index
      const node = getNode(normalizedTabId)
      if (node && node.parentId == null && typeof insertionIndex === 'number') {
        const previousIndex = state.rootIds.indexOf(normalizedTabId)
        if (previousIndex >= 0 && previousIndex < insertionIndex) {
          insertionIndex -= 1
        }
      }
      removeFromParent(normalizedTabId)
      const movedNode = getNode(normalizedTabId)
      if (movedNode) movedNode.parentId = null
      insertRootId(normalizedTabId, insertionIndex)
      return true
    },

    setCollapsed(tabId, collapsed) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      if (!node) return false
      const nextValue = !!collapsed
      if (node.collapsed === nextValue) return false
      node.collapsed = nextValue
      return true
    },

    toggleCollapsed(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      if (!node) return false
      node.collapsed = !node.collapsed
      return true
    },

    collapseAll() {
      let dirty = false

      for (const node of Object.values(state.nodesById)) {
        if (!node || !Array.isArray(node.childIds) || node.childIds.length === 0) continue
        if (node.collapsed) continue
        node.collapsed = true
        dirty = true
      }

      return dirty
    },

    expandAncestors(tabId) {
      let currentId = normalizeTabId(tabId)
      let dirty = false
      const visited = new Set()

      while (currentId != null && !visited.has(currentId)) {
        visited.add(currentId)
        const node = getNode(currentId)
        if (!node) break
        currentId = node.parentId
        if (currentId == null) break
        const parent = getNode(currentId)
        if (parent && parent.collapsed) {
          parent.collapsed = false
          dirty = true
        }
      }

      return dirty
    },

    repair(validTabIds) {
      const validSet = new Set(normalizeUniqueIds(validTabIds))
      let dirty = false

      for (const tabId of Object.keys(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null || !validSet.has(normalizedTabId)) {
          deleteNode(tabId)
          dirty = true
        }
      }

      state.rootIds = state.rootIds.filter(rootId => validSet.has(rootId) && !!getNode(rootId))

      for (const [tabId, node] of Object.entries(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null) continue

        const previousChildrenLength = node.childIds.length
        node.childIds = node.childIds.filter(childId => childId != null && validSet.has(childId) && childId !== normalizedTabId)
        if (node.childIds.length !== previousChildrenLength) dirty = true

        if (node.parentId != null && (!validSet.has(node.parentId) || !getNode(node.parentId))) {
          node.parentId = null
          dirty = true
        }
      }

      for (const [tabId, node] of Object.entries(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null) continue

        if (node.parentId == null) {
          if (!state.rootIds.includes(normalizedTabId)) {
            state.rootIds.push(normalizedTabId)
            dirty = true
          }
          continue
        }

        const parent = getNode(node.parentId)
        if (!parent) {
          node.parentId = null
          if (!state.rootIds.includes(normalizedTabId)) state.rootIds.push(normalizedTabId)
          dirty = true
          continue
        }

        if (!parent.childIds.includes(normalizedTabId)) {
          parent.childIds.push(normalizedTabId)
          dirty = true
        }
        removeRootId(normalizedTabId)
      }

      for (const [tabId, node] of Object.entries(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null) continue
        if (!isDescendant(node.parentId, normalizedTabId)) continue
        node.parentId = null
        if (!state.rootIds.includes(normalizedTabId)) state.rootIds.push(normalizedTabId)
        dirty = true
      }

      state.rootIds = normalizeUniqueIds(state.rootIds).filter(rootId => {
        const node = getNode(rootId)
        return !!node && node.parentId == null
      })

      return dirty
    },
  }
}

module.exports = { createTreeStore }

    },
    "store/tree-persistence.js": function(require, module, exports) {
const TREE_NAMESPACE_KEY = 'svbTree'
const TREE_VERSION = 1

function cloneTreeState(treeState) {
  const next = { rootIds: [], nodesById: {} }
  const nodesById = treeState && treeState.nodesById
  for (const [tabId, node] of Object.entries(nodesById || {})) {
    next.nodesById[tabId] = {
      parentId: node && node.parentId != null ? Number(node.parentId) : null,
      childIds: Array.isArray(node && (node.childIds || node.children))
        ? (node.childIds || node.children).map(Number).filter(Number.isFinite)
        : [],
      collapsed: !!(node && node.collapsed),
    }
  }
  next.rootIds = Array.isArray(treeState && treeState.rootIds)
    ? treeState.rootIds.map(Number).filter(Number.isFinite)
    : Object.entries(next.nodesById)
      .filter(([, node]) => node.parentId == null)
      .map(([tabId]) => Number(tabId))
  return next
}

function cloneVivExtData(value) {
  return value && typeof value === 'object'
    ? JSON.parse(JSON.stringify(value))
    : {}
}

function createNodeId() {
  return `svb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function normalizeOrder(value) {
  const order = Number(value)
  return Number.isFinite(order) ? order : 0
}

function getTreeRecord(tab) {
  const vivExtData = tab && tab.vivExtData && typeof tab.vivExtData === 'object'
    ? tab.vivExtData
    : null
  const record = vivExtData && vivExtData[TREE_NAMESPACE_KEY] && typeof vivExtData[TREE_NAMESPACE_KEY] === 'object'
    ? vivExtData[TREE_NAMESPACE_KEY]
    : null

  if (!record || typeof record.nodeId !== 'string' || !record.nodeId) return null

  return {
    version: Number(record.version) || TREE_VERSION,
    contextKey: typeof record.contextKey === 'string' ? record.contextKey : null,
    nodeId: record.nodeId,
    parentNodeId: typeof record.parentNodeId === 'string' && record.parentNodeId ? record.parentNodeId : null,
    collapsed: !!record.collapsed,
    order: normalizeOrder(record.order),
  }
}

function assignTreeOrders(treeState, tabs) {
  const safeTreeState = cloneTreeState(treeState)
  const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))
  const ordersByTabId = new Map()
  const rootIds = safeTreeState.rootIds.filter(rootId => tabsById.has(rootId))

  function walk(tabId, siblingIndex) {
    if (!tabsById.has(tabId)) return
    ordersByTabId.set(tabId, siblingIndex)
    const node = safeTreeState.nodesById[tabId]
    const childIds = Array.isArray(node && node.childIds) ? node.childIds : []
    let childIndex = 0
    for (const childId of childIds) {
      if (!tabsById.has(childId)) continue
      walk(childId, childIndex)
      childIndex += 1
    }
  }

  let rootIndex = 0
  for (const rootId of rootIds) {
    walk(rootId, rootIndex)
    rootIndex += 1
  }

  return ordersByTabId
}

function buildVivExtDataPayloads(contextKey, treeState, tabs) {
  const safeTreeState = cloneTreeState(treeState)
  const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))
  const ordersByTabId = assignTreeOrders(safeTreeState, tabs)
  const nodeIdByTabId = new Map()
  const tabIdByNodeId = new Map()

  for (const tab of tabsById.values()) {
    const record = getTreeRecord(tab)
    const nodeId = record && record.nodeId ? record.nodeId : createNodeId()
    if (!tabIdByNodeId.has(nodeId)) {
      nodeIdByTabId.set(tab.id, nodeId)
      tabIdByNodeId.set(nodeId, tab.id)
      continue
    }

    const uniqueNodeId = createNodeId()
    nodeIdByTabId.set(tab.id, uniqueNodeId)
    tabIdByNodeId.set(uniqueNodeId, tab.id)
  }

  const payloads = []

  for (const tab of tabsById.values()) {
    const node = safeTreeState.nodesById[tab.id] || { parentId: null, collapsed: false }
    const nextRecord = {
      version: TREE_VERSION,
      contextKey,
      nodeId: nodeIdByTabId.get(tab.id) || createNodeId(),
      parentNodeId: node.parentId != null ? (nodeIdByTabId.get(node.parentId) || null) : null,
      collapsed: !!node.collapsed,
      order: ordersByTabId.get(tab.id) || 0,
    }

    const currentRecord = getTreeRecord(tab)
    const changed = !currentRecord
      || currentRecord.contextKey !== nextRecord.contextKey
      || currentRecord.nodeId !== nextRecord.nodeId
      || currentRecord.parentNodeId !== nextRecord.parentNodeId
      || currentRecord.collapsed !== nextRecord.collapsed
      || currentRecord.order !== nextRecord.order

    const nextVivExtData = cloneVivExtData(tab.vivExtData)
    nextVivExtData[TREE_NAMESPACE_KEY] = nextRecord

    payloads.push({
      tabId: tab.id,
      changed,
      vivExtData: nextVivExtData,
    })
  }

  return payloads
}

function getDetachedContextRecords(tabs, records) {
  const contextualTabs = Array.isArray(tabs) ? tabs : []
  if (contextualTabs.length === 0 || !Array.isArray(records) || records.length === 0) return []

  const contextKeys = new Set(records.map(({ record }) => record.contextKey).filter(Boolean))
  if (contextKeys.size !== 1) return []

  const nodeIds = new Set()
  for (const { record } of records) {
    if (!record.nodeId || nodeIds.has(record.nodeId)) return []
    nodeIds.add(record.nodeId)
  }

  return records
}

function restoreFromVivExtData(contextKey, tabs) {
  const baseState = { rootIds: [], nodesById: {} }
  const contextualTabs = Array.isArray(tabs) ? tabs : []
  const allRecords = []
  const tabIdByNodeId = new Map()

  for (const tab of contextualTabs) {
    const record = getTreeRecord(tab)
    if (!record) continue
    allRecords.push({ tabId: tab.id, record })
  }

  const matchingRecords = allRecords.filter(({ record }) => record.contextKey === contextKey)
  const candidateRecords = matchingRecords.length > 0
    ? matchingRecords
    : getDetachedContextRecords(contextualTabs, allRecords)

  const records = []
  for (const { tabId, record } of candidateRecords) {
    if (tabIdByNodeId.has(record.nodeId)) continue
    tabIdByNodeId.set(record.nodeId, tabId)
    records.push({ tabId, record })
  }

  if (!records.length) return null

  for (const { tabId, record } of records) {
    baseState.nodesById[tabId] = {
      parentId: null,
      childIds: [],
      collapsed: !!record.collapsed,
    }
  }

  const childEntriesByParentId = new Map()
  const rootEntries = []

  for (const { tabId, record } of records) {
    const parentId = record.parentNodeId ? (tabIdByNodeId.get(record.parentNodeId) || null) : null
    if (parentId != null && baseState.nodesById[parentId]) {
      baseState.nodesById[tabId].parentId = parentId
      if (!childEntriesByParentId.has(parentId)) {
        childEntriesByParentId.set(parentId, [])
      }
      childEntriesByParentId.get(parentId).push({
        tabId,
        order: record.order,
        nativeIndex: normalizeOrder((contextualTabs.find(tab => tab.id === tabId) || {}).index),
      })
      continue
    }

    rootEntries.push({
      tabId,
      order: record.order,
      nativeIndex: normalizeOrder((contextualTabs.find(tab => tab.id === tabId) || {}).index),
    })
  }

  rootEntries.sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order
    return left.nativeIndex - right.nativeIndex
  })
  baseState.rootIds = rootEntries.map(entry => entry.tabId)

  for (const [parentId, entries] of childEntriesByParentId.entries()) {
    entries.sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order
      return left.nativeIndex - right.nativeIndex
    })
    baseState.nodesById[parentId].childIds = entries.map(entry => entry.tabId)
  }

  for (const tab of contextualTabs) {
    if (baseState.nodesById[tab.id]) continue
    baseState.nodesById[tab.id] = {
      parentId: null,
      childIds: [],
      collapsed: false,
    }
    baseState.rootIds.push(tab.id)
  }

  return baseState
}

function createTreePersistence(api) {
  return {
    makeContextKey(tabState) {
      if (tabState && tabState.outsideWorkspace) return 'workspace:outside'
      if (tabState && tabState.activeWorkspaceId != null) return `workspace:${tabState.activeWorkspaceId}`
      if (tabState && tabState.windowId != null) return `window:${tabState.windowId}`
      return 'window:unknown'
    },

    async loadTree(contextKey, tabs) {
      const vivExtDataTree = restoreFromVivExtData(contextKey, tabs)
      if (vivExtDataTree) {
        return cloneTreeState(vivExtDataTree)
      }

      return cloneTreeState(null)
    },

    async saveTree(contextKey, treeState, tabs) {
      if (!contextKey) return
      const payloads = buildVivExtDataPayloads(contextKey, treeState, tabs)
      if (api && typeof api.updateVivExtData === 'function') {
        for (const payload of payloads) {
          if (!payload.changed) continue
          await api.updateVivExtData(payload.tabId, payload.vivExtData).catch(error => {
            console.error('[svb] cannot update vivExtData', error)
          })
        }
      }
    },

    async deleteTree() {
      // Tree metadata is stored per-tab in vivExtData; deleting a whole context is not needed yet.
    },
  }
}

module.exports = { createTreePersistence }

    },
    "store/tree-selectors.js": function(require, module, exports) {
function getAncestorIds(tabId, treeState) {
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
  const ancestors = []
  const visited = new Set()
  let currentId = tabId

  while (currentId != null && !visited.has(currentId)) {
    visited.add(currentId)
    const node = nodesById[currentId]
    const parentId = node && node.parentId != null ? node.parentId : null
    if (parentId == null) break
    ancestors.push(parentId)
    currentId = parentId
  }

  return ancestors
}

function isDescendantOf(tabId, ancestorId, treeState) {
  return getAncestorIds(tabId, treeState).includes(ancestorId)
}

function getSubtreeIds(tabId, treeState) {
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
  const result = []

  function walk(currentId) {
    result.push(currentId)
    const node = nodesById[currentId]
    const childIds = Array.isArray(node && (node.childIds || node.children)) ? (node.childIds || node.children) : []
    for (const childId of childIds) {
      walk(childId)
    }
  }

  walk(tabId)
  return result
}

function buildOrderedStructure(options) {
  const { tabs, treeState } = options || {}
  const items = Array.isArray(tabs) ? tabs : []
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
  const preferredRootIds = Array.isArray(treeState && treeState.rootIds) ? treeState.rootIds : []
  const tabsById = new Map(items.map(tab => [tab.id, tab]))
  const childIdsByParent = new Map()
  const derivedRootIds = []

  for (const tab of items) {
    const node = nodesById[tab.id]
    const parentId = node && node.parentId != null && tabsById.has(node.parentId) ? node.parentId : null
    if (parentId == null) {
      derivedRootIds.push(tab.id)
      continue
    }

    if (!childIdsByParent.has(parentId)) {
      childIdsByParent.set(parentId, [])
    }
    childIdsByParent.get(parentId).push(tab.id)
  }

  const rootIds = []
  const knownRootIds = new Set()

  for (const rootId of preferredRootIds) {
    if (!derivedRootIds.includes(rootId) || knownRootIds.has(rootId)) continue
    rootIds.push(rootId)
    knownRootIds.add(rootId)
  }

  for (const rootId of derivedRootIds) {
    if (knownRootIds.has(rootId)) continue
    rootIds.push(rootId)
    knownRootIds.add(rootId)
  }

  for (const [parentId, childIds] of childIdsByParent.entries()) {
    const node = nodesById[parentId]
    const ordered = []
    const known = new Set()
    const preferredOrder = Array.isArray(node && (node.childIds || node.children)) ? (node.childIds || node.children) : []

    for (const childId of preferredOrder) {
      if (childIds.includes(childId) && !known.has(childId)) {
        ordered.push(childId)
        known.add(childId)
      }
    }

    for (const childId of childIds) {
      if (!known.has(childId)) {
        ordered.push(childId)
        known.add(childId)
      }
    }

    ordered.sort((leftId, rightId) => {
      const leftIndex = preferredOrder.indexOf(leftId)
      const rightIndex = preferredOrder.indexOf(rightId)
      if (leftIndex !== -1 || rightIndex !== -1) {
        if (leftIndex === -1) return 1
        if (rightIndex === -1) return -1
        return leftIndex - rightIndex
      }

      const leftTab = tabsById.get(leftId)
      const rightTab = tabsById.get(rightId)
      return (leftTab ? leftTab.index : 0) - (rightTab ? rightTab.index : 0)
    })

    childIdsByParent.set(parentId, ordered)
  }

  rootIds.sort((leftId, rightId) => {
    const leftPreferredIndex = preferredRootIds.indexOf(leftId)
    const rightPreferredIndex = preferredRootIds.indexOf(rightId)
    if (leftPreferredIndex !== -1 || rightPreferredIndex !== -1) {
      if (leftPreferredIndex === -1) return 1
      if (rightPreferredIndex === -1) return -1
      return leftPreferredIndex - rightPreferredIndex
    }

    const leftTab = tabsById.get(leftId)
    const rightTab = tabsById.get(rightId)
    return (leftTab ? leftTab.index : 0) - (rightTab ? rightTab.index : 0)
  })

  return {
    items,
    nodesById,
    tabsById,
    rootIds,
    childIdsByParent,
  }
}

function getFullTreeOrderIds(options) {
  const structure = buildOrderedStructure(options)
  const result = []

  function walk(tabId) {
    if (!structure.tabsById.has(tabId)) return
    result.push(tabId)
    const childIds = structure.childIdsByParent.get(tabId) || []
    for (const childId of childIds) {
      walk(childId)
    }
  }

  for (const rootId of structure.rootIds) {
    walk(rootId)
  }

  return result
}

function buildTreeView(options) {
  const structure = buildOrderedStructure(options)
  const { treeState } = options || {}
  const { nodesById, tabsById, rootIds, childIdsByParent } = structure

  const visibleTabs = []
  let visibleIndex = 0

  function walk(tabId, depth) {
    const tab = tabsById.get(tabId)
    if (!tab) return 0
    const node = nodesById[tabId] || { collapsed: false }
    const childIds = childIdsByParent.get(tabId) || []
    const item = {
      id: tab.id,
      tab,
      depth,
      visibleIndex,
      parentId: node.parentId != null ? node.parentId : null,
      hasChildren: childIds.length > 0,
      collapsed: !!node.collapsed,
      childCount: childIds.length,
      subtreeSize: getSubtreeIds(tab.id, treeState).length,
      ancestorIds: getAncestorIds(tab.id, treeState),
      visibleBranchSize: 1,
    }

    visibleTabs.push(item)
    visibleIndex += 1

    if (node.collapsed) return 1
    let visibleBranchSize = 1
    for (const childId of childIds) {
      visibleBranchSize += walk(childId, depth + 1)
    }
    item.visibleBranchSize = visibleBranchSize
    return visibleBranchSize
  }

  for (const rootId of rootIds) {
    walk(rootId, 0)
  }

  return {
    roots: rootIds.slice(),
    visibleTabs,
  }
}

module.exports = { buildTreeView, getAncestorIds, getSubtreeIds, isDescendantOf, getFullTreeOrderIds }

    },
    "adapters/tab-relations.js": function(require, module, exports) {
function resolveNewTabParent(options) {
  const { newTab, treeState, openerTabId, preferRoot } = options || {}
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}

  if (!newTab || newTab.pinned) return null
  if (preferRoot) return null

  if (Number.isFinite(openerTabId) && nodesById[openerTabId]) {
    return openerTabId
  }

  return null
}

module.exports = { resolveNewTabParent }

    },
    "adapters/internal-page-meta.js": function(require, module, exports) {
const START_PAGE_FAVICON_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#6fa8ff"/>' +
    '<path d="M12 7.25v9.5M7.25 12h9.5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>' +
    '</svg>'
  )

const SETTINGS_FAVICON_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path fill="#aeb6c2" d="M12 2.75a1 1 0 0 1 .98.8l.34 1.74a6.93 6.93 0 0 1 1.58.66l1.5-.95a1 1 0 0 1 1.24.13l1.5 1.5a1 1 0 0 1 .13 1.24l-.95 1.5c.28.5.5 1.03.66 1.58l1.74.34a1 1 0 0 1 .8.98v2.12a1 1 0 0 1-.8.98l-1.74.34a6.93 6.93 0 0 1-.66 1.58l.95 1.5a1 1 0 0 1-.13 1.24l-1.5 1.5a1 1 0 0 1-1.24.13l-1.5-.95a6.93 6.93 0 0 1-1.58.66l-.34 1.74a1 1 0 0 1-.98.8H10.9a1 1 0 0 1-.98-.8l-.34-1.74a6.93 6.93 0 0 1-1.58-.66l-1.5.95a1 1 0 0 1-1.24-.13l-1.5-1.5a1 1 0 0 1-.13-1.24l.95-1.5a6.93 6.93 0 0 1-.66-1.58l-1.74-.34a1 1 0 0 1-.8-.98v-2.12a1 1 0 0 1 .8-.98l1.74-.34c.16-.55.38-1.08.66-1.58l-.95-1.5a1 1 0 0 1 .13-1.24l1.5-1.5a1 1 0 0 1 1.24-.13l1.5.95c.5-.28 1.03-.5 1.58-.66l.34-1.74a1 1 0 0 1 .98-.8H12Zm-.04 5.1a4.15 4.15 0 1 0 0 8.3 4.15 4.15 0 0 0 0-8.3Zm0 1.9a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Z"/>' +
    '</svg>'
  )

function isStartPageUrl(url) {
  return typeof url === 'string' && url.startsWith('chrome://vivaldi-webui/startpage')
}

function isSettingsUrl(url) {
  if (typeof url !== 'string' || !url) return false

  return (
    url.startsWith('vivaldi://settings') ||
    url.startsWith('chrome://settings') ||
    url.includes('/components/settings/') ||
    url.includes('/settings.html') ||
    url.includes('/settings/settings') ||
    url.includes('settings.html')
  )
}

function getInternalPageTitle(url) {
  if (isStartPageUrl(url)) return 'Start Page'
  if (isSettingsUrl(url)) return 'Налаштування'
  return ''
}

function getInternalPageFaviconUrl(url) {
  if (isStartPageUrl(url)) return START_PAGE_FAVICON_DATA_URL
  if (isSettingsUrl(url)) return SETTINGS_FAVICON_DATA_URL
  return ''
}

module.exports = {
  getInternalPageFaviconUrl,
  getInternalPageTitle,
  isSettingsUrl,
  isStartPageUrl,
}

    },
    "controllers/tree-controller.js": function(require, module, exports) {
const { createTreeStore } = require('../store/tree-store.js')
const { createTreePersistence } = require('../store/tree-persistence.js')
const { buildTreeView, getAncestorIds, isDescendantOf, getSubtreeIds, getFullTreeOrderIds } = require('../store/tree-selectors.js')
const { resolveNewTabParent } = require('../adapters/tab-relations.js')
const { isStartPageUrl } = require('../adapters/internal-page-meta.js')

function createTreeController(api) {
  const treeStore = createTreeStore()
  const treePersistence = createTreePersistence(api)
  const pendingCreatedTabs = new Map()
  const expectedCreations = []
  let pendingRemovalDirty = false
  let cachedDerivedView = null
  let persistQueue = Promise.resolve()

  function invalidateDerivedView() {
    cachedDerivedView = null
  }

  function haveSameTabOrder(previousTabs, nextTabs) {
    const previous = Array.isArray(previousTabs) ? previousTabs : []
    const next = Array.isArray(nextTabs) ? nextTabs : []
    if (previous.length !== next.length) return false
    for (let index = 0; index < next.length; index += 1) {
      if (!previous[index] || previous[index].id !== next[index].id) return false
    }
    return true
  }

  function createDerivedViewCache(contextKey, tabs, treeTabs, fullTreeOrderIds, parentById) {
    return {
      contextKey,
      tabs,
      treeItems: treeTabs.map(item => ({
        id: item.id,
        depth: item.depth,
        visibleIndex: item.visibleIndex,
        parentId: item.parentId,
        hasChildren: item.hasChildren,
        collapsed: item.collapsed,
        childCount: item.childCount,
        subtreeSize: item.subtreeSize,
        ancestorIds: Array.isArray(item.ancestorIds) ? item.ancestorIds.slice() : [],
        visibleBranchSize: item.visibleBranchSize,
      })),
      fullTreeOrderIds: Array.isArray(fullTreeOrderIds) ? fullTreeOrderIds.slice() : [],
      parentById: { ...(parentById || {}) },
    }
  }

  function restoreDerivedViewFromCache(tabs) {
    if (!cachedDerivedView) return null
    if (!haveSameTabOrder(cachedDerivedView.tabs, tabs)) return null

    const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))
    const treeTabs = []
    for (const item of cachedDerivedView.treeItems) {
      const tab = tabsById.get(item.id)
      if (!tab) return null
      treeTabs.push({
        ...item,
        ancestorIds: Array.isArray(item.ancestorIds) ? item.ancestorIds.slice() : [],
        tab,
      })
    }

    return {
      treeTabs,
      fullTreeOrderIds: cachedDerivedView.fullTreeOrderIds.slice(),
      parentById: { ...cachedDerivedView.parentById },
    }
  }

  async function ensureContext(contextKey, tabs, currentContextKey) {
    const currentTreeState = treeStore.getState()
    if (currentTreeState.contextKey === contextKey && currentContextKey === contextKey) {
      return false
    }

    const persistedTree = await treePersistence.loadTree(contextKey, tabs)
    treeStore.load(contextKey, persistedTree)
    invalidateDerivedView()
    return true
  }

  async function persistCurrentTree(tabs) {
    const currentTreeState = treeStore.getState()
    if (!currentTreeState.contextKey) return
    const contextKey = currentTreeState.contextKey
    const treeSnapshot = treeStore.exportState()
    const tabSnapshot = Array.isArray(tabs) ? tabs.slice() : []

    persistQueue = persistQueue
      .catch(() => {})
      .then(() => treePersistence.saveTree(contextKey, treeSnapshot, tabSnapshot))
      .catch(error => {
        console.error('[svb] cannot persist tree', error)
      })

    return persistQueue
  }

  function normalizeTopLevelMoveIds(tabIds) {
    const treeState = treeStore.exportState()
    const normalizedIds = []

    for (const value of Array.isArray(tabIds) ? tabIds : []) {
      const tabId = Number(value)
      if (!Number.isFinite(tabId) || !treeStore.hasTab(tabId) || normalizedIds.includes(tabId)) continue

      const hasSelectedAncestor = normalizedIds.some(selectedId => isDescendantOf(tabId, selectedId, treeState))
      if (hasSelectedAncestor) continue
      normalizedIds.push(tabId)
    }

    return normalizedIds
  }

  return {
    makeContextKey(tabState) {
      return treePersistence.makeContextKey(tabState)
    },

    async persistTree(tabs) {
      await persistCurrentTree(tabs)
    },

    registerExpectedCreation(intent) {
      const creation = intent && typeof intent === 'object' ? { ...intent } : {}
      expectedCreations.push({
        kind: creation.kind === 'child'
          ? 'child'
          : creation.kind === 'sibling'
            ? 'sibling'
            : 'root',
        parentTabId: Number.isFinite(creation.parentTabId) ? creation.parentTabId : null,
        createdAt: Date.now(),
      })
    },

    capturePendingCreation(tab, sourceActiveTabId, meta = {}) {
      if (!tab || tab.pinned) return
      while (expectedCreations.length > 0 && Date.now() - expectedCreations[0].createdAt > 5000) {
        expectedCreations.shift()
      }

      const expectedCreation = expectedCreations.length > 0
        ? expectedCreations.shift()
        : null

      pendingCreatedTabs.set(tab.id, {
        openerTabId: tab.openerTabId,
        sourceActiveTabId,
        expectedCreation,
        fromPinnedTab: !(expectedCreation && expectedCreation.kind === 'root') && !!(meta && meta.fromPinnedTab),
      })
    },

    handleRemovedTab(tabId) {
      pendingCreatedTabs.delete(tabId)
      pendingRemovalDirty = treeStore.removeTab(tabId) || pendingRemovalDirty
      if (pendingRemovalDirty) {
        invalidateDerivedView()
      }
    },

    clearStalePendingCreations(allTabs) {
      const currentTabIds = new Set(allTabs.map(tab => tab.id))
      for (const tabId of pendingCreatedTabs.keys()) {
        if (!currentTabIds.has(tabId)) {
          pendingCreatedTabs.delete(tabId)
        }
      }
      while (expectedCreations.length > 0 && Date.now() - expectedCreations[0].createdAt > 5000) {
        expectedCreations.shift()
      }
    },

    getCreateChildIndex(parentTabId, tabs) {
      if (!treeStore.hasTab(parentTabId)) return null

      const items = Array.isArray(tabs) ? tabs : []
      const tabsById = new Map(items.map(tab => [tab.id, tab]))
      const treeState = treeStore.exportState()
      const subtreeIds = getSubtreeIds(parentTabId, treeState)

      let maxIndex = null
      for (const tabId of subtreeIds) {
        const tab = tabsById.get(tabId)
        if (!tab || !Number.isFinite(tab.index)) continue
        maxIndex = maxIndex == null ? tab.index : Math.max(maxIndex, tab.index)
      }

      if (maxIndex == null) {
        const parentTab = tabsById.get(parentTabId)
        return parentTab && Number.isFinite(parentTab.index) ? parentTab.index + 1 : null
      }

      return maxIndex + 1
    },

    getCreateSiblingIndex(tabId, tabs) {
      if (!treeStore.hasTab(tabId)) return null

      const items = Array.isArray(tabs) ? tabs : []
      const tabsById = new Map(items.map(tab => [tab.id, tab]))
      const treeState = treeStore.exportState()
      const subtreeIds = getSubtreeIds(tabId, treeState)

      let maxIndex = null
      for (const subtreeId of subtreeIds) {
        const tab = tabsById.get(subtreeId)
        if (!tab || !Number.isFinite(tab.index)) continue
        maxIndex = maxIndex == null ? tab.index : Math.max(maxIndex, tab.index)
      }

      if (maxIndex == null) {
        const currentTab = tabsById.get(tabId)
        return currentTab && Number.isFinite(currentTab.index) ? currentTab.index + 1 : null
      }

      return maxIndex + 1
    },

    getCloseTargetIds(tabId) {
      if (!treeStore.hasTab(tabId)) return []
      const treeState = treeStore.exportState()
      const node = treeState.nodesById && treeState.nodesById[tabId] ? treeState.nodesById[tabId] : null
      if (!node) return []

      if (node.collapsed) {
        return getSubtreeIds(tabId, treeState)
      }

      return [tabId]
    },

    getSubtreeTargetIds(tabIds) {
      const moveIds = normalizeTopLevelMoveIds(Array.isArray(tabIds) ? tabIds : [tabIds])
      if (moveIds.length === 0) return []

      const treeState = treeStore.exportState()
      const result = []
      const seen = new Set()

      for (const tabId of moveIds) {
        for (const subtreeId of getSubtreeIds(tabId, treeState)) {
          if (seen.has(subtreeId)) continue
          seen.add(subtreeId)
          result.push(subtreeId)
        }
      }

      return result
    },

    getWorkspaceMoveRecords(tabIds) {
      const moveIds = normalizeTopLevelMoveIds(Array.isArray(tabIds) ? tabIds : [tabIds])
      if (moveIds.length === 0) return []

      const treeState = treeStore.exportState()
      const records = []

      function walk(tabId, parentId, siblingIndex) {
        const node = treeState.nodesById && treeState.nodesById[tabId] ? treeState.nodesById[tabId] : null
        if (!node) return

        records.push({
          tabId,
          parentId: Number.isFinite(parentId) ? parentId : null,
          siblingIndex,
          rootIndex: parentId == null ? siblingIndex : null,
        })

        const childIds = Array.isArray(node.childIds) ? node.childIds : []
        childIds.forEach((childId, childIndex) => walk(childId, tabId, childIndex))
      }

      moveIds.forEach((tabId, rootIndex) => walk(tabId, null, rootIndex))
      return records
    },

    getBookmarkTree(tabId, tabs) {
      if (!treeStore.hasTab(tabId)) return null
      const treeState = treeStore.exportState()
      const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))

      function buildNode(currentId) {
        const tab = tabsById.get(currentId)
        if (!tab || !tab.url) return null
        const node = treeState.nodesById && treeState.nodesById[currentId] ? treeState.nodesById[currentId] : null
        const childIds = Array.isArray(node && node.childIds) ? node.childIds : []
        return {
          title: tab.title || tab.url,
          url: tab.url,
          collapsed: !!(node && node.collapsed),
          children: childIds.map(buildNode).filter(Boolean),
        }
      }

      return buildNode(tabId)
    },

    restoreBookmarkTree(nodes, tabs) {
      const items = Array.isArray(nodes) ? nodes : []
      if (items.length === 0) return false

      let changed = false
      for (const item of items) {
        if (!item || !Number.isFinite(item.tabId)) continue
        changed = treeStore.ensureTab(item.tabId) || changed
      }

      for (const item of items) {
        if (!item || !Number.isFinite(item.tabId)) continue
        const parentId = Number.isFinite(item.parentId) ? item.parentId : null
        if (parentId == null) {
          changed = treeStore.moveRoot(item.tabId) || changed
        } else {
          changed = treeStore.attachTab(item.tabId, parentId) || changed
        }
        if (item.collapsed) {
          changed = treeStore.setCollapsed(item.tabId, true) || changed
        }
      }

      if (changed) {
        invalidateDerivedView()
        persistCurrentTree(tabs)
      }
      return changed
    },

    async sync(options) {
      const {
        tabs,
        contextKey,
        currentContextKey,
        activeRegularTabId,
        sourceActiveTabId,
      } = options

      const contextChanged = await ensureContext(contextKey, tabs, currentContextKey)
      let persistenceDirty = false
      let structuralDirty = false

      if (pendingRemovalDirty) {
        persistenceDirty = true
        structuralDirty = true
        pendingRemovalDirty = false
      }

      if (treeStore.repair(tabs.map(tab => tab.id))) {
        persistenceDirty = true
        structuralDirty = true
      }

      const tabsById = new Map(tabs.map(tab => [tab.id, tab]))
      for (const tab of tabs) {
        if (treeStore.hasTab(tab.id)) continue

        treeStore.ensureTab(tab.id)
        persistenceDirty = true
        structuralDirty = true

        const pendingCreation = pendingCreatedTabs.get(tab.id) || null
        if (!pendingCreation) continue

        const expectedCreation = pendingCreation.expectedCreation || null
        let parentId = null

        if (expectedCreation && expectedCreation.kind === 'child' && Number.isFinite(expectedCreation.parentTabId)) {
          parentId = expectedCreation.parentTabId
        } else if (expectedCreation && expectedCreation.kind === 'sibling' && Number.isFinite(expectedCreation.parentTabId)) {
          const siblingAnchorId = expectedCreation.parentTabId
          const siblingParentId = treeStore.getParentId(siblingAnchorId)
          if (Number.isFinite(siblingParentId)) {
            const attached = treeStore.attachAfter(tab.id, siblingAnchorId)
            persistenceDirty = attached || persistenceDirty
            structuralDirty = attached || structuralDirty
          } else {
            const currentTreeState = treeStore.exportState()
            const rootIds = Array.isArray(currentTreeState.rootIds) ? currentTreeState.rootIds : []
            const rootIndex = rootIds.indexOf(siblingAnchorId)
            const moved = treeStore.moveRoot(tab.id, rootIndex === -1 ? undefined : rootIndex + 1)
            persistenceDirty = moved || persistenceDirty
            structuralDirty = moved || structuralDirty
          }
        } else if (expectedCreation && expectedCreation.kind === 'root') {
          treeStore.moveRoot(tab.id)
          persistenceDirty = true
          structuralDirty = true
        } else if (pendingCreation.fromPinnedTab) {
          treeStore.moveRoot(tab.id, 0)
          persistenceDirty = true
          structuralDirty = true
        } else if (!(expectedCreation && expectedCreation.kind === 'root')) {
          const currentTreeState = treeStore.exportState()
          const looksLikeRootStartPage = isStartPageUrl(tab.url || '')
          parentId = resolveNewTabParent({
            newTab: tab,
            activeTab: tabsById.get(pendingCreation.sourceActiveTabId || sourceActiveTabId) || null,
            treeState: currentTreeState,
            openerTabId: pendingCreation.openerTabId != null ? pendingCreation.openerTabId : tab.openerTabId,
            preferRoot: looksLikeRootStartPage,
          })
        }

        if (parentId != null) {
          const attached = treeStore.attachTab(tab.id, parentId)
          persistenceDirty = attached || persistenceDirty
          structuralDirty = attached || structuralDirty
        }

        pendingCreatedTabs.delete(tab.id)
      }

      if (activeRegularTabId != null) {
        persistenceDirty = treeStore.expandAncestors(activeRegularTabId) || persistenceDirty
      }

      if (!contextChanged && !persistenceDirty && !structuralDirty && cachedDerivedView && cachedDerivedView.contextKey === contextKey) {
        const restored = restoreDerivedViewFromCache(tabs)
        if (restored) {
          return {
            treeTabs: restored.treeTabs,
            treeContextKey: contextKey,
            fullTreeOrderIds: restored.fullTreeOrderIds,
            parentById: restored.parentById,
            structuralDirty: false,
          }
        }
      }

      const treeState = treeStore.exportState()
      const treeTabs = buildTreeView({
        tabs,
        treeState,
      }).visibleTabs
      const fullTreeOrderIds = getFullTreeOrderIds({
        tabs,
        treeState,
      })
      const parentById = {}
      const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
      for (const tabId of fullTreeOrderIds) {
        const node = nodesById[tabId]
        if (node && Number.isFinite(node.parentId)) {
          parentById[tabId] = node.parentId
        }
      }

      if (contextChanged || persistenceDirty) {
        persistCurrentTree(tabs)
      }

      cachedDerivedView = createDerivedViewCache(contextKey, tabs, treeTabs, fullTreeOrderIds, parentById)

      return {
        treeTabs,
        treeContextKey: contextKey,
        fullTreeOrderIds,
        parentById,
        structuralDirty,
      }
    },

    async toggleCollapsed(tabId, activeTabId, tabs) {
      const treeState = treeStore.exportState()
      const node = treeState.nodesById && treeState.nodesById[tabId] ? treeState.nodesById[tabId] : null
      const willCollapse = !!(node && !node.collapsed)
      const shouldActivateParent = willCollapse
        && Number.isFinite(activeTabId)
        && activeTabId !== tabId
        && isDescendantOf(activeTabId, tabId, treeState)

      if (!treeStore.toggleCollapsed(tabId)) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return {
        activateTabId: shouldActivateParent ? tabId : null,
      }
    },

    async collapseAll(activeTabId, tabs) {
      const treeState = treeStore.exportState()
      let activateTabId = null

      if (Number.isFinite(activeTabId)) {
        const ancestors = getAncestorIds(activeTabId, treeState)
        const collapsibleAncestors = ancestors.filter(id => {
          const node = treeState.nodesById && treeState.nodesById[id] ? treeState.nodesById[id] : null
          return !!(node && Array.isArray(node.childIds) && node.childIds.length > 0)
        })
        activateTabId = collapsibleAncestors.length ? collapsibleAncestors[collapsibleAncestors.length - 1] : null
      }

      if (!treeStore.collapseAll()) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return { activateTabId }
    },

    async moveTab(tabId, targetId, position, tabs) {
      if (!['before', 'inside', 'after'].includes(position)) return false
      if (!treeStore.hasTab(tabId) || !treeStore.hasTab(targetId)) return false
      if (tabId === targetId) return false

      const treeState = treeStore.exportState()
      if (isDescendantOf(targetId, tabId, treeState)) {
        return false
      }

      let changed = false
      if (position === 'before') {
        changed = treeStore.attachBefore(tabId, targetId)
      } else if (position === 'after') {
        changed = treeStore.attachAfter(tabId, targetId)
      } else {
        changed = treeStore.attachTab(tabId, targetId)
        if (changed) {
          treeStore.setCollapsed(targetId, false)
        }
      }

      if (!changed) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return {
        parentId: treeStore.getParentId(tabId),
      }
    },

    async moveTabs(tabIds, targetId, position, tabs) {
      if (!['before', 'inside', 'after'].includes(position)) return false

      const moveIds = normalizeTopLevelMoveIds(tabIds)
      if (moveIds.length === 0) return false
      if (!treeStore.hasTab(targetId)) return false
      if (moveIds.includes(targetId)) return false

      const treeState = treeStore.exportState()
      for (const tabId of moveIds) {
        if (isDescendantOf(targetId, tabId, treeState)) {
          return false
        }
      }

      const orderedMoveIds = position === 'after'
        ? moveIds.slice().reverse()
        : moveIds.slice()

      let changed = false
      for (const tabId of orderedMoveIds) {
        if (position === 'before') {
          changed = treeStore.attachBefore(tabId, targetId) || changed
          continue
        }

        if (position === 'after') {
          changed = treeStore.attachAfter(tabId, targetId) || changed
          continue
        }

        changed = treeStore.attachTab(tabId, targetId) || changed
      }

      if (position === 'inside' && changed) {
        treeStore.setCollapsed(targetId, false)
      }

      if (!changed) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return {
        movedIds: moveIds,
        parentId: position === 'inside' ? targetId : treeStore.getParentId(moveIds[0]),
      }
    },
  }
}

module.exports = { createTreeController }

    },
    "controllers/native-reconcile.js": function(require, module, exports) {
function createNativeReconcile(api) {
  let snapshot = null
  let timerIds = new Set()
  let actionToken = 0
  let ownOpenerUpdates = new Map()
  let ownMoveTabIds = new Set()

  function clearOwnOpenerUpdate(tabId) {
    if (!ownOpenerUpdates.has(tabId)) return
    setTimeout(() => {
      ownOpenerUpdates.delete(tabId)
    }, 2500)
  }

  function updateSnapshot(nextSnapshot) {
    snapshot = nextSnapshot && typeof nextSnapshot === 'object'
      ? {
        contextKey: nextSnapshot.contextKey || null,
        tabs: Array.isArray(nextSnapshot.tabs) ? nextSnapshot.tabs.slice() : [],
        fullTreeOrderIds: Array.isArray(nextSnapshot.fullTreeOrderIds) ? nextSnapshot.fullTreeOrderIds.slice() : [],
        parentById: nextSnapshot.parentById && typeof nextSnapshot.parentById === 'object'
          ? { ...nextSnapshot.parentById }
          : {},
      }
      : null
  }

  function computeOpenerFixes(currentSnapshot) {
    const tabs = Array.isArray(currentSnapshot && currentSnapshot.tabs) ? currentSnapshot.tabs : []
    const parentById = currentSnapshot && currentSnapshot.parentById ? currentSnapshot.parentById : {}
    const fixes = []

    for (const tab of tabs) {
      if (!tab || tab.pinned) continue

      const desiredParentId = Number.isFinite(parentById[tab.id]) ? parentById[tab.id] : null
      if (!Number.isFinite(desiredParentId)) continue
      if (tab.openerTabId === desiredParentId) continue

      fixes.push({
        tabId: tab.id,
        openerTabId: desiredParentId,
      })
    }

    return fixes
  }

  function computeDesiredNativeOrder(currentSnapshot) {
    const tabs = Array.isArray(currentSnapshot && currentSnapshot.tabs) ? currentSnapshot.tabs : []
    const byId = new Map(tabs.map(tab => [tab.id, tab]))
    const order = []

    for (const tabId of Array.isArray(currentSnapshot && currentSnapshot.fullTreeOrderIds)
      ? currentSnapshot.fullTreeOrderIds
      : []) {
      const tab = byId.get(tabId)
      if (!tab || tab.pinned) continue
      order.push(tab.id)
    }

    return order
  }

  function getCurrentNativeOrder(currentSnapshot) {
    return (Array.isArray(currentSnapshot && currentSnapshot.tabs) ? currentSnapshot.tabs : [])
      .filter(tab => tab && !tab.pinned && Number.isFinite(tab.index))
      .slice()
      .sort((a, b) => a.index - b.index)
  }

  function computeOrderMoves(currentSnapshot) {
    const currentTabs = getCurrentNativeOrder(currentSnapshot)
    const currentIds = currentTabs.map(tab => tab.id)
    const desiredIds = computeDesiredNativeOrder(currentSnapshot)
      .filter(tabId => currentIds.includes(tabId))

    if (currentIds.length < 2 || desiredIds.length < 2) return []
    if (currentIds.length !== desiredIds.length) return []
    if (currentIds.every((tabId, index) => tabId === desiredIds[index])) return []

    const slots = currentTabs.map(tab => tab.index)
    return desiredIds.map((tabId, index) => ({
      tabId,
      index: slots[index],
    }))
  }

  function markOwnMove(tabId) {
    if (!Number.isFinite(tabId)) return
    ownMoveTabIds.add(tabId)
    setTimeout(() => {
      ownMoveTabIds.delete(tabId)
    }, 4000)
  }

  async function applyOrderMoves(reason, currentSnapshot) {
    if (!api || typeof api.moveTab !== 'function') return []

    const moves = computeOrderMoves(currentSnapshot)
    for (const move of moves) {
      markOwnMove(move.tabId)
      try {
        await api.moveTab(move.tabId, move.index)
      } catch (error) {
        console.error('[svb] native reconcile move failed', reason, error)
      }
    }

    return moves
  }

  async function run(reason, token) {
    if (!snapshot || token !== actionToken) return
    if (!api || typeof api.setOpenerTab !== 'function') return

    const openerFixes = computeOpenerFixes(snapshot)
    for (const fix of openerFixes) {
      ownOpenerUpdates.set(fix.tabId, fix.openerTabId)
      try {
        api.setOpenerTab(fix.tabId, fix.openerTabId)
      } catch (error) {
        console.error('[svb] native reconcile opener failed', reason, error)
      }
      clearOwnOpenerUpdate(fix.tabId)
    }

    const orderMoves = await applyOrderMoves(reason, snapshot)

    return {
      openerFixes,
      orderMoves,
    }
  }

  function clearTimers() {
    for (const timerId of timerIds) {
      clearTimeout(timerId)
    }
    timerIds.clear()
  }

  function schedule(reason, delays = [180]) {
    actionToken += 1
    const token = actionToken
    clearTimers()

    const safeDelays = Array.isArray(delays) && delays.length ? delays : [180]
    for (const delay of safeDelays) {
      const timerId = setTimeout(() => {
        timerIds.delete(timerId)
        run(reason, token).catch(error => {
          console.error('[svb] native reconcile failed', reason, error)
        })
      }, Math.max(0, delay))
      timerIds.add(timerId)
    }
  }

  return {
    updateSnapshot,

    scheduleStartup() {
      schedule('startup', [1200])
    },

    scheduleAfterAction(reason) {
      schedule(reason || 'action', [350, 1000, 1800])
    },

    isOwnOpenerUpdate(tabId, changeInfo) {
      if (!ownOpenerUpdates.has(tabId)) return false
      const info = changeInfo && typeof changeInfo === 'object' ? changeInfo : {}
      const openerChanged = Object.prototype.hasOwnProperty.call(info, 'openerTabId')
      if (!openerChanged) return false

      const expectedOpenerId = ownOpenerUpdates.get(tabId)
      if (info.openerTabId === expectedOpenerId) {
        ownOpenerUpdates.delete(tabId)
        return true
      }

      return false
    },

    isOwnMove(tabId) {
      if (!ownMoveTabIds.has(tabId)) return false
      ownMoveTabIds.delete(tabId)
      return true
    },
  }
}

module.exports = { createNativeReconcile }

    },
    "store/tab-store.js": function(require, module, exports) {
const { createTreeController } = require('../controllers/tree-controller.js')
const { createNativeReconcile } = require('../controllers/native-reconcile.js')

const TREE_NAMESPACE_KEY = 'svbTree'

function createTreeNodeId() {
  return `svb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function createInitialState() {
  return {
    ready: false,
    windowId: null,
    activeTabId: null,
    activeWorkspaceId: null,
    filteredByWorkspace: false,
    outsideWorkspace: false,
    canCloseVisibleTabs: true,
    pinnedTabs: [],
    tabs: [],
    treeTabs: [],
    treeContextKey: null,
    workspaces: [],
    savedBookmarkTrees: [],
  }
}

function sortTabs(tabs) {
  return tabs.slice().sort((a, b) => a.index - b.index)
}

function getTilingId(tab) {
  return tab && tab.vivExtData && tab.vivExtData.tiling && tab.vivExtData.tiling.id
    ? String(tab.vivExtData.tiling.id)
    : ''
}

function getTabColorKey(tab) {
  return tab && tab.vivExtData && typeof tab.vivExtData.tabColor === 'string'
    ? tab.vivExtData.tabColor
    : ''
}

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item)).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

function getVivExtDataSignature(tab) {
  const vivExtData = tab && tab.vivExtData && typeof tab.vivExtData === 'object'
    ? tab.vivExtData
    : null
  return vivExtData ? stableSerialize(vivExtData) : ''
}

function areTabsEquivalent(previousTabs, nextTabs) {
  const previous = Array.isArray(previousTabs) ? previousTabs : []
  const next = Array.isArray(nextTabs) ? nextTabs : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (left.id !== right.id) return false
    if (left.index !== right.index) return false
    if (!!left.active !== !!right.active) return false
    if (!!left.pinned !== !!right.pinned) return false
    if (!!left.hidden !== !!right.hidden) return false
    if (left.workspaceId !== right.workspaceId) return false
    if (left.title !== right.title) return false
    if (left.url !== right.url) return false
    if (left.favIconUrl !== right.favIconUrl) return false
    if (!!left.loading !== !!right.loading) return false
    if (!!left.muted !== !!right.muted) return false
    if (!!left.audible !== !!right.audible) return false
    if (!!left.discarded !== !!right.discarded) return false
    if (getTilingId(left) !== getTilingId(right)) return false
    if (getTabColorKey(left) !== getTabColorKey(right)) return false
    if (getVivExtDataSignature(left) !== getVivExtDataSignature(right)) return false
  }

  return true
}

function areAncestorListsEqual(previousAncestors, nextAncestors) {
  const previous = Array.isArray(previousAncestors) ? previousAncestors : []
  const next = Array.isArray(nextAncestors) ? nextAncestors : []
  if (previous.length !== next.length) return false
  for (let index = 0; index < next.length; index += 1) {
    if (previous[index] !== next[index]) return false
  }
  return true
}

function areTreeTabsEquivalent(previousTreeTabs, nextTreeTabs) {
  const previous = Array.isArray(previousTreeTabs) ? previousTreeTabs : []
  const next = Array.isArray(nextTreeTabs) ? nextTreeTabs : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (left.id !== right.id) return false
    if (left.depth !== right.depth) return false
    if (left.visibleIndex !== right.visibleIndex) return false
    if ((left.parentId ?? null) !== (right.parentId ?? null)) return false
    if (!!left.hasChildren !== !!right.hasChildren) return false
    if (!!left.collapsed !== !!right.collapsed) return false
    if ((left.childCount || 0) !== (right.childCount || 0)) return false
    if ((left.subtreeSize || 1) !== (right.subtreeSize || 1)) return false
    if ((left.visibleBranchSize || 1) !== (right.visibleBranchSize || 1)) return false
    if (!areAncestorListsEqual(left.ancestorIds, right.ancestorIds)) return false
    if (!areTabsEquivalent([left.tab], [right.tab])) return false
  }

  return true
}

function areWorkspacesEquivalent(previousWorkspaces, nextWorkspaces) {
  const previous = Array.isArray(previousWorkspaces) ? previousWorkspaces : []
  const next = Array.isArray(nextWorkspaces) ? nextWorkspaces : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (Number(left.id) !== Number(right.id)) return false
    if (String(left.name || '') !== String(right.name || '')) return false
    if (String(left.icon || '') !== String(right.icon || '')) return false
  }

  return true
}

function areSavedBookmarkTreesEquivalent(previousTrees, nextTrees) {
  const previous = Array.isArray(previousTrees) ? previousTrees : []
  const next = Array.isArray(nextTrees) ? nextTrees : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (String(left.id) !== String(right.id)) return false
    if (String(left.title || '') !== String(right.title || '')) return false
  }

  return true
}

function stabilizeTabsByPanelOrder(tabs, treeTabs) {
  const items = Array.isArray(tabs) ? tabs.slice() : []
  const previousOrder = new Map(
    (Array.isArray(treeTabs) ? treeTabs : []).map((item, index) => [item.id, index])
  )

  return items.sort((left, right) => {
    const leftOrder = previousOrder.has(left.id) ? previousOrder.get(left.id) : null
    const rightOrder = previousOrder.has(right.id) ? previousOrder.get(right.id) : null

    if (leftOrder != null || rightOrder != null) {
      if (leftOrder == null) return 1
      if (rightOrder == null) return -1
      if (leftOrder !== rightOrder) return leftOrder - rightOrder
    }

    return left.index - right.index
  })
}

function reuseEquivalentStateSlices(currentState, patch) {
  const nextPatch = { ...patch }

  if ('pinnedTabs' in nextPatch && areTabsEquivalent(currentState.pinnedTabs, nextPatch.pinnedTabs)) {
    nextPatch.pinnedTabs = currentState.pinnedTabs
  }

  if ('tabs' in nextPatch && areTabsEquivalent(currentState.tabs, nextPatch.tabs)) {
    nextPatch.tabs = currentState.tabs
  }

  if ('treeTabs' in nextPatch && areTreeTabsEquivalent(currentState.treeTabs, nextPatch.treeTabs)) {
    nextPatch.treeTabs = currentState.treeTabs
  }

  if ('workspaces' in nextPatch && areWorkspacesEquivalent(currentState.workspaces, nextPatch.workspaces)) {
    nextPatch.workspaces = currentState.workspaces
  }

  if ('savedBookmarkTrees' in nextPatch && areSavedBookmarkTreesEquivalent(currentState.savedBookmarkTrees, nextPatch.savedBookmarkTrees)) {
    nextPatch.savedBookmarkTrees = currentState.savedBookmarkTrees
  }

  return nextPatch
}

function tabHasWorkspace(tab) {
  return tab && tab.workspaceId != null
}

function deriveContextFromActiveTab(allTabs) {
  const activeTab = allTabs.find(tab => tab.active) || null
  const hasWorkspaceTabs = allTabs.some(tab => tab.workspaceId != null)
  const visibleTabs = allTabs.filter(tab => !tab.hidden)

  if (visibleTabs.length > 0 && hasWorkspaceTabs) {
    const visibleWorkspaceIds = Array.from(new Set(
      visibleTabs.map(tab => (tabHasWorkspace(tab) ? tab.workspaceId : null))
    ))

    if (visibleWorkspaceIds.length === 1) {
      const visibleWorkspaceId = visibleWorkspaceIds[0]
      const visibleActiveTab = visibleTabs.find(tab => tab.active) || visibleTabs[0] || activeTab

      return {
        activeTab: visibleActiveTab || null,
        activeWorkspaceId: visibleWorkspaceId,
        outsideWorkspace: visibleWorkspaceId == null,
        filteredByWorkspace: true,
        visibleTabs,
      }
    }
  }

  const activeWorkspaceId = activeTab && tabHasWorkspace(activeTab) ? activeTab.workspaceId : null
  const outsideWorkspace = activeWorkspaceId == null && hasWorkspaceTabs

  return {
    activeTab,
    activeWorkspaceId,
    outsideWorkspace,
    filteredByWorkspace: activeWorkspaceId != null || outsideWorkspace,
    visibleTabs: null,
  }
}

function getVisibleTabsForContext(allTabs, context) {
  if (context.outsideWorkspace) {
    return allTabs.filter(tab => tab.workspaceId == null)
  }

  if (context.activeWorkspaceId == null) {
    return allTabs
  }

  return allTabs.filter(tab => tab.workspaceId === context.activeWorkspaceId)
}

function isTabInContext(tab, context) {
  if (!tab) return false

  if (context.outsideWorkspace) {
    return tab.workspaceId == null
  }

  if (context.activeWorkspaceId == null) {
    return true
  }

  return tab.workspaceId === context.activeWorkspaceId
}

function getCreateVivExtDataForState(state) {
  if (!state.filteredByWorkspace || state.outsideWorkspace) {
    return null
  }

  if (state.activeWorkspaceId == null) {
    return null
  }

  return {
    workspaceId: state.activeWorkspaceId,
  }
}

function getCreateVivExtDataForChild(state, parentTabId) {
  const base = getCreateVivExtDataForState(state)
  const allTabs = state.pinnedTabs.concat(state.tabs)
  const parentTab = allTabs.find(tab => tab.id === parentTabId) || null
  const parentVivExtData = parentTab && parentTab.vivExtData && typeof parentTab.vivExtData === 'object'
    ? parentTab.vivExtData
    : null

  if (parentVivExtData && typeof parentVivExtData.group !== 'undefined' && parentVivExtData.group != null) {
    return {
      ...(base || {}),
      group: parentVivExtData.group,
    }
  }

  return base
}

function normalizeUniqueIds(values) {
  const seen = new Set()
  const result = []
  for (const value of Array.isArray(values) ? values : []) {
    const tabId = Number(value)
    if (!Number.isFinite(tabId) || seen.has(tabId)) continue
    seen.add(tabId)
    result.push(tabId)
  }
  return result
}

function normalizeTabColor(colorKey) {
  const value = typeof colorKey === 'string' ? colorKey.trim().toLowerCase() : ''
  const allowed = new Set(['rose', 'amber', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'])
  return allowed.has(value) ? value : ''
}

function createTabStore(api) {
  let state = createInitialState()
  let unsubs = []
  const listeners = new Set()
  const treeController = createTreeController(api)
  const nativeReconcile = createNativeReconcile(api)
  let contextLock = null
  let pendingActiveRepairTabId = null
  let pendingNativeReconcileReason = null
  let bookmarkSyncTimer = null
  let scheduledSyncTimer = null
  let scheduledSyncOptions = null
  let scheduledSyncReason = null
  let scheduledSyncPromise = null
  let scheduledSyncResolve = null
  let scheduledSyncReject = null
  const reconciledContextKeys = new Set()
  const pendingDeletedBookmarkTreeIds = new Set()

  function mergeSyncOptions(currentOptions, nextOptions) {
    const base = currentOptions ? { ...currentOptions } : {}
    if (!nextOptions || typeof nextOptions !== 'object') return base

    if ('preserveContext' in nextOptions) {
      if ('preserveContext' in base) {
        base.preserveContext = !!(base.preserveContext && nextOptions.preserveContext)
      } else {
        base.preserveContext = !!nextOptions.preserveContext
      }
    }

    if (Number.isFinite(nextOptions.activeRegularTabIdOverride)) {
      base.activeRegularTabIdOverride = nextOptions.activeRegularTabIdOverride
    }

    return base
  }

  function finalizeScheduledSync(error) {
    const reject = scheduledSyncReject
    const resolve = scheduledSyncResolve
    scheduledSyncPromise = null
    scheduledSyncResolve = null
    scheduledSyncReject = null
    if (error) {
      if (reject) reject(error)
      return
    }
    if (resolve) resolve()
  }

  function scheduleSync(options = {}, reason = 'event', delay = 0) {
    scheduledSyncOptions = mergeSyncOptions(scheduledSyncOptions, options)
    scheduledSyncReason = reason || scheduledSyncReason || 'event'

    if (!scheduledSyncPromise) {
      scheduledSyncPromise = new Promise((resolve, reject) => {
        scheduledSyncResolve = resolve
        scheduledSyncReject = reject
      })
    }

    if (scheduledSyncTimer) {
      clearTimeout(scheduledSyncTimer)
    }

    scheduledSyncTimer = setTimeout(() => {
      scheduledSyncTimer = null
      const nextOptions = scheduledSyncOptions || {}
      const nextReason = scheduledSyncReason || 'event'
      scheduledSyncOptions = null
      scheduledSyncReason = null
      syncTabs(nextOptions, nextReason)
        .then(() => finalizeScheduledSync(null))
        .catch(error => finalizeScheduledSync(error))
    }, Math.max(0, delay))

    return scheduledSyncPromise
  }

  function emit() {
    for (const listener of listeners) listener(state)
  }

  function setState(patch) {
    const nextPatch = reuseEquivalentStateSlices(state, patch)
    const nextState = { ...state, ...nextPatch }
    if (
      nextState.ready === state.ready
      && nextState.windowId === state.windowId
      && nextState.activeTabId === state.activeTabId
      && nextState.activeWorkspaceId === state.activeWorkspaceId
      && nextState.filteredByWorkspace === state.filteredByWorkspace
      && nextState.outsideWorkspace === state.outsideWorkspace
      && nextState.canCloseVisibleTabs === state.canCloseVisibleTabs
      && nextState.pinnedTabs === state.pinnedTabs
      && nextState.tabs === state.tabs
      && nextState.treeTabs === state.treeTabs
      && nextState.treeContextKey === state.treeContextKey
      && nextState.workspaces === state.workspaces
      && nextState.savedBookmarkTrees === state.savedBookmarkTrees
    ) {
      return false
    }
    state = nextState
    emit()
    return true
  }

  function createContextSnapshot() {
    return {
      activeWorkspaceId: state.activeWorkspaceId,
      outsideWorkspace: state.outsideWorkspace,
      filteredByWorkspace: state.filteredByWorkspace,
    }
  }

  function isSameContext(a, b) {
    return !!a
      && !!b
      && a.activeWorkspaceId === b.activeWorkspaceId
      && a.outsideWorkspace === b.outsideWorkspace
      && a.filteredByWorkspace === b.filteredByWorkspace
  }

  function lockCurrentContext() {
    if (!state.filteredByWorkspace) return
    contextLock = {
      context: createContextSnapshot(),
      expiresAt: Date.now() + 800,
    }
  }

  function getLockedContext() {
    if (!contextLock) return null
    if (Date.now() > contextLock.expiresAt) {
      contextLock = null
      return null
    }
    return contextLock.context
  }

  function releaseContextLock() {
    contextLock = null
  }

  function getPanelOrderIds() {
    return state.pinnedTabs.map(tab => tab.id).concat(state.treeTabs.map(item => item.id))
  }

  function getAllVisibleTabs() {
    return state.pinnedTabs.concat(state.tabs)
  }

  function getActionTargetIds(tabId, selectedIds) {
    const targetId = Number(tabId)
    if (!Number.isFinite(targetId)) return []
    const visibleIds = new Set(getPanelOrderIds())
    const normalizedSelectedIds = normalizeUniqueIds(selectedIds).filter(id => visibleIds.has(id))
    if (normalizedSelectedIds.includes(targetId) && normalizedSelectedIds.length > 1) {
      return normalizedSelectedIds
    }
    return [targetId]
  }

  function getTreeActionTargetIds(tabId, selectedIds) {
    return treeController.getSubtreeTargetIds(getActionTargetIds(tabId, selectedIds))
  }

  function getTabById(tabId) {
    return getAllVisibleTabs().find(tab => tab.id === tabId) || null
  }

  function getActivationTargetBeforeClose(targetIds) {
    const activeTabId = state.activeTabId
    if (!Number.isFinite(activeTabId)) return null

    const closeIds = new Set(normalizeUniqueIds(targetIds))
    if (!closeIds.has(activeTabId)) return null

    const orderIds = getPanelOrderIds()
    const activeIndex = orderIds.indexOf(activeTabId)
    if (activeIndex < 0) return null

    for (let index = activeIndex - 1; index >= 0; index -= 1) {
      if (!closeIds.has(orderIds[index])) return orderIds[index]
    }

    for (let index = activeIndex + 1; index < orderIds.length; index += 1) {
      if (!closeIds.has(orderIds[index])) return orderIds[index]
    }

    return null
  }

  function activateBeforeCloseIfNeeded(targetIds) {
    const activateTabId = getActivationTargetBeforeClose(targetIds)
    if (!Number.isFinite(activateTabId)) return
    pendingActiveRepairTabId = null
    api.activateTab(activateTabId)
  }

  function closeTabIds(tabIds) {
    const targetIds = normalizeUniqueIds(tabIds)
    if (targetIds.length === 0) return
    const visibleIds = getPanelOrderIds()
    if (visibleIds.length <= 1) return
    const visibleTargetIds = targetIds.filter(tabId => visibleIds.includes(tabId))
    if (visibleTargetIds.length === 0) return
    if (visibleTargetIds.length >= visibleIds.length) return

    pendingNativeReconcileReason = 'close'
    lockCurrentContext()
    activateBeforeCloseIfNeeded(visibleTargetIds)
    if (visibleTargetIds.length === 1) {
      api.closeTab(visibleTargetIds[0])
      return
    }
    api.closeTabs(visibleTargetIds)
  }

  async function updateTabs(tabIds, properties) {
    const targetIds = normalizeUniqueIds(tabIds)
    await Promise.all(targetIds.map(tabId => api.updateTab(tabId, properties)))
    await syncTabs({ preserveContext: true })
  }

  async function updateVivExtDataForTabs(tabIds, buildVivExtData) {
    const targetIds = normalizeUniqueIds(tabIds)
    if (targetIds.length === 0 || !api.updateVivExtData) return

    const tabsById = new Map(getAllVisibleTabs().map(tab => [tab.id, tab]))
    const tasks = []

    for (const tabId of targetIds) {
      const tab = tabsById.get(tabId)
      if (!tab) continue
      const nextData = buildVivExtData(tab)
      tasks.push(api.updateVivExtData(tabId, nextData))
    }

    await Promise.all(tasks)
    await syncTabs({ preserveContext: true })
  }

  async function moveTabsToWorkspace(tabIds, workspaceId) {
    const targetIds = normalizeUniqueIds(tabIds)
    if (targetIds.length === 0) return
    const targetContextKey = `workspace:${workspaceId}`
    const movedIdSet = new Set(targetIds)
    const moveRecords = treeController.getWorkspaceMoveRecords(targetIds)
    const moveRecordById = new Map(moveRecords.map(record => [record.tabId, record]))
    const visibleTabsById = new Map(getAllVisibleTabs().map(tab => [tab.id, tab]))
    const nodeIdByTabId = new Map()

    for (const tabId of targetIds) {
      const tab = visibleTabsById.get(tabId)
      const record = tab
        && tab.vivExtData
        && tab.vivExtData[TREE_NAMESPACE_KEY]
        && typeof tab.vivExtData[TREE_NAMESPACE_KEY] === 'object'
        ? tab.vivExtData[TREE_NAMESPACE_KEY]
        : null
      nodeIdByTabId.set(tabId, typeof record?.nodeId === 'string' && record.nodeId ? record.nodeId : createTreeNodeId())
    }

    let targetRootStartOrder = 0
    try {
      const allTabs = await api.getTabs(state.windowId)
      const targetRootOrders = allTabs
        .filter(tab => !movedIdSet.has(tab.id) && tab.workspaceId === workspaceId)
        .map(tab => {
          const record = tab
            && tab.vivExtData
            && tab.vivExtData[TREE_NAMESPACE_KEY]
            && typeof tab.vivExtData[TREE_NAMESPACE_KEY] === 'object'
            ? tab.vivExtData[TREE_NAMESPACE_KEY]
            : null
          return record && record.contextKey === targetContextKey && record.parentNodeId == null
            ? Number(record.order)
            : null
        })
        .filter(Number.isFinite)
      targetRootStartOrder = targetRootOrders.length ? Math.max(...targetRootOrders) + 1 : allTabs.filter(tab => tab.workspaceId === workspaceId).length
    } catch (error) {
      console.warn('[svb] cannot inspect target workspace order', error)
    }

    pendingNativeReconcileReason = 'move-workspace'
    await updateVivExtDataForTabs(targetIds, tab => {
      const previousData = tab && tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}
      const previousTreeData = previousData[TREE_NAMESPACE_KEY] && typeof previousData[TREE_NAMESPACE_KEY] === 'object'
        ? previousData[TREE_NAMESPACE_KEY]
        : null
      const moveRecord = moveRecordById.get(tab.id) || null
      const parentNodeId = moveRecord && Number.isFinite(moveRecord.parentId)
        ? nodeIdByTabId.get(moveRecord.parentId) || null
        : null
      const order = moveRecord
        ? (parentNodeId == null ? targetRootStartOrder + moveRecord.rootIndex : moveRecord.siblingIndex)
        : (previousTreeData && Number.isFinite(Number(previousTreeData.order)) ? Number(previousTreeData.order) : targetRootStartOrder)
      const nextData = {
        ...previousData,
        workspaceId,
      }
      nextData[TREE_NAMESPACE_KEY] = {
        ...(previousTreeData || {}),
        version: (previousTreeData && Number(previousTreeData.version)) || 1,
        contextKey: targetContextKey,
        nodeId: nodeIdByTabId.get(tab.id) || createTreeNodeId(),
        parentNodeId,
        collapsed: !!(previousTreeData && previousTreeData.collapsed),
        order,
      }
      return nextData
    })
  }

  async function syncTabs(options = {}, reason = 'direct') {
    if (state.windowId == null) return

    const { preserveContext = false, activeRegularTabIdOverride = undefined } = options
    const allTabs = sortTabs(await api.getTabs(state.windowId))
    let workspaces = []
    let savedBookmarkTrees = state.savedBookmarkTrees
    if (api.getWorkspaces) {
      try {
        workspaces = await api.getWorkspaces()
      } catch (error) {
        console.warn('[svb] cannot read workspaces', error)
      }
    }
    if (api.getSavedBookmarkTrees) {
      try {
        savedBookmarkTrees = await api.getSavedBookmarkTrees()
      } catch (error) {
        console.warn('[svb] cannot read saved bookmark trees', error)
      }
    }
    if (pendingDeletedBookmarkTreeIds.size > 0) {
      const returnedIds = new Set(
        (Array.isArray(savedBookmarkTrees) ? savedBookmarkTrees : []).map(tree => String(tree.id))
      )
      for (const deletedId of Array.from(pendingDeletedBookmarkTreeIds)) {
        if (!returnedIds.has(deletedId)) pendingDeletedBookmarkTreeIds.delete(deletedId)
      }
      savedBookmarkTrees = (Array.isArray(savedBookmarkTrees) ? savedBookmarkTrees : [])
        .filter(tree => !pendingDeletedBookmarkTreeIds.has(String(tree.id)))
    }
    treeController.clearStalePendingCreations(allTabs)

    const derivedContext = deriveContextFromActiveTab(allTabs)
    let nextContext = derivedContext

    const lockedContext = getLockedContext()
    const shouldPreserveContext = preserveContext || !!lockedContext

    if (shouldPreserveContext && state.filteredByWorkspace) {
      const preservedContext = lockedContext || createContextSnapshot()
      const preservedTabs = getVisibleTabsForContext(allTabs, preservedContext)

      if (preservedTabs.length > 0) {
        nextContext = preservedContext
      }
    }

    const activeTab = derivedContext.activeTab
    const visibleTabs = !shouldPreserveContext && Array.isArray(derivedContext.visibleTabs)
      ? derivedContext.visibleTabs
      : getVisibleTabsForContext(allTabs, nextContext)
    const pinnedTabs = visibleTabs.filter(tab => tab.pinned)
    const tabs = stabilizeTabsByPanelOrder(
      visibleTabs.filter(tab => !tab.pinned),
      state.treeTabs
    )
    const canCloseVisibleTabs = visibleTabs.length > 1
    const contextKey = treeController.makeContextKey({
      windowId: state.windowId,
      activeWorkspaceId: nextContext.activeWorkspaceId,
      outsideWorkspace: nextContext.outsideWorkspace,
    })

    const activeVisibleTab = visibleTabs.find(tab => tab.active) || null
    const previousVisibleActiveTab = Number.isFinite(state.activeTabId)
      ? visibleTabs.find(tab => tab.id === state.activeTabId) || null
      : null
    const fallbackVisibleTab = visibleTabs[0] || null
    const derivedActiveRegularTabId = activeVisibleTab && !activeVisibleTab.pinned
      ? activeVisibleTab.id
      : fallbackVisibleTab && !fallbackVisibleTab.pinned
        ? fallbackVisibleTab.id
        : null
    const activeRegularTabId = Number.isFinite(activeRegularTabIdOverride)
      ? activeRegularTabIdOverride
      : derivedActiveRegularTabId

    if (lockedContext && isSameContext(nextContext, derivedContext)) {
      releaseContextLock()
    }

    const shouldRepairVisibleActivation = nextContext.filteredByWorkspace
      && visibleTabs.length > 0
      && !activeVisibleTab
      && (!activeTab || !isTabInContext(activeTab, nextContext) || activeTab.hidden)

    if (shouldRepairVisibleActivation && fallbackVisibleTab && pendingActiveRepairTabId !== fallbackVisibleTab.id) {
      pendingActiveRepairTabId = fallbackVisibleTab.id
      api.activateTab(fallbackVisibleTab.id)
    } else if (activeVisibleTab && pendingActiveRepairTabId === activeVisibleTab.id) {
      pendingActiveRepairTabId = null
    } else if (!shouldRepairVisibleActivation && activeTab && pendingActiveRepairTabId === activeTab.id) {
      pendingActiveRepairTabId = null
    }

    const treeResult = await treeController.sync({
      tabs,
      contextKey,
      currentContextKey: state.treeContextKey,
      activeRegularTabId,
      sourceActiveTabId: state.activeTabId,
    })

    nativeReconcile.updateSnapshot({
      contextKey: treeResult.treeContextKey,
      tabs,
      fullTreeOrderIds: treeResult.fullTreeOrderIds,
      parentById: treeResult.parentById,
    })

    const shouldScheduleStartupReconcile = !!treeResult.treeContextKey
      && !reconciledContextKeys.has(treeResult.treeContextKey)
    if (shouldScheduleStartupReconcile) {
      reconciledContextKeys.add(treeResult.treeContextKey)
    }

    const actionReconcileReason = pendingNativeReconcileReason
      || (treeResult.structuralDirty && !shouldScheduleStartupReconcile ? 'tree-structural' : null)
    pendingNativeReconcileReason = null

    setState({
      ready: true,
      pinnedTabs,
      tabs,
      treeTabs: treeResult.treeTabs,
      treeContextKey: treeResult.treeContextKey,
      workspaces,
      savedBookmarkTrees,
      activeTabId: activeVisibleTab
        ? activeVisibleTab.id
        : previousVisibleActiveTab
          ? previousVisibleActiveTab.id
          : (fallbackVisibleTab ? fallbackVisibleTab.id : (activeTab ? activeTab.id : null)),
      activeWorkspaceId: nextContext.activeWorkspaceId,
      filteredByWorkspace: nextContext.filteredByWorkspace,
      outsideWorkspace: nextContext.outsideWorkspace,
      canCloseVisibleTabs,
    })

    if (actionReconcileReason) {
      nativeReconcile.scheduleAfterAction(actionReconcileReason)
      return
    }

    if (shouldScheduleStartupReconcile) {
      nativeReconcile.scheduleStartup()
    }

  }

  function resetListeners() {
    for (const unsub of unsubs) unsub()
    unsubs = []
    if (bookmarkSyncTimer) {
      clearTimeout(bookmarkSyncTimer)
      bookmarkSyncTimer = null
    }
    if (scheduledSyncTimer) {
      clearTimeout(scheduledSyncTimer)
      scheduledSyncTimer = null
    }
    scheduledSyncOptions = null
    scheduledSyncReason = null
    finalizeScheduledSync(null)
  }

  function bindEvents() {
    resetListeners()

    const refreshPreservingContext = (...args) => {
      void args
      scheduleSync({ preserveContext: true }, 'event-preserve', 12).catch(error => console.error('[svb] sync failed', error))
    }

    const handleUpdated = (tabId, changeInfo, tab) => {
      void tab
      if (api.isOwnVivExtUpdate && api.isOwnVivExtUpdate(tabId, changeInfo)) {
        return
      }
      if (nativeReconcile.isOwnOpenerUpdate(tabId, changeInfo)) {
        return
      }
      refreshPreservingContext(tabId, changeInfo)
    }

    const refreshFromActiveTab = (...args) => {
      void args
      scheduleSync({ preserveContext: false }, 'event-active', 0).catch(error => console.error('[svb] sync failed', error))
    }

    const refreshBookmarks = () => {
      if (bookmarkSyncTimer) clearTimeout(bookmarkSyncTimer)
      bookmarkSyncTimer = setTimeout(() => {
        bookmarkSyncTimer = null
        scheduleSync({ preserveContext: true }, 'bookmark', 0).catch(error => console.error('[svb] bookmark sync failed', error))
      }, 120)
    }

    const handleCreated = tab => {
      const pinnedIds = new Set(state.pinnedTabs.map(pinnedTab => pinnedTab.id))
      treeController.capturePendingCreation(tab, state.activeTabId, {
        fromPinnedTab: pinnedIds.has(state.activeTabId) || pinnedIds.has(tab.openerTabId),
      })
      refreshPreservingContext(tab)
    }

    const handleRemoved = tabId => {
      treeController.handleRemovedTab(tabId)
      refreshPreservingContext(tabId)
    }

      unsubs = [
        api.onCreated(handleCreated),
        api.onUpdated(handleUpdated),
        api.onRemoved(handleRemoved),
        api.onMoved((tabId, moveInfo) => {
          void moveInfo
          nativeReconcile.isOwnMove(tabId)
          refreshPreservingContext(tabId, moveInfo)
        }),
      api.onAttached(refreshPreservingContext),
      api.onDetached(refreshPreservingContext),
      api.onActivated(refreshFromActiveTab),
      api.onBookmarksChanged ? api.onBookmarksChanged(refreshBookmarks) : () => {},
    ]
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      listener(state)
      return () => listeners.delete(listener)
    },

    async init() {
      const windowId = await api.getCurrentWindowId()
      state = { ...state, windowId }
      bindEvents()
      await syncTabs({}, 'init')
    },

    async reload() {
      await syncTabs({ preserveContext: true }, 'reload')
    },

    dispose() {
      resetListeners()
      listeners.clear()
      releaseContextLock()
    },

    activateTab(tabId) {
      releaseContextLock()
      pendingActiveRepairTabId = null
      api.activateTab(tabId)
    },

    closeTab(tabId) {
      if (!state.canCloseVisibleTabs) return
      const closeTargetIds = treeController.getCloseTargetIds(tabId)
      if (closeTargetIds.length === 0) return
      pendingNativeReconcileReason = 'close'
      lockCurrentContext()
      activateBeforeCloseIfNeeded(closeTargetIds)
      if (closeTargetIds.length === 1) {
        api.closeTab(closeTargetIds[0])
        return
      }
      api.closeTabs(closeTargetIds)
    },

    closeTabIds,

    createTab() {
      if (state.windowId == null) return
      treeController.registerExpectedCreation({ kind: 'root' })
      pendingNativeReconcileReason = 'create-root'
      api.createTab(state.windowId, {
        vivExtData: getCreateVivExtDataForState(state),
      })
    },

    createChildTab(parentTabId) {
      if (state.windowId == null) return
      if (!Number.isFinite(parentTabId)) return
      treeController.registerExpectedCreation({
        kind: 'child',
        parentTabId,
      })
      const index = treeController.getCreateChildIndex(parentTabId, state.tabs)
      pendingNativeReconcileReason = 'create-child'
      api.createChildTab(state.windowId, parentTabId, {
        index,
        vivExtData: getCreateVivExtDataForChild(state, parentTabId),
      })
    },

    createSiblingTab(tabId) {
      if (state.windowId == null) return
      if (!Number.isFinite(tabId)) return
      treeController.registerExpectedCreation({
        kind: 'sibling',
        parentTabId: tabId,
      })
      const index = treeController.getCreateSiblingIndex(tabId, state.tabs)
      pendingNativeReconcileReason = 'create-sibling'
      api.createChildTab(state.windowId, tabId, {
        index,
        vivExtData: getCreateVivExtDataForState(state),
      })
    },

    async toggleCollapsed(tabId) {
      const result = await treeController.toggleCollapsed(tabId, state.activeTabId, state.tabs)
      if (!result) return
      if (Number.isFinite(result.activateTabId)) {
        releaseContextLock()
        pendingActiveRepairTabId = null
        api.activateTab(result.activateTabId)
      }
      await syncTabs({ preserveContext: true }, 'toggle-collapsed')
    },

    async collapseAll() {
      const result = await treeController.collapseAll(state.activeTabId, state.tabs)
      if (!result) return
      if (Number.isFinite(result.activateTabId)) {
        releaseContextLock()
        pendingActiveRepairTabId = null
        api.activateTab(result.activateTabId)
      }
      await syncTabs({
        preserveContext: true,
        activeRegularTabIdOverride: Number.isFinite(result.activateTabId) ? result.activateTabId : undefined,
      }, 'collapse-all')
    },

    async moveTreeTab(tabId, targetId, position) {
      if (!await treeController.moveTab(tabId, targetId, position, state.tabs)) return false
      pendingNativeReconcileReason = 'move-tree-tab'
      await syncTabs({ preserveContext: true }, 'move-tree-tab')
      return true
    },

    async moveTreeTabs(tabIds, targetId, position) {
      if (!await treeController.moveTabs(tabIds, targetId, position, state.tabs)) return false
      pendingNativeReconcileReason = 'move-tree-tabs'
      await syncTabs({ preserveContext: true }, 'move-tree-tabs')
      return true
    },

    restoreLastClosedTab() {
      if (!api.restoreLastClosedTab) return
      api.restoreLastClosedTab().catch(error => console.error('[svb] cannot restore tab', error))
    },

    async moveSelectionToNewWindow(tabId, selectedIds) {
      const targetIds = getTreeActionTargetIds(tabId, selectedIds)
      if (targetIds.length === 0 || !api.moveTabsToNewWindow) return
      const moveRecords = treeController.getWorkspaceMoveRecords(targetIds)
      const moveRecordById = new Map(moveRecords.map(record => [record.tabId, record]))
      const visibleTabsById = new Map(getAllVisibleTabs().map(tab => [tab.id, tab]))
      const nodeIdByTabId = new Map()
      const detachedContextKey = `detached:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`

      for (const targetId of targetIds) {
        const tab = visibleTabsById.get(targetId)
        const record = tab
          && tab.vivExtData
          && tab.vivExtData[TREE_NAMESPACE_KEY]
          && typeof tab.vivExtData[TREE_NAMESPACE_KEY] === 'object'
          ? tab.vivExtData[TREE_NAMESPACE_KEY]
          : null
        nodeIdByTabId.set(targetId, typeof record?.nodeId === 'string' && record.nodeId ? record.nodeId : createTreeNodeId())
      }

      await updateVivExtDataForTabs(targetIds, tab => {
        const previousData = tab && tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}
        const previousTreeData = previousData[TREE_NAMESPACE_KEY] && typeof previousData[TREE_NAMESPACE_KEY] === 'object'
          ? previousData[TREE_NAMESPACE_KEY]
          : null
        const moveRecord = moveRecordById.get(tab.id) || null
        const parentNodeId = moveRecord && Number.isFinite(moveRecord.parentId)
          ? nodeIdByTabId.get(moveRecord.parentId) || null
          : null
        const order = moveRecord
          ? (parentNodeId == null ? moveRecord.rootIndex : moveRecord.siblingIndex)
          : (previousTreeData && Number.isFinite(Number(previousTreeData.order)) ? Number(previousTreeData.order) : 0)

        return {
          ...previousData,
          [TREE_NAMESPACE_KEY]: {
            ...(previousTreeData || {}),
            version: (previousTreeData && Number(previousTreeData.version)) || 1,
            contextKey: detachedContextKey,
            nodeId: nodeIdByTabId.get(tab.id) || createTreeNodeId(),
            parentNodeId,
            collapsed: !!(previousTreeData && previousTreeData.collapsed),
            order,
          },
        }
      })

      await api.moveTabsToNewWindow(targetIds)
      await syncTabs({ preserveContext: true })
    },

    async moveSelectionToWorkspace(tabId, selectedIds, workspaceId) {
      if (!Number.isFinite(workspaceId)) return
      await moveTabsToWorkspace(getTreeActionTargetIds(tabId, selectedIds), workspaceId)
    },

    async createWorkspaceAndMoveSelection(tabId, selectedIds) {
      if (!api.createWorkspace) return
      const workspace = await api.createWorkspace('New Workspace')
      const workspaceId = workspace && Number(workspace.id)
      if (!Number.isFinite(workspaceId)) return
      await moveTabsToWorkspace(getTreeActionTargetIds(tabId, selectedIds), workspaceId)
      if (api.repairWorkspace) {
        api.repairWorkspace(workspace)
      }
    },

    async togglePinnedForSelection(tabId, selectedIds) {
      const targetIds = getActionTargetIds(tabId, selectedIds)
      const tab = getTabById(tabId)
      await updateTabs(targetIds, { pinned: !(tab && tab.pinned) })
    },

    async toggleMutedForSelection(tabId, selectedIds) {
      const targetIds = getActionTargetIds(tabId, selectedIds)
      const tab = getTabById(tabId)
      const muted = !(tab && tab.muted)
      await updateTabs(targetIds, { muted })
    },

    async renameTab(tabId, title) {
      if (!Number.isFinite(tabId) || !api.updateVivExtData) return

      const nextTitle = typeof title === 'string' ? title.trim() : ''
      await updateVivExtDataForTabs([tabId], tab => {
        const nextData = {
          ...(tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}),
        }

        if (nextTitle) {
          nextData.fixedTitle = nextTitle
        } else {
          nextData.fixedTitle = null
        }

        return nextData
      })
    },

    async setColorForSelection(tabId, selectedIds, colorKey) {
      const nextColor = normalizeTabColor(colorKey)
      const targetIds = getActionTargetIds(tabId, selectedIds)
      await updateVivExtDataForTabs(targetIds, tab => {
        const nextData = {
          ...(tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}),
        }

        if (nextColor) {
          nextData.tabColor = nextColor
        } else {
          nextData.tabColor = null
        }

        return nextData
      })
    },

    async duplicateTab(tabId) {
      if (!api.duplicateTab) return
      const beforeIds = new Set(getAllVisibleTabs().map(tab => tab.id))
      pendingNativeReconcileReason = 'duplicate'
      const duplicatedTab = await api.duplicateTab(tabId)
      let duplicatedTabId = duplicatedTab && Number(duplicatedTab.id)
      await syncTabs({ preserveContext: true })

      if (!Number.isFinite(duplicatedTabId)) {
        const duplicatedVisibleTab = getAllVisibleTabs().find(tab => !beforeIds.has(tab.id) && tab.active)
          || getAllVisibleTabs().find(tab => !beforeIds.has(tab.id))
        duplicatedTabId = duplicatedVisibleTab ? duplicatedVisibleTab.id : null
      }

      if (!Number.isFinite(duplicatedTabId)) return
      if (!state.tabs.some(tab => tab.id === tabId) || !state.tabs.some(tab => tab.id === duplicatedTabId)) return
      if (!await treeController.moveTab(duplicatedTabId, tabId, 'after', state.tabs)) return
      pendingNativeReconcileReason = 'duplicate-position'
      await syncTabs({ preserveContext: true })
    },

    async saveTreeAsBookmark(tabId) {
      if (!api.saveBookmarkTree) return
      const tree = treeController.getBookmarkTree(tabId, state.tabs)
      if (!tree) return
      await api.saveBookmarkTree(tree)
      await syncTabs({ preserveContext: true })
    },

    async openSavedBookmarkTree(bookmarkTreeId) {
      if (state.windowId == null || !api.getSavedBookmarkTree || !api.createRestoredTab) return
      const tree = await api.getSavedBookmarkTree(bookmarkTreeId)
      if (!tree || !tree.url) return

      const baseVivExtData = getCreateVivExtDataForState(state) || {}
      const restoredNodes = []
      let createdCount = 0

      async function createNode(node, parentId) {
        const tab = await api.createRestoredTab(state.windowId, {
          url: node.url,
          active: createdCount === 0,
          vivExtData: {
            ...baseVivExtData,
            fixedTitle: node.title,
          },
        })
        const tabId = tab && Number(tab.id)
        if (!Number.isFinite(tabId)) return null

        createdCount += 1
        restoredNodes.push({
          tabId,
          parentId: Number.isFinite(parentId) ? parentId : null,
          collapsed: !!node.collapsed,
        })

        for (const child of Array.isArray(node.children) ? node.children : []) {
          await createNode(child, tabId)
        }

        return tabId
      }

      await createNode(tree, null)
      if (restoredNodes.length === 0) return

      await syncTabs({ preserveContext: true })
      if (treeController.restoreBookmarkTree(restoredNodes, state.tabs)) {
        pendingNativeReconcileReason = 'restore-bookmark-tree'
      }
      await syncTabs({ preserveContext: true })
    },

    async deleteSavedBookmarkTree(bookmarkTreeId) {
      if (!api.deleteSavedBookmarkTree) return
      const id = bookmarkTreeId == null ? '' : String(bookmarkTreeId)
      if (!id) return

      pendingDeletedBookmarkTreeIds.add(id)
      setState({
        savedBookmarkTrees: state.savedBookmarkTrees.filter(tree => String(tree.id) !== id),
      })

      try {
        await api.deleteSavedBookmarkTree(id)
        await syncTabs({ preserveContext: true })
      } catch (error) {
        pendingDeletedBookmarkTreeIds.delete(id)
        await syncTabs({ preserveContext: true })
        throw error
      }
    },

    closeSelection(tabId, selectedIds) {
      const targetIds = getActionTargetIds(tabId, selectedIds)
      const expandedTargetIds = []
      for (const targetId of targetIds) {
        const closeIds = treeController.getCloseTargetIds(targetId)
        expandedTargetIds.push(...(closeIds.length ? closeIds : [targetId]))
      }
      closeTabIds(expandedTargetIds)
    },

    closeOtherTabs(tabId, selectedIds) {
      const keepIds = new Set(getActionTargetIds(tabId, selectedIds))
      closeTabIds(getPanelOrderIds().filter(id => !keepIds.has(id)))
    },

    closeTabsBelow(tabId) {
      const orderIds = getPanelOrderIds()
      const index = orderIds.indexOf(tabId)
      if (index === -1) return
      closeTabIds(orderIds.slice(index + 1))
    },

    closeTabsAbove(tabId) {
      const orderIds = state.treeTabs.map(item => item.id)
      const index = orderIds.indexOf(tabId)
      if (index === -1) return
      closeTabIds(orderIds.slice(0, index))
    },
  }
}

module.exports = { createTabStore }

    },
    "store/panel-store.js": function(require, module, exports) {
const STORAGE_KEY = 'svb:panel:state'
const DEFAULT_WIDTH = 300
const MIN_WIDTH = 30
const MAX_WIDTH = 520
const DEFAULT_STATE = { pinned: true, width: DEFAULT_WIDTH }

function clampWidth(width) {
  const numericWidth = Number(width)
  if (!Number.isFinite(numericWidth)) return DEFAULT_WIDTH
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(numericWidth)))
}

function normalizeState(value) {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_STATE }
  }

  return {
    pinned: typeof value.pinned === 'boolean' ? value.pinned : true,
    width: clampWidth(value.width),
  }
}

function readLegacyState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === '0') return { pinned: false, width: DEFAULT_WIDTH }
    if (raw === '1') return { pinned: true, width: DEFAULT_WIDTH }
    if (raw) {
      return normalizeState(JSON.parse(raw))
    }
  } catch (_error) {
    // Ignore storage failures and fall back to the default.
  }

  return null
}

function getChromeStorageArea() {
  const storage = typeof chrome !== 'undefined' && chrome.storage
  if (!storage) return null
  return storage.local || null
}

function storageGet(area, key) {
  return new Promise(resolve => {
    try {
      area.get(key, result => {
        const runtimeError = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError
        if (runtimeError) {
          resolve(undefined)
          return
        }
        resolve(result ? result[key] : undefined)
      })
    } catch (_error) {
      resolve(undefined)
    }
  })
}

function storageSet(area, payload) {
  return new Promise(resolve => {
    try {
      area.set(payload, () => resolve())
    } catch (_error) {
      resolve()
    }
  })
}

async function loadPersistedState() {
  const area = getChromeStorageArea()
  if (area) {
    const storedValue = await storageGet(area, STORAGE_KEY)
    if (storedValue) {
      return normalizeState(storedValue)
    }

    const legacyState = readLegacyState()
    if (legacyState) {
      await storageSet(area, { [STORAGE_KEY]: legacyState })
      return normalizeState(legacyState)
    }
  }

  return normalizeState(readLegacyState())
}

function persistLegacyState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      pinned: !!state.pinned,
      width: clampWidth(state.width),
    }))
  } catch (_error) {
    // Ignore storage failures.
  }
}

async function persistState(state) {
  const normalizedState = normalizeState(state)
  persistLegacyState(normalizedState)

  const area = getChromeStorageArea()
  if (!area) return
  await storageSet(area, { [STORAGE_KEY]: normalizedState })
}

function createPanelStore() {
  let state = { ...DEFAULT_STATE }
  const listeners = new Set()

  function emit() {
    for (const listener of listeners) listener(state)
  }

  function setState(nextState) {
    state = normalizeState(nextState)
    void persistState(state)
    emit()
  }

  return {
    getState() {
      return state
    },

    async init() {
      state = await loadPersistedState()
      emit()
    },

    subscribe(listener) {
      listeners.add(listener)
      listener(state)
      return () => listeners.delete(listener)
    },

    togglePinned() {
      setState({ ...state, pinned: !state.pinned })
    },

    setWidth(width) {
      setState({ ...state, width: clampWidth(width) })
    },
  }
}

module.exports = { createPanelStore }

    },
    "store/selection-store.js": function(require, module, exports) {
function createSelectionStore() {
  let state = {
    selectedIds: [],
    anchorId: null,
    focusedId: null,
  }
  const listeners = new Set()

  function normalizeIds(values) {
    const seen = new Set()
    const result = []
    for (const value of Array.isArray(values) ? values : []) {
      const tabId = Number(value)
      if (!Number.isFinite(tabId) || seen.has(tabId)) continue
      seen.add(tabId)
      result.push(tabId)
    }
    return result
  }

  function setState(nextState) {
    state = {
      selectedIds: normalizeIds(nextState.selectedIds),
      anchorId: Number.isFinite(nextState.anchorId) ? nextState.anchorId : null,
      focusedId: Number.isFinite(nextState.focusedId) ? nextState.focusedId : null,
    }
    for (const listener of listeners) listener({
      selectedIds: state.selectedIds.slice(),
      anchorId: state.anchorId,
      focusedId: state.focusedId,
    })
  }

  function buildRange(anchorId, targetId, orderedVisibleIds) {
    const orderedIds = normalizeIds(orderedVisibleIds)
    const anchorIndex = orderedIds.indexOf(anchorId)
    const targetIndex = orderedIds.indexOf(targetId)
    if (anchorIndex === -1 || targetIndex === -1) return [targetId]
    const start = Math.min(anchorIndex, targetIndex)
    const end = Math.max(anchorIndex, targetIndex)
    return orderedIds.slice(start, end + 1)
  }

  return {
    getState() {
      return {
        selectedIds: state.selectedIds.slice(),
        anchorId: state.anchorId,
        focusedId: state.focusedId,
      }
    },

    subscribe(listener) {
      listeners.add(listener)
      listener({
        selectedIds: state.selectedIds.slice(),
        anchorId: state.anchorId,
        focusedId: state.focusedId,
      })
      return () => listeners.delete(listener)
    },

    clear() {
      setState({
        selectedIds: [],
        anchorId: null,
        focusedId: null,
      })
    },

    isSelected(tabId) {
      return state.selectedIds.includes(tabId)
    },

    selectSingle(tabId) {
      setState({
        selectedIds: [tabId],
        anchorId: tabId,
        focusedId: tabId,
      })
    },

    toggleSelected(tabId) {
      const selectedIds = state.selectedIds.includes(tabId)
        ? state.selectedIds.filter(id => id !== tabId)
        : state.selectedIds.concat(tabId)

      setState({
        selectedIds,
        anchorId: state.anchorId != null ? state.anchorId : tabId,
        focusedId: tabId,
      })
    },

    selectRange(anchorId, tabId, orderedVisibleIds) {
      const selectedIds = buildRange(anchorId, tabId, orderedVisibleIds)
      setState({
        selectedIds,
        anchorId,
        focusedId: tabId,
      })
    },

    selectMany(tabIds) {
      const normalizedIds = normalizeIds(tabIds)
      setState({
        selectedIds: normalizedIds,
        anchorId: normalizedIds[0] || null,
        focusedId: normalizedIds[normalizedIds.length - 1] || null,
      })
    },

    setAnchor(tabId) {
      setState({
        ...state,
        anchorId: Number.isFinite(tabId) ? tabId : null,
      })
    },

    setFocused(tabId) {
      setState({
        ...state,
        focusedId: Number.isFinite(tabId) ? tabId : null,
      })
    },

    retainValid(validIds) {
      const validSet = new Set(normalizeIds(validIds))
      const selectedIds = state.selectedIds.filter(tabId => validSet.has(tabId))
      const anchorId = validSet.has(state.anchorId) ? state.anchorId : (selectedIds[0] || null)
      const focusedId = validSet.has(state.focusedId) ? state.focusedId : (selectedIds[selectedIds.length - 1] || null)

      if (
        selectedIds.length === state.selectedIds.length
        && anchorId === state.anchorId
        && focusedId === state.focusedId
      ) {
        return
      }

      setState({
        selectedIds,
        anchorId,
        focusedId,
      })
    },
  }
}

module.exports = { createSelectionStore }

    },
    "store/drag-store.js": function(require, module, exports) {
function normalizeTabId(value) {
  const tabId = Number(value)
  return Number.isFinite(tabId) ? tabId : null
}

function normalizeUniqueIds(values) {
  const seen = new Set()
  const result = []

  for (const value of Array.isArray(values) ? values : []) {
    const tabId = normalizeTabId(value)
    if (tabId == null || seen.has(tabId)) continue
    seen.add(tabId)
    result.push(tabId)
  }

  return result
}

function createInitialState() {
  return {
    dragging: false,
    draggedIds: [],
    sourceParentId: null,
    dropTargetId: null,
    dropPosition: null,
  }
}

function createDragStore() {
  let state = createInitialState()
  const listeners = new Set()

  function emit() {
    const snapshot = {
      dragging: state.dragging,
      draggedIds: state.draggedIds.slice(),
      sourceParentId: state.sourceParentId,
      dropTargetId: state.dropTargetId,
      dropPosition: state.dropPosition,
    }
    for (const listener of listeners) listener(snapshot)
  }

  function setState(patch) {
    state = {
      dragging: !!patch.dragging,
      draggedIds: normalizeUniqueIds(patch.draggedIds),
      sourceParentId: normalizeTabId(patch.sourceParentId),
      dropTargetId: normalizeTabId(patch.dropTargetId),
      dropPosition: patch.dropPosition || null,
    }
    emit()
  }

  return {
    getState() {
      return {
        dragging: state.dragging,
        draggedIds: state.draggedIds.slice(),
        sourceParentId: state.sourceParentId,
        dropTargetId: state.dropTargetId,
        dropPosition: state.dropPosition,
      }
    },

    subscribe(listener) {
      listeners.add(listener)
      listener(this.getState())
      return () => listeners.delete(listener)
    },

    startDrag(draggedIds, meta) {
      const normalizedIds = normalizeUniqueIds(draggedIds)
      if (normalizedIds.length === 0) return
      setState({
        dragging: true,
        draggedIds: normalizedIds,
        sourceParentId: meta && meta.sourceParentId,
        dropTargetId: null,
        dropPosition: null,
      })
    },

    updateDropTarget(targetId, position) {
      if (!state.dragging) return
      setState({
        dragging: true,
        draggedIds: state.draggedIds,
        sourceParentId: state.sourceParentId,
        dropTargetId: targetId,
        dropPosition: position,
      })
    },

    clear() {
      if (!state.dragging && state.draggedIds.length === 0 && state.dropTargetId == null && state.dropPosition == null) {
        return
      }
      state = createInitialState()
      emit()
    },
  }
}

module.exports = { createDragStore }

    },
    "adapters/vivaldi-bridge.js": function(require, module, exports) {
const VIVALDI_TILING_MODULE_ID = 69787
const VIVALDI_PAGE_STORE_MODULE_ID = 96951
const VIVALDI_COLLECTION_MODULE_ID = 35369
const VIVALDI_WORKSPACE_MANAGER_MODULE_ID = 29104
const VIVALDI_PAGE_ACTIONS_MODULE_ID = 59322

function createVivaldiBridge(options) {
  const {
    getPrefsApi,
    setPref,
    promisifyChromeApi,
    workspacesPrefPath,
    defaultWorkspaceIcon,
  } = options

  let mainViewWebpackRequire = null
  let workspaceManager = null
  const workspaceRepairTasksById = new Map()

  function getVivaldiMainView() {
    const extensionApi = typeof chrome !== 'undefined' && chrome ? chrome.extension : null
    if (!extensionApi || typeof extensionApi.getViews !== 'function') return null

    return extensionApi.getViews().find(view => {
      if (!view || view === window) return false
      if (!view.document || !view.location) return false
      if (!String(view.location.href || '').endsWith('/main.html')) return false
      return !!view.webpackChunkgapp_browser_react
    }) || null
  }

  function getMainViewWebpackRequire() {
    if (mainViewWebpackRequire) return mainViewWebpackRequire

    const mainView = getVivaldiMainView()
    const chunk = mainView && mainView.webpackChunkgapp_browser_react
    if (!chunk || typeof chunk.push !== 'function') return null

    try {
      chunk.push([
        [`svb-main-runtime-${Date.now()}`],
        {},
        require => {
          mainViewWebpackRequire = require
        },
      ])
    } catch (error) {
      console.warn('[svb] cannot access Vivaldi main runtime', error)
    }

    return mainViewWebpackRequire
  }

  function getVivaldiWebpackModule(moduleId) {
    const require = getMainViewWebpackRequire()
    if (!require || typeof require !== 'function') return null

    try {
      return require(moduleId)
    } catch (error) {
      console.warn('[svb] cannot resolve Vivaldi module', moduleId, error)
      return null
    }
  }

  function getWorkspaceManager() {
    if (workspaceManager) return workspaceManager

    const moduleValue = getVivaldiWebpackModule(VIVALDI_WORKSPACE_MANAGER_MODULE_ID)
    const candidate = moduleValue && moduleValue.Z ? moduleValue.Z : moduleValue
    workspaceManager = candidate && typeof candidate.setName === 'function' ? candidate : null

    return workspaceManager
  }

  function repairWorkspaceRuntime(workspace) {
    const manager = getWorkspaceManager()
    if (!manager) return false

    try {
      manager.setName(workspace.id, workspace.name)
      if (typeof manager.setIcon === 'function' && workspace.icon) {
        manager.setIcon(workspace.id, workspace.icon)
      }
      return true
    } catch (error) {
      console.warn('[svb] cannot repair workspace runtime', error)
      return false
    }
  }

  async function upsertWorkspacePref(workspace) {
    const prefsApi = getPrefsApi()
    if (!prefsApi || typeof prefsApi.get !== 'function' || typeof prefsApi.set !== 'function') return false

    const current = await promisifyChromeApi(prefsApi.get, workspacesPrefPath)
    const workspaces = Array.isArray(current) ? current.slice() : []
    const index = workspaces.findIndex(item => Number(item && item.id) === workspace.id)
    const nextWorkspace = {
      ...(index >= 0 && workspaces[index] && typeof workspaces[index] === 'object' ? workspaces[index] : {}),
      id: workspace.id,
      name: workspace.name,
      icon: workspace.icon,
    }

    if (index >= 0) {
      workspaces[index] = nextWorkspace
    } else {
      workspaces.push(nextWorkspace)
    }

    await setPref(workspacesPrefPath, workspaces)
    return true
  }

  function scheduleWorkspacePrefRepair(workspace) {
    const workspaceId = Number(workspace && workspace.id)
    if (!Number.isFinite(workspaceId)) return

    const pending = workspaceRepairTasksById.get(workspaceId)
    if (pending) {
      pending.timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    }

    const delays = [100, 300, 700, 1200, 2000, 3500, 5000]
    const token = Symbol(`workspace-repair:${workspaceId}`)
    const timeouts = []
    workspaceRepairTasksById.set(workspaceId, { token, timeouts })

    for (const delayMs of delays) {
      const timeoutId = setTimeout(() => {
        const current = workspaceRepairTasksById.get(workspaceId)
        if (!current || current.token !== token) return

        repairWorkspaceRuntime(workspace)
        upsertWorkspacePref(workspace).catch(error => {
          console.error('[svb] cannot repair workspace pref', error)
        })

        if (delayMs === delays[delays.length - 1]) {
          const latest = workspaceRepairTasksById.get(workspaceId)
          if (latest && latest.token === token) {
            workspaceRepairTasksById.delete(workspaceId)
          }
        }
      }, delayMs)
      timeouts.push(timeoutId)
    }
  }

  function normalizeWorkspace(workspace) {
    if (!workspace || typeof workspace !== 'object') return null
    const id = Number(workspace.id)
    if (!Number.isFinite(id)) return null
    return {
      ...workspace,
      id,
      name: workspace.name || `Workspace ${id}`,
    }
  }

  return {
    async getWorkspaces() {
      const prefsApi = getPrefsApi()
      if (!prefsApi || typeof prefsApi.get !== 'function') return []
      const workspaces = await promisifyChromeApi(prefsApi.get, workspacesPrefPath)
      return (Array.isArray(workspaces) ? workspaces : [])
        .map(normalizeWorkspace)
        .filter(Boolean)
    },

    async createWorkspace(name = 'New Workspace') {
      const prefsApi = getPrefsApi()
      if (!prefsApi || typeof prefsApi.get !== 'function') return null

      const current = await promisifyChromeApi(prefsApi.get, workspacesPrefPath)
      const workspaces = Array.isArray(current) ? current.slice() : []
      const usedIds = new Set(workspaces.map(workspace => Number(workspace && workspace.id)).filter(Number.isFinite))
      let id = Date.now()
      while (usedIds.has(id)) id += 1

      const workspace = {
        id,
        name,
        icon: defaultWorkspaceIcon,
      }

      await upsertWorkspacePref(workspace)
      scheduleWorkspacePrefRepair(workspace)

      return workspace
    },

    repairWorkspace(workspace) {
      if (!workspace || !Number.isFinite(Number(workspace.id))) return
      scheduleWorkspacePrefRepair({
        ...workspace,
        id: Number(workspace.id),
        name: workspace.name || 'New Workspace',
        icon: workspace.icon || defaultWorkspaceIcon,
      })
    },

    async tileTabs(tabIds, layout) {
      const ids = Array.isArray(tabIds)
        ? tabIds.map(Number).filter(Number.isFinite)
        : []
      if (ids.length < 2) return null
      if (!['row', 'column', 'grid'].includes(layout)) return null

      const tilingModule = getVivaldiWebpackModule(VIVALDI_TILING_MODULE_ID)
      const pageStoreModule = getVivaldiWebpackModule(VIVALDI_PAGE_STORE_MODULE_ID)
      const collectionModule = getVivaldiWebpackModule(VIVALDI_COLLECTION_MODULE_ID)
      const tilePages = tilingModule && typeof tilingModule.Yb === 'function' ? tilingModule.Yb : null
      const pageStore = pageStoreModule && pageStoreModule.ZP ? pageStoreModule.ZP : null
      const createCollection = collectionModule && typeof collectionModule.aV === 'function' ? collectionModule.aV : null

      if (!tilePages || !pageStore || !createCollection || typeof pageStore.getPageById !== 'function') {
        return null
      }

      const pages = ids
        .map(tabId => pageStore.getPageById(tabId))
        .filter(Boolean)

      if (pages.length < 2) return null
      return tilePages(createCollection(pages), layout, 'selection')
    },

    async detachTabsToNewWindow(tabIds) {
      const ids = Array.isArray(tabIds)
        ? tabIds.map(Number).filter(Number.isFinite)
        : []
      if (ids.length === 0) return false

      const pageActionsModule = getVivaldiWebpackModule(VIVALDI_PAGE_ACTIONS_MODULE_ID)
      const pageStoreModule = getVivaldiWebpackModule(VIVALDI_PAGE_STORE_MODULE_ID)
      const collectionModule = getVivaldiWebpackModule(VIVALDI_COLLECTION_MODULE_ID)
      const pageActions = pageActionsModule && pageActionsModule.ZP ? pageActionsModule.ZP : null
      const pageStore = pageStoreModule && pageStoreModule.ZP ? pageStoreModule.ZP : null
      const createCollection = collectionModule && typeof collectionModule.aV === 'function' ? collectionModule.aV : null

      if (!pageActions || typeof pageActions.detachPage !== 'function') return false
      if (!pageStore || typeof pageStore.getPageById !== 'function') return false
      if (!createCollection) return false

      const pages = ids
        .map(tabId => pageStore.getPageById(tabId))
        .filter(Boolean)

      if (pages.length === 0) return false

      const nativeTarget = pages.length === 1
        ? pages[0]
        : createCollection(pages)

      await pageActions.detachPage(nativeTarget)
      return true
    },
  }
}

module.exports = { createVivaldiBridge }

    },
    "adapters/tabs-api.js": function(require, module, exports) {
const {
  getInternalPageFaviconUrl,
  getInternalPageTitle,
  isStartPageUrl,
  isSettingsUrl,
} = require('./internal-page-meta.js')
const { createVivaldiBridge } = require('./vivaldi-bridge.js')

function promisifyChromeApi(fn, ...args) {
  return new Promise((resolve, reject) => {
    try {
      fn(...args, result => {
        const runtimeError = chrome.runtime && chrome.runtime.lastError
        if (runtimeError) {
          reject(new Error(runtimeError.message))
          return
        }
        resolve(result)
      })
    } catch (error) {
      reject(error)
    }
  })
}

const VIVALDI_START_PAGE_URL = 'chrome://vivaldi-webui/startpage?section=Speed-dials'
const VIVALDI_BLANK_PAGE_URL = 'about:blank'
const VIVALDI_HOMEPAGE_PREF = 'vivaldi.homepage'
const VIVALDI_NEW_PAGE_LINK_PREF = 'vivaldi.tabs.new_page.link'
const VIVALDI_NEW_PAGE_CUSTOM_URL_PREF = 'vivaldi.tabs.new_page.custom_url'
const VIVALDI_WORKSPACES_PREF = 'vivaldi.workspaces.list'
const TREE_BOOKMARK_PREFIX = '[TTV] '
const TREE_BOOKMARK_CONTAINER_TITLE = 'TreeTabsVivaldi'
const VIVALDI_DEFAULT_WORKSPACE_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M3.5 8.5V11.9648C3.5 12.2992 3.66819 12.6099 3.97304 12.7472C4.63034 13.0433 5.97266 13.5 8 13.5C10.0273 13.5 11.3697 13.0433 12.027 12.7472C12.3318 12.6099 12.5 12.2992 12.5 11.9648V8.5M14.4182 5.54402L8.0237 8.98724C8.00891 8.9952 7.99109 8.9952 7.9763 8.98724L1.58176 5.54402C1.5467 5.52515 1.5467 5.47485 1.58176 5.45598L7.9763 2.01276C7.99109 2.0048 8.00891 2.0048 8.0237 2.01276L14.4182 5.45598C14.4533 5.47485 14.4533 5.52515 14.4182 5.54402Z" stroke-linecap="round"/>
  <path d="M14.5 5.5V10.5" stroke-linecap="round"/>
  <path d="M14.5 12.5V13.5" stroke-linecap="round"/>
</svg>
`

function serializeVivExtData(vivExtData) {
  if (!vivExtData || typeof vivExtData !== 'object') {
    return undefined
  }

  const payload = {}

  if (typeof vivExtData.workspaceId !== 'undefined' && vivExtData.workspaceId != null) {
    payload.workspaceId = vivExtData.workspaceId
  }

  if (typeof vivExtData.group !== 'undefined' && vivExtData.group != null) {
    payload.group = vivExtData.group
  }

  if (typeof vivExtData.fixedTitle === 'string' && vivExtData.fixedTitle.trim()) {
    payload.fixedTitle = vivExtData.fixedTitle.trim()
  }

  return Object.keys(payload).length ? JSON.stringify(payload) : undefined
}

function parseVivExtData(value) {
  if (!value) return null

  if (typeof value === 'object') {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  try {
    return JSON.parse(value)
  } catch (_error) {
    return null
  }
}

function getUrlFallbackTitle(url) {
  if (!url) return 'Untitled'
  const internalTitle = getInternalPageTitle(url)
  if (internalTitle) return internalTitle

  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'chrome:' || parsed.protocol === 'vivaldi:') {
      return parsed.hostname || parsed.pathname.replace(/^\//, '') || 'Internal Page'
    }

    return parsed.hostname || url
  } catch (_error) {
    return url
  }
}

function getDisplayTitle(tab) {
  const url = tab.url || ''
  const vivExtData = parseVivExtData(tab.vivExtData)
  const fixedTitle = vivExtData && typeof vivExtData.fixedTitle === 'string'
    ? vivExtData.fixedTitle.trim()
    : ''
  const title = tab.title && tab.title.trim() ? tab.title.trim() : ''

  if (fixedTitle) return fixedTitle
  if (isStartPageUrl(url) || isSettingsUrl(url)) {
    return getInternalPageTitle(url)
  }
  if (title && title !== url) return title
  return getUrlFallbackTitle(url)
}

function getFallbackFaviconUrl(tab) {
  const url = tab.url || ''
  const internalFaviconUrl = getInternalPageFaviconUrl(url)

  if (internalFaviconUrl) {
    return internalFaviconUrl
  }

  if (tab.favIconUrl) return tab.favIconUrl

  if (!url) return ''
  return `chrome://favicon/size/16@2x/${url}`
}

function normalizeTab(tab) {
  const vivExtData = parseVivExtData(tab.vivExtData)

  return {
    id: tab.id,
    windowId: tab.windowId,
    index: tab.index,
    openerTabId: Number.isFinite(tab.openerTabId) ? tab.openerTabId : null,
    title: getDisplayTitle(tab),
    url: tab.url || '',
    favIconUrl: getFallbackFaviconUrl(tab),
    active: !!tab.active,
    pinned: !!tab.pinned,
    audible: !!tab.audible,
    muted: !!(tab.mutedInfo && tab.mutedInfo.muted),
    discarded: !!tab.discarded,
    hidden: !!tab.hidden,
    loading: tab.status === 'loading',
    vivExtData: vivExtData && typeof vivExtData === 'object' ? vivExtData : null,
    workspaceId: vivExtData && typeof vivExtData.workspaceId !== 'undefined'
      ? vivExtData.workspaceId
      : null,
  }
}

function getVivaldiPrefsApi() {
  return typeof vivaldi !== 'undefined' && vivaldi && vivaldi.prefs ? vivaldi.prefs : null
}

async function getVivaldiPref(path) {
  const prefsApi = getVivaldiPrefsApi()
  if (!prefsApi || typeof prefsApi.get !== 'function') return undefined
  return promisifyChromeApi(prefsApi.get, path)
}

async function setVivaldiPref(path, value) {
  const prefsApi = getVivaldiPrefsApi()
  if (!prefsApi || typeof prefsApi.set !== 'function') return false

  const result = prefsApi.set({ path, value })
  if (result && typeof result.then === 'function') {
    await result
  }

  return true
}

async function getConfiguredNewTabUrl() {
  let linkType = 'startpage'

  try {
    const value = await getVivaldiPref(VIVALDI_NEW_PAGE_LINK_PREF)
    linkType = typeof value === 'string' ? value : String(value || 'startpage')
  } catch (_error) {
    linkType = 'startpage'
  }

  if (linkType === 'homepage' || linkType === '1') {
    try {
      const homepage = await getVivaldiPref(VIVALDI_HOMEPAGE_PREF)
      return typeof homepage === 'string' && homepage ? homepage : VIVALDI_START_PAGE_URL
    } catch (_error) {
      return VIVALDI_START_PAGE_URL
    }
  }

  if (linkType === 'blankpage' || linkType === '2') {
    return VIVALDI_BLANK_PAGE_URL
  }

  if (linkType === 'extension' || linkType === '3') {
    return ''
  }

  if (linkType === 'custom' || linkType === '4') {
    try {
      const customUrl = await getVivaldiPref(VIVALDI_NEW_PAGE_CUSTOM_URL_PREF)
      return typeof customUrl === 'string' && customUrl ? customUrl : VIVALDI_START_PAGE_URL
    } catch (_error) {
      return VIVALDI_START_PAGE_URL
    }
  }

  return VIVALDI_START_PAGE_URL
}

function isTreeBookmarkFolder(node) {
  return !!(node && !node.url && typeof node.title === 'string' && node.title.startsWith(TREE_BOOKMARK_PREFIX))
}

function getTreeBookmarkTitle(title) {
  const value = typeof title === 'string' ? title : ''
  return value.startsWith(TREE_BOOKMARK_PREFIX) ? value.slice(TREE_BOOKMARK_PREFIX.length) : value
}

function getBookmarksBarNode(roots) {
  const root = Array.isArray(roots) ? roots[0] : null
  const children = Array.isArray(root && root.children) ? root.children : []
  return children.find(child => child && child.folderType === 'bookmarks-bar')
    || children.find(child => child && child.id === '1')
    || children.find(child => child && child.folderType === 'other')
    || children.find(child => child && child.id === '2')
    || null
}

function findTreeBookmarkContainerNode(roots) {
  const bookmarksBar = getBookmarksBarNode(roots)
  const parentChildren = Array.isArray(bookmarksBar && bookmarksBar.children) ? bookmarksBar.children : []
  return parentChildren.find(child => {
    return child && !child.url && child.title === TREE_BOOKMARK_CONTAINER_TITLE
  }) || null
}

function createTabsApi() {
  const tabsApi = chrome.tabs
  const windowsApi = chrome.windows
  const sessionsApi = chrome.sessions
  const bookmarksApi = chrome.bookmarks
  const pendingVivExtUpdateTabIds = new Set()
  const vivaldiBridge = createVivaldiBridge({
    getPrefsApi: getVivaldiPrefsApi,
    setPref: setVivaldiPref,
    promisifyChromeApi,
    workspacesPrefPath: VIVALDI_WORKSPACES_PREF,
    defaultWorkspaceIcon: VIVALDI_DEFAULT_WORKSPACE_ICON,
  })

  return {
    async getCurrentWindowId() {
      const win = await promisifyChromeApi(windowsApi.getCurrent, { populate: false })
      return win.id
    },

    async getTabs(windowId) {
      const tabs = await promisifyChromeApi(tabsApi.query, { windowId })
      return tabs.map(normalizeTab)
    },

    async getWorkspaces() {
      return vivaldiBridge.getWorkspaces()
    },

    async createWorkspace(name = 'New Workspace') {
      return vivaldiBridge.createWorkspace(name)
    },

    repairWorkspace(workspace) {
      vivaldiBridge.repairWorkspace(workspace)
    },

    activateTab(tabId) {
      tabsApi.update(tabId, { active: true })
    },

    async updateTab(tabId, properties) {
      if (!Number.isFinite(tabId) || !properties || typeof properties !== 'object') return null
      return promisifyChromeApi(tabsApi.update, tabId, properties)
    },

    setOpenerTab(tabId, openerTabId) {
      if (!Number.isFinite(tabId) || !Number.isFinite(openerTabId)) return
      tabsApi.update(tabId, { openerTabId })
    },

    async moveTab(tabId, index) {
      if (!Number.isFinite(tabId) || !Number.isFinite(index)) return null
      return promisifyChromeApi(tabsApi.move, tabId, { index })
    },

    closeTab(tabId) {
      tabsApi.remove(tabId)
    },

    closeTabs(tabIds) {
      tabsApi.remove(tabIds)
    },

    async duplicateTab(tabId) {
      if (!Number.isFinite(tabId) || typeof tabsApi.duplicate !== 'function') return null
      return promisifyChromeApi(tabsApi.duplicate, tabId)
    },

    async tileTabs(tabIds, layout) {
      return vivaldiBridge.tileTabs(tabIds, layout)
    },

    async restoreLastClosedTab() {
      if (!sessionsApi || typeof sessionsApi.restore !== 'function') return null
      return new Promise((resolve, reject) => {
        try {
          sessionsApi.restore(result => {
            const runtimeError = chrome.runtime && chrome.runtime.lastError
            if (runtimeError) {
              reject(new Error(runtimeError.message))
              return
            }
            resolve(result)
          })
        } catch (error) {
          reject(error)
        }
      })
    },

    async getSavedBookmarkTrees() {
      if (!bookmarksApi || typeof bookmarksApi.getTree !== 'function') return []
      const roots = await promisifyChromeApi(bookmarksApi.getTree)
      const container = findTreeBookmarkContainerNode(roots)
      if (!container) return []
      const result = (Array.isArray(container.children) ? container.children : [])
        .filter(child => isTreeBookmarkFolder(child))
        .map(child => ({
          id: child.id,
          title: getTreeBookmarkTitle(child.title),
        }))
      return result.sort((left, right) => String(left.title || '').localeCompare(String(right.title || '')))
    },

    async saveBookmarkTree(tree) {
      if (!bookmarksApi || typeof bookmarksApi.create !== 'function') return null
      if (!tree || !tree.url) return null

      async function getTreeBookmarkContainerId() {
        if (typeof bookmarksApi.getTree !== 'function') return undefined
        const roots = await promisifyChromeApi(bookmarksApi.getTree)
        const bookmarksBar = getBookmarksBarNode(roots)
        const parentId = bookmarksBar ? bookmarksBar.id : undefined
        const existingContainer = findTreeBookmarkContainerNode(roots)
        if (existingContainer) return existingContainer.id

        const container = await promisifyChromeApi(bookmarksApi.create, {
          ...(parentId ? { parentId } : {}),
          title: TREE_BOOKMARK_CONTAINER_TITLE,
        })
        return container.id
      }

      async function createTreeFolder(node, parentId) {
        const folder = await promisifyChromeApi(bookmarksApi.create, {
          ...(parentId ? { parentId } : {}),
          title: `${TREE_BOOKMARK_PREFIX}${node.title || 'Saved Tree'}`,
        })
        await promisifyChromeApi(bookmarksApi.create, {
          parentId: folder.id,
          title: node.title || node.url,
          url: node.url,
        })

        for (const child of Array.isArray(node.children) ? node.children : []) {
          if (child && Array.isArray(child.children) && child.children.length > 0) {
            await createTreeFolder(child, folder.id)
            continue
          }

          if (child && child.url) {
            await promisifyChromeApi(bookmarksApi.create, {
              parentId: folder.id,
              title: child.title || child.url,
              url: child.url,
            })
          }
        }

        return folder
      }

      return createTreeFolder(tree, await getTreeBookmarkContainerId())
    },

    async getSavedBookmarkTree(folderId) {
      if (!bookmarksApi || typeof bookmarksApi.getSubTree !== 'function') return null
      if (folderId == null || folderId === '') return null
      const nodes = await promisifyChromeApi(bookmarksApi.getSubTree, String(folderId))
      const root = Array.isArray(nodes) ? nodes[0] : null
      if (!isTreeBookmarkFolder(root)) return null

      function parseFolder(folder) {
        const children = Array.isArray(folder && folder.children) ? folder.children : []
        const parentBookmark = children.find(child => child && child.url)
        if (!parentBookmark) return null

        const parsed = {
          title: parentBookmark.title || getTreeBookmarkTitle(folder.title) || parentBookmark.url,
          url: parentBookmark.url,
          children: [],
        }
        let skippedParent = false

        for (const child of children) {
          if (!skippedParent && child.id === parentBookmark.id) {
            skippedParent = true
            continue
          }

          if (isTreeBookmarkFolder(child)) {
            const subtree = parseFolder(child)
            if (subtree) parsed.children.push(subtree)
            continue
          }

          if (child && child.url) {
            parsed.children.push({
              title: child.title || child.url,
              url: child.url,
              children: [],
            })
          }
        }

        return parsed
      }

      return parseFolder(root)
    },

    async deleteSavedBookmarkTree(folderId) {
      if (!bookmarksApi || typeof bookmarksApi.removeTree !== 'function') return false
      if (folderId == null || folderId === '') return false
      await promisifyChromeApi(bookmarksApi.removeTree, String(folderId))
      return true
    },

    async moveTabsToNewWindow(tabIds) {
      const ids = Array.isArray(tabIds) ? tabIds.filter(Number.isFinite) : []
      if (ids.length === 0) return null
      if (vivaldiBridge && typeof vivaldiBridge.detachTabsToNewWindow === 'function') {
        const detached = await vivaldiBridge.detachTabsToNewWindow(ids)
        if (detached) return { native: true }
      }
      console.warn('[svb] native Vivaldi detachPage is unavailable; move to new window skipped')
      return null
    },

    async updateVivExtData(tabId, vivExtData) {
      pendingVivExtUpdateTabIds.add(tabId)
      try {
        return await promisifyChromeApi(
          tabsApi.update,
          tabId,
          { vivExtData: JSON.stringify(vivExtData || {}) }
        )
      } catch (error) {
        pendingVivExtUpdateTabIds.delete(tabId)
        throw error
      }
    },

    async createRestoredTab(windowId, options = {}) {
      if (windowId == null) return null
      const createProperties = {
        windowId,
        active: !!options.active,
        transition: 'auto_bookmark',
        ignoreLinkRouting: true,
      }

      if (typeof options.url === 'string' && options.url) {
        createProperties.url = options.url
      }

      if (Number.isFinite(options.index)) {
        createProperties.index = options.index
      }

      const vivExtData = serializeVivExtData(options.vivExtData)
      if (vivExtData) {
        createProperties.vivExtData = vivExtData
      }

      return normalizeTab(await promisifyChromeApi(tabsApi.create, createProperties))
    },

    isOwnVivExtUpdate(tabId, changeInfo) {
      if (!pendingVivExtUpdateTabIds.has(tabId)) return false
      const info = changeInfo && typeof changeInfo === 'object' ? changeInfo : {}
      const keys = Object.keys(info)
      const isVivExtOnly = keys.length === 1 && keys[0] === 'vivExtData'
      if (!isVivExtOnly) return false
      pendingVivExtUpdateTabIds.delete(tabId)
      return true
    },

    createTab(windowId, options = {}) {
      tabsApi.query({ windowId }, async tabs => {
        const index = Array.isArray(tabs) ? tabs.length : undefined
        const createProperties = {
          windowId,
          active: true,
          index,
          transition: 'auto_bookmark',
          ignoreLinkRouting: true,
        }

        const url = typeof options.url === 'string' && options.url
          ? options.url
          : await getConfiguredNewTabUrl()
        if (url) {
          createProperties.url = url
        }

        const vivExtData = serializeVivExtData(options.vivExtData)
        if (vivExtData) {
          createProperties.vivExtData = vivExtData
        }

        tabsApi.create(createProperties)
      })
    },

    createChildTab(windowId, openerTabId, options = {}) {
      void (async () => {
        const createProperties = {
          windowId,
          active: true,
          openerTabId,
          transition: 'link',
          ignoreLinkRouting: true,
        }

        const url = typeof options.url === 'string' && options.url
          ? options.url
          : await getConfiguredNewTabUrl()
        if (url) {
          createProperties.url = url
        }

        if (Number.isFinite(options.index)) {
          createProperties.index = options.index
        }

        const vivExtData = serializeVivExtData(options.vivExtData)
        if (vivExtData) {
          createProperties.vivExtData = vivExtData
        }

        tabsApi.create(createProperties)
      })()
    },

    onCreated(listener) {
      const wrapped = tab => listener(normalizeTab(tab))
      tabsApi.onCreated.addListener(wrapped)
      return () => tabsApi.onCreated.removeListener(wrapped)
    },

    onUpdated(listener) {
      const wrapped = (tabId, changeInfo, tab) => listener(tabId, changeInfo, normalizeTab(tab))
      tabsApi.onUpdated.addListener(wrapped)
      return () => tabsApi.onUpdated.removeListener(wrapped)
    },

    onRemoved(listener) {
      tabsApi.onRemoved.addListener(listener)
      return () => tabsApi.onRemoved.removeListener(listener)
    },

    onMoved(listener) {
      tabsApi.onMoved.addListener(listener)
      return () => tabsApi.onMoved.removeListener(listener)
    },

    onAttached(listener) {
      tabsApi.onAttached.addListener(listener)
      return () => tabsApi.onAttached.removeListener(listener)
    },

    onDetached(listener) {
      tabsApi.onDetached.addListener(listener)
      return () => tabsApi.onDetached.removeListener(listener)
    },

    onActivated(listener) {
      tabsApi.onActivated.addListener(listener)
      return () => tabsApi.onActivated.removeListener(listener)
    },

    onBookmarksChanged(listener) {
      if (!bookmarksApi) return () => {}
      const eventNames = ['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered', 'onImportEnded']
      const removers = []

      for (const eventName of eventNames) {
        const event = bookmarksApi[eventName]
        if (!event || typeof event.addListener !== 'function' || typeof event.removeListener !== 'function') {
          continue
        }

        event.addListener(listener)
        removers.push(() => event.removeListener(listener))
      }

      return () => removers.forEach(remove => remove())
    },
  }
}

module.exports = { createTabsApi }

    },
    "adapters/theme.js": function(require, module, exports) {
function readCssVar(style, name) {
  return style.getPropertyValue(name).trim()
}

function isTransparentColor(value) {
  if (!value) return true

  const normalized = String(value).trim().toLowerCase()
  if (!normalized) return true
  if (normalized === 'transparent') return true
  if (normalized === 'rgba(0, 0, 0, 0)' || normalized === 'rgba(0,0,0,0)') return true
  if (normalized === 'hsla(0, 0%, 0%, 0)' || normalized === 'hsla(0,0%,0%,0)') return true

  const rgbaMatch = normalized.match(/^rgba\((.+)\)$/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map(part => part.trim())
    const alpha = Number(parts[3])
    if (!Number.isNaN(alpha) && alpha <= 0) return true
  }

  const hslaMatch = normalized.match(/^hsla\((.+)\)$/)
  if (hslaMatch) {
    const parts = hslaMatch[1].split(',').map(part => part.trim())
    const alpha = Number(parts[3])
    if (!Number.isNaN(alpha) && alpha <= 0) return true
  }

  return false
}

function firstUsable(values, fallback, options) {
  const { allowTransparent = false } = options || {}

  for (const value of values) {
    const normalized = value && String(value).trim()
    if (!normalized) continue
    if (!allowTransparent && isTransparentColor(normalized)) continue
    return normalized
  }
  return fallback
}

function setVar(style, name, value) {
  if (!value) return
  style.setProperty(name, value)
}

function createThemeAdapter(root) {
  const browserEl = document.querySelector('#browser')
  if (!browserEl) {
    return {
      start() {},
      apply() {},
    }
  }

  const browserStyle = () => getComputedStyle(browserEl)

  function resolveThemeValues() {
    const b = browserStyle()
    const tabbarWrapper = document.querySelector('.tabbar-wrapper')
    const panelGroup = document.querySelector('.panel-group')
    const tabsSubcontainer = document.querySelector('#tabs-subcontainer')
    const tabsContainer = document.querySelector('#tabs-container')
    const activeNativeTab = document.querySelector('#tabs-container .tab.active, #tabs-subcontainer .tab.active')
    const nativeTab = document.querySelector('#tabs-container .tab:not(.active), #tabs-subcontainer .tab:not(.active)')

    const tabbarWrapperStyle = tabbarWrapper ? getComputedStyle(tabbarWrapper) : null
    const panelStyle = panelGroup ? getComputedStyle(panelGroup) : null
    const subcontainerStyle = tabsSubcontainer ? getComputedStyle(tabsSubcontainer) : null
    const tabsContainerStyle = tabsContainer ? getComputedStyle(tabsContainer) : null
    const activeTabStyle = activeNativeTab ? getComputedStyle(activeNativeTab) : null
    const nativeTabStyle = nativeTab ? getComputedStyle(nativeTab) : null

    const browserBg = b.backgroundColor
    const browserFg = b.color
    const accentBgDark = readCssVar(b, '--colorAccentBgDark')
    const accentBgDarker = readCssVar(b, '--colorAccentBgDarker')
    const accentFg = readCssVar(b, '--colorAccentFg')
    const colorFg = readCssVar(b, '--colorFg')
    const colorBorderSubtle = readCssVar(b, '--colorBorderSubtle')
    const highlightBg = readCssVar(b, '--colorHighlightBg')
    const radius = readCssVar(b, '--radius') || readCssVar(b, '--radiusHalf')
    const currentRadius = readCssVar(b, '--currentRadius')

    const panelBg = firstUsable([
      tabbarWrapperStyle && tabbarWrapperStyle.backgroundColor,
      panelStyle && panelStyle.backgroundColor,
      subcontainerStyle && subcontainerStyle.backgroundColor,
      tabsContainerStyle && tabsContainerStyle.backgroundColor,
      accentBgDark,
      browserBg,
    ], '#232629')

    const panelBorder = firstUsable([
      colorBorderSubtle,
      tabbarWrapperStyle && tabbarWrapperStyle.borderColor,
      accentBgDarker,
      readCssVar(b, '--colorBorder'),
      'rgba(255,255,255,0.06)',
    ], 'rgba(255,255,255,0.06)', { allowTransparent: true })

    const panelFg = firstUsable([
      panelStyle && panelStyle.color,
      colorFg,
      browserFg,
    ], '#d8d8d8')

    const tabBg = firstUsable([
      nativeTabStyle && nativeTabStyle.backgroundColor,
      panelBg,
    ], panelBg)

    const tabHoverBg = firstUsable([
      readCssVar(b, '--colorBgInverser'),
      readCssVar(b, '--colorBgIntense'),
      'rgba(255,255,255,0.08)',
    ], 'rgba(255,255,255,0.08)', { allowTransparent: true })

    const activeTabBg = firstUsable([
      activeTabStyle && activeTabStyle.backgroundColor,
      accentBgDark,
      tabBg,
    ], tabBg)

    const activeTabFg = firstUsable([
      activeTabStyle && activeTabStyle.color,
      accentFg,
      panelFg,
    ], panelFg)

    const accent = firstUsable([
      highlightBg,
      accentFg,
      '#47cfff',
    ], '#47cfff')

    const radiusValue = firstUsable([
      currentRadius,
      radius,
      '5px',
    ], '5px', { allowTransparent: true })

    return {
      panelBg,
      panelBorder,
      panelFg,
      tabBg,
      tabHoverBg,
      activeTabBg,
      activeTabFg,
      accent,
      radiusValue,
    }
  }

  function apply() {
    const vars = resolveThemeValues()
    const style = root.style

    setVar(style, '--svb-theme-panel-bg', vars.panelBg)
    setVar(style, '--svb-theme-panel-border', vars.panelBorder)
    setVar(style, '--svb-theme-panel-fg', vars.panelFg)
    setVar(style, '--svb-theme-tab-bg', vars.tabBg)
    setVar(style, '--svb-theme-tab-hover-bg', vars.tabHoverBg)
    setVar(style, '--svb-theme-tab-active-bg', vars.activeTabBg)
    setVar(style, '--svb-theme-tab-active-fg', vars.activeTabFg)
    setVar(style, '--svb-theme-accent', vars.accent)
    setVar(style, '--svb-theme-radius', vars.radiusValue)
  }

  function start() {
    apply()

    const observer = new MutationObserver(() => {
      apply()
    })

    observer.observe(browserEl, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
  }

  return { start, apply }
}

module.exports = { createThemeAdapter }

    },
    "adapters/layout.js": function(require, module, exports) {
function createLayoutAdapter(options) {
  const { root, host, trigger, dragShield, panelStore } = options
  const MIN_WIDTH = 30
  const MAX_WIDTH = 520
  let observer = null
  let resizeHandler = null
  let revealed = false
  let unlistenPanel = null
  let currentPinned = panelStore.getState().pinned
  let currentWidth = panelStore.getState().width
  let dragState = null
  let fullscreen = false
  let windowFullscreen = false

  function hasFullscreenClass(element) {
    if (!element || !element.classList) return false
    return element.classList.contains('fullscreen')
      || element.classList.contains('is-fullscreen')
      || element.classList.contains('fullscreened')
  }

  function getRenderedWidth() {
    return dragState ? dragState.previewWidth : currentWidth
  }

  function detectFullscreen() {
    const browser = document.querySelector('#browser')
    const app = document.querySelector('#app')
    return windowFullscreen
      || !!document.fullscreenElement
      || !!document.webkitFullscreenElement
      || !!document.mozFullScreenElement
      || !!document.msFullscreenElement
      || hasFullscreenClass(document.documentElement)
      || hasFullscreenClass(document.body)
      || hasFullscreenClass(browser)
      || hasFullscreenClass(app)
  }

  function apply() {
    if (!host || !root || !trigger || !dragShield) return

    if (!host.classList.contains('svb-layout-host')) {
      host.classList.add('svb-layout-host')
    }

    if (host.style.getPropertyValue('--svb-sidebar-width') !== `${currentWidth}px`) {
      host.style.setProperty('--svb-sidebar-width', `${currentWidth}px`)
    }

    if (root.style.width !== `${getRenderedWidth()}px`) {
      root.style.width = `${getRenderedWidth()}px`
    }

    host.classList.toggle('svb-mode-docked', currentPinned)
    host.classList.toggle('svb-mode-overlay', !currentPinned)
    host.classList.toggle('svb-is-fullscreen', fullscreen)
    root.classList.toggle('is-revealed', !fullscreen && (currentPinned || revealed))
    trigger.classList.toggle('is-enabled', !fullscreen && !currentPinned)
    dragShield.classList.toggle('is-active', !fullscreen && Boolean(dragState))
  }

  function refreshFullscreen() {
    const nextFullscreen = detectFullscreen()
    if (fullscreen === nextFullscreen) return
    fullscreen = nextFullscreen
    if (fullscreen) {
      revealed = false
      stopDragging()
    }
    apply()
  }

  function setRevealed(value) {
    if (currentPinned) return
    if (revealed === value) return
    revealed = value
    apply()
  }

  function stopDragging() {
    if (!dragState) return
    const { previewWidth } = dragState
    window.removeEventListener('pointermove', dragState.onPointerMove)
    window.removeEventListener('pointerup', dragState.onPointerUp)
    document.body.classList.remove('svb-is-resizing')
    dragState = null
    panelStore.setWidth(previewWidth)
    apply()
  }

  function startDragging(event) {
    const handle = event.target.closest('.svb-resize-handle')
    if (!handle || !host) return

    event.preventDefault()

    const hostRect = host.getBoundingClientRect()
    const onPointerMove = moveEvent => {
      dragState.previewWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(moveEvent.clientX - hostRect.left)))
      apply()
    }
    const onPointerUp = () => {
      stopDragging()
    }

    dragState = {
      previewWidth: currentWidth,
      onPointerMove,
      onPointerUp,
    }
    document.body.classList.add('svb-is-resizing')
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function start() {
    fullscreen = detectFullscreen()
    apply()

    const windowsApi = typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null
    const updateWindowFullscreen = win => {
      const nextWindowFullscreen = !!(win && win.state === 'fullscreen')
      if (windowFullscreen === nextWindowFullscreen) return
      windowFullscreen = nextWindowFullscreen
      refreshFullscreen()
    }
    if (windowsApi && typeof windowsApi.getCurrent === 'function') {
      windowsApi.getCurrent(updateWindowFullscreen)
    }
    if (windowsApi && windowsApi.onBoundsChanged && typeof windowsApi.onBoundsChanged.addListener === 'function') {
      windowsApi.onBoundsChanged.addListener(updateWindowFullscreen)
    }

    resizeHandler = () => apply()
    window.addEventListener('resize', resizeHandler)

    observer = new MutationObserver(() => {
      refreshFullscreen()
      apply()
    })

    const browser = document.querySelector('#browser')
    if (browser) {
      observer.observe(browser, {
        childList: true,
        subtree: true,
      })
    }

    document.addEventListener('fullscreenchange', refreshFullscreen)
    document.addEventListener('webkitfullscreenchange', refreshFullscreen)
    document.addEventListener('mozfullscreenchange', refreshFullscreen)
    document.addEventListener('MSFullscreenChange', refreshFullscreen)
    window.addEventListener('resize', refreshFullscreen)

    trigger.addEventListener('mouseenter', () => setRevealed(true))
    root.addEventListener('mouseenter', () => setRevealed(true))
    root.addEventListener('mouseleave', () => setRevealed(false))
    root.addEventListener('pointerdown', startDragging)

    unlistenPanel = panelStore.subscribe(nextState => {
      currentPinned = nextState.pinned
      currentWidth = nextState.width
      if (currentPinned) {
        revealed = false
      }
      apply()
    })
  }

  return { apply, start }
}

module.exports = { createLayoutAdapter }

    },
    "generated/workspaces-data.js": function(require, module, exports) {
module.exports = {
  "WORKSPACES_BY_ID": {
    "1776500650297": {
      "id": 1776500650297,
      "name": "Home"
    },
    "1776503397106": {
      "id": 1776503397106,
      "name": "Work"
    }
  }
}

    },
    "ui/render.js": function(require, module, exports) {
const { WORKSPACES_BY_ID } = require('../generated/workspaces-data.js')

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const TAB_COLOR_SWATCHES = {
  rose: 'hsl(350deg 72% 64%)',
  amber: 'hsl(34deg 92% 60%)',
  yellow: 'hsl(49deg 96% 58%)',
  green: 'hsl(142deg 52% 52%)',
  teal: 'hsl(179deg 48% 46%)',
  blue: 'hsl(211deg 82% 62%)',
  purple: 'hsl(268deg 66% 66%)',
  pink: 'hsl(319deg 72% 64%)',
}

function renderMenuIcon(name) {
  const paths = {
    restore: '<path d="M5 8a6 6 0 1 1 1.8 4.3"/><path d="M5 4v4h4"/>',
    child: '<path d="M5 5h6v6H5z"/><path d="M11 8h4a4 4 0 0 1 4 4v1"/><path d="M16 11l3 3 3-3"/>',
    move: '<path d="M5 12h14"/><path d="M15 8l4 4-4 4"/>',
    window: '<path d="M4 6h16v12H4z"/><path d="M4 9h16"/>',
    workspace: '<path d="M5 5h6v6H5z"/><path d="M13 5h6v6h-6z"/><path d="M5 13h6v6H5z"/><path d="M13 13h6v6h-6z"/>',
    pin: '<path d="M8 4h8"/><path d="M10 4c.8 2.2.8 4.2 0 6l-3 4h10l-3-4c-.8-1.8-.8-3.8 0-6"/><path d="M12 14v6"/>',
    mute: '<path d="M4 10v4h3l4 3V7l-4 3H4z"/><path d="M16 9l4 6"/><path d="M20 9l-4 6"/>',
    duplicate: '<path d="M8 8h10v10H8z"/><path d="M5 15V5h10"/>',
    close: '<path d="M7 7l10 10"/><path d="M17 7 7 17"/>',
    add: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    bookmark: '<path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V20l-6-3.5L6 20z"/>',
    folder: '<path d="M4 7h6l2 2h8v9H4z"/><path d="M4 7v11"/>',
    color: '<path d="M12 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/><path d="M19 15.5a2 2 0 1 1-4 0c0-1.4 2-3.8 2-3.8s2 2.4 2 3.8Z"/><path d="M8.5 18a1.5 1.5 0 1 1-3 0c0-1 1.5-2.9 1.5-2.9S8.5 17 8.5 18Z"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
  }
  return `<svg class="svb-menu__icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.workspace}</svg>`
}

function renderContextMenuItem(options) {
  const {
    action,
    icon,
    label,
    disabled = false,
    danger = false,
    submenu = '',
    workspaceId,
    bookmarkTreeId,
  } = options
  const attrs = [
    'class="svb-menu__item' + (danger ? ' is-danger' : '') + (disabled ? ' is-disabled' : '') + (submenu ? ' has-submenu' : '') + '"',
    disabled ? 'aria-disabled="true"' : '',
    action ? `data-role="context-menu-action" data-action="${escapeHtml(action)}"` : '',
    Number.isFinite(workspaceId) ? `data-workspace-id="${workspaceId}"` : '',
    bookmarkTreeId != null ? `data-bookmark-tree-id="${escapeHtml(bookmarkTreeId)}"` : '',
  ].filter(Boolean).join(' ')
  const tag = submenu ? 'div' : 'button'
  const type = tag === 'button' ? ' type="button"' : ''

  return `
    <${tag} ${attrs}${type}>
      ${renderMenuIcon(icon)}
      <span class="svb-menu__label">${escapeHtml(label)}</span>
      ${submenu ? `${renderMenuIcon('chevron')}<span class="svb-menu__submenu">${submenu}</span>` : ''}
    </${tag}>
  `
}

function renderContextMenuColorItem(colorKey, label, currentColorKey) {
  const swatch = colorKey ? TAB_COLOR_SWATCHES[colorKey] : 'transparent'
  const currentClass = currentColorKey === colorKey ? ' is-current' : ''
  const swatchClass = colorKey ? '' : ' is-clear'

  return `
    <button
      class="svb-menu__item svb-menu__item--color${currentClass}"
      type="button"
      data-role="context-menu-action"
      data-action="set-color"
      data-color-key="${escapeHtml(colorKey || '')}"
    >
      <span class="svb-menu__swatch${swatchClass}" style="--svb-menu-swatch:${escapeHtml(swatch)}"></span>
      <span class="svb-menu__label">${escapeHtml(label)}</span>
    </button>
  `
}

function renderSavedTreeMenuItem(tree) {
  const treeId = tree && tree.id != null ? String(tree.id) : ''
  const title = tree && tree.title ? tree.title : 'Saved Tree'

  return `
    <div class="svb-menu__saved-tree">
      <button
        class="svb-menu__item svb-menu__saved-tree-open"
        type="button"
        data-role="context-menu-action"
        data-action="open-saved-tree"
        data-bookmark-tree-id="${escapeHtml(treeId)}"
      >
        ${renderMenuIcon('folder')}
        <span class="svb-menu__label">${escapeHtml(title)}</span>
      </button>
      <button
        class="svb-menu__saved-tree-delete"
        type="button"
        title="Delete saved tree"
        data-role="context-menu-action"
        data-action="delete-saved-tree"
        data-bookmark-tree-id="${escapeHtml(treeId)}"
      >
        ×
      </button>
    </div>
  `
}

function renderContextMenu(tab, state, contextMenu) {
  if (!contextMenu || !tab) return ''
  const selectedIds = Array.isArray(state.selectedIds) ? state.selectedIds : []
  const selectedCount = selectedIds.includes(tab.id) ? selectedIds.length : 1
  const closeLabel = selectedCount > 1 ? 'Close Selected Tabs' : 'Close Tab'
  const pinLabel = tab.pinned ? 'Unpin Tab' : 'Pin Tab'
  const muteLabel = tab.muted ? 'Unmute Tab' : 'Mute Tab'
  const currentColorKey = selectedCount === 1
    && tab.vivExtData
    && typeof tab.vivExtData.tabColor === 'string'
    && TAB_COLOR_SWATCHES[tab.vivExtData.tabColor]
      ? tab.vivExtData.tabColor
      : ''
  const isPinned = !!tab.pinned
  const hasChildren = Array.isArray(state.treeTabs)
    && state.treeTabs.some(item => item && item.id === tab.id && item.hasChildren)
  const workspaces = (Array.isArray(state.workspaces) && state.workspaces.length
    ? state.workspaces
    : Object.values(WORKSPACES_BY_ID || {}))
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))

  const workspaceItems = workspaces.map(workspace => renderContextMenuItem({
    action: 'move-workspace',
    icon: 'workspace',
    label: workspace.name || `Workspace ${workspace.id}`,
    workspaceId: Number(workspace.id),
  })).join('')

  const moveSubmenu = `
    ${renderContextMenuItem({ action: 'move-window', icon: 'window', label: 'New Window' })}
    <div class="svb-menu__separator"></div>
    ${workspaceItems || '<div class="svb-menu__empty">No Workspaces</div>'}
    ${renderContextMenuItem({ action: 'move-new-workspace', icon: 'add', label: 'Create New Workspace and Move Here' })}
  `
  const colorSubmenu = `
    ${renderContextMenuColorItem('rose', 'Rose', currentColorKey)}
    ${renderContextMenuColorItem('amber', 'Amber', currentColorKey)}
    ${renderContextMenuColorItem('yellow', 'Yellow', currentColorKey)}
    ${renderContextMenuColorItem('green', 'Green', currentColorKey)}
    ${renderContextMenuColorItem('teal', 'Teal', currentColorKey)}
    ${renderContextMenuColorItem('blue', 'Blue', currentColorKey)}
    ${renderContextMenuColorItem('purple', 'Purple', currentColorKey)}
    ${renderContextMenuColorItem('pink', 'Pink', currentColorKey)}
    <div class="svb-menu__separator"></div>
    ${renderContextMenuColorItem('', 'Clear Color', currentColorKey)}
  `
  const savedTrees = Array.isArray(state.savedBookmarkTrees) ? state.savedBookmarkTrees : []
  const savedTreeSubmenu = savedTrees.map(renderSavedTreeMenuItem).join('')
  const menuX = Math.max(4, contextMenu.x)
  const menuY = Math.max(4, contextMenu.y)

  return `
    <div
      class="svb-menu"
      style="left:${menuX}px;top:${menuY}px"
      data-tab-id="${tab.id}"
      role="menu"
    >
      ${renderContextMenuItem({ action: 'restore-closed', icon: 'restore', label: 'Reopen Last Closed Tab' })}
      ${renderContextMenuItem({ action: 'new-child', icon: 'child', label: 'New Child Tab', disabled: isPinned })}
      ${renderContextMenuItem({ action: 'new-sibling', icon: 'add', label: 'New Sibling Tab Below', disabled: isPinned })}
      ${renderContextMenuItem({ action: 'save-tree-bookmark', icon: 'bookmark', label: 'Save Tree as Bookmark', disabled: isPinned || !hasChildren })}
      ${renderContextMenuItem({ icon: 'folder', label: 'Open Saved Tree', submenu: savedTreeSubmenu || '<div class="svb-menu__empty">No Saved Trees</div>' })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ icon: 'move', label: 'Move to', submenu: moveSubmenu })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ action: 'toggle-pin', icon: 'pin', label: pinLabel })}
      ${renderContextMenuItem({ action: 'toggle-mute', icon: 'mute', label: muteLabel })}
      ${renderContextMenuItem({ icon: 'color', label: 'Set Color', submenu: colorSubmenu })}
      ${renderContextMenuItem({ action: 'duplicate', icon: 'duplicate', label: 'Duplicate' })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ action: 'close', icon: 'close', label: closeLabel, danger: true, disabled: !state.canCloseVisibleTabs })}
      ${renderContextMenuItem({ action: 'close-other', icon: 'close', label: 'Close Other Tabs', danger: true })}
      ${renderContextMenuItem({ action: 'close-below', icon: 'close', label: 'Close Tabs Below', danger: true })}
      ${renderContextMenuItem({ action: 'close-above', icon: 'close', label: 'Close Tabs Above', danger: true })}
    </div>
  `
}

function renderExpander(item) {
  if (!item || !item.hasChildren) return ''

  return `
    <span
      class="svb-tab__exp${item.collapsed ? ' is-collapsed' : ''}"
      data-role="toggle-collapse"
      data-tab-id="${item.id}"
      aria-hidden="true"
    >
      <svg class="svb-tab__exp-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="m3.17 6.73.66-1.13L8 9.3l4.17-3.7.66 1.13L8 11.03l-4.83-4.3Z"></path>
      </svg>
    </span>
  `
}

function renderChildCount(item) {
  const branchCount = item && item.subtreeSize ? Math.max(0, item.subtreeSize - 1) : 0
  if (!item || !item.hasChildren || !item.collapsed || !branchCount) return ''
  return `<span class="svb-tab__child-count" aria-hidden="true">${branchCount}</span>`
}

function renderDropIndicator(dropPosition) {
  if (!dropPosition) return ''
  return `<span class="svb-tab__drop-indicator is-${dropPosition}" aria-hidden="true"></span>`
}

function renderAddButton(tabId) {
  return `<span class="svb-tab__add" data-role="create-child-tab" data-tab-id="${tabId}" title="New child tab">+</span>`
}

function renderTreeGuides(item) {
  if (!item) return ''
  const branchGuide = item.hasChildren && !item.collapsed && item.visibleBranchSize > 1
    ? `<span class="svb-tab__guide svb-tab__guide--branch" style="--svb-guide-level:${item.depth};--svb-guide-branch-size:${item.visibleBranchSize}" aria-hidden="true"></span>`
    : ''
  if (!branchGuide) return ''

  return `
    <span class="svb-tab__guides" aria-hidden="true">
      ${branchGuide}
    </span>
  `
}

function findDirectChild(parent, selector) {
  return Array.from(parent.children).find(child => child.matches(selector)) || null
}

function syncOptionalDirectChild(parent, selector, html, insertBeforeNode = null) {
  const current = findDirectChild(parent, selector)
  if (!html) {
    if (current) current.remove()
    return null
  }

  const nextNode = createNodeFromHtml(html)
  if (!current) {
    parent.insertBefore(nextNode, insertBeforeNode)
    return nextNode
  }

  if (current.outerHTML !== nextNode.outerHTML) {
    current.replaceWith(nextNode)
    return nextNode
  }

  return current
}

function syncTabLeadIcon(lead, tab) {
  const current = Array.from(lead.children).find(child => child.matches('.svb-tab__spinner, .svb-tab__favicon'))
  if (tab.loading) {
    if (current && current.matches('.svb-tab__spinner')) return current

    const spinner = createNodeFromHtml('<span class="svb-tab__spinner" aria-hidden="true"></span>')
    if (current) current.replaceWith(spinner)
    else lead.appendChild(spinner)
    return spinner
  }

  if (tab.favIconUrl) {
    if (current && current.matches('img.svb-tab__favicon')) {
      if (current.getAttribute('src') !== tab.favIconUrl) {
        current.setAttribute('src', tab.favIconUrl)
      }
      current.setAttribute('alt', '')
      current.className = 'svb-tab__favicon'
      return current
    }

    const favicon = createNodeFromHtml(`<img class="svb-tab__favicon" src="${escapeHtml(tab.favIconUrl)}" alt="">`)
    if (current) current.replaceWith(favicon)
    else lead.appendChild(favicon)
    return favicon
  }

  if (current && current.matches('.svb-tab__favicon--fallback')) {
    current.className = 'svb-tab__favicon svb-tab__favicon--fallback'
    return current
  }

  const fallback = createNodeFromHtml('<span class="svb-tab__favicon svb-tab__favicon--fallback"></span>')
  if (current) current.replaceWith(fallback)
  else lead.appendChild(fallback)
  return fallback
}

function syncTabContent(content, tab, editing) {
  if (editing) {
    let input = findDirectChild(content, '.svb-tab__title-input')
    if (!input) {
      content.innerHTML = `<input class="svb-tab__title-input" data-role="rename-input" data-tab-id="${tab.id}" value="${escapeHtml(tab.title)}" spellcheck="false">`
      input = findDirectChild(content, '.svb-tab__title-input')
    }

    if (input) {
      const desiredValue = String(tab.title || '')
      input.setAttribute('data-tab-id', String(tab.id))
      if (input.value !== desiredValue && document.activeElement !== input) {
        input.value = desiredValue
      }
    }

    const badge = findDirectChild(content, '.svb-tab__badge')
    if (badge) badge.remove()
    return
  }

  let titleNode = findDirectChild(content, '.svb-tab__title')
  if (!titleNode) {
    content.innerHTML = '<span class="svb-tab__title"></span>'
    titleNode = findDirectChild(content, '.svb-tab__title')
  }
  if (titleNode && titleNode.textContent !== tab.title) {
    titleNode.textContent = tab.title
  }

  const mediaHtml = tab.muted
    ? '<span class="svb-tab__badge">Muted</span>'
    : tab.audible
      ? '<span class="svb-tab__badge">Audio</span>'
      : ''
  syncOptionalDirectChild(content, '.svb-tab__badge', mediaHtml, null)
}

function getTabVisualStyle(tab) {
  const styles = []
  const tiling = tab && tab.vivExtData && tab.vivExtData.tiling
  const tileId = tiling && tiling.id ? String(tiling.id) : ''
  const tabColorKey = tab && tab.vivExtData && typeof tab.vivExtData.tabColor === 'string'
    ? tab.vivExtData.tabColor
    : ''
  const tabColor = tabColorKey && TAB_COLOR_SWATCHES[tabColorKey] ? TAB_COLOR_SWATCHES[tabColorKey] : ''

  if (tabColor) {
    styles.push(`--svb-tab-color:${tabColor}`)
  }

  if (!tileId) {
    return styles.join(';')
  }

  const palette = [
    { h: 210, s: 60, l: 62 },
    { h: 155, s: 48, l: 56 },
    { h: 28, s: 68, l: 60 },
    { h: 286, s: 44, l: 62 },
    { h: 350, s: 58, l: 62 },
    { h: 48, s: 72, l: 58 },
    { h: 188, s: 54, l: 58 },
    { h: 118, s: 40, l: 58 },
  ]

  let hash = 0
  for (let index = 0; index < tileId.length; index += 1) {
    hash = ((hash << 5) - hash + tileId.charCodeAt(index)) | 0
  }

  const swatch = palette[Math.abs(hash) % palette.length]
  styles.push(`--svb-tile-accent:hsl(${swatch.h}deg ${swatch.s}% ${swatch.l}%)`)
  return styles.join(';')
}

function getDropPositionForEvent(tabButton, event) {
  const rect = tabButton.getBoundingClientRect()
  const offsetY = event.clientY - rect.top
  const zone = rect.height * 0.25

  if (offsetY < zone) return 'before'
  if (offsetY > rect.height - zone) return 'after'
  return 'inside'
}

function getTabVisualState(tabId, item, visualState) {
  const activeTabId = visualState && Number.isFinite(visualState.activeTabId) ? visualState.activeTabId : null
  const selectedIdSet = visualState && visualState.selectedIdSet ? visualState.selectedIdSet : null
  const draggedIdSet = visualState && visualState.draggedIdSet ? visualState.draggedIdSet : null
  const dropTargetId = visualState ? visualState.dropTargetId : null
  const dropPosition = visualState ? visualState.dropPosition : null
  return {
    isActive: activeTabId != null && tabId === activeTabId,
    isSelected: !!(selectedIdSet && selectedIdSet.has(tabId)),
    isDragging: !!(draggedIdSet && draggedIdSet.has(tabId)),
    isDropTarget: Number.isFinite(dropTargetId) && dropTargetId === tabId,
    dropPosition: Number.isFinite(dropTargetId) && dropTargetId === tabId ? dropPosition : (item && item.dropPosition ? item.dropPosition : null),
  }
}

function renderTab(tab, compact, canClose, item, editing, visualState) {
  const icon = tab.loading
    ? `<span class="svb-tab__spinner" aria-hidden="true"></span>`
    : tab.favIconUrl
      ? `<img class="svb-tab__favicon" src="${escapeHtml(tab.favIconUrl)}" alt="">`
      : `<span class="svb-tab__favicon svb-tab__favicon--fallback"></span>`

  const media = tab.muted
    ? `<span class="svb-tab__badge">Muted</span>`
    : tab.audible
      ? `<span class="svb-tab__badge">Audio</span>`
      : ''

  const hasClose = !compact && canClose
  const hasAdd = !compact
  const rowVisualState = getTabVisualState(tab.id, item, visualState)
  const discardedClass = tab.discarded ? ' is-discarded' : ''
  const tiledClass = tab.vivExtData && tab.vivExtData.tiling ? ' is-tiled' : ''
  const tabClass = compact
    ? `svb-tab svb-pinned-tab is-compact${discardedClass}${tiledClass}`
    : `svb-tab${discardedClass}${tiledClass}${hasClose ? ' has-close' : ''}${hasAdd ? ' has-add' : ''}${rowVisualState.isSelected ? ' is-selected' : ''}${rowVisualState.isDragging ? ' is-dragging' : ''}${rowVisualState.isDropTarget ? ' is-drop-target' : ''}`
  const depth = item && !compact ? item.depth : 0
  const visibleIndex = item && !compact ? item.visibleIndex : -1
  const subtreeSize = item && !compact ? item.subtreeSize : 1
  const parentId = item && !compact && item.parentId != null ? item.parentId : ''
  const ancestorIds = item && !compact && Array.isArray(item.ancestorIds) ? item.ancestorIds.join(',') : ''
  const dropPosition = item && !compact && rowVisualState.dropPosition ? rowVisualState.dropPosition : ''
  const hasChildren = !!(item && item.hasChildren)
  const isCollapsed = !!(item && item.collapsed)
  const visibleBranchSize = item && !compact ? item.visibleBranchSize || 1 : 1
  const coloredClass = tab.vivExtData && tab.vivExtData.tabColor && TAB_COLOR_SWATCHES[tab.vivExtData.tabColor]
    ? ' is-colored'
    : ''
  const visualStyle = (tiledClass || coloredClass) ? getTabVisualStyle(tab) : ''
  const title = editing
    ? `<input class="svb-tab__title-input" data-role="rename-input" data-tab-id="${tab.id}" value="${escapeHtml(tab.title)}" spellcheck="false">`
    : `<span class="svb-tab__title">${escapeHtml(tab.title)}</span>`

  return `
    <button class="${tabClass}${coloredClass}${rowVisualState.isActive ? ' is-active' : ''}" data-role="activate-tab" data-tab-id="${tab.id}" data-visible-index="${visibleIndex}" data-depth="${depth}" data-parent-id="${parentId}" data-subtree-size="${subtreeSize}" data-ancestor-ids="${escapeHtml(ancestorIds)}" data-drop-position="${dropPosition}" data-parent="${hasChildren}" data-folded="${isCollapsed}" title="${escapeHtml(tab.title)}"${visualStyle ? ` style="${visualStyle}"` : ''}>
      <span class="svb-tab__outer" style="--svb-depth:${depth};--svb-visible-branch-size:${visibleBranchSize}">
        ${compact ? '' : renderTreeGuides(item)}
        <span class="svb-tab__body">
          ${compact ? '' : renderDropIndicator(rowVisualState.dropPosition)}
          <span class="svb-tab__lead">
            ${compact ? '' : renderExpander(item)}
            ${icon}
            ${compact ? '' : renderChildCount(item)}
          </span>
          ${compact ? '' : `
            <span class="svb-tab__content">
              ${title}
              ${media}
            </span>
          `}
          ${hasAdd ? renderAddButton(tab.id) : ''}
          ${hasClose ? `<span class="svb-tab__close" data-role="close-tab" data-tab-id="${tab.id}">×</span>` : ''}
        </span>
      </span>
    </button>
  `
}

function renderNewTabButton(inline) {
  return `
    <button
      class="svb-new-tab-button${inline ? ' is-inline' : ' is-sticky'}"
      data-role="create-tab"
      title="New tab"
    >
      <span class="svb-new-tab-button__icon">+</span>
      <span class="svb-new-tab-button__label">New Tab</span>
    </button>
  `
}

const INLINE_NEW_TAB_KEY = 'control:new-tab-inline'

function renderPinIcon(active) {
  return `
    <svg class="svb-pin-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 14.5L5.23281 13.8586C4.98374 14.1565 4.92965 14.5716 5.09407 14.9234C5.25849 15.2752 5.61169 15.5 6 15.5V14.5ZM18 14.5V15.5C18.3883 15.5 18.7415 15.2752 18.9059 14.9234C19.0704 14.5716 19.0163 14.1565 18.7672 13.8586L18 14.5ZM11 20.5C11 21.0523 11.4477 21.5 12 21.5C12.5523 21.5 13 21.0523 13 20.5H11ZM7.49906 5.70911C7.74158 6.67224 8 8.13592 8 10H10C10 7.9508 9.71592 6.32242 9.43853 5.22076L7.49906 5.70911ZM8 10C8 9.89339 8.02858 9.88786 7.95663 10.0505C7.89859 10.1816 7.80513 10.3562 7.67578 10.5699C7.41832 10.9952 7.06464 11.5003 6.69686 11.9961C6.33177 12.4883 5.96508 12.9548 5.68868 13.2994C5.55078 13.4713 5.43603 13.6121 5.35608 13.7094C5.31612 13.7581 5.28489 13.7959 5.26385 13.8212C5.25333 13.8339 5.24536 13.8435 5.24013 13.8498C5.23751 13.8529 5.23558 13.8553 5.23435 13.8567C5.23374 13.8575 5.2333 13.858 5.23304 13.8583C5.23291 13.8585 5.23283 13.8586 5.23279 13.8586C5.23277 13.8586 5.23278 13.8586 5.23277 13.8586C5.23278 13.8586 5.23281 13.8586 6 14.5C6.76719 15.1414 6.76724 15.1414 6.7673 15.1413C6.76734 15.1412 6.76741 15.1412 6.76748 15.1411C6.76763 15.1409 6.76782 15.1407 6.76805 15.1404C6.76852 15.1398 6.76917 15.139 6.77 15.1381C6.77166 15.1361 6.77403 15.1332 6.77708 15.1296C6.7832 15.1222 6.79208 15.1115 6.80353 15.0977C6.82644 15.0701 6.85966 15.0299 6.90173 14.9787C6.98584 14.8762 7.10547 14.7295 7.24882 14.5508C7.53492 14.1941 7.91823 13.7066 8.30314 13.1877C8.68536 12.6725 9.08168 12.1095 9.38672 11.6056C9.53862 11.3547 9.67953 11.0994 9.78556 10.8598C9.87767 10.6517 10 10.3345 10 10H8ZM18 14.5C18.7672 13.8586 18.7672 13.8586 18.7672 13.8586C18.7672 13.8586 18.7672 13.8586 18.7672 13.8586C18.7672 13.8586 18.7671 13.8585 18.767 13.8583C18.7667 13.858 18.7663 13.8575 18.7657 13.8567C18.7644 13.8553 18.7625 13.8529 18.7599 13.8498C18.7546 13.8435 18.7467 13.8339 18.7362 13.8212C18.7151 13.7959 18.6839 13.7581 18.6439 13.7094C18.564 13.6121 18.4492 13.4713 18.3113 13.2994C18.0349 12.9548 17.6682 12.4883 17.3031 11.9961C16.9354 11.5003 16.5817 10.9952 16.3242 10.5699C16.1949 10.3562 16.1014 10.1816 16.0434 10.0505C15.9714 9.88786 16 9.89339 16 10L14 10C14 10.3346 14.1223 10.6517 14.2144 10.8598C14.3205 11.0994 14.4614 11.3547 14.6133 11.6056C14.9183 12.1095 15.3146 12.6725 15.6969 13.1877C16.0818 13.7066 16.4651 14.1941 16.7512 14.5508C16.8945 14.7295 17.0142 14.8762 17.0983 14.9787C17.1403 15.0299 17.1736 15.0701 17.1965 15.0977C17.2079 15.1115 17.2168 15.1222 17.2229 15.1296C17.226 15.1332 17.2283 15.1361 17.23 15.1381C17.2308 15.139 17.2315 15.1398 17.2319 15.1404C17.2322 15.1407 17.2324 15.1409 17.2325 15.1411C17.2326 15.1412 17.2327 15.1412 17.2327 15.1413C17.2328 15.1414 17.2328 15.1414 18 14.5ZM9.54068 5H14.7843V3H9.54068V5ZM16 10C16 9.78963 16.0987 9.07847 16.2609 8.11255C16.415 7.19476 16.6063 6.15802 16.7534 5.37905L14.7882 5.00779C14.6401 5.79152 14.446 6.84368 14.2885 7.78131C14.1391 8.67081 14 9.58158 14 10L16 10ZM6 15.5H12V13.5H6V15.5ZM12 15.5H18V13.5H12V15.5ZM11 14.5V20.5H13V14.5H11ZM14.7843 5C14.7867 5 14.7872 5.00024 14.7864 5.00006C14.7858 4.99991 14.785 4.99964 14.7845 4.99937C14.7836 4.99893 14.7847 4.9993 14.7865 5.00145C14.7883 5.00361 14.7887 5.00519 14.7887 5.00511C14.7887 5.00493 14.7886 5.00463 14.7886 5.00443C14.7886 5.00414 14.7887 5.00511 14.7882 5.00779L16.7534 5.37905C16.986 4.14809 16.0444 3 14.7843 3V5ZM9.43853 5.22076C9.42851 5.18099 9.43514 5.11382 9.4797 5.05164C9.49951 5.02399 9.51862 5.00978 9.529 5.00401C9.53698 4.99957 9.53917 5 9.54068 5V3C8.07935 3 7.18486 4.46129 7.49906 5.70911L9.43853 5.22076Z"
      />
    </svg>
  `
}

function renderCollapseAllIcon() {
  return `
    <svg class="svb-collapse-all-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4.5 5.25 8 8.75l3.5-3.5" />
      <path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4.5 9.25 8 12.75l3.5-3.5" />
    </svg>
  `
}

function createNodeFromHtml(html) {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return template.content.firstElementChild
}

function createSidebarRenderer(options) {
  const { root, onActivateTab, onCloseTab, onCreateTab, onCreateChildTab, onRenameTab, onTogglePinned, onToggleCollapse, onCollapseAll, onSelectTab, onOpenContextMenu, onContextMenuAction, onStartDrag, onUpdateDropTarget, onCommitDrop, onCommitExternalDrop, onClearDrag } = options
  let pendingScrollToActive = false
  let pendingScrollSourceTabId = null
  let currentVisibleIds = []
  let previousActiveTabId = null
  let previousPinnedTabsSnapshot = null
  let previousTreeTabsSnapshot = null
  let previousCanCloseVisibleTabs = null
  let previousPanelPinned = null
  let previousSelectedIds = []
  let previousDraggedIds = []
  let previousDropTargetId = null
  let previousDropPosition = null
  const tabNodesByKey = new Map()
  const enteringNodes = new WeakSet()
  const pendingEnterNodes = new Set()
  let pointerDrag = null
  let autoScrollRafId = 0
  let suppressClick = false
  let contextMenu = null
  let latestState = null
  let renderCurrent = () => {}
  let shell = null
  let editingTabId = null
  const eventController = new AbortController()
  const eventOptions = { signal: eventController.signal }

  function findTab(tabId) {
    if (!latestState) return null
    return latestState.pinnedTabs.concat(latestState.tabs).find(tab => tab.id === tabId) || null
  }

  function stopEditing(cancel) {
    if (!Number.isFinite(editingTabId)) return
    const tabId = editingTabId
    const input = root.querySelector(`.svb-tab__title-input[data-tab-id="${tabId}"]`)
    const nextValue = input ? input.value : ''
    editingTabId = null
    if (!cancel && onRenameTab) {
      onRenameTab(tabId, nextValue)
    } else {
      renderCurrent()
    }
  }

  function startEditing(tabId) {
    if (!Number.isFinite(tabId)) return
    const tab = findTab(tabId)
    if (!tab || tab.pinned) return
    editingTabId = tabId
    contextMenu = null
    renderCurrent()
  }

  function ensureShell() {
    if (shell && root.contains(shell.frame)) return shell

    root.innerHTML = `
      <div class="svb-frame">
        <div class="svb-header">
          <div class="svb-header__count">0</div>
          <div class="svb-header__actions">
            <button class="svb-icon-button" data-role="collapse-all" title="Collapse all trees" aria-label="Collapse all trees"></button>
            <button class="svb-icon-button" data-role="toggle-pinned" title="Pin panel"></button>
          </div>
        </div>

        <section class="svb-section svb-section--pinned">
          <div class="svb-section__label">Pinned</div>
          <div class="svb-pinned-grid"></div>
        </section>

        <section class="svb-section svb-section--fill">
          <div class="svb-section__label">Tabs</div>
          <div class="svb-tab-list"></div>
          <div class="svb-footer"></div>
        </section>
      </div>
      <div class="svb-resize-handle" aria-hidden="true"></div>
      <div class="svb-drag-ghost" aria-hidden="true"></div>
      <div class="svb-menu-host"></div>
    `

    shell = {
      frame: root.querySelector('.svb-frame'),
      count: root.querySelector('.svb-header__count'),
      collapseAllButton: root.querySelector('[data-role="collapse-all"]'),
      pinButton: root.querySelector('[data-role="toggle-pinned"]'),
      pinnedSection: root.querySelector('.svb-section--pinned'),
      pinnedGrid: root.querySelector('.svb-pinned-grid'),
      tabList: root.querySelector('.svb-tab-list'),
      footer: root.querySelector('.svb-footer'),
      dragGhost: root.querySelector('.svb-drag-ghost'),
      menuHost: root.querySelector('.svb-menu-host'),
      emptyMessage: createNodeFromHtml('<div class="svb-empty"></div>'),
      inlineNewTabButton: createNodeFromHtml(renderNewTabButton(true)),
    }

    shell.footer.appendChild(createNodeFromHtml(renderNewTabButton(false)))
    return shell
  }

  function getTabKey(tab, compact) {
    return `${compact ? 'pinned' : 'regular'}:${tab.id}`
  }

  function collectChangedIds(previousIds, nextIds, changedIds) {
    const previous = new Set(Array.isArray(previousIds) ? previousIds : [])
    const next = new Set(Array.isArray(nextIds) ? nextIds : [])
    for (const id of previous) {
      if (!next.has(id)) changedIds.add(id)
    }
    for (const id of next) {
      if (!previous.has(id)) changedIds.add(id)
    }
  }

  function buildVisualState(state) {
    const selectedIds = Array.isArray(state.selectedIds) ? state.selectedIds : []
    const dragState = state && state.drag ? state.drag : null
    return {
      activeTabId: Number.isFinite(state.activeTabId) ? state.activeTabId : null,
      selectedIds,
      selectedIdSet: new Set(selectedIds),
      draggedIds: Array.isArray(dragState && dragState.draggedIds) ? dragState.draggedIds : [],
      draggedIdSet: new Set(Array.isArray(dragState && dragState.draggedIds) ? dragState.draggedIds : []),
      dropTargetId: dragState ? dragState.dropTargetId : null,
      dropPosition: dragState ? dragState.dropPosition : null,
    }
  }

  function areTabOrdersEqual(previousTabs, nextTabs) {
    const previous = Array.isArray(previousTabs) ? previousTabs : []
    const next = Array.isArray(nextTabs) ? nextTabs : []
    if (previous.length !== next.length) return false
    for (let index = 0; index < next.length; index += 1) {
      if (!previous[index] || previous[index].id !== next[index].id) return false
    }
    return true
  }

  function areAncestorListsEqual(previousAncestors, nextAncestors) {
    const previous = Array.isArray(previousAncestors) ? previousAncestors : []
    const next = Array.isArray(nextAncestors) ? nextAncestors : []
    if (previous.length !== next.length) return false
    for (let index = 0; index < next.length; index += 1) {
      if (previous[index] !== next[index]) return false
    }
    return true
  }

  function isSameTreeShape(previousItems, nextItems) {
    const previous = Array.isArray(previousItems) ? previousItems : []
    const next = Array.isArray(nextItems) ? nextItems : []
    if (previous.length !== next.length) return false

    for (let index = 0; index < next.length; index += 1) {
      const previousItem = previous[index]
      const nextItem = next[index]
      if (!previousItem || !nextItem) return false
      if (previousItem.id !== nextItem.id) return false
      if (previousItem.depth !== nextItem.depth) return false
      if ((previousItem.parentId ?? null) !== (nextItem.parentId ?? null)) return false
      if (!!previousItem.hasChildren !== !!nextItem.hasChildren) return false
      if (!!previousItem.collapsed !== !!nextItem.collapsed) return false
      if ((previousItem.subtreeSize || 1) !== (nextItem.subtreeSize || 1)) return false
      if ((previousItem.visibleBranchSize || 1) !== (nextItem.visibleBranchSize || 1)) return false
      if (!areAncestorListsEqual(previousItem.ancestorIds, nextItem.ancestorIds)) return false
    }

    return true
  }

  function getTilingId(tab) {
    return tab && tab.vivExtData && tab.vivExtData.tiling && tab.vivExtData.tiling.id
      ? String(tab.vivExtData.tiling.id)
      : ''
  }

  function getTabColorKey(tab) {
    return tab && tab.vivExtData && typeof tab.vivExtData.tabColor === 'string'
      ? tab.vivExtData.tabColor
      : ''
  }

  function hasTabContentChanged(previousTab, nextTab) {
    if (!previousTab || !nextTab) return true
    return previousTab.title !== nextTab.title
      || previousTab.favIconUrl !== nextTab.favIconUrl
      || !!previousTab.loading !== !!nextTab.loading
      || !!previousTab.muted !== !!nextTab.muted
      || !!previousTab.audible !== !!nextTab.audible
      || !!previousTab.discarded !== !!nextTab.discarded
      || getTilingId(previousTab) !== getTilingId(nextTab)
      || getTabColorKey(previousTab) !== getTabColorKey(nextTab)
  }

  function collectContentChangedIds(previousPinnedTabs, nextPinnedTabs, previousTreeItems, nextTreeItems) {
    const changedIds = new Set()
    const previousPinnedById = new Map((Array.isArray(previousPinnedTabs) ? previousPinnedTabs : []).map(tab => [tab.id, tab]))
    const previousTreeById = new Map((Array.isArray(previousTreeItems) ? previousTreeItems : []).map(item => [item.id, item]))

    for (const tab of Array.isArray(nextPinnedTabs) ? nextPinnedTabs : []) {
      if (hasTabContentChanged(previousPinnedById.get(tab.id), tab)) {
        changedIds.add(tab.id)
      }
    }

    for (const item of Array.isArray(nextTreeItems) ? nextTreeItems : []) {
      const previousItem = previousTreeById.get(item.id)
      if (!previousItem || hasTabContentChanged(previousItem.tab, item.tab)) {
        changedIds.add(item.id)
      }
    }

    return changedIds
  }

  function updateShellControls(currentShell, state, treeTabs) {
    const totalTabs = state.pinnedTabs.length + state.tabs.length
    currentShell.count.textContent = String(totalTabs)
    const canCollapseAll = treeTabs.some(item => item && item.hasChildren && !item.collapsed)
    currentShell.collapseAllButton.className = `svb-icon-button${canCollapseAll ? '' : ' is-disabled'}`
    currentShell.collapseAllButton.disabled = !canCollapseAll
    currentShell.collapseAllButton.innerHTML = renderCollapseAllIcon()
    currentShell.pinButton.className = `svb-icon-button${state.panelPinned ? ' is-active' : ''}`
    currentShell.pinButton.title = state.panelPinned ? 'Unpin panel' : 'Pin panel'
    currentShell.pinButton.innerHTML = renderPinIcon(state.panelPinned)
    currentShell.pinnedSection.style.display = state.pinnedTabs.length ? '' : 'none'
  }

  function updateContextMenu(currentShell, state) {
    if (!contextMenu) {
      if (currentShell.menuHost.childElementCount > 0) {
        currentShell.menuHost.innerHTML = ''
      }
      return
    }
    const allTabsById = new Map(state.pinnedTabs.concat(state.tabs).map(tab => [tab.id, tab]))
    const contextTab = allTabsById.get(contextMenu.tabId) || null
    currentShell.menuHost.innerHTML = renderContextMenu(contextTab, state, contextMenu)
    positionContextMenu()
  }

  function updateVisualOnlyNodes(state, treeTabs, visualState, currentShell, contentChangedIds = null) {
    const changedIds = new Set()
    if (contentChangedIds) {
      for (const tabId of contentChangedIds) {
        changedIds.add(tabId)
      }
    }
    collectChangedIds(previousSelectedIds, visualState.selectedIds, changedIds)
    collectChangedIds(previousDraggedIds, visualState.draggedIds, changedIds)
    if (Number.isFinite(previousActiveTabId)) changedIds.add(previousActiveTabId)
    if (Number.isFinite(visualState.activeTabId)) changedIds.add(visualState.activeTabId)
    if (Number.isFinite(previousDropTargetId)) changedIds.add(previousDropTargetId)
    if (Number.isFinite(visualState.dropTargetId)) changedIds.add(visualState.dropTargetId)

    const treeItemsById = new Map(treeTabs.map(item => [item.id, item]))
    const pinnedTabsById = new Map((Array.isArray(state.pinnedTabs) ? state.pinnedTabs : []).map(tab => [tab.id, tab]))
    const regularTabsById = new Map((Array.isArray(state.tabs) ? state.tabs : []).map(tab => [tab.id, tab]))

    for (const tabId of changedIds) {
      const pinnedTab = pinnedTabsById.get(tabId)
      if (pinnedTab) {
        const key = getTabKey(pinnedTab, true)
        const node = tabNodesByKey.get(key)
        if (node) {
          syncTabNode(node, pinnedTab, true, state.canCloseVisibleTabs, null, false, visualState)
        }
        continue
      }

      const item = treeItemsById.get(tabId)
      const regularTab = regularTabsById.get(tabId) || (item ? item.tab : null)
      if (!item || !regularTab) continue
      const key = getTabKey(regularTab, false)
      const node = tabNodesByKey.get(key)
      if (node) {
        syncTabNode(node, regularTab, false, state.canCloseVisibleTabs, item, editingTabId === tabId, visualState)
      }
    }

    if (previousCanCloseVisibleTabs !== state.canCloseVisibleTabs) {
      for (const item of treeTabs) {
        const key = getTabKey(item.tab, false)
        const node = tabNodesByKey.get(key)
        if (node) {
          syncTabNode(node, item.tab, false, state.canCloseVisibleTabs, item, editingTabId === item.id, visualState)
        }
      }
    }

    if (previousPanelPinned !== state.panelPinned) {
      updateShellControls(currentShell, state, treeTabs)
    }

    updateContextMenu(currentShell, state)
  }

  function syncTabNode(node, tab, compact, canClose, item, editing, visualState) {
    const hasClose = !compact && canClose
    const hasAdd = !compact
    const rowVisualState = getTabVisualState(tab.id, item, visualState)
    const discardedClass = tab.discarded ? ' is-discarded' : ''
    const tiledClass = tab.vivExtData && tab.vivExtData.tiling ? ' is-tiled' : ''
    const tabClass = compact
      ? `svb-tab svb-pinned-tab is-compact${discardedClass}${tiledClass}`
      : `svb-tab${discardedClass}${tiledClass}${hasClose ? ' has-close' : ''}${hasAdd ? ' has-add' : ''}${rowVisualState.isSelected ? ' is-selected' : ''}${rowVisualState.isDragging ? ' is-dragging' : ''}${rowVisualState.isDropTarget ? ' is-drop-target' : ''}`
    const depth = item && !compact ? item.depth : 0
    const visibleIndex = item && !compact ? item.visibleIndex : -1
    const subtreeSize = item && !compact ? item.subtreeSize : 1
    const parentId = item && !compact && item.parentId != null ? item.parentId : ''
    const ancestorIds = item && !compact && Array.isArray(item.ancestorIds) ? item.ancestorIds.join(',') : ''
    const dropPosition = item && !compact && rowVisualState.dropPosition ? rowVisualState.dropPosition : ''
    const hasChildren = !!(item && item.hasChildren)
    const isCollapsed = !!(item && item.collapsed)
    const visibleBranchSize = item && !compact ? item.visibleBranchSize || 1 : 1
    const coloredClass = tab.vivExtData && tab.vivExtData.tabColor && TAB_COLOR_SWATCHES[tab.vivExtData.tabColor]
      ? ' is-colored'
      : ''
    const visualStyle = (tiledClass || coloredClass) ? getTabVisualStyle(tab) : ''

    node.className = `${tabClass}${coloredClass}${rowVisualState.isActive ? ' is-active' : ''}`
    node.setAttribute('data-role', 'activate-tab')
    node.setAttribute('data-tab-id', String(tab.id))
    node.setAttribute('data-visible-index', String(visibleIndex))
    node.setAttribute('data-depth', String(depth))
    node.setAttribute('data-parent-id', String(parentId))
    node.setAttribute('data-subtree-size', String(subtreeSize))
    node.setAttribute('data-ancestor-ids', ancestorIds)
    node.setAttribute('data-drop-position', dropPosition)
    node.setAttribute('data-parent', hasChildren ? 'true' : 'false')
    node.setAttribute('data-folded', isCollapsed ? 'true' : 'false')
    node.setAttribute('title', tab.title)
    if (visualStyle) node.setAttribute('style', visualStyle)
    else node.removeAttribute('style')

    const outer = findDirectChild(node, '.svb-tab__outer')
    const body = outer && findDirectChild(outer, '.svb-tab__body')
    const lead = body && findDirectChild(body, '.svb-tab__lead')
    if (!outer || !body || !lead) {
      return false
    }

    outer.style.setProperty('--svb-depth', String(depth))
    outer.style.setProperty('--svb-visible-branch-size', String(visibleBranchSize))

    syncOptionalDirectChild(outer, '.svb-tab__guides', compact ? '' : renderTreeGuides(item), body)
    syncOptionalDirectChild(body, '.svb-tab__drop-indicator', compact ? '' : renderDropIndicator(rowVisualState.dropPosition), lead)

    const iconNode = syncTabLeadIcon(lead, tab)
    syncOptionalDirectChild(lead, '.svb-tab__exp', compact ? '' : renderExpander(item), iconNode)
    syncOptionalDirectChild(lead, '.svb-tab__child-count', compact ? '' : renderChildCount(item), null)

    const addNode = findDirectChild(body, '.svb-tab__add')
    const closeNode = findDirectChild(body, '.svb-tab__close')
    const content = findDirectChild(body, '.svb-tab__content')
    if (compact) {
      if (content) content.remove()
    } else {
      let contentNode = content
      if (!contentNode) {
        contentNode = createNodeFromHtml('<span class="svb-tab__content"></span>')
        body.insertBefore(contentNode, addNode || closeNode || null)
      }
      syncTabContent(contentNode, tab, editing)
    }

    syncOptionalDirectChild(body, '.svb-tab__add', hasAdd ? renderAddButton(tab.id) : '', null)
    syncOptionalDirectChild(body, '.svb-tab__close', hasClose ? `<span class="svb-tab__close" data-role="close-tab" data-tab-id="${tab.id}">×</span>` : '', null)
    return true
  }

  function animateTabEnter(node) {
    if (!node || enteringNodes.has(node) || !node.isConnected) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    enteringNodes.add(node)
    const animation = node.animate([
      { opacity: 0, transform: 'translateY(-6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], {
      duration: 200,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'none',
    })

    animation.finished.then(() => {
      enteringNodes.delete(node)
      node.style.opacity = ''
      node.style.transform = ''
    }).catch(() => {
      enteringNodes.delete(node)
      node.style.opacity = ''
      node.style.transform = ''
    })
  }

  function getOrUpdateTabNode(tab, compact, canClose, item, visualState) {
    const key = getTabKey(tab, compact)
    const editing = !compact && editingTabId === tab.id
    const html = renderTab(tab, compact, canClose, item, editing, visualState)
    let node = tabNodesByKey.get(key)
    if (!node) {
      node = createNodeFromHtml(html)
      pendingEnterNodes.add(node)
      tabNodesByKey.set(key, node)
      return node
    }

    if (!syncTabNode(node, tab, compact, canClose, item, editing, visualState)) {
      const nextNode = createNodeFromHtml(html)
      node.replaceWith(nextNode)
      node = nextNode
      tabNodesByKey.set(key, node)
    }
    return node
  }

  function pruneTabNodes(activeKeys) {
    for (const [key, node] of tabNodesByKey.entries()) {
      if (activeKeys.has(key)) continue
      node.remove()
      tabNodesByKey.delete(key)
      pendingEnterNodes.delete(node)
    }
  }

  function syncChildren(parent, nodes) {
    nodes.forEach((node, index) => {
      if (node.parentNode !== parent) {
        parent.insertBefore(node, parent.children[index] || null)
        return
      }

      if (parent.children[index] !== node) {
        parent.insertBefore(node, parent.children[index] || null)
      }
    })

    while (parent.children.length > nodes.length) {
      parent.removeChild(parent.lastElementChild)
    }
  }

  function flushEnterAnimations() {
    if (pendingEnterNodes.size === 0) return

    const nodes = Array.from(pendingEnterNodes)
    pendingEnterNodes.clear()
    window.requestAnimationFrame(() => {
      nodes.forEach(node => {
        if (node.isConnected) {
          animateTabEnter(node)
        }
      })
    })
  }

  function measureTabRects() {
    const rects = new Map()
    for (const [key, node] of tabNodesByKey.entries()) {
      if (!node.isConnected) continue
      const rect = node.getBoundingClientRect()
      rects.set(key, {
        left: rect.left,
        top: rect.top,
      })
    }
    if (shell && shell.inlineNewTabButton && shell.inlineNewTabButton.isConnected) {
      const inlineStyle = window.getComputedStyle(shell.inlineNewTabButton)
      if (inlineStyle.display !== 'none') {
        const rect = shell.inlineNewTabButton.getBoundingClientRect()
        rects.set(INLINE_NEW_TAB_KEY, {
          left: rect.left,
          top: rect.top,
        })
      }
    }
    return rects
  }

  function animateMovedTabs(previousRects, enteringNodeSet = null) {
    if (!previousRects || previousRects.size === 0) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const movedNodes = []
    const motionNodes = Array.from(tabNodesByKey.entries())
    if (shell && shell.inlineNewTabButton) {
      motionNodes.push([INLINE_NEW_TAB_KEY, shell.inlineNewTabButton])
    }

    for (const [key, node] of motionNodes) {
      const previousRect = previousRects.get(key)
      if (!previousRect || !node.isConnected || enteringNodes.has(node) || (enteringNodeSet && enteringNodeSet.has(node))) continue
      if (window.getComputedStyle(node).display === 'none') continue

      const rect = node.getBoundingClientRect()
      const deltaX = previousRect.left - rect.left
      const deltaY = previousRect.top - rect.top
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) continue
      if (Math.abs(deltaY) > window.innerHeight) continue

      node.style.transition = 'none'
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      movedNodes.push(node)
    }

    if (!movedNodes.length) return

    root.offsetHeight
    window.requestAnimationFrame(() => {
      movedNodes.forEach(node => {
        node.style.transition = 'transform var(--svb-d-norm) var(--svb-ease-out), opacity var(--svb-d-fast) linear'
        node.style.transform = ''
        node.addEventListener('transitionend', () => {
          node.style.transition = ''
          node.style.transform = ''
        }, { once: true })
      })
    })
  }

  function resolveDropTarget(clientX, clientY) {
    const hovered = document.elementFromPoint(clientX, clientY)
    const tabButton = hovered && hovered.closest ? hovered.closest('.svb-tab[data-tab-id]:not(.is-compact)') : null
    if (!tabButton) return null

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return null

    return {
      tabId,
      position: getDropPositionForEvent(tabButton, {
        clientY,
      }),
    }
  }

  function isPointOutsidePanel(clientX, clientY) {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return false
    const rect = root.getBoundingClientRect()
    return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom
  }

  function updateDragGhost(clientX, clientY) {
    const currentShell = ensureShell()
    const ghost = currentShell.dragGhost
    if (!ghost || !pointerDrag || !pointerDrag.dragging) return

    const rect = root.getBoundingClientRect()
    ghost.style.transform = `translate(${Math.round(clientX - rect.left + 12)}px, ${Math.round(clientY - rect.top + 10)}px)`
  }

  function stopDragAutoScroll() {
    if (autoScrollRafId) {
      window.cancelAnimationFrame(autoScrollRafId)
      autoScrollRafId = 0
    }
    if (pointerDrag) {
      pointerDrag.autoScrollVelocity = 0
      pointerDrag.lastPointerX = null
      pointerDrag.lastPointerY = null
    }
  }

  function applyDragAutoScroll() {
    if (!pointerDrag || !pointerDrag.dragging) {
      stopDragAutoScroll()
      return
    }

    const currentShell = ensureShell()
    const list = currentShell.tabList
    const velocity = Number(pointerDrag.autoScrollVelocity) || 0
    if (!list || Math.abs(velocity) < 0.1) {
      autoScrollRafId = 0
      return
    }

    const previousScrollTop = list.scrollTop
    const maxScrollTop = Math.max(0, list.scrollHeight - list.clientHeight)
    const nextScrollTop = Math.max(0, Math.min(maxScrollTop, previousScrollTop + velocity))
    if (Math.abs(nextScrollTop - previousScrollTop) < 0.1) {
      autoScrollRafId = 0
      return
    }

    list.scrollTop = nextScrollTop

    const pointerX = Number(pointerDrag.lastPointerX)
    const pointerY = Number(pointerDrag.lastPointerY)
    if (Number.isFinite(pointerX) && Number.isFinite(pointerY)) {
      updateDragGhost(pointerX, pointerY)
      const drop = resolveDropTarget(pointerX, pointerY)
      if (drop && onUpdateDropTarget) {
        onUpdateDropTarget(drop.tabId, drop.position)
      } else if (onUpdateDropTarget) {
        onUpdateDropTarget(null, null)
      }
    }

    autoScrollRafId = window.requestAnimationFrame(applyDragAutoScroll)
  }

  function updateDragAutoScroll(clientX, clientY) {
    const currentShell = ensureShell()
    const list = currentShell.tabList
    if (!pointerDrag || !list) return

    pointerDrag.lastPointerX = clientX
    pointerDrag.lastPointerY = clientY

    const rect = list.getBoundingClientRect()
    const withinHorizontalBounds = clientX >= rect.left && clientX <= rect.right
    const withinVerticalBounds = clientY >= rect.top && clientY <= rect.bottom

    if (!withinHorizontalBounds || !withinVerticalBounds) {
      stopDragAutoScroll()
      return
    }

    const edgeDistance = 40
    let velocity = 0

    if (clientY < rect.top + edgeDistance) {
      const progress = 1 - ((clientY - rect.top) / edgeDistance)
      velocity = -Math.max(4, progress * 18)
    } else if (clientY > rect.bottom - edgeDistance) {
      const progress = 1 - ((rect.bottom - clientY) / edgeDistance)
      velocity = Math.max(4, progress * 18)
    }

    pointerDrag.autoScrollVelocity = velocity
    if (Math.abs(velocity) < 0.1) {
      stopDragAutoScroll()
      return
    }

    if (!autoScrollRafId) {
      autoScrollRafId = window.requestAnimationFrame(applyDragAutoScroll)
    }
  }

  function showDragGhost(tabId, clientX, clientY) {
    const currentShell = ensureShell()
    const ghost = currentShell.dragGhost
    if (!ghost) return

    const treeItems = latestState && Array.isArray(latestState.treeTabs) ? latestState.treeTabs : []
    const draggedIds = latestState && latestState.drag && Array.isArray(latestState.drag.draggedIds)
      ? latestState.drag.draggedIds
      : [tabId]
    const ghostItems = draggedIds
      .map(id => treeItems.find(item => item && item.id === id))
      .filter(Boolean)
    const fallbackTab = findTab(tabId)
    const items = ghostItems.length
      ? ghostItems
      : [{
        id: tabId,
        tab: fallbackTab || { title: 'Tab' },
        subtreeSize: 1,
      }]
    const visibleItems = items.slice(0, 4)
    const extraCount = Math.max(0, items.length - visibleItems.length)

    ghost.innerHTML = `
      <div class="svb-drag-ghost__stack${items.length > 1 ? ' is-multi' : ''}">
        ${visibleItems.map((item, index) => {
          const subtreeSize = Number(item.subtreeSize) || 1
          const title = item.tab && item.tab.title ? item.tab.title : 'Tab'
          return `
            <div class="svb-drag-ghost__card" style="--svb-ghost-index:${index};--svb-ghost-x:${index * 6}px;--svb-ghost-y:${index * 8}px">
              <span class="svb-drag-ghost__icon"></span>
              <span class="svb-drag-ghost__title">${escapeHtml(title)}</span>
              ${subtreeSize > 1 ? `<span class="svb-drag-ghost__count">${subtreeSize}</span>` : ''}
            </div>
          `
        }).join('')}
        ${extraCount > 0 ? `<span class="svb-drag-ghost__more">+${extraCount}</span>` : ''}
      </div>
    `
    ghost.classList.add('is-visible')
    updateDragGhost(clientX, clientY)
  }

  function hideDragGhost() {
    const currentShell = shell
    const ghost = currentShell && currentShell.dragGhost
    if (!ghost) return

    ghost.classList.remove('is-visible')
    ghost.innerHTML = ''
    ghost.style.transform = ''
  }

  function finishPointerDrag(clientX, clientY, allowExternalDrop = true) {
    if (!pointerDrag) return
    stopDragAutoScroll()

    const drop = pointerDrag.dragging ? resolveDropTarget(clientX, clientY) : null
    if (pointerDrag.dragging && drop && onCommitDrop) {
      onCommitDrop(drop.tabId, drop.position)
    } else if (pointerDrag.dragging && allowExternalDrop && isPointOutsidePanel(clientX, clientY) && onCommitExternalDrop) {
      onCommitExternalDrop()
    } else if (pointerDrag.dragging && onClearDrag) {
      onClearDrag()
    }

    pointerDrag = null
    hideDragGhost()
  }

  function positionSubmenu(menuItem) {
    if (!menuItem) return
    const submenu = menuItem.querySelector('.svb-menu__submenu')
    if (!submenu) return

    menuItem.classList.remove('is-submenu-up')
    submenu.style.maxHeight = ''
    submenu.style.overflowY = ''
    submenu.style.visibility = 'hidden'
    submenu.style.display = 'block'

    const margin = 6
    const itemRect = menuItem.getBoundingClientRect()
    const submenuRect = submenu.getBoundingClientRect()
    const fitsBelow = itemRect.top - 5 + submenuRect.height <= window.innerHeight - margin

    if (!fitsBelow) {
      menuItem.classList.add('is-submenu-up')
    }

    const availableHeight = menuItem.classList.contains('is-submenu-up')
      ? Math.max(120, itemRect.bottom - margin)
      : Math.max(120, window.innerHeight - itemRect.top - margin)

    submenu.style.maxHeight = `${availableHeight}px`
    submenu.style.overflowY = 'auto'
    submenu.style.display = ''
    submenu.style.visibility = ''
  }

  root.addEventListener('click', event => {
    if (event.target.closest('[data-role="rename-input"]')) return

    const menuAction = event.target.closest('[data-role="context-menu-action"]')
    if (menuAction) {
      event.preventDefault()
      event.stopPropagation()
      if (!menuAction.classList.contains('is-disabled') && contextMenu && onContextMenuAction) {
        const workspaceId = Number(menuAction.getAttribute('data-workspace-id'))
        const colorKey = menuAction.getAttribute('data-color-key')
        const bookmarkTreeId = menuAction.getAttribute('data-bookmark-tree-id')
        onContextMenuAction(menuAction.getAttribute('data-action'), {
          tabId: contextMenu.tabId,
          workspaceId: Number.isFinite(workspaceId) ? workspaceId : null,
          colorKey: typeof colorKey === 'string' ? colorKey : null,
          bookmarkTreeId: bookmarkTreeId || null,
        })
      }
      contextMenu = null
      renderCurrent()
      return
    }

    if (contextMenu && !event.target.closest('.svb-menu')) {
      contextMenu = null
      renderCurrent()
      return
    }

    if (suppressClick) {
      suppressClick = false
      event.preventDefault()
      event.stopPropagation()
      return
    }

    const target = event.target.closest('[data-role]')
    if (!target) return

    const role = target.getAttribute('data-role')
    const tabId = Number(target.getAttribute('data-tab-id'))

    if (role === 'activate-tab' && Number.isFinite(tabId)) {
      if (editingTabId === tabId) return
      const isPinnedTab = !!target.closest('.svb-pinned-tab')
      const selectionMode = event.shiftKey
        ? 'range'
        : (event.ctrlKey || event.metaKey)
          ? 'toggle'
          : 'single'

      if (isPinnedTab || !onSelectTab) {
        onActivateTab(tabId)
        return
      }

      onSelectTab(tabId, {
        mode: selectionMode,
        orderedVisibleIds: currentVisibleIds.slice(),
        activate: selectionMode === 'single',
      })
      return
    }

    if (role === 'close-tab' && Number.isFinite(tabId)) {
      event.stopPropagation()
      onCloseTab(tabId)
      return
    }

    if (role === 'toggle-collapse' && Number.isFinite(tabId)) {
      event.stopPropagation()
      onToggleCollapse(tabId)
      return
    }

    if (role === 'create-tab') {
      pendingScrollToActive = true
      pendingScrollSourceTabId = latestState && Number.isFinite(latestState.activeTabId)
        ? latestState.activeTabId
        : null
      onCreateTab()
    }
    if (role === 'create-child-tab' && Number.isFinite(tabId)) {
      pendingScrollToActive = true
      pendingScrollSourceTabId = latestState && Number.isFinite(latestState.activeTabId)
        ? latestState.activeTabId
        : null
      onCreateChildTab(tabId)
      return
    }
    if (role === 'collapse-all') {
      onCollapseAll()
      return
    }
    if (role === 'toggle-pinned') onTogglePinned()
  }, eventOptions)

  root.addEventListener('dblclick', event => {
    const input = event.target.closest('[data-role="rename-input"]')
    if (input) return
    if (event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"]')) return

    const tabButton = event.target.closest('.svb-tab[data-tab-id]:not(.is-compact)')
    if (!tabButton) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return

    event.preventDefault()
    event.stopPropagation()
    startEditing(tabId)
  }, eventOptions)

  root.addEventListener('pointerdown', event => {
    if (event.button === 1) {
      const tabButton = event.target.closest('.svb-tab[data-tab-id]')
      if (!tabButton || event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"], [data-role="rename-input"]')) return
      if (tabButton.classList.contains('svb-pinned-tab')) return

      const tabId = Number(tabButton.getAttribute('data-tab-id'))
      if (!Number.isFinite(tabId)) return

      event.preventDefault()
      event.stopPropagation()
      onCloseTab(tabId)
      return
    }

    if (event.button !== 0) return
    if (event.target.closest('.svb-menu')) return
    if (event.target.closest('[data-role="rename-input"]')) return
    if (event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"]')) return

    const tabButton = event.target.closest('.svb-tab[data-tab-id]:not(.is-compact)')
    if (tabButton) {
      event.preventDefault()
    }
    if (!tabButton || !onStartDrag) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    const parentIdRaw = tabButton.getAttribute('data-parent-id')
    const sourceParentId = parentIdRaw === '' ? null : Number(parentIdRaw)
    if (!Number.isFinite(tabId)) return

    pointerDrag = {
      tabId,
      sourceParentId: Number.isFinite(sourceParentId) ? sourceParentId : null,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      autoScrollVelocity: 0,
      lastPointerX: null,
      lastPointerY: null,
    }

    if (typeof tabButton.setPointerCapture === 'function') {
      try {
        tabButton.setPointerCapture(event.pointerId)
      } catch (_error) {
        void _error
      }
    }
  }, eventOptions)

  root.addEventListener('pointermove', event => {
    if (!pointerDrag) return

    const deltaX = event.clientX - pointerDrag.startX
    const deltaY = event.clientY - pointerDrag.startY
    const movedEnough = Math.abs(deltaX) >= 6 || Math.abs(deltaY) >= 6

    if (!pointerDrag.dragging && movedEnough) {
      pointerDrag.dragging = true
      suppressClick = true
      onStartDrag(pointerDrag.tabId, {
        sourceParentId: pointerDrag.sourceParentId,
      })
      showDragGhost(pointerDrag.tabId, event.clientX, event.clientY)
    }

    if (!pointerDrag.dragging) return
    updateDragGhost(event.clientX, event.clientY)
    updateDragAutoScroll(event.clientX, event.clientY)

    const drop = resolveDropTarget(event.clientX, event.clientY)
    if (drop && onUpdateDropTarget) {
      onUpdateDropTarget(drop.tabId, drop.position)
      return
    }

    if (onUpdateDropTarget) {
      onUpdateDropTarget(null, null)
    }
  }, eventOptions)

  root.addEventListener('pointerup', event => {
    finishPointerDrag(event.clientX, event.clientY)
  }, eventOptions)

  root.addEventListener('pointercancel', () => {
    finishPointerDrag(-1, -1, false)
  }, eventOptions)

  root.addEventListener('lostpointercapture', () => {
    finishPointerDrag(-1, -1, false)
  }, eventOptions)

  root.addEventListener('contextmenu', event => {
    if (event.target.closest('[data-role="rename-input"]')) return
    const tabButton = event.target.closest('.svb-tab[data-tab-id]')
    if (!tabButton) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return

    event.preventDefault()
    event.stopPropagation()
    if (onOpenContextMenu) onOpenContextMenu(tabId)
    contextMenu = {
      tabId,
      x: event.clientX,
      y: event.clientY,
    }
    renderCurrent()
  }, eventOptions)

  root.addEventListener('pointerover', event => {
    const menuItem = event.target.closest('.svb-menu__item.has-submenu')
    if (!menuItem) return
    positionSubmenu(menuItem)
  }, eventOptions)

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pointerDrag) {
      event.preventDefault()
      suppressClick = false
      stopDragAutoScroll()
      finishPointerDrag(-1, -1, false)
      return
    }
    if (editingTabId != null && event.key === 'Escape') {
      event.preventDefault()
      stopEditing(true)
      return
    }
    if (!contextMenu || event.key !== 'Escape') return
    contextMenu = null
    renderCurrent()
  }, eventOptions)

  document.addEventListener('pointerdown', event => {
    if (!contextMenu) return
    if (root.contains(event.target)) return
    contextMenu = null
    renderCurrent()
  }, { capture: true, signal: eventController.signal })

  root.addEventListener('keydown', event => {
    const input = event.target.closest('[data-role="rename-input"]')
    if (!input) return

    if (event.key === 'Enter') {
      event.preventDefault()
      stopEditing(false)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      stopEditing(true)
    }
  }, eventOptions)

  root.addEventListener('focusout', event => {
    const input = event.target.closest('[data-role="rename-input"]')
    if (!input) return
    if (input.contains(event.relatedTarget)) return
    stopEditing(false)
  }, eventOptions)

  function syncScroll(list, state, previousScrollTop) {
    if (typeof previousScrollTop !== 'number' && (!pendingScrollToActive || !state.activeTabId)) return
    if (!list) return
    if (typeof previousScrollTop === 'number') {
      list.scrollTop = previousScrollTop
    }

    if (!pendingScrollToActive || !state.activeTabId) return
    if (Number.isFinite(pendingScrollSourceTabId) && state.activeTabId === pendingScrollSourceTabId) {
      return
    }

    const activeTab = list.querySelector(`.svb-tab[data-tab-id="${state.activeTabId}"]`)
    if (activeTab) {
      const listRect = list.getBoundingClientRect()
      const activeRect = activeTab.getBoundingClientRect()
      const epsilon = 1
      const visibleTop = listRect.top
      const visibleBottom = listRect.bottom

      if (activeRect.top < visibleTop - epsilon) {
        list.scrollTop += activeRect.top - visibleTop
      } else if (activeRect.bottom > visibleBottom + epsilon) {
        list.scrollTop += activeRect.bottom - visibleBottom
      }
    }

    pendingScrollToActive = false
    pendingScrollSourceTabId = null
  }

  function syncOverflowState() {
    const currentShell = ensureShell()
    const frame = currentShell.frame
    const list = currentShell.tabList
    if (!frame || !list) return

    const hasScroll = list.scrollHeight > list.clientHeight + 1
    frame.classList.toggle('has-scroll', hasScroll)
  }

  function positionContextMenu() {
    const currentShell = ensureShell()
    const menu = currentShell.menuHost.querySelector('.svb-menu')
    if (!menu) return

    const margin = 6
    const rect = menu.getBoundingClientRect()
    const currentLeft = Number.parseFloat(menu.style.left) || 0
    const currentTop = Number.parseFloat(menu.style.top) || 0
    const desiredViewportLeft = Math.max(margin, Math.min(rect.left, window.innerWidth - rect.width - margin))
    const desiredViewportTop = Math.max(margin, Math.min(rect.top, window.innerHeight - rect.height - margin))
    menu.style.left = `${currentLeft + desiredViewportLeft - rect.left}px`
    menu.style.top = `${currentTop + desiredViewportTop - rect.top}px`
  }

  return {
    render(state) {
      if (!state) return
      latestState = state
      renderCurrent = () => this.render(latestState)
      const currentShell = ensureShell()
      root.classList.toggle('is-menu-open', !!contextMenu)
      const visualState = buildVisualState(state)
      const treeTabs = Array.isArray(state.treeTabs) ? state.treeTabs : []
      const isDragging = visualState.draggedIdSet.size > 0
      const structureChanged = !areTabOrdersEqual(previousPinnedTabsSnapshot, state.pinnedTabs)
        || !isSameTreeShape(previousTreeTabsSnapshot, treeTabs)
      const contentChangedIds = structureChanged
        ? new Set()
        : collectContentChangedIds(previousPinnedTabsSnapshot, state.pinnedTabs, previousTreeTabsSnapshot, treeTabs)

      if (structureChanged || currentVisibleIds.length !== treeTabs.length) {
        currentVisibleIds = treeTabs.map(item => item.id)
      }
      const activeTabChanged = state.activeTabId !== previousActiveTabId
      const activeRegularTabVisible = Number.isFinite(state.activeTabId) && currentVisibleIds.includes(state.activeTabId)
      if (activeTabChanged && activeRegularTabVisible) {
        pendingScrollToActive = true
        pendingScrollSourceTabId = previousActiveTabId
      }
      if (!structureChanged) {
        updateVisualOnlyNodes(state, treeTabs, visualState, currentShell, contentChangedIds)
        syncScroll(currentShell.tabList, state)
      } else {
        const previousScrollTop = currentShell.tabList ? currentShell.tabList.scrollTop : 0
        const previousRects = measureTabRects()
        const empty = state.ready && state.tabs.length === 0 && state.pinnedTabs.length === 0
        const emptyMessage = state.outsideWorkspace
          ? 'No tabs outside workspaces'
          : state.filteredByWorkspace
            ? 'No tabs in this workspace'
            : 'No tabs in this window'

        updateShellControls(currentShell, state, treeTabs)

        const activeKeys = new Set()
        const pinnedNodes = state.pinnedTabs.map(tab => {
          activeKeys.add(getTabKey(tab, true))
          return getOrUpdateTabNode(tab, true, state.canCloseVisibleTabs, null, visualState)
        })
        const regularNodes = treeTabs.map(item => {
          activeKeys.add(getTabKey(item.tab, false))
          return getOrUpdateTabNode(item.tab, false, state.canCloseVisibleTabs, item, visualState)
        })

        syncChildren(currentShell.pinnedGrid, pinnedNodes)
        const listNodes = empty
          ? [currentShell.emptyMessage, currentShell.inlineNewTabButton]
          : regularNodes.concat(currentShell.inlineNewTabButton)
        if (empty) {
          currentShell.emptyMessage.textContent = emptyMessage
        }
        syncChildren(currentShell.tabList, listNodes)
        pruneTabNodes(activeKeys)
        updateContextMenu(currentShell, state)

        syncOverflowState()
        syncScroll(currentShell.tabList, state, previousScrollTop)
        const enteringNodeSnapshot = new Set(pendingEnterNodes)
        if (!isDragging) {
          animateMovedTabs(previousRects, enteringNodeSnapshot)
        }
        flushEnterAnimations()
      }

      previousPinnedTabsSnapshot = state.pinnedTabs
      previousTreeTabsSnapshot = treeTabs
      previousActiveTabId = state.activeTabId
      previousCanCloseVisibleTabs = state.canCloseVisibleTabs
      previousPanelPinned = state.panelPinned
      previousSelectedIds = visualState.selectedIds.slice()
      previousDraggedIds = visualState.draggedIds.slice()
      previousDropTargetId = visualState.dropTargetId
      previousDropPosition = visualState.dropPosition
      if (editingTabId != null) {
        const input = root.querySelector(`.svb-tab__title-input[data-tab-id="${editingTabId}"]`)
        if (input && document.activeElement !== input) {
          input.focus()
          input.select()
        }
      }
    },

    dispose() {
      eventController.abort()
      stopDragAutoScroll()
      pointerDrag = null
      hideDragGhost()
      contextMenu = null
      pendingEnterNodes.clear()
      tabNodesByKey.clear()
      renderCurrent = () => {}
      latestState = null
    },
  }
}

module.exports = { createSidebarRenderer }

    },
    "entry.js": function(require, module, exports) {
const { waitForBrowser } = require('./bootstrap/wait-for-browser.js')
const { mountRoot } = require('./bootstrap/mount-root.js')
const { createTabStore } = require('./store/tab-store.js')
const { createPanelStore } = require('./store/panel-store.js')
const { createSelectionStore } = require('./store/selection-store.js')
const { createDragStore } = require('./store/drag-store.js')
const { createTabsApi } = require('./adapters/tabs-api.js')
const { createThemeAdapter } = require('./adapters/theme.js')
const { createLayoutAdapter } = require('./adapters/layout.js')
const { createSidebarRenderer } = require('./ui/render.js')

const APP_ID = 'svb-root'

function createTabLookupCache() {
  let tabStateRef = null
  let cached = null

  return function getLookup(tabState) {
    if (tabStateRef === tabState && cached) {
      return cached
    }

    const pinnedTabs = Array.isArray(tabState && tabState.pinnedTabs) ? tabState.pinnedTabs : []
    const tabs = Array.isArray(tabState && tabState.tabs) ? tabState.tabs : []
    const treeTabs = Array.isArray(tabState && tabState.treeTabs) ? tabState.treeTabs : []
    const visibleIds = []
    const visibleIdSet = new Set()
    const treeItemsById = new Map()

    for (const tab of pinnedTabs) {
      visibleIds.push(tab.id)
      visibleIdSet.add(tab.id)
    }
    for (const tab of tabs) {
      visibleIds.push(tab.id)
      visibleIdSet.add(tab.id)
    }
    for (const item of treeTabs) {
      treeItemsById.set(item.id, item)
    }

    cached = { visibleIds, visibleIdSet, treeItemsById }
    tabStateRef = tabState
    return cached
  }
}

function shouldMountInCurrentWindow() {
  const browser = document.querySelector('#browser')
  if (!browser) return false
  if (browser.classList.contains('popup') && browser.classList.contains('is-settingspage')) return false
  return true
}

async function main() {
  if (window.__svbInitialized) return
  window.__svbInitialized = true

  await waitForBrowser()

  if (!shouldMountInCurrentWindow()) return

  const mount = mountRoot(APP_ID)
  if (!mount) {
    window.__svbInitialized = false
    return
  }

  const theme = createThemeAdapter(mount.root)
  const panelStore = createPanelStore()
  await panelStore.init()
  const layout = createLayoutAdapter({
    root: mount.root,
    host: mount.host,
    trigger: mount.trigger,
    dragShield: mount.dragShield,
    panelStore,
  })
  const api = createTabsApi()
  const store = createTabStore(api)
  const selectionStore = createSelectionStore()
  const dragStore = createDragStore()
  const renderer = createSidebarRenderer({
    root: mount.root,
    onActivateTab: id => {
      selectionStore.clear()
      store.activateTab(id)
    },
    onCloseTab: id => store.closeTab(id),
    onCreateTab: () => store.createTab(),
    onCreateChildTab: id => store.createChildTab(id),
    onRenameTab: (id, title) => { void store.renameTab(id, title) },
    onTogglePinned: () => panelStore.togglePinned(),
    onToggleCollapse: id => { void store.toggleCollapsed(id) },
    onCollapseAll: () => { void store.collapseAll() },
    onOpenContextMenu: id => {
      const selectedIds = latestSelectionState.selectedIds || []
      if (!selectedIds.includes(id)) {
        selectionStore.selectSingle(id)
      }
    },
    onContextMenuAction: (action, payload) => {
      const tabId = payload && payload.tabId
      const selectedIds = latestSelectionState.selectedIds || []
      if (!Number.isFinite(tabId)) return

      if (action === 'restore-closed') {
        store.restoreLastClosedTab()
      } else if (action === 'new-child') {
        store.createChildTab(tabId)
      } else if (action === 'new-sibling') {
        store.createSiblingTab(tabId)
      } else if (action === 'move-window') {
        void store.moveSelectionToNewWindow(tabId, selectedIds)
      } else if (action === 'move-workspace') {
        void store.moveSelectionToWorkspace(tabId, selectedIds, payload.workspaceId)
      } else if (action === 'move-new-workspace') {
        void store.createWorkspaceAndMoveSelection(tabId, selectedIds)
      } else if (action === 'toggle-pin') {
        void store.togglePinnedForSelection(tabId, selectedIds)
      } else if (action === 'toggle-mute') {
        void store.toggleMutedForSelection(tabId, selectedIds)
      } else if (action === 'set-color') {
        void store.setColorForSelection(tabId, selectedIds, payload.colorKey)
      } else if (action === 'duplicate') {
        void store.duplicateTab(tabId)
      } else if (action === 'save-tree-bookmark') {
        void store.saveTreeAsBookmark(tabId)
      } else if (action === 'open-saved-tree') {
        void store.openSavedBookmarkTree(payload.bookmarkTreeId)
      } else if (action === 'delete-saved-tree') {
        void store.deleteSavedBookmarkTree(payload.bookmarkTreeId)
      } else if (action === 'close') {
        store.closeSelection(tabId, selectedIds)
      } else if (action === 'close-other') {
        store.closeOtherTabs(tabId, selectedIds)
      } else if (action === 'close-below') {
        store.closeTabsBelow(tabId)
      } else if (action === 'close-above') {
        store.closeTabsAbove(tabId)
      }
    },
    onStartDrag: (id, meta) => {
      const { visibleIds, treeItemsById } = getTabLookup(latestTabState)
      const selectedIds = latestSelectionState.selectedIds || []
      const draggedIds = selectedIds.includes(id)
        ? visibleIds
          .filter(tabId => selectedIds.includes(tabId))
          .filter(tabId => {
            const item = treeItemsById.get(tabId)
            return !(item && Array.isArray(item.ancestorIds) && item.ancestorIds.some(ancestorId => selectedIds.includes(ancestorId)))
          })
        : [id]

      dragStore.startDrag(draggedIds, meta)
    },
    onUpdateDropTarget: (targetId, position) => {
      dragStore.updateDropTarget(targetId, position)
    },
    onCommitDrop: (targetId, position) => {
      const dragState = dragStore.getState()
      const draggedIds = dragState.draggedIds
      if (!Array.isArray(draggedIds) || draggedIds.length === 0 || !Number.isFinite(targetId) || !position) {
        dragStore.clear()
        return
      }

      void store.moveTreeTabs(draggedIds, targetId, position).finally(() => {
        dragStore.clear()
      })
    },
    onCommitExternalDrop: () => {
      const dragState = dragStore.getState()
      const draggedIds = dragState.draggedIds
      if (!Array.isArray(draggedIds) || draggedIds.length === 0) {
        dragStore.clear()
        return
      }

      void store.moveSelectionToNewWindow(draggedIds[0], draggedIds).finally(() => {
        dragStore.clear()
      })
    },
    onClearDrag: () => {
      dragStore.clear()
    },
    onSelectTab: (id, payload) => {
      if (payload && payload.mode === 'toggle') {
        selectionStore.toggleSelected(id)
        return
      }

      if (payload && payload.mode === 'range') {
        const anchorId = selectionStore.getState().anchorId || id
        selectionStore.selectRange(anchorId, id, payload.orderedVisibleIds || [])
        return
      }

      selectionStore.selectSingle(id)
      if (!payload || payload.activate !== false) {
        store.activateTab(id)
      }
    },
  })

  let latestTabState = null
  let latestPanelState = panelStore.getState()
  let latestSelectionState = selectionStore.getState()
  let latestDragState = dragStore.getState()
  let previousVisibleActiveTabId = null
  const getTabLookup = createTabLookupCache()
  const entryEventController = new AbortController()
  const unsubscribers = []

  function getVisibleSelectedIds() {
    if (!latestTabState) return []

    const { visibleIdSet } = getTabLookup(latestTabState)
    const selectedIds = (latestSelectionState.selectedIds || [])
      .filter(tabId => visibleIdSet.has(tabId))

    return selectedIds
  }

  function resolveNativeTilingLayout(button) {
    if (!button || !button.style) return null
    const column = button.style.getPropertyValue('--displayTileColumn').trim()
    const row = button.style.getPropertyValue('--displayTileRow').trim()
    if (column === '1' && row === '1') return 'grid'
    if (column === '1' && row === '0') return 'column'
    if (column === '0' && row === '1') return 'row'
    return null
  }

  function interceptNativeTiling(event) {
    const button = event.target && event.target.closest
      ? event.target.closest('.PageTiling-Button')
      : null
    if (!button) return

    const layoutMode = resolveNativeTilingLayout(button)
    if (!layoutMode) return

    const selectedIds = getVisibleSelectedIds()
    if (selectedIds.length < 2) return

    event.preventDefault()
    event.stopPropagation()
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation()
    }

    api.tileTabs(selectedIds, layoutMode).catch(error => {
      console.warn('[svb] cannot tile selected tabs', error)
    })
  }

  function syncView() {
    if (!latestTabState) return

    renderer.render({
      ...latestTabState,
      pinnedTabs: latestTabState.pinnedTabs,
      tabs: latestTabState.tabs,
      treeTabs: latestTabState.treeTabs,
      drag: latestDragState,
      selectedIds: latestSelectionState.selectedIds,
      panelPinned: latestPanelState.pinned,
    })
    layout.apply()
  }

  unsubscribers.push(store.subscribe(state => {
    latestTabState = state
    const { visibleIds, treeItemsById } = getTabLookup(state)
    const activeRegularVisible = Number.isFinite(state.activeTabId) && treeItemsById.has(state.activeTabId)
    const activeTabChanged = state.activeTabId !== previousVisibleActiveTabId

    if (
      activeTabChanged
      && activeRegularVisible
      && latestSelectionState.selectedIds.length <= 1
      && latestSelectionState.selectedIds[0] !== state.activeTabId
    ) {
      selectionStore.selectSingle(state.activeTabId)
    } else {
      selectionStore.retainValid(visibleIds)
    }

    previousVisibleActiveTabId = activeRegularVisible ? state.activeTabId : previousVisibleActiveTabId
    syncView()
  }))

  unsubscribers.push(panelStore.subscribe(state => {
    latestPanelState = state
    syncView()
  }))

  unsubscribers.push(selectionStore.subscribe(state => {
    latestSelectionState = state
    syncView()
  }))

  unsubscribers.push(dragStore.subscribe(state => {
    latestDragState = state
    syncView()
  }))

  document.addEventListener('mouseup', interceptNativeTiling, {
    capture: true,
    signal: entryEventController.signal,
  })
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    interceptNativeTiling(event)
  }, {
    capture: true,
    signal: entryEventController.signal,
  })

  theme.start()
  layout.start()
  window.__svbDispose = () => {
    entryEventController.abort()
    while (unsubscribers.length) {
      const unsubscribe = unsubscribers.pop()
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
    if (typeof renderer.dispose === 'function') renderer.dispose()
    if (typeof store.dispose === 'function') store.dispose()
  }
  await store.init()
}

main().catch(error => {
  window.__svbInitialized = false
  if (typeof window.__svbDispose === 'function') {
    window.__svbDispose()
    window.__svbDispose = null
  }
  console.error('[svb] failed to initialize', error)
})

    }
  };
  const __cache = {};
  function __resolve(parentId, request) {
    if (!request.startsWith('.')) return request;
    const parentParts = parentId.split('/');
    parentParts.pop();
    const reqParts = request.split('/');
    for (const part of reqParts) {
      if (!part || part === '.') continue;
      if (part === '..') parentParts.pop();
      else parentParts.push(part);
    }
    const resolved = parentParts.join('/');
    return resolved.endsWith('.js') ? resolved : resolved + '.js';
  }
  function __require(id) {
    if (__cache[id]) return __cache[id].exports;
    if (!__modules[id]) throw new Error('Module not found: ' + id);
    const module = { exports: {} };
    __cache[id] = module;
    __modules[id](function(request) { return __require(__resolve(id, request)); }, module, module.exports);
    return module.exports;
  }
  __require('entry.js');
})();

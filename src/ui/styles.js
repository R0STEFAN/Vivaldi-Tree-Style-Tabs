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

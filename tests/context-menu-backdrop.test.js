const { test } = require('node:test')
const assert = require('node:assert/strict')
const { STYLE_TEXT } = require('../src/ui/styles.js')

test('context menu styling ensures shell is on top of drag shield in all auto-hide states', () => {
  // Menu open shell must have higher z-index than drag-shield (999999)
  assert.ok(STYLE_TEXT.includes('#svb-root.svb-shell.is-menu-open,\n#svb-root.svb-shell.svb-autohide-icons.is-menu-open,\n#svb-root.svb-shell.svb-autohide-icons.is-revealed.is-menu-open'))
  assert.ok(STYLE_TEXT.includes('z-index: 1000001 !important;'))

  // Drag shield backdrop must cover entire inset without clipping to sidebar width
  assert.ok(STYLE_TEXT.includes('#svb-root-drag-shield.svb-drag-shield.is-menu-backdrop'))
  assert.ok(STYLE_TEXT.includes('inset: 0 !important;'))
  assert.ok(STYLE_TEXT.includes('z-index: 999999 !important;'))

  // Menu host must be present and positioned
  assert.ok(STYLE_TEXT.includes('#svb-root .svb-menu-host'))
  assert.ok(STYLE_TEXT.includes('#svb-root .svb-menu'))
})

test('pinned tabs in icon strip define smooth transitions for translate and opacity', () => {
  assert.ok(STYLE_TEXT.includes('#svb-root .svb-pinned-tab'))
  assert.ok(STYLE_TEXT.includes('translate var(--svb-d-norm) var(--svb-ease-out)'))
  assert.ok(STYLE_TEXT.includes('opacity var(--svb-d-fast) ease'))

  // In collapsed autohide icons mode
  assert.ok(STYLE_TEXT.includes('#svb-root.svb-shell.svb-autohide-icons:not(.is-revealed) .svb-pinned-tab[data-strip-visible="true"]'))
  assert.ok(STYLE_TEXT.includes('translate: var(--svb-strip-offset, 0px) 0;'))
})

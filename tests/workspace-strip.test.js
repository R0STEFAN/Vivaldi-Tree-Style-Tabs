const { test } = require('node:test')
const assert = require('node:assert/strict')
const { syncWorkspaceStrip } = require('../src/ui/workspace-strip.js')

function createButton(left, active = false) {
  const styles = {}
  return {
    offsetLeft: left,
    classList: { contains: name => name === 'is-active' && active },
    style: {
      setProperty(name, value) { styles[name] = value },
      removeProperty(name) { delete styles[name] },
      getProperty(name) { return styles[name] },
      _styles: styles,
    },
  }
}

function createBar(buttons, scrollLeft = 0) {
  return {
    querySelector(selector) {
      if (selector === '.svb-workspaces__icons') {
        return {
          scrollLeft,
          querySelectorAll(subSelector) {
            if (subSelector === '.svb-workspace') return buttons
            return []
          },
        }
      }
      return null
    },
  }
}

test('sets offset 0px when first button is active', () => {
  const b1 = createButton(0, true)
  const b2 = createButton(32, false)
  const b3 = createButton(64, false)
  const bar = createBar([b1, b2, b3], 0)

  syncWorkspaceStrip(bar)
  assert.equal(b1.style.getProperty('--svb-strip-offset'), '0px')
  assert.equal(b2.style.getProperty('--svb-strip-offset'), undefined)
  assert.equal(b3.style.getProperty('--svb-strip-offset'), undefined)
})

test('sets negative offset on active button to translate back to first position', () => {
  const b1 = createButton(0, false)
  const b2 = createButton(32, true)
  const b3 = createButton(64, false)
  const bar = createBar([b1, b2, b3], 0)

  syncWorkspaceStrip(bar)
  assert.equal(b1.style.getProperty('--svb-strip-offset'), undefined)
  assert.equal(b2.style.getProperty('--svb-strip-offset'), '-32px')
  assert.equal(b3.style.getProperty('--svb-strip-offset'), undefined)
})

test('accounts for scrollLeft when calculating offset', () => {
  const b1 = createButton(0, false)
  const b2 = createButton(32, false)
  const b3 = createButton(64, true)
  // Scrolled by 32px so b3 is at (64 - 32) = 32px from scroller viewport
  const bar = createBar([b1, b2, b3], 32)

  syncWorkspaceStrip(bar)
  // offset = 0 - (64 - 32) = -32px
  assert.equal(b3.style.getProperty('--svb-strip-offset'), '-32px')
})

test('handles null bar, empty buttons, or missing active button gracefully', () => {
  assert.doesNotThrow(() => syncWorkspaceStrip(null))
  assert.doesNotThrow(() => syncWorkspaceStrip(createBar([])))
  const b1 = createButton(0, false)
  const bar = createBar([b1])
  assert.doesNotThrow(() => syncWorkspaceStrip(bar))
  // Fallbacks to first button as active
  assert.equal(b1.style.getProperty('--svb-strip-offset'), '0px')
})

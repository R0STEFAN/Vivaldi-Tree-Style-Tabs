const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const { STYLE_TEXT } = require('../src/ui/styles.js')
const { createLayoutAdapter } = require('../src/adapters/layout.js')
const { createPanelStore } = require('../src/store/panel-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

function createMockElement(tag, initialClasses = []) {
  const classSet = new Set(initialClasses)
  const styles = {}
  const listeners = {}
  return {
    tagName: tag.toUpperCase(),
    classList: {
      add: (...cls) => cls.forEach(c => classSet.add(c)),
      remove: (...cls) => cls.forEach(c => classSet.delete(c)),
      toggle: (cls, force) => {
        if (force === undefined) {
          if (classSet.has(cls)) classSet.delete(cls)
          else classSet.add(cls)
        } else if (force) {
          classSet.add(cls)
        } else {
          classSet.delete(cls)
        }
        return classSet.has(cls)
      },
      contains: cls => classSet.has(cls)
    },
    style: {
      width: '',
      getPropertyValue: prop => styles[prop] || '',
      setProperty: (prop, val) => { styles[prop] = val }
    },
    getBoundingClientRect: () => ({ width: 0, height: 0, top: 0, bottom: 0, left: 0, right: 0 }),
    addEventListener: (evt, handler) => {
      listeners[evt] = listeners[evt] || []
      listeners[evt].push(handler)
    },
    removeEventListener: (evt, handler) => {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(h => h !== handler)
      }
    },
    trigger: (evt, data) => {
      if (listeners[evt]) {
        listeners[evt].forEach(h => h(data))
      }
    },
    contains: () => true
  }
}

describe('Side Panel Coexistence - Styles', () => {
  it('defines --svb-panels-offset in CSS for shell and edge trigger', () => {
    assert.ok(STYLE_TEXT.includes('left: var(--svb-panels-offset, 0px) !important;'), 'left shell should offset by --svb-panels-offset')
    assert.ok(STYLE_TEXT.includes('right: var(--svb-panels-offset, 0px) !important;'), 'right shell should offset by --svb-panels-offset')
  })
})

describe('Side Panel Coexistence - Dynamic Layout Offset', () => {
  let root, host, trigger, dragShield, panelStore, layout, mockPanels, mockBrowser

  beforeEach(() => {
    const body = createMockElement('body')
    body.contains = () => true
    mockBrowser = createMockElement('div')
    mockPanels = createMockElement('div', ['left'])
    mockPanels.getBoundingClientRect = () => ({ width: 280, height: 1000, top: 0, bottom: 1000, left: 0, right: 280 })

    global.document = {
      body,
      documentElement: createMockElement('html'),
      querySelector: sel => {
        if (sel === '#browser') return mockBrowser
        return null
      },
      getElementById: id => {
        if (id === 'panels-container') return mockPanels
        return null
      },
      addEventListener: () => {},
      removeEventListener: () => {}
    }
    global.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      requestAnimationFrame: cb => setTimeout(cb, 0),
      cancelAnimationFrame: id => clearTimeout(id),
      innerWidth: 1920,
      innerHeight: 1080
    }
    global.MutationObserver = class {
      observe() {}
      disconnect() {}
    }
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
    }

    settingsStore.set('panelPosition', 'left')

    root = createMockElement('div')
    host = createMockElement('div', ['svb-layout-host'])
    trigger = createMockElement('div')
    dragShield = createMockElement('div')

    panelStore = createPanelStore()
    panelStore.setWidth(300)

    layout = createLayoutAdapter({
      root,
      host,
      trigger,
      dragShield,
      panelStore
    })
  })

  afterEach(() => {
    if (layout) layout.dispose()
  })

  it('sets --svb-panels-offset to native panel width when on the same side', () => {
    layout.start()
    assert.equal(host.style.getPropertyValue('--svb-panels-offset'), '280px', 'Host should have --svb-panels-offset matching panels-container width')
    assert.equal(trigger.style.getPropertyValue('--svb-panels-offset'), '280px', 'Trigger should have --svb-panels-offset matching panels-container width')
  })

  it('sets --svb-panels-offset to 0px when native panel has overlay class (floating panel)', () => {
    mockPanels.classList.add('overlay')
    layout.start()
    assert.equal(host.style.getPropertyValue('--svb-panels-offset'), '0px', 'Floating panel should not offset tab panel')
  })

  it('sets --svb-panels-offset to 0px when native panel is on the opposite side', () => {
    settingsStore.set('panelPosition', 'right')
    // mockPanels is 'left'
    layout.start()
    assert.equal(host.style.getPropertyValue('--svb-panels-offset'), '0px', 'Opposite side panel should not offset tab panel')
  })

  it('sets --svb-panels-offset to matching width when both are on the right side', () => {
    settingsStore.set('panelPosition', 'right')
    mockPanels.classList.remove('left')
    mockPanels.classList.add('right')
    mockPanels.getBoundingClientRect = () => ({ width: 340, height: 1000, top: 0, bottom: 1000, left: 1580, right: 1920 })
    layout.start()
    assert.equal(host.style.getPropertyValue('--svb-panels-offset'), '340px', 'Right side panel should offset right tab panel')
  })
})

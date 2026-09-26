const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert')
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

describe('layoutAdapter - autoHideMode', () => {
  let root, host, trigger, dragShield, panelStore, layout

  beforeEach(() => {
    // Setup document and window mock
    const body = createMockElement('body')
    body.contains = () => true
    global.document = {
      body,
      documentElement: createMockElement('html'),
      querySelector: () => null,
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

    settingsStore.set('panelPosition', 'left')
    settingsStore.set('autoHideMode', 'full')

    root = createMockElement('div')
    host = createMockElement('div', ['svb-layout-host'])
    trigger = createMockElement('div')
    dragShield = createMockElement('div')

    panelStore = createPanelStore()
    panelStore.setWidth(280)

    layout = createLayoutAdapter({
      root,
      host,
      trigger,
      dragShield,
      panelStore
    })
    layout.start()
  })

  afterEach(() => {
    if (layout) layout.dispose()
  })

  it('configures docked mode when pinned regardless of autoHideMode', () => {
    settingsStore.set('autoHideMode', 'icons')
    // panelStore is pinned by default
    layout.apply()

    assert.strictEqual(host.classList.contains('svb-mode-docked'), true)
    assert.strictEqual(host.classList.contains('svb-mode-overlay'), false)
    assert.strictEqual(host.classList.contains('svb-autohide-icons'), false)
    assert.strictEqual(root.classList.contains('svb-autohide-icons'), false)
    assert.strictEqual(root.classList.contains('is-revealed'), true)
    assert.strictEqual(root.style.width, '280px')
    assert.strictEqual(host.style.getPropertyValue('--svb-sidebar-width'), '280px')
  })

  it('configures full overlay auto-hide when unpinned with autoHideMode=full', () => {
    settingsStore.set('autoHideMode', 'full')
    panelStore.togglePinned() // unpin -> panelStore notifies layout
    layout.apply()

    assert.strictEqual(host.classList.contains('svb-mode-docked'), false)
    assert.strictEqual(host.classList.contains('svb-mode-overlay'), true)
    assert.strictEqual(host.classList.contains('svb-autohide-icons'), false)
    assert.strictEqual(root.classList.contains('svb-autohide-icons'), false)
    assert.strictEqual(root.classList.contains('is-revealed'), false)
    assert.strictEqual(root.style.width, '280px')
    assert.strictEqual(host.style.getPropertyValue('--svb-sidebar-width'), '280px')
    assert.strictEqual(trigger.classList.contains('is-enabled'), true)
  })

  it('configures 42px icon strip when unpinned with autoHideMode=icons', () => {
    settingsStore.set('autoHideMode', 'icons')
    panelStore.togglePinned() // unpin -> panelStore notifies layout
    layout.apply()

    // Host should be docked at 42px so webview stays docked and doesn't jump
    assert.strictEqual(host.classList.contains('svb-mode-docked'), true)
    assert.strictEqual(host.classList.contains('svb-mode-overlay'), false)
    assert.strictEqual(host.classList.contains('svb-autohide-icons'), true)
    assert.strictEqual(root.classList.contains('svb-autohide-icons'), true)
    assert.strictEqual(root.classList.contains('is-revealed'), false)
    assert.strictEqual(root.style.width, '42px')
    assert.strictEqual(host.style.getPropertyValue('--svb-sidebar-width'), '42px')
    assert.strictEqual(trigger.classList.contains('is-enabled'), false)
  })

  it('dynamically responds to settingsStore changes without manual layout calls', () => {
    panelStore.togglePinned() // unpin
    settingsStore.set('autoHideMode', 'full')

    assert.strictEqual(root.classList.contains('svb-autohide-icons'), false)
    assert.strictEqual(root.style.width, '280px')

    settingsStore.set('autoHideMode', 'icons')

    assert.strictEqual(root.classList.contains('svb-autohide-icons'), true)
    assert.strictEqual(root.style.width, '42px')
    assert.strictEqual(host.style.getPropertyValue('--svb-sidebar-width'), '42px')
  })

  it('keeps panel fully revealed when context menu is open in icons mode', () => {
    settingsStore.set('autoHideMode', 'icons')
    panelStore.togglePinned() // unpin
    layout.apply()

    assert.strictEqual(root.style.width, '42px')
    assert.strictEqual(root.classList.contains('is-revealed'), false)

    // Simulate opening context menu (marks root as is-menu-open)
    root.classList.add('is-menu-open')
    layout.apply()

    assert.strictEqual(root.style.width, '280px')
    assert.strictEqual(root.classList.contains('is-revealed'), true)
    assert.strictEqual(host.style.getPropertyValue('--svb-rendered-width'), '280px')

    // Simulate closing context menu
    root.classList.remove('is-menu-open')
    layout.apply()

    assert.strictEqual(root.style.width, '42px')
    assert.strictEqual(root.classList.contains('is-revealed'), false)
  })
})

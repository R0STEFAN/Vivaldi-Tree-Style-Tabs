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

    const docListeners = {}
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
      addEventListener: (evt, fn) => {
        docListeners[evt] = docListeners[evt] || []
        docListeners[evt].push(fn)
      },
      removeEventListener: (evt, fn) => {
        if (docListeners[evt]) {
          docListeners[evt] = docListeners[evt].filter(f => f !== fn)
        }
      },
      _trigger: (evt, data) => {
        if (docListeners[evt]) {
          docListeners[evt].forEach(fn => fn(data))
        }
      }
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

  it('reveals and keeps tab panel open when hovering same-side panels-container in full auto-hide mode', () => {
    panelStore.togglePinned() // unpin to activate overlay auto-hide
    settingsStore.set('autoHideMode', 'full')
    layout.start()

    // Initially unpinned and hidden
    assert.equal(root.classList.contains('is-revealed'), false, 'Tab panel should be initially hidden')

    // Mouse enters same-side panels-container
    mockPanels.trigger('mouseenter')
    assert.equal(root.classList.contains('is-revealed'), true, 'Tab panel should reveal on same-side panels mouseenter')

    // Mouse moves around inside panels-container (crossing buttons/elements)
    const panelButton = createMockElement('button')
    panelButton.contains = () => false
    mockPanels.contains = el => el === panelButton || el === mockPanels

    document._trigger('mouseover', { type: 'mouseover', target: panelButton })
    assert.equal(root.classList.contains('is-revealed'), true, 'Tab panel should remain revealed when hovering within panels-container')

    // Mouse leaves to external webpage
    const externalWebview = createMockElement('div')
    externalWebview.contains = () => false
    mockPanels.contains = () => false
    root.contains = () => false
    trigger.contains = () => false
    dragShield.contains = () => false

    document._trigger('mouseover', { type: 'mouseover', target: externalWebview, clientX: 500, clientY: 500 })
    assert.equal(root.classList.contains('is-revealed'), false, 'Tab panel should hide when mouse leaves to external content')
  })

  it('does NOT reveal tab panel when hovering opposite-side panels-container', () => {
    panelStore.togglePinned() // unpin
    settingsStore.set('autoHideMode', 'full')
    settingsStore.set('panelPosition', 'right') // tab panel is on right, mockPanels has 'left' class
    layout.start()

    assert.equal(root.classList.contains('is-revealed'), false, 'Tab panel should be initially hidden')

    mockPanels.trigger('mouseenter')
    assert.equal(root.classList.contains('is-revealed'), false, 'Opposite side panel hover must not reveal tab panel')
  })
})


const { mountRoot } = require('../src/bootstrap/mount-root.js')

describe('Side Panel Coexistence - mountRoot DOM Placement', () => {
  it('places svb-root after panels-container when panels-container is inside host', () => {
    const children = []
    const panelsNode = { id: 'panels-container', nextSibling: null }
    const webviewNode = { id: 'webview-container', nextSibling: null }
    panelsNode.nextSibling = webviewNode

    children.push(panelsNode)
    children.push(webviewNode)

    const host = {
      classList: { add: () => {} },
      querySelector: sel => {
        if (sel === '#panels-container') return panelsNode
        return null
      },
      prepend: node => children.unshift(node),
      appendChild: node => children.push(node),
      insertBefore: (node, refNode) => {
        const idx = children.indexOf(refNode)
        if (idx !== -1) children.splice(idx, 0, node)
        else children.push(node)
      }
    }

    global.document = {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      getElementById: () => null,
      querySelector: sel => {
        if (sel.includes('.inner')) return host
        return null
      },
      createElement: tag => ({ id: '', className: '', tag })
    }

    const { root } = mountRoot('svb-root')
    const panelsIdx = children.indexOf(panelsNode)
    const rootIdx = children.indexOf(root)
    const webviewIdx = children.indexOf(webviewNode)

    assert.ok(panelsIdx !== -1, 'panels should be in children')
    assert.ok(rootIdx !== -1, 'root should be in children')
    assert.ok(panelsIdx < rootIdx, 'panels-container must precede svb-root in DOM')
    assert.ok(rootIdx < webviewIdx, 'svb-root must precede webview-container in DOM')
  })
})

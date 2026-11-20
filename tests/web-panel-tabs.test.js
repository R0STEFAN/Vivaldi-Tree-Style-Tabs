const { describe, it, afterEach } = require('node:test')
const assert = require('node:assert')
const { createTabsApi, isPanelTab } = require('../src/adapters/tabs-api.js')

// Vivaldi creates web panel tabs via
// chrome.tabs.create({ url, windowId, vivExtData: JSON.stringify({ panelId }) })
const webPanelTab = {
  id: 501,
  index: 2,
  windowId: 1,
  url: 'https://example.com/',
  title: 'Example',
  vivExtData: JSON.stringify({ panelId: 'WEBPANEL_ckd7h3k2a00002e6ix0vz1a2b' }),
}
const normalTab = {
  id: 101,
  index: 0,
  windowId: 1,
  url: 'https://vivaldi.com/',
  title: 'Vivaldi',
  vivExtData: JSON.stringify({ workspaceId: 7 }),
}

function createEvent() {
  const listeners = []
  return {
    listeners,
    addListener: fn => listeners.push(fn),
    removeListener: fn => listeners.splice(listeners.indexOf(fn), 1),
    fire: (...args) => listeners.forEach(fn => fn(...args)),
  }
}

describe('web panel tabs', () => {
  const originalChrome = global.chrome
  afterEach(() => {
    global.chrome = originalChrome
  })

  it('detects panel tabs from string or object vivExtData', () => {
    assert.strictEqual(isPanelTab(webPanelTab), true)
    assert.strictEqual(isPanelTab({ id: 1, vivExtData: { panelId: 'WEBPANEL_x' } }), true)
    assert.strictEqual(isPanelTab(normalTab), false)
    assert.strictEqual(isPanelTab({ id: 2 }), false)
    assert.strictEqual(isPanelTab({ id: 3, vivExtData: 'not json' }), false)
  })

  it('excludes panel tabs from getTabs', async () => {
    global.chrome = {
      runtime: { lastError: null },
      tabs: { query: (_query, cb) => cb([normalTab, webPanelTab]) },
      windows: {},
    }

    const tabs = await createTabsApi().getTabs(1)
    assert.deepStrictEqual(tabs.map(tab => tab.id), [101])
  })

  it('does not forward created or updated events for panel tabs', () => {
    const onCreated = createEvent()
    const onUpdated = createEvent()
    global.chrome = {
      runtime: { lastError: null },
      tabs: { onCreated, onUpdated },
      windows: {},
    }

    const api = createTabsApi()
    const created = []
    const updated = []
    api.onCreated(tab => created.push(tab.id))
    api.onUpdated(tabId => updated.push(tabId))

    onCreated.fire(webPanelTab)
    onCreated.fire(normalTab)
    onUpdated.fire(webPanelTab.id, { status: 'complete' }, webPanelTab)
    onUpdated.fire(normalTab.id, { status: 'complete' }, normalTab)

    assert.deepStrictEqual(created, [101])
    assert.deepStrictEqual(updated, [101])
  })

  it('keeps panel tabs open when cleaning up a new window after detach', async () => {
    const removed = []
    global.chrome = {
      runtime: { lastError: null },
      tabs: {
        query: (_query, cb) => cb([
          { id: 101, windowId: 88 },
          { id: 900, windowId: 88, url: 'chrome://vivaldi-webui/startpage' },
          { ...webPanelTab, windowId: 88 },
        ]),
        move: (_id, _props, cb) => cb({}),
        update: (_id, _props, cb) => cb({}),
        remove: (ids, cb) => { removed.push(...ids); cb() },
      },
      windows: { create: (_props, cb) => cb({ id: 88 }) },
    }

    const result = await createTabsApi().moveTabsToNewWindow([101])
    assert.strictEqual(result.windowId, 88)
    assert.deepStrictEqual(removed, [900])
  })
})

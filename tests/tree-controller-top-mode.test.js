const { describe, it } = require('node:test')
const assert = require('node:assert')
const { createTreeController } = require('../src/controllers/tree-controller.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('treeController - newTabPlacement top mode', () => {
  it('places new root tab at index 0 when newTabPlacement is top', async () => {
    settingsStore.set('newTabPlacement', 'top')
    const mockApi = {
      updateVivExtData: async () => {},
    }
    const controller = createTreeController(mockApi)

    // Existing tabs 101, 102
    const tabs = [{ id: 101, url: 'https://a.com' }, { id: 102, url: 'https://b.com' }]
    await controller.sync({
      tabs,
      contextKey: 'window:1',
      currentContextKey: null,
      activeRegularTabId: 101,
    })

    // Create a new root tab 103
    controller.registerExpectedCreation({ kind: 'root' })
    controller.capturePendingCreation({ id: 103, url: 'chrome://newtab/' }, 101)

    const result = await controller.sync({
      tabs: [...tabs, { id: 103, url: 'chrome://newtab/' }],
      contextKey: 'window:1',
      currentContextKey: 'window:1',
      activeRegularTabId: 103,
    })

    // Tab 103 should be the first root tab in fullTreeOrderIds
    assert.strictEqual(result.fullTreeOrderIds[0], 103)
    assert.deepStrictEqual(result.fullTreeOrderIds, [103, 101, 102])
    settingsStore.set('newTabPlacement', 'bottom')
  })

  it('places new root tab at bottom when newTabPlacement is bottom', async () => {
    settingsStore.set('newTabPlacement', 'bottom')
    const mockApi = {
      updateVivExtData: async () => {},
    }
    const controller = createTreeController(mockApi)

    // Existing tabs 101, 102
    const tabs = [{ id: 101, url: 'https://a.com' }, { id: 102, url: 'https://b.com' }]
    await controller.sync({
      tabs,
      contextKey: 'window:1',
      currentContextKey: null,
      activeRegularTabId: 101,
    })

    // Create a new root tab 103
    controller.registerExpectedCreation({ kind: 'root' })
    controller.capturePendingCreation({ id: 103, url: 'chrome://newtab/' }, 101)

    const result = await controller.sync({
      tabs: [...tabs, { id: 103, url: 'chrome://newtab/' }],
      contextKey: 'window:1',
      currentContextKey: 'window:1',
      activeRegularTabId: 103,
    })

    // Tab 103 should be the last root tab in fullTreeOrderIds
    assert.strictEqual(result.fullTreeOrderIds[2], 103)
    assert.deepStrictEqual(result.fullTreeOrderIds, [101, 102, 103])
  })

  it('places external tab (without opener) at top when newTabPlacement is top', async () => {
    settingsStore.set('newTabPlacement', 'top')
    const mockApi = {
      updateVivExtData: async () => {},
    }
    const controller = createTreeController(mockApi)

    // Existing tabs 101, 102
    const tabs = [{ id: 101, url: 'https://a.com' }, { id: 102, url: 'https://b.com' }]
    await controller.sync({
      tabs,
      contextKey: 'window:1',
      currentContextKey: null,
      activeRegularTabId: 101,
    })

    // Tab opened from external application (no expectedCreation, no openerTabId, url is external)
    controller.capturePendingCreation({ id: 104, url: 'https://external-app.com' }, 101)

    const result = await controller.sync({
      tabs: [...tabs, { id: 104, url: 'https://external-app.com' }],
      contextKey: 'window:1',
      currentContextKey: 'window:1',
      activeRegularTabId: 104,
    })

    assert.strictEqual(result.fullTreeOrderIds[0], 104)
    assert.deepStrictEqual(result.fullTreeOrderIds, [104, 101, 102])
    settingsStore.set('newTabPlacement', 'bottom')
  })
})

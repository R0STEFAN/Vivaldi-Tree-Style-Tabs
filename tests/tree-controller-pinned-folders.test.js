const { describe, it } = require('node:test')
const assert = require('node:assert')
const { createTreeController } = require('../src/controllers/tree-controller.js')
const { buildTreeView } = require('../src/store/tree-selectors.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('treeController & selectors with pinned folders in top mode', () => {
  it('places new root tab UNDER pinned folders when newTabPlacement is top', async () => {
    settingsStore.set('newTabPlacement', 'top')
    const mockApi = {
      updateVivExtData: async () => {},
    }
    const controller = createTreeController(mockApi)

    // Existing: 200 (pinned folder), 101 (regular tab)
    const tabs = [
      { id: 200, url: 'svb-folder.html', vivExtData: { isFolder: true, pinnedFolder: true } },
      { id: 101, url: 'https://a.com' }
    ]
    await controller.sync({
      tabs,
      contextKey: 'window:1',
      currentContextKey: null,
      activeRegularTabId: 101,
    })

    // Create new root tab 103 via "New Tab" button
    controller.registerExpectedCreation({ kind: 'root' })
    controller.capturePendingCreation({ id: 103, url: 'chrome://newtab/' }, 101)

    const result = await controller.sync({
      tabs: [
        { id: 200, url: 'svb-folder.html', vivExtData: { isFolder: true, pinnedFolder: true } },
        { id: 101, url: 'https://a.com' },
        { id: 103, url: 'chrome://newtab/' }
      ],
      contextKey: 'window:1',
      currentContextKey: 'window:1',
      activeRegularTabId: 103,
    })

    // The order must be: 200 (pinned folder), 103 (new top tab), 101 (old tab)
    assert.deepStrictEqual(result.fullTreeOrderIds, [200, 103, 101])
    settingsStore.set('newTabPlacement', 'bottom')
  })

  it('places link opened from pinned tab UNDER pinned folders', async () => {
    settingsStore.set('newTabPlacement', 'top')
    const mockApi = {
      updateVivExtData: async () => {},
    }
    const controller = createTreeController(mockApi)

    // Pinned tab 1 (e.g. Gmail), Pinned folder 200, Regular tab 101
    const tabs = [
      { id: 200, url: 'svb-folder.html', vivExtData: { isFolder: true, pinnedFolder: true } },
      { id: 101, url: 'https://a.com' }
    ]
    await controller.sync({
      tabs,
      contextKey: 'window:1',
      currentContextKey: null,
      activeRegularTabId: 200,
    })

    // Open link from pinned tab 1 (fromPinnedTab: true)
    controller.capturePendingCreation({ id: 105, url: 'https://link-from-mail.com' }, 1, { fromPinnedTab: true })

    const result = await controller.sync({
      tabs: [
        { id: 200, url: 'svb-folder.html', vivExtData: { isFolder: true, pinnedFolder: true } },
        { id: 101, url: 'https://a.com' },
        { id: 105, url: 'https://link-from-mail.com' }
      ],
      contextKey: 'window:1',
      currentContextKey: 'window:1',
      activeRegularTabId: 105,
    })

    // Pinned folder 200 MUST stay above 105
    assert.deepStrictEqual(result.fullTreeOrderIds, [200, 105, 101])
    settingsStore.set('newTabPlacement', 'bottom')
  })

  it('buildTreeView always sorts pinned folders above regular root tabs', () => {
    const tabs = [
      { id: 101, url: 'https://a.com', index: 0 },
      { id: 200, url: 'svb-folder.html', index: 1, vivExtData: { isFolder: true, pinnedFolder: true } }
    ]
    const treeState = {
      rootIds: [101, 200],
      nodesById: {
        101: { parentId: null, childIds: [] },
        200: { parentId: null, childIds: [] },
      }
    }

    const view = buildTreeView({ tabs, treeState })
    const visibleIds = view.visibleTabs.map(t => t.id)
    assert.deepStrictEqual(visibleIds, [200, 101])
  })
})

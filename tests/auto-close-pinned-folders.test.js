const { describe, it } = require('node:test')
const assert = require('node:assert')
const { createTabStore } = require('../src/store/tab-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('autoClose - protect pinned folders and their children', () => {
  it('does NOT close pinned folders or their children when autoCloseTabsDays is active', async () => {
    settingsStore.set('autoCloseTabsDays', 1) // 1 day threshold
    const closedIds = []
    const oldTimestamp = Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 days old

    const mockTabs = [
      {
        id: 200,
        index: 0,
        windowId: 1,
        pinned: false,
        vivExtData: {
          isFolder: true,
          pinnedFolder: true,
          svbTree: { contextKey: 'window:1', nodeId: 'node_200', order: 0, createdAt: oldTimestamp }
        }
      },
      {
        id: 201,
        index: 1,
        windowId: 1,
        pinned: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_201', parentNodeId: 'node_200', order: 1, createdAt: oldTimestamp }
        }
      },
      {
        id: 101,
        index: 2,
        windowId: 1,
        pinned: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_101', order: 2, createdAt: oldTimestamp }
        }
      }
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (query, cb) => cb(mockTabs),
      updateTab: async () => {},
      closeTabs: async (ids) => {
        closedIds.push(...ids)
      },
      updateVivExtData: async () => {},
      onCreated: noopUnsub,
      onUpdated: noopUnsub,
      onRemoved: noopUnsub,
      onMoved: noopUnsub,
      onAttached: noopUnsub,
      onDetached: noopUnsub,
      onActivated: noopUnsub,
      onWindowFocusChanged: noopUnsub,
      isVivaldi: () => true,
    }

    const store = createTabStore(mockApi)
    try {
      await store.init()
      store.runAutoCloseJob()

      // Tab 101 SHOULD be closed
      assert.strictEqual(closedIds.includes(101), true)
      // Pinned folder 200 and its child 201 MUST NOT be closed
      assert.strictEqual(closedIds.includes(200), false)
      assert.strictEqual(closedIds.includes(201), false)
    } finally {
      settingsStore.set('autoCloseTabsDays', 0)
      store.dispose()
    }
  })
})

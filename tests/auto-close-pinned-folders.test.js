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
      await store.runAutoCloseJob()

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

  it('closes expired child tabs even when parent tab is young', async () => {
    settingsStore.set('autoCloseTabsDays', 3) // 3 days threshold
    const closedIds = []
    const sixDaysAgo = Date.now() - (6 * 24 * 60 * 60 * 1000)
    const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000)

    const mockTabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        pinned: false,
        active: true,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_10', order: 0, createdAt: oneDayAgo }
        }
      },
      {
        id: 11, // Child tab (opened 6 days ago - e.g. spree/storefront)
        index: 1,
        windowId: 1,
        pinned: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 1, createdAt: sixDaysAgo }
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
      await store.runAutoCloseJob()

      // Child tab 11 SHOULD be closed
      assert.strictEqual(closedIds.includes(11), true)
      // Parent tab 10 MUST NOT be closed (younger than 3 days and active)
      assert.strictEqual(closedIds.includes(10), false)
    } finally {
      settingsStore.set('autoCloseTabsDays', 0)
      store.dispose()
    }
  })

  it('closes both parent and child when both are expired', async () => {
    settingsStore.set('autoCloseTabsDays', 3)
    const closedIds = []
    const sixDaysAgo = Date.now() - (6 * 24 * 60 * 60 * 1000)

    const mockTabs = [
      {
        id: 1, // Another tab to keep window open and active
        index: 0,
        windowId: 1,
        pinned: false,
        active: true,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_1', order: 0, createdAt: Date.now() }
        }
      },
      {
        id: 20, // Expired parent tab
        index: 1,
        windowId: 1,
        pinned: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_20', order: 1, createdAt: sixDaysAgo }
        }
      },
      {
        id: 21, // Expired child tab
        index: 2,
        windowId: 1,
        pinned: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_21', parentNodeId: 'node_20', order: 2, createdAt: sixDaysAgo }
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
      await store.runAutoCloseJob()

      assert.strictEqual(closedIds.includes(20), true)
      assert.strictEqual(closedIds.includes(21), true)
      assert.strictEqual(closedIds.includes(1), false)
    } finally {
      settingsStore.set('autoCloseTabsDays', 0)
      store.dispose()
    }
  })

  it('runs automatically when settingsStore changes autoCloseTabsDays', async () => {
    settingsStore.set('autoCloseTabsDays', 0) // Initially 0 (Never)
    const closedIds = []
    const fourDaysAgo = Date.now() - (4 * 24 * 60 * 60 * 1000)

    const mockTabs = [
      {
        id: 1,
        index: 0,
        windowId: 1,
        pinned: false,
        active: true,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_1', order: 0, createdAt: Date.now() }
        }
      },
      {
        id: 30, // 4 days old tab
        index: 1,
        windowId: 1,
        pinned: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_30', order: 1, createdAt: fourDaysAgo }
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
      assert.strictEqual(closedIds.includes(30), false) // Not closed because autoCloseTabsDays was 0

      // User changes setting to 3 days
      settingsStore.set('autoCloseTabsDays', 3)
      // Allow microtasks to complete
      await new Promise(r => setTimeout(r, 50))

      assert.strictEqual(closedIds.includes(30), true)
    } finally {
      settingsStore.set('autoCloseTabsDays', 0)
      store.dispose()
    }
  })
})

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { createTabStore } = require('../src/store/tab-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('TabStore - AI Grouping Orchestrator', () => {
  it('returns missing-key when geminiApiKey is empty', async () => {
    settingsStore.set('geminiApiKey', '')
    const store = createTabStore({
      getCurrentWindowId: async () => 1,
      getTabs: async () => [],
      queryTabs: (_q, cb) => cb([]),
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: () => () => {},
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: () => () => {},
      onWindowFocusChanged: () => () => {},
      isVivaldi: () => true,
    })

    try {
      await store.init()
      const result = await store.aiGroupTabs()
      assert.deepStrictEqual(result, { success: false, reason: 'missing-key' })
    } finally {
      store.dispose()
    }
  })

  it('returns not-enough-tabs when fewer than 2 root ungrouped tabs are present', async () => {
    settingsStore.set('geminiApiKey', 'test-key')
    const mockTabs = [
      {
        id: 1,
        index: 0,
        windowId: 1,
        title: 'Only One Tab',
        url: 'https://example.com',
        pinned: false,
        active: true,
      }
    ]

    const store = createTabStore({
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (_q, cb) => cb(mockTabs),
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: () => () => {},
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: () => () => {},
      onWindowFocusChanged: () => () => {},
      isVivaldi: () => true,
    })

    try {
      await store.init()
      const result = await store.aiGroupTabs()
      assert.deepStrictEqual(result, { success: false, reason: 'not-enough-tabs', count: 1 })
    } finally {
      store.dispose()
      settingsStore.set('geminiApiKey', '')
    }
  })

  it('moves loose tabs into existing folder and creates new folder for others', async () => {
    settingsStore.set('geminiApiKey', 'test-key')
    settingsStore.set('geminiModel', 'gemini-2.5-flash')
    settingsStore.set('geminiFolderLanguage', 'uk')

    let nextTabId = 200
    const createdTabs = []
    const updatedPayloads = []

    // Existing tabs:
    // Tab 10: Existing folder "💻 Dev"
    // Tab 11: Loose tab "GitHub Issues" (should go into Dev)
    // Tab 12: Loose tab "Amazon Book" (should go into new "🛒 Shopping" folder)
    // Tab 13: Loose tab "eBay Shoes" (should go into new "🛒 Shopping" folder)
    const mockTabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        title: '💻 Dev',
        url: 'http://localhost/svb-folder.html#svb-folder:color=blue',
        pinned: false,
        active: false,
        vivExtData: {
          isFolder: true,
          fixedTitle: '💻 Dev',
          folderColor: 'blue',
          svbTree: { contextKey: 'window:1', nodeId: 'node_10', order: 0 }
        }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        title: 'GitHub Issues',
        url: 'https://github.com/org/repo/issues',
        pinned: false,
        active: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_11', order: 1 }
        }
      },
      {
        id: 12,
        index: 2,
        windowId: 1,
        title: 'Amazon Book',
        url: 'https://amazon.com/dp/123',
        pinned: false,
        active: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_12', order: 2 }
        }
      },
      {
        id: 13,
        index: 3,
        windowId: 1,
        title: 'eBay Shoes',
        url: 'https://ebay.com/itm/456',
        pinned: false,
        active: true,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_13', order: 3 }
        }
      }
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (_q, cb) => cb(mockTabs),
      updateTab: async () => {},
      closeTabs: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedPayloads.push({ tabId, data })
        const t = mockTabs.find(tab => tab.id === tabId)
        if (t) t.vivExtData = data
      },
      createRestoredTab: async (_winId, options) => {
        const id = nextTabId++
        const newTab = {
          id,
          index: mockTabs.length,
          windowId: 1,
          title: options.vivExtData?.fixedTitle || 'Folder',
          url: options.url,
          pinned: false,
          active: false,
          vivExtData: options.vivExtData,
        }
        mockTabs.push(newTab)
        createdTabs.push(newTab)
        return newTab
      },
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

    // Mock gemini fetch function
    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    groups: [
                      {
                        folderId: 10,
                        tabIds: [11]
                      },
                      {
                        newFolderName: '🛒 Покупки',
                        color: 'purple',
                        tabIds: [12, 13]
                      }
                    ]
                  })
                }
              ]
            }
          }
        ]
      })
    })

    const store = createTabStore(mockApi)
    try {
      await store.init()
      const result = await store.aiGroupTabs({ fetchFn: mockFetch })
      assert.strictEqual(result.success, true)

      // Tab 11 should have parentId = 10 (or parentNodeId matching node_10)
      const state = store.getState()
      const treeTab11 = state.treeTabs.find(t => t.id === 11)
      assert.strictEqual(treeTab11.parentId, 10, 'Tab 11 should be child of existing folder 10')

      // A new folder tab should have been created for Shopping
      assert.strictEqual(createdTabs.length, 1)
      const shoppingFolderId = createdTabs[0].id
      assert.strictEqual(createdTabs[0].title, '🛒 Покупки')

      // Tabs 12 and 13 should have parentId = shoppingFolderId
      const treeTab12 = state.treeTabs.find(t => t.id === 12)
      const treeTab13 = state.treeTabs.find(t => t.id === 13)
      assert.strictEqual(treeTab12.parentId, shoppingFolderId, 'Tab 12 should be child of new shopping folder')
      assert.strictEqual(treeTab13.parentId, shoppingFolderId, 'Tab 13 should be child of new shopping folder')
    } finally {
      store.dispose()
      settingsStore.set('geminiApiKey', '')
    }
  })

  it('moves root tab with its entire subtree into folder preserving child relationship', async () => {
    settingsStore.set('geminiApiKey', 'test-key')

    let nextTabId = 300
    const createdTabs = []
    const updatedPayloads = []

    // Tab 20: Root tab with child Tab 21
    // Tab 21: Child of Tab 20
    // Tab 22: Another root tab
    const mockTabs = [
      {
        id: 20,
        index: 0,
        windowId: 1,
        title: 'Project Alpha Home',
        url: 'https://alpha.example.com',
        pinned: false,
        active: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_20', order: 0 }
        }
      },
      {
        id: 21,
        index: 1,
        windowId: 1,
        title: 'Alpha Docs',
        url: 'https://alpha.example.com/docs',
        pinned: false,
        active: false,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_21', parentNodeId: 'node_20', order: 0 }
        }
      },
      {
        id: 22,
        index: 2,
        windowId: 1,
        title: 'Project Alpha Repo',
        url: 'https://github.com/org/alpha',
        pinned: false,
        active: true,
        vivExtData: {
          svbTree: { contextKey: 'window:1', nodeId: 'node_22', order: 1 }
        }
      }
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (_q, cb) => cb(mockTabs),
      updateTab: async () => {},
      closeTabs: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedPayloads.push({ tabId, data })
        const t = mockTabs.find(tab => tab.id === tabId)
        if (t) t.vivExtData = data
      },
      createRestoredTab: async (_winId, options) => {
        const id = nextTabId++
        const newTab = {
          id,
          index: mockTabs.length,
          windowId: 1,
          title: options.vivExtData?.fixedTitle || 'Folder',
          url: options.url,
          pinned: false,
          active: false,
          vivExtData: options.vivExtData,
        }
        mockTabs.push(newTab)
        createdTabs.push(newTab)
        return newTab
      },
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

    // Gemini groups Tab 20 and Tab 22 into new "🚀 Alpha" folder
    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    groups: [
                      {
                        newFolderName: '🚀 Alpha',
                        color: 'teal',
                        tabIds: [20, 22]
                      }
                    ]
                  })
                }
              ]
            }
          }
        ]
      })
    })

    const store = createTabStore(mockApi)
    try {
      await store.init()
      const result = await store.aiGroupTabs({ fetchFn: mockFetch })
      assert.strictEqual(result.success, true)

      const state = store.getState()
      assert.strictEqual(createdTabs.length, 1)
      const alphaFolderId = createdTabs[0].id

      // Root tab 20 should be child of alphaFolderId
      const treeTab20 = state.treeTabs.find(t => t.id === 20)
      assert.strictEqual(treeTab20.parentId, alphaFolderId)

      // Subtree tab 21 should STILL have parentId = 20!
      const treeTab21 = state.treeTabs.find(t => t.id === 21)
      assert.strictEqual(treeTab21.parentId, 20, 'Child tab 21 should remain child of Tab 20 inside the folder')

      // Root tab 22 should also be child of alphaFolderId
      const treeTab22 = state.treeTabs.find(t => t.id === 22)
      assert.strictEqual(treeTab22.parentId, alphaFolderId)
    } finally {
      store.dispose()
      settingsStore.set('geminiApiKey', '')
    }
  })
})

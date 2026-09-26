const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert')
const { createTabStore } = require('../src/store/tab-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('moveSelectionToTop and moveSelectionToBottom', () => {
  function createMockApi(tabs) {
    let currentTabs = JSON.parse(JSON.stringify(tabs))
    const updatedVivExt = new Map()

    return {
      getCurrentWindowId: async () => 1,
      getTabs: async () => currentTabs,
      getActiveWorkspaceId: () => undefined,
      getWorkspaces: async () => [],
      activateTab: async () => {},
      closeTab: async () => {},
      closeTabs: async () => {},
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedVivExt.set(tabId, data)
        const tab = currentTabs.find(t => t.id === tabId)
        if (tab) tab.vivExtData = data
      },
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: () => () => {},
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: () => () => {},
      onWindowFocusChanged: () => () => {},
      isVivaldi: () => true,
    }
  }

  beforeEach(() => {
    settingsStore.set('newTabPlacement', 'bottom')
  })

  it('moves root tab to top of tree (under pinned folders if any)', async () => {
    const tabs = [
      {
        id: 1,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { isFolder: true, pinnedFolder: true, svbTree: { contextKey: 'window:1', nodeId: 'node_1', parentNodeId: null, order: 0 } }
      },
      {
        id: 10,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 1 } }
      },
      {
        id: 20,
        index: 2,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 2 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    // Move tab 20 to top
    await store.moveSelectionToTop(20, [20])

    const treeState = store.getState().treeTabs
    const ids = treeState.map(t => t.id)
    // Tab 1 is pinned folder (must stay at index 0), tab 20 should be right under it (index 1), tab 10 after it (index 2)
    assert.deepStrictEqual(ids, [1, 20, 10])

    store.dispose()
  })

  it('moves child tab with subtree to top as a root tab', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 0 } }
      },
      {
        id: 12,
        index: 2,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_12', parentNodeId: 'node_11', order: 0 } }
      },
      {
        id: 20,
        index: 3,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 1 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    // Move child tab 11 (which has child 12) to top
    await store.moveSelectionToTop(11, [11])

    const treeState = store.getState().treeTabs
    const ids = treeState.map(t => t.id)
    // Tab 11 and its child 12 should be at the very top, before tab 10 and tab 20
    assert.deepStrictEqual(ids, [11, 12, 10, 20])
    
    // Tab 11 should now have parentId null, and Tab 12 still child of Tab 11
    const item11 = treeState.find(t => t.id === 11)
    const item12 = treeState.find(t => t.id === 12)
    assert.strictEqual(item11.parentId, null)
    assert.strictEqual(item12.parentId, 11)

    store.dispose()
  })

  it('moves root tab to bottom of tree', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 0 } }
      },
      {
        id: 20,
        index: 2,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 1 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    // Move tab 10 (which has child 11) to bottom
    await store.moveSelectionToBottom(10, [10])

    const treeState = store.getState().treeTabs
    const ids = treeState.map(t => t.id)
    // Tab 20 should now be first, and Tab 10 (with child 11) at bottom
    assert.deepStrictEqual(ids, [20, 10, 11])

    store.dispose()
  })

  it('moves multiple selected tabs to top preserving relative order', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 20,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 1 } }
      },
      {
        id: 30,
        index: 2,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_30', parentNodeId: null, order: 2 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    // Move tabs 20 and 30 to top
    await store.moveSelectionToTop(20, [20, 30])

    const treeState = store.getState().treeTabs
    const ids = treeState.map(t => t.id)
    assert.deepStrictEqual(ids, [20, 30, 10])

    store.dispose()
  })
})

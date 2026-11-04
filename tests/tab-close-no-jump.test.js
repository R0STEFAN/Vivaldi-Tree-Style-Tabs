const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { createTabStore } = require('../src/store/tab-store.js')
const { createTreeController } = require('../src/controllers/tree-controller.js')
const { createTreeStore } = require('../src/store/tree-store.js')

describe('Tab Close - No Jump to Bottom', () => {
  it('treeController does not re-add closing/removed tab at the bottom of treeTabs if getTabs still includes it', async () => {
    const treeStore = createTreeStore()
    const treeController = createTreeController({
      treeStore,
      treePersistence: {
        loadTree: async () => ({
          rootIds: [10, 20, 30],
          nodesById: {
            10: { id: 10, parentId: null, childIds: [] },
            20: { id: 20, parentId: null, childIds: [] },
            30: { id: 30, parentId: null, childIds: [] },
          },
        }),
        saveTree: async () => {},
      },
      settingsStore: {
        get: (key) => (key === 'newTabPlacement' ? 'bottom' : null),
        subscribe: () => () => {},
      },
    })

    const initialTabs = [
      { id: 10, index: 0, windowId: 1 },
      { id: 20, index: 1, windowId: 1 },
      { id: 30, index: 2, windowId: 1 },
    ]

    const initialResult = await treeController.sync({
      tabs: initialTabs,
      contextKey: 'window:1',
      currentContextKey: null,
      activeRegularTabId: 10,
    })

    assert.deepEqual(initialResult.treeTabs.map(t => t.id), [10, 20, 30])

    // Tab 20 is removed (or marked closing)
    if (typeof treeController.markClosingTab === 'function') {
      treeController.markClosingTab(20)
    }
    treeController.handleRemovedTab(20)

    // A sync happens while initialTabs STILL includes tab 20 (IPC latency)
    const viewAfterRemove = await treeController.sync({
      tabs: initialTabs,
      contextKey: 'window:1',
      currentContextKey: 'window:1',
      activeRegularTabId: 10,
    })

    // The view MUST NOT place tab 20 at the bottom ([10, 30, 20])!
    // It should cleanly produce [10, 30].
    assert.deepEqual(
      viewAfterRemove.treeTabs.map(t => t.id),
      [10, 30],
      'Closing/removed tab must not appear at the bottom of treeTabs'
    )
  })

  it('tabStore immediately filters closing tab from treeTabs on closeTab', async () => {
    const initialTabs = [
      { id: 10, index: 0, windowId: 1, active: false, pinned: false, vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } } },
      { id: 20, index: 1, windowId: 1, active: true, pinned: false, vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 1 } } },
      { id: 30, index: 2, windowId: 1, active: false, pinned: false, vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_30', parentNodeId: null, order: 2 } } },
    ]

    let currentTabs = JSON.parse(JSON.stringify(initialTabs))
    let onRemovedListener = null
    let onActivatedListener = null

    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => currentTabs,
      getActiveWorkspaceId: () => undefined,
      getWorkspaces: async () => [],
      activateTab: async (tabId) => {
        for (const t of currentTabs) t.active = t.id === tabId
        if (onActivatedListener) onActivatedListener({ tabId })
      },
      closeTab: async (tabId) => {
        // In real browser, during closeTab execution, tab is marked closing
        currentTabs = currentTabs.filter(t => t.id !== tabId)
        if (onRemovedListener) onRemovedListener(tabId)
      },
      updateTab: async () => {},
      updateVivExtData: async () => {},
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: (fn) => { onRemovedListener = fn; return () => {} },
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: (fn) => {
        onActivatedListener = (info) => {
          fn(info)
        }
        return () => {}
      },
      onWindowFocusChanged: () => () => {},
      isVivaldi: () => true,
    }

    const store = createTabStore(mockApi)
    await store.init()

    assert.deepEqual(store.getState().treeTabs.map(t => t.id), [10, 20, 30])

    // Close tab 20
    await store.closeTab(20)

    const stateAfterClose = store.getState()
    assert.deepEqual(stateAfterClose.treeTabs.map(t => t.id), [10, 30])
    store.dispose()
  })
})

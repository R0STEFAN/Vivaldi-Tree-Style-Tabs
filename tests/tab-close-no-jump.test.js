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

  it('treeStore.repair promotes children in place when parent tab is missing from validTabIds', () => {
    const treeStore = createTreeStore()
    treeStore.load('window:1', {
      rootIds: [10, 20, 30],
      nodesById: {
        10: { parentId: null, childIds: [] },
        20: { parentId: null, childIds: [21, 22] },
        21: { parentId: 20, childIds: [] },
        22: { parentId: 20, childIds: [] },
        30: { parentId: null, childIds: [] },
      },
    })

    // Parent 20 is closed; valid tabs in browser are [10, 21, 22, 30]
    treeStore.repair([10, 21, 22, 30])
    const state = treeStore.exportState()

    // Children 21 and 22 MUST be promoted in place at index 1 and 2, NOT pushed to the bottom!
    assert.deepEqual(state.rootIds, [10, 21, 22, 30])
    assert.equal(state.nodesById[21].parentId, null)
    assert.equal(state.nodesById[22].parentId, null)
  })

  it('tabStore promotes child tab in place without jumping to bottom during native closure race', async () => {
    function createTab(id, parentId, order, extra = {}) {
      return {
        id,
        index: id,
        windowId: 1,
        title: `Tab ${id}`,
        url: `https://example.com/${id}`,
        pinned: false,
        active: id === 20,
        vivExtData: {
          svbTree: {
            contextKey: 'window:1',
            nodeId: `n${id}`,
            parentNodeId: parentId == null ? null : `n${parentId}`,
            order,
            collapsed: false,
          },
        },
        ...extra,
      }
    }

    let currentTabs = [
      createTab(10, null, 0),
      createTab(20, null, 1),
      createTab(21, 20, 0),
      createTab(30, null, 2),
    ]

    let onRemovedListener = null
    let onActivatedListener = null

    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => JSON.parse(JSON.stringify(currentTabs)),
      getActiveWorkspaceId: () => undefined,
      getWorkspaces: async () => [],
      isVivaldi: () => true,
      updateTab: async (id, patch) => {
        Object.assign(currentTabs.find(tab => tab.id === id) || {}, patch)
      },
      updateVivExtData: async (id, data) => {
        const t = currentTabs.find(tab => tab.id === id)
        if (t) t.vivExtData = data
      },
      activateTab: async (id) => {
        for (const t of currentTabs) t.active = t.id === id
        if (onActivatedListener) onActivatedListener({ tabId: id, windowId: 1 })
      },
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: (fn) => { onRemovedListener = fn; return () => {} },
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: (fn) => { onActivatedListener = fn; return () => {} },
      onWindowFocusChanged: () => () => {},
    }

    const store = createTabStore(mockApi)
    await store.init()

    assert.deepEqual(
      store.getState().treeTabs.map(t => [t.id, t.depth]),
      [[10, 0], [20, 0], [21, 1], [30, 0]]
    )

    // Simulate real browser race:
    // Tab 20 is closed natively (e.g. Ctrl+W).
    // 1. Tab 20 is removed from browser tab array.
    currentTabs = currentTabs.filter(t => t.id !== 20)
    currentTabs[0].active = true

    // 2. Browser fires onActivated FIRST.
    onActivatedListener({ tabId: 10, windowId: 1 })

    // 3. Small async delay before onRemoved fires.
    await new Promise(r => setTimeout(r, 20))
    onRemovedListener(20)

    // Wait for debounce/sync to settle.
    await new Promise(r => setTimeout(r, 250))

    const finalTabs = store.getState().treeTabs.map(t => [t.id, t.depth])
    assert.deepEqual(
      finalTabs,
      [[10, 0], [21, 0], [30, 0]],
      'Child tab 21 must be promoted in place between 10 and 30, not moved to the bottom'
    )
    store.dispose()
  })

  it('tabStore promotes child tab in place when parent is closed via store.closeTab', async () => {
    function createTab(id, parentId, order, extra = {}) {
      return {
        id,
        index: id,
        windowId: 1,
        title: `Tab ${id}`,
        url: `https://example.com/${id}`,
        pinned: false,
        active: id === 10,
        vivExtData: {
          svbTree: {
            contextKey: 'window:1',
            nodeId: `n${id}`,
            parentNodeId: parentId == null ? null : `n${parentId}`,
            order,
            collapsed: false,
          },
        },
        ...extra,
      }
    }

    let currentTabs = [
      createTab(10, null, 0),
      createTab(20, null, 1),
      createTab(21, 20, 0),
      createTab(30, null, 2),
    ]

    let onRemovedListener = null
    let onActivatedListener = null

    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => JSON.parse(JSON.stringify(currentTabs)),
      getActiveWorkspaceId: () => undefined,
      getWorkspaces: async () => [],
      isVivaldi: () => true,
      updateTab: async (id, patch) => {
        Object.assign(currentTabs.find(tab => tab.id === id) || {}, patch)
      },
      updateVivExtData: async (id, data) => {
        const t = currentTabs.find(tab => tab.id === id)
        if (t) t.vivExtData = data
      },
      activateTab: async (id) => {
        for (const t of currentTabs) t.active = t.id === id
        if (onActivatedListener) onActivatedListener({ tabId: id, windowId: 1 })
      },
      closeTab: async (id) => {
        currentTabs = currentTabs.filter(t => t.id !== id)
        if (onRemovedListener) onRemovedListener(id)
      },
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: (fn) => { onRemovedListener = fn; return () => {} },
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: (fn) => { onActivatedListener = fn; return () => {} },
      onWindowFocusChanged: () => () => {},
    }

    const store = createTabStore(mockApi)
    await store.init()

    // Close tab 20 via panel UI
    await store.closeTab(20)

    // Wait for debounce/sync to settle.
    await new Promise(r => setTimeout(r, 250))

    const finalTabs = store.getState().treeTabs.map(t => [t.id, t.depth])
    assert.deepEqual(
      finalTabs,
      [[10, 0], [21, 0], [30, 0]],
      'Child tab 21 must be promoted in place between 10 and 30'
    )
    store.dispose()
  })
})

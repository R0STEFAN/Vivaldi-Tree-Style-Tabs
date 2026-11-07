const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { createTreePersistence } = require('../src/store/tree-persistence.js')
const { createTabStore } = require('../src/store/tab-store.js')

describe('Tree Persistence & Session Restore Reliability', () => {
  it('treePersistence.loadTree successfully restores hierarchy when vivExtData is a serialized JSON string', async () => {
    const mockTabs = [
      {
        id: 101,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        workspaceId: 3,
        vivExtData: JSON.stringify({
          workspaceId: 3,
          svbTree: {
            version: 1,
            contextKey: 'workspace:3',
            nodeId: 'node_root',
            parentNodeId: null,
            collapsed: false,
            order: 0,
            createdAt: 1000,
          },
        }),
      },
      {
        id: 102,
        index: 1,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 3,
        vivExtData: JSON.stringify({
          workspaceId: 3,
          svbTree: {
            version: 1,
            contextKey: 'workspace:3',
            nodeId: 'node_child',
            parentNodeId: 'node_root',
            collapsed: false,
            order: 0,
            createdAt: 1001,
          },
        }),
      },
    ]

    const persistence = createTreePersistence({
      updateVivExtData: async () => {},
    })

    const treeState = await persistence.loadTree('workspace:3', mockTabs)

    assert.ok(treeState, 'Tree state must be loaded')
    assert.deepStrictEqual(treeState.rootIds, [101], 'Root must be tab 101')
    assert.strictEqual(treeState.nodesById[102].parentId, 101, 'Tab 102 must be child of 101')
    assert.deepStrictEqual(treeState.nodesById[101].childIds, [102], 'Tab 101 must list 102 as child')
  })

  it('handleCreated does NOT call moveTabsToWorkspace for child tabs', async () => {
    let moveCalls = []
    let onCreatedHandler = null

    const mockTabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 7,
        vivExtData: { workspaceId: 7, svbTree: { contextKey: 'workspace:7', nodeId: 'node_10', order: 0 } },
      },
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 7,
      getWorkspaces: async () => [{ id: 7, name: 'Work' }],
      createChildTab: () => {},
      createTab: () => {},
      updateTab: async () => {},
      updateVivExtData: async () => {},
      moveTabsToWorkspace: async (tabIds, wsId, winId) => {
        moveCalls.push({ tabIds, wsId, winId })
      },
      onCreated: (handler) => { onCreatedHandler = handler; return () => {} },
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
    await store.init()

    // Mod triggers createChildTab under parent tab 10
    store.createChildTab(10)

    // Browser emits onCreated for child tab 20
    const childTab = {
      id: 20,
      index: 1,
      windowId: 1,
      active: true,
      pinned: false,
      workspaceId: null, // Chrome onCreated event often has workspaceId null initially
      vivExtData: null,
    }

    onCreatedHandler(childTab)

    // Verify moveTabsToWorkspace was NOT called (which would move to 'last' with 'do-not-reparent')
    assert.strictEqual(moveCalls.length, 0, 'moveTabsToWorkspace must NOT be called for child tab creation')
    assert.strictEqual(childTab.workspaceId, 7, 'Child tab workspaceId should be set in-memory')

    store.dispose()
  })

  it('handleCreated preserves svbTree and does not string-spread when vivExtData is serialized JSON', async () => {
    let updatedVivExt = null
    let onCreatedHandler = null

    const mockTabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 5,
        vivExtData: { workspaceId: 5 },
      },
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 5,
      getWorkspaces: async () => [{ id: 5, name: 'Default' }],
      createTab: () => {},
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedVivExt = data
      },
      onCreated: (handler) => { onCreatedHandler = handler; return () => {} },
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
    await store.init()

    // Tab arrives with raw JSON string vivExtData containing svbTree
    const incomingTab = {
      id: 99,
      index: 1,
      windowId: 1,
      active: true,
      pinned: false,
      workspaceId: null,
      vivExtData: JSON.stringify({
        fixedTitle: 'Custom Tab Title',
        svbTree: {
          nodeId: 'node_99',
          parentNodeId: 'node_10',
          order: 0,
        },
      }),
    }

    onCreatedHandler(incomingTab)

    assert.ok(updatedVivExt, 'updateVivExtData should have been called')
    assert.strictEqual(updatedVivExt.workspaceId, 5)
    assert.strictEqual(updatedVivExt.fixedTitle, 'Custom Tab Title')
    assert.ok(updatedVivExt.svbTree, 'svbTree must be preserved and not erased')
    assert.strictEqual(updatedVivExt.svbTree.nodeId, 'node_99')
    assert.strictEqual(updatedVivExt.svbTree.parentNodeId, 'node_10')
    // Verify there are no string-spread keys like '0', '1', etc.
    assert.strictEqual(updatedVivExt['0'], undefined, 'Must not contain string spread keys')

    store.dispose()
  })

  it('handleCreated does not modify restored tabs that already have a workspace', async () => {
    let updateCalls = []
    let moveCalls = []
    let onCreatedHandler = null

    const mockTabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 4,
        vivExtData: { workspaceId: 4 },
      },
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 4,
      getWorkspaces: async () => [{ id: 4, name: 'Work' }],
      createTab: () => {},
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        updateCalls.push({ tabId, data })
      },
      moveTabsToWorkspace: async (tabIds, wsId) => {
        moveCalls.push({ tabIds, wsId })
      },
      onCreated: (handler) => { onCreatedHandler = handler; return () => {} },
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
    await store.init()
    updateCalls.length = 0
    moveCalls.length = 0

    // Session restore emits onCreated for an existing tab in workspace 4
    const restoredTab = {
      id: 55,
      index: 1,
      windowId: 1,
      active: false,
      pinned: false,
      workspaceId: 4,
      vivExtData: {
        workspaceId: 4,
        svbTree: { nodeId: 'node_55', parentNodeId: 'node_10' },
      },
    }

    onCreatedHandler(restoredTab)

    assert.strictEqual(updateCalls.length, 0, 'Must not trigger updateVivExtData on restored tabs with existing workspace')
    assert.strictEqual(moveCalls.length, 0, 'Must not move restored tabs')
    assert.strictEqual(restoredTab.vivExtData.svbTree.nodeId, 'node_55')

    store.dispose()
  })
})

const { describe, it } = require('node:test')
const assert = require('node:assert')
const { createTabStore } = require('../src/store/tab-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('moveSelectionToWorkspace with newTabPlacement top mode', () => {
  it('places moved tab at TOP of target workspace when newTabPlacement is top', async () => {
    settingsStore.set('newTabPlacement', 'top')

    const mockTabs = [
      {
        id: 101,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 1,
        vivExtData: {
          workspaceId: 1,
          svbTree: { contextKey: 'workspace:1', nodeId: 'node_101', order: 0 }
        }
      },
      {
        id: 201,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        workspaceId: 2,
        vivExtData: {
          workspaceId: 2,
          svbTree: { contextKey: 'workspace:2', nodeId: 'node_201', order: 0 }
        }
      },
      {
        id: 202,
        index: 2,
        windowId: 1,
        active: false,
        pinned: false,
        workspaceId: 2,
        vivExtData: {
          workspaceId: 2,
          svbTree: { contextKey: 'workspace:2', nodeId: 'node_202', order: 1 }
        }
      }
    ]

    let updatedPayloads = []
    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 1,
      getWorkspaces: async () => [{ id: 1, name: 'Src' }, { id: 2, name: 'Dest' }],
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedPayloads.push({ tabId, data })
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

    const store = createTabStore(mockApi)
    await store.init()

    updatedPayloads = [] // Reset after init

    // Move tab 101 from workspace 1 to workspace 2
    await store.moveSelectionToWorkspace(101, [101], 2)

    const update = updatedPayloads.find(p => p.tabId === 101)
    assert.ok(update, 'updateVivExtData should have been called for moved tab')
    assert.strictEqual(update.data.workspaceId, 2)
    // Order in workspace 2 should be lower than existing tabs (0 and 1), so it lands at top!
    const targetOrder = update.data.svbTree.order
    assert.ok(targetOrder < 0, `Order ${targetOrder} should be < 0 to be at top of destination workspace`)

    store.dispose()
    settingsStore.set('newTabPlacement', 'bottom')
  })

  it('places moved tab at BOTTOM of target workspace when newTabPlacement is bottom', async () => {
    settingsStore.set('newTabPlacement', 'bottom')

    const mockTabs = [
      {
        id: 101,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 1,
        vivExtData: {
          workspaceId: 1,
          svbTree: { contextKey: 'workspace:1', nodeId: 'node_101', order: 0 }
        }
      },
      {
        id: 201,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        workspaceId: 2,
        vivExtData: {
          workspaceId: 2,
          svbTree: { contextKey: 'workspace:2', nodeId: 'node_201', order: 0 }
        }
      },
      {
        id: 202,
        index: 2,
        windowId: 1,
        active: false,
        pinned: false,
        workspaceId: 2,
        vivExtData: {
          workspaceId: 2,
          svbTree: { contextKey: 'workspace:2', nodeId: 'node_202', order: 1 }
        }
      }
    ]

    let updatedPayloads = []
    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 1,
      getWorkspaces: async () => [{ id: 1, name: 'Src' }, { id: 2, name: 'Dest' }],
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedPayloads.push({ tabId, data })
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

    const store = createTabStore(mockApi)
    await store.init()

    updatedPayloads = [] // Reset after init

    await store.moveSelectionToWorkspace(101, [101], 2)

    const update = updatedPayloads.find(p => p.tabId === 101)
    assert.ok(update)
    assert.strictEqual(update.data.workspaceId, 2)
    // Order in workspace 2 should be higher than existing tabs (0 and 1), so it lands at bottom
    const targetOrder = update.data.svbTree.order
    assert.ok(targetOrder > 1, `Order ${targetOrder} should be > 1 to be at bottom of destination workspace`)

    store.dispose()
  })
})

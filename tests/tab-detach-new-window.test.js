const { describe, it } = require('node:test')
const assert = require('node:assert')
const { createTabStore } = require('../src/store/tab-store.js')

describe('tab detach & new window workspace reconciliation', () => {
  it('recovers orphaned tabs in new window when opened outside workspaces', async () => {
    // Simulate a tab dragged from Window 1 (Workspace 999) into a fresh Window 2 (outside workspaces)
    const mockTabs = [
      {
        id: 105,
        index: 0,
        windowId: 2,
        active: true,
        pinned: false,
        workspaceId: 999, // Stale workspace from window 1
        vivExtData: {
          workspaceId: 999,
          svbTree: { contextKey: 'workspace:999', nodeId: 'node_105', order: 0 }
        }
      }
    ]

    let updatedVivExtData = null
    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 2,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => null, // outside workspaces in Vivaldi
      getWorkspaces: async () => [{ id: 999, name: 'Work' }],
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedVivExtData = data
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

    const state = store.getState()
    // The tab should be visible in the new window!
    assert.strictEqual(state.tabs.length, 1)
    assert.strictEqual(state.tabs[0].id, 105)
    // Stale workspaceId should have been cleaned up
    assert.strictEqual(state.tabs[0].workspaceId, null)

    store.dispose()
  })

  it('strips workspaceId when moveSelectionToNewWindow is called', async () => {
    const mockTabs = [
      {
        id: 205,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 888,
        vivExtData: {
          workspaceId: 888,
          svbTree: { contextKey: 'workspace:888', nodeId: 'node_205', order: 0 }
        }
      }
    ]

    let updatedPayloads = []
    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 888,
      getWorkspaces: async () => [{ id: 888, name: 'Dev' }],
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        updatedPayloads.push({ tabId, data })
      },
      moveTabsToNewWindow: async (ids) => {
        return { native: true }
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
    await store.moveSelectionToNewWindow(205, [205])

    const vivExtUpdate = updatedPayloads.find(p => p.tabId === 205)
    assert.ok(vivExtUpdate, 'updateVivExtData should have been called')
    assert.strictEqual(vivExtUpdate.data.workspaceId, undefined, 'workspaceId must be stripped for new window')

    store.dispose()
  })
})

const { describe, it } = require('node:test')
const assert = require('node:assert')
const { createTabStore } = require('../src/store/tab-store.js')
const { createTabsApi } = require('../src/adapters/tabs-api.js')

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

  it('preserves source workspace state during moveSelectionToNewWindow without context poisoning', async () => {
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

    let movedIds = []
    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 888,
      getWorkspaces: async () => [{ id: 888, name: 'Dev' }],
      updateTab: async () => {},
      updateVivExtData: async () => {},
      moveTabsToNewWindow: async (ids) => {
        movedIds = ids
        return { windowId: 2 }
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

    await store.moveSelectionToNewWindow(205, [205])

    assert.deepStrictEqual(movedIds, [205])
    const state = store.getState()
    assert.strictEqual(state.activeWorkspaceId, 888)
    assert.strictEqual(state.tabs.length, 1)

    store.dispose()
  })

  it('tabsApi falls back to URL window creation when tabId move fails', async () => {
    const createdWindows = []
    const removedTabs = []

    const mockWindowsApi = {
      create: (props, cb) => {
        if (props.tabId) {
          // Simulate Vivaldi blocking move across workspace/window
          const err = new Error('tabId move unsupported')
          chrome.runtime.lastError = err
          cb(null)
          chrome.runtime.lastError = null
          return
        }
        const win = { id: 77, ...props }
        createdWindows.push(win)
        cb(win)
      }
    }

    const mockTabsApi = {
      get: (id, cb) => {
        cb({ id, url: 'https://vivaldi.com', vivExtData: '{}' })
      },
      create: (props, cb) => {
        cb({ id: 999, ...props })
      },
      remove: (ids, cb) => {
        removedTabs.push(...(Array.isArray(ids) ? ids : [ids]))
        cb()
      },
      move: (id, props, cb) => {
        cb({ id, ...props })
      }
    }

    const globalChrome = {
      runtime: { lastError: null },
      windows: mockWindowsApi,
      tabs: mockTabsApi,
    }
    global.chrome = globalChrome

    const api = createTabsApi({
      tabsApi: mockTabsApi,
      windowsApi: mockWindowsApi,
    })

    const result = await api.moveTabsToNewWindow([101])
    assert.ok(result)
    assert.strictEqual(result.windowId, 77)
    assert.strictEqual(createdWindows.length, 1)
    assert.strictEqual(createdWindows[0].url, 'https://vivaldi.com')
    assert.deepStrictEqual(removedTabs, [101])
  })
})

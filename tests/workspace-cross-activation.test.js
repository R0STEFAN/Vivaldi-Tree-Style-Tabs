const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { createTabStore } = require('../src/store/tab-store.js')

describe('Cross-workspace Tab Activation (Settings & Active-Tab-First)', () => {
  let callSequence = []
  let activeTabInApi = 20
  let nativeWorkspaceId = 2
  let onActivatedListener = null
  let onWorkspacesChangedListener = null

  function createMockApi(tabs) {
    let currentTabs = JSON.parse(JSON.stringify(tabs))

    return {
      getCurrentWindowId: async () => 1,
      getTabs: async () => currentTabs,
      getActiveWorkspaceId: () => nativeWorkspaceId,
      getWorkspaces: async () => [{ id: 2, name: 'Work' }],
      activateTab: async (tabId) => {
        callSequence.push({ action: 'activateTab', tabId })
        activeTabInApi = tabId
        for (const t of currentTabs) {
          t.active = t.id === tabId
        }
      },
      activateWorkspace: (windowId, workspaceId) => {
        callSequence.push({ action: 'activateWorkspace', windowId, workspaceId })
        nativeWorkspaceId = workspaceId
        if (onWorkspacesChangedListener) onWorkspacesChangedListener()
      },
      notifyActiveWorkspace: async (windowId, workspaceId) => {
        callSequence.push({ action: 'notifyActiveWorkspace', windowId, workspaceId })
      },
      closeTab: async () => {},
      updateTab: async () => {},
      updateVivExtData: async () => {},
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: () => () => {},
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: (listener) => {
        onActivatedListener = listener
        return () => { onActivatedListener = null }
      },
      onWorkspacesChanged: (listener) => {
        onWorkspacesChangedListener = listener
        return () => { onWorkspacesChangedListener = null }
      },
      onWindowFocusChanged: () => () => {},
      isVivaldi: () => true,
      triggerNativeActivation: (tabId) => {
        activeTabInApi = tabId
        for (const t of currentTabs) {
          t.active = t.id === tabId
        }
        if (onActivatedListener) onActivatedListener({ tabId })
      },
    }
  }

  beforeEach(() => {
    callSequence = []
    activeTabInApi = 20
    nativeWorkspaceId = 2
    onActivatedListener = null
    onWorkspacesChangedListener = null
  })

  it('does NOT bounce back to previous workspace when opening settings tab in Default workspace from Workspace 2', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        url: 'vivaldi://settings',
        workspaceId: null,
        vivExtData: { svbTree: { contextKey: 'window:1:outside', nodeId: 'node_10', parentNodeId: null, order: 0 } },
      },
      {
        id: 20,
        index: 1,
        windowId: 1,
        active: true,
        pinned: false,
        url: 'https://example.com/work',
        workspaceId: 2,
        vivExtData: { workspaceId: 2, svbTree: { contextKey: 'workspace:2', nodeId: 'node_20', parentNodeId: null, order: 0 } },
      },
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    assert.strictEqual(store.getState().activeWorkspaceId, 2)
    assert.strictEqual(store.getState().activeTabId, 20)

    callSequence = []

    // User is in Workspace 2 and opens browser settings.
    // Vivaldi activates tab 10 (Settings in Default workspace null).
    api.triggerNativeActivation(10)

    // Wait for async scheduled sync to complete
    await new Promise(resolve => setTimeout(resolve, 50))

    const stateAfter = store.getState()

    // It must NOT bounce back by calling activateTab(20)
    const repairActivations = callSequence.filter(c => c.action === 'activateTab' && c.tabId === 20)
    assert.strictEqual(repairActivations.length, 0, 'Must NOT bounce back to tab 20 in Workspace 2')

    // Store must follow active tab to Default workspace (null)
    assert.strictEqual(stateAfter.activeWorkspaceId, null, 'activeWorkspaceId must be null (Default)')
    assert.strictEqual(stateAfter.outsideWorkspace, true, 'outsideWorkspace must be true')
    assert.strictEqual(stateAfter.activeTabId, 10, 'activeTabId must remain 10 (Settings)')

    store.dispose()
  })

  it('follows active tab from Default to Workspace 2 when activated from outside', async () => {
    nativeWorkspaceId = null
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        url: 'https://example.com/home',
        workspaceId: null,
        vivExtData: { svbTree: { contextKey: 'window:1:outside', nodeId: 'node_10', parentNodeId: null, order: 0 } },
      },
      {
        id: 20,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        url: 'https://example.com/work',
        workspaceId: 2,
        vivExtData: { workspaceId: 2, svbTree: { contextKey: 'workspace:2', nodeId: 'node_20', parentNodeId: null, order: 0 } },
      },
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    assert.strictEqual(store.getState().activeWorkspaceId, null)
    assert.strictEqual(store.getState().activeTabId, 10)

    callSequence = []

    // A tab in Workspace 2 is activated (e.g. Quick Commands or link)
    api.triggerNativeActivation(20)

    await new Promise(resolve => setTimeout(resolve, 50))

    const stateAfter = store.getState()
    const repairActivations = callSequence.filter(c => c.action === 'activateTab' && c.tabId === 10)
    assert.strictEqual(repairActivations.length, 0, 'Must NOT bounce back to tab 10 in Default')

    assert.strictEqual(stateAfter.activeWorkspaceId, 2, 'activeWorkspaceId must be 2')
    assert.strictEqual(stateAfter.outsideWorkspace, false)
    assert.strictEqual(stateAfter.activeTabId, 20, 'activeTabId must remain 20')

    store.dispose()
  })
})

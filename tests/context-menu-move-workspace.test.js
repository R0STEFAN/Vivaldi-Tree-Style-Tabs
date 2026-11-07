const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { createTabStore } = require('../src/store/tab-store.js')
const { renderContextMenu } = require('../src/ui/render.js')

describe('Context menu - Move to workspaces', () => {
  it('renders workspace names and icons matching getWorkspaceBarEntries in native order', () => {
    const mockState = {
      selectedIds: [10],
      treeTabs: [{ id: 10, depth: 0, parentId: null, hasChildren: false }],
      canCloseVisibleTabs: true,
      hasTabsOutsideWorkspace: false,
      activeWorkspaceId: 1,
      workspaces: [
        { id: 1, name: 'Personal', icon: '<svg class="ws-personal"><circle cx="8" cy="8" r="4"/></svg>' },
        { id: 2, name: 'Work', icon: '💼' },
        { id: 3, name: 'Dev', icon: null },
      ]
    }

    const html = renderContextMenu({ id: 10, title: 'Test Tab' }, mockState, { x: 50, y: 50, tabId: 10 })

    // Should include the custom SVG icon for Personal
    assert.ok(html.includes('ws-personal'))
    assert.ok(html.includes('Personal'))
    // Personal is the active workspace, so it should be disabled
    assert.ok(html.includes('data-workspace-id="1"'))

    // Should include emoji icon for Work
    assert.ok(html.includes('💼'))
    assert.ok(html.includes('Work'))
    assert.ok(html.includes('data-workspace-id="2"'))

    // Should include fallback icon for Dev
    assert.ok(html.includes('Dev'))
    assert.ok(html.includes('data-workspace-id="3"'))

    // Workspaces should be in native order (Personal, then Work, then Dev)
    const idxPersonal = html.indexOf('data-workspace-id="1"')
    const idxWork = html.indexOf('data-workspace-id="2"')
    const idxDev = html.indexOf('data-workspace-id="3"')
    assert.ok(idxPersonal < idxWork && idxWork < idxDev, 'workspaces should be in native order, not alphabetical')

    // Should include New Workspace
    assert.ok(html.includes('data-action="move-new-workspace"'))
    assert.ok(html.includes('New Workspace'))
  })

  it('createWorkspaceAndMoveSelection uses native createWorkspace and moves selected tabs', async () => {
    let createdWorkspaceName = null
    const movedPayloads = []
    let activatedWorkspaceId = null

    const mockTabs = [
      {
        id: 100,
        index: 0,
        windowId: 1,
        pinned: false,
        active: true,
        vivExtData: {
          svbTree: { contextKey: 'workspace:1', nodeId: 'node_100', order: 0 }
        }
      }
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (query, cb) => cb(mockTabs),
      updateTab: async () => {},
      closeTabs: async () => {},
      updateVivExtData: async (tabId, data) => {
        movedPayloads.push({ tabId, data })
      },
      getWorkspaces: async () => [
        { id: 1, name: 'Current' },
        { id: 2, name: 'Target' }
      ],
      createWorkspace: async (name) => {
        createdWorkspaceName = name
        return { id: 2, name }
      },
      activateWorkspace: (winId, wsId) => {
        activatedWorkspaceId = wsId
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
    try {
      await store.init()
      movedPayloads.length = 0
      await store.createWorkspaceAndMoveSelection(100, [100], 'Projects')

      assert.strictEqual(createdWorkspaceName, 'Projects')
      const move = movedPayloads.find(p => p.tabId === 100)
      assert.ok(move, 'tab 100 should be moved')
      assert.strictEqual(move.data.workspaceId, 2)
      assert.strictEqual(activatedWorkspaceId, 2)
    } finally {
      store.dispose()
    }
  })

  it('moveSelectionToWorkspace supports moving tabs out of workspace to Default (null)', async () => {
    const movedPayloads = []

    const mockTabs = [
      {
        id: 50,
        index: 0,
        windowId: 1,
        pinned: false,
        active: true,
        workspaceId: 1,
        vivExtData: {
          workspaceId: 1,
          svbTree: { contextKey: 'workspace:1', nodeId: 'node_50', order: 0 }
        }
      }
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (query, cb) => cb(mockTabs),
      updateTab: async () => {},
      closeTabs: async () => {},
      updateVivExtData: async (tabId, data) => {
        movedPayloads.push({ tabId, data })
      },
      getWorkspaces: async () => [{ id: 1, name: 'Current' }],
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
      movedPayloads.length = 0
      await store.moveSelectionToWorkspace(50, [50], '')

      const move = movedPayloads.find(p => p.tabId === 50)
      assert.ok(move)
      assert.strictEqual(move.data.workspaceId, undefined)
      assert.strictEqual(move.data.svbTree.contextKey, 'outside')
    } finally {
      store.dispose()
    }
  })

  it('moveSelectionToWorkspace calls api.moveTabsToWorkspace with targetIds and targetWorkspaceId', async () => {
    const movedNativeCalls = []

    const mockTabs = [
      {
        id: 50,
        index: 0,
        windowId: 1,
        pinned: false,
        active: true,
        workspaceId: 1,
        vivExtData: {
          workspaceId: 1,
          svbTree: { contextKey: 'workspace:1', nodeId: 'node_50', order: 0 }
        }
      }
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (query, cb) => cb(mockTabs),
      updateTab: async () => {},
      closeTabs: async () => {},
      updateVivExtData: async () => {},
      moveTabsToWorkspace: async (tabIds, wsId, winId) => {
        movedNativeCalls.push({ tabIds, wsId, winId })
      },
      getWorkspaces: async () => [{ id: 1, name: 'Current' }, { id: 2, name: 'Work' }],
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

      // Move to existing workspace 2
      await store.moveSelectionToWorkspace(50, [50], 2)
      assert.strictEqual(movedNativeCalls.length, 1)
      assert.deepStrictEqual(movedNativeCalls[0].tabIds, [50])
      assert.strictEqual(movedNativeCalls[0].wsId, 2)

      // Move to Default area (null)
      await store.moveSelectionToWorkspace(50, [50], '')
      assert.strictEqual(movedNativeCalls.length, 2)
      assert.deepStrictEqual(movedNativeCalls[1].tabIds, [50])
      assert.strictEqual(movedNativeCalls[1].wsId, null)
    } finally {
      store.dispose()
    }
  })

  it('createWorkspaceAndMoveSelection calls api.moveTabsToWorkspace with new workspace id', async () => {
    const movedNativeCalls = []

    const mockTabs = [
      {
        id: 100,
        index: 0,
        windowId: 1,
        pinned: false,
        active: true,
        workspaceId: 1,
        vivExtData: {
          workspaceId: 1,
          svbTree: { contextKey: 'workspace:1', nodeId: 'node_100', order: 0 }
        }
      }
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      queryTabs: (query, cb) => cb(mockTabs),
      updateTab: async () => {},
      closeTabs: async () => {},
      updateVivExtData: async () => {},
      getWorkspaces: async () => [{ id: 1, name: 'Current' }, { id: 2, name: 'Target' }],
      createWorkspace: async (name) => {
        return { id: 2, name }
      },
      activateWorkspace: () => {},
      moveTabsToWorkspace: async (tabIds, wsId, winId) => {
        movedNativeCalls.push({ tabIds, wsId, winId })
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
    try {
      await store.init()
      await store.createWorkspaceAndMoveSelection(100, [100], 'Projects')

      assert.strictEqual(movedNativeCalls.length, 1)
      assert.deepStrictEqual(movedNativeCalls[0].tabIds, [100])
      assert.strictEqual(movedNativeCalls[0].wsId, 2)
    } finally {
      store.dispose()
    }
  })
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createTabStore } = require('../src/store/tab-store.js')

function createTab(id, parentId, order, extra = {}) {
  return {
    id,
    index: id,
    windowId: 1,
    title: `Tab ${id}`,
    url: `https://example.com/${id}`,
    pinned: false,
    active: id === 1,
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

async function setup(t, initialTabs) {
  let currentTabs = structuredClone(initialTabs)
  let getTabsCallCount = 0
  let activatedTabId = null

  let onUpdatedListener = null
  let pendingVivExtUpdates = new Set()

  const api = {
    getCurrentWindowId: async () => 1,
    getTabs: async () => {
      getTabsCallCount++
      return structuredClone(currentTabs)
    },
    getActiveWorkspaceId: () => undefined,
    getWorkspaces: async () => [],
    isVivaldi: () => true,
    updateTab: async (id, patch) => {
      const target = currentTabs.find(tab => tab.id === id)
      if (target) Object.assign(target, patch)
    },
    updateVivExtData: async (id, data) => {
      pendingVivExtUpdates.add(id)
      const target = currentTabs.find(tab => tab.id === id)
      if (target) target.vivExtData = data
      // Simulate real Vivaldi firing onUpdated with empty changeInfo or status
      if (onUpdatedListener) {
        onUpdatedListener(id, { status: 'complete' }, target)
      }
    },
    isOwnVivExtUpdate: (tabId, changeInfo) => {
      if (!pendingVivExtUpdates.has(tabId)) return false
      const info = changeInfo && typeof changeInfo === 'object' ? changeInfo : {}
      if (info.url !== undefined || info.title !== undefined) return false
      pendingVivExtUpdates.delete(tabId)
      return true
    },
    activateTab: async (id) => {
      activatedTabId = id
      for (const tab of currentTabs) {
        tab.active = tab.id === id
      }
    },
    onCreated: () => () => {},
    onUpdated: (listener) => {
      onUpdatedListener = listener
      return () => { onUpdatedListener = null }
    },
    onRemoved: () => () => {},
    onMoved: () => () => {},
    onAttached: () => () => {},
    onDetached: () => () => {},
    onActivated: () => () => {},
    onWindowFocusChanged: () => () => {},
  }

  const store = createTabStore(api)
  t.after(() => { store.dispose() })
  await store.init()

  // Reset count after init
  const initialGetTabsCount = getTabsCallCount

  return {
    store,
    api,
    getGetTabsCallCount: () => getTabsCallCount - initialGetTabsCount,
    getActivatedTabId: () => activatedTabId,
  }
}

test('toggleCollapsed updates treeTabs synchronously without calling api.getTabs', async t => {
  const tabs = [
    createTab(1, null, 0),
    createTab(2, 1, 0),
    createTab(3, 1, 1),
    createTab(4, null, 1),
  ]

  const { store, getGetTabsCallCount } = await setup(t, tabs)

  assert.equal(store.getState().treeTabs.length, 4, 'Initially all 4 tabs are visible')

  // Toggle collapse on tab 1
  store.toggleCollapsed(1)

  // Verify IMMEDIATELY (synchronously) without awaiting
  const stateAfterCollapse = store.getState()
  assert.equal(stateAfterCollapse.treeTabs.length, 2, 'Children 2 and 3 should be collapsed immediately')
  assert.deepEqual(stateAfterCollapse.treeTabs.map(t => t.id), [1, 4])
  assert.equal(stateAfterCollapse.treeTabs[0].collapsed, true)
  assert.equal(getGetTabsCallCount(), 0, 'api.getTabs should NOT be called on toggleCollapsed')

  // Toggle expand on tab 1
  store.toggleCollapsed(1)

  const stateAfterExpand = store.getState()
  assert.equal(stateAfterExpand.treeTabs.length, 4, 'All 4 tabs should be visible immediately after expanding')
  assert.deepEqual(stateAfterExpand.treeTabs.map(t => t.id), [1, 2, 3, 4])
  assert.equal(stateAfterExpand.treeTabs[0].collapsed, false)
  assert.equal(getGetTabsCallCount(), 0, 'api.getTabs should NOT be called on expanding')
})

test('toggleCollapsed repairs activeTab synchronously if active tab was in collapsed branch', async t => {
  const tabs = [
    createTab(1, null, 0, { active: false }),
    createTab(2, 1, 0, { active: true }),
    createTab(3, null, 1, { active: false }),
  ]

  const { store, getGetTabsCallCount, getActivatedTabId } = await setup(t, tabs)
  assert.equal(store.getState().activeTabId, 2)

  store.toggleCollapsed(1)

  const state = store.getState()
  assert.equal(state.activeTabId, 1, 'Active tab should immediately switch to parent 1')
  assert.equal(getActivatedTabId(), 1, 'api.activateTab should be called for parent 1')
  assert.equal(getGetTabsCallCount(), 0, 'api.getTabs should NOT be called')
})

test('collapseAll updates treeTabs synchronously without calling api.getTabs', async t => {
  const tabs = [
    createTab(1, null, 0),
    createTab(2, 1, 0),
    createTab(3, null, 1),
    createTab(4, 3, 0),
  ]

  const { store, getGetTabsCallCount } = await setup(t, tabs)
  assert.equal(store.getState().treeTabs.length, 4)

  store.collapseAll()

  const state = store.getState()
  assert.equal(state.treeTabs.length, 2, 'Only roots 1 and 3 should remain visible')
  assert.deepEqual(state.treeTabs.map(t => t.id), [1, 3])
  assert.equal(getGetTabsCallCount(), 0, 'api.getTabs should NOT be called on collapseAll')
})

test('tabsApi.isOwnVivExtUpdate handles Vivaldi onUpdated without strict vivExtOnly changeInfo', async () => {
  const previousChrome = global.chrome
  try {
    global.chrome = {
      tabs: {
        update: (tabId, props, cb) => cb({ id: tabId }),
      },
      windows: {},
      sessions: {},
      bookmarks: {},
    }
    const { createTabsApi } = require('../src/adapters/tabs-api.js')
    const api = createTabsApi()
    await api.updateVivExtData(10, { svbTree: { collapsed: true } })

    // Real Vivaldi emits onUpdated with status: 'complete' or {}
    assert.equal(api.isOwnVivExtUpdate(10, { status: 'complete' }), true)
    assert.equal(api.isOwnVivExtUpdate(10, {}), false, 'Already consumed')

    // Substantive navigation should not be swallowed
    await api.updateVivExtData(20, { svbTree: { collapsed: true } })
    assert.equal(api.isOwnVivExtUpdate(20, { url: 'https://newurl.com' }), false)
  } finally {
    global.chrome = previousChrome
  }
})

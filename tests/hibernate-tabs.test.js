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
    discarded: false,
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
  const discardedTabIds = []
  let activatedTabId = null

  const api = {
    getCurrentWindowId: async () => 1,
    getTabs: async () => structuredClone(currentTabs),
    getActiveWorkspaceId: () => undefined,
    getWorkspaces: async () => [],
    isVivaldi: () => true,
    updateTab: async (id, patch) => {
      const target = currentTabs.find(tab => tab.id === id)
      if (target) Object.assign(target, patch)
    },
    updateVivExtData: async (id, data) => {
      const target = currentTabs.find(tab => tab.id === id)
      if (target) target.vivExtData = data
    },
    discardTab: async (id) => {
      discardedTabIds.push(id)
      const target = currentTabs.find(tab => tab.id === id)
      if (target) target.discarded = true
      return id
    },
    activateTab: async (id) => {
      activatedTabId = id
      for (const tab of currentTabs) {
        tab.active = tab.id === id
      }
      if (onActivatedListener) {
        onActivatedListener({ tabId: id, windowId: 1 })
      }
    },
    onCreated: () => () => {},
    onUpdated: () => () => {},
    onRemoved: () => () => {},
    onMoved: () => () => {},
    onAttached: () => () => {},
    onDetached: () => () => {},
    onActivated: (cb) => {
      onActivatedListener = cb
      return () => { onActivatedListener = null }
    },
    onWindowFocusChanged: () => () => {},
  }

  const store = createTabStore(api)
  t.after(() => { store.dispose() })
  await store.init()

  return {
    store,
    api,
    getDiscardedIds: () => [...discardedTabIds],
    getActivatedTabId: () => activatedTabId,
    getCurrentTabs: () => currentTabs,
  }
}

test('hibernateActiveTab switches away from active tab to sibling, not child, and discards it', async t => {
  const tabs = [
    createTab(1, null, 0, { active: true }),
    createTab(2, 1, 0, { active: false }),
    createTab(3, null, 1, { active: false }),
  ]

  const { store, getDiscardedIds, getActivatedTabId } = await setup(t, tabs)

  await store.hibernateActiveTab(1)

  assert.strictEqual(getActivatedTabId(), 3, 'Should have activated sibling tab 3, not child tab 2')
  assert.deepEqual(getDiscardedIds(), [1], 'Active tab 1 should have been discarded')
})

test('hibernateActiveTab on parent tab without siblings activates higher ancestor tab, not child', async t => {
  const tabs = [
    createTab(10, null, 0, { active: false }),
    createTab(1, 10, 0, { active: true }),
    createTab(2, 1, 0, { active: false }),
  ]

  const { store, getDiscardedIds, getActivatedTabId } = await setup(t, tabs)

  await store.hibernateActiveTab(1)

  assert.strictEqual(getActivatedTabId(), 10, 'Should have activated parent tab 10 higher in hierarchy')
  assert.deepEqual(getDiscardedIds(), [1], 'Active tab 1 should have been discarded')
})

test('hibernateActiveTab respects activateAfterClose setting when choosing siblings', async t => {
  const { settingsStore } = require('../src/store/settings-store.js')
  const tabs = [
    createTab(1, null, 0, { active: false }),
    createTab(2, null, 1, { active: true }),
    createTab(21, 2, 0, { active: false }),
    createTab(3, null, 2, { active: false }),
  ]

  settingsStore.set('activateAfterClose', 'above')
  const session1 = await setup(t, tabs)
  await session1.store.hibernateActiveTab(2)
  assert.strictEqual(session1.getActivatedTabId(), 1, 'In above mode, should activate sibling 1 above')

  settingsStore.set('activateAfterClose', 'below')
  const session2 = await setup(t, tabs)
  await session2.store.hibernateActiveTab(2)
  assert.strictEqual(session2.getActivatedTabId(), 3, 'In below mode, should activate sibling 3 below')

  settingsStore.set('activateAfterClose', 'above')
})

test('hibernateOtherTabs discards all background non-discarded tabs', async t => {
  const tabs = [
    createTab(1, null, 0, { active: true }),
    createTab(2, 1, 0, { active: false }),
    createTab(3, null, 1, { active: false, discarded: true }),
    createTab(4, null, 2, { active: false }),
  ]

  const { store, getDiscardedIds } = await setup(t, tabs)

  await store.hibernateOtherTabs(1)

  // Tab 1 is active (kept), tab 3 is already discarded
  assert.deepEqual(getDiscardedIds().sort(), [2, 4], 'Tabs 2 and 4 should be discarded')
})

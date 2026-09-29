const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createTabStore } = require('../src/store/tab-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

function tab(id, parentId, order, extra = {}) {
  return { id, index: id, windowId: 1, title: `Tab ${id}`, url: `https://example.com/${id}`,
    pinned: false, active: id === 1,
    vivExtData: { svbTree: { contextKey: 'window:1', nodeId: `n${id}`,
      parentNodeId: parentId == null ? null : `n${parentId}`, order, collapsed: false } }, ...extra }
}

async function setup(t, tabs) {
  let currentTabs = structuredClone(tabs)
  const api = {
    getCurrentWindowId: async () => 1,
    getTabs: async () => structuredClone(currentTabs),
    getActiveWorkspaceId: () => undefined,
    getWorkspaces: async () => [],
    isVivaldi: () => true,
    updateTab: async (id, patch) => { Object.assign(currentTabs.find(tab => tab.id === id), patch) },
    updateVivExtData: async (id, data) => { currentTabs.find(tab => tab.id === id).vivExtData = data },
    onCreated: () => () => {}, onUpdated: () => () => {}, onRemoved: () => () => {},
    onMoved: () => () => {}, onAttached: () => () => {}, onDetached: () => () => {},
    onActivated: () => () => {}, onWindowFocusChanged: () => () => {},
  }
  const store = createTabStore(api)
  t.after(() => { store.dispose(); settingsStore.set('newTabPlacement', 'bottom') })
  await store.init()
  return { store, api }
}

for (const nested of [false, true]) {
  test(`pinning ${nested ? 'nested' : 'root'} parent promotes children in place, retaining grandchildren`, async t => {
    const { store } = await setup(t, [tab(1,null,0), tab(2,nested ? 1 : null,nested ? 0 : 1),
      tab(3,2,0), tab(4,3,0), tab(5,2,1), tab(6,null,2)])
    await store.togglePinnedForSelection(2, [])
    const state = store.getState()
    assert.deepEqual(state.pinnedTabs.map(t => t.id), [2])
    assert.deepEqual(state.treeTabs.map(t => [t.id,t.depth]), nested
      ? [[1,0],[3,1],[4,2],[5,1],[6,0]]
      : [[1,0],[3,0],[4,1],[5,0],[6,0]])
  })
}

for (const placement of ['top', 'bottom']) {
  test(`unpinning uses ${placement} new-tab placement without reclaiming children`, async t => {
    settingsStore.set('newTabPlacement', placement)
    const { store } = await setup(t,[tab(1,null,0),tab(2,null,1),tab(3,2,0),tab(4,null,2)])
    await store.togglePinnedForSelection(2, [])
    await store.togglePinnedForSelection(2, [])
    assert.deepEqual(store.getState().treeTabs.map(t => [t.id,t.depth]), placement === 'top'
      ? [[2,0],[1,0],[3,0],[4,0]] : [[1,0],[3,0],[4,0],[2,0]])
  })
}

test('native pin changes and batch unpin keep order below pinned folders in top mode', async t => {
  settingsStore.set('newTabPlacement','top')
  const folder = tab(1,null,0)
  folder.vivExtData.isFolder = true
  folder.vivExtData.pinnedFolder = true
  const {store,api} = await setup(t,[folder,tab(2,null,1),tab(3,2,0),tab(4,null,2)])
  await api.updateTab(2,{pinned:true})
  await api.updateTab(4,{pinned:true})
  await store.reload()
  assert.deepEqual(store.getState().treeTabs.map(t=>t.id),[1,3])
  await store.togglePinnedForSelection(2,[2,4])
  assert.deepEqual(store.getState().treeTabs.map(t=>t.id),[1,2,4,3])
})

test('pinning a parent and child together promotes remaining descendants in place', async t => {
  const { store } = await setup(t,[tab(1,null,0),tab(2,null,1),tab(3,2,0),tab(4,3,0),tab(5,2,1),tab(6,null,2)])
  await store.togglePinnedForSelection(2,[2,3])
  assert.deepEqual(store.getState().treeTabs.map(t=>[t.id,t.depth]),[[1,0],[4,0],[5,0],[6,0]])
  await store.reload()
  assert.deepEqual(store.getState().treeTabs.map(t=>[t.id,t.depth]),[[1,0],[4,0],[5,0],[6,0]])
})

test('a rejected pin update leaves the original tree intact', async t => {
  const {store,api} = await setup(t,[tab(1,null,0),tab(2,1,0),tab(3,null,1)])
  api.updateTab = async () => { throw new Error('Update rejected') }
  await assert.rejects(store.togglePinnedForSelection(1,[]), /Update rejected/)
  await store.reload()
  assert.deepEqual(store.getState().treeTabs.map(t=>[t.id,t.depth]),[[1,0],[2,1],[3,0]])
})

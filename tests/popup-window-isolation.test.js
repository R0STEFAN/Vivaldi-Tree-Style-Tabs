const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { createTabStore } = require('../src/store/tab-store.js')
const { shouldMountInCurrentWindow } = require('../src/bootstrap/mount-root.js')

function createMockClassList(initialClasses = []) {
  const set = new Set(initialClasses)
  return {
    contains: cls => set.has(cls),
    add: cls => set.add(cls),
    remove: cls => set.delete(cls),
  }
}

describe('Popup & Cross-Window Event Isolation', () => {
  it('handleCreated ignores tabs created in another window (e.g. extension popup) without moving or mutating them', async () => {
    const moveCalls = []
    const vivExtCalls = []
    let onCreatedHandler = null

    const mockTabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 42,
        vivExtData: { workspaceId: 42, svbTree: { contextKey: 'workspace:42', nodeId: 'node_10', order: 0 } },
      },
    ]

    const noopUnsub = () => () => {}
    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => mockTabs,
      getActiveWorkspaceId: () => 42,
      getWorkspaces: async () => [{ id: 42, name: 'Work' }],
      createTab: () => {},
      updateTab: async () => {},
      updateVivExtData: async (tabId, data) => {
        vivExtCalls.push({ tabId, data })
      },
      moveTabsToWorkspace: async (tabIds, wsId, winId) => {
        moveCalls.push({ tabIds, wsId, winId })
      },
      onCreated: handler => { onCreatedHandler = handler; return () => {} },
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
    moveCalls.length = 0
    vivExtCalls.length = 0

    // Register an expected creation in the main window to ensure foreign tabs don't steal it
    store.createTab()

    // Extension (e.g. Bitwarden) opens a popup window (windowId: 99) with a workspace-less tab
    const popupTab = {
      id: 999,
      index: 0,
      windowId: 99,
      active: true,
      pinned: false,
      url: 'chrome-extension://nngceckbapebfimnlniiiahkandclblb/popup/index.html',
      workspaceId: null,
      vivExtData: null,
    }

    onCreatedHandler(popupTab)

    assert.strictEqual(moveCalls.length, 0, 'Must NOT move foreign-window popup tab into main window workspace')
    assert.strictEqual(vivExtCalls.length, 0, 'Must NOT update vivExtData on foreign-window popup tab')
    assert.strictEqual(popupTab.workspaceId, null, 'Popup tab workspaceId must remain untouched')

    // Now the actual tab in the main window (windowId: 1) arrives and should still be treated as expected
    const mainWindowTab = {
      id: 11,
      index: 1,
      windowId: 1,
      active: true,
      pinned: false,
      workspaceId: null,
      vivExtData: null,
    }
    onCreatedHandler(mainWindowTab)

    assert.strictEqual(moveCalls.length, 0, 'Expected main-window tab should keep its expectedCreation intent and not call moveTabsToWorkspace')
    assert.strictEqual(vivExtCalls.length, 1, 'Expected main-window tab should receive workspace metadata')
    assert.strictEqual(vivExtCalls[0].tabId, 11)

    store.dispose()
  })

  it('ignores onActivated, onUpdated, onRemoved, onMoved, onAttached, and onDetached events from other windows', async () => {
    let getTabsCount = 0
    const activateCalls = []
    let handlers = {}

    const mockTabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: 2,
        vivExtData: { workspaceId: 2, svbTree: { contextKey: 'workspace:2', nodeId: 'node_10', order: 0 } },
      },
      {
        id: 20,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        workspaceId: 2,
        vivExtData: { workspaceId: 2, svbTree: { contextKey: 'workspace:2', nodeId: 'node_20', order: 1 } },
      },
    ]

    const mockApi = {
      getCurrentWindowId: async () => 1,
      getTabs: async () => {
        getTabsCount += 1
        return mockTabs
      },
      getActiveWorkspaceId: () => 2,
      getWorkspaces: async () => [{ id: 2, name: 'Work' }],
      activateTab: async tabId => { activateCalls.push(tabId) },
      updateTab: async () => {},
      updateVivExtData: async () => {},
      onCreated: fn => { handlers.onCreated = fn; return () => {} },
      onUpdated: fn => { handlers.onUpdated = fn; return () => {} },
      onRemoved: fn => { handlers.onRemoved = fn; return () => {} },
      onMoved: fn => { handlers.onMoved = fn; return () => {} },
      onAttached: fn => { handlers.onAttached = fn; return () => {} },
      onDetached: fn => { handlers.onDetached = fn; return () => {} },
      onActivated: fn => { handlers.onActivated = fn; return () => {} },
      onWindowFocusChanged: () => () => {},
      isVivaldi: () => true,
    }

    const store = createTabStore(mockApi)
    await store.init()
    const baselineGetTabsCount = getTabsCount

    // Fire events belonging to windowId: 2 (foreign window)
    handlers.onActivated({ tabId: 999, windowId: 2 })
    handlers.onUpdated(999, { status: 'complete' }, { id: 999, windowId: 2 })
    handlers.onRemoved(999, { windowId: 2, isWindowClosing: true })
    handlers.onMoved(999, { windowId: 2, fromIndex: 0, toIndex: 1 })
    await handlers.onAttached(999, { newWindowId: 2, newPosition: 0 })
    handlers.onDetached(999, { oldWindowId: 2, oldPosition: 0 })

    await new Promise(resolve => setTimeout(resolve, 40))

    assert.strictEqual(getTabsCount, baselineGetTabsCount, 'Foreign-window events must not trigger getTabs syncs in window 1')
    assert.strictEqual(activateCalls.length, 0)

    store.dispose()
  })

  it('shouldMountInCurrentWindow returns false for any popup window and true for normal browser windows', () => {
    const popupDoc = {
      querySelector: selector => selector === '#browser'
        ? { classList: createMockClassList(['linux', 'popup']) }
        : null,
    }
    const settingsPopupDoc = {
      querySelector: selector => selector === '#browser'
        ? { classList: createMockClassList(['linux', 'popup', 'is-settingspage']) }
        : null,
    }
    const normalDoc = {
      querySelector: selector => selector === '#browser'
        ? { classList: createMockClassList(['linux', 'normal']) }
        : null,
    }
    const missingDoc = {
      querySelector: () => null,
    }

    assert.strictEqual(shouldMountInCurrentWindow(popupDoc), false, 'Extension/web popup windows must not mount vertical tabs')
    assert.strictEqual(shouldMountInCurrentWindow(settingsPopupDoc), false, 'Settings popup window must not mount vertical tabs')
    assert.strictEqual(shouldMountInCurrentWindow(normalDoc), true, 'Normal browser window must mount vertical tabs')
    assert.strictEqual(shouldMountInCurrentWindow(missingDoc), false, 'Missing #browser must return false')
  })
})

const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert')
const { createTabStore } = require('../src/store/tab-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('tab close adaptive activation', () => {
  let callSequence = []
  let activeTabInApi = 11

  function createMockApi(tabs) {
    let currentTabs = JSON.parse(JSON.stringify(tabs))
    let onRemovedListener = null
    let onActivatedListener = null

    return {
      getCurrentWindowId: async () => 1,
      getTabs: async () => currentTabs,
      getActiveWorkspaceId: () => undefined,
      getWorkspaces: async () => [],
      activateTab: async (tabId) => {
        callSequence.push({ action: 'activateTab', tabId })
        activeTabInApi = tabId
        for (const t of currentTabs) {
          t.active = t.id === tabId
        }
      },
      closeTab: async (tabId) => {
        callSequence.push({ action: 'closeTab', tabId, activeAtTimeOfClose: activeTabInApi })
        currentTabs = currentTabs.filter(t => t.id !== tabId)
        if (onRemovedListener) onRemovedListener(tabId)
      },
      closeTabs: async (tabIds) => {
        callSequence.push({ action: 'closeTabs', tabIds, activeAtTimeOfClose: activeTabInApi })
        currentTabs = currentTabs.filter(t => !tabIds.includes(t.id))
        for (const tabId of tabIds) {
          if (onRemovedListener) onRemovedListener(tabId)
        }
      },
      updateTab: async () => {},
      updateVivExtData: async () => {},
      onCreated: () => () => {},
      onUpdated: () => () => {},
      onRemoved: (listener) => {
        onRemovedListener = listener
        return () => { onRemovedListener = null }
      },
      onMoved: () => () => {},
      onAttached: () => () => {},
      onDetached: () => () => {},
      onActivated: (listener) => {
        onActivatedListener = listener
        return () => { onActivatedListener = null }
      },
      onWindowFocusChanged: () => () => {},
      isVivaldi: () => true,
      triggerNativeRemove: (tabId) => {
        currentTabs = currentTabs.filter(t => t.id !== tabId)
        if (onRemovedListener) onRemovedListener(tabId)
      }
    }
  }

  beforeEach(() => {
    callSequence = []
    settingsStore.set('activateAfterClose', 'above')
    settingsStore.set('adaptiveActivation', true)
  })

  it('activates adjacent sibling BEFORE closing active child tab in UI (above mode, first child)', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 0 } }
      },
      {
        id: 12,
        index: 2,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_12', parentNodeId: 'node_10', order: 1 } }
      },
      {
        id: 20,
        index: 3,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 1 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    callSequence = []
    activeTabInApi = 11

    // Close child tab 11 (which is active)
    await store.closeTab(11)

    // Verify activateTab was called for sibling tab 12 BEFORE closeTab
    assert.strictEqual(callSequence.length >= 2, true, 'Should have at least 2 calls')
    assert.strictEqual(callSequence[0].action, 'activateTab')
    assert.strictEqual(callSequence[0].tabId, 12, 'Should activate sibling tab 12')
    assert.strictEqual(callSequence[1].action, 'closeTab')
    assert.strictEqual(callSequence[1].tabId, 11)
    assert.strictEqual(callSequence[1].activeAtTimeOfClose, 12, 'Tab 12 must ALREADY be active when closeTab is executed')
    assert.strictEqual(
      callSequence.filter(call => call.action === 'activateTab').length,
      1,
      'The removal event must not issue a second activation after the pre-close activation',
    )

    store.dispose()
  })

  it('activates previous sibling when closing middle child in above mode', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 0 } }
      },
      {
        id: 12,
        index: 2,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_12', parentNodeId: 'node_10', order: 1 } }
      },
      {
        id: 13,
        index: 3,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_13', parentNodeId: 'node_10', order: 2 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    callSequence = []
    activeTabInApi = 12

    await store.closeTab(12)

    assert.strictEqual(callSequence[0].action, 'activateTab')
    assert.strictEqual(callSequence[0].tabId, 11, 'Should activate sibling tab 11 above')
    assert.strictEqual(callSequence[1].activeAtTimeOfClose, 11)

    store.dispose()
  })

  it('activates next sibling when closing middle child in below mode', async () => {
    settingsStore.set('activateAfterClose', 'below')

    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 0 } }
      },
      {
        id: 12,
        index: 2,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_12', parentNodeId: 'node_10', order: 1 } }
      },
      {
        id: 13,
        index: 3,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_13', parentNodeId: 'node_10', order: 2 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    callSequence = []
    activeTabInApi = 12

    await store.closeTab(12)

    assert.strictEqual(callSequence[0].action, 'activateTab')
    assert.strictEqual(callSequence[0].tabId, 13, 'Should activate sibling tab 13 below')
    assert.strictEqual(callSequence[1].activeAtTimeOfClose, 13)

    store.dispose()
  })

  it('activates parent tab when closing the only child tab', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 0 } }
      },
      {
        id: 20,
        index: 2,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 1 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    callSequence = []
    activeTabInApi = 11

    await store.closeTab(11)

    assert.strictEqual(callSequence[0].action, 'activateTab')
    assert.strictEqual(callSequence[0].tabId, 10, 'Should activate parent tab 10')
    assert.strictEqual(callSequence[1].activeAtTimeOfClose, 10, 'Tab 10 must be active when closeTab runs')

    store.dispose()
  })

  it('handles native closure of active tab by activating tree sibling/parent', async () => {
    const tabs = [
      {
        id: 10,
        index: 0,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_10', parentNodeId: null, order: 0 } }
      },
      {
        id: 11,
        index: 1,
        windowId: 1,
        active: true,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_11', parentNodeId: 'node_10', order: 0 } }
      },
      {
        id: 12,
        index: 2,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_12', parentNodeId: 'node_10', order: 1 } }
      },
      {
        id: 20,
        index: 3,
        windowId: 1,
        active: false,
        pinned: false,
        vivExtData: { svbTree: { contextKey: 'window:1', nodeId: 'node_20', parentNodeId: null, order: 1 } }
      }
    ]

    const api = createMockApi(tabs)
    const store = createTabStore(api)
    await store.init()

    callSequence = []
    activeTabInApi = 11

    // Simulate native Vivaldi tab close (e.g. user pressed Ctrl+W on tab 11)
    api.triggerNativeRemove(11)

    // Wait for any async/microtasks
    await new Promise(resolve => setTimeout(resolve, 50))

    // Should have repaired activation to sibling tab 12
    const activateCall = callSequence.find(c => c.action === 'activateTab')
    assert.ok(activateCall, 'Should have called activateTab on native remove')
    assert.strictEqual(activateCall.tabId, 12, 'Should have activated sibling tab 12')

    store.dispose()
  })
})

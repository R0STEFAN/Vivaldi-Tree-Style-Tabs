const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const { createTabsApi } = require('../src/adapters/tabs-api.js')
const { createTabStore } = require('../src/store/tab-store.js')
const { settingsStore } = require('../src/store/settings-store.js')

describe('Workspace Tab Creation - Respects Active Workspace', () => {
  let originalVivaldi
  let originalChrome

  beforeEach(() => {
    originalVivaldi = global.vivaldi
    originalChrome = global.chrome
  })

  afterEach(() => {
    global.vivaldi = originalVivaldi
    global.chrome = originalChrome
    settingsStore.set('newTabPlacement', 'bottom')
  })

  describe('tabs-api createTab with workspaceId', () => {
    it('passes workspaceId directly in createProperties when provided in options', async () => {
      let createdProps = null
      let resolveCreated
      const createdPromise = new Promise(resolve => { resolveCreated = resolve })

      global.vivaldi = {
        prefs: {
          get: async () => ({ value: 0 }),
        },
      }
      global.chrome = {
        tabs: {
          query: (_q, cb) => cb([
            { id: 1, index: 0, workspaceId: null, pinned: false },
            { id: 2, index: 1, workspaceId: 42, pinned: false },
            { id: 3, index: 2, workspaceId: 42, pinned: false },
            { id: 4, index: 3, workspaceId: 99, pinned: false },
          ]),
          create: (props, cb) => {
            createdProps = props
            if (cb) cb({ id: 10, ...props })
            resolveCreated(props)
          },
          update: (_tabId, _props, cb) => { if (cb) cb({}) },
          onCreated: { addListener: () => {} },
          onRemoved: { addListener: () => {} },
          onUpdated: { addListener: () => {} },
          onMoved: { addListener: () => {} },
          onAttached: { addListener: () => {} },
          onDetached: { addListener: () => {} },
          onActivated: { addListener: () => {} },
        },
        windows: {},
        sessions: {},
        bookmarks: {},
      }

      const tabsApi = createTabsApi()
      tabsApi.createTab(1, { workspaceId: 42, vivExtData: { workspaceId: 42 } })
      await createdPromise

      assert.ok(createdProps, 'createProperties should be captured')
      assert.strictEqual(createdProps.workspaceId, 42, 'workspaceId must be set in createProperties')
      // Bottom mode: index should be placed after last workspace tab (tab 3 at index 2 -> index 3)
      assert.strictEqual(createdProps.index, 3, 'index should place tab at end of workspace 42')
    })

    it('places tab at top of workspace when newTabPlacement is top', async () => {
      settingsStore.set('newTabPlacement', 'top')
      let createdProps = null
      let resolveCreated
      const createdPromise = new Promise(resolve => { resolveCreated = resolve })

      global.vivaldi = {
        prefs: { get: async () => ({ value: 0 }) },
      }
      global.chrome = {
        tabs: {
          query: (_q, cb) => cb([
            { id: 1, index: 0, workspaceId: null, pinned: false },
            { id: 2, index: 1, workspaceId: 42, pinned: false },
            { id: 3, index: 2, workspaceId: 42, pinned: false },
          ]),
          create: (props, cb) => {
            createdProps = props
            if (cb) cb({ id: 10, ...props })
            resolveCreated(props)
          },
          update: (_tabId, _props, cb) => { if (cb) cb({}) },
          onCreated: { addListener: () => {} },
          onRemoved: { addListener: () => {} },
          onUpdated: { addListener: () => {} },
          onMoved: { addListener: () => {} },
          onAttached: { addListener: () => {} },
          onDetached: { addListener: () => {} },
          onActivated: { addListener: () => {} },
        },
        windows: {},
        sessions: {},
        bookmarks: {},
      }

      const tabsApi = createTabsApi()
      tabsApi.createTab(1, { workspaceId: 42 })
      await createdPromise

      assert.strictEqual(createdProps.workspaceId, 42)
      // Top mode: index should be placed at the first workspace tab (tab 2 at index 1)
      assert.strictEqual(createdProps.index, 1, 'index should place tab at start of workspace 42')
    })

    it('extracts workspaceId from vivExtData if options.workspaceId is not directly passed', async () => {
      let createdProps = null
      let resolveCreated
      const createdPromise = new Promise(resolve => { resolveCreated = resolve })

      global.vivaldi = {
        prefs: { get: async () => ({ value: 0 }) },
      }
      global.chrome = {
        tabs: {
          query: (_q, cb) => cb([]),
          create: (props, cb) => {
            createdProps = props
            if (cb) cb({ id: 10, ...props })
            resolveCreated(props)
          },
          update: (_tabId, _props, cb) => { if (cb) cb({}) },
          onCreated: { addListener: () => {} },
          onRemoved: { addListener: () => {} },
          onUpdated: { addListener: () => {} },
          onMoved: { addListener: () => {} },
          onAttached: { addListener: () => {} },
          onDetached: { addListener: () => {} },
          onActivated: { addListener: () => {} },
        },
        windows: {},
        sessions: {},
        bookmarks: {},
      }

      const tabsApi = createTabsApi()
      tabsApi.createTab(1, { vivExtData: { workspaceId: 77 } })
      await createdPromise

      assert.strictEqual(createdProps.workspaceId, 77)
    })

    it('createChildTab passes workspaceId and updates vivExtData', async () => {
      let createdProps = null
      let updatedVivExt = null
      let resolveCreated
      const createdPromise = new Promise(resolve => { resolveCreated = resolve })

      global.vivaldi = {
        prefs: { get: async () => ({ value: 0 }) },
      }
      global.chrome = {
        tabs: {
          create: (props, cb) => {
            createdProps = props
            if (cb) cb({ id: 55, ...props })
            resolveCreated(props)
          },
          update: (tabId, data, cb) => {
            updatedVivExt = data.vivExtData
            if (cb) cb({})
          },
          query: (_q, cb) => cb([]),
          onCreated: { addListener: () => {} },
          onRemoved: { addListener: () => {} },
          onUpdated: { addListener: () => {} },
          onMoved: { addListener: () => {} },
          onAttached: { addListener: () => {} },
          onDetached: { addListener: () => {} },
          onActivated: { addListener: () => {} },
        },
        windows: {},
        sessions: {},
        bookmarks: {},
      }

      const tabsApi = createTabsApi()
      tabsApi.createChildTab(1, 10, { workspaceId: 42, vivExtData: { workspaceId: 42, group: 'g1' } })
      await createdPromise

      assert.strictEqual(createdProps.workspaceId, 42)
      assert.ok(updatedVivExt.includes('"workspaceId":42'))
    })
  })

  describe('tabStore createTab workspace forwarding', () => {
    it('store.createTab passes current workspaceId to api.createTab', async () => {
      let createTabOptions = null
      const mockTabs = [
        {
          id: 10,
          index: 0,
          windowId: 1,
          active: true,
          pinned: false,
          workspaceId: 5,
          vivExtData: { workspaceId: 5, svbTree: { contextKey: 'workspace:5', nodeId: 'node_10', order: 0 } },
        },
      ]

      const noopUnsub = () => () => {}
      const mockApi = {
        getCurrentWindowId: async () => 1,
        getTabs: async () => mockTabs,
        getActiveWorkspaceId: () => 5,
        getWorkspaces: async () => [{ id: 5, name: 'Work' }],
        createTab: (windowId, options) => {
          createTabOptions = options
        },
        updateTab: async () => {},
        updateVivExtData: async () => {},
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

      store.createTab()
      assert.ok(createTabOptions)
      assert.strictEqual(createTabOptions.workspaceId, 5, 'Must pass workspaceId 5')
      assert.deepEqual(createTabOptions.vivExtData, { workspaceId: 5 })
      store.dispose()
    })

    it('handleCreated adopts active workspace if tab.workspaceId was null on creation', async () => {
      let updatedPayload = null
      let onCreatedHandler = null

      const mockTabs = [
        {
          id: 10,
          index: 0,
          windowId: 1,
          active: true,
          pinned: false,
          workspaceId: 9,
          vivExtData: { workspaceId: 9, svbTree: { contextKey: 'workspace:9', nodeId: 'node_10', order: 0 } },
        },
      ]

      const noopUnsub = () => () => {}
      const mockApi = {
        getCurrentWindowId: async () => 1,
        getTabs: async () => mockTabs,
        getActiveWorkspaceId: () => 9,
        getWorkspaces: async () => [{ id: 9, name: 'Dev' }],
        createTab: () => {},
        updateTab: async () => {},
        updateVivExtData: async (tabId, data) => {
          updatedPayload = { tabId, data }
        },
        onCreated: (handler) => { onCreatedHandler = handler; return () => {} },
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

      // Mod triggered createTab
      store.createTab()

      // Browser emits onCreated where workspaceId is temporarily null
      const createdTab = {
        id: 99,
        index: 1,
        windowId: 1,
        active: true,
        pinned: false,
        workspaceId: null,
        vivExtData: null,
      }

      onCreatedHandler(createdTab)

      // Tab should be rescued into workspace 9
      assert.strictEqual(createdTab.workspaceId, 9, 'Tab must be adopted into workspace 9')
      assert.ok(updatedPayload, 'updateVivExtData should be invoked')
      assert.strictEqual(updatedPayload.tabId, 99)
      assert.strictEqual(updatedPayload.data.workspaceId, 9)

      store.dispose()
    })
    it('store.createTab falls back to activeTab workspaceId when native workspaceStore is unavailable', async () => {
      let createTabOptions = null
      const mockTabs = [
        {
          id: 10,
          index: 0,
          windowId: 1,
          active: true,
          pinned: false,
          workspaceId: 77,
          vivExtData: { workspaceId: 77 },
        },
      ]

      const noopUnsub = () => () => {}
      const mockApi = {
        getCurrentWindowId: async () => 1,
        getTabs: async () => mockTabs,
        getActiveWorkspaceId: () => undefined, // Native store unavailable
        getWorkspaces: async () => [{ id: 77, name: 'Work' }],
        createTab: (windowId, options) => {
          createTabOptions = options
        },
        updateTab: async () => {},
        updateVivExtData: async () => {},
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

      store.createTab()
      assert.ok(createTabOptions)
      assert.strictEqual(createTabOptions.workspaceId, 77, 'Must fall back to active tab workspace 77')
      store.dispose()
    })
  })
})

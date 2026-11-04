const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const { createVivaldiBridge } = require('../src/adapters/vivaldi-bridge.js')

describe('vivaldi-bridge - Webpack module discovery', () => {
  let originalChrome
  let originalWindow

  beforeEach(() => {
    originalChrome = global.chrome
    originalWindow = global.window
    global.window = {}
  })

  afterEach(() => {
    global.chrome = originalChrome
    global.window = originalWindow
  })

  it('inspects only cached modules in require.c and does NOT execute factories in require.m', async () => {
    let unexecutedModuleCalled = false

    const mockRequire = function (id) {
      if (id === 999) {
        unexecutedModuleCalled = true
        throw new Error('Should not execute unexecuted module from require.m!')
      }
      return null
    }

    const mockWorkspaceStore = {
      getWorkspaces: () => [{ id: 1, name: 'Main' }],
      getActiveWorkspaceId: () => 1,
      addListener: () => {},
    }

    mockRequire.m = {
      999: function () {
        unexecutedModuleCalled = true
      },
    }

    mockRequire.c = {
      100: {
        i: 100,
        l: true,
        exports: mockWorkspaceStore,
      },
    }

    const mockMainView = {
      document: {},
      location: { href: 'chrome-extension://mpognobbkildjkofajifpdfhcoklimli/main.html' },
      webpackChunkgapp_browser_react: {
        push: ([_ids, _modules, callback]) => {
          callback(mockRequire)
        },
      },
    }

    global.chrome = {
      extension: {
        getViews: () => [mockMainView],
      },
    }

    const bridge = createVivaldiBridge({
      getPrefsApi: () => null,
      setPref: () => {},
      promisifyChromeApi: fn => fn(),
      workspacesPrefPath: 'vivaldi.workspaces.list',
      defaultWorkspaceIcon: '<svg></svg>',
    })

    const activeId = bridge.getActiveWorkspaceId(1)
    assert.equal(activeId, 1, 'Should find workspace store from require.c')
    assert.equal(unexecutedModuleCalled, false, 'Must NOT execute modules from require.m')
  })

  it('finds modules exported with Z and ZP wrappers in require.c', () => {
    const mockRequire = function () {
      return null
    }

    const mockManager = {
      addWorkspace: () => {},
      removeWorkspace: () => {},
      activateWorkspaceByIndex: () => {},
      setName: () => {},
    }

    mockRequire.c = {
      200: {
        i: 200,
        l: true,
        exports: {
          Z: mockManager,
        },
      },
    }

    const mockMainView = {
      document: {},
      location: { href: 'chrome-extension://mpognobbkildjkofajifpdfhcoklimli/main.html' },
      webpackChunkgapp_browser_react: {
        push: ([_ids, _modules, callback]) => {
          callback(mockRequire)
        },
      },
    }

    global.chrome = {
      extension: {
        getViews: () => [mockMainView],
      },
    }

    const bridge = createVivaldiBridge({
      getPrefsApi: () => null,
      setPref: () => {},
      promisifyChromeApi: fn => fn(),
      workspacesPrefPath: 'vivaldi.workspaces.list',
      defaultWorkspaceIcon: '<svg></svg>',
    })

    const result = bridge.activateWorkspace(1, null)
    assert.equal(result, true, 'Should find workspace manager wrapped in .Z')
  })
  it('loads module via knownModuleId when not in require.c', () => {
    let moduleCalled = false

    const mockWorkspaceStore = {
      getWorkspaces: () => [{ id: 42, name: 'Work' }],
      getActiveWorkspaceId: () => 42,
      addListener: () => {},
    }

    const mockRequire = function (id) {
      if (id === 53454) {
        moduleCalled = true
        return { Z: mockWorkspaceStore }
      }
      return null
    }

    mockRequire.m = {
      53454: function () {},
      999: function () {
        throw new Error('Should not execute unrelated module from require.m!')
      },
    }

    mockRequire.c = {}

    const mockMainView = {
      document: {},
      location: { href: 'chrome-extension://mpognobbkildjkofajifpdfhcoklimli/main.html' },
      webpackChunkgapp_browser_react: {
        push: ([_ids, _modules, callback]) => {
          callback(mockRequire)
        },
      },
    }

    global.chrome = {
      extension: {
        getViews: () => [mockMainView],
      },
    }

    const bridge = createVivaldiBridge({
      getPrefsApi: () => null,
      setPref: () => {},
      promisifyChromeApi: fn => fn(),
      workspacesPrefPath: 'vivaldi.workspaces.list',
      defaultWorkspaceIcon: '<svg></svg>',
    })

    const activeId = bridge.getActiveWorkspaceId(1)
    assert.equal(activeId, 42, 'Should load workspace store via knownModuleId')
    assert.equal(moduleCalled, true, 'knownModuleId should be executed directly')
  })

  it('scans require.m source without executing unrelated modules when knownModuleId does not match', () => {
    let unrelatedExecuted = false
    let targetExecuted = false

    const mockManager = {
      addWorkspace: () => 123,
      removeWorkspace: () => {},
      activateWorkspaceByIndex: () => {},
      setName: () => {},
    }

    const mockRequire = function (id) {
      if (id === 77777) {
        targetExecuted = true
        return { Z: mockManager }
      }
      if (id === 999) {
        unrelatedExecuted = true
        throw new Error('Should not execute unrelated module!')
      }
      return null
    }

    function managerFactory() {
      // source contains keywords: addWorkspace, removeWorkspace
    }
    function unrelatedFactory() {
      // source contains: locale, moment, format
    }

    mockRequire.m = {
      77777: managerFactory,
      999: unrelatedFactory,
    }

    mockRequire.c = {}

    const mockMainView = {
      document: {},
      location: { href: 'chrome-extension://mpognobbkildjkofajifpdfhcoklimli/main.html' },
      webpackChunkgapp_browser_react: {
        push: ([_ids, _modules, callback]) => {
          callback(mockRequire)
        },
      },
    }

    global.chrome = {
      extension: {
        getViews: () => [mockMainView],
      },
    }

    const bridge = createVivaldiBridge({
      getPrefsApi: () => null,
      setPref: () => {},
      promisifyChromeApi: fn => fn(),
      workspacesPrefPath: 'vivaldi.workspaces.list',
      defaultWorkspaceIcon: '<svg></svg>',
    })

    const result = bridge.activateWorkspace(1, null)
    assert.equal(result, true, 'Should find workspace manager via sourceKeywords scan')
    assert.equal(targetExecuted, true, 'Target module should be executed')
    assert.equal(unrelatedExecuted, false, 'Unrelated module must NOT be executed')
  })
})

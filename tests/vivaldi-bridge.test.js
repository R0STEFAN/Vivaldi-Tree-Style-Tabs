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
})

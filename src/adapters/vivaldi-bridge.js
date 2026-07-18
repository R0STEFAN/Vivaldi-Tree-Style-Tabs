const VIVALDI_TILING_MODULE_ID = 69787
const VIVALDI_PAGE_STORE_MODULE_ID = 96951
const VIVALDI_COLLECTION_MODULE_ID = 35369
const VIVALDI_PAGE_ACTIONS_MODULE_ID = 59322

function createVivaldiBridge(options) {
  const {
    getPrefsApi,
    setPref,
    promisifyChromeApi,
    workspacesPrefPath,
    defaultWorkspaceIcon,
  } = options
let mainViewWebpackRequire = null
let workspaceManager = null
let pageStore = null
let tilingModule = null
let pageActions = null
let collectionModule = null
let workspaceStore = null
let mainView = null
const workspaceRepairTasksById = new Map()

function getVivaldiMainView() {
  if (mainView && !mainView.closed) return mainView

  const extensionApi = typeof chrome !== 'undefined' && chrome ? chrome.extension : null
  if (!extensionApi || typeof extensionApi.getViews !== 'function') return null

  mainView = extensionApi.getViews().find(view => {
    if (!view || view === window) return false
    if (!view.document || !view.location) return false
    if (!String(view.location.href || '').endsWith('/main.html')) return false
    return !!view.webpackChunkgapp_browser_react
  }) || null

  return mainView
}

  function getMainViewWebpackRequire() {
    if (mainViewWebpackRequire) return mainViewWebpackRequire

    const mainView = getVivaldiMainView()
    const chunk = mainView && mainView.webpackChunkgapp_browser_react
    if (!chunk || typeof chunk.push !== 'function') return null

    try {
      chunk.push([
        [`svb-main-runtime-${Date.now()}`],
        {},
        require => {
          mainViewWebpackRequire = require
        },
      ])
    } catch (error) {
      console.warn('[svb] cannot access Vivaldi main runtime', error)
    }

    return mainViewWebpackRequire
  }

  function getVivaldiWebpackModule(moduleId) {
    const require = getMainViewWebpackRequire()
    if (!require || typeof require !== 'function') return null

    try {
      return require(moduleId)
    } catch (error) {
      return null
    }
  }

  function findModuleByExports(predicate) {
    const require = getMainViewWebpackRequire()
    if (!require || !require.m) return null

    for (const moduleId of Object.keys(require.m)) {
      try {
        const mod = require(moduleId)
        if (!mod) continue
        
        // Check main export and Z/ZP wrappers
        if (predicate(mod)) return mod
        if (mod.Z && predicate(mod.Z)) return mod.Z
        if (mod.ZP && predicate(mod.ZP)) return mod.ZP
      } catch (e) {
        continue
      }
    }
    return null
  }

  function getWorkspaceManager() {
    if (workspaceManager) return workspaceManager
    workspaceManager = findModuleByExports(m => 
      typeof m.addWorkspace === 'function' && 
      typeof m.removeWorkspace === 'function' &&
      typeof m.activateWorkspaceByIndex === 'function'
    )
    return workspaceManager
  }

  function getPageStore() {
    if (pageStore) return pageStore
    pageStore = findModuleByExports(m => typeof m.getPageById === 'function' && typeof m.getPages === 'function')
    return pageStore
  }

  function getTilingModule() {
    if (tilingModule) return tilingModule
    tilingModule = findModuleByExports(m => typeof m.Yb === 'function' && m.Yb.length >= 2)
    return tilingModule
  }

  function getPageActions() {
    if (pageActions) return pageActions
    // Vivaldi 8: movePage might be gone or renamed, using detachPage + detachWorkspace as signature
    // Also ensuring setSelection is present
    pageActions = findModuleByExports(m => typeof m.detachPage === 'function' && (typeof m.setSelection === 'function' || typeof m.detachWorkspace === 'function'))
    return pageActions
  }

  function getCollectionModule() {
    if (collectionModule) return collectionModule
    // Vivaldi 8: The collection module often has an 'aV' property which is the collection class/object
    const mod = findModuleByExports(m => m && m.aV && typeof m.aV.of === 'function')
    if (mod && mod.aV) {
      collectionModule = mod.aV
      return collectionModule
    }
    // Fallback for older versions
    collectionModule = findModuleByExports(m => typeof m.aV === 'function' && (typeof m.V_ === 'function' || typeof m.of === 'function'))
    return collectionModule
  }

  function repairWorkspaceRuntime(workspace) {
    const manager = getWorkspaceManager()
    if (!manager) return false

    try {
      manager.setName(workspace.id, workspace.name)
      const setIcon = manager.setIcon || manager.setWorkspaceIcon
      if (typeof setIcon === 'function' && workspace.icon) {
        setIcon(workspace.id, workspace.icon)
      }
      return true
    } catch (error) {
      console.warn('[svb] cannot repair workspace runtime', error)
      return false
    }
  }

  async function upsertWorkspacePref(workspace) {
    const prefsApi = getPrefsApi()
    if (!prefsApi || typeof prefsApi.get !== 'function' || typeof prefsApi.set !== 'function') return false

    const current = await promisifyChromeApi(prefsApi.get, workspacesPrefPath)
    const workspaces = Array.isArray(current) ? current.slice() : []
    const index = workspaces.findIndex(item => Number(item && item.id) === workspace.id)
    const nextWorkspace = {
      ...(index >= 0 && workspaces[index] && typeof workspaces[index] === 'object' ? workspaces[index] : {}),
      id: workspace.id,
      name: workspace.name,
      icon: workspace.icon,
    }

    if (index >= 0) {
      workspaces[index] = nextWorkspace
    } else {
      workspaces.push(nextWorkspace)
    }

    await setPref(workspacesPrefPath, workspaces)
    return true
  }

  function scheduleWorkspacePrefRepair(workspace) {
    const workspaceId = Number(workspace && workspace.id)
    if (!Number.isFinite(workspaceId)) return

    const pending = workspaceRepairTasksById.get(workspaceId)
    if (pending) {
      pending.timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    }

    const delays = [100, 300, 700, 1200, 2000, 3500, 5000]
    const token = Symbol(`workspace-repair:${workspaceId}`)
    const timeouts = []
    workspaceRepairTasksById.set(workspaceId, { token, timeouts })

    for (const delayMs of delays) {
      const timeoutId = setTimeout(() => {
        const current = workspaceRepairTasksById.get(workspaceId)
        if (!current || current.token !== token) return

        repairWorkspaceRuntime(workspace)
        upsertWorkspacePref(workspace).catch(error => {
          console.error('[svb] cannot repair workspace pref', error)
        })

        if (delayMs === delays[delays.length - 1]) {
          const latest = workspaceRepairTasksById.get(workspaceId)
          if (latest && latest.token === token) {
            workspaceRepairTasksById.delete(workspaceId)
          }
        }
      }, delayMs)
      timeouts.push(timeoutId)
    }
  }

    function getWorkspaceStore() {
      if (workspaceStore) return workspaceStore
      workspaceStore = findModuleByExports(m => 
        typeof m.getWorkspaces === 'function' && 
        typeof m.getActiveWorkspaceId === 'function'
      )
      return workspaceStore
    }

  function normalizeWorkspace(workspace) {
    if (!workspace || typeof workspace !== 'object') return null
    const id = Number(workspace.id)
    if (!Number.isFinite(id)) return null
    return {
      ...workspace,
      id,
      name: workspace.name || `Workspace ${id}`,
    }
  }

  return {
    async getWorkspaces() {
      // 1. Try Prefs (Guaranteed to be instantly updated by Vivaldi when workspaces change)
      const prefsApi = getPrefsApi()
      if (prefsApi && typeof prefsApi.get === 'function') {
        try {
          const workspaces = await promisifyChromeApi(prefsApi.get, 'vivaldi.workspaces.list')
          if (Array.isArray(workspaces) && workspaces.length > 0) {
            return workspaces.map(normalizeWorkspace).filter(Boolean)
          }
        } catch (e) {
          console.warn('[svb] prefs workspaces fetch failed:', e)
        }
      }

      // 2. Try native API
      const workspacesApi = typeof vivaldi !== 'undefined' && vivaldi.workspaces
      if (workspacesApi && typeof workspacesApi.getAll === 'function') {
        try {
          const workspaces = await promisifyChromeApi(workspacesApi.getAll)
          if (Array.isArray(workspaces) && workspaces.length > 0) {
            return workspaces.map(normalizeWorkspace).filter(Boolean)
          }
        } catch (e) {
          console.warn('[svb] native workspaces.getAll failed:', e)
        }
      }

      // 3. Fallback to internal WorkspaceStore
      const store = getWorkspaceStore()
      if (store) {
        try {
          const workspaces = store.getWorkspaces()
          if (Array.isArray(workspaces) && workspaces.length > 0) {
            return workspaces.map(normalizeWorkspace).filter(Boolean)
          }
        } catch (e) {
          console.warn('[svb] WorkspaceStore fetch failed:', e)
        }
      }

      return []
    },

    // Create a workspace via Vivaldi's own manager. It assigns the id, persists
    // it, and switches to the (empty) new workspace — same as native.
    createWorkspace(name = 'New Workspace') {
      const manager = getWorkspaceManager()
      if (!manager || typeof manager.addWorkspace !== 'function') return false
      const store = getWorkspaceStore()
      let icon
      try {
        icon = store && typeof store.getRandomIcon === 'function'
          ? store.getRandomIcon()
          : (store && typeof store.getDefaultIcon === 'function' ? store.getDefaultIcon() : defaultWorkspaceIcon)
      } catch (error) {
        icon = defaultWorkspaceIcon
      }
      try {
        manager.addWorkspace(name, icon)
        return true
      } catch (error) {
        console.warn('[svb] native addWorkspace failed', error)
        return false
      }
    },

    // Create with a caller-supplied id (used by "create workspace and move
    // tabs here"): dispatches the native create but does not move/activate.
    createWorkspaceWithId(workspaceId, name = 'New Workspace') {
      const id = Number(workspaceId)
      if (!Number.isFinite(id)) return false
      const manager = getWorkspaceManager()
      if (!manager || typeof manager.addWorkspaceWithId !== 'function') return false
      const store = getWorkspaceStore()
      let icon
      try {
        icon = store && typeof store.getRandomIcon === 'function'
          ? store.getRandomIcon()
          : (store && typeof store.getDefaultIcon === 'function' ? store.getDefaultIcon() : defaultWorkspaceIcon)
      } catch (error) {
        icon = defaultWorkspaceIcon
      }
      try {
        manager.addWorkspaceWithId(id, name, icon)
        return true
      } catch (error) {
        console.warn('[svb] native addWorkspaceWithId failed', error)
        return false
      }
    },

    // Delete via the native manager: it switches away if active, closes the
    // workspace's tabs, and removes it — exactly Vivaldi's "Delete Workspace".
    async deleteWorkspace(windowId, workspaceId) {
      const id = Number(workspaceId)
      if (!Number.isFinite(id)) return false
      const manager = getWorkspaceManager()
      if (!manager || typeof manager.removeWorkspace !== 'function') return false
      try {
        await manager.removeWorkspace(windowId, id)
        return true
      } catch (error) {
        console.warn('[svb] native removeWorkspace failed', error)
        return false
      }
    },

    // Switch the active workspace natively (works for empty workspaces). A null
    // workspaceId activates the "no workspace" default area.
    activateWorkspace(windowId, workspaceId) {
      const manager = getWorkspaceManager()
      if (!manager || typeof manager.activateWorkspaceByIndex !== 'function') return false
      try {
        if (workspaceId == null) {
          // Non-number index → native maps to the default (no workspace).
          manager.activateWorkspaceByIndex(windowId, null)
          return true
        }
        const id = Number(workspaceId)
        const store = getWorkspaceStore()
        const list = store && typeof store.getWorkspaces === 'function' ? store.getWorkspaces() : []
        const index = Array.isArray(list) ? list.findIndex(workspace => Number(workspace && workspace.id) === id) : -1
        if (index < 0) return false
        manager.activateWorkspaceByIndex(windowId, index)
        return true
      } catch (error) {
        console.warn('[svb] native activateWorkspace failed', error)
        return false
      }
    },

    setWorkspaceName(workspaceId, name) {
      const id = Number(workspaceId)
      if (!Number.isFinite(id)) return false
      const manager = getWorkspaceManager()
      if (!manager || typeof manager.setName !== 'function') return false
      try {
        manager.setName(id, name)
        return true
      } catch (error) {
        console.warn('[svb] native setName failed', error)
        return false
      }
    },

    async tileTabs(tabIds, layout) {
      const ids = Array.isArray(tabIds)
        ? tabIds.map(Number).filter(Number.isFinite)
        : []
      if (ids.length < 2) return null
      if (!['row', 'column', 'grid'].includes(layout)) return null

      const tiling = getTilingModule()
      const store = getPageStore()
      const collection = getCollectionModule()
      const tilePages = tiling && typeof tiling.Yb === 'function' ? tiling.Yb : null
      const pageStore = store && typeof store.getPageById === 'function' ? store : null
      const createCollection = (collection && (collection.aV || collection.of || collection.from)) || null

      if (!tilePages || !pageStore || !createCollection) {
        return null
      }

      const pages = ids
        .map(tabId => pageStore.getPageById(tabId))
        .filter(Boolean)

      if (pages.length < 2) return null

      const nativeTarget = typeof createCollection === 'function' 
        ? createCollection(pages) 
        : typeof createCollection.of === 'function'
          ? createCollection.of(...pages)
          : pages

      return tilePages(nativeTarget, layout, 'selection')
    },

    async detachTabsToNewWindow(tabIds) {
      const ids = Array.isArray(tabIds)
        ? tabIds.map(Number).filter(Number.isFinite)
        : []
      if (ids.length === 0) return false

      const actions = getPageActions()
      const store = getPageStore()
      const collection = getCollectionModule()
      
      const detachPage = actions && typeof actions.detachPage === 'function' ? actions.detachPage : null
      const getPageById = store && typeof store.getPageById === 'function' ? store.getPageById.bind(store) : null
      
      if (!detachPage || !getPageById || !collection) {
        console.warn('[svb] bridge modules missing for detach:', { 
          hasActions: !!actions, 
          hasDetach: !!detachPage, 
          hasStore: !!store, 
          hasCollection: !!collection
        })
        return false
      }

      const pages = ids
        .map(tabId => getPageById(tabId))
        .filter(Boolean)

      if (pages.length === 0) {
        console.warn('[svb] no native pages found for ids:', ids)
        return false
      }

      try {
        let nativeTarget
        if (pages.length === 1) {
          nativeTarget = pages[0]
        } else if (typeof collection.of === 'function') {
          // Vivaldi 8 uses P.aV.of(...pages)
          nativeTarget = collection.of(...pages)
        } else if (typeof collection.from === 'function') {
          nativeTarget = collection.from(pages)
        } else if (typeof collection === 'function') {
          nativeTarget = collection(pages)
        } else {
          nativeTarget = pages
        }

        await detachPage(nativeTarget)
        return true
      } catch (error) {
        console.error('[svb] native detachPage failed:', error)
        return false
      }
    },

    setSelectedTabs(tabIds) {
      const ids = Array.isArray(tabIds) ? tabIds.map(Number).filter(Number.isFinite) : []
      const actions = findModuleByExports(m => typeof m.setSelection === 'function') || getPageActions()
      const store = getPageStore()
      
      const setSelection = actions && typeof actions.setSelection === 'function' ? actions.setSelection : null
      const clearSelection = actions && typeof actions.clearSelection === 'function' ? actions.clearSelection : null
      const getPageById = store && typeof store.getPageById === 'function' ? store.getPageById.bind(store) : null

      const reduxStore = findModuleByExports(m => m && typeof m.getState === 'function' && typeof m.dispatch === 'function')

      if (!getPageById) return false

      try {
        // 1. Clear existing selection if possible as a safeguard.
        if (ids.length > 0) {
          const firstPage = getPageById(ids[0])
          if (firstPage && firstPage.windowId) {
            if (typeof clearSelection === 'function') {
              clearSelection(firstPage.windowId)
            } else if (reduxStore) {
              reduxStore.dispatch({ actionType: "PAGE_SELECTION_CLEAR", windowId: firstPage.windowId })
            }
          }
        }

        // 2. Apply new selection individually.
        ids.forEach((id, index) => {
          const page = getPageById(id)
          if (page) {
            if (setSelection) {
              setSelection(page, { multiSelect: false, addGroup: index > 0 })
            } else if (reduxStore) {
              reduxStore.dispatch({
                actionType: "PAGE_SELECTION_SET",
                page: page,
                multiSelect: false,
                addGroup: index > 0,
                excludeActive: false
              })
            }
          }
        })
        return true
      } catch (error) {
        console.error('[svb] setSelectedTabs failed:', error)
        return false
      }
    },

    onWorkspacesChanged(listener) {
        // 1. Try WorkspaceStore listener (Immediate updates)
        const store = getWorkspaceStore()
        if (store) {
          const wrapped = () => {
            listener(store.getWorkspaces())
          }
          if (typeof store.addListener === 'function') {
            store.addListener(wrapped)
            return () => store.removeListener(wrapped)
          } else if (typeof store.addChangeListener === 'function') {
            store.addChangeListener(wrapped)
            return () => store.removeChangeListener(wrapped)
          } else if (typeof store.subscribe === 'function') {
            const unsubscribe = store.subscribe(wrapped)
            return () => unsubscribe && unsubscribe()
          }
        }
  
        // 2. Fallback to Prefs listener
      const prefsApi = getPrefsApi()
      if (!prefsApi || typeof prefsApi.onChanged === 'undefined') return () => {}

      const wrapped = (path, value) => {
        if (path === workspacesPrefPath || path === 'vivaldi.workspaces.list' || path === 'vivaldi.workspaces') {
          listener(value)
        }
      }
      prefsApi.onChanged.addListener(wrapped)
      return () => prefsApi.onChanged.removeListener(wrapped)
    },
  }
}

module.exports = { createVivaldiBridge }

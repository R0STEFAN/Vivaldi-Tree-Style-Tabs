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
    workspaceManager = findModuleByExports(m => typeof m.setName === 'function' && (typeof m.setIcon === 'function' || typeof m.setWorkspaceIcon === 'function'))
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
      typeof m.getActiveWorkspaceId === 'function' &&
      typeof m.addListener === 'function'
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
      // 1. Try internal WorkspaceStore (Most reliable in Vivaldi 8)
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

      // 2. Fallback to native API
      const workspacesApi = typeof vivaldi !== 'undefined' && vivaldi.workspaces
      if (workspacesApi && typeof workspacesApi.getAll === 'function') {
        try {
          const workspaces = await promisifyChromeApi(workspacesApi.getAll)
          if (Array.isArray(workspaces) && workspaces.length > 0) {
            return workspaces.map(normalizeWorkspace).filter(Boolean)
          }
        } catch (e) {}
      }

      // 3. Fallback to Prefs
      const prefsApi = getPrefsApi()
      if (!prefsApi || typeof prefsApi.get !== 'function') return []
      
      try {
        const workspaces = await promisifyChromeApi(prefsApi.get, 'vivaldi.workspaces.list')
        if (Array.isArray(workspaces)) {
          return workspaces.map(normalizeWorkspace).filter(Boolean)
        }
      } catch (e) {}

      return []
    },

    async createWorkspace(name = 'New Workspace') {
      const store = getWorkspaceStore()
      if (store && typeof store.addWorkspace === 'function') {
        // In Vivaldi 8, we might need to use the store to create
        // But for now, let's keep the pref-based creation if it works
      }

      const prefsApi = getPrefsApi()
      if (!prefsApi || typeof prefsApi.get !== 'function') return null

      const current = await promisifyChromeApi(prefsApi.get, workspacesPrefPath)
      const workspaces = Array.isArray(current) ? current.slice() : []
      const usedIds = new Set(workspaces.map(workspace => Number(workspace && workspace.id)).filter(Number.isFinite))
      let id = Date.now()
      while (usedIds.has(id)) id += 1

      const workspace = {
        id,
        name,
        icon: defaultWorkspaceIcon,
      }

      await upsertWorkspacePref(workspace)
      scheduleWorkspacePrefRepair(workspace)

      return workspace
    },

    repairWorkspace(workspace) {
      if (!workspace || !Number.isFinite(Number(workspace.id))) return
      scheduleWorkspacePrefRepair({
        ...workspace,
        id: Number(workspace.id),
        name: workspace.name || 'New Workspace',
        icon: workspace.icon || defaultWorkspaceIcon,
      })
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

        console.log('[svb] detaching native pages:', pages.length, 'using', nativeTarget?.constructor?.name || typeof nativeTarget)
        await detachPage(nativeTarget)
        return true
      } catch (error) {
        console.error('[svb] native detachPage failed:', error)
        return false
      }
    },

    setSelectedTabs(tabIds) {
      const ids = Array.isArray(tabIds) ? tabIds.map(Number).filter(Number.isFinite) : []
      const actions = getPageActions()
      const store = getPageStore()
      
      const setSelection = actions && typeof actions.setSelection === 'function' ? actions.setSelection : null
      const clearSelection = actions && typeof actions.clearSelection === 'function' ? actions.clearSelection : null
      const getPageById = store && typeof store.getPageById === 'function' ? store.getPageById.bind(store) : null

      if (!setSelection || !getPageById) return false

      try {
        // 1. Clear existing selection if we have new IDs to select
        if (ids.length > 0 && typeof clearSelection === 'function') {
          const firstPage = getPageById(ids[0])
          if (firstPage && firstPage.windowId) {
            clearSelection(firstPage.windowId)
          }
        }

        // 2. Apply new selection individually
        ids.forEach((id) => {
          const page = getPageById(id)
          if (page) {
            // multiSelect: false to avoid range (Shift) selection
            // addGroup: true to add to the selection group (Ctrl behavior)
            setSelection(page, { multiSelect: false, addGroup: true })
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
      if (store && typeof store.addListener === 'function') {
        const wrapped = () => {
          listener(store.getWorkspaces())
        }
        store.addListener(wrapped)
        return () => store.removeListener(wrapped)
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

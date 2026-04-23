const VIVALDI_TILING_MODULE_ID = 69787
const VIVALDI_PAGE_STORE_MODULE_ID = 96951
const VIVALDI_COLLECTION_MODULE_ID = 35369
const VIVALDI_WORKSPACE_MANAGER_MODULE_ID = 29104
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
  const workspaceRepairTasksById = new Map()

  function getVivaldiMainView() {
    const extensionApi = typeof chrome !== 'undefined' && chrome ? chrome.extension : null
    if (!extensionApi || typeof extensionApi.getViews !== 'function') return null

    return extensionApi.getViews().find(view => {
      if (!view || view === window) return false
      if (!view.document || !view.location) return false
      if (!String(view.location.href || '').endsWith('/main.html')) return false
      return !!view.webpackChunkgapp_browser_react
    }) || null
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
      console.warn('[svb] cannot resolve Vivaldi module', moduleId, error)
      return null
    }
  }

  function getWorkspaceManager() {
    if (workspaceManager) return workspaceManager

    const moduleValue = getVivaldiWebpackModule(VIVALDI_WORKSPACE_MANAGER_MODULE_ID)
    const candidate = moduleValue && moduleValue.Z ? moduleValue.Z : moduleValue
    workspaceManager = candidate && typeof candidate.setName === 'function' ? candidate : null

    return workspaceManager
  }

  function repairWorkspaceRuntime(workspace) {
    const manager = getWorkspaceManager()
    if (!manager) return false

    try {
      manager.setName(workspace.id, workspace.name)
      if (typeof manager.setIcon === 'function' && workspace.icon) {
        manager.setIcon(workspace.id, workspace.icon)
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
      const prefsApi = getPrefsApi()
      if (!prefsApi || typeof prefsApi.get !== 'function') return []
      const workspaces = await promisifyChromeApi(prefsApi.get, workspacesPrefPath)
      return (Array.isArray(workspaces) ? workspaces : [])
        .map(normalizeWorkspace)
        .filter(Boolean)
    },

    async createWorkspace(name = 'New Workspace') {
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

      const tilingModule = getVivaldiWebpackModule(VIVALDI_TILING_MODULE_ID)
      const pageStoreModule = getVivaldiWebpackModule(VIVALDI_PAGE_STORE_MODULE_ID)
      const collectionModule = getVivaldiWebpackModule(VIVALDI_COLLECTION_MODULE_ID)
      const tilePages = tilingModule && typeof tilingModule.Yb === 'function' ? tilingModule.Yb : null
      const pageStore = pageStoreModule && pageStoreModule.ZP ? pageStoreModule.ZP : null
      const createCollection = collectionModule && typeof collectionModule.aV === 'function' ? collectionModule.aV : null

      if (!tilePages || !pageStore || !createCollection || typeof pageStore.getPageById !== 'function') {
        return null
      }

      const pages = ids
        .map(tabId => pageStore.getPageById(tabId))
        .filter(Boolean)

      if (pages.length < 2) return null
      return tilePages(createCollection(pages), layout, 'selection')
    },

    async detachTabsToNewWindow(tabIds) {
      const ids = Array.isArray(tabIds)
        ? tabIds.map(Number).filter(Number.isFinite)
        : []
      if (ids.length === 0) return false

      const pageActionsModule = getVivaldiWebpackModule(VIVALDI_PAGE_ACTIONS_MODULE_ID)
      const pageStoreModule = getVivaldiWebpackModule(VIVALDI_PAGE_STORE_MODULE_ID)
      const collectionModule = getVivaldiWebpackModule(VIVALDI_COLLECTION_MODULE_ID)
      const pageActions = pageActionsModule && pageActionsModule.ZP ? pageActionsModule.ZP : null
      const pageStore = pageStoreModule && pageStoreModule.ZP ? pageStoreModule.ZP : null
      const createCollection = collectionModule && typeof collectionModule.aV === 'function' ? collectionModule.aV : null

      if (!pageActions || typeof pageActions.detachPage !== 'function') return false
      if (!pageStore || typeof pageStore.getPageById !== 'function') return false
      if (!createCollection) return false

      const pages = ids
        .map(tabId => pageStore.getPageById(tabId))
        .filter(Boolean)

      if (pages.length === 0) return false

      const nativeTarget = pages.length === 1
        ? pages[0]
        : createCollection(pages)

      await pageActions.detachPage(nativeTarget)
      return true
    },
  }
}

module.exports = { createVivaldiBridge }

const {
  getInternalPageFaviconUrl,
  getInternalPageTitle,
  isStartPageUrl,
  isSettingsUrl,
} = require('./internal-page-meta.js')
const { createVivaldiBridge } = require('./vivaldi-bridge.js')

function promisifyChromeApi(fn, ...args) {
  return new Promise((resolve, reject) => {
    try {
      fn(...args, result => {
        const runtimeError = chrome.runtime && chrome.runtime.lastError
        if (runtimeError) {
          reject(new Error(runtimeError.message))
          return
        }
        resolve(result)
      })
    } catch (error) {
      reject(error)
    }
  })
}

const VIVALDI_START_PAGE_URL = 'chrome://vivaldi-webui/startpage?section=Speed-dials'
const VIVALDI_BLANK_PAGE_URL = 'about:blank'
const VIVALDI_HOMEPAGE_PREF = 'vivaldi.homepage'
const VIVALDI_NEW_PAGE_LINK_PREF = 'vivaldi.tabs.new_page.link'
const VIVALDI_NEW_PAGE_CUSTOM_URL_PREF = 'vivaldi.tabs.new_page.custom_url'
const VIVALDI_WORKSPACES_PREF = 'vivaldi.workspaces.list'
const TREE_BOOKMARK_PREFIX = '[TTV] '
const TREE_BOOKMARK_CONTAINER_TITLE = 'TreeTabsVivaldi'
const VIVALDI_DEFAULT_WORKSPACE_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M3.5 8.5V11.9648C3.5 12.2992 3.66819 12.6099 3.97304 12.7472C4.63034 13.0433 5.97266 13.5 8 13.5C10.0273 13.5 11.3697 13.0433 12.027 12.7472C12.3318 12.6099 12.5 12.2992 12.5 11.9648V8.5M14.4182 5.54402L8.0237 8.98724C8.00891 8.9952 7.99109 8.9952 7.9763 8.98724L1.58176 5.54402C1.5467 5.52515 1.5467 5.47485 1.58176 5.45598L7.9763 2.01276C7.99109 2.0048 8.00891 2.0048 8.0237 2.01276L14.4182 5.45598C14.4533 5.47485 14.4533 5.52515 14.4182 5.54402Z" stroke-linecap="round"/>
  <path d="M14.5 5.5V10.5" stroke-linecap="round"/>
  <path d="M14.5 12.5V13.5" stroke-linecap="round"/>
</svg>
`

function serializeVivExtData(vivExtData) {
  if (!vivExtData || typeof vivExtData !== 'object') {
    return undefined
  }

  const payload = {}

  if (typeof vivExtData.workspaceId !== 'undefined' && vivExtData.workspaceId != null) {
    payload.workspaceId = vivExtData.workspaceId
  }

  if (typeof vivExtData.group !== 'undefined' && vivExtData.group != null) {
    payload.group = vivExtData.group
  }

  if (typeof vivExtData.fixedTitle === 'string' && vivExtData.fixedTitle.trim()) {
    payload.fixedTitle = vivExtData.fixedTitle.trim()
  }

  return Object.keys(payload).length ? JSON.stringify(payload) : undefined
}

function parseVivExtData(value) {
  if (!value) return null

  if (typeof value === 'object') {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  try {
    return JSON.parse(value)
  } catch (_error) {
    return null
  }
}

function getUrlFallbackTitle(url) {
  if (!url) return 'Untitled'
  const internalTitle = getInternalPageTitle(url)
  if (internalTitle) return internalTitle

  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'chrome:' || parsed.protocol === 'vivaldi:') {
      return parsed.hostname || parsed.pathname.replace(/^\//, '') || 'Internal Page'
    }

    return parsed.hostname || url
  } catch (_error) {
    return url
  }
}

function getDisplayTitle(tab) {
  const url = tab.url || ''
  const vivExtData = parseVivExtData(tab.vivExtData)
  const fixedTitle = vivExtData && typeof vivExtData.fixedTitle === 'string'
    ? vivExtData.fixedTitle.trim()
    : ''
  const title = tab.title && tab.title.trim() ? tab.title.trim() : ''

  if (fixedTitle) return fixedTitle
  if (isStartPageUrl(url) || isSettingsUrl(url)) {
    return getInternalPageTitle(url)
  }
  if (title && title !== url) return title
  return getUrlFallbackTitle(url)
}

function getFallbackFaviconUrl(tab) {
  const url = tab.url || ''
  const internalFaviconUrl = getInternalPageFaviconUrl(url)

  if (internalFaviconUrl) {
    return internalFaviconUrl
  }

  if (tab.favIconUrl) return tab.favIconUrl

  if (!url) return ''
  return `chrome://favicon/size/16@2x/${url}`
}

function normalizeTab(tab) {
  const vivExtData = parseVivExtData(tab.vivExtData)

  return {
    id: tab.id,
    windowId: tab.windowId,
    index: tab.index,
    openerTabId: Number.isFinite(tab.openerTabId) ? tab.openerTabId : null,
    title: getDisplayTitle(tab),
    url: tab.url || '',
    favIconUrl: getFallbackFaviconUrl(tab),
    active: !!tab.active,
    pinned: !!tab.pinned,
    audible: !!tab.audible,
    muted: !!(tab.mutedInfo && tab.mutedInfo.muted),
    discarded: !!tab.discarded,
    hidden: !!tab.hidden,
    loading: tab.status === 'loading',
    vivExtData: vivExtData && typeof vivExtData === 'object' ? vivExtData : null,
    workspaceId: vivExtData && typeof vivExtData.workspaceId !== 'undefined'
      ? vivExtData.workspaceId
      : null,
  }
}

function getVivaldiPrefsApi() {
  return typeof vivaldi !== 'undefined' && vivaldi && vivaldi.prefs ? vivaldi.prefs : null
}

async function getVivaldiPref(path) {
  const prefsApi = getVivaldiPrefsApi()
  if (!prefsApi || typeof prefsApi.get !== 'function') return undefined
  return promisifyChromeApi(prefsApi.get, path)
}

async function setVivaldiPref(path, value) {
  const prefsApi = getVivaldiPrefsApi()
  if (!prefsApi || typeof prefsApi.set !== 'function') return false

  const result = prefsApi.set({ path, value })
  if (result && typeof result.then === 'function') {
    await result
  }

  return true
}

async function getConfiguredNewTabUrl() {
  let linkType = 'startpage'

  try {
    const value = await getVivaldiPref(VIVALDI_NEW_PAGE_LINK_PREF)
    linkType = typeof value === 'string' ? value : String(value || 'startpage')
  } catch (_error) {
    linkType = 'startpage'
  }

  if (linkType === 'homepage' || linkType === '1') {
    try {
      const homepage = await getVivaldiPref(VIVALDI_HOMEPAGE_PREF)
      return typeof homepage === 'string' && homepage ? homepage : VIVALDI_START_PAGE_URL
    } catch (_error) {
      return VIVALDI_START_PAGE_URL
    }
  }

  if (linkType === 'blankpage' || linkType === '2') {
    return VIVALDI_BLANK_PAGE_URL
  }

  if (linkType === 'extension' || linkType === '3') {
    return ''
  }

  if (linkType === 'custom' || linkType === '4') {
    try {
      const customUrl = await getVivaldiPref(VIVALDI_NEW_PAGE_CUSTOM_URL_PREF)
      return typeof customUrl === 'string' && customUrl ? customUrl : VIVALDI_START_PAGE_URL
    } catch (_error) {
      return VIVALDI_START_PAGE_URL
    }
  }

  return VIVALDI_START_PAGE_URL
}

function isTreeBookmarkFolder(node) {
  return !!(node && !node.url && typeof node.title === 'string' && node.title.startsWith(TREE_BOOKMARK_PREFIX))
}

function getTreeBookmarkTitle(title) {
  const value = typeof title === 'string' ? title : ''
  return value.startsWith(TREE_BOOKMARK_PREFIX) ? value.slice(TREE_BOOKMARK_PREFIX.length) : value
}

function getBookmarksBarNode(roots) {
  const root = Array.isArray(roots) ? roots[0] : null
  const children = Array.isArray(root && root.children) ? root.children : []
  return children.find(child => child && child.folderType === 'bookmarks-bar')
    || children.find(child => child && child.id === '1')
    || children.find(child => child && child.folderType === 'other')
    || children.find(child => child && child.id === '2')
    || null
}

function findTreeBookmarkContainerNode(roots) {
  const bookmarksBar = getBookmarksBarNode(roots)
  const parentChildren = Array.isArray(bookmarksBar && bookmarksBar.children) ? bookmarksBar.children : []
  return parentChildren.find(child => {
    return child && !child.url && child.title === TREE_BOOKMARK_CONTAINER_TITLE
  }) || null
}

function createTabsApi() {
  const tabsApi = chrome.tabs
  const windowsApi = chrome.windows
  const sessionsApi = chrome.sessions
  const bookmarksApi = chrome.bookmarks
  const pendingVivExtUpdateTabIds = new Set()
  const vivaldiBridge = createVivaldiBridge({
    getPrefsApi: getVivaldiPrefsApi,
    setPref: setVivaldiPref,
    promisifyChromeApi,
    workspacesPrefPath: VIVALDI_WORKSPACES_PREF,
    defaultWorkspaceIcon: VIVALDI_DEFAULT_WORKSPACE_ICON,
  })

  return {
    async getCurrentWindowId() {
      const win = await promisifyChromeApi(windowsApi.getCurrent, { populate: false })
      return win.id
    },

    async getTabs(windowId) {
      const tabs = await promisifyChromeApi(tabsApi.query, { windowId })
      return tabs.map(normalizeTab)
    },

    async getWorkspaces() {
      return vivaldiBridge.getWorkspaces()
    },

    async createWorkspace(name = 'New Workspace') {
      return vivaldiBridge.createWorkspace(name)
    },

    repairWorkspace(workspace) {
      vivaldiBridge.repairWorkspace(workspace)
    },

    activateTab(tabId) {
      tabsApi.update(tabId, { active: true })
    },

    async updateTab(tabId, properties) {
      if (!Number.isFinite(tabId) || !properties || typeof properties !== 'object') return null
      return promisifyChromeApi(tabsApi.update, tabId, properties)
    },

    setOpenerTab(tabId, openerTabId) {
      if (!Number.isFinite(tabId) || !Number.isFinite(openerTabId)) return
      tabsApi.update(tabId, { openerTabId })
    },

    async moveTab(tabId, index) {
      if (!Number.isFinite(tabId) || !Number.isFinite(index)) return null
      return promisifyChromeApi(tabsApi.move, tabId, { index })
    },

    closeTab(tabId) {
      tabsApi.remove(tabId)
    },

    closeTabs(tabIds) {
      tabsApi.remove(tabIds)
    },

    async duplicateTab(tabId) {
      if (!Number.isFinite(tabId) || typeof tabsApi.duplicate !== 'function') return null
      return promisifyChromeApi(tabsApi.duplicate, tabId)
    },

    async tileTabs(tabIds, layout) {
      return vivaldiBridge.tileTabs(tabIds, layout)
    },

    async restoreLastClosedTab() {
      if (!sessionsApi || typeof sessionsApi.restore !== 'function') return null
      return new Promise((resolve, reject) => {
        try {
          sessionsApi.restore(result => {
            const runtimeError = chrome.runtime && chrome.runtime.lastError
            if (runtimeError) {
              reject(new Error(runtimeError.message))
              return
            }
            resolve(result)
          })
        } catch (error) {
          reject(error)
        }
      })
    },

    async getSavedBookmarkTrees() {
      if (!bookmarksApi || typeof bookmarksApi.getTree !== 'function') return []
      const roots = await promisifyChromeApi(bookmarksApi.getTree)
      const container = findTreeBookmarkContainerNode(roots)
      if (!container) return []
      const result = (Array.isArray(container.children) ? container.children : [])
        .filter(child => isTreeBookmarkFolder(child))
        .map(child => ({
          id: child.id,
          title: getTreeBookmarkTitle(child.title),
        }))
      return result.sort((left, right) => String(left.title || '').localeCompare(String(right.title || '')))
    },

    async saveBookmarkTree(tree) {
      if (!bookmarksApi || typeof bookmarksApi.create !== 'function') return null
      if (!tree || !tree.url) return null

      async function getTreeBookmarkContainerId() {
        if (typeof bookmarksApi.getTree !== 'function') return undefined
        const roots = await promisifyChromeApi(bookmarksApi.getTree)
        const bookmarksBar = getBookmarksBarNode(roots)
        const parentId = bookmarksBar ? bookmarksBar.id : undefined
        const existingContainer = findTreeBookmarkContainerNode(roots)
        if (existingContainer) return existingContainer.id

        const container = await promisifyChromeApi(bookmarksApi.create, {
          ...(parentId ? { parentId } : {}),
          title: TREE_BOOKMARK_CONTAINER_TITLE,
        })
        return container.id
      }

      async function createTreeFolder(node, parentId) {
        const folder = await promisifyChromeApi(bookmarksApi.create, {
          ...(parentId ? { parentId } : {}),
          title: `${TREE_BOOKMARK_PREFIX}${node.title || 'Saved Tree'}`,
        })
        await promisifyChromeApi(bookmarksApi.create, {
          parentId: folder.id,
          title: node.title || node.url,
          url: node.url,
        })

        for (const child of Array.isArray(node.children) ? node.children : []) {
          if (child && Array.isArray(child.children) && child.children.length > 0) {
            await createTreeFolder(child, folder.id)
            continue
          }

          if (child && child.url) {
            await promisifyChromeApi(bookmarksApi.create, {
              parentId: folder.id,
              title: child.title || child.url,
              url: child.url,
            })
          }
        }

        return folder
      }

      return createTreeFolder(tree, await getTreeBookmarkContainerId())
    },

    async getSavedBookmarkTree(folderId) {
      if (!bookmarksApi || typeof bookmarksApi.getSubTree !== 'function') return null
      if (folderId == null || folderId === '') return null
      const nodes = await promisifyChromeApi(bookmarksApi.getSubTree, String(folderId))
      const root = Array.isArray(nodes) ? nodes[0] : null
      if (!isTreeBookmarkFolder(root)) return null

      function parseFolder(folder) {
        const children = Array.isArray(folder && folder.children) ? folder.children : []
        const parentBookmark = children.find(child => child && child.url)
        if (!parentBookmark) return null

        const parsed = {
          title: parentBookmark.title || getTreeBookmarkTitle(folder.title) || parentBookmark.url,
          url: parentBookmark.url,
          children: [],
        }
        let skippedParent = false

        for (const child of children) {
          if (!skippedParent && child.id === parentBookmark.id) {
            skippedParent = true
            continue
          }

          if (isTreeBookmarkFolder(child)) {
            const subtree = parseFolder(child)
            if (subtree) parsed.children.push(subtree)
            continue
          }

          if (child && child.url) {
            parsed.children.push({
              title: child.title || child.url,
              url: child.url,
              children: [],
            })
          }
        }

        return parsed
      }

      return parseFolder(root)
    },

    async deleteSavedBookmarkTree(folderId) {
      if (!bookmarksApi || typeof bookmarksApi.removeTree !== 'function') return false
      if (folderId == null || folderId === '') return false
      await promisifyChromeApi(bookmarksApi.removeTree, String(folderId))
      return true
    },

    async moveTabsToNewWindow(tabIds) {
      const ids = Array.isArray(tabIds) ? tabIds.filter(Number.isFinite) : []
      if (ids.length === 0) return null
      if (vivaldiBridge && typeof vivaldiBridge.detachTabsToNewWindow === 'function') {
        const detached = await vivaldiBridge.detachTabsToNewWindow(ids)
        if (detached) return { native: true }
      }
      console.warn('[svb] native Vivaldi detachPage is unavailable; move to new window skipped')
      return null
    },

    async updateVivExtData(tabId, vivExtData) {
      pendingVivExtUpdateTabIds.add(tabId)
      try {
        return await promisifyChromeApi(
          tabsApi.update,
          tabId,
          { vivExtData: JSON.stringify(vivExtData || {}) }
        )
      } catch (error) {
        pendingVivExtUpdateTabIds.delete(tabId)
        throw error
      }
    },

    async createRestoredTab(windowId, options = {}) {
      if (windowId == null) return null
      const createProperties = {
        windowId,
        active: !!options.active,
        transition: 'auto_bookmark',
        ignoreLinkRouting: true,
      }

      if (typeof options.url === 'string' && options.url) {
        createProperties.url = options.url
      }

      if (Number.isFinite(options.index)) {
        createProperties.index = options.index
      }

      const vivExtData = serializeVivExtData(options.vivExtData)
      if (vivExtData) {
        createProperties.vivExtData = vivExtData
      }

      return normalizeTab(await promisifyChromeApi(tabsApi.create, createProperties))
    },

    isOwnVivExtUpdate(tabId, changeInfo) {
      if (!pendingVivExtUpdateTabIds.has(tabId)) return false
      const info = changeInfo && typeof changeInfo === 'object' ? changeInfo : {}
      const keys = Object.keys(info)
      const isVivExtOnly = keys.length === 1 && keys[0] === 'vivExtData'
      if (!isVivExtOnly) return false
      pendingVivExtUpdateTabIds.delete(tabId)
      return true
    },

    createTab(windowId, options = {}) {
      tabsApi.query({ windowId }, async tabs => {
        const index = Array.isArray(tabs) ? tabs.length : undefined
        const createProperties = {
          windowId,
          active: true,
          index,
          transition: 'auto_bookmark',
          ignoreLinkRouting: true,
        }

        const url = typeof options.url === 'string' && options.url
          ? options.url
          : await getConfiguredNewTabUrl()
        if (url) {
          createProperties.url = url
        }

        const vivExtData = serializeVivExtData(options.vivExtData)
        if (vivExtData) {
          createProperties.vivExtData = vivExtData
        }

        tabsApi.create(createProperties)
      })
    },

    createChildTab(windowId, openerTabId, options = {}) {
      void (async () => {
        const createProperties = {
          windowId,
          active: true,
          openerTabId,
          transition: 'link',
          ignoreLinkRouting: true,
        }

        const url = typeof options.url === 'string' && options.url
          ? options.url
          : await getConfiguredNewTabUrl()
        if (url) {
          createProperties.url = url
        }

        if (Number.isFinite(options.index)) {
          createProperties.index = options.index
        }

        const vivExtData = serializeVivExtData(options.vivExtData)
        if (vivExtData) {
          createProperties.vivExtData = vivExtData
        }

        tabsApi.create(createProperties)
      })()
    },

    onCreated(listener) {
      const wrapped = tab => listener(normalizeTab(tab))
      tabsApi.onCreated.addListener(wrapped)
      return () => tabsApi.onCreated.removeListener(wrapped)
    },

    onUpdated(listener) {
      const wrapped = (tabId, changeInfo, tab) => listener(tabId, changeInfo, normalizeTab(tab))
      tabsApi.onUpdated.addListener(wrapped)
      return () => tabsApi.onUpdated.removeListener(wrapped)
    },

    onRemoved(listener) {
      tabsApi.onRemoved.addListener(listener)
      return () => tabsApi.onRemoved.removeListener(listener)
    },

    onMoved(listener) {
      tabsApi.onMoved.addListener(listener)
      return () => tabsApi.onMoved.removeListener(listener)
    },

    onAttached(listener) {
      tabsApi.onAttached.addListener(listener)
      return () => tabsApi.onAttached.removeListener(listener)
    },

    onDetached(listener) {
      tabsApi.onDetached.addListener(listener)
      return () => tabsApi.onDetached.removeListener(listener)
    },

    onActivated(listener) {
      tabsApi.onActivated.addListener(listener)
      return () => tabsApi.onActivated.removeListener(listener)
    },

    onBookmarksChanged(listener) {
      if (!bookmarksApi) return () => {}
      const eventNames = ['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered', 'onImportEnded']
      const removers = []

      for (const eventName of eventNames) {
        const event = bookmarksApi[eventName]
        if (!event || typeof event.addListener !== 'function' || typeof event.removeListener !== 'function') {
          continue
        }

        event.addListener(listener)
        removers.push(() => event.removeListener(listener))
      }

      return () => removers.forEach(remove => remove())
    },
  }
}

module.exports = { createTabsApi }

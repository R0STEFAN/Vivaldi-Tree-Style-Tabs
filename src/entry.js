const { waitForBrowser } = require('./bootstrap/wait-for-browser.js')
const { mountRoot } = require('./bootstrap/mount-root.js')
const { createTabStore } = require('./store/tab-store.js')
const { createPanelStore } = require('./store/panel-store.js')
const { createSelectionStore } = require('./store/selection-store.js')
const { createDragStore } = require('./store/drag-store.js')
const { createTabsApi } = require('./adapters/tabs-api.js')
const { createThemeAdapter } = require('./adapters/theme.js')
const { createLayoutAdapter } = require('./adapters/layout.js')
const { createSidebarRenderer } = require('./ui/render.js')
const { settingsStore } = require('./store/settings-store.js')

const APP_ID = 'svb-root'

function createTabLookupCache() {
  let tabStateRef = null
  let cached = null

  return function getLookup(tabState) {
    if (tabStateRef === tabState && cached) {
      return cached
    }

    const pinnedTabs = Array.isArray(tabState && tabState.pinnedTabs) ? tabState.pinnedTabs : []
    const tabs = Array.isArray(tabState && tabState.tabs) ? tabState.tabs : []
    const treeTabs = Array.isArray(tabState && tabState.treeTabs) ? tabState.treeTabs : []
    const visibleIds = []
    const visibleIdSet = new Set()
    const treeItemsById = new Map()

    for (const tab of pinnedTabs) {
      visibleIds.push(tab.id)
      visibleIdSet.add(tab.id)
    }
    for (const tab of tabs) {
      visibleIds.push(tab.id)
      visibleIdSet.add(tab.id)
    }
    for (const item of treeTabs) {
      treeItemsById.set(item.id, item)
    }

    cached = { visibleIds, visibleIdSet, treeItemsById }
    tabStateRef = tabState
    return cached
  }
}

function shouldMountInCurrentWindow() {
  const browser = document.querySelector('#browser')
  if (!browser) return false
  if (browser.classList.contains('popup') && browser.classList.contains('is-settingspage')) return false
  return true
}

async function main() {
  if (window.__svbInitialized) return
  window.__svbInitialized = true

  await waitForBrowser()

  if (!shouldMountInCurrentWindow()) return

  const mount = mountRoot(APP_ID)
  if (!mount) {
    window.__svbInitialized = false
    return
  }

  const theme = createThemeAdapter(mount.root)
  const panelStore = createPanelStore()
  await panelStore.init()
  await settingsStore.init()
  const layout = createLayoutAdapter({
    root: mount.root,
    host: mount.host,
    trigger: mount.trigger,
    dragShield: mount.dragShield,
    panelStore,
  })
  const api = createTabsApi()
  const store = createTabStore(api)
  const selectionStore = createSelectionStore()
  const dragStore = createDragStore()
  const renderer = createSidebarRenderer({
    root: mount.root,
    dragShield: mount.dragShield,
    onActivateTab: id => {
      selectionStore.clear()
      store.activateTab(id)
    },
    onCloseTab: id => store.closeTab(id),
    onCreateTab: () => store.createTab(),
    onCreateFolderTab: () => store.createFolderTab(),
    onCreateChildTab: id => store.createChildTab(id),
    onRenameTab: (id, title) => { void store.renameTab(id, title) },
    onTogglePinned: () => panelStore.togglePinned(),
    onToggleMute: id => {
      const selectedIds = selectionStore.getState().selectedIds || []
      void store.toggleMutedForSelection(id, selectedIds)
    },
    onToggleCollapse: id => { void store.toggleCollapsed(id) },
    onCollapseAll: () => { void store.collapseAll() },
    onOpenContextMenu: id => {
      const selectedIds = latestSelectionState.selectedIds || []
      if (!selectedIds.includes(id)) {
        selectionStore.selectSingle(id)
      }
      if (store.refreshWorkspaces) {
        return store.refreshWorkspaces()
      }
    },
    onContextMenuAction: (action, payload) => {
      const tabId = payload && payload.tabId
      const selectedIds = latestSelectionState.selectedIds || []
      if (!Number.isFinite(tabId)) return

      if (action === 'restore-closed') {
        store.restoreLastClosedTab()
      } else if (action === 'new-child') {
        store.createChildTab(tabId)
      } else if (action === 'new-sibling') {
        store.createSiblingTab(tabId)
      } else if (action === 'new-folder-child') {
        store.createFolderTabAt(tabId, 'inside')
      } else if (action === 'new-folder-sibling') {
        store.createFolderTabAt(tabId, 'after')
      } else if (action === 'new-folder-above') {
        store.createFolderTabAt(tabId, 'before')
      } else if (action === 'move-window') {
        void store.moveSelectionToNewWindow(tabId, selectedIds)
      } else if (action === 'move-workspace') {
        void store.moveSelectionToWorkspace(tabId, selectedIds, payload.workspaceId)
      } else if (action === 'move-new-workspace') {
        void store.createWorkspaceAndMoveSelection(tabId, selectedIds)
      } else if (action === 'toggle-pin') {
        void store.togglePinnedForSelection(tabId, selectedIds)
      } else if (action === 'toggle-mute') {
        void store.toggleMutedForSelection(tabId, selectedIds)
      } else if (action === 'hibernate') {
        void store.hibernateSelection(tabId, selectedIds)
      } else if (action === 'reload') {
        void store.reloadSelection(tabId, selectedIds)
      } else if (action === 'bookmark-tab') {
        void store.bookmarkSelection(tabId, selectedIds)
      } else if (action === 'copy-url') {
        void store.copySelectionUrl(tabId, selectedIds)
      } else if (action === 'copy-title') {
        void store.copySelectionTitle(tabId, selectedIds)
      } else if (action === 'copy-markdown') {
        void store.copySelectionMarkdown(tabId, selectedIds)
      } else if (action === 'set-color') {
        void store.setColorForSelection(tabId, selectedIds, payload.colorKey)
      } else if (action === 'duplicate') {
        void store.duplicateTab(tabId)
      } else if (action === 'save-tree-bookmark') {
        void store.saveTreeAsBookmark(tabId)
      } else if (action === 'open-saved-tree') {
        void store.openSavedBookmarkTree(payload.bookmarkTreeId)
      } else if (action === 'delete-saved-tree') {
        void store.deleteSavedBookmarkTree(payload.bookmarkTreeId)
      } else if (action === 'close') {
        store.closeSelection(tabId, selectedIds)
      } else if (action === 'close-other') {
        store.closeOtherTabs(tabId, selectedIds)
      } else if (action === 'close-below') {
        store.closeTabsBelow(tabId)
      } else if (action === 'close-above') {
        store.closeTabsAbove(tabId)
      }
    },
    onStartDrag: (id, meta) => {
      const { visibleIds, treeItemsById } = getTabLookup(latestTabState)
      const selectedIds = latestSelectionState.selectedIds || []
      const draggedIds = selectedIds.includes(id)
        ? visibleIds
          .filter(tabId => selectedIds.includes(tabId))
          .filter(tabId => {
            const item = treeItemsById.get(tabId)
            return !(item && Array.isArray(item.ancestorIds) && item.ancestorIds.some(ancestorId => selectedIds.includes(ancestorId)))
          })
        : [id]

      dragStore.startDrag(draggedIds, meta)
    },
    onUpdateDropTarget: (targetId, position) => {
      dragStore.updateDropTarget(targetId, position)
    },
    onCommitDrop: (targetId, position) => {
      const dragState = dragStore.getState()
      const draggedIds = dragState.draggedIds
      if (!Array.isArray(draggedIds) || draggedIds.length === 0 || !Number.isFinite(targetId) || !position) {
        dragStore.clear()
        return
      }

      void store.moveTreeTabs(draggedIds, targetId, position).finally(() => {
        dragStore.clear()
      })
    },
    onCommitExternalDrop: () => {
      const dragState = dragStore.getState()
      const draggedIds = dragState.draggedIds
      if (!Array.isArray(draggedIds) || draggedIds.length === 0) {
        dragStore.clear()
        return
      }

      void store.moveSelectionToNewWindow(draggedIds[0], draggedIds).finally(() => {
        dragStore.clear()
      })
    },
    onCommitExternalContentDrop: ({ url, text, targetId, position }) => {
      if (!url && !text) return

      const finalUrl = url ? url.split('\n')[0].trim() : `https://www.google.com/search?q=${encodeURIComponent(text.trim())}`
      
      if (Number.isFinite(targetId) && position) {
        store.createTabAt(finalUrl, targetId, position)
      } else {
        store.createTab(null, { url: finalUrl })
      }
    },
    onClearDrag: () => {
      dragStore.clear()
    },
    onSelectTab: (id, payload) => {
      if (payload && payload.mode === 'toggle') {
        selectionStore.toggleSelected(id)
        return
      }

      if (payload && payload.mode === 'range') {
        const anchorId = selectionStore.getState().anchorId || id
        selectionStore.selectRange(anchorId, id, payload.orderedVisibleIds || [])
        return
      }

      selectionStore.selectSingle(id)
      if (!payload || payload.activate !== false) {
        store.activateTab(id)
      }
    },
  })

  let latestTabState = null
  let latestPanelState = panelStore.getState()
  let latestSelectionState = selectionStore.getState()
  let latestDragState = dragStore.getState()
  let previousVisibleActiveTabId = null
  const getTabLookup = createTabLookupCache()
  const entryEventController = new AbortController()
  const unsubscribers = []

  function syncView() {
    if (!latestTabState) return

    renderer.render({
      ...latestTabState,
      pinnedTabs: latestTabState.pinnedTabs,
      tabs: latestTabState.tabs,
      treeTabs: latestTabState.treeTabs,
      drag: latestDragState,
      selectedIds: latestSelectionState.selectedIds,
      panelPinned: latestPanelState.pinned,
    })
    layout.apply()
  }

  unsubscribers.push(store.subscribe(state => {
    latestTabState = state
    const { visibleIds, treeItemsById } = getTabLookup(state)
    const activeRegularVisible = Number.isFinite(state.activeTabId) && treeItemsById.has(state.activeTabId)
    const activeTabChanged = state.activeTabId !== previousVisibleActiveTabId

    if (
      activeTabChanged
      && activeRegularVisible
      && latestSelectionState.selectedIds.length <= 1
      && latestSelectionState.selectedIds[0] !== state.activeTabId
    ) {
      selectionStore.selectSingle(state.activeTabId)
    } else {
      selectionStore.retainValid(visibleIds)
    }

    previousVisibleActiveTabId = activeRegularVisible ? state.activeTabId : previousVisibleActiveTabId
    syncView()
  }))

  unsubscribers.push(panelStore.subscribe(state => {
    latestPanelState = state
    syncView()
  }))

  unsubscribers.push(selectionStore.subscribe(state => {
    latestSelectionState = state
    if (state.selectedIds && state.selectedIds.length > 0) {
      api.syncNativeSelection(state.selectedIds)
    }
    syncView()
  }))

  unsubscribers.push(dragStore.subscribe(state => {
    latestDragState = state
    syncView()
  }))

  theme.start()
  layout.start()
  window.__svbDispose = () => {
    entryEventController.abort()
    while (unsubscribers.length) {
      const unsubscribe = unsubscribers.pop()
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
    if (typeof renderer.dispose === 'function') renderer.dispose()
    if (typeof layout.dispose === 'function') layout.dispose()
    if (typeof theme.dispose === 'function') theme.dispose()
    if (typeof store.dispose === 'function') store.dispose()
  }
  await store.init()
}

main().catch(error => {
  window.__svbInitialized = false
  if (typeof window.__svbDispose === 'function') {
    window.__svbDispose()
    window.__svbDispose = null
  }
  console.error('[svb] failed to initialize', error)
})

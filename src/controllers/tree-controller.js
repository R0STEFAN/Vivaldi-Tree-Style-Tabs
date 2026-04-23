const { createTreeStore } = require('../store/tree-store.js')
const { createTreePersistence } = require('../store/tree-persistence.js')
const { buildTreeView, getAncestorIds, isDescendantOf, getSubtreeIds, getFullTreeOrderIds } = require('../store/tree-selectors.js')
const { resolveNewTabParent } = require('../adapters/tab-relations.js')
const { isStartPageUrl } = require('../adapters/internal-page-meta.js')

function createTreeController(api) {
  const treeStore = createTreeStore()
  const treePersistence = createTreePersistence(api)
  const pendingCreatedTabs = new Map()
  const expectedCreations = []
  let pendingRemovalDirty = false
  let cachedDerivedView = null
  let persistQueue = Promise.resolve()

  function invalidateDerivedView() {
    cachedDerivedView = null
  }

  function haveSameTabOrder(previousTabs, nextTabs) {
    const previous = Array.isArray(previousTabs) ? previousTabs : []
    const next = Array.isArray(nextTabs) ? nextTabs : []
    if (previous.length !== next.length) return false
    for (let index = 0; index < next.length; index += 1) {
      if (!previous[index] || previous[index].id !== next[index].id) return false
    }
    return true
  }

  function createDerivedViewCache(contextKey, tabs, treeTabs, fullTreeOrderIds, parentById) {
    return {
      contextKey,
      tabs,
      treeItems: treeTabs.map(item => ({
        id: item.id,
        depth: item.depth,
        visibleIndex: item.visibleIndex,
        parentId: item.parentId,
        hasChildren: item.hasChildren,
        collapsed: item.collapsed,
        childCount: item.childCount,
        subtreeSize: item.subtreeSize,
        ancestorIds: Array.isArray(item.ancestorIds) ? item.ancestorIds.slice() : [],
        visibleBranchSize: item.visibleBranchSize,
      })),
      fullTreeOrderIds: Array.isArray(fullTreeOrderIds) ? fullTreeOrderIds.slice() : [],
      parentById: { ...(parentById || {}) },
    }
  }

  function restoreDerivedViewFromCache(tabs) {
    if (!cachedDerivedView) return null
    if (!haveSameTabOrder(cachedDerivedView.tabs, tabs)) return null

    const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))
    const treeTabs = []
    for (const item of cachedDerivedView.treeItems) {
      const tab = tabsById.get(item.id)
      if (!tab) return null
      treeTabs.push({
        ...item,
        ancestorIds: Array.isArray(item.ancestorIds) ? item.ancestorIds.slice() : [],
        tab,
      })
    }

    return {
      treeTabs,
      fullTreeOrderIds: cachedDerivedView.fullTreeOrderIds.slice(),
      parentById: { ...cachedDerivedView.parentById },
    }
  }

  async function ensureContext(contextKey, tabs, currentContextKey) {
    const currentTreeState = treeStore.getState()
    if (currentTreeState.contextKey === contextKey && currentContextKey === contextKey) {
      return false
    }

    const persistedTree = await treePersistence.loadTree(contextKey, tabs)
    treeStore.load(contextKey, persistedTree)
    invalidateDerivedView()
    return true
  }

  async function persistCurrentTree(tabs) {
    const currentTreeState = treeStore.getState()
    if (!currentTreeState.contextKey) return
    const contextKey = currentTreeState.contextKey
    const treeSnapshot = treeStore.exportState()
    const tabSnapshot = Array.isArray(tabs) ? tabs.slice() : []

    persistQueue = persistQueue
      .catch(() => {})
      .then(() => treePersistence.saveTree(contextKey, treeSnapshot, tabSnapshot))
      .catch(error => {
        console.error('[svb] cannot persist tree', error)
      })

    return persistQueue
  }

  function normalizeTopLevelMoveIds(tabIds) {
    const treeState = treeStore.exportState()
    const normalizedIds = []

    for (const value of Array.isArray(tabIds) ? tabIds : []) {
      const tabId = Number(value)
      if (!Number.isFinite(tabId) || !treeStore.hasTab(tabId) || normalizedIds.includes(tabId)) continue

      const hasSelectedAncestor = normalizedIds.some(selectedId => isDescendantOf(tabId, selectedId, treeState))
      if (hasSelectedAncestor) continue
      normalizedIds.push(tabId)
    }

    return normalizedIds
  }

  return {
    makeContextKey(tabState) {
      return treePersistence.makeContextKey(tabState)
    },

    async persistTree(tabs) {
      await persistCurrentTree(tabs)
    },

    registerExpectedCreation(intent) {
      const creation = intent && typeof intent === 'object' ? { ...intent } : {}
      expectedCreations.push({
        kind: creation.kind === 'child'
          ? 'child'
          : creation.kind === 'sibling'
            ? 'sibling'
            : 'root',
        parentTabId: Number.isFinite(creation.parentTabId) ? creation.parentTabId : null,
        createdAt: Date.now(),
      })
    },

    capturePendingCreation(tab, sourceActiveTabId, meta = {}) {
      if (!tab || tab.pinned) return
      while (expectedCreations.length > 0 && Date.now() - expectedCreations[0].createdAt > 5000) {
        expectedCreations.shift()
      }

      const expectedCreation = expectedCreations.length > 0
        ? expectedCreations.shift()
        : null

      pendingCreatedTabs.set(tab.id, {
        openerTabId: tab.openerTabId,
        sourceActiveTabId,
        expectedCreation,
        fromPinnedTab: !(expectedCreation && expectedCreation.kind === 'root') && !!(meta && meta.fromPinnedTab),
      })
    },

    handleRemovedTab(tabId) {
      pendingCreatedTabs.delete(tabId)
      pendingRemovalDirty = treeStore.removeTab(tabId) || pendingRemovalDirty
      if (pendingRemovalDirty) {
        invalidateDerivedView()
      }
    },

    clearStalePendingCreations(allTabs) {
      const currentTabIds = new Set(allTabs.map(tab => tab.id))
      for (const tabId of pendingCreatedTabs.keys()) {
        if (!currentTabIds.has(tabId)) {
          pendingCreatedTabs.delete(tabId)
        }
      }
      while (expectedCreations.length > 0 && Date.now() - expectedCreations[0].createdAt > 5000) {
        expectedCreations.shift()
      }
    },

    getCreateChildIndex(parentTabId, tabs) {
      if (!treeStore.hasTab(parentTabId)) return null

      const items = Array.isArray(tabs) ? tabs : []
      const tabsById = new Map(items.map(tab => [tab.id, tab]))
      const treeState = treeStore.exportState()
      const subtreeIds = getSubtreeIds(parentTabId, treeState)

      let maxIndex = null
      for (const tabId of subtreeIds) {
        const tab = tabsById.get(tabId)
        if (!tab || !Number.isFinite(tab.index)) continue
        maxIndex = maxIndex == null ? tab.index : Math.max(maxIndex, tab.index)
      }

      if (maxIndex == null) {
        const parentTab = tabsById.get(parentTabId)
        return parentTab && Number.isFinite(parentTab.index) ? parentTab.index + 1 : null
      }

      return maxIndex + 1
    },

    getCreateSiblingIndex(tabId, tabs) {
      if (!treeStore.hasTab(tabId)) return null

      const items = Array.isArray(tabs) ? tabs : []
      const tabsById = new Map(items.map(tab => [tab.id, tab]))
      const treeState = treeStore.exportState()
      const subtreeIds = getSubtreeIds(tabId, treeState)

      let maxIndex = null
      for (const subtreeId of subtreeIds) {
        const tab = tabsById.get(subtreeId)
        if (!tab || !Number.isFinite(tab.index)) continue
        maxIndex = maxIndex == null ? tab.index : Math.max(maxIndex, tab.index)
      }

      if (maxIndex == null) {
        const currentTab = tabsById.get(tabId)
        return currentTab && Number.isFinite(currentTab.index) ? currentTab.index + 1 : null
      }

      return maxIndex + 1
    },

    getCloseTargetIds(tabId) {
      if (!treeStore.hasTab(tabId)) return []
      const treeState = treeStore.exportState()
      const node = treeState.nodesById && treeState.nodesById[tabId] ? treeState.nodesById[tabId] : null
      if (!node) return []

      if (node.collapsed) {
        return getSubtreeIds(tabId, treeState)
      }

      return [tabId]
    },

    getSubtreeTargetIds(tabIds) {
      const moveIds = normalizeTopLevelMoveIds(Array.isArray(tabIds) ? tabIds : [tabIds])
      if (moveIds.length === 0) return []

      const treeState = treeStore.exportState()
      const result = []
      const seen = new Set()

      for (const tabId of moveIds) {
        for (const subtreeId of getSubtreeIds(tabId, treeState)) {
          if (seen.has(subtreeId)) continue
          seen.add(subtreeId)
          result.push(subtreeId)
        }
      }

      return result
    },

    getWorkspaceMoveRecords(tabIds) {
      const moveIds = normalizeTopLevelMoveIds(Array.isArray(tabIds) ? tabIds : [tabIds])
      if (moveIds.length === 0) return []

      const treeState = treeStore.exportState()
      const records = []

      function walk(tabId, parentId, siblingIndex) {
        const node = treeState.nodesById && treeState.nodesById[tabId] ? treeState.nodesById[tabId] : null
        if (!node) return

        records.push({
          tabId,
          parentId: Number.isFinite(parentId) ? parentId : null,
          siblingIndex,
          rootIndex: parentId == null ? siblingIndex : null,
        })

        const childIds = Array.isArray(node.childIds) ? node.childIds : []
        childIds.forEach((childId, childIndex) => walk(childId, tabId, childIndex))
      }

      moveIds.forEach((tabId, rootIndex) => walk(tabId, null, rootIndex))
      return records
    },

    getBookmarkTree(tabId, tabs) {
      if (!treeStore.hasTab(tabId)) return null
      const treeState = treeStore.exportState()
      const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))

      function buildNode(currentId) {
        const tab = tabsById.get(currentId)
        if (!tab || !tab.url) return null
        const node = treeState.nodesById && treeState.nodesById[currentId] ? treeState.nodesById[currentId] : null
        const childIds = Array.isArray(node && node.childIds) ? node.childIds : []
        return {
          title: tab.title || tab.url,
          url: tab.url,
          collapsed: !!(node && node.collapsed),
          children: childIds.map(buildNode).filter(Boolean),
        }
      }

      return buildNode(tabId)
    },

    restoreBookmarkTree(nodes, tabs) {
      const items = Array.isArray(nodes) ? nodes : []
      if (items.length === 0) return false

      let changed = false
      for (const item of items) {
        if (!item || !Number.isFinite(item.tabId)) continue
        changed = treeStore.ensureTab(item.tabId) || changed
      }

      for (const item of items) {
        if (!item || !Number.isFinite(item.tabId)) continue
        const parentId = Number.isFinite(item.parentId) ? item.parentId : null
        if (parentId == null) {
          changed = treeStore.moveRoot(item.tabId) || changed
        } else {
          changed = treeStore.attachTab(item.tabId, parentId) || changed
        }
        if (item.collapsed) {
          changed = treeStore.setCollapsed(item.tabId, true) || changed
        }
      }

      if (changed) {
        invalidateDerivedView()
        persistCurrentTree(tabs)
      }
      return changed
    },

    async sync(options) {
      const {
        tabs,
        contextKey,
        currentContextKey,
        activeRegularTabId,
        sourceActiveTabId,
      } = options

      const contextChanged = await ensureContext(contextKey, tabs, currentContextKey)
      let persistenceDirty = false
      let structuralDirty = false

      if (pendingRemovalDirty) {
        persistenceDirty = true
        structuralDirty = true
        pendingRemovalDirty = false
      }

      if (treeStore.repair(tabs.map(tab => tab.id))) {
        persistenceDirty = true
        structuralDirty = true
      }

      const tabsById = new Map(tabs.map(tab => [tab.id, tab]))
      for (const tab of tabs) {
        if (treeStore.hasTab(tab.id)) continue

        treeStore.ensureTab(tab.id)
        persistenceDirty = true
        structuralDirty = true

        const pendingCreation = pendingCreatedTabs.get(tab.id) || null
        if (!pendingCreation) continue

        const expectedCreation = pendingCreation.expectedCreation || null
        let parentId = null

        if (expectedCreation && expectedCreation.kind === 'child' && Number.isFinite(expectedCreation.parentTabId)) {
          parentId = expectedCreation.parentTabId
        } else if (expectedCreation && expectedCreation.kind === 'sibling' && Number.isFinite(expectedCreation.parentTabId)) {
          const siblingAnchorId = expectedCreation.parentTabId
          const siblingParentId = treeStore.getParentId(siblingAnchorId)
          if (Number.isFinite(siblingParentId)) {
            const attached = treeStore.attachAfter(tab.id, siblingAnchorId)
            persistenceDirty = attached || persistenceDirty
            structuralDirty = attached || structuralDirty
          } else {
            const currentTreeState = treeStore.exportState()
            const rootIds = Array.isArray(currentTreeState.rootIds) ? currentTreeState.rootIds : []
            const rootIndex = rootIds.indexOf(siblingAnchorId)
            const moved = treeStore.moveRoot(tab.id, rootIndex === -1 ? undefined : rootIndex + 1)
            persistenceDirty = moved || persistenceDirty
            structuralDirty = moved || structuralDirty
          }
        } else if (expectedCreation && expectedCreation.kind === 'root') {
          treeStore.moveRoot(tab.id)
          persistenceDirty = true
          structuralDirty = true
        } else if (pendingCreation.fromPinnedTab) {
          treeStore.moveRoot(tab.id, 0)
          persistenceDirty = true
          structuralDirty = true
        } else if (!(expectedCreation && expectedCreation.kind === 'root')) {
          const currentTreeState = treeStore.exportState()
          const looksLikeRootStartPage = isStartPageUrl(tab.url || '')
          parentId = resolveNewTabParent({
            newTab: tab,
            activeTab: tabsById.get(pendingCreation.sourceActiveTabId || sourceActiveTabId) || null,
            treeState: currentTreeState,
            openerTabId: pendingCreation.openerTabId != null ? pendingCreation.openerTabId : tab.openerTabId,
            preferRoot: looksLikeRootStartPage,
          })
        }

        if (parentId != null) {
          const attached = treeStore.attachTab(tab.id, parentId)
          persistenceDirty = attached || persistenceDirty
          structuralDirty = attached || structuralDirty
        }

        pendingCreatedTabs.delete(tab.id)
      }

      if (activeRegularTabId != null) {
        persistenceDirty = treeStore.expandAncestors(activeRegularTabId) || persistenceDirty
      }

      if (!contextChanged && !persistenceDirty && !structuralDirty && cachedDerivedView && cachedDerivedView.contextKey === contextKey) {
        const restored = restoreDerivedViewFromCache(tabs)
        if (restored) {
          return {
            treeTabs: restored.treeTabs,
            treeContextKey: contextKey,
            fullTreeOrderIds: restored.fullTreeOrderIds,
            parentById: restored.parentById,
            structuralDirty: false,
          }
        }
      }

      const treeState = treeStore.exportState()
      const treeTabs = buildTreeView({
        tabs,
        treeState,
      }).visibleTabs
      const fullTreeOrderIds = getFullTreeOrderIds({
        tabs,
        treeState,
      })
      const parentById = {}
      const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
      for (const tabId of fullTreeOrderIds) {
        const node = nodesById[tabId]
        if (node && Number.isFinite(node.parentId)) {
          parentById[tabId] = node.parentId
        }
      }

      if (contextChanged || persistenceDirty) {
        persistCurrentTree(tabs)
      }

      cachedDerivedView = createDerivedViewCache(contextKey, tabs, treeTabs, fullTreeOrderIds, parentById)

      return {
        treeTabs,
        treeContextKey: contextKey,
        fullTreeOrderIds,
        parentById,
        structuralDirty,
      }
    },

    async toggleCollapsed(tabId, activeTabId, tabs) {
      const treeState = treeStore.exportState()
      const node = treeState.nodesById && treeState.nodesById[tabId] ? treeState.nodesById[tabId] : null
      const willCollapse = !!(node && !node.collapsed)
      const shouldActivateParent = willCollapse
        && Number.isFinite(activeTabId)
        && activeTabId !== tabId
        && isDescendantOf(activeTabId, tabId, treeState)

      if (!treeStore.toggleCollapsed(tabId)) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return {
        activateTabId: shouldActivateParent ? tabId : null,
      }
    },

    async collapseAll(activeTabId, tabs) {
      const treeState = treeStore.exportState()
      let activateTabId = null

      if (Number.isFinite(activeTabId)) {
        const ancestors = getAncestorIds(activeTabId, treeState)
        const collapsibleAncestors = ancestors.filter(id => {
          const node = treeState.nodesById && treeState.nodesById[id] ? treeState.nodesById[id] : null
          return !!(node && Array.isArray(node.childIds) && node.childIds.length > 0)
        })
        activateTabId = collapsibleAncestors.length ? collapsibleAncestors[collapsibleAncestors.length - 1] : null
      }

      if (!treeStore.collapseAll()) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return { activateTabId }
    },

    async moveTab(tabId, targetId, position, tabs) {
      if (!['before', 'inside', 'after'].includes(position)) return false
      if (!treeStore.hasTab(tabId) || !treeStore.hasTab(targetId)) return false
      if (tabId === targetId) return false

      const treeState = treeStore.exportState()
      if (isDescendantOf(targetId, tabId, treeState)) {
        return false
      }

      let changed = false
      if (position === 'before') {
        changed = treeStore.attachBefore(tabId, targetId)
      } else if (position === 'after') {
        changed = treeStore.attachAfter(tabId, targetId)
      } else {
        changed = treeStore.attachTab(tabId, targetId)
        if (changed) {
          treeStore.setCollapsed(targetId, false)
        }
      }

      if (!changed) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return {
        parentId: treeStore.getParentId(tabId),
      }
    },

    async moveTabs(tabIds, targetId, position, tabs) {
      if (!['before', 'inside', 'after'].includes(position)) return false

      const moveIds = normalizeTopLevelMoveIds(tabIds)
      if (moveIds.length === 0) return false
      if (!treeStore.hasTab(targetId)) return false
      if (moveIds.includes(targetId)) return false

      const treeState = treeStore.exportState()
      for (const tabId of moveIds) {
        if (isDescendantOf(targetId, tabId, treeState)) {
          return false
        }
      }

      const orderedMoveIds = position === 'after'
        ? moveIds.slice().reverse()
        : moveIds.slice()

      let changed = false
      for (const tabId of orderedMoveIds) {
        if (position === 'before') {
          changed = treeStore.attachBefore(tabId, targetId) || changed
          continue
        }

        if (position === 'after') {
          changed = treeStore.attachAfter(tabId, targetId) || changed
          continue
        }

        changed = treeStore.attachTab(tabId, targetId) || changed
      }

      if (position === 'inside' && changed) {
        treeStore.setCollapsed(targetId, false)
      }

      if (!changed) return false
      invalidateDerivedView()
      persistCurrentTree(tabs)
      return {
        movedIds: moveIds,
        parentId: position === 'inside' ? targetId : treeStore.getParentId(moveIds[0]),
      }
    },
  }
}

module.exports = { createTreeController }

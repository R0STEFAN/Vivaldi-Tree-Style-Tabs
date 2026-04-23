const { createTreeController } = require('../controllers/tree-controller.js')
const { createNativeReconcile } = require('../controllers/native-reconcile.js')

const TREE_NAMESPACE_KEY = 'svbTree'

function createTreeNodeId() {
  return `svb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function createInitialState() {
  return {
    ready: false,
    windowId: null,
    activeTabId: null,
    activeWorkspaceId: null,
    filteredByWorkspace: false,
    outsideWorkspace: false,
    canCloseVisibleTabs: true,
    pinnedTabs: [],
    tabs: [],
    treeTabs: [],
    treeContextKey: null,
    workspaces: [],
    savedBookmarkTrees: [],
  }
}

function sortTabs(tabs) {
  return tabs.slice().sort((a, b) => a.index - b.index)
}

function getTilingId(tab) {
  return tab && tab.vivExtData && tab.vivExtData.tiling && tab.vivExtData.tiling.id
    ? String(tab.vivExtData.tiling.id)
    : ''
}

function getTabColorKey(tab) {
  return tab && tab.vivExtData && typeof tab.vivExtData.tabColor === 'string'
    ? tab.vivExtData.tabColor
    : ''
}

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item)).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

function getVivExtDataSignature(tab) {
  const vivExtData = tab && tab.vivExtData && typeof tab.vivExtData === 'object'
    ? tab.vivExtData
    : null
  return vivExtData ? stableSerialize(vivExtData) : ''
}

function areTabsEquivalent(previousTabs, nextTabs) {
  const previous = Array.isArray(previousTabs) ? previousTabs : []
  const next = Array.isArray(nextTabs) ? nextTabs : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (left.id !== right.id) return false
    if (left.index !== right.index) return false
    if (!!left.active !== !!right.active) return false
    if (!!left.pinned !== !!right.pinned) return false
    if (!!left.hidden !== !!right.hidden) return false
    if (left.workspaceId !== right.workspaceId) return false
    if (left.title !== right.title) return false
    if (left.url !== right.url) return false
    if (left.favIconUrl !== right.favIconUrl) return false
    if (!!left.loading !== !!right.loading) return false
    if (!!left.muted !== !!right.muted) return false
    if (!!left.audible !== !!right.audible) return false
    if (!!left.discarded !== !!right.discarded) return false
    if (getTilingId(left) !== getTilingId(right)) return false
    if (getTabColorKey(left) !== getTabColorKey(right)) return false
    if (getVivExtDataSignature(left) !== getVivExtDataSignature(right)) return false
  }

  return true
}

function areAncestorListsEqual(previousAncestors, nextAncestors) {
  const previous = Array.isArray(previousAncestors) ? previousAncestors : []
  const next = Array.isArray(nextAncestors) ? nextAncestors : []
  if (previous.length !== next.length) return false
  for (let index = 0; index < next.length; index += 1) {
    if (previous[index] !== next[index]) return false
  }
  return true
}

function areTreeTabsEquivalent(previousTreeTabs, nextTreeTabs) {
  const previous = Array.isArray(previousTreeTabs) ? previousTreeTabs : []
  const next = Array.isArray(nextTreeTabs) ? nextTreeTabs : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (left.id !== right.id) return false
    if (left.depth !== right.depth) return false
    if (left.visibleIndex !== right.visibleIndex) return false
    if ((left.parentId ?? null) !== (right.parentId ?? null)) return false
    if (!!left.hasChildren !== !!right.hasChildren) return false
    if (!!left.collapsed !== !!right.collapsed) return false
    if ((left.childCount || 0) !== (right.childCount || 0)) return false
    if ((left.subtreeSize || 1) !== (right.subtreeSize || 1)) return false
    if ((left.visibleBranchSize || 1) !== (right.visibleBranchSize || 1)) return false
    if (!areAncestorListsEqual(left.ancestorIds, right.ancestorIds)) return false
    if (!areTabsEquivalent([left.tab], [right.tab])) return false
  }

  return true
}

function areWorkspacesEquivalent(previousWorkspaces, nextWorkspaces) {
  const previous = Array.isArray(previousWorkspaces) ? previousWorkspaces : []
  const next = Array.isArray(nextWorkspaces) ? nextWorkspaces : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (Number(left.id) !== Number(right.id)) return false
    if (String(left.name || '') !== String(right.name || '')) return false
    if (String(left.icon || '') !== String(right.icon || '')) return false
  }

  return true
}

function areSavedBookmarkTreesEquivalent(previousTrees, nextTrees) {
  const previous = Array.isArray(previousTrees) ? previousTrees : []
  const next = Array.isArray(nextTrees) ? nextTrees : []
  if (previous.length !== next.length) return false

  for (let index = 0; index < next.length; index += 1) {
    const left = previous[index]
    const right = next[index]
    if (!left || !right) return false
    if (String(left.id) !== String(right.id)) return false
    if (String(left.title || '') !== String(right.title || '')) return false
  }

  return true
}

function stabilizeTabsByPanelOrder(tabs, treeTabs) {
  const items = Array.isArray(tabs) ? tabs.slice() : []
  const previousOrder = new Map(
    (Array.isArray(treeTabs) ? treeTabs : []).map((item, index) => [item.id, index])
  )

  return items.sort((left, right) => {
    const leftOrder = previousOrder.has(left.id) ? previousOrder.get(left.id) : null
    const rightOrder = previousOrder.has(right.id) ? previousOrder.get(right.id) : null

    if (leftOrder != null || rightOrder != null) {
      if (leftOrder == null) return 1
      if (rightOrder == null) return -1
      if (leftOrder !== rightOrder) return leftOrder - rightOrder
    }

    return left.index - right.index
  })
}

function reuseEquivalentStateSlices(currentState, patch) {
  const nextPatch = { ...patch }

  if ('pinnedTabs' in nextPatch && areTabsEquivalent(currentState.pinnedTabs, nextPatch.pinnedTabs)) {
    nextPatch.pinnedTabs = currentState.pinnedTabs
  }

  if ('tabs' in nextPatch && areTabsEquivalent(currentState.tabs, nextPatch.tabs)) {
    nextPatch.tabs = currentState.tabs
  }

  if ('treeTabs' in nextPatch && areTreeTabsEquivalent(currentState.treeTabs, nextPatch.treeTabs)) {
    nextPatch.treeTabs = currentState.treeTabs
  }

  if ('workspaces' in nextPatch && areWorkspacesEquivalent(currentState.workspaces, nextPatch.workspaces)) {
    nextPatch.workspaces = currentState.workspaces
  }

  if ('savedBookmarkTrees' in nextPatch && areSavedBookmarkTreesEquivalent(currentState.savedBookmarkTrees, nextPatch.savedBookmarkTrees)) {
    nextPatch.savedBookmarkTrees = currentState.savedBookmarkTrees
  }

  return nextPatch
}

function tabHasWorkspace(tab) {
  return tab && tab.workspaceId != null
}

function deriveContextFromActiveTab(allTabs) {
  const activeTab = allTabs.find(tab => tab.active) || null
  const hasWorkspaceTabs = allTabs.some(tab => tab.workspaceId != null)
  const visibleTabs = allTabs.filter(tab => !tab.hidden)

  if (visibleTabs.length > 0 && hasWorkspaceTabs) {
    const visibleWorkspaceIds = Array.from(new Set(
      visibleTabs.map(tab => (tabHasWorkspace(tab) ? tab.workspaceId : null))
    ))

    if (visibleWorkspaceIds.length === 1) {
      const visibleWorkspaceId = visibleWorkspaceIds[0]
      const visibleActiveTab = visibleTabs.find(tab => tab.active) || visibleTabs[0] || activeTab

      return {
        activeTab: visibleActiveTab || null,
        activeWorkspaceId: visibleWorkspaceId,
        outsideWorkspace: visibleWorkspaceId == null,
        filteredByWorkspace: true,
        visibleTabs,
      }
    }
  }

  const activeWorkspaceId = activeTab && tabHasWorkspace(activeTab) ? activeTab.workspaceId : null
  const outsideWorkspace = activeWorkspaceId == null && hasWorkspaceTabs

  return {
    activeTab,
    activeWorkspaceId,
    outsideWorkspace,
    filteredByWorkspace: activeWorkspaceId != null || outsideWorkspace,
    visibleTabs: null,
  }
}

function getVisibleTabsForContext(allTabs, context) {
  if (context.outsideWorkspace) {
    return allTabs.filter(tab => tab.workspaceId == null)
  }

  if (context.activeWorkspaceId == null) {
    return allTabs
  }

  return allTabs.filter(tab => tab.workspaceId === context.activeWorkspaceId)
}

function isTabInContext(tab, context) {
  if (!tab) return false

  if (context.outsideWorkspace) {
    return tab.workspaceId == null
  }

  if (context.activeWorkspaceId == null) {
    return true
  }

  return tab.workspaceId === context.activeWorkspaceId
}

function getCreateVivExtDataForState(state) {
  if (!state.filteredByWorkspace || state.outsideWorkspace) {
    return null
  }

  if (state.activeWorkspaceId == null) {
    return null
  }

  return {
    workspaceId: state.activeWorkspaceId,
  }
}

function getCreateVivExtDataForChild(state, parentTabId) {
  const base = getCreateVivExtDataForState(state)
  const allTabs = state.pinnedTabs.concat(state.tabs)
  const parentTab = allTabs.find(tab => tab.id === parentTabId) || null
  const parentVivExtData = parentTab && parentTab.vivExtData && typeof parentTab.vivExtData === 'object'
    ? parentTab.vivExtData
    : null

  if (parentVivExtData && typeof parentVivExtData.group !== 'undefined' && parentVivExtData.group != null) {
    return {
      ...(base || {}),
      group: parentVivExtData.group,
    }
  }

  return base
}

function normalizeUniqueIds(values) {
  const seen = new Set()
  const result = []
  for (const value of Array.isArray(values) ? values : []) {
    const tabId = Number(value)
    if (!Number.isFinite(tabId) || seen.has(tabId)) continue
    seen.add(tabId)
    result.push(tabId)
  }
  return result
}

function normalizeTabColor(colorKey) {
  const value = typeof colorKey === 'string' ? colorKey.trim().toLowerCase() : ''
  const allowed = new Set(['rose', 'amber', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'])
  return allowed.has(value) ? value : ''
}

function createTabStore(api) {
  let state = createInitialState()
  let unsubs = []
  const listeners = new Set()
  const treeController = createTreeController(api)
  const nativeReconcile = createNativeReconcile(api)
  let contextLock = null
  let pendingActiveRepairTabId = null
  let pendingNativeReconcileReason = null
  let bookmarkSyncTimer = null
  let scheduledSyncTimer = null
  let scheduledSyncOptions = null
  let scheduledSyncReason = null
  let scheduledSyncPromise = null
  let scheduledSyncResolve = null
  let scheduledSyncReject = null
  const reconciledContextKeys = new Set()
  const pendingDeletedBookmarkTreeIds = new Set()

  function mergeSyncOptions(currentOptions, nextOptions) {
    const base = currentOptions ? { ...currentOptions } : {}
    if (!nextOptions || typeof nextOptions !== 'object') return base

    if ('preserveContext' in nextOptions) {
      if ('preserveContext' in base) {
        base.preserveContext = !!(base.preserveContext && nextOptions.preserveContext)
      } else {
        base.preserveContext = !!nextOptions.preserveContext
      }
    }

    if (Number.isFinite(nextOptions.activeRegularTabIdOverride)) {
      base.activeRegularTabIdOverride = nextOptions.activeRegularTabIdOverride
    }

    return base
  }

  function finalizeScheduledSync(error) {
    const reject = scheduledSyncReject
    const resolve = scheduledSyncResolve
    scheduledSyncPromise = null
    scheduledSyncResolve = null
    scheduledSyncReject = null
    if (error) {
      if (reject) reject(error)
      return
    }
    if (resolve) resolve()
  }

  function scheduleSync(options = {}, reason = 'event', delay = 0) {
    scheduledSyncOptions = mergeSyncOptions(scheduledSyncOptions, options)
    scheduledSyncReason = reason || scheduledSyncReason || 'event'

    if (!scheduledSyncPromise) {
      scheduledSyncPromise = new Promise((resolve, reject) => {
        scheduledSyncResolve = resolve
        scheduledSyncReject = reject
      })
    }

    if (scheduledSyncTimer) {
      clearTimeout(scheduledSyncTimer)
    }

    scheduledSyncTimer = setTimeout(() => {
      scheduledSyncTimer = null
      const nextOptions = scheduledSyncOptions || {}
      const nextReason = scheduledSyncReason || 'event'
      scheduledSyncOptions = null
      scheduledSyncReason = null
      syncTabs(nextOptions, nextReason)
        .then(() => finalizeScheduledSync(null))
        .catch(error => finalizeScheduledSync(error))
    }, Math.max(0, delay))

    return scheduledSyncPromise
  }

  function emit() {
    for (const listener of listeners) listener(state)
  }

  function setState(patch) {
    const nextPatch = reuseEquivalentStateSlices(state, patch)
    const nextState = { ...state, ...nextPatch }
    if (
      nextState.ready === state.ready
      && nextState.windowId === state.windowId
      && nextState.activeTabId === state.activeTabId
      && nextState.activeWorkspaceId === state.activeWorkspaceId
      && nextState.filteredByWorkspace === state.filteredByWorkspace
      && nextState.outsideWorkspace === state.outsideWorkspace
      && nextState.canCloseVisibleTabs === state.canCloseVisibleTabs
      && nextState.pinnedTabs === state.pinnedTabs
      && nextState.tabs === state.tabs
      && nextState.treeTabs === state.treeTabs
      && nextState.treeContextKey === state.treeContextKey
      && nextState.workspaces === state.workspaces
      && nextState.savedBookmarkTrees === state.savedBookmarkTrees
    ) {
      return false
    }
    state = nextState
    emit()
    return true
  }

  function createContextSnapshot() {
    return {
      activeWorkspaceId: state.activeWorkspaceId,
      outsideWorkspace: state.outsideWorkspace,
      filteredByWorkspace: state.filteredByWorkspace,
    }
  }

  function isSameContext(a, b) {
    return !!a
      && !!b
      && a.activeWorkspaceId === b.activeWorkspaceId
      && a.outsideWorkspace === b.outsideWorkspace
      && a.filteredByWorkspace === b.filteredByWorkspace
  }

  function lockCurrentContext() {
    if (!state.filteredByWorkspace) return
    contextLock = {
      context: createContextSnapshot(),
      expiresAt: Date.now() + 800,
    }
  }

  function getLockedContext() {
    if (!contextLock) return null
    if (Date.now() > contextLock.expiresAt) {
      contextLock = null
      return null
    }
    return contextLock.context
  }

  function releaseContextLock() {
    contextLock = null
  }

  function getPanelOrderIds() {
    return state.pinnedTabs.map(tab => tab.id).concat(state.treeTabs.map(item => item.id))
  }

  function getAllVisibleTabs() {
    return state.pinnedTabs.concat(state.tabs)
  }

  function getActionTargetIds(tabId, selectedIds) {
    const targetId = Number(tabId)
    if (!Number.isFinite(targetId)) return []
    const visibleIds = new Set(getPanelOrderIds())
    const normalizedSelectedIds = normalizeUniqueIds(selectedIds).filter(id => visibleIds.has(id))
    if (normalizedSelectedIds.includes(targetId) && normalizedSelectedIds.length > 1) {
      return normalizedSelectedIds
    }
    return [targetId]
  }

  function getTreeActionTargetIds(tabId, selectedIds) {
    return treeController.getSubtreeTargetIds(getActionTargetIds(tabId, selectedIds))
  }

  function getTabById(tabId) {
    return getAllVisibleTabs().find(tab => tab.id === tabId) || null
  }

  function getActivationTargetBeforeClose(targetIds) {
    const activeTabId = state.activeTabId
    if (!Number.isFinite(activeTabId)) return null

    const closeIds = new Set(normalizeUniqueIds(targetIds))
    if (!closeIds.has(activeTabId)) return null

    const orderIds = getPanelOrderIds()
    const activeIndex = orderIds.indexOf(activeTabId)
    if (activeIndex < 0) return null

    for (let index = activeIndex - 1; index >= 0; index -= 1) {
      if (!closeIds.has(orderIds[index])) return orderIds[index]
    }

    for (let index = activeIndex + 1; index < orderIds.length; index += 1) {
      if (!closeIds.has(orderIds[index])) return orderIds[index]
    }

    return null
  }

  function activateBeforeCloseIfNeeded(targetIds) {
    const activateTabId = getActivationTargetBeforeClose(targetIds)
    if (!Number.isFinite(activateTabId)) return
    pendingActiveRepairTabId = null
    api.activateTab(activateTabId)
  }

  function closeTabIds(tabIds) {
    const targetIds = normalizeUniqueIds(tabIds)
    if (targetIds.length === 0) return
    const visibleIds = getPanelOrderIds()
    if (visibleIds.length <= 1) return
    const visibleTargetIds = targetIds.filter(tabId => visibleIds.includes(tabId))
    if (visibleTargetIds.length === 0) return
    if (visibleTargetIds.length >= visibleIds.length) return

    pendingNativeReconcileReason = 'close'
    lockCurrentContext()
    activateBeforeCloseIfNeeded(visibleTargetIds)
    if (visibleTargetIds.length === 1) {
      api.closeTab(visibleTargetIds[0])
      return
    }
    api.closeTabs(visibleTargetIds)
  }

  async function updateTabs(tabIds, properties) {
    const targetIds = normalizeUniqueIds(tabIds)
    await Promise.all(targetIds.map(tabId => api.updateTab(tabId, properties)))
    await syncTabs({ preserveContext: true })
  }

  async function updateVivExtDataForTabs(tabIds, buildVivExtData) {
    const targetIds = normalizeUniqueIds(tabIds)
    if (targetIds.length === 0 || !api.updateVivExtData) return

    const tabsById = new Map(getAllVisibleTabs().map(tab => [tab.id, tab]))
    const tasks = []

    for (const tabId of targetIds) {
      const tab = tabsById.get(tabId)
      if (!tab) continue
      const nextData = buildVivExtData(tab)
      tasks.push(api.updateVivExtData(tabId, nextData))
    }

    await Promise.all(tasks)
    await syncTabs({ preserveContext: true })
  }

  async function moveTabsToWorkspace(tabIds, workspaceId) {
    const targetIds = normalizeUniqueIds(tabIds)
    if (targetIds.length === 0) return
    const targetContextKey = `workspace:${workspaceId}`
    const movedIdSet = new Set(targetIds)
    const moveRecords = treeController.getWorkspaceMoveRecords(targetIds)
    const moveRecordById = new Map(moveRecords.map(record => [record.tabId, record]))
    const visibleTabsById = new Map(getAllVisibleTabs().map(tab => [tab.id, tab]))
    const nodeIdByTabId = new Map()

    for (const tabId of targetIds) {
      const tab = visibleTabsById.get(tabId)
      const record = tab
        && tab.vivExtData
        && tab.vivExtData[TREE_NAMESPACE_KEY]
        && typeof tab.vivExtData[TREE_NAMESPACE_KEY] === 'object'
        ? tab.vivExtData[TREE_NAMESPACE_KEY]
        : null
      nodeIdByTabId.set(tabId, typeof record?.nodeId === 'string' && record.nodeId ? record.nodeId : createTreeNodeId())
    }

    let targetRootStartOrder = 0
    try {
      const allTabs = await api.getTabs(state.windowId)
      const targetRootOrders = allTabs
        .filter(tab => !movedIdSet.has(tab.id) && tab.workspaceId === workspaceId)
        .map(tab => {
          const record = tab
            && tab.vivExtData
            && tab.vivExtData[TREE_NAMESPACE_KEY]
            && typeof tab.vivExtData[TREE_NAMESPACE_KEY] === 'object'
            ? tab.vivExtData[TREE_NAMESPACE_KEY]
            : null
          return record && record.contextKey === targetContextKey && record.parentNodeId == null
            ? Number(record.order)
            : null
        })
        .filter(Number.isFinite)
      targetRootStartOrder = targetRootOrders.length ? Math.max(...targetRootOrders) + 1 : allTabs.filter(tab => tab.workspaceId === workspaceId).length
    } catch (error) {
      console.warn('[svb] cannot inspect target workspace order', error)
    }

    pendingNativeReconcileReason = 'move-workspace'
    await updateVivExtDataForTabs(targetIds, tab => {
      const previousData = tab && tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}
      const previousTreeData = previousData[TREE_NAMESPACE_KEY] && typeof previousData[TREE_NAMESPACE_KEY] === 'object'
        ? previousData[TREE_NAMESPACE_KEY]
        : null
      const moveRecord = moveRecordById.get(tab.id) || null
      const parentNodeId = moveRecord && Number.isFinite(moveRecord.parentId)
        ? nodeIdByTabId.get(moveRecord.parentId) || null
        : null
      const order = moveRecord
        ? (parentNodeId == null ? targetRootStartOrder + moveRecord.rootIndex : moveRecord.siblingIndex)
        : (previousTreeData && Number.isFinite(Number(previousTreeData.order)) ? Number(previousTreeData.order) : targetRootStartOrder)
      const nextData = {
        ...previousData,
        workspaceId,
      }
      nextData[TREE_NAMESPACE_KEY] = {
        ...(previousTreeData || {}),
        version: (previousTreeData && Number(previousTreeData.version)) || 1,
        contextKey: targetContextKey,
        nodeId: nodeIdByTabId.get(tab.id) || createTreeNodeId(),
        parentNodeId,
        collapsed: !!(previousTreeData && previousTreeData.collapsed),
        order,
      }
      return nextData
    })
  }

  async function syncTabs(options = {}, reason = 'direct') {
    if (state.windowId == null) return

    const { preserveContext = false, activeRegularTabIdOverride = undefined } = options
    const allTabs = sortTabs(await api.getTabs(state.windowId))
    let workspaces = []
    let savedBookmarkTrees = state.savedBookmarkTrees
    if (api.getWorkspaces) {
      try {
        workspaces = await api.getWorkspaces()
      } catch (error) {
        console.warn('[svb] cannot read workspaces', error)
      }
    }
    if (api.getSavedBookmarkTrees) {
      try {
        savedBookmarkTrees = await api.getSavedBookmarkTrees()
      } catch (error) {
        console.warn('[svb] cannot read saved bookmark trees', error)
      }
    }
    if (pendingDeletedBookmarkTreeIds.size > 0) {
      const returnedIds = new Set(
        (Array.isArray(savedBookmarkTrees) ? savedBookmarkTrees : []).map(tree => String(tree.id))
      )
      for (const deletedId of Array.from(pendingDeletedBookmarkTreeIds)) {
        if (!returnedIds.has(deletedId)) pendingDeletedBookmarkTreeIds.delete(deletedId)
      }
      savedBookmarkTrees = (Array.isArray(savedBookmarkTrees) ? savedBookmarkTrees : [])
        .filter(tree => !pendingDeletedBookmarkTreeIds.has(String(tree.id)))
    }
    treeController.clearStalePendingCreations(allTabs)

    const derivedContext = deriveContextFromActiveTab(allTabs)
    let nextContext = derivedContext

    const lockedContext = getLockedContext()
    const shouldPreserveContext = preserveContext || !!lockedContext

    if (shouldPreserveContext && state.filteredByWorkspace) {
      const preservedContext = lockedContext || createContextSnapshot()
      const preservedTabs = getVisibleTabsForContext(allTabs, preservedContext)

      if (preservedTabs.length > 0) {
        nextContext = preservedContext
      }
    }

    const activeTab = derivedContext.activeTab
    const visibleTabs = !shouldPreserveContext && Array.isArray(derivedContext.visibleTabs)
      ? derivedContext.visibleTabs
      : getVisibleTabsForContext(allTabs, nextContext)
    const pinnedTabs = visibleTabs.filter(tab => tab.pinned)
    const tabs = stabilizeTabsByPanelOrder(
      visibleTabs.filter(tab => !tab.pinned),
      state.treeTabs
    )
    const canCloseVisibleTabs = visibleTabs.length > 1
    const contextKey = treeController.makeContextKey({
      windowId: state.windowId,
      activeWorkspaceId: nextContext.activeWorkspaceId,
      outsideWorkspace: nextContext.outsideWorkspace,
    })

    const activeVisibleTab = visibleTabs.find(tab => tab.active) || null
    const previousVisibleActiveTab = Number.isFinite(state.activeTabId)
      ? visibleTabs.find(tab => tab.id === state.activeTabId) || null
      : null
    const fallbackVisibleTab = visibleTabs[0] || null
    const derivedActiveRegularTabId = activeVisibleTab && !activeVisibleTab.pinned
      ? activeVisibleTab.id
      : fallbackVisibleTab && !fallbackVisibleTab.pinned
        ? fallbackVisibleTab.id
        : null
    const activeRegularTabId = Number.isFinite(activeRegularTabIdOverride)
      ? activeRegularTabIdOverride
      : derivedActiveRegularTabId

    if (lockedContext && isSameContext(nextContext, derivedContext)) {
      releaseContextLock()
    }

    const shouldRepairVisibleActivation = nextContext.filteredByWorkspace
      && visibleTabs.length > 0
      && !activeVisibleTab
      && (!activeTab || !isTabInContext(activeTab, nextContext) || activeTab.hidden)

    if (shouldRepairVisibleActivation && fallbackVisibleTab && pendingActiveRepairTabId !== fallbackVisibleTab.id) {
      pendingActiveRepairTabId = fallbackVisibleTab.id
      api.activateTab(fallbackVisibleTab.id)
    } else if (activeVisibleTab && pendingActiveRepairTabId === activeVisibleTab.id) {
      pendingActiveRepairTabId = null
    } else if (!shouldRepairVisibleActivation && activeTab && pendingActiveRepairTabId === activeTab.id) {
      pendingActiveRepairTabId = null
    }

    const treeResult = await treeController.sync({
      tabs,
      contextKey,
      currentContextKey: state.treeContextKey,
      activeRegularTabId,
      sourceActiveTabId: state.activeTabId,
    })

    nativeReconcile.updateSnapshot({
      contextKey: treeResult.treeContextKey,
      tabs,
      fullTreeOrderIds: treeResult.fullTreeOrderIds,
      parentById: treeResult.parentById,
    })

    const shouldScheduleStartupReconcile = !!treeResult.treeContextKey
      && !reconciledContextKeys.has(treeResult.treeContextKey)
    if (shouldScheduleStartupReconcile) {
      reconciledContextKeys.add(treeResult.treeContextKey)
    }

    const actionReconcileReason = pendingNativeReconcileReason
      || (treeResult.structuralDirty && !shouldScheduleStartupReconcile ? 'tree-structural' : null)
    pendingNativeReconcileReason = null

    setState({
      ready: true,
      pinnedTabs,
      tabs,
      treeTabs: treeResult.treeTabs,
      treeContextKey: treeResult.treeContextKey,
      workspaces,
      savedBookmarkTrees,
      activeTabId: activeVisibleTab
        ? activeVisibleTab.id
        : previousVisibleActiveTab
          ? previousVisibleActiveTab.id
          : (fallbackVisibleTab ? fallbackVisibleTab.id : (activeTab ? activeTab.id : null)),
      activeWorkspaceId: nextContext.activeWorkspaceId,
      filteredByWorkspace: nextContext.filteredByWorkspace,
      outsideWorkspace: nextContext.outsideWorkspace,
      canCloseVisibleTabs,
    })

    if (actionReconcileReason) {
      nativeReconcile.scheduleAfterAction(actionReconcileReason)
      return
    }

    if (shouldScheduleStartupReconcile) {
      nativeReconcile.scheduleStartup()
    }

  }

  function resetListeners() {
    for (const unsub of unsubs) unsub()
    unsubs = []
    if (bookmarkSyncTimer) {
      clearTimeout(bookmarkSyncTimer)
      bookmarkSyncTimer = null
    }
    if (scheduledSyncTimer) {
      clearTimeout(scheduledSyncTimer)
      scheduledSyncTimer = null
    }
    scheduledSyncOptions = null
    scheduledSyncReason = null
    finalizeScheduledSync(null)
  }

  function bindEvents() {
    resetListeners()

    const refreshPreservingContext = (...args) => {
      void args
      scheduleSync({ preserveContext: true }, 'event-preserve', 12).catch(error => console.error('[svb] sync failed', error))
    }

    const handleUpdated = (tabId, changeInfo, tab) => {
      void tab
      if (api.isOwnVivExtUpdate && api.isOwnVivExtUpdate(tabId, changeInfo)) {
        return
      }
      if (nativeReconcile.isOwnOpenerUpdate(tabId, changeInfo)) {
        return
      }
      refreshPreservingContext(tabId, changeInfo)
    }

    const refreshFromActiveTab = (...args) => {
      void args
      scheduleSync({ preserveContext: false }, 'event-active', 0).catch(error => console.error('[svb] sync failed', error))
    }

    const refreshBookmarks = () => {
      if (bookmarkSyncTimer) clearTimeout(bookmarkSyncTimer)
      bookmarkSyncTimer = setTimeout(() => {
        bookmarkSyncTimer = null
        scheduleSync({ preserveContext: true }, 'bookmark', 0).catch(error => console.error('[svb] bookmark sync failed', error))
      }, 120)
    }

    const handleCreated = tab => {
      const pinnedIds = new Set(state.pinnedTabs.map(pinnedTab => pinnedTab.id))
      treeController.capturePendingCreation(tab, state.activeTabId, {
        fromPinnedTab: pinnedIds.has(state.activeTabId) || pinnedIds.has(tab.openerTabId),
      })
      refreshPreservingContext(tab)
    }

    const handleRemoved = tabId => {
      treeController.handleRemovedTab(tabId)
      refreshPreservingContext(tabId)
    }

      unsubs = [
        api.onCreated(handleCreated),
        api.onUpdated(handleUpdated),
        api.onRemoved(handleRemoved),
        api.onMoved((tabId, moveInfo) => {
          void moveInfo
          nativeReconcile.isOwnMove(tabId)
          refreshPreservingContext(tabId, moveInfo)
        }),
      api.onAttached(refreshPreservingContext),
      api.onDetached(refreshPreservingContext),
      api.onActivated(refreshFromActiveTab),
      api.onBookmarksChanged ? api.onBookmarksChanged(refreshBookmarks) : () => {},
    ]
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      listener(state)
      return () => listeners.delete(listener)
    },

    async init() {
      const windowId = await api.getCurrentWindowId()
      state = { ...state, windowId }
      bindEvents()
      await syncTabs({}, 'init')
    },

    async reload() {
      await syncTabs({ preserveContext: true }, 'reload')
    },

    dispose() {
      resetListeners()
      listeners.clear()
      releaseContextLock()
    },

    activateTab(tabId) {
      releaseContextLock()
      pendingActiveRepairTabId = null
      api.activateTab(tabId)
    },

    closeTab(tabId) {
      if (!state.canCloseVisibleTabs) return
      const closeTargetIds = treeController.getCloseTargetIds(tabId)
      if (closeTargetIds.length === 0) return
      pendingNativeReconcileReason = 'close'
      lockCurrentContext()
      activateBeforeCloseIfNeeded(closeTargetIds)
      if (closeTargetIds.length === 1) {
        api.closeTab(closeTargetIds[0])
        return
      }
      api.closeTabs(closeTargetIds)
    },

    closeTabIds,

    createTab() {
      if (state.windowId == null) return
      treeController.registerExpectedCreation({ kind: 'root' })
      pendingNativeReconcileReason = 'create-root'
      api.createTab(state.windowId, {
        vivExtData: getCreateVivExtDataForState(state),
      })
    },

    createChildTab(parentTabId) {
      if (state.windowId == null) return
      if (!Number.isFinite(parentTabId)) return
      treeController.registerExpectedCreation({
        kind: 'child',
        parentTabId,
      })
      const index = treeController.getCreateChildIndex(parentTabId, state.tabs)
      pendingNativeReconcileReason = 'create-child'
      api.createChildTab(state.windowId, parentTabId, {
        index,
        vivExtData: getCreateVivExtDataForChild(state, parentTabId),
      })
    },

    createSiblingTab(tabId) {
      if (state.windowId == null) return
      if (!Number.isFinite(tabId)) return
      treeController.registerExpectedCreation({
        kind: 'sibling',
        parentTabId: tabId,
      })
      const index = treeController.getCreateSiblingIndex(tabId, state.tabs)
      pendingNativeReconcileReason = 'create-sibling'
      api.createChildTab(state.windowId, tabId, {
        index,
        vivExtData: getCreateVivExtDataForState(state),
      })
    },

    async toggleCollapsed(tabId) {
      const result = await treeController.toggleCollapsed(tabId, state.activeTabId, state.tabs)
      if (!result) return
      if (Number.isFinite(result.activateTabId)) {
        releaseContextLock()
        pendingActiveRepairTabId = null
        api.activateTab(result.activateTabId)
      }
      await syncTabs({ preserveContext: true }, 'toggle-collapsed')
    },

    async collapseAll() {
      const result = await treeController.collapseAll(state.activeTabId, state.tabs)
      if (!result) return
      if (Number.isFinite(result.activateTabId)) {
        releaseContextLock()
        pendingActiveRepairTabId = null
        api.activateTab(result.activateTabId)
      }
      await syncTabs({
        preserveContext: true,
        activeRegularTabIdOverride: Number.isFinite(result.activateTabId) ? result.activateTabId : undefined,
      }, 'collapse-all')
    },

    async moveTreeTab(tabId, targetId, position) {
      if (!await treeController.moveTab(tabId, targetId, position, state.tabs)) return false
      pendingNativeReconcileReason = 'move-tree-tab'
      await syncTabs({ preserveContext: true }, 'move-tree-tab')
      return true
    },

    async moveTreeTabs(tabIds, targetId, position) {
      if (!await treeController.moveTabs(tabIds, targetId, position, state.tabs)) return false
      pendingNativeReconcileReason = 'move-tree-tabs'
      await syncTabs({ preserveContext: true }, 'move-tree-tabs')
      return true
    },

    restoreLastClosedTab() {
      if (!api.restoreLastClosedTab) return
      api.restoreLastClosedTab().catch(error => console.error('[svb] cannot restore tab', error))
    },

    async moveSelectionToNewWindow(tabId, selectedIds) {
      const targetIds = getTreeActionTargetIds(tabId, selectedIds)
      if (targetIds.length === 0 || !api.moveTabsToNewWindow) return
      const moveRecords = treeController.getWorkspaceMoveRecords(targetIds)
      const moveRecordById = new Map(moveRecords.map(record => [record.tabId, record]))
      const visibleTabsById = new Map(getAllVisibleTabs().map(tab => [tab.id, tab]))
      const nodeIdByTabId = new Map()
      const detachedContextKey = `detached:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`

      for (const targetId of targetIds) {
        const tab = visibleTabsById.get(targetId)
        const record = tab
          && tab.vivExtData
          && tab.vivExtData[TREE_NAMESPACE_KEY]
          && typeof tab.vivExtData[TREE_NAMESPACE_KEY] === 'object'
          ? tab.vivExtData[TREE_NAMESPACE_KEY]
          : null
        nodeIdByTabId.set(targetId, typeof record?.nodeId === 'string' && record.nodeId ? record.nodeId : createTreeNodeId())
      }

      await updateVivExtDataForTabs(targetIds, tab => {
        const previousData = tab && tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}
        const previousTreeData = previousData[TREE_NAMESPACE_KEY] && typeof previousData[TREE_NAMESPACE_KEY] === 'object'
          ? previousData[TREE_NAMESPACE_KEY]
          : null
        const moveRecord = moveRecordById.get(tab.id) || null
        const parentNodeId = moveRecord && Number.isFinite(moveRecord.parentId)
          ? nodeIdByTabId.get(moveRecord.parentId) || null
          : null
        const order = moveRecord
          ? (parentNodeId == null ? moveRecord.rootIndex : moveRecord.siblingIndex)
          : (previousTreeData && Number.isFinite(Number(previousTreeData.order)) ? Number(previousTreeData.order) : 0)

        return {
          ...previousData,
          [TREE_NAMESPACE_KEY]: {
            ...(previousTreeData || {}),
            version: (previousTreeData && Number(previousTreeData.version)) || 1,
            contextKey: detachedContextKey,
            nodeId: nodeIdByTabId.get(tab.id) || createTreeNodeId(),
            parentNodeId,
            collapsed: !!(previousTreeData && previousTreeData.collapsed),
            order,
          },
        }
      })

      await api.moveTabsToNewWindow(targetIds)
      await syncTabs({ preserveContext: true })
    },

    async moveSelectionToWorkspace(tabId, selectedIds, workspaceId) {
      if (!Number.isFinite(workspaceId)) return
      await moveTabsToWorkspace(getTreeActionTargetIds(tabId, selectedIds), workspaceId)
    },

    async createWorkspaceAndMoveSelection(tabId, selectedIds) {
      if (!api.createWorkspace) return
      const workspace = await api.createWorkspace('New Workspace')
      const workspaceId = workspace && Number(workspace.id)
      if (!Number.isFinite(workspaceId)) return
      await moveTabsToWorkspace(getTreeActionTargetIds(tabId, selectedIds), workspaceId)
      if (api.repairWorkspace) {
        api.repairWorkspace(workspace)
      }
    },

    async togglePinnedForSelection(tabId, selectedIds) {
      const targetIds = getActionTargetIds(tabId, selectedIds)
      const tab = getTabById(tabId)
      await updateTabs(targetIds, { pinned: !(tab && tab.pinned) })
    },

    async toggleMutedForSelection(tabId, selectedIds) {
      const targetIds = getActionTargetIds(tabId, selectedIds)
      const tab = getTabById(tabId)
      const muted = !(tab && tab.muted)
      await updateTabs(targetIds, { muted })
    },

    async renameTab(tabId, title) {
      if (!Number.isFinite(tabId) || !api.updateVivExtData) return

      const nextTitle = typeof title === 'string' ? title.trim() : ''
      await updateVivExtDataForTabs([tabId], tab => {
        const nextData = {
          ...(tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}),
        }

        if (nextTitle) {
          nextData.fixedTitle = nextTitle
        } else {
          nextData.fixedTitle = null
        }

        return nextData
      })
    },

    async setColorForSelection(tabId, selectedIds, colorKey) {
      const nextColor = normalizeTabColor(colorKey)
      const targetIds = getActionTargetIds(tabId, selectedIds)
      await updateVivExtDataForTabs(targetIds, tab => {
        const nextData = {
          ...(tab.vivExtData && typeof tab.vivExtData === 'object' ? tab.vivExtData : {}),
        }

        if (nextColor) {
          nextData.tabColor = nextColor
        } else {
          nextData.tabColor = null
        }

        return nextData
      })
    },

    async duplicateTab(tabId) {
      if (!api.duplicateTab) return
      const beforeIds = new Set(getAllVisibleTabs().map(tab => tab.id))
      pendingNativeReconcileReason = 'duplicate'
      const duplicatedTab = await api.duplicateTab(tabId)
      let duplicatedTabId = duplicatedTab && Number(duplicatedTab.id)
      await syncTabs({ preserveContext: true })

      if (!Number.isFinite(duplicatedTabId)) {
        const duplicatedVisibleTab = getAllVisibleTabs().find(tab => !beforeIds.has(tab.id) && tab.active)
          || getAllVisibleTabs().find(tab => !beforeIds.has(tab.id))
        duplicatedTabId = duplicatedVisibleTab ? duplicatedVisibleTab.id : null
      }

      if (!Number.isFinite(duplicatedTabId)) return
      if (!state.tabs.some(tab => tab.id === tabId) || !state.tabs.some(tab => tab.id === duplicatedTabId)) return
      if (!await treeController.moveTab(duplicatedTabId, tabId, 'after', state.tabs)) return
      pendingNativeReconcileReason = 'duplicate-position'
      await syncTabs({ preserveContext: true })
    },

    async saveTreeAsBookmark(tabId) {
      if (!api.saveBookmarkTree) return
      const tree = treeController.getBookmarkTree(tabId, state.tabs)
      if (!tree) return
      await api.saveBookmarkTree(tree)
      await syncTabs({ preserveContext: true })
    },

    async openSavedBookmarkTree(bookmarkTreeId) {
      if (state.windowId == null || !api.getSavedBookmarkTree || !api.createRestoredTab) return
      const tree = await api.getSavedBookmarkTree(bookmarkTreeId)
      if (!tree || !tree.url) return

      const baseVivExtData = getCreateVivExtDataForState(state) || {}
      const restoredNodes = []
      let createdCount = 0

      async function createNode(node, parentId) {
        const tab = await api.createRestoredTab(state.windowId, {
          url: node.url,
          active: createdCount === 0,
          vivExtData: {
            ...baseVivExtData,
            fixedTitle: node.title,
          },
        })
        const tabId = tab && Number(tab.id)
        if (!Number.isFinite(tabId)) return null

        createdCount += 1
        restoredNodes.push({
          tabId,
          parentId: Number.isFinite(parentId) ? parentId : null,
          collapsed: !!node.collapsed,
        })

        for (const child of Array.isArray(node.children) ? node.children : []) {
          await createNode(child, tabId)
        }

        return tabId
      }

      await createNode(tree, null)
      if (restoredNodes.length === 0) return

      await syncTabs({ preserveContext: true })
      if (treeController.restoreBookmarkTree(restoredNodes, state.tabs)) {
        pendingNativeReconcileReason = 'restore-bookmark-tree'
      }
      await syncTabs({ preserveContext: true })
    },

    async deleteSavedBookmarkTree(bookmarkTreeId) {
      if (!api.deleteSavedBookmarkTree) return
      const id = bookmarkTreeId == null ? '' : String(bookmarkTreeId)
      if (!id) return

      pendingDeletedBookmarkTreeIds.add(id)
      setState({
        savedBookmarkTrees: state.savedBookmarkTrees.filter(tree => String(tree.id) !== id),
      })

      try {
        await api.deleteSavedBookmarkTree(id)
        await syncTabs({ preserveContext: true })
      } catch (error) {
        pendingDeletedBookmarkTreeIds.delete(id)
        await syncTabs({ preserveContext: true })
        throw error
      }
    },

    closeSelection(tabId, selectedIds) {
      const targetIds = getActionTargetIds(tabId, selectedIds)
      const expandedTargetIds = []
      for (const targetId of targetIds) {
        const closeIds = treeController.getCloseTargetIds(targetId)
        expandedTargetIds.push(...(closeIds.length ? closeIds : [targetId]))
      }
      closeTabIds(expandedTargetIds)
    },

    closeOtherTabs(tabId, selectedIds) {
      const keepIds = new Set(getActionTargetIds(tabId, selectedIds))
      closeTabIds(getPanelOrderIds().filter(id => !keepIds.has(id)))
    },

    closeTabsBelow(tabId) {
      const orderIds = getPanelOrderIds()
      const index = orderIds.indexOf(tabId)
      if (index === -1) return
      closeTabIds(orderIds.slice(index + 1))
    },

    closeTabsAbove(tabId) {
      const orderIds = state.treeTabs.map(item => item.id)
      const index = orderIds.indexOf(tabId)
      if (index === -1) return
      closeTabIds(orderIds.slice(0, index))
    },
  }
}

module.exports = { createTabStore }

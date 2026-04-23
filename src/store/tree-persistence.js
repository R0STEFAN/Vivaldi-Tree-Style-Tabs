const TREE_NAMESPACE_KEY = 'svbTree'
const TREE_VERSION = 1

function cloneTreeState(treeState) {
  const next = { rootIds: [], nodesById: {} }
  const nodesById = treeState && treeState.nodesById
  for (const [tabId, node] of Object.entries(nodesById || {})) {
    next.nodesById[tabId] = {
      parentId: node && node.parentId != null ? Number(node.parentId) : null,
      childIds: Array.isArray(node && (node.childIds || node.children))
        ? (node.childIds || node.children).map(Number).filter(Number.isFinite)
        : [],
      collapsed: !!(node && node.collapsed),
    }
  }
  next.rootIds = Array.isArray(treeState && treeState.rootIds)
    ? treeState.rootIds.map(Number).filter(Number.isFinite)
    : Object.entries(next.nodesById)
      .filter(([, node]) => node.parentId == null)
      .map(([tabId]) => Number(tabId))
  return next
}

function cloneVivExtData(value) {
  return value && typeof value === 'object'
    ? JSON.parse(JSON.stringify(value))
    : {}
}

function createNodeId() {
  return `svb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function normalizeOrder(value) {
  const order = Number(value)
  return Number.isFinite(order) ? order : 0
}

function getTreeRecord(tab) {
  const vivExtData = tab && tab.vivExtData && typeof tab.vivExtData === 'object'
    ? tab.vivExtData
    : null
  const record = vivExtData && vivExtData[TREE_NAMESPACE_KEY] && typeof vivExtData[TREE_NAMESPACE_KEY] === 'object'
    ? vivExtData[TREE_NAMESPACE_KEY]
    : null

  if (!record || typeof record.nodeId !== 'string' || !record.nodeId) return null

  return {
    version: Number(record.version) || TREE_VERSION,
    contextKey: typeof record.contextKey === 'string' ? record.contextKey : null,
    nodeId: record.nodeId,
    parentNodeId: typeof record.parentNodeId === 'string' && record.parentNodeId ? record.parentNodeId : null,
    collapsed: !!record.collapsed,
    order: normalizeOrder(record.order),
  }
}

function assignTreeOrders(treeState, tabs) {
  const safeTreeState = cloneTreeState(treeState)
  const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))
  const ordersByTabId = new Map()
  const rootIds = safeTreeState.rootIds.filter(rootId => tabsById.has(rootId))

  function walk(tabId, siblingIndex) {
    if (!tabsById.has(tabId)) return
    ordersByTabId.set(tabId, siblingIndex)
    const node = safeTreeState.nodesById[tabId]
    const childIds = Array.isArray(node && node.childIds) ? node.childIds : []
    let childIndex = 0
    for (const childId of childIds) {
      if (!tabsById.has(childId)) continue
      walk(childId, childIndex)
      childIndex += 1
    }
  }

  let rootIndex = 0
  for (const rootId of rootIds) {
    walk(rootId, rootIndex)
    rootIndex += 1
  }

  return ordersByTabId
}

function buildVivExtDataPayloads(contextKey, treeState, tabs) {
  const safeTreeState = cloneTreeState(treeState)
  const tabsById = new Map((Array.isArray(tabs) ? tabs : []).map(tab => [tab.id, tab]))
  const ordersByTabId = assignTreeOrders(safeTreeState, tabs)
  const nodeIdByTabId = new Map()
  const tabIdByNodeId = new Map()

  for (const tab of tabsById.values()) {
    const record = getTreeRecord(tab)
    const nodeId = record && record.nodeId ? record.nodeId : createNodeId()
    if (!tabIdByNodeId.has(nodeId)) {
      nodeIdByTabId.set(tab.id, nodeId)
      tabIdByNodeId.set(nodeId, tab.id)
      continue
    }

    const uniqueNodeId = createNodeId()
    nodeIdByTabId.set(tab.id, uniqueNodeId)
    tabIdByNodeId.set(uniqueNodeId, tab.id)
  }

  const payloads = []

  for (const tab of tabsById.values()) {
    const node = safeTreeState.nodesById[tab.id] || { parentId: null, collapsed: false }
    const nextRecord = {
      version: TREE_VERSION,
      contextKey,
      nodeId: nodeIdByTabId.get(tab.id) || createNodeId(),
      parentNodeId: node.parentId != null ? (nodeIdByTabId.get(node.parentId) || null) : null,
      collapsed: !!node.collapsed,
      order: ordersByTabId.get(tab.id) || 0,
    }

    const currentRecord = getTreeRecord(tab)
    const changed = !currentRecord
      || currentRecord.contextKey !== nextRecord.contextKey
      || currentRecord.nodeId !== nextRecord.nodeId
      || currentRecord.parentNodeId !== nextRecord.parentNodeId
      || currentRecord.collapsed !== nextRecord.collapsed
      || currentRecord.order !== nextRecord.order

    const nextVivExtData = cloneVivExtData(tab.vivExtData)
    nextVivExtData[TREE_NAMESPACE_KEY] = nextRecord

    payloads.push({
      tabId: tab.id,
      changed,
      vivExtData: nextVivExtData,
    })
  }

  return payloads
}

function getDetachedContextRecords(tabs, records) {
  const contextualTabs = Array.isArray(tabs) ? tabs : []
  if (contextualTabs.length === 0 || !Array.isArray(records) || records.length === 0) return []

  const contextKeys = new Set(records.map(({ record }) => record.contextKey).filter(Boolean))
  if (contextKeys.size !== 1) return []

  const nodeIds = new Set()
  for (const { record } of records) {
    if (!record.nodeId || nodeIds.has(record.nodeId)) return []
    nodeIds.add(record.nodeId)
  }

  return records
}

function restoreFromVivExtData(contextKey, tabs) {
  const baseState = { rootIds: [], nodesById: {} }
  const contextualTabs = Array.isArray(tabs) ? tabs : []
  const allRecords = []
  const tabIdByNodeId = new Map()

  for (const tab of contextualTabs) {
    const record = getTreeRecord(tab)
    if (!record) continue
    allRecords.push({ tabId: tab.id, record })
  }

  const matchingRecords = allRecords.filter(({ record }) => record.contextKey === contextKey)
  const candidateRecords = matchingRecords.length > 0
    ? matchingRecords
    : getDetachedContextRecords(contextualTabs, allRecords)

  const records = []
  for (const { tabId, record } of candidateRecords) {
    if (tabIdByNodeId.has(record.nodeId)) continue
    tabIdByNodeId.set(record.nodeId, tabId)
    records.push({ tabId, record })
  }

  if (!records.length) return null

  for (const { tabId, record } of records) {
    baseState.nodesById[tabId] = {
      parentId: null,
      childIds: [],
      collapsed: !!record.collapsed,
    }
  }

  const childEntriesByParentId = new Map()
  const rootEntries = []

  for (const { tabId, record } of records) {
    const parentId = record.parentNodeId ? (tabIdByNodeId.get(record.parentNodeId) || null) : null
    if (parentId != null && baseState.nodesById[parentId]) {
      baseState.nodesById[tabId].parentId = parentId
      if (!childEntriesByParentId.has(parentId)) {
        childEntriesByParentId.set(parentId, [])
      }
      childEntriesByParentId.get(parentId).push({
        tabId,
        order: record.order,
        nativeIndex: normalizeOrder((contextualTabs.find(tab => tab.id === tabId) || {}).index),
      })
      continue
    }

    rootEntries.push({
      tabId,
      order: record.order,
      nativeIndex: normalizeOrder((contextualTabs.find(tab => tab.id === tabId) || {}).index),
    })
  }

  rootEntries.sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order
    return left.nativeIndex - right.nativeIndex
  })
  baseState.rootIds = rootEntries.map(entry => entry.tabId)

  for (const [parentId, entries] of childEntriesByParentId.entries()) {
    entries.sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order
      return left.nativeIndex - right.nativeIndex
    })
    baseState.nodesById[parentId].childIds = entries.map(entry => entry.tabId)
  }

  for (const tab of contextualTabs) {
    if (baseState.nodesById[tab.id]) continue
    baseState.nodesById[tab.id] = {
      parentId: null,
      childIds: [],
      collapsed: false,
    }
    baseState.rootIds.push(tab.id)
  }

  return baseState
}

function createTreePersistence(api) {
  return {
    makeContextKey(tabState) {
      if (tabState && tabState.outsideWorkspace) return 'workspace:outside'
      if (tabState && tabState.activeWorkspaceId != null) return `workspace:${tabState.activeWorkspaceId}`
      if (tabState && tabState.windowId != null) return `window:${tabState.windowId}`
      return 'window:unknown'
    },

    async loadTree(contextKey, tabs) {
      const vivExtDataTree = restoreFromVivExtData(contextKey, tabs)
      if (vivExtDataTree) {
        return cloneTreeState(vivExtDataTree)
      }

      return cloneTreeState(null)
    },

    async saveTree(contextKey, treeState, tabs) {
      if (!contextKey) return
      const payloads = buildVivExtDataPayloads(contextKey, treeState, tabs)
      if (api && typeof api.updateVivExtData === 'function') {
        for (const payload of payloads) {
          if (!payload.changed) continue
          await api.updateVivExtData(payload.tabId, payload.vivExtData).catch(error => {
            console.error('[svb] cannot update vivExtData', error)
          })
        }
      }
    },

    async deleteTree() {
      // Tree metadata is stored per-tab in vivExtData; deleting a whole context is not needed yet.
    },
  }
}

module.exports = { createTreePersistence }

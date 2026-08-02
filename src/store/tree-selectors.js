function getAncestorIds(tabId, treeState) {
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
  const ancestors = []
  const visited = new Set()
  let currentId = tabId

  while (currentId != null && !visited.has(currentId)) {
    visited.add(currentId)
    const node = nodesById[currentId]
    const parentId = node && node.parentId != null ? node.parentId : null
    if (parentId == null) break
    ancestors.push(parentId)
    currentId = parentId
  }

  return ancestors
}

function isDescendantOf(tabId, ancestorId, treeState) {
  return getAncestorIds(tabId, treeState).includes(ancestorId)
}

function getSubtreeIds(tabId, treeState) {
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
  const result = []

  function walk(currentId) {
    result.push(currentId)
    const node = nodesById[currentId]
    const childIds = Array.isArray(node && (node.childIds || node.children)) ? (node.childIds || node.children) : []
    for (const childId of childIds) {
      walk(childId)
    }
  }

  walk(tabId)
  return result
}

function buildOrderedStructure(options) {
  const { tabs, treeState } = options || {}
  const items = Array.isArray(tabs) ? tabs : []
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}
  const preferredRootIds = Array.isArray(treeState && treeState.rootIds) ? treeState.rootIds : []
  const tabsById = new Map(items.map(tab => [tab.id, tab]))
  const childIdsByParent = new Map()
  const derivedRootIds = []

  for (const tab of items) {
    const node = nodesById[tab.id]
    const parentId = node && node.parentId != null && tabsById.has(node.parentId) ? node.parentId : null
    if (parentId == null) {
      derivedRootIds.push(tab.id)
      continue
    }

    if (!childIdsByParent.has(parentId)) {
      childIdsByParent.set(parentId, [])
    }
    childIdsByParent.get(parentId).push(tab.id)
  }

  const rootIds = []
  const knownRootIds = new Set()

  for (const rootId of preferredRootIds) {
    if (!derivedRootIds.includes(rootId) || knownRootIds.has(rootId)) continue
    rootIds.push(rootId)
    knownRootIds.add(rootId)
  }

  for (const rootId of derivedRootIds) {
    if (knownRootIds.has(rootId)) continue
    rootIds.push(rootId)
    knownRootIds.add(rootId)
  }

  for (const [parentId, childIds] of childIdsByParent.entries()) {
    const node = nodesById[parentId]
    const ordered = []
    const known = new Set()
    const preferredOrder = Array.isArray(node && (node.childIds || node.children)) ? (node.childIds || node.children) : []

    const preferredOrderMap = new Map()
    preferredOrder.forEach((id, index) => preferredOrderMap.set(id, index))

    for (const childId of preferredOrder) {
      if (childIds.includes(childId) && !known.has(childId)) {
        ordered.push(childId)
        known.add(childId)
      }
    }

    for (const childId of childIds) {
      if (!known.has(childId)) {
        ordered.push(childId)
        known.add(childId)
      }
    }

    ordered.sort((leftId, rightId) => {
      const leftIndex = preferredOrderMap.has(leftId) ? preferredOrderMap.get(leftId) : -1
      const rightIndex = preferredOrderMap.has(rightId) ? preferredOrderMap.get(rightId) : -1
      if (leftIndex !== -1 || rightIndex !== -1) {
        if (leftIndex === -1) return 1
        if (rightIndex === -1) return -1
        return leftIndex - rightIndex
      }

      const leftTab = tabsById.get(leftId)
      const rightTab = tabsById.get(rightId)
      return (leftTab ? leftTab.index : 0) - (rightTab ? rightTab.index : 0)
    })

    childIdsByParent.set(parentId, ordered)
  }

  const preferredRootMap = new Map()
  preferredRootIds.forEach((id, index) => preferredRootMap.set(id, index))

  rootIds.sort((leftId, rightId) => {
    const leftPreferredIndex = preferredRootMap.has(leftId) ? preferredRootMap.get(leftId) : -1
    const rightPreferredIndex = preferredRootMap.has(rightId) ? preferredRootMap.get(rightId) : -1
    if (leftPreferredIndex !== -1 || rightPreferredIndex !== -1) {
      if (leftPreferredIndex === -1) return 1
      if (rightPreferredIndex === -1) return -1
      return leftPreferredIndex - rightPreferredIndex
    }

    const leftTab = tabsById.get(leftId)
    const rightTab = tabsById.get(rightId)
    return (leftTab ? leftTab.index : 0) - (rightTab ? rightTab.index : 0)
  })

  return {
    items,
    nodesById,
    tabsById,
    rootIds,
    childIdsByParent,
  }
}

function getFullTreeOrderIds(options) {
  const structure = buildOrderedStructure(options)
  const result = []

  function walk(tabId) {
    if (!structure.tabsById.has(tabId)) return
    result.push(tabId)
    const childIds = structure.childIdsByParent.get(tabId) || []
    for (const childId of childIds) {
      walk(childId)
    }
  }

  for (const rootId of structure.rootIds) {
    walk(rootId)
  }

  return result
}

function buildTreeView(options) {
  const structure = buildOrderedStructure(options)
  const { nodesById, tabsById, rootIds, childIdsByParent } = structure

  const visibleTabs = []
  let visibleIndex = 0

  function walk(tabId, depth, currentAncestors, isHidden) {
    const tab = tabsById.get(tabId)
    if (!tab) return { visibleBranchSize: 0, subtreeSize: 0 }
    const node = nodesById[tabId] || { collapsed: false }
    const childIds = childIdsByParent.get(tabId) || []
    const item = {
      id: tab.id,
      tab,
      depth,
      visibleIndex: isHidden ? -1 : visibleIndex,
      parentId: node.parentId != null ? node.parentId : null,
      hasChildren: childIds.length > 0,
      collapsed: !!node.collapsed,
      childCount: childIds.length,
      subtreeSize: 1,
      ancestorIds: currentAncestors,
      visibleBranchSize: 1,
    }

    if (!isHidden) {
      visibleTabs.push(item)
      visibleIndex += 1
    }

    const nextAncestors = [...currentAncestors, tab.id]
    const nextIsHidden = isHidden || !!node.collapsed
    let visibleBranchSize = 1
    let subtreeSize = 1

    for (const childId of childIds) {
      const childResult = walk(childId, depth + 1, nextAncestors, nextIsHidden)
      subtreeSize += childResult.subtreeSize
      if (!node.collapsed) {
        visibleBranchSize += childResult.visibleBranchSize
      }
    }

    item.subtreeSize = subtreeSize
    item.visibleBranchSize = visibleBranchSize
    return { visibleBranchSize, subtreeSize }
  }

  for (const rootId of rootIds) {
    walk(rootId, 0, [], false)
  }

  return {
    roots: rootIds.slice(),
    visibleTabs,
  }
}

module.exports = { buildTreeView, getAncestorIds, getSubtreeIds, isDescendantOf, getFullTreeOrderIds }

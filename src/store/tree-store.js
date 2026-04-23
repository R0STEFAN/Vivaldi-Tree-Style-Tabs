function normalizeTabId(value) {
  if (value == null || value === '') return null
  const tabId = Number(value)
  return Number.isFinite(tabId) ? tabId : null
}

function normalizeUniqueIds(values) {
  const seen = new Set()
  const result = []

  for (const value of Array.isArray(values) ? values : []) {
    const tabId = normalizeTabId(value)
    if (tabId == null || seen.has(tabId)) continue
    seen.add(tabId)
    result.push(tabId)
  }

  return result
}

function createNode(value) {
  const parentId = normalizeTabId(value && value.parentId)
  const childIds = normalizeUniqueIds(value && (value.childIds || value.children))
    .filter(childId => childId !== parentId)

  return {
    parentId,
    childIds,
    collapsed: !!(value && value.collapsed),
  }
}

function cloneTreeState(treeState) {
  const nodesById = {}
  for (const [tabId, node] of Object.entries((treeState && treeState.nodesById) || {})) {
    const normalizedTabId = normalizeTabId(tabId)
    if (normalizedTabId == null) continue
    nodesById[normalizedTabId] = createNode(node)
  }

  const explicitRootIds = normalizeUniqueIds(treeState && treeState.rootIds)
  const derivedRootIds = []

  for (const tabId of explicitRootIds) {
    if (nodesById[tabId]) derivedRootIds.push(tabId)
  }

  for (const [tabId, node] of Object.entries(nodesById)) {
    if (node.parentId == null && !derivedRootIds.includes(Number(tabId))) {
      derivedRootIds.push(Number(tabId))
    }
  }

  return {
    contextKey: treeState && treeState.contextKey ? treeState.contextKey : null,
    rootIds: derivedRootIds,
    nodesById,
  }
}

function createTreeStore() {
  let state = cloneTreeState(null)

  function getNode(tabId) {
    return state.nodesById[tabId] || null
  }

  function hasNode(tabId) {
    return !!getNode(tabId)
  }

  function setNode(tabId, node) {
    state.nodesById[tabId] = node
  }

  function deleteNode(tabId) {
    delete state.nodesById[tabId]
  }

  function removeRootId(tabId) {
    const previousLength = state.rootIds.length
    state.rootIds = state.rootIds.filter(rootId => rootId !== tabId)
    return state.rootIds.length !== previousLength
  }

  function insertRootId(tabId, index) {
    removeRootId(tabId)

    if (typeof index === 'number' && index >= 0 && index < state.rootIds.length) {
      state.rootIds.splice(index, 0, tabId)
    } else {
      state.rootIds.push(tabId)
    }
  }

  function removeFromParent(tabId) {
    const node = getNode(tabId)
    if (!node) return false

    if (node.parentId == null) {
      return removeRootId(tabId)
    }

    const parent = getNode(node.parentId)
    if (!parent) {
      node.parentId = null
      return false
    }

    const previousLength = parent.childIds.length
    parent.childIds = parent.childIds.filter(childId => childId !== tabId)
    node.parentId = null
    return parent.childIds.length !== previousLength
  }

  function insertChild(parentId, tabId, index) {
    const parent = getNode(parentId)
    const node = getNode(tabId)
    if (!parent || !node) return false

    parent.childIds = parent.childIds.filter(childId => childId !== tabId)

    if (typeof index === 'number' && index >= 0 && index < parent.childIds.length) {
      parent.childIds.splice(index, 0, tabId)
    } else {
      parent.childIds.push(tabId)
    }

    node.parentId = parentId
    return true
  }

  function isDescendant(parentId, tabId) {
    const visited = new Set()
    let currentId = normalizeTabId(parentId)

    while (currentId != null && !visited.has(currentId)) {
      if (currentId === tabId) return true
      visited.add(currentId)
      const current = getNode(currentId)
      currentId = current ? current.parentId : null
    }

    return false
  }

  function moveChildrenToParentOrRoot(tabId, parentId, childIds, insertionIndex) {
    if (parentId == null) {
      let offset = 0
      for (const childId of childIds) {
        const child = getNode(childId)
        if (!child) continue
        child.parentId = null
        insertRootId(childId, insertionIndex + offset)
        offset += 1
      }
      return
    }

    const parent = getNode(parentId)
    if (!parent) {
      for (const childId of childIds) {
        const child = getNode(childId)
        if (child) {
          child.parentId = null
          state.rootIds.push(childId)
        }
      }
      return
    }

    let offset = 0
    for (const childId of childIds) {
      const child = getNode(childId)
      if (!child) continue
      child.parentId = parentId
      parent.childIds.splice(insertionIndex + offset, 0, childId)
      offset += 1
    }
  }

  return {
    getState() {
      return cloneTreeState(state)
    },

    load(contextKey, treeState) {
      state = cloneTreeState({
        contextKey,
        rootIds: treeState && treeState.rootIds,
        nodesById: treeState && treeState.nodesById,
      })
    },

    reset(contextKey) {
      state = cloneTreeState({ contextKey, rootIds: [], nodesById: {} })
    },

    exportState() {
      return cloneTreeState(state)
    },

    getParentId(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      return node ? node.parentId : null
    },

    hasTab(tabId) {
      return hasNode(tabId)
    },

    ensureTab(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      if (normalizedTabId == null) return false
      if (hasNode(normalizedTabId)) return false
      setNode(normalizedTabId, createNode(null))
      state.rootIds.push(normalizedTabId)
      return true
    },

    removeTab(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      if (!node) return false

      const parentId = node.parentId
      const childIds = node.childIds.slice()

      let insertionIndex = 0
      if (parentId == null) {
        insertionIndex = state.rootIds.indexOf(normalizedTabId)
      } else {
        const parent = getNode(parentId)
        insertionIndex = parent ? parent.childIds.indexOf(normalizedTabId) : 0
      }
      if (insertionIndex < 0) insertionIndex = 0

      removeFromParent(normalizedTabId)
      moveChildrenToParentOrRoot(normalizedTabId, parentId, childIds, insertionIndex)

      deleteNode(normalizedTabId)
      return true
    },

    attachTab(tabId, parentId, index) {
      const normalizedTabId = normalizeTabId(tabId)
      const normalizedParentId = normalizeTabId(parentId)
      if (normalizedTabId == null) return false

      this.ensureTab(normalizedTabId)
      if (normalizedParentId == null || normalizedParentId === normalizedTabId) {
        return this.moveRoot(normalizedTabId, index)
      }

      this.ensureTab(normalizedParentId)
      if (isDescendant(normalizedParentId, normalizedTabId)) {
        return false
      }

      let insertionIndex = index
      const node = getNode(normalizedTabId)
      const parent = getNode(normalizedParentId)
      if (
        node
        && parent
        && node.parentId === normalizedParentId
        && typeof insertionIndex === 'number'
      ) {
        const previousIndex = parent.childIds.indexOf(normalizedTabId)
        if (previousIndex >= 0 && previousIndex < insertionIndex) {
          insertionIndex -= 1
        }
      }

      removeFromParent(normalizedTabId)
      return insertChild(normalizedParentId, normalizedTabId, insertionIndex)
    },

    attachBefore(tabId, targetId) {
      const normalizedTabId = normalizeTabId(tabId)
      const normalizedTargetId = normalizeTabId(targetId)
      if (normalizedTabId == null || normalizedTargetId == null || normalizedTabId === normalizedTargetId) return false

      const targetNode = getNode(normalizedTargetId)
      if (!targetNode) return false

      if (targetNode.parentId == null) {
        return this.moveRoot(normalizedTabId, state.rootIds.indexOf(normalizedTargetId))
      }

      const parent = getNode(targetNode.parentId)
      if (!parent) return false
      return this.attachTab(normalizedTabId, targetNode.parentId, parent.childIds.indexOf(normalizedTargetId))
    },

    attachAfter(tabId, targetId) {
      const normalizedTabId = normalizeTabId(tabId)
      const normalizedTargetId = normalizeTabId(targetId)
      if (normalizedTabId == null || normalizedTargetId == null || normalizedTabId === normalizedTargetId) return false

      const targetNode = getNode(normalizedTargetId)
      if (!targetNode) return false

      if (targetNode.parentId == null) {
        const targetIndex = state.rootIds.indexOf(normalizedTargetId)
        return this.moveRoot(normalizedTabId, targetIndex === -1 ? undefined : targetIndex + 1)
      }

      const parent = getNode(targetNode.parentId)
      if (!parent) return false
      const targetIndex = parent.childIds.indexOf(normalizedTargetId)
      return this.attachTab(normalizedTabId, targetNode.parentId, targetIndex === -1 ? undefined : targetIndex + 1)
    },

    detachTab(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      if (normalizedTabId == null) return false
      this.ensureTab(normalizedTabId)

      const node = getNode(normalizedTabId)
      if (!node || node.parentId == null) {
        if (!state.rootIds.includes(normalizedTabId)) {
          state.rootIds.push(normalizedTabId)
          return true
        }
        return false
      }

      removeFromParent(normalizedTabId)
      node.parentId = null
      state.rootIds.push(normalizedTabId)
      return true
    },

    moveRoot(tabId, index) {
      const normalizedTabId = normalizeTabId(tabId)
      if (normalizedTabId == null) return false
      this.ensureTab(normalizedTabId)
      let insertionIndex = index
      const node = getNode(normalizedTabId)
      if (node && node.parentId == null && typeof insertionIndex === 'number') {
        const previousIndex = state.rootIds.indexOf(normalizedTabId)
        if (previousIndex >= 0 && previousIndex < insertionIndex) {
          insertionIndex -= 1
        }
      }
      removeFromParent(normalizedTabId)
      const movedNode = getNode(normalizedTabId)
      if (movedNode) movedNode.parentId = null
      insertRootId(normalizedTabId, insertionIndex)
      return true
    },

    setCollapsed(tabId, collapsed) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      if (!node) return false
      const nextValue = !!collapsed
      if (node.collapsed === nextValue) return false
      node.collapsed = nextValue
      return true
    },

    toggleCollapsed(tabId) {
      const normalizedTabId = normalizeTabId(tabId)
      const node = normalizedTabId != null ? getNode(normalizedTabId) : null
      if (!node) return false
      node.collapsed = !node.collapsed
      return true
    },

    collapseAll() {
      let dirty = false

      for (const node of Object.values(state.nodesById)) {
        if (!node || !Array.isArray(node.childIds) || node.childIds.length === 0) continue
        if (node.collapsed) continue
        node.collapsed = true
        dirty = true
      }

      return dirty
    },

    expandAncestors(tabId) {
      let currentId = normalizeTabId(tabId)
      let dirty = false
      const visited = new Set()

      while (currentId != null && !visited.has(currentId)) {
        visited.add(currentId)
        const node = getNode(currentId)
        if (!node) break
        currentId = node.parentId
        if (currentId == null) break
        const parent = getNode(currentId)
        if (parent && parent.collapsed) {
          parent.collapsed = false
          dirty = true
        }
      }

      return dirty
    },

    repair(validTabIds) {
      const validSet = new Set(normalizeUniqueIds(validTabIds))
      let dirty = false

      for (const tabId of Object.keys(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null || !validSet.has(normalizedTabId)) {
          deleteNode(tabId)
          dirty = true
        }
      }

      state.rootIds = state.rootIds.filter(rootId => validSet.has(rootId) && !!getNode(rootId))

      for (const [tabId, node] of Object.entries(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null) continue

        const previousChildrenLength = node.childIds.length
        node.childIds = node.childIds.filter(childId => childId != null && validSet.has(childId) && childId !== normalizedTabId)
        if (node.childIds.length !== previousChildrenLength) dirty = true

        if (node.parentId != null && (!validSet.has(node.parentId) || !getNode(node.parentId))) {
          node.parentId = null
          dirty = true
        }
      }

      for (const [tabId, node] of Object.entries(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null) continue

        if (node.parentId == null) {
          if (!state.rootIds.includes(normalizedTabId)) {
            state.rootIds.push(normalizedTabId)
            dirty = true
          }
          continue
        }

        const parent = getNode(node.parentId)
        if (!parent) {
          node.parentId = null
          if (!state.rootIds.includes(normalizedTabId)) state.rootIds.push(normalizedTabId)
          dirty = true
          continue
        }

        if (!parent.childIds.includes(normalizedTabId)) {
          parent.childIds.push(normalizedTabId)
          dirty = true
        }
        removeRootId(normalizedTabId)
      }

      for (const [tabId, node] of Object.entries(state.nodesById)) {
        const normalizedTabId = normalizeTabId(tabId)
        if (normalizedTabId == null) continue
        if (!isDescendant(node.parentId, normalizedTabId)) continue
        node.parentId = null
        if (!state.rootIds.includes(normalizedTabId)) state.rootIds.push(normalizedTabId)
        dirty = true
      }

      state.rootIds = normalizeUniqueIds(state.rootIds).filter(rootId => {
        const node = getNode(rootId)
        return !!node && node.parentId == null
      })

      return dirty
    },
  }
}

module.exports = { createTreeStore }

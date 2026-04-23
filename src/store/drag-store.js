function normalizeTabId(value) {
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

function createInitialState() {
  return {
    dragging: false,
    draggedIds: [],
    sourceParentId: null,
    dropTargetId: null,
    dropPosition: null,
  }
}

function createDragStore() {
  let state = createInitialState()
  const listeners = new Set()

  function emit() {
    const snapshot = {
      dragging: state.dragging,
      draggedIds: state.draggedIds.slice(),
      sourceParentId: state.sourceParentId,
      dropTargetId: state.dropTargetId,
      dropPosition: state.dropPosition,
    }
    for (const listener of listeners) listener(snapshot)
  }

  function setState(patch) {
    state = {
      dragging: !!patch.dragging,
      draggedIds: normalizeUniqueIds(patch.draggedIds),
      sourceParentId: normalizeTabId(patch.sourceParentId),
      dropTargetId: normalizeTabId(patch.dropTargetId),
      dropPosition: patch.dropPosition || null,
    }
    emit()
  }

  return {
    getState() {
      return {
        dragging: state.dragging,
        draggedIds: state.draggedIds.slice(),
        sourceParentId: state.sourceParentId,
        dropTargetId: state.dropTargetId,
        dropPosition: state.dropPosition,
      }
    },

    subscribe(listener) {
      listeners.add(listener)
      listener(this.getState())
      return () => listeners.delete(listener)
    },

    startDrag(draggedIds, meta) {
      const normalizedIds = normalizeUniqueIds(draggedIds)
      if (normalizedIds.length === 0) return
      setState({
        dragging: true,
        draggedIds: normalizedIds,
        sourceParentId: meta && meta.sourceParentId,
        dropTargetId: null,
        dropPosition: null,
      })
    },

    updateDropTarget(targetId, position) {
      if (!state.dragging) return
      setState({
        dragging: true,
        draggedIds: state.draggedIds,
        sourceParentId: state.sourceParentId,
        dropTargetId: targetId,
        dropPosition: position,
      })
    },

    clear() {
      if (!state.dragging && state.draggedIds.length === 0 && state.dropTargetId == null && state.dropPosition == null) {
        return
      }
      state = createInitialState()
      emit()
    },
  }
}

module.exports = { createDragStore }

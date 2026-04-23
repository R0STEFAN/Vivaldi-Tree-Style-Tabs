function createSelectionStore() {
  let state = {
    selectedIds: [],
    anchorId: null,
    focusedId: null,
  }
  const listeners = new Set()

  function normalizeIds(values) {
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

  function setState(nextState) {
    state = {
      selectedIds: normalizeIds(nextState.selectedIds),
      anchorId: Number.isFinite(nextState.anchorId) ? nextState.anchorId : null,
      focusedId: Number.isFinite(nextState.focusedId) ? nextState.focusedId : null,
    }
    for (const listener of listeners) listener({
      selectedIds: state.selectedIds.slice(),
      anchorId: state.anchorId,
      focusedId: state.focusedId,
    })
  }

  function buildRange(anchorId, targetId, orderedVisibleIds) {
    const orderedIds = normalizeIds(orderedVisibleIds)
    const anchorIndex = orderedIds.indexOf(anchorId)
    const targetIndex = orderedIds.indexOf(targetId)
    if (anchorIndex === -1 || targetIndex === -1) return [targetId]
    const start = Math.min(anchorIndex, targetIndex)
    const end = Math.max(anchorIndex, targetIndex)
    return orderedIds.slice(start, end + 1)
  }

  return {
    getState() {
      return {
        selectedIds: state.selectedIds.slice(),
        anchorId: state.anchorId,
        focusedId: state.focusedId,
      }
    },

    subscribe(listener) {
      listeners.add(listener)
      listener({
        selectedIds: state.selectedIds.slice(),
        anchorId: state.anchorId,
        focusedId: state.focusedId,
      })
      return () => listeners.delete(listener)
    },

    clear() {
      setState({
        selectedIds: [],
        anchorId: null,
        focusedId: null,
      })
    },

    isSelected(tabId) {
      return state.selectedIds.includes(tabId)
    },

    selectSingle(tabId) {
      setState({
        selectedIds: [tabId],
        anchorId: tabId,
        focusedId: tabId,
      })
    },

    toggleSelected(tabId) {
      const selectedIds = state.selectedIds.includes(tabId)
        ? state.selectedIds.filter(id => id !== tabId)
        : state.selectedIds.concat(tabId)

      setState({
        selectedIds,
        anchorId: state.anchorId != null ? state.anchorId : tabId,
        focusedId: tabId,
      })
    },

    selectRange(anchorId, tabId, orderedVisibleIds) {
      const selectedIds = buildRange(anchorId, tabId, orderedVisibleIds)
      setState({
        selectedIds,
        anchorId,
        focusedId: tabId,
      })
    },

    selectMany(tabIds) {
      const normalizedIds = normalizeIds(tabIds)
      setState({
        selectedIds: normalizedIds,
        anchorId: normalizedIds[0] || null,
        focusedId: normalizedIds[normalizedIds.length - 1] || null,
      })
    },

    setAnchor(tabId) {
      setState({
        ...state,
        anchorId: Number.isFinite(tabId) ? tabId : null,
      })
    },

    setFocused(tabId) {
      setState({
        ...state,
        focusedId: Number.isFinite(tabId) ? tabId : null,
      })
    },

    retainValid(validIds) {
      const validSet = new Set(normalizeIds(validIds))
      const selectedIds = state.selectedIds.filter(tabId => validSet.has(tabId))
      const anchorId = validSet.has(state.anchorId) ? state.anchorId : (selectedIds[0] || null)
      const focusedId = validSet.has(state.focusedId) ? state.focusedId : (selectedIds[selectedIds.length - 1] || null)

      if (
        selectedIds.length === state.selectedIds.length
        && anchorId === state.anchorId
        && focusedId === state.focusedId
      ) {
        return
      }

      setState({
        selectedIds,
        anchorId,
        focusedId,
      })
    },
  }
}

module.exports = { createSelectionStore }

function resolveNewTabParent(options) {
  const { newTab, treeState, openerTabId, preferRoot } = options || {}
  const nodesById = treeState && treeState.nodesById ? treeState.nodesById : {}

  if (!newTab || newTab.pinned) return null
  if (preferRoot) return null

  if (Number.isFinite(openerTabId) && nodesById[openerTabId]) {
    return openerTabId
  }

  return null
}

module.exports = { resolveNewTabParent }

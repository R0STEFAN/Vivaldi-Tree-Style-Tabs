function createNativeReconcile(api) {
  let snapshot = null
  let timerIds = new Set()
  let actionToken = 0
  let ownOpenerUpdates = new Map()
  let ownMoveTabIds = new Set()

  function clearOwnOpenerUpdate(tabId) {
    if (!ownOpenerUpdates.has(tabId)) return
    setTimeout(() => {
      ownOpenerUpdates.delete(tabId)
    }, 2500)
  }

  function updateSnapshot(nextSnapshot) {
    snapshot = nextSnapshot && typeof nextSnapshot === 'object'
      ? {
        contextKey: nextSnapshot.contextKey || null,
        tabs: Array.isArray(nextSnapshot.tabs) ? nextSnapshot.tabs.slice() : [],
        fullTreeOrderIds: Array.isArray(nextSnapshot.fullTreeOrderIds) ? nextSnapshot.fullTreeOrderIds.slice() : [],
        parentById: nextSnapshot.parentById && typeof nextSnapshot.parentById === 'object'
          ? { ...nextSnapshot.parentById }
          : {},
      }
      : null
  }

  function computeOpenerFixes(currentSnapshot) {
    const tabs = Array.isArray(currentSnapshot && currentSnapshot.tabs) ? currentSnapshot.tabs : []
    const parentById = currentSnapshot && currentSnapshot.parentById ? currentSnapshot.parentById : {}
    const fixes = []

    for (const tab of tabs) {
      if (!tab || tab.pinned) continue

      const desiredParentId = Number.isFinite(parentById[tab.id]) ? parentById[tab.id] : null
      if (!Number.isFinite(desiredParentId)) continue
      if (tab.openerTabId === desiredParentId) continue

      fixes.push({
        tabId: tab.id,
        openerTabId: desiredParentId,
      })
    }

    return fixes
  }

  function computeDesiredNativeOrder(currentSnapshot) {
    const tabs = Array.isArray(currentSnapshot && currentSnapshot.tabs) ? currentSnapshot.tabs : []
    const byId = new Map(tabs.map(tab => [tab.id, tab]))
    const order = []

    for (const tabId of Array.isArray(currentSnapshot && currentSnapshot.fullTreeOrderIds)
      ? currentSnapshot.fullTreeOrderIds
      : []) {
      const tab = byId.get(tabId)
      if (!tab || tab.pinned) continue
      order.push(tab.id)
    }

    return order
  }

  function getCurrentNativeOrder(currentSnapshot) {
    return (Array.isArray(currentSnapshot && currentSnapshot.tabs) ? currentSnapshot.tabs : [])
      .filter(tab => tab && !tab.pinned && Number.isFinite(tab.index))
      .slice()
      .sort((a, b) => a.index - b.index)
  }

  function computeOrderMoves(currentSnapshot) {
    const currentTabs = getCurrentNativeOrder(currentSnapshot)
    const currentIds = currentTabs.map(tab => tab.id)
    const desiredIds = computeDesiredNativeOrder(currentSnapshot)
      .filter(tabId => currentIds.includes(tabId))

    if (currentIds.length < 2 || desiredIds.length < 2) return []
    if (currentIds.length !== desiredIds.length) return []
    if (currentIds.every((tabId, index) => tabId === desiredIds[index])) return []

    const slots = currentTabs.map(tab => tab.index)
    return desiredIds.map((tabId, index) => ({
      tabId,
      index: slots[index],
    }))
  }

  function markOwnMove(tabId) {
    if (!Number.isFinite(tabId)) return
    ownMoveTabIds.add(tabId)
    setTimeout(() => {
      ownMoveTabIds.delete(tabId)
    }, 4000)
  }

  async function applyOrderMoves(reason, currentSnapshot) {
    if (!api || typeof api.moveTab !== 'function') return []

    const moves = computeOrderMoves(currentSnapshot)
    for (const move of moves) {
      markOwnMove(move.tabId)
      try {
        await api.moveTab(move.tabId, move.index)
      } catch (error) {
        console.error('[svb] native reconcile move failed', reason, error)
      }
    }

    return moves
  }

  async function run(reason, token) {
    if (!snapshot || token !== actionToken) return
    if (!api || typeof api.setOpenerTab !== 'function') return

    const openerFixes = computeOpenerFixes(snapshot)
    for (const fix of openerFixes) {
      ownOpenerUpdates.set(fix.tabId, fix.openerTabId)
      try {
        api.setOpenerTab(fix.tabId, fix.openerTabId)
      } catch (error) {
        console.error('[svb] native reconcile opener failed', reason, error)
      }
      clearOwnOpenerUpdate(fix.tabId)
    }

    const orderMoves = await applyOrderMoves(reason, snapshot)

    return {
      openerFixes,
      orderMoves,
    }
  }

  function clearTimers() {
    for (const timerId of timerIds) {
      clearTimeout(timerId)
    }
    timerIds.clear()
  }

  function schedule(reason, delays = [180]) {
    actionToken += 1
    const token = actionToken
    clearTimers()

    const safeDelays = Array.isArray(delays) && delays.length ? delays : [180]
    for (const delay of safeDelays) {
      const timerId = setTimeout(() => {
        timerIds.delete(timerId)
        run(reason, token).catch(error => {
          console.error('[svb] native reconcile failed', reason, error)
        })
      }, Math.max(0, delay))
      timerIds.add(timerId)
    }
  }

  return {
    updateSnapshot,

    scheduleStartup() {
      schedule('startup', [1200])
    },

    scheduleAfterAction(reason) {
      schedule(reason || 'action', [350, 1000, 1800])
    },

    isOwnOpenerUpdate(tabId, changeInfo) {
      if (!ownOpenerUpdates.has(tabId)) return false
      const info = changeInfo && typeof changeInfo === 'object' ? changeInfo : {}
      const openerChanged = Object.prototype.hasOwnProperty.call(info, 'openerTabId')
      if (!openerChanged) return false

      const expectedOpenerId = ownOpenerUpdates.get(tabId)
      if (info.openerTabId === expectedOpenerId) {
        ownOpenerUpdates.delete(tabId)
        return true
      }

      return false
    },

    isOwnMove(tabId) {
      if (!ownMoveTabIds.has(tabId)) return false
      ownMoveTabIds.delete(tabId)
      return true
    },
  }
}

module.exports = { createNativeReconcile }

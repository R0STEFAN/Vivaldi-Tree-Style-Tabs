// Temporary, bounded diagnostics. Never retain titles, URLs or error messages.
function createActivationTrace(raw, capacity = 2000) {
  const records = []
  let sequence = 0
  let operation = 0
  const started = Date.now()
  const removers = []
  function record(event, data = {}) {
    records.push({ sequence: ++sequence, ms: Date.now() - started, event, data })
    if (records.length > capacity) records.shift()
  }
  const summarizeTabs = tabs => Array.isArray(tabs) ? tabs.map(tab => ({
    id: tab.id, index: tab.index, active: tab.active, pinned: tab.pinned,
    openerTabId: tab.openerTabId, windowId: tab.windowId,
  })) : undefined
  const api = { ...raw }
  for (const name of ['activateTab', 'closeTab', 'closeTabs', 'getTabs', 'moveTab']) {
    if (typeof raw[name] !== 'function') continue
    api[name] = (...args) => {
      const id = ++operation
      record(`api.${name}.start`, { id, args: args.map(arg => Array.isArray(arg) ? arg.slice() : arg) })
      try {
        const result = raw[name](...args)
        const done = value => record(`api.${name}.done`, { id, tabs: name === 'getTabs' ? summarizeTabs(value) : undefined })
        if (result && typeof result.then === 'function') {
          result.then(done, () => record(`api.${name}.error`, { id }))
        } else done(result)
        return result
      } catch (error) {
        record(`api.${name}.error`, { id })
        throw error
      }
    }
  }
  if (raw.onActivated) removers.push(raw.onActivated(info => record('browser.activated', {
    tabId: info.tabId, windowId: info.windowId,
  })))
  if (raw.onRemoved) removers.push(raw.onRemoved((tabId, info) => record('browser.removed', {
    tabId, windowId: info && info.windowId, isWindowClosing: info && info.isWindowClosing,
  })))
  return {
    api, record,
    snapshot: () => JSON.parse(JSON.stringify(records)),
    dispose: () => removers.forEach(remove => { if (typeof remove === 'function') remove() }),
  }
}

function installTraceDownload(trace, root, getContext) {
  function download() {
    const payload = { format: 'svb-activation-trace-v1', capturedAt: new Date().toISOString(), context: getContext(), events: trace.snapshot() }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `svb-activation-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
  // Capture before rendering can replace the clicked row.
  function click(event) {
    const target = event.target.closest('[data-role]')
    if (target) trace.record('panel.click', { role: target.dataset.role, tabId: Number(target.dataset.tabId) || null })
  }
  function key(event) {
    if (event.ctrlKey && event.altKey && event.shiftKey && event.code === 'KeyD') {
      event.preventDefault()
      event.stopPropagation()
      download()
    }
  }
  root.addEventListener('click', click, true)
  window.addEventListener('keydown', key, true)
  window.__svbDownloadActivationTrace = download
  return () => {
    root.removeEventListener('click', click, true)
    window.removeEventListener('keydown', key, true)
    delete window.__svbDownloadActivationTrace
    trace.dispose()
  }
}

module.exports = { createActivationTrace, installTraceDownload }

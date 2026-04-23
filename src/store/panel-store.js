const STORAGE_KEY = 'svb:panel:state'
const DEFAULT_WIDTH = 300
const MIN_WIDTH = 30
const MAX_WIDTH = 520
const DEFAULT_STATE = { pinned: true, width: DEFAULT_WIDTH }

function clampWidth(width) {
  const numericWidth = Number(width)
  if (!Number.isFinite(numericWidth)) return DEFAULT_WIDTH
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(numericWidth)))
}

function normalizeState(value) {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_STATE }
  }

  return {
    pinned: typeof value.pinned === 'boolean' ? value.pinned : true,
    width: clampWidth(value.width),
  }
}

function readLegacyState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === '0') return { pinned: false, width: DEFAULT_WIDTH }
    if (raw === '1') return { pinned: true, width: DEFAULT_WIDTH }
    if (raw) {
      return normalizeState(JSON.parse(raw))
    }
  } catch (_error) {
    // Ignore storage failures and fall back to the default.
  }

  return null
}

function getChromeStorageArea() {
  const storage = typeof chrome !== 'undefined' && chrome.storage
  if (!storage) return null
  return storage.local || null
}

function storageGet(area, key) {
  return new Promise(resolve => {
    try {
      area.get(key, result => {
        const runtimeError = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError
        if (runtimeError) {
          resolve(undefined)
          return
        }
        resolve(result ? result[key] : undefined)
      })
    } catch (_error) {
      resolve(undefined)
    }
  })
}

function storageSet(area, payload) {
  return new Promise(resolve => {
    try {
      area.set(payload, () => resolve())
    } catch (_error) {
      resolve()
    }
  })
}

async function loadPersistedState() {
  const area = getChromeStorageArea()
  if (area) {
    const storedValue = await storageGet(area, STORAGE_KEY)
    if (storedValue) {
      return normalizeState(storedValue)
    }

    const legacyState = readLegacyState()
    if (legacyState) {
      await storageSet(area, { [STORAGE_KEY]: legacyState })
      return normalizeState(legacyState)
    }
  }

  return normalizeState(readLegacyState())
}

function persistLegacyState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      pinned: !!state.pinned,
      width: clampWidth(state.width),
    }))
  } catch (_error) {
    // Ignore storage failures.
  }
}

async function persistState(state) {
  const normalizedState = normalizeState(state)
  persistLegacyState(normalizedState)

  const area = getChromeStorageArea()
  if (!area) return
  await storageSet(area, { [STORAGE_KEY]: normalizedState })
}

function createPanelStore() {
  let state = { ...DEFAULT_STATE }
  const listeners = new Set()

  function emit() {
    for (const listener of listeners) listener(state)
  }

  function setState(nextState) {
    state = normalizeState(nextState)
    void persistState(state)
    emit()
  }

  return {
    getState() {
      return state
    },

    async init() {
      state = await loadPersistedState()
      emit()
    },

    subscribe(listener) {
      listeners.add(listener)
      listener(state)
      return () => listeners.delete(listener)
    },

    togglePinned() {
      setState({ ...state, pinned: !state.pinned })
    },

    setWidth(width) {
      setState({ ...state, width: clampWidth(width) })
    },
  }
}

module.exports = { createPanelStore }

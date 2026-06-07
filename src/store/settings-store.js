const SETTINGS_KEY = 'svb-settings'
const DEFAULT_SETTINGS = {
  childPosition: 'bottom',
  activateAfterClose: 'above',
  adaptiveActivation: true,
  doubleClickAction: 'rename',
  panelPosition: 'left',
}

function createSettingsStore() {
  let currentSettings = { ...DEFAULT_SETTINGS }
  const listeners = new Set()
  let initialized = false

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

  async function load() {
    const area = getChromeStorageArea()
    if (!area) {
      // Fallback to localStorage if chrome.storage is not available
      try {
        const saved = localStorage.getItem(SETTINGS_KEY)
        if (saved) {
          currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        }
      } catch (e) {}
      return
    }

    try {
      const saved = await storageGet(area, SETTINGS_KEY)
      if (saved) {
        currentSettings = { ...DEFAULT_SETTINGS, ...saved }
      } else {
        // Migration from localStorage
        const legacy = localStorage.getItem(SETTINGS_KEY)
        if (legacy) {
          currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(legacy) }
          await storageSet(area, { [SETTINGS_KEY]: currentSettings })
        }
      }
    } catch (e) {
      console.warn('[svb] failed to load settings from chrome storage', e)
    }
  }

  async function save() {
    const area = getChromeStorageArea()
    if (!area) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings))
      } catch (e) {}
      return
    }

    try {
      await storageSet(area, { [SETTINGS_KEY]: currentSettings })
    } catch (e) {
      console.warn('[svb] failed to save settings to chrome storage', e)
    }
  }

  return {
    async init() {
      if (initialized) return
      await load()
      initialized = true
    },
    get(key) {
      return currentSettings[key]
    },
    getAll() {
      return { ...currentSettings }
    },
    set(key, value) {
      if (currentSettings[key] === value) return
      currentSettings[key] = value
      void save()
      listeners.forEach(l => l(currentSettings))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

// Global instance
const settingsStore = createSettingsStore()

module.exports = { settingsStore }

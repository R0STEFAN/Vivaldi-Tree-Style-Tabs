const SETTINGS_KEY = 'svb-settings'
const DEFAULT_SETTINGS = {
  childPosition: 'bottom',
  activateAfterClose: 'above',
}

function createSettingsStore() {
  let currentSettings = { ...DEFAULT_SETTINGS }
  const listeners = new Set()

  function load() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.warn('[svb] failed to load settings', e)
    }
  }

  function save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings))
    } catch (e) {
      console.warn('[svb] failed to save settings', e)
    }
  }

  // Initial load
  load()

  return {
    get(key) {
      return currentSettings[key]
    },
    getAll() {
      return { ...currentSettings }
    },
    set(key, value) {
      if (currentSettings[key] === value) return
      currentSettings[key] = value
      save()
      listeners.forEach(l => l(currentSettings))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

// Global instance for simple access in logic files
const settingsStore = createSettingsStore()

module.exports = { settingsStore }

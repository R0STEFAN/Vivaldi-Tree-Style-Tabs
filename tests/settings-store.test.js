const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert')
const { settingsStore, createSettingsStore, DEFAULT_SETTINGS } = require('../src/store/settings-store.js')

describe('settingsStore - newTabPlacement', () => {
  beforeEach(() => {
    settingsStore.set('newTabPlacement', 'bottom')
  })

  it('has newTabPlacement bottom in DEFAULT_SETTINGS', () => {
    assert.strictEqual(DEFAULT_SETTINGS.newTabPlacement, 'bottom')
  })

  it('defaults newTabPlacement to bottom on fresh store', () => {
    const store = createSettingsStore()
    assert.strictEqual(store.get('newTabPlacement'), 'bottom')
  })

  it('allows updating newTabPlacement to top and back', () => {
    settingsStore.set('newTabPlacement', 'top')
    assert.strictEqual(settingsStore.get('newTabPlacement'), 'top')
    settingsStore.set('newTabPlacement', 'bottom')
    assert.strictEqual(settingsStore.get('newTabPlacement'), 'bottom')
  })
})

describe('settingsStore - autoHideMode', () => {
  beforeEach(() => {
    settingsStore.set('autoHideMode', 'full')
  })

  it('has autoHideMode full in DEFAULT_SETTINGS', () => {
    assert.strictEqual(DEFAULT_SETTINGS.autoHideMode, 'full')
  })

  it('defaults autoHideMode to full on fresh store', () => {
    const store = createSettingsStore()
    assert.strictEqual(store.get('autoHideMode'), 'full')
  })

  it('allows updating autoHideMode to icons and back', () => {
    settingsStore.set('autoHideMode', 'icons')
    assert.strictEqual(settingsStore.get('autoHideMode'), 'icons')
    settingsStore.set('autoHideMode', 'full')
    assert.strictEqual(settingsStore.get('autoHideMode'), 'full')
  })
})

describe('settingsStore - autoCloseTabsDays', () => {
  beforeEach(() => {
    settingsStore.set('autoCloseTabsDays', 0)
  })

  it('has autoCloseTabsDays 0 in DEFAULT_SETTINGS', () => {
    assert.strictEqual(DEFAULT_SETTINGS.autoCloseTabsDays, 0)
  })

  it('defaults autoCloseTabsDays to 0 on fresh store', () => {
    const store = createSettingsStore()
    assert.strictEqual(store.get('autoCloseTabsDays'), 0)
  })

  it('allows updating autoCloseTabsDays to various day thresholds', () => {
    const dayOptions = [0, 1, 2, 3, 4, 5, 7, 14, 21, 30]
    for (const days of dayOptions) {
      settingsStore.set('autoCloseTabsDays', days)
      assert.strictEqual(settingsStore.get('autoCloseTabsDays'), days)
    }
  })
})

describe('settingsStore - Gemini AI settings', () => {
  it('has correct defaults for Gemini settings in DEFAULT_SETTINGS', () => {
    assert.strictEqual(DEFAULT_SETTINGS.geminiApiKey, '')
    assert.strictEqual(DEFAULT_SETTINGS.geminiModel, 'gemini-2.5-flash')
    assert.strictEqual(DEFAULT_SETTINGS.geminiFolderLanguage, 'uk')
  })

  it('defaults Gemini settings on fresh store', () => {
    const store = createSettingsStore()
    assert.strictEqual(store.get('geminiApiKey'), '')
    assert.strictEqual(store.get('geminiModel'), 'gemini-2.5-flash')
    assert.strictEqual(store.get('geminiFolderLanguage'), 'uk')
  })

  it('allows updating Gemini settings', () => {
    settingsStore.set('geminiApiKey', 'AIzaSyTestKey')
    settingsStore.set('geminiModel', 'gemini-2.0-flash')
    settingsStore.set('geminiFolderLanguage', 'en')

    assert.strictEqual(settingsStore.get('geminiApiKey'), 'AIzaSyTestKey')
    assert.strictEqual(settingsStore.get('geminiModel'), 'gemini-2.0-flash')
    assert.strictEqual(settingsStore.get('geminiFolderLanguage'), 'en')

    // Clean up
    settingsStore.set('geminiApiKey', '')
    settingsStore.set('geminiModel', 'gemini-2.5-flash')
    settingsStore.set('geminiFolderLanguage', 'uk')
  })
})

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

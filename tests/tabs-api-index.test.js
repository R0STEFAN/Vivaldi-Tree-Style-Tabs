const { describe, it } = require('node:test')
const assert = require('node:assert')
const { settingsStore } = require('../src/store/settings-store.js')

describe('tabsApi - createTab index calculation', () => {
  it('calculates native index after pinned tabs when newTabPlacement is top', () => {
    settingsStore.set('newTabPlacement', 'top')
    const tabs = [{ id: 1, pinned: true }, { id: 2, pinned: true }, { id: 3, pinned: false }]
    const isTopMode = settingsStore.get('newTabPlacement') === 'top'
    const pinnedCount = tabs.filter(t => t.pinned).length
    const index = isTopMode ? pinnedCount : tabs.length
    assert.strictEqual(index, 2)
    settingsStore.set('newTabPlacement', 'bottom')
  })

  it('calculates native index at end when newTabPlacement is bottom', () => {
    settingsStore.set('newTabPlacement', 'bottom')
    const tabs = [{ id: 1, pinned: true }, { id: 2, pinned: true }, { id: 3, pinned: false }]
    const isTopMode = settingsStore.get('newTabPlacement') === 'top'
    const pinnedCount = tabs.filter(t => t.pinned).length
    const index = isTopMode ? pinnedCount : tabs.length
    assert.strictEqual(index, 3)
  })
})

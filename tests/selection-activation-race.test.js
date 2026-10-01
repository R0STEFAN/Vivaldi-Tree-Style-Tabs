const test = require('node:test')
const assert = require('node:assert/strict')
const { createSelectionStore } = require('../src/store/selection-store.js')

// Vivaldi PageStore.ie sends tabs.highlight using PageStore indices. During
// removal those indices can still describe the list before Chrome removed a tab.
for (const closing of [11, 12]) {
  test(`reflecting browser activation must not enqueue stale-index highlight after closing ${closing}`, () => {
    const store = createSelectionStore()
    const before = [10, 11, 12, 13, 20]
    const target = before[before.indexOf(closing) + 1]
    let activeId = target
    const pendingHighlights = []
    store.subscribe((state, source) => {
      if (source !== 'browser' && state.selectedIds.length) {
        pendingHighlights.push(before.indexOf(state.selectedIds[0]))
      }
    })
    store.selectSingle(target, { source: 'browser' })
    const after = before.filter(id => id !== closing)
    for (const index of pendingHighlights) activeId = after[index]
    assert.equal(activeId, target, 'native highlight must not activate the next tab, including outside the tree')
    assert.deepEqual(store.getState().selectedIds, [target])
    assert.equal(pendingHighlights.length, 0)
  })
}

test('browser pruning stays local while explicit multi-selection is forwarded', () => {
  const store = createSelectionStore()
  const nativeSelections = []
  store.subscribe((state, source) => {
    if (source !== 'browser' && state.selectedIds.length) nativeSelections.push(state.selectedIds)
  })
  store.selectMany([11, 12, 13])
  store.retainValid([10, 12, 13])
  assert.deepEqual(nativeSelections, [[11, 12, 13]])
  assert.deepEqual(store.getState().selectedIds, [12, 13])
  store.toggleSelected(20)
  assert.deepEqual(nativeSelections.at(-1), [12, 13, 20])
})

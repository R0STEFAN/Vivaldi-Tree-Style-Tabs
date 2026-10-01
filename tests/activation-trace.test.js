const test = require('node:test')
const assert = require('node:assert/strict')
const { createActivationTrace } = require('../src/diagnostics/activation-trace.js')

test('trace preserves API result and error, records browser events once, and excludes page content', async () => {
  let activated
  const error = new Error('private URL')
  const raw = {
    onActivated(fn) { activated = fn },
    onRemoved() {},
    async getTabs() { return [{ id: 1, active: true, url: 'secret', title: 'secret' }] },
    async activateTab(id) { activated({ tabId: id, windowId: 2 }); return id },
    async closeTab() { throw error },
  }
  const trace = createActivationTrace(raw)
  assert.equal(await trace.api.activateTab(1), 1)
  await trace.api.getTabs(2)
  await assert.rejects(trace.api.closeTab(1), e => e === error)
  const records = trace.snapshot()
  assert.equal(records.filter(r => r.event === 'browser.activated').length, 1)
  assert.equal(records.filter(r => r.event === 'api.activateTab.start').length, 1)
  assert.equal(JSON.stringify(records).includes('secret'), false)
  assert.equal(JSON.stringify(records).includes('private URL'), false)
})

test('trace is bounded and snapshots do not mutate retained records', () => {
  const trace = createActivationTrace({}, 3)
  for (let id = 0; id < 10; id++) trace.record('click', { id })
  const snapshot = trace.snapshot()
  assert.deepEqual(snapshot.map(r => r.data.id), [7, 8, 9])
  snapshot[0].data.id = -1
  assert.equal(trace.snapshot()[0].data.id, 7)
})

test('wrapper returns the original promise and disposes only its own listeners', async () => {
  const listeners = new Set()
  const existing = () => {}
  listeners.add(existing)
  const result = Promise.resolve(42)
  const trace = createActivationTrace({
    activateTab() { return result },
    onActivated(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  })
  assert.strictEqual(trace.api.activateTab(42), result)
  await result
  assert.equal(listeners.size, 2)
  trace.dispose()
  assert.deepEqual([...listeners], [existing])
})

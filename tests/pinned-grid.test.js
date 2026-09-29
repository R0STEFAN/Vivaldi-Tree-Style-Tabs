const { test } = require('node:test')
const assert = require('node:assert/strict')
const { syncPinnedGrid } = require('../src/ui/pinned-grid.js')

function tab(left, top, active = false) {
  return {
    offsetLeft: left, offsetTop: top,
    classList: { contains: name => name === 'is-active' && active },
    dataset: {},
    style: { setProperty(name, value) { this[name] = value } },
  }
}

test('keeps one representative per expanded row, preferring the active tab in its own row', () => {
  const children = [tab(2, 4), tab(34, 4), tab(66, 4), tab(2, 36), tab(34, 36, true)]
  syncPinnedGrid({ children })
  assert.deepEqual(children.map(node => node.dataset.stripVisible), ['true', 'false', 'false', 'false', 'true'])
  assert.equal(children[4].style['--svb-strip-offset'], '-32px')
  assert.equal(children[0].style['--svb-strip-offset'], '0px')
})

test('recomputes representatives after activation, resizing, reordering and removal', () => {
  const a = tab(2, 4, true)
  const b = tab(34, 4)
  const c = tab(2, 36)
  const grid = { children: [a, b, c] }
  syncPinnedGrid(grid)
  a.classList.contains = () => false
  b.classList.contains = name => name === 'is-active'
  syncPinnedGrid(grid)
  assert.deepEqual(grid.children.map(node => node.dataset.stripVisible), ['false', 'true', 'true'])
  c.offsetLeft = 66
  c.offsetTop = 4
  syncPinnedGrid(grid)
  assert.deepEqual(grid.children.map(node => node.dataset.stripVisible), ['false', 'true', 'false'])
  grid.children = [c, a]
  c.offsetLeft = 2
  a.offsetLeft = 34
  syncPinnedGrid(grid)
  assert.deepEqual(grid.children.map(node => node.dataset.stripVisible), ['true', 'false'])
  grid.children = []
  assert.doesNotThrow(() => syncPinnedGrid(grid))
})

// Read the full-width layout, even while the shell is collapsed. Visibility
// and translate do not affect these offsets or the space occupied by a row.
function syncPinnedGrid(grid) {
  const rows = new Map()
  const entries = Array.from(grid.children, node => ({
    node, left: node.offsetLeft, top: node.offsetTop,
  }))
  for (const entry of entries) {
    let row = rows.get(entry.top)
    if (!row) {
      row = { left: entry.left, representative: entry.node }
      rows.set(entry.top, row)
    }
    if (entry.node.classList.contains('is-active')) row.representative = entry.node
  }
  for (const { node, left, top } of entries) {
    const row = rows.get(top)
    node.dataset.stripVisible = String(node === row.representative)
    node.style.setProperty('--svb-strip-offset', `${row.left - left}px`)
  }
}

module.exports = { syncPinnedGrid }

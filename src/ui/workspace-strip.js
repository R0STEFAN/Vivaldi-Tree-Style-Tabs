// Calculates the translate offset for the active workspace icon in icon-strip mode
// so that it aligns seamlessly with the collapsed icon strip.
function syncWorkspaceStrip(bar) {
  if (!bar) return
  const scroller = bar.querySelector('.svb-workspaces__icons')
  if (!scroller) return
  const buttons = Array.from(scroller.querySelectorAll('.svb-workspace'))
  if (buttons.length === 0) return
  const first = buttons[0]
  const active = buttons.find(btn => btn.classList.contains('is-active')) || first
  const firstLeft = first.offsetLeft || 0
  const activeLeft = active.offsetLeft || 0
  const scrollLeft = scroller.scrollLeft || 0
  const offset = firstLeft - (activeLeft - scrollLeft)

  for (const btn of buttons) {
    if (btn === active) {
      btn.style.setProperty('--svb-strip-offset', `${offset}px`)
    } else {
      btn.style.removeProperty('--svb-strip-offset')
    }
  }
}

module.exports = { syncWorkspaceStrip }

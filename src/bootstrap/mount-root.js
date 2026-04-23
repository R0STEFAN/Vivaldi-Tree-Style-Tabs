const { STYLE_TEXT } = require('../ui/styles.js')

function ensureStyleTag() {
  let style = document.getElementById('svb-styles')
  if (style) return style

  style = document.createElement('style')
  style.id = 'svb-styles'
  style.textContent = STYLE_TEXT
  document.head.appendChild(style)
  return style
}

function mountRoot(id) {
  ensureStyleTag()

  const host = document.querySelector('#browser > #main > .inner')
  if (!host) {
    return null
  }

  host.classList.add('svb-layout-host')

  let root = document.getElementById(id)
  if (!root) {
    root = document.createElement('aside')
    root.id = id
    root.className = 'svb-shell'
    host.prepend(root)
  }

  let trigger = document.getElementById(`${id}-trigger`)
  if (!trigger) {
    trigger = document.createElement('div')
    trigger.id = `${id}-trigger`
    trigger.className = 'svb-edge-trigger'
    host.prepend(trigger)
  }

  let dragShield = document.getElementById(`${id}-drag-shield`)
  if (!dragShield) {
    dragShield = document.createElement('div')
    dragShield.id = `${id}-drag-shield`
    dragShield.className = 'svb-drag-shield'
    host.appendChild(dragShield)
  }

  return { root, host, trigger, dragShield }
}

module.exports = { mountRoot }

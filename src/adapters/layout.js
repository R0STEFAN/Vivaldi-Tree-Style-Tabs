function createLayoutAdapter(options) {
  const { root, host, trigger, dragShield, panelStore } = options
  const MIN_WIDTH = 30
  const MAX_WIDTH = 520
  let observer = null
  let resizeHandler = null
  let revealed = false
  let unlistenPanel = null
  let currentPinned = panelStore.getState().pinned
  let currentWidth = panelStore.getState().width
  let dragState = null
  let fullscreen = false
  let windowFullscreen = false

  function hasFullscreenClass(element) {
    if (!element || !element.classList) return false
    return element.classList.contains('fullscreen')
      || element.classList.contains('is-fullscreen')
      || element.classList.contains('fullscreened')
  }

  function getRenderedWidth() {
    return dragState ? dragState.previewWidth : currentWidth
  }

  function detectFullscreen() {
    const browser = document.querySelector('#browser')
    const app = document.querySelector('#app')
    return windowFullscreen
      || !!document.fullscreenElement
      || !!document.webkitFullscreenElement
      || !!document.mozFullScreenElement
      || !!document.msFullscreenElement
      || hasFullscreenClass(document.documentElement)
      || hasFullscreenClass(document.body)
      || hasFullscreenClass(browser)
      || hasFullscreenClass(app)
  }

  function apply() {
    if (!host || !root || !trigger || !dragShield) return

    if (!host.classList.contains('svb-layout-host')) {
      host.classList.add('svb-layout-host')
    }

    if (host.style.getPropertyValue('--svb-sidebar-width') !== `${currentWidth}px`) {
      host.style.setProperty('--svb-sidebar-width', `${currentWidth}px`)
    }

    if (root.style.width !== `${getRenderedWidth()}px`) {
      root.style.width = `${getRenderedWidth()}px`
    }

    host.classList.toggle('svb-mode-docked', currentPinned)
    host.classList.toggle('svb-mode-overlay', !currentPinned)
    host.classList.toggle('svb-is-fullscreen', fullscreen)
    root.classList.toggle('is-revealed', !fullscreen && (currentPinned || revealed))
    trigger.classList.toggle('is-enabled', !fullscreen && !currentPinned)
    dragShield.classList.toggle('is-active', !fullscreen && Boolean(dragState))
  }

  function refreshFullscreen() {
    const nextFullscreen = detectFullscreen()
    if (fullscreen === nextFullscreen) return
    fullscreen = nextFullscreen
    if (fullscreen) {
      revealed = false
      stopDragging()
    }
    apply()
  }

  function setRevealed(value) {
    if (currentPinned) return
    if (revealed === value) return
    revealed = value
    apply()
  }

  function stopDragging() {
    if (!dragState) return
    const { previewWidth } = dragState
    window.removeEventListener('pointermove', dragState.onPointerMove)
    window.removeEventListener('pointerup', dragState.onPointerUp)
    document.body.classList.remove('svb-is-resizing')
    dragState = null
    panelStore.setWidth(previewWidth)
    apply()
  }

  function startDragging(event) {
    const handle = event.target.closest('.svb-resize-handle')
    if (!handle || !host) return

    event.preventDefault()

    const hostRect = host.getBoundingClientRect()
    const onPointerMove = moveEvent => {
      dragState.previewWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(moveEvent.clientX - hostRect.left)))
      apply()
    }
    const onPointerUp = () => {
      stopDragging()
    }

    dragState = {
      previewWidth: currentWidth,
      onPointerMove,
      onPointerUp,
    }
    document.body.classList.add('svb-is-resizing')
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function start() {
    fullscreen = detectFullscreen()
    apply()

    const windowsApi = typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null
    const updateWindowFullscreen = win => {
      const nextWindowFullscreen = !!(win && win.state === 'fullscreen')
      if (windowFullscreen === nextWindowFullscreen) return
      windowFullscreen = nextWindowFullscreen
      refreshFullscreen()
    }
    if (windowsApi && typeof windowsApi.getCurrent === 'function') {
      windowsApi.getCurrent(updateWindowFullscreen)
    }
    if (windowsApi && windowsApi.onBoundsChanged && typeof windowsApi.onBoundsChanged.addListener === 'function') {
      windowsApi.onBoundsChanged.addListener(updateWindowFullscreen)
    }

    resizeHandler = () => apply()
    window.addEventListener('resize', resizeHandler)

    observer = new MutationObserver(() => {
      refreshFullscreen()
      apply()
    })

    const browser = document.querySelector('#browser')
    if (browser) {
      observer.observe(browser, {
        childList: true,
        subtree: true,
      })
    }

    document.addEventListener('fullscreenchange', refreshFullscreen)
    document.addEventListener('webkitfullscreenchange', refreshFullscreen)
    document.addEventListener('mozfullscreenchange', refreshFullscreen)
    document.addEventListener('MSFullscreenChange', refreshFullscreen)
    window.addEventListener('resize', refreshFullscreen)

    trigger.addEventListener('mouseenter', () => setRevealed(true))
    root.addEventListener('mouseenter', () => setRevealed(true))
    root.addEventListener('mouseleave', () => setRevealed(false))
    root.addEventListener('pointerdown', startDragging)

    unlistenPanel = panelStore.subscribe(nextState => {
      currentPinned = nextState.pinned
      currentWidth = nextState.width
      if (currentPinned) {
        revealed = false
      }
      apply()
    })
  }

  return { apply, start }
}

module.exports = { createLayoutAdapter }

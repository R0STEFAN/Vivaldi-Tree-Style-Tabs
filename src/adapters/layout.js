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
    if (!root || !trigger || !dragShield) return

    // Re-verify host in case it was moved or changed
    let currentHost = host
    if (!currentHost || !document.body.contains(currentHost)) {
      currentHost = document.querySelector('.svb-layout-host')
        || document.querySelector('#browser > #main > .inner')
        || document.querySelector('#main > .inner')
    }
    
    if (!currentHost) return

    if (!currentHost.classList.contains('svb-layout-host')) {
      currentHost.classList.add('svb-layout-host')
    }

    const renderedWidth = getRenderedWidth()

    // Sync both variables immediately for smooth layout movement
    if (currentHost.style.getPropertyValue('--svb-sidebar-width') !== `${renderedWidth}px`) {
      currentHost.style.setProperty('--svb-sidebar-width', `${renderedWidth}px`)
    }

    if (root.style.width !== `${renderedWidth}px`) {
      root.style.width = `${renderedWidth}px`
    }

    currentHost.classList.toggle('svb-mode-docked', currentPinned)
    currentHost.classList.toggle('svb-mode-overlay', !currentPinned)
    currentHost.classList.toggle('svb-is-fullscreen', fullscreen)
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
    
    const { previewWidth, onPointerMove, onPointerUp, onPointerCancel } = dragState
    
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerCancel)
    
    document.body.classList.remove('svb-is-resizing')
    dragState = null
    
    panelStore.setWidth(previewWidth)
    apply()
  }

  function startDragging(event) {
    const handle = event.target.closest('.svb-resize-handle')
    if (!handle || dragState) return

    const currentHost = document.querySelector('.svb-layout-host')
      || document.querySelector('#browser > #main > .inner')
      || document.querySelector('#main > .inner')
    
    if (!currentHost) return

    event.preventDefault()
    
    const hostRect = currentHost.getBoundingClientRect()
    let frameRequested = false

    const onPointerMove = moveEvent => {
      if (!dragState || frameRequested) return
      
      const nextWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(moveEvent.clientX - hostRect.left)))
      
      if (dragState.previewWidth !== nextWidth) {
        frameRequested = true
        requestAnimationFrame(() => {
          if (!dragState) {
            frameRequested = false
            return
          }
          dragState.previewWidth = nextWidth
          apply()
          frameRequested = false
        })
      }
    }

    const onPointerUp = () => stopDragging()
    const onPointerCancel = onPointerUp

    dragState = {
      previewWidth: currentWidth,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    }

    document.body.classList.add('svb-is-resizing')
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerCancel)
    
    apply()
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

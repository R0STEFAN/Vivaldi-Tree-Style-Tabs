const { settingsStore } = require('../store/settings-store.js')

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

    const browser = document.querySelector('#browser')
    if (browser) {
      browser.classList.toggle('svb-is-fullscreen', fullscreen)
    }

    const panelPosition = settingsStore.get('panelPosition')
    currentHost.classList.toggle('svb-position-right', panelPosition === 'right')
    trigger.classList.toggle('svb-position-right', panelPosition === 'right')

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
    const panelPosition = settingsStore.get('panelPosition')
    const isRight = panelPosition === 'right'

    const onPointerMove = moveEvent => {
      if (!dragState || frameRequested) return
      
      const nextWidth = isRight
        ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(hostRect.right - moveEvent.clientX)))
        : Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(moveEvent.clientX - hostRect.left)))
      
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

  let windowsApi = null
  let updateWindowFullscreen = null
  let rootMouseEnter = null
  let rootMouseLeave = null
  let rootPointerLeave = null
  let hideOnExternalHover = null
  let globalMouseMove = null
  let globalMouseLeave = null
  let clearRevealDelay = null
  let triggerRevealWithDelay = null
  let mouseMoveRaf = null

  function start() {
    fullscreen = detectFullscreen()
    apply()

    windowsApi = typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null
    updateWindowFullscreen = win => {
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

    let revealTimeout = null
    const REVEAL_DELAY = 150 // Delay in ms before showing panel

    clearRevealDelay = () => {
      if (revealTimeout) {
        clearTimeout(revealTimeout)
        revealTimeout = null
      }
    }

    triggerRevealWithDelay = () => {
      if (revealed || currentPinned || fullscreen || dragState) return
      if (!revealTimeout) {
        revealTimeout = setTimeout(() => {
          setRevealed(true)
          revealTimeout = null
        }, REVEAL_DELAY)
      }
    }

    trigger.addEventListener('mouseenter', triggerRevealWithDelay)
    trigger.addEventListener('mouseleave', clearRevealDelay)
    
    rootMouseEnter = () => {
      clearRevealDelay()
      setRevealed(true)
    }
    rootMouseLeave = () => setRevealed(false)
    rootPointerLeave = () => setRevealed(false)

    root.addEventListener('mouseenter', rootMouseEnter)
    root.addEventListener('mouseleave', rootMouseLeave)
    root.addEventListener('pointerleave', rootPointerLeave)
    root.addEventListener('pointerdown', startDragging)

    // Handle surface crossing where native webviews swallow pointer events and prevent mouseleave.
    // Also handles dynamic webview container creation and moving the mouse out of the panel into other UI.
    hideOnExternalHover = event => {
      if (!revealed || currentPinned || fullscreen || dragState) return
      
      const target = event.target
      if (target && !root.contains(target) && !trigger.contains(target) && target !== dragShield) {
        setRevealed(false)
      }
    }
    
    document.addEventListener('mouseover', hideOnExternalHover)
    document.addEventListener('pointerover', hideOnExternalHover)

    let latestMouseX = 0
    let mouseMovePending = false

    const performMouseMoveCheck = () => {
      mouseMovePending = false
      if (revealed || currentPinned || fullscreen || dragState) {
        clearRevealDelay()
        return
      }
      
      const panelPosition = settingsStore.get('panelPosition')
      const isRight = panelPosition === 'right'
      const threshold = 15 // Wider logical trigger zone (doesn't block clicks)
      
      const inZone = !isRight ? (latestMouseX <= threshold) : (latestMouseX >= window.innerWidth - threshold)
      
      if (inZone) {
        triggerRevealWithDelay()
      } else {
        clearRevealDelay()
      }
    }

    globalMouseMove = event => {
      latestMouseX = event.clientX
      if (!mouseMovePending) {
        mouseMovePending = true
        mouseMoveRaf = window.requestAnimationFrame(performMouseMoveCheck)
      }
    }

    globalMouseLeave = () => {
      clearRevealDelay() // Mouse left the window completely, cancel reveal
    }

    document.addEventListener('mousemove', globalMouseMove)
    document.addEventListener('mouseleave', globalMouseLeave)

    unlistenPanel = panelStore.subscribe(nextState => {
      currentPinned = nextState.pinned
      currentWidth = nextState.width
      if (currentPinned) {
        revealed = false
      }
      apply()
    })
  }

  function dispose() {
    if (windowsApi && windowsApi.onBoundsChanged && typeof windowsApi.onBoundsChanged.removeListener === 'function') {
      windowsApi.onBoundsChanged.removeListener(updateWindowFullscreen)
    }
    window.removeEventListener('resize', resizeHandler)
    if (observer) observer.disconnect()
    document.removeEventListener('fullscreenchange', refreshFullscreen)
    document.removeEventListener('webkitfullscreenchange', refreshFullscreen)
    document.removeEventListener('mozfullscreenchange', refreshFullscreen)
    document.removeEventListener('MSFullscreenChange', refreshFullscreen)
    window.removeEventListener('resize', refreshFullscreen)

    trigger.removeEventListener('mouseenter', triggerRevealWithDelay)
    trigger.removeEventListener('mouseleave', clearRevealDelay)
    root.removeEventListener('mouseenter', rootMouseEnter)
    root.removeEventListener('mouseleave', rootMouseLeave)
    root.removeEventListener('pointerleave', rootPointerLeave)
    root.removeEventListener('pointerdown', startDragging)

    document.removeEventListener('mouseover', hideOnExternalHover)
    document.removeEventListener('pointerover', hideOnExternalHover)
    document.removeEventListener('mousemove', globalMouseMove)
    document.removeEventListener('mouseleave', globalMouseLeave)

    if (mouseMoveRaf) {
      window.cancelAnimationFrame(mouseMoveRaf)
      mouseMoveRaf = null
    }

    if (clearRevealDelay) clearRevealDelay()
    if (unlistenPanel) unlistenPanel()
  }

  return { apply, start, dispose }
}

module.exports = { createLayoutAdapter }

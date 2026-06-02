# Windows Compatibility & Layout Fixes (Vivaldi Tree Style Tabs)

This document contains the consolidated, verified changes required to fix panel resizing and alignment issues on Windows.

## 1. UI Resizing Logic Fixes
**File:** `src/adapters/layout.js`

### Key Changes:
- Switch from `window` to `document` for event listeners (prevents event swallowing by webviews).
- Use `requestAnimationFrame` for smooth UI updates.
- Update both the sidebar width and the CSS variable `--svb-sidebar-width` synchronously during dragging.
- Implement robust host detection that re-validates the element on every update.

### Implementation:
Replace the `startDragging`, `stopDragging`, and `apply` functions with the following:

```javascript
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
```

---

## 2. Layout Alignment & Gap Fixes
**File:** `src/ui/styles.js`

### Key Changes:
- Reset `margin` and `padding` on all Vivaldi parent containers to ensure zero-pixel alignment.
- Remove the 2px "peeking" offset from the hidden panel.
- Remove the 4px left padding in `is-unified` mode (Unified Sidebar).
- Increase `z-index` and width for the hover trigger.
- Use `!important` on critical positioning properties to override Vivaldi's native styles.

### Implementation:
Update the following CSS blocks in `STYLE_TEXT`:

```css
/* Hard reset for all parent containers */
#browser, 
#main, 
.svb-layout-host {
  padding-left: 0 !important;
  margin-left: 0 !important;
  border-left: none !important;
}

.svb-layout-host {
  position: relative;
}

/* Webbview pushing logic */
.svb-layout-host.svb-mode-docked #webview-container,
.svb-layout-host.svb-mode-docked .StatusInfo,
.svb-layout-host.svb-mode-docked #addressbar {
  margin-left: var(--svb-sidebar-width, 300px) !important;
  width: auto !important;
}

.svb-layout-host.svb-mode-overlay #webview-container,
.svb-layout-host.svb-mode-overlay .StatusInfo,
.svb-layout-host.svb-mode-overlay #addressbar {
  margin-left: 0 !important;
}

/* Panel positioning */
#svb-root.svb-shell {
  /* ... other variables ... */
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  bottom: 0 !important;
  margin: 0 !important;
  z-index: 1000;
  transform: translateX(-100%) !important; /* Fixed: no +2px gap */
}

/* Revealed / Docked state */
#svb-root.svb-shell.is-revealed,
.svb-layout-host.svb-mode-docked #svb-root.svb-shell {
  opacity: 1 !important;
  transform: translateX(0) !important;
}

/* Hover Trigger */
#svb-root-trigger.svb-edge-trigger {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  bottom: 0 !important;
  width: 12px; /* Increased for better hit detection */
  z-index: 100000;
  display: none;
  pointer-events: auto;
}

/* Remove Unified Mode left padding */
#svb-root.svb-shell.is-unified {
  padding: 0 0 4px 0 !important; /* Fixed: was 4px on left */
}
```

---
**Summary of Actions for the next agent:**
1. Apply the JavaScript refactoring in `src/adapters/layout.js`.
2. Apply the CSS updates in `src/ui/styles.js`.
3. Run `npm run build` (or `node build/build.mjs`).
4. Apply the patch to Vivaldi using the `.bat` or `.sh` script.

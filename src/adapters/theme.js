function readCssVar(style, name) {
  return style.getPropertyValue(name).trim()
}

// Resolve any CSS color string (hex / named / rgb / hsl / var-resolved value)
// to {r,g,b,a} by letting the browser normalize it through a probe element.
function createColorParser() {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  probe.style.position = 'absolute'
  document.documentElement.appendChild(probe)

  return function toRgb(value) {
    if (value == null) return null
    const input = String(value).trim()
    if (!input) return null

    // Sentinel lets us detect strings the browser rejects (it keeps the prior value).
    probe.style.color = 'rgb(1, 2, 3)'
    probe.style.color = input
    const computed = getComputedStyle(probe).color
    if (computed === 'rgb(1, 2, 3)' && input.replace(/\s+/g, '') !== 'rgb(1,2,3)') {
      return null
    }

    const match = computed.match(/rgba?\(([^)]+)\)/)
    if (!match) return null
    const parts = match[1].split(',').map(part => parseFloat(part.trim()))
    if (parts.length < 3 || parts.some(n => Number.isNaN(n))) return null
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 }
  }
}

function relativeLuminance({ r, g, b }) {
  const channel = value => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(lumA, lumB) {
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

function isTransparentColor(value) {
  if (!value) return true

  const normalized = String(value).trim().toLowerCase()
  if (!normalized) return true
  if (normalized === 'transparent') return true
  if (normalized === 'rgba(0, 0, 0, 0)' || normalized === 'rgba(0,0,0,0)') return true
  if (normalized === 'hsla(0, 0%, 0%, 0)' || normalized === 'hsla(0,0%,0%,0)') return true

  const rgbaMatch = normalized.match(/^rgba\((.+)\)$/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map(part => part.trim())
    const alpha = Number(parts[3])
    if (!Number.isNaN(alpha) && alpha <= 0) return true
  }

  const hslaMatch = normalized.match(/^hsla\((.+)\)$/)
  if (hslaMatch) {
    const parts = hslaMatch[1].split(',').map(part => part.trim())
    const alpha = Number(parts[3])
    if (!Number.isNaN(alpha) && alpha <= 0) return true
  }

  return false
}

function firstUsable(values, fallback, options) {
  const { allowTransparent = false } = options || {}

  for (const value of values) {
    const normalized = value && String(value).trim()
    if (!normalized) continue
    if (!allowTransparent && isTransparentColor(normalized)) continue
    return normalized
  }
  return fallback
}

function setVar(style, name, value) {
  if (!value) return
  style.setProperty(name, value)
}

function createThemeAdapter(root) {
  const browserEl = document.querySelector('#browser')
  if (!browserEl) {
    return {
      start() {},
      apply() {},
    }
  }

  const browserStyle = () => getComputedStyle(browserEl)
  const toRgb = createColorParser()

  // Keep `fg` only if it reads clearly on `bg`; otherwise fall back to a
  // luminance-appropriate color. This is a no-op when the theme already
  // provides a contrasting foreground (e.g. the default dark theme).
  function pickReadableFg(bg, fg, minContrast, darkFallback, lightFallback) {
    const bgRgb = toRgb(bg)
    if (!bgRgb) return fg || lightFallback
    const bgLum = relativeLuminance(bgRgb)
    const fgRgb = toRgb(fg)
    if (fgRgb && contrastRatio(relativeLuminance(fgRgb), bgLum) >= minContrast) {
      return fg
    }
    return bgLum > 0.42 ? darkFallback : lightFallback
  }

  function resolveThemeValues() {
    const b = browserStyle()
    const isUnified = browserEl.classList.contains('unified-ui') || browserEl.classList.contains('unified-ui-transparent')
    const isTransparent = browserEl.classList.contains('unified-ui-transparent')
    const isAccOnTabs = browserEl.classList.contains('color-behind-tabs-on')
    const isTransparentTabs = browserEl.classList.contains('ui-transparent-tabs')
    const isTransparentTabbar = browserEl.classList.contains('transparent-tabbar')

    const tabbarWrapper = document.querySelector('.tabbar-wrapper')
    const panelGroup = document.querySelector('.panel-group')
    const tabsSubcontainer = document.querySelector('#tabs-subcontainer')
    const tabsContainer = document.querySelector('#tabs-container')
    const activeNativeTab = document.querySelector('#tabs-container .tab.active, #tabs-subcontainer .tab.active')
    const nativeTab = document.querySelector('#tabs-container .tab:not(.active), #tabs-subcontainer .tab:not(.active)')

    const tabbarWrapperStyle = tabbarWrapper ? getComputedStyle(tabbarWrapper) : null
    const panelStyle = panelGroup ? getComputedStyle(panelGroup) : null
    const subcontainerStyle = tabsSubcontainer ? getComputedStyle(tabsSubcontainer) : null
    const tabsContainerStyle = tabsContainer ? getComputedStyle(tabsContainer) : null
    const activeTabStyle = activeNativeTab ? getComputedStyle(activeNativeTab) : null
    const nativeTabStyle = nativeTab ? getComputedStyle(nativeTab) : null

    const browserBg = b.backgroundColor
    const browserFg = b.color
    const accentBgDark = readCssVar(b, '--colorAccentBgDark')
    const accentBgDarker = readCssVar(b, '--colorAccentBgDarker')
    const accentFg = readCssVar(b, '--colorAccentFg')
    const colorFg = readCssVar(b, '--colorFg')
    const colorBorderSubtle = readCssVar(b, '--colorBorderSubtle')
    const highlightBg = readCssVar(b, '--colorHighlightBg')
    const radius = readCssVar(b, '--radius') || readCssVar(b, '--radiusHalf')
    const currentRadius = readCssVar(b, '--currentRadius')
    const windowBg = readCssVar(b, '--colorWindowBg')

    const panelBg = firstUsable([
      isUnified && !isTransparent && windowBg,
      tabbarWrapperStyle && tabbarWrapperStyle.backgroundColor,
      panelStyle && panelStyle.backgroundColor,
      subcontainerStyle && subcontainerStyle.backgroundColor,
      tabsContainerStyle && tabsContainerStyle.backgroundColor,
      accentBgDark,
      browserBg,
    ], '#232629')

    const panelBorder = firstUsable([
      isUnified && 'transparent',
      colorBorderSubtle,
      tabbarWrapperStyle && tabbarWrapperStyle.borderColor,
      accentBgDarker,
      readCssVar(b, '--colorBorder'),
      'rgba(255,255,255,0.06)',
    ], 'rgba(255,255,255,0.06)', { allowTransparent: true })

    const panelFg = firstUsable([
      panelStyle && panelStyle.color,
      colorFg,
      browserFg,
    ], '#d8d8d8')

    const tabBg = firstUsable([
      nativeTabStyle && nativeTabStyle.backgroundColor,
      isUnified ? 'transparent' : panelBg,
    ], panelBg)

    const tabHoverBg = firstUsable([
      isUnified && readCssVar(b, '--colorBgAlphaHeavy'),
      readCssVar(b, '--colorBgInverser'),
      readCssVar(b, '--colorBgIntense'),
      'rgba(255,255,255,0.08)',
    ], 'rgba(255,255,255,0.08)', { allowTransparent: true })

    const activeTabBg = firstUsable([
      activeTabStyle && activeTabStyle.backgroundColor,
      isUnified && readCssVar(b, '--colorBgAlphaHeavier'),
      accentBgDark,
      tabBg,
    ], tabBg)

    const activeTabFg = firstUsable([
      activeTabStyle && activeTabStyle.color,
      accentFg,
      panelFg,
    ], panelFg)

    const accent = firstUsable([
      highlightBg,
      accentFg,
      '#47cfff',
    ], '#47cfff')

    const radiusValue = firstUsable([
      currentRadius,
      radius,
      '5px',
    ], '5px', { allowTransparent: true })

    // What the panel text visually sits on. In transparent / blur mode the
    // panel shows the window behind it, so panelBg (a theme surface color) is
    // the wrong luminance reference and can be dark while the real backdrop is
    // light. Prefer the window/browser background in that case.
    const referenceBg = firstUsable([
      isTransparent && windowBg,
      isTransparent && browserBg,
      panelBg,
      windowBg,
      browserBg,
    ], '#232629')

    // Guarantee readable text regardless of light/dark theme. In the default
    // dark theme the inherited colors already contrast, so these are no-ops.
    const panelFgReadable = pickReadableFg(referenceBg, panelFg, 4, '#1b1d21', '#dcdee0')
    const panelFgStrong = pickReadableFg(referenceBg, activeTabFg, 4.5, '#0f1216', '#f5f6f7')

    return {
      panelBg,
      panelBorder,
      panelFg: panelFgReadable,
      panelFgStrong,
      tabBg,
      tabHoverBg,
      activeTabBg,
      activeTabFg,
      accent,
      radiusValue,
      isUnified,
      isTransparent,
      isAccOnTabs,
      isTransparentTabs,
      isTransparentTabbar,
    }
  }

  function apply() {
    const vars = resolveThemeValues()
    const style = root.style

    setVar(style, '--svb-theme-panel-bg', vars.isTransparent ? 'transparent' : vars.panelBg)
    setVar(style, '--svb-theme-panel-border', vars.panelBorder)
    setVar(style, '--svb-theme-panel-fg', vars.panelFg)
    setVar(style, '--svb-theme-panel-fg-strong', vars.panelFgStrong)
    setVar(style, '--svb-theme-tab-bg', vars.tabBg)
    setVar(style, '--svb-theme-tab-hover-bg', vars.tabHoverBg)
    setVar(style, '--svb-theme-tab-active-bg', vars.activeTabBg)
    setVar(style, '--svb-theme-tab-active-fg', vars.activeTabFg)
    setVar(style, '--svb-theme-accent', vars.accent)
    setVar(style, '--svb-theme-radius', vars.radiusValue)

    root.classList.toggle('is-unified', vars.isUnified)
    root.classList.toggle('is-transparent', vars.isTransparent)
    root.classList.toggle('is-acc-on-tabs', vars.isAccOnTabs)
    root.classList.toggle('is-transparent-tabs', vars.isTransparentTabs)
    root.classList.toggle('is-transparent-tabbar', vars.isTransparentTabbar)
  }


  let observer = null

  function start() {
    apply()

    observer = new MutationObserver(() => {
      apply()
    })

    observer.observe(browserEl, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
  }

  function dispose() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return { start, apply, dispose }
}

module.exports = { createThemeAdapter }

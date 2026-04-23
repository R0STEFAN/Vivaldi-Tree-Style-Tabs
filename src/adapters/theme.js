function readCssVar(style, name) {
  return style.getPropertyValue(name).trim()
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

  function resolveThemeValues() {
    const b = browserStyle()
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

    const panelBg = firstUsable([
      tabbarWrapperStyle && tabbarWrapperStyle.backgroundColor,
      panelStyle && panelStyle.backgroundColor,
      subcontainerStyle && subcontainerStyle.backgroundColor,
      tabsContainerStyle && tabsContainerStyle.backgroundColor,
      accentBgDark,
      browserBg,
    ], '#232629')

    const panelBorder = firstUsable([
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
      panelBg,
    ], panelBg)

    const tabHoverBg = firstUsable([
      readCssVar(b, '--colorBgInverser'),
      readCssVar(b, '--colorBgIntense'),
      'rgba(255,255,255,0.08)',
    ], 'rgba(255,255,255,0.08)', { allowTransparent: true })

    const activeTabBg = firstUsable([
      activeTabStyle && activeTabStyle.backgroundColor,
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

    return {
      panelBg,
      panelBorder,
      panelFg,
      tabBg,
      tabHoverBg,
      activeTabBg,
      activeTabFg,
      accent,
      radiusValue,
    }
  }

  function apply() {
    const vars = resolveThemeValues()
    const style = root.style

    setVar(style, '--svb-theme-panel-bg', vars.panelBg)
    setVar(style, '--svb-theme-panel-border', vars.panelBorder)
    setVar(style, '--svb-theme-panel-fg', vars.panelFg)
    setVar(style, '--svb-theme-tab-bg', vars.tabBg)
    setVar(style, '--svb-theme-tab-hover-bg', vars.tabHoverBg)
    setVar(style, '--svb-theme-tab-active-bg', vars.activeTabBg)
    setVar(style, '--svb-theme-tab-active-fg', vars.activeTabFg)
    setVar(style, '--svb-theme-accent', vars.accent)
    setVar(style, '--svb-theme-radius', vars.radiusValue)
  }

  function start() {
    apply()

    const observer = new MutationObserver(() => {
      apply()
    })

    observer.observe(browserEl, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
  }

  return { start, apply }
}

module.exports = { createThemeAdapter }

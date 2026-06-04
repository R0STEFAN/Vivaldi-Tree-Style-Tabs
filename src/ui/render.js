const { settingsStore } = require('../store/settings-store.js')

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const TAB_COLOR_SWATCHES = {
  rose: 'hsl(350deg 72% 64%)',
  amber: 'hsl(34deg 92% 60%)',
  yellow: 'hsl(49deg 96% 58%)',
  green: 'hsl(142deg 52% 52%)',
  teal: 'hsl(179deg 48% 46%)',
  blue: 'hsl(211deg 82% 62%)',
  purple: 'hsl(268deg 66% 66%)',
  pink: 'hsl(319deg 72% 64%)',
}

function renderMenuIcon(name) {
  const paths = {
    restore: '<path d="M5 8a6 6 0 1 1 1.8 4.3"/><path d="M5 4v4h4"/>',
    child: '<path d="M5 5h6v6H5z"/><path d="M11 8h4a4 4 0 0 1 4 4v1"/><path d="M16 11l3 3 3-3"/>',
    move: '<path d="M5 12h14"/><path d="M15 8l4 4-4 4"/>',
    window: '<path d="M4 6h16v12H4z"/><path d="M4 9h16"/>',
    workspace: '<path d="M5 5h6v6H5z"/><path d="M13 5h6v6h-6z"/><path d="M5 13h6v6H5z"/><path d="M13 13h6v6h-6z"/>',
    pin: '<path d="M8 4h8"/><path d="M10 4c.8 2.2.8 4.2 0 6l-3 4h10l-3-4c-.8-1.8-.8-3.8 0-6"/><path d="M12 14v6"/>',
    mute: '<path d="M4 10v4h3l4 3V7l-4 3H4z"/><path d="M16 9l4 6"/><path d="M20 9l-4 6"/>',
    duplicate: '<path d="M8 8h10v10H8z"/><path d="M5 15V5h10"/>',
    close: '<path d="M7 7l10 10"/><path d="M17 7 7 17"/>',
    add: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    rename: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    bookmark: '<path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V20l-6-3.5L6 20z"/>',
    folder: '<path d="M4 7h6l2 2h8v9H4z"/><path d="M4 7v11"/>',
    color: '<path d="M12 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/><path d="M19 15.5a2 2 0 1 1-4 0c0-1.4 2-3.8 2-3.8s2 2.4 2 3.8Z"/><path d="M8.5 18a1.5 1.5 0 1 1-3 0c0-1 1.5-2.9 1.5-2.9S8.5 17 8.5 18Z"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    settings: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
  }
  return `<svg class="svb-menu__icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.workspace}</svg>`
}

function renderContextMenuItem(options) {
  const {
    action,
    icon,
    label,
    disabled = false,
    danger = false,
    submenu = '',
    workspaceId,
    bookmarkTreeId,
  } = options
  const attrs = [
    'class="svb-menu__item' + (danger ? ' is-danger' : '') + (disabled ? ' is-disabled' : '') + (submenu ? ' has-submenu' : '') + '"',
    disabled ? 'aria-disabled="true"' : '',
    action ? `data-role="context-menu-action" data-action="${escapeHtml(action)}"` : '',
    Number.isFinite(workspaceId) ? `data-workspace-id="${workspaceId}"` : '',
    bookmarkTreeId != null ? `data-bookmark-tree-id="${escapeHtml(bookmarkTreeId)}"` : '',
  ].filter(Boolean).join(' ')
  const tag = submenu ? 'div' : 'button'
  const type = tag === 'button' ? ' type="button"' : ''

  return `
    <${tag} ${attrs}${type}>
      ${renderMenuIcon(icon)}
      <span class="svb-menu__label">${escapeHtml(label)}</span>
      ${submenu ? `${renderMenuIcon('chevron')}<span class="svb-menu__submenu">${submenu}</span>` : ''}
    </${tag}>
  `
}

function renderContextMenuColorItem(colorKey, label, currentColorKey) {
  const swatch = colorKey ? TAB_COLOR_SWATCHES[colorKey] : 'transparent'
  const currentClass = currentColorKey === colorKey ? ' is-current' : ''
  const swatchClass = colorKey ? '' : ' is-clear'

  return `
    <button
      class="svb-menu__item svb-menu__item--color${currentClass}"
      type="button"
      data-role="context-menu-action"
      data-action="set-color"
      data-color-key="${escapeHtml(colorKey || '')}"
    >
      <span class="svb-menu__swatch${swatchClass}" style="--svb-menu-swatch:${escapeHtml(swatch)}"></span>
      <span class="svb-menu__label">${escapeHtml(label)}</span>
    </button>
  `
}

function renderSavedTreeMenuItem(tree) {
  const treeId = tree && tree.id != null ? String(tree.id) : ''
  const title = tree && tree.title ? tree.title : 'Saved Tree'

  return `
    <div class="svb-menu__saved-tree">
      <button
        class="svb-menu__item svb-menu__saved-tree-open"
        type="button"
        data-role="context-menu-action"
        data-action="open-saved-tree"
        data-bookmark-tree-id="${escapeHtml(treeId)}"
      >
        ${renderMenuIcon('folder')}
        <span class="svb-menu__label">${escapeHtml(title)}</span>
      </button>
      <button
        class="svb-menu__saved-tree-delete"
        type="button"
        title="Delete saved tree"
        data-role="context-menu-action"
        data-action="delete-saved-tree"
        data-bookmark-tree-id="${escapeHtml(treeId)}"
      >
        ×
      </button>
    </div>
  `
}

function renderContextMenu(tab, state, contextMenu) {
  if (!contextMenu || !tab) return ''
  const selectedIds = Array.isArray(state.selectedIds) ? state.selectedIds : []
  const selectedCount = selectedIds.includes(tab.id) ? selectedIds.length : 1
  const closeLabel = selectedCount > 1 ? 'Close Selected Tabs' : 'Close Tab'
  const pinLabel = tab.pinned ? 'Unpin Tab' : 'Pin Tab'
  const muteLabel = tab.muted ? 'Unmute Tab' : 'Mute Tab'
  const currentColorKey = selectedCount === 1
    && tab.vivExtData
    && typeof tab.vivExtData.tabColor === 'string'
    && TAB_COLOR_SWATCHES[tab.vivExtData.tabColor]
      ? tab.vivExtData.tabColor
      : ''
  const isPinned = !!tab.pinned
  const hasChildren = Array.isArray(state.treeTabs)
    && state.treeTabs.some(item => item && item.id === tab.id && item.hasChildren)
  const workspaces = (Array.isArray(state.workspaces) ? state.workspaces : [])
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))

  const workspaceItems = workspaces.map(workspace => renderContextMenuItem({
    action: 'move-workspace',
    icon: 'workspace',
    label: workspace.name || `Workspace ${workspace.id}`,
    workspaceId: Number(workspace.id),
  })).join('')

  const moveSubmenu = `
    ${renderContextMenuItem({ action: 'move-window', icon: 'window', label: 'New Window' })}
    <div class="svb-menu__separator"></div>
    ${workspaceItems || '<div class="svb-menu__empty">No Workspaces</div>'}
    ${renderContextMenuItem({ action: 'move-new-workspace', icon: 'add', label: 'Create New Workspace and Move Here' })}
  `
  const colorSubmenu = `
    ${renderContextMenuColorItem('rose', 'Rose', currentColorKey)}
    ${renderContextMenuColorItem('amber', 'Amber', currentColorKey)}
    ${renderContextMenuColorItem('yellow', 'Yellow', currentColorKey)}
    ${renderContextMenuColorItem('green', 'Green', currentColorKey)}
    ${renderContextMenuColorItem('teal', 'Teal', currentColorKey)}
    ${renderContextMenuColorItem('blue', 'Blue', currentColorKey)}
    ${renderContextMenuColorItem('purple', 'Purple', currentColorKey)}
    ${renderContextMenuColorItem('pink', 'Pink', currentColorKey)}
    <div class="svb-menu__separator"></div>
    ${renderContextMenuColorItem('', 'Clear Color', currentColorKey)}
  `
  const savedTrees = Array.isArray(state.savedBookmarkTrees) ? state.savedBookmarkTrees : []
  const savedTreeSubmenu = savedTrees.map(renderSavedTreeMenuItem).join('')
  const menuX = Math.max(4, contextMenu.x)
  const menuY = Math.max(4, contextMenu.y)

  return `
    <div
      class="svb-menu"
      style="left:${menuX}px;top:${menuY}px"
      data-tab-id="${tab.id}"
      role="menu"
    >
      ${renderContextMenuItem({ action: 'restore-closed', icon: 'restore', label: 'Reopen Last Closed Tab' })}
      ${renderContextMenuItem({ action: 'new-child', icon: 'child', label: 'New Child Tab', disabled: isPinned })}
      ${renderContextMenuItem({ action: 'new-sibling', icon: 'add', label: 'New Sibling Tab Below', disabled: isPinned })}
      ${renderContextMenuItem({ action: 'save-tree-bookmark', icon: 'bookmark', label: 'Save Tree as Bookmark', disabled: isPinned || !hasChildren })}
      ${renderContextMenuItem({ icon: 'folder', label: 'Open Saved Tree', submenu: savedTreeSubmenu || '<div class="svb-menu__empty">No Saved Trees</div>' })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ icon: 'move', label: 'Move to', submenu: moveSubmenu })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ action: 'toggle-pin', icon: 'pin', label: pinLabel })}
      ${renderContextMenuItem({ action: 'toggle-mute', icon: 'mute', label: muteLabel })}
      ${renderContextMenuItem({ icon: 'color', label: 'Set Color', submenu: colorSubmenu })}
      ${renderContextMenuItem({ action: 'duplicate', icon: 'duplicate', label: 'Duplicate' })}
      ${renderContextMenuItem({ action: 'rename', icon: 'rename', label: 'Rename', disabled: isPinned })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ action: 'close', icon: 'close', label: closeLabel, danger: true, disabled: !state.canCloseVisibleTabs })}
      ${renderContextMenuItem({ action: 'close-other', icon: 'close', label: 'Close Other Tabs', danger: true })}
      ${renderContextMenuItem({ action: 'close-below', icon: 'close', label: 'Close Tabs Below', danger: true })}
      ${renderContextMenuItem({ action: 'close-above', icon: 'close', label: 'Close Tabs Above', danger: true })}
    </div>
  `
}

function renderExpander(item) {
  if (!item || !item.hasChildren) return ''

  return `
    <span
      class="svb-tab__exp${item.collapsed ? ' is-collapsed' : ''}"
      data-role="toggle-collapse"
      data-tab-id="${item.id}"
      aria-hidden="true"
    >
      <svg class="svb-tab__exp-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="m3.17 6.73.66-1.13L8 9.3l4.17-3.7.66 1.13L8 11.03l-4.83-4.3Z"></path>
      </svg>
    </span>
  `
}

function renderChildCount(item) {
  const branchCount = item && item.subtreeSize ? Math.max(0, item.subtreeSize - 1) : 0
  if (!item || !item.hasChildren || !item.collapsed || !branchCount) return ''
  return `<span class="svb-tab__child-count" aria-hidden="true">${branchCount}</span>`
}

function renderDropIndicator(dropPosition) {
  if (!dropPosition) return ''
  return `<span class="svb-tab__drop-indicator is-${dropPosition}" aria-hidden="true"></span>`
}

function renderAddButton(tabId) {
  return `<span class="svb-tab__add" data-role="create-child-tab" data-tab-id="${tabId}" title="New child tab">+</span>`
}

function renderTreeGuides(item) {
  if (!item) return ''
  const branchGuide = item.hasChildren && !item.collapsed && item.visibleBranchSize > 1
    ? `<span class="svb-tab__guide svb-tab__guide--branch" style="--svb-guide-level:${item.depth};--svb-guide-branch-size:${item.visibleBranchSize}" aria-hidden="true"></span>`
    : ''
  if (!branchGuide) return ''

  return `
    <span class="svb-tab__guides" aria-hidden="true">
      ${branchGuide}
    </span>
  `
}

function findDirectChild(parent, selector) {
  return Array.from(parent.children).find(child => child.matches(selector)) || null
}

function syncOptionalDirectChild(parent, selector, html, insertBeforeNode = null) {
  const current = findDirectChild(parent, selector)
  if (!html) {
    if (current) current.remove()
    return null
  }

  const nextNode = createNodeFromHtml(html)
  if (!current) {
    parent.insertBefore(nextNode, insertBeforeNode)
    return nextNode
  }

  if (current.outerHTML !== nextNode.outerHTML) {
    current.replaceWith(nextNode)
    return nextNode
  }

  return current
}

function syncTabLeadIcon(lead, tab) {
  const current = Array.from(lead.children).find(child => child.matches('.svb-tab__spinner, .svb-tab__favicon'))
  if (tab.loading) {
    if (current && current.matches('.svb-tab__spinner')) return current

    const spinner = createNodeFromHtml('<span class="svb-tab__spinner" aria-hidden="true"></span>')
    if (current) current.replaceWith(spinner)
    else lead.appendChild(spinner)
    return spinner
  }

  if (tab.favIconUrl) {
    if (current && current.matches('img.svb-tab__favicon')) {
      if (current.getAttribute('src') !== tab.favIconUrl) {
        current.setAttribute('src', tab.favIconUrl)
      }
      current.setAttribute('alt', '')
      current.className = 'svb-tab__favicon'
      return current
    }

    const favicon = createNodeFromHtml(`<img class="svb-tab__favicon" src="${escapeHtml(tab.favIconUrl)}" alt="">`)
    if (current) current.replaceWith(favicon)
    else lead.appendChild(favicon)
    return favicon
  }

  if (current && current.matches('.svb-tab__favicon--fallback')) {
    current.className = 'svb-tab__favicon svb-tab__favicon--fallback'
    return current
  }

  const fallback = createNodeFromHtml('<span class="svb-tab__favicon svb-tab__favicon--fallback"></span>')
  if (current) current.replaceWith(fallback)
  else lead.appendChild(fallback)
  return fallback
}

function renderTabBadgeIcon(name) {
  const paths = {
    audio: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    mute: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
  }
  return `<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">${paths[name]}</svg>`
}

function renderTabBadge(tab) {
  if (tab.muted) {
    return `<span class="svb-tab__badge" data-role="toggle-mute" data-tab-id="${tab.id}" title="Unmute tab">${renderTabBadgeIcon('mute')}</span>`
  }
  if (tab.audible) {
    return `<span class="svb-tab__badge" data-role="toggle-mute" data-tab-id="${tab.id}" title="Mute tab">${renderTabBadgeIcon('audio')}</span>`
  }
  return ''
}

function syncTabContent(content, tab, editing) {
  if (editing) {
    let input = findDirectChild(content, '.svb-tab__title-input')
    if (!input) {
      content.innerHTML = `<input class="svb-tab__title-input" data-role="rename-input" data-tab-id="${tab.id}" value="${escapeHtml(tab.title)}" spellcheck="false">`
      input = findDirectChild(content, '.svb-tab__title-input')
    }

    if (input) {
      const desiredValue = String(tab.title || '')
      input.setAttribute('data-tab-id', String(tab.id))
      if (input.value !== desiredValue && document.activeElement !== input) {
        input.value = desiredValue
      }
    }

    const badge = findDirectChild(content, '.svb-tab__badge')
    if (badge) badge.remove()
    return
  }

  let titleNode = findDirectChild(content, '.svb-tab__title')
  if (!titleNode) {
    content.innerHTML = '<span class="svb-tab__title"></span>'
    titleNode = findDirectChild(content, '.svb-tab__title')
  }
  if (titleNode && titleNode.textContent !== tab.title) {
    titleNode.textContent = tab.title
  }

  syncOptionalDirectChild(content, '.svb-tab__badge', renderTabBadge(tab), null)
}

function getTabVisualStyle(tab) {
  const styles = []
  const tiling = tab && tab.vivExtData && tab.vivExtData.tiling
  const tileId = tiling && tiling.id ? String(tiling.id) : ''
  const tabColorKey = tab && tab.vivExtData && typeof tab.vivExtData.tabColor === 'string'
    ? tab.vivExtData.tabColor
    : ''
  const tabColor = tabColorKey && TAB_COLOR_SWATCHES[tabColorKey] ? TAB_COLOR_SWATCHES[tabColorKey] : ''

  if (tabColor) {
    styles.push(`--svb-tab-color:${tabColor}`)
  }

  if (!tileId) {
    return styles.join(';')
  }

  const palette = [
    { h: 210, s: 60, l: 62 },
    { h: 155, s: 48, l: 56 },
    { h: 28, s: 68, l: 60 },
    { h: 286, s: 44, l: 62 },
    { h: 350, s: 58, l: 62 },
    { h: 48, s: 72, l: 58 },
    { h: 188, s: 54, l: 58 },
    { h: 118, s: 40, l: 58 },
  ]

  let hash = 0
  for (let index = 0; index < tileId.length; index += 1) {
    hash = ((hash << 5) - hash + tileId.charCodeAt(index)) | 0
  }

  const swatch = palette[Math.abs(hash) % palette.length]
  styles.push(`--svb-tile-accent:hsl(${swatch.h}deg ${swatch.s}% ${swatch.l}%)`)
  return styles.join(';')
}

function getDropPositionForEvent(tabButton, event) {
  const rect = tabButton.getBoundingClientRect()
  const offsetY = event.clientY - rect.top
  const zone = rect.height * 0.25

  if (offsetY < zone) return 'before'
  if (offsetY > rect.height - zone) return 'after'
  return 'inside'
}

function getTabVisualState(tabId, item, visualState) {
  const activeTabId = visualState && Number.isFinite(visualState.activeTabId) ? visualState.activeTabId : null
  const selectedIdSet = visualState && visualState.selectedIdSet ? visualState.selectedIdSet : null
  const draggedIdSet = visualState && visualState.draggedIdSet ? visualState.draggedIdSet : null
  const dropTargetId = visualState ? visualState.dropTargetId : null
  const dropPosition = visualState ? visualState.dropPosition : null
  return {
    isActive: activeTabId != null && tabId === activeTabId,
    isSelected: !!(selectedIdSet && selectedIdSet.has(tabId)),
    isDragging: !!(draggedIdSet && draggedIdSet.has(tabId)),
    isDropTarget: Number.isFinite(dropTargetId) && dropTargetId === tabId,
    dropPosition: Number.isFinite(dropTargetId) && dropTargetId === tabId ? dropPosition : (item && item.dropPosition ? item.dropPosition : null),
  }
}

function renderTab(tab, compact, canClose, item, editing, visualState) {
  const icon = tab.loading
    ? `<span class="svb-tab__spinner" aria-hidden="true"></span>`
    : tab.favIconUrl
      ? `<img class="svb-tab__favicon" src="${escapeHtml(tab.favIconUrl)}" alt="">`
      : `<span class="svb-tab__favicon svb-tab__favicon--fallback"></span>`

  const media = renderTabBadge(tab)

  const hasClose = !compact && canClose
  const hasAdd = !compact
  const rowVisualState = getTabVisualState(tab.id, item, visualState)
  const discardedClass = tab.discarded ? ' is-discarded' : ''
  const tiling = tab.vivExtData && tab.vivExtData.tiling
  const isTiled = !!(tiling && (tiling.id || tiling.layout))
  const tiledClass = isTiled ? ' is-tiled' : ''
  const tabClass = compact
    ? `svb-tab svb-pinned-tab is-compact${discardedClass}${tiledClass}`
    : `svb-tab${discardedClass}${tiledClass}${hasClose ? ' has-close' : ''}${hasAdd ? ' has-add' : ''}${rowVisualState.isSelected ? ' is-selected' : ''}${rowVisualState.isDragging ? ' is-dragging' : ''}${rowVisualState.isDropTarget ? ' is-drop-target' : ''}`
  const depth = item && !compact ? item.depth : 0
  const visibleIndex = item && !compact ? item.visibleIndex : -1
  const subtreeSize = item && !compact ? item.subtreeSize : 1
  const parentId = item && !compact && item.parentId != null ? item.parentId : ''
  const ancestorIds = item && !compact && Array.isArray(item.ancestorIds) ? item.ancestorIds.join(',') : ''
  const dropPosition = item && !compact && rowVisualState.dropPosition ? rowVisualState.dropPosition : ''
  const hasChildren = !!(item && item.hasChildren)
  const isCollapsed = !!(item && item.collapsed)
  const visibleBranchSize = item && !compact ? item.visibleBranchSize || 1 : 1
  const coloredClass = tab.vivExtData && tab.vivExtData.tabColor && TAB_COLOR_SWATCHES[tab.vivExtData.tabColor]
    ? ' is-colored'
    : ''
  const visualStyle = (tiledClass || coloredClass) ? getTabVisualStyle(tab) : ''
  const title = editing
    ? `<input class="svb-tab__title-input" data-role="rename-input" data-tab-id="${tab.id}" value="${escapeHtml(tab.title)}" spellcheck="false">`
    : `<span class="svb-tab__title">${escapeHtml(tab.title)}</span>`

  return `
    <button class="${tabClass}${coloredClass}${rowVisualState.isActive ? ' is-active' : ''}" data-role="activate-tab" data-tab-id="${tab.id}" data-visible-index="${visibleIndex}" data-depth="${depth}" data-parent-id="${parentId}" data-subtree-size="${subtreeSize}" data-ancestor-ids="${escapeHtml(ancestorIds)}" data-drop-position="${dropPosition}" data-parent="${hasChildren}" data-folded="${isCollapsed}" title="${escapeHtml(tab.title)}"${visualStyle ? ` style="${visualStyle}"` : ''}>
      <span class="svb-tab__outer" style="--svb-depth:${depth};--svb-visible-branch-size:${visibleBranchSize}">
        ${compact ? '' : renderTreeGuides(item)}
        <span class="svb-tab__body">
          ${compact ? '' : renderDropIndicator(rowVisualState.dropPosition)}
          <span class="svb-tab__lead">
            ${compact ? '' : renderExpander(item)}
            ${icon}
            ${compact ? '' : renderChildCount(item)}
          </span>
          ${compact ? '' : `
            <span class="svb-tab__content">
              ${title}
              ${media}
            </span>
          `}
          ${hasAdd ? renderAddButton(tab.id) : ''}
          ${hasClose ? `<span class="svb-tab__close" data-role="close-tab" data-tab-id="${tab.id}">×</span>` : ''}
        </span>
      </span>
    </button>
  `
}

function renderNewTabButton(inline) {
  return `
    <button
      class="svb-new-tab-button${inline ? ' is-inline' : ' is-sticky'}"
      data-role="create-tab"
      title="New tab"
    >
      <span class="svb-new-tab-button__icon">+</span>
      <span class="svb-new-tab-button__label">New Tab</span>
    </button>
  `
}

const INLINE_NEW_TAB_KEY = 'control:new-tab-inline'

function renderPinIcon(active) {
  return `
    <svg class="svb-pin-icon" viewBox="0 0 28 28" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 8h14v2H7zM7 13h14v2H7zM7 18h10v2H7z"
      />
    </svg>
  `
}
function renderCollapseAllIcon() {
  return `
    <svg class="svb-collapse-all-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4.5 5.25 8 8.75l3.5-3.5" />
      <path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4.5 9.25 8 12.75l3.5-3.5" />
    </svg>
  `
}

function createNodeFromHtml(html) {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return template.content.firstElementChild
}

function createSidebarRenderer(options) {
  const { root, dragShield, onActivateTab, onCloseTab, onCreateTab, onCreateChildTab, onRenameTab, onTogglePinned, onToggleMute, onToggleCollapse, onCollapseAll, onSelectTab, onOpenContextMenu, onContextMenuAction, onStartDrag, onUpdateDropTarget, onCommitDrop, onCommitExternalDrop, onCommitExternalContentDrop, onClearDrag } = options
  let pendingScrollToActive = false
  let pendingScrollSourceTabId = null
  let currentVisibleIds = []
  let previousActiveTabId = null
  let previousPinnedTabsSnapshot = null
  let previousTreeTabsSnapshot = null
  let previousCanCloseVisibleTabs = null
  let previousPanelPinned = null
  let previousIsSettingsOpen = false
  let previousSelectedIds = []
  let previousDraggedIds = []
  let previousDropTargetId = null
  let previousDropPosition = null
  const tabNodesByKey = new Map()
  const enteringNodes = new WeakSet()
  const pendingEnterNodes = new Set()
  let pointerDrag = null
  let externalDrag = null
  let autoScrollRafId = 0
  let suppressClick = false
  let contextMenu = null
  let latestState = null
  let renderCurrent = () => {}
  let shell = null
  let editingTabId = null
  let isSettingsOpen = false
  const eventController = new AbortController()
  const eventOptions = { signal: eventController.signal }

  function findTab(tabId) {
    if (!latestState) return null
    return latestState.pinnedTabs.concat(latestState.tabs).find(tab => tab.id === tabId) || null
  }

  function stopEditing(cancel) {
    if (!Number.isFinite(editingTabId)) return
    const tabId = editingTabId
    const input = root.querySelector(`.svb-tab__title-input[data-tab-id="${tabId}"]`)
    const nextValue = input ? input.value : ''
    editingTabId = null
    if (!cancel && onRenameTab) {
      onRenameTab(tabId, nextValue)
    } else {
      renderCurrent()
    }
  }

  function startEditing(tabId) {
    if (!Number.isFinite(tabId)) return
    const tab = findTab(tabId)
    if (!tab || tab.pinned) return
    editingTabId = tabId
    contextMenu = null
    renderCurrent()
  }

  function ensureShell() {
    if (shell && root.contains(shell.frame)) return shell

    root.innerHTML = `
      <div class="svb-frame">
        <div class="svb-header">
          <div class="svb-header__left">
            <button class="svb-icon-button" data-role="toggle-settings" title="Settings" aria-label="Settings"></button>
            <div class="svb-header__count">0</div>
          </div>
          <div class="svb-header__actions">
            <button class="svb-icon-button" data-role="collapse-all" title="Collapse all trees" aria-label="Collapse all trees"></button>
            <button class="svb-icon-button" data-role="toggle-pinned" title="Pin panel"></button>
          </div>
        </div>

        <div class="svb-main-view">
          <section class="svb-section svb-section--pinned">
            <div class="svb-section__label">Pinned</div>
            <div class="svb-pinned-grid"></div>
          </section>

          <section class="svb-section svb-section--fill">
            <div class="svb-section__label">Tabs</div>
            <div class="svb-tab-list"></div>
            <div class="svb-footer"></div>
          </section>
        </div>

        <div class="svb-settings-view">
          <div class="svb-settings-header">
            <button class="svb-settings-back" data-role="toggle-settings">
              ${renderMenuIcon('chevron')}
              Back to Tabs
            </button>
            <h2 class="svb-settings-title">Settings</h2>
          </div>
          <div class="svb-settings-content">
            <div class="svb-settings-group">
              <label class="svb-settings-label">New child tab position</label>
              <div class="svb-settings-options">
                <label class="svb-settings-option">
                  <input type="radio" name="childPosition" value="top">
                  <span>Top of subtree</span>
                </label>
                <label class="svb-settings-option">
                  <input type="radio" name="childPosition" value="bottom">
                  <span>Bottom of subtree</span>
                </label>
              </div>
            </div>
            <div class="svb-settings-group">
              <label class="svb-settings-label">After closing a tab</label>
              <div class="svb-settings-options">
                <label class="svb-settings-option">
                  <input type="radio" name="activateAfterClose" value="above">
                  <span>Activate tab above</span>
                </label>
                <label class="svb-settings-option">
                  <input type="radio" name="activateAfterClose" value="below">
                  <span>Activate tab below</span>
                </label>
              </div>
            </div>
            <div class="svb-settings-group">
              <label class="svb-settings-label">Double-click on tab</label>
              <div class="svb-settings-options">
                <label class="svb-settings-option">
                  <input type="radio" name="doubleClickAction" value="rename">
                  <span>Rename tab</span>
                </label>
                <label class="svb-settings-option">
                  <input type="radio" name="doubleClickAction" value="close">
                  <span>Close tab</span>
                </label>
              </div>
            </div>
            <div class="svb-settings-group">
              <label class="svb-settings-label">Panel position</label>
              <div class="svb-settings-options">
                <label class="svb-settings-option">
                  <input type="radio" name="panelPosition" value="left">
                  <span>Left side</span>
                </label>
                <label class="svb-settings-option">
                  <input type="radio" name="panelPosition" value="right">
                  <span>Right side</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="svb-resize-handle" aria-hidden="true"></div>
      <div class="svb-drag-ghost" aria-hidden="true"></div>
      <div class="svb-menu-host"></div>
    `

    shell = {
      frame: root.querySelector('.svb-frame'),
      mainView: root.querySelector('.svb-main-view'),
      settingsView: root.querySelector('.svb-settings-view'),
      count: root.querySelector('.svb-header__count'),
      settingsButton: root.querySelector('[data-role="toggle-settings"]'),
      collapseAllButton: root.querySelector('[data-role="collapse-all"]'),
      pinButton: root.querySelector('[data-role="toggle-pinned"]'),
      pinnedSection: root.querySelector('.svb-section--pinned'),
      pinnedGrid: root.querySelector('.svb-pinned-grid'),
      tabList: root.querySelector('.svb-tab-list'),
      footer: root.querySelector('.svb-footer'),
      dragGhost: root.querySelector('.svb-drag-ghost'),
      menuHost: root.querySelector('.svb-menu-host'),
      emptyMessage: createNodeFromHtml('<div class="svb-empty"></div>'),
      inlineNewTabButton: createNodeFromHtml(renderNewTabButton(true)),
    }

    shell.footer.appendChild(createNodeFromHtml(renderNewTabButton(false)))

    // Setup native drag-and-drop for external content
    shell.frame.addEventListener('dragover', event => {
      // Only handle if it's NOT our own pointer drag
      if (pointerDrag || isSettingsOpen) return

      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'

      const drop = resolveDropTarget(event.clientX, event.clientY)
      if (drop && onUpdateDropTarget) {
        onUpdateDropTarget(drop.tabId, drop.position)
      } else if (onUpdateDropTarget) {
        onUpdateDropTarget(null, null)
      }

      updateDragAutoScroll(event.clientX, event.clientY)
    }, eventOptions)

    shell.frame.addEventListener('dragleave', event => {
      if (pointerDrag || isSettingsOpen) return
      // Use relatedTarget to check if we actually left the frame
      if (!shell.frame.contains(event.relatedTarget)) {
        if (onUpdateDropTarget) onUpdateDropTarget(null, null)
        stopDragAutoScroll()
      }
    }, eventOptions)

    shell.frame.addEventListener('drop', event => {
      if (pointerDrag || isSettingsOpen) return
      event.preventDefault()
      stopDragAutoScroll()

      const url = event.dataTransfer.getData('text/uri-list')
      const text = event.dataTransfer.getData('text/plain')
      
      const drop = resolveDropTarget(event.clientX, event.clientY)
      if (onCommitExternalContentDrop && (url || text)) {
        onCommitExternalContentDrop({
          url: url || null,
          text: text || null,
          targetId: drop ? drop.tabId : null,
          position: drop ? drop.position : null,
        })
      }

      if (onUpdateDropTarget) onUpdateDropTarget(null, null)
    }, eventOptions)

    return shell
  }

  function getTabKey(tab, compact) {
    return `${compact ? 'pinned' : 'regular'}:${tab.id}`
  }

  function collectChangedIds(previousIds, nextIds, changedIds) {
    const previous = new Set(Array.isArray(previousIds) ? previousIds : [])
    const next = new Set(Array.isArray(nextIds) ? nextIds : [])
    for (const id of previous) {
      if (!next.has(id)) changedIds.add(id)
    }
    for (const id of next) {
      if (!previous.has(id)) changedIds.add(id)
    }
  }

  function buildVisualState(state) {
    const selectedIds = Array.isArray(state.selectedIds) ? state.selectedIds : []
    const dragState = state && state.drag ? state.drag : null
    return {
      activeTabId: Number.isFinite(state.activeTabId) ? state.activeTabId : null,
      selectedIds,
      selectedIdSet: new Set(selectedIds),
      draggedIds: Array.isArray(dragState && dragState.draggedIds) ? dragState.draggedIds : [],
      draggedIdSet: new Set(Array.isArray(dragState && dragState.draggedIds) ? dragState.draggedIds : []),
      dropTargetId: dragState ? dragState.dropTargetId : null,
      dropPosition: dragState ? dragState.dropPosition : null,
    }
  }

  function areTabOrdersEqual(previousTabs, nextTabs) {
    const previous = Array.isArray(previousTabs) ? previousTabs : []
    const next = Array.isArray(nextTabs) ? nextTabs : []
    if (previous.length !== next.length) return false
    for (let index = 0; index < next.length; index += 1) {
      if (!previous[index] || previous[index].id !== next[index].id) return false
    }
    return true
  }

  function areAncestorListsEqual(previousAncestors, nextAncestors) {
    const previous = Array.isArray(previousAncestors) ? previousAncestors : []
    const next = Array.isArray(nextAncestors) ? nextAncestors : []
    if (previous.length !== next.length) return false
    for (let index = 0; index < next.length; index += 1) {
      if (previous[index] !== next[index]) return false
    }
    return true
  }

  function isSameTreeShape(previousItems, nextItems) {
    const previous = Array.isArray(previousItems) ? previousItems : []
    const next = Array.isArray(nextItems) ? nextItems : []
    if (previous.length !== next.length) return false

    for (let index = 0; index < next.length; index += 1) {
      const previousItem = previous[index]
      const nextItem = next[index]
      if (!previousItem || !nextItem) return false
      if (previousItem.id !== nextItem.id) return false
      if (previousItem.depth !== nextItem.depth) return false
      if ((previousItem.parentId ?? null) !== (nextItem.parentId ?? null)) return false
      if (!!previousItem.hasChildren !== !!nextItem.hasChildren) return false
      if (!!previousItem.collapsed !== !!nextItem.collapsed) return false
      if ((previousItem.subtreeSize || 1) !== (nextItem.subtreeSize || 1)) return false
      if ((previousItem.visibleBranchSize || 1) !== (nextItem.visibleBranchSize || 1)) return false
      if (!areAncestorListsEqual(previousItem.ancestorIds, nextItem.ancestorIds)) return false
    }

    return true
  }

  function getTilingId(tab) {
    return tab && tab.vivExtData && tab.vivExtData.tiling && tab.vivExtData.tiling.id
      ? String(tab.vivExtData.tiling.id)
      : ''
  }

  function getTabColorKey(tab) {
    return tab && tab.vivExtData && typeof tab.vivExtData.tabColor === 'string'
      ? tab.vivExtData.tabColor
      : ''
  }

  function hasTabContentChanged(previousTab, nextTab) {
    if (!previousTab || !nextTab) return true
    return previousTab.title !== nextTab.title
      || previousTab.favIconUrl !== nextTab.favIconUrl
      || !!previousTab.loading !== !!nextTab.loading
      || !!previousTab.muted !== !!nextTab.muted
      || !!previousTab.audible !== !!nextTab.audible
      || !!previousTab.discarded !== !!nextTab.discarded
      || getTilingId(previousTab) !== getTilingId(nextTab)
      || getTabColorKey(previousTab) !== getTabColorKey(nextTab)
  }

  function collectContentChangedIds(previousPinnedTabs, nextPinnedTabs, previousTreeItems, nextTreeItems) {
    const changedIds = new Set()
    const previousPinnedById = new Map((Array.isArray(previousPinnedTabs) ? previousPinnedTabs : []).map(tab => [tab.id, tab]))
    const previousTreeById = new Map((Array.isArray(previousTreeItems) ? previousTreeItems : []).map(item => [item.id, item]))

    for (const tab of Array.isArray(nextPinnedTabs) ? nextPinnedTabs : []) {
      if (hasTabContentChanged(previousPinnedById.get(tab.id), tab)) {
        changedIds.add(tab.id)
      }
    }

    for (const item of Array.isArray(nextTreeItems) ? nextTreeItems : []) {
      const previousItem = previousTreeById.get(item.id)
      if (!previousItem || hasTabContentChanged(previousItem.tab, item.tab)) {
        changedIds.add(item.id)
      }
    }

    return changedIds
  }

  function updateShellControls(currentShell, state, treeTabs) {
    const totalTabs = state.pinnedTabs.length + state.tabs.length
    currentShell.count.textContent = String(totalTabs)
    const canCollapseAll = treeTabs.some(item => item && item.hasChildren && !item.collapsed)
    currentShell.collapseAllButton.className = `svb-icon-button${canCollapseAll ? '' : ' is-disabled'}`
    currentShell.collapseAllButton.disabled = !canCollapseAll
    currentShell.collapseAllButton.innerHTML = renderCollapseAllIcon()
    currentShell.pinButton.className = `svb-icon-button${state.panelPinned ? ' is-active' : ''}`
    currentShell.pinButton.title = state.panelPinned ? 'Unpin panel' : 'Pin panel'
    currentShell.pinButton.innerHTML = renderPinIcon(state.panelPinned)
    currentShell.settingsButton.innerHTML = renderMenuIcon('settings')
    currentShell.pinnedSection.style.display = state.pinnedTabs.length ? '' : 'none'
    currentShell.mainView.style.display = isSettingsOpen ? 'none' : 'flex'
    currentShell.settingsView.style.display = isSettingsOpen ? 'flex' : 'none'

    if (isSettingsOpen) {
      const settings = settingsStore.getAll()
      const inputs = currentShell.settingsView.querySelectorAll('input')
      for (const input of inputs) {
        if (input.name in settings) {
          input.checked = settings[input.name] === input.value
        }
      }
    }
  }

  function updateContextMenu(currentShell, state) {
    if (dragShield) {
      dragShield.classList.toggle('is-menu-backdrop', !!contextMenu)
    }

    if (!contextMenu) {
      if (currentShell.menuHost.childElementCount > 0) {
        currentShell.menuHost.innerHTML = ''
      }
      return
    }

    // Render if empty OR if requested for a different tab
    const existingMenu = currentShell.menuHost.querySelector('.svb-menu')
    const renderedTabId = existingMenu ? Number(existingMenu.getAttribute('data-tab-id')) : null

    if (!existingMenu || renderedTabId !== contextMenu.tabId) {
      const allTabsById = new Map(state.pinnedTabs.concat(state.tabs).map(tab => [tab.id, tab]))
      const contextTab = allTabsById.get(contextMenu.tabId) || null
      if (!contextTab) return

      currentShell.menuHost.innerHTML = renderContextMenu(contextTab, state, contextMenu)
      positionContextMenu()

      const menuNode = currentShell.menuHost.querySelector('.svb-menu')
      if (menuNode) {
        void menuNode.offsetWidth
        menuNode.classList.add('is-visible')
      }
    }
  }

  function updateVisualOnlyNodes(state, treeTabs, visualState, currentShell, contentChangedIds = null) {
    const changedIds = new Set()
    if (contentChangedIds) {
      for (const tabId of contentChangedIds) {
        changedIds.add(tabId)
      }
    }
    collectChangedIds(previousSelectedIds, visualState.selectedIds, changedIds)
    collectChangedIds(previousDraggedIds, visualState.draggedIds, changedIds)
    if (Number.isFinite(previousActiveTabId)) changedIds.add(previousActiveTabId)
    if (Number.isFinite(visualState.activeTabId)) changedIds.add(visualState.activeTabId)
    if (Number.isFinite(previousDropTargetId)) changedIds.add(previousDropTargetId)
    if (Number.isFinite(visualState.dropTargetId)) changedIds.add(visualState.dropTargetId)

    const treeItemsById = new Map(treeTabs.map(item => [item.id, item]))
    const pinnedTabsById = new Map((Array.isArray(state.pinnedTabs) ? state.pinnedTabs : []).map(tab => [tab.id, tab]))
    const regularTabsById = new Map((Array.isArray(state.tabs) ? state.tabs : []).map(tab => [tab.id, tab]))

    for (const tabId of changedIds) {
      const pinnedTab = pinnedTabsById.get(tabId)
      if (pinnedTab) {
        const key = getTabKey(pinnedTab, true)
        const node = tabNodesByKey.get(key)
        if (node) {
          syncTabNode(node, pinnedTab, true, state.canCloseVisibleTabs, null, false, visualState)
        }
        continue
      }

      const item = treeItemsById.get(tabId)
      const regularTab = regularTabsById.get(tabId) || (item ? item.tab : null)
      if (!item || !regularTab) continue
      const key = getTabKey(regularTab, false)
      const node = tabNodesByKey.get(key)
      if (node) {
        syncTabNode(node, regularTab, false, state.canCloseVisibleTabs, item, editingTabId === tabId, visualState)
      }
    }

    if (previousCanCloseVisibleTabs !== state.canCloseVisibleTabs) {
      for (const item of treeTabs) {
        const key = getTabKey(item.tab, false)
        const node = tabNodesByKey.get(key)
        if (node) {
          syncTabNode(node, item.tab, false, state.canCloseVisibleTabs, item, editingTabId === item.id, visualState)
        }
      }
    }

    if (previousPanelPinned !== state.panelPinned || previousIsSettingsOpen !== isSettingsOpen) {
      updateShellControls(currentShell, state, treeTabs)
    }

    updateContextMenu(currentShell, state)
  }

  function syncTabNode(node, tab, compact, canClose, item, editing, visualState) {
    const hasClose = !compact && canClose
    const hasAdd = !compact
    const rowVisualState = getTabVisualState(tab.id, item, visualState)
    const isActuallyMultiSelected = rowVisualState.isSelected && visualState.selectedIds && visualState.selectedIds.length > 1
    const discardedClass = tab.discarded ? ' is-discarded' : ''
    const tiling = tab.vivExtData && tab.vivExtData.tiling
    const isTiled = !!(tiling && (tiling.id || tiling.layout))
    const tiledClass = isTiled ? ' is-tiled' : ''
    const tabClass = compact
      ? `svb-tab svb-pinned-tab is-compact${discardedClass}${tiledClass}`
      : `svb-tab${discardedClass}${tiledClass}${hasClose ? ' has-close' : ''}${hasAdd ? ' has-add' : ''}${isActuallyMultiSelected ? ' is-selected' : ''}${rowVisualState.isDragging ? ' is-dragging' : ''}${rowVisualState.isDropTarget ? ' is-drop-target' : ''}`
    const depth = item && !compact ? item.depth : 0
    const visibleIndex = item && !compact ? item.visibleIndex : -1
    const subtreeSize = item && !compact ? item.subtreeSize : 1
    const parentId = item && !compact && item.parentId != null ? item.parentId : ''
    const ancestorIds = item && !compact && Array.isArray(item.ancestorIds) ? item.ancestorIds.join(',') : ''
    const dropPosition = item && !compact && rowVisualState.dropPosition ? rowVisualState.dropPosition : ''
    const hasChildren = !!(item && item.hasChildren)
    const isCollapsed = !!(item && item.collapsed)
    const visibleBranchSize = item && !compact ? item.visibleBranchSize || 1 : 1
    const coloredClass = tab.vivExtData && tab.vivExtData.tabColor && TAB_COLOR_SWATCHES[tab.vivExtData.tabColor]
      ? ' is-colored'
      : ''
    const visualStyle = (tiledClass || coloredClass) ? getTabVisualStyle(tab) : ''

    node.className = `${tabClass}${coloredClass}${rowVisualState.isActive ? ' is-active' : ''}`
    node.setAttribute('data-role', 'activate-tab')
    node.setAttribute('data-tab-id', String(tab.id))
    node.setAttribute('data-visible-index', String(visibleIndex))
    node.setAttribute('data-depth', String(depth))
    node.setAttribute('data-parent-id', String(parentId))
    node.setAttribute('data-subtree-size', String(subtreeSize))
    node.setAttribute('data-ancestor-ids', ancestorIds)
    node.setAttribute('data-drop-position', dropPosition)
    node.setAttribute('data-parent', hasChildren ? 'true' : 'false')
    node.setAttribute('data-folded', isCollapsed ? 'true' : 'false')
    node.setAttribute('title', tab.title)
    if (visualStyle) node.setAttribute('style', visualStyle)
    else node.removeAttribute('style')

    const outer = findDirectChild(node, '.svb-tab__outer')
    const body = outer && findDirectChild(outer, '.svb-tab__body')
    const lead = body && findDirectChild(body, '.svb-tab__lead')
    if (!outer || !body || !lead) {
      return false
    }

    outer.style.setProperty('--svb-depth', String(depth))
    outer.style.setProperty('--svb-visible-branch-size', String(visibleBranchSize))

    syncOptionalDirectChild(outer, '.svb-tab__guides', compact ? '' : renderTreeGuides(item), body)
    syncOptionalDirectChild(body, '.svb-tab__drop-indicator', compact ? '' : renderDropIndicator(rowVisualState.dropPosition), lead)

    const iconNode = syncTabLeadIcon(lead, tab)
    syncOptionalDirectChild(lead, '.svb-tab__exp', compact ? '' : renderExpander(item), iconNode)
    syncOptionalDirectChild(lead, '.svb-tab__child-count', compact ? '' : renderChildCount(item), null)

    const addNode = findDirectChild(body, '.svb-tab__add')
    const closeNode = findDirectChild(body, '.svb-tab__close')
    const content = findDirectChild(body, '.svb-tab__content')
    if (compact) {
      if (content) content.remove()
    } else {
      let contentNode = content
      if (!contentNode) {
        contentNode = createNodeFromHtml('<span class="svb-tab__content"></span>')
        body.insertBefore(contentNode, addNode || closeNode || null)
      }
      syncTabContent(contentNode, tab, editing)
    }

    syncOptionalDirectChild(body, '.svb-tab__add', hasAdd ? renderAddButton(tab.id) : '', null)
    syncOptionalDirectChild(body, '.svb-tab__close', hasClose ? `<span class="svb-tab__close" data-role="close-tab" data-tab-id="${tab.id}">×</span>` : '', null)
    return true
  }

  function animateTabEnter(node) {
    if (!node || enteringNodes.has(node) || !node.isConnected) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    enteringNodes.add(node)
    const animation = node.animate([
      { opacity: 0, transform: 'translateY(-6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], {
      duration: 200,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'none',
    })

    animation.finished.then(() => {
      enteringNodes.delete(node)
      node.style.opacity = ''
      node.style.transform = ''
    }).catch(() => {
      enteringNodes.delete(node)
      node.style.opacity = ''
      node.style.transform = ''
    })
  }

  function getOrUpdateTabNode(tab, compact, canClose, item, visualState) {
    const key = getTabKey(tab, compact)
    const editing = !compact && editingTabId === tab.id
    const html = renderTab(tab, compact, canClose, item, editing, visualState)
    let node = tabNodesByKey.get(key)
    if (!node) {
      node = createNodeFromHtml(html)
      pendingEnterNodes.add(node)
      tabNodesByKey.set(key, node)
      return node
    }

    if (!syncTabNode(node, tab, compact, canClose, item, editing, visualState)) {
      const nextNode = createNodeFromHtml(html)
      node.replaceWith(nextNode)
      node = nextNode
      tabNodesByKey.set(key, node)
    }
    return node
  }

  function pruneTabNodes(activeKeys) {
    for (const [key, node] of tabNodesByKey.entries()) {
      if (activeKeys.has(key)) continue
      node.remove()
      tabNodesByKey.delete(key)
      pendingEnterNodes.delete(node)
    }
  }

  function syncChildren(parent, nodes) {
    nodes.forEach((node, index) => {
      if (node.parentNode !== parent) {
        parent.insertBefore(node, parent.children[index] || null)
        return
      }

      if (parent.children[index] !== node) {
        parent.insertBefore(node, parent.children[index] || null)
      }
    })

    while (parent.children.length > nodes.length) {
      parent.removeChild(parent.lastElementChild)
    }
  }

  function flushEnterAnimations() {
    if (pendingEnterNodes.size === 0) return

    const nodes = Array.from(pendingEnterNodes)
    pendingEnterNodes.clear()
    window.requestAnimationFrame(() => {
      nodes.forEach(node => {
        if (node.isConnected) {
          animateTabEnter(node)
        }
      })
    })
  }

  function measureTabRects() {
    const rects = new Map()
    for (const [key, node] of tabNodesByKey.entries()) {
      if (!node.isConnected) continue
      const rect = node.getBoundingClientRect()
      rects.set(key, {
        left: rect.left,
        top: rect.top,
      })
    }
    if (shell && shell.inlineNewTabButton && shell.inlineNewTabButton.isConnected) {
      const inlineStyle = window.getComputedStyle(shell.inlineNewTabButton)
      if (inlineStyle.display !== 'none') {
        const rect = shell.inlineNewTabButton.getBoundingClientRect()
        rects.set(INLINE_NEW_TAB_KEY, {
          left: rect.left,
          top: rect.top,
        })
      }
    }
    return rects
  }

  function animateMovedTabs(previousRects, enteringNodeSet = null) {
    if (!previousRects || previousRects.size === 0) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const movedNodes = []
    const motionNodes = Array.from(tabNodesByKey.entries())
    if (shell && shell.inlineNewTabButton) {
      motionNodes.push([INLINE_NEW_TAB_KEY, shell.inlineNewTabButton])
    }

    for (const [key, node] of motionNodes) {
      const previousRect = previousRects.get(key)
      if (!previousRect || !node.isConnected || enteringNodes.has(node) || (enteringNodeSet && enteringNodeSet.has(node))) continue
      if (window.getComputedStyle(node).display === 'none') continue

      const rect = node.getBoundingClientRect()
      const deltaX = previousRect.left - rect.left
      const deltaY = previousRect.top - rect.top
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) continue
      if (Math.abs(deltaY) > window.innerHeight) continue

      node.style.transition = 'none'
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      movedNodes.push(node)
    }

    if (!movedNodes.length) return

    root.offsetHeight
    window.requestAnimationFrame(() => {
      movedNodes.forEach(node => {
        node.style.transition = 'transform var(--svb-d-norm) var(--svb-ease-out), opacity var(--svb-d-fast) linear'
        node.style.transform = ''
        node.addEventListener('transitionend', () => {
          node.style.transition = ''
          node.style.transform = ''
        }, { once: true })
      })
    })
  }

  function resolveDropTarget(clientX, clientY) {
    const hovered = document.elementFromPoint(clientX, clientY)
    const tabButton = hovered && hovered.closest ? hovered.closest('.svb-tab[data-tab-id]:not(.is-compact)') : null
    if (!tabButton) return null

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return null

    return {
      tabId,
      position: getDropPositionForEvent(tabButton, {
        clientY,
      }),
    }
  }

  function isPointOutsidePanel(clientX, clientY) {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return false
    const rect = root.getBoundingClientRect()
    return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom
  }

  function updateDragGhost(clientX, clientY) {
    const currentShell = ensureShell()
    const ghost = currentShell.dragGhost
    if (!ghost || !pointerDrag || !pointerDrag.dragging) return

    const rect = root.getBoundingClientRect()
    ghost.style.transform = `translate(${Math.round(clientX - rect.left + 12)}px, ${Math.round(clientY - rect.top + 10)}px)`
  }

  function stopDragAutoScroll() {
    if (autoScrollRafId) {
      window.cancelAnimationFrame(autoScrollRafId)
      autoScrollRafId = 0
    }
    if (pointerDrag) {
      pointerDrag.autoScrollVelocity = 0
      pointerDrag.lastPointerX = null
      pointerDrag.lastPointerY = null
    }
  }

  function applyDragAutoScroll() {
    if (!pointerDrag || !pointerDrag.dragging) {
      stopDragAutoScroll()
      return
    }

    const currentShell = ensureShell()
    const list = currentShell.tabList
    const velocity = Number(pointerDrag.autoScrollVelocity) || 0
    if (!list || Math.abs(velocity) < 0.1) {
      autoScrollRafId = 0
      return
    }

    const previousScrollTop = list.scrollTop
    const maxScrollTop = Math.max(0, list.scrollHeight - list.clientHeight)
    const nextScrollTop = Math.max(0, Math.min(maxScrollTop, previousScrollTop + velocity))
    if (Math.abs(nextScrollTop - previousScrollTop) < 0.1) {
      autoScrollRafId = 0
      return
    }

    list.scrollTop = nextScrollTop

    const pointerX = Number(pointerDrag.lastPointerX)
    const pointerY = Number(pointerDrag.lastPointerY)
    if (Number.isFinite(pointerX) && Number.isFinite(pointerY)) {
      updateDragGhost(pointerX, pointerY)
      const drop = resolveDropTarget(pointerX, pointerY)
      if (drop && onUpdateDropTarget) {
        onUpdateDropTarget(drop.tabId, drop.position)
      } else if (onUpdateDropTarget) {
        onUpdateDropTarget(null, null)
      }
    }

    autoScrollRafId = window.requestAnimationFrame(applyDragAutoScroll)
  }

  function updateDragAutoScroll(clientX, clientY) {
    const currentShell = ensureShell()
    const list = currentShell.tabList
    if (!pointerDrag || !list) return

    pointerDrag.lastPointerX = clientX
    pointerDrag.lastPointerY = clientY

    const rect = list.getBoundingClientRect()
    const withinHorizontalBounds = clientX >= rect.left && clientX <= rect.right
    const withinVerticalBounds = clientY >= rect.top && clientY <= rect.bottom

    if (!withinHorizontalBounds || !withinVerticalBounds) {
      stopDragAutoScroll()
      return
    }

    const edgeDistance = 40
    let velocity = 0

    if (clientY < rect.top + edgeDistance) {
      const progress = 1 - ((clientY - rect.top) / edgeDistance)
      velocity = -Math.max(4, progress * 18)
    } else if (clientY > rect.bottom - edgeDistance) {
      const progress = 1 - ((rect.bottom - clientY) / edgeDistance)
      velocity = Math.max(4, progress * 18)
    }

    pointerDrag.autoScrollVelocity = velocity
    if (Math.abs(velocity) < 0.1) {
      stopDragAutoScroll()
      return
    }

    if (!autoScrollRafId) {
      autoScrollRafId = window.requestAnimationFrame(applyDragAutoScroll)
    }
  }

  function showDragGhost(tabId, clientX, clientY) {
    const currentShell = ensureShell()
    const ghost = currentShell.dragGhost
    if (!ghost) return

    const treeItems = latestState && Array.isArray(latestState.treeTabs) ? latestState.treeTabs : []
    const draggedIds = latestState && latestState.drag && Array.isArray(latestState.drag.draggedIds)
      ? latestState.drag.draggedIds
      : [tabId]
    const ghostItems = draggedIds
      .map(id => treeItems.find(item => item && item.id === id))
      .filter(Boolean)
    const fallbackTab = findTab(tabId)
    const items = ghostItems.length
      ? ghostItems
      : [{
        id: tabId,
        tab: fallbackTab || { title: 'Tab' },
        subtreeSize: 1,
      }]
    const visibleItems = items.slice(0, 4)
    const extraCount = Math.max(0, items.length - visibleItems.length)

    ghost.innerHTML = `
      <div class="svb-drag-ghost__stack${items.length > 1 ? ' is-multi' : ''}">
        ${visibleItems.map((item, index) => {
          const subtreeSize = Number(item.subtreeSize) || 1
          const title = item.tab && item.tab.title ? item.tab.title : 'Tab'
          return `
            <div class="svb-drag-ghost__card" style="--svb-ghost-index:${index};--svb-ghost-x:${index * 6}px;--svb-ghost-y:${index * 8}px">
              <span class="svb-drag-ghost__icon"></span>
              <span class="svb-drag-ghost__title">${escapeHtml(title)}</span>
              ${subtreeSize > 1 ? `<span class="svb-drag-ghost__count">${subtreeSize}</span>` : ''}
            </div>
          `
        }).join('')}
        ${extraCount > 0 ? `<span class="svb-drag-ghost__more">+${extraCount}</span>` : ''}
      </div>
    `
    ghost.classList.add('is-visible')
    updateDragGhost(clientX, clientY)
  }

  function hideDragGhost() {
    const currentShell = shell
    const ghost = currentShell && currentShell.dragGhost
    if (!ghost) return

    ghost.classList.remove('is-visible')
    ghost.innerHTML = ''
    ghost.style.transform = ''
  }

  function finishPointerDrag(clientX, clientY, allowExternalDrop = true) {
    if (!pointerDrag) return
    stopDragAutoScroll()

    const drop = pointerDrag.dragging ? resolveDropTarget(clientX, clientY) : null
    if (pointerDrag.dragging && drop && onCommitDrop) {
      onCommitDrop(drop.tabId, drop.position)
    } else if (pointerDrag.dragging && allowExternalDrop && isPointOutsidePanel(clientX, clientY) && onCommitExternalDrop) {
      onCommitExternalDrop()
    } else if (pointerDrag.dragging && onClearDrag) {
      onClearDrag()
    }

    pointerDrag = null
    hideDragGhost()
  }

  function positionSubmenu(menuItem) {
    if (!menuItem) return
    const submenu = menuItem.querySelector('.svb-menu__submenu')
    if (!submenu) return

    menuItem.classList.remove('is-submenu-up')
    submenu.style.maxHeight = ''
    submenu.style.overflowY = ''
    submenu.style.visibility = 'hidden'
    submenu.style.display = 'block'

    const margin = 6
    const itemRect = menuItem.getBoundingClientRect()
    const submenuRect = submenu.getBoundingClientRect()
    const fitsBelow = itemRect.top - 5 + submenuRect.height <= window.innerHeight - margin

    if (!fitsBelow) {
      menuItem.classList.add('is-submenu-up')
    }

    const availableHeight = menuItem.classList.contains('is-submenu-up')
      ? Math.max(120, itemRect.bottom - margin)
      : Math.max(120, window.innerHeight - itemRect.top - margin)

    submenu.style.maxHeight = `${availableHeight}px`
    submenu.style.overflowY = 'auto'
    submenu.style.display = ''
    submenu.style.visibility = ''
  }

  if (dragShield) {
    dragShield.addEventListener('click', event => {
      if (contextMenu) {
        event.preventDefault()
        event.stopPropagation()
        contextMenu = null
        renderCurrent()
      }
    }, eventOptions)

    dragShield.addEventListener('contextmenu', event => {
      if (contextMenu) {
        event.preventDefault()
        event.stopPropagation()
        contextMenu = null
        renderCurrent()
      }
    }, eventOptions)
  }

  root.addEventListener('click', event => {
    if (event.target.closest('[data-role="rename-input"]')) return

    const menuAction = event.target.closest('[data-role="context-menu-action"]')
    if (menuAction) {
      event.preventDefault()
      event.stopPropagation()
      if (!menuAction.classList.contains('is-disabled') && contextMenu && onContextMenuAction) {
        const workspaceId = Number(menuAction.getAttribute('data-workspace-id'))
        const colorKey = menuAction.getAttribute('data-color-key')
        const bookmarkTreeId = menuAction.getAttribute('data-bookmark-tree-id')
        onContextMenuAction(menuAction.getAttribute('data-action'), {
          tabId: contextMenu.tabId,
          workspaceId: Number.isFinite(workspaceId) ? workspaceId : null,
          colorKey: typeof colorKey === 'string' ? colorKey : null,
          bookmarkTreeId: bookmarkTreeId || null,
        })
      }

      if (menuAction.getAttribute('data-action') === 'rename' && contextMenu) {
        startEditing(contextMenu.tabId)
      }

      contextMenu = null
      renderCurrent()
      return
    }

    if (contextMenu && !event.target.closest('.svb-menu')) {
      contextMenu = null
      renderCurrent()
      return
    }

    if (suppressClick) {
      suppressClick = false
      event.preventDefault()
      event.stopPropagation()
      return
    }

    const target = event.target.closest('[data-role]')
    if (!target) return

    const role = target.dataset.role
    const tabId = Number(target.getAttribute('data-tab-id'))

    if (role === 'toggle-mute' && Number.isFinite(tabId)) {
      event.preventDefault()
      event.stopPropagation()
      if (onToggleMute) onToggleMute(tabId)
      return
    }

    if (role === 'activate-tab' && Number.isFinite(tabId)) {
      if (editingTabId === tabId) return
      const isPinnedTab = !!target.closest('.svb-pinned-tab')
      const selectionMode = event.shiftKey
        ? 'range'
        : (event.ctrlKey || event.metaKey)
          ? 'toggle'
          : 'single'

      if (isPinnedTab || !onSelectTab) {
        onActivateTab(tabId)
        return
      }

      onSelectTab(tabId, {
        mode: selectionMode,
        orderedVisibleIds: currentVisibleIds.slice(),
        activate: selectionMode === 'single',
      })
      return
    }

    if (role === 'close-tab' && Number.isFinite(tabId)) {
      event.stopPropagation()
      onCloseTab(tabId)
      return
    }

    if (role === 'toggle-collapse' && Number.isFinite(tabId)) {
      event.stopPropagation()
      onToggleCollapse(tabId)
      return
    }

    if (role === 'create-tab') {
      pendingScrollToActive = true
      pendingScrollSourceTabId = latestState && Number.isFinite(latestState.activeTabId)
        ? latestState.activeTabId
        : null
      onCreateTab()
    }
    if (role === 'create-child-tab' && Number.isFinite(tabId)) {
      pendingScrollToActive = true
      pendingScrollSourceTabId = latestState && Number.isFinite(latestState.activeTabId)
        ? latestState.activeTabId
        : null
      onCreateChildTab(tabId)
      return
    }
    if (role === 'collapse-all') {
      onCollapseAll()
      return
    }
    if (role === 'toggle-pinned') onTogglePinned()
    if (role === 'toggle-settings') {
      isSettingsOpen = !isSettingsOpen
      renderCurrent()
    }
  }, eventOptions)

  root.addEventListener('change', event => {
    const input = event.target.closest('.svb-settings-view input')
    if (!input || !input.name) return

    settingsStore.set(input.name, input.value)
    renderCurrent()
  }, eventOptions)

  root.addEventListener('dblclick', event => {
    const input = event.target.closest('[data-role="rename-input"]')
    if (input) return
    if (event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"], [data-role="toggle-mute"]')) return

    const tabButton = event.target.closest('.svb-tab[data-tab-id]:not(.is-compact)')
    if (!tabButton) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return

    event.preventDefault()
    event.stopPropagation()

    const action = settingsStore.get('doubleClickAction')
    if (action === 'close') {
      onCloseTab(tabId)
    } else {
      startEditing(tabId)
    }
  }, eventOptions)

  root.addEventListener('pointerdown', event => {
    if (event.button === 1) {
      const tabButton = event.target.closest('.svb-tab[data-tab-id]')
      if (!tabButton || event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"], [data-role="rename-input"], [data-role="toggle-mute"]')) return
      if (tabButton.classList.contains('svb-pinned-tab')) return

      const tabId = Number(tabButton.getAttribute('data-tab-id'))
      if (!Number.isFinite(tabId)) return

      event.preventDefault()
      event.stopPropagation()
      onCloseTab(tabId)
      return
    }

    if (event.button !== 0) return
    if (event.target.closest('.svb-menu')) return
    if (event.target.closest('[data-role="rename-input"]')) return
    if (event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"], [data-role="toggle-mute"]')) return

    const tabButton = event.target.closest('.svb-tab[data-tab-id]:not(.is-compact)')
    if (tabButton) {
      event.preventDefault()
    }
    if (!tabButton || !onStartDrag) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    const parentIdRaw = tabButton.getAttribute('data-parent-id')
    const sourceParentId = parentIdRaw === '' ? null : Number(parentIdRaw)
    if (!Number.isFinite(tabId)) return

    pointerDrag = {
      tabId,
      sourceParentId: Number.isFinite(sourceParentId) ? sourceParentId : null,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      autoScrollVelocity: 0,
      lastPointerX: null,
      lastPointerY: null,
      pointerId: event.pointerId,
    }

    if (typeof tabButton.setPointerCapture === 'function') {
      try {
        tabButton.setPointerCapture(event.pointerId)
      } catch (_error) {
        void _error
      }
    }
  }, eventOptions)

  root.addEventListener('pointermove', event => {
    if (!pointerDrag) return

    const deltaX = event.clientX - pointerDrag.startX
    const deltaY = event.clientY - pointerDrag.startY
    const movedEnough = Math.abs(deltaX) >= 6 || Math.abs(deltaY) >= 6

    if (!pointerDrag.dragging && movedEnough) {
      pointerDrag.dragging = true
      suppressClick = true
      onStartDrag(pointerDrag.tabId, {
        sourceParentId: pointerDrag.sourceParentId,
      })
      showDragGhost(pointerDrag.tabId, event.clientX, event.clientY)
    }

    if (!pointerDrag.dragging) return
    updateDragGhost(event.clientX, event.clientY)
    updateDragAutoScroll(event.clientX, event.clientY)

    const drop = resolveDropTarget(event.clientX, event.clientY)
    if (drop && onUpdateDropTarget) {
      onUpdateDropTarget(drop.tabId, drop.position)
      return
    }

    if (onUpdateDropTarget) {
      onUpdateDropTarget(null, null)
    }
  }, eventOptions)

  root.addEventListener('pointerup', event => {
    finishPointerDrag(event.clientX, event.clientY)
  }, eventOptions)

  root.addEventListener('pointercancel', () => {
    finishPointerDrag(-1, -1, false)
  }, eventOptions)

  root.addEventListener('lostpointercapture', () => {
    finishPointerDrag(-1, -1, false)
  }, eventOptions)

  root.addEventListener('contextmenu', event => {
    if (event.target.closest('[data-role="rename-input"]')) return
    const tabButton = event.target.closest('.svb-tab[data-tab-id]')
    if (!tabButton) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return

    event.preventDefault()
    event.stopPropagation()
    if (onOpenContextMenu) onOpenContextMenu(tabId)

    const rootRect = root.getBoundingClientRect()
    contextMenu = {
      tabId,
      x: event.clientX - rootRect.left,
      y: event.clientY - rootRect.top,
      viewportY: event.clientY,
    }
    renderCurrent()
  }, eventOptions)

  root.addEventListener('pointerover', event => {
    const menuItem = event.target.closest('.svb-menu__item.has-submenu')
    if (!menuItem) return
    positionSubmenu(menuItem)
  }, eventOptions)

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pointerDrag) {
      event.preventDefault()
      suppressClick = false
      stopDragAutoScroll()
      finishPointerDrag(-1, -1, false)
      return
    }
    if (editingTabId != null && event.key === 'Escape') {
      event.preventDefault()
      stopEditing(true)
      return
    }
    if (!contextMenu || event.key !== 'Escape') return
    contextMenu = null
    renderCurrent()
  }, eventOptions)

  document.addEventListener('pointerdown', event => {
    if (!contextMenu) return
    if (root.contains(event.target)) return
    contextMenu = null
    renderCurrent()
  }, { capture: true, signal: eventController.signal })

  window.addEventListener('blur', () => {
    if (contextMenu) {
      contextMenu = null
      renderCurrent()
    }
  }, { signal: eventController.signal })

  root.addEventListener('keydown', event => {
    const input = event.target.closest('[data-role="rename-input"]')
    if (!input) return

    if (event.key === 'Enter') {
      event.preventDefault()
      stopEditing(false)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      stopEditing(true)
    }
  }, eventOptions)

  root.addEventListener('focusout', event => {
    const input = event.target.closest('[data-role="rename-input"]')
    if (!input) return
    if (input.contains(event.relatedTarget)) return
    stopEditing(false)
  }, eventOptions)

  function syncScroll(list, state, previousScrollTop) {
    if (typeof previousScrollTop !== 'number' && (!pendingScrollToActive || !state.activeTabId)) return
    if (!list) return
    if (typeof previousScrollTop === 'number') {
      list.scrollTop = previousScrollTop
    }

    if (!pendingScrollToActive || !state.activeTabId) return
    if (Number.isFinite(pendingScrollSourceTabId) && state.activeTabId === pendingScrollSourceTabId) {
      return
    }

    const activeTab = list.querySelector(`.svb-tab[data-tab-id="${state.activeTabId}"]`)
    if (activeTab) {
      const listRect = list.getBoundingClientRect()
      const activeRect = activeTab.getBoundingClientRect()
      const epsilon = 1
      const visibleTop = listRect.top
      const visibleBottom = listRect.bottom

      if (activeRect.top < visibleTop - epsilon) {
        list.scrollTop += activeRect.top - visibleTop
      } else if (activeRect.bottom > visibleBottom + epsilon) {
        list.scrollTop += activeRect.bottom - visibleBottom
      }
    }

    pendingScrollToActive = false
    pendingScrollSourceTabId = null
  }

  function syncOverflowState() {
    const currentShell = ensureShell()
    const frame = currentShell.frame
    const list = currentShell.tabList
    if (!frame || !list) return

    const hasScroll = list.scrollHeight > list.clientHeight + 1
    frame.classList.toggle('has-scroll', hasScroll)
  }

  function positionContextMenu() {
    const currentShell = ensureShell()
    const menu = currentShell.menuHost.querySelector('.svb-menu')
    if (!menu || !contextMenu) return

    const margin = 10
    const rect = menu.getBoundingClientRect()
    const panelPosition = settingsStore.get('panelPosition')
    const isRight = panelPosition === 'right'

    // Vertical positioning
    let top = contextMenu.y
    if (contextMenu.viewportY + rect.height > window.innerHeight - margin) {
      top = contextMenu.y - rect.height
      if (contextMenu.viewportY - rect.height < margin) {
        const rootRect = root.getBoundingClientRect()
        top = window.innerHeight - rect.height - margin - rootRect.top
      }
    }

    // Horizontal positioning
    let left = contextMenu.x
    if (isRight) {
      // Position to the left of the cursor
      left = contextMenu.x - rect.width
      // Ensure it doesn't go off-screen to the left
      if (contextMenu.viewportX - rect.width < margin) {
        left = margin - root.getBoundingClientRect().left
      }
    } else {
      // Default: position to the right of the cursor
      // Ensure it doesn't go off-screen to the right
      if (contextMenu.viewportX + rect.width > window.innerWidth - margin) {
        left = window.innerWidth - rect.width - margin - root.getBoundingClientRect().left
      }
    }

    menu.style.left = `${left}px`
    menu.style.top = `${top}px`
    menu.classList.toggle('is-right-side', isRight)
  }
  return {
    render(state) {
      if (!state) return
      latestState = state
      renderCurrent = () => this.render(latestState)
      const currentShell = ensureShell()
      root.classList.toggle('is-menu-open', !!contextMenu)
      const visualState = buildVisualState(state)
      const treeTabs = Array.isArray(state.treeTabs) ? state.treeTabs : []
      const isDragging = visualState.draggedIdSet.size > 0
      const structureChanged = !areTabOrdersEqual(previousPinnedTabsSnapshot, state.pinnedTabs)
        || !isSameTreeShape(previousTreeTabsSnapshot, treeTabs)
      const contentChangedIds = structureChanged
        ? new Set()
        : collectContentChangedIds(previousPinnedTabsSnapshot, state.pinnedTabs, previousTreeTabsSnapshot, treeTabs)

      if (structureChanged || currentVisibleIds.length !== treeTabs.length) {
        currentVisibleIds = treeTabs.map(item => item.id)
      }
      const activeTabChanged = state.activeTabId !== previousActiveTabId
      const activeRegularTabVisible = Number.isFinite(state.activeTabId) && currentVisibleIds.includes(state.activeTabId)
      if (activeTabChanged && activeRegularTabVisible) {
        pendingScrollToActive = true
        pendingScrollSourceTabId = previousActiveTabId
      }
      if (!structureChanged) {
        updateVisualOnlyNodes(state, treeTabs, visualState, currentShell, contentChangedIds)
        syncScroll(currentShell.tabList, state)
      } else {
        const previousScrollTop = currentShell.tabList ? currentShell.tabList.scrollTop : 0
        const previousRects = measureTabRects()
        const empty = state.ready && state.tabs.length === 0 && state.pinnedTabs.length === 0
        const emptyMessage = state.outsideWorkspace
          ? 'No tabs outside workspaces'
          : state.filteredByWorkspace
            ? 'No tabs in this workspace'
            : 'No tabs in this window'

        updateShellControls(currentShell, state, treeTabs)

        const activeKeys = new Set()
        const pinnedNodes = state.pinnedTabs.map(tab => {
          activeKeys.add(getTabKey(tab, true))
          return getOrUpdateTabNode(tab, true, state.canCloseVisibleTabs, null, visualState)
        })
        const regularNodes = treeTabs.map(item => {
          activeKeys.add(getTabKey(item.tab, false))
          return getOrUpdateTabNode(item.tab, false, state.canCloseVisibleTabs, item, visualState)
        })

        syncChildren(currentShell.pinnedGrid, pinnedNodes)
        const listNodes = empty
          ? [currentShell.emptyMessage, currentShell.inlineNewTabButton]
          : regularNodes.concat(currentShell.inlineNewTabButton)
        if (empty) {
          currentShell.emptyMessage.textContent = emptyMessage
        }
        syncChildren(currentShell.tabList, listNodes)
        pruneTabNodes(activeKeys)
        updateContextMenu(currentShell, state)

        syncOverflowState()
        syncScroll(currentShell.tabList, state, previousScrollTop)
        const enteringNodeSnapshot = new Set(pendingEnterNodes)
        if (!isDragging) {
          animateMovedTabs(previousRects, enteringNodeSnapshot)
        }
        flushEnterAnimations()
      }

      previousPinnedTabsSnapshot = state.pinnedTabs
      previousTreeTabsSnapshot = treeTabs
      previousActiveTabId = state.activeTabId
      previousCanCloseVisibleTabs = state.canCloseVisibleTabs
      previousPanelPinned = state.panelPinned
      previousIsSettingsOpen = isSettingsOpen
      previousSelectedIds = visualState.selectedIds.slice()
      previousDraggedIds = visualState.draggedIds.slice()
      previousDropTargetId = visualState.dropTargetId
      previousDropPosition = visualState.dropPosition
      if (editingTabId != null) {
        const input = root.querySelector(`.svb-tab__title-input[data-tab-id="${editingTabId}"]`)
        if (input && document.activeElement !== input) {
          input.focus()
          input.select()
        }
      }
    },

    dispose() {
      eventController.abort()
      stopDragAutoScroll()
      pointerDrag = null
      hideDragGhost()
      contextMenu = null
      pendingEnterNodes.clear()
      tabNodesByKey.clear()
      renderCurrent = () => {}
      latestState = null
    },
  }
}

module.exports = { createSidebarRenderer }

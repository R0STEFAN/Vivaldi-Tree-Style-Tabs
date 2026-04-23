const { WORKSPACES_BY_ID } = require('../generated/workspaces-data.js')

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
    bookmark: '<path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V20l-6-3.5L6 20z"/>',
    folder: '<path d="M4 7h6l2 2h8v9H4z"/><path d="M4 7v11"/>',
    color: '<path d="M12 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/><path d="M19 15.5a2 2 0 1 1-4 0c0-1.4 2-3.8 2-3.8s2 2.4 2 3.8Z"/><path d="M8.5 18a1.5 1.5 0 1 1-3 0c0-1 1.5-2.9 1.5-2.9S8.5 17 8.5 18Z"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
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
  const workspaces = (Array.isArray(state.workspaces) && state.workspaces.length
    ? state.workspaces
    : Object.values(WORKSPACES_BY_ID || {}))
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

  const mediaHtml = tab.muted
    ? '<span class="svb-tab__badge">Muted</span>'
    : tab.audible
      ? '<span class="svb-tab__badge">Audio</span>'
      : ''
  syncOptionalDirectChild(content, '.svb-tab__badge', mediaHtml, null)
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

  const media = tab.muted
    ? `<span class="svb-tab__badge">Muted</span>`
    : tab.audible
      ? `<span class="svb-tab__badge">Audio</span>`
      : ''

  const hasClose = !compact && canClose
  const hasAdd = !compact
  const rowVisualState = getTabVisualState(tab.id, item, visualState)
  const discardedClass = tab.discarded ? ' is-discarded' : ''
  const tiledClass = tab.vivExtData && tab.vivExtData.tiling ? ' is-tiled' : ''
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
    <svg class="svb-pin-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 14.5L5.23281 13.8586C4.98374 14.1565 4.92965 14.5716 5.09407 14.9234C5.25849 15.2752 5.61169 15.5 6 15.5V14.5ZM18 14.5V15.5C18.3883 15.5 18.7415 15.2752 18.9059 14.9234C19.0704 14.5716 19.0163 14.1565 18.7672 13.8586L18 14.5ZM11 20.5C11 21.0523 11.4477 21.5 12 21.5C12.5523 21.5 13 21.0523 13 20.5H11ZM7.49906 5.70911C7.74158 6.67224 8 8.13592 8 10H10C10 7.9508 9.71592 6.32242 9.43853 5.22076L7.49906 5.70911ZM8 10C8 9.89339 8.02858 9.88786 7.95663 10.0505C7.89859 10.1816 7.80513 10.3562 7.67578 10.5699C7.41832 10.9952 7.06464 11.5003 6.69686 11.9961C6.33177 12.4883 5.96508 12.9548 5.68868 13.2994C5.55078 13.4713 5.43603 13.6121 5.35608 13.7094C5.31612 13.7581 5.28489 13.7959 5.26385 13.8212C5.25333 13.8339 5.24536 13.8435 5.24013 13.8498C5.23751 13.8529 5.23558 13.8553 5.23435 13.8567C5.23374 13.8575 5.2333 13.858 5.23304 13.8583C5.23291 13.8585 5.23283 13.8586 5.23279 13.8586C5.23277 13.8586 5.23278 13.8586 5.23277 13.8586C5.23278 13.8586 5.23281 13.8586 6 14.5C6.76719 15.1414 6.76724 15.1414 6.7673 15.1413C6.76734 15.1412 6.76741 15.1412 6.76748 15.1411C6.76763 15.1409 6.76782 15.1407 6.76805 15.1404C6.76852 15.1398 6.76917 15.139 6.77 15.1381C6.77166 15.1361 6.77403 15.1332 6.77708 15.1296C6.7832 15.1222 6.79208 15.1115 6.80353 15.0977C6.82644 15.0701 6.85966 15.0299 6.90173 14.9787C6.98584 14.8762 7.10547 14.7295 7.24882 14.5508C7.53492 14.1941 7.91823 13.7066 8.30314 13.1877C8.68536 12.6725 9.08168 12.1095 9.38672 11.6056C9.53862 11.3547 9.67953 11.0994 9.78556 10.8598C9.87767 10.6517 10 10.3345 10 10H8ZM18 14.5C18.7672 13.8586 18.7672 13.8586 18.7672 13.8586C18.7672 13.8586 18.7672 13.8586 18.7672 13.8586C18.7672 13.8586 18.7671 13.8585 18.767 13.8583C18.7667 13.858 18.7663 13.8575 18.7657 13.8567C18.7644 13.8553 18.7625 13.8529 18.7599 13.8498C18.7546 13.8435 18.7467 13.8339 18.7362 13.8212C18.7151 13.7959 18.6839 13.7581 18.6439 13.7094C18.564 13.6121 18.4492 13.4713 18.3113 13.2994C18.0349 12.9548 17.6682 12.4883 17.3031 11.9961C16.9354 11.5003 16.5817 10.9952 16.3242 10.5699C16.1949 10.3562 16.1014 10.1816 16.0434 10.0505C15.9714 9.88786 16 9.89339 16 10L14 10C14 10.3346 14.1223 10.6517 14.2144 10.8598C14.3205 11.0994 14.4614 11.3547 14.6133 11.6056C14.9183 12.1095 15.3146 12.6725 15.6969 13.1877C16.0818 13.7066 16.4651 14.1941 16.7512 14.5508C16.8945 14.7295 17.0142 14.8762 17.0983 14.9787C17.1403 15.0299 17.1736 15.0701 17.1965 15.0977C17.2079 15.1115 17.2168 15.1222 17.2229 15.1296C17.226 15.1332 17.2283 15.1361 17.23 15.1381C17.2308 15.139 17.2315 15.1398 17.2319 15.1404C17.2322 15.1407 17.2324 15.1409 17.2325 15.1411C17.2326 15.1412 17.2327 15.1412 17.2327 15.1413C17.2328 15.1414 17.2328 15.1414 18 14.5ZM9.54068 5H14.7843V3H9.54068V5ZM16 10C16 9.78963 16.0987 9.07847 16.2609 8.11255C16.415 7.19476 16.6063 6.15802 16.7534 5.37905L14.7882 5.00779C14.6401 5.79152 14.446 6.84368 14.2885 7.78131C14.1391 8.67081 14 9.58158 14 10L16 10ZM6 15.5H12V13.5H6V15.5ZM12 15.5H18V13.5H12V15.5ZM11 14.5V20.5H13V14.5H11ZM14.7843 5C14.7867 5 14.7872 5.00024 14.7864 5.00006C14.7858 4.99991 14.785 4.99964 14.7845 4.99937C14.7836 4.99893 14.7847 4.9993 14.7865 5.00145C14.7883 5.00361 14.7887 5.00519 14.7887 5.00511C14.7887 5.00493 14.7886 5.00463 14.7886 5.00443C14.7886 5.00414 14.7887 5.00511 14.7882 5.00779L16.7534 5.37905C16.986 4.14809 16.0444 3 14.7843 3V5ZM9.43853 5.22076C9.42851 5.18099 9.43514 5.11382 9.4797 5.05164C9.49951 5.02399 9.51862 5.00978 9.529 5.00401C9.53698 4.99957 9.53917 5 9.54068 5V3C8.07935 3 7.18486 4.46129 7.49906 5.70911L9.43853 5.22076Z"
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
  const { root, onActivateTab, onCloseTab, onCreateTab, onCreateChildTab, onRenameTab, onTogglePinned, onToggleCollapse, onCollapseAll, onSelectTab, onOpenContextMenu, onContextMenuAction, onStartDrag, onUpdateDropTarget, onCommitDrop, onCommitExternalDrop, onClearDrag } = options
  let pendingScrollToActive = false
  let pendingScrollSourceTabId = null
  let currentVisibleIds = []
  let previousActiveTabId = null
  let previousPinnedTabsSnapshot = null
  let previousTreeTabsSnapshot = null
  let previousCanCloseVisibleTabs = null
  let previousPanelPinned = null
  let previousSelectedIds = []
  let previousDraggedIds = []
  let previousDropTargetId = null
  let previousDropPosition = null
  const tabNodesByKey = new Map()
  const enteringNodes = new WeakSet()
  const pendingEnterNodes = new Set()
  let pointerDrag = null
  let suppressClick = false
  let contextMenu = null
  let latestState = null
  let renderCurrent = () => {}
  let shell = null
  let editingTabId = null
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
          <div class="svb-header__count">0</div>
          <div class="svb-header__actions">
            <button class="svb-icon-button" data-role="collapse-all" title="Collapse all trees" aria-label="Collapse all trees"></button>
            <button class="svb-icon-button" data-role="toggle-pinned" title="Pin panel"></button>
          </div>
        </div>

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
      <div class="svb-resize-handle" aria-hidden="true"></div>
      <div class="svb-drag-ghost" aria-hidden="true"></div>
      <div class="svb-menu-host"></div>
    `

    shell = {
      frame: root.querySelector('.svb-frame'),
      count: root.querySelector('.svb-header__count'),
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
    currentShell.pinnedSection.style.display = state.pinnedTabs.length ? '' : 'none'
  }

  function updateContextMenu(currentShell, state) {
    if (!contextMenu) {
      if (currentShell.menuHost.childElementCount > 0) {
        currentShell.menuHost.innerHTML = ''
      }
      return
    }
    const allTabsById = new Map(state.pinnedTabs.concat(state.tabs).map(tab => [tab.id, tab]))
    const contextTab = allTabsById.get(contextMenu.tabId) || null
    currentShell.menuHost.innerHTML = renderContextMenu(contextTab, state, contextMenu)
    positionContextMenu()
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

    if (previousPanelPinned !== state.panelPinned) {
      updateShellControls(currentShell, state, treeTabs)
    }

    updateContextMenu(currentShell, state)
  }

  function syncTabNode(node, tab, compact, canClose, item, editing, visualState) {
    const hasClose = !compact && canClose
    const hasAdd = !compact
    const rowVisualState = getTabVisualState(tab.id, item, visualState)
    const discardedClass = tab.discarded ? ' is-discarded' : ''
    const tiledClass = tab.vivExtData && tab.vivExtData.tiling ? ' is-tiled' : ''
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

    const role = target.getAttribute('data-role')
    const tabId = Number(target.getAttribute('data-tab-id'))

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
  }, eventOptions)

  root.addEventListener('dblclick', event => {
    const input = event.target.closest('[data-role="rename-input"]')
    if (input) return
    if (event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"]')) return

    const tabButton = event.target.closest('.svb-tab[data-tab-id]:not(.is-compact)')
    if (!tabButton) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return

    event.preventDefault()
    event.stopPropagation()
    startEditing(tabId)
  }, eventOptions)

  root.addEventListener('pointerdown', event => {
    if (event.button === 1) {
      const tabButton = event.target.closest('.svb-tab[data-tab-id]')
      if (!tabButton || event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"], [data-role="rename-input"]')) return
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
    if (event.target.closest('[data-role="close-tab"], [data-role="toggle-collapse"], [data-role="create-child-tab"]')) return

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
    contextMenu = {
      tabId,
      x: event.clientX,
      y: event.clientY,
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
    if (!menu) return

    const margin = 6
    const rect = menu.getBoundingClientRect()
    const currentLeft = Number.parseFloat(menu.style.left) || 0
    const currentTop = Number.parseFloat(menu.style.top) || 0
    const desiredViewportLeft = Math.max(margin, Math.min(rect.left, window.innerWidth - rect.width - margin))
    const desiredViewportTop = Math.max(margin, Math.min(rect.top, window.innerHeight - rect.height - margin))
    menu.style.left = `${currentLeft + desiredViewportLeft - rect.left}px`
    menu.style.top = `${currentTop + desiredViewportTop - rect.top}px`
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

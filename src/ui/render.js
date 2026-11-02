const { settingsStore } = require('../store/settings-store.js')
const { syncPinnedGrid } = require('./pinned-grid.js')
const { syncWorkspaceStrip } = require('./workspace-strip.js')
const { fetchAvailableModels } = require('../services/gemini-api.js')

function getTabHoverTitle(tab, isActive) {
  let title = tab.title || ''
  const record = tab.vivExtData && typeof tab.vivExtData === 'object' && tab.vivExtData['svbTree']
  if (record && record.createdAt) {
    if (isActive) {
      title += '\n\nOpened: Just now (Active)'
    } else {
      const ageMs = Date.now() - Number(record.createdAt)
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
      const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60))
      title += '\n\nOpened: '
      if (ageDays > 0) title += `${ageDays}d `
      if (ageHours > 0) title += `${ageHours}h `
      if (ageDays === 0 && ageHours === 0) title += `${ageMinutes}m `
      title += 'ago'
    }
  }
  return title
}

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
    top: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/><path d="M5 21h14"/>',
    bottom: '<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/><path d="M5 3h14"/>',
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
    reload: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    sleep: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  }
  return `<svg class="svb-menu__icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.workspace}</svg>`
}

function getActiveWorkspaceKey(state) {
  if (state.outsideWorkspace) return 'outside'
  return state.activeWorkspaceId == null ? 'none' : Number(state.activeWorkspaceId)
}

// Native workspace icons are either Vivaldi SVG markup or an emoji. Only a
// plain <svg> without scripts/handlers is inlined; anything else is text.
function renderWorkspaceIcon(icon, fallback) {
  const value = typeof icon === 'string' ? icon.trim() : ''
  if (/^<svg[\s>]/i.test(value) && !/<script|\son\w+\s*=|javascript:/i.test(value)) {
    return `<span class="svb-workspace__icon">${value}</span>`
  }
  if (value && !value.startsWith('<') && [...value].length <= 4) {
    return `<span class="svb-workspace__icon svb-workspace__icon--text">${escapeHtml(value)}</span>`
  }
  return `<span class="svb-workspace__icon">${renderMenuIcon(fallback)}</span>`
}

function getWorkspaceBarEntries(state) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : []
  const activeKey = getActiveWorkspaceKey(state)
  const entries = []

  if (state.hasTabsOutsideWorkspace) {
    entries.push({ id: '', name: 'Default', icon: null, fallback: 'window', isActive: activeKey === 'outside' || activeKey === 'none' })
  }

  for (const workspace of workspaces) {
    const id = Number(workspace.id)
    if (!Number.isFinite(id)) continue
    entries.push({ id, name: workspace.name || `Workspace ${id}`, icon: workspace.icon, fallback: 'workspace', isActive: activeKey === id })
  }

  return entries
}

// Workspace switcher, modeled on Vivaldi's own workspace popup: a single
// horizontally scrolling row of icon buttons (the "+" stays pinned at the
// end), with a full-width title line underneath naming the active workspace
// (or the one under the pointer).
// Hidden when there are no workspaces, so single-workspace users see no
// extra chrome.
function renderWorkspaceBar(state, creating, renamingId) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : []
  if (workspaces.length === 0 && !creating) return ''

  const entries = getWorkspaceBarEntries(state)
  const active = entries.find(entry => entry.isActive) || null

  const buttons = entries.map(entry => `<button class="svb-workspace${entry.isActive ? ' is-active' : ''}" data-role="switch-workspace" data-workspace-id="${entry.id}" data-workspace-name="${escapeHtml(entry.name)}" title="${escapeHtml(entry.name)}" aria-label="${escapeHtml(entry.name)}">${renderWorkspaceIcon(entry.icon, entry.fallback)}</button>`)
  const addButton = `<button class="svb-workspace svb-workspace--add" data-role="create-workspace" data-workspace-name="New workspace" title="New workspace" aria-label="New workspace">${renderMenuIcon('add')}</button>`

  // While naming/renaming, the title line becomes the input so the field is
  // full-width and never scrolls the panel.
  let titleLine
  if (creating || renamingId != null) {
    let value = ''
    if (renamingId != null) {
      const target = workspaces.find(workspace => Number(workspace.id) === Number(renamingId))
      value = target ? (target.name || '') : ''
    }
    titleLine = `<input class="svb-workspace__input" data-role="workspace-name-input" placeholder="Workspace name" spellcheck="false" maxlength="60" value="${escapeHtml(value)}">`
  } else {
    const activeName = active ? active.name : ''
    titleLine = `<div class="svb-workspaces__title" data-active-name="${escapeHtml(activeName)}">${escapeHtml(activeName)}</div>`
  }

  return `<div class="svb-workspaces__row"><div class="svb-workspaces__icons">${buttons.join('')}</div>${addButton}</div>${titleLine}`
}

function workspaceBarSignature(state, creating, renamingId) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : []
  if (workspaces.length === 0 && !creating) return ''
  return [
    creating ? 'creating' : '',
    renamingId != null ? `rename:${renamingId}` : '',
    getActiveWorkspaceKey(state),
    state.hasTabsOutsideWorkspace ? 'd' : '',
    ...workspaces.map(workspace => `${workspace.id}:${workspace.name || ''}:${workspace.icon || ''}`),
  ].join('|')
}

// Right-click menu for a workspace chip. Delete closes the workspace's tabs
// (matching Vivaldi's native "Delete Workspace").
function renderWorkspaceMenu(state, menu) {
  if (!menu) return ''
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : []
  const workspace = workspaces.find(ws => Number(ws.id) === Number(menu.workspaceId)) || null
  const name = workspace ? (workspace.name || `Workspace ${workspace.id}`) : `Workspace ${menu.workspaceId}`
  const menuX = Math.max(4, menu.x)
  const menuY = Math.max(4, menu.y)

  return `
    <div class="svb-menu" style="left:${menuX}px;top:${menuY}px" data-workspace-id="${escapeHtml(String(menu.workspaceId))}" role="menu">
      ${renderContextMenuItem({ action: 'rename-workspace', icon: 'rename', label: `Rename "${name}"`, workspaceId: Number(menu.workspaceId) })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ action: 'delete-workspace', icon: 'close', label: `Delete "${name}"`, danger: true, workspaceId: Number(menu.workspaceId) })}
    </div>
  `
}

function renderContextMenuItem(options) {
  const {
    action,
    icon,
    iconHtml,
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
    workspaceId !== undefined && workspaceId !== null ? `data-workspace-id="${escapeHtml(String(workspaceId))}"` : '',
    bookmarkTreeId != null ? `data-bookmark-tree-id="${escapeHtml(bookmarkTreeId)}"` : '',
  ].filter(Boolean).join(' ')
  const tag = submenu ? 'div' : 'button'
  const type = tag === 'button' ? ' type="button"' : ''

  const iconMarkup = iconHtml || renderMenuIcon(icon)

  return `
    <${tag} ${attrs}${type}>
      ${iconMarkup}
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
  const isFolder = tab && tab.vivExtData && tab.vivExtData.isFolder
  const isPinnedFolder = isFolder && tab.vivExtData.pinnedFolder
  const closeLabel = selectedCount > 1 ? 'Close Selected Tabs' : 'Close Tab'
  const pinLabel = isFolder 
    ? (isPinnedFolder ? 'Unpin Folder' : 'Pin Folder')
    : (tab.pinned ? 'Unpin Tab' : 'Pin Tab')
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
  const workspaceEntries = getWorkspaceBarEntries(state)
  const workspaceItems = workspaceEntries.map(entry => renderContextMenuItem({
    action: 'move-workspace',
    iconHtml: renderWorkspaceIcon(entry.icon, entry.fallback),
    label: entry.name,
    workspaceId: entry.id,
    disabled: entry.isActive,
  })).join('')

  const isTopMode = (settingsStore.get('newTabPlacement') || 'bottom') === 'top'
  const moveSubmenu = `
    ${renderContextMenuItem({ action: 'move-top', icon: 'top', label: selectedCount > 1 ? `Move ${selectedCount} Tabs to Top` : 'Top of Tree', disabled: isPinned })}
    ${renderContextMenuItem({ action: 'move-bottom', icon: 'bottom', label: selectedCount > 1 ? `Move ${selectedCount} Tabs to Bottom` : 'Bottom of Tree', disabled: isPinned })}
    <div class="svb-menu__separator"></div>
    ${renderContextMenuItem({ action: 'move-window', icon: 'window', label: 'New Window' })}
    <div class="svb-menu__separator"></div>
    ${workspaceItems || '<div class="svb-menu__empty">No Workspaces</div>'}
    ${renderContextMenuItem({ action: 'move-new-workspace', icon: 'add', label: 'New Workspace' })}
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
  const hibernateSubmenu = `
    ${renderContextMenuItem({ action: 'hibernate-active', icon: 'sleep', label: 'Active Tab' })}
    ${renderContextMenuItem({ action: 'hibernate-other', icon: 'sleep', label: 'Other Tabs' })}
  `
  const savedTrees = Array.isArray(state.savedBookmarkTrees) ? state.savedBookmarkTrees : []
  const savedTreeSubmenu = savedTrees.map(renderSavedTreeMenuItem).join('')
  const copyLabelSuffix = selectedCount > 1 ? ` (${selectedCount})` : ''
  const copySubmenu = `
    ${renderContextMenuItem({ action: 'copy-url', icon: 'link', label: `Copy URL${copyLabelSuffix}` })}
    ${renderContextMenuItem({ action: 'copy-title', icon: 'type', label: `Copy Title${copyLabelSuffix}` })}
    ${renderContextMenuItem({ action: 'copy-markdown', icon: 'code', label: `Copy as Markdown Link${copyLabelSuffix}` })}
  `
  const menuX = Math.max(4, contextMenu.x)
  const menuY = Math.max(4, contextMenu.y)

  const folderMenu = `
    ${renderContextMenuItem({ action: 'new-folder-child', icon: 'child', label: 'New Child Folder', disabled: isPinned })}
    ${renderContextMenuItem({ action: 'new-folder-sibling', icon: 'add', label: 'New Sibling Folder', disabled: isPinned })}
    ${renderContextMenuItem({ action: 'new-folder-above', icon: 'add', label: 'New Folder Above', disabled: isPinned })}
  `

  return `
    <div
      class="svb-menu"
      style="left:${menuX}px;top:${menuY}px"
      data-tab-id="${tab.id}"
      role="menu"
    >
      ${renderContextMenuItem({ action: 'reload', icon: 'reload', label: 'Reload' })}
      ${renderContextMenuItem({ action: 'restore-closed', icon: 'restore', label: 'Reopen Last Closed Tab' })}
      ${renderContextMenuItem({ action: 'new-child', icon: 'child', label: 'New Child Tab', disabled: isPinned })}
      ${renderContextMenuItem({ action: 'new-sibling', icon: 'add', label: 'New Sibling Tab Below', disabled: isPinned })}
      ${renderContextMenuItem({ icon: 'folder', label: 'New Folder...', submenu: folderMenu, disabled: isPinned })}
      ${renderContextMenuItem({ icon: 'copy', label: 'Copy', submenu: copySubmenu })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ action: 'bookmark-tab', icon: 'bookmark', label: 'Bookmark Tab' })}
      ${renderContextMenuItem({ action: 'save-tree-bookmark', icon: 'bookmark', label: 'Save Tree as Bookmark', disabled: isPinned || !hasChildren })}
      ${renderContextMenuItem({ icon: 'folder', label: 'Open Saved Tree', submenu: savedTreeSubmenu || '<div class="svb-menu__empty">No Saved Trees</div>' })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({
        action: isTopMode ? 'move-top' : 'move-bottom',
        icon: isTopMode ? 'top' : 'bottom',
        label: isTopMode
          ? (selectedCount > 1 ? `Move ${selectedCount} Tabs to Top` : 'Move to Top')
          : (selectedCount > 1 ? `Move ${selectedCount} Tabs to Bottom` : 'Move to Bottom'),
        disabled: isPinned,
      })}
      ${renderContextMenuItem({ icon: 'move', label: 'Move to', submenu: moveSubmenu })}
      <div class="svb-menu__separator"></div>
      ${renderContextMenuItem({ action: 'toggle-pin', icon: 'pin', label: pinLabel })}
      ${renderContextMenuItem({ action: 'toggle-mute', icon: 'mute', label: muteLabel })}
      ${renderContextMenuItem({ icon: 'sleep', label: 'Hibernate', submenu: hibernateSubmenu })}
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
  return `<span class="svb-tab__child-count" data-role="toggle-collapse" data-tab-id="${item.id}" aria-hidden="true" style="cursor:pointer;" title="Click to expand">${branchCount}</span>`
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
    
  if (tab.vivExtData && tab.vivExtData.isFolder) {
    let actualColorKey = tab.vivExtData.tabColor || tab.vivExtData.folderColor
    const folderColor = actualColorKey && TAB_COLOR_SWATCHES[actualColorKey]
      ? TAB_COLOR_SWATCHES[actualColorKey]
      : 'currentColor'
    const isPinnedFolder = !!tab.vivExtData.pinnedFolder
    const pinBadge = isPinnedFolder
      ? `<span class="svb-tab__pinned-badge" title="Pinned Folder"><svg class="svb-small-pin-icon" viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M4.5 1.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H10v3.25l1.854 2.78a.5.5 0 0 1-.416.72h-2.938v5.25a.5.5 0 0 1-1 0V8.75H4.562a.5.5 0 0 1-.416-.72L6 5.25V2h-1a.5.5 0 0 1-.5-.5z"/></svg></span>`
      : ''

    const hasBadge = !!(current && current.querySelector('.svb-tab__pinned-badge'))

    if (current && current.matches('.svb-tab__favicon.is-folder') && hasBadge === isPinnedFolder) {
      current.style.color = folderColor
      return current
    }

    const folderIcon = createNodeFromHtml(`
      <span class="svb-tab__favicon is-folder" style="color: ${folderColor};">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>
        ${pinBadge}
      </span>
    `)
    if (current) current.replaceWith(folderIcon)
    else lead.appendChild(folderIcon)
    return folderIcon
  }

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

function syncTabContent(content, tab, editing, item) {
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
  
  let displayTitle = tab.title

  if (titleNode && titleNode.textContent !== displayTitle) {
    titleNode.textContent = displayTitle
  }

  syncOptionalDirectChild(content, '.svb-tab__badge', renderTabBadge(tab), null)
}

function getTabVisualStyle(tab) {
  const styles = []
  const tiling = tab && tab.vivExtData && tab.vivExtData.tiling
  const tileId = tiling && tiling.id ? String(tiling.id) : ''
  const tabColorKey = tab && tab.vivExtData && (typeof tab.vivExtData.tabColor === 'string' ? tab.vivExtData.tabColor : (typeof tab.vivExtData.folderColor === 'string' ? tab.vivExtData.folderColor : ''))
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
  let icon = ''
  if (tab.vivExtData && tab.vivExtData.isFolder) {
    let actualColorKey = tab.vivExtData.tabColor || tab.vivExtData.folderColor
    const folderColor = actualColorKey && TAB_COLOR_SWATCHES[actualColorKey]
      ? TAB_COLOR_SWATCHES[actualColorKey]
      : 'currentColor'
    const isPinnedFolder = !!tab.vivExtData.pinnedFolder
    const pinBadge = isPinnedFolder
      ? `<span class="svb-tab__pinned-badge" title="Pinned Folder"><svg class="svb-small-pin-icon" viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M4.5 1.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H10v3.25l1.854 2.78a.5.5 0 0 1-.416.72h-2.938v5.25a.5.5 0 0 1-1 0V8.75H4.562a.5.5 0 0 1-.416-.72L6 5.25V2h-1a.5.5 0 0 1-.5-.5z"/></svg></span>`
      : ''
    icon = `
      <span class="svb-tab__favicon is-folder" style="color: ${folderColor};">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>
        ${pinBadge}
      </span>
    `
  } else {
    icon = tab.loading
      ? `<span class="svb-tab__spinner" aria-hidden="true"></span>`
      : tab.favIconUrl
        ? `<img class="svb-tab__favicon" src="${escapeHtml(tab.favIconUrl)}" alt="">`
        : `<span class="svb-tab__favicon svb-tab__favicon--fallback"></span>`
  }

  const media = renderTabBadge(tab)

  const hasClose = !compact && canClose
  const hasAdd = !compact
  const rowVisualState = getTabVisualState(tab.id, item, visualState)
  const discardedClass = tab.discarded ? ' is-discarded' : ''
  const tiling = tab.vivExtData && tab.vivExtData.tiling
  const isTiled = !!(tiling && (tiling.id || tiling.layout))
  const tiledClass = isTiled ? ' is-tiled' : ''
  const folderClass = tab.vivExtData && tab.vivExtData.isFolder ? ' is-folder' : ''
  const collapsedClass = item && item.collapsed ? ' is-collapsed' : ''
  const tabClass = compact
    ? `svb-tab svb-pinned-tab is-compact${folderClass}${discardedClass}${tiledClass}`
    : `svb-tab${folderClass}${discardedClass}${tiledClass}${hasClose ? ' has-close' : ''}${hasAdd ? ' has-add' : ''}${rowVisualState.isSelected ? ' is-selected' : ''}${rowVisualState.isDragging ? ' is-dragging' : ''}${rowVisualState.isDropTarget ? ' is-drop-target' : ''}${collapsedClass}`
  const depth = item && !compact ? item.depth : 0
  const visibleIndex = item && !compact ? item.visibleIndex : -1
  const subtreeSize = item && !compact ? item.subtreeSize : 1
  const parentId = item && !compact && item.parentId != null ? item.parentId : -1
  const ancestorIds = item && !compact && Array.isArray(item.ancestorIds) ? item.ancestorIds.join(',') : ''
  const dropPosition = item && !compact && rowVisualState.dropPosition ? rowVisualState.dropPosition : ''
  const hasChildren = !!(item && item.hasChildren)
  const isCollapsed = !!(item && item.collapsed)
  const visibleBranchSize = item && !compact ? item.visibleBranchSize || 1 : 1
  const colorKey = tab.vivExtData && (tab.vivExtData.tabColor || tab.vivExtData.folderColor)
  const coloredClass = colorKey && TAB_COLOR_SWATCHES[colorKey] ? ' is-colored' : ''
  const visualStyle = (tiledClass || coloredClass) ? getTabVisualStyle(tab) : ''
  const title = editing
    ? `<input class="svb-tab__title-input" data-role="rename-input" data-tab-id="${tab.id}" value="${escapeHtml(tab.title)}" spellcheck="false">`
    : `<span class="svb-tab__title">${escapeHtml(tab.title)}</span>`

  const record = tab.vivExtData && typeof tab.vivExtData === 'object' && tab.vivExtData['svbTree']
  const createdAtAttr = record && record.createdAt ? ` data-created-at="${record.createdAt}"` : ''
  const baseTitleAttr = ` data-base-title="${escapeHtml(tab.title || '')}"`

  return `
    <button class="${tabClass}${coloredClass}${rowVisualState.isActive ? ' is-active' : ''}" data-role="activate-tab" data-tab-id="${tab.id}" data-visible-index="${visibleIndex}" data-depth="${depth}" data-parent-id="${parentId}" data-subtree-size="${subtreeSize}" data-ancestor-ids="${escapeHtml(ancestorIds)}" data-drop-position="${dropPosition}" data-parent="${hasChildren}" data-folded="${isCollapsed}" title="${escapeHtml(getTabHoverTitle(tab, rowVisualState.isActive))}"${createdAtAttr}${baseTitleAttr}${visualStyle ? ` style="${visualStyle}"` : ''}>
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
    <div class="svb-new-item-buttons${inline ? ' is-inline' : ' is-sticky'}">
      <button
        class="svb-new-tab-button"
        data-role="create-tab"
        title="New tab"
      >
        <span class="svb-new-tab-button__icon">+</span>
        <span class="svb-new-tab-button__label">New Tab</span>
      </button>
      <button
        class="svb-new-folder-button"
        data-role="create-folder"
        title="New Folder"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2zm5 9h-3v3h-2v-3H7v-2h3V8h2v3h3v2z"/>
        </svg>
      </button>
    </div>
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

function renderSparklesIcon() {
  return `
    <svg class="svb-sparkles-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M8 1.5l1.2 3.3 3.3 1.2-3.3 1.2L8 10.5l-1.2-3.3-3.3-1.2 3.3-1.2L8 1.5zm4.5 7.5l.6 1.65 1.65.6-1.65.6-.6 1.65-.6-1.65-1.65-.6 1.65-.6.6-1.65zM3.5 9l.6 1.65 1.65.6-1.65.6-.6 1.65-.6-1.65-1.65-.6 1.65-.6.6-1.65z"/>
    </svg>
  `
}

function renderAiSpinnerIcon() {
  return `
    <svg class="svb-ai-spinner-icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-opacity="0.25" />
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M8 2a6 6 0 0 1 6 6" />
    </svg>
  `
}

function createNodeFromHtml(html) {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return template.content.firstElementChild
}

function createSidebarRenderer(options) {
  const {
    root,
    dragShield,
    onActivateTab,
    onCloseTab,
    onCreateTab,
    onCreateFolderTab,
    onCreateChildTab,
    onRenameTab,
    onTogglePinned,
    onSwitchWorkspace,
    onCreateWorkspace,
    onCreateWorkspaceAndMove,
    onRenameWorkspace,
    onToggleMute,
    onToggleCollapse,
    onCollapseAll,
    onAiGroupTabs,
    onSelectTab,
    onOpenContextMenu,
    onContextMenuAction,
    onStartDrag,
    onUpdateDropTarget,
    onCommitDrop,
    onCommitExternalDrop,
    onCommitExternalContentDrop,
    onClearDrag
  } = options
  let pendingScrollToActive = false
  let pendingScrollSourceTabId = null
  let currentVisibleIds = []
  let previousActiveTabId = null
  let previousPinnedTabsSnapshot = null
  let previousTreeTabsSnapshot = null
  let previousPinnedFolderIds = new Set()
  let previousCanCloseVisibleTabs = null
  let previousPanelPinned = null
  let previousIsSettingsOpen = false
  let previousCreatingWorkspace = false
  let previousIsAiGroupingInProgress = false
  let previousNewTabPlacement = null
  let previousSelectedIds = []
  let previousDraggedIds = []
  let previousDropTargetId = null
  let previousDropPosition = null
  const tabNodesByKey = new Map()
  const pinnedFolderGroupsById = new Map()
  const enteringNodes = new WeakSet()
  const pendingEnterNodes = new Set()
  let pointerDrag = null
  let externalDrag = null
  let autoScrollRafId = 0
  let suppressClick = false
  let suppressToggleClick = false
  let suppressCollapseAllClick = false
  let contextMenu = null
  let latestState = null
  let latestTreeTabs = []
  let renderCurrent = () => {}
  let shell = null
  let pinnedGridObserver = null
  let workspaceBarObserver = null
  let editingTabId = null
  let isSettingsOpen = false
  let creatingWorkspace = false
  let renamingWorkspaceId = null
  let pendingMoveToWorkspaceTarget = null
  let isAiGroupingInProgress = false
  const eventController = new AbortController()
  const eventOptions = { signal: eventController.signal }
  const tabsById = new Map()

  function updateTabsLookup(state) {
    tabsById.clear()
    if (!state) return
    const pinned = state.pinnedTabs || []
    for (let i = 0; i < pinned.length; i++) {
      tabsById.set(pinned[i].id, pinned[i])
    }
    const regular = state.tabs || []
    for (let i = 0; i < regular.length; i++) {
      tabsById.set(regular[i].id, regular[i])
    }
  }

  function findTab(tabId) {
    return tabsById.get(tabId) || null
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

  function stopWorkspaceInput(commit, value) {
    const renameId = renamingWorkspaceId
    const wasCreating = creatingWorkspace
    const moveTarget = pendingMoveToWorkspaceTarget
    pendingMoveToWorkspaceTarget = null
    if (!wasCreating && renameId == null) return
    creatingWorkspace = false
    renamingWorkspaceId = null
    if (commit) {
      const name = typeof value === 'string' ? value.trim() : ''
      if (renameId != null) {
        if (name && onRenameWorkspace) onRenameWorkspace(renameId, name)
      } else if (moveTarget && onCreateWorkspaceAndMove) {
        onCreateWorkspaceAndMove(name, moveTarget.tabId, moveTarget.selectedIds)
      } else if (onCreateWorkspace) {
        onCreateWorkspace(name)
      }
    }
    renderCurrent()
  }

  let activeToastTimer = null

  function showToast(message, type = 'info', duration = 3500) {
    if (!shell || !shell.toastHost) return
    const host = shell.toastHost

    if (activeToastTimer) {
      clearTimeout(activeToastTimer)
      activeToastTimer = null
    }

    host.innerHTML = ''

    const toast = document.createElement('div')
    toast.className = `svb-toast svb-toast--${type}`

    const msgSpan = document.createElement('span')
    msgSpan.className = 'svb-toast__message'
    msgSpan.textContent = message
    toast.appendChild(msgSpan)

    const closeBtn = document.createElement('button')
    closeBtn.className = 'svb-toast__close'
    closeBtn.type = 'button'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.innerHTML = '&times;'
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      dismissToast(toast)
    })
    toast.appendChild(closeBtn)

    host.appendChild(toast)

    if (duration > 0) {
      activeToastTimer = setTimeout(() => {
        dismissToast(toast)
      }, duration)
    }
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return
    toast.classList.add('is-hiding')
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 200)
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
            <button class="svb-icon-button" data-role="ai-group-tabs" title="AI: Group tabs into folders" aria-label="AI: Group tabs into folders"></button>
            <button class="svb-icon-button" data-role="collapse-all" title="Collapse all trees" aria-label="Collapse all trees"></button>
            <button class="svb-icon-button" data-role="toggle-pinned" title="Pin panel"></button>
          </div>
        </div>
        <div class="svb-toast-host" aria-live="polite"></div>

        <div class="svb-main-view">
          <div class="svb-workspaces" style="display:none"></div>
          <section class="svb-section svb-section--pinned">
            <div class="svb-pinned-grid"></div>
          </section>

          <section class="svb-section svb-section--fill">
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
              <div class="svb-settings-label">Діагностика</div>
              <button type="button" data-role="activation-trace" title="Відкрити журнал активації вкладок">Журнал</button>
            </div>
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
              <label class="svb-settings-label">Adaptive tab activation</label>
              <div class="svb-settings-options">
                <label class="svb-settings-option">
                  <input type="checkbox" name="adaptiveActivation">
                  <span>Prioritize tree context when closing tabs</span>
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
            <div class="svb-settings-group">
              <label class="svb-settings-label">Auto-hide mode</label>
              <div class="svb-settings-options">
                <label class="svb-settings-option">
                  <input type="radio" name="autoHideMode" value="full">
                  <span>Full auto-hide</span>
                </label>
                <label class="svb-settings-option">
                  <input type="radio" name="autoHideMode" value="icons">
                  <span>Icon strip</span>
                </label>
              </div>
            </div>
            <div class="svb-settings-group">
              <label class="svb-settings-label">New tab & folder position</label>
              <div class="svb-settings-options">
                <label class="svb-settings-option">
                  <input type="radio" name="newTabPlacement" value="bottom">
                  <span>Bottom of list</span>
                </label>
                <label class="svb-settings-option">
                  <input type="radio" name="newTabPlacement" value="top">
                  <span>Top of list</span>
                </label>
              </div>
            </div>
            <div class="svb-settings-group">
              <label class="svb-settings-label">Auto-close old tabs & trees</label>
              <select name="autoCloseTabsDays" class="svb-settings-select">
                <option value="0">Never</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="7">1 week</option>
                <option value="14">2 weeks</option>
                <option value="21">3 weeks</option>
                <option value="30">1 month</option>
              </select>
            </div>

            <div class="svb-settings-section-divider"></div>
            <div class="svb-settings-title-sub">AI Tab Grouping (Gemini)</div>

            <div class="svb-settings-group">
              <div class="svb-settings-label-row">
                <label class="svb-settings-label" for="svb-gemini-key">Gemini API Key</label>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="svb-settings-link">Get Free Key</a>
              </div>
              <input type="password" id="svb-gemini-key" name="geminiApiKey" class="svb-settings-input" placeholder="AIzaSy..." autocomplete="off" spellcheck="false">
              <div class="svb-settings-key-actions">
                <button type="button" class="svb-settings-button-small" data-role="toggle-key-visibility" title="Show / Hide key">👁 Show key</button>
              </div>
            </div>

            <div class="svb-settings-group">
              <div class="svb-settings-label-row">
                <label class="svb-settings-label">Model</label>
                <button type="button" class="svb-settings-link-btn" data-role="refresh-gemini-models" title="Fetch models from API">↻ Refresh</button>
              </div>
              <select name="geminiModel" class="svb-settings-select">
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
              </select>
            </div>

            <div class="svb-settings-group">
              <label class="svb-settings-label">Folder Naming Language</label>
              <select name="geminiFolderLanguage" class="svb-settings-select">
                <option value="uk">Українська</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="pl">Polski</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="auto">Auto (Match content)</option>
              </select>
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
      workspaceBar: root.querySelector('.svb-workspaces'),
      settingsView: root.querySelector('.svb-settings-view'),
      toastHost: root.querySelector('.svb-toast-host'),
      count: root.querySelector('.svb-header__count'),
      settingsButton: root.querySelector('[data-role="toggle-settings"]'),
      collapseAllButton: root.querySelector('[data-role="collapse-all"]'),
      pinButton: root.querySelector('[data-role="toggle-pinned"]'),
      aiGroupButton: root.querySelector('[data-role="ai-group-tabs"]'),
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

    if (pinnedGridObserver) pinnedGridObserver.disconnect()
    pinnedGridObserver = new ResizeObserver(() => syncPinnedGrid(shell.pinnedGrid))
    pinnedGridObserver.observe(shell.pinnedGrid)

    // Workspace row: a vertical wheel scrolls it horizontally (like a tab
    // strip); edge fades follow scroll position and panel width.
    if (workspaceBarObserver) workspaceBarObserver.disconnect()
    workspaceBarObserver = new ResizeObserver(() => {
      const scroller = shell.workspaceBar.querySelector('.svb-workspaces__icons')
      if (scroller) syncWorkspaceScrollEdges(scroller)
      syncWorkspaceStrip(shell.workspaceBar)
    })
    workspaceBarObserver.observe(shell.workspaceBar)
    shell.workspaceBar.addEventListener('wheel', event => {
      const scroller = event.target.closest('.svb-workspaces__icons')
      if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!delta) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientWidth : 1
      // Mouse-wheel notches glide; trackpad deltas are already fine-grained.
      const isNotch = event.deltaMode !== 0 || Math.abs(delta) >= 50
      scroller.scrollBy({ left: delta * unit, behavior: isNotch ? 'smooth' : 'auto' })
      syncWorkspaceStrip(shell.workspaceBar)
    }, { ...eventOptions, passive: false })
    shell.workspaceBar.addEventListener('scroll', event => {
      if (event.target instanceof Element && event.target.classList.contains('svb-workspaces__icons')) {
        syncWorkspaceScrollEdges(event.target)
        syncWorkspaceStrip(shell.workspaceBar)
      }
    }, { ...eventOptions, capture: true })

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

  // Signature-gated, so it is cheap to call on every render.
  function syncWorkspaceBar(currentShell, state) {
    if (!currentShell.workspaceBar) return
    const signature = workspaceBarSignature(state, creatingWorkspace, renamingWorkspaceId)
    currentShell.workspaceBar.style.display = signature ? '' : 'none'
    if (currentShell.workspaceBar.dataset.sig !== signature) {
      const previousScroller = currentShell.workspaceBar.querySelector('.svb-workspaces__icons')
      const previousScrollLeft = previousScroller ? previousScroller.scrollLeft : 0
      currentShell.workspaceBar.innerHTML = signature ? renderWorkspaceBar(state, creatingWorkspace, renamingWorkspaceId) : ''
      currentShell.workspaceBar.dataset.sig = signature
      const scroller = currentShell.workspaceBar.querySelector('.svb-workspaces__icons')
      if (scroller) {
        scroller.scrollLeft = previousScrollLeft
        revealActiveWorkspace(scroller)
        syncWorkspaceScrollEdges(scroller)
      }
      if (creatingWorkspace || renamingWorkspaceId != null) {
        const input = currentShell.workspaceBar.querySelector('[data-role="workspace-name-input"]')
        if (input) { input.focus({ preventScroll: true }); input.select() }
      }
    }
    syncWorkspaceStrip(currentShell.workspaceBar)
  }

  function updateShellControls(currentShell, state, treeTabs = (latestTreeTabs || (state && state.treeTabs) || [])) {
    const safeTreeTabs = Array.isArray(treeTabs) ? treeTabs : (state && Array.isArray(state.treeTabs) ? state.treeTabs : [])
    const totalTabs = state ? state.pinnedTabs.length + state.tabs.length : 0
    currentShell.count.textContent = String(totalTabs)
    const canCollapseAll = safeTreeTabs.some(item => item && item.hasChildren && !item.collapsed)
    currentShell.collapseAllButton.className = `svb-icon-button${canCollapseAll ? '' : ' is-disabled'}`
    currentShell.collapseAllButton.disabled = !canCollapseAll
    currentShell.collapseAllButton.innerHTML = renderCollapseAllIcon()
    if (currentShell.aiGroupButton) {
      if (isAiGroupingInProgress) {
        currentShell.aiGroupButton.className = 'svb-icon-button is-loading'
        currentShell.aiGroupButton.disabled = true
        currentShell.aiGroupButton.innerHTML = renderAiSpinnerIcon()
        currentShell.aiGroupButton.title = 'AI is grouping tabs...'
      } else {
        currentShell.aiGroupButton.className = 'svb-icon-button'
        currentShell.aiGroupButton.disabled = false
        currentShell.aiGroupButton.innerHTML = renderSparklesIcon()
        currentShell.aiGroupButton.title = 'AI: Group tabs into folders (Gemini)'
      }
    }
    currentShell.pinButton.className = `svb-icon-button${state.panelPinned ? ' is-active' : ''}`
    currentShell.pinButton.title = state.panelPinned ? 'Unpin panel' : 'Pin panel'
    currentShell.pinButton.innerHTML = renderPinIcon(state.panelPinned)
    currentShell.settingsButton.innerHTML = renderMenuIcon('settings')

    syncWorkspaceBar(currentShell, state)

    const isTopMode = (settingsStore.get('newTabPlacement') || 'bottom') === 'top'
    currentShell.frame.classList.toggle('is-top-mode', isTopMode)
    currentShell.mainView.style.display = isSettingsOpen ? 'none' : 'flex'
    currentShell.settingsView.style.display = isSettingsOpen ? 'flex' : 'none'

    if (isSettingsOpen) {
      const settings = settingsStore.getAll()
      const fields = currentShell.settingsView.querySelectorAll('input, select')
      for (const field of fields) {
        if (field.name in settings) {
          if (field.tagName === 'SELECT') {
            field.value = String(settings[field.name])
          } else if (field.type === 'checkbox') {
            field.checked = !!settings[field.name]
          } else if (field.type === 'password' || field.type === 'text') {
            if (document.activeElement !== field) {
              field.value = String(settings[field.name] || '')
            }
          } else {
            field.checked = String(settings[field.name]) === field.value
          }
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

    if (contextMenu.kind === 'workspace') {
      const existing = currentShell.menuHost.querySelector('.svb-menu')
      const renderedWs = existing ? existing.getAttribute('data-workspace-id') : null
      if (!existing || renderedWs !== String(contextMenu.workspaceId)) {
        currentShell.menuHost.innerHTML = renderWorkspaceMenu(state, contextMenu)
        positionContextMenu()
        const menuNode = currentShell.menuHost.querySelector('.svb-menu')
        if (menuNode) {
          void menuNode.offsetWidth
          menuNode.classList.add('is-visible')
        }
      }
      return
    }

    // Render if empty OR if requested for a different tab
    // Render if empty, if requested for a different tab, or if workspaces changed
    const existingMenu = currentShell.menuHost.querySelector('.svb-menu')
    const renderedTabId = existingMenu ? Number(existingMenu.getAttribute('data-tab-id')) : null
    const renderedWorkspaces = existingMenu ? existingMenu.getAttribute('data-workspaces') : null
    const currentWorkspaces = (Array.isArray(state.workspaces) ? state.workspaces : []).map(w => w.id).join(',')

    if (!existingMenu || renderedTabId !== contextMenu.tabId || renderedWorkspaces !== currentWorkspaces) {
      const allTabsById = new Map(state.pinnedTabs.concat(state.tabs).map(tab => [tab.id, tab]))
      const contextTab = allTabsById.get(contextMenu.tabId) || null
      if (!contextTab) return

      currentShell.menuHost.innerHTML = renderContextMenu(contextTab, state, contextMenu)
      positionContextMenu()

      const menuNode = currentShell.menuHost.querySelector('.svb-menu')
      if (menuNode) {
        menuNode.setAttribute('data-workspaces', currentWorkspaces)
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

    if (
      previousPanelPinned !== state.panelPinned
      || previousIsSettingsOpen !== isSettingsOpen
      || previousCreatingWorkspace !== creatingWorkspace
      || previousIsAiGroupingInProgress !== isAiGroupingInProgress
    ) {
      updateShellControls(currentShell, state, treeTabs)
    } else {
      syncWorkspaceBar(currentShell, state)
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
    const isFolder = tab.vivExtData && tab.vivExtData.isFolder
    const folderClass = isFolder ? ' is-folder' : ''
    const tabClass = compact
      ? `svb-tab svb-pinned-tab is-compact${discardedClass}${tiledClass}${folderClass}`
      : `svb-tab${discardedClass}${tiledClass}${folderClass}${hasClose ? ' has-close' : ''}${hasAdd ? ' has-add' : ''}${isActuallyMultiSelected ? ' is-selected' : ''}${rowVisualState.isDragging ? ' is-dragging' : ''}${rowVisualState.isDropTarget ? ' is-drop-target' : ''}`
    const depth = item && !compact ? item.depth : 0
    const visibleIndex = item && !compact ? item.visibleIndex : -1
    const subtreeSize = item && !compact ? item.subtreeSize : 1
    const parentId = item && !compact && item.parentId != null ? item.parentId : ''
    const ancestorIds = item && !compact && Array.isArray(item.ancestorIds) ? item.ancestorIds.join(',') : ''
    const dropPosition = item && !compact && rowVisualState.dropPosition ? rowVisualState.dropPosition : ''
    const hasChildren = !!(item && item.hasChildren)
    const isCollapsed = !!(item && item.collapsed)
    const visibleBranchSize = item && !compact ? item.visibleBranchSize || 1 : 1
    const colorKey = tab.vivExtData && (tab.vivExtData.tabColor || tab.vivExtData.folderColor)
    const coloredClass = colorKey && TAB_COLOR_SWATCHES[colorKey] ? ' is-colored' : ''
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
    node.setAttribute('title', getTabHoverTitle(tab, rowVisualState.isActive))
    node.setAttribute('data-base-title', tab.title || '')
    const record = tab.vivExtData && typeof tab.vivExtData === 'object' && tab.vivExtData['svbTree']
    if (record && record.createdAt) {
      node.setAttribute('data-created-at', record.createdAt)
    } else {
      node.removeAttribute('data-created-at')
    }
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
      syncTabContent(contentNode, tab, editing, item)
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
    nodes.forEach(node => {
      if (node.isConnected) {
        animateTabEnter(node)
      }
    })
  }

  function measureTabRects() {
    const rects = new Map()
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
    for (const [key, node] of tabNodesByKey.entries()) {
      if (!node.isConnected) continue
      const rect = node.getBoundingClientRect()
      if (rect.top > viewportHeight + 250 || rect.bottom < -250) continue
      rects.set(key, {
        left: rect.left,
        top: rect.top,
      })
    }
    if (shell && shell.inlineNewTabButton && shell.inlineNewTabButton.isConnected) {
      const rect = shell.inlineNewTabButton.getBoundingClientRect()
      if (rect.top <= viewportHeight + 250 && rect.bottom >= -250) {
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

    const updates = []
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
    const motionNodes = Array.from(tabNodesByKey.entries())
    if (shell && shell.inlineNewTabButton) {
      motionNodes.push([INLINE_NEW_TAB_KEY, shell.inlineNewTabButton])
    }

    // Pass 1: READ ONLY — measure all rects without any style writes in between.
    // This completely eliminates layout thrashing (forced synchronous reflow).
    for (const [key, node] of motionNodes) {
      const previousRect = previousRects.get(key)
      if (!previousRect || !node.isConnected || enteringNodes.has(node) || (enteringNodeSet && enteringNodeSet.has(node))) continue

      const rect = node.getBoundingClientRect()
      if (rect.top > viewportHeight + 250 || rect.bottom < -250) continue

      const deltaX = previousRect.left - rect.left
      const deltaY = previousRect.top - rect.top
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) continue

      updates.push({ node, deltaX, deltaY })
    }

    if (!updates.length) return

    // Pass 2: WRITE ONLY — batch all initial transform offsets.
    const movedNodes = []
    for (const { node, deltaX, deltaY } of updates) {
      node.style.transition = 'none'
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      movedNodes.push(node)
    }

    // Pass 3: Single forced reflow to register initial transform positions.
    root.offsetHeight

    // Pass 4: Start FLIP transitions.
    for (const node of movedNodes) {
      node.style.transition = 'transform var(--svb-d-norm) var(--svb-ease-out), opacity var(--svb-d-fast) linear'
      node.style.transform = ''
      node.addEventListener('transitionend', () => {
        node.style.transition = ''
        node.style.transform = ''
      }, { once: true })
    }
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

      // Workspace rename is a renderer-side edit mode, not a store action.
      if (menuAction.getAttribute('data-action') === 'rename-workspace') {
        const wsId = Number(menuAction.getAttribute('data-workspace-id'))
        if (Number.isFinite(wsId)) renamingWorkspaceId = wsId
        contextMenu = null
        renderCurrent()
        return
      }

      if (menuAction.getAttribute('data-action') === 'move-new-workspace' && contextMenu) {
        const targetTabId = contextMenu.tabId
        const selIds = previousSelectedIds.includes(targetTabId) ? previousSelectedIds.slice() : [targetTabId]
        pendingMoveToWorkspaceTarget = { tabId: targetTabId, selectedIds: selIds }
        creatingWorkspace = true
        contextMenu = null
        renderCurrent()
        return
      }

      if (!menuAction.classList.contains('is-disabled') && contextMenu && onContextMenuAction) {
        const rawWs = menuAction.getAttribute('data-workspace-id')
        const workspaceId = rawWs === '' ? '' : (rawWs != null ? Number(rawWs) : null)
        const colorKey = menuAction.getAttribute('data-color-key')
        const bookmarkTreeId = menuAction.getAttribute('data-bookmark-tree-id')
        onContextMenuAction(menuAction.getAttribute('data-action'), {
          tabId: contextMenu.tabId,
          workspaceId: workspaceId === '' ? '' : (Number.isFinite(workspaceId) ? workspaceId : null),
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

    if (role === 'switch-workspace') {
      const raw = target.getAttribute('data-workspace-id')
      const workspaceId = raw === '' || raw == null ? null : Number(raw)
      if (onSwitchWorkspace) onSwitchWorkspace(workspaceId)
      return
    }

    if (role === 'create-workspace') {
      creatingWorkspace = true
      renderCurrent()
      return
    }

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

    if (role === 'toggle-collapse') {
      event.preventDefault()
      event.stopPropagation()
      if (suppressToggleClick) {
        suppressToggleClick = false
        return
      }
      if (Number.isFinite(tabId) && onToggleCollapse) {
        onToggleCollapse(tabId)
      }
      return
    }

    if (role === 'create-tab') {
      pendingScrollToActive = true
      pendingScrollSourceTabId = latestState && Number.isFinite(latestState.activeTabId)
        ? latestState.activeTabId
        : null
      onCreateTab()
    }
    if (role === 'create-folder') {
      pendingScrollToActive = true
      pendingScrollSourceTabId = latestState && Number.isFinite(latestState.activeTabId)
        ? latestState.activeTabId
        : null
      onCreateFolderTab()
    }
    if (role === 'create-child-tab' && Number.isFinite(tabId)) {
      pendingScrollToActive = true
      pendingScrollSourceTabId = latestState && Number.isFinite(latestState.activeTabId)
        ? latestState.activeTabId
        : null
      onCreateChildTab(tabId)
      return
    }
    if (role === 'ai-group-tabs') {
      event.preventDefault()
      event.stopPropagation()
      const apiKey = settingsStore.get('geminiApiKey')
      if (!apiKey || !apiKey.trim()) {
        showToast('⚠️ Please enter a Gemini API Key in Settings.', 'warning', 4000)
        isSettingsOpen = true
        renderCurrent()
        setTimeout(() => {
          const input = root.querySelector('.svb-settings-view input[name="geminiApiKey"]')
          if (input) {
            input.focus()
            input.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 50)
        return
      }

      if (isAiGroupingInProgress) return
      isAiGroupingInProgress = true

      try {
        updateShellControls(shell, latestState, latestTreeTabs)
      } catch (err) {
        console.warn('[svb-ui] Failed to update shell controls before AI grouping', err)
      }

      Promise.resolve()
        .then(async () => {
          if (!onAiGroupTabs) return
          const res = await onAiGroupTabs()
          if (!res) return

          if (res.success) {
            if (res.count > 0) {
              const fCount = res.foldersCount || 1
              showToast(
                `✨ Organized ${res.count} tab${res.count === 1 ? '' : 's'} into ${fCount} folder${fCount === 1 ? '' : 's'}!`,
                'success',
                4000
              )
            } else {
              showToast('✨ All tabs are already organized in folders.', 'info', 3500)
            }
          } else {
            if (res.reason === 'missing-key') {
              showToast('⚠️ Please enter a Gemini API Key in Settings.', 'warning', 4000)
              isSettingsOpen = true
            } else if (res.reason === 'not-enough-tabs') {
              showToast('⚠️ At least 2 tabs are required for AI grouping.', 'warning', 3500)
            } else if (res.reason === 'api-error') {
              showToast(`❌ AI grouping failed: ${res.error || 'API error'}`, 'error', 5000)
            } else {
              showToast('❌ Failed to group tabs.', 'error', 4000)
            }
          }
        })
        .catch(err => {
          console.error('[svb-ui] AI grouping error', err)
          showToast(`❌ Error: ${err.message || 'Something went wrong'}`, 'error', 5000)
        })
        .finally(() => {
          isAiGroupingInProgress = false
          if (shell) {
            try {
              updateShellControls(shell, latestState, latestTreeTabs)
            } catch (_e) {
              void _e
            }
          }
          renderCurrent()
        })
      return
    }
    if (role === 'toggle-key-visibility') {
      event.preventDefault()
      event.stopPropagation()
      const keyInput = shell && shell.settingsView ? shell.settingsView.querySelector('input[name="geminiApiKey"]') : null
      const btn = event.target.closest('[data-role="toggle-key-visibility"]')
      if (keyInput) {
        const isPassword = keyInput.type === 'password'
        keyInput.type = isPassword ? 'text' : 'password'
        if (btn) {
          btn.textContent = isPassword ? '🙈 Hide key' : '👁 Show key'
        }
      }
      return
    }
    if (role === 'refresh-gemini-models') {
      event.preventDefault()
      event.stopPropagation()
      const apiKey = settingsStore.get('geminiApiKey')
      if (!apiKey || !apiKey.trim()) return
      const btn = event.target.closest('[data-role="refresh-gemini-models"]')
      if (btn) btn.textContent = '⏳ Loading...'
      fetchAvailableModels(apiKey)
        .then(models => {
          const select = shell && shell.settingsView ? shell.settingsView.querySelector('select[name="geminiModel"]') : null
          if (select && models.length > 0) {
            const currentVal = settingsStore.get('geminiModel')
            select.innerHTML = models.map(m => `<option value="${m}">${m}${m === 'gemini-2.5-flash' ? ' (Recommended)' : ''}</option>`).join('')
            if (models.includes(currentVal)) {
              select.value = currentVal
            } else {
              select.value = models[0]
              settingsStore.set('geminiModel', models[0])
            }
          }
        })
        .finally(() => {
          if (btn) btn.textContent = '↻ Refresh'
        })
      return
    }
    if (role === 'collapse-all') {
      event.preventDefault()
      event.stopPropagation()
      if (suppressCollapseAllClick) {
        suppressCollapseAllClick = false
        return
      }
      if (onCollapseAll) onCollapseAll()
      return
    }
    if (role === 'toggle-pinned') onTogglePinned()
    if (role === 'toggle-settings') {
      isSettingsOpen = !isSettingsOpen
      renderCurrent()
    }
  }, eventOptions)

  root.addEventListener('change', event => {
    const field = event.target.closest('.svb-settings-view input, .svb-settings-view select')
    if (!field || !field.name) return

    const rawValue = field.type === 'checkbox' ? field.checked : field.value
    const value = field.name === 'autoCloseTabsDays' ? Number(rawValue) : rawValue
    settingsStore.set(field.name, value)
    renderCurrent()
  }, eventOptions)

  root.addEventListener('input', event => {
    const field = event.target.closest('.svb-settings-view input[type="password"], .svb-settings-view input[type="text"]')
    if (!field || !field.name) return
    settingsStore.set(field.name, field.value.trim())
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

    const toggleTarget = event.target.closest('[data-role="toggle-collapse"]')
    if (toggleTarget) {
      const tabButton = event.target.closest('.svb-tab[data-tab-id]')
      const tabIdRaw = toggleTarget.getAttribute('data-tab-id') || (tabButton ? tabButton.getAttribute('data-tab-id') : null)
      const tabId = Number(tabIdRaw)
      event.preventDefault()
      event.stopPropagation()
      suppressToggleClick = true
      if (Number.isFinite(tabId) && onToggleCollapse) {
        onToggleCollapse(tabId)
      }
      return
    }

    const collapseAllTarget = event.target.closest('[data-role="collapse-all"]')
    if (collapseAllTarget) {
      event.preventDefault()
      event.stopPropagation()
      suppressCollapseAllClick = true
      if (onCollapseAll) {
        onCollapseAll()
      }
      return
    }

    if (event.target.closest('[data-role="close-tab"], [data-role="create-child-tab"], [data-role="toggle-mute"]')) return

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
    if (event.target.closest('[data-role="rename-input"]') || event.target.closest('[data-role="workspace-name-input"]')) return

    const chip = event.target.closest('.svb-workspace[data-workspace-id]')
    if (chip) {
      const raw = chip.getAttribute('data-workspace-id')
      const workspaceId = raw === '' || raw == null ? null : Number(raw)
      if (!Number.isFinite(workspaceId)) return
      event.preventDefault()
      event.stopPropagation()
      const rootRect = root.getBoundingClientRect()
      contextMenu = {
        kind: 'workspace',
        workspaceId,
        x: event.clientX - rootRect.left,
        y: event.clientY - rootRect.top,
        viewportX: event.clientX,
        viewportY: event.clientY,
      }
      renderCurrent()
      return
    }

    const tabButton = event.target.closest('.svb-tab[data-tab-id]')
    if (!tabButton) return

    const tabId = Number(tabButton.getAttribute('data-tab-id'))
    if (!Number.isFinite(tabId)) return

    event.preventDefault()
    event.stopPropagation()

    root.classList.add('is-menu-open')
    
    const showMenu = () => {
      const rootRect = root.getBoundingClientRect()
      contextMenu = {
        tabId,
        x: event.clientX - rootRect.left,
        y: event.clientY - rootRect.top,
        viewportY: event.clientY,
        viewportX: event.clientX,
      }
      renderCurrent()
    }

    if (onOpenContextMenu) {
      const result = onOpenContextMenu(tabId)
      if (result && typeof result.then === 'function') {
        result.then(showMenu).catch(err => {
          console.error(err)
          root.classList.remove('is-menu-open')
        })
      } else {
        showMenu()
      }
    } else {
      showMenu()
    }
  }, eventOptions)

  root.addEventListener('pointerover', event => {
    const tabNode = event.target.closest('[data-role="activate-tab"][data-created-at]')
    if (tabNode) {
      const createdAt = Number(tabNode.getAttribute('data-created-at'))
      if (createdAt) {
        const baseTitle = tabNode.getAttribute('data-base-title') || ''
        let title = baseTitle
        
        if (tabNode.classList.contains('is-active')) {
          title += '\n\nOpened: Just now (Active)'
        } else {
          const now = Date.now()
          const ageMs = now - createdAt
          const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
          const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60))
          
          title += '\n\nOpened: '
          if (ageDays > 0) title += `${ageDays}d `
          if (ageHours > 0) title += `${ageHours}h `
          if (ageDays === 0 && ageHours === 0) title += `${ageMinutes}m `
          title += 'ago'
        }
        
        tabNode.setAttribute('title', title)
      }
    }

    const menuItem = event.target.closest('.svb-menu__item.has-submenu')
    if (menuItem) positionSubmenu(menuItem)
    syncWorkspaceTitle(event.target.closest('.svb-workspace[data-workspace-name]'))
  }, eventOptions)

  root.addEventListener('pointerout', event => {
    if (!event.target.closest('.svb-workspace[data-workspace-name]')) return
    const next = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.svb-workspace[data-workspace-name]') : null
    syncWorkspaceTitle(next)
  }, eventOptions)

  // Keep the active workspace icon inside the visible part of the scroller.
  function revealActiveWorkspace(scroller) {
    const active = scroller.querySelector('.svb-workspace.is-active')
    if (!active) return
    const start = active.offsetLeft
    const end = start + active.offsetWidth
    if (start < scroller.scrollLeft) {
      scroller.scrollLeft = start
    } else if (end > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollLeft = end - scroller.clientWidth
    }
  }

  // Fade whichever edge has more icons hidden behind it.
  function syncWorkspaceScrollEdges(scroller) {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth
    scroller.classList.toggle('has-overflow-start', scroller.scrollLeft > 1)
    scroller.classList.toggle('has-overflow-end', maxScroll - scroller.scrollLeft > 1)
  }

  // The title line under the workspace icons previews the hovered workspace
  // and falls back to the active one. Text-only update; no re-render.
  function syncWorkspaceTitle(button) {
    const title = shell && shell.workspaceBar ? shell.workspaceBar.querySelector('.svb-workspaces__title') : null
    if (!title) return
    const text = button ? button.getAttribute('data-workspace-name') : title.getAttribute('data-active-name')
    if (title.textContent !== text) title.textContent = text || ''
    title.classList.toggle('is-preview', !!button && !button.classList.contains('is-active'))
  }

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

  root.addEventListener('keydown', event => {
    const input = event.target.closest('[data-role="workspace-name-input"]')
    if (!input) return

    if (event.key === 'Enter') {
      event.preventDefault()
      stopWorkspaceInput(true, input.value)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      stopWorkspaceInput(false)
    }
  }, eventOptions)

  root.addEventListener('focusout', event => {
    if (!event.target.closest('[data-role="workspace-name-input"]')) return
    stopWorkspaceInput(false)
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
      if (activeTab.closest('.svb-pinned-folder-group')) {
        pendingScrollToActive = false
        pendingScrollSourceTabId = null
        return
      }

      const listRect = list.getBoundingClientRect()
      const activeRect = activeTab.getBoundingClientRect()
      const epsilon = 1

      let stickyTopLimit = listRect.top
      const topButtons = list.querySelector('.svb-new-item-buttons.is-inline.is-top')
      if (topButtons) {
        const btnRect = topButtons.getBoundingClientRect()
        stickyTopLimit = Math.max(stickyTopLimit, btnRect.bottom)
      }
      const pinnedGroups = list.querySelectorAll('.svb-pinned-folder-group')
      for (const group of pinnedGroups) {
        const groupRect = group.getBoundingClientRect()
        stickyTopLimit = Math.max(stickyTopLimit, groupRect.bottom)
      }

      const visibleTop = stickyTopLimit + 2
      const visibleBottom = listRect.bottom - 2

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
      latestTreeTabs = Array.isArray(state.treeTabs) ? state.treeTabs : []
      updateTabsLookup(state)
      renderCurrent = () => this.render(latestState)
      const currentShell = ensureShell()
      root.classList.toggle('is-menu-open', !!contextMenu)
      const visualState = buildVisualState(state)
      const treeTabs = Array.isArray(state.treeTabs) ? state.treeTabs : []
      const isDragging = visualState.draggedIdSet.size > 0
      const currentPinnedFolderIds = new Set()
      for (const item of treeTabs) {
        const tab = findTab(item.id)
        if (tab && tab.vivExtData && tab.vivExtData.pinnedFolder) {
          currentPinnedFolderIds.add(item.id)
        }
      }
      const currentNewTabPlacement = settingsStore.get('newTabPlacement') || 'bottom'
      const newTabPlacementChanged = currentNewTabPlacement !== previousNewTabPlacement
      const isSettingsOpenChanged = isSettingsOpen !== previousIsSettingsOpen
      const pinnedFolderChanged = currentPinnedFolderIds.size !== previousPinnedFolderIds.size
        || [...currentPinnedFolderIds].some(id => !previousPinnedFolderIds.has(id))
      const structureChanged = pinnedFolderChanged
        || newTabPlacementChanged
        || isSettingsOpenChanged
        || !areTabOrdersEqual(previousPinnedTabsSnapshot, state.pinnedTabs)
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
        syncPinnedGrid(currentShell.pinnedGrid)
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

        const pinnedFolderIds = new Set()
        for (const item of treeTabs) {
          const tab = findTab(item.id)
          if (tab && tab.vivExtData && tab.vivExtData.pinnedFolder) {
            pinnedFolderIds.add(item.id)
          }
        }

        const regularNodes = []
        let currentPinnedFolderId = null
        let currentGroupNodes = []

        const flushCurrentStickyGroup = () => {
          if (currentPinnedFolderId != null && currentGroupNodes.length > 0) {
            let group = pinnedFolderGroupsById.get(currentPinnedFolderId)
            if (!group) {
              group = document.createElement('div')
              group.className = 'svb-pinned-folder-group'
              group.setAttribute('data-pinned-folder-id', String(currentPinnedFolderId))
              pinnedFolderGroupsById.set(currentPinnedFolderId, group)
            }
            syncChildren(group, currentGroupNodes)
            regularNodes.push(group)
            currentPinnedFolderId = null
            currentGroupNodes = []
          }
        }

        for (const item of treeTabs) {
          const tab = findTab(item.id)
          if (!tab) continue
          activeKeys.add(getTabKey(tab, false))
          const node = getOrUpdateTabNode(tab, false, state.canCloseVisibleTabs, item, visualState)

          let parentPinnedFolderId = null
          if (pinnedFolderIds.has(item.id)) {
            parentPinnedFolderId = item.id
          } else if (item.ancestorIds && item.ancestorIds.length > 0) {
            parentPinnedFolderId = item.ancestorIds.find(id => pinnedFolderIds.has(id)) || null
          }

          if (parentPinnedFolderId != null) {
            if (currentPinnedFolderId != null && currentPinnedFolderId !== parentPinnedFolderId) {
              flushCurrentStickyGroup()
            }
            currentPinnedFolderId = parentPinnedFolderId
            currentGroupNodes.push(node)
          } else {
            flushCurrentStickyGroup()
            regularNodes.push(node)
          }
        }
        flushCurrentStickyGroup()

        for (const [folderId, group] of pinnedFolderGroupsById.entries()) {
          if (!pinnedFolderIds.has(folderId)) {
            group.remove()
            pinnedFolderGroupsById.delete(folderId)
          }
        }

        pruneTabNodes(activeKeys)

        syncChildren(currentShell.pinnedGrid, pinnedNodes)
        currentShell.pinnedSection.style.display = state.pinnedTabs.length ? '' : 'none'

        const isTopMode = currentNewTabPlacement === 'top'
        currentShell.inlineNewTabButton.classList.toggle('is-top', isTopMode)

        let listNodes
        if (empty) {
          listNodes = isTopMode
            ? [currentShell.inlineNewTabButton, currentShell.emptyMessage]
            : [currentShell.emptyMessage, currentShell.inlineNewTabButton]
          currentShell.emptyMessage.textContent = emptyMessage
        } else if (isTopMode) {
          let insertIndex = 0
          for (let i = 0; i < regularNodes.length; i++) {
            if (regularNodes[i].classList && regularNodes[i].classList.contains('svb-pinned-folder-group')) {
              insertIndex = i + 1
            } else {
              break
            }
          }
          listNodes = [
            ...regularNodes.slice(0, insertIndex),
            currentShell.inlineNewTabButton,
            ...regularNodes.slice(insertIndex),
          ]
        } else {
          listNodes = regularNodes.concat(currentShell.inlineNewTabButton)
        }

        syncChildren(currentShell.tabList, listNodes)

        if (isTopMode) {
          let topOffset = 0
          for (let i = 0; i < regularNodes.length; i++) {
            if (regularNodes[i].classList && regularNodes[i].classList.contains('svb-pinned-folder-group')) {
              topOffset += (regularNodes[i].offsetHeight || 0)
            } else {
              break
            }
          }
          currentShell.inlineNewTabButton.style.top = `${topOffset}px`
        } else {
          currentShell.inlineNewTabButton.style.top = ''
        }

        syncPinnedGrid(currentShell.pinnedGrid)
        syncWorkspaceStrip(currentShell.workspaceBar)
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
      previousPinnedFolderIds = currentPinnedFolderIds
      previousActiveTabId = state.activeTabId
      previousCanCloseVisibleTabs = state.canCloseVisibleTabs
      previousPanelPinned = state.panelPinned
      previousIsSettingsOpen = isSettingsOpen
      previousCreatingWorkspace = creatingWorkspace
      previousIsAiGroupingInProgress = isAiGroupingInProgress
      previousNewTabPlacement = currentNewTabPlacement
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
      if (activeToastTimer) {
        clearTimeout(activeToastTimer)
        activeToastTimer = null
      }
      if (pinnedGridObserver) pinnedGridObserver.disconnect()
      if (workspaceBarObserver) workspaceBarObserver.disconnect()
      eventController.abort()
      stopDragAutoScroll()
      pointerDrag = null
      hideDragGhost()
      contextMenu = null
      pendingEnterNodes.clear()
      tabNodesByKey.clear()
      pinnedFolderGroupsById.clear()
      renderCurrent = () => {}
      latestState = null
      latestTreeTabs = []
    },
  }
}

module.exports = { createSidebarRenderer, renderContextMenu }

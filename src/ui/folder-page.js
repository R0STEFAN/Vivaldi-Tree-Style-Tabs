function escapeHtml(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function generateFolderPageUrl(tabState, folderTabId) {
  const activeTab = tabState.tabs.find(t => t.id === folderTabId)
  if (!activeTab || !activeTab.vivExtData || !activeTab.vivExtData.isFolder) {
    return new URL('svb-folder.html', location.href).href
  }

  const folderNodeId = activeTab.vivExtData && activeTab.vivExtData.svbTree && activeTab.vivExtData.svbTree.nodeId
  const descendants = []
  
  if (folderNodeId) {
    const childrenByParent = new Map()
    for (const t of tabState.tabs) {
      const parentId = t.vivExtData && t.vivExtData.svbTree && t.vivExtData.svbTree.parentNodeId
      if (parentId) {
        if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, [])
        childrenByParent.get(parentId).push(t)
      }
    }

    function collectDescendants(parentId) {
      const children = childrenByParent.get(parentId) || []
      for (const child of children) {
        descendants.push(child)
        const isChildFolder = child.vivExtData && child.vivExtData.isFolder
        const childNodeId = child.vivExtData && child.vivExtData.svbTree && child.vivExtData.svbTree.nodeId
        if (childNodeId && !isChildFolder) {
          collectDescendants(childNodeId)
        }
      }
    }
    collectDescendants(folderNodeId)
  }
  let actualColorKey = activeTab.vivExtData.tabColor || activeTab.vivExtData.folderColor
  
  let html = `
<div class="container">
  <h1 class="header">
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
    ${escapeHtml(activeTab.title)}
  </h1>
  <div class="grid">
  `

  if (descendants.length === 0) {
    html += `<div style="opacity: 0.5; font-size: 16px; padding: 24px 0;">This folder is empty.</div>`
  } else {
    for (const childTab of descendants) {
      let iconHtml = ''
      if (childTab.vivExtData && childTab.vivExtData.isFolder) {
        iconHtml = `
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
        `
      } else if (childTab.favIconUrl && (!childTab.favIconUrl.startsWith('data:') || childTab.favIconUrl.length < 5000)) {
        iconHtml = `<img src="${escapeHtml(childTab.favIconUrl)}" style="width: 24px; height: 24px; border-radius: 4px;">`
      } else {
        iconHtml = `<div style="width: 24px; height: 24px; border-radius: 4px; background: rgba(128,128,128,0.2);"></div>`
      }

      // Use an anchor tag that changes the hash
      html += `
        <a class="card" href="#svb-activate:${childTab.id}">
          <div class="icon-box">${iconHtml}</div>
          <div class="title">${escapeHtml(childTab.title)}</div>
        </a>
      `
    }
  }

  html += `
  </div>
</div>
  `

  const style = `
  body {
    background: var(--colorBg, #1e1e1e);
    color: var(--colorFg, #fff);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 40px;
    margin: 0;
  }
  .container {
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
  }
  .header {
    margin-top: 0;
    font-size: 28px;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .card {
    background: var(--colorBgIntense, rgba(128,128,128,0.05));
    border: 1px solid var(--colorBorder, rgba(128,128,128,0.1));
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    transition: background 0.2s, transform 0.1s;
  }
  .card:hover {
    background: var(--colorBgHover, rgba(128,128,128,0.1));
    transform: translateY(-2px);
  }
  .icon-box {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--colorBg, transparent);
  }
  .title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
  }
  `

  const dataStr = JSON.stringify({
    title: activeTab.title || 'Folder',
    style: style,
    html: html
  })
  
  const base64 = btoa(unescape(encodeURIComponent(dataStr)))
  return new URL('svb-folder.html', location.href).href + '#svb-folder:data=' + base64
}

module.exports = {
  generateFolderPageUrl
}

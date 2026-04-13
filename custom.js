(() => {
  const HOST_ID = "zenith-vt-host";
  const EDGE_ID = "zenith-vt-edge";
  const STYLE_ID = "zenith-vt-style";
  const TOGGLE_BTN_ID = "zenith-vt-autohide-toggle";
  const COLLAPSE_ALL_BTN_ID = "zenith-vt-collapse-all";
  const DEFAULT_SIDEBAR_WIDTH = 320;
  const MIN_SIDEBAR_WIDTH = 36;
  const MAX_SIDEBAR_WIDTH = 1400;
  const STORAGE_KEY = "zenith_vt_autohide";
  const STORAGE_WIDTH_KEY = "zenith_vt_sidebar_width";
  const STORAGE_TREE_KEY = "zenith_vt_collapsed_trees";
  const STORAGE_TREE_SNAPSHOT_KEY = "zenith_vt_tree_snapshot_v2";
  const STORAGE_CUSTOM_TITLES_KEY = "zenith_vt_custom_titles_v1";
  const STORAGE_CUSTOM_WORKSPACES_KEY = "zenith_vt_custom_workspaces_v1";
  const STORAGE_TAB_WORKSPACE_MAP_KEY = "zenith_vt_tab_workspace_map_v1";
  const CSS_TOP_OFFSET_VAR = "--zenith-vt-top-offset";
  const CSS_BOTTOM_OFFSET_VAR = "--zenith-vt-bottom-offset";
  const ROOT_PARENT_NODE_ID = "__zvt_root__";
  const VIVALDI_STARTPAGE_URL = "chrome://vivaldi-webui/startpage?section=Speed-dials";
  const FETCH_MIN_INTERVAL_MS = 300;
  const RENDER_MIN_INTERVAL_MS = 80;
  const TREE_INDENT_PX = 14;
  const DND_LEVEL_BASE_LEFT_PX = 2;
  const DND_HOVER_EXPAND_DELAY_MS = 320;
  const VIVALDI_THEME_VARS = [
    "--colorBg",
    "--colorBgLight",
    "--colorBgDark",
    "--colorBgDarker",
    "--colorBgIntense",
    "--colorFg",
    "--colorFgFaded",
    "--colorFgFadedMore",
    "--colorFgAlpha",
    "--colorBorder",
    "--colorBorderSubtle",
    "--colorHighlightBg",
    "--colorHighlightFg",
    "--colorAccentBg",
    "--colorAccentFg",
    "--colorAccentBgDark",
    "--colorErrorBg",
  ];
  const I18N = {
    ctx_restore_last_closed: "Reopen Last Closed Tab",
    ctx_new_below: "New Tab Below",
    ctx_duplicate: "Duplicate Tab",
    ctx_pin: "Pin Tab",
    ctx_unpin: "Unpin Tab",
    ctx_mute: "Mute Tab",
    ctx_unmute: "Unmute Tab",
    ctx_move_window: "Move to New Window",
    ctx_move_workspace: "Move to Workspace",
    ctx_loading: "Loading...",
    ctx_no_workspaces: "No workspaces found",
    ctx_workspace_api_unavailable: "Workspace API unavailable",
    ctx_close: "Close Tab",
    ctx_close_others: "Close Other Tabs",
    ctx_close_below: "Close Tabs Below",
  };

  const CONTEXT_MENU_ICONS = {
    restore: '<svg viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4.9 4.2V3h1.5c-.5-.5-1.2-.9-2-.9-1.3 0-2.4 1-2.4 2.4 0 1.3 1.1 2.3 2.5 2.3.9 0 1.6-.4 2-1l.8.8C6.6 7.5 5.6 8 4.5 8A3.4 3.4 0 011 4.6c0-2 1.6-3.4 3.5-3.4 1 0 1.8.4 2.5 1V1h1v3.2H4.9z"/></svg>',
    plus: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 3H7v4H3v2h4v4h2V9h4V7H9V3z"/></svg>',
    duplicate: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 7h1v2h2v1H7v2H6v-2H4V9h2V7z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 12h1a2 2 0 002-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v1H3a2 2 0 00-2 2v7c0 1.1.9 2 2 2h7a2 2 0 002-2v-1zm1-9H6v1h4a2 2 0 012 2v4h1V3zM3 6h7v7H3V6z"/></svg>',
    pin: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="m3.07 13.83-1.31.64.56-1.38 3.3-3.93L3.01 6.6c-.36-.34 0-.93.47-.78l3.12 1 3.96-3.35-.38-1.8c-.1-.45.46-.76.8-.43l3.83 3.75c.33.33.04.89-.42.8l-1.8-.35-3.3 4.02 1.07 3.09c.16.47-.42.83-.78.48l-2.61-2.55-3.9 3.35Z"/></svg>',
    mute: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.01 10 2 6c0-.33.27-.6.6-.6h1.53a.6.6 0 0 0 .45-.2c.4-.46.75-.9 1.08-1.32.62-.78 1.2-1.4 1.94-2.03L8 1.5v13l-.32-.3c-.68-.6-1.21-1.23-1.78-1.91-.4-.47-.81-.96-1.3-1.49a.6.6 0 0 0-.45-.19H2.61a.6.6 0 0 1-.6-.6ZM9 5l.38-.56 2.67 2.67 2.67-2.67.9.89L12.93 8l2.67 2.67-.89.9-2.67-2.68-2.67 2.67L9 11l.15-1 .67-.66L11.16 8 9.82 6.66 9.15 6 9 5Z"/></svg>',
    loud: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 10V6c0-.33.27-.6.6-.6h1.53a.6.6 0 0 0 .45-.2C5.85 3.73 6.65 2.67 8 1.5c.12 4.97.12 8.58 0 13-1.34-1.22-2.1-2.3-3.42-3.71a.6.6 0 0 0-.44-.19H2.6A.6.6 0 0 1 2 10Zm8.58-2c0 1.14-.18 3.39-1.49 3.57.48-2.79.48-4.36 0-7.18 1.31.16 1.49 2.47 1.49 3.61Z"/><path d="M14 8c0 3.31-2.27 6-3.6 6v-.6s.97-.82 1.36-1.8a9.3 9.3 0 0 0 0-7.2c-.39-.98-1.16-1.8-1.36-1.8V2C11.73 2 14 4.69 14 8Z"/></svg>',
    moveWindow: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 8V7H2v3H0V4c0-1.1.9-2 2-2h12a2 2 0 012 2v4h-2zM2 4h12v2H2V4z"/><path d="M12 8v3H9v1h3v3h1v-3h3v-1h-3V8h-1zM5 11H1v1h2.3L.5 14.8l.7.7 2.9-2.8V15h1v-4z"/></svg>',
  };

  if (window.__zenithVtCustomLoaded) return;
  window.__zenithVtCustomLoaded = true;

  const state = {
    tabs: [],
    search: "",
    searchOpen: false,
    open: false,
    autohide: true,
    width: DEFAULT_SIDEBAR_WIDTH,
    resizing: false,
    topOffset: 0,
    bottomOffset: 0,
    initialized: false,
    contentRoot: null,
    contentRootStyleBackup: null,
    topOffsetRafQueued: false,
    contextMenuEl: null,
    tabBirthRank: new Map(),
    collapsedTrees: new Set(),
    nodeIdByTabId: new Map(),
    parentNodeByNodeId: new Map(),
    pendingTreeSnapshot: null,
    pendingCollapsedNodeIds: new Set(),
    persistenceReady: false,
    fetchInFlight: false,
    fetchQueued: false,
    treeDirty: true,
    refreshTimer: null,
    noReturnTabs: new Map(),
    customTitlesByNodeId: new Map(),
    customTitlesSaveTimer: null,
    renamingTabId: null,
    snapshotSaveTimer: null,
    collapsedSaveTimer: null,
    fetchCooldownTimer: null,
    topOffsetPollTimer: null,
    topOffsetWarmupTimer: null,
    statusBarModePollTimer: null,
    themeSyncTimer: null,
    uiObserver: null,
    uiObserverRafQueued: false,
    lastFetchAt: 0,
    renderTimer: null,
    renderPending: false,
    lastRenderAt: 0,
    treeRenderCache: null,
    visibleRegularOrder: [],
    customWorkspaces: [],
    currentCustomWorkspaceId: null,
    tabWorkspaceByNodeId: new Map(),
    workspaceLastActiveNodeById: new Map(),
    lastWorkspaceWheelAt: 0,
    statusBarDisplayMode: null,
    statusBarMinimizedMode: null,
    selectedTabIds: new Set(),
    selectionAnchorTabId: null,
    dragState: null,
    dndExpandTimer: null,
    dndExpandTargetId: null,
    tabById: new Map(),
    nodeToTabId: new Map(),
    parentTabByTabId: new Map(),
    childrenByParentTabId: new Map(),
    renderedRowByTabId: new Map(),
    stickyPinnedHeight: 0,
    tabIndexById: new Map(),
    activeTabId: null,
  };

  const ui = {
    host: null,
    search: null,
    searchToggle: null,
    collapseAllBtn: null,
    workspaceTrigger: null,
    workspaceDropdown: null,
    workspaceAddBtn: null,
    workspaceEditBtn: null,
    workspaceEditor: null,
    workspaceNameInput: null,
    workspaceIconTrigger: null,
    workspaceIconDropdown: null,
    workspaceSaveBtn: null,
    workspaceDeleteBtn: null,
    workspaceCancelBtn: null,
    workspaceDeleteModal: null,
    workspaceDeleteTitle: null,
    workspaceDeleteTargetTrigger: null,
    workspaceDeleteTargetMenu: null,
    workspaceDeleteMoveBtn: null,
    workspaceDeleteRemoveBtn: null,
    workspaceDeleteCloseBtn: null,
    list: null,
    count: null,
    status: null,
    dndPointer: null,
  };

  function isEditableTarget(target) {
    if (!target) return false;
    return !!target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]');
  }

  function hasTabsApi() {
    return !!(window.chrome && chrome.tabs && chrome.windows);
  }

  function hasSessionsApi() {
    return !!(window.chrome && chrome.sessions && typeof chrome.sessions.restore === "function");
  }

  function hasPrefsApi() {
    return !!(window.chrome && chrome.prefs && typeof chrome.prefs.get === "function");
  }

  function t(key, vars = null) {
    let text = I18N[key] || key;
    if (vars && typeof vars === "object") {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return text;
  }

  function getPref(path) {
    return new Promise((resolve) => {
      if (!hasPrefsApi()) {
        resolve(undefined);
        return;
      }
      try {
        chrome.prefs.get(path, (value) => resolve(value));
      } catch {
        resolve(undefined);
      }
    });
  }

  async function restoreLastClosedTabOnly() {
    if (!hasSessionsApi()) return false;
    if (typeof chrome.sessions.getRecentlyClosed !== "function") {
      await new Promise((resolve) => {
        try {
          chrome.sessions.restore(() => resolve());
        } catch {
          resolve();
        }
      });
      return true;
    }

    const entries = await new Promise((resolve) => {
      try {
        chrome.sessions.getRecentlyClosed({ maxResults: 25 }, (list) => resolve(Array.isArray(list) ? list : []));
      } catch {
        resolve([]);
      }
    });

    const firstTabEntry = entries.find((entry) => entry && entry.tab && entry.tab.sessionId);
    if (firstTabEntry && firstTabEntry.tab && firstTabEntry.tab.sessionId) {
      await new Promise((resolve) => {
        try {
          chrome.sessions.restore(firstTabEntry.tab.sessionId, () => resolve());
        } catch {
          resolve();
        }
      });
      return true;
    }

    await new Promise((resolve) => {
      try {
        chrome.sessions.restore(() => resolve());
      } catch {
        resolve();
      }
    });
    return true;
  }

  function isStartPageUrl(url) {
    if (!url) return false;
    const u = String(url).toLowerCase();
    return (
      u.startsWith("vivaldi://startpage") ||
      u.startsWith("chrome://newtab") ||
      u.includes("new-tab-page") ||
      u.includes("vivaldi-webui/startpage")
    );
  }

  function hasChromeStorage() {
    return !!(window.chrome && chrome.storage && chrome.storage.local);
  }

  function getFromChromeStorage(keys) {
    return new Promise((resolve) => {
      if (!hasChromeStorage()) {
        resolve({});
        return;
      }
      chrome.storage.local.get(keys, (result) => {
        resolve(result || {});
      });
    });
  }

  function setToChromeStorage(data) {
    if (!hasChromeStorage()) return;
    chrome.storage.local.set(data, () => {});
  }

  function generateTreeNodeId() {
    return `zvt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeTabId(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  function readTabMetaValue(tab, keys) {
    if (!tab || !Array.isArray(keys) || !keys.length) return null;

    for (const key of keys) {
      if (tab[key] !== undefined && tab[key] !== null && `${tab[key]}` !== "") {
        return tab[key];
      }
    }

    const parseObject = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && `${obj[key]}` !== "") {
          return obj[key];
        }
      }
      return null;
    };

    const parseString = (src) => {
      if (!src || typeof src !== "string") return null;
      const raw = src.trim();
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        const fromObj = parseObject(parsed);
        if (fromObj != null) return fromObj;
      } catch {}

      for (const key of keys) {
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const rx = new RegExp(`"${escaped}"\\s*:\\s*("([^"]+)"|(-?[0-9]+))`, "i");
        const match = raw.match(rx);
        if (!match) continue;
        const value = match[2] != null ? match[2] : match[3];
        if (value != null && `${value}` !== "") return value;
      }
      return null;
    };

    const sources = [tab.extData, tab.vivExtData, tab.sessionData];
    for (const source of sources) {
      const value = typeof source === "string" ? parseString(source) : parseObject(source);
      if (value != null && `${value}` !== "") return value;
    }
    return null;
  }


  async function openNewTabAtTop() {
    if (!hasTabsApi()) return;
    try {
      const win = await chrome.windows.getCurrent({ populate: false });
      await chrome.tabs.create({
        windowId: win.id,
        index: 0,
        active: true,
        url: VIVALDI_STARTPAGE_URL,
      });
    } catch {
      chrome.tabs.create({ url: VIVALDI_STARTPAGE_URL });
    }
  }

  function getInternalPageKind(url) {
    if (!url) return null;
    const u = url.toLowerCase();

    if (isStartPageUrl(u)) return "startpage";
    if (u.startsWith("vivaldi://settings") || u.startsWith("chrome://settings")) return "settings";
    if (u.startsWith("vivaldi://extensions") || u.startsWith("chrome://extensions")) return "extensions";
    if (u.startsWith("vivaldi://history") || u.startsWith("chrome://history")) return "history";
    if (u.startsWith("vivaldi://downloads") || u.startsWith("chrome://downloads")) return "downloads";
    if (u.startsWith("vivaldi://bookmarks") || u.startsWith("chrome://bookmarks")) return "bookmarks";

    if (u.startsWith("chrome-extension://")) {
      try {
        const parsed = new URL(url);
        const path = (parsed.pathname || "").toLowerCase();
        if (path.includes("/components/settings/")) return "settings";
        if (path.includes("/components/extensions/")) return "extensions";
        if (path.includes("/components/history/")) return "history";
        if (path.includes("/components/downloads/")) return "downloads";
        if (path.includes("/components/bookmarks/")) return "bookmarks";
        if (path.includes("/components/startpage/")) return "startpage";
      } catch {}
    }
    return null;
  }

  async function shouldSkipSidebarForCurrentWindow() {
    if (!hasTabsApi()) return false;
    try {
      const win = await chrome.windows.getCurrent({ populate: false });
      if (!win || win.id == null) return false;

      if (win.type && win.type !== "normal") {
        return true;
      }

      const tabs = await chrome.tabs.query({ windowId: win.id });
      const activeTab = tabs.find((t) => !!t.active) || tabs[0] || null;
      const activeUrl = String((activeTab && (activeTab.url || activeTab.pendingUrl)) || "");
      const kind = getInternalPageKind(activeUrl);

      if ((kind === "settings" || kind === "extensions") && tabs.length <= 1) {
        return true;
      }
    } catch {}
    return false;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${HOST_ID} {
        --zvt-bg: var(--colorBg, #14171c);
        --zvt-bg-light: var(--colorBgLight, #1b2028);
        --zvt-bg-dark: var(--colorBgDark, #0f1217);
        --zvt-bg-darker: var(--colorBgDarker, #0b0e13);
        --zvt-bg-intense: var(--colorBgIntense, #171d25);
        --zvt-fg: var(--colorFg, #e6ebf3);
        --zvt-fg-faded: var(--colorFgFaded, #a3afc2);
        --zvt-fg-muted: var(--colorFgFadedMore, #8e9cb1);
        --zvt-fg-alpha: var(--colorFgAlpha, rgba(255, 255, 255, 0.08));
        --zvt-border: var(--colorBorder, rgba(255, 255, 255, 0.14));
        --zvt-border-subtle: var(--colorBorderSubtle, rgba(255, 255, 255, 0.1));
        --zvt-highlight-bg: var(--colorHighlightBg, #2f8cff);
        --zvt-highlight-fg: var(--colorHighlightFg, #ffffff);
        --zvt-accent-bg: var(--colorAccentBg, var(--zvt-highlight-bg));
        --zvt-accent-fg: var(--colorAccentFg, var(--zvt-highlight-fg));
        --zvt-accent-bg-dark: var(--colorAccentBgDark, #226dcc);
        --zvt-shadow-strong: rgba(0, 0, 0, 0.35);
        position: fixed;
        left: 0;
        top: var(${CSS_TOP_OFFSET_VAR}, 0px);
        bottom: var(${CSS_BOTTOM_OFFSET_VAR}, 0px);
        width: ${DEFAULT_SIDEBAR_WIDTH}px;
        z-index: 1;
        transform: translateX(-100%);
        transition: transform 160ms ease;
        background: linear-gradient(180deg, var(--zvt-bg) 0%, var(--zvt-bg-dark) 100%);
        border-right: 1px solid var(--zvt-border-subtle);
        box-shadow: 10px 0 34px var(--zvt-shadow-strong);
        color: var(--zvt-fg);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        display: flex;
        flex-direction: column;
      }

      #${HOST_ID}.open {
        transform: translateX(0);
      }

      #${EDGE_ID} {
        position: fixed;
        left: 0;
        top: var(${CSS_TOP_OFFSET_VAR}, 0px);
        bottom: var(${CSS_BOTTOM_OFFSET_VAR}, 0px);
        width: 8px;
        z-index: 2147483647;
      }

      #${HOST_ID} .zvt-btn {
        border: 0;
        border-radius: 8px;
        width: 26px;
        height: 26px;
        padding: 0;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        background: var(--zvt-accent-bg);
        color: var(--zvt-accent-fg);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      #${HOST_ID} .zvt-search-wrap {
        padding: 0 12px;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transform: translateY(-4px);
        border-bottom: 1px solid transparent;
        transition:
          max-height 190ms ease,
          padding 190ms ease,
          opacity 160ms ease,
          transform 190ms ease,
          border-color 190ms ease;
      }

      #${HOST_ID}.search-open .zvt-search-wrap {
        padding: 10px 12px;
        max-height: 66px;
        opacity: 1;
        transform: translateY(0);
        border-bottom-color: var(--zvt-fg-alpha);
      }

      #${HOST_ID} .zvt-search {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--zvt-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-light) 80%, transparent);
        color: var(--zvt-fg);
        padding: 8px 10px;
        outline: none;
        opacity: 0;
        pointer-events: none;
        transition: opacity 140ms ease;
      }

      #${HOST_ID}.search-open .zvt-search {
        opacity: 1;
        pointer-events: auto;
      }

      #${HOST_ID} .zvt-search:focus {
        border-color: var(--zvt-highlight-bg);
      }

      #${HOST_ID} .zvt-workspace-wrap {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px 6px;
        position: relative;
      }

      #${HOST_ID} .zvt-workspace-dropdown {
        position: relative;
        flex: 1;
        min-width: 0;
      }

      #${HOST_ID} .zvt-workspace-trigger {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--zvt-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-dark) 96%, transparent);
        color: var(--zvt-fg);
        padding: 6px 26px 6px 10px;
        outline: none;
        font-size: 12px;
        line-height: 1.2;
        text-align: left;
        cursor: pointer;
        box-shadow: inset 0 1px 0 color-mix(in srgb, var(--zvt-fg) 8%, transparent);
        transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${HOST_ID} .zvt-workspace-trigger:hover {
        background: color-mix(in srgb, var(--zvt-bg-intense) 96%, transparent);
      }

      #${HOST_ID} .zvt-workspace-trigger:focus {
        border-color: var(--zvt-highlight-bg);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--zvt-highlight-bg) 24%, transparent);
      }

      #${HOST_ID} .zvt-workspace-trigger::after {
        content: "▾";
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        opacity: 0.9;
        pointer-events: none;
      }

      #${HOST_ID} .zvt-workspace-menu {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        display: none;
        flex-direction: column;
        gap: 4px;
        padding: 6px;
        background: color-mix(in srgb, var(--zvt-bg-dark) 98%, transparent);
        border: 1px solid var(--zvt-border);
        border-radius: 10px;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.42);
        z-index: 62;
        max-height: 240px;
        overflow: auto;
      }

      #${HOST_ID} .zvt-workspace-menu.open {
        display: flex;
      }

      #${HOST_ID} .zvt-workspace-option {
        border: 1px solid var(--zvt-border-subtle);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-light) 70%, transparent);
        color: var(--zvt-fg);
        padding: 6px 8px;
        font-size: 12px;
        text-align: left;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${HOST_ID} .zvt-workspace-option:hover {
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
      }

      #${HOST_ID} .zvt-workspace-option.active {
        border-color: color-mix(in srgb, var(--zvt-highlight-bg) 78%, var(--zvt-border));
        background: color-mix(in srgb, var(--zvt-highlight-bg) 18%, transparent);
      }

      #${HOST_ID} .zvt-workspace-btn {
        width: 22px;
        height: 22px;
        border: 1px solid var(--zvt-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-light) 72%, transparent);
        color: var(--zvt-fg);
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      #${HOST_ID} .zvt-workspace-btn:hover {
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
      }

      #${HOST_ID} #zvt-search-toggle,
      #${HOST_ID} #${COLLAPSE_ALL_BTN_ID} {
        border: 1px solid var(--zvt-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-light) 72%, transparent);
        color: var(--zvt-fg);
        width: 26px;
        height: 26px;
        padding: 0;
        margin: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }

      #${HOST_ID} #zvt-search-toggle:hover,
      #${HOST_ID} #${COLLAPSE_ALL_BTN_ID}:hover {
        border-color: color-mix(in srgb, var(--zvt-highlight-bg) 55%, var(--zvt-border));
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
      }

      #${HOST_ID} #zvt-search-toggle.active {
        border-color: color-mix(in srgb, var(--zvt-highlight-bg) 65%, var(--zvt-border));
        background: color-mix(in srgb, var(--zvt-highlight-bg) 18%, transparent);
        color: var(--zvt-highlight-fg);
      }

      #${HOST_ID} #zvt-search-toggle svg,
      #${HOST_ID} #${COLLAPSE_ALL_BTN_ID} svg {
        width: 14px;
        height: 14px;
        display: block;
      }

      #${HOST_ID} .zvt-workspace-editor {
        margin: 0 12px 8px;
        padding: 8px;
        border: 1px solid var(--zvt-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-dark) 92%, transparent);
        display: none;
        flex-direction: column;
        gap: 6px;
      }

      #${HOST_ID} .zvt-workspace-editor.open {
        display: flex;
      }

      #${HOST_ID} .zvt-workspace-editor input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--zvt-border);
        border-radius: 10px;
        background: color-mix(in srgb, var(--zvt-bg-light) 70%, transparent);
        color: var(--zvt-fg);
        padding: 6px 8px;
        outline: none;
        font-size: 12px;
      }

      #${HOST_ID} .zvt-icon-picker {
        position: relative;
      }

      #${HOST_ID} .zvt-icon-trigger {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--zvt-border);
        border-radius: 10px;
        background: color-mix(in srgb, var(--zvt-bg-intense) 96%, transparent);
        color: var(--zvt-fg);
        padding: 8px 10px;
        text-align: left;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #${HOST_ID} .zvt-icon-trigger::after {
        content: "▾";
        font-size: 10px;
        opacity: 0.85;
      }

      #${HOST_ID} .zvt-icon-dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        background: color-mix(in srgb, var(--zvt-bg-dark) 98%, transparent);
        border: 1px solid var(--zvt-border);
        border-radius: 10px;
        padding: 8px;
        display: none;
        flex-wrap: wrap;
        align-content: flex-start;
        justify-content: flex-start;
        gap: 6px;
        z-index: 60;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.42);
      }

      #${HOST_ID} .zvt-icon-dropdown.open {
        display: flex;
      }

      #${HOST_ID} .zvt-icon-option {
        border: 1px solid var(--zvt-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-light) 72%, transparent);
        color: var(--zvt-fg);
        width: 30px;
        height: 30px;
        min-width: 30px;
        max-width: 30px;
        flex: 0 0 30px;
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      #${HOST_ID} .zvt-icon-option:hover {
        background: color-mix(in srgb, var(--zvt-fg) 12%, transparent);
      }

      #${HOST_ID} .zvt-icon-option.active {
        border-color: color-mix(in srgb, var(--zvt-highlight-bg) 90%, var(--zvt-border));
        background: color-mix(in srgb, var(--zvt-highlight-bg) 18%, transparent);
      }

      #${HOST_ID} .zvt-workspace-editor-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      #${HOST_ID} .zvt-workspace-editor-actions button {
        flex: 1 1 calc(50% - 3px);
        min-width: 0;
        border: 1px solid var(--zvt-border);
        border-radius: 7px;
        background: color-mix(in srgb, var(--zvt-bg-light) 78%, transparent);
        color: var(--zvt-fg);
        padding: 6px 8px;
        font-size: 12px;
        cursor: pointer;
      }

      #${HOST_ID} .zvt-workspace-editor-actions button:hover {
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
      }

      #${HOST_ID} .zvt-workspace-editor-actions button.zvt-danger {
        border-color: color-mix(in srgb, var(--zvt-error-bg) 72%, var(--zvt-border));
        color: color-mix(in srgb, var(--zvt-error-bg) 78%, var(--zvt-fg));
      }

      #${HOST_ID} .zvt-workspace-editor-actions button.zvt-danger:hover {
        background: color-mix(in srgb, var(--zvt-error-bg) 18%, transparent);
      }

      #${HOST_ID} .zvt-workspace-editor-actions button[hidden] {
        display: none;
      }

      #${HOST_ID} .zvt-workspace-delete-modal {
        position: absolute;
        left: 12px;
        right: 12px;
        top: 56px;
        z-index: 85;
        display: none;
        padding: 10px;
        border: 1px solid var(--zvt-border);
        border-radius: 10px;
        background: color-mix(in srgb, var(--zvt-bg-dark) 98%, transparent);
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42);
        flex-direction: column;
        gap: 8px;
      }

      #${HOST_ID} .zvt-workspace-delete-modal.open {
        display: flex;
      }

      #${HOST_ID} .zvt-workspace-delete-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      #${HOST_ID} .zvt-workspace-delete-title {
        font-size: 12px;
        line-height: 1.35;
        color: var(--zvt-fg);
      }

      #${HOST_ID} .zvt-workspace-delete-close {
        width: 22px;
        height: 22px;
        border: 1px solid var(--zvt-border);
        border-radius: 7px;
        background: color-mix(in srgb, var(--zvt-bg-light) 72%, transparent);
        color: var(--zvt-fg);
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      #${HOST_ID} .zvt-workspace-delete-close:hover {
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
      }

      #${HOST_ID} .zvt-workspace-delete-label {
        font-size: 11px;
        color: var(--zvt-fg-muted);
      }

      #${HOST_ID} .zvt-workspace-delete-modal .zvt-workspace-dropdown {
        width: 100%;
      }

      #${HOST_ID} .zvt-workspace-delete-modal .zvt-workspace-menu {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        z-index: 86;
      }

      #${HOST_ID} .zvt-workspace-delete-actions {
        display: flex;
        gap: 6px;
      }

      #${HOST_ID} .zvt-workspace-delete-actions button {
        flex: 1;
        border: 1px solid var(--zvt-border);
        border-radius: 7px;
        background: color-mix(in srgb, var(--zvt-bg-light) 78%, transparent);
        color: var(--zvt-fg);
        padding: 6px 8px;
        font-size: 12px;
        cursor: pointer;
      }

      #${HOST_ID} .zvt-workspace-delete-actions button:hover {
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
      }

      #${HOST_ID} .zvt-workspace-delete-actions button.zvt-danger {
        border-color: color-mix(in srgb, var(--zvt-error-bg) 72%, var(--zvt-border));
        color: color-mix(in srgb, var(--zvt-error-bg) 78%, var(--zvt-fg));
      }

      #${HOST_ID} .zvt-workspace-delete-actions button.zvt-danger:hover {
        background: color-mix(in srgb, var(--zvt-error-bg) 18%, transparent);
      }

      #${HOST_ID} .zvt-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        font-size: 11px;
        color: var(--zvt-fg-muted);
      }

      #${HOST_ID} .zvt-meta-actions {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      #${HOST_ID} .zvt-list {
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
        flex: 1;
        padding: 0 6px 6px;
        position: relative;
        scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--zvt-fg-muted) 65%, transparent) transparent;
      }

      #${HOST_ID} .zvt-list::-webkit-scrollbar {
        width: 10px;
      }

      #${HOST_ID} .zvt-list::-webkit-scrollbar-track {
        background: transparent;
      }

      #${HOST_ID} .zvt-list::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--zvt-fg-muted) 52%, transparent);
        border-radius: 8px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      #${HOST_ID} .zvt-list::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--zvt-fg-muted) 85%, transparent);
      }

      #${HOST_ID} .zvt-list.drop-root {
        box-shadow: inset 0 -3px 0 var(--zvt-highlight-bg);
      }

      #${HOST_ID} .zvt-dnd-pointer {
        position: absolute;
        width: calc(100% - 10px);
        height: 22px;
        left: 4px;
        top: 0;
        pointer-events: none;
        z-index: 9;
        opacity: 0;
        transition: opacity 80ms ease;
      }

      #${HOST_ID} .zvt-dnd-pointer[data-visible="true"] {
        opacity: 1;
      }

      #${HOST_ID} .zvt-dnd-pointer::after {
        content: "";
        position: absolute;
        top: 10px;
        left: 0;
        right: 0;
        height: 2px;
        border-radius: 2px;
        background: var(--zvt-highlight-bg);
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--zvt-highlight-bg) 30%, transparent),
          0 0 10px color-mix(in srgb, var(--zvt-highlight-bg) 55%, transparent);
        opacity: 0;
      }

      #${HOST_ID} .zvt-dnd-pointer[data-mode="between"]::after {
        opacity: 1;
      }

      #${HOST_ID} .zvt-dnd-pointer-arrow {
        position: absolute;
        top: 6px;
        left: -1px;
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 7px solid var(--zvt-highlight-bg);
        opacity: 0;
      }

      #${HOST_ID} .zvt-dnd-pointer[data-mode="inside"] .zvt-dnd-pointer-arrow,
      #${HOST_ID} .zvt-dnd-pointer[data-hover="true"] .zvt-dnd-pointer-arrow {
        opacity: 1;
      }

      #${HOST_ID} .zvt-item {
        --zvt-level: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 10px;
        padding: 8px;
        margin-left: calc(var(--zvt-level) * 14px);
        width: calc(100% - (var(--zvt-level) * 14px));
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        z-index: 1;
        transition: background 120ms ease;
      }

      #${HOST_ID} .zvt-item.anim-enter {
        opacity: 0;
        transform: translateX(-7px) scale(0.988);
      }

      #${HOST_ID} .zvt-item.anim-enter.anim-enter-active {
        opacity: 1;
        transform: translateX(0) scale(1);
        transition: transform 170ms cubic-bezier(0.22, 1, 0.36, 1), opacity 170ms ease;
      }

      #${HOST_ID} .zvt-tree-guide {
        position: absolute;
        width: 1px;
        border-radius: 2px;
        background: color-mix(in srgb, var(--zvt-fg-faded) 80%, transparent);
        box-shadow: 0 0 0 1px rgba(8, 18, 30, 0.2);
        pointer-events: none;
        z-index: 0;
      }

      #${HOST_ID} .zvt-pinned-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 0 2px 8px;
        margin-top: 0;
      }

      #${HOST_ID} .zvt-top-sticky {
        position: sticky;
        top: 0;
        z-index: 7;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--zvt-bg) 98%, transparent) 0%,
          color-mix(in srgb, var(--zvt-bg) 92%, transparent) 100%
        );
        padding-top: 2px;
      }

      #${HOST_ID} .zvt-newtab-row {
        margin: 0;
        background: transparent;
      }

      #${HOST_ID} .zvt-newtab-row .zvt-icon-wrap {
        width: 16px;
        justify-content: center;
      }

      #${HOST_ID} .zvt-newtab-row .zvt-newtab-plus {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        font-size: 17px;
        line-height: 1;
        color: var(--zvt-fg);
      }

      #${HOST_ID} .zvt-newtab-row .zvt-tab-title {
        color: var(--zvt-fg);
      }

      #${HOST_ID} .zvt-separator {
        height: 1px;
        margin: 2px 2px 8px;
        background: var(--zvt-fg-alpha);
      }

      #${HOST_ID} .zvt-item.pinned {
        width: 32px;
        height: 32px;
        min-width: 32px;
        margin-left: 0;
        padding: 0;
        gap: 0;
        justify-content: center;
      }

      #${HOST_ID} .zvt-item.pinned .zvt-text {
        display: none;
      }

      #${HOST_ID} .zvt-item.pinned .zvt-close {
        display: none;
      }

      #${HOST_ID} .zvt-item.pinned .zvt-add-child {
        display: none;
      }

      #${HOST_ID} .zvt-item:hover {
        background: color-mix(in srgb, var(--zvt-fg) 8%, transparent);
      }

      #${HOST_ID} .zvt-item.selected {
        background: color-mix(in srgb, var(--zvt-highlight-bg) 18%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--zvt-highlight-bg) 55%, transparent);
      }

      #${HOST_ID} .zvt-item.dragging {
        opacity: 0.5;
        outline: 2px solid color-mix(in srgb, var(--zvt-highlight-bg) 95%, transparent);
        outline-offset: -2px;
        box-shadow: 0 0 0 1px rgba(8, 20, 36, 0.65), 0 0 14px color-mix(in srgb, var(--zvt-highlight-bg) 45%, transparent);
      }

      #${HOST_ID} .zvt-item.drag-selected {
        outline: 2px solid color-mix(in srgb, var(--zvt-highlight-bg) 58%, transparent);
        outline-offset: -2px;
        background: color-mix(in srgb, var(--zvt-highlight-bg) 12%, transparent);
      }

      #${HOST_ID} .zvt-item.drop-before::before,
      #${HOST_ID} .zvt-item.drop-after::after {
        content: "";
        position: absolute;
        left: var(--zvt-drop-left, 6px);
        right: 6px;
        height: 3px;
        border-radius: 3px;
        background: var(--zvt-highlight-bg);
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--zvt-highlight-bg) 45%, transparent),
          0 0 10px color-mix(in srgb, var(--zvt-highlight-bg) 65%, transparent);
        pointer-events: none;
      }

      #${HOST_ID} .zvt-item.drop-before::before {
        top: -1px;
      }

      #${HOST_ID} .zvt-item.drop-after::after {
        bottom: -1px;
      }

      #${HOST_ID} .zvt-item.drop-inside {
        outline: 2px solid var(--zvt-highlight-bg);
        outline-offset: -2px;
        background: color-mix(in srgb, var(--zvt-highlight-bg) 16%, transparent);
      }

      #${HOST_ID} .zvt-item.active {
        background: color-mix(in srgb, var(--zvt-highlight-bg) 20%, transparent);
      }

      #${HOST_ID} .zvt-item.discarded {
        opacity: 0.55;
      }

      #${HOST_ID} .zvt-icon {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      #${HOST_ID} .zvt-icon-wrap {
        position: relative;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      #${HOST_ID} .zvt-tree-toggle {
        position: absolute;
        width: calc(100% + 8px);
        height: calc(100% + 8px);
        top: -4px;
        left: -4px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: color-mix(in srgb, var(--zvt-fg) 96%, transparent);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0;
        line-height: 1;
        padding: 0;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        z-index: -1;
        transform: rotate(0deg);
        transform-origin: 50% 50%;
        transition: opacity 120ms ease, transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      #${HOST_ID} .zvt-tree-toggle svg {
        width: 14px;
        height: 14px;
        display: block;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
      }

      #${HOST_ID} .zvt-item.has-children.tree-collapsed .zvt-tree-toggle {
        opacity: 1;
        pointer-events: auto;
        z-index: 3;
        transform: rotate(-90deg);
      }

      #${HOST_ID} .zvt-item.has-children:not(.tree-collapsed):hover .zvt-tree-toggle {
        opacity: 1;
        pointer-events: auto;
        z-index: 3;
      }

      #${HOST_ID} .zvt-item.has-children:hover .zvt-icon,
      #${HOST_ID} .zvt-item.has-children.tree-collapsed .zvt-icon {
        opacity: 0.22;
      }

      @media (prefers-reduced-motion: reduce) {
        #${HOST_ID},
        #${HOST_ID} .zvt-item,
        #${HOST_ID} .zvt-item.anim-enter.anim-enter-active,
        #${HOST_ID} .zvt-tree-toggle {
          transition: none !important;
          animation: none !important;
        }
      }

      #${HOST_ID} .zvt-tree-count {
        position: absolute;
        right: -7px;
        bottom: -7px;
        min-width: 13px;
        height: 13px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg-darker) 95%, transparent);
        border: 1px solid color-mix(in srgb, var(--zvt-fg) 35%, transparent);
        color: var(--zvt-fg);
        font-size: 9px;
        line-height: 1;
        padding: 0 3px;
        box-sizing: border-box;
        display: none;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 4;
      }

      #${HOST_ID} .zvt-item.has-children.tree-collapsed .zvt-tree-count {
        display: inline-flex;
      }

      #${HOST_ID} .zvt-muted-indicator {
        position: absolute;
        right: -5px;
        top: -5px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--zvt-bg-darker) 95%, transparent);
        border: 1px solid color-mix(in srgb, var(--zvt-fg) 22%, transparent);
        color: var(--colorErrorBg, #ffb3b3);
        font-size: 8px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 2;
      }

      #${HOST_ID} .zvt-spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid color-mix(in srgb, var(--zvt-fg) 18%, transparent);
        border-top-color: color-mix(in srgb, var(--zvt-highlight-bg) 95%, transparent);
        box-sizing: border-box;
        flex-shrink: 0;
        animation: zenith-vt-spin 0.8s linear infinite;
      }

      @keyframes zenith-vt-spin {
        to { transform: rotate(360deg); }
      }

      #${HOST_ID} .zvt-text {
        min-width: 0;
        flex: 1;
        padding-right: 0;
        transition: padding-right 120ms ease;
      }

      #${HOST_ID} .zvt-text .zvt-tab-title {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #${HOST_ID} .zvt-rename-input {
        width: 100%;
        box-sizing: border-box;
        height: 22px;
        border: 1px solid color-mix(in srgb, var(--zvt-highlight-bg) 82%, transparent);
        border-radius: 6px;
        background: color-mix(in srgb, var(--zvt-bg-dark) 96%, transparent);
        color: var(--zvt-fg);
        font-size: 12px;
        padding: 0 7px;
        outline: none;
      }

      #${HOST_ID} .zvt-close {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        border: 0;
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: transparent;
        color: var(--zvt-fg-muted);
        cursor: pointer;
        flex-shrink: 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity 120ms ease;
        font-size: 16px;
        line-height: 1;
      }

      #${HOST_ID} .zvt-add-child {
        position: absolute;
        right: 32px;
        top: 50%;
        transform: translateY(-50%);
        border: 0;
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: transparent;
        color: var(--zvt-fg-muted);
        cursor: pointer;
        flex-shrink: 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity 120ms ease;
        font-size: 15px;
        line-height: 1;
      }

      #${HOST_ID} .zvt-add-child:hover {
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
        color: var(--zvt-highlight-fg);
      }

      #${HOST_ID} .zvt-close:hover {
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
        color: var(--zvt-highlight-fg);
      }

      #${HOST_ID} .zvt-item.active .zvt-close,
      #${HOST_ID} .zvt-item:hover .zvt-close {
        opacity: 1;
        pointer-events: auto;
      }

      #${HOST_ID} .zvt-item:hover .zvt-add-child {
        opacity: 1;
        pointer-events: auto;
      }

      #${HOST_ID} .zvt-item.active .zvt-text,
      #${HOST_ID} .zvt-item:hover .zvt-text {
        padding-right: 24px;
      }

      #${HOST_ID} .zvt-item:hover .zvt-text {
        padding-right: 48px;
      }

      #${HOST_ID} .zvt-context-menu {
        position: absolute;
        min-width: 190px;
        background: color-mix(in srgb, var(--zvt-bg-dark) 98%, transparent);
        border: 1px solid var(--zvt-border);
        border-radius: 10px;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.38);
        padding: 6px;
        z-index: 50;
        overflow-y: auto;
      }

      #${HOST_ID} .zvt-context-item {
        width: 100%;
        border: 0;
        background: transparent;
        color: var(--zvt-fg);
        border-radius: 7px;
        padding: 7px 9px;
        text-align: left;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #${HOST_ID} .zvt-context-item:hover {
        background: color-mix(in srgb, var(--zvt-fg) 8%, transparent);
      }

      #${HOST_ID} .zvt-context-item-icon {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 14px;
        color: var(--zvt-fg-muted);
      }

      #${HOST_ID} .zvt-context-item-icon svg {
        width: 14px;
        height: 14px;
        display: block;
        fill: currentColor;
      }

      #${HOST_ID} .zvt-context-item-label {
        min-width: 0;
        flex: 1 1 auto;
      }

      #${HOST_ID} .zvt-context-sep {
        height: 1px;
        margin: 4px 2px;
        background: color-mix(in srgb, var(--zvt-fg) 10%, transparent);
      }

      #${HOST_ID} .zvt-context-label {
        color: var(--zvt-fg-muted);
        font-size: 11px;
        padding: 7px 9px 4px;
        user-select: none;
      }

      #${HOST_ID} .zvt-context-item.sub {
        padding-left: 18px;
      }

      #${HOST_ID} .zvt-context-item[disabled] {
        opacity: 0.56;
        cursor: default;
        pointer-events: none;
      }

      #${HOST_ID} .zvt-status {
        padding: 12px;
        font-size: 12px;
        color: var(--zvt-fg-faded);
      }

      #${HOST_ID} .zvt-resize-handle {
        position: absolute;
        top: 0;
        right: -3px;
        width: 6px;
        height: 100%;
        cursor: ew-resize;
        background: transparent;
        pointer-events: none;
      }

      #${HOST_ID}.open .zvt-resize-handle {
        pointer-events: auto;
      }

      #${TOGGLE_BTN_ID} {
        border: 1px solid var(--zvt-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--zvt-bg) 94%, transparent);
        color: var(--zvt-fg);
        width: 26px;
        height: 26px;
        padding: 0;
        margin: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }

      #${TOGGLE_BTN_ID}:hover {
        border-color: color-mix(in srgb, var(--zvt-highlight-bg) 60%, var(--zvt-border));
      }

      #${TOGGLE_BTN_ID}.autohide-on {
        color: var(--zvt-fg-muted);
      }

      #${TOGGLE_BTN_ID}.autohide-off {
        color: var(--zvt-highlight-fg);
        border-color: color-mix(in srgb, var(--zvt-highlight-bg) 65%, var(--zvt-border));
        background: color-mix(in srgb, var(--zvt-highlight-bg) 18%, transparent);
      }

      #${TOGGLE_BTN_ID} svg {
        width: 14px;
        height: 14px;
        display: block;
      }

      body.zenith-vt-resizing {
        cursor: ew-resize !important;
        user-select: none !important;
      }
    `;

    document.documentElement.appendChild(style);
  }

  function createLayout() {
    const host = document.createElement("div");
    host.id = HOST_ID;
    host.innerHTML = `
      <div class="zvt-workspace-wrap">
        <div class="zvt-workspace-dropdown">
          <button id="zvt-workspace-trigger" class="zvt-workspace-trigger" type="button" aria-label="Workspace"></button>
          <div id="zvt-workspace-menu" class="zvt-workspace-menu"></div>
        </div>
        <button id="zvt-workspace-add" class="zvt-workspace-btn" type="button" aria-label="Add workspace" title="Add workspace">+</button>
        <button id="zvt-workspace-edit" class="zvt-workspace-btn" type="button" aria-label="Edit workspace" title="Edit workspace">✎</button>
      </div>
      <div class="zvt-search-wrap">
        <input id="zvt-search" class="zvt-search" type="text" placeholder="Search tabs..." autocomplete="off" />
      </div>
      <div id="zvt-workspace-editor" class="zvt-workspace-editor">
        <input id="zvt-workspace-name" type="text" placeholder="Workspace name" />
        <div class="zvt-icon-picker">
          <button id="zvt-workspace-icon-trigger" class="zvt-icon-trigger" type="button" aria-label="Choose workspace icon">💼</button>
          <div id="zvt-workspace-icon-dropdown" class="zvt-icon-dropdown"></div>
        </div>
        <div class="zvt-workspace-editor-actions">
          <button id="zvt-workspace-save" type="button">Save</button>
          <button id="zvt-workspace-delete" class="zvt-danger" type="button" hidden>Delete</button>
          <button id="zvt-workspace-cancel" type="button">Cancel</button>
        </div>
      </div>
      <div id="zvt-workspace-delete-modal" class="zvt-workspace-delete-modal" role="dialog" aria-modal="true" aria-label="Delete workspace">
        <div class="zvt-workspace-delete-head">
          <div id="zvt-workspace-delete-title" class="zvt-workspace-delete-title"></div>
          <button id="zvt-workspace-delete-close" class="zvt-workspace-delete-close" type="button" aria-label="Close">×</button>
        </div>
        <div class="zvt-workspace-delete-label">Move tabs to another workspace</div>
        <div class="zvt-workspace-dropdown">
          <button id="zvt-workspace-delete-target-trigger" class="zvt-workspace-trigger" type="button" aria-label="Choose target workspace"></button>
          <div id="zvt-workspace-delete-target-menu" class="zvt-workspace-menu"></div>
        </div>
        <div class="zvt-workspace-delete-actions">
          <button id="zvt-workspace-delete-move" type="button">Move tabs</button>
          <button id="zvt-workspace-delete-remove" class="zvt-danger" type="button">Delete tabs</button>
        </div>
      </div>
      <div class="zvt-meta">
        <span id="zvt-count">0 tabs</span>
        <div class="zvt-meta-actions">
          <button id="${COLLAPSE_ALL_BTN_ID}" type="button" aria-label="Collapse all trees" title="Collapse all trees">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 4.5h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
              <path d="M4 8h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
              <path d="M6 11.5h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
            </svg>
          </button>
          <button id="zvt-search-toggle" type="button" aria-label="Search" title="Search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
              <path d="M16 16l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
          </button>
          <button id="${TOGGLE_BTN_ID}" type="button"></button>
        </div>
      </div>
      <div id="zvt-list" class="zvt-list"></div>
      <div id="zvt-status" class="zvt-status" hidden></div>
      <div id="zvt-resize" class="zvt-resize-handle" title="Resize sidebar"></div>
    `;

    const edge = document.createElement("div");
    edge.id = EDGE_ID;
    document.body.appendChild(host);
    document.body.appendChild(edge);

    ui.host = host;
    ui.search = host.querySelector("#zvt-search");
    ui.searchToggle = host.querySelector("#zvt-search-toggle");
    ui.collapseAllBtn = host.querySelector(`#${COLLAPSE_ALL_BTN_ID}`);
    ui.workspaceTrigger = host.querySelector("#zvt-workspace-trigger");
    ui.workspaceDropdown = host.querySelector("#zvt-workspace-menu");
    ui.workspaceAddBtn = host.querySelector("#zvt-workspace-add");
    ui.workspaceEditBtn = host.querySelector("#zvt-workspace-edit");
    ui.workspaceEditor = host.querySelector("#zvt-workspace-editor");
    ui.workspaceNameInput = host.querySelector("#zvt-workspace-name");
    ui.workspaceIconTrigger = host.querySelector("#zvt-workspace-icon-trigger");
    ui.workspaceIconDropdown = host.querySelector("#zvt-workspace-icon-dropdown");
    ui.workspaceSaveBtn = host.querySelector("#zvt-workspace-save");
    ui.workspaceDeleteBtn = host.querySelector("#zvt-workspace-delete");
    ui.workspaceCancelBtn = host.querySelector("#zvt-workspace-cancel");
    ui.workspaceDeleteModal = host.querySelector("#zvt-workspace-delete-modal");
    ui.workspaceDeleteTitle = host.querySelector("#zvt-workspace-delete-title");
    ui.workspaceDeleteTargetTrigger = host.querySelector("#zvt-workspace-delete-target-trigger");
    ui.workspaceDeleteTargetMenu = host.querySelector("#zvt-workspace-delete-target-menu");
    ui.workspaceDeleteMoveBtn = host.querySelector("#zvt-workspace-delete-move");
    ui.workspaceDeleteRemoveBtn = host.querySelector("#zvt-workspace-delete-remove");
    ui.workspaceDeleteCloseBtn = host.querySelector("#zvt-workspace-delete-close");
    ui.list = host.querySelector("#zvt-list");
    ui.count = host.querySelector("#zvt-count");
    ui.status = host.querySelector("#zvt-status");
    const dndPointer = document.createElement("div");
    dndPointer.className = "zvt-dnd-pointer";
    dndPointer.dataset.mode = "none";
    dndPointer.dataset.visible = "false";
    dndPointer.dataset.hover = "false";
    dndPointer.innerHTML = '<div class="zvt-dnd-pointer-arrow"></div>';
    ui.list.appendChild(dndPointer);
    ui.dndPointer = dndPointer;
    const resizeHandle = host.querySelector("#zvt-resize");
    const toggleBtn = host.querySelector(`#${TOGGLE_BTN_ID}`);
    syncThemeVarsFromVivaldi();
    applySidebarWidth(state.width, false);

    if (ui.workspaceTrigger) {
      ui.workspaceTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWorkspaceDropdown();
      });
      ui.workspaceTrigger.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          const now = Date.now();
          if (now - state.lastWorkspaceWheelAt < 120) return;
          const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
          if (!delta) return;
          state.lastWorkspaceWheelAt = now;
          closeWorkspaceDropdown();
          cycleCustomWorkspace(delta > 0 ? 1 : -1);
        },
        { passive: false }
      );
    }
    if (ui.workspaceAddBtn) {
      ui.workspaceAddBtn.addEventListener("click", () => {
        addCustomWorkspace();
      });
    }
    if (ui.workspaceEditBtn) {
      ui.workspaceEditBtn.addEventListener("click", () => {
        editActiveCustomWorkspace();
      });
    }
    if (ui.collapseAllBtn) {
      ui.collapseAllBtn.addEventListener("click", () => {
        void collapseAllTreesInCurrentWorkspace();
      });
    }
    if (ui.workspaceSaveBtn) {
      ui.workspaceSaveBtn.addEventListener("click", () => {
        submitWorkspaceEditor();
      });
    }
    if (ui.workspaceDeleteBtn) {
      ui.workspaceDeleteBtn.addEventListener("click", () => {
        void deleteWorkspaceFromEditor();
      });
    }
    if (ui.workspaceDeleteCloseBtn) {
      ui.workspaceDeleteCloseBtn.addEventListener("click", () => {
        closeWorkspaceDeleteModal();
      });
    }
    if (ui.workspaceDeleteTargetTrigger) {
      ui.workspaceDeleteTargetTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWorkspaceDeleteTargetMenu();
      });
    }
    if (ui.workspaceDeleteMoveBtn) {
      ui.workspaceDeleteMoveBtn.addEventListener("click", () => {
        void confirmWorkspaceDeletion("move");
      });
    }
    if (ui.workspaceDeleteRemoveBtn) {
      ui.workspaceDeleteRemoveBtn.addEventListener("click", () => {
        void confirmWorkspaceDeletion("delete");
      });
    }
    if (ui.workspaceCancelBtn) {
      ui.workspaceCancelBtn.addEventListener("click", () => {
        closeWorkspaceEditor();
      });
    }
    if (ui.workspaceIconTrigger) {
      ui.workspaceIconTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWorkspaceIconDropdown();
      });
    }
    if (ui.workspaceNameInput) {
      ui.workspaceNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submitWorkspaceEditor();
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeWorkspaceEditor();
        }
      });
    }
    if (ui.searchToggle) {
      ui.searchToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSearchOpen();
      });
    }
    renderWorkspaceSelector();
    updateSearchUi();

    ui.search.addEventListener("input", () => {
      state.search = ui.search.value || "";
      scheduleRender(50);
    });
    ui.search.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSearchOpen(false, false);
      }
    });

    ui.list.addEventListener("dragover", (e) => {
      if (!state.dragState || state.search.trim()) return;
      const row = e.target.closest(".zvt-item[data-tab-id]");
      if (row) return;
      e.preventDefault();
      state.dragState.hint = { type: "root-end", targetTabId: null, desiredLevel: 0 };
      applyDropIndicator(state.dragState.hint);
    });

    ui.list.addEventListener("drop", (e) => {
      if (!state.dragState || state.search.trim()) return;
      const row = e.target.closest(".zvt-item[data-tab-id]");
      if (row) return;
      e.preventDefault();
      void applyDropFromState().finally(() => {
        state.dragState = null;
        clearDropIndicators();
      });
    });

    edge.addEventListener("mouseenter", () => openSidebar());
    host.addEventListener("mouseleave", () => {
      if (state.resizing) return;
      if (state.autohide && state.open) closeSidebar();
    });

    toggleBtn.addEventListener("click", () => {
      setAutohide(!state.autohide);
    });

    resizeHandle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (resizeHandle.setPointerCapture) {
        resizeHandle.setPointerCapture(e.pointerId);
      }

      state.resizing = true;
      document.body.classList.add("zenith-vt-resizing");

      const onMove = (ev) => {
        // During drag, resize panel only; reflow page content on release.
        applySidebarWidth(ev.clientX, false, state.autohide);
      };

      const onUp = () => {
        if (resizeHandle.releasePointerCapture) {
          try { resizeHandle.releasePointerCapture(e.pointerId); } catch {}
        }
        state.resizing = false;
        document.body.classList.remove("zenith-vt-resizing");
        saveSidebarWidth();
        if (!state.autohide) {
          if (!state.contentRoot || state.contentRoot === document.body) {
            state.contentRoot = findContentRoot();
          }
          applyPinnedLayout(true);
        }
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    });

    document.addEventListener("pointerdown", (e) => {
      if (ui.workspaceDeleteTargetMenu && ui.workspaceDeleteTargetMenu.classList.contains("open")) {
        const target = e.target;
        const insideDeleteTarget =
          !!(target && (
            (ui.workspaceDeleteTargetMenu && ui.workspaceDeleteTargetMenu.contains(target)) ||
            (ui.workspaceDeleteTargetTrigger && ui.workspaceDeleteTargetTrigger.contains(target))
          ));
        if (!insideDeleteTarget) closeWorkspaceDeleteTargetMenu();
      }
      if (ui.workspaceDeleteModal && ui.workspaceDeleteModal.classList.contains("open")) {
        const target = e.target;
        const insideDeleteModal =
          !!(target && (
            (ui.workspaceDeleteModal && ui.workspaceDeleteModal.contains(target)) ||
            (ui.workspaceDeleteBtn && ui.workspaceDeleteBtn.contains(target))
          ));
        if (!insideDeleteModal) closeWorkspaceDeleteModal();
      }
      if (ui.workspaceDropdown && ui.workspaceDropdown.classList.contains("open")) {
        const target = e.target;
        const insideWorkspaceDropdown =
          !!(target && (
            (ui.workspaceDropdown && ui.workspaceDropdown.contains(target)) ||
            (ui.workspaceTrigger && ui.workspaceTrigger.contains(target))
          ));
        if (!insideWorkspaceDropdown) closeWorkspaceDropdown();
      }
      if (ui.workspaceIconDropdown && ui.workspaceIconDropdown.classList.contains("open")) {
        const target = e.target;
        const insidePicker =
          !!(target && (
            (ui.workspaceIconDropdown && ui.workspaceIconDropdown.contains(target)) ||
            (ui.workspaceIconTrigger && ui.workspaceIconTrigger.contains(target))
          ));
        if (!insidePicker) closeWorkspaceIconDropdown();
      }
      if (state.contextMenuEl) {
        const target = e.target;
        const insideMenu = !!(target && state.contextMenuEl.contains(target));
        if (!insideMenu) {
          hideTabContextMenu();
        }
      }
      if (state.resizing) return;
      if (!state.autohide) return;
      if (!state.open) return;
      if (!ui.host.contains(e.target)) {
        closeSidebar();
      }
    });

    const handleGlobalKeyDown = (e) => {
      const isEscape =
        e.key === "Escape" ||
        e.key === "Esc" ||
        e.code === "Escape" ||
        e.keyCode === 27;
      if (isEscape && ui.workspaceDeleteModal && ui.workspaceDeleteModal.classList.contains("open")) {
        e.preventDefault();
        e.stopPropagation();
        closeWorkspaceDeleteModal();
        return;
      }
      if (isEscape && state.contextMenuEl) {
        e.preventDefault();
        e.stopPropagation();
        hideTabContextMenu();
        return;
      }
      const key = (e.key || "").toLowerCase();
      const isNewTabShortcut = (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && key === "t";
      if (!isNewTabShortcut) return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      void openNewTabAtTop();
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true);
  }

  function resolveVivaldiThemeSourceEl() {
    return (
      document.querySelector("#browser") ||
      document.querySelector("#app") ||
      document.body ||
      document.documentElement
    );
  }

  function syncThemeVarsFromVivaldi() {
    if (!ui.host) return;
    const source = resolveVivaldiThemeSourceEl();
    if (!source) return;
    const sourceStyle = getComputedStyle(source);
    const rootStyle = getComputedStyle(document.documentElement);

    VIVALDI_THEME_VARS.forEach((name) => {
      let value = String(sourceStyle.getPropertyValue(name) || "").trim();
      if (!value || value === "initial" || value === "inherit" || value === "unset") {
        value = String(rootStyle.getPropertyValue(name) || "").trim();
      }
      if (!value || value === "initial" || value === "inherit" || value === "unset") return;
      ui.host.style.setProperty(name, value);
    });
  }

  function startUiObservers() {
    if (state.uiObserver) {
      try {
        state.uiObserver.disconnect();
      } catch {}
      state.uiObserver = null;
    }

    const target =
      document.querySelector("#browser") ||
      document.querySelector("#main") ||
      document.body;
    if (!target || typeof MutationObserver !== "function") return;

    const queueRecalc = () => {
      if (state.uiObserverRafQueued) return;
      state.uiObserverRafQueued = true;
      requestAnimationFrame(() => {
        state.uiObserverRafQueued = false;
        syncThemeVarsFromVivaldi();
        scheduleTopOffsetUpdate();
      });
    };

    state.uiObserver = new MutationObserver(() => {
      queueRecalc();
    });

    try {
      state.uiObserver.observe(target, {
        attributes: true,
        attributeFilter: ["class", "style", "hidden"],
        childList: true,
        subtree: true,
      });
    } catch {}
  }

  function clampSidebarWidth(width) {
    const numeric = Number(width);
    if (!Number.isFinite(numeric)) return DEFAULT_SIDEBAR_WIDTH;
    const viewportMax = Math.max(MIN_SIDEBAR_WIDTH, window.innerWidth - 80);
    const maxAllowed = Math.min(MAX_SIDEBAR_WIDTH, viewportMax);
    return Math.min(maxAllowed, Math.max(MIN_SIDEBAR_WIDTH, Math.round(numeric)));
  }

  function loadSidebarWidth() {
    try {
      const raw = localStorage.getItem(STORAGE_WIDTH_KEY);
      if (raw !== null) state.width = clampSidebarWidth(raw);
    } catch {}
  }

  function saveSidebarWidth() {
    try {
      localStorage.setItem(STORAGE_WIDTH_KEY, String(state.width));
    } catch {}
    setToChromeStorage({ [STORAGE_WIDTH_KEY]: state.width });
  }

  function saveCollapsedTrees() {
    const nodeIds = [...state.collapsedTrees]
      .map((tabId) => state.nodeIdByTabId.get(tabId))
      .filter((nodeId) => typeof nodeId === "string" && nodeId);
    try {
      localStorage.setItem(STORAGE_TREE_KEY, JSON.stringify(nodeIds));
    } catch {}
    setToChromeStorage({ [STORAGE_TREE_KEY]: nodeIds });
  }

  function requestCollapsedTreesSave(delay = 550) {
    if (state.collapsedSaveTimer) clearTimeout(state.collapsedSaveTimer);
    state.collapsedSaveTimer = setTimeout(() => {
      state.collapsedSaveTimer = null;
      saveCollapsedTrees();
    }, delay);
  }

  function normalizeFingerprintStr(value) {
    return String(value || "").trim().toLowerCase();
  }

  function makeTabFingerprint(tab) {
    const url = normalizeFingerprintStr(tab && (tab.url || tab.pendingUrl));
    const title = normalizeFingerprintStr(tab && tab.title);
    return `${url}||${title}`;
  }

  function makeTabUrlFingerprint(tab) {
    return normalizeFingerprintStr(tab && (tab.url || tab.pendingUrl));
  }

  function saveTreeSnapshot() {
    if (!state.persistenceReady) return;
    const regularTabs = [...state.tabs]
      .filter((tab) => !tab.pinned)
      .sort((a, b) => a.index - b.index);
    const seen = new Map();
    const seenByUrl = new Map();
    const snapshot = [];

    regularTabs.forEach((tab) => {
      const fp = makeTabFingerprint(tab);
      const seq = (seen.get(fp) || 0) + 1;
      seen.set(fp, seq);
      const fpUrl = makeTabUrlFingerprint(tab);
      const seqUrl = (seenByUrl.get(fpUrl) || 0) + 1;
      seenByUrl.set(fpUrl, seqUrl);
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (!nodeId) return;
      const parentNodeId = state.parentNodeByNodeId.get(nodeId) || null;
      snapshot.push({
        fp,
        seq,
        fpUrl,
        seqUrl,
        nodeId,
        parentNodeId,
      });
    });

    try {
      localStorage.setItem(STORAGE_TREE_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {}
    setToChromeStorage({ [STORAGE_TREE_SNAPSHOT_KEY]: snapshot });
  }

  function requestTreeSnapshotSave(delay = 700) {
    if (!state.persistenceReady) return;
    if (state.snapshotSaveTimer) clearTimeout(state.snapshotSaveTimer);
    state.snapshotSaveTimer = setTimeout(() => {
      state.snapshotSaveTimer = null;
      saveTreeSnapshot();
    }, delay);
  }

  function saveCustomTitles() {
    if (!state.persistenceReady) return;
    const payload = {};
    state.customTitlesByNodeId.forEach((value, nodeId) => {
      const text = String(value || "").trim();
      if (!nodeId || !text) return;
      payload[nodeId] = text;
    });
    try {
      localStorage.setItem(STORAGE_CUSTOM_TITLES_KEY, JSON.stringify(payload));
    } catch {}
    setToChromeStorage({ [STORAGE_CUSTOM_TITLES_KEY]: payload });
  }

  function requestCustomTitlesSave(delay = 300) {
    if (!state.persistenceReady) return;
    if (state.customTitlesSaveTimer) clearTimeout(state.customTitlesSaveTimer);
    state.customTitlesSaveTimer = setTimeout(() => {
      state.customTitlesSaveTimer = null;
      saveCustomTitles();
    }, delay);
  }

  function loadCustomTitlesSetting() {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_TITLES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      const next = new Map();
      Object.entries(parsed).forEach(([nodeId, value]) => {
        const text = String(value || "").trim();
        if (nodeId && text) next.set(nodeId, text);
      });
      state.customTitlesByNodeId = next;
    } catch {}
  }

  function getCustomTitleForTab(tabId) {
    if (tabId == null) return "";
    const nodeId = state.nodeIdByTabId.get(tabId);
    if (!nodeId) return "";
    return state.customTitlesByNodeId.get(nodeId) || "";
  }

  function setCustomTitleForTab(tabId, title) {
    if (tabId == null) return;
    const nodeId = state.nodeIdByTabId.get(tabId);
    if (!nodeId) return;
    const text = String(title || "").trim();
    if (!text) state.customTitlesByNodeId.delete(nodeId);
    else state.customTitlesByNodeId.set(nodeId, text);
    requestCustomTitlesSave(240);
  }

  function getWorkspaceIconChoices() {
    return [
      "💼", "🌐", "📚", "🧪", "🎵", "🧠",
      "🛒", "📺", "⚙️", "⭐", "🏠", "📁",
      "🎮", "💻", "🖥️", "🔎", "📱", "📝",
      "📊", "💬", "🎬", "🎧", "📰", "🧭",
      "🛠️", "💡", "🔒", "☁️", "🚀", "📦"
    ];
  }

  function createDefaultCustomWorkspace() {
    return { id: "ws-default", name: "Workspace 1", icon: "💼" };
  }

  function normalizeCustomWorkspaceId(value) {
    if (value == null) return null;
    const id = String(value).trim();
    return id ? id : null;
  }

  function ensureCustomWorkspacesInitialized() {
    const normalized = [];
    const seen = new Set();
    (Array.isArray(state.customWorkspaces) ? state.customWorkspaces : []).forEach((ws, idx) => {
      if (!ws || typeof ws !== "object") return;
      const id = normalizeCustomWorkspaceId(ws.id) || `ws-${Date.now().toString(36)}-${idx}`;
      if (seen.has(id)) return;
      seen.add(id);
      const name = String(ws.name || "").trim() || `Workspace ${normalized.length + 1}`;
      const icon = String(ws.icon || "").trim() || "💼";
      normalized.push({ id, name, icon });
    });
    if (!normalized.length) normalized.push(createDefaultCustomWorkspace());
    state.customWorkspaces = normalized;

    const currentId = normalizeCustomWorkspaceId(state.currentCustomWorkspaceId);
    if (!currentId || !state.customWorkspaces.some((ws) => ws.id === currentId)) {
      state.currentCustomWorkspaceId = state.customWorkspaces[0].id;
    } else {
      state.currentCustomWorkspaceId = currentId;
    }

    const validWorkspaceIds = new Set(state.customWorkspaces.map((ws) => ws.id));
    for (const [wsId, nodeId] of [...state.workspaceLastActiveNodeById.entries()]) {
      if (!validWorkspaceIds.has(wsId) || !nodeId) {
        state.workspaceLastActiveNodeById.delete(wsId);
      }
    }
  }

  function saveCustomWorkspaceState() {
    ensureCustomWorkspacesInitialized();
    const tabMap = {};
    state.tabWorkspaceByNodeId.forEach((workspaceId, nodeId) => {
      if (!nodeId) return;
      const wsId = normalizeCustomWorkspaceId(workspaceId);
      if (!wsId) return;
      tabMap[nodeId] = wsId;
    });
    const lastActiveNodeByWorkspace = {};
    state.workspaceLastActiveNodeById.forEach((nodeId, workspaceId) => {
      const wsId = normalizeCustomWorkspaceId(workspaceId);
      if (!wsId || !nodeId) return;
      lastActiveNodeByWorkspace[wsId] = nodeId;
    });
    const workspacePayload = {
      workspaces: state.customWorkspaces,
      currentWorkspaceId: state.currentCustomWorkspaceId,
      lastActiveNodeByWorkspace,
    };
    try {
      localStorage.setItem(STORAGE_CUSTOM_WORKSPACES_KEY, JSON.stringify(workspacePayload));
      localStorage.setItem(STORAGE_TAB_WORKSPACE_MAP_KEY, JSON.stringify(tabMap));
    } catch {}
    setToChromeStorage({
      [STORAGE_CUSTOM_WORKSPACES_KEY]: workspacePayload,
      [STORAGE_TAB_WORKSPACE_MAP_KEY]: tabMap,
    });
  }

  function loadCustomWorkspacesSetting() {
    try {
      const rawWs = localStorage.getItem(STORAGE_CUSTOM_WORKSPACES_KEY);
      if (rawWs) {
        const parsed = JSON.parse(rawWs);
        if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.workspaces)) state.customWorkspaces = parsed.workspaces;
          if (parsed.currentWorkspaceId != null) state.currentCustomWorkspaceId = String(parsed.currentWorkspaceId);
          if (parsed.lastActiveNodeByWorkspace && typeof parsed.lastActiveNodeByWorkspace === "object") {
            const next = new Map();
            Object.entries(parsed.lastActiveNodeByWorkspace).forEach(([workspaceId, nodeId]) => {
              const wsId = normalizeCustomWorkspaceId(workspaceId);
              const nid = nodeId == null ? null : String(nodeId).trim();
              if (wsId && nid) next.set(wsId, nid);
            });
            state.workspaceLastActiveNodeById = next;
          }
        }
      }
    } catch {}
    try {
      const rawMap = localStorage.getItem(STORAGE_TAB_WORKSPACE_MAP_KEY);
      if (rawMap) {
        const parsed = JSON.parse(rawMap);
        if (parsed && typeof parsed === "object") {
          const map = new Map();
          Object.entries(parsed).forEach(([nodeId, workspaceId]) => {
            const wsId = normalizeCustomWorkspaceId(workspaceId);
            if (nodeId && wsId) map.set(nodeId, wsId);
          });
          state.tabWorkspaceByNodeId = map;
        }
      }
    } catch {}
    ensureCustomWorkspacesInitialized();
  }

  function getCustomWorkspaceIdForTab(tab) {
    if (!tab || tab.id == null) return null;
    const nodeId = state.nodeIdByTabId.get(tab.id);
    if (!nodeId) return null;
    const wsId = normalizeCustomWorkspaceId(state.tabWorkspaceByNodeId.get(nodeId));
    return wsId || null;
  }

  function rememberLastActiveTabForWorkspace(tab) {
    if (!tab || tab.id == null) return false;
    const wsId = getCustomWorkspaceIdForTab(tab);
    if (!wsId) return false;
    const nodeId = state.nodeIdByTabId.get(tab.id);
    if (!nodeId) return false;
    if (state.workspaceLastActiveNodeById.get(wsId) === nodeId) return false;
    state.workspaceLastActiveNodeById.set(wsId, nodeId);
    return true;
  }

  function findPreferredActiveTabInWorkspace(workspaceId) {
    const wsId = normalizeCustomWorkspaceId(workspaceId);
    if (!wsId) return null;
    const list = getWorkspaceScopedTabs(state.tabs, wsId);
    if (!list.length) return null;

    const lastNodeId = state.workspaceLastActiveNodeById.get(wsId);
    if (lastNodeId) {
      const byNode = list.find((tab) => state.nodeIdByTabId.get(tab.id) === lastNodeId);
      if (byNode) return byNode;
    }
    const byActive = list.find((tab) => !!tab.active);
    if (byActive) return byActive;
    return list[0];
  }

  async function activatePreferredWorkspaceTab(workspaceId) {
    const targetTab = findPreferredActiveTabInWorkspace(workspaceId);
    if (!targetTab || !hasTabsApi()) return;
    if (targetTab.active) return;
    if (setActiveTabLocal(targetTab.id, targetTab.windowId)) {
      patchRenderedActiveRows();
      ensureActiveTabVisible(true);
    }
    try {
      await chrome.tabs.update(targetTab.id, { active: true });
    } catch {}
  }

  function syncCustomWorkspaceAssignments(tabs) {
    ensureCustomWorkspacesInitialized();
    const list = Array.isArray(tabs) ? tabs : [];
    const defaultWsId = state.customWorkspaces[0].id;
    const currentWsId = state.currentCustomWorkspaceId || defaultWsId;
    let changed = false;
    const liveNodeIds = new Set();
    const seenWorkspaceIds = new Set(state.customWorkspaces.map((ws) => ws.id));

    list.forEach((tab) => {
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (!nodeId) return;
      liveNodeIds.add(nodeId);
      const existing = normalizeCustomWorkspaceId(state.tabWorkspaceByNodeId.get(nodeId));
      if (existing && state.customWorkspaces.some((ws) => ws.id === existing)) return;

      let nextWorkspaceId = null;
      if (tab.openerTabId != null) {
        const openerNodeId = state.nodeIdByTabId.get(tab.openerTabId);
        const openerWs = openerNodeId ? normalizeCustomWorkspaceId(state.tabWorkspaceByNodeId.get(openerNodeId)) : null;
        if (openerWs && state.customWorkspaces.some((ws) => ws.id === openerWs)) {
          nextWorkspaceId = openerWs;
        }
      }
      if (!nextWorkspaceId) {
        nextWorkspaceId = tab.active ? currentWsId : defaultWsId;
      }
      state.tabWorkspaceByNodeId.set(nodeId, nextWorkspaceId);
      changed = true;
    });

    list.forEach((tab) => {
      if (!tab || !tab.active) return;
      if (rememberLastActiveTabForWorkspace(tab)) changed = true;
    });

    for (const nodeId of [...state.tabWorkspaceByNodeId.keys()]) {
      if (!liveNodeIds.has(nodeId)) {
        state.tabWorkspaceByNodeId.delete(nodeId);
        changed = true;
      }
    }

    for (const [workspaceId, nodeId] of [...state.workspaceLastActiveNodeById.entries()]) {
      if (!seenWorkspaceIds.has(workspaceId) || !liveNodeIds.has(nodeId)) {
        state.workspaceLastActiveNodeById.delete(workspaceId);
        changed = true;
      }
    }
    if (changed) saveCustomWorkspaceState();
    return changed;
  }

  function setWorkspaceIconSelection(icon) {
    if (!ui.workspaceIconTrigger) return;
    const value = String(icon || "💼").trim() || "💼";
    ui.workspaceIconTrigger.dataset.icon = value;
    ui.workspaceIconTrigger.textContent = value;
    if (ui.workspaceIconDropdown) {
      ui.workspaceIconDropdown.querySelectorAll(".zvt-icon-option").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.icon === value);
      });
    }
  }

  function closeWorkspaceIconDropdown() {
    if (!ui.workspaceIconDropdown) return;
    ui.workspaceIconDropdown.classList.remove("open");
  }

  function toggleWorkspaceIconDropdown() {
    if (!ui.workspaceIconDropdown) return;
    ui.workspaceIconDropdown.classList.toggle("open");
  }

  function renderWorkspaceIconDropdown() {
    if (!ui.workspaceIconDropdown) return;
    const selected = (ui.workspaceIconTrigger && ui.workspaceIconTrigger.dataset.icon) || "💼";
    ui.workspaceIconDropdown.innerHTML = "";
    getWorkspaceIconChoices().forEach((icon) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zvt-icon-option";
      btn.dataset.icon = icon;
      btn.textContent = icon;
      if (icon === selected) btn.classList.add("active");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setWorkspaceIconSelection(icon);
        closeWorkspaceIconDropdown();
      });
      ui.workspaceIconDropdown.appendChild(btn);
    });
  }

  function openWorkspaceEditor(mode, workspace = null) {
    if (!ui.workspaceEditor || !ui.workspaceNameInput || !ui.workspaceIconTrigger || !ui.workspaceIconDropdown) return;
    ensureCustomWorkspacesInitialized();
    const icons = getWorkspaceIconChoices();
    const isEdit = mode === "edit";
    ui.workspaceEditor.dataset.mode = mode === "edit" ? "edit" : "add";
    ui.workspaceEditor.dataset.workspaceId = workspace && workspace.id ? workspace.id : "";
    const name = workspace && workspace.name ? workspace.name : `Workspace ${state.customWorkspaces.length + 1}`;
    const icon = workspace && workspace.icon ? workspace.icon : icons[0];
    ui.workspaceNameInput.value = name;
    setWorkspaceIconSelection(icons.includes(icon) ? icon : icons[0]);
    renderWorkspaceIconDropdown();
    closeWorkspaceIconDropdown();
    if (ui.workspaceDeleteBtn) {
      const canDelete = isEdit && state.customWorkspaces.length > 1;
      ui.workspaceDeleteBtn.hidden = !canDelete;
      ui.workspaceDeleteBtn.disabled = !canDelete;
      ui.workspaceDeleteBtn.title = canDelete ? "Delete workspace" : "At least one workspace must remain";
    }
    ui.workspaceEditor.classList.add("open");
    ui.workspaceNameInput.focus();
    ui.workspaceNameInput.select();
  }

  function closeWorkspaceEditor() {
    if (!ui.workspaceEditor) return;
    closeWorkspaceIconDropdown();
    closeWorkspaceDeleteModal();
    ui.workspaceEditor.classList.remove("open");
    ui.workspaceEditor.dataset.mode = "";
    ui.workspaceEditor.dataset.workspaceId = "";
    if (ui.workspaceDeleteBtn) {
      ui.workspaceDeleteBtn.hidden = true;
      ui.workspaceDeleteBtn.disabled = false;
      ui.workspaceDeleteBtn.title = "Delete workspace";
    }
  }

  function submitWorkspaceEditor() {
    if (!ui.workspaceEditor || !ui.workspaceNameInput || !ui.workspaceIconTrigger) return;
    ensureCustomWorkspacesInitialized();
    const mode = ui.workspaceEditor.dataset.mode || "add";
    const workspaceId = normalizeCustomWorkspaceId(ui.workspaceEditor.dataset.workspaceId);
    const name = String(ui.workspaceNameInput.value || "").trim();
    const icon = String(ui.workspaceIconTrigger.dataset.icon || "💼").trim() || "💼";
    if (!name) return;

    if (mode === "edit" && workspaceId) {
      const target = state.customWorkspaces.find((ws) => ws.id === workspaceId);
      if (!target) return;
      target.name = name;
      target.icon = icon;
      saveCustomWorkspaceState();
      renderWorkspaceSelector();
      renderTabs();
      closeWorkspaceEditor();
      return;
    }

    const id = `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    state.customWorkspaces.push({ id, name, icon });
    closeWorkspaceEditor();
    setActiveCustomWorkspace(id, true);
  }

  function setActiveCustomWorkspace(workspaceId, persist = true) {
    const wsId = normalizeCustomWorkspaceId(workspaceId);
    if (!wsId) return;
    ensureCustomWorkspacesInitialized();
    if (!state.customWorkspaces.some((ws) => ws.id === wsId)) return;
    state.currentCustomWorkspaceId = wsId;
    if (persist) saveCustomWorkspaceState();
    pruneSelectionToLiveTabs();
    renderWorkspaceSelector();
    renderTabs();
    void activatePreferredWorkspaceTab(wsId);
  }

  async function deleteCustomWorkspace(workspaceId) {
    return deleteCustomWorkspaceWithMode(workspaceId, { mode: "move" });
  }

  async function deleteCustomWorkspaceWithMode(workspaceId, options = {}) {
    const wsId = normalizeCustomWorkspaceId(workspaceId);
    if (!wsId) return false;
    ensureCustomWorkspacesInitialized();
    const index = state.customWorkspaces.findIndex((ws) => ws.id === wsId);
    if (index < 0) return false;
    if (state.customWorkspaces.length <= 1) return false;
    const mode = options && options.mode === "delete" ? "delete" : "move";
    const targetWorkspaceId = normalizeCustomWorkspaceId(options && options.targetWorkspaceId);

    const fallback =
      state.customWorkspaces[index > 0 ? index - 1 : index + 1] ||
      state.customWorkspaces.find((ws) => ws.id !== wsId);
    const fallbackId = mode === "move" ? targetWorkspaceId || normalizeCustomWorkspaceId(fallback && fallback.id) : normalizeCustomWorkspaceId(fallback && fallback.id);
    if (!fallbackId) return false;

    const affectedTabIds = [];
    state.tabs.forEach((tab) => {
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (!nodeId) return;
      if (normalizeCustomWorkspaceId(state.tabWorkspaceByNodeId.get(nodeId)) !== wsId) return;
      affectedTabIds.push(tab.id);
      if (mode === "move") {
        state.tabWorkspaceByNodeId.set(nodeId, fallbackId);
      } else {
        state.tabWorkspaceByNodeId.delete(nodeId);
      }
    });

    if (mode === "delete" && affectedTabIds.length && hasTabsApi()) {
      try {
        await chrome.tabs.remove(affectedTabIds);
      } catch {
        for (const tabId of affectedTabIds) {
          try {
            await chrome.tabs.remove(tabId);
          } catch {}
        }
      }
    }

    state.workspaceLastActiveNodeById.delete(wsId);
    state.customWorkspaces.splice(index, 1);
    if (normalizeCustomWorkspaceId(state.currentCustomWorkspaceId) === wsId) {
      state.currentCustomWorkspaceId = fallbackId;
    }

    saveCustomWorkspaceState();
    pruneSelectionToLiveTabs();
    renderWorkspaceSelector();
    renderTabs();
    await activatePreferredWorkspaceTab(state.currentCustomWorkspaceId);
    return true;
  }

  function openWorkspaceDeleteModal(workspace) {
    if (!workspace || !ui.workspaceDeleteModal || !ui.workspaceDeleteTitle) return;
    ensureCustomWorkspacesInitialized();
    ui.workspaceDeleteModal.dataset.workspaceId = workspace.id;
    ui.workspaceDeleteTitle.textContent = `What should happen to tabs in "${workspace.name}"?`;
    renderWorkspaceDeleteTargetMenu(workspace.id);
    closeWorkspaceDeleteTargetMenu();
    ui.workspaceDeleteModal.classList.add("open");
    if (ui.workspaceDeleteTargetTrigger) ui.workspaceDeleteTargetTrigger.focus();
  }

  function closeWorkspaceDeleteModal() {
    if (!ui.workspaceDeleteModal) return;
    closeWorkspaceDeleteTargetMenu();
    ui.workspaceDeleteModal.classList.remove("open");
    ui.workspaceDeleteModal.dataset.workspaceId = "";
    if (ui.workspaceDeleteTargetMenu) ui.workspaceDeleteTargetMenu.innerHTML = "";
    if (ui.workspaceDeleteTargetTrigger) {
      ui.workspaceDeleteTargetTrigger.textContent = "";
      delete ui.workspaceDeleteTargetTrigger.dataset.workspaceId;
    }
    if (ui.workspaceDeleteTitle) ui.workspaceDeleteTitle.textContent = "";
  }

  async function confirmWorkspaceDeletion(mode) {
    if (!ui.workspaceDeleteModal) return;
    const workspaceId = normalizeCustomWorkspaceId(ui.workspaceDeleteModal.dataset.workspaceId);
    if (!workspaceId) return;
    const targetWorkspaceId =
      mode === "move" && ui.workspaceDeleteTargetTrigger
        ? normalizeCustomWorkspaceId(ui.workspaceDeleteTargetTrigger.dataset.workspaceId)
        : null;
    if (mode === "move" && !targetWorkspaceId) return;
    closeWorkspaceDeleteModal();
    closeWorkspaceEditor();
    await deleteCustomWorkspaceWithMode(workspaceId, { mode, targetWorkspaceId });
  }

  async function deleteWorkspaceFromEditor() {
    if (!ui.workspaceEditor) return;
    const mode = ui.workspaceEditor.dataset.mode || "";
    const workspaceId = normalizeCustomWorkspaceId(ui.workspaceEditor.dataset.workspaceId);
    if (mode !== "edit" || !workspaceId) return;
    const target = state.customWorkspaces.find((ws) => ws.id === workspaceId);
    if (!target) return;
    if (state.customWorkspaces.length <= 1) return;
    openWorkspaceDeleteModal(target);
  }

  function cycleCustomWorkspace(direction) {
    ensureCustomWorkspacesInitialized();
    const list = state.customWorkspaces;
    if (!Array.isArray(list) || list.length < 2) return;
    const currentId = normalizeCustomWorkspaceId(state.currentCustomWorkspaceId) || list[0].id;
    const currentIdx = Math.max(0, list.findIndex((ws) => ws.id === currentId));
    const delta = direction > 0 ? 1 : -1;
    const nextIdx = (currentIdx + delta + list.length) % list.length;
    const next = list[nextIdx];
    if (!next || next.id === currentId) return;
    setActiveCustomWorkspace(next.id, true);
  }

  function closeWorkspaceDropdown() {
    if (!ui.workspaceDropdown) return;
    ui.workspaceDropdown.classList.remove("open");
  }

  function toggleWorkspaceDropdown() {
    if (!ui.workspaceDropdown) return;
    ui.workspaceDropdown.classList.toggle("open");
  }

  function closeWorkspaceDeleteTargetMenu() {
    if (!ui.workspaceDeleteTargetMenu) return;
    ui.workspaceDeleteTargetMenu.classList.remove("open");
  }

  function toggleWorkspaceDeleteTargetMenu() {
    if (!ui.workspaceDeleteTargetMenu) return;
    ui.workspaceDeleteTargetMenu.classList.toggle("open");
  }

  function setWorkspaceDeleteTargetSelection(workspace) {
    if (!ui.workspaceDeleteTargetTrigger || !workspace) return;
    ui.workspaceDeleteTargetTrigger.dataset.workspaceId = String(workspace.id);
    ui.workspaceDeleteTargetTrigger.textContent = `${workspace.icon} ${workspace.name}`;
    if (ui.workspaceDeleteTargetMenu) {
      ui.workspaceDeleteTargetMenu.querySelectorAll(".zvt-workspace-option").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.workspaceId === String(workspace.id));
      });
    }
  }

  function renderWorkspaceDeleteTargetMenu(excludeWorkspaceId) {
    if (!ui.workspaceDeleteTargetMenu) return;
    const excludedId = normalizeCustomWorkspaceId(excludeWorkspaceId);
    ui.workspaceDeleteTargetMenu.innerHTML = "";
    const options = state.customWorkspaces.filter((ws) => ws.id !== excludedId);
    options.forEach((ws) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zvt-workspace-option";
      btn.dataset.workspaceId = ws.id;
      btn.textContent = `${ws.icon} ${ws.name}`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setWorkspaceDeleteTargetSelection(ws);
        closeWorkspaceDeleteTargetMenu();
      });
      ui.workspaceDeleteTargetMenu.appendChild(btn);
    });
    if (options.length) setWorkspaceDeleteTargetSelection(options[0]);
  }

  function renderWorkspaceSelector() {
    ensureCustomWorkspacesInitialized();
    if (!ui.workspaceTrigger || !ui.workspaceDropdown) return;
    const current = normalizeCustomWorkspaceId(state.currentCustomWorkspaceId) || state.customWorkspaces[0].id;
    const active = state.customWorkspaces.find((ws) => ws.id === current) || state.customWorkspaces[0];
    ui.workspaceTrigger.textContent = `${active.icon} ${active.name}`;
    const prevOpen = ui.workspaceDropdown.classList.contains("open");
    ui.workspaceDropdown.innerHTML = "";
    state.customWorkspaces.forEach((ws) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `zvt-workspace-option ${ws.id === current ? "active" : ""}`;
      btn.dataset.workspaceId = ws.id;
      btn.textContent = `${ws.icon} ${ws.name}`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveCustomWorkspace(ws.id, true);
        closeWorkspaceDropdown();
      });
      ui.workspaceDropdown.appendChild(btn);
    });
    if (prevOpen) ui.workspaceDropdown.classList.add("open");
  }

  function addCustomWorkspace() {
    ensureCustomWorkspacesInitialized();
    openWorkspaceEditor("add", null);
  }

  function editActiveCustomWorkspace() {
    ensureCustomWorkspacesInitialized();
    const active = state.customWorkspaces.find((ws) => ws.id === state.currentCustomWorkspaceId);
    if (!active) return;
    openWorkspaceEditor("edit", active);
  }

  function updateSearchUi() {
    if (!ui.host || !ui.searchToggle) return;
    ui.host.classList.toggle("search-open", !!state.searchOpen);
    ui.searchToggle.classList.toggle("active", !!state.searchOpen);
    ui.searchToggle.setAttribute("aria-pressed", state.searchOpen ? "true" : "false");
    ui.searchToggle.title = state.searchOpen ? "Hide search" : "Show search";
    ui.searchToggle.setAttribute("aria-label", ui.searchToggle.title);
  }

  function setSearchOpen(nextOpen, focusInput = false) {
    const next = !!nextOpen;
    if (state.searchOpen === next) {
      if (next && focusInput && ui.search) {
        setTimeout(() => {
          if (!ui.search) return;
          ui.search.focus();
          ui.search.select();
        }, 40);
      }
      return;
    }

    state.searchOpen = next;
    if (!next && state.search) {
      state.search = "";
      if (ui.search) ui.search.value = "";
      renderTabs();
    }
    updateSearchUi();

    if (next && focusInput && ui.search) {
      setTimeout(() => {
        if (!ui.search || !state.searchOpen) return;
        ui.search.focus();
        ui.search.select();
      }, 170);
    }
  }

  function toggleSearchOpen() {
    setSearchOpen(!state.searchOpen, true);
  }

  function flushPendingSaves() {
    if (state.collapsedSaveTimer) {
      clearTimeout(state.collapsedSaveTimer);
      state.collapsedSaveTimer = null;
      saveCollapsedTrees();
    }
    if (state.snapshotSaveTimer) {
      clearTimeout(state.snapshotSaveTimer);
      state.snapshotSaveTimer = null;
      saveTreeSnapshot();
    }
    if (state.customTitlesSaveTimer) {
      clearTimeout(state.customTitlesSaveTimer);
      state.customTitlesSaveTimer = null;
      saveCustomTitles();
    }
  }

  function loadTreeSnapshotSetting() {
    try {
      const raw = localStorage.getItem(STORAGE_TREE_SNAPSHOT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      state.pendingTreeSnapshot = parsed;
    } catch {}
  }

  function applyPendingTreeSnapshot(tabs) {
    if (!Array.isArray(state.pendingTreeSnapshot) || !state.pendingTreeSnapshot.length) return false;
    const regularTabs = [...tabs]
      .filter((tab) => !tab.pinned)
      .sort((a, b) => a.index - b.index);
    const seen = new Map();
    const seenByUrl = new Map();
    const lookup = new Map();
    const lookupByUrl = new Map();

    regularTabs.forEach((tab) => {
      const fp = makeTabFingerprint(tab);
      const seq = (seen.get(fp) || 0) + 1;
      seen.set(fp, seq);
      lookup.set(`${fp}#${seq}`, tab.id);

      const fpUrl = makeTabUrlFingerprint(tab);
      const seqUrl = (seenByUrl.get(fpUrl) || 0) + 1;
      seenByUrl.set(fpUrl, seqUrl);
      lookupByUrl.set(`${fpUrl}#${seqUrl}`, tab.id);
    });

    const tabByNodeId = new Map();
    state.nodeIdByTabId.forEach((nodeId, tabId) => {
      tabByNodeId.set(nodeId, tabId);
    });

    const restoreNodeByTabId = new Map();
    let changed = false;
    state.pendingTreeSnapshot.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const key = `${String(item.fp || "")}#${Number(item.seq) || 0}`;
      const urlKey = `${String(item.fpUrl || "")}#${Number(item.seqUrl) || 0}`;
      const tabId = lookup.get(key) ?? lookupByUrl.get(urlKey);
      const nodeId = typeof item.nodeId === "string" ? item.nodeId : null;
      if (tabId == null || !nodeId) return;
      const ownerTabId = tabByNodeId.get(nodeId);
      if (ownerTabId != null && ownerTabId !== tabId) return;
      restoreNodeByTabId.set(tabId, nodeId);
    });

    restoreNodeByTabId.forEach((nodeId, tabId) => {
      const prevNodeId = state.nodeIdByTabId.get(tabId);
      if (prevNodeId === nodeId) return;
      if (prevNodeId) state.parentNodeByNodeId.delete(prevNodeId);
      state.nodeIdByTabId.set(tabId, nodeId);
      changed = true;
    });

    const liveNodeIds = new Set(state.nodeIdByTabId.values());
    state.pendingTreeSnapshot.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const key = `${String(item.fp || "")}#${Number(item.seq) || 0}`;
      const urlKey = `${String(item.fpUrl || "")}#${Number(item.seqUrl) || 0}`;
      const tabId = lookup.get(key) ?? lookupByUrl.get(urlKey);
      if (tabId == null) return;
      const childNodeId = state.nodeIdByTabId.get(tabId);
      const parentNodeId = typeof item.parentNodeId === "string" ? item.parentNodeId : null;
      if (!childNodeId || !parentNodeId || childNodeId === parentNodeId) return;
      if (parentNodeId !== ROOT_PARENT_NODE_ID && !liveNodeIds.has(parentNodeId)) return;
      if (state.parentNodeByNodeId.get(childNodeId) !== parentNodeId) {
        state.parentNodeByNodeId.set(childNodeId, parentNodeId);
        changed = true;
      }
    });
    state.pendingTreeSnapshot = null;
    return changed;
  }

  function loadCollapsedTreesSetting() {
    try {
      const raw = localStorage.getItem(STORAGE_TREE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const next = new Set();
      const pendingNodes = new Set();
      parsed.forEach((id) => {
        const normalized = normalizeTabId(id);
        if (normalized != null) {
          next.add(normalized);
          return;
        }
        if (typeof id === "string" && id) pendingNodes.add(id);
      });
      state.collapsedTrees = next;
      state.pendingCollapsedNodeIds = pendingNodes;
    } catch {}
  }

  function restoreCollapsedTreesFromNodeIds() {
    if (!state.pendingCollapsedNodeIds || !state.pendingCollapsedNodeIds.size) return;
    const nodeToTabId = new Map();
    state.tabs.forEach((tab) => {
      if (tab.pinned) return;
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (nodeId) nodeToTabId.set(nodeId, tab.id);
    });

    const unresolved = new Set();
    state.pendingCollapsedNodeIds.forEach((nodeId) => {
      const tabId = nodeToTabId.get(nodeId);
      if (tabId != null) {
        state.collapsedTrees.add(tabId);
      } else {
        unresolved.add(nodeId);
      }
    });
    state.pendingCollapsedNodeIds = unresolved;
  }

  async function ensureTreeMetadataForTabs(tabs) {
    if (!Array.isArray(tabs) || !tabs.length) return false;
    let changed = false;

    const liveTabIds = new Set(tabs.map((tab) => tab.id));
    for (const [tabId] of [...state.nodeIdByTabId.entries()]) {
      if (!liveTabIds.has(tabId)) {
        const removedNode = state.nodeIdByTabId.get(tabId);
        state.nodeIdByTabId.delete(tabId);
        changed = true;
        if (removedNode) {
          if (state.parentNodeByNodeId.delete(removedNode)) {
            changed = true;
          }
        }
      }
    }

    tabs.forEach((tab) => {
      if (!tab || tab.id == null) return;
      let nodeId = state.nodeIdByTabId.get(tab.id);
      if (!nodeId) {
        nodeId = generateTreeNodeId();
        changed = true;
      }
      if (state.nodeIdByTabId.get(tab.id) !== nodeId) {
        state.nodeIdByTabId.set(tab.id, nodeId);
        changed = true;
      }
    });

    tabs.forEach((tab) => {
      if (!tab || tab.id == null || tab.pinned) return;
      const childNodeId = state.nodeIdByTabId.get(tab.id);
      if (!childNodeId) return;

      // Keep already-restored links unless we have stronger source (opener).
      let parentNodeId = state.parentNodeByNodeId.get(childNodeId) || null;
      if (!parentNodeId && tab.openerTabId != null && tab.openerTabId !== tab.id) {
        parentNodeId = state.nodeIdByTabId.get(tab.openerTabId) || null;
      }
      if (!parentNodeId || parentNodeId === childNodeId) {
        if (state.parentNodeByNodeId.get(childNodeId) === childNodeId) {
          state.parentNodeByNodeId.delete(childNodeId);
          changed = true;
        }
        return;
      }
      if (state.parentNodeByNodeId.get(childNodeId) !== parentNodeId) {
        state.parentNodeByNodeId.set(childNodeId, parentNodeId);
        changed = true;
      }
    });
    return changed;
  }

  function applySidebarWidth(nextWidth, persist = true, applyPinnedNow = true) {
    state.width = clampSidebarWidth(nextWidth);
    if (ui.host) {
      ui.host.style.width = `${state.width}px`;
    }
    if (!state.autohide && applyPinnedNow) {
      if (!state.contentRoot || state.contentRoot === document.body) {
        state.contentRoot = findContentRoot();
      }
      applyPinnedLayout(true);
    }
    if (persist) {
      saveSidebarWidth();
    }
  }

  function isVisibleElement(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    return true;
  }

  function detectTopNavOffset() {
    const selectors = [
      "#header",
      ".toolbar-addressbar",
      ".bookmark-bar",
      ".toolbar-bookmark-bar",
      ".toolbar-bookmark",
      ".bookmarks-bar",
      ".mainbar",
      ".toolbar-mainbar",
      ".UrlBar",
      ".window-buttongroup"
    ];

    let offset = 0;

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!isVisibleElement(el)) return;
        if (el.id === HOST_ID || el.id === EDGE_ID || el.id === TOGGLE_BTN_ID) return;

        const rect = el.getBoundingClientRect();
        if (rect.height <= 0) return;
        if (rect.bottom <= 0) return;
        if (rect.top > window.innerHeight * 0.5) return;

        const thisOffset = Math.max(0, rect.bottom);
        offset = Math.max(offset, thisOffset);
      });
    });

    // Safe fallback when selectors are not matched in custom layouts
    if (offset === 0) {
      const fallbackHeader = document.querySelector("header");
      if (fallbackHeader && isVisibleElement(fallbackHeader)) {
        const rect = fallbackHeader.getBoundingClientRect();
        offset = Math.max(offset, rect.bottom);
      }
    }

    return Math.round(offset);
  }

  function parseStatusBarDisplayMode(raw) {
    let value = raw;
    if (value && typeof value === "object" && "value" in value) {
      value = value.value;
    }
    if (typeof value === "string") {
      const v = value.toLowerCase().trim();
      if (v === "on" || v === "off" || v === "overlay") return v;
      if (v === "0") return "on";
      if (v === "1") return "off";
      if (v === "2") return "overlay";
      return null;
    }
    if (typeof value === "number") {
      if (value === 0) return "on";
      if (value === 1) return "off";
      if (value === 2) return "overlay";
    }
    return null;
  }

  async function refreshStatusBarDisplayMode() {
    const displayPaths = ["vivaldi.status_bar.display", "status_bar.display"];
    for (const path of displayPaths) {
      const pref = await getPref(path);
      const mode = parseStatusBarDisplayMode(pref);
      if (mode) {
        state.statusBarDisplayMode = mode;
        break;
      }
    }

    const minimizedPaths = ["vivaldi.status_bar.minimized", "status_bar.minimized"];
    for (const path of minimizedPaths) {
      const pref = await getPref(path);
      const mode = parseStatusBarDisplayMode(pref);
      if (mode) {
        state.statusBarMinimizedMode = mode;
        break;
      }
    }
  }

  function detectBottomNavOffset() {
    if (
      state.statusBarDisplayMode === "overlay" ||
      state.statusBarDisplayMode === "off" ||
      state.statusBarMinimizedMode === "overlay"
    ) {
      return 0;
    }

    const selectors = [
      "#footer",
      ".toolbar-statusbar",
      ".statusbar",
      ".toolbar.toolbar-statusbar",
      ".toolbar-small.toolbar-statusbar"
    ];

    const maybeBar = document.querySelector("#footer, .toolbar-statusbar, .statusbar");
    if (maybeBar && maybeBar.classList) {
      if (maybeBar.classList.contains("overlay") || maybeBar.classList.contains("minimized")) {
        return 0;
      }
    }

    let offset = 0;
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!isVisibleElement(el)) return;
        if (el.id === HOST_ID || el.id === EDGE_ID || el.id === TOGGLE_BTN_ID) return;
        if (el.classList && (el.classList.contains("overlay") || el.classList.contains("minimized"))) return;

        const rect = el.getBoundingClientRect();
        if (rect.height <= 0) return;
        if (rect.top >= window.innerHeight) return;
        if (rect.bottom < window.innerHeight * 0.45) return;

        const thisOffset = Math.max(0, window.innerHeight - rect.top);
        offset = Math.max(offset, thisOffset);
      });
    });

    // Fallback
    if (offset === 0) {
      const fallbackFooter = document.querySelector("footer");
      if (fallbackFooter && isVisibleElement(fallbackFooter)) {
        const rect = fallbackFooter.getBoundingClientRect();
        if (rect.bottom > window.innerHeight * 0.45) {
          offset = Math.max(0, window.innerHeight - rect.top);
        }
      }
    }

    return Math.round(offset);
  }

  function applyTopOffset() {
    const topOffset = detectTopNavOffset();
    const bottomOffset = detectBottomNavOffset();
    state.topOffset = topOffset;
    state.bottomOffset = bottomOffset;
    document.documentElement.style.setProperty(CSS_TOP_OFFSET_VAR, `${topOffset}px`);
    document.documentElement.style.setProperty(CSS_BOTTOM_OFFSET_VAR, `${bottomOffset}px`);
  }

  function scheduleTopOffsetUpdate() {
    if (state.resizing) return;
    if (state.topOffsetRafQueued) return;
    state.topOffsetRafQueued = true;
    requestAnimationFrame(() => {
      state.topOffsetRafQueued = false;
      applyTopOffset();
    });
  }

  function startTopOffsetWarmup() {
    if (state.topOffsetWarmupTimer) {
      clearInterval(state.topOffsetWarmupTimer);
      state.topOffsetWarmupTimer = null;
    }

    let attempts = 0;
    const maxAttempts = 28; // ~3.3s at 120ms
    let stableHits = 0;
    let lastTopOffset = state.topOffset;
    let lastBottomOffset = state.bottomOffset;

    state.topOffsetWarmupTimer = setInterval(() => {
      attempts += 1;
      const prevTop = state.topOffset;
      const prevBottom = state.bottomOffset;
      applyTopOffset();
      const nowTop = state.topOffset;
      const nowBottom = state.bottomOffset;

      if (
        Math.abs(nowTop - prevTop) <= 0.5 &&
        Math.abs(nowTop - lastTopOffset) <= 0.5 &&
        Math.abs(nowBottom - prevBottom) <= 0.5 &&
        Math.abs(nowBottom - lastBottomOffset) <= 0.5
      ) {
        stableHits += 1;
      } else {
        stableHits = 0;
      }
      lastTopOffset = nowTop;
      lastBottomOffset = nowBottom;

      if ((nowTop > 0 && stableHits >= 4) || attempts >= maxAttempts) {
        clearInterval(state.topOffsetWarmupTimer);
        state.topOffsetWarmupTimer = null;
      }
    }, 120);
  }

  function findContentRoot() {
    const selectors = [
      "#webview-container",
      ".webpageview.active",
      ".webpage-stack",
      "#main .inner",
      ".inner"
    ];

    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const el of nodes) {
        if (!isVisibleElement(el)) continue;
        if (el.id === HOST_ID || el.id === EDGE_ID || el.id === TOGGLE_BTN_ID) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (rect.top + 2 < state.topOffset) continue;
        if (el.querySelector && el.querySelector("#header")) continue;
        if (el.querySelector && el.querySelector(".toolbar-addressbar")) continue;
        return el;
      }
    }

    // Safe fallback: if no web-content root found, do not shift global UI.
    return null;
  }

  function applyPinnedLayout(enabled) {
    const root = state.contentRoot;
    if (!root) return;

    if (enabled) {
      if (!state.contentRootStyleBackup) {
        state.contentRootStyleBackup = {
          marginLeft: root.style.marginLeft,
          paddingLeft: root.style.paddingLeft,
          left: root.style.left,
          width: root.style.width,
          maxWidth: root.style.maxWidth,
        };
      }
      root.style.marginLeft = "";
      root.style.paddingLeft = `${state.width}px`;
      root.style.left = "";
      root.style.width = "";
      root.style.maxWidth = "";
      return;
    }

    if (state.contentRootStyleBackup) {
      root.style.marginLeft = state.contentRootStyleBackup.marginLeft;
      root.style.paddingLeft = state.contentRootStyleBackup.paddingLeft;
      root.style.left = state.contentRootStyleBackup.left;
      root.style.width = state.contentRootStyleBackup.width;
      root.style.maxWidth = state.contentRootStyleBackup.maxWidth;
    } else {
      root.style.marginLeft = "";
      root.style.paddingLeft = "";
      root.style.left = "";
      root.style.width = "";
      root.style.maxWidth = "";
    }
  }

  function updateAutohideButton() {
    const btn = document.getElementById(TOGGLE_BTN_ID);
    if (!btn) return;
    const autohideIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><g transform="rotate(-28 12 12)"><path d="M12 17v4"/><path d="M8 3h8l-1 6 3 3H6l3-3-1-6z"/></g></svg>';
    const pinnedIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 17v4"/><path d="M8 3h8l-1 6 3 3H6l3-3-1-6z"/></svg>';

    btn.classList.toggle("autohide-on", state.autohide);
    btn.classList.toggle("autohide-off", !state.autohide);
    btn.innerHTML = state.autohide ? autohideIcon : pinnedIcon;
    btn.title = state.autohide ? "Autohide ON" : "Autohide OFF (Pinned)";
    btn.setAttribute("aria-label", btn.title);
  }

  function setAutohide(nextValue) {
    state.autohide = !!nextValue;
    try {
      localStorage.setItem(STORAGE_KEY, state.autohide ? "1" : "0");
    } catch {}
    setToChromeStorage({ [STORAGE_KEY]: state.autohide ? "1" : "0" });

    updateAutohideButton();

    if (state.autohide) {
      applyPinnedLayout(false);
      closeSidebar();
    } else {
      state.contentRoot = findContentRoot();
      applyPinnedLayout(true);
      openSidebar();
    }
  }

  function ensurePinnedLayoutAfterStartup() {
    if (state.autohide) return;

    let attempts = 0;
    const maxAttempts = 40; // ~2 seconds at 50ms
    const timer = setInterval(() => {
      attempts += 1;
      const nextRoot = findContentRoot();
      if (nextRoot) {
        state.contentRoot = nextRoot;
        applyPinnedLayout(true);
        clearInterval(timer);
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 50);
  }

  function loadAutohideSetting() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "0") state.autohide = false;
      if (raw === "1") state.autohide = true;
    } catch {}
  }

  async function loadPersistentSettings() {
    const stored = await getFromChromeStorage([
      STORAGE_KEY,
      STORAGE_WIDTH_KEY,
      STORAGE_TREE_KEY,
      STORAGE_TREE_SNAPSHOT_KEY,
      STORAGE_CUSTOM_TITLES_KEY,
      STORAGE_CUSTOM_WORKSPACES_KEY,
      STORAGE_TAB_WORKSPACE_MAP_KEY,
    ]);

    if (stored[STORAGE_KEY] !== undefined && stored[STORAGE_KEY] !== null) {
      const raw = String(stored[STORAGE_KEY]);
      if (raw === "0" || raw === "false") state.autohide = false;
      if (raw === "1" || raw === "true") state.autohide = true;
    }

    if (stored[STORAGE_WIDTH_KEY] !== undefined && stored[STORAGE_WIDTH_KEY] !== null) {
      state.width = clampSidebarWidth(stored[STORAGE_WIDTH_KEY]);
    }

    if (stored[STORAGE_TREE_KEY] !== undefined && stored[STORAGE_TREE_KEY] !== null) {
      const parsed = Array.isArray(stored[STORAGE_TREE_KEY]) ? stored[STORAGE_TREE_KEY] : [];
      const next = new Set();
      const pendingNodes = new Set();
      parsed.forEach((id) => {
        const normalized = normalizeTabId(id);
        if (normalized != null) {
          next.add(normalized);
          return;
        }
        if (typeof id === "string" && id) pendingNodes.add(id);
      });
      state.collapsedTrees = next;
      state.pendingCollapsedNodeIds = pendingNodes;
    }

    if (stored[STORAGE_TREE_SNAPSHOT_KEY] !== undefined && stored[STORAGE_TREE_SNAPSHOT_KEY] !== null) {
      const parsed = Array.isArray(stored[STORAGE_TREE_SNAPSHOT_KEY]) ? stored[STORAGE_TREE_SNAPSHOT_KEY] : [];
      state.pendingTreeSnapshot = parsed;
    }

    if (stored[STORAGE_CUSTOM_TITLES_KEY] !== undefined && stored[STORAGE_CUSTOM_TITLES_KEY] !== null) {
      const parsed = stored[STORAGE_CUSTOM_TITLES_KEY];
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const next = new Map();
        Object.entries(parsed).forEach(([nodeId, value]) => {
          const text = String(value || "").trim();
          if (nodeId && text) next.set(nodeId, text);
        });
        state.customTitlesByNodeId = next;
      }
    }

    if (stored[STORAGE_CUSTOM_WORKSPACES_KEY] !== undefined && stored[STORAGE_CUSTOM_WORKSPACES_KEY] !== null) {
      const parsed = stored[STORAGE_CUSTOM_WORKSPACES_KEY];
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        if (Array.isArray(parsed.workspaces)) state.customWorkspaces = parsed.workspaces;
        if (parsed.currentWorkspaceId != null) state.currentCustomWorkspaceId = String(parsed.currentWorkspaceId);
        if (parsed.lastActiveNodeByWorkspace && typeof parsed.lastActiveNodeByWorkspace === "object") {
          const next = new Map();
          Object.entries(parsed.lastActiveNodeByWorkspace).forEach(([workspaceId, nodeId]) => {
            const wsId = normalizeCustomWorkspaceId(workspaceId);
            const nid = nodeId == null ? null : String(nodeId).trim();
            if (wsId && nid) next.set(wsId, nid);
          });
          state.workspaceLastActiveNodeById = next;
        }
      }
    }

    if (stored[STORAGE_TAB_WORKSPACE_MAP_KEY] !== undefined && stored[STORAGE_TAB_WORKSPACE_MAP_KEY] !== null) {
      const parsed = stored[STORAGE_TAB_WORKSPACE_MAP_KEY];
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const map = new Map();
        Object.entries(parsed).forEach(([nodeId, workspaceId]) => {
          const wsId = normalizeCustomWorkspaceId(workspaceId);
          if (nodeId && wsId) map.set(nodeId, wsId);
        });
        state.tabWorkspaceByNodeId = map;
      }
    }

    ensureCustomWorkspacesInitialized();
    renderWorkspaceSelector();

    state.persistenceReady = true;
  }

  function getDisplayTitle(tab) {
    const custom = getCustomTitleForTab(tab && tab.id);
    if (custom) return custom;
    const url = (tab && (tab.url || tab.pendingUrl)) || "";
    const kind = getInternalPageKind(url);
    if (kind === "startpage") return "Start Page";
    if (kind === "settings") return "Settings";
    if (kind === "extensions") return "Extensions";
    if (kind === "history") return "History";
    if (kind === "downloads") return "Downloads";
    if (kind === "bookmarks") return "Bookmarks";
    return (tab && tab.title) || url || "New Tab";
  }

  function getTabHoverTooltip(tab) {
    const title = getDisplayTitle(tab);
    const url = String((tab && (tab.url || tab.pendingUrl)) || "").trim();
    if (!url) return title || "New Tab";
    if (!title) return url;
    if (title === url) return title;
    return `${title}\n${url}`;
  }

  function getFallbackIcon() {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23889" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>';
    return `data:image/svg+xml,${svg}`;
  }

  function getDomainFaviconUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
    } catch {
      return null;
    }
  }

  function getInternalPageIcon(kind) {
    const map = {
      startpage: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23889" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>',
      settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23889" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
      extensions: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23889" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.7 3.7z"/></svg>',
      history: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23889" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
      downloads: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23889" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
      bookmarks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23889" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
    };

    if (!kind || !map[kind]) return null;
    return `data:image/svg+xml,${map[kind]}`;
  }

  function getTabIcon(tab) {
    const liveUrl = (tab && (tab.url || tab.pendingUrl)) || "";
    const kind = getInternalPageKind(liveUrl);
    const internalIcon = getInternalPageIcon(kind);
    if (internalIcon) return internalIcon;
    return (tab && tab.favIconUrl) || getDomainFaviconUrl(liveUrl) || getFallbackIcon();
  }

  function getWorkspaceIdentityForTree(tab) {
    return getCustomWorkspaceIdForTab(tab);
  }

  function getWorkspaceScopedTabs(tabs, workspaceOverrideId = null) {
    const source = Array.isArray(tabs) ? tabs : [];
    const targetWsId = normalizeCustomWorkspaceId(workspaceOverrideId) || normalizeCustomWorkspaceId(state.currentCustomWorkspaceId);
    if (!targetWsId) return source;
    return source.filter((tab) => getCustomWorkspaceIdForTab(tab) === targetWsId);
  }

  function getFilteredTabs() {
    const q = state.search.trim().toLowerCase();
    const scopedTabs = getWorkspaceScopedTabs(state.tabs);
    if (!q) return scopedTabs;
    return scopedTabs.filter((tab) => {
      const title = (getDisplayTitle(tab) || "").toLowerCase();
      const url = (tab.url || "").toLowerCase();
      return title.includes(q) || url.includes(q);
    });
  }

  function getTabRank(tab) {
    if (!tab || tab.id == null) return 0;
    if (state.tabBirthRank.has(tab.id)) return state.tabBirthRank.get(tab.id);
    const numericId = Number(tab.id);
    const rank = Number.isFinite(numericId) ? numericId : Date.now();
    state.tabBirthRank.set(tab.id, rank);
    return rank;
  }

  function cleanupCollapsedTrees() {
    const unpinnedIds = new Set(state.tabs.filter((tab) => !tab.pinned).map((tab) => tab.id));
    const nodeToTabId = new Map();
    state.tabs.forEach((tab) => {
      if (tab.pinned) return;
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (nodeId) nodeToTabId.set(nodeId, tab.id);
    });
    const parentsWithChildren = new Set();

    state.tabs.forEach((tab) => {
      if (tab.pinned) return;
      const childNodeId = state.nodeIdByTabId.get(tab.id);
      const parentNodeId = childNodeId ? state.parentNodeByNodeId.get(childNodeId) : null;
      let parentId = null;
      if (parentNodeId === ROOT_PARENT_NODE_ID) {
        parentId = null;
      } else if (parentNodeId && nodeToTabId.has(parentNodeId)) {
        parentId = nodeToTabId.get(parentNodeId);
      } else if (tab.openerTabId != null && tab.openerTabId !== tab.id) {
        parentId = tab.openerTabId;
      }
      if (parentId != null && parentId !== tab.id && unpinnedIds.has(parentId)) {
        parentsWithChildren.add(parentId);
      }
    });

    let changed = false;
    for (const tabId of [...state.collapsedTrees]) {
      if (!unpinnedIds.has(tabId) || !parentsWithChildren.has(tabId)) {
        state.collapsedTrees.delete(tabId);
        changed = true;
      }
    }
    if (changed) requestCollapsedTreesSave(250);
  }

  function cleanupParentLinks() {
    const liveNodeIds = new Set();
    state.tabs.forEach((tab) => {
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (nodeId) liveNodeIds.add(nodeId);
    });
    let changed = false;
    for (const [childNodeId, parentNodeId] of [...state.parentNodeByNodeId.entries()]) {
      if (
        !liveNodeIds.has(childNodeId) ||
        (parentNodeId !== ROOT_PARENT_NODE_ID && !liveNodeIds.has(parentNodeId)) ||
        childNodeId === parentNodeId
      ) {
        state.parentNodeByNodeId.delete(childNodeId);
        changed = true;
      }
    }
    return changed;
  }

  function rebuildTreeLookupCaches() {
    const tabById = new Map();
    const nodeToTabId = new Map();
    const parentTabByTabId = new Map();
    const childrenByParentTabId = new Map();

    state.tabs.forEach((tab) => {
      if (!tab || tab.id == null) return;
      tabById.set(tab.id, tab);
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (nodeId) nodeToTabId.set(nodeId, tab.id);
    });

    const ensureChildrenList = (tabId) => {
      if (!childrenByParentTabId.has(tabId)) childrenByParentTabId.set(tabId, []);
      return childrenByParentTabId.get(tabId);
    };

    state.tabs.forEach((tab) => {
      if (!tab || tab.id == null || tab.pinned) return;

      const childNodeId = state.nodeIdByTabId.get(tab.id);
      const parentNodeId = childNodeId ? state.parentNodeByNodeId.get(childNodeId) : null;
      let parentId = null;

      if (parentNodeId === ROOT_PARENT_NODE_ID) {
        parentId = null;
      } else if (parentNodeId && nodeToTabId.has(parentNodeId)) {
        parentId = nodeToTabId.get(parentNodeId);
      } else if (
        parentNodeId == null &&
        tab.openerTabId != null &&
        tab.openerTabId !== tab.id &&
        tabById.has(tab.openerTabId)
      ) {
        const openerTab = tabById.get(tab.openerTabId);
        if (openerTab && !openerTab.pinned && getWorkspaceIdentityForTree(openerTab) === getWorkspaceIdentityForTree(tab)) {
          parentId = tab.openerTabId;
        }
      }

      if (parentId == null || parentId === tab.id || !tabById.has(parentId)) return;
      parentTabByTabId.set(tab.id, parentId);
      ensureChildrenList(parentId).push(tab.id);
    });

    state.tabById = tabById;
    state.nodeToTabId = nodeToTabId;
    state.parentTabByTabId = parentTabByTabId;
    state.childrenByParentTabId = childrenByParentTabId;
  }

  function ensureTreeLookupCaches() {
    if (state.tabById.size !== state.tabs.length) {
      rebuildTreeLookupCaches();
    }
  }

  function getParentTabIdForTree(tabId) {
    ensureTreeLookupCaches();
    const tab = state.tabById.get(tabId);
    if (!tab || tab.pinned) return null;
    return state.parentTabByTabId.get(tabId) ?? null;
  }

  function isDescendantTab(descendantTabId, ancestorTabId) {
    ensureTreeLookupCaches();
    if (descendantTabId == null || ancestorTabId == null || descendantTabId === ancestorTabId) return false;
    const visited = new Set();
    let current = descendantTabId;

    while (current != null && !visited.has(current)) {
      visited.add(current);
      const parent = state.parentTabByTabId.get(current) ?? null;
      if (parent == null) return false;
      if (parent === ancestorTabId) return true;
      current = parent;
    }
    return false;
  }

  function getTreeOrderedTabs(tabs) {
    if (!Array.isArray(tabs) || !tabs.length) {
      return {
        ordered: [],
        levels: new Map(),
        hasChildren: new Map(),
        descendantCounts: new Map(),
        collapsed: new Map(),
      };
    }

    const sorted = [...tabs].sort((a, b) => a.index - b.index);
    const byId = new Map(sorted.map((tab) => [tab.id, tab]));
    const nodeToTabId = new Map();
    const childrenByParent = new Map();
    const roots = [];

    sorted.forEach((tab) => {
      childrenByParent.set(tab.id, []);
      getTabRank(tab);
      const nodeId = state.nodeIdByTabId.get(tab.id);
      if (nodeId) nodeToTabId.set(nodeId, tab.id);
    });

    sorted.forEach((tab) => {
      const childNodeId = state.nodeIdByTabId.get(tab.id);
      const parentNodeId = childNodeId ? state.parentNodeByNodeId.get(childNodeId) : null;
      let parentId = null;
      if (parentNodeId === ROOT_PARENT_NODE_ID) {
        parentId = null;
      } else if (parentNodeId && nodeToTabId.has(parentNodeId)) {
        parentId = nodeToTabId.get(parentNodeId);
      }
      if (parentId == null && parentNodeId == null) {
        parentId = tab.openerTabId;
      }
      if (parentId != null && parentId !== tab.id && byId.has(parentId)) {
        const children = childrenByParent.get(parentId);
        if (children) {
          children.push(tab);
          return;
        }
      }
      roots.push(tab);
    });

    // Keep real tab order for siblings (tab.index), so DnD reordering
    // inside the same tree branch is reflected immediately and persists.
    childrenByParent.forEach((children) => {
      children.sort((a, b) => {
        const indexDiff = a.index - b.index;
        if (indexDiff !== 0) return indexDiff;
        const rankDiff = getTabRank(a) - getTabRank(b);
        if (rankDiff !== 0) return rankDiff;
        return a.id - b.id;
      });
    });

    const ordered = [];
    const levels = new Map();
    const hasChildren = new Map();
    const descendantCounts = new Map();
    const collapsed = new Map();
    const visited = new Set();
    const suppressedByCollapse = new Set();
    const countMemo = new Map();

    const countDescendants = (tabId, trail = new Set()) => {
      if (countMemo.has(tabId)) return countMemo.get(tabId);
      if (trail.has(tabId)) return 0;
      trail.add(tabId);

      let total = 0;
      const children = childrenByParent.get(tabId) || [];
      children.forEach((child) => {
        total += 1 + countDescendants(child.id, trail);
      });

      trail.delete(tabId);
      countMemo.set(tabId, total);
      return total;
    };

    sorted.forEach((tab) => {
      const children = childrenByParent.get(tab.id) || [];
      hasChildren.set(tab.id, children.length > 0);
      descendantCounts.set(tab.id, countDescendants(tab.id));
      collapsed.set(tab.id, state.collapsedTrees.has(tab.id));
    });

    const suppressDescendants = (tabId) => {
      const children = childrenByParent.get(tabId) || [];
      children.forEach((child) => {
        if (suppressedByCollapse.has(child.id)) return;
        suppressedByCollapse.add(child.id);
        suppressDescendants(child.id);
      });
    };

    const walk = (tab, level) => {
      if (!tab || visited.has(tab.id)) return;
      visited.add(tab.id);
      levels.set(tab.id, level);
      ordered.push(tab);
      if (state.collapsedTrees.has(tab.id)) {
        suppressDescendants(tab.id);
        return;
      }
      const children = childrenByParent.get(tab.id) || [];
      children.forEach((child) => walk(child, level + 1));
    };

    roots.forEach((root) => walk(root, 0));

    // Guard against malformed opener chains/cycles.
    sorted.forEach((tab) => {
      if (!visited.has(tab.id) && !suppressedByCollapse.has(tab.id)) walk(tab, 0);
    });

    return { ordered, levels, hasChildren, descendantCounts, collapsed };
  }

  function buildTreeRenderCacheFromTabs(tabs) {
    const safeTabs = Array.isArray(tabs) ? tabs : [];
    const pinnedTabs = safeTabs.filter((tab) => tab.pinned).sort((a, b) => a.index - b.index);
    const regularTabsRaw = safeTabs.filter((tab) => !tab.pinned);
    const tree = getTreeOrderedTabs(regularTabsRaw);
    return {
      sourceTabs: tabs,
      pinnedTabs,
      regularTabs: tree.ordered,
      levels: tree.levels,
      hasChildren: tree.hasChildren,
      descendantCounts: tree.descendantCounts,
      collapsed: tree.collapsed,
    };
  }

  async function fetchTabs() {
    if (state.fetchInFlight) {
      state.fetchQueued = true;
      return;
    }
    const now = Date.now();
    const elapsed = now - state.lastFetchAt;
    if (elapsed < FETCH_MIN_INTERVAL_MS) {
      state.fetchQueued = true;
      if (!state.fetchCooldownTimer) {
        state.fetchCooldownTimer = setTimeout(() => {
          state.fetchCooldownTimer = null;
          fetchTabs();
        }, FETCH_MIN_INTERVAL_MS - elapsed);
      }
      return;
    }
    state.fetchInFlight = true;
    if (!hasTabsApi()) {
      showStatus("No tabs API in this context.");
      state.fetchInFlight = false;
      return;
    }

    try {
      do {
        state.fetchQueued = false;
        state.lastFetchAt = Date.now();
        const win = await chrome.windows.getCurrent({ populate: false });
        const tabs = await chrome.tabs.query({ windowId: win.id });
        state.tabs = tabs.sort((a, b) => a.index - b.index);
        rebuildTabIndexCache();
        pruneSelectionToLiveTabs();
        const liveIds = new Set(state.tabs.map((t) => t.id));
        for (const id of [...state.tabBirthRank.keys()]) {
          if (!liveIds.has(id)) state.tabBirthRank.delete(id);
        }
        state.tabs.forEach((tab) => {
          if (!state.tabBirthRank.has(tab.id)) {
            void getTabRank(tab);
          }
        });

        let treeChanged = false;
        treeChanged = applyPendingTreeSnapshot(state.tabs) || treeChanged;
        if (state.treeDirty || state.nodeIdByTabId.size !== state.tabs.length) {
          treeChanged = (await ensureTreeMetadataForTabs(state.tabs)) || treeChanged;
        }
        restoreCollapsedTreesFromNodeIds();
        treeChanged = cleanupParentLinks() || treeChanged;
        cleanupCollapsedTrees();
        syncCustomWorkspaceAssignments(state.tabs);
        rebuildTreeLookupCaches();
        renderWorkspaceSelector();
        pruneSelectionToLiveTabs();
        if (treeChanged || state.treeDirty) {
          requestTreeSnapshotSave(350);
          state.treeDirty = false;
        }
        if (!state.autohide || state.open) {
          state.treeRenderCache = buildTreeRenderCacheFromTabs(state.tabs);
          scheduleRender(0);
        } else {
          state.treeRenderCache = null;
        }
        hideStatus();
      } while (state.fetchQueued);
    } catch (err) {
      showStatus(`Failed to load tabs: ${err && err.message ? err.message : "unknown error"}`);
    } finally {
      state.fetchInFlight = false;
    }
  }

  function hideTabContextMenu() {
    if (state.contextMenuEl) {
      state.contextMenuEl.remove();
      state.contextMenuEl = null;
    }
  }

  function getTabById(tabId) {
    const fromMap = state.tabById.get(tabId);
    if (fromMap) return fromMap;
    const fromList = state.tabs.find((tab) => tab.id === tabId) || null;
    if (fromList) state.tabById.set(tabId, fromList);
    return fromList;
  }

  function rebuildTabIndexCache() {
    const indexMap = new Map();
    let activeId = null;
    state.tabs.forEach((tab, idx) => {
      indexMap.set(tab.id, idx);
      if (tab.active) activeId = tab.id;
    });
    state.tabIndexById = indexMap;
    state.activeTabId = activeId;
  }

  function setTabExplicitRoot(tabId) {
    const nodeId = state.nodeIdByTabId.get(tabId);
    if (!nodeId) return;
    state.parentNodeByNodeId.set(nodeId, ROOT_PARENT_NODE_ID);
  }

  function getVisibleTabOrderFromDom() {
    return [...state.visibleRegularOrder];
  }

  function applySelectionToRenderedRows() {
    const showMultiSelected = state.selectedTabIds.size > 1;
    state.renderedRowByTabId.forEach((row, tabId) => {
      const selected = showMultiSelected && state.selectedTabIds.has(tabId);
      row.classList.toggle("selected", !!selected);
    });
  }

  function pruneSelectionToLiveTabs() {
    const liveIds = new Set(getWorkspaceScopedTabs(state.tabs).map((tab) => tab.id));
    const next = new Set();
    state.selectedTabIds.forEach((tabId) => {
      if (liveIds.has(tabId)) next.add(tabId);
    });
    state.selectedTabIds = next;
    if (state.selectionAnchorTabId != null && !liveIds.has(state.selectionAnchorTabId)) {
      state.selectionAnchorTabId = null;
    }
    applySelectionToRenderedRows();
  }

  function setSelectedTabs(nextSet, anchorTabId = null) {
    const liveIds = new Set(state.tabs.map((tab) => tab.id));
    const normalized = new Set();
    nextSet.forEach((tabId) => {
      if (liveIds.has(tabId)) normalized.add(tabId);
    });
    state.selectedTabIds = normalized;
    if (anchorTabId != null && liveIds.has(anchorTabId)) {
      state.selectionAnchorTabId = anchorTabId;
    } else if (state.selectionAnchorTabId != null && !liveIds.has(state.selectionAnchorTabId)) {
      state.selectionAnchorTabId = null;
    }
    applySelectionToRenderedRows();
  }

  function toggleSelectedTab(tabId) {
    if (tabId == null || !getTabById(tabId)) return;
    const next = new Set(state.selectedTabIds);
    if (next.has(tabId)) next.delete(tabId);
    else next.add(tabId);
    setSelectedTabs(next, tabId);
  }

  function selectRangeToTab(tabId, additive = false) {
    if (tabId == null || !getTabById(tabId)) return;
    const order = getVisibleTabOrderFromDom();
    const anchor = state.selectionAnchorTabId != null ? state.selectionAnchorTabId : tabId;
    const start = order.indexOf(anchor);
    const end = order.indexOf(tabId);
    if (start < 0 || end < 0) {
      setSelectedTabs(new Set([tabId]), tabId);
      return;
    }
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const rangeIds = new Set(order.slice(from, to + 1));
    if (additive) {
      state.selectedTabIds.forEach((id) => rangeIds.add(id));
    }
    setSelectedTabs(rangeIds, anchor);
  }

  function getNativeTabElement(tabId) {
    if (tabId == null) return null;
    const domId = `tab-${tabId}`;
    return document.getElementById(domId)
      || document.querySelector(`.tab-wrapper[data-id="${domId}"]`)
      || null;
  }

  function dispatchNativeTabPointerSequence(target, options = {}) {
    if (!target) return false;
    const eventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      button: 0,
      buttons: 1,
      ctrlKey: !!options.ctrlKey,
      metaKey: !!options.metaKey,
      shiftKey: !!options.shiftKey,
      altKey: !!options.altKey,
      detail: 1,
      clientX: 8,
      clientY: 8,
    };
    const eventTypes = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    for (const type of eventTypes) {
      let event = null;
      try {
        if (type.startsWith("pointer") && typeof PointerEvent === "function") {
          event = new PointerEvent(type, { ...eventInit, pointerId: 1, pointerType: "mouse", isPrimary: true });
        } else {
          event = new MouseEvent(type, eventInit);
        }
      } catch {
        try {
          event = new MouseEvent(type, eventInit);
        } catch {
          event = null;
        }
      }
      if (event) target.dispatchEvent(event);
    }
    return true;
  }

  function proxySelectionGestureToNativeTab(tabId, options = {}) {
    const nativeTab = getNativeTabElement(tabId);
    if (!nativeTab) return false;
    const clickable = nativeTab.querySelector(".tab, .tab-header") || nativeTab;
    return dispatchNativeTabPointerSequence(clickable, options);
  }

  function getCloseTargetTabIds(clickedTabId) {
    if (clickedTabId == null) return [];
    const selected = [...state.selectedTabIds].filter((tabId) => !!getTabById(tabId));
    if (selected.length > 1 && selected.includes(clickedTabId)) {
      return selected;
    }
    const tab = getTabById(clickedTabId);
    if (!tab) return [];
    if (!tab.pinned && state.collapsedTrees.has(clickedTabId) && tabHasTreeChildren(clickedTabId)) {
      return [...collectTreeTabIds(clickedTabId)];
    }
    return [clickedTabId];
  }

  function getContextTargetTabIds(clickedTabId) {
    if (clickedTabId == null) return [];
    const selected = [...state.selectedTabIds].filter((tabId) => !!getTabById(tabId));
    if (selected.length > 1 && selected.includes(clickedTabId)) {
      return selected;
    }
    return getTabById(clickedTabId) ? [clickedTabId] : [];
  }

  function getWorkspaceMoveTargetTabIds(clickedTabId) {
    const baseTargets = getContextTargetTabIds(clickedTabId);
    if (!baseTargets.length) return [];

    const expanded = new Set();
    baseTargets.forEach((tabId) => {
      if (tabHasTreeChildren(tabId)) {
        collectTreeTabIds(tabId).forEach((id) => expanded.add(id));
      } else {
        expanded.add(tabId);
      }
    });

    return state.tabs
      .filter((tab) => expanded.has(tab.id))
      .sort((a, b) => a.index - b.index)
      .map((tab) => tab.id);
  }

  async function moveTabsToCustomWorkspace(tabIds, workspaceId) {
    const wsId = normalizeCustomWorkspaceId(workspaceId);
    if (!wsId) return 0;
    ensureCustomWorkspacesInitialized();
    if (!state.customWorkspaces.some((ws) => ws.id === wsId)) return 0;

    const orderedTabs = tabIds
      .map((tabId) => getTabById(tabId))
      .filter((tab) => !!tab)
      .sort((a, b) => a.index - b.index);
    const movedTabIdSet = new Set(orderedTabs.map((tab) => tab.id));

    let moved = 0;
    let treeChanged = false;
    orderedTabs.forEach((tab) => {
      const tabId = tab.id;
      const nodeId = state.nodeIdByTabId.get(tabId);
      if (!nodeId) return;
      if (state.tabWorkspaceByNodeId.get(nodeId) === wsId) return;
      state.tabWorkspaceByNodeId.set(nodeId, wsId);
      const parentTabId = getParentTabIdForTree(tabId);
      if (parentTabId == null || !movedTabIdSet.has(parentTabId)) {
        setTabExplicitRoot(tabId);
        treeChanged = true;
      }
      moved += 1;
    });
    if (moved > 0) {
      const movedTabIds = orderedTabs.map((tab) => tab.id);
      if (hasTabsApi() && movedTabIds.length) {
        try {
          await chrome.tabs.move(movedTabIds, { index: 0 });
        } catch {
          for (let i = movedTabIds.length - 1; i >= 0; i -= 1) {
            try {
              await chrome.tabs.move(movedTabIds[i], { index: 0 });
            } catch {}
          }
        }
      }
      rebuildTreeLookupCaches();
      if (treeChanged) requestTreeSnapshotSave(120);
      saveCustomWorkspaceState();
    }
    return moved;
  }

  function beginRenameTab(row, tab) {
    if (!row || !tab || tab.id == null || !ui.list) return;
    if (state.renamingTabId != null && state.renamingTabId !== tab.id) {
      scheduleRender(0);
    }
    state.renamingTabId = tab.id;
    row.draggable = false;

    const textWrap = row.querySelector(".zvt-text");
    const titleEl = row.querySelector(".zvt-tab-title");
    if (!textWrap || !titleEl) return;

    const input = document.createElement("input");
    input.className = "zvt-rename-input";
    input.type = "text";
    input.value = getDisplayTitle(tab);
    input.spellcheck = false;
    input.setAttribute("aria-label", "Rename tab");

    titleEl.replaceWith(input);

    let settled = false;
    let transientBlurCount = 0;
    const openedAt = Date.now();
    const finish = (save) => {
      if (settled) return;
      settled = true;
      if (save) {
        setCustomTitleForTab(tab.id, input.value);
      }
      state.renamingTabId = null;
      scheduleRender(0);
    };

    input.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    input.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    });
    input.addEventListener("blur", () => {
      if (transientBlurCount < 2 && Date.now() - openedAt < 700) {
        transientBlurCount += 1;
        setTimeout(() => {
          if (!settled && input.isConnected) {
            input.focus();
            input.select();
          }
        }, 0);
        return;
      }
      finish(true);
    });
    input.focus();
    input.select();
  }

  function createTabIconNode(tab) {
    if (tab.status === "loading") {
      const spinner = document.createElement("div");
      spinner.className = "zvt-spinner";
      return spinner;
    }
    const icon = document.createElement("img");
    icon.className = "zvt-icon";
    icon.src = getTabIcon(tab);
    icon.alt = "";
    icon.onerror = () => { icon.src = getFallbackIcon(); };
    return icon;
  }

  function patchRenderedTabRow(tabId) {
    const tab = getTabById(tabId);
    if (!tab) return false;
    const row = state.renderedRowByTabId.get(tabId) || (ui.list ? ui.list.querySelector(`.zvt-item[data-tab-id="${tabId}"]`) : null);
    if (!row) return false;

    row.classList.toggle("active", !!tab.active);
    row.classList.toggle("discarded", !!tab.discarded);
    row.classList.toggle("selected", state.selectedTabIds.size > 1 && state.selectedTabIds.has(tabId));
    row.title = getTabHoverTooltip(tab);

    const titleEl = row.querySelector(".zvt-tab-title");
    if (titleEl) titleEl.textContent = getDisplayTitle(tab);

    const iconWrap = row.querySelector(".zvt-icon-wrap");
    if (iconWrap) {
      const currentIcon = iconWrap.querySelector(":scope > .zvt-spinner, :scope > .zvt-icon");
      const shouldSpinner = tab.status === "loading";
      const hasSpinner = !!(currentIcon && currentIcon.classList.contains("zvt-spinner"));

      if (!currentIcon || shouldSpinner !== hasSpinner) {
        const nextIcon = createTabIconNode(tab);
        if (currentIcon) {
          currentIcon.replaceWith(nextIcon);
        } else {
          iconWrap.prepend(nextIcon);
        }
      } else if (!shouldSpinner && currentIcon && currentIcon.classList.contains("zvt-icon")) {
        const nextSrc = getTabIcon(tab);
        if (currentIcon.getAttribute("src") !== nextSrc) {
          currentIcon.setAttribute("src", nextSrc);
        }
      }

      const muted = !!(tab.mutedInfo && tab.mutedInfo.muted);
      const mutedEl = iconWrap.querySelector(":scope > .zvt-muted-indicator");
      if (muted && !mutedEl) {
        const mutedBadge = document.createElement("span");
        mutedBadge.className = "zvt-muted-indicator";
        mutedBadge.textContent = "🔇";
        iconWrap.appendChild(mutedBadge);
      } else if (!muted && mutedEl) {
        mutedEl.remove();
      }
    }

    return true;
  }

  function patchRenderedActiveRows() {
    if (!state.renderedRowByTabId.size) return false;
    const activeId = state.activeTabId;
    state.renderedRowByTabId.forEach((row, tabId) => {
      const shouldBeActive = activeId != null && tabId === activeId;
      if (row.classList.contains("active") !== shouldBeActive) {
        row.classList.toggle("active", shouldBeActive);
      }
    });
    return true;
  }

  function ensureActiveTabVisible(force = false) {
    if (!ui.list) return;
    const activeRow = state.activeTabId != null ? state.renderedRowByTabId.get(state.activeTabId) : null;
    if (!activeRow) return;

    const listRect = ui.list.getBoundingClientRect();
    const rowRect = activeRow.getBoundingClientRect();
    const stickyTopOffset = state.stickyPinnedHeight || 0;
    const visibleTop = listRect.top + stickyTopOffset + 4;
    const visibleBottom = listRect.bottom - 4;
    const outOfTop = rowRect.top < visibleTop;
    const outOfBottom = rowRect.bottom > visibleBottom;

    if (force || outOfTop || outOfBottom) {
      if (rowRect.top < visibleTop) {
        ui.list.scrollTop -= visibleTop - rowRect.top;
      } else if (rowRect.bottom > visibleBottom) {
        ui.list.scrollTop += rowRect.bottom - visibleBottom;
      }
    }
  }

  function hideDndPointer() {
    if (!ui.dndPointer) return;
    ui.dndPointer.dataset.mode = "none";
    ui.dndPointer.dataset.visible = "false";
    ui.dndPointer.dataset.hover = "false";
  }

  function setDndPointerFromHint(hint, row = null) {
    if (!ui.dndPointer || !ui.list) return;
    if (!hint) {
      hideDndPointer();
      return;
    }

    let top = 0;
    let left = DND_LEVEL_BASE_LEFT_PX;
    let mode = "between";

    if (hint.type === "root-end") {
      top = Math.max(0, ui.list.scrollHeight - 12);
      left = DND_LEVEL_BASE_LEFT_PX;
      mode = "between";
    } else if (row) {
      const guideLevel =
        hint.inTreeContext
          ? Math.max(0, (hint.desiredLevel || 0) - 1)
          : Math.max(0, hint.desiredLevel || 0);
      if (hint.type === "inside") {
        top = row.offsetTop + Math.max(0, (row.offsetHeight >> 1) - 11);
        left = DND_LEVEL_BASE_LEFT_PX + (guideLevel * TREE_INDENT_PX);
        mode = "inside";
      } else if (hint.type === "before") {
        top = row.offsetTop - 11;
        left = DND_LEVEL_BASE_LEFT_PX + (guideLevel * TREE_INDENT_PX);
        mode = "between";
      } else {
        top = row.offsetTop + row.offsetHeight - 11;
        left = DND_LEVEL_BASE_LEFT_PX + (guideLevel * TREE_INDENT_PX);
        mode = "between";
      }
    } else {
      hideDndPointer();
      return;
    }

    ui.dndPointer.style.top = `${top}px`;
    ui.dndPointer.style.left = `${Math.max(2, left)}px`;
    ui.dndPointer.dataset.mode = mode;
    ui.dndPointer.dataset.visible = "true";
  }

  function clearDndHoverExpandTimer() {
    if (state.dndExpandTimer) {
      clearTimeout(state.dndExpandTimer);
      state.dndExpandTimer = null;
    }
    state.dndExpandTargetId = null;
    if (ui.dndPointer) ui.dndPointer.dataset.hover = "false";
  }

  function scheduleDndHoverExpand(targetTabId) {
    if (targetTabId == null) {
      clearDndHoverExpandTimer();
      return;
    }
    if (!state.collapsedTrees.has(targetTabId)) {
      clearDndHoverExpandTimer();
      return;
    }
    if (state.dndExpandTargetId === targetTabId && state.dndExpandTimer) return;

    clearDndHoverExpandTimer();
    state.dndExpandTargetId = targetTabId;
    if (ui.dndPointer) ui.dndPointer.dataset.hover = "true";

    state.dndExpandTimer = setTimeout(() => {
      const targetId = state.dndExpandTargetId;
      clearDndHoverExpandTimer();
      if (targetId == null) return;
      if (!state.collapsedTrees.has(targetId)) return;
      state.collapsedTrees.delete(targetId);
      state.treeRenderCache = null;
      requestCollapsedTreesSave(150);
      scheduleRender(0);
    }, DND_HOVER_EXPAND_DELAY_MS);
  }

  function clearDropIndicators(includeDragging = true) {
    if (ui.list) ui.list.classList.remove("drop-root");
    hideDndPointer();
    if (includeDragging) clearDndHoverExpandTimer();
    if (!ui.list) return;
    ui.list.querySelectorAll(".zvt-item.drop-before, .zvt-item.drop-after, .zvt-item.drop-inside, .zvt-item.dragging, .zvt-item.drag-selected")
      .forEach((row) => {
        row.classList.remove("drop-before", "drop-after", "drop-inside");
        row.style.removeProperty("--zvt-drop-left");
        if (includeDragging) row.classList.remove("dragging", "drag-selected");
      });
  }

  function clearTreeGuides() {
    if (!ui.list) return;
    ui.list.querySelectorAll(".zvt-tree-guide").forEach((el) => el.remove());
  }

  function renderTreeGuides(regularTabs, levels, hasChildren, collapsed) {
    if (!ui.list) return;
    clearTreeGuides();
    if (!Array.isArray(regularTabs) || !regularTabs.length) return;

    const rowsById = state.renderedRowByTabId;

    for (let i = 0; i < regularTabs.length; i += 1) {
      const tab = regularTabs[i];
      if (!tab) continue;
      if (!hasChildren.get(tab.id)) continue;
      if (collapsed.get(tab.id)) continue;

      const parentLevel = levels.get(tab.id) || 0;
      let lastDescendantIdx = i;
      for (let j = i + 1; j < regularTabs.length; j += 1) {
        const nextTab = regularTabs[j];
        const nextLevel = levels.get(nextTab.id) || 0;
        if (nextLevel <= parentLevel) break;
        lastDescendantIdx = j;
      }
      if (lastDescendantIdx <= i) continue;

      const parentRow = rowsById.get(tab.id);
      const lastRow = rowsById.get(regularTabs[lastDescendantIdx].id);
      if (!parentRow || !lastRow) continue;

      const parentIcon = parentRow.querySelector(".zvt-icon-wrap");
      if (!parentIcon) continue;

      const startY = parentRow.offsetTop + parentRow.offsetHeight + 2;
      const endY = lastRow.offsetTop + lastRow.offsetHeight - 4;
      const height = endY - startY;
      if (height <= 2) continue;

      const left = parentRow.offsetLeft + parentIcon.offsetLeft;
      const guide = document.createElement("div");
      guide.className = "zvt-tree-guide";
      guide.style.left = `${left}px`;
      guide.style.top = `${startY}px`;
      guide.style.height = `${height}px`;
      ui.list.appendChild(guide);
    }
  }

  function collectTreeTabIds(rootTabId) {
    ensureTreeLookupCaches();
    const collected = new Set();
    const queue = [rootTabId];
    while (queue.length) {
      const current = queue.shift();
      if (current == null || collected.has(current)) continue;
      collected.add(current);
      const children = state.childrenByParentTabId.get(current) || [];
      children.forEach((childId) => {
        if (!collected.has(childId)) queue.push(childId);
      });
    }
    return collected;
  }

  function getRegularLevelsMap() {
    if (state.treeRenderCache && state.treeRenderCache.levels) {
      return state.treeRenderCache.levels;
    }
    const regular = state.tabs.filter((tab) => !tab.pinned);
    return getTreeOrderedTabs(regular).levels;
  }

  function tabHasTreeChildren(tabId) {
    ensureTreeLookupCaches();
    if (tabId == null) return false;
    const children = state.childrenByParentTabId.get(tabId);
    return Array.isArray(children) && children.length > 0;
  }

  async function collapseAllTreesInCurrentWorkspace() {
    const workspaceTabs = getWorkspaceScopedTabs(state.tabs).filter((tab) => !tab.pinned);
    if (!workspaceTabs.length) return;

    const collapsibleIds = workspaceTabs
      .map((tab) => tab && tab.id)
      .filter((tabId) => tabId != null && tabHasTreeChildren(tabId));
    if (!collapsibleIds.length) return;

    const activeTab = state.activeTabId != null ? getTabById(state.activeTabId) : null;
    if (activeTab && hasTabsApi()) {
      const activeWsTabs = new Set(workspaceTabs.map((tab) => tab.id));
      if (activeWsTabs.has(activeTab.id)) {
        const activeRootId = getTreeRootTabId(activeTab.id);
        if (activeRootId != null && activeRootId !== activeTab.id && collapsibleIds.includes(activeRootId)) {
          try {
            await chrome.tabs.update(activeRootId, { active: true });
          } catch {}
        }
      }
    }

    let changed = false;
    collapsibleIds.forEach((tabId) => {
      if (state.collapsedTrees.has(tabId)) return;
      state.collapsedTrees.add(tabId);
      changed = true;
    });
    if (!changed) return;

    state.treeRenderCache = null;
    requestCollapsedTreesSave(150);
    scheduleRender(0);
  }

  function getTreeRootTabId(tabId) {
    let current = tabId;
    const visited = new Set();
    while (current != null && !visited.has(current)) {
      visited.add(current);
      const parent = getParentTabIdForTree(current);
      if (parent == null) return current;
      current = parent;
    }
    return tabId;
  }

  function resolveParentForDesiredLevel(visibleOrder, levels, insertionIndex, desiredLevel) {
    if (desiredLevel <= 0) return null;
    const prevId = visibleOrder[insertionIndex - 1];
    if (prevId == null) return null;

    const chain = [];
    let cursor = prevId;
    const visited = new Set();
    while (cursor != null && !visited.has(cursor)) {
      visited.add(cursor);
      chain.push(cursor);
      cursor = getParentTabIdForTree(cursor);
    }

    const needLevel = desiredLevel - 1;
    const exact = chain.find((tabId) => (levels.get(tabId) || 0) === needLevel);
    if (exact != null) return exact;

    const prevLevel = levels.get(prevId) || 0;
    if (needLevel > prevLevel) return prevId;
    return null;
  }

  function applyDropIndicator(hint) {
    clearDropIndicators(false);
    if (state.dragState && state.dragState.sourceTabId != null) {
      const sourceRow = state.renderedRowByTabId.get(state.dragState.sourceTabId);
      if (sourceRow) sourceRow.classList.add("dragging");
      const movedIds = state.dragState.movedTabIds || [];
      movedIds.forEach((tabId) => {
        const row = state.renderedRowByTabId.get(tabId);
        if (row) row.classList.add("drag-selected");
      });
    }
    if (!hint) return;

    if (hint.type === "root-end") {
      if (ui.list) ui.list.classList.add("drop-root");
      setDndPointerFromHint(hint, null);
      clearDndHoverExpandTimer();
      return;
    }

    const row = state.renderedRowByTabId.get(hint.targetTabId);
    if (!row) return;
    setDndPointerFromHint(hint, row);
    if (hint.type === "before" || hint.type === "after") {
      const guideLevel =
        hint.inTreeContext
          ? Math.max(0, (hint.desiredLevel || 0) - 1)
          : Math.max(0, hint.desiredLevel || 0);
      const dropLeft = DND_LEVEL_BASE_LEFT_PX + (guideLevel * TREE_INDENT_PX);
      row.style.setProperty("--zvt-drop-left", `${dropLeft}px`);
    }
    if (hint.type === "before") row.classList.add("drop-before");
    if (hint.type === "after") row.classList.add("drop-after");
    if (hint.type === "inside") {
      row.classList.add("drop-inside");
      scheduleDndHoverExpand(hint.targetTabId);
    } else {
      clearDndHoverExpandTimer();
    }
  }

  function buildDropHintFromRow(row, clientX, clientY) {
    if (!row || !ui.list) return null;
    const targetTabId = Number(row.dataset.tabId);
    if (!Number.isFinite(targetTabId)) return null;

    const rect = row.getBoundingClientRect();
    const listRect = ui.list.getBoundingClientRect();
    const y = (clientY - rect.top) / Math.max(1, rect.height);
    const centerBand = y >= 0.44 && y <= 0.56;
    const xSupportsInside = clientX >= rect.left + 30;
    let type;
    if (y < 0.5) type = "before";
    else type = "after";
    if (centerBand && xSupportsInside) {
      type = "inside";
    }

    const targetLevel = Number(row.dataset.level) || 0;
    const targetInTreeContext =
      getParentTabIdForTree(targetTabId) != null || tabHasTreeChildren(targetTabId);
    const rootTabId = getTreeRootTabId(targetTabId);
    const rootLaneWidth = DND_LEVEL_BASE_LEFT_PX + TREE_INDENT_PX + 10;
    const inRootLaneGlobal = (clientX - listRect.left) <= rootLaneWidth;
    const desiredLevel = type === "inside"
      ? targetLevel + 1
      : (() => {
          if (targetLevel <= 0) return 0;
          if (!targetInTreeContext) return 0;
          // Explicit root lane on the far-left of the whole list allows
          // dropping to root even when hovering indented tree rows.
          if (inRootLaneGlobal) return 0;
          return Math.max(1, targetLevel);
        })();

    return {
      type,
      targetTabId,
      desiredLevel,
      inTreeContext: targetInTreeContext,
      treeRootId: rootTabId,
      forceRoot: type !== "inside" && inRootLaneGlobal,
    };
  }

  async function applyDropFromState() {
    const drag = state.dragState;
    if (!drag || !drag.hint || !hasTabsApi()) return;

    const sourceTab = getTabById(drag.sourceTabId);
    if (!sourceTab || sourceTab.pinned) return;

    const movedSet = new Set(drag.movedTabIds || []);
    const movedOrdered = [...movedSet]
      .map((id) => getTabById(id))
      .filter((tab) => !!tab && !tab.pinned)
      .sort((a, b) => a.index - b.index)
      .map((tab) => tab.id);
    if (!movedOrdered.length) return;

    const hint = drag.hint;
    if (hint.targetTabId != null && movedSet.has(hint.targetTabId)) return;

    const visibleOrder = (state.visibleRegularOrder || []).filter((id) => !movedSet.has(id));
    let insertionVisibleIndex = visibleOrder.length;
    let rootScopedDrop = false;
    if (hint.type !== "root-end" && hint.targetTabId != null) {
      const targetPos = visibleOrder.indexOf(hint.targetTabId);
      if (targetPos >= 0) {
        rootScopedDrop =
          !!hint.forceRoot ||
          (hint.type !== "inside" && Number(hint.desiredLevel || 0) === 0);
        if (rootScopedDrop) {
          const targetRootId = getTreeRootTabId(hint.targetTabId);
          let start = targetPos;
          let endExclusive = targetPos + 1;
          while (start > 0 && getTreeRootTabId(visibleOrder[start - 1]) === targetRootId) {
            start -= 1;
          }
          while (endExclusive < visibleOrder.length && getTreeRootTabId(visibleOrder[endExclusive]) === targetRootId) {
            endExclusive += 1;
          }
          insertionVisibleIndex = hint.type === "before" ? start : endExclusive;
        } else {
          insertionVisibleIndex = hint.type === "before" ? targetPos : targetPos + 1;
        }
      }
    }

    const regularRemaining = state.tabs
      .filter((tab) => !tab.pinned && !movedSet.has(tab.id))
      .sort((a, b) => a.index - b.index);
    let insertionTabIndex;
    if (hint.type === "inside" && hint.targetTabId != null) {
      const targetTab = getTabById(hint.targetTabId);
      insertionTabIndex = targetTab ? targetTab.index + 1 : sourceTab.index;
    } else if (insertionVisibleIndex >= visibleOrder.length) {
      if (regularRemaining.length) {
        insertionTabIndex = regularRemaining[regularRemaining.length - 1].index + 1;
      } else {
        insertionTabIndex = state.tabs.filter((tab) => tab.pinned).length;
      }
    } else {
      const nextTab = getTabById(visibleOrder[insertionVisibleIndex]);
      insertionTabIndex = nextTab ? nextTab.index : sourceTab.index;
    }

    const movedTabsById = new Map(
      state.tabs
        .filter((tab) => movedSet.has(tab.id))
        .map((tab) => [tab.id, tab])
    );
    const visibleMovedIds = new Set(
      (state.visibleRegularOrder || [])
        .filter((id) => movedSet.has(id))
    );
    const movedCompensationIds = movedOrdered.filter((tabId) => visibleMovedIds.has(tabId));
    const movedBeforeInsertion = movedCompensationIds.reduce((count, tabId) => {
      const tab = movedTabsById.get(tabId);
      if (!tab) return count;
      return count + (tab.index < insertionTabIndex ? 1 : 0);
    }, 0);
    const adjustedInsertionTabIndex = Math.max(0, insertionTabIndex - movedBeforeInsertion);

    const movedOriginalIndices = movedOrdered
      .map((tabId) => {
        const tab = movedTabsById.get(tabId);
        return tab ? tab.index : null;
      })
      .filter((index) => Number.isFinite(index));
    const minOriginalIndex = movedOriginalIndices.length ? Math.min(...movedOriginalIndices) : adjustedInsertionTabIndex;
    const movingUpwardAsBlock = adjustedInsertionTabIndex <= minOriginalIndex;
    const mustUseSequentialMove = movedOrdered.length > 1;
    if (mustUseSequentialMove) {
      try {
        if (movingUpwardAsBlock) {
          for (let i = 0; i < movedOrdered.length; i += 1) {
            await chrome.tabs.move(movedOrdered[i], { index: adjustedInsertionTabIndex + i });
          }
        } else {
          for (let i = movedOrdered.length - 1; i >= 0; i -= 1) {
            await chrome.tabs.move(movedOrdered[i], { index: adjustedInsertionTabIndex + i });
          }
        }
      } catch {
        state.treeDirty = true;
        state.treeRenderCache = null;
        scheduleRender(0);
        return;
      }
    } else {
      try {
        await chrome.tabs.move(movedOrdered, { index: adjustedInsertionTabIndex });
      } catch {
        try {
          if (movingUpwardAsBlock) {
            for (let i = 0; i < movedOrdered.length; i += 1) {
              await chrome.tabs.move(movedOrdered[i], { index: adjustedInsertionTabIndex + i });
            }
          } else {
            for (let i = movedOrdered.length - 1; i >= 0; i -= 1) {
              await chrome.tabs.move(movedOrdered[i], { index: adjustedInsertionTabIndex + i });
            }
          }
        } catch {
          state.treeDirty = true;
          state.treeRenderCache = null;
          scheduleRender(0);
          return;
        }
      }
    }

    const levels = getRegularLevelsMap();
    let nextParentTabId = null;
    if (hint.type === "inside") {
      nextParentTabId = hint.targetTabId;
    } else if (hint.forceRoot) {
      nextParentTabId = null;
    } else if (hint.type !== "root-end") {
      nextParentTabId = resolveParentForDesiredLevel(visibleOrder, levels, insertionVisibleIndex, hint.desiredLevel || 0);
      if (nextParentTabId == null && hint.inTreeContext && (hint.desiredLevel || 0) > 0) {
        nextParentTabId = hint.treeRootId ?? hint.targetTabId ?? null;
      }
    }

    if (nextParentTabId != null && movedSet.has(nextParentTabId)) {
      nextParentTabId = null;
    }

    const movedRoots = movedOrdered.filter((tabId) => {
      const parentId = getParentTabIdForTree(tabId);
      return parentId == null || !movedSet.has(parentId);
    });
    movedRoots.forEach((tabId) => {
      const nodeId = state.nodeIdByTabId.get(tabId);
      if (!nodeId) return;
      if (nextParentTabId == null || nextParentTabId === tabId) {
        setTabExplicitRoot(tabId);
        return;
      }
      const parentNodeId = state.nodeIdByTabId.get(nextParentTabId);
      if (parentNodeId && parentNodeId !== nodeId) {
        state.parentNodeByNodeId.set(nodeId, parentNodeId);
      } else {
        state.parentNodeByNodeId.delete(nodeId);
      }
    });

    state.treeDirty = true;
    state.treeRenderCache = null;
    requestTreeSnapshotSave(120);
    requestCollapsedTreesSave(160);
    await fetchTabs();
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function removePlaceholderTabs(windowId, keepTabId) {
    // Vivaldi can inject a start page tab while creating/moving windows.
    // Retry a few times to remove late-created placeholders only.
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const tabs = await chrome.tabs.query({ windowId });
      const placeholderIds = tabs
        .filter((t) => {
          if (!t || t.id === keepTabId) return false;
          const url = String((t.url || t.pendingUrl) || "");
          return url === "about:blank" || isStartPageUrl(url);
        })
        .map((t) => t.id);
      if (!placeholderIds.length) return;
      await chrome.tabs.remove(placeholderIds);
      await delay(80);
    }
  }

  function schedulePlaceholderCleanup(windowId, keepTabId) {
    const delays = [160, 420, 900];
    delays.forEach((ms) => {
      setTimeout(() => {
        void removePlaceholderTabs(windowId, keepTabId).catch(() => {});
      }, ms);
    });
  }

  async function duplicateTabAtSameTreeLevel(sourceTab) {
    if (!hasTabsApi() || !sourceTab || sourceTab.id == null) return;

    const duplicatedTab = await new Promise((resolve) => {
      let settled = false;
      const done = (value) => {
        if (settled) return;
        settled = true;
        resolve(value && value.id != null ? value : null);
      };
      try {
        chrome.tabs.duplicate(sourceTab.id, (tab) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            done(null);
            return;
          }
          done(tab || null);
        });
      } catch {
        done(null);
      }
      setTimeout(() => done(null), 650);
    });
    if (!duplicatedTab || duplicatedTab.id == null) return;
    if (sourceTab.pinned) return;

    const sourceNodeId = state.nodeIdByTabId.get(sourceTab.id);
    if (!sourceNodeId) return;

    let duplicateNodeId = state.nodeIdByTabId.get(duplicatedTab.id);
    for (let i = 0; !duplicateNodeId && i < 8; i += 1) {
      await delay(25);
      duplicateNodeId = state.nodeIdByTabId.get(duplicatedTab.id);
    }
    if (!duplicateNodeId) {
      duplicateNodeId = generateTreeNodeId();
      state.nodeIdByTabId.set(duplicatedTab.id, duplicateNodeId);
    }

    const sourceParentNodeId = state.parentNodeByNodeId.get(sourceNodeId);
    if (sourceParentNodeId === ROOT_PARENT_NODE_ID) {
      state.parentNodeByNodeId.set(duplicateNodeId, ROOT_PARENT_NODE_ID);
    } else if (sourceParentNodeId && sourceParentNodeId !== duplicateNodeId) {
      state.parentNodeByNodeId.set(duplicateNodeId, sourceParentNodeId);
    } else {
      // Force root for top-level tabs so opener fallback cannot nest duplicates.
      state.parentNodeByNodeId.set(duplicateNodeId, ROOT_PARENT_NODE_ID);
    }

    const wsId = getCustomWorkspaceIdForTab(sourceTab);
    if (wsId) {
      state.tabWorkspaceByNodeId.set(duplicateNodeId, wsId);
    }

    state.treeDirty = true;
    state.treeRenderCache = null;
    requestTreeSnapshotSave(120);
    await fetchTabs();
  }

  async function executeTabContextAction(action, tab, payload = null) {
    try {
      if (action === "restore-last-closed") {
        const ok = await restoreLastClosedTabOnly();
        if (!ok) {
          showStatus("Cannot restore closed tab in this context.");
          setTimeout(hideStatus, 1700);
          return;
        }
        return;
      }
      if (!hasTabsApi() || !tab || tab.id == null) return;
      if (action === "new-right") {
        await chrome.tabs.create({
          windowId: tab.windowId,
          index: tab.index + 1,
          active: true,
          openerTabId: tab.id,
          url: VIVALDI_STARTPAGE_URL,
        });
      }
      if (action === "duplicate") {
        await duplicateTabAtSameTreeLevel(tab);
      }
      if (action === "pin") {
        await chrome.tabs.update(tab.id, { pinned: !tab.pinned });
      }
      if (action === "mute") {
        const muted = !!(tab.mutedInfo && tab.mutedInfo.muted);
        await chrome.tabs.update(tab.id, { muted: !muted });
      }
      if (action === "move-window") {
        const sourceTab = await chrome.tabs.get(tab.id);
        const sourceWindowId = sourceTab.windowId;
        let movedTabId = sourceTab.id;
        let newWindow;

        try {
          // Preferred: create window directly with the selected tab.
          // This avoids creating a temporary start page tab.
          newWindow = await chrome.windows.create({ tabId: sourceTab.id, focused: true });
        } catch {
          // Fallback path for environments where `tabId` is not accepted.
          newWindow = await chrome.windows.create({ url: "about:blank", focused: true });
          await chrome.tabs.move(sourceTab.id, { windowId: newWindow.id, index: 0 });
        }

        const tabsInNewWindow = await chrome.tabs.query({ windowId: newWindow.id });
        if (!tabsInNewWindow.some((t) => t.id === movedTabId)) {
          // Some Vivaldi builds may clone into a new tab id instead of reusing source id.
          const candidate =
            tabsInNewWindow.find((t) => !isStartPageUrl(t.url || "")) ||
            tabsInNewWindow.find((t) => t.url === sourceTab.url) ||
            tabsInNewWindow[0];
          if (candidate && candidate.id != null) {
            movedTabId = candidate.id;
          }
        }

        // If the original tab still exists in source window, remove it to enforce true move semantics.
        try {
          const sourceStillThere = await chrome.tabs.get(sourceTab.id);
          if (sourceStillThere && sourceStillThere.windowId === sourceWindowId && sourceStillThere.id !== movedTabId) {
            await chrome.tabs.remove(sourceStillThere.id);
          }
        } catch {}

        await removePlaceholderTabs(newWindow.id, movedTabId);
        schedulePlaceholderCleanup(newWindow.id, movedTabId);

        // Prevent Vivaldi from "returning" moved tab to source window on closing new window.
        state.noReturnTabs.set(movedTabId, {
          sourceWindowId,
          expiresAt: Date.now() + 10 * 60 * 1000,
        });

        try {
          await chrome.tabs.update(movedTabId, { active: true });
        } catch {}
        await chrome.windows.update(newWindow.id, { focused: true });
      }
      if (action === "move-workspace") {
        const workspaceId = normalizeCustomWorkspaceId(payload && payload.workspaceId);
        if (!workspaceId) return;
        const targets = getWorkspaceMoveTargetTabIds(tab.id);
        const activeTabId = state.activeTabId;
        const movedActiveTab = activeTabId != null && targets.includes(activeTabId);
        const movedExplicitTab = !!tab.active || movedActiveTab;
        const moved = await moveTabsToCustomWorkspace(targets, workspaceId);
        if (!moved) return;
        pruneSelectionToLiveTabs();
        if (movedExplicitTab) {
          const movedActive = getTabById(activeTabId);
          if (movedActive && rememberLastActiveTabForWorkspace(movedActive)) {
            saveCustomWorkspaceState();
          }
          setActiveCustomWorkspace(workspaceId, true);
        } else {
          renderWorkspaceSelector();
          renderTabs();
        }
        return;
      }
      if (action === "close") {
        const toClose = getCloseTargetTabIds(tab.id);
        if (toClose.length) {
          await chrome.tabs.remove(toClose);
        }
      }
      if (action === "close-others") {
        const tabs = await chrome.tabs.query({ windowId: tab.windowId });
        const toRemove = tabs
          .filter((t) => t.id !== tab.id && !t.pinned)
          .map((t) => t.id);
        if (toRemove.length) await chrome.tabs.remove(toRemove);
      }
      if (action === "close-right") {
        const tabs = await chrome.tabs.query({ windowId: tab.windowId });
        const toRemove = tabs
          .filter((t) => t.index > tab.index && !t.pinned)
          .map((t) => t.id);
        if (toRemove.length) await chrome.tabs.remove(toRemove);
      }
    } catch (err) {
      const message = err && err.message ? err.message : String(err || "Unknown error");
      showStatus(`Context menu action failed: ${message}`);
      setTimeout(hideStatus, 2400);
    }
  }

  async function showTabContextMenu(clientX, clientY, tab) {
    hideTabContextMenu();
    if (!ui.host || !tab) return;

    const muted = !!(tab.mutedInfo && tab.mutedInfo.muted);
    const itemHtml = (action, label, icon = "") =>
      `<button class="zvt-context-item" data-action="${action}">${
        icon ? `<span class="zvt-context-item-icon">${icon}</span>` : ""
      }<span class="zvt-context-item-label">${label}</span></button>`;
    const menu = document.createElement("div");
    menu.className = "zvt-context-menu";
    menu.innerHTML = `
      ${itemHtml("restore-last-closed", t("ctx_restore_last_closed"), CONTEXT_MENU_ICONS.restore)}
      ${itemHtml("new-right", t("ctx_new_below"), CONTEXT_MENU_ICONS.plus)}
      ${itemHtml("duplicate", t("ctx_duplicate"), CONTEXT_MENU_ICONS.duplicate)}
      ${itemHtml("pin", tab.pinned ? t("ctx_unpin") : t("ctx_pin"), CONTEXT_MENU_ICONS.pin)}
      ${itemHtml("mute", muted ? t("ctx_unmute") : t("ctx_mute"), muted ? CONTEXT_MENU_ICONS.loud : CONTEXT_MENU_ICONS.mute)}
      ${itemHtml("move-window", t("ctx_move_window"), CONTEXT_MENU_ICONS.moveWindow)}
      <div class="zvt-context-sep"></div>
      <div class="zvt-context-label">${t("ctx_move_workspace")}</div>
      <div class="zvt-context-workspaces"></div>
      <div class="zvt-context-sep"></div>
      ${itemHtml("close", t("ctx_close"))}
      ${itemHtml("close-others", t("ctx_close_others"))}
      ${itemHtml("close-right", t("ctx_close_below"))}
    `;

    ui.host.appendChild(menu);

    const positionContextMenu = () => {
      if (!ui.host || !menu.isConnected) return;
      const hostRect = ui.host.getBoundingClientRect();
      const margin = 8;
      const anchorX = clientX - hostRect.left;
      const anchorY = clientY - hostRect.top;
      const maxMenuHeight = Math.max(120, Math.floor(hostRect.height - margin * 2));
      menu.style.maxHeight = `${maxMenuHeight}px`;

      const menuRect = menu.getBoundingClientRect();
      let left = anchorX;
      let top = anchorY;

      if (left + menuRect.width > hostRect.width - margin) {
        left = hostRect.width - menuRect.width - margin;
      }
      if (left < margin) left = margin;

      const spaceBelow = hostRect.height - top - margin;
      const spaceAbove = top - margin;
      if (menuRect.height > spaceBelow && spaceAbove > spaceBelow) {
        top = Math.max(margin, top - menuRect.height);
      }
      if (top + menuRect.height > hostRect.height - margin) {
        top = hostRect.height - menuRect.height - margin;
      }
      if (top < margin) top = margin;

      menu.style.left = `${Math.round(left)}px`;
      menu.style.top = `${Math.round(top)}px`;
    };

    positionContextMenu();

    menu.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
    menu.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    const handleMenuAction = (item) => {
      if (!item || item.disabled) return;
      const action = item.getAttribute("data-action");
      if (!action) return;
      const workspaceRaw = item.getAttribute("data-workspace-id");
      const workspaceId = workspaceRaw != null ? String(workspaceRaw) : null;
      hideTabContextMenu();
      void executeTabContextAction(action, tab, { workspaceId });
    };
    const bindMenuActionButton = (btn) => {
      if (!btn || btn.dataset.zvtBound === "1") return;
      btn.dataset.zvtBound = "1";
      btn.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        handleMenuAction(btn);
      });
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    };
    menu.querySelectorAll("button[data-action]").forEach((btn) => bindMenuActionButton(btn));

    state.contextMenuEl = menu;
    const workspaceBox = menu.querySelector(".zvt-context-workspaces");
    if (workspaceBox) {
      ensureCustomWorkspacesInitialized();
      const activeWorkspaceId = normalizeCustomWorkspaceId(state.currentCustomWorkspaceId);
      const targets = state.customWorkspaces.filter((ws) => ws && ws.id !== activeWorkspaceId);
      if (!targets.length) {
        const empty = document.createElement("button");
        empty.className = "zvt-context-item sub";
        empty.disabled = true;
        empty.textContent = t("ctx_no_workspaces");
        workspaceBox.appendChild(empty);
      } else {
        targets.forEach((ws) => {
          const btn = document.createElement("button");
          btn.className = "zvt-context-item sub";
          btn.dataset.action = "move-workspace";
          btn.dataset.workspaceId = String(ws.id);
          btn.textContent = `${ws.icon || "💼"} ${ws.name || "Workspace"}`;
          bindMenuActionButton(btn);
          workspaceBox.appendChild(btn);
        });
      }
    }
    positionContextMenu();
  }

  function renderTabs() {
    clearDropIndicators();
    clearTreeGuides();
    const tabs = getFilteredTabs();
    ui.count.textContent = `${tabs.length} tabs`;

    const prevRowTops = new Map();
    state.renderedRowByTabId.forEach((row, tabId) => {
      if (!row || !row.isConnected) return;
      prevRowTops.set(tabId, row.offsetTop);
    });

    const frag = document.createDocumentFragment();
    const renderedRowByTabId = new Map();
    const createTabRow = (tab, pinnedView = false, level = 0, treeMeta = null) => {
      const row = document.createElement("div");
      row.className = `zvt-item ${pinnedView ? "pinned" : ""} ${tab.active ? "active" : ""} ${tab.discarded ? "discarded" : ""}`;
      if (state.selectedTabIds.size > 1 && state.selectedTabIds.has(tab.id)) row.classList.add("selected");
      row.dataset.tabId = String(tab.id);
      row.dataset.level = String(level || 0);
      row.title = getTabHoverTooltip(tab);
      if (!pinnedView && level > 0) {
        row.style.setProperty("--zvt-level", String(level));
      }

      const icon = createTabIconNode(tab);

      const iconWrap = document.createElement("div");
      iconWrap.className = "zvt-icon-wrap";
      iconWrap.appendChild(icon);

      if (!pinnedView && treeMeta && treeMeta.hasChildren) {
        row.classList.add("has-children");
        if (treeMeta.collapsed) {
          row.classList.add("tree-collapsed");
        }

        const toggle = document.createElement("button");
        toggle.className = "zvt-tree-toggle";
        toggle.type = "button";
        toggle.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6.2L8 9.8L11.5 6.2"/></svg>';
        toggle.title = treeMeta.collapsed ? "Expand tree" : "Collapse tree";
        toggle.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const willCollapse = !state.collapsedTrees.has(tab.id);
          if (willCollapse) {
            const activeTab = state.activeTabId != null ? getTabById(state.activeTabId) : null;
            if (activeTab && isDescendantTab(activeTab.id, tab.id) && hasTabsApi()) {
              try {
                await chrome.tabs.update(tab.id, { active: true });
              } catch {}
            }
          }

          if (!willCollapse) {
            state.collapsedTrees.delete(tab.id);
          } else {
            state.collapsedTrees.add(tab.id);
          }
          state.treeRenderCache = null;
          requestCollapsedTreesSave(150);
          scheduleRender(0);
        });
        iconWrap.appendChild(toggle);

        if (treeMeta.descendantCount > 0) {
          const treeCount = document.createElement("span");
          treeCount.className = "zvt-tree-count";
          treeCount.textContent = String(treeMeta.descendantCount);
          iconWrap.appendChild(treeCount);
        }
      }

      const isMuted = !!(tab.mutedInfo && tab.mutedInfo.muted);
      if (isMuted) {
        const mutedBadge = document.createElement("span");
        mutedBadge.className = "zvt-muted-indicator";
        mutedBadge.textContent = "🔇";
        iconWrap.appendChild(mutedBadge);
      }

      const text = document.createElement("div");
      text.className = "zvt-text";
      text.innerHTML = `
        <div class="zvt-tab-title"></div>
      `;
      text.querySelector(".zvt-tab-title").textContent = getDisplayTitle(tab);

      const close = document.createElement("button");
      close.className = "zvt-close";
      close.type = "button";
      close.textContent = "×";
      close.title = "Close tab";
      close.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!hasTabsApi()) return;
        const toClose = getCloseTargetTabIds(tab.id);
        if (!toClose.length) return;
        await chrome.tabs.remove(toClose);
      });

      const addChild = document.createElement("button");
      addChild.className = "zvt-add-child";
      addChild.type = "button";
      addChild.textContent = "+";
      addChild.title = "Open child tab";
      addChild.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!hasTabsApi()) return;
        await chrome.tabs.create({
          windowId: tab.windowId,
          index: tab.index + 1,
          active: true,
          openerTabId: tab.id,
          url: VIVALDI_STARTPAGE_URL,
        });
      });

      row.addEventListener("click", async (e) => {
        if (state.renamingTabId != null) return;
        const withCtrl = !!(e.ctrlKey || e.metaKey);
        const withShift = !!e.shiftKey;
        if (withShift) {
          e.preventDefault();
          e.stopPropagation();
          selectRangeToTab(tab.id, withCtrl);
          proxySelectionGestureToNativeTab(tab.id, {
            ctrlKey: !!e.ctrlKey,
            metaKey: !!e.metaKey,
            shiftKey: true,
          });
          return;
        }
        if (withCtrl) {
          e.preventDefault();
          e.stopPropagation();
          toggleSelectedTab(tab.id);
          proxySelectionGestureToNativeTab(tab.id, {
            ctrlKey: !!e.ctrlKey,
            metaKey: !!e.metaKey,
            shiftKey: !!e.shiftKey,
          });
          return;
        }
        if (e.detail > 1) {
          return;
        }
        setSelectedTabs(new Set([tab.id]), tab.id);
        if (!hasTabsApi()) return;
        if (setActiveTabLocal(tab.id, tab.windowId)) {
          patchRenderedActiveRows();
          ensureActiveTabVisible();
        }
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
      });

      row.addEventListener("dblclick", (e) => {
        const target = e.target;
        if (target && target.closest && target.closest(".zvt-close, .zvt-add-child, .zvt-tree-toggle")) return;
        e.preventDefault();
        e.stopPropagation();
        beginRenameTab(row, tab);
      });

      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!state.selectedTabIds.has(tab.id)) {
          setSelectedTabs(new Set([tab.id]), tab.id);
        }
        showTabContextMenu(e.clientX, e.clientY, tab);
      });

      if (!pinnedView) {
        row.draggable = true;
        row.addEventListener("dragstart", (e) => {
          if (state.renamingTabId != null) {
            e.preventDefault();
            return;
          }
          if (state.search.trim()) {
            e.preventDefault();
            return;
          }
          const movedTabIds = new Set();
          const selectedRegularIds = [...state.selectedTabIds]
            .map((id) => getTabById(id))
            .filter((t) => !!t && !t.pinned)
            .map((t) => t.id);

          if (state.selectedTabIds.has(tab.id) && selectedRegularIds.length > 1) {
            selectedRegularIds.forEach((tabId) => {
              collectTreeTabIds(tabId).forEach((id) => movedTabIds.add(id));
            });
          } else {
            setSelectedTabs(new Set([tab.id]), tab.id);
            collectTreeTabIds(tab.id).forEach((id) => movedTabIds.add(id));
          }

          state.dragState = {
            sourceTabId: tab.id,
            movedTabIds,
            hint: null,
          };
          row.classList.add("dragging");
          applyDropIndicator(null);
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(tab.id));
          }
        });

        row.addEventListener("dragover", (e) => {
          if (!state.dragState || state.search.trim()) return;
          if (!state.dragState.movedTabIds || state.dragState.movedTabIds.has(tab.id)) return;
          e.preventDefault();
          e.stopPropagation();
          const hint = buildDropHintFromRow(row, e.clientX, e.clientY);
          state.dragState.hint = hint;
          applyDropIndicator(hint);
        });

        row.addEventListener("drop", (e) => {
          if (!state.dragState || state.search.trim()) return;
          e.preventDefault();
          e.stopPropagation();
          const hint = buildDropHintFromRow(row, e.clientX, e.clientY);
          state.dragState.hint = hint;
          void applyDropFromState().finally(() => {
            state.dragState = null;
            clearDropIndicators();
          });
        });

        row.addEventListener("dragend", () => {
          state.dragState = null;
          clearDropIndicators();
        });
      }

      row.appendChild(iconWrap);
      row.appendChild(text);
      row.appendChild(addChild);
      row.appendChild(close);
      renderedRowByTabId.set(tab.id, row);
      return row;
    };

    const createNewTabRow = () => {
      const row = document.createElement("div");
      row.className = "zvt-item zvt-newtab-row";
      row.title = "New tab";
      row.innerHTML = `
        <div class="zvt-icon-wrap"><span class="zvt-newtab-plus">+</span></div>
        <div class="zvt-text"><div class="zvt-tab-title">New tab</div></div>
      `;
      row.addEventListener("click", () => {
        void openNewTabAtTop();
      });
      return row;
    };

    const canUseCachedTree =
      !state.search.trim() &&
      tabs === state.tabs &&
      state.treeRenderCache &&
      state.treeRenderCache.sourceTabs === state.tabs;
    const cache = canUseCachedTree ? state.treeRenderCache : buildTreeRenderCacheFromTabs(tabs);

    if (!canUseCachedTree && !state.search.trim() && tabs === state.tabs) {
      state.treeRenderCache = cache;
    }

    const {
      pinnedTabs,
      regularTabs,
      levels,
      hasChildren,
      descendantCounts,
      collapsed,
    } = cache;
    state.visibleRegularOrder = regularTabs.map((tab) => tab.id);

    const topSticky = document.createElement("div");
    topSticky.className = "zvt-top-sticky";
    if (pinnedTabs.length) {
      const pinnedGrid = document.createElement("div");
      pinnedGrid.className = "zvt-pinned-grid";
      pinnedTabs.forEach((tab) => {
        pinnedGrid.appendChild(createTabRow(tab, true, 0));
      });
      topSticky.appendChild(pinnedGrid);
      const separator = document.createElement("div");
      separator.className = "zvt-separator";
      topSticky.appendChild(separator);
    }
    topSticky.appendChild(createNewTabRow());
    if (regularTabs.length) {
      const separator = document.createElement("div");
      separator.className = "zvt-separator";
      topSticky.appendChild(separator);
    }
    frag.appendChild(topSticky);

    regularTabs.forEach((tab) => {
      frag.appendChild(createTabRow(tab, false, levels.get(tab.id) || 0, {
        hasChildren: !!hasChildren.get(tab.id),
        descendantCount: descendantCounts.get(tab.id) || 0,
        collapsed: !!collapsed.get(tab.id),
      }));
    });

    if (!regularTabs.length) {
      const empty = document.createElement("div");
      empty.className = "zvt-status";
      empty.textContent = "No matching tabs";
      frag.appendChild(empty);
    }

    ui.list.innerHTML = "";
    ui.list.appendChild(frag);
    state.renderedRowByTabId = renderedRowByTabId;
    const pinnedGridEl = ui.list.querySelector(".zvt-pinned-grid");
    state.stickyPinnedHeight = pinnedGridEl ? Math.round(pinnedGridEl.getBoundingClientRect().height) : 0;

    const enteredRows = [];
    renderedRowByTabId.forEach((row, tabId) => {
      const prevTop = prevRowTops.get(tabId);
      if (prevTop == null) {
        enteredRows.push(row);
        return;
      }
      const deltaY = prevTop - row.offsetTop;
      if (Math.abs(deltaY) < 1) return;

      row.style.transition = "none";
      row.style.transform = `translateY(${deltaY}px)`;
      row.style.opacity = "0.995";
      requestAnimationFrame(() => {
        row.style.transition = "transform 170ms cubic-bezier(0.22, 1, 0.36, 1), opacity 170ms ease";
        row.style.transform = "";
        row.style.opacity = "";
        setTimeout(() => {
          if (!row.isConnected) return;
          row.style.transition = "";
        }, 190);
      });
    });

    if (enteredRows.length) {
      enteredRows.forEach((row) => row.classList.add("anim-enter"));
      requestAnimationFrame(() => {
        enteredRows.forEach((row) => row.classList.add("anim-enter-active"));
        setTimeout(() => {
          enteredRows.forEach((row) => {
            if (!row.isConnected) return;
            row.classList.remove("anim-enter", "anim-enter-active");
          });
        }, 210);
      });
    }

    renderTreeGuides(regularTabs, levels, hasChildren, collapsed);
    ensureActiveTabVisible();
  }

  function showStatus(message) {
    ui.status.hidden = false;
    ui.status.textContent = message;
  }

  function hideStatus() {
    ui.status.hidden = true;
    ui.status.textContent = "";
  }

  function flushRender() {
    if (state.renamingTabId != null) {
      // Keep inline rename input stable; render after edit finishes.
      scheduleRender(140);
      return;
    }
    state.renderTimer = null;
    state.renderPending = false;
    state.lastRenderAt = Date.now();
    renderTabs();
  }

  function scheduleRender(delay = 0) {
    const minDueIn = Math.max(0, RENDER_MIN_INTERVAL_MS - (Date.now() - state.lastRenderAt));
    const dueIn = Math.max(delay, minDueIn);
    state.renderPending = true;
    if (state.renderTimer) clearTimeout(state.renderTimer);
    state.renderTimer = setTimeout(() => {
      flushRender();
    }, dueIn);
  }

  function applyTabUpdatePatch(tabId, changeInfo) {
    const idx = state.tabIndexById.get(tabId);
    if (idx == null || idx < 0) return false;
    const tab = state.tabs[idx];
    if (!tab) return false;
    let changed = false;

    const assign = (key, value) => {
      if (tab[key] === value) return;
      tab[key] = value;
      changed = true;
    };

    if (changeInfo.title !== undefined) assign("title", changeInfo.title);
    // Keep favicon stable while loading; apply final icon after completion.
    if (changeInfo.favIconUrl !== undefined && tab.status !== "loading" && changeInfo.status !== "loading") {
      assign("favIconUrl", changeInfo.favIconUrl);
    }
    if (changeInfo.status !== undefined) {
      const prevStatus = tab.status;
      assign("status", changeInfo.status);
      if (prevStatus === "loading" && changeInfo.status === "complete" && changeInfo.favIconUrl !== undefined) {
        assign("favIconUrl", changeInfo.favIconUrl);
      }
    }
    if (changeInfo.active !== undefined) {
      assign("active", !!changeInfo.active);
      if (changeInfo.active) state.activeTabId = tab.id;
    }
    if (changeInfo.highlighted !== undefined) assign("highlighted", !!changeInfo.highlighted);
    if (changeInfo.audible !== undefined) assign("audible", changeInfo.audible);
    if (changeInfo.discarded !== undefined) assign("discarded", changeInfo.discarded);
    if (changeInfo.url !== undefined) assign("url", changeInfo.url);
    if (changeInfo.pinned !== undefined) assign("pinned", changeInfo.pinned);
    if (changeInfo.openerTabId !== undefined) assign("openerTabId", changeInfo.openerTabId);
    if (changeInfo.mutedInfo !== undefined) {
      const nextMuted = JSON.stringify(changeInfo.mutedInfo || null);
      const prevMuted = JSON.stringify(tab.mutedInfo || null);
      if (nextMuted !== prevMuted) {
        tab.mutedInfo = changeInfo.mutedInfo || null;
        changed = true;
      }
    }

    return changed;
  }

  function setActiveTabLocal(tabId, windowId = null) {
    if (tabId == null) return false;
    const targetIdx = state.tabIndexById.get(tabId);
    if (targetIdx == null) return false;
    const targetTab = state.tabs[targetIdx];
    if (!targetTab) return false;
    if (windowId != null && targetTab.windowId !== windowId) return false;

    let changed = false;
    const prevActiveId = state.activeTabId;
    if (prevActiveId != null && prevActiveId !== tabId) {
      const prevIdx = state.tabIndexById.get(prevActiveId);
      if (prevIdx != null) {
        const prevTab = state.tabs[prevIdx];
        if (prevTab && prevTab.active) {
          prevTab.active = false;
          changed = true;
        }
      }
    } else if (prevActiveId == null) {
      state.tabs.forEach((tab) => {
        if (tab.id !== tabId && tab.active) {
          tab.active = false;
          changed = true;
        }
      });
    }

    if (!targetTab.active) {
      targetTab.active = true;
      changed = true;
    }
    state.activeTabId = tabId;
    return changed;
  }

  async function placeNewChildTabAtTop(tab) {
    if (!hasTabsApi() || !tab || tab.id == null) return;
    if (tab.openerTabId == null || tab.openerTabId === tab.id) return;
    if (tab.pinned) return;

    let opener = getTabById(tab.openerTabId);
    if (!opener) {
      try {
        opener = await chrome.tabs.get(tab.openerTabId);
      } catch {
        opener = null;
      }
    }
    if (!opener || opener.windowId !== tab.windowId) return;
    const targetIndex = Math.max(0, Number(opener.index) + 1);
    if (Number(tab.index) === targetIndex) return;

    try {
      await chrome.tabs.move(tab.id, { index: targetIndex });
    } catch {}
  }

  function openSidebar() {
    state.open = true;
    ui.host.classList.add("open");
    if (state.initialized) fetchTabs();
  }

  function closeSidebar() {
    if (!state.autohide) return;
    state.open = false;
    ui.host.classList.remove("open");
  }

  function bindTabEvents() {
    if (!hasTabsApi()) return;

    const queueRefresh = (markDirty = false) => {
      if (!state.initialized) return;
      if (state.autohide && !state.open && !markDirty) return;
      if (markDirty) {
        state.treeDirty = true;
        state.treeRenderCache = null;
      }
      if (state.refreshTimer) clearTimeout(state.refreshTimer);
      let delay = markDirty ? 260 : 420;
      if (state.autohide && !state.open) delay += 220;
      state.refreshTimer = setTimeout(() => {
        state.refreshTimer = null;
        fetchTabs();
      }, delay);
    };

    chrome.tabs.onCreated.addListener((tab) => {
      if (tab && tab.id != null && !state.tabBirthRank.has(tab.id)) {
        state.tabBirthRank.set(tab.id, Date.now());
      }
      state.treeDirty = true;
      if (tab && tab.id != null && tab.openerTabId != null && tab.openerTabId !== tab.id) {
        let childNodeId = state.nodeIdByTabId.get(tab.id);
        if (!childNodeId) {
          childNodeId = generateTreeNodeId();
          state.nodeIdByTabId.set(tab.id, childNodeId);
        }
        const parentNodeId = state.nodeIdByTabId.get(tab.openerTabId);
        if (parentNodeId && parentNodeId !== childNodeId) {
          state.parentNodeByNodeId.set(childNodeId, parentNodeId);
        }
      }
      void placeNewChildTabAtTop(tab);
      queueRefresh(true);
    });
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      if (tabId != null) state.tabBirthRank.delete(tabId);
      if (tabId != null) state.noReturnTabs.delete(tabId);
      if (tabId != null) {
        state.treeDirty = true;
        state.collapsedTrees.delete(tabId);
        const removedNodeId = state.nodeIdByTabId.get(tabId);
        state.nodeIdByTabId.delete(tabId);
        if (removedNodeId) {
          state.parentNodeByNodeId.delete(removedNodeId);
          for (const [childNodeId, parentNodeId] of [...state.parentNodeByNodeId.entries()]) {
            if (parentNodeId === removedNodeId) state.parentNodeByNodeId.delete(childNodeId);
          }
        }
        if (!removeInfo || !removeInfo.isWindowClosing) {
          requestTreeSnapshotSave(220);
        }
        requestCollapsedTreesSave(220);
      }
      queueRefresh(true);
    });
    chrome.tabs.onMoved.addListener(() => queueRefresh(true));
    chrome.tabs.onHighlighted.addListener((highlightInfo) => {
      if (!state.initialized || !highlightInfo) return;
      const ids = Array.isArray(highlightInfo.tabIds) ? highlightInfo.tabIds : [];
      if (!ids.length) return;
      if (!state.tabs.length) return;
      const currentWindowId = state.tabs[0].windowId;
      if (Number(highlightInfo.windowId) !== Number(currentWindowId)) return;

      const liveIds = new Set(getWorkspaceScopedTabs(state.tabs).map((tab) => tab.id));
      const next = new Set();
      ids.forEach((id) => {
        if (liveIds.has(id)) next.add(id);
      });
      if (!next.size) return;
      const anchor = ids.find((id) => next.has(id)) || null;
      setSelectedTabs(next, anchor);
    });
    chrome.tabs.onAttached.addListener(async (tabId, attachInfo) => {
      const rule = state.noReturnTabs.get(tabId);
      if (rule) {
        if (Date.now() > rule.expiresAt) {
          state.noReturnTabs.delete(tabId);
        } else if (attachInfo && attachInfo.newWindowId === rule.sourceWindowId) {
          state.noReturnTabs.delete(tabId);
          try {
            await chrome.tabs.remove(tabId);
          } catch {}
          queueRefresh(true);
          return;
        }
      }
      queueRefresh(true);
    });
    chrome.tabs.onDetached.addListener(() => queueRefresh(true));
    chrome.tabs.onActivated.addListener((activeInfo) => {
      if (activeInfo && setActiveTabLocal(activeInfo.tabId, activeInfo.windowId)) {
        if (patchRenderedActiveRows()) {
          ensureActiveTabVisible();
        } else {
          scheduleRender(0);
        }
      }
      if (activeInfo) {
        const activeTab = getTabById(activeInfo.tabId);
        if (activeTab && rememberLastActiveTabForWorkspace(activeTab)) {
          saveCustomWorkspaceState();
        }
      }
      queueRefresh(false);
    });
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      const hasStructuralChange =
        changeInfo.pinned !== undefined ||
        changeInfo.openerTabId !== undefined ||
        changeInfo.url !== undefined ||
        changeInfo.discarded !== undefined;

      if (hasStructuralChange) {
        queueRefresh(true);
        return;
      }

      const hasVisualChange =
        changeInfo.status !== undefined ||
        changeInfo.title !== undefined ||
        changeInfo.favIconUrl !== undefined ||
        changeInfo.mutedInfo !== undefined ||
        changeInfo.audible !== undefined ||
        changeInfo.highlighted !== undefined;

      if (!hasVisualChange || !state.initialized) return;
      if (applyTabUpdatePatch(tabId, changeInfo)) {
        const tab = getTabById(tabId);
        const onlyNoisyVisualFields =
          changeInfo.status === undefined &&
          changeInfo.mutedInfo === undefined &&
          changeInfo.audible === undefined &&
          changeInfo.title !== undefined;
        const onlyFavIconUpdate =
          changeInfo.status === undefined &&
          changeInfo.mutedInfo === undefined &&
          changeInfo.audible === undefined &&
          changeInfo.favIconUrl !== undefined &&
          changeInfo.title === undefined;

        // Prevent spinner restart loops: loading tabs often emit rapid title/favicon updates.
        if (tab && tab.status === "loading" && (onlyNoisyVisualFields || onlyFavIconUpdate)) {
          patchRenderedTabRow(tabId);
          return;
        }
        if (!patchRenderedTabRow(tabId)) {
          scheduleRender(60);
        }
      }
    });
  }

  async function boot() {
    if (!document.body) {
      requestAnimationFrame(() => {
        void boot();
      });
      return;
    }

    if (await shouldSkipSidebarForCurrentWindow()) {
      return;
    }

    injectStyles();
    await refreshStatusBarDisplayMode();
    applyTopOffset();
    startTopOffsetWarmup();
    loadAutohideSetting();
    loadSidebarWidth();
    loadCollapsedTreesSetting();
    loadTreeSnapshotSetting();
    loadCustomTitlesSetting();
    loadCustomWorkspacesSetting();
    createLayout();
    syncThemeVarsFromVivaldi();
    state.contentRoot = findContentRoot();
    updateAutohideButton();
    if (!state.autohide) {
      applyPinnedLayout(true);
      openSidebar();
    }
    bindTabEvents();
    window.addEventListener("resize", scheduleTopOffsetUpdate);
    startUiObservers();
    state.topOffsetPollTimer = setInterval(() => scheduleTopOffsetUpdate(), 4200);
    state.themeSyncTimer = setInterval(() => syncThemeVarsFromVivaldi(), 9000);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) flushPendingSaves();
    });
    window.addEventListener("beforeunload", () => {
      flushPendingSaves();
      if (state.renderTimer) clearTimeout(state.renderTimer);
      if (state.refreshTimer) clearTimeout(state.refreshTimer);
      if (state.fetchCooldownTimer) clearTimeout(state.fetchCooldownTimer);
      if (state.topOffsetPollTimer) clearInterval(state.topOffsetPollTimer);
      if (state.topOffsetWarmupTimer) clearInterval(state.topOffsetWarmupTimer);
      if (state.statusBarModePollTimer) clearInterval(state.statusBarModePollTimer);
      if (state.themeSyncTimer) clearInterval(state.themeSyncTimer);
      if (state.uiObserver) {
        try {
          state.uiObserver.disconnect();
        } catch {}
        state.uiObserver = null;
      }
    });

    state.initialized = true;
    fetchTabs();

    state.statusBarModePollTimer = setInterval(() => {
      void refreshStatusBarDisplayMode().then(() => {
        scheduleTopOffsetUpdate();
      });
    }, 4500);

    // In Vivaldi UI mods, localStorage may be unstable between sessions.
    // Prefer Chrome storage when available and re-apply settings once loaded.
    loadPersistentSettings().then(() => {
      applySidebarWidth(state.width, false, false);
      updateAutohideButton();
      if (!state.autohide) {
        state.contentRoot = findContentRoot();
        applyPinnedLayout(true);
        openSidebar();
        ensurePinnedLayoutAfterStartup();
      } else {
        applyPinnedLayout(false);
        closeSidebar();
      }
      // Rebuild with persisted tree metadata after async storage finishes.
      fetchTabs();
    });
  }

  void boot();
})();

const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert')
const {
  createTabsApi,
  getConfiguredNewTabUrl,
  unwrapPrefValue,
  normalizeCustomUrl,
} = require('../src/adapters/tabs-api.js')

describe('tabs-api - New Tab Page preferences', () => {
  let originalVivaldi
  let originalChrome

  beforeEach(() => {
    originalVivaldi = global.vivaldi
    originalChrome = global.chrome
  })

  afterEach(() => {
    global.vivaldi = originalVivaldi
    global.chrome = originalChrome
  })

  describe('unwrapPrefValue', () => {
    it('unwraps { path, value } pref object correctly', () => {
      assert.strictEqual(unwrapPrefValue({ path: 'vivaldi.tabs.new_page.link', value: 4 }), 4)
      assert.strictEqual(unwrapPrefValue({ path: 'vivaldi.homepage', value: 'https://example.com' }), 'https://example.com')
    })

    it('returns raw primitive or array unchanged', () => {
      assert.strictEqual(unwrapPrefValue('hello'), 'hello')
      assert.strictEqual(unwrapPrefValue(42), 42)
      assert.strictEqual(unwrapPrefValue(null), null)
      assert.deepStrictEqual(unwrapPrefValue(['a', 'b']), ['a', 'b'])
    })
  })

  describe('normalizeCustomUrl', () => {
    it('prepends http:// if scheme is missing', () => {
      assert.strictEqual(normalizeCustomUrl('google.com'), 'http://google.com')
      assert.strictEqual(normalizeCustomUrl('intranet.local/dashboard'), 'http://intranet.local/dashboard')
    })

    it('preserves existing http://, https://, chrome://, or vivaldi:// scheme', () => {
      assert.strictEqual(normalizeCustomUrl('https://google.com'), 'https://google.com')
      assert.strictEqual(normalizeCustomUrl('vivaldi://settings/'), 'vivaldi://settings/')
      assert.strictEqual(normalizeCustomUrl('chrome://bookmarks/'), 'chrome://bookmarks/')
    })

    it('returns about:blank if empty or whitespace', () => {
      assert.strictEqual(normalizeCustomUrl(''), 'about:blank')
      assert.strictEqual(normalizeCustomUrl('   '), 'about:blank')
      assert.strictEqual(normalizeCustomUrl(null), 'about:blank')
    })
  })

  describe('getConfiguredNewTabUrl', () => {
    it('respects Start Page (0 / startpage)', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => ({ path, value: 0 }),
        },
      }
      const url = await getConfiguredNewTabUrl()
      assert.strictEqual(url, 'chrome://vivaldi-webui/startpage?section=Speed-dials')
    })

    it('respects Homepage (1 / homepage) returning unwrapped homepage value', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => {
            if (path === 'vivaldi.tabs.new_page.link') return { path, value: 1 }
            if (path === 'vivaldi.homepage') return { path, value: 'https://vivaldi.com' }
            return undefined
          },
        },
      }
      const url = await getConfiguredNewTabUrl()
      assert.strictEqual(url, 'https://vivaldi.com')
    })

    it('respects Blank Page (2 / blankpage) returning about:blank', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => ({ path, value: 2 }),
        },
      }
      const url = await getConfiguredNewTabUrl()
      assert.strictEqual(url, 'about:blank')
    })

    it('respects Extension (3 / extension) returning empty string', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => ({ path, value: 3 }),
        },
      }
      const url = await getConfiguredNewTabUrl()
      assert.strictEqual(url, '')
    })

    it('respects Specific Page (4 / custom) and normalizes URL missing scheme', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => {
            if (path === 'vivaldi.tabs.new_page.link') return { path, value: 4 }
            if (path === 'vivaldi.tabs.new_page.custom_url') return { path, value: 'news.ycombinator.com' }
            return undefined
          },
        },
      }
      const url = await getConfiguredNewTabUrl()
      assert.strictEqual(url, 'http://news.ycombinator.com')
    })

    it('respects Specific Page (4 / custom) with empty URL returning about:blank', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => {
            if (path === 'vivaldi.tabs.new_page.link') return { path, value: 4 }
            if (path === 'vivaldi.tabs.new_page.custom_url') return { path, value: '   ' }
            return undefined
          },
        },
      }
      const url = await getConfiguredNewTabUrl()
      assert.strictEqual(url, 'about:blank')
    })

    it('works with callback form of vivaldi.prefs.get as well', async () => {
      global.chrome = { runtime: {} }
      global.vivaldi = {
        prefs: {
          get: (path, cb) => {
            if (path === 'vivaldi.tabs.new_page.link') {
              cb({ path, value: 2 })
            }
          },
        },
      }
      const url = await getConfiguredNewTabUrl()
      assert.strictEqual(url, 'about:blank')
    })
  })

  describe('createTab and createChildTab integration', () => {
    it('createTab passes specific page custom url to tabsApi.create', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => {
            if (path === 'vivaldi.tabs.new_page.link') return { path, value: 4 }
            if (path === 'vivaldi.tabs.new_page.custom_url') return { path, value: 'https://duckduckgo.com' }
            return undefined
          },
        },
      }

      let createdProps = null
      let resolveCreated
      const createdPromise = new Promise(resolve => { resolveCreated = resolve })

      const fakeChromeTabs = {
        create: (props) => {
          createdProps = props
          resolveCreated(props)
        },
        query: (_q, cb) => cb([]),
        onCreated: { addListener: () => {} },
        onRemoved: { addListener: () => {} },
        onUpdated: { addListener: () => {} },
        onMoved: { addListener: () => {} },
        onAttached: { addListener: () => {} },
        onDetached: { addListener: () => {} },
        onActivated: { addListener: () => {} },
      }

      global.chrome = {
        tabs: fakeChromeTabs,
        windows: {},
        sessions: {},
        bookmarks: {},
      }
      const tabsApi = createTabsApi()
      tabsApi.createTab(1, { index: 0 })
      await createdPromise

      assert.ok(createdProps)
      assert.strictEqual(createdProps.url, 'https://duckduckgo.com')
    })

    it('createTab leaves url undefined when extension mode (3) is selected', async () => {
      global.vivaldi = {
        prefs: {
          get: async (path) => ({ path, value: 3 }),
        },
      }

      let createdProps = null
      let resolveCreated
      const createdPromise = new Promise(resolve => { resolveCreated = resolve })

      const fakeChromeTabs = {
        create: (props) => {
          createdProps = props
          resolveCreated(props)
        },
        query: (_q, cb) => cb([]),
        onCreated: { addListener: () => {} },
        onRemoved: { addListener: () => {} },
        onUpdated: { addListener: () => {} },
        onMoved: { addListener: () => {} },
        onAttached: { addListener: () => {} },
        onDetached: { addListener: () => {} },
        onActivated: { addListener: () => {} },
      }

      global.chrome = {
        tabs: fakeChromeTabs,
        windows: {},
        sessions: {},
        bookmarks: {},
      }
      const tabsApi = createTabsApi()
      tabsApi.createTab(1, { index: 0 })
      await createdPromise

      assert.ok(createdProps)
      assert.strictEqual(createdProps.url, undefined)
    })
  })
})

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  sanitizeTabForPrompt,
  sanitizeFolderName,
  fetchAvailableModels,
  groupTabsWithGemini,
  FALLBACK_MODELS,
} = require('../src/services/gemini-api.js')

describe('Gemini API Service', () => {
  describe('sanitizeTabForPrompt', () => {
    it('strips query parameters, hashes, and authentication tokens from URLs', () => {
      const tab = {
        id: 101,
        title: 'Vivaldi Browser Feature Request',
        url: 'https://forum.vivaldi.net/topic/12345/feature?auth_token=supersecret#comment-5',
      }
      const safe = sanitizeTabForPrompt(tab)
      assert.strictEqual(safe.id, 101)
      assert.strictEqual(safe.title, 'Vivaldi Browser Feature Request')
      assert.strictEqual(safe.domain, 'forum.vivaldi.net')
      assert.ok(!JSON.stringify(safe).includes('supersecret'))
      assert.ok(!JSON.stringify(safe).includes('comment-5'))
    })

    it('returns null for internal browser URLs to protect privacy', () => {
      const internalTabs = [
        { id: 1, title: 'Settings', url: 'vivaldi://settings' },
        { id: 2, title: 'Extensions', url: 'chrome://extensions' },
        { id: 3, title: 'Local File', url: 'file:///etc/hosts' },
        { id: 4, title: 'Extension Page', url: 'chrome-extension://xyz/options.html' },
      ]
      for (const tab of internalTabs) {
        assert.strictEqual(sanitizeTabForPrompt(tab), null)
      }
    })
  })

  describe('sanitizeFolderName', () => {
    it('cleans repetitive hallucinations, numbers, and runaway tokens', () => {
      const hallucination = '🤖 Штучний інтелект та пошукIQнеопублікованоінше00111222233334444555566667777888899990000111122223333444455556666777788'
      const cleaned = sanitizeFolderName(hallucination)
      assert.ok(cleaned.startsWith('🤖 Штучний інтелект та пошук'))
      assert.ok(!cleaned.includes('00111222'))
      assert.ok(!cleaned.includes('неопублікованоінше'))
      assert.ok(cleaned.length <= 35)
    })

    it('preserves clean normal folder names with emoji', () => {
      assert.strictEqual(sanitizeFolderName('🛒 Покупки & Замовлення'), '🛒 Покупки & Замовлення')
      assert.strictEqual(sanitizeFolderName('💻 Development'), '💻 Development')
      assert.strictEqual(sanitizeFolderName('🎬 YouTube & Media'), '🎬 YouTube & Media')
    })

    it('enforces reasonable length limit', () => {
      const longName = '📚 Дуже довга назва для папки з вкладок яка містить надто багато зайвих слів'
      const cleaned = sanitizeFolderName(longName)
      assert.ok(cleaned.length <= 35)
    })
  })

  describe('fetchAvailableModels', () => {
    it('returns models supporting generateContent from Gemini API', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          models: [
            { name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
            { name: 'models/gemini-2.5-pro', supportedGenerationMethods: ['generateContent'] },
          ]
        })
      })

      const models = await fetchAvailableModels('test-api-key', mockFetch)
      assert.deepStrictEqual(models, ['gemini-2.5-flash', 'gemini-2.5-pro'])
    })

    it('returns FALLBACK_MODELS when API request fails', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 403,
      })

      const models = await fetchAvailableModels('invalid-key', mockFetch)
      assert.deepStrictEqual(models, FALLBACK_MODELS)
    })
  })

  describe('groupTabsWithGemini', () => {
    it('sends sanitized tabs, existing folders, language directive, and parses response', async () => {
      let capturedUrl = null
      let capturedBody = null

      const mockFetch = async (url, options) => {
        capturedUrl = url
        capturedBody = JSON.parse(options.body)
        return {
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        groups: [
                          {
                            folderId: 50, // Existing folder
                            tabIds: [101]
                          },
                          {
                            newFolderName: '🛒 Покупки',
                            color: 'purple',
                            tabIds: [102, 103]
                          }
                        ]
                      })
                    }
                  ]
                }
              }
            ]
          })
        }
      }

      const tabsToGroup = [
        { id: 101, title: 'GitHub PR #17', url: 'https://github.com/org/repo/pull/17' },
        { id: 102, title: 'Amazon Keyboard', url: 'https://amazon.com/dp/B001' },
        { id: 103, title: 'eBay Mouse', url: 'https://ebay.com/itm/12345' },
      ]

      const existingFolders = [
        { id: 50, title: '💻 Dev' }
      ]

      const result = await groupTabsWithGemini({
        apiKey: 'test-key',
        model: 'gemini-2.5-flash',
        language: 'uk',
        ungroupedTabs: tabsToGroup,
        existingFolders,
        fetchFn: mockFetch,
      })

      assert.ok(capturedUrl.includes('gemini-2.5-flash'))
      assert.ok(capturedUrl.includes('test-key'))

      // Verify prompt content mentions language and existing folders
      const promptText = JSON.stringify(capturedBody)
      assert.ok(promptText.includes('Ukrainian') || promptText.includes('uk'))
      assert.ok(promptText.includes('💻 Dev'))
      assert.ok(promptText.includes('github.com'))

      // Verify parsed output
      assert.strictEqual(result.groups.length, 2)
      assert.strictEqual(result.groups[0].folderId, 50)
      assert.deepStrictEqual(result.groups[0].tabIds, [101])
      assert.strictEqual(result.groups[1].newFolderName, '🛒 Покупки')
      assert.strictEqual(result.groups[1].color, 'purple')
      assert.deepStrictEqual(result.groups[1].tabIds, [102, 103])
    })
  })
})

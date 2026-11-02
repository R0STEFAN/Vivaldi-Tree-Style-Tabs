const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.5-pro',
]

const FOLDER_COLORS = ['blue', 'purple', 'rose', 'orange', 'yellow', 'green', 'teal', 'grey']

const LANGUAGE_LABELS = {
  uk: 'Ukrainian',
  en: 'English',
  de: 'German',
  pl: 'Polish',
  es: 'Spanish',
  fr: 'French',
  auto: 'Automatic (match primary language of tabs)',
}

const BLOCKED_PROTOCOLS = new Set([
  'vivaldi:',
  'chrome:',
  'chrome-extension:',
  'file:',
  'about:',
  'data:',
  'javascript:',
  'view-source:',
])

function sanitizeTabForPrompt(tab) {
  if (!tab || typeof tab !== 'object' || !tab.url || typeof tab.url !== 'string') {
    return null
  }

  let parsedUrl
  try {
    parsedUrl = new URL(tab.url)
  } catch (_e) {
    return null
  }

  if (BLOCKED_PROTOCOLS.has(parsedUrl.protocol) || !['http:', 'https:'].includes(parsedUrl.protocol)) {
    return null
  }

  const domain = parsedUrl.hostname.replace(/^www\./i, '')
  const title = typeof tab.title === 'string' ? tab.title.trim().slice(0, 120) : domain

  return {
    id: Number(tab.id),
    title,
    domain,
  }
}

function sanitizeFolderName(rawName) {
  if (typeof rawName !== 'string') return ''
  let name = rawName.trim()

  // Separate Cyrillic and Latin script collisions (e.g. пошукIQ -> пошук IQ) without splitting camelCase (YouTube, GitHub)
  name = name.replace(/([а-яіїєґА-ЯІЇЄҐ])([a-zA-Z])/g, '$1 $2')
  name = name.replace(/([a-zA-Z])([а-яіїєґА-ЯІЇЄҐ])/g, '$1 $2')

  // Remove repetitive number sequences (e.g. 00111222...)
  name = name.replace(/[0-9]{3,}/g, '')

  // Remove repeated character bursts (e.g. 4+ of the same char)
  name = name.replace(/(.)\1{3,}/g, '$1')

  // Remove runaway concatenated words without spaces (>= 18 chars)
  name = name.replace(/\b\S{18,}\b/g, '')

  // Normalize spaces
  name = name.replace(/\s+/g, ' ').trim()

  // Strict length limit: up to 35 characters cleanly truncated at word boundary
  if (name.length > 35) {
    const cut = name.slice(0, 35)
    const lastSpace = cut.lastIndexOf(' ')
    name = lastSpace > 8 ? cut.slice(0, lastSpace) : cut
  }

  return name.trim()
}

async function fetchAvailableModels(apiKey, fetchFn = globalThis.fetch) {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return FALLBACK_MODELS.slice()
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`
    const res = await fetchFn(url, { method: 'GET' })
    if (!res.ok) {
      return FALLBACK_MODELS.slice()
    }

    const data = await res.json()
    if (!data || !Array.isArray(data.models)) {
      return FALLBACK_MODELS.slice()
    }

    const models = data.models
      .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name.replace(/^models\//, ''))
      .filter(name => name.includes('gemini') && !name.includes('vision') && !name.includes('embedding'))

    return models.length > 0 ? models : FALLBACK_MODELS.slice()
  } catch (error) {
    console.warn('[svb-gemini] failed to fetch available models', error)
    return FALLBACK_MODELS.slice()
  }
}

async function groupTabsWithGemini(options) {
  const {
    apiKey,
    model = 'gemini-2.5-flash',
    language = 'uk',
    ungroupedTabs = [],
    existingFolders = [],
    fetchFn = globalThis.fetch,
  } = options || {}

  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('Gemini API key is required')
  }

  const safeTabs = ungroupedTabs.map(sanitizeTabForPrompt).filter(Boolean)
  if (safeTabs.length === 0) {
    return { groups: [] }
  }

  const langInstruction = LANGUAGE_LABELS[language] || language || 'Ukrainian'

  const promptPayload = {
    systemInstruction: {
      parts: [
        {
          text: [
            `You are an expert browser tab organizer for Tree Style Tabs in Vivaldi.`,
            `Your task is to group browser tabs into clean, concise thematic folders.`,
            ``,
            `CRITICAL FOLDER NAME RULES:`,
            `- Folder names MUST be extremely brief: strictly 1 to 3 words (maximum 30 characters).`,
            `- Folder names MUST start with one relevant emoji followed by a concise category name in ${langInstruction} (e.g. "🤖 Штучний інтелект", "🛒 Покупки", "💻 Розробка", "📰 Новини").`,
            `- NEVER include random numbers, sequences, metadata, or run-on words in folder names.`,
          ].join('\n'),
        },
      ],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              `Group the provided browser tabs into logical, coherent thematic categories.`,
              ``,
              `IMPORTANT RULES:`,
              `1. Existing Folders: Check the existing folders first: ${JSON.stringify(existingFolders)}. If any tabs fit into an existing folder, return its "folderId" and add the tab IDs to it.`,
              `2. New Folders: Create a new folder ONLY if there are AT LEAST 2 tabs that belong together. Do not create folders for single isolated tabs! Solo tabs that do not fit into existing folders must be left ungrouped.`,
              `3. Naming: Name all new folders in ${langInstruction}. Each new folder name must be short (1-3 words) and begin with an appropriate emoji.`,
              `4. Colors: Assign a suitable color for new folders from this list: ${JSON.stringify(FOLDER_COLORS)}.`,
              ``,
              `Tabs to group:`,
              JSON.stringify(safeTabs, null, 2),
            ].join('\n'),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          groups: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                folderId: {
                  type: 'INTEGER',
                  description: 'ID of an existing folder if placing tabs into it',
                },
                newFolderName: {
                  type: 'STRING',
                  description: 'Short folder name (1-3 words, max 30 chars) starting with an emoji',
                },
                color: {
                  type: 'STRING',
                  description: 'Color of the new folder from the allowed palette',
                },
                tabIds: {
                  type: 'ARRAY',
                  items: { type: 'INTEGER' },
                  description: 'IDs of the tabs belonging to this group',
                },
              },
              required: ['tabIds'],
            },
          },
        },
        required: ['groups'],
      },
    },
  }

  const targetModel = model || 'gemini-2.5-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`

  const response = await fetchFn(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(promptPayload),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Gemini API error (${response.status}): ${errorBody || response.statusText}`)
  }

  const data = await response.json()
  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!candidateText) {
    return { groups: [] }
  }

  try {
    const parsed = JSON.parse(candidateText)
    const rawGroups = Array.isArray(parsed.groups) ? parsed.groups : []
    const groups = rawGroups
      .map(g => {
        const cleanedName = sanitizeFolderName(g.newFolderName)
        return {
          folderId: Number.isFinite(Number(g.folderId)) ? Number(g.folderId) : undefined,
          newFolderName: cleanedName || undefined,
          color: FOLDER_COLORS.includes(g.color) ? g.color : 'blue',
          tabIds: Array.isArray(g.tabIds) ? g.tabIds.map(Number).filter(Number.isFinite) : [],
        }
      })
      .filter(g => (g.folderId != null || g.newFolderName) && g.tabIds.length > 0)

    return { groups }
  } catch (parseError) {
    console.error('[svb-gemini] failed to parse Gemini JSON output', parseError, candidateText)
    throw new Error('Failed to parse AI grouping response')
  }
}

module.exports = {
  FALLBACK_MODELS,
  FOLDER_COLORS,
  LANGUAGE_LABELS,
  sanitizeTabForPrompt,
  sanitizeFolderName,
  fetchAvailableModels,
  groupTabsWithGemini,
}

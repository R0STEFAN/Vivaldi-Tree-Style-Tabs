const fs = require('node:fs')
const path = require('node:path')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { STYLE_TEXT } = require('../src/ui/styles.js')

describe('AI Grouping UI & Toast Notifications', () => {
  it('defines animated AI spinner styles', () => {
    assert.ok(STYLE_TEXT.includes('.svb-ai-spinner-icon'), 'Should define .svb-ai-spinner-icon')
    assert.ok(STYLE_TEXT.includes('@keyframes svb-spinner-rotate'), 'Should define svb-spinner-rotate keyframes')
  })

  it('defines toast notification styles and animations', () => {
    assert.ok(STYLE_TEXT.includes('.svb-toast-host'), 'Should define .svb-toast-host container')
    assert.ok(STYLE_TEXT.includes('.svb-toast'), 'Should define .svb-toast')
    assert.ok(STYLE_TEXT.includes('.svb-toast--success'), 'Should define .svb-toast--success')
    assert.ok(STYLE_TEXT.includes('.svb-toast--error'), 'Should define .svb-toast--error')
    assert.ok(STYLE_TEXT.includes('.svb-toast--warning'), 'Should define .svb-toast--warning')
    assert.ok(STYLE_TEXT.includes('.svb-toast--info'), 'Should define .svb-toast--info')
    assert.ok(STYLE_TEXT.includes('@keyframes svb-toast-in'), 'Should define svb-toast-in animation')
  })

  it('includes toast host and spinner in renderer template', () => {
    const renderSrc = fs.readFileSync(path.join(__dirname, '../src/ui/render.js'), 'utf-8')
    assert.ok(renderSrc.includes('<div class="svb-toast-host" aria-live="polite"></div>'), 'Shell should have toast-host')
    assert.ok(renderSrc.includes('renderAiSpinnerIcon()'), 'Renderer should use renderAiSpinnerIcon')
    assert.ok(renderSrc.includes('showToast('), 'Renderer should invoke showToast')
  })
})

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { STYLE_TEXT } = require('../src/ui/styles.js')

describe('Side Panel Coexistence - Styles', () => {
  it('defines --svb-panels-offset in CSS for shell and edge trigger', () => {
    assert.ok(STYLE_TEXT.includes('left: var(--svb-panels-offset, 0px) !important;'), 'left shell should offset by --svb-panels-offset')
    assert.ok(STYLE_TEXT.includes('right: var(--svb-panels-offset, 0px) !important;'), 'right shell should offset by --svb-panels-offset')
  })
})

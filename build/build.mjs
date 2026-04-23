import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const SRC_ROOT = path.join(ROOT, 'src')
const ENTRY = path.join(SRC_ROOT, 'entry.js')
const DIST_DIR = path.join(ROOT, 'dist')
const DIST_FILE = path.join(DIST_DIR, 'custom.js')

function normalizeModuleId(filePath) {
  return path.relative(SRC_ROOT, filePath).replace(/\\/g, '/')
}

function resolveImport(importerPath, request) {
  if (!request.startsWith('.')) throw new Error(`Only relative imports are supported: ${request}`)
  const candidate = path.resolve(path.dirname(importerPath), request)
  return path.extname(candidate) ? candidate : `${candidate}.js`
}

function collectModules(entryPath) {
  const modules = new Map()

  function visit(filePath) {
    const normalized = normalizeModuleId(filePath)
    if (modules.has(normalized)) return

    const source = fs.readFileSync(filePath, 'utf8')
    const deps = []
    const requireRe = /require\((['"])(.+?)\1\)/g
    let match

    while ((match = requireRe.exec(source))) {
      const request = match[2]
      const depPath = resolveImport(filePath, request)
      deps.push(depPath)
      visit(depPath)
    }

    modules.set(normalized, source)
  }

  visit(entryPath)
  return modules
}

function build() {
  const modules = collectModules(ENTRY)
  fs.mkdirSync(DIST_DIR, { recursive: true })

  const bundle = `(function(){\n` +
    `  const __modules = {\n${Array.from(modules.entries()).map(([id, code]) => {
      return `    ${JSON.stringify(id)}: function(require, module, exports) {\n${code}\n    }`
    }).join(',\n')}\n  };\n` +
    `  const __cache = {};\n` +
    `  function __resolve(parentId, request) {\n` +
    `    if (!request.startsWith('.')) return request;\n` +
    `    const parentParts = parentId.split('/');\n` +
    `    parentParts.pop();\n` +
    `    const reqParts = request.split('/');\n` +
    `    for (const part of reqParts) {\n` +
    `      if (!part || part === '.') continue;\n` +
    `      if (part === '..') parentParts.pop();\n` +
    `      else parentParts.push(part);\n` +
    `    }\n` +
    `    const resolved = parentParts.join('/');\n` +
    `    return resolved.endsWith('.js') ? resolved : resolved + '.js';\n` +
    `  }\n` +
    `  function __require(id) {\n` +
    `    if (__cache[id]) return __cache[id].exports;\n` +
    `    if (!__modules[id]) throw new Error('Module not found: ' + id);\n` +
    `    const module = { exports: {} };\n` +
    `    __cache[id] = module;\n` +
    `    __modules[id](function(request) { return __require(__resolve(id, request)); }, module, module.exports);\n` +
    `    return module.exports;\n` +
    `  }\n` +
    `  __require('entry.js');\n` +
    `})();\n`

  fs.writeFileSync(DIST_FILE, bundle, 'utf8')
  console.log(`Built ${path.relative(ROOT, DIST_FILE)}`)
}

function watch() {
  build()
  fs.watch(SRC_ROOT, { recursive: true }, (_eventType, fileName) => {
    if (!fileName || !fileName.endsWith('.js')) return
    try {
      build()
    } catch (error) {
      console.error(error)
    }
  })
  console.log('Watching src/**/*.js')
}

if (process.argv.includes('--watch')) watch()
else build()

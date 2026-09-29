// Run with Playwright available (or NODE_PATH), and optionally BROWSER_EXECUTABLE.
const { chromium } = require('playwright')
const fs = require('node:fs')
const assert = require('node:assert/strict')
const { STYLE_TEXT } = require(process.cwd() + '/src/ui/styles.js')
;(async () => {
 const browser = await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE || undefined,headless:true})
 try {
 const page = await browser.newPage()
 const errors = []
 page.on('pageerror',e=>errors.push(e.message))
 await page.setContent('<div class="svb-layout-host svb-mode-docked" style="--svb-rendered-width:170px"><div id="svb-root" class="svb-shell svb-autohide-icons is-revealed" style="width:170px;height:600px"></div></div>')
 await page.addStyleTag({content:STYLE_TEXT})
 for (const [name,file] of [['settings','src/store/settings-store.js'],['pinned','src/ui/pinned-grid.js'],['renderer','src/ui/render.js']]) {
  await page.addScriptTag({content:`{const module={exports:{}}; const require = name => name.includes('settings-store') ? window.settings : window.pinned; ${fs.readFileSync(file,'utf8')}\nwindow.${name}=module.exports;}`})
 }
 await page.evaluate(()=>{
  window.root=document.querySelector('#svb-root')
  window.state={ready:true,pinnedTabs:Array.from({length:10},(_,i)=>({id:i+1,title:String(i+1),pinned:true})), tabs:[], treeTabs:[], activeTabId:null}
  window.rendererInstance=renderer.createSidebarRenderer({root})
  rendererInstance.render(state)
  window.snapshot=()=>({height:document.querySelector('.svb-section--pinned').getBoundingClientRect().height, below:document.querySelector('.svb-section--fill').getBoundingClientRect().top, tabs:[...document.querySelectorAll('.svb-pinned-tab')].map(n=>({id:Number(n.dataset.tabId),top:n.getBoundingClientRect().top,left:n.getBoundingClientRect().left,visible:getComputedStyle(n).visibility==='visible', offsetTop:n.offsetTop}))})
 })
 await page.waitForTimeout(250)
 const expanded=await page.evaluate(()=>snapshot())
 assert.equal(new Set(expanded.tabs.map(t=>t.top)).size,2)
 await page.evaluate(()=>{root.classList.remove('is-revealed');root.style.width='42px'})
 for (const delay of [20,60,200]) {
  await page.waitForTimeout(delay)
  const narrow=await page.evaluate(()=>snapshot())
  assert.equal(narrow.height,expanded.height)
  assert.equal(narrow.below,expanded.below)
  assert.deepEqual(narrow.tabs.filter(t=>t.visible).map(t=>t.id),[1,6])
 }
 await page.evaluate(()=>{state={...state,activeTabId:8};rendererInstance.render(state)})
 let active=await page.evaluate(()=>snapshot())
 assert.deepEqual(active.tabs.filter(t=>t.visible).map(t=>t.id),[1,8])
 assert.equal(active.tabs[7].left,active.tabs[0].left)
 assert.equal(active.tabs[7].top,expanded.tabs[5].top)
 // A structural render must not double-translate the active representative via FLIP.
 await page.evaluate(()=>{
  state={...state,pinnedTabs:[...state.pinnedTabs,{id:11,title:'11',pinned:true}]}
  rendererInstance.render(state)
 })
 for (const delay of [0,30,220]) {
  if (delay) await page.waitForTimeout(delay)
  const structural=await page.evaluate(()=>snapshot())
  assert.equal(structural.tabs[7].left,structural.tabs[0].left)
 }
 await page.evaluate(()=>{
  state={...state,pinnedTabs:state.pinnedTabs.slice(0,10)}
  rendererInstance.render(state)
 })
 await page.waitForTimeout(250)

 await page.evaluate(()=>{root.parentElement.style.setProperty('--svb-rendered-width','106px')})
 await page.waitForTimeout(100)
 active=await page.evaluate(()=>snapshot())
 assert.deepEqual(active.tabs.filter(t=>t.visible).map(t=>t.id),[1,4,8,10])
 await page.evaluate(()=>{root.classList.add('is-revealed');root.style.width='106px'})
 await page.waitForTimeout(250)
 assert.equal((await page.evaluate(()=>snapshot())).tabs.filter(t=>t.visible).length,10)
 for (const right of [false,true]) {
  for (const unified of [false,true]) {
   await page.evaluate(({right,unified})=>{
    root.parentElement.classList.toggle('svb-position-right',right)
    root.classList.toggle('is-unified',unified)
    root.parentElement.style.setProperty('--svb-rendered-width','170px')
    root.style.width='170px'
    root.classList.add('is-revealed')
   },{right,unified})
   await page.waitForTimeout(220)
   const before=await page.evaluate(()=>snapshot())
   await page.evaluate(()=>{root.style.width='42px';root.classList.remove('is-revealed')})
   await page.waitForTimeout(220)
   const after=await page.evaluate(()=>snapshot())
   assert.equal(after.height,before.height)
   assert.equal(after.below,before.below)
   assert.deepEqual(after.tabs.filter(t=>t.visible).map(t=>t.id),[1,8])
   assert.equal(after.tabs[7].left,after.tabs[0].left)
  }
 }
 await page.evaluate(()=>rendererInstance.dispose())
 assert.deepEqual(errors,[])
 console.log('Browser geometry PASS: full renderer, collapse animation, active row, structural updates, resize, expand, both sides and frame styles.')
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})

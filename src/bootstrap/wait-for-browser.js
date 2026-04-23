function waitForBrowser() {
  return new Promise(resolve => {
    const tryResolve = () => {
      const app = document.querySelector('#app')
      const browser = document.querySelector('#browser')
      const mainInner = document.querySelector('#browser > #main > .inner')
      if (app && browser && mainInner) {
        resolve({ app, browser, mainInner })
        return true
      }
      return false
    }

    if (tryResolve()) return

    const observer = new MutationObserver(() => {
      if (!tryResolve()) return
      observer.disconnect()
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  })
}

module.exports = { waitForBrowser }

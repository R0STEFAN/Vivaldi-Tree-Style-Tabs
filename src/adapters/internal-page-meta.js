const START_PAGE_FAVICON_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#6fa8ff"/>' +
    '<path d="M12 7.25v9.5M7.25 12h9.5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>' +
    '</svg>'
  )

const SETTINGS_FAVICON_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path fill="#aeb6c2" d="M12 2.75a1 1 0 0 1 .98.8l.34 1.74a6.93 6.93 0 0 1 1.58.66l1.5-.95a1 1 0 0 1 1.24.13l1.5 1.5a1 1 0 0 1 .13 1.24l-.95 1.5c.28.5.5 1.03.66 1.58l1.74.34a1 1 0 0 1 .8.98v2.12a1 1 0 0 1-.8.98l-1.74.34a6.93 6.93 0 0 1-.66 1.58l.95 1.5a1 1 0 0 1-.13 1.24l-1.5 1.5a1 1 0 0 1-1.24.13l-1.5-.95a6.93 6.93 0 0 1-1.58.66l-.34 1.74a1 1 0 0 1-.98.8H10.9a1 1 0 0 1-.98-.8l-.34-1.74a6.93 6.93 0 0 1-1.58-.66l-1.5.95a1 1 0 0 1-1.24-.13l-1.5-1.5a1 1 0 0 1-.13-1.24l.95-1.5a6.93 6.93 0 0 1-.66-1.58l-1.74-.34a1 1 0 0 1-.8-.98v-2.12a1 1 0 0 1 .8-.98l1.74-.34c.16-.55.38-1.08.66-1.58l-.95-1.5a1 1 0 0 1 .13-1.24l1.5-1.5a1 1 0 0 1 1.24-.13l1.5.95c.5-.28 1.03-.5 1.58-.66l.34-1.74a1 1 0 0 1 .98-.8H12Zm-.04 5.1a4.15 4.15 0 1 0 0 8.3 4.15 4.15 0 0 0 0-8.3Zm0 1.9a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Z"/>' +
    '</svg>'
  )

function isStartPageUrl(url) {
  return typeof url === 'string' && url.startsWith('chrome://vivaldi-webui/startpage')
}

function isSettingsUrl(url) {
  if (typeof url !== 'string' || !url) return false

  return (
    url.startsWith('vivaldi://settings') ||
    url.startsWith('chrome://settings') ||
    url.includes('/components/settings/') ||
    url.includes('/settings.html') ||
    url.includes('/settings/settings') ||
    url.includes('settings.html')
  )
}

function getInternalPageTitle(url) {
  if (isStartPageUrl(url)) return 'Start Page'
  if (isSettingsUrl(url)) return 'Налаштування'
  return ''
}

function getInternalPageFaviconUrl(url) {
  if (isStartPageUrl(url)) return START_PAGE_FAVICON_DATA_URL
  if (isSettingsUrl(url)) return SETTINGS_FAVICON_DATA_URL
  return ''
}

module.exports = {
  getInternalPageFaviconUrl,
  getInternalPageTitle,
  isSettingsUrl,
  isStartPageUrl,
}

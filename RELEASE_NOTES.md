# Release Notes (v2.3.3)

This release fixes an issue where the vertical tabs panel ignored native Vivaldi New Tab Page settings and always opened the Start Page.

---

## 🚀 What's New & Fixed in v2.3.3

### ⚙️ Respect Native Vivaldi "New Tab Page" Preference
* **Unwrap Vivaldi Preference Objects**: Fixed an issue where `vivaldi.prefs.get()` returns a wrapped object `{ path, value }` instead of a primitive value. Previously, this caused `String(value)` to evaluate to `"[object Object]"`, failing preference matches and forcing new tabs to fall back to the Start Page (Speed Dials).
* **Support All New Tab Page Configurations**: The mod panel's New Tab (`+`) button and "New Child Tab" action now strictly respect the settings configured in `Settings > Tabs > New Tab Page`:
  * **Start Page / Speed Dial**
  * **Homepage** (resolves configured `vivaldi.homepage`)
  * **Blank Page** (`about:blank`)
  * **Specific Page** (resolves configured `vivaldi.tabs.new_page.custom_url`)
  * **Controlled by Extension** (delegates new tab opening to active new tab override extensions)
* **Custom URL Normalization**: Automatically prepends `http://` if the user configured a custom URL without an explicit protocol scheme (e.g. `google.com` or `intranet.local`), preventing relative URI resolution errors, and safely defaults to `about:blank` if the custom URL field is empty.
* **Dual API Compatibility**: Handles both Promise-based and callback-based `vivaldi.prefs.get` invocations across Vivaldi versions.

---

## 📦 Automated Tests
* Full test suite passing with **122 automated unit and integration tests** (including 14 new tests covering all New Tab Page settings, URL normalization, and API unwrapping).

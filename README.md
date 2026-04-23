# TreeTabsVivaldi

TreeTabsVivaldi is a custom Vivaldi browser UI mod that adds a Sidebery-inspired vertical tree tab panel to the left side of the browser window.

It is not a browser extension. It is a `custom.js` UI modification loaded into Vivaldi's `window.html`.

## What It Does

- Adds a vertical tab panel with a Sidebery-like visual style.
- Supports hierarchical tree tabs with nested parent/child relations.
- Persists tree structure and collapsed/expanded state across browser restarts.
- Synchronizes with native Vivaldi workspaces.
- Keeps the native tab order aligned with the custom tree order.
- Supports pinned tabs, tab renaming, tab colors, mute/unmute, duplicate, close actions, and custom context menus.
- Supports multi-select and drag-and-drop between tree levels.
- Supports moving tabs or whole trees to another workspace or a new window.
- Supports saving a tree as a Vivaldi bookmarks folder and restoring it later.
- Supports Vivaldi native tiling from the custom multi-selection.
- Supports a pinned/auto-hide panel mode and resizable panel width.
- Hides itself during fullscreen video/browser fullscreen.

## Project Structure

```text
vivaldi-mod/
  src/              Source modules
  build/            Custom bundler
  dist/custom.js    Built Vivaldi mod bundle
  package.json      Build scripts
```

The source code is modular, but the final output is a single file:

```text
dist/custom.js
```

## Install Ready Build

Use this if you only want to install the already built mod.

1. Close Vivaldi.

2. Locate Vivaldi's browser UI resources directory.

Common locations:

```text
Linux stable:
/opt/vivaldi/resources/vivaldi

Linux snapshot:
/opt/vivaldi-snapshot/resources/vivaldi

Windows:
%LOCALAPPDATA%\Vivaldi\Application\<version>\resources\vivaldi

macOS:
/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework/Versions/<version>/Resources/vivaldi
```

3. Back up `window.html`.

Example on Linux:

```bash
sudo cp /opt/vivaldi/resources/vivaldi/window.html /opt/vivaldi/resources/vivaldi/window.html.bak
```

4. Copy the built bundle:

```bash
sudo cp dist/custom.js /opt/vivaldi/resources/vivaldi/custom.js
```

5. Add the script to `window.html` before the closing `</body>` tag if it is not already there:

```html
<script src="custom.js"></script>
```

6. Start Vivaldi.

After every Vivaldi update, the application resources folder may be replaced. If the mod disappears, repeat the copy/injection steps.

## Developer Setup

Install dependencies:

```bash
cd vivaldi-mod
npm install
```

Build once:

```bash
npm run build
```

Watch source files and rebuild automatically:

```bash
npm run watch
```

The build command writes:

```text
vivaldi-mod/dist/custom.js
```

## Developer Copy Workflow

For local development on Linux stable Vivaldi:

```bash
cd vivaldi-mod
npm run build

VIVALDI_DIR="/opt/vivaldi/resources/vivaldi"
sudo cp dist/custom.js "$VIVALDI_DIR/custom.js"
```

If `window.html` does not already include the mod script, add it once:

```bash
VIVALDI_DIR="/opt/vivaldi/resources/vivaldi"
grep -q 'custom.js' "$VIVALDI_DIR/window.html" || \
  sudo sed -i 's#</body>#  <script src="custom.js"></script>\n</body>#' "$VIVALDI_DIR/window.html"
```

Then restart Vivaldi.

For Vivaldi Snapshot, change the path:

```bash
VIVALDI_DIR="/opt/vivaldi-snapshot/resources/vivaldi"
```

## Recommended Vivaldi Settings

The mod is designed to replace the native tab strip visually. You can keep the native tab strip enabled while testing, but for normal use it is recommended to hide or move the native tab bar through Vivaldi settings.

Native Vivaldi workspaces remain supported and are used by the custom panel.

## Important Notes

- This mod relies on Vivaldi-specific browser APIs and some internal runtime behavior.
- A Vivaldi update can break parts of the integration, especially workspace, tiling, or window-moving features.
- Always keep a backup of the original `window.html`.
- This project is intended for users who are comfortable modifying Vivaldi's application files.

## Build Output

The repository should commit source files and may optionally include the latest `dist/custom.js` build for direct installation.

To regenerate the bundle:

```bash
npm run build
```

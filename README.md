# TreeTabsVivaldi

TreeTabsVivaldi is a custom Vivaldi browser UI mod that adds a Sidebery-inspired vertical tree tab panel to the left side of the browser window.

It is not a browser extension. It is a `custom.js` UI modification loaded into Vivaldi's `window.html`.

## 🔥 Latest Updates (v2.0)

- **Native Windows Auto-Updater (`svb-updater.exe`)**: A lightweight background tray application that automatically checks for mod updates on GitHub, fetches release notes, and interactively asks if you want to install them. It completely automates the hassle of manually copying files after every Vivaldi update!
- **Folders for Tabs**: You can now group your tabs into fully functional, collapsible folders (just like Sidebery) that integrate seamlessly with the native Vivaldi workspace system.
- **Enhanced Context Menu**: The custom context menu has been completely redesigned. It now supports bulk actions for multiple selected tabs, moving entire trees between workspaces/windows, saving trees as Vivaldi bookmarks, and closing entire subtrees safely.
- **Improved Stability & Anti-Orphan Logic**: Deeply improved tab synchronization prevents ghost tabs and infinite loops when Vivaldi naturally moves tabs between workspaces. Context locks prevent UI flickering during rapid bulk tab operations.

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

## Automation Scripts (Recommended)

To simplify the installation and maintain the mod after browser updates, you can use the provided automation scripts.

### Linux (Arch-based)

The project includes an automatic installer that sets up a Pacman Hook to keep the mod active after system updates.

1. **Build the project:**
   ```bash
   npm run build
   ```
2. **Run the installer:**
   ```bash
   bash install-linux.sh
   ```
   *What it does:*
   - Copies `custom.js` to `~/.local/share/vivaldi-patch/`.
   - Creates a patching script that injects the mod into Vivaldi's `window.html`.
   - Sets up a **Pacman Hook** (`/etc/pacman.d/hooks/vivaldi-patch.hook`) that automatically re-applies the patch every time Vivaldi is updated via the package manager.

If you don't want the hook and just want a one-time patch, you can use:
```bash
sudo bash patch-linux.sh
```

### macOS

The repo includes `install-macos.sh` and `uninstall-macos.sh`, plus matching npm scripts.

1. **Install:**
   ```bash
   npm run install:macos
   ```
   *What it does:*
   - Runs `npm run build` to produce a fresh `dist/custom.js`.
   - Resolves the Vivaldi resources dir (default `/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi`).
   - Backs up `window.html` to `window.html.bak` (only the first time, so the pristine original is preserved across re-installs).
   - Copies `dist/custom.js` into the resources dir.
   - Injects `<script src="custom.js"></script>` before `</body>` in `window.html`.
   - Auto-detects whether `sudo` is needed based on file ownership and only escalates if necessary.

2. **Uninstall:**
   ```bash
   npm run uninstall:macos
   ```
   Restores `window.html` from `window.html.bak` if present, otherwise surgically removes the injected `<script>` line, then deletes `custom.js`.

3. **Custom Vivaldi paths** (e.g. Vivaldi Snapshot):
   ```bash
   bash install-macos.sh /Applications/Vivaldi\ Snapshot.app
   bash uninstall-macos.sh /Applications/Vivaldi\ Snapshot.app
   ```

*Notes:*
- After every Vivaldi auto-update the resources directory is replaced, wiping the mod. Re-run `npm run install:macos` to reapply.
- Modifying files inside `Vivaldi.app` invalidates the code signature. macOS may show a Gatekeeper warning on first launch after install; dismiss it once and Vivaldi continues to work normally.
- Pass `-y` / `--yes` to skip the "Vivaldi is currently running" prompt.

### Windows

A batch script is provided to automatically find the latest Vivaldi version folder and apply the mod.

1. **Build the project:**
   ```bash
   npm run build
   ```
2. **Run the patcher:**
   - Double-click `patch-windows.bat` or run it from CMD/PowerShell.
   *What it does:*
   - Automatically detects the Vivaldi installation path (User or System-wide).
   - Finds the latest versioned folder (e.g., `6.6.3271.48`).
   - Copies `dist/custom.js` to the resources folder.
   - Modifies `window.html` to include the script tag.

*Note: Since Windows updates Vivaldi by creating new versioned folders, you will need to run `patch-windows.bat` again after each browser update.*

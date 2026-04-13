# Tree Style Vertical Tabs for Vivaldi

Full custom vertical tab sidebar rendered directly inside Vivaldi UI, Tree tabs with parent/child relationships


This mod is a `custom.js`-based Vivaldi UI modification. It is injected directly into Vivaldi's `window.html` and does not use an iframe wrapper.

## What You Need

- A working Vivaldi installation
- Access to the Vivaldi application files
- The file [`custom.js`](./custom.js)
- Permission to edit `window.html`

## Important Notes Before Installation

- Make a backup of `window.html` before editing it.
- After most Vivaldi updates, the application version folder may change. If that happens, you may need to copy the mod again and re-add the script tag.
- This mod changes the browser UI, not website content.
- If Vivaldi is running while you edit the files, fully restart it after installation.

## Installation Overview

The installation is the same on every OS:

1. Find Vivaldi's `window.html`
2. Copy `custom.js` into the same folder as `window.html`
3. Add a script tag for `custom.js` near the end of `window.html`
4. Save the file
5. Restart Vivaldi

Use this script tag:

```html
<script src="custom.js"></script>
```

Place it before the closing `</body>` tag in `window.html`.

Example:

```html
  ...
  <script src="bundle.js"></script>
  <script src="custom.js"></script>
</body>
```

## Windows Installation

Typical Vivaldi paths:

- `C:\Program Files\Vivaldi\Application\<version>\resources\vivaldi\window.html`
- `C:\Users\<YourUser>\AppData\Local\Vivaldi\Application\<version>\resources\vivaldi\window.html`

Steps:

1. Close Vivaldi.
2. Open the Vivaldi application folder.
3. Go to `Application\<version>\resources\vivaldi\`.
4. Back up `window.html`.
5. Copy [`custom.js`](./custom.js) into that same `vivaldi` folder.
6. Open `window.html` in a text editor.
7. Add:

```html
<script src="custom.js"></script>
```

8. Save the file.
9. Start Vivaldi again.

If Vivaldi was installed in `Program Files`, you may need administrator rights to save the file.

## Linux Installation

Typical Vivaldi paths:

- `/opt/vivaldi/resources/vivaldi/window.html`
- `/usr/share/vivaldi/resources/vivaldi/window.html`
- `/opt/vivaldi-snapshot/resources/vivaldi/window.html`

Steps:

1. Close Vivaldi.
2. Open the Vivaldi resources directory.
3. Back up `window.html`.
4. Copy [`custom.js`](./custom.js) into the same `vivaldi` folder.
5. Edit `window.html`.
6. Add:

```html
<script src="custom.js"></script>
```

7. Save the file.
8. Restart Vivaldi.

You may need elevated permissions depending on how Vivaldi was installed.

Example:

```bash
sudo cp custom.js /opt/vivaldi/resources/vivaldi/
sudo nano /opt/vivaldi/resources/vivaldi/window.html
```

## macOS Installation

Typical Vivaldi path:

- `/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi/window.html`

Steps:

1. Close Vivaldi.
2. In Finder, open `Applications`.
3. Right-click `Vivaldi.app` and choose `Show Package Contents`.
4. Navigate to:
   `Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi/`
5. Back up `window.html`.
6. Copy [`custom.js`](./custom.js) into the same folder.
7. Open `window.html` in a text editor.
8. Add:

```html
<script src="custom.js"></script>
```

9. Save the file.
10. Reopen Vivaldi.

Depending on your system setup, macOS may ask for administrator credentials.

## How to Verify the Mod Loaded

After restarting Vivaldi, check the following:

- the custom vertical sidebar appears
- the sidebar reacts to hover/autohide behavior
- the workspace selector is visible
- tab tree behavior is available
- the new tab button and tab actions work from the custom panel

If the mod does not load:

1. Make sure `custom.js` is in the same folder as `window.html`
2. Make sure the script tag was added correctly
3. Make sure the script tag is inside `<body>` and before `</body>`
4. Restart Vivaldi completely
5. Recheck the installation path after a browser update

## Key Features

- Full custom vertical tab sidebar rendered directly inside Vivaldi UI
- Sidebar height and offsets adapt to Vivaldi UI layout changes
- Automatic layout adaptation for bookmark bar visibility
- Automatic layout adaptation for status bar visibility and mode
- Theme-aware styling based on Vivaldi theme colors
- Works with both dark and light Vivaldi themes
- Autohide mode and pinned mode
- Resizable sidebar width with saved state between browser restarts
- Search panel for filtering tabs
- Custom workspaces with:
  - workspace switching
  - workspace creation
  - workspace editing
  - workspace deletion
  - moving tabs between workspaces
- Tree tabs with parent/child relationships
- Collapse and expand controls for trees
- Collapse all trees in the current workspace
- Persistent tree structure and collapsed state across restarts
- Pinned tabs displayed in a compact icon grid
- Drag and drop for:
  - regular tabs
  - trees
  - multi-selected tabs
  - moving tabs into and out of trees
- Multi-selection with keyboard modifiers
- Multi-selection synced with Vivaldi's native tab selection model
- Support for selecting multiple tabs for Vivaldi's native Tile/Grid tab layout feature
- Custom tab context menu
- Move tabs to another workspace from the context menu
- Rename tabs with double click
- Internal Vivaldi pages handled with custom labels and icons
- New tabs open to Vivaldi Start Page
- Tree-aware movement of tabs across custom workspaces
- Loading and muted-state indicators on tab icons
- Hover tooltip with tab title and URL

## Maintenance

- Keep a backup of your modified `window.html`
- Recheck the install path after every major Vivaldi update
- If Vivaldi replaces the version folder, repeat the installation in the new folder

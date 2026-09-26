# Vivaldi Tree Style Tabs Updater

This is a background client written in Go that automatically tracks updates for Vivaldi Browser and the SVB Tree Style Tabs mod.

## Features
- **Real-time Vivaldi intercept:** Uses `fsnotify` to listen for Vivaldi updates. Patches the browser automatically before you even restart it!
- **Mod Updates:** Periodically checks GitHub releases for new versions of the mod, downloads `mod.zip`, and automatically installs it.
- **System Tray:** A neat little system tray icon to manually force an update check or patch Vivaldi.

## Building (If you have Go installed)

```
cd updater
go mod tidy
go build -ldflags "-H=windowsgui" -o svb-updater.exe .
```

*Note: `-ldflags "-H=windowsgui"` prevents a console window from popping up when the program runs.*

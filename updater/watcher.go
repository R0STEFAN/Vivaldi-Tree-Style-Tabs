package main

import (
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/fsnotify/fsnotify"
)

// WatchVivaldi monitors the Vivaldi Application directory for new version folders
func WatchVivaldi(appPath string, onUpdated func()) error {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return err
	}

	go func() {
		defer watcher.Close()
		var debounceTimer *time.Timer

		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				// We look for Create events for directories (which usually means a new version folder like 6.8.3381.46)
				if event.Has(fsnotify.Create) {
					baseName := filepath.Base(event.Name)
					
					// Simple check if it looks like a version folder (dots and numbers)
					if strings.Contains(baseName, ".") && !strings.HasSuffix(baseName, ".tmp") {
						log.Printf("Detected new potential version folder: %s", baseName)
						
						// Debounce: wait a bit for the installer to finish copying files before patching
						if debounceTimer != nil {
							debounceTimer.Stop()
						}
						
						debounceTimer = time.AfterFunc(10*time.Second, func() {
							log.Println("Triggering auto-patching...")
							onUpdated()
						})
					}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Printf("watcher error: %v", err)
			}
		}
	}()

	return watcher.Add(appPath)
}

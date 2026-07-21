package main

import (
	"log"
	"os"
	"time"
)

func main() {
	// Initialize logging
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	log.Println("SvbTabs Updater started")

	// Check if this is the first run
	cfg := LoadConfig()
	if cfg.LatestVersion == "" && cfg.LastCheck.IsZero() {
		// First run: enable autostart by default
		if err := SetAutostart(true); err != nil {
			log.Printf("Failed to enable autostart on first run: %v", err)
		} else {
			log.Println("Autostart enabled by default on first run")
		}
		// Save an initial config so we don't trigger this again
		cfg.LatestVersion = "init"
		SaveConfig(cfg)
	}

	// Create callbacks
	onCheckUpdate := func() {
		UpdateStatus("Checking for updates...")
		cfg := LoadConfig()
		
		latestTag, downloadUrl, err := CheckForUpdates(cfg.LatestVersion)
		if err != nil {
			log.Printf("Error checking for updates: %v", err)
			UpdateStatus("Update check failed")
			return
		}

		// If Vivaldi is unpatched (e.g., fresh install), we must download even if versions match
		needsPatch := !IsVivaldiPatched()
		if downloadUrl == "" && !needsPatch {
			log.Println("No new updates found and Vivaldi is already patched")
			UpdateStatus("Up to date")
			
			cfg.LastCheck = time.Now()
			SaveConfig(cfg)
			return
		}

		if downloadUrl == "" && needsPatch {
			// Version matches, but we need to re-download because files are missing.
			// Let's explicitly fetch the latest release again to get the URL
			log.Println("Vivaldi is unpatched. Forcing re-download of current version.")
			latestTag, downloadUrl, err = CheckForUpdates("") // pass empty to force url return
			if err != nil || downloadUrl == "" {
				log.Printf("Failed to get download URL for forcing patch: %v", err)
				UpdateStatus("Patch failed")
				return
			}
		}

		log.Printf("Found version to apply: %s. Downloading...", latestTag)
		UpdateStatus("Downloading " + latestTag + "...")
		
		tmpDir, err := DownloadAndExtract(downloadUrl)
		if err != nil {
			log.Printf("Error downloading update: %v", err)
			UpdateStatus("Download failed")
			return
		}
		defer os.RemoveAll(tmpDir)

		UpdateStatus("Patching Vivaldi...")
		err = PatchVivaldi(tmpDir)
		if err != nil {
			log.Printf("Error patching Vivaldi: %v", err)
			UpdateStatus("Patch failed")
			return
		}

		log.Println("Successfully updated and patched!")
		UpdateStatus("Up to date (" + latestTag + ")")
		
		cfg.LatestVersion = latestTag
		cfg.LastCheck = time.Now()
		SaveConfig(cfg)
	}

	onForcePatch := func() {
		UpdateStatus("Patching Vivaldi...")
		
		// In a forced patch, we just want to ensure browser.html is patched.
		// If we don't have the mod files locally, we might need to just inject the script tag
		// assuming the files are already there, or we can trigger a full update check.
		// For now, we'll try to patch using a dummy empty dir, which will just inject the script tag
		// and skip missing files.
		err := PatchVivaldi("")
		if err != nil {
			log.Printf("Force patch failed: %v", err)
			UpdateStatus("Patch failed")
		} else {
			log.Println("Force patch successful")
			UpdateStatus("Active")
		}
	}

	onQuit := func() {
		log.Println("Exiting...")
		os.Exit(0)
	}

	// Start File Watcher
	appPath, err := FindVivaldiAppPath()
	if err == nil {
		log.Printf("Found Vivaldi at: %s", appPath)
		err = WatchVivaldi(appPath, func() {
			log.Println("Vivaldi update detected! Re-patching...")
			onForcePatch()
		})
		if err != nil {
			log.Printf("Failed to start file watcher: %v", err)
		} else {
			log.Println("Watching Vivaldi directory for updates")
		}
	} else {
		log.Printf("Could not find Vivaldi installation: %v", err)
	}

	// Periodically check GitHub for mod updates (e.g., every 4 hours)
	go func() {
		// Do an initial check 3 seconds after startup
		time.Sleep(3 * time.Second)
		onCheckUpdate()

		for {
			time.Sleep(4 * time.Hour)
			onCheckUpdate()
		}
	}()

	// Start Systray (blocking call)
	InitSystray(onCheckUpdate, onForcePatch, onQuit)
}

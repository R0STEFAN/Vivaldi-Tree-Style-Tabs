package main

import (
	"log"
	"os"
	"time"

	"golang.org/x/sys/windows"
)

func main() {
	// Initialize logging
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	log.Println("SvbTabs Updater started")

	// Single Instance Check using Windows Mutex
	mutexName, _ := windows.UTF16PtrFromString("SvbTabsUpdater_SingleInstance_Mutex")
	handle, err := windows.CreateMutex(nil, false, mutexName)
	if err != nil {
		if err == windows.ERROR_ALREADY_EXISTS {
			log.Println("Updater is already running. Exiting...")
			NotifyUser("Updater is already running", "Another instance of SvbTabs Updater is already running in the system tray.")
			os.Exit(0)
		}
	}
	defer windows.CloseHandle(handle)

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
	onCheckUpdate := func(isManual bool) {
		UpdateStatus("Checking for updates...")
		cfg := LoadConfig()
		
		latestTag, downloadUrl, releaseNotes, err := CheckForUpdates(cfg.LatestVersion)
		if err != nil {
			log.Printf("Error checking for updates: %v", err)
			UpdateStatus("Update check failed")
			if isManual {
				NotifyUser("Error", "Update check failed: "+err.Error())
			}
			return
		}

		// If Vivaldi is unpatched (e.g., fresh install), we must download even if versions match
		needsPatch := !IsVivaldiPatched()
		if downloadUrl == "" && !needsPatch {
			log.Println("No new updates found and Vivaldi is already patched")
			UpdateStatus("Up to date")
			if isManual {
				NotifyUser("Up to Date", "You have the latest version of the mod.")
			}
			
			cfg.LastCheck = time.Now()
			SaveConfig(cfg)
			return
		}

		if downloadUrl == "" && needsPatch {
			// Version matches, but we need to re-download because files are missing.
			log.Println("Vivaldi is unpatched. Forcing re-download of current version.")
			latestTag, downloadUrl, releaseNotes, err = CheckForUpdates("") // pass empty to force url return
			if err != nil || downloadUrl == "" {
				log.Printf("Failed to get download URL for forcing patch: %v", err)
				UpdateStatus("Patch failed")
				NotifyUser("Error", "Failed to get download URL. Ensure the latest release has a mod.zip file attached.")
				return
			}
		}

		log.Printf("Found version to apply: %s. Prompting user...", latestTag)
		
		// Prompt the user interactively!
		if !AskUserToUpdate(latestTag, releaseNotes) {
			log.Println("User declined the update.")
			UpdateStatus("Update declined")
			return
		}

		UpdateStatus("Downloading " + latestTag + "...")
		NotifyUser("Update Starting", "Downloading Vivaldi Tree Style Tabs version "+latestTag)
		
		tmpDir, err := DownloadAndExtract(downloadUrl)
		if err != nil {
			log.Printf("Error downloading update: %v", err)
			UpdateStatus("Download failed")
			NotifyUser("Error", "Failed to download update: "+err.Error())
			return
		}
		defer os.RemoveAll(tmpDir)

		UpdateStatus("Patching Vivaldi...")
		err = PatchVivaldi(tmpDir)
		if err != nil {
			log.Printf("Error patching Vivaldi: %v", err)
			UpdateStatus("Patch failed")
			NotifyUser("Error", "Failed to patch Vivaldi: "+err.Error())
			return
		}

		log.Println("Successfully updated and patched!")
		UpdateStatus("Up to date (" + latestTag + ")")
		NotifyUser("Success", "Vivaldi successfully patched! Please restart your browser.")
		
		cfg.LatestVersion = latestTag
		cfg.LastCheck = time.Now()
		SaveConfig(cfg)
	}

	onForcePatch := func() {
		UpdateStatus("Patching Vivaldi...")
		
		err := PatchVivaldi("")
		if err != nil {
			log.Printf("Force patch failed: %v", err)
			UpdateStatus("Patch failed")
			NotifyUser("Error", "Force patch failed: "+err.Error())
		} else {
			log.Println("Force patch successful")
			UpdateStatus("Active")
			NotifyUser("Success", "Vivaldi successfully patched! Please restart your browser.")
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
		onCheckUpdate(false)

		for {
			time.Sleep(4 * time.Hour)
			onCheckUpdate(false)
		}
	}()

	// Start Systray (blocking call)
	InitSystray(onCheckUpdate, onForcePatch, onQuit)
}

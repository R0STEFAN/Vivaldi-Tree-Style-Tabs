package main

import (
	"log"

	"fyne.io/systray"
)

var (
	mStatus      *systray.MenuItem
	mCheckUpdate *systray.MenuItem
	mForcePatch  *systray.MenuItem
	mAutostart   *systray.MenuItem
	mQuit        *systray.MenuItem
)

func InitSystray(
	onCheckUpdate func(),
	onForcePatch func(),
	onQuit func(),
) {
	systray.Run(func() {
		onReady(onCheckUpdate, onForcePatch, onQuit)
	}, onExit)
}

func onReady(
	onCheckUpdate func(),
	onForcePatch func(),
	onQuit func(),
) {
	// Set icon (you would normally load an icon byte slice here, we will just set a title for now if icon fails)
	systray.SetTitle("SvbTabs Updater")
	systray.SetTooltip("Vivaldi Tree Style Tabs Updater")

	mStatus = systray.AddMenuItem("Status: Active", "Current status of the updater")
	mStatus.Disable()

	systray.AddSeparator()

	mCheckUpdate = systray.AddMenuItem("Check for Mod Updates", "Check GitHub for new releases")
	mForcePatch = systray.AddMenuItem("Force Patch Vivaldi", "Manually patch the current Vivaldi installation")
	
	systray.AddSeparator()
	
	mAutostart = systray.AddMenuItemCheckbox("Run at system startup", "Start this updater automatically with Windows", IsAutostartEnabled())
	
	systray.AddSeparator()
	
	mQuit = systray.AddMenuItem("Quit", "Exit the updater")

	go func() {
		for {
			select {
			case <-mCheckUpdate.ClickedCh:
				log.Println("User clicked: Check for Mod Updates")
				onCheckUpdate()
			case <-mForcePatch.ClickedCh:
				log.Println("User clicked: Force Patch Vivaldi")
				onForcePatch()
			case <-mAutostart.ClickedCh:
				log.Println("User clicked: Toggle Autostart")
				if mAutostart.Checked() {
					if err := SetAutostart(false); err == nil {
						mAutostart.Uncheck()
					} else {
						log.Printf("Failed to disable autostart: %v", err)
					}
				} else {
					if err := SetAutostart(true); err == nil {
						mAutostart.Check()
					} else {
						log.Printf("Failed to enable autostart: %v", err)
					}
				}
			case <-mQuit.ClickedCh:
				log.Println("User clicked: Quit")
				systray.Quit()
				onQuit()
				return
			}
		}
	}()
}

func onExit() {
	// Cleanup if needed
}

func UpdateStatus(status string) {
	if mStatus != nil {
		mStatus.SetTitle("Status: " + status)
	}
}

func SetAutostartMenuState(enabled bool) {
	if mAutostart != nil {
		if enabled {
			mAutostart.Check()
		} else {
			mAutostart.Uncheck()
		}
	}
}

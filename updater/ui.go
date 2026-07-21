package main

import (
	"log"

	"github.com/fyne-io/systray"
)

var (
	mStatus      *systray.MenuItem
	mCheckUpdate *systray.MenuItem
	mForcePatch  *systray.MenuItem
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

package main

import (
	"log"
	_ "embed"

	"fyne.io/systray"
	"github.com/go-toast/toast"
)

//go:embed icon.ico
var iconBytes []byte

var (
	mStatus      *systray.MenuItem
	mCheckUpdate *systray.MenuItem
	mForcePatch  *systray.MenuItem
	mAutostart   *systray.MenuItem
	mQuit        *systray.MenuItem
)

// NotifyUser shows a Windows 10/11 toast notification
func NotifyUser(title, message string) {
	notification := toast.Notification{
		AppID:   "SvbTabs Updater",
		Title:   title,
		Message: message,
	}
	err := notification.Push()
	if err != nil {
		log.Printf("Failed to push notification: %v", err)
	}
}

func InitSystray(
	onCheckUpdate func(isManual bool),
	onForcePatch func(),
	onQuit func(),
) {
	systray.Run(func() {
		onReady(onCheckUpdate, onForcePatch, onQuit)
	}, onExit)
}

func onReady(
	onCheckUpdate func(isManual bool),
	onForcePatch func(),
	onQuit func(),
) {
	systray.SetIcon(iconBytes)
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
				onCheckUpdate(true)
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

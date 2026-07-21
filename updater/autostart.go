package main

import (
	"os"
	"os/exec"
	"strings"
)

const registryKey = `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
const appName = "SvbTreeTabsUpdater"

// IsAutostartEnabled checks if the app is in the Windows startup registry
func IsAutostartEnabled() bool {
	cmd := exec.Command("reg", "query", registryKey, "/v", appName)
	err := cmd.Run()
	// If the command succeeds, the value exists
	return err == nil
}

// SetAutostart enables or disables the Windows startup entry
func SetAutostart(enable bool) error {
	if enable {
		// Get current executable path
		exePath, err := os.Executable()
		if err != nil {
			return err
		}
		// Put quotes around the path to handle spaces
		exePath = `"` + exePath + `"`

		cmd := exec.Command("reg", "add", registryKey, "/v", appName, "/t", "REG_SZ", "/d", exePath, "/f")
		return cmd.Run()
	} else {
		cmd := exec.Command("reg", "delete", registryKey, "/v", appName, "/f")
		return cmd.Run()
	}
}

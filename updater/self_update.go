package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
)

// CleanupOldUpdater removes the .old executable left over from a previous update, if it exists
func CleanupOldUpdater() {
	exePath, err := os.Executable()
	if err != nil {
		return
	}
	oldPath := exePath + ".old"
	if _, err := os.Stat(oldPath); err == nil {
		err := os.Remove(oldPath)
		if err != nil {
			log.Printf("Failed to delete old updater file %s: %v", oldPath, err)
		} else {
			log.Printf("Successfully deleted old updater file: %s", oldPath)
		}
	}
}

// SelfUpdate attempts to replace the current executable with a new one
// and restarts the application.
func SelfUpdate(newExePath string) error {
	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("could not get executable path: %v", err)
	}

	oldPath := exePath + ".old"

	// 1. Rename the current executable to .old
	// If an old file already exists from a failed cleanup, try to remove it first
	os.Remove(oldPath) 
	
	err = os.Rename(exePath, oldPath)
	if err != nil {
		return fmt.Errorf("failed to rename current executable: %v", err)
	}

	// 2. Copy the new executable to the original path
	err = CopyFile(newExePath, exePath)
	if err != nil {
		// Attempt to rollback if copy fails
		os.Rename(oldPath, exePath)
		return fmt.Errorf("failed to copy new executable: %v", err)
	}

	// 3. Start the new executable
	cmd := exec.Command(exePath)
	// Make sure it runs detached from the current process
	err = cmd.Start()
	if err != nil {
		return fmt.Errorf("failed to start new executable: %v", err)
	}

	return nil
}

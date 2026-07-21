package main

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
)

// FindVivaldiAppPath returns the path to Vivaldi/Application
func FindVivaldiAppPath() (string, error) {
	localApp, err := os.UserConfigDir() // Often AppData/Roaming, we need AppData/Local
	if err == nil {
		localApp = filepath.Join(filepath.Dir(localApp), "Local")
		path := filepath.Join(localApp, "Vivaldi", "Application")
		if _, err := os.Stat(path); err == nil {
			return path, nil
		}
	}
	
	progFiles := os.Getenv("ProgramFiles")
	if progFiles != "" {
		path := filepath.Join(progFiles, "Vivaldi", "Application")
		if _, err := os.Stat(path); err == nil {
			return path, nil
		}
	}
	
	progFiles86 := os.Getenv("ProgramFiles(x86)")
	if progFiles86 != "" {
		path := filepath.Join(progFiles86, "Vivaldi", "Application")
		if _, err := os.Stat(path); err == nil {
			return path, nil
		}
	}

	return "", fmt.Errorf("Vivaldi not found")
}

// GetLatestVersionPath returns the path to the newest version folder (e.g. 6.8.3381.46)
func GetLatestVersionPath(appPath string) (string, error) {
	entries, err := os.ReadDir(appPath)
	if err != nil {
		return "", err
	}

	versionRegex := regexp.MustCompile(`^\d+\.\d+\.\d+\.\d+$`)
	var latest string
	for _, entry := range entries {
		if entry.IsDir() && versionRegex.MatchString(entry.Name()) {
			// Basic string compare works because version numbers are zero-padded or we just take the latest lexicographically
			// For a safer check, we could parse parts, but string compare is usually enough for Vivaldi versioning
			if entry.Name() > latest {
				latest = entry.Name()
			}
		}
	}

	if latest == "" {
		return "", fmt.Errorf("no version folder found")
	}

	return filepath.Join(appPath, latest), nil
}

// CopyFile copies a single file from src to dst
func CopyFile(src, dst string) error {
	data, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, data, 0644)
}

// PatchBrowserHtml ensures that <script src="custom.js"></script> is injected
func PatchBrowserHtml(versionPath string) error {
	indexPath := filepath.Join(versionPath, "resources", "vivaldi", "browser.html")
	if _, err := os.Stat(indexPath); err != nil {
		return fmt.Errorf("browser.html not found: %v", err)
	}

	data, err := os.ReadFile(indexPath)
	if err != nil {
		return err
	}

	injection := []byte(`<script src="custom.js"></script>`)
	if bytes.Contains(data, injection) {
		return nil // Already patched
	}

	// Insert before </body>
	bodyClose := []byte(`</body>`)
	if !bytes.Contains(data, bodyClose) {
		return fmt.Errorf("</body> not found in browser.html")
	}

	newData := bytes.Replace(data, bodyClose, append(injection, bodyClose...), 1)
	return os.WriteFile(indexPath, newData, 0644)
}

// PatchVivaldi is a helper that copies files from a source directory and patches Vivaldi
func PatchVivaldi(modDir string) error {
	appPath, err := FindVivaldiAppPath()
	if err != nil {
		return err
	}

	versionPath, err := GetLatestVersionPath(appPath)
	if err != nil {
		return err
	}

	uiPath := filepath.Join(versionPath, "resources", "vivaldi")
	if err := os.MkdirAll(uiPath, 0755); err != nil {
		return err
	}

	filesToCopy := []string{"custom.js", "svb-folder.html"}
	for _, f := range filesToCopy {
		src := filepath.Join(modDir, f)
		dst := filepath.Join(uiPath, f)
		
		// Ignore copy errors if the source file is missing (e.g., manual patch mode where files aren't in modDir)
		if _, err := os.Stat(src); err == nil {
			if err := CopyFile(src, dst); err != nil {
				return fmt.Errorf("failed to copy %s: %v", f, err)
			}
		}
	}

	return PatchBrowserHtml(versionPath)
}

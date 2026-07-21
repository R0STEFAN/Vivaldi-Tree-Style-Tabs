package main

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

type GitHubRelease struct {
	TagName string        `json:"tag_name"`
	Assets  []GitHubAsset `json:"assets"`
}

type GitHubAsset struct {
	Name               string `json:"name"`
	BrowserDownloadUrl string `json:"browser_download_url"`
}

const RepoUrl = "https://api.github.com/repos/R0STEFAN/Vivaldi-Tree-Style-Tabs/releases/latest"

// CheckForUpdates returns the latest tag and the download URL for mod.zip if available
func CheckForUpdates(currentVersion string) (string, string, error) {
	resp, err := http.Get(RepoUrl)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	var release GitHubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return "", "", err
	}

	if release.TagName == currentVersion {
		return currentVersion, "", nil // Up to date
	}

	var downloadUrl string
	for _, asset := range release.Assets {
		if asset.Name == "mod.zip" {
			downloadUrl = asset.BrowserDownloadUrl
			break
		}
	}

	if downloadUrl == "" {
		return release.TagName, "", fmt.Errorf("mod.zip asset not found in latest release")
	}

	return release.TagName, downloadUrl, nil
}

// DownloadAndExtract downloads the zip and extracts it to a temporary directory
func DownloadAndExtract(downloadUrl string) (string, error) {
	resp, err := http.Get(downloadUrl)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	tmpFile, err := os.CreateTemp("", "svb-mod-*.zip")
	if err != nil {
		return "", err
	}
	defer tmpFile.Close()

	_, err = io.Copy(tmpFile, resp.Body)
	if err != nil {
		return "", err
	}
	tmpFile.Close()

	tmpDir, err := os.MkdirTemp("", "svb-mod-extracted-*")
	if err != nil {
		return "", err
	}

	err = Unzip(tmpFile.Name(), tmpDir)
	if err != nil {
		return "", err
	}

	_ = os.Remove(tmpFile.Name())
	return tmpDir, nil
}

// Unzip extracts a zip file to the destination directory
func Unzip(src string, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)
		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			return err
		}

		_, err = io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

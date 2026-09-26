package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"
)

type Config struct {
	LatestVersion string    `json:"latest_version"`
	LastCheck     time.Time `json:"last_check"`
}

func getConfigPath() (string, error) {
	appData, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(appData, "SvbTreeTabs")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	return filepath.Join(dir, "updater_config.json"), nil
}

func LoadConfig() Config {
	cfg := Config{}
	path, err := getConfigPath()
	if err != nil {
		return cfg
	}
	data, err := os.ReadFile(path)
	if err == nil {
		_ = json.Unmarshal(data, &cfg)
	}
	return cfg
}

func SaveConfig(cfg Config) {
	path, err := getConfigPath()
	if err != nil {
		return
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err == nil {
		_ = os.WriteFile(path, data, 0644)
	}
}

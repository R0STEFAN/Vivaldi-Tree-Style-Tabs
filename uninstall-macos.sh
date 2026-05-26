#!/usr/bin/env bash
#
# Remove the TreeTabsVivaldi mod from a macOS Vivaldi.app.
#
# Usage:
#   ./uninstall-macos.sh                                  # default /Applications/Vivaldi.app
#   ./uninstall-macos.sh /Applications/Vivaldi\ Snapshot.app
#   ./uninstall-macos.sh --app=/path/to/Vivaldi.app
#
# Flags:
#   -y, --yes    Don't prompt if Vivaldi is currently running.
#   -h, --help   Show this help.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/macos-common.sh
source "$REPO_DIR/scripts/lib/macos-common.sh"

print_usage() {
  cat <<'EOF'
Remove the TreeTabsVivaldi mod from a macOS Vivaldi.app.

Usage:
  uninstall-macos.sh                                  # default /Applications/Vivaldi.app
  uninstall-macos.sh /Applications/Vivaldi\ Snapshot.app
  uninstall-macos.sh --app=/path/to/Vivaldi.app

Flags:
  -y, --yes    Don't prompt if Vivaldi is currently running.
  -h, --help   Show this help.
EOF
}

main() {
  parse_args "$@"
  resolve_paths

  log_info "Vivaldi.app:    $VIVALDI_APP"
  log_info "Resources dir:  $RESOURCES_DIR"

  local has_custom_js="false"
  local html_patched="false"
  [[ -f "$CUSTOM_JS_DEST" ]] && has_custom_js="true"
  window_html_is_patched && html_patched="true"

  if [[ "$has_custom_js" == "false" && "$html_patched" == "false" ]]; then
    log_ok "Mod is not installed; nothing to do."
    exit 0
  fi

  verify_writable
  confirm_if_vivaldi_running

  if [[ -f "$WINDOW_HTML_BAK" ]]; then
    log_info "Restoring window.html from window.html.bak"
    $SUDO mv "$WINDOW_HTML_BAK" "$WINDOW_HTML"
  elif [[ "$html_patched" == "true" ]]; then
    log_warn "window.html.bak not found (Vivaldi may have updated and replaced it)."
    log_warn "Falling back to surgical removal of the injected <script> tag."
    strip_script_tag
    if window_html_is_patched; then
      die "Failed to remove custom.js reference from window.html."
    fi
  fi

  if [[ -f "$CUSTOM_JS_DEST" ]]; then
    log_info "Removing $CUSTOM_JS_DEST"
    $SUDO rm -f "$CUSTOM_JS_DEST"
  fi

  log_ok "Uninstall complete."
  cat <<EOF

Note:
  - If you granted your terminal "App Management" permission to run this
    script, you can revoke it now: System Settings → Privacy & Security →
    App Management → toggle your terminal off.
EOF
}

main "$@"

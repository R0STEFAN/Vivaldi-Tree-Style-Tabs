#!/usr/bin/env bash
#
# Install the TreeTabsVivaldi mod into a macOS Vivaldi.app.
#
# Usage:
#   ./install-macos.sh                                  # default /Applications/Vivaldi.app
#   ./install-macos.sh /Applications/Vivaldi\ Snapshot.app
#   ./install-macos.sh --app=/path/to/Vivaldi.app
#   VIVALDI_APP_ENV=/path/to/Vivaldi.app ./install-macos.sh
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
Install the TreeTabsVivaldi mod into a macOS Vivaldi.app.

Usage:
  install-macos.sh                                  # default /Applications/Vivaldi.app
  install-macos.sh /Applications/Vivaldi\ Snapshot.app
  install-macos.sh --app=/path/to/Vivaldi.app
  VIVALDI_APP_ENV=/path/to/Vivaldi.app install-macos.sh

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

  log_info "Building dist/custom.js (npm run build)..."
  (cd "$REPO_DIR" && npm run build)

  local custom_js_src="$REPO_DIR/dist/custom.js"
  [[ -f "$custom_js_src" ]] \
    || die "Build did not produce $custom_js_src"

  verify_writable
  confirm_if_vivaldi_running

  if [[ ! -f "$WINDOW_HTML_BAK" ]]; then
    log_info "Backing up window.html -> window.html.bak"
    $SUDO cp "$WINDOW_HTML" "$WINDOW_HTML_BAK"
  else
    log_info "window.html.bak already exists; leaving the pristine backup in place."
  fi

  log_info "Copying custom.js -> $CUSTOM_JS_DEST"
  $SUDO cp "$custom_js_src" "$CUSTOM_JS_DEST"

  if window_html_is_patched; then
    log_info "window.html already references custom.js; no injection needed."
  else
    log_info "Injecting <script src=\"custom.js\"></script> into window.html"
    inject_script_tag
    window_html_is_patched \
      || die "Injection appeared to succeed but custom.js is not in window.html."
  fi

  log_ok "Install complete."
  cat <<EOF

Notes:
  - Vivaldi auto-updates replace the Resources directory. After each browser
    update, re-run: npm run install:macos
  - Modifying Vivaldi.app contents invalidates its code signature. On the next
    launch macOS may show a Gatekeeper warning; you can dismiss it and Vivaldi
    will continue to work normally.
  - To remove the mod:  npm run uninstall:macos
EOF
}

main "$@"

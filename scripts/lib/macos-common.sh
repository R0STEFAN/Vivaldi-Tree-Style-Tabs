# shellcheck shell=bash
#
# Shared helpers for install-macos.sh / uninstall-macos.sh.
# Source this file; do not execute it directly.

DEFAULT_VIVALDI_APP="/Applications/Vivaldi.app"
RESOURCES_SUBPATH="Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi"

# Global state set by the helpers below.
VIVALDI_APP=""
RESOURCES_DIR=""
WINDOW_HTML=""
WINDOW_HTML_BAK=""
CUSTOM_JS_DEST=""
FOLDER_HTML_DEST=""
SUDO=""
ASSUME_YES="${ASSUME_YES:-0}"

log_info()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
log_warn()  { printf '\033[1;33m==>\033[0m %s\n' "$*" >&2; }
log_ok()    { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
die()       { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

# Parse the optional Vivaldi.app path argument and --yes flag.
# Precedence: --app=/positional argument > $VIVALDI_APP env var > default.
parse_args() {
  local app_override=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -y|--yes)        ASSUME_YES=1 ;;
      --app=*)         app_override="${1#--app=}" ;;
      --app)           shift; app_override="${1:-}" ;;
      -h|--help)       print_usage; exit 0 ;;
      -*)              die "unknown flag: $1" ;;
      *)               app_override="$1" ;;
    esac
    shift
  done

  if [[ -n "$app_override" ]]; then
    VIVALDI_APP="$app_override"
  elif [[ -n "${VIVALDI_APP_ENV:-}" ]]; then
    VIVALDI_APP="$VIVALDI_APP_ENV"
  else
    VIVALDI_APP="$DEFAULT_VIVALDI_APP"
  fi
}

# Validate the Vivaldi.app path and populate the path globals.
resolve_paths() {
  [[ -d "$VIVALDI_APP" ]] \
    || die "Vivaldi.app not found at: $VIVALDI_APP
Pass a custom path, e.g.:  $0 /Applications/Vivaldi\\ Snapshot.app"

  RESOURCES_DIR="$VIVALDI_APP/$RESOURCES_SUBPATH"
  WINDOW_HTML="$RESOURCES_DIR/window.html"
  WINDOW_HTML_BAK="$RESOURCES_DIR/window.html.bak"
  CUSTOM_JS_DEST="$RESOURCES_DIR/custom.js"
  FOLDER_HTML_DEST="$RESOURCES_DIR/svb-folder.html"

  [[ -d "$RESOURCES_DIR" ]] \
    || die "Vivaldi resources dir missing: $RESOURCES_DIR
The Vivaldi version layout may have changed."

  [[ -f "$WINDOW_HTML" ]] \
    || die "window.html missing: $WINDOW_HTML"
}

# Confirm we can actually write inside the Vivaldi resources directory.
# A plain `[[ -w ]]` check is misleading on macOS Ventura+: Unix permissions
# may say writable while the kernel-level App Management TCC restriction still
# blocks writes with EPERM. We do a real touch probe instead, and on failure
# print actionable instructions. Sets the global SUDO to "" on success.
verify_writable() {
  local probe="$RESOURCES_DIR/.tts-write-probe.$$"
  local err
  if err="$(touch "$probe" 2>&1)"; then
    rm -f "$probe"
    SUDO=""
    return
  fi

  local has_provenance=0
  if xattr "$VIVALDI_APP" 2>/dev/null | grep -q '^com\.apple\.provenance$'; then
    has_provenance=1
  fi
  local owner
  owner="$(stat -f '%Su' "$VIVALDI_APP" 2>/dev/null || echo unknown)"

  cat >&2 <<EOF
$(printf '\033[1;31merror:\033[0m') cannot write to the Vivaldi resources directory:
  $err
EOF

  if [[ "$has_provenance" == "1" ]]; then
    cat >&2 <<'EOF'

Vivaldi.app carries the com.apple.provenance extended attribute, so macOS
App Management (TCC) is blocking writes to the bundle. This is enforced at
the kernel level — Unix permissions and sudo do not bypass it.

Fix — grant your terminal "App Management" permission:

  1. System Settings  →  Privacy & Security  →  App Management.
     This is a DIFFERENT entry from "Developer Tools"; granting Developer
     Tools will not help. Look specifically for "App Management".
  2. Click + (or toggle on) and add your terminal app — e.g. Terminal.app,
     iTerm.app, Ghostty.app, WezTerm.app, Warp.app, etc.
  3. Fully quit the terminal (Cmd-Q, not just close the window) and reopen.
     TCC re-evaluates the permission only at process launch.
  4. Re-run this script.

After installing (or uninstalling), it is good hygiene to revoke the
permission again:  System Settings  →  Privacy & Security  →  App
Management → toggle your terminal back off (or remove it with "-").
You only need it while running install-macos.sh / uninstall-macos.sh.
EOF
  else
    cat >&2 <<EOF

Vivaldi.app is owned by "$owner" and is not tagged with com.apple.provenance,
so the write was likely blocked by plain Unix permissions. Try:

  sudo $0 $*
EOF
  fi
  exit 1
}

# Warn (and optionally prompt) if Vivaldi is currently running.
confirm_if_vivaldi_running() {
  if pgrep -x Vivaldi >/dev/null 2>&1; then
    log_warn "Vivaldi is currently running."
    if [[ "$ASSUME_YES" == "1" ]]; then
      log_warn "--yes given; continuing anyway."
      return
    fi
    printf 'Continue anyway? Changes apply on next launch. [y/N] '
    local reply
    read -r reply
    case "$reply" in
      y|Y|yes|YES) ;;
      *) die "aborted by user" ;;
    esac
  fi
}

# True if window.html currently references custom.js.
window_html_is_patched() {
  grep -q 'custom\.js' "$WINDOW_HTML"
}

# Inject <script src="custom.js"></script> before </body>.
# Uses BSD sed (macOS) in-place syntax. Idempotent: caller should check first.
inject_script_tag() {
  $SUDO sed -i '' \
    's#</body>#  <script src="custom.js"></script>\'$'\n''</body>#' \
    "$WINDOW_HTML"
}

# Strip the injected <script src="custom.js"></script> line from window.html.
strip_script_tag() {
  $SUDO sed -i '' '/<script src="custom\.js"><\/script>/d' "$WINDOW_HTML"
}

#!/bin/bash

# Vivaldi Patcher for Arch Linux
# Path to window.html in Vivaldi resources
WINDOW_HTML="/opt/vivaldi/resources/vivaldi/window.html"
CUSTOM_JS_DEST="/opt/vivaldi/resources/vivaldi/custom.js"

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SCRIPT_PATH="$DIR/dist/custom.js"

# Check if script is run with sudo
if [ "$EUID" -ne 0 ]; then 
  echo "Будь ласка, запустіть скрипт через sudo: sudo $0"
  exit 1
fi

if [ ! -f "$WINDOW_HTML" ]; then
  echo "Помилка: Не знайдено $WINDOW_HTML. Перевірте шлях до Vivaldi."
  exit 1
fi

# Copy custom.js to the resources folder
if [ -f "$SCRIPT_PATH" ]; then
  cp "$SCRIPT_PATH" "$CUSTOM_JS_DEST"
  echo "Файл custom.js скопійовано до $CUSTOM_JS_DEST"
else
  echo "Попередження: Файл dist/custom.js не знайдено. Переконайтеся, що ви зібрали проект (npm run build)."
fi

# Patch window.html if not already patched
if grep -q "custom.js" "$WINDOW_HTML"; then
  echo "window.html вже містить підключення custom.js"
else
  # Add script tag before </body>
  sed -i 's/<\/body>/<script src="custom.js"><\/script><\/body>/' "$WINDOW_HTML"
  echo "Скрипт успішно підключено у window.html"
fi

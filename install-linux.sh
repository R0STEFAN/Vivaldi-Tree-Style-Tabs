#!/bin/bash

# Vivaldi Auto-Patch Installer for Arch Linux
INSTALL_DIR="$HOME/.local/share/vivaldi-patch"
HOOK_DIR="/etc/pacman.d/hooks"
HOOK_FILE="vivaldi-patch.hook"

echo "--- Встановлення автоматичного патчера Vivaldi ---"

# 1. Створення папки в домівці
mkdir -p "$INSTALL_DIR"
echo "Створено директорію: $INSTALL_DIR"

# 2. Копіювання файлів
if [ -f "dist/custom.js" ]; then
    cp "dist/custom.js" "$INSTALL_DIR/"
    echo "Актуальний custom.js скопійовано у $INSTALL_DIR"
else
    echo "Помилка: dist/custom.js не знайдено! Спочатку запустіть 'npm run build'."
    exit 1
fi

# Створюємо автономний скрипт патчування в папці встановлення
cat << 'EOF' > "$INSTALL_DIR/patch.sh"
#!/bin/bash
# Цей скрипт автоматично підключає мод до Vivaldi
WINDOW_HTML="/opt/vivaldi/resources/vivaldi/window.html"
CUSTOM_JS_DEST="/opt/vivaldi/resources/vivaldi/custom.js"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
SCRIPT_PATH="$DIR/custom.js"

if [ ! -f "$WINDOW_HTML" ]; then exit 0; fi

# Перевіряємо чи потрібно оновити файл custom.js
if [ ! -f "$CUSTOM_JS_DEST" ] || ! cmp -s "$SCRIPT_PATH" "$CUSTOM_JS_DEST"; then
    cp "$SCRIPT_PATH" "$CUSTOM_JS_DEST"
    echo "Файл custom.js оновлено у папці Vivaldi."
fi

# Патчимо window.html якщо підключення відсутнє
if ! grep -q "custom.js" "$WINDOW_HTML"; then
    sed -i 's/<\/body>/<script src="custom.js"><\/script><\/body>/' "$WINDOW_HTML"
    echo "window.html патчовано: додано підключення custom.js"
fi
EOF

chmod +x "$INSTALL_DIR/patch.sh"
echo "Скрипт патчування створено/оновлено: $INSTALL_DIR/patch.sh"

# 3. Створення та встановлення хука
echo "Налаштування Pacman Hook..."

cat << EOF > "$HOOK_FILE"
[Trigger]
Operation = Install
Operation = Upgrade
Type = Package
Target = vivaldi

[Action]
Description = Автоматичне патчування Vivaldi (Tree Style Tabs)...
When = PostTransaction
Exec = /usr/bin/bash "$INSTALL_DIR/patch.sh"
EOF

# Встановлюємо хук та ОДРАЗУ застосовуємо патч
if [ "$EUID" -ne 0 ]; then
    echo "Запитую права sudo для встановлення хука та негайного застосування змін..."
    sudo mkdir -p "$HOOK_DIR"
    sudo cp "$HOOK_FILE" "$HOOK_DIR/"
    rm "$HOOK_FILE"
    # Запускаємо патч негайно
    sudo "$INSTALL_DIR/patch.sh"
else
    mkdir -p "$HOOK_DIR"
    cp "$HOOK_FILE" "$HOOK_DIR/"
    rm "$HOOK_FILE"
    # Запускаємо патч негайно
    "$INSTALL_DIR/patch.sh"
fi

echo "--- Встановлення завершено успішно! ---"
echo "1. Новий код збережено у вашій домівці."
echo "2. Зміни вже застосовані до поточної версії Vivaldi."
echo "3. Pacman Hook активний — оновлення браузера більше не страшні."

@echo off
setlocal enabledelayedexpansion

:: Vivaldi Patcher for Windows
:: Find the latest versioned folder in Vivaldi application directory

set "VIVALDI_ROOT=%LocalAppData%\Vivaldi\Application"
if not exist "!VIVALDI_ROOT!" (
    set "VIVALDI_ROOT=C:\Program Files\Vivaldi\Application"
)

if not exist "!VIVALDI_ROOT!" (
    echo Помилка: Не знайдено директорію встановлення Vivaldi.
    pause
    exit /b 1
)

:: Find the newest version directory (format is X.X.XXXX.XX)
for /f "tokens=*" %%i in ('dir /b /ad /o-n "!VIVALDI_ROOT!"') do (
    set "VERSION_DIR=%%i"
    :: Check if it looks like a version folder (starts with a digit)
    echo !VERSION_DIR!| findstr /r "^[0-9]" >nul
    if !errorlevel! == 0 (
        set "VIVALDI_PATH=!VIVALDI_ROOT!\!VERSION_DIR!\resources\vivaldi"
        if exist "!VIVALDI_PATH!\window.html" (
            goto :found
        )
    )
)

echo Помилка: Не знайдено папку з ресурсами Vivaldi.
pause
exit /b 1

:found
echo Знайдено версію: !VERSION_DIR!
echo Шлях: !VIVALDI_PATH!

set "CUSTOM_JS_SRC=%~dp0dist\custom.js"
set "CUSTOM_JS_DEST=!VIVALDI_PATH!\custom.js"
set "WINDOW_HTML=!VIVALDI_PATH!\window.html"

:: Copy custom.js
if exist "!CUSTOM_JS_SRC!" (
    copy /y "!CUSTOM_JS_SRC!" "!CUSTOM_JS_DEST!"
    echo Файл custom.js скопійовано.
) else (
    echo Попередження: Не знайдено dist\custom.js. Зберіть проект перед запуском.
)

:: Patch window.html
findstr /c:"custom.js" "!WINDOW_HTML!" >nul
if !errorlevel! == 0 (
    echo window.html вже містить підключення custom.js
) else (
    :: Use a temporary file to inject the script tag
    set "TEMP_HTML=!WINDOW_HTML!.tmp"
    (for /f "delims=" %%l in ('type "!WINDOW_HTML!"') do (
        set "line=%%l"
        set "new_line=!line:</body>=<script src="custom.js"></script></body>!"
        echo !new_line!
    )) > "!TEMP_HTML!"
    move /y "!TEMP_HTML!" "!WINDOW_HTML!"
    echo Скрипт успішно підключено у window.html
)

pause

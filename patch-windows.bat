@echo off
setlocal enabledelayedexpansion

:: Vivaldi Tree Style Tabs Patcher for Windows
:: Requires Administrator privileges if Vivaldi is installed in Program Files

echo --- Перевірка прав адміністратора ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ПОМИЛКА: Скрипт потрібно запускати ВІД ІМЕНІ АДМІНІСТРАТОРА.
    echo Натисніть правою кнопкою на файл і виберіть "Запуск від імені адміністратора".
    pause
    exit /b 1
)

:: Find Vivaldi Installation
set "VIVALDI_ROOT=%LocalAppData%\Vivaldi\Application"
if not exist "!VIVALDI_ROOT!" (
    set "VIVALDI_ROOT=C:\Program Files\Vivaldi\Application"
)

if not exist "!VIVALDI_ROOT!" (
    echo ПОМИЛКА: Не знайдено директорію Vivaldi ні в LocalAppData, ні в Program Files.
    pause
    exit /b 1
)

echo Шукаємо Vivaldi у: !VIVALDI_ROOT!

:: Find the newest version directory
set "FOUND_PATH="
for /f "tokens=*" %%i in ('dir /b /ad /o-n "!VIVALDI_ROOT!"') do (
    set "DIR_NAME=%%i"
    :: Check if it's a version folder (e.g. 6.1.3035.75)
    echo !DIR_NAME!| findstr /r "^[0-9]" >nul
    if !errorlevel! == 0 (
        set "CHECK_PATH=!VIVALDI_ROOT!\!DIR_NAME!\resources\vivaldi"
        if exist "!CHECK_PATH!\window.html" (
            set "VIVALDI_PATH=!CHECK_PATH!"
            set "VERSION_DIR=!DIR_NAME!"
            goto :found
        )
    )
)

echo ПОМИЛКА: Не знайдено папку з ресурсами Vivaldi (window.html).
pause
exit /b 1

:found
echo Знайдено версію: !VERSION_DIR!
echo Шлях ресурсів: !VIVALDI_PATH!

set "CUSTOM_JS_SRC=%~dp0dist\custom.js"
set "CUSTOM_JS_DEST=!VIVALDI_PATH!\custom.js"
set "FOLDER_HTML_SRC=%~dp0dist\svb-folder.html"
set "FOLDER_HTML_DEST=!VIVALDI_PATH!\svb-folder.html"
set "WINDOW_HTML=!VIVALDI_PATH!\window.html"

:: 1. Copy custom.js
if not exist "!CUSTOM_JS_SRC!" (
    echo ПОМИЛКА: Не знайдено файл !CUSTOM_JS_SRC!
    echo Спочатку запустіть "npm run build".
    pause
    exit /b 1
)

set "SHOULD_COPY=0"
if not exist "!CUSTOM_JS_DEST!" (
    set "SHOULD_COPY=1"
    echo [INFO] custom.js відсутній.
) else (
    fc /b "!CUSTOM_JS_SRC!" "!CUSTOM_JS_DEST!" >nul
    if !errorlevel! neq 0 (
        set "SHOULD_COPY=1"
        echo [INFO] custom.js застарілий.
    ) else (
        echo [OK] custom.js вже актуальний.
    )
)

if "!SHOULD_COPY!" == "1" (
    echo Копіюємо custom.js...
    copy /y "!CUSTOM_JS_SRC!" "!CUSTOM_JS_DEST!" >nul
    if !errorlevel! neq 0 (
        echo ПОМИЛКА: Не вдалося скопіювати файл custom.js. Можливо, Vivaldi запущений або бракує прав.
        pause
        exit /b 1
    )
    echo [OK] custom.js оновлено.

    if exist "!FOLDER_HTML_SRC!" (
        echo Копіюємо svb-folder.html...
        copy /y "!FOLDER_HTML_SRC!" "!FOLDER_HTML_DEST!" >nul
        if !errorlevel! neq 0 (
            echo ПОМИЛКА: Не вдалося скопіювати файл svb-folder.html.
            pause
            exit /b 1
        )
        echo [OK] svb-folder.html оновлено.
    )
)

:: 2. Patch window.html
echo Перевірка window.html за шляхом: !WINDOW_HTML!

:: Use PowerShell for both checking and patching to ensure consistency
powershell -NoProfile -Command ^
    "$path = '!WINDOW_HTML!';" ^
    "if (-not (Test-Path $path)) { Write-Error 'Файл window.html не знайдено за вказаним шляхом'; exit 1; }" ^
    "$content = [IO.File]::ReadAllText($path);" ^
    "if ($content -match 'src=\"custom\.js\"') {" ^
    "    Write-Host '[OK] window.html вже містить підключення custom.js.';" ^
    "    exit 0;" ^
    "} else {" ^
    "    Write-Host 'Шукаємо тег </body>...';" ^
    "    if ($content -match '(?i)</body>') {" ^
    "        Write-Host 'Тег знайдено. Додаємо <script src=\"custom.js\"></script>...';" ^
    "        $content = $content -replace '(?i)</body>', '<script src=\"custom.js\"></script></body>';" ^
    "        [IO.File]::WriteAllText($path, $content);" ^
    "        Write-Host '[OK] Зміни успішно записані у window.html.';" ^
    "        exit 0;" ^
    "    } else {" ^
    "        Write-Host 'ПОМИЛКА: Не знайдено тег </body> у файлі window.html.';" ^
    "        Write-Host 'Вміст файлу (перші 100 символів):' $content.Substring(0, [Math]::Min(100, $content.Length));" ^
    "        exit 1;" ^
    "    }" ^
    "}"

if !errorlevel! neq 0 (
    echo.
    echo ПОМИЛКА при патчуванні window.html.
    echo Спробуйте відкрити window.html вручну і перевірити його вміст.
    pause
    exit /b 1
)

echo.
echo --- ВСТАНОВЛЕННЯ ЗАВЕРШЕНО УСПІШНО ---
echo Будь ласка, перезапустіть Vivaldi (повністю закрийте всі вікна).
echo Якщо мод не запрацював, перевірте, чи з'явився рядок з custom.js в самому низу window.html.
pause
exit /b 0

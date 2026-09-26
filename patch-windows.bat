@echo off
setlocal enabledelayedexpansion

:: Vivaldi Tree Style Tabs Patcher for Windows
:: Requires Administrator privileges if Vivaldi is installed in Program Files

echo --- Checking Administrator privileges ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: The script must be run AS ADMINISTRATOR.
    echo Right-click the file and select "Run as administrator".
    pause
    exit /b 1
)

:: Find Vivaldi Installation
set "VIVALDI_ROOT=%LocalAppData%\Vivaldi\Application"
if not exist "!VIVALDI_ROOT!" (
    set "VIVALDI_ROOT=C:\Program Files\Vivaldi\Application"
)

if not exist "!VIVALDI_ROOT!" (
    echo ERROR: Could not find Vivaldi directory in LocalAppData or Program Files.
    pause
    exit /b 1
)

echo Searching for Vivaldi in: !VIVALDI_ROOT!

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

echo ERROR: Could not find Vivaldi resources folder (window.html).
pause
exit /b 1

:found
echo Found version: !VERSION_DIR!
echo Resources path: !VIVALDI_PATH!

set "CUSTOM_JS_SRC=%~dp0dist\custom.js"
set "CUSTOM_JS_DEST=!VIVALDI_PATH!\custom.js"
set "FOLDER_HTML_SRC=%~dp0dist\svb-folder.html"
set "FOLDER_HTML_DEST=!VIVALDI_PATH!\svb-folder.html"
set "WINDOW_HTML=!VIVALDI_PATH!\window.html"

:: 1. Copy custom.js
if not exist "!CUSTOM_JS_SRC!" (
    echo ERROR: Could not find file !CUSTOM_JS_SRC!
    echo Please run "npm run build" first.
    pause
    exit /b 1
)

set "SHOULD_COPY=0"
if not exist "!CUSTOM_JS_DEST!" (
    set "SHOULD_COPY=1"
    echo [INFO] custom.js is missing.
) else (
    fc /b "!CUSTOM_JS_SRC!" "!CUSTOM_JS_DEST!" >nul
    if !errorlevel! neq 0 (
        set "SHOULD_COPY=1"
        echo [INFO] custom.js is outdated.
    ) else (
        echo [OK] custom.js is already up to date.
    )
)

if "!SHOULD_COPY!" == "1" (
    echo Copying custom.js...
    copy /y "!CUSTOM_JS_SRC!" "!CUSTOM_JS_DEST!" >nul
    if !errorlevel! neq 0 (
        echo ERROR: Failed to copy custom.js. Maybe Vivaldi is running or missing privileges.
        pause
        exit /b 1
    )
    echo [OK] custom.js updated.

    if exist "!FOLDER_HTML_SRC!" (
        echo Copying svb-folder.html...
        copy /y "!FOLDER_HTML_SRC!" "!FOLDER_HTML_DEST!" >nul
        if !errorlevel! neq 0 (
            echo ERROR: Failed to copy svb-folder.html.
            pause
            exit /b 1
        )
        echo [OK] svb-folder.html updated.
    )
)

:: 2. Patch window.html
echo Checking window.html at path: !WINDOW_HTML!

:: Use PowerShell for both checking and patching to ensure consistency
powershell -NoProfile -Command ^
    "$path = '!WINDOW_HTML!';" ^
    "if (-not (Test-Path $path)) { Write-Error 'File window.html not found at specified path'; exit 1; }" ^
    "$content = [IO.File]::ReadAllText($path);" ^
    "if ($content -match 'src=\"custom\.js\"') {" ^
    "    Write-Host '[OK] window.html already contains custom.js inclusion.';" ^
    "    exit 0;" ^
    "} else {" ^
    "    Write-Host 'Searching for </body> tag...';" ^
    "    if ($content -match '(?i)</body>') {" ^
    "        Write-Host 'Tag found. Adding <script src=\"custom.js\"></script>...';" ^
    "        $content = $content -replace '(?i)</body>', '<script src=\"custom.js\"></script></body>';" ^
    "        [IO.File]::WriteAllText($path, $content);" ^
    "        Write-Host '[OK] Changes successfully written to window.html.';" ^
    "        exit 0;" ^
    "    } else {" ^
    "        Write-Host 'ERROR: Could not find </body> tag in window.html.';" ^
    "        Write-Host 'File content (first 100 chars):' $content.Substring(0, [Math]::Min(100, $content.Length));" ^
    "        exit 1;" ^
    "    }" ^
    "}"

if !errorlevel! neq 0 (
    echo.
    echo ERROR during window.html patching.
    echo Try to open window.html manually and check its content.
    pause
    exit /b 1
)

echo.
echo --- INSTALLATION COMPLETED SUCCESSFULLY ---
echo Please restart Vivaldi (close all windows completely).
echo If the mod does not work, check if the custom.js line appeared at the very bottom of window.html.
pause
exit /b 0

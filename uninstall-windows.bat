@echo off
setlocal enabledelayedexpansion

:: Vivaldi Tree Style Tabs Uninstaller / Unpatcher for Windows
:: Removes custom.js, svb-folder.html, and restores window.html

set "NO_PAUSE=0"
set "NO_PROMPT=0"
set "CUSTOM_PATH="

:: Parse arguments
for %%a in (%*) do (
    if /i "%%a"=="--no-pause" (
        set "NO_PAUSE=1"
    ) else if /i "%%a"=="-y" (
        set "NO_PROMPT=1"
    ) else if not defined CUSTOM_PATH (
        set "CUSTOM_PATH=%%~a"
    )
)

echo ========================================================
echo   Vivaldi Tree Style Tabs - Uninstaller / Patcher
echo ========================================================
echo.

:: Check Administrator privileges
set "IS_ADMIN=0"
net session >nul 2>&1
if %errorlevel% equ 0 set "IS_ADMIN=1"

:: Check if Vivaldi is running
tasklist /fi "imagename eq vivaldi.exe" 2>nul | findstr /i "vivaldi.exe" >nul
if %errorlevel% neq 0 goto :browser_not_running
echo [WARNING] Vivaldi is currently running.
echo Closing Vivaldi before uninstalling is strongly recommended to avoid file lock issues.
echo.
if "!NO_PROMPT!"=="1" goto :browser_not_running
set /p "CONT=Do you want to continue anyway? [y/N]: "
if /i "!CONT!"=="y" goto :browser_not_running
echo Uninstallation aborted. Please close Vivaldi and run the script again.
if "!NO_PAUSE!"=="0" pause
exit /b 1

:browser_not_running

:: Find Vivaldi Installation
set "VIVALDI_ROOT="
if defined CUSTOM_PATH goto :use_custom_path

if exist "!LocalAppData!\Vivaldi\Application" (
    set "VIVALDI_ROOT=!LocalAppData!\Vivaldi\Application"
    goto :found_root
)
if defined ProgramFiles if exist "!ProgramFiles!\Vivaldi\Application" (
    set "VIVALDI_ROOT=!ProgramFiles!\Vivaldi\Application"
    goto :found_root
)
if defined ProgramFiles(x86) if exist "!ProgramFiles(x86)!\Vivaldi\Application" (
    set "VIVALDI_ROOT=!ProgramFiles(x86)!\Vivaldi\Application"
    goto :found_root
)
if exist "!LocalAppData!\Vivaldi-Snapshot\Application" (
    set "VIVALDI_ROOT=!LocalAppData!\Vivaldi-Snapshot\Application"
    goto :found_root
)
if defined ProgramFiles if exist "!ProgramFiles!\Vivaldi-Snapshot\Application" (
    set "VIVALDI_ROOT=!ProgramFiles!\Vivaldi-Snapshot\Application"
    goto :found_root
)

:use_custom_path
set "VIVALDI_ROOT=!CUSTOM_PATH!"
if not exist "!VIVALDI_ROOT!" (
    echo ERROR: Provided directory does not exist: "!VIVALDI_ROOT!"
    if "!NO_PAUSE!"=="0" pause
    exit /b 1
)

:found_root
if not defined VIVALDI_ROOT (
    echo ERROR: Could not find Vivaldi directory in LocalAppData or Program Files.
    echo You can specify your Vivaldi\Application directory as an argument:
    echo   uninstall-windows.bat "C:\Path\To\Vivaldi\Application"
    if "!NO_PAUSE!"=="0" pause
    exit /b 1
)

:: If located in Program Files and not running as admin, warn and request elevation
if "!IS_ADMIN!"=="0" (
    echo !VIVALDI_ROOT! | findstr /i "Program Files" >nul
    if !errorlevel! equ 0 (
        echo ERROR: Vivaldi is installed in a system directory:
        echo   !VIVALDI_ROOT!
        echo Administrator privileges are required to modify files in this directory.
        echo Please right-click the script and select "Run as administrator".
        if "!NO_PAUSE!"=="0" pause
        exit /b 1
    )
)

echo Searching for Vivaldi installations in: !VIVALDI_ROOT!

set "CLEANED_COUNT=0"

for /f "tokens=*" %%i in ('dir /b /ad /o-n "!VIVALDI_ROOT!"') do (
    set "DIR_NAME=%%i"
    :: Check if it's a version folder (e.g. 6.1.3035.75)
    echo !DIR_NAME!| findstr /r "^[0-9]" >nul
    if !errorlevel! == 0 (
        set "CHECK_PATH=!VIVALDI_ROOT!\!DIR_NAME!\resources\vivaldi"
        if exist "!CHECK_PATH!\window.html" (
            echo.
            echo [Found version] !DIR_NAME!
            echo Resources path: !CHECK_PATH!
            call :clean_version "!CHECK_PATH!"
            set /a CLEANED_COUNT+=1
        )
    )
)

if !CLEANED_COUNT! equ 0 (
    echo.
    echo ERROR: Could not find any Vivaldi version folder containing resources\vivaldi\window.html.
    if "!NO_PAUSE!"=="0" pause
    exit /b 1
)

echo.
echo ========================================================
echo   UNINSTALLATION COMPLETED SUCCESSFULLY
echo ========================================================
echo The TreeTabsVivaldi mod has been completely removed.
echo Please restart Vivaldi - close all browser windows.
if "!NO_PAUSE!"=="0" pause
exit /b 0

:clean_version
set "TARGET_DIR=%~1"
set "WINDOW_HTML=!TARGET_DIR!\window.html"
set "CUSTOM_JS=!TARGET_DIR!\custom.js"
set "FOLDER_HTML=!TARGET_DIR!\svb-folder.html"

:: Check write permission
echo test_perm > "!TARGET_DIR!\.perm_check" 2>nul
if not exist "!TARGET_DIR!\.perm_check" (
    echo   [ERROR] Missing write permissions for "!TARGET_DIR!".
    echo   Please run this script AS ADMINISTRATOR.
    exit /b 1
)
del /f /q "!TARGET_DIR!\.perm_check" >nul 2>&1

:: 1. Revert window.html
echo   Checking window.html...
powershell -NoProfile -Command ^
    "$path = '!WINDOW_HTML!';" ^
    "if (-not (Test-Path $path)) { Write-Host '  [SKIP] window.html not found.'; exit 0; }" ^
    "$content = [IO.File]::ReadAllText($path);" ^
    "if ($content -match 'custom\.js') {" ^
    "    Write-Host '  Removing <script src=\"custom.js\"></script> from window.html...';" ^
    "    $clean = $content -replace '(?i)\s*<script\s+src=[\"`'']custom\.js[\"`'']\s*></script>', '';" ^
    "    [IO.File]::WriteAllText($path, $clean);" ^
    "    Write-Host '  [OK] window.html successfully cleaned.';" ^
    "} else {" ^
    "    Write-Host '  [OK] window.html does not contain custom.js inclusion.';" ^
    "}"

:: 2. Remove custom.js
if exist "!CUSTOM_JS!" (
    echo   Removing custom.js...
    del /f /q "!CUSTOM_JS!" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] custom.js removed.
    ) else (
        echo   [WARNING] Could not delete custom.js. Check file permissions or close Vivaldi.
    )
) else (
    echo   [OK] custom.js is not present.
)

:: 3. Remove svb-folder.html
if exist "!FOLDER_HTML!" (
    echo   Removing svb-folder.html...
    del /f /q "!FOLDER_HTML!" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] svb-folder.html removed.
    ) else (
        echo   [WARNING] Could not delete svb-folder.html. Check file permissions or close Vivaldi.
    )
) else (
    echo   [OK] svb-folder.html is not present.
)

exit /b 0

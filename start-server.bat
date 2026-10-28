@echo off
setlocal enabledelayedexpansion
title BookIt - Venue Booking Server (Frontend)

echo ========================================================
echo   Starting BookIt Frontend Server...
echo   Target Folder: %~dp0
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if Python is installed via python or py
set "PY_CMD="
where python >nul 2>&1 && set "PY_CMD=python"
if not defined PY_CMD (
    where py >nul 2>&1 && set "PY_CMD=py"
)

if not defined PY_CMD (
    echo [ERROR] Python was not found in your system PATH!
    echo Please install Python or ensure it is added to your environment variables.
    echo.
    pause
    exit /b 1
)

echo Using Python: !PY_CMD!
echo Serving files directly from: %cd%
echo.

:: Launch browser after a 1.5 second delay to ensure server socket is listening
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5050"

:: Start the Python server from this exact directory
!PY_CMD! server.py

if !ERRORLEVEL! neq 0 (
    echo.
    echo Server process ended with error code !ERRORLEVEL!.
)
pause

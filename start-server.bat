@echo off
setlocal enabledelayedexpansion
title Venue Booking System - Web Server (Port 5050)

echo =====================================================================
echo   Venue Booking System - Web App & Live API Server
echo   Running on Port 5050 (Zero external dependencies)
echo =====================================================================
echo.

cd /d "%~dp0"

set "PY_CMD="
where python >nul 2>&1 && set "PY_CMD=python"
if not defined PY_CMD (
    where py >nul 2>&1 && set "PY_CMD=py"
)

if not defined PY_CMD (
    echo [ERROR] Python was not found in your system PATH!
    pause
    exit /b 1
)

echo Launching browser at http://localhost:5050...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5050"

!PY_CMD! server.py

if !ERRORLEVEL! neq 0 (
    echo.
    echo Server process ended with error code !ERRORLEVEL!.
)
pause

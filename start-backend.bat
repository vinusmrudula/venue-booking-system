@echo off
setlocal enabledelayedexpansion
title Venue Booking System - Full-Stack App (Port 5000)

echo =====================================================================
echo   Venue Booking System - Full-Stack Backend + Web App
echo   Running on Flask + SQLite / MySQL (Port 5000)
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

echo Launching browser at http://127.0.0.1:5000...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:5000"

!PY_CMD! run.py

if !ERRORLEVEL! neq 0 (
    echo.
    echo Flask server stopped with error code !ERRORLEVEL!.
)
pause

@echo off
title BookIt - Venue Booking Server
echo ========================================================
echo  Starting BookIt Campus Venue Booking Server...
echo ========================================================
cd /d "%~dp0"
python server.py
pause

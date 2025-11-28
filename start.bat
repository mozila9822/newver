@echo off
REM VoyagerLuxury - Windows Startup Script
echo.
echo ============================================================
echo   VoyagerLuxury - Automated Startup Script (Windows)
echo ============================================================
echo.

node start.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Script failed with error code %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)


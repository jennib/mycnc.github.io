@echo off
setlocal

echo ==========================================
echo      myCNC Build Script for Windows
echo ==========================================

:: 1. Check Prerequisites
echo [1/4] Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo         Please install Node.js from https://nodejs.org/
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in your PATH.
    echo         Please install Node.js (which includes npm).
    exit /b 1
)

echo       - Node.js found.
echo       - npm found.

:: 2. Clean Project
echo(
echo [2/4] Cleaning project...
call npm run clean
if %errorlevel% neq 0 (
    echo [ERROR] Failed to clean the project.
    exit /b 1
)

:: 3. Install Dependencies
echo(
echo [3/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    exit /b 1
)

:: 4. Build Application
echo(
echo [4/4] Building application...

:: Detect Architecture
set "ARCH_FLAG=--x64"
if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" (
    set "ARCH_FLAG=--arm64"
)

echo       - Target Platform: Windows
echo       - Target Arch:     %ARCH_FLAG%

call npm run dist -- --win %ARCH_FLAG%
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    exit /b 1
)

echo(
echo ==========================================
echo           BUILD SUCCEEDED!
echo ==========================================
echo(
echo The application artifacts are located in:
echo   %CD%\dist
echo(
echo You can find the installer/executable there.
echo(

endlocal

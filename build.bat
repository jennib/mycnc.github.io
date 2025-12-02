@echo off
setlocal

echo ==========================================
echo      myCNC Build Script for Windows
echo ==========================================

:: 1. Check Prerequisites
echo [1/4] Checking prerequisites...

where node >nul 2>nul
if errorlevel 1 goto :ErrNode

where npm >nul 2>nul
if errorlevel 1 goto :ErrNpm

echo       - Node.js found.
echo       - npm found.

:: 2. Clean Project
echo(
echo [2/4] Cleaning project...
call npm run clean
if errorlevel 1 goto :ErrClean

:: 3. Install Dependencies
echo(
echo [3/4] Installing dependencies...
call npm install
if errorlevel 1 goto :ErrInstall

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

:: 4a. Compile Source (Vite)
echo(
echo       [Step 1/2] Compiling source code...
call npm run electron:build
if errorlevel 1 goto :ErrBuild

:: 4b. Package Application (Electron Builder)
echo(
echo       [Step 2/2] Packaging application...
call npx electron-builder --win %ARCH_FLAG%
if errorlevel 1 goto :ErrBuild

echo(
echo ==========================================
echo           BUILD SUCCEEDED!
echo ==========================================
echo(
echo The application artifacts are located in:
echo   %CD%\release
echo(
echo You can find the installer/executable there.
echo(
goto :End

:ErrNode
echo [ERROR] Node.js is not installed or not in your PATH.
echo         Please install Node.js from https://nodejs.org/
exit /b 1

:ErrNpm
echo [ERROR] npm is not installed or not in your PATH.
echo         Please install Node.js (which includes npm).
exit /b 1

:ErrClean
echo [ERROR] Failed to clean the project.
exit /b 1

:ErrInstall
echo [ERROR] Failed to install dependencies.
exit /b 1

:ErrBuild
echo [ERROR] Build failed.
exit /b 1

:End
endlocal

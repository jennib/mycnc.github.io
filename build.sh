#!/bin/bash

echo "=========================================="
echo "      myCNC Build Script for Mac/Linux"
echo "=========================================="

# 1. Check Prerequisites
echo "[1/4] Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in your PATH."
    echo "        Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed or not in your PATH."
    echo "        Please install Node.js (which includes npm)."
    exit 1
fi

echo "      - Node.js found."
echo "      - npm found."

# 2. Clean Project
echo ""
echo "[2/4] Cleaning project..."
npm run clean
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to clean the project."
    exit 1
fi

# 3. Install Dependencies
echo ""
echo "[3/4] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies."
    exit 1
fi

# 4. Build Application
echo ""
echo "[4/4] Building application..."

# Detect OS
OS_FLAG=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_FLAG="--linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_FLAG="--mac"
else
    echo "[WARNING] Unknown OS: $OSTYPE. Defaulting to generic build."
fi

# Detect Architecture
ARCH_FLAG="--x64"
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]] || [[ "$ARCH" == "aarch64" ]]; then
    ARCH_FLAG="--arm64"
fi

echo "      - Target Platform: $OS_FLAG"
echo "      - Target Arch:     $ARCH_FLAG"

# 4a. Compile Source
echo ""
echo "      [Step 1/2] Compiling source code..."
npm run electron:build
if [ $? -ne 0 ]; then
    echo "[ERROR] Compilation failed."
    exit 1
fi

# 4b. Package Application
echo ""
echo "      [Step 2/2] Packaging application..."
npx electron-builder $OS_FLAG $ARCH_FLAG
if [ $? -ne 0 ]; then
    echo "[ERROR] Packaging failed."
    exit 1
fi

echo ""
echo "=========================================="
echo "           BUILD SUCCEEDED!"
echo "=========================================="
echo ""
echo "The application artifacts are located in:"
echo "  $(pwd)/release"
echo ""
echo "You can find the installer/executable there."
echo ""


<div align="center">
  <img width="421" height="101" alt="mycnc.app logo" src="https://github.com/user-attachments/assets/3fb2e851-098b-4d5d-8324-48aec412b328" />

  <h1>mycnc.app</h1>
  
  <p>
    <strong>A modern, web-based G-code sender for CNC machines.</strong>
  </p>

  <p>
    <a href="https://github.com/mycnc/mycnc.github.io/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/mycnc/mycnc.github.io/build.yaml?style=flat-square&logo=github" alt="Build Status" />
    </a>
    <a href="https://github.com/mycnc/mycnc.github.io/releases">
      <img src="https://img.shields.io/github/v/release/mycnc/mycnc.github.io?style=flat-square&logo=github" alt="Latest Release" />
    </a>
    <a href="https://polyformproject.org/licenses/noncommercial/1.0.0/">
      <img src="https://img.shields.io/badge/license-PolyForm_Noncommercial-blue?style=flat-square" alt="License" />
    </a>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-development">Development</a> •
    <a href="#-building-from-source">Building</a> •
    <a href="#-security">Security</a>
  </p>
</div>

---

**mycnc.app** is a powerful G-code sender that runs directly in your browser or as a desktop application. Connect your CNC machine via USB and start machining immediately—no complex installation required.

👉 **Try it now:** [https://mycnc.app/](https://mycnc.app/) (Includes a built-in simulator!)

---

## ✳️ Features

### 🎮 Machine Control
- **Direct Control:** Connect via USB (WebSerial) to control GRBL-based machines.
- **Real-time Monitoring:** View machine status, position, and active modes.
- **Jogging:** Precise manual control with keyboard shortcuts and gamepad support.
- **Console:** Send raw G-code commands and view machine output.

### 🛠️ Productivity Tools
- **G-code Generators:** Create toolpaths for surfacing, drilling, pockets, and text without external CAM software.
- **G-code Editor:** Full-featured editor with syntax highlighting (Monaco Editor) and IntelliSense.
- **3D Visualizer:** Preview toolpaths in a 3D environment before running them.
- **Macros:** Save and execute common command sequences.
- **Tool Library:** Manage your tool inventory for quick access.

### 🌐 Modern & Accessible
- **Cross-Platform:** Runs on Windows, macOS, and Linux (Desktop App) or Chrome/Edge (Web App).
- **Offline Capable:** The desktop app works completely offline.
- **Localization:** Available in English, Spanish, French, German, and Chinese.
- **Themes:** Switch between Light and Dark modes.
- **Webcam Support:** Monitor your machine with integrated webcam viewing.

---

## 🚀 Getting Started

### Web Version
1. Open [mycnc.app](https://mycnc.app/) in a Chromium-based browser (Chrome, Edge).
2. Connect your CNC machine via USB.
3. Click **Connect** and select the correct COM port.

### Desktop Version
Download the latest installer for your operating system from the [Releases](https://github.com/mycnc/mycnc.github.io/releases) page.

- **Windows:** `.exe` installer
- **macOS:** `.dmg` (Universal for Intel/Apple Silicon)
- **Linux:** `.AppImage` or `.deb`

---

## 💻 Development

This project is built with **Electron**, **Vite**, **React**, and **TypeScript**.

### Prerequisites
- **Node.js:** Version 20 or higher.

### Setup
```bash
# Clone the repository
git clone https://github.com/mycnc/mycnc.github.io.git
cd mycnc.github.io

# Install dependencies
npm install
```

### Running Locally
```bash
# Run the web version (localhost:5173)
npm run dev

# Run the Electron desktop app
npm run electron:dev
```

---

## 🛠️ Building from Source

We provide automated scripts to build the application for your platform.

### Windows
```cmd
.\build.bat
```

### macOS / Linux
```bash
chmod +x build.sh  # Make executable first
./build.sh
```

These scripts will automatically:
1. Check your environment.
2. Clean old builds.
3. Install dependencies.
4. Build the optimized application for your architecture.

Output files will be in the `dist` folder.

---

## 📸 Screenshots

<div align="center">
  <img width="800" alt="Main Interface" src="https://github.com/user-attachments/assets/7f5dc04e-257d-4f09-bf59-81a1d86e1665" />
  <br/><br/>
  <img width="800" alt="3D Visualizer" src="https://github.com/user-attachments/assets/c6fbd0cd-3ee3-4f77-bd24-3419a81b49e0" />
  <br/><br/>
  <img width="800" alt="Settings" src="https://github.com/user-attachments/assets/2f877025-a7c3-46d3-808f-8d214493bc05" />
</div>

---

## 🔒 Security

See [SECURITY.md](SECURITY.md) for known security considerations and reporting guidelines.

---

## 📄 License

**PolyForm Noncommercial License 1.0.0**

See [LICENSE](https://polyformproject.org/licenses/noncommercial/1.0.0/) for details.

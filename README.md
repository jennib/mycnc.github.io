
<div align="center">
  <img width="421" height="101" alt="mycnc.app logo" src="https://github.com/user-attachments/assets/3fb2e851-098b-4d5d-8324-48aec412b328" />

  <h1>mycnc.app</h1>
  
  <p>
    <strong>A browser-based G-code sender for CNC machines.</strong>
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
</div>

---

**mycnc.app** is a G-code sender that runs in your browser (Chrome/Edge) or as a desktop app. It connects to GRBL-based CNC machines via USB (WebSerial), allowing you to control your machine without installing heavy drivers or software.

👉 **Try it here:** [https://mycnc.app/](https://mycnc.app/) (Includes a simulator mode)

---

## Features

### Machine Control
- **WebSerial Connection:** Connect directly to your machine from the browser.
- **Jogging & Control:** Keyboard shortcuts, gamepad support, and standard machine controls.
- **Console:** Direct G-code command entry and output logging.

### Tools
- **Built-in CAM:** Simple generators for surfacing, drilling, pockets, and text engraving.
- **G-code Editor:** Monaco-based editor with syntax highlighting and IntelliSense.
- **3D Visualizer:** Preview toolpaths before cutting.
- **Macros:** Create custom buttons for frequent commands.
- **Tool Library:** Save your common tool parameters.

### Platform
- **Cross-Platform:** Works on Windows, macOS, Linux, and ChromeOS.
- **Offline Support:** The desktop app works without an internet connection.
- **Languages:** English, Spanish, French, German, Chinese, Hindi, Bengali, Japanese, Ukrainian, and Punjabi.
- **Webcam:** Integrated camera view.

---

## Getting Started

### Web
1. Go to [mycnc.app](https://mycnc.app/) in Chrome or Edge.
2. Connect your CNC via USB.
3. Click **Connect** and pick your port.

### Desktop
Grab the installer for your OS from the [Releases](https://github.com/mycnc/mycnc.github.io/releases) page.
- **Windows:** `.exe`
- **macOS:** `.dmg`
- **Linux:** `.AppImage` or `.deb`

---

## Development

Built with Electron, Vite, React, and TypeScript.

### Setup
```bash
git clone https://github.com/mycnc/mycnc.github.io.git
cd mycnc.github.io
npm install
```

### Run
```bash
# Web version (localhost:5173)
npm run dev

# Electron app
npm run electron:dev
```

### Build
Scripts are provided to build for your specific platform:

**Windows:**
```cmd
.\build.bat
```

**macOS / Linux:**
```bash
chmod +x build.sh
./build.sh
```
Builds land in the `dist` folder.

---

## Screenshots

<div align="center">
  <img width="800" alt="Main Interface" src="https://github.com/user-attachments/assets/7f5dc04e-257d-4f09-bf59-81a1d86e1665" />
  <br/><br/>
  <img width="800" alt="3D Visualizer" src="https://github.com/user-attachments/assets/c6fbd0cd-3ee3-4f77-bd24-3419a81b49e0" />
  <br/><br/>
  <img width="800" alt="Settings" src="https://github.com/user-attachments/assets/2f877025-a7c3-46d3-808f-8d214493bc05" />
</div>

---

## Contributing

We're open to contributions and feedback.

- **Ideas:** Open an issue if you have a feature request or want to suggest a new language.
- **Code:** PRs are welcome. It's usually best to open an issue first to discuss major changes.

---

## License

**PolyForm Noncommercial License 1.0.0**
Free for personal and non-commercial use. See [LICENSE](https://polyformproject.org/licenses/noncommercial/1.0.0/).

<div align="center">
  <img width="421" height="101" alt="mycnc.app logo" src="https://github.com/user-attachments/assets/3fb2e851-098b-4d5d-8324-48aec412b328" />

  <h1>mycnc.app</h1>
</div>

mycnc.app is a software suite designed for CNC machine operation, G-code management, and process simulation. The project is structured as a monorepo containing a toolchain for CNC workflows, from CAD/CAM integration down to hardware control.

## Project Structure

This repository contains multiple interconnected applications and packages:

- **Sender (`apps/sender`)**: The core cross-platform desktop application built with Electron, React, and Vite. It establishes a connection to CNC hardware (such as GRBL controllers), streams G-code, and provides real-time 3D visualization of the machine state and toolpaths.
- **Editor (`apps/editor`)**: A web-based G-code editor utilizing Monaco Editor for syntax highlighting and fast file manipulation.
- **Fusion Add-in (`apps/mycnc-fusion-addin`)**: A Fusion 360 extension to send toolpaths directly from the CAM environment to the mycnc.app sender over TCP/IP.
- **Simulator (`packages/simulator`)**: A hardware simulation package that models CNC machine behavior, kinematics, and material removal for preflight checks and crash detection without the need for physical hardware.
- **Shared (`packages/shared`)**: Shared types, constants, and utilities used across the applications.

## Key Features

- **Hardware Control**: G-code streaming to GRBL-based controllers, supporting standard job operations (start, pause, resume, stop).
- **Visualization**: Interactive 3D rendering of toolpaths, stock material, and dynamic chip spawning during cutting simulation.
- **Remote Operations**: Support for remote job control and monitoring across a local network.
- **Job Documentation**: Tracking of recent jobs and file library management.
- **Plugin System**: Extend functionality by writing custom JavaScript/Node.js plugins that hook into real-time application state.
- **Extensibility**: Built with modern web technologies (TypeScript, React, XState, Zustand), making the interface highly customizable and the architecture easy to extend.

## Creating a Plugin

mycnc.app supports a lightweight plugin architecture that allows you to execute custom code in the Node.js Main Process whenever the application state changes (e.g., job completion, machine connection, UI updates).

1. **Locate the Plugins Directory:** Open `mycnc.app`, go to the **Help** menu, and click **Open Plugins Folder**. This opens the `plugins` folder inside your user data directory.
2. **Create a Plugin File:** Create a new file with a `.js` or `.cjs` extension in this folder (e.g., `my-custom-integration.js`).
3. **Write the Plugin Logic:** Export an object with a `name` and an `onStateUpdate(storeName, state)` async function. The application will pass the name of the Zustand store and its current state every time it updates.

**Example Plugin (`discord-webhook.js`):**

```javascript
module.exports = {
    name: 'Discord Webhook Notification',
    onStateUpdate: async (storeName, state) => {
        // Listen for the jobStore to signal a completed job
        if (storeName === 'jobStore' && state.jobStatus === 'complete') {
            console.log('[Plugin] Job completed! Sending Discord webhook...');
            
            fetch('https://discord.com/api/webhooks/YOUR_WEBHOOK_URL', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: "CNC Job has finished successfully!" })
            }).catch(console.error);
        }
    }
};
```

4. **Restart:** Restart the application for it to load your new plugin. You should see `Loaded plugin: Discord Webhook Notification` in the terminal or logs.

## Development Setup

Requirements:
- Node.js (v20 or newer recommended)
- npm

### Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/jennib/mycnc.github.io.git
cd mycnc.github.io
npm install
```

### Running Locally

To start the main dual-process Electron application in development mode:

```bash
npm run electron:dev
```

To build standard web packages, run:

```bash
npm run build
```

## Contributing

We are open to contributions and feedback.

- **Ideas:** Open an issue if you have a feature request or want to suggest supporting additional firmwares or languages.
- **Code:** Pull requests are welcome. It is recommended to open an issue first to discuss any major architectural changes or new feature additions.

---

## License

**PolyForm Noncommercial License 1.0.0**
Free for personal and non-commercial use. See [LICENSE](https://polyformproject.org/licenses/noncommercial/1.0.0/) for full details.

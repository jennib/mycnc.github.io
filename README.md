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
- **Extensibility**: Built with modern web technologies (TypeScript, React, XState, Zustand), making the interface highly customizable and the architecture easy to extend.

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

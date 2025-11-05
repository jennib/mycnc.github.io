License: PolyForm Noncommercial License 1.0.0
See https://polyformproject.org/licenses/noncommercial/1.0.0/



<img width="421" height="101" alt="mycnclogo" src="https://github.com/user-attachments/assets/3fb2e851-098b-4d5d-8324-48aec412b328" />

## mycnc.app

**mycnc.app** is a **web-based G-code sender** for CNC machines.  
Simply open the website on your computer, connect your CNC machine via USB, and start machining — **no installation required** on either the computer or the CNC.

Scroll down to view a sample screenshot of the app in action.
---

### ✳️ Features

- **Direct CNC control:** Connect via USB and control your machine right from your browser. Jog, send G-code, and monitor jobs in real time.
- **Pause and Start from Line**  While the job is running you can pause at any time and then resume.  Or you can go into the gcode and start your job from any line.
- **Built-in G-code generators:** Quickly create toolpaths for surfacing, drilling, bores, pockets, profiles, and text — no need to open your CAM software for basic tasks.
- **Machine Settings** Tell the app about your machine and it will validate g-code and give you warnings about potential issues.
- **Tool Library**  Enter your tools for quick access in the generator.
- **Custom macros:** Create and save macros for your most common operations.  
- **G-code editor:** Edit and send G-code directly from the app.  
- **Webcam monitoring:** View a live feed from any webcam connected to your computer.  
- **3D toolpath visualization:** Preview and inspect G-code toolpaths in the built-in 3D viewer.  
- **Machine simulator:** Try the software without connecting a real machine.
- **Console**  See messages from your machine and send messages directly to your machine.
- **Light and Dark Modes** Pick the theme that works for you
- **More features are planned!**

---

### ⚙️ Important Notes

- **mycnc.app is not** remote access or CNC firmware.  
  It’s a simple, browser-based interface for sending and generating G-code, designed to work with CNC machines connected by USB to your computer.
- Since USB access is required, **only browsers supporting WebSerial** will work — such as **Google Chrome** or **Microsoft Edge**.  
  Firefox may work with third-party extensions, but it’s not officially supported.
- **GRBL** specific at the moment as that is all I have for testing. HINT!

---

### 🧑‍💻 Running Locally

You can also run **mycnc.app** locally on your computer.

**Requirements:**  
- [Node.js](https://nodejs.org/) installed and available in your system path.

**Setup instructions:**

```bash
# Clone or download the repository
cd into the project folder

# Install dependencies
npm install

# Build for production
npm run build

# Start the local server
npm run dev
```

Then open the URL displayed in your terminal in your browser.


<img width="1902" height="919" alt="Screenshot 2025-11-05 072558" src="https://github.com/user-attachments/assets/ffc7b1c1-3e49-4d92-8ef9-f448c9b1352b" />

<img width="1902" height="1020" alt="Screenshot 2025-11-05 073001" src="https://github.com/user-attachments/assets/e3b306b0-f28e-40a9-85cf-389b1d646caf" />

<img width="1903" height="905" alt="Screenshot 2025-11-05 070618" src="https://github.com/user-attachments/assets/7987c519-0e6e-4c8a-9313-38ad16420754" />

<img width="1894" height="895" alt="Screenshot 2025-11-05 071043" src="https://github.com/user-attachments/assets/80896851-493e-4a94-8257-7e0b12d8e35e" />

<img width="1902" height="1012" alt="Screenshot 2025-11-05 073540" src="https://github.com/user-attachments/assets/58f893a9-b19d-4379-b4e0-93cc975ee8de" />

<img width="1902" height="1012" alt="Screenshot 2025-11-05 073558" src="https://github.com/user-attachments/assets/8708653e-5595-479c-ac6b-0e307e9432de" />


Copyright 2025

No Liability

As far as the law allows, the software comes as is, without any warranty or condition, and the licensor will not be liable to you for any damages arising out of these terms or the use or nature of the software, under any kind of legal claim.
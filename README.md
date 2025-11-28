License: PolyForm Noncommercial License 1.0.0
See https://polyformproject.org/licenses/noncommercial/1.0.0/


---

<img width="421" height="101" alt="mycnclogo" src="https://github.com/user-attachments/assets/3fb2e851-098b-4d5d-8324-48aec412b328" />

## mycnc.app

**mycnc.app** is a **web-based G-code sender** for CNC machines.  
Simply open the website on your computer, connect your CNC machine via USB, and start machining — **no installation required** on either the computer or the CNC.

Use the app at https://mycnc.app/   There is a simulator built in so you can try it out.

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
- **GRBL only until testing on other machines is possible**

---

### 🧑‍💻 Running Locally

You can also run **mycnc.app** locally on your computer.   Look in the releases section for desktop versions.

<img width="1579" height="976" alt="Screenshot 2025-11-28 173624" src="https://github.com/user-attachments/assets/7f5dc04e-257d-4f09-bf59-81a1d86e1665" />

<img width="1570" height="974" alt="Screenshot 2025-11-28 173640" src="https://github.com/user-attachments/assets/c6fbd0cd-3ee3-4f77-bd24-3419a81b49e0" />

<img width="1558" height="954" alt="Screenshot 2025-11-28 173702" src="https://github.com/user-attachments/assets/2f877025-a7c3-46d3-808f-8d214493bc05" />

---

##  Security

See [SECURITY.md](SECURITY.md) for known security considerations and reporting guidelines.

---

Copyright 2025

No Liability

As far as the law allows, the software comes as is, without any warranty or condition, and the licensor will not be liable to you for any damages arising out of these terms or the use or nature of the software, under any kind of legal claim.

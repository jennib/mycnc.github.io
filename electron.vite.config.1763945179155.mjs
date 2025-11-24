// electron.vite.config.js
import { resolve } from "path";
import { defineConfig, loadEnv, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
var __electron_vite_injected_dirname = "C:\\Users\\jenni\\Projects\\mycnc.github.io";
var electron_vite_config_default = defineConfig(({ mode }) => ({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "electron/main.ts")
        },
        output: {
          format: "cjs"
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__electron_vite_injected_dirname, "electron/preload.ts")
        },
        output: {
          format: "cjs"
        }
      }
    }
  },
  renderer: {
    root: ".",
    server: {
      port: 3e3,
      host: "localhost"
    },
    define: {
      "process.env.API_KEY": JSON.stringify(loadEnv(mode, ".", "").GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(loadEnv(mode, ".", "").GEMINI_API_KEY)
    },
    resolve: {
      alias: { "@": resolve(__electron_vite_injected_dirname, "src/renderer") }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "index.html")
        }
      },
      outDir: "out/renderer"
    },
    plugins: [react()]
  }
}));
export {
  electron_vite_config_default as default
};

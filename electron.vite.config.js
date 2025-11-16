import { resolve } from 'path';
import { defineConfig, loadEnv, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
// import commonjs from 'vite-plugin-commonjs';

export default defineConfig(({ mode }) => ({
  main: {
    tsconfig: 'tsconfig.main.json',
    target: 'electron-main',
    plugins: [externalizeDepsPlugin()],
    optimizeDeps: {
      // include: ['serialport'] // Remove serialport from optimizeDeps
    },
    define: {
      'process.env.VITE_DEV_SERVER_URL': JSON.stringify('http://localhost:3000/')
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts')
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload.ts')
        },
        output: {
          format: 'es'
        }
      }
    }
  },
  renderer: {
    root: '.',
    server: {
      port: 3000,
      host: 'localhost',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(loadEnv(mode, '.', '').GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(loadEnv(mode, '.', '').GEMINI_API_KEY),
      'process.env.IS_ELECTRON': JSON.stringify(process.env.VITE_BUILD_TARGET === 'electron-renderer')
    },
    resolve: {
      alias: { '@': resolve(__dirname, '.') }
    },
    optimizeDeps: {
      include: ['react-dom', 'react-dom/client']
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        },
        external: ['react-dom', 'react-dom/client']
      },
      outDir: 'out/renderer',
    },
    plugins: [react() /*, commonjs()*/],
  },
}));
import { resolve } from 'path';
import { defineConfig, loadEnv, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts')
        },
        output: {
          format: 'cjs'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'electron/preload.ts')
        },
        output: {
          format: 'cjs'
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
      'process.env.GEMINI_API_KEY': JSON.stringify(loadEnv(mode, '.', '').GEMINI_API_KEY)
    },
    resolve: {
      alias: { '@': resolve(__dirname, 'src/renderer') }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      },
      outDir: 'out/renderer',
    },
    plugins: [react()],
  },
}));

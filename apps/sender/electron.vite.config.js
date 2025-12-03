import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig(({ mode }) => ({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      sourcemap: false,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts')
        },
        output: {
          format: 'cjs'
        },
        external: ['electron']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      sourcemap: false,
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
      alias: {
        '@': resolve(__dirname, 'src/renderer'),
        '@mycnc/shared/worker': resolve(__dirname, '../../packages/shared/dist/worker.js'),
        '@mycnc/shared': resolve(__dirname, '../../packages/shared/dist/index.js')
      }
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'xstate', '@xstate/react', 'zustand', 'i18next', 'react-i18next'],
            three: ['three'],
            ui: ['lucide-react']
          }
        }
      },
      outDir: 'out/renderer',
    },
    worker: {
      format: 'es'
    },
    plugins: [
      react(),
      /* (monacoEditorPlugin.default || monacoEditorPlugin)({
        languageWorkers: ['editorWorkerService'],
        customWorkers: [],
        customDistPath: (root, outDir, base) => {
          return resolve(outDir, 'monacoeditorwork');
        }
      }) */
    ],
  },
}));

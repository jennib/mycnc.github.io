/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // @ts-ignore - Handle CJS/ESM interop
    (monacoEditorPlugin.default || monacoEditorPlugin)({
      languageWorkers: ['editorWorkerService'],
      customWorkers: [],
      customDistPath: (root, outDir, base) => {
        return path.join(outDir, 'monacoeditorwork');
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/renderer/test/setup.ts',
  },
});

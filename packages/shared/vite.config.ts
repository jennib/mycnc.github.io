import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyCNCShared',
      fileName: 'mycnc-shared',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'three', 'lucide-react']
    }
  }
});

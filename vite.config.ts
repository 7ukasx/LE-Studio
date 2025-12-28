
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // WICHTIG: Da dein Repo 'LE-Studio' heißt, muss die Base hier exakt so lauten
  base: '/LE-Studio/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3000,
  }
});

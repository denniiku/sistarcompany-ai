import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// A custom plugin that ensures build artifacts are replicated to both the flat root and subfolder
// inside 'dist' in production. This guarantees compatibility with all Firebase Hosting deploy schemes.
const doubleBuildPlugin = {
  name: 'double-build-plugin',
  closeBundle() {
    const outDir = path.resolve(__dirname, 'dist');
    const subDir = path.resolve(outDir, 'qubit-erp');
    
    function copyDir(src: string, dest: string) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        if (file === 'qubit-erp') continue; // Avoid infinite self-copy
        if (fs.statSync(srcPath).isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    if (fs.existsSync(subDir)) {
      copyDir(subDir, outDir);
      console.log('Double-build plugin: Successfully duplicated qubit-erp assets to flat dist root.');
    }
  }
};

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    base: '/qubit-erp/',
    plugins: [react(), tailwindcss(), isProd ? doubleBuildPlugin : null].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: isProd ? 'dist/qubit-erp' : 'dist',
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

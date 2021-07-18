import preact from '@preact/preset-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: 'dist/',
  plugins: [preact(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      'react-dom': 'preact',
      react: 'preact',
    },
  },
  build: {
    rollupOptions: {
      input: [
        ...readdirSync('static').map(name =>
          resolve(__dirname, 'static', name)
        ),
        resolve(__dirname, 'src/background/index.ts'),
      ],
      output: {
        entryFileNames(info) {
          if (info.name === 'background') {
            return 'background.js';
          }
          return '[name].[hash].js';
        },
      },
    },
  },
});

import preact from '@preact/preset-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { readdirSync } from 'fs';
import { resolve, parse } from 'path';
import { defineConfig } from 'vite';

const resolveDir = (path: string) =>
  readdirSync(path).map(filename => {
    return [parse(filename).name, resolve(__dirname, path, filename)] as const;
  });

const NOT_TO_HASH = [
  'contentScript',
  'background',
  'pageScript',
  'pageScriptWrap',
];

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
    minify: 'esbuild',
    rollupOptions: {
      input: Object.fromEntries([
        ...resolveDir('static'),
        ...resolveDir('src/inject'),
        ['background', resolve(__dirname, 'src/background/index.ts')],
      ]),
      output: {
        entryFileNames(info) {
          if (NOT_TO_HASH.includes(info.name)) {
            return '[name].js';
          }
          return '[name].[hash].js';
        },
      },
    },
  },
});

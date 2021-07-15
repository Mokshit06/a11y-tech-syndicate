const esbuild = require('esbuild');
const pkg = require('../package.json');

const isProd = process.env.NODE_ENV === 'production';

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    watch: !isProd,
    minify: isProd,
    sourcemap: 'external',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    external: [...Object.keys(pkg.dependencies)],
    target: 'node12',
  })
  .catch(() => process.exit(1));

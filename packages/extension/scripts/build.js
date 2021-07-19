const esbuild = require('esbuild');

const path = require('path');

const resolve = (...paths) => path.resolve(__dirname, '..', ...paths);

const preactAlias = {
  name: 'preact-alias',
  setup(build) {
    build.onResolve({ filter: /^react$/ }, args => {
      return {
        path: require.resolve('preact'),
      };
    });
  },
};

esbuild
  .build({
    entryPoints: [
      resolve('src/inject/contentScript'),
      resolve('src/background/index.ts'),
      resolve('src/inject/pageScript.tsx'),
      resolve('src/inject/pageScriptWrap.ts'),
      resolve('src/devtools/index.ts'),
      resolve('src/devpanel/index.tsx'),
    ],
    assetNames: 'assets/[name].[hash]',
    publicPath: 'out',
    bundle: true,
    loader: {
      '.png': 'file',
    },
    outdir: resolve('out'),
    plugins: [preactAlias],
    minify: false,
    watch: true,
    loader: {
      '.png': 'file',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.VITE_API_ENDPOINT': JSON.stringify(
        'http://localhost:5000'
      ),
    },
  })
  .catch(() => process.exit(1));

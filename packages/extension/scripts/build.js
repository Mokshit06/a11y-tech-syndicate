const esbuild = require('esbuild');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const resolve = (...paths) => path.resolve(__dirname, '..', ...paths);

const preactAlias = {
  name: 'preact-alias',
  setup(build) {
    build.onResolve({ filter: /^react$/ }, args => {
      return {
        path: require.resolve('preact/compat'),
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
    sourcemap: isProd ? false : 'inline',
    outdir: resolve('out'),
    plugins: [
      preactAlias,
      {
        name: 'log-rebuild',
        setup(build) {
          build.onEnd(() => {
            console.log('finished bundling');
          });
        },
      },
    ],
    minify: isProd,
    watch: !isProd,
    loader: {
      '.png': 'file',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        isProd ? 'production' : 'development'
      ),
      'process.env.VITE_API_ENDPOINT': JSON.stringify('http://localhost:5000'),
    },
  })
  .catch(() => process.exit(1));

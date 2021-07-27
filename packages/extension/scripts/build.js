const esbuild = require('esbuild');
const path = require('path');
const dotenv = require('dotenv-flow');

dotenv.config();

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
      resolve('src/sidebar/index.tsx'),
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
    define: Object.fromEntries(
      Object.entries(process.env)
        // ignore windows specific process.env like ProgramFiles(x86)
        .filter(([env]) => !env.includes('(') && !env.includes(')'))
        // stringify values
        .map(([env, value]) => [`process.env.${env}`, JSON.stringify(value)])
    ),
  })
  .catch(() => process.exit(1));

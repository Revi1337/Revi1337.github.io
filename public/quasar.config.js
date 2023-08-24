const ESLintPlugin = require('eslint-webpack-plugin');

const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    supportTS: false,
    boot: ['axios', 'loading', 'particles', 'vmdeditor', 'heatmap'],
    css: ['app.scss'],
    extras: [
      'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!
      // 'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it`
    ],

    build: {
      vueRouterMode: 'history',
      distDir: '../../test',
      chainWebpack(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js', 'vue'] }]);
      },
      env: require('dotenv').config().parsed
    },

    devServer: {
      server: {
        type: 'http'
      },
      port: 8081,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        },
        '/activity-events': {
          target: 'https://tryhackme.com/api/user',
          changeOrigin: true
        }
      }
    },

    framework: {
      config: {},
      // lang: 'en-US', // Quasar language pack
      plugins: ['LocalStorage']
    },

    animations: 'all',

    ssr: {
      pwa: false,

      prodPort: 3000,

      maxAge: 1000 * 60 * 60 * 24 * 30,

      chainWebpackWebserver(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }]);
      },

      middlewares: [ctx.prod ? 'compression' : '', 'render']
    },

    pwa: {
      workboxPluginMode: 'GenerateSW',
      workboxOptions: {},

      chainWebpackCustomSW(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }]);
      },

      manifest: {
        name: `Quasar App`,
        short_name: `Quasar App`,
        description: `A Quasar Project`,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      bundler: 'packager',

      packager: {},

      builder: {
        appId: 'frontend'
      },

      chainWebpackMain(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }]);
      },

      chainWebpackPreload(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }]);
      }
    }
  };
});

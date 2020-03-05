const { resolve } = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const pkg = require('./package.json')

const config = {
  mode: 'production',

  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'Operate',
    libraryTarget: 'umd'
  },

  devtool: 'hidden-source-map',

  externals: {
    'isomorphic-webcrypto': 'crypto',
    'url': 'window'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.FENGARICONF': 'void 0',
      'typeof process': JSON.stringify('undefined')
    }),
    new webpack.ProvidePlugin({
      BigInt: 'bigint-polyfill'
    }),
    new webpack.BannerPlugin({
      banner: `Operate / Agent - v${ pkg.version }\n${ pkg.description }\n${ pkg.repository }\nCopyright © ${ new Date().getFullYear() } ${ pkg.author }. MIT License.\n@preserve`
    })
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
        extractComments: false,
        terserOptions: {
          mangle: {
            reserved: ['Operate', 'Agent', 'VM', 'Tape', 'Cell', 'Adapter', 'Cache', 'Extension']
          },
          output: {
            comments: /@preserve/i
          }
        }
      })
    ]
  },

  performance: {
    hints: false
  }
}

module.exports = [
  {
    ...config,
    entry: {
      'operate': resolve(__dirname, 'lib/index.js'),
      'operate.min': resolve(__dirname, 'lib/index.js')
    }
  },
  {
    ...config,
    entry: {
      'operate.ie11.min': resolve(__dirname, 'lib/index.js')
    },
    module: {
      rules: [
        {
          test: [/\.js$/],
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [['@babel/preset-env', {
              targets: {
                browsers: ['last 2 versions', 'not safari <= 7', 'not ie <= 10']
              }
            }]]
          }
        }
      ]
    }
  }
]
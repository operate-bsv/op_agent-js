const { resolve } = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const pkg = require('./package.json')

module.exports = [
  {
    mode: 'production',
    entry: {
      'operate': resolve(__dirname, 'lib/index.js'),
      'operate.min': resolve(__dirname, 'lib/index.js')
    },

    output: {
      path: resolve(__dirname, 'dist'),
      filename: '[name].js',
      library: 'Operate',
      libraryTarget: 'umd'
    },

    devtool: 'hidden-source-map',

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
    },

    externals: {
      'url': 'window'
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env.FENGARICONF': 'void 0',
        'typeof process': JSON.stringify('undefined')
      }),
      new webpack.BannerPlugin({
        banner: `Operate / Agent - v${ pkg.version }\n${ pkg.description }\n${ pkg.repository }\nCopyright © ${ new Date().getFullYear() } ${ pkg.author }. MIT License.\n@preserve`
      })
    ],

    optimization: {
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
    }
  }
]
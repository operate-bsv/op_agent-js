const { resolve } = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const pkg = require('./package.json')

module.exports = {
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

  externals: {
    'isomorphic-webcrypto': 'crypto',
    'url': 'window'
  },

  module: {
    rules: [{
      test: [/\.js$/],
      loader: 'babel-loader',
      options: {
        plugins: [
          '@babel/plugin-proposal-nullish-coalescing-operator',
          '@babel/plugin-proposal-optional-chaining'
        ]
      }
    }]
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
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
        extractComments: false,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
          mangle: {
            reserved: ['Operate', 'Agent', 'VM', 'Tape', 'Cell']
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

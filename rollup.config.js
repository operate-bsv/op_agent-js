import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import banner from 'rollup-plugin-banner'

export default  {
  input: 'lib/index.js',
  output: {
    file: 'dist/agent.min.js',
    format: 'umd',
    name: 'opAgent',
    globals: {
      bsv: 'bsv',
    }
  },
  external: ['bsv'],
  
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env'],
    }),
    uglify({
      mangle: {
        reserved: []
      }
    }),
    banner('Operate / Agent - v<%= pkg.version %>\n<%= pkg.description %>\n<%= pkg.repository %>\nCopyright © <%= new Date().getFullYear() %> <%= pkg.author %>. MIT License')
  ]
};
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'

export default  {
  input: 'lib/index.js',
  output: {
    file: 'dist/operate.min.js',
    format: 'umd',
    name: 'Operate'
  },
  
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env'],
    }),
    terser(),
    banner('Operate / Agent - v<%= pkg.version %>\n<%= pkg.description %>\n<%= pkg.repository %>\nCopyright © <%= new Date().getFullYear() %> <%= pkg.author %>. MIT License')
  ]
};
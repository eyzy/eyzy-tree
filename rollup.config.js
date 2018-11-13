import pkg from './package.json'
import uglify from 'rollup-plugin-uglify'
import typescript from 'rollup-plugin-typescript'
import scss from 'rollup-plugin-scss'

const path = require('path')

const sourcemap = false

const version = pkg.version
const banner = `
/*!
 * LiquorTree v${version}
 * (c) ${new Date().getFullYear()} amsik
 * Released under the MIT License.
 */
`

const config = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap,
      banner
    }, {
      file: pkg.main,
      format: 'umd',
      name: pkg.library,
      sourcemap,
      banner
    }
  ],
  cache: false,
  plugins: [
    typescript(),
    scss({
      output: 'dist/style.css',
    })
  ]
}

if ('production' == process.env.NODE_ENV) {
  config.output.forEach(c => (c.sourcemap = false))
  config.plugins.push(uglify({
    output: {
      comments: function(node, comment) {
          var text = comment.value;
          var type = comment.type;
          if (type == "comment2") {
              return /license/i.test(text);
          }
      }
    }
  }))
}

if ('development' == process.env.NODE_ENV) {
  config.plugins.push(serve({
    contentBase: ['dist', 'demo'],
    port: 8081,
    open: true
  }))
}

export default config
import pkg from './package.json'
import uglify from 'rollup-plugin-uglify-es'
import typescript from 'rollup-plugin-typescript'
import scss from 'rollup-plugin-scss'
import serve from 'rollup-plugin-serve'

const sourcemap = 'production' !== process.env.NODE_ENV

const version = pkg.version
const banner = `
/*!
 * ${pkg.library} v${version}
 * (c) ${new Date().getFullYear()} amsik
 * Released under the MIT License.
 */
`

const config = {
  input: 'src/index.ts',
  external: ['react'],
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
      output: 'dist/style.css'
    })
  ]
}

if ('production' === process.env.NODE_ENV) {
  config.plugins.push(uglify({
    output: {
      comments: function(node, comment) {
        if (comment.type == "comment2") {
          return new RegExp(pkg.library, 'i').test(comment.value);
        }
      }
    }
  }))
}

if ('development' == process.env.NODE_ENV) {
  config.plugins.push(serve({
    contentBase: ['dist', 'examples'],
    port: 8081,
    open: true
  }))
}

export default config

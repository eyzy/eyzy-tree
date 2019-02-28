import fs from 'fs'
import path from 'path'

import pkg from './package.json'
import uglify from 'rollup-plugin-uglify-es'
import typescript from 'rollup-plugin-typescript'
import tslint from 'rollup-plugin-tslint'
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
const apiBanner = `
/*!
 * ${pkg.library}API v${version}
 * (c) ${new Date().getFullYear()} amsik
 * Released under the MIT License.
 */
`

const externalApiConfig = {
  input: 'src/api/index.ts',
  output: [
    {
      file: 'es/eyzy-tree-api.js',
      format: 'es',
      banner: apiBanner
    }, {
      file: 'lib/eyzy-tree-api.js',
      format: 'umd',
      name: pkg.library,
      banner: apiBanner
    }, {
      file: `dist/eyzy-tree-api.js`,
      format: 'umd',
      name: 'EyzyTreeAPI',
      banner: apiBanner
    }
  ],
  plugins: [
    typescript()
  ]
}

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
    }, {
      file: `dist/${pkg.name}.js`,
      format: 'umd',
      name: pkg.library,
      sourcemap,
      banner
    }
  ],
  cache: false,
  plugins: [
    tslint(),
    typescript(),
    scss({
      output: (styles) => {
        fs.writeFileSync(path.resolve('./', 'dist/style.css'), styles)
        fs.writeFileSync(path.resolve('./', 'style.css'), styles)
      },
      outputStyle: 'compressed'
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

  externalApiConfig.plugins.push(uglify())
}

if ('development' == process.env.NODE_ENV) {
  config.plugins.push(serve({
    contentBase: ['dist', 'examples'],
    port: 8081,
    open: true
  }))
}

export default [config, externalApiConfig]

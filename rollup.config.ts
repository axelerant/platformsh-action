// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'src/index.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: true
  },
  plugins: [
    typescript(),
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs({
      transformMixedEsModules: true
    })
  ],
  onwarn(warning, warn) {
    // Check if warning is from @actions/core modules
    const isFromActionsCore =
      warning.id?.includes('node_modules/@actions/core') ||
      warning.loc?.file?.includes('node_modules/@actions/core') ||
      warning.message?.includes('@actions/core')

    // Suppress "this" rewriting warnings from @actions/core v3.0.0
    // These are harmless - the code works correctly despite the warning
    if (warning.code === 'THIS_IS_UNDEFINED' && isFromActionsCore) {
      return
    }
    // Suppress circular dependency warnings from @actions/core internal structure
    if (warning.code === 'CIRCULAR_DEPENDENCY' && isFromActionsCore) {
      return
    }
    // Use default for everything else
    warn(warning)
  }
}

export default config

import path from 'node:path'

import webpack, { type Configuration, type ResolveOptions } from 'webpack'

// Stock.
export { default } from 'webpack'
export type { Configuration, PathData } from 'webpack'

// Node can't detect `EnvironmentPlugin` as a named export of CommonJS Webpack.
export const { EnvironmentPlugin } = webpack

// Theirs.
export { CleanWebpackPlugin as CleanPlugin } from 'clean-webpack-plugin'
export { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity'
export { default as CopyPlugin } from 'copy-webpack-plugin'
export { default as HtmlPlugin } from 'html-webpack-plugin'
export { default as TerserPlugin } from 'terser-webpack-plugin'

/**
 * Reusable resolve settings.
 */
export const resolve: Configuration['resolve'] = {
  extensions: ['.tsx', '.ts', '.js'],
}

// Resolve Webpack loaders from the `node_modules` this package is installed
// in, which is three levels up from `dist/`.
export const resolveLoader: ResolveOptions = {
  modules: [path.join(import.meta.dirname, '..', '..', '..'), 'node_modules'],
}

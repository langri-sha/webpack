import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const run = (cwd, command, ...args) =>
  execFileSync(command, args, { cwd, stdio: 'inherit' })

const root = path.resolve(import.meta.dirname, '..')
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'webpack-smoke-'))

try {
  run(root, 'pnpm', 'run', 'prepublishOnly')
  run(root, 'pnpm', 'pack', '--out', path.join(dir, 'package.tgz'))

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: 'smoke',
      private: true,
      type: 'module',
    }),
  )
  fs.writeFileSync(path.join(dir, 'pnpm-workspace.yaml'), 'packages: []\n')
  run(
    dir,
    'pnpm',
    'add',
    './package.tgz',
    'webpack@^5.0.0',
    '@babel/register@^8.0.0',
    '@babel/core@^8.0.0',
  )

  fs.mkdirSync(path.join(dir, 'src'))
  fs.writeFileSync(path.join(dir, 'src', 'index.js'), 'export const a = 1\n')
  fs.writeFileSync(
    path.join(dir, 'check.mjs'),
    `
import assert from 'node:assert/strict'
import webpack, * as pkg from '@langri-sha/webpack'
import stock from 'webpack'

assert.equal(pkg.default, stock)
for (const name of [
  'CleanPlugin',
  'CopyPlugin',
  'EnvironmentPlugin',
  'HtmlPlugin',
  'SubresourceIntegrityPlugin',
  'TerserPlugin',
]) {
  assert.equal(typeof pkg[name], 'function', name)
}

const stats = await new Promise((resolve, reject) =>
  webpack(
    {
      mode: 'production',
      context: process.cwd(),
      entry: './src/index.js',
      resolve: pkg.resolve,
      resolveLoader: pkg.resolveLoader,
      module: { rules: [{ test: /\\.js$/, loader: 'babel-loader', options: { babelrc: false, configFile: false } }] },
    },
    (error, stats) => (error ? reject(error) : resolve(stats)),
  ),
)
assert.ok(!stats.hasErrors(), stats.toString())
`,
  )
  run(dir, 'node', 'check.mjs')
  console.log('Smoke test passed.')
} finally {
  fs.rmSync(dir, { recursive: true, force: true })
}

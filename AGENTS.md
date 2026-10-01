# Agents orientation — `langri-sha/webpack`

`@langri-sha/webpack` aggregates Webpack's plugins and loaders for monorepo
builds: it re-exports them beside shared `resolve` and `resolveLoader` settings,
so a workspace package can build without installing them itself. The package is
the repository root.

## Who owns which file

| Owner                                   | Files                                                                                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projen (`.projenrc.ts` → `pnpm projen`) | `package.json`, `.projen/`, `tsconfig*.json`, `pnpm-workspace.yaml`, `renovate.json5`, `beachball.config.cjs`, the ESLint, Prettier and lint-staged configs, `.husky/`, the ignore and attribute files, `CODEOWNERS`, `license` |
| Beachball                               | `CHANGELOG.md`, `CHANGELOG.json` and the `version` field                                                                                                                                                                        |
| You                                     | `src/**`, `readme.md`, `.github/workflows/`, this file                                                                                                                                                                          |

Synthesized files are read-only; change them in `.projenrc.ts`. Repository
settings, branch protection and the Actions secrets are managed by
`langri-sha/github-repos`.

## Common tasks

```sh
pnpm install
pnpm projen                             # re-synthesize from .projenrc.ts
pnpm tsc --build .                      # typecheck
pnpm eslint . && pnpm prettier --check .
pnpm run prepublishOnly                 # build dist/
pnpm smoke                              # pack, install and build with the tarball
pnpm change                             # write a change file
```

The package has no unit tests; `pnpm smoke` is the end-to-end check on the
packed tarball.

## Release

Beachball versions the package and the Release workflow publishes it through npm
trusted publishing. Anything that reaches the tarball or builds it — `src/`,
`readme.md`, `package.json`, `tsconfig.json` — needs a change file in the same
pull request. Root tooling does not: `beachball.config.cjs` lists what is
exempt, so lock file maintenance never cuts a release.

The Release workflow calls the shared Packages workflow with
`tag-template: v{version}`, which tags each published version, e.g. `v0.6.5`,
and `github-releases: true`, which creates a GitHub release with generated notes
for it. Beachball's own `gitTags` stays off, since it would name the tags
`@langri-sha/webpack_v0.6.5`. A tag that already has a release is skipped, so
the workflow is safe to rerun.

`main` points at `src/` in the repository, and `publishConfig` swaps `main` and
`types` for `dist/`, which `prepublishOnly` builds. The tarball ships `src/`
beside `dist/`, which the declaration maps point into, as every release from
`langri-sha/projen` did.

There is deliberately no `engines` field. Published from the root, it would bind
consumers to the Node.js release this repository is developed on, so that lives
in `devEngines`, where `actions/setup-node` reads it.

## Dependencies

`webpack` and `@babel/register` are peers, so the plugins run on their
consumer's Webpack. `webpack` is also a devDependency at the current release,
since `tsc` needs its types to build `dist/`, so the build runs against newer
releases as Renovate moves it. Nothing here imports `@babel/register`, and pnpm
installs it as the unmet peer it is.

## Module format

`package.json` declares `"type": "module"`, as the rest of the fleet does, so
the projenrc is `.projenrc.ts`, the ESLint, Prettier and lint-staged configs are
`.js`, and `beachball.config.cjs` is the one CommonJS file.

`dist/` is built by `tsc` with `module` and `moduleResolution` set to `nodenext`
in `tsconfig.json`, which `prepublishOnly` runs with `--noEmit false`, so it
loads under native ESM, `require()` and webpack-cli. No interop shims:
`EnvironmentPlugin` comes from webpack's default export, since Node can't detect
it as a named export of CommonJS `webpack`, and `resolveLoader` uses
`import.meta.dirname`, climbing `'..', '..', '..'` from `dist/` to the
`node_modules` the package is installed in, which is where pnpm puts its
`babel-loader`.

`webpack-subresource-integrity` is pinned to 5.1.0. The ESM build of 5.2.0-rc.1
imports its own modules without file extensions
([waysact/webpack-subresource-integrity#236](https://github.com/waysact/webpack-subresource-integrity/issues/236)),
so don't let Renovate move it until that is fixed.

`pnpm smoke` guards all of this: it packs the tarball, installs it into a
temporary pnpm project, imports it in plain Node and builds with `babel-loader`.
The Workspace workflow runs it as the `smoke` job.

## Provenance

Extracted from `langri-sha/projen` at `6417104d` on 2026-10-01 with
`git filter-repo --subdirectory-filter packages/webpack`. All 180 commits that
touched the package keep their trees, authorship, dates and messages. The
history reaches back to 2020-10-24, when the package started in
`langri-sha/langri-sha.com`, which handed it to projen on 2026-08-15. Issue and
pull request numbers in those older messages refer to the two source
repositories.

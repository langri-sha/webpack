# Agents orientation — `langri-sha/webpack`

`@langri-sha/webpack` aggregates Webpack's plugins and loaders for monorepo
builds: it re-exports them beside shared `resolve` and `resolveLoader` settings,
so a workspace package can build without installing them itself. The package is
the repository root.

## Who owns which file

| Owner                                    | Files                                                                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Projen (`.projenrc.mts` → `pnpm projen`) | `package.json`, `.projen/`, `tsconfig*.json`, `pnpm-workspace.yaml`, `renovate.json5`, `beachball.config.js`, the ESLint, Prettier and lint-staged configs, `.husky/`, the ignore and attribute files, `CODEOWNERS`, `license` |
| Beachball                                | `CHANGELOG.md`, `CHANGELOG.json` and the `version` field                                                                                                                                                                       |
| You                                      | `src/**`, `readme.md`, `.github/workflows/`, this file                                                                                                                                                                         |

Synthesized files are read-only; change them in `.projenrc.mts`. Repository
settings, branch protection and the Actions secrets are managed by
`langri-sha/github-repos`.

## Common tasks

```sh
pnpm install
pnpm projen                             # re-synthesize from .projenrc.mts
pnpm tsc --build .                      # typecheck
pnpm eslint . && pnpm prettier --check .
pnpm run prepublishOnly                 # build dist/
pnpm change                             # write a change file
```

The package has no tests.

## Release

Beachball versions the package and the Release workflow publishes it through npm
trusted publishing. Anything that reaches the tarball or builds it — `src/`,
`readme.md`, `package.json`, `tsconfig.build.json` — needs a change file in the
same pull request. Root tooling does not: `beachball.config.js` lists what is
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

`package.json` declares no `"type"`, so the preset names the projenrc
`.projenrc.mts` and the ESLint, Prettier and lint-staged configs `.mjs`, and
`beachball.config.js` is CommonJS.

`dist/` is ESM all the same, so Node only loads the published entrypoint after
detecting its syntax, with a warning, and `__dirname` in `resolveLoader` is then
undefined. Every release since 0.5.0, the first built to `dist/`, has that
shape; it predates the move out of `langri-sha/projen` and is kept as published.
Its only former consumer, `langri-sha.com`'s `apps/web`, imported the TypeScript
source through `workspace:*`, never exercised `dist/`, and retired the package
on 2026-08-15.

## Provenance

Extracted from `langri-sha/projen` at `6417104d` on 2026-10-01 with
`git filter-repo --subdirectory-filter packages/webpack`. All 180 commits that
touched the package keep their trees, authorship, dates and messages. The
history reaches back to 2020-10-24, when the package started in
`langri-sha/langri-sha.com`, which handed it to projen on 2026-08-15. Issue and
pull request numbers in those older messages refer to the two source
repositories.

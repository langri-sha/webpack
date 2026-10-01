import { Project, TypeScriptConfig } from '@langri-sha/projen-project'

const project = new Project({
  name: '@langri-sha/webpack',
  package: {
    authorEmail: 'filip.dupanovic@gmail.com',
    authorName: 'Filip Dupanović',
    authorOrganization: false,
    authorUrl: 'https://langri-sha.com',
    bugsUrl: 'https://github.com/langri-sha/webpack/issues',
    copyrightYear: '2024',
    description: 'Webpack and its plugins aggregated for monorepo builds',
    homepage: 'https://github.com/langri-sha/webpack#readme',
    keywords: ['babel', 'monorepo', 'webpack'],
    license: 'MIT',
    licensed: true,
    minNodeVersion: '24.16.0',
    peerDependencyOptions: {
      pinnedDevDependency: false,
    },
    repository: 'git+https://github.com/langri-sha/webpack.git',
    type: 'module',

    deps: [
      'babel-loader@10.1.1',
      'clean-webpack-plugin@4.0.0',
      'copy-webpack-plugin@14.0.0',
      'html-webpack-plugin@5.6.8',
      'terser-webpack-plugin@5.6.1',
      'webpack-bundle-analyzer@5.4.0',
      'webpack-dev-server@6.0.0',
      'webpack-subresource-integrity@5.1.0',
    ],
    devDeps: [
      '@langri-sha/babel-preset@0.6.8',
      '@langri-sha/eslint-config@0.9.17',
      '@langri-sha/lint-staged@0.9.8',
      '@langri-sha/prettier@0.4.9',
      '@langri-sha/projen-project@*',
      '@langri-sha/tsconfig@1.0.2',
      '@types/node@24.19.0',
      'webpack@5.111.1',
    ],
    peerDeps: ['@babel/register@^8.0.0', 'webpack@^5.0.0'],
  },
  beachball: {
    config: {
      // The package is the repository root, so these would otherwise demand a
      // release for changes that never reach the tarball.
      ignorePatterns: [
        '.projenrc.ts',
        'AGENTS.md',
        'CODEOWNERS',
        'beachball.config.cjs',
        'eslint.config.js',
        'lint-staged.config.js',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'prettier.config.js',
        'renovate.json5',
        'scripts/**',
        'tsconfig.json',
      ],
    },
  },
  codeowners: {
    '*': '@langri-sha',
  },
  editorConfig: {},
  eslint: {},
  husky: {
    'pre-commit': 'lint-staged',
  },
  lintStaged: {},
  lintSynthesized: {},
  npmIgnore: {
    ignorePatterns: [
      '/*.config.*',
      '/*.json5',
      '/*.yaml',
      '/AGENTS.md',
      '/CODEOWNERS',
      '/change/',
      '/scripts/',
    ],
  },
  pnpmWorkspace: {
    minimumReleaseAgeExclude: ['@langri-sha/*'],
  },
  prettier: {},
  readme: {
    filename: 'readme.md',
  },
  renovate: {
    packageRules: [
      {
        description: 'Update our own packages together',
        groupName: 'langri-sha projen toolchain',
        groupSlug: 'langri-sha-projen',
        matchPackageNames: ['@langri-sha/**'],
      },
      {
        description: 'Install our own packages without waiting them out',
        matchPackageNames: ['@langri-sha/**'],
        minimumReleaseAge: null,
      },
      {
        description:
          'Install our own GitHub Actions and Terraform modules without waiting them out',
        matchPackageNames: ['langri-sha/**'],
        minimumReleaseAge: null,
      },
    ],
  },
  typeScriptConfig: {
    config: {
      compilerOptions: {
        noEmit: true,
      },
      include: ['src'],
    },
  },
})

project.package?.addField('packageManager', 'pnpm@12.8.1')
project.package?.addField('publishConfig', {
  access: 'public',
  main: 'dist/index.js',
  types: 'dist/index.d.ts',
})

// Published from the root, so `engines` would bind every consumer to the Node.js
// release this repository is developed on. `actions/setup-node` reads the same
// version from `devEngines`, which the registry leaves to the maintainers.
project.package?.file.addDeletionOverride('engines')
project.package?.addField('devEngines', {
  runtime: {
    name: 'node',
    version: `>= ${project.package.minNodeVersion}`,
  },
})

project.package?.setScript(
  'prepublishOnly',
  'rm -rf dist; tsc --project tsconfig.build.json',
)
project.package?.setScript('smoke', 'node scripts/smoke.js')

new TypeScriptConfig(project, {
  fileName: 'tsconfig.build.json',
  config: {
    extends: '@langri-sha/tsconfig/build',
    compilerOptions: {
      module: 'nodenext',
      moduleResolution: 'nodenext',
    },
    include: ['src'],
    exclude: ['**/*.test.*'],
  },
})

project.synth()

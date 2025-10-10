# @vc-shell/release-config

A utility package for managing releases in VC-Shell projects.

## Features

- Versioning with [semver](https://semver.org/) support and yarn compatibility
- Changelog generation with [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- Git tagging and commits
- Support for npm distribution tags (`latest`, `next`, `beta`, `alpha`, etc.)
- Yarn-compatible version strategies: `major`, `minor`, `patch`, `prerelease`

## Usage

The release-config package provides a streamlined workflow for versioning and publishing packages:

```ts
import { release } from "@vc-shell/release-config";

release({
  packages: [
    ".", // root
    "packages/a",
    "packages/b",
  ],
  toTag: (version) => `v${version}`,
  bumpVersion: async (pkgName, pkgVersion) => {
    // Your version bump implementation
  },
  generateChangelog: async (pkgName, pkgVersion, workspaceName) => {
    // Your changelog generation implementation
  },
});
```

## NPM Distribution Tags

Release-config now supports setting npm distribution tags during the release process. When running a release, you will be prompted to select a distribution tag:

- `latest` (default) - The default distribution tag for stable releases
- `next` - For upcoming features that are ready for testing
- `beta` - For beta releases (automatically selected for versions containing "beta")
- `alpha` - For alpha releases (automatically selected for versions containing "alpha") 
- `custom` - Allows specifying a custom distribution tag

After selecting a tag, you'll receive instructions on how to publish the packages with the selected tag:

```bash
# Using npm directly
npm publish --tag next

# Using yarn workspaces script
yarn publish:tag --tag next
```

## Configuration

You can also provide the tag via command line arguments:

```bash
yarn release --tag next
```

## License

MIT 

# @vc-shell/release-config

Release management system powered by Lerna for VC-Shell monorepo.

## Features

- **Automated versioning** with Lerna's conventional commits
- **Dependency synchronization** - Lerna automatically updates internal dependencies
- **Professional changelogs** with Features, Bug Fixes, Breaking Changes
- **Pre-release support** - alpha, beta, rc versions with proper incrementing
- **npm distribution tags** - automated tag management
- **Hybrid changelog format** - detailed in root + minimal in packages
- **Root package versioning** - root package.json stays synchronized
- **Apps synchronization** - automatic @vc-shell/* dependency updates in apps/
- **Initial changelog generation** - create changelogs from entire git history
- **Backward compatible** - maintains existing release script API

## Usage

The package provides a wrapper around Lerna for seamless integration:

```typescript
import { release } from "@vc-shell/release-config";

release({
  packages: [".", "framework", "cli/*", "configs/*"],
  toTag: (version) => `v${version}`,
  bumpVersion: async (pkgName, version) => {
    // Optional: custom version bump logic (Lerna handles this automatically)
  },
  generateChangelog: async (pkgName, version, workspace) => {
    // Optional: pre/post changelog hooks (Lerna handles changelog generation)
  },
});
```

## How It Works

1. Lerna analyzes git history using conventional commits
2. Determines which packages changed
3. Suggests version bump (patch/minor/major/prerelease)
4. Updates all package versions (fixed versioning, including root)
5. Generates CHANGELOG.md for each package
6. Synchronizes internal dependencies automatically
7. Updates @vc-shell/* dependencies in apps/ directory
8. Creates git commit and tag
9. Updates npmTag field in package.json
10. Enhances changelogs for packages without changes

## Commands

```bash
# Standard release
yarn release

# Dry run - performs all steps except git operations
yarn release:dry

# Generate changelogs from all commits (one-time operation)
yarn changelog:init

# Show changed packages
yarn changed

# Show diff since last release
yarn diff
```

### Initial Changelog Generation

For first-time setup or to regenerate changelogs from entire git history:

```bash
yarn changelog:init
```

This command:
- Creates `CHANGELOG.md` for all packages from **all git commits**
- Backs up existing changelogs (`.backup` extension)
- Formats according to conventional commits standard
- Cleans up generated files (removes guidelines, fixes formatting)
- **Automatically adds "Version bump only"** notes for empty versions
- Works with both `## 1.2.3` and `## [1.2.3]` version formats
- **Generates root CHANGELOG with package grouping** - shows changes by package for each version

**Note:** This is typically a one-time operation during initial setup or migration.

### Root CHANGELOG Format

The root `CHANGELOG.md` groups changes by package for each version:

```markdown
## 1.2.0

### Framework (@vc-shell/framework)

#### Features
* **components:** add VcTable component with sorting

#### Bug Fixes
* **router:** fix navigation guards in nested routes

### API Client Generator (@vc-shell/api-client-generator)

**Note:** Version bump only for package

### Create VC App (@vc-shell/create-vc-app)

#### Features
* add new scaffolding templates
```

This makes it easy to see what changed in which package for a specific version.

### Dry-run Mode

The `yarn release:dry` command performs all release steps without creating git commits or tags:

**What it does:**
- ✅ Updates package versions
- ✅ Generates/updates CHANGELOG.md files
- ✅ Updates npmTag fields in package.json
- ✅ Synchronizes internal dependencies

**What it skips:**
- ❌ Git commit
- ❌ Git tag creation
- ❌ Push to GitHub

After dry-run, you can review changes with `git diff` and revert with `git checkout -- .` if needed.

## Release Types

When running `yarn release`, you'll be prompted to select a release type:

1. **Automatic (based on commits)** - Lerna analyzes conventional commits and suggests appropriate version
2. **Prerelease (alpha/beta/rc)** - Create prerelease versions (e.g., 1.0.0-alpha.0)
3. **Graduate prerelease to stable** - Convert prerelease to stable (e.g., 1.0.0-alpha.0 → 1.0.0)
4. **Custom version** - Manually specify any valid semver version

## NPM Distribution Tags

The system automatically manages npm distribution tags:

- For prerelease versions, the tag is derived from the prerelease identifier (alpha/beta/rc)
- For stable versions, you can choose between `latest`, `next`, or custom tags
- Tags are stored in package.json `npmTag` field
- GitHub Actions workflow uses these tags for publishing

## Professional Changelog Format

Our changelogs follow industry best practices with:

- 📊 **Clear categorization** by commit type
- 🔗 **Direct links** to commits and issues
- 📝 **Detailed descriptions** with scope information
- ⚠️ **Breaking changes** prominently displayed
- 🎯 **Version comparison** links
- 📋 **"Version bump only"** notes for packages without direct changes

### For Packages with Changes

```markdown
# CHANGELOG

All notable changes to this package will be documented in this file.

## [1.2.0-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91...v1.2.0-alpha.0) (2025-01-15)

### Features

* **components:** add new VcTable component with sorting ([a1b2c3d](https://github.com/VirtoCommerce/vc-shell/commit/a1b2c3d))
* **framework:** implement lazy loading for modules ([b2c3d4e](https://github.com/VirtoCommerce/vc-shell/commit/b2c3d4e))

### Bug Fixes

* **router:** fix navigation guards in nested routes ([e4f5g6h](https://github.com/VirtoCommerce/vc-shell/commit/e4f5g6h))
* **i18n:** resolve translation fallback issue ([f5g6h7i](https://github.com/VirtoCommerce/vc-shell/commit/f5g6h7i))

### Performance Improvements

* **components:** optimize VcTable rendering with virtual scrolling ([c3d4e5f](https://github.com/VirtoCommerce/vc-shell/commit/c3d4e5f))

### Documentation

* **api:** update API documentation for new methods ([d4e5f6g](https://github.com/VirtoCommerce/vc-shell/commit/d4e5f6g))

### Code Refactoring

* **core:** extract common utilities to shared module ([g6h7i8j](https://github.com/VirtoCommerce/vc-shell/commit/g6h7i8j))

### BREAKING CHANGES

* API endpoints now require authentication token in headers
```

### For Packages without Changes

```markdown
# CHANGELOG

All notable changes to this package will be documented in this file.

## [1.2.0-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91...v1.2.0-alpha.0) (2025-01-15)

**Note:** Version bump only - Updated dependencies to match framework version
```

### Supported Sections

All commit types are now visible in changelogs:

| Type | Section | Description |
|------|---------|-------------|
| `feat` | Features | New features |
| `fix` | Bug Fixes | Bug fixes |
| `perf` | Performance Improvements | Performance improvements |
| `revert` | Reverts | Reverted changes |
| `docs` | Documentation | Documentation updates |
| `style` | Styles | Code style changes |
| `refactor` | Code Refactoring | Code refactoring |
| `test` | Tests | Test updates |
| `build` | Build System | Build system changes |
| `ci` | CI/CD | CI/CD changes |
| `chore` | Chores | Maintenance tasks |

## Benefits

- ✅ **Battle-tested** - Used by Babel, Jest, React Router, and other major projects
- ✅ **Zero manual work** - Automatic dependency management
- ✅ **Beautiful changelogs** - Grouped by type with commit links
- ✅ **Proper versioning** - Correct alpha/beta/rc incrementing
- ✅ **Backward compatible** - Maintains existing workflow
- ✅ **Type safe** - Full TypeScript support

## Integration with CI/CD

The package automatically sets `npmTag` field in package.json files during release:

### How it works

1. **During Release:**
   ```bash
   yarn release
   # Select: Prerelease → alpha
   ```

2. **What happens:**
   - Lerna bumps versions to `1.2.0-alpha.0`
   - `updateNpmTags()` adds `"npmTag": "alpha"` to package.json
   - Git commit includes both version and npmTag changes

3. **In GitHub Actions:**
   - Workflow reads `npmTag` field from package.json
   - Publishes packages with correct dist tag
   - Fallback: detects tag from version string if npmTag is missing

### Tag mapping

- `alpha` → npm tag `alpha` (for alpha prereleases)
- `beta` → npm tag `beta` (for beta prereleases)  
- `rc` → npm tag `rc` (for release candidates)
- `next` → npm tag `next` (for next versions)
- No field → npm tag `latest` (for stable releases)

### Example workflow integration

```yaml
- name: Determine npm tag
  run: |
    # Reads npmTag from package.json (set by release process)
    NPM_TAG=$(node -p "require('./framework/package.json').npmTag || 'latest'")
    echo "NPM_TAG=$NPM_TAG" >> $GITHUB_ENV

- name: Publish
  run: |
    yarn workspaces foreach npm publish --tag $NPM_TAG
```

**No changes needed** to your existing GitHub Actions - the workflow already supports this!

## Configuration

The release behavior is configured in `lerna.json` at the repository root:

- `conventionalCommits: true` - Enable conventional changelog generation
- `exact: true` - Fixed versioning (all packages same version)
- Lerna v9+ automatically uses workspace configuration
- `changelogPreset` - Controls which commit types appear in changelog

## Migration from Old System

This version maintains backward compatibility with the previous custom release system:

- Same API for `release()` function
- Same npm scripts (`yarn release`, `yarn release:dry`)
- Same workflow in GitHub Actions
- Enhanced with Lerna's capabilities under the hood

## License

MIT

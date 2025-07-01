# VC-Shell Vite Configuration Generator

This package provides a set of pre-configured Vite configurations for VC-Shell projects, simplifying the setup for different types of builds.

## Installation

```bash
npm install @vc-shell/config-generator --save-dev
# or
yarn add -D @vc-shell/config-generator
```

## Available Configurations

The package provides three main types of configurations:

1. **Application Configuration** - for primary VC-Shell applications
2. **Library Configuration** - for creating libraries and packages
3. **Dynamic Modules Configuration** - for creating modules that can be loaded dynamically at runtime

## Usage

### Application Configuration

```js
// vite.config.js
import { getApplicationConfiguration } from '@vc-shell/config-generator';

export default getApplicationConfiguration({
  // Custom settings (optional)
});
```

### Library Configuration

```js
// vite.config.js
import { getLibraryConfiguration } from '@vc-shell/config-generator';

export default getLibraryConfiguration({
  // Custom settings (optional)
});
```

### Dynamic Modules Configuration

```js
// vite.config.js
import { getDynamicModuleConfiguration } from '@vc-shell/config-generator';

export default getDynamicModuleConfiguration({
  // Compatibility configuration is required
  compatibility: {
    // Framework version compatibility (required)
    framework: '^1.1.0',
    
    // Compatibility with other modules (optional)
    modules: {
      '@vc-shell/module-catalog': '^1.0.0'
    },
  
  },
  
  // Additional configuration options (optional)
  entry: './src/index.ts',
  outDir: 'dist/modules',
  moduleName: 'MyCustomModule',
  
  // Additional external dependencies
  externals: ['axios', 'chart.js']
});
```

## Dynamic Modules Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `entry` | `string` | Module entry point (default: `./index.ts`) |
| `outDir` | `string` | Output directory (default: `dist/packages/modules`) |
| `moduleName` | `string` | Module name for UMD build (default: derived from package.json) |
| `compatibility` | `object` | **Required:** Compatibility constraints for the module |
| `compatibility.framework` | `string` | **Required:** Compatible framework version range |
| `compatibility.modules` | `object` | Compatible version ranges for other modules |
| `externals` | `string[]` | Additional external dependencies |

## Dynamic Modules Configuration Features

### Version Metadata

The configuration automatically adds version and compatibility information to the module build:

1. Adds a global variable `window.__VC_SHELL_MODULE_VERSION_INFO__` with version information
2. Creates a `version.json` file with version and compatibility metadata
3. Updates `manifest.json`, adding a reference to the version file

### Output Format

Modules are built in UMD format to ensure compatibility with various runtime environments.

### External Dependencies

By default, the following libraries are excluded from the build:
- Vue
- Vue Router
- Vee-Validate
- Vue I18n
- Moment.js
- Lodash
- VueUse
- VC-Shell Framework

## Examples

### Dynamic Module Configuration Example

```js
// vite.config.js
import { getDynamicModuleConfiguration } from '@vc-shell/config-generator';

export default getDynamicModuleConfiguration({
  entry: './src/main.ts',
  outDir: 'dist/custom-module',
  moduleName: 'VcCustomModule',
  
  compatibility: {
    framework: '^1.2.0',
    modules: {
      '@vc-shell/module-catalog': '^1.0.0',
      '@vc-shell/module-auth': '^1.5.0'
    },
  },
  
  externals: [
    'axios',
    'chart.js'
  ],
  
  // Any additional Vite configuration options
  build: {
    minify: 'esbuild',
    sourcemap: true,
    chunkSizeWarningLimit: 800
  }
});
```

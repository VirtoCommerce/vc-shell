# VC-Shell Vite Configuration Generator

Pre-configured Vite configurations for VC-Shell projects.

## Installation

```bash
yarn add -D @vc-shell/config-generator
```

## Available Configurations

### Application Configuration

For primary VC-Shell applications (e.g., vendor-portal).

```typescript
// vite.config.ts
import { getApplicationConfiguration } from "@vc-shell/config-generator";

export default getApplicationConfiguration();
```

### Host Federation Configuration

Adds Module Federation to a host application. Merge with your application config:

```typescript
import { getApplicationConfiguration, getHostFederationConfig } from "@vc-shell/config-generator";
import { mergeConfig } from "vite";

export default mergeConfig(
  getApplicationConfiguration(),
  getHostFederationConfig(),
);
```

Custom shared dependencies:

```typescript
getHostFederationConfig({
  sharedDeps: { "my-lib": { singleton: true } },
});
```

### Dynamic Module Configuration (Remote)

For modules loaded at runtime via Module Federation.

```typescript
// vite.config.ts
import { getDynamicModuleConfiguration } from "@vc-shell/config-generator";

export default getDynamicModuleConfiguration({
  compatibility: {
    framework: "^2.0.0",
  },
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entry` | `string` | `"./src/modules/index.ts"` | Module entry point |
| `exposes` | `Record<string, string>` | `{ "./module": entry }` | MF exposes map |
| `compatibility.framework` | `string` | -- | Compatible framework semver range |
| `compatibility.modules` | `Record<string, string>` | -- | Compatible module version ranges |

The module produces a `remoteEntry.js` file that the host loads at runtime.

### Library Configuration

For creating reusable packages.

```typescript
import { getLibraryConfiguration } from "@vc-shell/config-generator";

export default getLibraryConfiguration();
```

### Modules Library Configuration

For building a library of statically-bundled modules.

```typescript
import { getModulesLibraryConfiguration } from "@vc-shell/config-generator";

export default getModulesLibraryConfiguration({
  entry: "./index.ts",
});
```

# Modularity Plugin

The Modularity Plugin provides:
- **Dynamic Module Loading** via Module Federation
- **Extensions System** for cross-module communication
- **Module Registration** via `createAppModule()`

## Dynamic Module Loading

Dynamic modules are loaded at runtime using [Module Federation](https://module-federation.io/). The host app fetches a module registry from the server API, then loads each remote module as an ES module via `loadRemote()`.

### Host App Setup

```typescript
// main.ts
import { dynamicModulesPlugin } from "@vc-shell/framework";

app.use(dynamicModulesPlugin, {
  router,
  appName: "vendor-portal",
  registryUrl: "/api/marketplace/frontend-modules",
  frameworkVersion: "2.0.0", // optional -- enables compatibility filtering
});
```

The plugin:
1. Fetches the module registry from `registryUrl`
2. Filters modules by framework version compatibility (if `frameworkVersion` provided)
3. Registers all compatible remotes via MF runtime
4. Loads and installs each module as a Vue plugin
5. Sets `ModulesReadyKey` to `true` when complete (or `ModulesLoadErrorKey` on failure)

### Module Registry API

The host expects a JSON response from `registryUrl`:

```json
{
  "apps": {
    "vendor-portal": {
      "modules": [
        {
          "id": "reviews",
          "entry": "/Modules/.../remoteEntry.js",
          "version": "1.3.0",
          "compatibleWith": { "framework": "^2.0.0" }
        }
      ]
    }
  }
}
```

See `docs/api/module-registry-api.md` for the full API contract.

### Vite Configuration

**Host app:**

```typescript
// vite.config.ts
import { getApplicationConfiguration, getHostFederationConfig } from "@vc-shell/config-generator";
import { mergeConfig } from "vite";

export default mergeConfig(getApplicationConfiguration(), getHostFederationConfig());
```

**Remote module:**

```typescript
// vite.config.ts
import { getDynamicModuleConfiguration } from "@vc-shell/config-generator";

export default getDynamicModuleConfiguration({
  compatibility: { framework: "^2.0.0" },
});
```

### Error Handling

- **Registry fetch fails** -> `ModulesLoadErrorKey = true`, app renders without dynamic modules
- **Individual module fails** -> error logged, remaining modules continue loading
- **Incompatible module** -> filtered out before loading, warning logged

## Module Registration

Use `createAppModule()` to define a module:

```typescript
import * as pages from "./pages";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales);
```

### Options

```typescript
createAppModule(pages, locales, notificationTemplates?, moduleComponents?, {
  dependsOn: ["SellerDetails"], // blades that must be registered first
});
```

## Extensions System

The Extensions System enables communication between the application and its modules.

### Types of Extensions

1. **Inbound Extensions**: Allow the application to customize module functionality
2. **Outbound Extensions**: Module provides extensions to the application

### Registering Extensions

```typescript
export default {
  install(app) { /* ... */ },
  extensions: {
    inbound: {
      'customization-point': { someConfig: true }
    },
    outbound: {
      'extension-point': [
        { id: 'MyExtension', component: MyComponent }
      ]
    }
  }
}
```

### Using Extensions Helper

```typescript
import { inject } from 'vue';

const extensionsHelper = inject(extensionsHelperSymbol);
const outbound = extensionsHelper.getOutboundExtensions('extension-point');
const inbound = extensionsHelper.getInboundExtensions('module-id', 'customization-point');
```

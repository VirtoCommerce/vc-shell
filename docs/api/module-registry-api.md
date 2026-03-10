# Module Registry API

**Status:** Specification (pending .NET implementation)
**Consumer:** `dynamicModulesPlugin` in `@vc-shell/framework`
**Provider:** VirtoCommerce.Marketplace .NET module (or platform-level in future)

## Endpoint

```
GET /api/marketplace/frontend-modules
```

**Authentication:** Same as other platform API calls (bearer token from cookie/header).

**Content-Type:** `application/json`

## Response Schema

```typescript
interface ModuleRegistryResponse {
  apps: {
    [appName: string]: {
      modules: ModuleRegistryEntry[];
    };
  };
}

interface ModuleRegistryEntry {
  /** Unique module identifier -- used as MF remote name */
  id: string;

  /** URL path to the remoteEntry.js file (absolute or relative to host origin) */
  entry: string;

  /** Module semver version */
  version: string;

  /** Optional compatibility constraints */
  compatibleWith?: {
    /** Framework semver range this module is compatible with */
    framework?: string;

    /** Version ranges for other modules this module depends on */
    modules?: Record<string, string>;
  };
}
```

## Example Response

```json
{
  "apps": {
    "vendor-portal": {
      "modules": [
        {
          "id": "reviews",
          "entry": "/Modules/VirtoCommerce.MarketplaceReviews/reviews-app/dist/remoteEntry.js",
          "version": "1.3.0",
          "compatibleWith": {
            "framework": "^2.0.0"
          }
        },
        {
          "id": "communication",
          "entry": "/Modules/VirtoCommerce.MarketplaceCommunication/communication-app/dist/remoteEntry.js",
          "version": "2.1.0"
        },
        {
          "id": "import",
          "entry": "/Modules/VirtoCommerce.Import/import-app/dist/remoteEntry.js",
          "version": "1.0.0",
          "compatibleWith": {
            "framework": "^2.0.0",
            "modules": {
              "communication": "^2.0.0"
            }
          }
        }
      ]
    }
  }
}
```

## How `entry` URLs Are Resolved

Each module's `entry` is the path to its `remoteEntry.js` file. The path follows the standard VirtoCommerce module file layout:

```
/Modules/{ModuleId}/{frontend-app-folder}/dist/remoteEntry.js
```

The platform serves static files from each installed module's `Content/` directory. The frontend app build output (`dist/`) is placed there during module packaging.

## Error Responses

| Status | Meaning | Client behavior |
|--------|---------|-----------------|
| 200 | Success | Load modules normally |
| 200 + empty `modules: []` | No dynamic modules installed | `modulesReady = true`, no modules loaded |
| 200 + missing app key | App has no registered modules | Same as empty modules |
| 401/403 | Unauthorized | `modulesLoadError = true`, app renders without modules |
| 500 | Server error | `modulesLoadError = true`, app renders without modules |
| Network error | Unreachable | `modulesLoadError = true`, app renders without modules |

## Implementation Notes (.NET)

### Data Source

The endpoint should query the platform module catalog to discover installed VirtoCommerce modules that have frontend apps. Each .NET module that ships a frontend app declares it in its `module.manifest`:

```xml
<module>
  <id>VirtoCommerce.MarketplaceReviews</id>
  <version>1.3.0</version>
  <apps>
    <app id="reviews">
      <platform>vendor-portal</platform>
      <path>reviews-app/dist</path>
      <compatibleWith>
        <framework>^2.0.0</framework>
      </compatibleWith>
    </app>
  </apps>
</module>
```

### Suggested Controller

```csharp
[ApiController]
[Route("api/marketplace")]
public class FrontendModulesController : ControllerBase
{
    private readonly IModuleCatalog _moduleCatalog;

    public FrontendModulesController(IModuleCatalog moduleCatalog)
    {
        _moduleCatalog = moduleCatalog;
    }

    [HttpGet("frontend-modules")]
    public ActionResult<ModuleRegistryResponse> GetFrontendModules()
    {
        var modules = _moduleCatalog.Modules
            .Where(m => m.ModuleInstance != null)
            .SelectMany(m => GetFrontendApps(m))
            .GroupBy(a => a.Platform)
            .ToDictionary(
                g => g.Key,
                g => new AppModules
                {
                    Modules = g.Select(a => new ModuleRegistryEntry
                    {
                        Id = a.Id,
                        Entry = $"/Modules/{a.ModuleId}/{a.Path}/remoteEntry.js",
                        Version = a.Version,
                        CompatibleWith = a.CompatibleWith,
                    }).ToList()
                }
            );

        return Ok(new ModuleRegistryResponse { Apps = modules });
    }
}
```

### Caching

The module list changes only when modules are installed/updated (platform restart). Consider:
- Response caching with `[ResponseCache(Duration = 3600)]`
- Or `ETag` based on module catalog hash

### Migration Path

1. **Phase 1 (current):** Implement endpoint in `VirtoCommerce.Marketplace` module
2. **Phase 2 (future):** Promote to `VirtoCommerce.Platform` for all apps, not just marketplace

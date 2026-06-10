# Platform Manager REST Client

# Generate API client

This guide describes the process of generating an API client to access the VC Platform API from your custom application.

!!! note
Platform Manager REST Client offers generated REST API methods that make it easy to interact with the existing VirtoCommerce Platform API.

## Prerequisites

- .NET Core 6.0, particularly if you are using MacOS or Linux.

## Generate TypeScript API clients

To enable TypeScript API client generation in your project:

1. Add dependencies to your project:

Using command

```bash
yarn add @vc-shell/api-client-generator cross-env
```

<br>

`cross-env` runs scripts that set and use environment variables across platforms.

Manually

Add the dependencies to your project's **package.json**:

```json title="vc-app/package.json" linenums="1"
{
    ...
    "devDependencies": {
        ...
        "@vc-shell/api-client-generator": "latest",
        "cross-env": "latest",
        ...
    }
}
```

2. Configure client generation in your project. Inside your project's **package.json** file, add a `"generate-api-client"` command to the list of scripts:

   ```title="vc-app-extend/package.json" linenums="1"
   {
       "scripts": {
       ...
       "generate-api-client": "cross-env api-client-generator"
       }
   }
   ```

   The options are listed in the table below:

   | Options                      | Description                                                                                                                                                                                                                                                                   | Example                                                                  |
   | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
   | `--APP_PLATFORM_MODULES`     | Platform modules to generate API client.<br>{==string[]==} <br> **Always quote the value** so the shell does not split it: `'[Module1, Module2]'`. Spaces inside quotes are fine. The generator validates the value and fails fast with a quoting hint if it looks truncated. | `--APP_PLATFORM_MODULES='[VirtoCommerce.Catalog, VirtoCommerce.Orders]'` |
   | `--APP_API_CLIENT_DIRECTORY` | Output directory for generated API clients. <br>{==string==}                                                                                                                                                                                                                  | `--APP_API_CLIENT_DIRECTORY=./src/api_client/`                           |
   | `--APP_PLATFORM_URL`         | Platform URL to obtain client API configs. <br>{==string==}                                                                                                                                                                                                                   | `--APP_PLATFORM_URL=https://vcmp-dev.govirto.com/`                       |
   | `--APP_TYPE_STYLE`           | Sets the type style for generated DTOs. Can be 'Class' or 'Interface'.<br>{==string==}                                                                                                                                                                                        | `--APP_TYPE_STYLE=Interface`                                             |
   | `--VERBOSE`                  | Enable verbose logging. <br>{==boolean==}                                                                                                                                                                                                                                     | `--VERBOSE=true`                                                         |

   !!! note
   For the `--APP_TYPE_STYLE` parameter, use **exactly** `"Class"` or `"Interface"` (case-sensitive). Any other value will cause an error.

   !!! tip
   Use `--APP_TYPE_STYLE=Interface` for better TypeScript integration and smaller bundle sizes. Use `--APP_TYPE_STYLE=Class` when you need runtime type checking or class-specific features.

   !!! warning
   When passing `--APP_PLATFORM_MODULES` on the command line, wrap the value in quotes. Without quotes, the shell splits `[A, B]` on the space and only the first module is seen — the generator now detects this and exits with an error instead of silently generating a partial client.

3. Configure Platform URL and other settings in your project's **.env** file:

   ```title="vc-app-extend/.env"
   APP_PLATFORM_MODULES=[VirtoCommerce.Catalog,VirtoCommerce.Orders]
   APP_API_CLIENT_DIRECTORY=./src/api_client/
   APP_TYPE_STYLE=Interface
   ```

   !!! note
   All configuration options can be set via environment variables in `.env` file or passed as command line arguments. Environment variables take precedence over CLI arguments.

   !!! tip
   Keep machine-specific Platform URLs out of shared `.env` files. Set `APP_PLATFORM_URL` in `.env.local`, in your shell, or pass `--APP_PLATFORM_URL=...` when running the generator.

   The minimal `.env` above is enough for the default generation mode. By default, the generator writes TypeScript client files into `APP_API_CLIENT_DIRECTORY`; it does not create a generated API package or `package.json`.

   Package mode is optional. Use it only when you intentionally maintain a generated API package. Package mode is enabled with `--PACKAGE=true` or when a `package.json` already exists in `APP_API_CLIENT_DIRECTORY`. In package mode, these additional options apply:

   | Options                 | Description                                          | Example                          |
   | ----------------------- | ---------------------------------------------------- | -------------------------------- |
   | `--APP_PACKAGE_NAME`    | Package name for generated API clients.              | `--APP_PACKAGE_NAME=@my-app/api` |
   | `--APP_PACKAGE_VERSION` | Package version for generated API clients.           | `--APP_PACKAGE_VERSION=1.1.0`    |
   | `--APP_OUT_DIR`         | Output directory used by generated package metadata. | `--APP_OUT_DIR=dist`             |
   | `--APP_BUILD_DIR`       | Directory where TypeScript files will be compiled.   | `--APP_BUILD_DIR=lib`            |
   | `--SKIP_BUILD`          | Skip build step.                                     | `--SKIP_BUILD=true`              |

4. Generate the API clients using the following command:

   ```
   yarn generate-api-client
   ```

This command generates the required API clients for your custom application. Now you can effortlessly access the VC Platform API from your custom application using the generated API client.

## Features

### Smart Configuration Merging

When package mode is enabled, the generator intelligently merges configuration files to preserve your custom settings. When you update an existing generated API package:

- Custom package.json fields like name, version, description, keywords, author and license are preserved
- Custom tsconfig.json settings are maintained
- Exports are intelligently updated to preserve existing paths

### Package Metadata Tracking

When package mode is enabled, the generated API package includes metadata to track the generation:

```json
{
  "apiClientGenerator": {
    "version": "1.1.0",
    "generatedAt": "2025-04-01T12:30:45.123Z"
  }
}
```

### Multiple API Exports

This applies when package mode is enabled.

The generator handles multiple API clients effectively:

- Creates standardized exports with both short names (`./{moduleName}`) and full names (`./virtocommerce.{moduleName}`)
- Prevents duplicate module exports by intelligently merging with existing ones
- Automatically removes `module` and `types` fields that conflict with multiple exports
- Works properly with incremental generation (can add new APIs without breaking existing ones)

### Smart Root Export Handling

This applies when package mode is enabled.

The generator now intelligently handles root exports based on the number of API modules:

- **Single API Module**: When only one API module is generated, it automatically becomes the root export (`.`) and `module`/`types` fields are maintained
- **Multiple API Modules**: When multiple API modules are generated, only subpath exports are used (e.g., `./moduleA`, `./moduleB`)
- **Preserving Preferences**: If a root export already exists, it will be preserved as long as it points to one of the generated modules

This enables both simple usage for single-API packages and proper subpath exporting for multi-API packages:

```js
// Single API package (using root export)
import { MyClient } from "@myapp/api";

// Multi-API package (using subpath exports)
import { ClientA } from "@myapp/api/moduleA";
import { ClientB } from "@myapp/api/moduleB";
```

### Directory Creation

Target directories are automatically created if they don't exist.

### Verbose Logging

Enable detailed logging to troubleshoot generation issues:

```
yarn generate-api-client --VERBOSE=true
```

### Custom Build Directory

This applies when package mode is enabled.

You can specify a custom build directory where TypeScript files will be compiled:

```
yarn generate-api-client --APP_BUILD_DIR=lib
```

By default, the build directory is "dist".

### Error Handling Improvements

Better error handling and reporting make it easier to diagnose issues during client generation.

## Recent Improvements (v1.1.9)

### New Features

- **Environment Variables Support**: All configuration options can now be set via environment variables in `.env` file
- **Improved Module List Parsing**: Enhanced support for spaces in module lists (e.g., `[Module1, Module2]` or `[Module1,Module2]`)
- **Better Boolean Handling**: Improved handling of boolean environment variables (`true`/`false` strings)
- **Enhanced Error Messages**: More descriptive error messages for missing required parameters

### Fixed Issues

- **Configuration Preservation**: Fixed issue where package.json and tsconfig.json user settings were being overwritten
- **Export Path Management**: Improved export path handling to prevent incorrect paths with duplicated prefixes
- **Path Normalization**: Added better path normalization to handle edge cases correctly
- **Export Deduplication**: Implemented smarter export merging to prevent duplicate exports with different path formats
- **Build Directory Support**: Added proper support for custom build directories via APP_BUILD_DIR parameter
- **Declaration Files Location**: Fixed issue with TypeScript declaration files location to match the build directory
- **Error Handling**: Improved JSON parsing error handling with better fallback strategies
- **Root Export Handling**: Fixed issue with root exports being ignored or improperly handled

### Previous Features

- **Intelligent Config Merging**: Complete rewrite of configuration merging logic to better preserve user settings
- **Export Path Standardization**: New system for standardizing export paths to improve consistency
- **Path Validation**: Added strict validation of export paths to prevent invalid configurations
- **Improved Logging**: Added more detailed logging for better debugging
- **Extended User Fields Preservation**: Expanded the list of user-defined fields that are preserved during updates
- **Better Directory Management**: Improved directory creation and validation process
- **Smart Single/Multi API Detection**: Automatically detects single API scenarios and creates appropriate root exports
- **Module/Types Field Handling**: Preserves module and types fields for single API packages while removing them for multi-API packages

## Troubleshooting

If you encounter issues during API client generation:

1. Enable verbose logging with `--VERBOSE=true`
2. Ensure target directories have proper permissions
3. Check your connectivity to the platform URL
4. Verify that the specified platform modules exist
5. If package mode is enabled and you encounter JSON parsing errors in tsconfig.json or package.json, try using the `--VERBOSE=true` flag to see detailed error messages
6. If package mode is enabled, check for duplicate exports in package.json which might cause conflicts
7. If package mode is enabled and you manually modified exports in package.json, ensure they follow the correct format

### Common Issues

#### APP_TYPE_STYLE Error

If you see an error like:

```
Error converting value "$(APP_TYPE_STYLE)" to type 'NJsonSchema.CodeGeneration.TypeScript.TypeScriptTypeStyle'
```

This means the `APP_TYPE_STYLE` parameter was not properly validated or passed to NSwag:

**Solution:**

1. Ensure you're using exactly `"Class"` or `"Interface"` (case-sensitive)
2. Check that you're passing the parameter correctly: `--APP_TYPE_STYLE=Interface`
3. Enable verbose logging to see what value is being passed: `--VERBOSE=true`

**Example of correct usage:**

```bash
yarn generate-api-client --APP_TYPE_STYLE=Interface --VERBOSE=true
```

#### NSwag Command Failed

If NSwag fails with exit code, check:

1. .NET Core 6.0 or later is installed
2. The platform URL is accessible
3. The specified modules exist on the platform
4. Enable verbose logging to see the full error output

# Platform Manager REST Client

# Generate API client

This guide describes the process of generating an API client to access the VC Platform API from your custom application.

!!! note
    Platform Manager REST Client offers generated REST API methods that make it easy to interact with the existing VirtoCommerce Platform API.

## Prerequisites

* .NET Core 6.0, particularly if you are using MacOS or Linux.

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
        "generate-api-client": cross-env api-client-generator --APP_PLATFORM_MODULES='[MarketplaceVendor,Catalog,Orders]' --APP_API_CLIENT_DIRECTORY=./src/api_client/
        }
    }
    ```

    The options are listed in the table below:

    |          Options           	|                        Description                            	|                          Example                          	|
    |-----------------------------	|----------------------------------------------------------------	|------------------------------------------------------------	|
    | `--APP_PLATFORM_MODULES`     	| Platform modules to generate API client.<br>{==string[]==} <br> Customize the `--APP_PLATFORM_MODULES` list<br>to match your project's requirements.	| `--APP_PLATFORM_MODULES='[MarketplaceVendor,Orders,Catalog]'` 	|
    | `--APP_API_CLIENT_DIRECTORY` 	| Output directory for generated API clients. <br>{==string==} 	| `--APP_API_CLIENT_DIRECTORY=./src/api_client/`                	|
    | `--APP_PLATFORM_URL`         	| Platform URL to obtain client API configs. <br>{==string==} 	    | `--APP_PLATFORM_URL=https://vcmp-dev.govirto.com/`       	|
    | `--APP_PACKAGE_NAME`         	| Package name for generated API clients. <br>{==string==} 	    | `--APP_PACKAGE_NAME=vc-app-extend`       	|
    | `--APP_PACKAGE_VERSION`         	| Package version for generated API clients. <br>{==string==} 	    | `--APP_PACKAGE_VERSION=1.0.0`       	|
     | `--APP_TYPE_STYLE`           | Sets the type style for generated DTOs. Can be 'Class' or 'Interface'.<br>{==string==} | `--APP_TYPE_STYLE=Interface`                                |
    | `--APP_OUT_DIR`         	| Output directory for generated API clients. <br>{==string==} 	    | `--APP_OUT_DIR=./src/api_client/`       	|
    | `--APP_BUILD_DIR`         	| Directory where TypeScript files will be compiled. <br>{==string==} 	    | `--APP_BUILD_DIR=lib` (default is "dist")      	|
    | `--SKIP_BUILD`         	| Skip build step. <br>{==boolean==} 	    | `--SKIP_BUILD=true`       	|
    | `--VERBOSE`         	| Enable verbose logging. <br>{==boolean==} 	    | `--VERBOSE=true`       	|

3. Configure Platform URL to ensure your project can access the platform's API configurations. Add the platform URL to your project's **.env** file:

    ```title="vc-app-extend/.env"
    APP_PLATFORM_URL=https://vcmp-dev.govirto.com/
    ```

    !!! note
        Alternatively, you can specify the Platform URL as a command option in the previous step when running the `"generate-api-client"` command.

4. Generate the API clients using the following command:

    ```
    yarn generate-api-client
    ```

This command generates the required API clients for your custom application. Now you can effortlessly access the VC Platform API from your custom application using the generated API client.

## Features

### Smart Configuration Merging

The generator now intelligently merges configuration files to preserve your custom settings. When you update an existing API client:

- Custom package.json fields like name, version, description, keywords, author and license are preserved
- Custom tsconfig.json settings are maintained
- Exports are intelligently updated to preserve existing paths

### Metadata Tracking

API client now includes metadata to track the generation:

```json
{
  "apiClientGenerator": {
    "version": "1.1.0",
    "generatedAt": "2025-04-01T12:30:45.123Z"
  }
}
```

### Multiple API Exports

The generator handles multiple API clients effectively:

- Creates standardized exports with both short names (`./{moduleName}`) and full names (`./virtocommerce.{moduleName}`) 
- Prevents duplicate module exports by intelligently merging with existing ones
- Automatically removes `module` and `types` fields that conflict with multiple exports
- Works properly with incremental generation (can add new APIs without breaking existing ones)

### Smart Root Export Handling

The generator now intelligently handles root exports based on the number of API modules:

- **Single API Module**: When only one API module is generated, it automatically becomes the root export (`.`) and `module`/`types` fields are maintained
- **Multiple API Modules**: When multiple API modules are generated, only subpath exports are used (e.g., `./moduleA`, `./moduleB`)
- **Preserving Preferences**: If a root export already exists, it will be preserved as long as it points to one of the generated modules

This enables both simple usage for single-API packages and proper subpath exporting for multi-API packages:

```js
// Single API package (using root export)
import { MyClient } from '@myapp/api';

// Multi-API package (using subpath exports)
import { ClientA } from '@myapp/api/moduleA';
import { ClientB } from '@myapp/api/moduleB';
```

### Directory Creation

Target directories are automatically created if they don't exist.

### Verbose Logging

Enable detailed logging to troubleshoot generation issues:

```
yarn generate-api-client --VERBOSE=true
```

### Custom Build Directory

You can specify a custom build directory where TypeScript files will be compiled:

```
yarn generate-api-client --APP_BUILD_DIR=lib
```

By default, the build directory is "dist".

### Error Handling Improvements

Better error handling and reporting make it easier to diagnose issues during client generation.

## Recent Improvements (v1.1.8)

### Fixed Issues

- **Configuration Preservation**: Fixed issue where package.json and tsconfig.json user settings were being overwritten
- **Export Path Management**: Improved export path handling to prevent incorrect paths with duplicated prefixes
- **Path Normalization**: Added better path normalization to handle edge cases correctly
- **Export Deduplication**: Implemented smarter export merging to prevent duplicate exports with different path formats
- **Build Directory Support**: Added proper support for custom build directories via APP_BUILD_DIR parameter
- **Declaration Files Location**: Fixed issue with TypeScript declaration files location to match the build directory
- **Error Handling**: Improved JSON parsing error handling with better fallback strategies
- **Root Export Handling**: Fixed issue with root exports being ignored or improperly handled

### New Features

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
5. If you encounter JSON parsing errors in tsconfig.json or package.json, try using the `--VERBOSE=true` flag to see detailed error messages
6. Check for duplicate exports in your package.json which might cause conflicts
7. If you manually modified exports in package.json, ensure they follow the correct format

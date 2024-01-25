# Generate API client

This guide describes the process of generating an API client to access the VC Platform API from your custom application.

!!! note
    Platform Manager REST Client offers generated REST API methods that make it easy to interact with the existing VirtoCommerce Platform API.

## Prerequisites

* .NET Core 6.0, particularly if you are using MacOS or Linux.

## Generate TypeScript API clients

To enable TypeScript API client generation in your project:

1. Add dependencies to your project:

    === "Using command"

        ```bash
        yarn add @vc-shell/api-client-generator cross-env
        ```
        <br>
        `cross-env` runs scripts that set and use environment variables across platforms.

        [Read more about cross-env](https://github.com/kentcdodds/cross-env){ .md-button }

    === "Manually"

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

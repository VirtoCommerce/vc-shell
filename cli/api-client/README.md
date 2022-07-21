# Platform Manager REST Client

Generated REST API methods to easily communicate with existing VirtoCommerce Platform.

### To add support of TypeScript API client generation into a project

1. Add `"@virtoshell/api-client-generator": version` dependency into the `package.json`
2. Add `"generate-api-client": "api-client-generator"` command to the list of scripts in the `package.json`
3. Add `"generate-api-client:project-name": "lerna run generate-api-client --scope=@virtoshell/project-name"`

### To generate the TypeScript API client from command line

Run command
```
yarn generate-api-client
```
to generate API clients for all projects or
```
yarn generate-api-client:project-name
```
to generate API clients for specific project.

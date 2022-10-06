# Platform Manager REST Client

Generated REST API methods to easily communicate with existing VirtoCommerce Platform.

## To add support of TypeScript API client generation into a project

1. Add `"@vc-shell/api-client-generator": version` dev dependency into the `package.json`
2. Add `"generate-api-client": "api-client-generator --color"` command to the list of scripts in the `package.json`
3. Add `"generate-api-client:project-name": "lerna run generate-api-client --scope=@vc-shell/project-name --stream --no-prefix"`

## To generate the TypeScript API client from command line

### Prerequisite

0. Install **.NET Core 6.0**, if you use **Mac OS** or **Linux**
1. Run `yarn` or `yarn bootstrap` to install dependency
2. Run `yarn build` or `yarn build-cli:api-client` to build API client generator

### Run command

```
yarn generate-api-client
```
to generate API clients for all projects or
```
yarn generate-api-client:project-name
```
to generate API clients for specific project.

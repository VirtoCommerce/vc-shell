# VirtoShell: VirtoCommerce Vue3 Frontend for specialized back-office applications

The project is originated to create a replacement of the current vc-platform manager concept.

## Main project goals

- Technological shift from AngularJS to Vue3 for platform backoffice UI development.
- Split core components into separate packages with own release cycle.
- Simplify and speed up customization of any existing or brand new specialized (use case oriented) Backoffice applications with the help of unique VC design system. It's a collection of reusable components, guided by clear standards, that can be assembled together to build a number of applications.

## Tech stack

- **lerna** (managing monorepo and its packages dependencies).
- **Vue 3** as background for our solution.
- **webpack** based on `vue-cli-service` for easy build and deployment.
- **storybook** for interactive documentation.

## Demo

- [Demo Manager](https://demo-manager.govirto.com/)
- [UI Kit Storybook](https://ui-kit.govirto.com/)

## Getting started

```bash
# install and relocate root and packages dependencies
# this will also install and configure package dependencies and git hooks
$ yarn

# reinstall or refresh packages dependencies
$ yarn bootstrap

# build all packages
$ yarn build

# or one by one
$ yarn build-framework:ui
$ yarn build-framework:core
$ yarn build-framework:api-client
$ yarn build-apps:vendor-portal

# generate all api clients
yarn generate-api-client

# or one by one
yarn generate-api-client:api-client
yarn generate-api-client:vendor-portal

# start Vendor Portal with hot reload at localhost:8080
$ yarn serve-apps:vendor-portal

# run interactive documentation
$ yarn storybook-serve

# or build it
$ yarn storybook-build
```

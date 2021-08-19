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
$ npm install

# reinstall or refresh packages dependencies
$ npm run bootstrap

# build all packages
$ npm run build

# or one by one
$ npm run build-framework:ui
$ npm run build-framework:core
$ npm run build-framework:api-client
$ npm run build-apps:demo-manager

# start Platform Manager Demo with hot reload at localhost:8080
$ npm run serve-apps:demo-manager

# run interactive documentation
$ npm run storybook-serve

# or build it
$ npm run storybook-build
```

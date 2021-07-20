# VC Platform Manager SDK

The project is originated to create a replacement of the current vc-platform manager concept.

## Main project goals

- Technological shift from AngularJS to Vue3 for platform backoffice UI development.
- Split core components into separate packages with own release cycle.
- Simplify and speed up customization of any existing or brand new specialized (use case oriented) Backoffice applications with the help of unique VC design system. It's a collection of reusable components, guided by clear standards, that can be assembled together to build a number of applications.

## Tech stack

- **lerna** (managing monorepo and its packages dependencies).
- **Vue 3** as background for our solution.
- **webpack** for easy build and deployment.

## Getting started

```bash
# install and relocate root and packages dependencies
$ npm install

# reinstall or refresh packages dependencies
$ npm run bootstrap

# build all packages
$ npm run build

# or one by one
$ npm run build:ui-kit
$ npm run build:shell
$ npm run build:api-client
$ npm run build:demo-manager

# start demo shell with hot reload at localhost:8080
$ npm run serve:demo-manager

# run interactive documentation for ui-kit
$ npm run storybook-serve:ui-kit

# or build it
$ npm run storybook-build:ui-kit

```

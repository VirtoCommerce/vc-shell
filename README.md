# VirtoShell: VirtoCommerce Vue3 Frontend for specialized back-office applications

The project is originated to create a replacement of the current vc-platform manager concept.

## Main project goals

- Technological shift from AngularJS to Vue3 for platform backoffice UI development.
- Split core components into separate packages with own release cycle.
- Simplify and speed up customization of any existing or brand new specialized (use case oriented) Backoffice applications with the help of unique VC design system. It's a collection of reusable components, guided by clear standards, that can be assembled together to build a number of applications.

## Tech stack

- **Yarn berry** (managing monorepo and its packages dependencies).
- **Vue 3** as background for our solution.
- **Vite** for easy build and deployment.
- **storybook** for interactive documentation.

## Demo

- [Demo Manager](https://demo-manager.govirto.com/)
- [UI Kit Storybook](https://ui-kit.govirto.com/)

## Getting started

```bash
# install and relocate root and packages dependencies
# this will also install and configure package dependencies and git hooks
$ yarn

# build all packages
$ yarn build

# or one by one
$ yarn build-framework
$ yarn build-cli:config
$ yarn build-cli:api-client
$ yarn build-cli:import-module

# generate api clients (require .NET Core 6 on Mac OS or Linux)
yarn generate-api-client:api-client

# run interactive documentation
$ yarn storybook-serve

# or build it
$ yarn storybook-build
```

#### Version bumping
```bash
$ yarn bump patch/minor/major
```

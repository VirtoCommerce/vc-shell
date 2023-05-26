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

## Creating your first application

Make sure you have executed `yarn` command and your current working directory is the one where you intend to create a project.

Run following command:
```bash
$ npx create-vc-app
```

This command will execute application scaffolding tool. You will be presented with prompts:

```text
✔ App name: … <your-app-name>
✔ Add Dashboard page? … No / Yes
✔ Add Login/Invite/Reset password pages? … No / Yes
✔ Add module starter? … No / Yes
✔ Module starter name: … <your-first-module-name>

Scaffolding app in ./<your-app-name>...

Done.
```


Once app is created, follow the instructions to install dependencies and start dev server:
```bash
$ cd <your-app-name>
$ yarn
$ yarn serve
```

## Working with blade navigation

In order to start working with navigation system of the application, you have to import `useBladeNavigation` composable from `@vc-shell/framework`

# vue-vc-platform-manager
The R&D project originated to create a replacement of the current vc-platform manager concept.

## The main R&D project goals:

- Technological shift from AngularJS to VueJS for platform backoffice UI development. VueJS is choosen as one of the best fit candidate at this role, in the future we can extend to another popular web frameworks (Angular, ReactJS, Svelte).
- Split core components into separate packages with own release cycle.
- Simplify and speed up customization of any existing or brand new specialized (use case oriented) Backoffice applications with the help of unique VC design system `vue-vc-manager-ui-kit`. It's a collection of reusable components, guided by clear standards, that can be assembled together to build a number of application.
- Provide the way for seamless migration to the new vc manager for existing solutions.

## Tech stack
- **lerna** (managing monorepo and its packages dependencies).
- **VueJS 2.6** as background for our solution.
- **@vue/composition-api** for reactive state management and preparation to VueJS 3 migration.
- **rollup & webpack** for easy build and deployment.

## Getting started

```bash
# install lerna globally
$ npm install -g lerna

# install and relocate dependencies
$ lerna bootstrap

# rebuild packages (optional) or prepare release
$ lerna run build

# serve shell with hot reload at localhost:8080
$ cd packages/vc-shell && npm run dev

```

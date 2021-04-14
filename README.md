# vue-vc-platform-manager - The R&D project that originated to create a replacement of the current vc-platform manager concept.

## The main R&D project goals:

- Migrate the current vc-manager application from AngularJS to VueJs, VueJs is choosen as one of the best  fit candidate at this role, in the future we can extend to another popular web frameworks (Angular and ReactJs) . 
- Simplify and speed the process of customization of existing and development a new specialized Backoffice applications thanks to using the own VC design system `vue-vc-manager-ui-kit` it's a collection of reusable components, guided by clear standards, that can be assembled together to build any number of application.
- Provide the seamless migration to the new vc manager for existing solutions 

## The architecture 
![image](https://user-images.githubusercontent.com/7566324/114682702-9f713980-9d0f-11eb-9600-d542e020fa43.png)

The entire solution consists from the three main elements:
- Atomic design system that composed of well-designed building blocks and CSS styles that have web frameworks agnostic nature
- Set of reusable components (building blocks) that can be used to compose a new changes for existing vc manager application or even build a new own application
- The new vc-manager application is implemented on new web tech stack and is built on the new vc-design system

## Tech stack
- VueJs 2.6 + Nuxt
- Bootstrap CSS 4.6
- vue-bootstrap
- vue-copmosition-api

## Getting started

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

# VirtoCommerce Vue3 Frontend for specialized back-office applications

## Technologies used

- **Vue3.** Progressive frontend framework with its key features allows to build fast applications.
- **Typescript.** All components and composables have type definitions, so IDE can help you to build clean and working code.
- **TailwindCSS.** The most popular and growing CSS framework providing wonderful flexible structure to speed up styling.
- **Husky + ESLint + Prettier.** Autoformat, check and fix your code and prevent ugly codestyle within repository.
- **Vite.** It is faster than Webpack. Really FASTER. Use it to develop with HMR benefits and to build for production.

## Architecture

```text
├─ public                         // Static assets
│  ├─ assets                      // Static images used inside the application.
│  └─ img
│     └─ icons                    // Icons used for favicons, PWA, etc.
├─ src
│  ├─ api_client                  // Generated API clients folder
│  │  └─...
│  ├─ components                  // Universal Vue components
│  │  └─...
│  ├─ config                      // Application extras config files
│  │  └─ push-hub.ts              // SignalR config file
│  ├─ locales                     // Locale files used to provide translated content
│  │  └─ en.json
│  ├─ modules                     // The collection of custom modules
│  │  └─ ...                      // Module folder
│  │     ├─ components            // The collection of components specific for this module
│  │     ├─ composables           // The collection of shared logic written using Composable API pattern.
│  │     ├─ locales               // Locale files used to provide translated content specific for this module
│  │     ├─ pages                 // Set of module pages used within Application router
│  │     └─ index.ts              // Module entry point
│  ├─ pages                       // Set of application pages used within Application router.
│  │  └─...
│  ├─ router                      // SPA routing configuration
│  │  └─...
│  ├─ styles                      // Extras application style files
│  │  └─ index.scss               // Tailwind initialization file
│  └─ types                       // Typescript .d.ts files
```

## Getting started

```bash
# install and configure package dependencies and git hooks
$ yarn

# build application
$ yarn build

# start application with hot reload at localhost:8080
$ yarn serve
```

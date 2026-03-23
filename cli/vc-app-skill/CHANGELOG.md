# [2.0.0-alpha.17](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.16...v2.0.0-alpha.17) (2026-03-23)


### Bug Fixes

* **vc-app-skill:** correct mock template in details-blade-generator ([04b7d43](https://github.com/VirtoCommerce/vc-shell/commit/04b7d43dc12cb66ad786f91017e48c4c30e889e9))
* **vc-app-skill:** validate runtime arg and fix command listing ([f7169af](https://github.com/VirtoCommerce/vc-shell/commit/f7169afa56092be2e223a61c0edd5b73cd653d77))


### Features

* **vc-app-skill:** add /vc-app design command documentation ([3cc59b2](https://github.com/VirtoCommerce/vc-shell/commit/3cc59b29831da7f2f78900c7f61354165583813e))
* **vc-app-skill:** add /vc-app design phases 1-6 (prompt → plan → execute → summary) ([b0bb44f](https://github.com/VirtoCommerce/vc-shell/commit/b0bb44f47e28fe9df147c5941a15e76b5ae3d2f8))
* **vc-app-skill:** add /vc-app design to routing table and help ([8b2f53e](https://github.com/VirtoCommerce/vc-shell/commit/8b2f53e7d8643f8ab87f3fab82dc4dd8c8bd44da))
* **vc-app-skill:** add /vc-app promote command with 5-phase flow ([a3b6da6](https://github.com/VirtoCommerce/vc-shell/commit/a3b6da658322a1e39ffb9808d0e80bf732f52ae8))
* **vc-app-skill:** add blade-enhancer agent for surgical module modifications ([bc83681](https://github.com/VirtoCommerce/vc-shell/commit/bc83681c99accd3a25b48a5da1916810a6393aa0))
* **vc-app-skill:** add design-specific error handling scenarios ([5381685](https://github.com/VirtoCommerce/vc-shell/commit/5381685b75a7eac82add64314cab8269518ba53f))
* **vc-app-skill:** add enhance flow to /vc-app generate for existing modules ([2936bd6](https://github.com/VirtoCommerce/vc-shell/commit/2936bd60946d4c63207682908a8edbb8f137e448))
* **vc-app-skill:** add entry-point and update commands ([ab9075f](https://github.com/VirtoCommerce/vc-shell/commit/ab9075f49b1bb2d93f56613758d038ef1ca09d09))
* **vc-app-skill:** add existingModule context and append mode to generators ([3978c66](https://github.com/VirtoCommerce/vc-shell/commit/3978c66aff3b2526f51227c560371be425018ad2))
* **vc-app-skill:** add module-analyzer agent for existing module introspection ([9eaff6b](https://github.com/VirtoCommerce/vc-shell/commit/9eaff6b3ca829ce41298c739f26ba6bdf93a2adb))
* **vc-app-skill:** add multi-runtime installer ([00e656e](https://github.com/VirtoCommerce/vc-shell/commit/00e656e65bef05ebe8e7cb29cbf2efe64b991f5a))
* **vc-app-skill:** add promote-agent subagent for mock-to-API transformation ([27484e3](https://github.com/VirtoCommerce/vc-shell/commit/27484e39c72e7b738e8db5846063e6388f7e06db))
* **vc-app-skill:** add SessionStart update check hook ([72c5bcf](https://github.com/VirtoCommerce/vc-shell/commit/72c5bcf33d4f8ae826e7ed76d9228c42cfa846d4))
* **vc-app-skill:** add uninstaller ([6a0507c](https://github.com/VirtoCommerce/vc-shell/commit/6a0507c9a5c755c0b4487c5625898c5c50c38986))
* **vc-app-skill:** create package scaffold with README ([a2bbced](https://github.com/VirtoCommerce/vc-shell/commit/a2bbced57b2fbb62bb56ca38c679b0c42e7aee88))
* **vc-app-skill:** migrate skill content from create-vc-app to standalone package ([1ac8945](https://github.com/VirtoCommerce/vc-shell/commit/1ac894510ca32cad22efb226117127f76085f85a))
* **vc-app-skill:** update scaffold to skip --module-name for standalone ([c82066e](https://github.com/VirtoCommerce/vc-shell/commit/c82066e3c910676ada13f0cd8f1d7db72d81982a))
# 2.0.0-alpha.16 (2026-03-23)

Initial release of the vc-app-skill package.

### Features

* **vc-app-skill:** scaffold standalone vc-shell projects (`/vc-app create`)
* **vc-app-skill:** connect to VirtoCommerce platform and generate API clients (`/vc-app connect`)
* **vc-app-skill:** add empty module skeletons (`/vc-app add-module`)
* **vc-app-skill:** intent-driven module generation with list/details blades, composables, and locales (`/vc-app generate`)
* **vc-app-skill:** enhance existing modules with surgical modifications — add columns, fields, toolbar actions, logic, blade links (`/vc-app generate` enhance flow)
* **vc-app-skill:** promote prototype modules from mock data to real API clients (`/vc-app promote`)
* **vc-app-skill:** 9 specialized subagents for code generation and transformation
* **vc-app-skill:** framework knowledge base with component docs, patterns, and examples

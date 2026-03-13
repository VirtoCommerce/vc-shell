# [2.0.0-alpha.10](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2026-03-13)


### Features

* **mf-host:** add mfHostConfig() vite helper for optimizeDeps ([501841d](https://github.com/VirtoCommerce/vc-shell/commit/501841d457ad9f3c671c41723b65045fae075d28))
* **mf-host:** import shared deps from mf-config instead of duplicating ([51d2df1](https://github.com/VirtoCommerce/vc-shell/commit/51d2df126ac45ca388c7eb5ce8943fc324938a25))
# [2.0.0-alpha.9](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2026-03-12)


### Bug Fixes

* topological build order, deprecation fixes, and dependency updates ([bf01eaf](https://github.com/VirtoCommerce/vc-shell/commit/bf01eaf7574eda5ae393941b553cbea5918a768f))
# [2.0.0-alpha.8](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2026-03-12)


### Features

* **mf:** extract Module Federation loader into @vc-shell/mf-config and @vc-shell/mf-host ([9b079c2](https://github.com/VirtoCommerce/vc-shell/commit/9b079c27bc1497d89849b909f62c1403eff0c9b4))
# [2.0.0-alpha.7](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2026-03-11)


### Bug Fixes

* remove duplicate changelog entries caused by multiline regex bug ([2f27d4c](https://github.com/VirtoCommerce/vc-shell/commit/2f27d4c2ca81452ddc1042af47a4648348e7e323))
# [2.0.0-alpha.6](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2026-03-10)

### Bug Fixes

- strip shared dep styles from dynamic module builds ([4bb592e](https://github.com/VirtoCommerce/vc-shell/commit/4bb592e5c101bf23259b929b00776144810d182c))

# [2.0.0-alpha.5](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2026-03-10)

### Bug Fixes

- pin @module-federation/dts-plugin to 2.0.1 to fix ESM/CJS fs-extra crash ([a41d233](https://github.com/VirtoCommerce/vc-shell/commit/a41d2335761e723eda33b45dbb45ef3e70752bf7))

# [2.0.0-alpha.4](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2026-03-10)

**Note:** Version bump only for package @vc-shell/config-generator

# [2.0.0-alpha.3](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2026-03-10)

**Note:** Version bump only for package @vc-shell/config-generator

# [2.0.0-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.8...v2.0.0-alpha.2) (2026-03-10)

### Code Refactoring

- remove unused components and update package resolutions ([26ff398](https://github.com/VirtoCommerce/vc-shell/commit/26ff398739d75b23f7f700542920a117e0022ff3))

**Note:** Version bump only for package @vc-shell/config-generator

# [2.0.0-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2026-03-10)

**Note:** Version bump only for package @vc-shell/config-generator

# [2.0.0-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.8...v2.0.0-alpha.0) (2026-03-10)

### Features

- **core:** add Module Federation support and remove legacy UMD globals ([18c4026](https://github.com/VirtoCommerce/vc-shell/commit/18c402677846dfff8f077dccb7a782fcf5a778e0))
- **shared-deps:** export SHARED_DEP_NAMES as single source of truth for MF shared deps ([18f68ef](https://github.com/VirtoCommerce/vc-shell/commit/18f68efda491d7e595acfb4b1a547d82658967f2))

### Bug Fixes

- **vite-config:** normalize symlinked paths in stripExternalStyles via realpathSync ([6f825aa](https://github.com/VirtoCommerce/vc-shell/commit/6f825aa66b2bb209dba6a7497a3af4de981022d8))

### Documentation

- **vite-config:** clarify build-time vs runtime MF roles in getHostFederationConfig ([cf2f9b7](https://github.com/VirtoCommerce/vc-shell/commit/cf2f9b7dfd358aa192fac580c2697205f4649984))

## [1.2.4-beta.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.7...v1.2.4-beta.8) (2026-03-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.4-beta.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.6...v1.2.4-beta.7) (2026-03-04)

### Code Refactoring

- dynamically import `rollup-plugin-visualizer` to conditionally load it when analysis is enabled ([57f5182](https://github.com/VirtoCommerce/vc-shell/commit/57f5182496b5d2a9897f6e1f70522177782316c7))

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.4-beta.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.5...v1.2.4-beta.6) (2026-03-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.4-beta.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.4...v1.2.4-beta.5) (2026-03-04)

### Features

- **vite-config:** add modules-library build configuration ([cce505f](https://github.com/VirtoCommerce/vc-shell/commit/cce505f77b6ada4d5488410d11b62b78396961d3))
- re-enable circular dependency detection in production builds ([a139829](https://github.com/VirtoCommerce/vc-shell/commit/a139829f54e40e7ff987eee1effdfbe88c90343b))
- **vite-config:** add Vite server.warmup for monorepo dev server pre-transform ([c80ea68](https://github.com/VirtoCommerce/vc-shell/commit/c80ea688203f21dcd37a2e506f3be4218d15810d))
- **vite-config:** env-gate rollup-plugin-visualizer in shared Vite config ([fec0276](https://github.com/VirtoCommerce/vc-shell/commit/fec02761cf27ec379049944c04c19258e8a028a3))
- **vc-loading:** replace dots loader with bar sweep and add instant preloader ([019e8d6](https://github.com/VirtoCommerce/vc-shell/commit/019e8d6fb5736f766bdba2841c3b5cf7f00b3b77))

### Bug Fixes

- set circular dependency plugin to warn mode instead of throwing ([69d5cff](https://github.com/VirtoCommerce/vc-shell/commit/69d5cffe8cada7ad3808dc44764df76c9bbe10e7))
- **build:** suppress empty chunk, mixed import, and date-fns locale warnings ([d973302](https://github.com/VirtoCommerce/vc-shell/commit/d97330264de9f0f03474d919fcee971c6864989c))

## [1.2.4-beta.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.3...v1.2.4-beta.4) (2026-02-24)

### Features

- **dynamic-modules:** add hash-based cache busting for module assets ([eb47537](https://github.com/VirtoCommerce/vc-shell/commit/eb475375fad72f4c00016e0e8d9298cdbc44a321))

## [1.2.4-beta.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.2...v1.2.4-beta.3) (2026-02-20)

### Code Refactoring

- configure path aliases and migrate imports ([bfffc3c](https://github.com/VirtoCommerce/vc-shell/commit/bfffc3cbe8029cf875e49941061b582825cad9a6))

## [1.2.4-beta.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.1...v1.2.4-beta.2) (2026-02-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.4-beta.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.0...v1.2.4-beta.1) (2026-02-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.4-beta.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3-beta.1...v1.2.4-beta.0) (2026-02-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.3-beta.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3...v1.2.3-beta.1) (2026-01-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.2...v1.2.3) (2026-01-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3-beta.0...v1.2.2) (2026-01-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.3-beta.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.14...v1.2.3-beta.0) (2025-12-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.14](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.13...v1.1.99-alpha.14) (2025-11-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.13](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.12...v1.1.99-alpha.13) (2025-11-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.12](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.11...v1.1.99-alpha.12) (2025-11-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.11](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.10...v1.1.99-alpha.11) (2025-11-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.10](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.9...v1.1.99-alpha.10) (2025-11-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.9](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.8...v1.1.99-alpha.9) (2025-11-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.7...v1.1.99-alpha.8) (2025-11-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.6...v1.1.99-alpha.7) (2025-11-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.5...v1.1.99-alpha.6) (2025-11-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.4...v1.1.99-alpha.5) (2025-11-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.3...v1.1.99-alpha.4) (2025-11-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.1...v1.1.99-alpha.3) (2025-11-25)

### Features

- update auth providers and fix tsx path in pre-commit hook ([a92d957](https://github.com/VirtoCommerce/vc-shell/commit/a92d957e2b0a0be177519e7256af9279d3419713))

## [1.2.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.0...v1.2.1) (2025-11-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.2.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.2...v1.2.0) (2025-11-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.1...v1.1.99-alpha.2) (2025-11-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.0...v1.1.99-alpha.1) (2025-11-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.99-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.5...v1.1.99-alpha.0) (2025-11-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.98-rc.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.4...v1.1.98-rc.5) (2025-11-07)

### Features

- update auth providers and fix tsx path in pre-commit hook ([a92d957](https://github.com/VirtoCommerce/vc-shell/commit/a92d957e2b0a0be177519e7256af9279d3419713))

## [1.1.98-rc.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.3...v1.1.98-rc.4) (2025-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.98-rc.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.2...v1.1.98-rc.3) (2025-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.98-rc.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.1...v1.1.98-rc.2) (2025-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.98-rc.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.0...v1.1.98-rc.1) (2025-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.98-rc.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.97...v1.1.98-rc.0) (2025-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.97](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.96...v1.1.97) (2025-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.96](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.95...v1.1.96) (2025-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.95](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.94...v1.1.95) (2025-10-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.94](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.93...v1.1.94) (2025-10-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.93](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.92...v1.1.93) (2025-10-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.92](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91...v1.1.92) (2025-10-17)

### Bug Fixes

- **vite-config:** remove deprecated vue-router path resolution from appconfig ([5743e12](https://github.com/VirtoCommerce/vc-shell/commit/5743e129b667192a23b894421b54b851d48dffa2))

## [1.1.91](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.5...v1.1.91) (2025-10-17)

### Bug Fixes

- **vite-config:** update vue-router path resolution to use absolute path from node_modules ([5418c14](https://github.com/VirtoCommerce/vc-shell/commit/5418c142daa1e9940a0a9a670b3f66f085165e03))

## [1.1.91-alpha.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.4...v1.1.91-alpha.5) (2025-10-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.91-alpha.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.3...v1.1.91-alpha.4) (2025-10-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.91-alpha.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.2...v1.1.91-alpha.3) (2025-10-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.91-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.1...v1.1.91-alpha.2) (2025-10-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.91-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.90...v1.1.91-alpha.1) (2025-10-14)

### Features

- update auth providers and fix tsx path in pre-commit hook ([a92d957](https://github.com/VirtoCommerce/vc-shell/commit/a92d957e2b0a0be177519e7256af9279d3419713))

## [1.1.90](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.89...v1.1.90) (2025-10-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.89](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.88...v1.1.89) (2025-10-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.88](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.87...v1.1.88) (2025-10-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.87](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.86...v1.1.87) (2025-10-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.86](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.85...v1.1.86) (2025-10-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.85](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.84...v1.1.85) (2025-10-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.84](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.84-alpha.0...v1.1.84) (2025-09-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.84-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.83...v1.1.84-alpha.0) (2025-09-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.83](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.83-alpha.0...v1.1.83) (2025-09-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.83-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.82...v1.1.83-alpha.0) (2025-09-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.82](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.81...v1.1.82) (2025-09-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.81](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.80...v1.1.81) (2025-09-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.80](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.79...v1.1.80) (2025-09-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.79](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.78...v1.1.79) (2025-09-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.78](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.77...v1.1.78) (2025-09-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.77](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.76...v1.1.77) (2025-09-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.76](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.75...v1.1.76) (2025-09-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.75](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.74...v1.1.75) (2025-09-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.74](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.73...v1.1.74) (2025-09-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.73](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.72...v1.1.73) (2025-09-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.72](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.71...v1.1.72) (2025-08-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.71](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.70...v1.1.71) (2025-08-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.70](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.69...v1.1.70) (2025-08-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.69](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.68...v1.1.69) (2025-08-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.68](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.67...v1.1.68) (2025-07-31)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.67](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.66...v1.1.67) (2025-07-31)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.66](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.65...v1.1.66) (2025-07-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.65](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.64...v1.1.65) (2025-07-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.64](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.63...v1.1.64) (2025-07-25)

### Bug Fixes

- remove intlify and vue-i18n from CSS chunk splitting logic ([a1c14c0](https://github.com/VirtoCommerce/vc-shell/commit/a1c14c0f8eae1126aef6ddcbd146533ac60360a3))

## [1.1.63](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.62...v1.1.63) (2025-07-25)

### Bug Fixes

- **vite-config:** dedupe and externalize vue-i18n ([98c7def](https://github.com/VirtoCommerce/vc-shell/commit/98c7def46db6f21866125946607bbb25c447ebad))

## [1.1.62](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.61...v1.1.62) (2025-07-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.61](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.60...v1.1.61) (2025-07-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.60](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.59...v1.1.60) (2025-07-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.59](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.58...v1.1.59) (2025-07-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.58](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.57...v1.1.58) (2025-07-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.57](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.56...v1.1.57) (2025-07-10)

### Code Refactoring

- **vite-config:** optimize production build settings by removing console statements and adjusting esbuild drop options ([b9f1a2f](https://github.com/VirtoCommerce/vc-shell/commit/b9f1a2fa970bd895f68f92140a9136ffb709b240))

## [1.1.56](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.55...v1.1.56) (2025-07-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.55](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.54...v1.1.55) (2025-07-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.54](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.53...v1.1.54) (2025-07-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.53](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.52...v1.1.53) (2025-07-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.52](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.51...v1.1.52) (2025-07-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.51](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.50...v1.1.51) (2025-07-02)

### Code Refactoring

- **vite-config:** enhance dynamic module registration and improve chunking logic for CSS files ([80c83b2](https://github.com/VirtoCommerce/vc-shell/commit/80c83b2ade7e4141447712e604045c6a82b32aff))

## [1.1.50](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.49...v1.1.50) (2025-07-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.49](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.48...v1.1.49) (2025-07-02)

### Bug Fixes

- **vite-config:** correct path for framework CSS in application configuration ([95d9a60](https://github.com/VirtoCommerce/vc-shell/commit/95d9a6083072fdc953b09f44092d8f0d594a1c6a))

## [1.1.48](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.47...v1.1.48) (2025-07-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.47](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.46...v1.1.47) (2025-07-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.46](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.45...v1.1.46) (2025-07-02)

### Features

- **dynamic-module:** enhance UMD name generation and improve logging for dynamic module loading ([8d43f21](https://github.com/VirtoCommerce/vc-shell/commit/8d43f216e6ec3f9f61ab93953f297d80832f9ed7))

## [1.1.45](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.44...v1.1.45) (2025-07-01)

### Features

- **vite-config:** enhansed chunking config ([6e8dde4](https://github.com/VirtoCommerce/vc-shell/commit/6e8dde4c6fc2be14bcf39ffb8f6ac6e75ff609a7))

## [1.1.44](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.43...v1.1.44) (2025-06-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.43](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.42...v1.1.43) (2025-06-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.42](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.41...v1.1.42) (2025-06-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.41](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.40...v1.1.41) (2025-06-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.40](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.39...v1.1.40) (2025-06-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.39](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.38...v1.1.39) (2025-06-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.38](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.37...v1.1.38) (2025-06-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.37](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.36...v1.1.37) (2025-06-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.36](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.35...v1.1.36) (2025-06-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.35](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.34...v1.1.35) (2025-06-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.34](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.33...v1.1.34) (2025-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.33](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.32...v1.1.33) (2025-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.32](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.31...v1.1.32) (2025-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.31](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.30...v1.1.31) (2025-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.30](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.29...v1.1.30) (2025-06-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.29](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.28...v1.1.29) (2025-06-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.28](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.27...v1.1.28) (2025-06-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.27](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.26...v1.1.27) (2025-06-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.26](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.25...v1.1.26) (2025-06-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.25](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.24...v1.1.25) (2025-05-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.24](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.23...v1.1.24) (2025-05-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.23](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.22...v1.1.23) (2025-05-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.22](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.21...v1.1.22) (2025-05-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.21](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.20...v1.1.21) (2025-05-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.20](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.19...v1.1.20) (2025-05-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.19](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.18...v1.1.19) (2025-05-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.18](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.17...v1.1.18) (2025-05-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.17](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.16...v1.1.17) (2025-05-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.16](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.15...v1.1.16) (2025-05-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.15](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.14...v1.1.15) (2025-05-23)

### Code Refactoring

- **types:** remove apps property from CompatibilityOptions interface to streamline compatibility checks ([dad92f9](https://github.com/VirtoCommerce/vc-shell/commit/dad92f9414b073824d20688a28fd5ed862bccbd5))

## [1.1.14](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.13...v1.1.14) (2025-05-23)

### Code Refactoring

- **dynamic-module:** simplify compatibility checks by removing app compatibility validation ([7649ed4](https://github.com/VirtoCommerce/vc-shell/commit/7649ed4ec707907563b514c0c8c2b313db3eb4f2))

## [1.1.13](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.12...v1.1.13) (2025-05-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.12](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.11...v1.1.12) (2025-05-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.11](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.10...v1.1.11) (2025-05-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.10](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.9...v1.1.10) (2025-05-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.9](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.8...v1.1.9) (2025-05-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.7...v1.1.8) (2025-05-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.6...v1.1.7) (2025-05-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.5...v1.1.6) (2025-05-12)

### Features

- add Vite configuration generator for dynamic modules with compatibility options ([0a4822e](https://github.com/VirtoCommerce/vc-shell/commit/0a4822e219f2fa120b476f420badf6b068891fdb))

## [1.1.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.4...v1.1.5) (2025-05-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.3...v1.1.4) (2025-04-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.2...v1.1.3) (2025-04-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.342...v1.1.2) (2025-04-29)

### Features

- first release ([b94bf6d](https://github.com/VirtoCommerce/vc-shell/commit/b94bf6db1020fdc904c3bc8d9a9181e9becef7fe))
- first release ([5c3c607](https://github.com/VirtoCommerce/vc-shell/commit/5c3c607269a3b33478a4bf23b6486ca8b01157a2))
- redesign alpha5 ([ac430b8](https://github.com/VirtoCommerce/vc-shell/commit/ac430b80f684d3b920c35778a83c33ec387b2484))
- redesign alpha4 wip ([ac48f52](https://github.com/VirtoCommerce/vc-shell/commit/ac48f526f61e85518a238e1e6b49047ff3fcc786))
- partial redesign ([846e215](https://github.com/VirtoCommerce/vc-shell/commit/846e2152c6e48753622ca7cf3a71300323c99d51))

### Code Refactoring

- menu service and new SVG icons, alpha6 ([df10c9f](https://github.com/VirtoCommerce/vc-shell/commit/df10c9f54678c4a5f0a9752d9889d4acc2d4a29e))

### BREAKING CHANGES

- first release
- first release

## [1.0.342](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.1...v1.0.342) (2025-04-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.0...v1.1.1) (2025-04-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.341...v1.1.0) (2025-04-29)

### Features

- first release ([b94bf6d](https://github.com/VirtoCommerce/vc-shell/commit/b94bf6db1020fdc904c3bc8d9a9181e9becef7fe))
- first release ([5c3c607](https://github.com/VirtoCommerce/vc-shell/commit/5c3c607269a3b33478a4bf23b6486ca8b01157a2))
- redesign alpha5 ([ac430b8](https://github.com/VirtoCommerce/vc-shell/commit/ac430b80f684d3b920c35778a83c33ec387b2484))
- redesign alpha4 wip ([ac48f52](https://github.com/VirtoCommerce/vc-shell/commit/ac48f526f61e85518a238e1e6b49047ff3fcc786))
- partial redesign ([846e215](https://github.com/VirtoCommerce/vc-shell/commit/846e2152c6e48753622ca7cf3a71300323c99d51))

### Code Refactoring

- menu service and new SVG icons, alpha6 ([df10c9f](https://github.com/VirtoCommerce/vc-shell/commit/df10c9f54678c4a5f0a9752d9889d4acc2d4a29e))

### BREAKING CHANGES

- first release
- first release

## [1.0.341](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.0-alpha.2...v1.0.341) (2025-03-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.0-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.340...v1.1.0-alpha.2) (2025-02-25)

### Features

- partial redesign ([846e215](https://github.com/VirtoCommerce/vc-shell/commit/846e2152c6e48753622ca7cf3a71300323c99d51))

## [1.0.340](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.339...v1.0.340) (2025-02-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.339](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.338...v1.0.339) (2025-02-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.338](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.337...v1.0.338) (2025-02-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.337](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.336...v1.0.337) (2025-01-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.336](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.335...v1.0.336) (2025-01-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.335](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.334...v1.0.335) (2025-01-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.334](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.333...v1.0.334) (2025-01-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.333](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.332...v1.0.333) (2025-01-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.332](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.331...v1.0.332) (2025-01-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.331](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.330...v1.0.331) (2025-01-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.330](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.329...v1.0.330) (2024-12-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.329](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.328...v1.0.329) (2024-12-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.328](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.0-alpha.1...v1.0.328) (2024-11-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.1.0-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.327...v1.1.0-alpha.1) (2024-11-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.327](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.326...v1.0.327) (2024-11-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.326](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.325...v1.0.326) (2024-11-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.325](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.324...v1.0.325) (2024-11-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.324](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.323...v1.0.324) (2024-11-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.323](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.322...v1.0.323) (2024-11-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.322](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.321...v1.0.322) (2024-11-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.321](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.320...v1.0.321) (2024-10-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.320](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.319...v1.0.320) (2024-10-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.319](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.318...v1.0.319) (2024-10-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.318](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.317...v1.0.318) (2024-10-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.317](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.316...v1.0.317) (2024-10-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.316](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.315...v1.0.316) (2024-10-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.315](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.314...v1.0.315) (2024-10-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.314](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.313...v1.0.314) (2024-10-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.313](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.312...v1.0.313) (2024-10-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.312](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.311...v1.0.312) (2024-10-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.311](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.310...v1.0.311) (2024-10-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.310](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.309...v1.0.310) (2024-10-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.309](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.308...v1.0.309) (2024-10-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.308](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.307...v1.0.308) (2024-10-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.307](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.306...v1.0.307) (2024-10-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.306](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.305...v1.0.306) (2024-10-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.305](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.304...v1.0.305) (2024-10-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.304](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.303...v1.0.304) (2024-10-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.303](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.302...v1.0.303) (2024-10-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.302](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.301...v1.0.302) (2024-10-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.301](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.300...v1.0.301) (2024-10-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.300](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.299...v1.0.300) (2024-10-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.299](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.298...v1.0.299) (2024-10-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.298](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.297...v1.0.298) (2024-10-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.297](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.296...v1.0.297) (2024-10-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.296](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.295...v1.0.296) (2024-10-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.295](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.294...v1.0.295) (2024-10-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.294](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.293...v1.0.294) (2024-10-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.293](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.292...v1.0.293) (2024-09-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.292](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.291...v1.0.292) (2024-09-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.291](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.290...v1.0.291) (2024-09-23)

### Features

- support of css theming ([dba4097](https://github.com/VirtoCommerce/vc-shell/commit/dba409744b57dd1a999e009700e3b356fe230969))

## [1.0.290](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.289...v1.0.290) (2024-09-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.289](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.288...v1.0.289) (2024-09-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.288](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.287...v1.0.288) (2024-09-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.287](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.286...v1.0.287) (2024-09-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.286](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.285...v1.0.286) (2024-09-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.285](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.284...v1.0.285) (2024-09-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.284](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.283...v1.0.284) (2024-09-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.283](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.282...v1.0.283) (2024-09-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.282](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.281...v1.0.282) (2024-08-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.281](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.280...v1.0.281) (2024-08-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.280](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.279...v1.0.280) (2024-08-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.279](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.278...v1.0.279) (2024-08-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.278](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.277...v1.0.278) (2024-08-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.277](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.276...v1.0.277) (2024-08-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.276](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.275...v1.0.276) (2024-08-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.275](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.274...v1.0.275) (2024-08-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.274](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.273...v1.0.274) (2024-08-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.273](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.272...v1.0.273) (2024-08-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.272](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.271...v1.0.272) (2024-08-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.271](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.270...v1.0.271) (2024-08-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.270](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.269...v1.0.270) (2024-08-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.269](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.268...v1.0.269) (2024-08-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.268](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.267...v1.0.268) (2024-08-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.267](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.266...v1.0.267) (2024-08-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.266](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.265...v1.0.266) (2024-08-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.265](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.264...v1.0.265) (2024-08-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.264](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.263...v1.0.264) (2024-08-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.263](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.262...v1.0.263) (2024-07-31)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.262](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.261...v1.0.262) (2024-07-31)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.261](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.260...v1.0.261) (2024-07-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.260](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.259...v1.0.260) (2024-07-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.259](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.258...v1.0.259) (2024-07-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.258](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.257...v1.0.258) (2024-07-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.257](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.256...v1.0.257) (2024-07-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.256](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.255...v1.0.256) (2024-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.255](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.254...v1.0.255) (2024-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.254](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.253...v1.0.254) (2024-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.253](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.252...v1.0.253) (2024-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.252](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.251...v1.0.252) (2024-07-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.251](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.250...v1.0.251) (2024-07-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.250](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.249...v1.0.250) (2024-07-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.249](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.248...v1.0.249) (2024-07-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.248](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.247...v1.0.248) (2024-07-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.247](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.246...v1.0.247) (2024-07-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.246](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.245...v1.0.246) (2024-06-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.245](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.244...v1.0.245) (2024-06-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.244](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.243...v1.0.244) (2024-06-24)

### Features

- application insights logger ([536db4d](https://github.com/VirtoCommerce/vc-shell/commit/536db4db35c91f4fb566717d2d6c536e48aacc95))

## [1.0.243](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.242...v1.0.243) (2024-06-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.242](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.241...v1.0.242) (2024-06-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.241](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.240...v1.0.241) (2024-06-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.240](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.239...v1.0.240) (2024-06-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.239](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.238...v1.0.239) (2024-06-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.238](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.237...v1.0.238) (2024-06-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.237](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.236...v1.0.237) (2024-06-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.236](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.235...v1.0.236) (2024-06-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.235](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.234...v1.0.235) (2024-06-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.234](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.233...v1.0.234) (2024-06-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.233](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.232...v1.0.233) (2024-06-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.232](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.231...v1.0.232) (2024-06-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.231](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.230...v1.0.231) (2024-06-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.230](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.229...v1.0.230) (2024-06-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.229](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.228...v1.0.229) (2024-06-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.228](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.227...v1.0.228) (2024-06-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.227](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.226...v1.0.227) (2024-06-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.226](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.225...v1.0.226) (2024-06-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.225](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.224...v1.0.225) (2024-06-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.224](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.223...v1.0.224) (2024-06-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.223](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.222...v1.0.223) (2024-05-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.222](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.221...v1.0.222) (2024-05-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.221](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.220...v1.0.221) (2024-05-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.220](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.219...v1.0.220) (2024-05-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.219](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.218...v1.0.219) (2024-05-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.218](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.217...v1.0.218) (2024-05-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.217](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.216...v1.0.217) (2024-05-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.216](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.215...v1.0.216) (2024-05-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.215](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.214...v1.0.215) (2024-05-20)

### Features

- **vite-config:** add hash to app build to prevent caching ([aafe494](https://github.com/VirtoCommerce/vc-shell/commit/aafe4945bca52a62520217ea8948abe6f442614b))

## [1.0.214](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.213...v1.0.214) (2024-05-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.213](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.212...v1.0.213) (2024-05-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.212](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.211...v1.0.212) (2024-05-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.211](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.210...v1.0.211) (2024-05-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.210](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.209...v1.0.210) (2024-05-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.209](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.208...v1.0.209) (2024-05-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.208](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.207...v1.0.208) (2024-04-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.207](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.206...v1.0.207) (2024-04-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.206](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.205...v1.0.206) (2024-04-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.205](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.204...v1.0.205) (2024-04-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.204](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.203...v1.0.204) (2024-04-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.203](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.202...v1.0.203) (2024-04-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.202](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.201...v1.0.202) (2024-04-25)

### Features

- **dynamic:** saveChanges response (#207) ([a05313b](https://github.com/VirtoCommerce/vc-shell/commit/a05313bd0fc5b25b927570c31e14aea69c4a5ddd))

## [1.0.201](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.200...v1.0.201) (2024-04-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.200](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.199...v1.0.200) (2024-04-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.199](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.198...v1.0.199) (2024-04-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.198](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.197...v1.0.198) (2024-04-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.197](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.196...v1.0.197) (2024-04-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.196](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.195...v1.0.196) (2024-04-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.195](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.194...v1.0.195) (2024-04-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.194](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.193...v1.0.194) (2024-04-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.193](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.192...v1.0.193) (2024-04-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.192](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.191...v1.0.192) (2024-04-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.191](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.190...v1.0.191) (2024-04-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.190](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.189...v1.0.190) (2024-04-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.189](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.188...v1.0.189) (2024-03-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.188](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.187...v1.0.188) (2024-03-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.187](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.186...v1.0.187) (2024-03-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.186](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.185...v1.0.186) (2024-03-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.185](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.184...v1.0.185) (2024-03-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.184](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.183...v1.0.184) (2024-03-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.183](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.182...v1.0.183) (2024-03-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.182](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.181...v1.0.182) (2024-03-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.181](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.180...v1.0.181) (2024-03-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.180](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.179...v1.0.180) (2024-03-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.179](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.178...v1.0.179) (2024-03-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.178](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.177...v1.0.178) (2024-03-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.177](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.176...v1.0.177) (2024-03-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.176](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.175...v1.0.176) (2024-03-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.175](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.174...v1.0.175) (2024-03-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.174](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.173...v1.0.174) (2024-03-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.173](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.172...v1.0.173) (2024-03-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.172](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.171...v1.0.172) (2024-03-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.171](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.170...v1.0.171) (2024-03-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.170](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.169...v1.0.170) (2024-02-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.169](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.168...v1.0.169) (2024-02-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.168](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.167...v1.0.168) (2024-02-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.167](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.166...v1.0.167) (2024-02-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.166](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.165...v1.0.166) (2024-02-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.165](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.164...v1.0.165) (2024-02-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.164](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.163...v1.0.164) (2024-02-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.163](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.162...v1.0.163) (2024-02-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.162](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.161...v1.0.162) (2024-02-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.161](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.160...v1.0.161) (2024-02-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.160](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.159...v1.0.160) (2024-02-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.159](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.158...v1.0.159) (2024-02-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.158](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.157...v1.0.158) (2024-02-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.157](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.156...v1.0.157) (2024-02-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.156](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.155...v1.0.156) (2024-02-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.155](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.154...v1.0.155) (2024-02-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.154](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.153...v1.0.154) (2024-02-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.153](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.152...v1.0.153) (2024-01-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.152](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.151...v1.0.152) (2024-01-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.151](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.150...v1.0.151) (2024-01-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.150](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.149...v1.0.150) (2024-01-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.149](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.148...v1.0.149) (2024-01-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.148](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.147...v1.0.148) (2024-01-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.147](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.146...v1.0.147) (2024-01-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.146](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.145...v1.0.146) (2024-01-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.145](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.144...v1.0.145) (2024-01-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.144](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.143...v1.0.144) (2024-01-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.143](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.142...v1.0.143) (2024-01-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.142](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.141...v1.0.142) (2024-01-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.141](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.140...v1.0.141) (2024-01-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.140](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.139...v1.0.140) (2024-01-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.139](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.138...v1.0.139) (2024-01-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.138](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.137...v1.0.138) (2024-01-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.137](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.136...v1.0.137) (2024-01-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.136](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.135...v1.0.136) (2024-01-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.135](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.134...v1.0.135) (2024-01-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.134](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.133...v1.0.134) (2023-12-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.133](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.132...v1.0.133) (2023-12-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.132](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.131...v1.0.132) (2023-12-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.131](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.130...v1.0.131) (2023-12-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.130](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.129...v1.0.130) (2023-12-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.129](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.128...v1.0.129) (2023-12-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.128](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.127...v1.0.128) (2023-12-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.127](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.126...v1.0.127) (2023-12-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.126](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.125...v1.0.126) (2023-11-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.125](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.124...v1.0.125) (2023-11-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.124](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.123...v1.0.124) (2023-11-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.123](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.122...v1.0.123) (2023-11-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.122](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.121...v1.0.122) (2023-11-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.121](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.120...v1.0.121) (2023-11-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.120](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.119...v1.0.120) (2023-11-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.119](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.118...v1.0.119) (2023-11-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.118](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.117...v1.0.118) (2023-11-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.117](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.116...v1.0.117) (2023-11-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.116](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.115...v1.0.116) (2023-11-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.115](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.114...v1.0.115) (2023-11-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.114](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.113...v1.0.114) (2023-10-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.113](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.111...v1.0.113) (2023-10-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.111](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.110...v1.0.111) (2023-10-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.110](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.109...v1.0.110) (2023-10-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.109](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.108...v1.0.109) (2023-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.108](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.107...v1.0.108) (2023-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.107](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.106...v1.0.107) (2023-10-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.106](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.105...v1.0.106) (2023-10-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.105](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.104...v1.0.105) (2023-10-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.104](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.103...v1.0.104) (2023-10-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.103](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.102...v1.0.103) (2023-09-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.102](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.101...v1.0.102) (2023-09-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.101](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.100...v1.0.101) (2023-09-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.100](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.99...v1.0.100) (2023-09-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.99](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.98...v1.0.99) (2023-09-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.98](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.97...v1.0.98) (2023-09-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.97](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.96...v1.0.97) (2023-09-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.96](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.95...v1.0.96) (2023-08-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.95](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.94...v1.0.95) (2023-08-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.94](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.93...v1.0.94) (2023-08-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.93](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.92...v1.0.93) (2023-08-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.92](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.91...v1.0.92) (2023-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.91](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.90...v1.0.91) (2023-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.90](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.89...v1.0.90) (2023-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.89](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.88...v1.0.89) (2023-07-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.88](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.87...v1.0.88) (2023-06-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.87](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.86...v1.0.87) (2023-06-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.86](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.85...v1.0.86) (2023-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.85](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.84...v1.0.85) (2023-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.84](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.83...v1.0.84) (2023-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.83](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.82...v1.0.83) (2023-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.82](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.81...v1.0.82) (2023-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.81](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.80...v1.0.81) (2023-06-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.80](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.79...v1.0.80) (2023-06-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.79](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.78...v1.0.79) (2023-06-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.78](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.77...v1.0.78) (2023-06-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.77](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.76...v1.0.77) (2023-06-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.76](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.75...v1.0.76) (2023-06-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.75](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.74...v1.0.75) (2023-06-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.74](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.73...v1.0.74) (2023-06-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.73](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.72...v1.0.73) (2023-06-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.72](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.71...v1.0.72) (2023-06-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.71](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.70...v1.0.71) (2023-06-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.70](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.69...v1.0.70) (2023-05-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.69](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.68...v1.0.69) (2023-04-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.68](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.67...v1.0.68) (2023-04-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.67](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.66...v1.0.67) (2023-04-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.66](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.65...v1.0.66) (2023-04-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.65](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.64...v1.0.65) (2023-04-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.64](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.63...v1.0.64) (2023-04-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.63](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.62...v1.0.63) (2023-04-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.62](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.61...v1.0.62) (2023-04-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.61](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.60...v1.0.61) (2023-04-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.60](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.59...v1.0.60) (2023-03-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.59](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.58...v1.0.59) (2023-03-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.58](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.57...v1.0.58) (2023-03-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.57](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.56...v1.0.57) (2023-03-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.56](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.55...v1.0.56) (2023-03-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.55](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.54...v1.0.55) (2023-03-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.54](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.53...v1.0.54) (2023-03-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.53](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.52...v1.0.53) (2023-03-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.52](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.51...v1.0.52) (2023-03-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.51](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.50...v1.0.51) (2023-03-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.50](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.49...v1.0.50) (2023-03-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.49](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.48...v1.0.49) (2023-02-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.48](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.47...v1.0.48) (2023-02-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.47](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.46...v1.0.47) (2023-02-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.46](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.45...v1.0.46) (2023-02-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.45](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.44...v1.0.45) (2023-02-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.44](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.43...v1.0.44) (2023-02-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.43](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.42...v1.0.43) (2023-02-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.42](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.41...v1.0.42) (2023-02-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.41](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.40...v1.0.41) (2023-01-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.40](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.39...v1.0.40) (2023-01-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.39](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.38...v1.0.39) (2022-12-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.38](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.37...v1.0.38) (2022-12-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.37](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.36...v1.0.37) (2022-11-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.36](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.35...v1.0.36) (2022-11-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.35](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.34...v1.0.35) (2022-11-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.34](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.33...v1.0.34) (2022-11-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.33](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.32...v1.0.33) (2022-10-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.32](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.31...v1.0.32) (2022-10-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.31](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.30...v1.0.31) (2022-10-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.30](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.29...v1.0.30) (2022-10-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.29](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.28...v1.0.29) (2022-10-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.28](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.27...v1.0.28) (2022-10-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.27](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.26...v1.0.27) (2022-10-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.26](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.25...v1.0.26) (2022-10-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.25](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.24...v1.0.25) (2022-10-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.24](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.23...v1.0.24) (2022-10-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.23](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.22...v1.0.23) (2022-10-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.22](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.21...v1.0.22) (2022-09-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.21](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.20...v1.0.21) (2022-09-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.20](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.19...v1.0.20) (2022-09-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.19](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.17...v1.0.19) (2022-08-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.17](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.16...v1.0.17) (2022-08-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.16](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.14...v1.0.16) (2022-08-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.14](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.13...v1.0.14) (2022-08-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.13](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.12...v1.0.13) (2022-07-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.12](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.11...v1.0.12) (2022-07-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.11](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.10...v1.0.11) (2022-07-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.10](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.9...v1.0.10) (2022-06-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.9](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.8...v1.0.9) (2022-06-21)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.7...v1.0.8) (2022-06-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.6...v1.0.7) (2022-06-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.5...v1.0.6) (2022-06-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.4...v1.0.5) (2022-06-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.3...v1.0.4) (2022-06-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.2...v1.0.3) (2022-05-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.1...v1.0.2) (2022-05-25)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.0...v1.0.1) (2022-05-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [1.0.0](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.20...v1.0.0) (2022-05-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.20](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.19...v0.1.20) (2022-04-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.19](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.18...v0.1.19) (2022-04-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.18](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.17...v0.1.18) (2022-04-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.17](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.16...v0.1.17) (2022-04-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.16](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.15...v0.1.16) (2022-04-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.15](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.14...v0.1.15) (2022-04-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.14](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.13...v0.1.14) (2022-04-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.13](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.12...v0.1.13) (2022-04-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.12](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.11...v0.1.12) (2022-04-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.11](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.10...v0.1.11) (2022-04-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.10](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.9...v0.1.10) (2022-04-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.9](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.8...v0.1.9) (2022-04-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.8](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.7...v0.1.8) (2022-03-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.7](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.6...v0.1.7) (2022-03-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.6](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.5...v0.1.6) (2022-03-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.5](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.4...v0.1.5) (2022-03-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.4](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.3...v0.1.4) (2022-03-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.3](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.2...v0.1.3) (2022-03-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.2](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.1...v0.1.2) (2022-03-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.1.1](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.123...v0.1.1) (2022-03-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.123](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.122...v0.0.123) (2022-03-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.122](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.121...v0.0.122) (2022-02-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.121](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.120...v0.0.121) (2022-02-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.120](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.119...v0.0.120) (2022-02-17)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.119](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.117...v0.0.119) (2022-02-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.117](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.116...v0.0.117) (2022-02-16)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.116](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.115...v0.0.116) (2022-02-14)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.115](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.114...v0.0.115) (2022-02-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.114](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.113...v0.0.114) (2022-02-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.113](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.112...v0.0.113) (2022-02-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.112](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.111...v0.0.112) (2022-02-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.111](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.110...v0.0.111) (2022-01-31)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.110](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.109...v0.0.110) (2022-01-31)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.109](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.108...v0.0.109) (2022-01-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.108](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.107...v0.0.108) (2022-01-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.107](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.106...v0.0.107) (2022-01-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.106](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.105...v0.0.106) (2022-01-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.105](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.104...v0.0.105) (2021-12-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.104](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.103...v0.0.104) (2021-12-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.103](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.102...v0.0.103) (2021-12-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.102](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.101...v0.0.102) (2021-12-27)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.101](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.100...v0.0.101) (2021-12-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.100](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.99...v0.0.100) (2021-12-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.99](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.98...v0.0.99) (2021-12-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.98](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.97...v0.0.98) (2021-12-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.97](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.96...v0.0.97) (2021-12-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.96](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.95...v0.0.96) (2021-12-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.95](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.94...v0.0.95) (2021-12-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.94](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.93...v0.0.94) (2021-12-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.93](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.92...v0.0.93) (2021-12-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.92](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.91...v0.0.92) (2021-12-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.91](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.90...v0.0.91) (2021-12-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.90](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.89...v0.0.90) (2021-12-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.89](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.88...v0.0.89) (2021-12-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.88](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.87...v0.0.88) (2021-12-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.87](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.86...v0.0.87) (2021-12-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.86](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.85...v0.0.86) (2021-12-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.85](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.84...v0.0.85) (2021-12-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.84](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.83...v0.0.84) (2021-11-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.83](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.82...v0.0.83) (2021-11-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.82](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.81...v0.0.82) (2021-11-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.81](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.80...v0.0.81) (2021-11-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.80](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.79...v0.0.80) (2021-11-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.79](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.78...v0.0.79) (2021-11-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.78](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.77...v0.0.78) (2021-11-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.77](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.76...v0.0.77) (2021-11-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.76](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.75...v0.0.76) (2021-11-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.75](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.74...v0.0.75) (2021-11-18)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.74](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.73...v0.0.74) (2021-11-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.73](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.71...v0.0.73) (2021-11-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.71](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.70...v0.0.71) (2021-11-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.70](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.69...v0.0.70) (2021-11-08)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.69](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.68...v0.0.69) (2021-11-03)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.68](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.67...v0.0.68) (2021-11-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.67](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.66...v0.0.67) (2021-11-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.66](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.65...v0.0.66) (2021-11-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.65](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.64...v0.0.65) (2021-11-01)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.64](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.63...v0.0.64) (2021-10-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.63](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.62...v0.0.63) (2021-10-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.62](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.61...v0.0.62) (2021-10-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.61](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.60...v0.0.61) (2021-10-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.60](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.59...v0.0.60) (2021-10-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.59](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.58...v0.0.59) (2021-10-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.58](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.57...v0.0.58) (2021-10-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.57](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.56...v0.0.57) (2021-10-15)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.56](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.55...v0.0.56) (2021-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.55](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.54...v0.0.55) (2021-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.54](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.53...v0.0.54) (2021-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.53](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.52...v0.0.53) (2021-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.52](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.51...v0.0.52) (2021-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.51](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.50...v0.0.51) (2021-10-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.50](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.49...v0.0.50) (2021-10-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.49](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.48...v0.0.49) (2021-10-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.48](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.47...v0.0.48) (2021-10-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.47](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.46...v0.0.47) (2021-10-06)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.46](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.45...v0.0.46) (2021-09-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.45](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.44...v0.0.45) (2021-09-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.44](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.43...v0.0.44) (2021-09-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.43](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.42...v0.0.43) (2021-09-24)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.42](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.41...v0.0.42) (2021-09-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.41](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.40...v0.0.41) (2021-09-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.40](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.39...v0.0.40) (2021-09-23)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.39](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.38...v0.0.39) (2021-09-13)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.38](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.37...v0.0.38) (2021-09-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.37](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.36...v0.0.37) (2021-09-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.36](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.35...v0.0.36) (2021-09-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.35](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.34...v0.0.35) (2021-09-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.34](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.33...v0.0.34) (2021-09-07)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.33](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.32...v0.0.33) (2021-09-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.32](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.31...v0.0.32) (2021-08-31)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.31](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.30...v0.0.31) (2021-08-30)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.30](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.29...v0.0.30) (2021-08-26)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.29](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.28...v0.0.29) (2021-08-20)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.28](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.27...v0.0.28) (2021-08-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.27](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.26...v0.0.27) (2021-08-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.26](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.25...v0.0.26) (2021-08-19)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.25](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.24...v0.0.25) (2021-08-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.24](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.23...v0.0.24) (2021-08-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.23](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.22...v0.0.23) (2021-08-12)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.22](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.21...v0.0.22) (2021-08-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.21](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.20...v0.0.21) (2021-08-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.20](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.19...v0.0.20) (2021-08-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.19](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.18...v0.0.19) (2021-08-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.18](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.17...v0.0.18) (2021-08-11)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.17](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.16...v0.0.17) (2021-08-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.16](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.15...v0.0.16) (2021-08-10)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.15](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.14...v0.0.15) (2021-08-09)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.14](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.13...v0.0.14) (2021-08-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.13](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.12...v0.0.13) (2021-08-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.12](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.11...v0.0.12) (2021-08-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.11](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.10...v0.0.11) (2021-08-05)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.10](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.9...v0.0.10) (2021-08-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.9](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.8...v0.0.9) (2021-08-04)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.8](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.7...v0.0.8) (2021-08-02)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.7](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.6...v0.0.7) (2021-07-29)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.6](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.5...v0.0.6) (2021-07-28)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.5](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.4...v0.0.5) (2021-07-22)

**Note:** Version bump only for package @vc-shell/config-generator

## [0.0.4](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.3...v0.0.4) (2021-07-21)

**Note:** Version bump only for package @vc-shell/config-generator

## 0.0.3 (2021-07-20)

**Note:** Version bump only for package @vc-shell/config-generator

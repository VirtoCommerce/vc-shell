# [2.0.0-alpha.25](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.24...v2.0.0-alpha.25) (2026-03-25)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.24](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.23...v2.0.0-alpha.24) (2026-03-25)


### Documentation

* **assets-manager:** document blade options breaking change and enhance codemod ([69cc786](https://github.com/VirtoCommerce/vc-shell/commit/69cc7865a5678a093d972e6e39f955d722fcc133))


### Features

* **api-client, migrate:** default to Interface for new API clients, add nswag class-to-interface migration ([569a1f7](https://github.com/VirtoCommerce/vc-shell/commit/569a1f79532d5ca2e1a9968e3b249b3d3ffeed71))
* **codemod:** add use-assets-migration transform ([57022ec](https://github.com/VirtoCommerce/vc-shell/commit/57022ec18d7d3f85e207377316222e32ad142520))
* **codemod:** register use-assets-migration in transform registry ([83fb018](https://github.com/VirtoCommerce/vc-shell/commit/83fb018a7afbfc924d21e595c312fb536d3d40b5))
* **codemod:** smart diagnostic for useAssets() migration patterns ([479defe](https://github.com/VirtoCommerce/vc-shell/commit/479defe6c57d6aa335c683e6aeec0f4941158749))
* **migrate:** add project-scope orchestrator and registry entry for nswag-class-to-interface ([7a8dcd6](https://github.com/VirtoCommerce/vc-shell/commit/7a8dcd66e65b427c9e94bc40aa1a9fbf4a6062f7))
* **migrate:** add Rules A/B — object literal and variable argument transforms ([0856d45](https://github.com/VirtoCommerce/vc-shell/commit/0856d457a7e3d6a1f9d05d392edea1f34578059b))
* **migrate:** add Rules D/E — IPrefix rename and import deduplication ([e988d87](https://github.com/VirtoCommerce/vc-shell/commit/e988d87733e023fbc7abbf460cf6b2e174e5edb3))
* **migrate:** scaffold nswag-class-to-interface core transform with Rule C ([2579e5b](https://github.com/VirtoCommerce/vc-shell/commit/2579e5bfe3840cafd8562ff466e8b58e47794524))


### BREAKING CHANGES

* **assets-manager:** notice
- use-assets-migration codemod: detect openBlade("AssetsManager") with
  old handler options and missing markRaw()
# [2.0.0-alpha.23](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.22...v2.0.0-alpha.23) (2026-03-23)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.22](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.21...v2.0.0-alpha.22) (2026-03-23)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.21](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.20...v2.0.0-alpha.21) (2026-03-23)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.20](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.18...v2.0.0-alpha.20) (2026-03-23)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.19](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.18...v2.0.0-alpha.19) (2026-03-23)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.18](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.17...v2.0.0-alpha.18) (2026-03-23)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.17](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.16...v2.0.0-alpha.17) (2026-03-23)


### Bug Fixes

* **migrate:** remove empty export type {} stubs after Props/Emits removal ([e6164ba](https://github.com/VirtoCommerce/vc-shell/commit/e6164ba267c737aee8990f271173d05e844e81a9))


### Features

* **migrate:** add defineOptions → defineBlade transform ([676caea](https://github.com/VirtoCommerce/vc-shell/commit/676caea421fe960b589041ef74679d5fdb5336d8))
* **migrate:** add import dedup utility and improve vue-sfc-wrapper resilience ([c87e065](https://github.com/VirtoCommerce/vc-shell/commit/c87e06554b3f538d1ee45a65269e53c94fe40683))
* **migrate:** add manual-migration-audit diagnostic transform ([a069aad](https://github.com/VirtoCommerce/vc-shell/commit/a069aadd1816eb6363dd5e95ccd175b9e464d43e))
* **migrate:** add use-data-table-sort codemod transform ([655aef7](https://github.com/VirtoCommerce/vc-shell/commit/655aef7b98405b1243c00ed1cdc2a2320600d780))
* **migrate:** auto-migrate notificationTemplates to notifications config ([a9ccbe5](https://github.com/VirtoCommerce/vc-shell/commit/a9ccbe5e30a3f4b30a2c22e2911629d0a86dbb2d))
* **migrate:** fix defineAppModule 2-arg to use blades key ([a92f444](https://github.com/VirtoCommerce/vc-shell/commit/a92f44400ac5253900c0b9377113614fac931753))
* **migrate:** fix defineAppModule 3/4-arg to use object syntax with blades key ([31a1ef3](https://github.com/VirtoCommerce/vc-shell/commit/31a1ef3ae2b87fb77290ec79ff79cf13e65a7bf6))
# [2.0.0-alpha.16](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.15...v2.0.0-alpha.16) (2026-03-20)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.15](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.14...v2.0.0-alpha.15) (2026-03-20)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.14](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.13...v2.0.0-alpha.14) (2026-03-20)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.13](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.12...v2.0.0-alpha.13) (2026-03-20)


### Features

* **migrate:** add CLI entry point with commander ([b773e92](https://github.com/VirtoCommerce/vc-shell/commit/b773e924c))
* **migrate:** add runner orchestrator with tests ([bc9fa3f](https://github.com/VirtoCommerce/vc-shell/commit/bc9fa3fde))
* **migrate:** add transform types and version-based registry with selection logic ([2148647](https://github.com/VirtoCommerce/vc-shell/commit/214864780))
* **migrate:** add version detector with workspace:* fallback ([c45fabc](https://github.com/VirtoCommerce/vc-shell/commit/c45fabc51))
* **migrate:** add Vue SFC script block extraction utility ([e086631](https://github.com/VirtoCommerce/vc-shell/commit/e0866319f))
* **migrate:** add define-app-module transform ([fa8ea88](https://github.com/VirtoCommerce/vc-shell/commit/fa8ea8885))
* **migrate:** add remove-deprecated-aliases transform ([ded2ff8](https://github.com/VirtoCommerce/vc-shell/commit/ded2ff833))
* **migrate:** add notification-migration transform ([f28480d](https://github.com/VirtoCommerce/vc-shell/commit/f28480d0d))
* **migrate:** add rewrite-imports transform for sub-entry points ([2ec2aa3](https://github.com/VirtoCommerce/vc-shell/commit/2ec2aa391))
* **migrate:** add use-blade-migration with onBeforeClose inversion ([4696267](https://github.com/VirtoCommerce/vc-shell/commit/4696267bb))
* **migrate:** add blade-props-simplification transform ([83c1f41](https://github.com/VirtoCommerce/vc-shell/commit/83c1f41b2))
* **migrate:** add icon-audit and scss-safe-use diagnostic transforms ([1975d07](https://github.com/VirtoCommerce/vc-shell/commit/1975d072c))


### Bug Fixes

* **migrate:** fix TypeScript error in scss-safe-use readdirSync typing ([2f6e458](https://github.com/VirtoCommerce/vc-shell/commit/2f6e4584e))

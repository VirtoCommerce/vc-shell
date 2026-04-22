# [2.0.0-alpha.35](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.34...v2.0.0-alpha.35) (2026-04-22)

### Bug Fixes

- **release:** update changelog and release-it configuration ([767c312](https://github.com/VirtoCommerce/vc-shell/commit/767c3123773a02a4badc3bcf89661e535d5f26c8))

### Features

- **setup:** introduce unsetup script and enhance setup process ([0b0ad7f](https://github.com/VirtoCommerce/vc-shell/commit/0b0ad7f2a47564783b3914f58f04d5cc21ce828e))

# [2.0.0-alpha.34](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.33...v2.0.0-alpha.34) (2026-04-22)

- refactor!: remove global component and directive registration ([7643d8f](https://github.com/VirtoCommerce/vc-shell/commit/7643d8fcba40bdd4d5e6a8be244a6c1978eec3fb))

### Bug Fixes

- **migrate:** --transform bypasses version filter ([85072d1](https://github.com/VirtoCommerce/vc-shell/commit/85072d1059a3dbda11259cdbe80899ce3bf50c6a))
- **migrate:** --update-deps at same version + baseline drift check ([39fea4a](https://github.com/VirtoCommerce/vc-shell/commit/39fea4a6fb243766dbc1f1d31a0c207741a98dd0))
- **migrate:** define-expose-to-children adds useBlade import when missing ([ee7ed7d](https://github.com/VirtoCommerce/vc-shell/commit/ee7ed7db0ba16f2669d59b75b7a35385088feeee))

### Features

- **migrate, configs, scripts:** peer-versions.json as canonical source ([3199202](https://github.com/VirtoCommerce/vc-shell/commit/3199202ad190d9260b4bec99f6839232ebcfa839))
- **migrate:** add remove-expose-title and remove-app-module-options ([3a76ff7](https://github.com/VirtoCommerce/vc-shell/commit/3a76ff738fd9ef99fd96acd821280f8a7d66b210))
- **migrate:** add use-data-table-pagination-audit + AI migration prompt ([0c2e7b6](https://github.com/VirtoCommerce/vc-shell/commit/0c2e7b6efba387d9fafe04e5bdcd21ea20500259))
- **migrate:** add vc-blade-loading-prop transform ([0cb72f3](https://github.com/VirtoCommerce/vc-shell/commit/0cb72f39bc55a98cab0c9a786a1da3bb52e75d3e))
- **migrate:** expand v2 migration tooling — icon/asset/audit prompts and blade-event cleanup ([f4788d4](https://github.com/VirtoCommerce/vc-shell/commit/f4788d4d9c588157ca5c11facfe558a69c254c2e)), closes [#41](https://github.com/VirtoCommerce/vc-shell/issues/41)
- **tests:** enhance test helpers and add vitest environment for consistency ([6cd30ac](https://github.com/VirtoCommerce/vc-shell/commit/6cd30ac65b83dd756803b9ccb4278bd8679be930))

### BREAKING CHANGES

- Framework no longer registers Vc\* components and
  directives globally via app.component()/app.directive(). All 64 UI
  components and 2 directives (v-loading, v-autofocus) must now be
  explicitly imported from @vc-shell/framework/ui.

* Delete global-components.ts type augmentation
* Remove registerComponentsAndDirectives() from framework plugin
* Remove GlobalComponents augmentations from 10 module/shell files
* Remove app.component() registration from blade-navigation plugin
* Add explicit imports to 25 framework .vue files
* Add vLoading/vAutofocus directive aliases for Vue auto-registration
* Add VcLanguageSelector to molecules barrel export
* Add directive re-export to @vc-shell/framework/ui entry point
* Add remove-global-components CLI migrator transform with 6 tests
* Add migration/40-remove-global-components.md guide
* Add ai-agent/components exception to layer violation checker

Automated migration: npx @vc-shell/migrate --transform remove-global-components

# [2.0.0-alpha.33](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.32...v2.0.0-alpha.33) (2026-04-14)

### Bug Fixes

- **migrate:** fix 7 critical bugs found during real-app testing ([41688a1](https://github.com/VirtoCommerce/vc-shell/commit/41688a164250d397c51b6007953bc112f63ee4b9))
- **migrate:** improve useBladeForm diagnostic — onBeforeClose must be removed, show closeConfirmMessage example ([274bf9a](https://github.com/VirtoCommerce/vc-shell/commit/274bf9aac965b8c8cecada58d7959d547da7f52b))

### Features

- **migrate:** add 4 new transforms (injection-keys, replace-cover, locale-imports, window-globals) ([bbcbc79](https://github.com/VirtoCommerce/vc-shell/commit/bbcbc79530ad237ed4d9bd4519ba164559b125a5))
- **migrate:** add after field to VersionedTransform for dependency ordering ([a854662](https://github.com/VirtoCommerce/vc-shell/commit/a85466259f908c585161e6db43337c1b1e5d2ece))
- **migrate:** add defineExpose → exposeToChildren transform + improve widgets diagnostic ([d73352c](https://github.com/VirtoCommerce/vc-shell/commit/d73352c02630f3cf2b046f524769ac8d4cec1f0f))
- **migrate:** add release-config cleanup and VcTable audits ([23118dd](https://github.com/VirtoCommerce/vc-shell/commit/23118dd74e9bd4387b166bd5e35a341ad81cd6be))
- **migrate:** declare after dependencies for blade-props, define-options, remove-pathmatch ([90167af](https://github.com/VirtoCommerce/vc-shell/commit/90167afbe8d07fc88a9543eb431edf6b29e5aba9))
- **migrate:** generate MIGRATION_REPORT.md with automated/manual/uncovered sections ([3d9d2a1](https://github.com/VirtoCommerce/vc-shell/commit/3d9d2a10844ffe940e96a3f74bf40c24ff6e7a71))
- **migrate:** idempotency guard — second run produces zero modifications ([cd91b25](https://github.com/VirtoCommerce/vc-shell/commit/cd91b250a8a5235543f6a5fe4330a86d530b250a))
- **migrate:** replace-cover-method — openBlade({ replaceCurrentBlade: true }) → coverWith() ([cb24cd8](https://github.com/VirtoCommerce/vc-shell/commit/cb24cd8353847fd9c7ddc91927f726cba3ada00b))
- **migrate:** structured migration report with before/after examples and guide links ([2f5c2da](https://github.com/VirtoCommerce/vc-shell/commit/2f5c2da289abb9977464fb8772ddcfe2c3daa17d))
- **migrate:** topological sort for transform dependency ordering ([24a4446](https://github.com/VirtoCommerce/vc-shell/commit/24a44463fd9e114401b989114aacfc07ddb5250f))

# [2.0.0-alpha.32](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.31...v2.0.0-alpha.32) (2026-04-02)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.31](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.30...v2.0.0-alpha.31) (2026-04-01)

### Features

- **migrate:** add codemod transforms for useBladeForm and useDynamicProperties ([9cf4cc8](https://github.com/VirtoCommerce/vc-shell/commit/9cf4cc8c280bb70e5ef6c457c07c44988b6fafbc))

# [2.0.0-alpha.30](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.29...v2.0.0-alpha.30) (2026-03-30)

### Bug Fixes

- **cli:** remove beforeEnter guard from tenant route templates, format responsive-composable transform ([3752273](https://github.com/VirtoCommerce/vc-shell/commit/37522732b789316a92c4c958c395c8f3fbf9e0ea))

# [2.0.0-alpha.29](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.28...v2.0.0-alpha.29) (2026-03-26)

### Features

- **responsive-composable:** introduce useResponsive composable to replace global properties and injection keys ([1280853](https://github.com/VirtoCommerce/vc-shell/commit/1280853cf10ec6cf432b5e7eb88b0991430dfc20))

# [2.0.0-alpha.28](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.27...v2.0.0-alpha.28) (2026-03-26)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.27](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.26...v2.0.0-alpha.27) (2026-03-25)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.26](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.25...v2.0.0-alpha.26) (2026-03-25)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.25](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.24...v2.0.0-alpha.25) (2026-03-25)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.24](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.23...v2.0.0-alpha.24) (2026-03-25)

### Documentation

- **assets-manager:** document blade options breaking change and enhance codemod ([69cc786](https://github.com/VirtoCommerce/vc-shell/commit/69cc7865a5678a093d972e6e39f955d722fcc133))

### Features

- **api-client, migrate:** default to Interface for new API clients, add nswag class-to-interface migration ([569a1f7](https://github.com/VirtoCommerce/vc-shell/commit/569a1f79532d5ca2e1a9968e3b249b3d3ffeed71))
- **codemod:** add use-assets-migration transform ([57022ec](https://github.com/VirtoCommerce/vc-shell/commit/57022ec18d7d3f85e207377316222e32ad142520))
- **codemod:** register use-assets-migration in transform registry ([83fb018](https://github.com/VirtoCommerce/vc-shell/commit/83fb018a7afbfc924d21e595c312fb536d3d40b5))
- **codemod:** smart diagnostic for useAssets() migration patterns ([479defe](https://github.com/VirtoCommerce/vc-shell/commit/479defe6c57d6aa335c683e6aeec0f4941158749))
- **migrate:** add project-scope orchestrator and registry entry for nswag-class-to-interface ([7a8dcd6](https://github.com/VirtoCommerce/vc-shell/commit/7a8dcd66e65b427c9e94bc40aa1a9fbf4a6062f7))
- **migrate:** add Rules A/B — object literal and variable argument transforms ([0856d45](https://github.com/VirtoCommerce/vc-shell/commit/0856d457a7e3d6a1f9d05d392edea1f34578059b))
- **migrate:** add Rules D/E — IPrefix rename and import deduplication ([e988d87](https://github.com/VirtoCommerce/vc-shell/commit/e988d87733e023fbc7abbf460cf6b2e174e5edb3))
- **migrate:** scaffold nswag-class-to-interface core transform with Rule C ([2579e5b](https://github.com/VirtoCommerce/vc-shell/commit/2579e5bfe3840cafd8562ff466e8b58e47794524))

### BREAKING CHANGES

- **assets-manager:** notice

* use-assets-migration codemod: detect openBlade("AssetsManager") with
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

- **migrate:** remove empty export type {} stubs after Props/Emits removal ([e6164ba](https://github.com/VirtoCommerce/vc-shell/commit/e6164ba267c737aee8990f271173d05e844e81a9))

### Features

- **migrate:** add defineOptions → defineBlade transform ([676caea](https://github.com/VirtoCommerce/vc-shell/commit/676caea421fe960b589041ef74679d5fdb5336d8))
- **migrate:** add import dedup utility and improve vue-sfc-wrapper resilience ([c87e065](https://github.com/VirtoCommerce/vc-shell/commit/c87e06554b3f538d1ee45a65269e53c94fe40683))
- **migrate:** add manual-migration-audit diagnostic transform ([a069aad](https://github.com/VirtoCommerce/vc-shell/commit/a069aadd1816eb6363dd5e95ccd175b9e464d43e))
- **migrate:** add use-data-table-sort codemod transform ([655aef7](https://github.com/VirtoCommerce/vc-shell/commit/655aef7b98405b1243c00ed1cdc2a2320600d780))
- **migrate:** auto-migrate notificationTemplates to notifications config ([a9ccbe5](https://github.com/VirtoCommerce/vc-shell/commit/a9ccbe5e30a3f4b30a2c22e2911629d0a86dbb2d))
- **migrate:** fix defineAppModule 2-arg to use blades key ([a92f444](https://github.com/VirtoCommerce/vc-shell/commit/a92f44400ac5253900c0b9377113614fac931753))
- **migrate:** fix defineAppModule 3/4-arg to use object syntax with blades key ([31a1ef3](https://github.com/VirtoCommerce/vc-shell/commit/31a1ef3ae2b87fb77290ec79ff79cf13e65a7bf6))

# [2.0.0-alpha.16](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.15...v2.0.0-alpha.16) (2026-03-20)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.15](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.14...v2.0.0-alpha.15) (2026-03-20)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.14](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.13...v2.0.0-alpha.14) (2026-03-20)

**Note:** Version bump only for package @vc-shell/migrate

# [2.0.0-alpha.13](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.12...v2.0.0-alpha.13) (2026-03-20)

### Features

- **migrate:** add CLI entry point with commander ([b773e92](https://github.com/VirtoCommerce/vc-shell/commit/b773e924c))
- **migrate:** add runner orchestrator with tests ([bc9fa3f](https://github.com/VirtoCommerce/vc-shell/commit/bc9fa3fde))
- **migrate:** add transform types and version-based registry with selection logic ([2148647](https://github.com/VirtoCommerce/vc-shell/commit/214864780))
- **migrate:** add version detector with workspace:\* fallback ([c45fabc](https://github.com/VirtoCommerce/vc-shell/commit/c45fabc51))
- **migrate:** add Vue SFC script block extraction utility ([e086631](https://github.com/VirtoCommerce/vc-shell/commit/e0866319f))
- **migrate:** add define-app-module transform ([fa8ea88](https://github.com/VirtoCommerce/vc-shell/commit/fa8ea8885))
- **migrate:** add remove-deprecated-aliases transform ([ded2ff8](https://github.com/VirtoCommerce/vc-shell/commit/ded2ff833))
- **migrate:** add notification-migration transform ([f28480d](https://github.com/VirtoCommerce/vc-shell/commit/f28480d0d))
- **migrate:** add rewrite-imports transform for sub-entry points ([2ec2aa3](https://github.com/VirtoCommerce/vc-shell/commit/2ec2aa391))
- **migrate:** add use-blade-migration with onBeforeClose inversion ([4696267](https://github.com/VirtoCommerce/vc-shell/commit/4696267bb))
- **migrate:** add blade-props-simplification transform ([83c1f41](https://github.com/VirtoCommerce/vc-shell/commit/83c1f41b2))
- **migrate:** add icon-audit and scss-safe-use diagnostic transforms ([1975d07](https://github.com/VirtoCommerce/vc-shell/commit/1975d072c))

### Bug Fixes

- **migrate:** fix TypeScript error in scss-safe-use readdirSync typing ([2f6e458](https://github.com/VirtoCommerce/vc-shell/commit/2f6e4584e))

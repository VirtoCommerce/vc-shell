# Changelog

# [2.0.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3...v2.0.0) (2026-04-22)

### Features

- **api-client, migrate:** default to Interface for new API clients, add nswag class-to-interface migration ([569a1f7](https://github.com/VirtoCommerce/vc-shell/commit/569a1f79532d5ca2e1a9968e3b249b3d3ffeed71))
- **codemod:** add use-assets-migration transform ([57022ec](https://github.com/VirtoCommerce/vc-shell/commit/57022ec18d7d3f85e207377316222e32ad142520))
- **codemod:** register use-assets-migration in transform registry ([83fb018](https://github.com/VirtoCommerce/vc-shell/commit/83fb018a7afbfc924d21e595c312fb536d3d40b5))
- **codemod:** smart diagnostic for useAssets() migration patterns ([479defe](https://github.com/VirtoCommerce/vc-shell/commit/479defe6c57d6aa335c683e6aeec0f4941158749)), closes [#32](https://github.com/VirtoCommerce/vc-shell/issues/32)
- **migrate, configs, scripts:** peer-versions.json as canonical source ([3199202](https://github.com/VirtoCommerce/vc-shell/commit/3199202ad190d9260b4bec99f6839232ebcfa839))
- **migrate:** add 4 new transforms (injection-keys, replace-cover, locale-imports, window-globals) ([bbcbc79](https://github.com/VirtoCommerce/vc-shell/commit/bbcbc79530ad237ed4d9bd4519ba164559b125a5))
- **migrate:** add after field to VersionedTransform for dependency ordering ([a854662](https://github.com/VirtoCommerce/vc-shell/commit/a85466259f908c585161e6db43337c1b1e5d2ece))
- **migrate:** add blade-props-simplification transform ([83c1f41](https://github.com/VirtoCommerce/vc-shell/commit/83c1f41b29370061ff72e97b14486740cc6772de))
- **migrate:** add CLI entry point with commander ([b773e92](https://github.com/VirtoCommerce/vc-shell/commit/b773e924c64f90b5b661f82fedb965d0d4ba74d7))
- **migrate:** add codemod transforms for useBladeForm and useDynamicProperties ([9cf4cc8](https://github.com/VirtoCommerce/vc-shell/commit/9cf4cc8c280bb70e5ef6c457c07c44988b6fafbc))
- **migrate:** add define-app-module transform ([fa8ea88](https://github.com/VirtoCommerce/vc-shell/commit/fa8ea88855de47ee5c61e613c7a86898c60ce781))
- **migrate:** add defineExpose → exposeToChildren transform + improve widgets diagnostic ([d73352c](https://github.com/VirtoCommerce/vc-shell/commit/d73352c02630f3cf2b046f524769ac8d4cec1f0f))
- **migrate:** add defineOptions → defineBlade transform ([676caea](https://github.com/VirtoCommerce/vc-shell/commit/676caea421fe960b589041ef74679d5fdb5336d8))
- **migrate:** add icon-audit and scss-safe-use diagnostic transforms ([1975d07](https://github.com/VirtoCommerce/vc-shell/commit/1975d072ceca6ba2da77db006274a47591ae8d9f))
- **migrate:** add import dedup utility and improve vue-sfc-wrapper resilience ([c87e065](https://github.com/VirtoCommerce/vc-shell/commit/c87e06554b3f538d1ee45a65269e53c94fe40683))
- **migrate:** add manual-migration-audit diagnostic transform ([a069aad](https://github.com/VirtoCommerce/vc-shell/commit/a069aadd1816eb6363dd5e95ccd175b9e464d43e))
- **migrate:** add notification-migration transform ([f28480d](https://github.com/VirtoCommerce/vc-shell/commit/f28480d0d9cdd5376110c21913afae0b37e7e443))
- **migrate:** add project-scope orchestrator and registry entry for nswag-class-to-interface ([7a8dcd6](https://github.com/VirtoCommerce/vc-shell/commit/7a8dcd66e65b427c9e94bc40aa1a9fbf4a6062f7))
- **migrate:** add release-config cleanup and VcTable audits ([23118dd](https://github.com/VirtoCommerce/vc-shell/commit/23118dd74e9bd4387b166bd5e35a341ad81cd6be))
- **migrate:** add remove-deprecated-aliases transform ([ded2ff8](https://github.com/VirtoCommerce/vc-shell/commit/ded2ff833b5a47cec253ee9279c6cd9d93482a9e))
- **migrate:** add remove-expose-title and remove-app-module-options ([3a76ff7](https://github.com/VirtoCommerce/vc-shell/commit/3a76ff738fd9ef99fd96acd821280f8a7d66b210))
- **migrate:** add rewrite-imports transform for sub-entry points ([2ec2aa3](https://github.com/VirtoCommerce/vc-shell/commit/2ec2aa391177eaad5ceb9e2243d4e56b004bb8be))
- **migrate:** add Rules A/B — object literal and variable argument transforms ([0856d45](https://github.com/VirtoCommerce/vc-shell/commit/0856d457a7e3d6a1f9d05d392edea1f34578059b))
- **migrate:** add Rules D/E — IPrefix rename and import deduplication ([e988d87](https://github.com/VirtoCommerce/vc-shell/commit/e988d87733e023fbc7abbf460cf6b2e174e5edb3))
- **migrate:** add runner orchestrator with tests ([bc9fa3f](https://github.com/VirtoCommerce/vc-shell/commit/bc9fa3fde6e4c69fad9130aa1c1a3bc14100f053))
- **migrate:** add transform types and version-based registry with selection logic ([2148647](https://github.com/VirtoCommerce/vc-shell/commit/214864780a7939236d049ac6b93a1310a3b726bb))
- **migrate:** add use-blade-migration with onBeforeClose inversion ([4696267](https://github.com/VirtoCommerce/vc-shell/commit/4696267bbb1861eda235c88548f129e89c854eaa))
- **migrate:** add use-data-table-pagination-audit + AI migration prompt ([0c2e7b6](https://github.com/VirtoCommerce/vc-shell/commit/0c2e7b6efba387d9fafe04e5bdcd21ea20500259))
- **migrate:** add use-data-table-sort codemod transform ([655aef7](https://github.com/VirtoCommerce/vc-shell/commit/655aef7b98405b1243c00ed1cdc2a2320600d780))
- **migrate:** add vc-blade-loading-prop transform ([0cb72f3](https://github.com/VirtoCommerce/vc-shell/commit/0cb72f39bc55a98cab0c9a786a1da3bb52e75d3e))
- **migrate:** add version detector with workspace:\* fallback ([c45fabc](https://github.com/VirtoCommerce/vc-shell/commit/c45fabc51885db1890510bdf142b5cbea4364b9b))
- **migrate:** add Vue SFC script block extraction utility ([e086631](https://github.com/VirtoCommerce/vc-shell/commit/e0866319f311c09c971ff02e496cefa6dd96423e))
- **migrate:** auto-migrate notificationTemplates to notifications config ([a9ccbe5](https://github.com/VirtoCommerce/vc-shell/commit/a9ccbe5e30a3f4b30a2c22e2911629d0a86dbb2d))
- **migrate:** declare after dependencies for blade-props, define-options, remove-pathmatch ([90167af](https://github.com/VirtoCommerce/vc-shell/commit/90167afbe8d07fc88a9543eb431edf6b29e5aba9))
- **migrate:** expand v2 migration tooling — icon/asset/audit prompts and blade-event cleanup ([f4788d4](https://github.com/VirtoCommerce/vc-shell/commit/f4788d4d9c588157ca5c11facfe558a69c254c2e)), closes [#41](https://github.com/VirtoCommerce/vc-shell/issues/41)
- **migrate:** fix defineAppModule 2-arg to use blades key ([a92f444](https://github.com/VirtoCommerce/vc-shell/commit/a92f44400ac5253900c0b9377113614fac931753))
- **migrate:** fix defineAppModule 3/4-arg to use object syntax with blades key ([31a1ef3](https://github.com/VirtoCommerce/vc-shell/commit/31a1ef3ae2b87fb77290ec79ff79cf13e65a7bf6))
- **migrate:** generate MIGRATION_REPORT.md with automated/manual/uncovered sections ([3d9d2a1](https://github.com/VirtoCommerce/vc-shell/commit/3d9d2a10844ffe940e96a3f74bf40c24ff6e7a71))
- **migrate:** idempotency guard — second run produces zero modifications ([cd91b25](https://github.com/VirtoCommerce/vc-shell/commit/cd91b250a8a5235543f6a5fe4330a86d530b250a))
- **migrate:** replace-cover-method — openBlade({ replaceCurrentBlade: true }) → coverWith() ([cb24cd8](https://github.com/VirtoCommerce/vc-shell/commit/cb24cd8353847fd9c7ddc91927f726cba3ada00b))
- **migrate:** scaffold nswag-class-to-interface core transform with Rule C ([2579e5b](https://github.com/VirtoCommerce/vc-shell/commit/2579e5bfe3840cafd8562ff466e8b58e47794524))
- **migrate:** structured migration report with before/after examples and guide links ([2f5c2da](https://github.com/VirtoCommerce/vc-shell/commit/2f5c2da289abb9977464fb8772ddcfe2c3daa17d))
- **migrate:** topological sort for transform dependency ordering ([24a4446](https://github.com/VirtoCommerce/vc-shell/commit/24a44463fd9e114401b989114aacfc07ddb5250f))
- **responsive-composable:** introduce useResponsive composable to replace global properties and injection keys ([1280853](https://github.com/VirtoCommerce/vc-shell/commit/1280853cf10ec6cf432b5e7eb88b0991430dfc20))
- **setup:** introduce unsetup script and enhance setup process ([0b0ad7f](https://github.com/VirtoCommerce/vc-shell/commit/0b0ad7f2a47564783b3914f58f04d5cc21ce828e))
- **tests:** enhance test helpers and add vitest environment for consistency ([6cd30ac](https://github.com/VirtoCommerce/vc-shell/commit/6cd30ac65b83dd756803b9ccb4278bd8679be930))

### Bug Fixes

- **cli:** remove beforeEnter guard from tenant route templates, format responsive-composable transform ([3752273](https://github.com/VirtoCommerce/vc-shell/commit/37522732b789316a92c4c958c395c8f3fbf9e0ea))
- **migrate:** --transform bypasses version filter ([85072d1](https://github.com/VirtoCommerce/vc-shell/commit/85072d1059a3dbda11259cdbe80899ce3bf50c6a))
- **migrate:** --update-deps at same version + baseline drift check ([39fea4a](https://github.com/VirtoCommerce/vc-shell/commit/39fea4a6fb243766dbc1f1d31a0c207741a98dd0))
- **migrate:** define-expose-to-children adds useBlade import when missing ([ee7ed7d](https://github.com/VirtoCommerce/vc-shell/commit/ee7ed7db0ba16f2669d59b75b7a35385088feeee))
- **migrate:** fix 7 critical bugs found during real-app testing ([41688a1](https://github.com/VirtoCommerce/vc-shell/commit/41688a164250d397c51b6007953bc112f63ee4b9))
- **migrate:** fix TypeScript error in scss-safe-use readdirSync typing ([2f6e458](https://github.com/VirtoCommerce/vc-shell/commit/2f6e4584eb047f7555fd206a24f74433eebaffcd))
- **migrate:** improve useBladeForm diagnostic — onBeforeClose must be removed, show closeConfirmMessage example ([274bf9a](https://github.com/VirtoCommerce/vc-shell/commit/274bf9aac965b8c8cecada58d7959d547da7f52b))
- **migrate:** remove empty export type {} stubs after Props/Emits removal ([e6164ba](https://github.com/VirtoCommerce/vc-shell/commit/e6164ba267c737aee8990f271173d05e844e81a9))
- **release:** update changelog and release-it configuration ([767c312](https://github.com/VirtoCommerce/vc-shell/commit/767c3123773a02a4badc3bcf89661e535d5f26c8))

### Code Refactoring

- **cli,configs,packages:** apply ESLint flat config lint fixes ([394d5ca](https://github.com/VirtoCommerce/vc-shell/commit/394d5caa30f07ff8408dead09c998deabe0c163f))
- **migrate:** replace ts-morph with jscodeshift for AST transforms ([05ff751](https://github.com/VirtoCommerce/vc-shell/commit/05ff751cded0424434e2231816252c2cec240d7d))
- **migrate:** split runner.ts into focused modules (file-scanner, sfc-processor, dep-updater) ([640db51](https://github.com/VirtoCommerce/vc-shell/commit/640db517ab76d46c7cd2cd06b0b2160936d12fc8))
- rename App Switcher to App Hub ([1646b22](https://github.com/VirtoCommerce/vc-shell/commit/1646b2276791f2448e0e69e77ca25c96857a3975))
- **types:** remove vueUtils and use vue-component-type-helpers for popup typing ([42e6b3e](https://github.com/VirtoCommerce/vc-shell/commit/42e6b3e1af40fab0b54a6c376e190d33c5adf273))
- **vc-gallery:** migrate from ICommonAsset to AssetLike ([6f4254e](https://github.com/VirtoCommerce/vc-shell/commit/6f4254e2699429f338aebf03d179c8611377115a))

### Documentation

- **assets-manager:** document blade options breaking change and enhance codemod ([69cc786](https://github.com/VirtoCommerce/vc-shell/commit/69cc7865a5678a093d972e6e39f955d722fcc133))
- document peer-versions.json and --update-deps peer alignment ([4de1dfd](https://github.com/VirtoCommerce/vc-shell/commit/4de1dfd032194a6e2797055abfcd94f61f117cf6))
- **migrate:** add README and integrate into monorepo build/publish ([a443821](https://github.com/VirtoCommerce/vc-shell/commit/a443821caf246e4f423483ead441ebf2c98a3264))

### Tests

- **migrate:** add full migration integration test ([abd65ee](https://github.com/VirtoCommerce/vc-shell/commit/abd65eec6dce51094569b1ba2a64453af7b6bedd))
- **migrate:** add Vue SFC and package import tests for nswag migration ([08904ad](https://github.com/VirtoCommerce/vc-shell/commit/08904ad5417e72830242daffafcab6277e5e8b59))

### Styles

- **lint:** one-time cleanup of pre-existing violations and tech debt ([a7113c5](https://github.com/VirtoCommerce/vc-shell/commit/a7113c5d25b5b4dc9da20f6bc40c54b57fe46422))

### Chores

- **docs:** generalize private references in migration tooling and skill ([4719e51](https://github.com/VirtoCommerce/vc-shell/commit/4719e51586ff4dae9693c33d195072408111f3c0))
- lint ([c52ef3c](https://github.com/VirtoCommerce/vc-shell/commit/c52ef3cc68d64b211f6e090049deb156e504672f))
- lint ([c001cdf](https://github.com/VirtoCommerce/vc-shell/commit/c001cdf1a880d9e1818b7dea4293800ce7e6b71d))
- scaffold @vc-shell/migrate CLI package ([f0c8766](https://github.com/VirtoCommerce/vc-shell/commit/f0c8766bcfc75606d74dc40ac6b8d09dc614f595))
- update CHANGELOG and version for @vc-shell/migrate to 2.0.0-alpha.14 ([3930661](https://github.com/VirtoCommerce/vc-shell/commit/39306611e23024071b30321ff2c29c9d0edb19c6))

### Other Changes

- refactor!: remove global component and directive registration ([7643d8f](https://github.com/VirtoCommerce/vc-shell/commit/7643d8fcba40bdd4d5e6a8be244a6c1978eec3fb))

### release

- v2.0.0-alpha.15 ([fa8958e](https://github.com/VirtoCommerce/vc-shell/commit/fa8958e7241117ebff164a2d399f13f74d48b55f))
- v2.0.0-alpha.16 ([79ab2b1](https://github.com/VirtoCommerce/vc-shell/commit/79ab2b1022258332c327e742ab0adf1b8fde35ce))
- v2.0.0-alpha.17 ([408e4af](https://github.com/VirtoCommerce/vc-shell/commit/408e4af487f37b8aff790398d5a992820c8f05a2))
- v2.0.0-alpha.18 ([2466e35](https://github.com/VirtoCommerce/vc-shell/commit/2466e359313c9d78893d2473474ec5ce46ad49ca))
- v2.0.0-alpha.19 ([9d5a075](https://github.com/VirtoCommerce/vc-shell/commit/9d5a075e0a722c6c7371706f582b59bbf570ef37))
- v2.0.0-alpha.20 ([98bd4a6](https://github.com/VirtoCommerce/vc-shell/commit/98bd4a62ffa933bbfdae16ef7e46777084f15190))
- v2.0.0-alpha.21 ([bbd0d70](https://github.com/VirtoCommerce/vc-shell/commit/bbd0d70464ff5c0dafbc67ed3bf8ea36f65b0a7a))
- v2.0.0-alpha.22 ([ec455eb](https://github.com/VirtoCommerce/vc-shell/commit/ec455eba6bb91ae5fdbea64817ce1650116b9d50))
- v2.0.0-alpha.23 ([65b2144](https://github.com/VirtoCommerce/vc-shell/commit/65b214434ef1630069aecd6f2eaf916531bf37ef))
- v2.0.0-alpha.24 ([05ff510](https://github.com/VirtoCommerce/vc-shell/commit/05ff5107b81e0280447872ea52771fc47cb3cd67))
- v2.0.0-alpha.25 ([19d09b9](https://github.com/VirtoCommerce/vc-shell/commit/19d09b998861836b288aba36a6d18d7b26cff0b7))
- v2.0.0-alpha.26 ([ee6818c](https://github.com/VirtoCommerce/vc-shell/commit/ee6818ceb60b24d26b7011f2584c8d23f6b4fd3e))
- v2.0.0-alpha.27 ([f43652d](https://github.com/VirtoCommerce/vc-shell/commit/f43652d1aae8af36d5d2f00312492ea9de57f2f1))
- v2.0.0-alpha.28 ([7954dfd](https://github.com/VirtoCommerce/vc-shell/commit/7954dfddf1126d00038b8f66a6fe3efc5c19cfe8))
- v2.0.0-alpha.29 ([ffa72cf](https://github.com/VirtoCommerce/vc-shell/commit/ffa72cf458eed77c78955c88d211a82ead152b0f))
- v2.0.0-alpha.30 ([2db7f17](https://github.com/VirtoCommerce/vc-shell/commit/2db7f17d74afe97e3c6dfef2de436a797f0c32f4))
- v2.0.0-alpha.31 ([8d92fba](https://github.com/VirtoCommerce/vc-shell/commit/8d92fbad5954c71164e7815193b3496e569a5703))
- v2.0.0-alpha.32 ([1ed5533](https://github.com/VirtoCommerce/vc-shell/commit/1ed5533a6a20081e655f2e628bf824de40472f5d))
- v2.0.0-alpha.33 ([49cad36](https://github.com/VirtoCommerce/vc-shell/commit/49cad36a454534136b52576e6a0d97dfe48ae895))
- v2.0.0-alpha.34 ([78bed5a](https://github.com/VirtoCommerce/vc-shell/commit/78bed5af3aeb7ace2eb9f58ddde3235fced47b37))
- v2.0.0-alpha.35 ([05d6f25](https://github.com/VirtoCommerce/vc-shell/commit/05d6f2562c939dd4a2e7e4e7a3d80948beccbef1))

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

- **assets-manager:** notice

* use-assets-migration codemod: detect openBlade("AssetsManager") with
  old handler options and missing markRaw()

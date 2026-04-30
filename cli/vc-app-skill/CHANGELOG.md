# Changelog

## [2.0.3](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.2...v2.0.3) (2026-04-30)

**Note:** Version bump only for package @vc-shell/vc-app-skill

## [2.0.2](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.1...v2.0.2) (2026-04-27)

**Note:** Version bump only for package @vc-shell/vc-app-skill

## [2.0.1](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0...v2.0.1) (2026-04-24)

### Features

- enhance migrate transforms, fix notification race condition, update migration docs (#221) ([3c2134d](https://github.com/VirtoCommerce/vc-shell/commit/3c2134d0fa1016a2e4e075a12bb9df9a31b3d381)), closes [#221](https://github.com/VirtoCommerce/vc-shell/issues/221)

### Bug Fixes

- **hooks:** update npm version retrieval in vc-app-check-update.js ([c8f0e68](https://github.com/VirtoCommerce/vc-shell/commit/c8f0e68ded994bdfb8d01dcf96e90184b9d278cd))

# [2.0.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3...v2.0.0) (2026-04-22)

### Features

- **docs:** add documentation for usePopup and useResponsive composables ([342a50a](https://github.com/VirtoCommerce/vc-shell/commit/342a50ada1545637782e01f5452a60839aa90fd2))
- **migrate:** add use-data-table-pagination-audit + AI migration prompt ([0c2e7b6](https://github.com/VirtoCommerce/vc-shell/commit/0c2e7b6efba387d9fafe04e5bdcd21ea20500259))
- **migrate:** expand v2 migration tooling — icon/asset/audit prompts and blade-event cleanup ([f4788d4](https://github.com/VirtoCommerce/vc-shell/commit/f4788d4d9c588157ca5c11facfe558a69c254c2e)), closes [#41](https://github.com/VirtoCommerce/vc-shell/issues/41)
- **vc-app-skill:** add /vc-app design command documentation ([3cc59b2](https://github.com/VirtoCommerce/vc-shell/commit/3cc59b29831da7f2f78900c7f61354165583813e))
- **vc-app-skill:** add /vc-app design phases 1-6 (prompt → plan → execute → summary) ([b0bb44f](https://github.com/VirtoCommerce/vc-shell/commit/b0bb44f47e28fe9df147c5941a15e76b5ae3d2f8))
- **vc-app-skill:** add /vc-app design to routing table and help ([8b2f53e](https://github.com/VirtoCommerce/vc-shell/commit/8b2f53e7d8643f8ab87f3fab82dc4dd8c8bd44da))
- **vc-app-skill:** add /vc-app migrate command with full migration pipeline ([35a8b11](https://github.com/VirtoCommerce/vc-shell/commit/35a8b119457b14f6f4626caf133476222afd6663))
- **vc-app-skill:** add /vc-app promote command with 5-phase flow ([a3b6da6](https://github.com/VirtoCommerce/vc-shell/commit/a3b6da658322a1e39ffb9808d0e80bf732f52ae8))
- **vc-app-skill:** add blade-enhancer agent for surgical module modifications ([bc83681](https://github.com/VirtoCommerce/vc-shell/commit/bc83681c99accd3a25b48a5da1916810a6393aa0))
- **vc-app-skill:** add design-specific error handling scenarios ([5381685](https://github.com/VirtoCommerce/vc-shell/commit/5381685b75a7eac82add64314cab8269518ba53f))
- **vc-app-skill:** add enhance flow to /vc-app generate for existing modules ([2936bd6](https://github.com/VirtoCommerce/vc-shell/commit/2936bd60946d4c63207682908a8edbb8f137e448))
- **vc-app-skill:** add entry-point and update commands ([ab9075f](https://github.com/VirtoCommerce/vc-shell/commit/ab9075f49b1bb2d93f56613758d038ef1ca09d09))
- **vc-app-skill:** add existingModule context and append mode to generators ([3978c66](https://github.com/VirtoCommerce/vc-shell/commit/3978c66aff3b2526f51227c560371be425018ad2))
- **vc-app-skill:** add knowledge-stats script for knowledge base audit ([7a568fc](https://github.com/VirtoCommerce/vc-shell/commit/7a568fc57335d51349a644721c904586efd49273))
- **vc-app-skill:** add migration prompt knowledge base (nswag, widgets, form, blade-props, notifications) ([a0b0eb2](https://github.com/VirtoCommerce/vc-shell/commit/a0b0eb2a96521916a72bdbf787961c1c96f96f6d))
- **vc-app-skill:** add migration-agent subagent prompt ([29ac155](https://github.com/VirtoCommerce/vc-shell/commit/29ac1550c8e3c9b71d5dbc2ade7ea86b4d40213f))
- **vc-app-skill:** add module-analyzer agent for existing module introspection ([9eaff6b](https://github.com/VirtoCommerce/vc-shell/commit/9eaff6b3ca829ce41298c739f26ba6bdf93a2adb))
- **vc-app-skill:** add multi-runtime installer ([00e656e](https://github.com/VirtoCommerce/vc-shell/commit/00e656e65bef05ebe8e7cb29cbf2efe64b991f5a))
- **vc-app-skill:** add platform URL prompt and update design plan structure ([7855830](https://github.com/VirtoCommerce/vc-shell/commit/78558303247107ff55d5b0aeb3f5fdf50cad16f8))
- **vc-app-skill:** add promote-agent subagent for mock-to-API transformation ([27484e3](https://github.com/VirtoCommerce/vc-shell/commit/27484e39c72e7b738e8db5846063e6388f7e06db))
- **vc-app-skill:** add SessionStart update check hook ([72c5bcf](https://github.com/VirtoCommerce/vc-shell/commit/72c5bcf33d4f8ae826e7ed76d9228c42cfa846d4))
- **vc-app-skill:** add uninstaller ([6a0507c](https://github.com/VirtoCommerce/vc-shell/commit/6a0507c9a5c755c0b4487c5625898c5c50c38986))
- **vc-app-skill:** create package scaffold with README ([a2bbced](https://github.com/VirtoCommerce/vc-shell/commit/a2bbced57b2fbb62bb56ca38c679b0c42e7aee88))
- **vc-app-skill:** enrich knowledge base with When to Use sections, patterns, and sync-docs script ([c82ed63](https://github.com/VirtoCommerce/vc-shell/commit/c82ed639d748bdc8fd2d9c39435ee37baedd0563))
- **vc-app-skill:** migrate skill content from create-vc-app to standalone package ([1ac8945](https://github.com/VirtoCommerce/vc-shell/commit/1ac894510ca32cad22efb226117127f76085f85a))
- **vc-app-skill:** update scaffold to skip --module-name for standalone ([c82066e](https://github.com/VirtoCommerce/vc-shell/commit/c82066e3c910676ada13f0cd8f1d7db72d81982a))
- **vc-app:** add sidebar search bar for menu filtering ([72f17fc](https://github.com/VirtoCommerce/vc-shell/commit/72f17fc5b0e77e4e87457c5a29262345da50317d))

### Bug Fixes

- **datatable:** normalise date-range filter values to YYYY-MM-DD ([d89864a](https://github.com/VirtoCommerce/vc-shell/commit/d89864aa635e7479137fb0ad501197adf335f99e))
- **migrate:** datatable prompt forbids 'removed filters for green build' shortcut ([af5ae8e](https://github.com/VirtoCommerce/vc-shell/commit/af5ae8e4259b435729e6cea9e4c61d74b41d3952))
- **migrate:** use-data-table-pagination prompt — per-file scope skip ([8949f01](https://github.com/VirtoCommerce/vc-shell/commit/8949f01da97b69c15fc6e3a2fca951608731979c))
- **release:** update changelog and release-it configuration ([767c312](https://github.com/VirtoCommerce/vc-shell/commit/767c3123773a02a4badc3bcf89661e535d5f26c8))
- **vc-app-skill:** add menuItem to standalone details blades (isWorkspace entry point) ([6be54ad](https://github.com/VirtoCommerce/vc-shell/commit/6be54ad38613ea0de865ab1348236417da8a572d))
- **vc-app-skill:** add VC_SHELL_MIGRATE_CLI env override for local testing ([010d2f2](https://github.com/VirtoCommerce/vc-shell/commit/010d2f2ecb29d31d9134406bcd18e46e5883208b))
- **vc-app-skill:** auto-run yarn install after project scaffold ([cb9ada3](https://github.com/VirtoCommerce/vc-shell/commit/cb9ada34579f89121de5648eee65b346bcd4d924))
- **vc-app-skill:** clarify app.use ordering — after framework, before router ([97439e4](https://github.com/VirtoCommerce/vc-shell/commit/97439e4cfedcae81a6fc26721b91d79187e95f1a))
- **vc-app-skill:** correct mock template in details-blade-generator ([04b7d43](https://github.com/VirtoCommerce/vc-shell/commit/04b7d43dc12cb66ad786f91017e48c4c30e889e9))
- **vc-app-skill:** register generated modules in main.ts (import + app.use) ([e88d75e](https://github.com/VirtoCommerce/vc-shell/commit/e88d75e86ed0d4f69d3261d3d04e3b68bfb3baa5))
- **vc-app-skill:** resolve migrate CLI from project node_modules before npx fallback ([82a8156](https://github.com/VirtoCommerce/vc-shell/commit/82a81563f7fdb94a94a7b8a80796ecffc671a39c))
- **vc-app-skill:** resolve migrate CLI locally in dev mode, fallback to npx ([89888a0](https://github.com/VirtoCommerce/vc-shell/commit/89888a06cc0b4a1519f46f070ee06ebb0d82fd09))
- **vc-app-skill:** use @alpha dist-tag for create-vc-app commands ([09b4a27](https://github.com/VirtoCommerce/vc-shell/commit/09b4a273116d9b04c00ff1c6ad19af2d869bd394))
- **vc-app-skill:** use @alpha dist-tag for update command and version check hook ([cceaab9](https://github.com/VirtoCommerce/vc-shell/commit/cceaab926a3a51160d8994891bc88445bfb9a9aa))
- **vc-app-skill:** validate runtime arg and fix command listing ([f7169af](https://github.com/VirtoCommerce/vc-shell/commit/f7169afa56092be2e223a61c0edd5b73cd653d77))

### Code Refactoring

- clean up code formatting and improve readability across multiple files ([9f710b5](https://github.com/VirtoCommerce/vc-shell/commit/9f710b5ceba270475709735c139e061c66c96b18))
- **core:** make user composables a true singleton ([72391b6](https://github.com/VirtoCommerce/vc-shell/commit/72391b610e0bd520b0814641eedfc5163058236a))
- rename App Switcher to App Hub ([1646b22](https://github.com/VirtoCommerce/vc-shell/commit/1646b2276791f2448e0e69e77ca25c96857a3975))
- rename vc-table to vc-data-table, extract usePopup to core composables ([15cc93d](https://github.com/VirtoCommerce/vc-shell/commit/15cc93dc871d6d23344aa8d0fff7074528fea001))

### Documentation

- add comprehensive documentation for useDataTablePagination composable ([a783cd9](https://github.com/VirtoCommerce/vc-shell/commit/a783cd9a7a5837267d4c11cc3279f2b70d0e6734))
- document peer-versions.json and --update-deps peer alignment ([4de1dfd](https://github.com/VirtoCommerce/vc-shell/commit/4de1dfd032194a6e2797055abfcd94f61f117cf6))
- update references from IBladeInstance to BladeDescriptor ([ef380d8](https://github.com/VirtoCommerce/vc-shell/commit/ef380d80df9247fdc70e42aed411a48239a294fa))
- **vc-app-skill:** document /vc-app migrate command and migration-agent ([5ded9f1](https://github.com/VirtoCommerce/vc-shell/commit/5ded9f1a98028a07327d06254e88ac8635c4fd66))
- **vc-app-skill:** update README and simplify create command ([1edd79d](https://github.com/VirtoCommerce/vc-shell/commit/1edd79d746b57cc77fc9c5dd9278c81f6c575bbe))
- **vc-app-skill:** update README to remove release section and ensure proper formatting ([0e24e48](https://github.com/VirtoCommerce/vc-shell/commit/0e24e481ec03583b41b29ce47f8dc623020a1079))
- **vc-app-skill:** use @alpha tag in install commands until stable release ([d82529c](https://github.com/VirtoCommerce/vc-shell/commit/d82529c32386770945b6aff35b1d0bf01a414b79))

### Styles

- **lint:** one-time cleanup of pre-existing violations and tech debt ([a7113c5](https://github.com/VirtoCommerce/vc-shell/commit/a7113c5d25b5b4dc9da20f6bc40c54b57fe46422))

### Chores

- auto-sync vc-app-skill VERSION and docs during release ([140897d](https://github.com/VirtoCommerce/vc-shell/commit/140897d2f31b98eef88f17309baa76fbdaae821f))
- **docs:** generalize private references in migration tooling and skill ([4719e51](https://github.com/VirtoCommerce/vc-shell/commit/4719e51586ff4dae9693c33d195072408111f3c0))
- **release-it:** add before:stage hook to stage runtime files before release ([a8f0b8c](https://github.com/VirtoCommerce/vc-shell/commit/a8f0b8cd7c4cb6c0cd9a789003d75f81ac2fb2d0))
- **scripts:** normalize yarn scripts per industry standards ([1cdd0cb](https://github.com/VirtoCommerce/vc-shell/commit/1cdd0cb517d2436ef2a509c6b6c358f6a48630d1))
- track vc-app-skill knowledge docs in repository ([9189f08](https://github.com/VirtoCommerce/vc-shell/commit/9189f0842a01e7c46d06c28243236ccdfb8bf04f))
- update package.json to include publishConfig for npm registry ([cf5f3ed](https://github.com/VirtoCommerce/vc-shell/commit/cf5f3edd1a048a9bb16e5ac11d4aa5f717a717c5))
- **vc-app-skill:** add to release pipeline and bump to 2.0.0-alpha.16 ([f703552](https://github.com/VirtoCommerce/vc-shell/commit/f7035529020bb330a5f50840c50ad0843828ebf1))

### Other Changes

- Merge remote-tracking branch 'origin/main' ([bb2c2da](https://github.com/VirtoCommerce/vc-shell/commit/bb2c2da88fd9ac8d58eb0a84451d80bfba3f2547))

### release

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

- **scripts:** for external consumers: old script names
  (storybook-serve, build-framework, check-locales etc) are removed.
  Legacy aliases are deliberately not provided — they would perpetuate
  the non-standard naming this commit eliminates.

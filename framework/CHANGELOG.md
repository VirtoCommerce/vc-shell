# [2.0.0-alpha.21](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.20...v2.0.0-alpha.21) (2026-03-23)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.20](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.18...v2.0.0-alpha.20) (2026-03-23)


### Bug Fixes

* **theme-selector:** update notification mock path in tests ([c46aed1](https://github.com/VirtoCommerce/vc-shell/commit/c46aed1128abbb3b93623129de31b40809618408))
# [2.0.0-alpha.19](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.18...v2.0.0-alpha.19) (2026-03-23)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.18](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.17...v2.0.0-alpha.18) (2026-03-23)


### Bug Fixes

* add fallback timer for select visibility checks ([323c393](https://github.com/VirtoCommerce/vc-shell/commit/323c3931778e5eb30a7306d111a0dd4866ac77d7))
# [2.0.0-alpha.17](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.16...v2.0.0-alpha.17) (2026-03-23)


### Bug Fixes

* **defineBlade:** register blade config at module scope, not setup time ([7d80498](https://github.com/VirtoCommerce/vc-shell/commit/7d804989ac285c1fb2d277e131c7e159292a5f41))
* **framework:** expose defineBlade global type via globals.d.ts reference ([7c24305](https://github.com/VirtoCommerce/vc-shell/commit/7c243059b18fcb6f8588425c08d3bd2856db03db))
* **framework:** fix vc-select reactivity and assets-details binding ([5f37bd7](https://github.com/VirtoCommerce/vc-shell/commit/5f37bd7a8095a27438fb94c2cdf967c212217282))
* **notifications:** export NotificationContextKey from framework public API ([28a989d](https://github.com/VirtoCommerce/vc-shell/commit/28a989d26ea4b5e5f59fc48e34756829bdfe401c))


### Features

* add useDataTableSort composable for VcDataTable sort state management ([4eafe65](https://github.com/VirtoCommerce/vc-shell/commit/4eafe65a02b7af23dc4f5196c2583e09de47ec5a))
* **blade-navigation:** add BladeDefinition, BladeMenuItemConfig, BladeConfig types ([813786b](https://github.com/VirtoCommerce/vc-shell/commit/813786be215ba0d73e9269863a218277b36f17e4))
* **blade-navigation:** add global bladeConfigRegistry for defineBlade ([2957c70](https://github.com/VirtoCommerce/vc-shell/commit/2957c70a751a7a47b8a40fd47e57797e0ad9ea73))
* **blade-registry:** read from bladeConfigRegistry + handle menu registration ([235fc51](https://github.com/VirtoCommerce/vc-shell/commit/235fc51f78e05c9958ad5096f85b69ccd8417c0b))
* **framework:** add global defineBlade() type declaration ([4b5b227](https://github.com/VirtoCommerce/vc-shell/commit/4b5b22725c0b381aecb583bd7efd11ea94bd34c9))
* **notifications:** add NotificationContextKey injection key ([325de54](https://github.com/VirtoCommerce/vc-shell/commit/325de540aea20bab3f9981d55419b9e8882faf10))
* **notifications:** add useNotificationContext composable ([fa73deb](https://github.com/VirtoCommerce/vc-shell/commit/fa73debbcabc2378c1a0c0a90dba589a134c2c87))
# [2.0.0-alpha.16](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.15...v2.0.0-alpha.16) (2026-03-20)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.15](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.14...v2.0.0-alpha.15) (2026-03-20)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.14](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.13...v2.0.0-alpha.14) (2026-03-20)


### Bug Fixes

* **notifications:** decouple toast dismissal from notification badge state ([d6d08f1](https://github.com/VirtoCommerce/vc-shell/commit/d6d08f14e6aaf3cd88451c2b80b72b2596a27d02))
# [2.0.0-alpha.13](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.12...v2.0.0-alpha.13) (2026-03-20)


### Bug Fixes

* **ToolbarMobile:** scope disabled button opacity to :disabled pseudo-class ([a723942](https://github.com/VirtoCommerce/vc-shell/commit/a72394267a36a0240299ef432b340f450ebee724))
* **vc-sidebar:** prevent infinite recursion in focus trap ([3221237](https://github.com/VirtoCommerce/vc-shell/commit/3221237032f855543b64183b1238e3e2dcac423c))
* widen exposeToChildren type signature to accept typed functions ([0fad830](https://github.com/VirtoCommerce/vc-shell/commit/0fad83088db7075c3e5267b0ed9a7702c1acbcfb))


### Features

* add Vue module augmentation type declarations ([f1b8f48](https://github.com/VirtoCommerce/vc-shell/commit/f1b8f4817a849d4fbe4eb8c820214d942f691e93))
# [2.0.0-alpha.12](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.11...v2.0.0-alpha.12) (2026-03-19)


### Bug Fixes

* **ai-agent:** address code review — extract flushPendingInit, replace console.debug with logger ([03ca531](https://github.com/VirtoCommerce/vc-shell/commit/03ca531b64e5809317163c0beaf48ee715abb596))
* **ai-agent:** fix blade ID mismatch preventing context from reaching chatbot ([88a5a1e](https://github.com/VirtoCommerce/vc-shell/commit/88a5a1ef2c532c8980df119d5826a0412d3b0593))
* **ai-agent:** remove itemsCount badge from agent header ([5a6b4fa](https://github.com/VirtoCommerce/vc-shell/commit/5a6b4fa957402e4fe2766bafc86b416f3996e3b0))
* **BladeMessaging:** prevent callParent() errors from showing as toast notifications ([9b5fa63](https://github.com/VirtoCommerce/vc-shell/commit/9b5fa639c30d99a8ca24ff2a38157c3853071b16))
* **bladeRouterGuard:** preserve route parameters during URL restoration ([efa002a](https://github.com/VirtoCommerce/vc-shell/commit/efa002a7c82699c9ff9b960671d7b3222f75d08a))
* **DataTableHeader:** guard column switcher UI with v-if when only spacer needed ([6850f32](https://github.com/VirtoCommerce/vc-shell/commit/6850f32fea7fe3ded758a2f3bf6606541463a0fa))
* **DataTableMobileCard:** prevent error message truncation in editing mode ([ebe50aa](https://github.com/VirtoCommerce/vc-shell/commit/ebe50aa580efd13ae058aea8ebc61fd75aa4c743))
* export UseAiAgentContextReturn from ai-agent public API and break colorUtils circular dep ([85693ae](https://github.com/VirtoCommerce/vc-shell/commit/85693ae2326b3b11003663350dbab61e529cc349))
* **notifications:** preserve unread dot layout and fix sort/markAsRead timing ([7b54853](https://github.com/VirtoCommerce/vc-shell/commit/7b548530bd3a58c9353acd84b3bf0bde90117ce2))
* suppress Vue "injection not found" warnings for appInsights and vee-validate ([1e09dad](https://github.com/VirtoCommerce/vc-shell/commit/1e09dad4bd6b0fd39c127acdc57182a0122982b5))
* **TableAddRowButton:** add CSS variable fallback for mobile view ([d5a3821](https://github.com/VirtoCommerce/vc-shell/commit/d5a382155ad80aefa422d9cb4da27cb8b83af1b5))
* **TableRow:** remove excessive gap between table cells ([49e92e2](https://github.com/VirtoCommerce/vc-shell/commit/49e92e2bca06af7c606eb80e70934f08f8fa6c5e))
* **TableRow:** use tw-gap-2 for balanced cell spacing ([e3779cf](https://github.com/VirtoCommerce/vc-shell/commit/e3779cf9ccfc6c1bab6508220c65c20ea2f3fc41))
* **ui:** add select-all toolbar in mobile table view ([a8a9c8f](https://github.com/VirtoCommerce/vc-shell/commit/a8a9c8fc6b9f31f4e896af885f541b253f9e77c0))
* **ui:** add text truncation to form components and fix widget chevron alignment ([b17b19e](https://github.com/VirtoCommerce/vc-shell/commit/b17b19e14c2cce115134c81dfb42d33b61bb04f4))
* **ui:** adjust BladeHeader flex layout and remove TableCell horizontal padding ([03afb1a](https://github.com/VirtoCommerce/vc-shell/commit/03afb1a631f2dd80c1540ec592853c657e76ace9))
* **ui:** increase vc-menu item click target area ([52a1679](https://github.com/VirtoCommerce/vc-shell/commit/52a16797c48e298192a093ddf9b7d1c7f88a14ce))
* **ui:** increase z-index for dropdown, select, and multivalue to 10001 ([68bf908](https://github.com/VirtoCommerce/vc-shell/commit/68bf9087975aa4eb85989ecad65344219983dfe6))
* **useBladeMessaging:** silently return undefined when parent method not found ([b56d88f](https://github.com/VirtoCommerce/vc-shell/commit/b56d88f856a81d6fa76ca390144f67374580b903))
* **useModificationTracker:** synchronously reset isModified value for immediate updates ([3c3fab4](https://github.com/VirtoCommerce/vc-shell/commit/3c3fab475d8827ef3630dfdefdde7103c6dc393c))
* **useTableInlineEdit:** reuse parent VeeValidate form context ([2edab69](https://github.com/VirtoCommerce/vc-shell/commit/2edab6969c9e3f8cbeefd843271762bb7c42353c))
* **VcDataTable:** emit cell-edit-complete in mobile inline edit mode ([0bdfe06](https://github.com/VirtoCommerce/vc-shell/commit/0bdfe06bbd9086c27b5d29fc2067182ca6daee11))
* **VcDataTable:** fix red asterisk color and pass validateOnMount to cell components ([61fcf3f](https://github.com/VirtoCommerce/vc-shell/commit/61fcf3fc9113a0ecb84ce9a99d4cfb0c3ee64346))
* **VcDataTable:** revert unintended pagination v-if change ([da081ee](https://github.com/VirtoCommerce/vc-shell/commit/da081ee58000c1a3744209ddc12597aabfbd4003))
* **VcDataTable:** show add-row button in mobile view ([236d59f](https://github.com/VirtoCommerce/vc-shell/commit/236d59f9ae651356fbd4308fa812e53dfae9fd02))
* **VcDataTable:** validate empty fields on mount and move asterisk before title ([aca63ad](https://github.com/VirtoCommerce/vc-shell/commit/aca63ad56ddf0515a84b3160d201e8eb27a93ede))
* **widgets:** fix IWidget type compatibility in useExternalWidgets ([bca5d29](https://github.com/VirtoCommerce/vc-shell/commit/bca5d29794c9c360676e6bd43500a3190219ab42))
* **widgets:** move v-else to WidgetProvider to fix adjacent v-if requirement ([8c05898](https://github.com/VirtoCommerce/vc-shell/commit/8c05898249a6c985e997c85c892dde1f5dd1e652))
* **widgets:** narrow widgetService type for TS strict closure inference ([9373ee0](https://github.com/VirtoCommerce/vc-shell/commit/9373ee0d5841e0f7bd61e8636aced95dd0352139))
* **widgets:** use direct import path for internal useWidgets ([2bc61cd](https://github.com/VirtoCommerce/vc-shell/commit/2bc61cd315ce4956bf661ddc916a60754383667b))


### Features

* **blade-navigation:** split replaceCurrentBlade into replace and cover operations ([8e1de52](https://github.com/VirtoCommerce/vc-shell/commit/8e1de522ec9763db6bbfa8c59a2842c903d68ddc))
* **CellEditableWrapper:** add validateOnMount prop for eager validation ([3d0e022](https://github.com/VirtoCommerce/vc-shell/commit/3d0e022d39f3b862abed0c8c4b337057fd94c638))
* **core:** add useSlowNetworkDetection composable — request timer channel ([188d97e](https://github.com/VirtoCommerce/vc-shell/commit/188d97eb365a5a6cff8860765be09ea62b701704))
* customize asset file naming in Vite configuration ([33f17e3](https://github.com/VirtoCommerce/vc-shell/commit/33f17e3c060fe97dbf3fa5a053c8b8a666a6affc))
* **DataTableHeader:** show required asterisk in edit mode ([f597b83](https://github.com/VirtoCommerce/vc-shell/commit/f597b83e72e4432d7aeb5bd460debbbece9d4e1e))
* **modularity:** add optional components parameter to createAppModule function shim ([52696b9](https://github.com/VirtoCommerce/vc-shell/commit/52696b92c71c15618f600e291bb8e99097703454))
* multi-entry Vite build with ui, ai-agent, extensions sub-entries ([db93322](https://github.com/VirtoCommerce/vc-shell/commit/db93322ce7a732e895d3769f2392e3009b10bd15))
* **settings-menu-item:** add submenu slot with responsive desktop/mobile behavior ([cd2d75f](https://github.com/VirtoCommerce/vc-shell/commit/cd2d75ff5b8ea52d69d7bc381144788accd54422))
* **slow-network:** add effectiveType detection channel ([3369bb2](https://github.com/VirtoCommerce/vc-shell/commit/3369bb2131deb2603177d10b9e61101748e6a77c))
* **slow-network:** add notification management with dismiss delay and offline suppression ([1708b87](https://github.com/VirtoCommerce/vc-shell/commit/1708b879ee777f1fc0cab7d29edfd73379060eb1))
* **slow-network:** integrate request tracking into interceptor and initialize at startup ([6d55e35](https://github.com/VirtoCommerce/vc-shell/commit/6d55e35097643b8868a882162c1716920ecb4586))
* **stories:** add row actions column position stories ([cac88df](https://github.com/VirtoCommerce/vc-shell/commit/cac88df844f4d1bcce62f4d9304924ff587c630f))
* **storybook:** reorganize navigation to functional categories and add test integration ([eb9ba96](https://github.com/VirtoCommerce/vc-shell/commit/eb9ba96865b0cd30fe1a248c46a6b320d04ea785))
* **useBlade:** add onActivated/onDeactivated lifecycle hooks ([2fcea43](https://github.com/VirtoCommerce/vc-shell/commit/2fcea434ea109f00d9f1749f61d5420e4cf3a0bb))
* **useBlade:** add TOptions generic for typed blade options ([fadc1c9](https://github.com/VirtoCommerce/vc-shell/commit/fadc1c9cde673dbb4692307881b765b6cc5042c6))
* **VcBlade:** auto-read expanded/closable from BladeDescriptor, self-handle close ([1f76506](https://github.com/VirtoCommerce/vc-shell/commit/1f765061bea1b3678e0e197d12d03d8c2505d046))
* **VcDataTable:** add actions position prop to VcDataTable component ([de8c9ee](https://github.com/VirtoCommerce/vc-shell/commit/de8c9eebad9d8cd6a2da3318e9067eb6062325bf))
* **VcDataTable:** add rowActionsPosition prop for column-mode actions ([c170209](https://github.com/VirtoCommerce/vc-shell/commit/c1702094ab24bc6fadd71ffa0ba4ff99505524e0))
* **VcDataTable:** enable inline editing in mobile card view ([ff08e0f](https://github.com/VirtoCommerce/vc-shell/commit/ff08e0f604cebe647763beca543dc3b4816c6be4))
* **VcDataTable:** thread isEditing and isNewRow props for validation ([a550fef](https://github.com/VirtoCommerce/vc-shell/commit/a550fef53b97a9038e32c3e1ba1ee3644e070a36))
* **VcIcon:** make Lucide icons the standard, deprecate legacy icon packs ([d58888f](https://github.com/VirtoCommerce/vc-shell/commit/d58888f151ca2a41fa000a8efe737f2461815649))
* **widgets:** add defineBladeContext / injectBladeContext composables ([a601ea3](https://github.com/VirtoCommerce/vc-shell/commit/a601ea3deb87c65a72572f34e503a5db7e296185))
* **widgets:** add guarded() click handler utility ([ae452ee](https://github.com/VirtoCommerce/vc-shell/commit/ae452ee804dc97172a8ea7cc2b40372e27599ecd))
* **widgets:** add useBladeWidgets composable (Stage 1 baseline) ([a885386](https://github.com/VirtoCommerce/vc-shell/commit/a885386c981446a360f239cf7fd2e4fad612bb8e))
* **widgets:** add useBladeWidgets composable with TDD ([6cf9e03](https://github.com/VirtoCommerce/vc-shell/commit/6cf9e0354a1a8ad6124fe61d9f8a25a3bc538473))
* **widgets:** add useWidget composable with TDD ([7b90b7c](https://github.com/VirtoCommerce/vc-shell/commit/7b90b7ce40fb498801c18cb7730bec99199846cb))
* **widgets:** add WidgetIdKey, WidgetProvider, wrap containers ([5fb2588](https://github.com/VirtoCommerce/vc-shell/commit/5fb2588d791439874a1c4ea62a3abcf3bf1416e2))
* **widgets:** extend useBladeWidgets with headless declarations ([76fbdd2](https://github.com/VirtoCommerce/vc-shell/commit/76fbdd226456211981a8dd5ad4a0442f4fa45269))
* **widgets:** extend useBladeWidgets with headless declarations ([513a6bf](https://github.com/VirtoCommerce/vc-shell/commit/513a6bfd80c6d9a39c29e64f357c4ddcb8d1c415))
* **widgets:** render headless widgets in WidgetContainers and inject kind for external widgets ([6b85dbe](https://github.com/VirtoCommerce/vc-shell/commit/6b85dbe8e2c843631e92fac274451cd90e090798))
# [2.0.0-alpha.11](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2026-03-13)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.10](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2026-03-13)


* feat!(blade): unify useBlade() API, deprecate useBladeNavigation() and useBladeContext() ([d07d829](https://github.com/VirtoCommerce/vc-shell/commit/d07d829b34720797e99f860014a835906ae11cd6))


### Bug Fixes

* **notifications:** address architectural review findings ([4429f1c](https://github.com/VirtoCommerce/vc-shell/commit/4429f1ccf77830d3d36efa537d93c4c463ffaced))
* **notifications:** address code review findings ([1104f68](https://github.com/VirtoCommerce/vc-shell/commit/1104f681ed26d775632b769e618b623d81480078))
* **notifications:** remove broken hasUnreadNotifications, add loadHistory tests ([9f25854](https://github.com/VirtoCommerce/vc-shell/commit/9f2585430b6eba78920e1037951a39a77b26205a))
* **notifications:** replace VcDropdown with VcScrollableContainer in dropdown ([d635694](https://github.com/VirtoCommerce/vc-shell/commit/d6356940fca5ad450cf4b592d283021468d6f08d))
* **vc-button:** rename icon class to BEM modifier and reduce icon-title gap ([ba2297d](https://github.com/VirtoCommerce/vc-shell/commit/ba2297d5c06de19c8a40df1207f13587991a8a08))
* **vc-select:** resolve primitive modelValue when emitValue is false ([3cc38ac](https://github.com/VirtoCommerce/vc-shell/commit/3cc38acd4dbccd788575aab6218897ab33ab67f8))


### Features

* **icons:** migrate from FontAwesome and Material to Lucide icons ([1165217](https://github.com/VirtoCommerce/vc-shell/commit/1165217459ccac086aa5eab381deb43be46d7746))
* **modularity,dropdown:** support notifications config in defineAppModule, use store in dropdown ([eb96c22](https://github.com/VirtoCommerce/vc-shell/commit/eb96c228b0e8f8d5efa6bd5d31cd8f3e70ae3dc8))
* **notifications:** add barrel exports for notifications module ([f10526f](https://github.com/VirtoCommerce/vc-shell/commit/f10526ffe639700a82c96d73b533f3ef78c9b9c9))
* **notifications:** add core types for notification system redesign ([402cbbc](https://github.com/VirtoCommerce/vc-shell/commit/402cbbc83de926aa7cd025173c7c838eb3c0b3a4))
* **notifications:** add NotificationStore with types and tests ([921fd84](https://github.com/VirtoCommerce/vc-shell/commit/921fd8461416e02234b4bce9eb299b1767660ad4))
* **notifications:** add ToastController with progress/auto/silent modes ([9eb6268](https://github.com/VirtoCommerce/vc-shell/commit/9eb62687245bd63788d76d67e7185237c6c3e9e8))
* **notifications:** add useBladeNotifications composable with auto-cleanup ([af18fd8](https://github.com/VirtoCommerce/vc-shell/commit/af18fd869d2b4874732592292dda0fa46578d07e))
* **notifications:** add useNotificationStore singleton composable ([596d1d6](https://github.com/VirtoCommerce/vc-shell/commit/596d1d677cd72b6f6e4a6e24583d3a6d8cc4152a))
* **notifications:** integrate ToastController into store.ingest and wire SignalR ([8c7be3e](https://github.com/VirtoCommerce/vc-shell/commit/8c7be3ea06a94341a82f9741e34d5e4a2eccb4a2))


### BREAKING CHANGES

* `useBladeNavigation()` and `useBladeContext()` are removed.
Use `useBlade()` everywhere. The old `useBlade()` that returned `ComputedRef<IBladeInstance>`
is replaced with a new API returning destructured properties and methods.
# [2.0.0-alpha.9](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2026-03-12)


### Bug Fixes

* topological build order, deprecation fixes, and dependency updates ([bf01eaf](https://github.com/VirtoCommerce/vc-shell/commit/bf01eaf7574eda5ae393941b553cbea5918a768f))
* **ui:** replace VcInput discriminated union Props with single interface ([b25b153](https://github.com/VirtoCommerce/vc-shell/commit/b25b153eb81a13f879bfd2d14be63c333ea3f9a6))
# [2.0.0-alpha.8](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2026-03-12)


### Bug Fixes

* add promise deduplication to loadUser() to prevent concurrent duplicate API calls ([ec83ab6](https://github.com/VirtoCommerce/vc-shell/commit/ec83ab6298648c5386467fcb88624e8154379f4b))
* resolve vue-tsc build errors for generic components ([a8955e5](https://github.com/VirtoCommerce/vc-shell/commit/a8955e5ada0940345f149298653dd4bd96c6a574))


### Features

* **mf:** extract Module Federation loader into @vc-shell/mf-config and @vc-shell/mf-host ([9b079c2](https://github.com/VirtoCommerce/vc-shell/commit/9b079c27bc1497d89849b909f62c1403eff0c9b4))
* **vc-select:** add useSelectDataSource composable with cache layer ([4f4e724](https://github.com/VirtoCommerce/vc-shell/commit/4f4e7246cd40cc09623e0f283ea32032f9ee0da1))
# [2.0.0-alpha.7](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2026-03-11)


### Bug Fixes

* remove duplicate changelog entries caused by multiline regex bug ([2f27d4c](https://github.com/VirtoCommerce/vc-shell/commit/2f27d4c2ca81452ddc1042af47a4648348e7e323))
* **vc-gallery:** handle undefined images prop on mount ([4338c8e](https://github.com/VirtoCommerce/vc-shell/commit/4338c8ea035e37b3eba8a909310b6146948a3527))


### Code Refactoring

* remove legacy dynamic views module ([3a673a8](https://github.com/VirtoCommerce/vc-shell/commit/3a673a89156c36ef1e1908f80e012104f36fa54e))


### BREAKING CHANGES

* removed createDynamicAppModule,
useDetailsFactory, useListFactory, DynamicBladeList,
DynamicBladeForm, DynamicModuleRegistryState and
all dynamic schema types from the framework.
# [2.0.0-alpha.6](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2026-03-10)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.5](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2026-03-10)

### Code Refactoring

- extract blade router guard into standalone utility ([7e2a590](https://github.com/VirtoCommerce/vc-shell/commit/7e2a5900d521131e578205b31be734d975b72ff3))

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.4](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2026-03-10)

### Features

- add blade catch-all route handling in VcBladeNavigationComponent ([cb7920a](https://github.com/VirtoCommerce/vc-shell/commit/cb7920a3563d9224a160c00f728b5e5a84277f7f))

# [2.0.0-alpha.3](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2026-03-10)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.8...v2.0.0-alpha.2) (2026-03-10)

### Code Refactoring

- remove unused components and update package resolutions ([26ff398](https://github.com/VirtoCommerce/vc-shell/commit/26ff398739d75b23f7f700542920a117e0022ff3))

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2026-03-10)

**Note:** Version bump only for package @vc-shell/framework

# [2.0.0-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.8...v2.0.0-alpha.0) (2026-03-10)

### Features

- **a11y:** add ARIA attributes to blades, popups, and blade navigation ([12454c6](https://github.com/VirtoCommerce/vc-shell/commit/12454c628683d36fba9efea6e24224d1e0a029e4))
- **ai-agent:** add embedded mode support with iframe messaging ([d605a2d](https://github.com/VirtoCommerce/vc-shell/commit/d605a2dedaf223718a0dccd6eaad94fbeddae1c0))
- **core:** add Module Federation support and remove legacy UMD globals ([18c4026](https://github.com/VirtoCommerce/vc-shell/commit/18c402677846dfff8f077dccb7a782fcf5a778e0))
- **blade-nav:** enforce workspace permissions in BladeStack ([edfe789](https://github.com/VirtoCommerce/vc-shell/commit/edfe7898828eaf1c2fde5abc00a7c13b1bdc9a2f))
- add Lato font family ([8384890](https://github.com/VirtoCommerce/vc-shell/commit/83848902a6b83122663070e9056863d85ae7f11f))
- **vc-menu:** add loading prop with skeleton placeholders ([d0bb25c](https://github.com/VirtoCommerce/vc-shell/commit/d0bb25c345c977fbb32e1492c74db4bfdcc94413))
- **vc-menu-group:** add section variant, grid animation, chevron transition ([c5f04f1](https://github.com/VirtoCommerce/vc-shell/commit/c5f04f1fd2f0df3bcf3749feb8cbb32e1295eca8))
- **vc-menu:** add loading and variant to type definitions ([4d64610](https://github.com/VirtoCommerce/vc-shell/commit/4d646106ef86e74bf9761ebbb461b8200c749b64))

### Bug Fixes

- **ui:** improve collapsed sidebar UX and embedded AI agent context ([c87e16d](https://github.com/VirtoCommerce/vc-shell/commit/c87e16df0b70069f919ea20676f3aa3b66d447d9))
- **shell-nav:** logo click navigates to main route without clearing stack ([f9f8f78](https://github.com/VirtoCommerce/vc-shell/commit/f9f8f785153bc0e4027f4553fce7c070ea43aa14))
- **shell-nav:** openRoot no longer clears blade stack ([547ae53](https://github.com/VirtoCommerce/vc-shell/commit/547ae5363b7b96d30cc2ad65fc9ec97191116f26))
- **vc-menu:** move font and padding to app level, add activeItemId ([3018007](https://github.com/VirtoCommerce/vc-shell/commit/30180073b684ebd5c6f77df62fde1bd740b32720))
- **notifications:** fix toast width, centering, expand/collapse UX ([a5a5423](https://github.com/VirtoCommerce/vc-shell/commit/a5a54239ec9e3b3ebe897a25fb0657397d123fdb))

### Documentation

- **vc-menu:** update stories with sections, nesting, loading, badges ([4426976](https://github.com/VirtoCommerce/vc-shell/commit/44269767f013f769bb6f4ae4e8362075e93ba9f1))

### Styles

- **vc-menu-item:** update design tokens to match Figma mockup ([0c634cf](https://github.com/VirtoCommerce/vc-shell/commit/0c634cf5cef63201d264b36b7d880adfc07175a8))

### Code Refactoring

- **table:** extract orchestration logic into useDataTableOrchestrator ([86e946e](https://github.com/VirtoCommerce/vc-shell/commit/86e946e559749dc53d71e7fb7da52471ece0ec3c))
- **navigation:** improve blade stack management and extension points ([6817743](https://github.com/VirtoCommerce/vc-shell/commit/6817743aa38efed0c9d98496c8adaa032a458548))
- **ui:** standardize component prop/emit types and remove any usage ([a7a587a](https://github.com/VirtoCommerce/vc-shell/commit/a7a587a5848dbb9acbfce6d9235e4b0e196b4a18))
- **core:** standardize composable return types with \*Return naming convention ([f84452b](https://github.com/VirtoCommerce/vc-shell/commit/f84452bc23d523bdc252d70f2e6d22a3b6fd1d07))
- **loader-mf:** clarify route re-resolution happens after module installation ([6b7bbd3](https://github.com/VirtoCommerce/vc-shell/commit/6b7bbd3d732c6c8f017c016013dd8004cc7f6dcb))
- **loader-mf:** consume SHARED_DEP_NAMES from shared-deps.ts, fix stale comment ([b2eb9f8](https://github.com/VirtoCommerce/vc-shell/commit/b2eb9f829204c636bb214962ea6f38cec79b2af2))
- **vc-menu:** rework skeleton and migrate main-menu to VcMenu ([5066677](https://github.com/VirtoCommerce/vc-shell/commit/50666775cb8e2d7f8f2bfa1078aa602482e64c52))
- enhance VcDataTable and related components for improved accessibility and styling ([4cc8ce2](https://github.com/VirtoCommerce/vc-shell/commit/4cc8ce2d0e721e0d574f68e8ca0d829533fc1d90))
- replace native checkbox in TableCheckbox with VcCheckbox ([e0a0be2](https://github.com/VirtoCommerce/vc-shell/commit/e0a0be282d53b4a42fbde0f2e99f7a842714dc0a))
- replace native buttons in table components with VcButton ([5ec395e](https://github.com/VirtoCommerce/vc-shell/commit/5ec395e163eb4d08240f513ee0fda93ce5e829e7))

### Tests

- add unit and accessibility tests across framework ([59086a9](https://github.com/VirtoCommerce/vc-shell/commit/59086a90690a13bfb186685bc423b73cfb406dc8))

## [1.2.4-beta.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.7...v1.2.4-beta.8) (2026-03-04)

### Code Refactoring

- improve code readability and component properties in VcDataTable ([08a822f](https://github.com/VirtoCommerce/vc-shell/commit/08a822f2525687ad4987e242f3a99774f946a826))
- streamline component exports and remove async component definitions ([fb1d76c](https://github.com/VirtoCommerce/vc-shell/commit/fb1d76c9ac8a1974472e1c43ab3c09d41a0b5ee3))

**Note:** Version bump only for package @vc-shell/framework

## [1.2.4-beta.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.6...v1.2.4-beta.7) (2026-03-04)

**Note:** Version bump only for package @vc-shell/framework

## [1.2.4-beta.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.5...v1.2.4-beta.6) (2026-03-04)

### Features

- **vc-data-table:** refactor table empty and not-found states with new `TableStateConfig` props, enhance `TableEmpty` component, and improve `formatDate` utility to handle invalid dates ([32283c5](https://github.com/VirtoCommerce/vc-shell/commit/32283c5c715d1742c8ffb395de5dd689a27f0437))
- **storybook:** add auth page stories for Login, ForgotPassword, ResetPassword, ChangePassword, Invite ([1c1940f](https://github.com/VirtoCommerce/vc-shell/commit/1c1940f50b5a366549012cc4a81ed85797110b4a))
- **vc-table:** add empty and not-found state storybook stories ([753f703](https://github.com/VirtoCommerce/vc-shell/commit/753f703a9d4b7bfd3b2b6e5adc256792df69d254))
- **vc-table:** add ActiveItemHighlight storybook story ([6e36b12](https://github.com/VirtoCommerce/vc-shell/commit/6e36b1240d30ab53603a52ccbc1f1d9db38671f3))
- **vc-table:** wire activeItemId into VcDataTable for row highlighting ([87f0b78](https://github.com/VirtoCommerce/vc-shell/commit/87f0b789ffbc64b008af491ac9d928e722dcafe3))
- **vc-table:** add activeItemId prop and emit to BaseVcDataTable ([033cada](https://github.com/VirtoCommerce/vc-shell/commit/033cada35d31a48b55cbc57e29a116753b4a111b))
- **vc-table:** add activeItemId to VcDataTableProps type ([aa18ec7](https://github.com/VirtoCommerce/vc-shell/commit/aa18ec7e112ee4709ef877e2084a7bd087294d5a))
- **theme:** add global overlay, shadow, surface, and glass design tokens ([3509103](https://github.com/VirtoCommerce/vc-shell/commit/3509103ba47172ce8201c491934ebe79dddb5a26))

### Bug Fixes

- resolve TypeScript build errors in storybook helpers and VcDataTable slots ([24fc068](https://github.com/VirtoCommerce/vc-shell/commit/24fc0687bc92f3dfd7cebd2a1f67a6a90330e516))
- **core data-fns:** improve `toDate` utility to validate Date objects ([302a5e9](https://github.com/VirtoCommerce/vc-shell/commit/302a5e924cc30d290f3cfb22b03ace93113f73fc))
- **vc-select:** tone down no-options empty state text styling ([37a35e9](https://github.com/VirtoCommerce/vc-shell/commit/37a35e96d466c221fe5e0e8a50179f76ae98b204))
- **vc-table:** separate active row highlight from checkbox selection ([55d26b4](https://github.com/VirtoCommerce/vc-shell/commit/55d26b455d7e01ca07d53a0350201d163050e0aa))
- **vc-table:** consistent null-guarding in handleRowClick activeItemId toggle ([acb5479](https://github.com/VirtoCommerce/vc-shell/commit/acb5479b1d960f777da703c75006361ba43b09cb))

### Code Refactoring

- **user-info:** update avatar fallback and typography to match new design ([adac87c](https://github.com/VirtoCommerce/vc-shell/commit/adac87ca9d8dab841885a21d20c6a1fac5b5d662))
- **vc-table:** delegate row highlighting from VcTableAdapter to VcDataTable activeItemId ([2e82f83](https://github.com/VirtoCommerce/vc-shell/commit/2e82f8337463a7ac16702928e83890f07a841eaa))
- **vc-app-menu:** wire overlay to global --overlay-bg token ([478c3f7](https://github.com/VirtoCommerce/vc-shell/commit/478c3f7c46b22fe37c7e06551c4fb8dd03ab7016))
- **vc-popup:** wire overlay and shadow to global design tokens ([175b14e](https://github.com/VirtoCommerce/vc-shell/commit/175b14ee53b99ba4a7a9d79517fd6d76cf4440a8))
- **toolbar-mobile:** use global design tokens for overlay, shadow, glass ([8e54b09](https://github.com/VirtoCommerce/vc-shell/commit/8e54b098ef95b05fbf15fe786ac88f1493ccbd82))
- **vc-sidebar:** use global design tokens for overlay, shadow, glass ([4522c3c](https://github.com/VirtoCommerce/vc-shell/commit/4522c3c23e4096546ae430ce7c62330ffab29fdd))

## [1.2.4-beta.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.4...v1.2.4-beta.5) (2026-03-04)

### Features

- **modularity:** signal module load completion via injection keys ([9f9e0ae](https://github.com/VirtoCommerce/vc-shell/commit/9f9e0aec5174579e7ba75f19984fbdac8cb7e549))
- **vc-table:** add column-aware skeleton rows for initial loading state ([297606d](https://github.com/VirtoCommerce/vc-shell/commit/297606d2027aa0e6c829ad4ba0c378df0ec946ed))
- **vc-blade:** replace spinner overlay with skeleton loading placeholders ([5eda1fe](https://github.com/VirtoCommerce/vc-shell/commit/5eda1fe1506ca2aebc3736c63f42015d11e53960))
- **vc-skeleton:** add circle and block shape variants with configurable dimensions ([64eaa92](https://github.com/VirtoCommerce/vc-shell/commit/64eaa92c5a853f79f7f8602c2723c53b5e9f1a28))
- **auth:** parallelize getCurrentUser and getAccessToken in loadUser() ([325cced](https://github.com/VirtoCommerce/vc-shell/commit/325cced26e33e15861c3203d7a9b99183c0fa057))
- **perf:** defer AppInsights SDK and SignalR connection to post-paint in framework install ([c4ebb45](https://github.com/VirtoCommerce/vc-shell/commit/c4ebb45d0f15a0e7eab3addae8e32f16f9e1c81b))
- **signalr:** add mountComplete guard to SignalR plugin and export notifyMountComplete ([a89b62b](https://github.com/VirtoCommerce/vc-shell/commit/a89b62b82c10630cade2558587c8690a46171e78))
- **vc-app:** add sidebar menu batch reveal to VcAppMenu.vue ([5f37762](https://github.com/VirtoCommerce/vc-shell/commit/5f3776225fea463a13652a15c3e564760049b3aa))
- **vc-app:** add workspace loading gate and error state to vc-app.vue ([842c0c5](https://github.com/VirtoCommerce/vc-shell/commit/842c0c5b14150aa930e8bc9127e2eaf9ac740a37))
- **modularity:** add ModulesReadyKey and ModulesLoadErrorKey injection keys ([bafd2b0](https://github.com/VirtoCommerce/vc-shell/commit/bafd2b0fa9385ec07b89b6f1e75b7babfb6fffa6))
- **perf:** add performance marks to modularity loader ([59eadf7](https://github.com/VirtoCommerce/vc-shell/commit/59eadf7294be177d29324519e8108439aba59ba7))
- **perf:** install web-vitals and create useWebVitals composable ([b0ba458](https://github.com/VirtoCommerce/vc-shell/commit/b0ba458e9e9a08685d306e1bc307c459a5716d5e))
- **vc-app:** add tabbed Menu/Hub switcher with swipe gestures in mobile sidebar ([126897a](https://github.com/VirtoCommerce/vc-shell/commit/126897ae90100a4ae93df24fcf684f587498d2b6))
- **vc-loading:** replace dots loader with bar sweep and add instant preloader ([019e8d6](https://github.com/VirtoCommerce/vc-shell/commit/019e8d6fb5736f766bdba2841c3b5cf7f00b3b77))
- **global-filters:** use VcSidebar bottom sheet on mobile ([6e4a090](https://github.com/VirtoCommerce/vc-shell/commit/6e4a0903c7b41d95fc4044eb326f3483e110a240))
- **vc-toast:** enhance toast component with stacking and two-phase dismissal animations ([cc2b4fb](https://github.com/VirtoCommerce/vc-shell/commit/cc2b4fb89b151a378c3e58f3c46adc5d208b767d))
- **login:** introduce SSO-only login page mode with conditional form rendering and enhanced sign-in error message parsing from API responses ([6fec3fb](https://github.com/VirtoCommerce/vc-shell/commit/6fec3fb025c710e7022ed1c8637ea1a59fb9831d))
- **menu-service:** add removeRegisteredMenuItem for bus-level item removal ([cb587b8](https://github.com/VirtoCommerce/vc-shell/commit/cb587b849c31e1cd6b6d99c82ff8e22261d6074a))
- add date utility module (locale resolver, format converter, wrappers) ([ee17b24](https://github.com/VirtoCommerce/vc-shell/commit/ee17b248f2dca17b9936b719ce2dc9a916c722de))
- **vc-gallery:** redesign preview modal with light theme and polished UI ([8de2fdc](https://github.com/VirtoCommerce/vc-shell/commit/8de2fdc64b49dab99e691b5b419d5b3510c47b21))
- **vc-banner:** refactor VcBanner component with enhanced styling and add Storybook documentation ([b36d383](https://github.com/VirtoCommerce/vc-shell/commit/b36d38335783a7664d703231330ebcd475955ea9))
- **vc-image-upload:** add single-image upload component New VcImageUpload for avatar/logo use-cases, extracted from gallery's variant="file-upload" mode. Supports preview, remove, validation rules. Legacy gallery shim renders VcImageUpload when variant="file-upload". ([0fb3e12](https://github.com/VirtoCommerce/vc-shell/commit/0fb3e12c1ec4936bf7dcf003311aec52c6425c0d))
- **vc-gallery:** redesign with CSS Grid, slide-up tray and dark preview Rewrite gallery layout using CSS Grid with responsive auto-fill/minmax and semantic size presets (sm/md/lg). Redesign tile hover with slide-up frosted-glass action tray, add skeleton shimmer loading states, dark preview lightbox with crossfade transitions. Old props deprecated with runtime warnings. Remove gallery-specific variant from VcFileUpload. ([c62d727](https://github.com/VirtoCommerce/vc-shell/commit/c62d727a534528d11ffa6e2762dba371b759b2ec))
- **vc-gallery:** extract composables with unit tests Extract reorder, upload, preview, and image-loading logic from monolithic vc-gallery.vue into dedicated composables for better testability and reuse. ([dc52944](https://github.com/VirtoCommerce/vc-shell/commit/dc52944ec9e5a2972571422d5cafeb84abab638b))
- **ui:** UX polish and export normalization - VcCheckbox: add check-out exit animation via <Transition> wrapper (scale-down + fade with asymmetric 60% faster exit timing) - Blade slot: add slide-in transition (opacity + translateX) with appear for new blade opening - VcPaginator, VcInputDropdown: remove duplicate default exports, keep only named exports for consistency ([931e1a1](https://github.com/VirtoCommerce/vc-shell/commit/931e1a1b423d0b4470600369afa8dab1980889dd))
- **core:** add offline guard and 30s timeout to fetch interceptor API requests (/api/\*) now fail fast with a friendly error when the browser is offline and abort after 30s timeout. Non-API requests bypass these guards entirely. External AbortSignal composition is preserved so component-level cancellation still works. ([12c7519](https://github.com/VirtoCommerce/vc-shell/commit/12c75193b96ae5b3abf9564fe5066196685ec830))
- **core:** add useConnectionStatus composable for network awareness Singleton composable backed by VueUse useNetwork(). On offline transition: shows persistent warning notification, adds html.vc-offline CSS class. On online transition: removes notification and CSS class. Initialized in framework install() via app.runWithContext(). ([77246b1](https://github.com/VirtoCommerce/vc-shell/commit/77246b1c1509e611cda1dda9589d5e14a1431e62))
- **core:** add global error handlers for unhandled errors and rejections Adds setupGlobalErrorHandlers plugin that chains into app.config.errorHandler and registers window-level listeners for unhandledrejection and error events. Includes time-based deduplication (3s window) and idempotency guard to prevent duplicate listeners on repeated framework installs. Wired into framework install() after setupApplicationInsights. ([3c27dcf](https://github.com/VirtoCommerce/vc-shell/commit/3c27dcf778a4910507c74646086390bc9673d931))
- **shared:** wire ErrorInterceptor to blade.error and cancel deferred toasts ErrorInterceptor now injects BladeDescriptorKey + BladeStackKey to propagate caught errors to blade.error for red banner display. When catching an error, it also cancels any pending useAsync deferred toast via cancelPendingErrorNotification, preventing duplicate banner+toast for load errors. Degrades gracefully outside blade context. ([d7f02f6](https://github.com/VirtoCommerce/vc-shell/commit/d7f02f61fdc980dd32afc2b1ad9a228900dee78c))
- **core:** add error ref and deferred notification to useAsync useAsync now returns an `error` ref (DisplayableError | null) that is set on failure and cleared on next invocation. Notifications are enabled by default but deferred via setTimeout(0) so ErrorInterceptor can cancel them when it catches the same error for blade banner display. This prevents duplicate toast+banner for load errors while still showing toasts for save/delete errors caught by module try/catch. ([82e0167](https://github.com/VirtoCommerce/vc-shell/commit/82e01675223339982ea9292588e92fc594410a1d))
- **core:** export parseError/DisplayableError and add pending notification utility Exports parseError and DisplayableError from the utilities barrel so they can be consumed by useAsync. Adds a shared WeakMap-based utility (pendingErrorNotifications) that decouples useAsync deferred toasts from ErrorInterceptor's cancellation logic. ([f710aab](https://github.com/VirtoCommerce/vc-shell/commit/f710aab3a4b0489c3e3b294f26d7e2e76881e0f7))
- **shell:** unify notification bell with AppHub pattern - Bell icon transitions to X when notifications panel is open (same rotation animation as burger menu) - Remove title/header from notification VcDropdownPanel (consistent with AppHub's headerless popover) - Remove unread red dot from burger button (notifications indicator now belongs to bell only) ([6ac1547](https://github.com/VirtoCommerce/vc-shell/commit/6ac1547824b0132043e025d01a94c13d921250e1))
- **shell:** remove notifications widget from AppHub Notifications are now accessed via the standalone bell icon in the sidebar header. Remove widget registration, auto-open on unread logic, and clean up unused imports. ([5b9811f](https://github.com/VirtoCommerce/vc-shell/commit/5b9811f942125c7085ad958128cd14917760a8fd))
- **shell:** wire notification bell popover in DesktopLayout Add VcDropdownPanel with NotificationDropdown anchored to the bell button. Implements mutual exclusion: opening bell closes AppHub and vice versa. Closes on route change. ([c0fccca](https://github.com/VirtoCommerce/vc-shell/commit/c0fcccae35d69bf0b722616eba3fba9cf4a17ef0))
- **shell:** add notification bell button to SidebarHeader Add a bell icon button between logo and burger menu in the sidebar header. Visible when sidebar is expanded, shows unread indicator dot. ([02fbe5e](https://github.com/VirtoCommerce/vc-shell/commit/02fbe5e566f629bb011ebddfcf4b6eeb2730ce16))

### Bug Fixes

- **vc-table:** relax generic constraint from Record<string, unknown> to Record<string, any> ([615733b](https://github.com/VirtoCommerce/vc-shell/commit/615733b77df77b0f6be55d7677089909b0c5e208))
- **teleport:** remove defer attribute that prevented rendering inside skeleton-guarded blades ([5be89d3](https://github.com/VirtoCommerce/vc-shell/commit/5be89d34165862939fcb44d5d7b7f3fed1cb77f1))
- **filters:** call onFilterChange after every useFilterState mutation ([208a9a0](https://github.com/VirtoCommerce/vc-shell/commit/208a9a0d8af6b11b89441528b6f7bc0ebc46c012))
- **vc-app:** move notification badge from logo to mobile bell button ([3e95e55](https://github.com/VirtoCommerce/vc-shell/commit/3e95e55b077c0c00a181cd0c5e182f9eb358ecd2))
- **vc-app:** show notification bell on mobile and use VcSidebar bottom sheet ([aab267e](https://github.com/VirtoCommerce/vc-shell/commit/aab267e5304c4288189205d90e29ed44628fd395))
- **vc-app:** correct BEM selector for mobile flex-col on main-content ([791bc59](https://github.com/VirtoCommerce/vc-shell/commit/791bc59fde97a190628addc67b88a28668780f2e))
- **vc-dropdown-panel:** prevent panel close when clicking inside child VcSelect dropdown ([d82513a](https://github.com/VirtoCommerce/vc-shell/commit/d82513a873aaa3af1424d934091d231e5e1b38b2))
- **vc-blade:** fix mobile back button visibility and breadcrumbs overflow in header ([04f79f3](https://github.com/VirtoCommerce/vc-shell/commit/04f79f3e21b9d808a41a427acfef6c6c9d47b89d))
- **vc-widget:** suppress duplicate hover state when widgets render inside dropdown ([9557328](https://github.com/VirtoCommerce/vc-shell/commit/9557328a3b71218f8ca3a4bc9831152f55d887fa))
- prevent false modification detections by treating empty values as equivalent and avoid emitting editor updates when content is set programmatically ([8af41de](https://github.com/VirtoCommerce/vc-shell/commit/8af41de42e08c7265fd6ddfb20de743cb75f4fe5))
- **dynamic-properties:** handle missing localizedValues in multilanguage dictionary select ([b1a0445](https://github.com/VirtoCommerce/vc-shell/commit/b1a0445e55b9672d98b1c4edb2d0a7b57465dda4))
- **vc-table:** use correct injection key for row actions hover visibility ([b750c3f](https://github.com/VirtoCommerce/vc-shell/commit/b750c3fc06ff36b9379d3e5eb6ddd6ff9019c978))
- **ui:** collapse scroll arrow space when arrows are hidden ([b266287](https://github.com/VirtoCommerce/vc-shell/commit/b2662876698f64941b0b5ceb1ca02e48e5eb7fd2))
- **login:** remove .prevent modifier on VcForm custom submit event ([bb7aef8](https://github.com/VirtoCommerce/vc-shell/commit/bb7aef8494787fa3a32ec8b1813c9eda841de933))
- **blade-navigation:** remove slide transition that caused visual glitch on blade switch ([06be549](https://github.com/VirtoCommerce/vc-shell/commit/06be549f2a4e488fc415d80c8284912317a21f36))
- **build:** suppress empty chunk, mixed import, and date-fns locale warnings ([d973302](https://github.com/VirtoCommerce/vc-shell/commit/d97330264de9f0f03474d919fcee971c6864989c))
- **vc-gallery:** fix review findings across gallery components ([5bf9fb5](https://github.com/VirtoCommerce/vc-shell/commit/5bf9fb518f10b93b29c9922b69e951dba7a50812))
- **vc-gallery:** restrict drag to handle and improve upload UX ([5c6bf75](https://github.com/VirtoCommerce/vc-shell/commit/5c6bf752480be95d97bd8cc7f3137a2dd3ae870e))
- **vc-table:** align row-action emit typing for mobile actions ([bc42336](https://github.com/VirtoCommerce/vc-shell/commit/bc42336cc6df48181ae21e1d1e7dc7ca15d64bb1))
- **vc-gallery:** fix cross-row drag reorder in CSS Grid layout ([2407d2d](https://github.com/VirtoCommerce/vc-shell/commit/2407d2db0ac02bf4d1042d7e3a487336c68b6677))
- **vc-gallery:** fix stories interactivity and upload tile layout ([30f0a02](https://github.com/VirtoCommerce/vc-shell/commit/30f0a021d8b504e48790b7bf888ddf9bb4545f6f))
- **vc-table:** optimize global listeners and filter state callback ([94b73a0](https://github.com/VirtoCommerce/vc-shell/commit/94b73a0f7521c983863219ab47d9a6713d67ae70))
- **ui:** CSS consistency and tree-shaking improvements - VcDropdown: replace hardcoded focus ring with CSS custom properties - Table components: remove wrong Tailwind blue hex fallbacks (~31 instances across DataTableHeader, ColumnFilter, TableSelectAllBar, TableGroupRow, GlobalFiltersButton, TableRowActions, TableColumnSwitcher, TableHead, TableRow, TableActions) - VcLink, VcEditor: replace rgba(59,130,246,0.3) with color-mix(var(--primary-500)) - Replace wholesale lodash-es imports with selective imports in vc-dynamic-property, DataTableCellRenderer, MobileCellRenderer ([a459728](https://github.com/VirtoCommerce/vc-shell/commit/a459728462063138fe7227c1080adeb94a9bac95))
- **ui:** accessibility fixes - Add 44px touch target via ::after pseudo-element on VcButton (WCAG 2.5.8) - Replace <div> with semantic <button>/<span> in VcBreadcrumbsItem - Wrap VcSelect chip remove icon in accessible <button> with aria-label - Add aria-pressed for VcButton selected state with tests - Consolidate VcInput password toggle into single button ([97fb917](https://github.com/VirtoCommerce/vc-shell/commit/97fb917d8c8f6003e1074379d35d9e2397d237e6))
- **shared:** prevent duplicate toast+banner on blade load errors Two root causes fixed: 1. WeakMap reference mismatch: useAsync stores original Error in WeakMap but useErrorHandler wraps it via parseError() → DisplayableError. cancelPendingErrorNotification now falls back to originalError lookup. 2. Error propagation: ErrorInterceptor inside a blade context now stops error propagation (capture=true), preventing the global error handler from showing a duplicate toast for errors already shown as blade banner. ([89a021c](https://github.com/VirtoCommerce/vc-shell/commit/89a021c63944c3ac4e9ecc2c0ce8d90ffde8339f))
- **core:** resolve circular dependencies via lazy notification imports useAsync and pendingErrorNotifications had top-level imports of @shared/components/notifications/core/notification which transitively pulled in @ui/components → @core/composables, creating circular deps. Replace with dynamic imports that resolve lazily at call time. Remove barrel re-exports of pendingErrorNotifications and useConnectionStatus that also triggered circular chains. Update useAsync tests to use vi.runAllTimersAsync() for microtask flush after dynamic import. ([16a99ec](https://github.com/VirtoCommerce/vc-shell/commit/16a99ec8554ffd989e99b2e3c71b2d22ef56d7de))
- **table:** disable FLIP animation on cells during container resize TransitionGroup with name="vc-table-col-swap" in TableRow applied FLIP move animations on every re-render where cell positions changed, not just during column reorder. When blades narrow, flex cells shift and any coinciding Vue re-render triggered a 250ms sliding animation, causing visible horizontal "jumping" of rows. Conditionally enable the TransitionGroup name only during actual column drag-and-drop reorder via provided IsColumnReorderingKey. ([40eee44](https://github.com/VirtoCommerce/vc-shell/commit/40eee44eabd287256dffa414b10169665597b38c))
- **shell:** normalize icon paths in AppHub Add normalizeIconUrl — if iconUrl does not start with / or http, a leading slash is prepended so the path resolves from the domain root. Fixes display of application icons with relative paths (e.g. Modules/…). ([c3e2b40](https://github.com/VirtoCommerce/vc-shell/commit/c3e2b400c5d97fc4bbc7e8b7d3482cb582d82a2f))
- **shell:** group bell and burger icons in sidebar header toolbar Wrap notification bell, actions slot, and burger button in a shared toolbar container with gap-3 spacing. Prevents justify-between from spreading icons across the full header width. ([33d350a](https://github.com/VirtoCommerce/vc-shell/commit/33d350a141e928add771650125d74755f81feca9))
- **shell:** update tests and cleanup for notification bell feature - Remove widget registration test (widget no longer registered) - Fix mobile button test to use correct ID "notifications" - Clean up unused mockRegisterWidget and AppBarWidgetServiceKey - Remove unused MenuBurgerIcon import from SidebarHeader - Add aria-label to notification bell button ([ab75831](https://github.com/VirtoCommerce/vc-shell/commit/ab758316b982c5ac137285cb6a1c1cb1f4437517))
- **ui:** improve accessibility, type safety, and code quality across UI kit - Add aria-required to useFormField and all 9 form components (WCAG 1.3.1) - Add aria-label to VcPopup close button, use currentColor for SVG fill - Add html-for to VcLabel in VcInput, VcTextarea, VcColorInput, VcCheckbox, VcSwitch - Standardize error display guards to `invalid && errorMessage` in VcDatePicker, VcColorInput, VcCheckbox, VcRadioButton (fixes VcDatePicker never showing errors) - Replace div-based clear/toggle buttons with semantic <button> in VcInput - Add defineSlots to VcSwitch and VcRadioButton for slot type inference - Remove dead "no-option" slot from VcSelect defineSlots - Add focus return to trigger on Escape in VcSelect and VcMultivalue (WCAG 2.4.3) - Deprecate VcSwitch tooltip prop with dev-only console.warn - Add missing :error="true" on VcHint in SelectTrigger and VcMultivalue - Extend IFormFieldProps in VcInputCurrency (removes 7 duplicate prop declarations) - Fix useKeyboardNavigation double-registration when initKeyboardNavigation is called after onMounted auto-attach - Break circular imports in vc-blade by using direct component import paths instead of @ui/components barrel - Delete unused useDataTableOrchestrator.ts (516 lines dead code) ([f212649](https://github.com/VirtoCommerce/vc-shell/commit/f212649f80f6abe5d37a065bbf0663a948029361))

### Performance Improvements

- **dashboard:** lazy-load chart components and GridstackDashboard ([4f628dc](https://github.com/VirtoCommerce/vc-shell/commit/4f628dc1d172c6a888330bb70e373b835bd35153))

### Documentation

- complete project research for startup performance optimization ([8f73cb0](https://github.com/VirtoCommerce/vc-shell/commit/8f73cb08a0dd591339ff32611e052d50c95bb906))

### Styles

- **menu-service:** type-only Component import, remove redundant title assignment ([ca29bb2](https://github.com/VirtoCommerce/vc-shell/commit/ca29bb29e504219c82e7931038f9b0cdbe8cf656))
- add visual desaturation hint when browser is offline Applies 30% grayscale filter to .vc-app when html.vc-offline class is present. The class is toggled by useConnectionStatus composable. ([7153339](https://github.com/VirtoCommerce/vc-shell/commit/71533398596a22d7d959f32c1df67942558eb617))

### Code Refactoring

- **blade-navigation:** simplify blade-slot rendering and URL restoration ([74a490e](https://github.com/VirtoCommerce/vc-shell/commit/74a490e50ddc053e02dd74c872aad1026d516c39))
- replace barrel imports in dynamic module ([c31e9a1](https://github.com/VirtoCommerce/vc-shell/commit/c31e9a192d8ce7001ec3e4c65ba881a1e90b6575))
- replace @shared and @core/services barrels with direct paths ([2d46d59](https://github.com/VirtoCommerce/vc-shell/commit/2d46d593283a74bb5b4ff569eb43b2851df7ae1a))
- replace @ui/components barrel with direct component paths ([9dda97c](https://github.com/VirtoCommerce/vc-shell/commit/9dda97ce5a09129ad13b27109949fe4c25f54e22))
- replace @core/composables barrel with direct paths ([e9c896e](https://github.com/VirtoCommerce/vc-shell/commit/e9c896efb4a85517a3e587b3fd1bc3954b1a41fa))
- convert @core/types imports to import type across framework ([d8f29d4](https://github.com/VirtoCommerce/vc-shell/commit/d8f29d4de6b10235e329a1d3b32b006300125bcd))
- replace barrel imports with direct paths in core ([2f417c6](https://github.com/VirtoCommerce/vc-shell/commit/2f417c6fe015935c31a574828c23549eb820bbc9))
- convert remaining core←shared imports to import type ([94a168d](https://github.com/VirtoCommerce/vc-shell/commit/94a168daa4de2672ad2522dd0d5b765e404a7e6d))
- break ui/types → ui/components cycle with import type ([33b186d](https://github.com/VirtoCommerce/vc-shell/commit/33b186d307cafec3b8e27b5d2e4f06d4764d241f))
- break core/types ↔ blade-navigation/types cycle with import type ([7b85761](https://github.com/VirtoCommerce/vc-shell/commit/7b857611365c770f28bd06581388564f77dd3009))
- **multilanguage-selector:** align visual style with UI kit conventions ([d427969](https://github.com/VirtoCommerce/vc-shell/commit/d427969b5cbf787b14cdf1cf7ec8af6d9e1840ed))
- **notifications:** remove pending queue and add clear-all button ([d55ad47](https://github.com/VirtoCommerce/vc-shell/commit/d55ad470a8a849107b86bb5b079ab684d8315f30))
- **menu-service:** pure buildMenuTree, immutable groups, remove VueUse ([384143f](https://github.com/VirtoCommerce/vc-shell/commit/384143f71e34210c4cd3e15512a28e59b87c906b))
- **menu-service:** single-source identity, remove auto-id generation ([7037b05](https://github.com/VirtoCommerce/vc-shell/commit/7037b05c90dbaf7e90ed5c630ed1f3fddba86f80))
- migrate from moment.js to date-fns ([1777fea](https://github.com/VirtoCommerce/vc-shell/commit/1777fea2b5cf1ab9671eeeed7c5a7a4f65c386d9))
- remove moment plugin and window.moment global ([d899beb](https://github.com/VirtoCommerce/vc-shell/commit/d899beb2cfe675f84bad8e64550f3f0ee800aabf))
- replace moment with date-fns in framework components ([090aa2f](https://github.com/VirtoCommerce/vc-shell/commit/090aa2fa77b8cce98f4a14b14bc7dcb1243e22c1))
- adjust unread accent positioning by introducing a logo-specific modifier class ([4cee7f1](https://github.com/VirtoCommerce/vc-shell/commit/4cee7f169a28aaaf14bfcb71f173ea06a1c11949))
- **vc-image-upload:** redesign preview as gallery-style tile ([a59b93e](https://github.com/VirtoCommerce/vc-shell/commit/a59b93e611fc7b767921d7cb397c90fd435c1b39))
- **vc-popup:** add close reasons, configurable dismiss, and variant support ([a77e349](https://github.com/VirtoCommerce/vc-shell/commit/a77e349ecf2a6a5524b61eea2403cedfef2fa3f7))
- **vc-gallery:** replace line indicator with live-swap FLIP reorder ([34314ce](https://github.com/VirtoCommerce/vc-shell/commit/34314ceec9e48cebe100290b82c53eefb8b632ca))
- **ui:** extract useCollapsible composable from VcAccordionItem ([fcc1be4](https://github.com/VirtoCommerce/vc-shell/commit/fcc1be43afeda42f60e96068bf4b9ece960f6148))
- **ui:** redesign BladeStatusBanners with inline expand details ([27cb2cf](https://github.com/VirtoCommerce/vc-shell/commit/27cb2cfc25c5bbde553800337bd3e06a506dd28d))
- **ui:** remove VcPaginator component exports and source ([caf2cd9](https://github.com/VirtoCommerce/vc-shell/commit/caf2cd962ff3727b52adb0db8d3d3d9f5e0a0293))
- **ui:** BEM modifier migration from _ to -- Standardize BEM modifier separator across all components: - vc-button, vc-button-group: \_loading/\_text/\_selected etc → --loading/--text/--selected - vc-icon, use-icon: \_size/\_color modifiers → --size/--color - vc-label, vc-container, vc-card, vc-status: all _ modifiers → -- - vc-pagination: **item_current/disabled → **item--current/--disabled - vc-gallery-item: \_readonly/\_hover → --readonly/--hover - vc-app_mobile → vc-app--mobile across 12 files (app, row, blade, toast, date-picker, multivalue, dynamic-blade-form, user-dropdown) ([a3fcdb8](https://github.com/VirtoCommerce/vc-shell/commit/a3fcdb85a5c18bbf46bc7619338ff4fd6a368228))
- **ui:** critical type safety and architecture fixes - Type all 43 VcDataTable emit events with Vue 3.3 tuple syntax - Migrate vc-editor-button from runtime to TypeScript defineProps - Replace string injection key "$filterContext" with typed FilterContextKey Symbol - Fix stray v-if → v-else-if in VcDynamicProperty Color+dictionary branch ([628851b](https://github.com/VirtoCommerce/vc-shell/commit/628851b8807a1b05d40a8097c3c7cd881861022b))
- **ui:** extract shared slide-up transition CSS to global styles Move duplicated .slide-up-\* transition classes from 12 component <style> blocks into framework/assets/styles/index.scss. ([df62fa4](https://github.com/VirtoCommerce/vc-shell/commit/df62fa44b5697b8cf468cc10f74425a58abbd0ff))
- **ui:** standardize BEM modifier separator from \_ to -- Migrate 7 form components to canonical BEM double-dash modifier convention: VcInput, VcSelect, VcTextarea, VcDatePicker, VcColorInput, VcMultivalue, VcRadioButton - Template class bindings: vc-component_modifier → vc-component--modifier - SCSS selectors: &\_modifier → &--modifier - Eliminates visual ambiguity between \_modifier and \_\_element ([1030e3f](https://github.com/VirtoCommerce/vc-shell/commit/1030e3f4c3557c3d8bf04caa5aa969171b71dc7c))
- **ui:** migrate VcFileUpload to useFormField and IFormFieldProps - Extend Props with IFormFieldProps (adds label, tooltip, disabled, required, error, errorMessage) - Use useFormField for ARIA IDs, InputGroup integration, resolved disabled/name - Dual error source: external errorMessage prop takes priority over vee-validate - Add disabled state with CSS modifier and JS guards - Replace barrel imports with direct paths - Remove getCurrentInstance dependency - Add Disabled and WithErrorMessage stories ([17eed7c](https://github.com/VirtoCommerce/vc-shell/commit/17eed7c0c754069d603d897586e9ca64559f49d5))

### Tests

- **auth:** add failing tests for parallelized loadUser() ([0e9b7c6](https://github.com/VirtoCommerce/vc-shell/commit/0e9b7c6b144660597aa17366a1155243908461c5))
- **menu-service:** add VcAppMenu smoke test for items without explicit id ([e9492ae](https://github.com/VirtoCommerce/vc-shell/commit/e9492ae598117965737354a4d05d28d6a43f20ac))
- **menu-service:** add comprehensive identity and deduplication tests ([3b9a738](https://github.com/VirtoCommerce/vc-shell/commit/3b9a738573ad132f1674f254911d66c3add8b8dc))
- **a11y:** add Storybook addon-a11y and axe-core vitest integration - Install @storybook/addon-a11y for interactive accessibility panel in Storybook UI - Add axe-core based toHaveNoViolations custom vitest matcher - Wire addon-a11y/preview annotations into Storybook vitest setup - Add a11y tests for VcButton, VcInput, VcTextarea, VcCheckbox (15 tests) ([57313dc](https://github.com/VirtoCommerce/vc-shell/commit/57313dc5d0803cae5f7bc28fd0fed8af198d3437))
- **ui:** add ARIA propagation tests for VcInput, VcCheckbox, VcButton, VcSelect - 45 new tests covering aria-required, aria-invalid, aria-describedby, aria-labelledby, label association, disabled state, error display - Fix VcInput missing :error="true" on error VcHint (role="alert") - Add coverage thresholds to vitest.config.ts (30% lines, 25% functions, 50% branches) ([188f88f](https://github.com/VirtoCommerce/vc-shell/commit/188f88f918b75214bdae82ae92077bf31d2967c6))

## [1.2.4-beta.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.3...v1.2.4-beta.4) (2026-02-24)

### Features

- **storybook:** enrich VcApp stories with mock data and widgets ([9e3e0db](https://github.com/VirtoCommerce/vc-shell/commit/9e3e0db835f7e84c1a7ca649454cde5cad28cdd2))
- **dynamic-modules:** add hash-based cache busting for module assets ([eb47537](https://github.com/VirtoCommerce/vc-shell/commit/eb475375fad72f4c00016e0e8d9298cdbc44a321))
- **dashboard-charts:** add chart components with Unovis integration ([559917c](https://github.com/VirtoCommerce/vc-shell/commit/559917c1e65e48713555bd8d62c022f10a534af5))

### Bug Fixes

- **app-hub:** improve panel sizing and widget scroll behavior ([72fc8df](https://github.com/VirtoCommerce/vc-shell/commit/72fc8dfc838141eab0734c4dbbc29098ad530707))

### Code Refactoring

- **ui:** standardize focus and error ring styles across form controls ([73932a1](https://github.com/VirtoCommerce/vc-shell/commit/73932a1d2ea36a143e2a7606144b7787e5557363))
- **login:** redesign form layout and update copy ([0206517](https://github.com/VirtoCommerce/vc-shell/commit/02065178c3998081ad88369288a38858c4c79dae))

## [1.2.4-beta.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.2...v1.2.4-beta.3) (2026-02-20)

### Features

- **app-hub:** add App Hub with search, app switcher, and widgets panel ([8a92ecc](https://github.com/VirtoCommerce/vc-shell/commit/8a92ecc10336dde2cef16a99ffa8f9b04c4554ba))
- **dashboard:** redesign widget cards and add new sub-components ([46aecea](https://github.com/VirtoCommerce/vc-shell/commit/46aecea106f6b6b3793fe90bca7d542098206574))

### Documentation

- add architecture docs and shell-features-v2 RFC ([26a568d](https://github.com/VirtoCommerce/vc-shell/commit/26a568d9510248754cf909ef081f947dcb7d1d9e))

### Code Refactoring

- **widgets:** update blade widget service and add WidgetDropdownItem ([06aa737](https://github.com/VirtoCommerce/vc-shell/commit/06aa7373fb53b515dbac06f2fc30b1b19bd24eac))
- configure path aliases and migrate imports ([bfffc3c](https://github.com/VirtoCommerce/vc-shell/commit/bfffc3cbe8029cf875e49941061b582825cad9a6))

## [1.2.4-beta.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.1...v1.2.4-beta.2) (2026-02-16)

### Bug Fixes

- **modularity:** update notification import path ([f2ac212](https://github.com/VirtoCommerce/vc-shell/commit/f2ac212317517c10f0dba7cd97f893741dedf14e))

## [1.2.4-beta.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.4-beta.0...v1.2.4-beta.1) (2026-02-16)

### Code Refactoring

- clean up code and remove redundant lines in useBladeRegistry, vc-button, and vc-link components ([8167a0a](https://github.com/VirtoCommerce/vc-shell/commit/8167a0ac571f392885c744f3e248a4258a99a7c3))

## [1.2.4-beta.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3-beta.1...v1.2.4-beta.0) (2026-02-16)

### Features

- **locales:** add table, toolbar and multivalue translations ([e43be52](https://github.com/VirtoCommerce/vc-shell/commit/e43be52a95545b7f079d9e8dabde53c2e78cd636))
- **shared:** update auth components and menu state management ([e9bf476](https://github.com/VirtoCommerce/vc-shell/commit/e9bf4768ace2a2615d2ce72b1a4c17e38f0a34ed))
- **core:** add module dependency ordering and update framework exports ([81ed54e](https://github.com/VirtoCommerce/vc-shell/commit/81ed54ed571a7f849b51535ea2589404fda72a7d))
- **ui:** add VcDropdownPanel, VcPaginator and shared composables ([ce67f25](https://github.com/VirtoCommerce/vc-shell/commit/ce67f2560afc43810d277081757de8e2b8eff48d))
- **vc-auth-layout:** add VcAuthLayout component for authentication layout ([c9a05a3](https://github.com/VirtoCommerce/vc-shell/commit/c9a05a3481641b3f619097ba6ef91da5529456cc))
- **vc-select:** enhance VcSelect component with new dropdown structure and options handling ([9a9efe5](https://github.com/VirtoCommerce/vc-shell/commit/9a9efe58be6b70861e17bffbd869cd590fa20008))
- **vc-blade:** introduce new Blade components and refactor existing structure ([3bdbbe2](https://github.com/VirtoCommerce/vc-shell/commit/3bdbbe2fcbfc2fbf9f0cff1d0cf851974ba6f1ae))
- **vc-app:** enhance VcApp component with new layout options and mobile actions ([394105c](https://github.com/VirtoCommerce/vc-shell/commit/394105c9c1aed7ffa101afafcb02268b9bcbc6a7))
- **pages:** add ForgotPasswordPage and update ChangePasswordPage ([cfd1874](https://github.com/VirtoCommerce/vc-shell/commit/cfd18749fec952ebaf4ce6df611c4e5ddd9caed5))
- **composables:** enhance toolbar and app bar services with improved injection and cleanup ([b992f6b](https://github.com/VirtoCommerce/vc-shell/commit/b992f6bed2dad0178f465dbd70c6b09995c1c54c))
- **extension-points:** implement new extension point system with defineExtensionPoint and ExtensionPoint component ([34b139c](https://github.com/VirtoCommerce/vc-shell/commit/34b139ccc7e8fee2d6f4ea3d72cbc8586f877489))
- **ui-components:** replace GenericDropdown with VcDropdown across multiple components ([0fb5edc](https://github.com/VirtoCommerce/vc-shell/commit/0fb5edcb26a25c80ba88b0f62eb97f2612d8224e))
- **ui-components:** replace GenericDropdown with VcDropdown and introduce VcSidebar component ([c182200](https://github.com/VirtoCommerce/vc-shell/commit/c182200c32e343db83d7b14b17dae21fbd428ca9))
- **ui-components:** add VcColorInput and VcDatePicker components with storybook examples ([f35b9f1](https://github.com/VirtoCommerce/vc-shell/commit/f35b9f1dd132bca2c2df0535bd9c7e1a54cb4aa5))
- **ui-components:** enhance accessibility and styling for form elements ([a7b1d2c](https://github.com/VirtoCommerce/vc-shell/commit/a7b1d2c8927bee0adf56f758460ba9b1aa8a65f2))
- **draggable-dashboard:** implement GridstackDashboard component and refactor existing dashboard structure ([cd61462](https://github.com/VirtoCommerce/vc-shell/commit/cd614627ae23a9c43a2d51c57815932db0ffd2a3))
- **blade-navigation:** introduce new architecture and migration to useBladeContext API ([9181724](https://github.com/VirtoCommerce/vc-shell/commit/91817249a198a1b076b18f1d6a9f228886bed035))
- **vc-button:** introduce VcButtonGroup component and enhance button functionality ([4c42348](https://github.com/VirtoCommerce/vc-shell/commit/4c4234846f7e0f891fd4b4484720cc6eaf9f4224))
- **menu:** implement badge functionality for menu items ([5f9c798](https://github.com/VirtoCommerce/vc-shell/commit/5f9c798bce1a4cb79a4534537187e8d827ed627a))

### Bug Fixes

- **composables:** implement 3-state sort cycling and fix adaptive items ([484f51f](https://github.com/VirtoCommerce/vc-shell/commit/484f51f31bc76e1178bda09a9fb4765743426d23))
- **ui-components:** improve accessibility and fix type errors ([d874e75](https://github.com/VirtoCommerce/vc-shell/commit/d874e75e57c34124431c817851dfdc210d05dfd3))
- **vc-date-picker:** improve internal value type handling ([7a282a1](https://github.com/VirtoCommerce/vc-shell/commit/7a282a110cf749fbb7ee0f2b1eeb99f1f0fa70c3))

### Code Refactoring

- **shared:** migrate GenericDropdown to VcDropdown and update exports ([dcdbb91](https://github.com/VirtoCommerce/vc-shell/commit/dcdbb916410ecf537343da76d9f60045bf4f6e89))
- **vc-multivalue:** extract composables and sub-components ([2336673](https://github.com/VirtoCommerce/vc-shell/commit/2336673cacd5cfb5d9243393dd074c80fcc9864e))
- **vc-table:** improve type safety and internal component structure ([5e1e410](https://github.com/VirtoCommerce/vc-shell/commit/5e1e410cf025d0c2b83a27dd1855108c1a88415d))
- **vc-container:** remove pull-to-refresh functionality and clean up component ([edda2d4](https://github.com/VirtoCommerce/vc-shell/commit/edda2d46849fc651d2d42e87e55dca879d941c8b))
- **vc-table:** migrate to VcDataTable and enhance API ([3e64a1f](https://github.com/VirtoCommerce/vc-shell/commit/3e64a1ffa49c0dc7aab39463d8310da60cfc5b54))

## [1.2.3-beta.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3...v1.2.3-beta.1) (2026-01-26)

### Features

- enhance AI agent panel with internationalization and UI improvements ([cdf0b7a](https://github.com/VirtoCommerce/vc-shell/commit/cdf0b7af14c02a51ffc261f9bac5c3da7916bf65))
- enhance AI agent context management and configuration ([a98c7ed](https://github.com/VirtoCommerce/vc-shell/commit/a98c7ed2a2b54977f02e620493873ca2abacd47a))
- integrate AI agent plugin into VC-Shell framework ([706f015](https://github.com/VirtoCommerce/vc-shell/commit/706f015f436ecc4ca19831e7159213b0759df6bc))
- enhance framework with AI agent integration ([dcb1fef](https://github.com/VirtoCommerce/vc-shell/commit/dcb1fef55f25755d1903c26f18f6cca588eab286))

### Bug Fixes

- improve error handling and token refresh logic in useUser composable ([2900d9c](https://github.com/VirtoCommerce/vc-shell/commit/2900d9cc2b4465d9457c3e57338a915fe6a3a3e6))
- adjust AI agent panel configuration and styling ([ebdd57a](https://github.com/VirtoCommerce/vc-shell/commit/ebdd57ac50342cacf79968253d8240c685062d89))

### Code Refactoring

- implement centralized logging across composables, components and services ([e27cae6](https://github.com/VirtoCommerce/vc-shell/commit/e27cae64e59b3f8231812297322543e0c5434096))

## [1.2.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.2...v1.2.3) (2026-01-12)

### Features

- **menu:** implement badge functionality for menu items ([f20bf71](https://github.com/VirtoCommerce/vc-shell/commit/f20bf718a0ae62126ad08dacb95d14c22e24a705))

## [1.2.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.3-beta.0...v1.2.2) (2026-01-12)

### Features

- **menu:** implement badge functionality for menu items ([34f3fe8](https://github.com/VirtoCommerce/vc-shell/commit/34f3fe8b7c68f1987bbf90ac7c6ca9156d60e27a))

## [1.2.3-beta.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.14...v1.2.3-beta.0) (2025-12-26)

### Features

- enhance AI agent context management and configuration ([a98c7ed](https://github.com/VirtoCommerce/vc-shell/commit/a98c7ed2a2b54977f02e620493873ca2abacd47a))
- integrate AI agent plugin into VC-Shell framework ([706f015](https://github.com/VirtoCommerce/vc-shell/commit/706f015f436ecc4ca19831e7159213b0759df6bc))
- enhance framework with AI agent integration ([dcb1fef](https://github.com/VirtoCommerce/vc-shell/commit/dcb1fef55f25755d1903c26f18f6cca588eab286))
- **ui:** add VcAccordion component with customizable items and storybook documentation ([cc40911](https://github.com/VirtoCommerce/vc-shell/commit/cc409114b0e52008e24a7cfe59204949295a6307))

### Bug Fixes

- improve error handling and token refresh logic in useUser composable ([2900d9c](https://github.com/VirtoCommerce/vc-shell/commit/2900d9cc2b4465d9457c3e57338a915fe6a3a3e6))
- adjust AI agent panel configuration and styling ([ebdd57a](https://github.com/VirtoCommerce/vc-shell/commit/ebdd57ac50342cacf79968253d8240c685062d89))
- update type definitions in useDynamicProperties ([df5ca52](https://github.com/VirtoCommerce/vc-shell/commit/df5ca52cbf3d2ac6036b85028ffb231ad30c0795))
- handle boolean property values correctly in useDynamicProperties and vc-dynamic-property ([5286329](https://github.com/VirtoCommerce/vc-shell/commit/5286329598f6701ebb457b1bfec5aee872834204))

### Code Refactoring

- implement centralized logging across composables, components and services ([e27cae6](https://github.com/VirtoCommerce/vc-shell/commit/e27cae64e59b3f8231812297322543e0c5434096))

## [1.1.99-alpha.14](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.13...v1.1.99-alpha.14) (2025-11-27)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.13](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.12...v1.1.99-alpha.13) (2025-11-27)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.12](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.11...v1.1.99-alpha.12) (2025-11-27)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.11](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.10...v1.1.99-alpha.11) (2025-11-27)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.10](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.9...v1.1.99-alpha.10) (2025-11-27)

### Code Refactoring

- enhance type safety and improve documentation in composables ([3323d86](https://github.com/VirtoCommerce/vc-shell/commit/3323d86b0049a01628846daeab8ca1d24bed92f3))

## [1.1.99-alpha.9](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.8...v1.1.99-alpha.9) (2025-11-26)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.7...v1.1.99-alpha.8) (2025-11-25)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.6...v1.1.99-alpha.7) (2025-11-25)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.5...v1.1.99-alpha.6) (2025-11-25)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.4...v1.1.99-alpha.5) (2025-11-25)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.3...v1.1.99-alpha.4) (2025-11-25)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.1...v1.1.99-alpha.3) (2025-11-25)

### Features

- integrate custom authentication provider checks in useSettings and useExternalProvider ([64bced4](https://github.com/VirtoCommerce/vc-shell/commit/64bced453e364958807ca5746b0babc8aa581490))
- update auth providers and fix tsx path in pre-commit hook ([a92d957](https://github.com/VirtoCommerce/vc-shell/commit/a92d957e2b0a0be177519e7256af9279d3419713))
- **auth:** introduce customizable authentication provider system with PlatformAuthProvider and authProviderManager for enhanced flexibility ([424af98](https://github.com/VirtoCommerce/vc-shell/commit/424af98fe04f60b54cc2baf1db1c6d3dc184f9bc))

### Bug Fixes

- **locales:** add newline for better readability in localization check output ([ee8c2fd](https://github.com/VirtoCommerce/vc-shell/commit/ee8c2fd873f2c4a0a8c4d574c2c8b715215fbe4d))

### Code Refactoring

- **auth:** replace PlatformAuthProvider checks with centralized feature flagging for improved flexibility ([a2710ac](https://github.com/VirtoCommerce/vc-shell/commit/a2710acf5662ffff2886d26b7dba5e14369170a2))
- **auth:** streamline configuration logging and enhance notification handling for custom authentication providers ([52e8552](https://github.com/VirtoCommerce/vc-shell/commit/52e8552f4d77eaf207bffdc1b26259b89e11e998))

## [1.2.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.2.0...v1.2.1) (2025-11-13)

### Bug Fixes

- update type definitions in useDynamicProperties ([df5ca52](https://github.com/VirtoCommerce/vc-shell/commit/df5ca52cbf3d2ac6036b85028ffb231ad30c0795))

## [1.2.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.2...v1.2.0) (2025-11-13)

### Features

- **ui:** add VcAccordion component with customizable items and storybook documentation ([cc40911](https://github.com/VirtoCommerce/vc-shell/commit/cc409114b0e52008e24a7cfe59204949295a6307))

### Bug Fixes

- handle boolean property values correctly in useDynamicProperties and vc-dynamic-property ([5286329](https://github.com/VirtoCommerce/vc-shell/commit/5286329598f6701ebb457b1bfec5aee872834204))

## [1.1.99-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.1...v1.1.99-alpha.2) (2025-11-07)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.99-alpha.0...v1.1.99-alpha.1) (2025-11-07)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.99-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.5...v1.1.99-alpha.0) (2025-11-07)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.98-rc.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.4...v1.1.98-rc.5) (2025-11-07)

### Features

- integrate custom authentication provider checks in useSettings and useExternalProvider ([64bced4](https://github.com/VirtoCommerce/vc-shell/commit/64bced453e364958807ca5746b0babc8aa581490))
- update auth providers and fix tsx path in pre-commit hook ([a92d957](https://github.com/VirtoCommerce/vc-shell/commit/a92d957e2b0a0be177519e7256af9279d3419713))
- **auth:** introduce customizable authentication provider system with PlatformAuthProvider and authProviderManager for enhanced flexibility ([424af98](https://github.com/VirtoCommerce/vc-shell/commit/424af98fe04f60b54cc2baf1db1c6d3dc184f9bc))

### Bug Fixes

- **locales:** add newline for better readability in localization check output ([ee8c2fd](https://github.com/VirtoCommerce/vc-shell/commit/ee8c2fd873f2c4a0a8c4d574c2c8b715215fbe4d))

### Code Refactoring

- **auth:** replace PlatformAuthProvider checks with centralized feature flagging for improved flexibility ([a2710ac](https://github.com/VirtoCommerce/vc-shell/commit/a2710acf5662ffff2886d26b7dba5e14369170a2))
- **auth:** streamline configuration logging and enhance notification handling for custom authentication providers ([52e8552](https://github.com/VirtoCommerce/vc-shell/commit/52e8552f4d77eaf207bffdc1b26259b89e11e998))

## [1.1.98-rc.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.3...v1.1.98-rc.4) (2025-10-24)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.98-rc.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.2...v1.1.98-rc.3) (2025-10-24)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.98-rc.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.1...v1.1.98-rc.2) (2025-10-24)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.98-rc.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.98-rc.0...v1.1.98-rc.1) (2025-10-24)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.98-rc.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.97...v1.1.98-rc.0) (2025-10-24)

### Bug Fixes

- **locales:** add newline for better readability in localization check output ([2ecdede](https://github.com/VirtoCommerce/vc-shell/commit/2ecdede43d7f76421944954484b5c313ffe40b7a))

## [1.1.97](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.96...v1.1.97) (2025-10-24)

### Styles

- **vc-multivalue, vc-dynamic-property:** unify color square border styles for consistency ([9b55e72](https://github.com/VirtoCommerce/vc-shell/commit/9b55e72139968e088cc9ba3abe0977693162bbc3))

## [1.1.96](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.95...v1.1.96) (2025-10-24)

### Features

- **vc-multivalue, vc-dynamic-property:** add support for multivalue color properties ([2dbc590](https://github.com/VirtoCommerce/vc-shell/commit/2dbc5905eb072bf0aaaa7b5f4998cf9ad49fab0b))

## [1.1.95](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.94...v1.1.95) (2025-10-23)

### Code Refactoring

- **color-utils:** replace color-namer with Canvas API for color conversion ([61fa71e](https://github.com/VirtoCommerce/vc-shell/commit/61fa71e908115ed1f6231ede8ae8054448428406))

## [1.1.94](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.93...v1.1.94) (2025-10-23)

### Features

- **vc-dynamic-property:** enhance color handling ([479b8fc](https://github.com/VirtoCommerce/vc-shell/commit/479b8fcb0eecb2ac2180ff6a2481c7b14e0c20c6))

### Styles

- **vc-dynamic-property:** add border to color indicators for better visibility ([048af50](https://github.com/VirtoCommerce/vc-shell/commit/048af50d5fa64cc02b003fe29dacbed53b9929ea))

## [1.1.93](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.92...v1.1.93) (2025-10-23)

### Features

- **color-picker:** add color utilities and integrate color selection in vc-input component ([f284c1d](https://github.com/VirtoCommerce/vc-shell/commit/f284c1d8bcd13caf3b82e382e22d3f2962cb87e4))

## [1.1.92](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91...v1.1.92) (2025-10-17)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.91](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.5...v1.1.91) (2025-10-17)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.91-alpha.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.4...v1.1.91-alpha.5) (2025-10-14)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.91-alpha.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.3...v1.1.91-alpha.4) (2025-10-14)

### Bug Fixes

- **locales:** add newline for better readability in localization check output ([ee8c2fd](https://github.com/VirtoCommerce/vc-shell/commit/ee8c2fd873f2c4a0a8c4d574c2c8b715215fbe4d))

## [1.1.91-alpha.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.2...v1.1.91-alpha.3) (2025-10-14)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.91-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.91-alpha.1...v1.1.91-alpha.2) (2025-10-14)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.91-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.90...v1.1.91-alpha.1) (2025-10-14)

### Features

- integrate custom authentication provider checks in useSettings and useExternalProvider ([64bced4](https://github.com/VirtoCommerce/vc-shell/commit/64bced453e364958807ca5746b0babc8aa581490))
- update auth providers and fix tsx path in pre-commit hook ([a92d957](https://github.com/VirtoCommerce/vc-shell/commit/a92d957e2b0a0be177519e7256af9279d3419713))
- **auth:** introduce customizable authentication provider system with PlatformAuthProvider and authProviderManager for enhanced flexibility ([424af98](https://github.com/VirtoCommerce/vc-shell/commit/424af98fe04f60b54cc2baf1db1c6d3dc184f9bc))

### Code Refactoring

- **auth:** replace PlatformAuthProvider checks with centralized feature flagging for improved flexibility ([a2710ac](https://github.com/VirtoCommerce/vc-shell/commit/a2710acf5662ffff2886d26b7dba5e14369170a2))
- **auth:** streamline configuration logging and enhance notification handling for custom authentication providers ([52e8552](https://github.com/VirtoCommerce/vc-shell/commit/52e8552f4d77eaf207bffdc1b26259b89e11e998))

## [1.1.90](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.89...v1.1.90) (2025-10-08)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.89](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.88...v1.1.89) (2025-10-08)

### Code Refactoring

- **useExternalProvider:** update signIn and signOut methods to return promises ([76e8b97](https://github.com/VirtoCommerce/vc-shell/commit/76e8b978c29a58a68124d742b309f2d457d9fb44))

## [1.1.88](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.87...v1.1.88) (2025-10-07)

### Features

- **vc-dynamic-property:** add color type dictionary select ([4a21112](https://github.com/VirtoCommerce/vc-shell/commit/4a211124acd4b66d0f4b9f37fc4cb33c70b69a5d))

## [1.1.87](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.86...v1.1.87) (2025-10-06)

### Features

- **vc-dynamic-property, input:** color type in dynamic propery and input VM-1645 ([1ff529e](https://github.com/VirtoCommerce/vc-shell/commit/1ff529eab6e560a21cb64a5de6a28f11c80b4b30))

### Code Refactoring

- **vc-tooltip:** expand placement prop options for enhanced positioning flexibility ([65fcfff](https://github.com/VirtoCommerce/vc-shell/commit/65fcfffd871839c7d205e387440e4f8f15e8d9a5))

## [1.1.86](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.85...v1.1.86) (2025-10-06)

### Code Refactoring

- **assets-details, assets-manager:** add hiddenFields option to manage visibility of asset fields for improved flexibility ([84d8635](https://github.com/VirtoCommerce/vc-shell/commit/84d8635fa3664e76b2c3eb660ad94b4ea3c75723))

## [1.1.85](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.84...v1.1.85) (2025-10-03)

### Bug Fixes

- **useMenuExpanded:** correct app name extraction logic for dynamic storage key generation ([3cdaeab](https://github.com/VirtoCommerce/vc-shell/commit/3cdaeabf7bf1192a641cb5150a9a8b5b8f34efcf))

### Code Refactoring

- **vc-table-mobile-view:** add editing prop to table cell components for enhanced editing functionality ([0813842](https://github.com/VirtoCommerce/vc-shell/commit/08138424a4671e88aa5833ad2ee9349d52b4e31c))
- **types:** enhance InputSchema interface by specifying input variant types and datePickerOptions for improved type safety ([795d5b5](https://github.com/VirtoCommerce/vc-shell/commit/795d5b573f180e72041b8416098c5fb01ec9379d))
- **assets-details:** expose asset title for improved accessibility in assets details component ([1213306](https://github.com/VirtoCommerce/vc-shell/commit/12133061a8923fac00bd654d5bcbaaa0ebf1ff72))
- **types:** update optional properties in ICommonAsset interface for improved type safety ([e20ae67](https://github.com/VirtoCommerce/vc-shell/commit/e20ae67f74eaf05d0d6066798642f114a1e23c42))
- **vc-table:** update StatusImage interface to TableEmptyAction for improved flexibility in empty state handling ([9ed11c9](https://github.com/VirtoCommerce/vc-shell/commit/9ed11c93be964afa245363727e97e5d399fd1328))
- replace inject with useBlade for improved blade instance access in multiple components ([ebc109e](https://github.com/VirtoCommerce/vc-shell/commit/ebc109ef0b30eeca902715742444490ccc532f40))
- **vc-input:** enhance type definitions for modelValue and input props to support various input types ([a88285e](https://github.com/VirtoCommerce/vc-shell/commit/a88285e2fd000d3ba488b964c8e9d11b23b4c1ba))

## [1.1.84](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.84-alpha.0...v1.1.84) (2025-09-30)

### Bug Fixes

- **vc-select:** enhance option value retrieval to support primitive types and improve label filtering ([90c9530](https://github.com/VirtoCommerce/vc-shell/commit/90c9530c66e31df7216db9b873fba275c566d8f7))

## [1.1.84-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.83...v1.1.84-alpha.0) (2025-09-30)

### Bug Fixes

- **vc-select:** add fallback visibility check for iframe support in dropdown component ([dd3fc7d](https://github.com/VirtoCommerce/vc-shell/commit/dd3fc7d498c1a0d694804332c3fac3513bb4e78f))

### Code Refactoring

- **useMenuExpanded:** implement dynamic storage key generation for menu state based on application path ([a9f5d4b](https://github.com/VirtoCommerce/vc-shell/commit/a9f5d4b90916e7e6633d89d4efe407ab7b823a7a))
- **loader:** remove unused extensions handling from module installation process ([c797ea7](https://github.com/VirtoCommerce/vc-shell/commit/c797ea7fb54c0c2db52e52420f853c2b4ae63947))
- **extensions:** remove unused extensions helper and related exports ([3263910](https://github.com/VirtoCommerce/vc-shell/commit/326391052b3036c00cdb13cc83048e1308277039))

## [1.1.83](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.83-alpha.0...v1.1.83) (2025-09-30)

### Features

- **login:** add localization support for "OR" text in login components ([6ed87e6](https://github.com/VirtoCommerce/vc-shell/commit/6ed87e67963acfaf681ca472e577c3bb79d4f9de))
- **vc-form:** implement submit event emission in form component ([31019a0](https://github.com/VirtoCommerce/vc-shell/commit/31019a078cb3e3caede67bf8396dc0d985015f6c))
- **notification-template:** add click event emission to notification template component ([b313b7c](https://github.com/VirtoCommerce/vc-shell/commit/b313b7c0c1ba8aaef4eacd104338a8348a5b8d40))

### Bug Fixes

- **vc-select:** update model value type definition to support multiple option formats ([92c70f0](https://github.com/VirtoCommerce/vc-shell/commit/92c70f04448ab1de015cd68c2dd782355a40d9fe))
- **loader:** enhance version compatibility checks to include prerelease versions ([d1af321](https://github.com/VirtoCommerce/vc-shell/commit/d1af32163d34e4540b49df5d0ed9de71cc5ef0c2))

### Code Refactoring

- **ExtensionSlot:** clean up template and script structure for improved readability ([397c1a3](https://github.com/VirtoCommerce/vc-shell/commit/397c1a3045515d379b5e4f5e972db6b01da42c24))

## [1.1.83-alpha.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.82...v1.1.83-alpha.0) (2025-09-24)

### Features

- **useModificationTracker:** add pristineValue reference to track original state ([adaf67d](https://github.com/VirtoCommerce/vc-shell/commit/adaf67d34ceac0b7b490c2906a7b3f25b57c32e1))
- **extension-points:** introduce new extension system with composables for slot management and data exchange ([b427cd4](https://github.com/VirtoCommerce/vc-shell/commit/b427cd4a141d4dc39c454b12259b2a8c566179b9))

### Code Refactoring

- **login:** replace afterLoginFormExtensions with ExtensionSlot for improved slot management ([fec517c](https://github.com/VirtoCommerce/vc-shell/commit/fec517c481af76b1d3dc9a0077eef1feab0bccf6))

## [1.1.82](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.81...v1.1.82) (2025-09-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.81](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.80...v1.1.81) (2025-09-23)

### Code Refactoring

- **assets-manager:** improve title handling and error management in upload functions ([331bcaa](https://github.com/VirtoCommerce/vc-shell/commit/331bcaab197ea9261ec90787ae6f5b94d2572b5a))

## [1.1.80](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.79...v1.1.80) (2025-09-22)

### Bug Fixes

- **vc-editor:** export ToolbarNames type for better accessibility in toolbar components ([e24ba37](https://github.com/VirtoCommerce/vc-shell/commit/e24ba37bd33059dfbe7a8d285c75e4e9724ca329))

## [1.1.79](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.78...v1.1.79) (2025-09-18)

### Features

- **vc-field:** update copy button icon dynamically on copy action ([fe47e62](https://github.com/VirtoCommerce/vc-shell/commit/fe47e62a591df136800f4e5e8872e5392f8fb7df))
- **composables:** add useBlade composable for accessing the current blade instance ([e1d1c59](https://github.com/VirtoCommerce/vc-shell/commit/e1d1c591e3472c38eb459f878f7a69f5e6df8f4a))

## [1.1.78](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.77...v1.1.78) (2025-09-12)

### Features

- **dashboard:** enhance widget placement logic to handle new widgets without collisions ([1faf444](https://github.com/VirtoCommerce/vc-shell/commit/1faf444cb7c919c7a0ddb4447e7dab560c8f0e93))

### Bug Fixes

- **vc-radio-button:** prevent radio button from shrinking by adding flex-shrink property ([276bd6a](https://github.com/VirtoCommerce/vc-shell/commit/276bd6ac81b74b3d93d8652d75e88b32fae10c38))

### Code Refactoring

- **vc-field:** simplify label styling and enhance vertical layout with gap utility ([0441d57](https://github.com/VirtoCommerce/vc-shell/commit/0441d573b96b67758063f3a97780e42af378215d))

## [1.1.77](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.76...v1.1.77) (2025-09-11)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.76](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.75...v1.1.76) (2025-09-10)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.75](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.74...v1.1.75) (2025-09-10)

### Features

- **vc-editor:** enhance editor with custom toolbar buttons and font size selector ([a4b0e6e](https://github.com/VirtoCommerce/vc-shell/commit/a4b0e6eac49880b58d7373c134cb42151f4df4a6))

### Code Refactoring

- **vc-slider:** improve swiper configuration and module imports for better performance ([cc35499](https://github.com/VirtoCommerce/vc-shell/commit/cc354996c82a65048c46fb9e8069993a80b39d7e))

## [1.1.74](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.73...v1.1.74) (2025-09-08)

### Bug Fixes

- **vc-input-dropdown:** conditionally render button based on options availability ([9182d1f](https://github.com/VirtoCommerce/vc-shell/commit/9182d1f50356df76bfb0b6e2840a73d3d4537a6e))

## [1.1.73](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.72...v1.1.73) (2025-09-04)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.72](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.71...v1.1.72) (2025-08-25)

### Bug Fixes

- update max height for generic dropdown ([37abe30](https://github.com/VirtoCommerce/vc-shell/commit/37abe30c5994a622798af3919e70f06aca72d482))

## [1.1.71](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.70...v1.1.71) (2025-08-21)

### Bug Fixes

- update event binding for menu item click in useAppSlots composable ([c45e045](https://github.com/VirtoCommerce/vc-shell/commit/c45e045bb10ffc0603d61f79b6ae2de1f7d36d5a))

## [1.1.70](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.69...v1.1.70) (2025-08-20)

### Bug Fixes

- VCST-3680 embedded mode fixes ([2f6a82f](https://github.com/VirtoCommerce/vc-shell/commit/2f6a82f60b4cbb179f00e36bbbbe59d3fe438dd0))

## [1.1.69](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.68...v1.1.69) (2025-08-13)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.68](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.67...v1.1.68) (2025-07-31)

### Code Refactoring

- change widget registration to use reactive instead of markRaw for widget state management ([ec67316](https://github.com/VirtoCommerce/vc-shell/commit/ec67316c77c61266e8fc715acdd78a62dc0e1e95))

## [1.1.67](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.66...v1.1.67) (2025-07-31)

### Bug Fixes

- add !important to width properties for maximized blade component ([aee8edc](https://github.com/VirtoCommerce/vc-shell/commit/aee8edc7d67b534b4a43e5ca2c15875f4a8bb1bf))

## [1.1.66](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.65...v1.1.66) (2025-07-30)

### Features

- **generic-dropdown:** improve height applying ([8a39233](https://github.com/VirtoCommerce/vc-shell/commit/8a3923316f6ae488d08ad0e585d1b417d1eaaa5b))
- **vc-table:** improve columns sorting, resizing ([fdcac27](https://github.com/VirtoCommerce/vc-shell/commit/fdcac270c342aa76411f153991faf938ca868cf3))

## [1.1.65](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.64...v1.1.65) (2025-07-29)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.64](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.63...v1.1.64) (2025-07-25)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.63](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.62...v1.1.63) (2025-07-25)

### Code Refactoring

- migrate language management from composable to service pattern ([23fb0cd](https://github.com/VirtoCommerce/vc-shell/commit/23fb0cd5f8fc032e92aea0d0bbbb44c617ce4605))

## [1.1.62](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.61...v1.1.62) (2025-07-24)

### Code Refactoring

- move menu item translation from service to component level ([d81f6c3](https://github.com/VirtoCommerce/vc-shell/commit/d81f6c35337674ceeb95d1d81e06fe3d3a85f1dd))

## [1.1.61](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.60...v1.1.61) (2025-07-23)

### Features

- add embedded mode support ([647253b](https://github.com/VirtoCommerce/vc-shell/commit/647253be9bcd5c1b347fd1727cfef9810e9d0d5f))

## [1.1.60](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.59...v1.1.60) (2025-07-17)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.59](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.58...v1.1.59) (2025-07-11)

### Features

- **icon-components:** revert, material symbols size optimization ([c4b8771](https://github.com/VirtoCommerce/vc-shell/commit/c4b87712503d6bca3edf94efecd2585d7643472c))

## [1.1.58](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.57...v1.1.58) (2025-07-10)

### Code Refactoring

- **widget-service:** update widget registration to use markRaw for reactivity ([a3022d3](https://github.com/VirtoCommerce/vc-shell/commit/a3022d372a4f34472562eae3b36a7297b172cd47))

## [1.1.57](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.56...v1.1.57) (2025-07-10)

### Features

- **widget-service:** add methods to retrieve all external widgets and clone widgets for improved widget management ([2806152](https://github.com/VirtoCommerce/vc-shell/commit/2806152873d85bbee9877ef2ead9d2ceabcca0a6))
- **vc-widget-container:** add click event to toggle toolbar visibility on click ([007931f](https://github.com/VirtoCommerce/vc-shell/commit/007931f8c86b224a5b03a1ad321f633eace715ec))

### Bug Fixes

- **vc-editor:** update disabled text and background colors ([0ee79c5](https://github.com/VirtoCommerce/vc-shell/commit/0ee79c59bcc631ae5ee8868032dc626ec8fca890))
- **vc-select:** update modelValue type to support multiple option formats ([1f163a8](https://github.com/VirtoCommerce/vc-shell/commit/1f163a8cc7679d2aa5f5a94db49d79b3f98fe247))

### Code Refactoring

- **composables:** remove unused useBladeMultilanguage composable ([5ba38e8](https://github.com/VirtoCommerce/vc-shell/commit/5ba38e8aa81595a08052df23cc7962c69c9f6801))
- **vc-table:** update header slot type to use a function for improved flexibility ([4920b7c](https://github.com/VirtoCommerce/vc-shell/commit/4920b7c37ed657dcd87588f462bccd27d00cae4f))

## [1.1.56](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.55...v1.1.56) (2025-07-08)

### Bug Fixes

- **vc-editor:** update list styles for unordered and ordered lists in the editor component ([2dd3fc2](https://github.com/VirtoCommerce/vc-shell/commit/2dd3fc22e9fef098c800ebe93c5e3e5f5e760333))

### Code Refactoring

- **widget-service:** rename bladeType to bladeId for consistency and improve prop resolution logic ([693628e](https://github.com/VirtoCommerce/vc-shell/commit/693628eb179dc35e71aa7ad32ad51932ae038752))

## [1.1.55](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.54...v1.1.55) (2025-07-07)

### Features

- **widget-service:** add external widget registration functionality and enhance widget management ([cd35c9b](https://github.com/VirtoCommerce/vc-shell/commit/cd35c9b50bf44af8f466dc6a2d4ce29ad01e9514))

### Bug Fixes

- **vc-blade-toolbar:** adjust spacing in 'more' button for improved layout consistency ([2075e5b](https://github.com/VirtoCommerce/vc-shell/commit/2075e5b37b351a89d9aa1a7dde01dd939e76a212))

## [1.1.54](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.53...v1.1.54) (2025-07-07)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.53](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.52...v1.1.53) (2025-07-04)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.52](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.51...v1.1.52) (2025-07-02)

### Code Refactoring

- **vc-fontawesome-icon:** update icon name processing to use pre-processed value for improved clarity ([ce8cde0](https://github.com/VirtoCommerce/vc-shell/commit/ce8cde02060ee705c3366f991a358f47f84d7a2c))

## [1.1.51](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.50...v1.1.51) (2025-07-02)

### Code Refactoring

- **loader:** improve dynamic module registration logic and enhance error handling during module loading ([c21873f](https://github.com/VirtoCommerce/vc-shell/commit/c21873f1acecec3dc540137e21bdae45ff0eda80))

## [1.1.50](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.49...v1.1.50) (2025-07-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.49](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.48...v1.1.49) (2025-07-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.48](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.47...v1.1.48) (2025-07-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.47](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.46...v1.1.47) (2025-07-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.46](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.45...v1.1.46) (2025-07-02)

### Features

- **dynamic-module:** enhance UMD name generation and improve logging for dynamic module loading ([8d43f21](https://github.com/VirtoCommerce/vc-shell/commit/8d43f216e6ec3f9f61ab93953f297d80832f9ed7))

## [1.1.45](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.44...v1.1.45) (2025-07-01)

### Features

- **loader:** implement parallel loading of dynamic modules and improve error handling ([cf93200](https://github.com/VirtoCommerce/vc-shell/commit/cf93200d4e7e42f8163db09096eec1a24d4600d2))
- **vc-editor:** migrate to Tiptap editor, enhance functionality with new toolbar and button components ([2b77c73](https://github.com/VirtoCommerce/vc-shell/commit/2b77c734cee3bae8c3d01dd50207e9052c298ac8))
- remove icon packs in favor of iconify lib ([983f7fc](https://github.com/VirtoCommerce/vc-shell/commit/983f7fc6252816dc9cafbd2defc7eb5292947b96))

## [1.1.44](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.43...v1.1.44) (2025-06-30)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.43](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.42...v1.1.43) (2025-06-27)

### Bug Fixes

- **vc-select:** set default value for generic parameter P to undefined ([ed13c91](https://github.com/VirtoCommerce/vc-shell/commit/ed13c91a9f09d799df72baa62d1694c893c0e231))

## [1.1.42](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.41...v1.1.42) (2025-06-27)

### Bug Fixes

- **vc-select:** fix generic type ([95d78ac](https://github.com/VirtoCommerce/vc-shell/commit/95d78aca9c2fbd68d3116f24f2e8130236dbc56e))

## [1.1.41](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.40...v1.1.41) (2025-06-27)

### Code Refactoring

- **blade-navigation:** update onParentCall method to streamline parent method invocation and enhance error handling ([71a82c8](https://github.com/VirtoCommerce/vc-shell/commit/71a82c8416d42fe61e8bedb30f5a2bf979b1899e))

## [1.1.40](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.39...v1.1.40) (2025-06-27)

### Bug Fixes

- **vc-widget-container:** set default visibility to true when isVisible is undefined ([09775ed](https://github.com/VirtoCommerce/vc-shell/commit/09775eda9f68b620cfec78206289c135dd9ba4cd))

## [1.1.39](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.38...v1.1.39) (2025-06-26)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.38](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.37...v1.1.38) (2025-06-25)

### Bug Fixes

- **useAsync:** correct payload handling in innerAction call to ensure proper execution ([8c1d238](https://github.com/VirtoCommerce/vc-shell/commit/8c1d2386e34b2f70523e4527f77a387ecc203876))

## [1.1.37](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.36...v1.1.37) (2025-06-25)

### Features

- **global style:** update base styles with Roboto font and tailwind configurations ([51722bf](https://github.com/VirtoCommerce/vc-shell/commit/51722bff7933816d2cbab9fecb7a7c05fcb8d2d3))

### Code Refactoring

- **blade-navigation:** change options type to Record<string, any> for improved flexibility ([59f9c0f](https://github.com/VirtoCommerce/vc-shell/commit/59f9c0fe9fc7605f2026e7c9d351d306ac0ffbec))
- **useContainer:** replace lodash remove with native filter for notification management ([eb285c5](https://github.com/VirtoCommerce/vc-shell/commit/eb285c5ea946183a3dee59875dbc311e9ed4e8f1))

## [1.1.36](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.35...v1.1.36) (2025-06-24)

### Features

- **composables:** add useTableSort composable for table sorting functionality ([1e4d768](https://github.com/VirtoCommerce/vc-shell/commit/1e4d768b22436ff7da4cad922b25da5b45dee7f9))

## [1.1.35](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.34...v1.1.35) (2025-06-24)

### Code Refactoring

- **error-handling:** enhance error handling by introducing DisplayableError type and improving error processing logic ([f1a98c1](https://github.com/VirtoCommerce/vc-shell/commit/f1a98c17b054df9a9a56f0731139969be4ddda0d))

## [1.1.34](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.33...v1.1.34) (2025-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.33](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.32...v1.1.33) (2025-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.32](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.31...v1.1.32) (2025-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.31](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.30...v1.1.31) (2025-06-23)

### Features

- **dashboard:** enhance useDashboardDragAndDrop composable with TypeScript return type and improved setGridContainer function ([65a726f](https://github.com/VirtoCommerce/vc-shell/commit/65a726f65d396f073a21f3502fba7e62e2ce4f03))
- **composables:** add useModificationTracker composable for tracking value changes and modifications ([ad911e1](https://github.com/VirtoCommerce/vc-shell/commit/ad911e19640ea675a70cdaf2e6b6c6f5c0f2f0a4))
- **multilanguage-selector:** add VcLanguageSelector component for language selection with dropdown functionality ([f620e1d](https://github.com/VirtoCommerce/vc-shell/commit/f620e1dfa94b4b468c5c40a276c411be4b993f9b))
- **vc-app:** add disableAppSwitcher prop to control app switcher visibility in VcApp component ([ab2d6dc](https://github.com/VirtoCommerce/vc-shell/commit/ab2d6dc7c09cbf99f7501bb6a8b51d9c3be3d1af))
- **vc-card:** enhance VcCard component by adding v-bind for attribute inheritance and defining component options ([12d0096](https://github.com/VirtoCommerce/vc-shell/commit/12d0096809ce46cbff1cdf30c8b4f44d6f69a8ad))
- **vc-banner:** add VcBanner component for displaying contextual information with expandable content ([5fa7b4f](https://github.com/VirtoCommerce/vc-shell/commit/5fa7b4f77117a02aa559a48dc1f020414c380720))
- **error-handling:** implement DisplayableError class and enhance useErrorHandler for better error normalization and handling ([a68473b](https://github.com/VirtoCommerce/vc-shell/commit/a68473b98726d436d3ab272e0afee9db2d92174b))

### Bug Fixes

- **types:** update error property in IBladeInstance to allow undefined value ([c2f0fb5](https://github.com/VirtoCommerce/vc-shell/commit/c2f0fb58513e15ffadc581f2b75d43618c3b6f10))
- **useLanguages:** add validation to getFlag function to handle empty language input ([853325e](https://github.com/VirtoCommerce/vc-shell/commit/853325ecc55e5e26f2e90021f8b4b7d7b6415142))
- **vc-checkbox:** update v-model binding to use modelValue and enhance checked state logic for array support ([e3a70dd](https://github.com/VirtoCommerce/vc-shell/commit/e3a70ddc0badd12160319a259ccd592ddb823ca9))

### Code Refactoring

- **locales:** rename VC_STATUS to VC_BANNER for consistency in localization files ([8abe7d2](https://github.com/VirtoCommerce/vc-shell/commit/8abe7d25e981974fea306c607b0c52afe563a3ac))
- **vc-table:** simplify item action handling by removing itemActionBuilder prop and updating related logic ([d6cf626](https://github.com/VirtoCommerce/vc-shell/commit/d6cf62638dd7b4da66d88a4c78d0b56b886b1ee0))
- **settings-menu-service:** rename SettingsMenuItem to ISettingsMenuItem for consistency and update related types ([9d66c06](https://github.com/VirtoCommerce/vc-shell/commit/9d66c06f34b9cf33e4151431cdf33057ac981e8c))

## [1.1.30](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.29...v1.1.30) (2025-06-11)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.29](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.28...v1.1.29) (2025-06-05)

### Features

- **vc-input-dropdown, vc-select:** enhance dropdown and select components with toggle state management for improved user experience ([af3ff4f](https://github.com/VirtoCommerce/vc-shell/commit/af3ff4fef54d07e2861d6b7cc8facdf741e50b35))

## [1.1.28](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.27...v1.1.28) (2025-06-04)

### Features

- **modularity:** enhance Blade registration with inject support and improve route handling for workspace components ([1d5a8e3](https://github.com/VirtoCommerce/vc-shell/commit/1d5a8e386168079bd56e9cd633edf79a3c086ce1))

## [1.1.27](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.26...v1.1.27) (2025-06-04)

### Features

- **vc-input-dropdown:** add toggle button to dropdown component for improved user interaction ([1289dd5](https://github.com/VirtoCommerce/vc-shell/commit/1289dd5fbc7c2adcddd69184e8eb0792c7121c97))

## [1.1.26](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.25...v1.1.26) (2025-06-04)

### Features

- **global-search:** add useGlobalSearch composable and Global Search Service documentation for enhanced search functionality across the application ([e53be10](https://github.com/VirtoCommerce/vc-shell/commit/e53be1095b2b7067dc3ad9ce9f1ab23aafaa57a2))
- **localization:** add theme localization support for German and English languages ([8d8fdb0](https://github.com/VirtoCommerce/vc-shell/commit/8d8fdb0a05814ea277f7ab07978902ae86ec3102))
- **vc-popup:** add Storybook stories for VcPopup component, showcasing various configurations and customization options ([dc8e961](https://github.com/VirtoCommerce/vc-shell/commit/dc8e961be32469b7a06fed78aa68846ba95a1d70))

### Code Refactoring

- **index:** replace useUser with useUserManagement for improved user management consistency ([d8c6bc6](https://github.com/VirtoCommerce/vc-shell/commit/d8c6bc6fc3a3eb3f7a5f8d7f3cab7fd5ad09a5c6))
- **vc-input-dropdown:** remove redundant component description in Storybook stories for clarity ([a0e04c7](https://github.com/VirtoCommerce/vc-shell/commit/a0e04c7da25aa2f7e5db7f1eb0a652c0860cc21b))
- **settings-menu:** streamline settings menu component by directly using useSettingsMenu and enhancing slot definitions ([a8bcb65](https://github.com/VirtoCommerce/vc-shell/commit/a8bcb65226346f62c06218cc1faa7db3c6b5fe50))
- **widget-service:** enhance widget management by introducing updateFunctionName and improving active widget handling ([1ca6cbe](https://github.com/VirtoCommerce/vc-shell/commit/1ca6cbe8b1705ca5bf00f14096b2b0a5c704cb57))
- **user-management:** replace useUser with useUserManagement across the codebase for improved user handling and management consistency ([565305d](https://github.com/VirtoCommerce/vc-shell/commit/565305d269081fb4f92bbe3505051b8011d7b3b8))
- **theme:** update theme management to support localization and improve theme registration logic ([0d78946](https://github.com/VirtoCommerce/vc-shell/commit/0d78946fb8a98414e67626cd46b46d51ae78987a))

## [1.1.25](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.24...v1.1.25) (2025-05-30)

### Code Refactoring

- **vc-icon:** simplify Font Awesome icon class selectors ([1bb3991](https://github.com/VirtoCommerce/vc-shell/commit/1bb3991c10bbb0ff499b813eff2acb77d7b3fb9b))

## [1.1.24](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.23...v1.1.24) (2025-05-29)

### Bug Fixes

- **useDynamicProperties:** export SetPropertyValueParams interface for better accessibility in dynamic properties management ([bddd03f](https://github.com/VirtoCommerce/vc-shell/commit/bddd03f08fd0bb15754109064887ef22c7acf542))

## [1.1.23](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.22...v1.1.23) (2025-05-29)

### Features

- **blade-registry:** integrate Blade Registry into the application, enhance error handling for main route validation, and update notification component types for improved type safety ([2535a78](https://github.com/VirtoCommerce/vc-shell/commit/2535a78be870edaf4f563aa69dd0f76b2a6729a5))
- **useDynamicProperties:** refactor dynamic properties composable with improved type definitions and utility functions; enhance vc-input-dropdown and vc-dynamic-property components for multilingual support ([4e13175](https://github.com/VirtoCommerce/vc-shell/commit/4e1317545c59cf3aeeaf9141a3f395825c04d285))
- **blade-navigation:** implement blade registry and enhance navigation functionality with state management and routing utilities ([ab76268](https://github.com/VirtoCommerce/vc-shell/commit/ab762680f03e1c2a130ff802b8fbbbbf96e7b86a))
- **useAppInsights:** enhance app insights integration with page tracking and expose appInsights instance ([603c2b8](https://github.com/VirtoCommerce/vc-shell/commit/603c2b81b82a320209ba5da7685fd36f2797074d))

## [1.1.22](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.21...v1.1.22) (2025-05-28)

### Features

- **useKeyboardNavigation:** add validation for focused index and improve focus handling ([9f403f1](https://github.com/VirtoCommerce/vc-shell/commit/9f403f181d27497e9090ac52f6c256e2de387c3f))

## [1.1.21](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.20...v1.1.21) (2025-05-28)

### Code Refactoring

- **useKeyboardNavigation:** remove unused key navigation cases and clean up code ([7966e0c](https://github.com/VirtoCommerce/vc-shell/commit/7966e0c52d855692fa25697c5ebbd0ff5861ab3f))

## [1.1.20](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.19...v1.1.20) (2025-05-28)

### Bug Fixes

- **vc-select:** enhance dropdown close logic and improve option loading handling ([c0ef43d](https://github.com/VirtoCommerce/vc-shell/commit/c0ef43d9c2a2175f65d2c74dcd98578e17f79c07))

## [1.1.19](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.18...v1.1.19) (2025-05-28)

### Bug Fixes

- **vc-select:** update loading logic and add default option loading state ([d02ffa4](https://github.com/VirtoCommerce/vc-shell/commit/d02ffa4ffb226830ee1291e9e74d36bb87040611))

## [1.1.18](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.17...v1.1.18) (2025-05-27)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.17](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.16...v1.1.17) (2025-05-27)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.16](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.15...v1.1.16) (2025-05-26)

### Features

- add Measure type to vc-dynamic-property ([14ef021](https://github.com/VirtoCommerce/vc-shell/commit/14ef021634b7f6c135bfa5851b3170e4680d125d))

## [1.1.15](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.14...v1.1.15) (2025-05-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.14](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.13...v1.1.14) (2025-05-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.13](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.12...v1.1.13) (2025-05-23)

### Code Refactoring

- **loader:** remove app version compatibility checks and simplify error handling for module compatibility ([cd7ac50](https://github.com/VirtoCommerce/vc-shell/commit/cd7ac509c8fe103dd97b82bb578d09bf02b71490))

## [1.1.12](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.11...v1.1.12) (2025-05-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.11](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.10...v1.1.11) (2025-05-23)

### Features

- **vc-select:** add loading and no options messages for improved user experience ([aa65256](https://github.com/VirtoCommerce/vc-shell/commit/aa65256b99238e6d7feae24177c4304eb25d1153))

### Code Refactoring

- **user-dropdown-button:** enhance styling ([b8a73a8](https://github.com/VirtoCommerce/vc-shell/commit/b8a73a83183f41372bce83e9e3e63ce6a0aa1697))

## [1.1.10](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.9...v1.1.10) (2025-05-22)

### Features

- **dynamic-properties:** add useDynamicProperties composable for managing dynamic property values and dictionaries ([5af9e0b](https://github.com/VirtoCommerce/vc-shell/commit/5af9e0bd27dd9930589166e17ef234fd8dae5998))

### Code Refactoring

- **toolbar & widget services:** normalize bladeId to lowercase for consistent handling across services ([7447f53](https://github.com/VirtoCommerce/vc-shell/commit/7447f5321c180214711d5f87feae0f51f96cf676))

## [1.1.9](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.8...v1.1.9) (2025-05-15)

### Code Refactoring

- **widget-service:** replace ConcreteComponent with Component type for improved type consistency ([2fed433](https://github.com/VirtoCommerce/vc-shell/commit/2fed4333998f256f375355246f1107f73dceed10))

## [1.1.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.7...v1.1.8) (2025-05-15)

### Bug Fixes

- **vc-badge:** adjust badge dimensions in story and update visibility condition for content ([41d30de](https://github.com/VirtoCommerce/vc-shell/commit/41d30de789b199bebf94a73eb2dc42790ffdf3c8))

### Documentation

- update toolbar and widget services documentation to include blade context for visibility control ([fd9b616](https://github.com/VirtoCommerce/vc-shell/commit/fd9b61690cfe30f03fcb5223dccf59a4b6981652))

### Code Refactoring

- enhance VcBladeView component with improved blade context ([b8ab391](https://github.com/VirtoCommerce/vc-shell/commit/b8ab39126da06ce6a0097e1f539abef52ea9c8e0))

## [1.1.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.6...v1.1.7) (2025-05-12)

### Code Refactoring

- update VcInputDropdown modelValue type and enhance vc-input-currency component integration ([fb52a80](https://github.com/VirtoCommerce/vc-shell/commit/fb52a804778eba2cc3774f4d2ad1bf966fec3581))

## [1.1.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.5...v1.1.6) (2025-05-12)

### Features

- VcInputDropdown component, replace VcSelect with VcInputDropdown and update related stories ([08f3c72](https://github.com/VirtoCommerce/vc-shell/commit/08f3c72d1cdee3a82868db5238c7e9879914cc8c))
- enhance module compatibility checks with error notifications ([4f9c44e](https://github.com/VirtoCommerce/vc-shell/commit/4f9c44ec73e3e83a31d5099ec641c761b5e96167))

### Code Refactoring

- update slot definitions in multiple components ti fix vue-component-meta ([982825a](https://github.com/VirtoCommerce/vc-shell/commit/982825a168ad768eed0812ee2951c8a07400657e))
- update Storybook preview configuration and adjust vc-icon story title ([4853499](https://github.com/VirtoCommerce/vc-shell/commit/485349939565f8cce9cbf5b03dd9e670f91b246f))

## [1.1.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.4...v1.1.5) (2025-05-07)

### Features

- implement module versioning and compatibility checks in the modularity plugin ([19c9553](https://github.com/VirtoCommerce/vc-shell/commit/19c95534c4ca0f6041015a0489dab7eabc1a322a))
- enhance VcIcon component ([58ad2ba](https://github.com/VirtoCommerce/vc-shell/commit/58ad2baaf306caa92375e81b170fdfb198a75b20))

### Code Refactoring

- improve AppBarHeader styles by adjusting mobile logo properties ([2947c6a](https://github.com/VirtoCommerce/vc-shell/commit/2947c6ab319a604e1d851c5b9e24b630aa89c69f))
- update vc-multivalue component styles ([6a8cc29](https://github.com/VirtoCommerce/vc-shell/commit/6a8cc29f52e192701855f4d2f2d2846d8f3b9e86))
- extract button properties into a separate props file for better maintainability ([bc51cd9](https://github.com/VirtoCommerce/vc-shell/commit/bc51cd9fd047a9a6f196415cd31b65b9d05352e2))
- update vc-app-bar to toggle sidebar icons based on state ([3fac368](https://github.com/VirtoCommerce/vc-shell/commit/3fac36801decd2a64ca0fab977103eec68a0a12f))
- update pagination component to use local state for current page management ([1795b97](https://github.com/VirtoCommerce/vc-shell/commit/1795b974f07c3ffe7a4d45fff07378614810167f))
- extract table-related types into a separate file, fixed pagination ([c00d920](https://github.com/VirtoCommerce/vc-shell/commit/c00d9203efb569c5d0626f270083f75762e4d577))

## [1.1.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.3...v1.1.4) (2025-04-30)

### Features

- add custom position to VcBadge in vc-widget component ([0d42845](https://github.com/VirtoCommerce/vc-shell/commit/0d4284515b8c3c777380b7a3b7cac2b54f63731e))

### Bug Fixes

- vc-blade-toolbar visibility issues ([2e215ed](https://github.com/VirtoCommerce/vc-shell/commit/2e215ed2324efb801116d9c3e15c549adf8e3e9b))

## [1.1.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.2...v1.1.3) (2025-04-30)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.342...v1.1.2) (2025-04-29)

### Features

- first release ([b94bf6d](https://github.com/VirtoCommerce/vc-shell/commit/b94bf6db1020fdc904c3bc8d9a9181e9becef7fe))
- first release ([5c3c607](https://github.com/VirtoCommerce/vc-shell/commit/5c3c607269a3b33478a4bf23b6486ca8b01157a2))
- first release ([6685f10](https://github.com/VirtoCommerce/vc-shell/commit/6685f10f98982038206a55b637dc14628a341088))
- redesign alpha5 ([ac430b8](https://github.com/VirtoCommerce/vc-shell/commit/ac430b80f684d3b920c35778a83c33ec387b2484))
- redesign alpha4 wip ([ac48f52](https://github.com/VirtoCommerce/vc-shell/commit/ac48f526f61e85518a238e1e6b49047ff3fcc786))
- partial redesign ([846e215](https://github.com/VirtoCommerce/vc-shell/commit/846e2152c6e48753622ca7cf3a71300323c99d51))

### Code Refactoring

- menu service and new SVG icons, alpha6 ([df10c9f](https://github.com/VirtoCommerce/vc-shell/commit/df10c9f54678c4a5f0a9752d9889d4acc2d4a29e))

### BREAKING CHANGES

- first release
- first release

## [1.0.342](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.1...v1.0.342) (2025-04-29)

### Features

- **global style:** update base styles with Roboto font and tailwind configurations ([51722bf](https://github.com/VirtoCommerce/vc-shell/commit/51722bff7933816d2cbab9fecb7a7c05fcb8d2d3))

## [1.1.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.0...v1.1.1) (2025-04-29)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.0](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.341...v1.1.0) (2025-04-29)

### Features

- first release ([b94bf6d](https://github.com/VirtoCommerce/vc-shell/commit/b94bf6db1020fdc904c3bc8d9a9181e9becef7fe))
- first release ([5c3c607](https://github.com/VirtoCommerce/vc-shell/commit/5c3c607269a3b33478a4bf23b6486ca8b01157a2))
- first release ([6685f10](https://github.com/VirtoCommerce/vc-shell/commit/6685f10f98982038206a55b637dc14628a341088))
- redesign alpha5 ([ac430b8](https://github.com/VirtoCommerce/vc-shell/commit/ac430b80f684d3b920c35778a83c33ec387b2484))
- redesign alpha4 wip ([ac48f52](https://github.com/VirtoCommerce/vc-shell/commit/ac48f526f61e85518a238e1e6b49047ff3fcc786))
- partial redesign ([846e215](https://github.com/VirtoCommerce/vc-shell/commit/846e2152c6e48753622ca7cf3a71300323c99d51))

### Code Refactoring

- menu service and new SVG icons, alpha6 ([df10c9f](https://github.com/VirtoCommerce/vc-shell/commit/df10c9f54678c4a5f0a9752d9889d4acc2d4a29e))

### BREAKING CHANGES

- first release
- first release

## [1.0.341](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.0-alpha.2...v1.0.341) (2025-03-11)

### Features

- **global style:** update base styles with Roboto font and tailwind configurations ([51722bf](https://github.com/VirtoCommerce/vc-shell/commit/51722bff7933816d2cbab9fecb7a7c05fcb8d2d3))

## [1.1.0-alpha.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.340...v1.1.0-alpha.2) (2025-02-25)

### Features

- partial redesign ([846e215](https://github.com/VirtoCommerce/vc-shell/commit/846e2152c6e48753622ca7cf3a71300323c99d51))

## [1.0.340](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.339...v1.0.340) (2025-02-06)

### Features

- **vc-app:** add logo append slot to app bar and app components ([74018b3](https://github.com/VirtoCommerce/vc-shell/commit/74018b34dd10127e62413f00bc75c34254067b4d))
- **vc-image:** add HTTPS URL conversion for secure image loading ([b38c31a](https://github.com/VirtoCommerce/vc-shell/commit/b38c31ad0c06ff9e22cb80e5bd9d13a0f0b2f3d6))
- **useSettings:** improve UI customization settings handling ([0a5c38d](https://github.com/VirtoCommerce/vc-shell/commit/0a5c38daa9f9fbea4eb7f60b481253c78b5bca62))

### Bug Fixes

- **vc-table:** prevent potential null reference in table state key ([9b6c2da](https://github.com/VirtoCommerce/vc-shell/commit/9b6c2da2762c6e423557ba44139b0a4ec053dc64))
- **login:** improve error handling for incorrect credentials ([d9464d0](https://github.com/VirtoCommerce/vc-shell/commit/d9464d0e824f298800730a433bdc63ff2c1f246f))

## [1.0.339](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.338...v1.0.339) (2025-02-05)

### Code Refactoring

- **modularity:** improve extension type handling and type safety ([06ea8ad](https://github.com/VirtoCommerce/vc-shell/commit/06ea8ad060f51330dba6778b4fea77d98029c1d0))

## [1.0.338](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.337...v1.0.338) (2025-02-05)

### Features

- **login:** add support for after-form extensions ([6addffd](https://github.com/VirtoCommerce/vc-shell/commit/6addffdc05384cafd360c1f147d227e0691b407c))
- **modularity:** enhance dynamic module loading and extension support ([309739e](https://github.com/VirtoCommerce/vc-shell/commit/309739eb7aa965530647cc50d4820b5d2e0541f3))

## [1.0.337](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.336...v1.0.337) (2025-01-29)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.336](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.335...v1.0.336) (2025-01-29)

### Features

- **useAssets:** add configurable asset key for removal ([2abe831](https://github.com/VirtoCommerce/vc-shell/commit/2abe8310b4a1b203aa5cc811422cc7ad6430e2a5))

### Bug Fixes

- **routing:** improve authentication route guard using meta flag ([200b150](https://github.com/VirtoCommerce/vc-shell/commit/200b1501519b0d48f8abd9b062a13e9c2db2d2b9))

## [1.0.335](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.334...v1.0.335) (2025-01-22)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.334](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.333...v1.0.334) (2025-01-22)

### Bug Fixes

- locale typo fix ([af3e87a](https://github.com/VirtoCommerce/vc-shell/commit/af3e87ab0135816f91961c23cb5c0881720d2c04))

## [1.0.333](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.332...v1.0.333) (2025-01-21)

### Bug Fixes

- **vc-table:** noHeaderCheckbox hide only checkbox ([99f072a](https://github.com/VirtoCommerce/vc-shell/commit/99f072a19e0d8f46fe8a9bc317553591aa360b61))

## [1.0.332](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.331...v1.0.332) (2025-01-21)

### Bug Fixes

- param clearing fix ([d906aa1](https://github.com/VirtoCommerce/vc-shell/commit/d906aa173cc3d87f8a29460e0654e5b0d41bae72))

## [1.0.331](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.330...v1.0.331) (2025-01-21)

### Features

- **vc-table:** noHeaderCheckbox prop ([5447efa](https://github.com/VirtoCommerce/vc-shell/commit/5447efaed36772a9421791aded9e1bbaddeeb892))

## [1.0.330](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.329...v1.0.330) (2024-12-19)

### Bug Fixes

- **navigation:** param reset fix ([1ff50cc](https://github.com/VirtoCommerce/vc-shell/commit/1ff50ccd22b09263799ebf8741132eb379b396b0))

## [1.0.329](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.328...v1.0.329) (2024-12-04)

### Features

- vc-1504 blade error content copy ([bba7a11](https://github.com/VirtoCommerce/vc-shell/commit/bba7a116ac3b23c40b6157de1fc01fc41b09adbd))

### Code Refactoring

- notifications template click handler ([cb3ac18](https://github.com/VirtoCommerce/vc-shell/commit/cb3ac18c5f2acc54f50a292160493053337dc701))
- signalR creator injection key ([192caa1](https://github.com/VirtoCommerce/vc-shell/commit/192caa145f39775bca5e69231ba9e400431a474e))

## [1.0.328](https://github.com/VirtoCommerce/vc-shell/compare/v1.1.0-alpha.1...v1.0.328) (2024-11-14)

**Note:** Version bump only for package @vc-shell/framework

## [1.1.0-alpha.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.327...v1.1.0-alpha.1) (2024-11-13)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.327](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.326...v1.0.327) (2024-11-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.326](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.325...v1.0.326) (2024-11-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.325](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.324...v1.0.325) (2024-11-08)

### Bug Fixes

- **core:** sso fixes ([decbec2](https://github.com/VirtoCommerce/vc-shell/commit/decbec29ae48deca6183e8f92e1155f5faced943))

## [1.0.324](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.323...v1.0.324) (2024-11-06)

### Bug Fixes

- **core:** dynamic loader fix ([503408c](https://github.com/VirtoCommerce/vc-shell/commit/503408c68852d2660b6ecaf06f0b818ece474d69))

## [1.0.323](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.322...v1.0.323) (2024-11-05)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.322](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.321...v1.0.322) (2024-11-05)

### Features

- **signalR:** creator update method ([6e78664](https://github.com/VirtoCommerce/vc-shell/commit/6e78664f71201b60069d1dd806db8491fd656db5))
- **core:** push subscription, setNotificationHandler as watcher replacement ([8c726fc](https://github.com/VirtoCommerce/vc-shell/commit/8c726fc315d52958201107cfdd101dbbf698c697))

## [1.0.321](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.320...v1.0.321) (2024-10-23)

### Bug Fixes

- **shared:** clear param fix ([eeca977](https://github.com/VirtoCommerce/vc-shell/commit/eeca97759c2d5e5de91c85d24a71795739cf7336))

## [1.0.320](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.319...v1.0.320) (2024-10-21)

### Features

- **shared:** user email tooltip ([4f69f57](https://github.com/VirtoCommerce/vc-shell/commit/4f69f5764c4fba0f5f6a4753d79d308b8021c12b))

### Bug Fixes

- **ui:** vc-blade action 50% header width ([611f8f4](https://github.com/VirtoCommerce/vc-shell/commit/611f8f48fda9a59228cfd7d4c29dbaf68c0d2443))
- **dynamic:** multilanguage selector color ([83afdd3](https://github.com/VirtoCommerce/vc-shell/commit/83afdd3a29f9b0d33f4491df3816c58ee5208bbe))

## [1.0.319](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.318...v1.0.319) (2024-10-18)

### Bug Fixes

- **navigation:** fix param ([2e07a2d](https://github.com/VirtoCommerce/vc-shell/commit/2e07a2d6c5343b1ad3b2efc858d9d86ef1db316c))

## [1.0.318](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.317...v1.0.318) (2024-10-18)

### Features

- refactored multilanguage selector ([fef81c0](https://github.com/VirtoCommerce/vc-shell/commit/fef81c0d647465a3c81b667fc2df54ffce6d2f84))

## [1.0.317](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.316...v1.0.317) (2024-10-17)

### Features

- **dynamic:** added support of loader method ([2166d1b](https://github.com/VirtoCommerce/vc-shell/commit/2166d1b55fbed6b18653d1fa012fa5d1319c777f))

## [1.0.316](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.315...v1.0.316) (2024-10-17)

### Bug Fixes

- **ui:** vc-multivalue prevent symbols in num/int ([3b83ca5](https://github.com/VirtoCommerce/vc-shell/commit/3b83ca56202fdc1f630e1d8ecd79b621c75e6bf6))

## [1.0.315](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.314...v1.0.315) (2024-10-17)

### Features

- **shared:** user info in mobile user sidebar ([2b49635](https://github.com/VirtoCommerce/vc-shell/commit/2b496353667ca20795bf33cb5ea68dfa20ac11be))
- **shared:** sidebar header component in slot ([1cca848](https://github.com/VirtoCommerce/vc-shell/commit/1cca8489734b52c68024d380bd378cf4af814361))

### Bug Fixes

- **dynamic:** fix emitting of edited data ([2a17d42](https://github.com/VirtoCommerce/vc-shell/commit/2a17d42fbd6c02f524be06723b9aceb8d36ed8ca))
- **ui:** prevent + sign in input type num/int ([885294d](https://github.com/VirtoCommerce/vc-shell/commit/885294d69ceaea06e16f595195f0472acc06d89d))

## [1.0.314](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.313...v1.0.314) (2024-10-16)

### Features

- **dynamic:** normaliza data in isModified calculation ([2389032](https://github.com/VirtoCommerce/vc-shell/commit/238903269ae31ce62169260f7c164ac580d4f519))

## [1.0.313](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.312...v1.0.313) (2024-10-15)

### Bug Fixes

- **ui:** logo height fix ([b24bb02](https://github.com/VirtoCommerce/vc-shell/commit/b24bb0237cdb770a94d5df7f8be4c397ace4d159))

## [1.0.312](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.311...v1.0.312) (2024-10-15)

### Features

- **ui:** user info as sidebar ([f04c8c6](https://github.com/VirtoCommerce/vc-shell/commit/f04c8c66f8010cfc7bcec93c67f272859530b65e))

### Bug Fixes

- **dynamic:** overrides fix, redundant comments remove ([3de9436](https://github.com/VirtoCommerce/vc-shell/commit/3de94367320ef81e3b518e9f085205a9684df20a))

## [1.0.311](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.310...v1.0.311) (2024-10-11)

### Features

- **ui:** vc-table scroll to top on page change, column switcher modes ([3c7c353](https://github.com/VirtoCommerce/vc-shell/commit/3c7c3533abf5f3f03fada20d5a9693f135517ad6))

### Bug Fixes

- **ui/vc-blade:** adjust error button styles for improved visibility and consistency ([f9db7da](https://github.com/VirtoCommerce/vc-shell/commit/f9db7da7f9da0f8fac6a6b488fa983621389649b))
- **ui/vc-pagination:** enhance pagination item styles with hover effects and cursor pointer ([b89296f](https://github.com/VirtoCommerce/vc-shell/commit/b89296f23bc826ada4cb0196f8ffb937657013d4))
- **dynamic/filter-builder:** exclude 'skip' property from query parameters in search function ([0591359](https://github.com/VirtoCommerce/vc-shell/commit/0591359508f9c72ef3a44550cf8c336f23288d0b))
- **ui:** update status field styles and color variables for improved visibility ([00a4c3f](https://github.com/VirtoCommerce/vc-shell/commit/00a4c3f464f5883c98337aecc9161036f423acf7))
- **error-handler:** improve error handling and message extraction ([15f68b4](https://github.com/VirtoCommerce/vc-shell/commit/15f68b4219172226c149430ecf4f5687a6b9e0ab))

## [1.0.310](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.309...v1.0.310) (2024-10-11)

### Bug Fixes

- **ui:** user dropdown button full name ([44f411f](https://github.com/VirtoCommerce/vc-shell/commit/44f411fc30be3c859416eb232efa633200f05b71))
- **dynamic:** isModified undef/null equality ([1756fbb](https://github.com/VirtoCommerce/vc-shell/commit/1756fbb66206bfb5d200859ebcbff8e1a4c3bc5f))

## [1.0.309](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.308...v1.0.309) (2024-10-09)

### Features

- **dynamic:** mixin in list ([c6d954d](https://github.com/VirtoCommerce/vc-shell/commit/c6d954d77643d303fde3333352b023891f5222ef))

## [1.0.308](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.307...v1.0.308) (2024-10-08)

### Bug Fixes

- **core:** dynamic module add fix ([9d458ca](https://github.com/VirtoCommerce/vc-shell/commit/9d458ca08da8ad2bab835caa803f89b10b096ef8))

## [1.0.307](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.306...v1.0.307) (2024-10-07)

### Bug Fixes

- **UI:** vc-table flex important ([ebc01dc](https://github.com/VirtoCommerce/vc-shell/commit/ebc01dccecf20ba182300a86010acc1882b0ec17))

## [1.0.306](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.305...v1.0.306) (2024-10-07)

### Features

- md-editor-v3 instead quill, info popup, clickable form table ([aebb563](https://github.com/VirtoCommerce/vc-shell/commit/aebb563e4dd7819a3ae91eb7ce2cc5629234a9ab))

## [1.0.305](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.304...v1.0.305) (2024-10-04)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.304](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.303...v1.0.304) (2024-10-04)

### Bug Fixes

- **shared:** notification flex container ([e253f8c](https://github.com/VirtoCommerce/vc-shell/commit/e253f8cceebac0e0324befef121b9a03830518b8))

## [1.0.303](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.302...v1.0.303) (2024-10-04)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.302](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.301...v1.0.302) (2024-10-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.301](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.300...v1.0.301) (2024-10-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.300](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.299...v1.0.300) (2024-10-01)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.299](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.298...v1.0.299) (2024-10-01)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.298](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.297...v1.0.298) (2024-10-01)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.297](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.296...v1.0.297) (2024-10-01)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.296](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.295...v1.0.296) (2024-10-01)

### Bug Fixes

- providers ([f47bab9](https://github.com/VirtoCommerce/vc-shell/commit/f47bab93feaaddc717617d79537bb41dbc14e55f))

## [1.0.295](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.294...v1.0.295) (2024-10-01)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.294](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.293...v1.0.294) (2024-10-01)

### Features

- **dynamic:** mixin support, refactor of module registering ([70589c9](https://github.com/VirtoCommerce/vc-shell/commit/70589c9a9044af31ffbbb66189bd96456a3e5d0c))
- **ui:** vc-table resizing, state saving improvements ([cd402b1](https://github.com/VirtoCommerce/vc-shell/commit/cd402b14e1442d8072b7572959eb2b6c97218fac))
- locale flag ([0dc7f74](https://github.com/VirtoCommerce/vc-shell/commit/0dc7f740ed24acee2dfd7efbb0880d9b4e7ab4c7))

### Bug Fixes

- **ui:** components fixes and updates ([37148ec](https://github.com/VirtoCommerce/vc-shell/commit/37148ec889065d7e76c7c3466f5bc23a86080389))
- **ui:** sidebar component optional position prop ([61a7018](https://github.com/VirtoCommerce/vc-shell/commit/61a7018f88d42f0a84c6d3fbe9b3318f94152c99))

### Code Refactoring

- external providers ([c39f9d0](https://github.com/VirtoCommerce/vc-shell/commit/c39f9d0e134f5e1207eed4aee77a76ba4763aa60))

## [1.0.293](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.292...v1.0.293) (2024-09-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.292](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.291...v1.0.292) (2024-09-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.291](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.290...v1.0.291) (2024-09-23)

### Features

- support of css theming ([dba4097](https://github.com/VirtoCommerce/vc-shell/commit/dba409744b57dd1a999e009700e3b356fe230969))

## [1.0.290](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.289...v1.0.290) (2024-09-13)

### Features

- **shared:** user-dropdown-button - add baseMenuItemsHandler prop and handle default menu items ([e5f4017](https://github.com/VirtoCommerce/vc-shell/commit/e5f40174dae9445ed074493d824e3c95c37c7150))

## [1.0.289](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.288...v1.0.289) (2024-09-10)

### Code Refactoring

- **dynamic:** add isWidgetView to ListComposableArgs interface ([1a3b1b2](https://github.com/VirtoCommerce/vc-shell/commit/1a3b1b2017ec2b089e745a1121a34a24ff6c1d34))

## [1.0.288](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.287...v1.0.288) (2024-09-09)

### Code Refactoring

- improve headerCheckbox calculation in vc-table.vue ([10caec1](https://github.com/VirtoCommerce/vc-shell/commit/10caec1ad2b7aa6a017f8db84e9cf6dd1d956048))
- extract currentPage from props ([d276958](https://github.com/VirtoCommerce/vc-shell/commit/d276958368255a8e03faa76cf2ed46d8c827c147))

## [1.0.287](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.286...v1.0.287) (2024-09-06)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.286](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.285...v1.0.286) (2024-09-06)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.285](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.284...v1.0.285) (2024-09-06)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.284](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.283...v1.0.284) (2024-09-06)

### Features

- **dynamic:** dynamic-blade-list grid component ability to config externally ([692d354](https://github.com/VirtoCommerce/vc-shell/commit/692d354302452be5b90454377144c0ca0bb515fd))

### Code Refactoring

- **vc-table:** improve mobile view and disable selection for certain items ([0e77520](https://github.com/VirtoCommerce/vc-shell/commit/0e7752020261d4c963b2939fc8b41204b6be82f9))

## [1.0.283](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.282...v1.0.283) (2024-09-03)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.282](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.281...v1.0.282) (2024-08-30)

### Features

- **dynamic:** vc-table expandable header slot ([9a3cd40](https://github.com/VirtoCommerce/vc-shell/commit/9a3cd407d3ba1125c38f3d7a7a296923a1a5a8be))
- **shared:** toast notification container and core to support component content ([7c17099](https://github.com/VirtoCommerce/vc-shell/commit/7c17099cbb4f797c009282a3af74c655a8c4f8c8))

## [1.0.281](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.280...v1.0.281) (2024-08-29)

### Features

- vm-1464 bgimage for change password page ([5259707](https://github.com/VirtoCommerce/vc-shell/commit/525970745a95e94483ace2cfad507b67e49892ac))

## [1.0.280](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.279...v1.0.280) (2024-08-28)

### Features

- vm-1464 expired password change form ([4645cba](https://github.com/VirtoCommerce/vc-shell/commit/4645cba7ecc1844b9cd12bb95baf760871b44053))

## [1.0.279](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.278...v1.0.279) (2024-08-27)

### Bug Fixes

- **create-vc-app:** update currency option in details.vue and dynamic-blade-list.vue ([40a363a](https://github.com/VirtoCommerce/vc-shell/commit/40a363a292457d0f74e961a342909ed6f425d3b4))

## [1.0.278](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.277...v1.0.278) (2024-08-27)

### Bug Fixes

- **ui:** vc-app-menu-link truncating ([e7fe836](https://github.com/VirtoCommerce/vc-shell/commit/e7fe836e8e28d9ec92469f8bdf7dc8353104363f))

## [1.0.277](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.276...v1.0.277) (2024-08-22)

### Bug Fixes

- **ui:** adjust min-width and max-width for dp--tp-wrap to prevent timepicker overflow ([b606d9a](https://github.com/VirtoCommerce/vc-shell/commit/b606d9a9ad3026a38d7230550b8ed71194b18d54))

## [1.0.276](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.275...v1.0.276) (2024-08-22)

### Features

- **ui:** vc-table highlight multiselected rows vm-1431 ([67dde13](https://github.com/VirtoCommerce/vc-shell/commit/67dde13314a4e8ae906f737dea03c10fa39e5273))
- **dynamic:** InputField exposed datePickerOptions prop ([2ce0972](https://github.com/VirtoCommerce/vc-shell/commit/2ce0972beab48e2655795d7630e881053d10b042))

## [1.0.275](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.274...v1.0.275) (2024-08-20)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.274](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.273...v1.0.274) (2024-08-19)

### Bug Fixes

- **ui:** vc-pagination pagesToShow logic refactor ([92153d8](https://github.com/VirtoCommerce/vc-shell/commit/92153d8a91990274682fca1490cdc5a9cc9e784a))

## [1.0.273](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.272...v1.0.273) (2024-08-16)

### Bug Fixes

- remove vcmp locales, scope variables to mayberef ([a2c29d1](https://github.com/VirtoCommerce/vc-shell/commit/a2c29d1cf60d065f8dd38fdea731455fbb5ce1ec))

## [1.0.272](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.271...v1.0.272) (2024-08-13)

### Bug Fixes

- **dynamic:** TableSchema interface fix ([d3c4c40](https://github.com/VirtoCommerce/vc-shell/commit/d3c4c4061f285db8b8c26f7bcf0dfc1d6956fb23))

## [1.0.271](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.270...v1.0.271) (2024-08-13)

### Features

- **ui,dynamic:** vc-table external access to selectedIds, searchValue ([33ddec1](https://github.com/VirtoCommerce/vc-shell/commit/33ddec108d88cb118f29102de11d55a7111eb838))

## [1.0.270](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.269...v1.0.270) (2024-08-13)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.269](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.268...v1.0.269) (2024-08-09)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.268](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.267...v1.0.268) (2024-08-02)

### Features

- vm-763 display user role ([6d98e13](https://github.com/VirtoCommerce/vc-shell/commit/6d98e1364d003156d71db73a12ce2ee529d41eee))

## [1.0.267](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.266...v1.0.267) (2024-08-02)

### Bug Fixes

- **ui:** vc-pagination show jump if pages > 5 ([1523282](https://github.com/VirtoCommerce/vc-shell/commit/1523282abd92d4af4a346b2529f2437172a22e00))

## [1.0.266](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.265...v1.0.266) (2024-08-02)

### Features

- **ui:** improved vc-pagination vm-1430 ([2119b72](https://github.com/VirtoCommerce/vc-shell/commit/2119b72fbd232bdaca9adc0ecb7693aee3a6ac42))

## [1.0.265](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.264...v1.0.265) (2024-08-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.264](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.263...v1.0.264) (2024-08-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.263](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.262...v1.0.263) (2024-07-31)

### Features

- **ui:** sanitize vc-editor content to prevent XSS attacks ([0b625f9](https://github.com/VirtoCommerce/vc-shell/commit/0b625f93e26a576ebf04141246b9d8e2ae659c3c))

## [1.0.262](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.261...v1.0.262) (2024-07-31)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.261](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.260...v1.0.261) (2024-07-26)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.260](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.259...v1.0.260) (2024-07-26)

### Features

- **ui:** vc-select truncating ([ba67161](https://github.com/VirtoCommerce/vc-shell/commit/ba6716135fa55e17c5670964efef70e01d94c195))

## [1.0.259](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.258...v1.0.259) (2024-07-25)

### Bug Fixes

- **dynamic:** editable blade condition fix ([c446afa](https://github.com/VirtoCommerce/vc-shell/commit/c446afaf736db86a9b4e0618d200376fae242fff))

## [1.0.258](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.257...v1.0.258) (2024-07-24)

### Features

- **dynamic:** grid blade editable table ([5b41467](https://github.com/VirtoCommerce/vc-shell/commit/5b414675c1148fb8652c0125253a882b1f9a665e))

## [1.0.257](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.256...v1.0.257) (2024-07-23)

### Features

- **core:** memoize opened nested nav groups ([20942b0](https://github.com/VirtoCommerce/vc-shell/commit/20942b0ffbe440cbf607e821314078aa1972083c))
- **ui:** widgets 2 line/equal height vm-1442, fix table breadcrumbs position ([53a801b](https://github.com/VirtoCommerce/vc-shell/commit/53a801b68743161391e48de77db7ed0e72da1abf))

## [1.0.256](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.255...v1.0.256) (2024-07-12)

### Bug Fixes

- **core:** fix useDynamicModules error ([f85b5ec](https://github.com/VirtoCommerce/vc-shell/commit/f85b5ecf0d9b39c66b1389796ad453aaae3800da))

## [1.0.255](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.254...v1.0.255) (2024-07-12)

### Bug Fixes

- **core:** useDynamicModules fix ([b38d966](https://github.com/VirtoCommerce/vc-shell/commit/b38d9668b410d7bbb0d798f2218f2b6051416cc9))

## [1.0.254](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.253...v1.0.254) (2024-07-12)

### Features

- dynamic module loader ([4d15575](https://github.com/VirtoCommerce/vc-shell/commit/4d15575bb5448e16b4034782bafc7097189742f1))

## [1.0.253](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.252...v1.0.253) (2024-07-12)

### Features

- **shared:** update login logic to redirect to the previous page after successful login ([8701044](https://github.com/VirtoCommerce/vc-shell/commit/8701044315a7b13609474e00e83a069d542bb256))

## [1.0.252](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.251...v1.0.252) (2024-07-08)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.251](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.250...v1.0.251) (2024-07-08)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.250](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.249...v1.0.250) (2024-07-08)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.249](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.248...v1.0.249) (2024-07-05)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.248](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.247...v1.0.248) (2024-07-03)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.247](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.246...v1.0.247) (2024-07-01)

### Bug Fixes

- **useAppInsights:** add return if appInsights is not active ([5724a14](https://github.com/VirtoCommerce/vc-shell/commit/5724a1437f95e726216079f7a77b976434436b51))

## [1.0.246](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.245...v1.0.246) (2024-06-28)

### Features

- add useAppInsights composable for application insights pageview logging ([7c030d6](https://github.com/VirtoCommerce/vc-shell/commit/7c030d6947529a93f0476adc9d59b94336c3580b))

## [1.0.245](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.244...v1.0.245) (2024-06-28)

### Bug Fixes

- **ui:** fix vc-table cell hover behavior and cell opacity ([8548032](https://github.com/VirtoCommerce/vc-shell/commit/85480323eadc982344684be5c57e1f900659eb80))

## [1.0.244](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.243...v1.0.244) (2024-06-24)

### Features

- application insights logger ([536db4d](https://github.com/VirtoCommerce/vc-shell/commit/536db4db35c91f4fb566717d2d6c536e48aacc95))

## [1.0.243](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.242...v1.0.243) (2024-06-21)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.242](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.241...v1.0.242) (2024-06-21)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.241](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.240...v1.0.241) (2024-06-18)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.240](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.239...v1.0.240) (2024-06-18)

### Features

- **ui:** add delay for menu opening ([276f31d](https://github.com/VirtoCommerce/vc-shell/commit/276f31d99c7a58a3610b3b36fe2188902bd3e6e4))

### Bug Fixes

- **dynamic:** clear selectedIds after executing custom action ([4591f9b](https://github.com/VirtoCommerce/vc-shell/commit/4591f9b030d6277e1f77b92857679367759b49d1))

## [1.0.239](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.238...v1.0.239) (2024-06-18)

### Bug Fixes

- **ui:** fixed flickering when hover on tooltip ([df11271](https://github.com/VirtoCommerce/vc-shell/commit/df112712cd8542a6a69fd0f3eda38d3040936df1))

## [1.0.238](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.237...v1.0.238) (2024-06-17)

### Features

- improve loading directive with dynamic z-index support ([c3c8c63](https://github.com/VirtoCommerce/vc-shell/commit/c3c8c63fa48facf640e182405938bb83f5b5087b))
- **ui:** vm-1411 ([25a9096](https://github.com/VirtoCommerce/vc-shell/commit/25a909603c33dc0c0a05f76681a13eba46f3bab4))
- **ui:** extend vc-input slots with focus prop ([e0d42b7](https://github.com/VirtoCommerce/vc-shell/commit/e0d42b790571ca8de220c857b67cf143e3d2d024))
- **ui:** update vc-breadcrumbs-item title style and truncate long titles ([9bd8729](https://github.com/VirtoCommerce/vc-shell/commit/9bd8729161a0e3188ae57acf10e95a301abbe8bb))

### Bug Fixes

- **navigation:** show router pages via RouterView only if it's not blades ([59d41a0](https://github.com/VirtoCommerce/vc-shell/commit/59d41a0059101350b230a7c07144b1641546f1f8))

## [1.0.237](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.236...v1.0.237) (2024-06-17)

### Features

- vm-1348 avatar for user ([9caf962](https://github.com/VirtoCommerce/vc-shell/commit/9caf962bd881611744ea1849155475b897049df6))

## [1.0.236](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.235...v1.0.236) (2024-06-17)

### Features

- **ui:** improve menu item styling and behavior ([6b56988](https://github.com/VirtoCommerce/vc-shell/commit/6b569881ef7b4e91dc32adf71380bb3c15f7be75))
- **ui:** update vc-breadcrumbs-item title style and truncate long titles ([069ed6d](https://github.com/VirtoCommerce/vc-shell/commit/069ed6d4ca738599b5bf954f07ba6749cd04f8b5))

### Bug Fixes

- **ui:** do not shrink checkbox in first col ([e8c8071](https://github.com/VirtoCommerce/vc-shell/commit/e8c807170846c3c0c06c7e1a5004adf1fb7851e8))
- **shared:** update asset manager table column widths ([83195cb](https://github.com/VirtoCommerce/vc-shell/commit/83195cb6ee271f2adbfcc81fadbe47f8495fa08e))

## [1.0.235](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.234...v1.0.235) (2024-06-17)

### Features

- **dynamic:** add custom gallery file upload text ([1e5e02a](https://github.com/VirtoCommerce/vc-shell/commit/1e5e02aaa6f7c110015b85874a81c52e0b5da978))
- **ui:** update vc-checkbox component to support different sizes ([ff809b9](https://github.com/VirtoCommerce/vc-shell/commit/ff809b9eac19f20a38771db46c92943fff267978))

### Bug Fixes

- **ui:** ensure pull-to-reload works only on mobile and when scrolled to the top of the list ([4bb1faf](https://github.com/VirtoCommerce/vc-shell/commit/4bb1faf259152ec8b0772a4ff78ec5c9ba8b7757))

### Code Refactoring

- **ui:** scrollbar styles update ([47f75bb](https://github.com/VirtoCommerce/vc-shell/commit/47f75bb3eb3b519a564b28c100d0a363aaa382d8))
- **shared:** update title class to include tw-break-all ([5c49b1c](https://github.com/VirtoCommerce/vc-shell/commit/5c49b1c9a112697f9912b82aa516c7c33de51b5d))
- **shared:** remove edit action from asset table ([e554369](https://github.com/VirtoCommerce/vc-shell/commit/e554369481f6f278266f56b38d50727ef6a91fc8))
- **core,ui:** update menu item styling and behavior, groupIcon instead icon for menu groups ([a16e667](https://github.com/VirtoCommerce/vc-shell/commit/a16e667ccf4ce1228a0c6d00242cb99217ca2064))
- **ui:** update vc-table component styling and behavior ([3575a1b](https://github.com/VirtoCommerce/vc-shell/commit/3575a1b1b8c96129e6f5c628c4ca5650631ba1e0))
- **dynamic:** update blade form and widget components ([935f1c3](https://github.com/VirtoCommerce/vc-shell/commit/935f1c3f09957ee0ea61c20364c61d9506db7c19))

## [1.0.234](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.233...v1.0.234) (2024-06-13)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.233](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.232...v1.0.233) (2024-06-13)

### Features

- **dynamic:** add custom gallery upload icon ([8e029f5](https://github.com/VirtoCommerce/vc-shell/commit/8e029f55b84240665b2516ae6f21c688d1e1ac6b))
- **ui:** vc-image custom icon ([4c14e35](https://github.com/VirtoCommerce/vc-shell/commit/4c14e3574519ba0e31a30e314952ac5a85d348a5))
- **ui:** improve vc-badge component styling and functionality ([ff9fc51](https://github.com/VirtoCommerce/vc-shell/commit/ff9fc51f7b367ce4c384f21d86412a5b0f0801c8))
- **ui:** updated navigation menu vm-1371 ([33b229e](https://github.com/VirtoCommerce/vc-shell/commit/33b229eea39681914c1a974aa4464788d6e13a51))
- **shared:** vm-1393 icons in the account menu ([da442a1](https://github.com/VirtoCommerce/vc-shell/commit/da442a1d5fca234f63fa918e89fc171caa3f4162))
- **dynamic:** improve blade form widget rendering ([139285c](https://github.com/VirtoCommerce/vc-shell/commit/139285c5da88bea460fbef45671b6eea439fe51b))
- **ui:** vc-table improvements vm-1370 vm-1389 ([ce9beec](https://github.com/VirtoCommerce/vc-shell/commit/ce9beecac5a217fd5e8acccd3486b20a166b1fac))
- **dynamic:** expand/collapse status vm-1383 ([6527080](https://github.com/VirtoCommerce/vc-shell/commit/652708052f5148f29d46b2e133589b9913682faa))

### Bug Fixes

- **ui:** vc-editor handle empty text value in onTextChange function ([c71bbda](https://github.com/VirtoCommerce/vc-shell/commit/c71bbda701bc0eaa7583bb43306b0110774e50db))

## [1.0.232](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.231...v1.0.232) (2024-06-07)

### Features

- prevent entering negative numbers in vc-input-currency and vc-input components ([b82a9e4](https://github.com/VirtoCommerce/vc-shell/commit/b82a9e47c26d06c80eb5806aad8d99fdf9043cc1))
- **ui:** add "primary" variant to vc-status component ([e3e1544](https://github.com/VirtoCommerce/vc-shell/commit/e3e154477cf15ae69c0e5cb203eec82160265610))

### Bug Fixes

- **ui:** vc-table columns reordering fix ([48b4994](https://github.com/VirtoCommerce/vc-shell/commit/48b499480f208db81b97de4e5638c8079b6eb98e))

## [1.0.231](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.230...v1.0.231) (2024-06-05)

### Features

- vc-input-currency decimal precision ([c278a90](https://github.com/VirtoCommerce/vc-shell/commit/c278a90248888bd63f275908d5379a3fdcd7fc0a))

## [1.0.230](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.229...v1.0.230) (2024-06-05)

### Features

- refactor InputCurrency component to handle currency display option ([f11a193](https://github.com/VirtoCommerce/vc-shell/commit/f11a193289c0992444ff11e3c0c16970693c5bb0))

## [1.0.229](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.228...v1.0.229) (2024-06-05)

### Features

- **dynamic:** permissions prop in controls/toolbar ([5230a23](https://github.com/VirtoCommerce/vc-shell/commit/5230a235acd049cb19613a3ac855f26b3bffb146))

## [1.0.228](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.227...v1.0.228) (2024-06-05)

### Code Refactoring

- **dynamic:** update useDetailsFactory to use modified flag instead of dirty flag ([317fcb4](https://github.com/VirtoCommerce/vc-shell/commit/317fcb499df7f4897a681fe27873ed7c5eca73c6))

## [1.0.227](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.226...v1.0.227) (2024-06-04)

### Bug Fixes

- **ui:** vc-table add last column resizer ([f63a7a0](https://github.com/VirtoCommerce/vc-shell/commit/f63a7a010366fd55fc0add08701d0d983fe4280a))

## [1.0.226](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.225...v1.0.226) (2024-06-04)

### Features

- **dynamic:** add onBlur event handler to dynamic form controls ([1543d4f](https://github.com/VirtoCommerce/vc-shell/commit/1543d4f7816a3e5c67ea842c0a545b9d14e0e72b))

### Bug Fixes

- reset dirty validation with update of initial ([a4f820c](https://github.com/VirtoCommerce/vc-shell/commit/a4f820c3ab71296f334a3192069dcf6771031018))
- **ui:** vc-table mobile view fixes ([08f6474](https://github.com/VirtoCommerce/vc-shell/commit/08f647471732d875eacf4d5f2907eb75686b7c4d))

## [1.0.225](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.224...v1.0.225) (2024-06-04)

### Features

- update useDetailsFactory to reset dirty validation state ([a037847](https://github.com/VirtoCommerce/vc-shell/commit/a03784713e504231a13171a46a06ffa61b9cb117))

## [1.0.224](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.223...v1.0.224) (2024-06-04)

### Features

- **dynamic:** possibility to override default grid sorting ([0afecfb](https://github.com/VirtoCommerce/vc-shell/commit/0afecfb53cd114f099dd9296c47270031be72a4f))
- **dynamic:** updated vc-table ([c2ad3ff](https://github.com/VirtoCommerce/vc-shell/commit/c2ad3ffb4e6067342a1cd855fcabc07dd62e7d69))
- **dynamic:** add noRemoveConfirmation option to GalleryField's remove method ([caf6ac8](https://github.com/VirtoCommerce/vc-shell/commit/caf6ac82ad76821b15f580660c10c0cae3f548e5))
- **ui:** vc-editor color, background, reset buttons ([f7fa19c](https://github.com/VirtoCommerce/vc-shell/commit/f7fa19c2700f302c264b2e914e557b623324c213))
- **ui:** vc-container ptr smooth transitions ([e7ae279](https://github.com/VirtoCommerce/vc-shell/commit/e7ae2793e2748290443b2218627f38045ca213d7))
- **navigation:** support of browser back/forward history buttons ([513375e](https://github.com/VirtoCommerce/vc-shell/commit/513375e66fde74db8bd05e8b7d799c8941f75396))
- **ui:** vc-table refactoring ([df652ae](https://github.com/VirtoCommerce/vc-shell/commit/df652ae4e75e266d427f7a500d815665107a078b))

### Bug Fixes

- vc-1359 ([fbd5d92](https://github.com/VirtoCommerce/vc-shell/commit/fbd5d92c5945694669ef3cb27e7f77faaa42795a))

### Code Refactoring

- **dynamic:** update useDetailsFactory to support resetting dirty state ([98bcf51](https://github.com/VirtoCommerce/vc-shell/commit/98bcf51ec3e9044f97e7d979ee6c27d5cb076833))

## [1.0.223](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.222...v1.0.223) (2024-05-29)

### Features

- **dynamic:** refactoring of scope, composable args interface, dynamic hint for some components BREAKING CHANGE: change scope in composables to be plain object instead refs. Also, if you want to extend scope, use lodash's merge method like: \_.merge(scope, {}) ([e6b8099](https://github.com/VirtoCommerce/vc-shell/commit/e6b8099a120cef9429896904947e13fdae670541))

## [1.0.222](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.221...v1.0.222) (2024-05-28)

### Code Refactoring

- Update Table component to use bladeContext in template rendering ([b600fb1](https://github.com/VirtoCommerce/vc-shell/commit/b600fb1fcb89a4bf647887c3fad3bfc863e22169))

## [1.0.221](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.220...v1.0.221) (2024-05-28)

### Features

- **dynamic:** Add hint text to input fields ([31b3ded](https://github.com/VirtoCommerce/vc-shell/commit/31b3ded3e7685085b9d9c9e398bddb7b9e7264e8))
- Update useToolbarReducer to handle toolbarItemCtx as an array or object ([cc598eb](https://github.com/VirtoCommerce/vc-shell/commit/cc598eb38570f617c5e241a6439fcb0e87885667))
- Add onCellBlur event handler to Table component ([946e020](https://github.com/VirtoCommerce/vc-shell/commit/946e020cee55defa3c73d26ae3860747b52e0b14))
- Add separator option to vc-blade-toolbar-button component ([3082483](https://github.com/VirtoCommerce/vc-shell/commit/30824839d1652311e2f2c1c2fcc74bd2a6cfb3ac))

## [1.0.220](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.219...v1.0.220) (2024-05-24)

### Features

- **dynamic:** Add support of footer template in dynamic views ([137c49a](https://github.com/VirtoCommerce/vc-shell/commit/137c49a6788dc68bd73766af6439ba4713ba05bf))
- **ui:** vc-tooltip component and refactor of vc-label ([1eafd03](https://github.com/VirtoCommerce/vc-shell/commit/1eafd036e4b693563d1987d41ae6de620def7d34))
- **dynamic:** inputCurrency getting options update' ([635de1d](https://github.com/VirtoCommerce/vc-shell/commit/635de1d3501efa163a013a53962083bf9794e66a))
- **ui:** update vc-input-currency component to support custom slots for prepend and append content ([4ae9f90](https://github.com/VirtoCommerce/vc-shell/commit/4ae9f906c7d89833b46aea7d4f3bb23a4ddb031b))
- **ui:** add clearable option to date input component in vc-dynamic-properties ([8efcb59](https://github.com/VirtoCommerce/vc-shell/commit/8efcb592c793152d728b36541fe1c3fe7a78d1d2))
- **ui, dynamic:** vc-table updates ([bcab837](https://github.com/VirtoCommerce/vc-shell/commit/bcab8371a8e33181b1faf4645fba76e3bb92853f))

## [1.0.219](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.218...v1.0.219) (2024-05-21)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.218](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.217...v1.0.218) (2024-05-21)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.217](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.216...v1.0.217) (2024-05-21)

### Bug Fixes

- message about edited blade is not displayed, fixed ([6b8e3a3](https://github.com/VirtoCommerce/vc-shell/commit/6b8e3a3f2245c442df7da788d7e6b0627cbcd79c))

## [1.0.216](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.215...v1.0.216) (2024-05-21)

### Features

- **dynamic:** support of blade modified state ([a2f9764](https://github.com/VirtoCommerce/vc-shell/commit/a2f97645f9512b36337483815073ca0c799bf341))
- **dynamic:** add vc-select, vc-radio-button-group, vc-switch components to grid filter builder ([8f0bc5b](https://github.com/VirtoCommerce/vc-shell/commit/8f0bc5b233a9dfd6cecf570b2328601c55cf6d29))
- **ui:** update vc-dynamic-property component to use VcSwitch for Boolean value type ([8fe513f](https://github.com/VirtoCommerce/vc-shell/commit/8fe513fb12d118151153be0cb7ce009987208d71))
- **ui:** vc-input update with new datepicker ([8a5a934](https://github.com/VirtoCommerce/vc-shell/commit/8a5a9342f9db2fb12c602d857e11e8cf9591d36e))
- show app version on login page ([0fe8da4](https://github.com/VirtoCommerce/vc-shell/commit/0fe8da4d78fa9fc9e03eb8490a2f051f850ad25e))
- **ui:** vc-table column switcher on hover at header ([5a5a131](https://github.com/VirtoCommerce/vc-shell/commit/5a5a131e1ba5bc539438c57e6f115d5331ec491b))
- **ui:** add support for SVG files in file upload component ([b7d1ecc](https://github.com/VirtoCommerce/vc-shell/commit/b7d1ecc8c78dabc27ae0044df2dffab02689ffa4))
- another view of modified status in blade ([fe6055a](https://github.com/VirtoCommerce/vc-shell/commit/fe6055a647a560339138286472815dce000ac75c))
- **ui,dynamic:** vc-radio-button component, storybook ([2061e21](https://github.com/VirtoCommerce/vc-shell/commit/2061e21673a93560d127a4c60c10fa0fc7eab8d2))
- **ui:** update styles of vc-checkbox component, move to molecules, storybook update ([2dd4ecc](https://github.com/VirtoCommerce/vc-shell/commit/2dd4eccf44ec489dd9678ec441a28ec99cacfcc1))

### Bug Fixes

- disable preserve of ui settings in useSettings ([b41ee37](https://github.com/VirtoCommerce/vc-shell/commit/b41ee371ab6e5e329e578206a39c2c819c4d0ed8))

## [1.0.215](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.214...v1.0.215) (2024-05-20)

### Features

- **navigation:** support of blade replacing, permissions check on generateRoute ([40d934c](https://github.com/VirtoCommerce/vc-shell/commit/40d934c056bebc1a023cc1498d40a2c672ec43dd))

## [1.0.214](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.213...v1.0.214) (2024-05-16)

### Features

- **ui:** has unsaved changes banner, updated switch ([5caa82b](https://github.com/VirtoCommerce/vc-shell/commit/5caa82bc68b599feeb205395aa55850230851f66))

## [1.0.213](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.212...v1.0.213) (2024-05-13)

### Features

- **dynamic:** factories sync methods, types update, grid item click separate method ([87cf7b8](https://github.com/VirtoCommerce/vc-shell/commit/87cf7b85e26c3304c9fe631697a897c27b5a7fae))
- **dynamic:** extend onListItemClick ([c45d2af](https://github.com/VirtoCommerce/vc-shell/commit/c45d2afaaa38a2be88d5926023e0446cabb33b09))

### Bug Fixes

- **dynamic:** update remove action in UseDetails to accept ItemId or Item ([3f8ebdf](https://github.com/VirtoCommerce/vc-shell/commit/3f8ebdfdb26378143579fde2a30489d77a62aa75))

## [1.0.212](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.211...v1.0.212) (2024-05-09)

### Bug Fixes

- fix param type ([059d80c](https://github.com/VirtoCommerce/vc-shell/commit/059d80c924f5a18fe9457994c49b77249c8a7890))

## [1.0.211](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.210...v1.0.211) (2024-05-09)

### Bug Fixes

- fix grid selection persistance on child blade close ([5e5ee3f](https://github.com/VirtoCommerce/vc-shell/commit/5e5ee3f70b27bed8c983dab092b610cf2cb78db7))

## [1.0.210](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.209...v1.0.210) (2024-05-08)

### Bug Fixes

- remove auto-open blade on param change, as it can lead to unpredictable behavior ([898e0d9](https://github.com/VirtoCommerce/vc-shell/commit/898e0d9ffc5812b71e8215a355c9ad0918c48dfe))

## [1.0.209](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.208...v1.0.209) (2024-05-07)

### Features

- img extensions, renaming vm-1315 ([cd02d04](https://github.com/VirtoCommerce/vc-shell/commit/cd02d04d924f9049521b2f116e0ed192f29ce981))
- support of edit mode for blade and vc-table vm-1312 ([b1c8daa](https://github.com/VirtoCommerce/vc-shell/commit/b1c8daae2255befdadd8a3012354ba3efa813e84))

## [1.0.208](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.207...v1.0.208) (2024-04-30)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.207](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.206...v1.0.207) (2024-04-30)

### Features

- vm-1309 decode uri asset file name ([cf290f6](https://github.com/VirtoCommerce/vc-shell/commit/cf290f624b81f6a4a61ab4a092b2f784e9c350b6))
- vm-1309 unescape asset file url ([d4fc236](https://github.com/VirtoCommerce/vc-shell/commit/d4fc23689e742b9da6a4bf01d34a16adc6fe91ad))

## [1.0.206](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.205...v1.0.206) (2024-04-30)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.205](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.204...v1.0.205) (2024-04-30)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.204](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.203...v1.0.204) (2024-04-30)

### Bug Fixes

- **navigation:** fixed loss of instance when opening the same workspace ([dda83bc](https://github.com/VirtoCommerce/vc-shell/commit/dda83bc4fd0a8b4583d0c9f607d0ba678fe3c0ff))

## [1.0.203](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.202...v1.0.203) (2024-04-25)

### Bug Fixes

- error fix ([2a106ba](https://github.com/VirtoCommerce/vc-shell/commit/2a106ba9ed958d6b1081d4c5c65324260b80f13a))

## [1.0.202](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.201...v1.0.202) (2024-04-25)

### Features

- **dynamic:** saveChanges response (#207) ([a05313b](https://github.com/VirtoCommerce/vc-shell/commit/a05313bd0fc5b25b927570c31e14aea69c4a5ddd))

### Bug Fixes

- **dynamic:** fixed set of value when property path has array index ([1ae24fc](https://github.com/VirtoCommerce/vc-shell/commit/1ae24fc859dda595e3e5d2251377f996b62c6ce9))

## [1.0.201](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.200...v1.0.201) (2024-04-23)

### Features

- **dynamic:** saveChanges response ([9d3f909](https://github.com/VirtoCommerce/vc-shell/commit/9d3f9091e15dad0498c680f7835a96c3e0fb5cac))

## [1.0.200](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.199...v1.0.200) (2024-04-23)

### Features

- **ui:** vc-multivalue input on blur, removed arrows with number type ([ff0b293](https://github.com/VirtoCommerce/vc-shell/commit/ff0b29305dd495f2f9577b34c122d33fb67596d0))

## [1.0.199](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.198...v1.0.199) (2024-04-22)

### Features

- **ui:** vc-multivalue integer type, loading state ([0535b21](https://github.com/VirtoCommerce/vc-shell/commit/0535b21b9c0bae213572b0320b28eac649df27bb))
- **ui:** vc-input integer type ([56f825d](https://github.com/VirtoCommerce/vc-shell/commit/56f825d59b081a0d268715e3b50623512b35a35d))
- **ui:** vc-select loading state improvement ([97be0b0](https://github.com/VirtoCommerce/vc-shell/commit/97be0b048f80908b7b9147210bc4eeb734a2dc5f))

### Bug Fixes

- **ui:** vc-breadcrumbs arrow color fix ([9ad6aa9](https://github.com/VirtoCommerce/vc-shell/commit/9ad6aa95863f0321e1a9c6575cd1b090a593c11e))
- vc-dynamic-properties refactoring ([3aaf821](https://github.com/VirtoCommerce/vc-shell/commit/3aaf8213716ddf4c1695dafce4fe826de35e3d7d))

## [1.0.198](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.197...v1.0.198) (2024-04-16)

### Features

- blade navigation breadcrumbs, useDynamicViewsUtils composable ([506cee1](https://github.com/VirtoCommerce/vc-shell/commit/506cee114479717b2745c8f85968249959eb16af))

## [1.0.197](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.196...v1.0.197) (2024-04-12)

### Bug Fixes

- instance removal fix ([9eeb850](https://github.com/VirtoCommerce/vc-shell/commit/9eeb850603b18fcd3e6dc7b03a9bfe3ceb224680))

## [1.0.196](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.195...v1.0.196) (2024-04-11)

### Bug Fixes

- **ui:** vc-table mobile view hidden fix ([d5d0353](https://github.com/VirtoCommerce/vc-shell/commit/d5d035352bd5afcb3ae5c5e07a332d06bc34a72e))

## [1.0.195](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.194...v1.0.195) (2024-04-11)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.194](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.193...v1.0.194) (2024-04-11)

### Features

- **dynamic:** added vee-validate's errorBag into validationState object ([164be3c](https://github.com/VirtoCommerce/vc-shell/commit/164be3cacd3c76ae4043a79825604dea9026de2f))

### Bug Fixes

- **ui:** vc-table immediate watch on items ([45cd08a](https://github.com/VirtoCommerce/vc-shell/commit/45cd08a69483f8106247bdd9b213a23fb81a24cb))

## [1.0.193](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.192...v1.0.193) (2024-04-11)

### Features

- **navigation:** query params ([f7b13ce](https://github.com/VirtoCommerce/vc-shell/commit/f7b13ce28eb4dbd8c6d81b3b3c2bd57faad59abf))

## [1.0.192](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.191...v1.0.192) (2024-04-11)

### Features

- **navigation:** better work with custom app param, preserve blades where it's possible ([49d3ae8](https://github.com/VirtoCommerce/vc-shell/commit/49d3ae8b40178fb6d29d6b8f54880a2f5e0e21c4))

### Bug Fixes

- router param lost ([9931a84](https://github.com/VirtoCommerce/vc-shell/commit/9931a848c18389f80fad6f22e5e864952aa0e277))

## [1.0.191](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.190...v1.0.191) (2024-04-09)

### Bug Fixes

- **dynamic:** support fetched data in filters ([c6c133d](https://github.com/VirtoCommerce/vc-shell/commit/c6c133d8224d6905a3a4a3d45ef474c3dabd56f3))

## [1.0.190](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.189...v1.0.190) (2024-04-03)

### Features

- **ui/vc-editor:** no change emit on component mount ([cf1af9a](https://github.com/VirtoCommerce/vc-shell/commit/cf1af9a4978688e93fb4b22707cafdd14a970752))
- **ui/vc-table:** auto mobile view, html cell, all cols in dropdown selector, state save refactor ([d4034a7](https://github.com/VirtoCommerce/vc-shell/commit/d4034a70887bdbefd6a26f514145f14e86a1331e))
- **dynamic:** added maxlength prop for inputs, storybook update ([b7fb253](https://github.com/VirtoCommerce/vc-shell/commit/b7fb253fe31a8de78b31a01393f7b38c9772a24e))

### Bug Fixes

- windows build with cross-spawn, other small changes ([a8e576d](https://github.com/VirtoCommerce/vc-shell/commit/a8e576d8556cebb7dd648de68954f87989b7f3ca))
- **ui/vc-blade-header:** fixed line height ([c3df1e2](https://github.com/VirtoCommerce/vc-shell/commit/c3df1e2bbb96f87c15ba17961a88542502a8ab36))

### Code Refactoring

- **ui/vc-textarea:** prop name change ([e529af9](https://github.com/VirtoCommerce/vc-shell/commit/e529af90d6d399117f0f16b448f5e47a5b1394ed))

## [1.0.189](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.188...v1.0.189) (2024-03-26)

### Features

- **storybook:** dynamic views components and some components refactoring ([19f9d20](https://github.com/VirtoCommerce/vc-shell/commit/19f9d2055d76166a8b38be0149346c0bec12ad77))

## [1.0.188](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.187...v1.0.188) (2024-03-19)

### Bug Fixes

- **dynamic:** isDirty reset in useDetailsFactory ([bf7341e](https://github.com/VirtoCommerce/vc-shell/commit/bf7341ece299dac32784222aeee72f2ef9c7ead6))

## [1.0.187](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.186...v1.0.187) (2024-03-19)

### Bug Fixes

- **dynamic:** confirmation logics refactor, sort in list priority change ([c98d639](https://github.com/VirtoCommerce/vc-shell/commit/c98d639878599932630b0b868f9dca536710b6b6))

## [1.0.186](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.185...v1.0.186) (2024-03-15)

### Features

- administrator full access on permissions check ([9f96645](https://github.com/VirtoCommerce/vc-shell/commit/9f96645ae03c0920e83d2a8ecca5b3f565a910b9))

## [1.0.185](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.184...v1.0.185) (2024-03-15)

### Bug Fixes

- **ui:** table width fix, hover with date on date-ago ([a249e0c](https://github.com/VirtoCommerce/vc-shell/commit/a249e0cff939cf9ef555b93373b62980cfed4182))

## [1.0.184](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.183...v1.0.184) (2024-03-14)

### Reverts

- tailwind package remove and config change ([2bf54da](https://github.com/VirtoCommerce/vc-shell/commit/2bf54dad5e9d02a49396e0031e24c01ec045c797))

## [1.0.183](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.182...v1.0.183) (2024-03-14)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.182](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.181...v1.0.182) (2024-03-14)

### Features

- **framework:** storybook, component fixes ([965b242](https://github.com/VirtoCommerce/vc-shell/commit/965b242d6afccd325fa09f8315b52cbe7c58527c))

## [1.0.181](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.180...v1.0.181) (2024-03-14)

### Bug Fixes

- **ui:** vc-select initial multiple fix ([edcb55c](https://github.com/VirtoCommerce/vc-shell/commit/edcb55c172ea4ffc63110360ca4fefa446d2a10a))

## [1.0.180](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.179...v1.0.180) (2024-03-14)

### Bug Fixes

- **navigation:** fixed multiple close confirmations, component update in vue router instance ([966e779](https://github.com/VirtoCommerce/vc-shell/commit/966e7796ff190110a583e674da149b56634264c3))

### Code Refactoring

- **dynamic:** refactor blade close confirmation logics ([3378df1](https://github.com/VirtoCommerce/vc-shell/commit/3378df179f87d999b4a5b0e689236a6206e85fab))

## [1.0.179](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.178...v1.0.179) (2024-03-13)

### Features

- **ui/dynamic:** components update, multiple in dynamic select, fixed close blade confirmation ([ced10db](https://github.com/VirtoCommerce/vc-shell/commit/ced10db4f2b3db555716e14159203aec4b048885))

## [1.0.178](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.177...v1.0.178) (2024-03-08)

### Features

- shell locales moved to locales, expose locales ([9d6099e](https://github.com/VirtoCommerce/vc-shell/commit/9d6099ed2d43dba38a71a5e868ed335cf2bd8170))

## [1.0.177](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.176...v1.0.177) (2024-03-08)

### Bug Fixes

- **ui:** vc-breadcrumbs key fix ([192debc](https://github.com/VirtoCommerce/vc-shell/commit/192debc1791beca4e8bd253362584736dfb1de0e))

## [1.0.176](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.175...v1.0.176) (2024-03-07)

### Features

- **dynamic:** bladeContext exposure to list composable ([37a30c9](https://github.com/VirtoCommerce/vc-shell/commit/37a30c91239b60f2c5d7b9d859d6f48962627ee5))

## [1.0.175](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.174...v1.0.175) (2024-03-07)

### Features

- **core:** Update signalR plugin to accept options, SendSystemEvents connection ([7cc96d5](https://github.com/VirtoCommerce/vc-shell/commit/7cc96d5c783207b94b0657c2467203ccea4a55a5))

### Bug Fixes

- **dynamic:** remove table actions from widgetView ([e51fb3f](https://github.com/VirtoCommerce/vc-shell/commit/e51fb3f8e63c56ed0146f61a036581a45f386830))

## [1.0.174](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.173...v1.0.174) (2024-03-06)

### Features

- **dynamic:** disabled method for actions ([a575064](https://github.com/VirtoCommerce/vc-shell/commit/a5750642339e0fedf3e937370361968eea144368))

## [1.0.173](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.172...v1.0.173) (2024-03-06)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.172](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.171...v1.0.172) (2024-03-06)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.171](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.170...v1.0.171) (2024-03-06)

### Features

- **dynamic:** add useNotifications and notification component to form blade ([578bb19](https://github.com/VirtoCommerce/vc-shell/commit/578bb192c8edac55054ca5b72d74f0c900e5dadf))
- updated popups and VcPopup component ([35a2102](https://github.com/VirtoCommerce/vc-shell/commit/35a21022ec7acbf2ab7a5356a9407f74f9c9af13))

### Bug Fixes

- **ui:** user-dropdown-button auto width when disabled ([1249bbf](https://github.com/VirtoCommerce/vc-shell/commit/1249bbfac96943ede03064adbf268b9abba35481))
- **core:** fixed old push display after page refresh ([2155a6e](https://github.com/VirtoCommerce/vc-shell/commit/2155a6e8bd6e0bcd3c90d4a4233130302255cf3e))

## [1.0.170](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.169...v1.0.170) (2024-02-27)

### Features

- **framework:** removed redundant localizations, moved to app ([9eb0ca7](https://github.com/VirtoCommerce/vc-shell/commit/9eb0ca789f75e4959e9d3d61eaebb2f8723511df))
- **shared:** field validation improvements ([e36f900](https://github.com/VirtoCommerce/vc-shell/commit/e36f9009940b5b91d4a20552dd033b854ef30af6))
- **dynamic:** support of table actions, improved mobile swipe ([ccd4553](https://github.com/VirtoCommerce/vc-shell/commit/ccd4553a58ac3093fc8108351e09d5152349b2fb))

## [1.0.169](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.168...v1.0.169) (2024-02-23)

### Features

- **dynamic:** id style path notation in overrides ([edd8a3b](https://github.com/VirtoCommerce/vc-shell/commit/edd8a3ba6289c9364c548d2fe80cdda1bf3cfa0d))

## [1.0.168](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.167...v1.0.168) (2024-02-21)

### Bug Fixes

- **dynamic:** card visibility fix ([8f224c9](https://github.com/VirtoCommerce/vc-shell/commit/8f224c95549c9aea60b62521143ed7698b22721b))
- **ui:** vc-select duplicates remove on search when backend totalCount corrupted ([fafce05](https://github.com/VirtoCommerce/vc-shell/commit/fafce051d87267148c4332adbced097aa78644b2))

## [1.0.167](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.166...v1.0.167) (2024-02-21)

### Bug Fixes

- **ui:** vc-select fix search in array ([c172fac](https://github.com/VirtoCommerce/vc-shell/commit/c172fac5b892d804d61f5eca37cbccf2a795026b))

## [1.0.166](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.165...v1.0.166) (2024-02-21)

### Bug Fixes

- **ui:** vc-select search fix ([d1de088](https://github.com/VirtoCommerce/vc-shell/commit/d1de08889c64526ed24496e0ee32437bd853e9e4))

## [1.0.165](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.164...v1.0.165) (2024-02-14)

### Features

- **dynamic:** useBreadcrumbs composable and support in dynamic views, exposing more methods ([c1ccdea](https://github.com/VirtoCommerce/vc-shell/commit/c1ccdea065000345b9ee7e9334839179a0d30661))

### Bug Fixes

- **dynamic:** component fixes ([77acf38](https://github.com/VirtoCommerce/vc-shell/commit/77acf38f64a5638bbaa4aede1fd3b4d44165e08e))

## [1.0.164](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.163...v1.0.164) (2024-02-09)

### Bug Fixes

- **framework:** Add i18n support to StatusField component and fix Quill editor issue ([7749feb](https://github.com/VirtoCommerce/vc-shell/commit/7749feba938b8011220c6139908daa7e68df5bcd))

## [1.0.163](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.162...v1.0.163) (2024-02-09)

### Bug Fixes

- **dynamic:** update class property to classNames ([4297cb0](https://github.com/VirtoCommerce/vc-shell/commit/4297cb088be767b42a892a078c450d54a571ad32))

## [1.0.162](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.161...v1.0.162) (2024-02-09)

### Features

- **dynamic:** horizontalSeparator in fieldset ([e2f63cf](https://github.com/VirtoCommerce/vc-shell/commit/e2f63cfccb859ae15c217f8e3e9b4e1b71d294da))

## [1.0.161](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.160...v1.0.161) (2024-02-09)

### Bug Fixes

- filter reset condition, return reactive filter ([68af932](https://github.com/VirtoCommerce/vc-shell/commit/68af9323e0d3d2edc58560487e8c66a817b34ceb))

## [1.0.160](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.159...v1.0.160) (2024-02-09)

### Bug Fixes

- filter reset ([49aec1b](https://github.com/VirtoCommerce/vc-shell/commit/49aec1b7ee488d86f0248a10e933fd132bf6ec10))

## [1.0.159](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.158...v1.0.159) (2024-02-09)

### Bug Fixes

- **framework:** blade navigation bug and update dynamic filter checkbox data structure ([ae97351](https://github.com/VirtoCommerce/vc-shell/commit/ae97351548d65b9f1eca44fc54e13495446ecf12))

## [1.0.158](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.157...v1.0.158) (2024-02-08)

### Bug Fixes

- **dynamic:** reactivity losing fixes ([2f129ee](https://github.com/VirtoCommerce/vc-shell/commit/2f129ee993200f8aa0ac651d1a0adc94f1834a67))

## [1.0.157](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.156...v1.0.157) (2024-02-07)

### Features

- **framework:** useFilterBuilder localization update ([75a387d](https://github.com/VirtoCommerce/vc-shell/commit/75a387db7da5e07d3e6538b9217d2e1b270b694d))

## [1.0.156](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.155...v1.0.156) (2024-02-07)

### Bug Fixes

- localization ([8de6e9f](https://github.com/VirtoCommerce/vc-shell/commit/8de6e9f406487f7457327561547efc414b327729))

## [1.0.155](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.154...v1.0.155) (2024-02-06)

### Bug Fixes

- **framework:** titles in mobile ([91cca71](https://github.com/VirtoCommerce/vc-shell/commit/91cca71f8a6be855243b822242f7be33bcc562db))

## [1.0.154](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.153...v1.0.154) (2024-02-06)

### Features

- **ui:** components fixes and refactors ([01ba0fe](https://github.com/VirtoCommerce/vc-shell/commit/01ba0fed91973c9624ca5e66e56750b5336fe6aa))
- **framework:** ability to add html in popup slot, fixed inferring of emits types ([cf52cf7](https://github.com/VirtoCommerce/vc-shell/commit/cf52cf741ed09c652755f9a78eb4c8ec732b9e8e))
- **framework:** Refactor useMenuServiceFn and add inGroupPriority to MenuItemConfig ([c6ef313](https://github.com/VirtoCommerce/vc-shell/commit/c6ef313d6619b761ea624655eb0ffcea0cc37679))
- **dynamic:** updated/new components, fixes and improvements ([6c2a746](https://github.com/VirtoCommerce/vc-shell/commit/6c2a74601ae21ba9377bd59ea34279583a424d20))

### Bug Fixes

- **framework:** fixed parent blade calling ([ab59609](https://github.com/VirtoCommerce/vc-shell/commit/ab59609d615534a3dc9cc617d080886970d8040a))

## [1.0.153](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.152...v1.0.153) (2024-01-29)

### Bug Fixes

- **framework:** menu permissions hide fix ([43a0e98](https://github.com/VirtoCommerce/vc-shell/commit/43a0e98db361bdcb296239fd6fc6e3bc967a6246))

## [1.0.152](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.151...v1.0.152) (2024-01-29)

### Bug Fixes

- **framework:** redirect to root fix ([cfd7e43](https://github.com/VirtoCommerce/vc-shell/commit/cfd7e43903cd46af87b31106b4a0fcadfc24cddd))

## [1.0.151](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.150...v1.0.151) (2024-01-25)

### Features

- **framework:** added support of URL with base param ([fe9649e](https://github.com/VirtoCommerce/vc-shell/commit/fe9649e7348032fd8f9e0253d9688f6d93057c96))

### Bug Fixes

- **framework:** user-dropdown-button disabling fix ([2f9cb62](https://github.com/VirtoCommerce/vc-shell/commit/2f9cb62e326152a64d9fd3d719b01a5043c195ca))

## [1.0.150](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.149...v1.0.150) (2024-01-25)

### Features

- **framework:** possibility to disable menu ([65b1eb0](https://github.com/VirtoCommerce/vc-shell/commit/65b1eb0ad71026e992a7bcecb0a7616415115a6e))

## [1.0.149](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.148...v1.0.149) (2024-01-24)

### Features

- **dynamic:** updateActiveWidgetCount event ([808d31d](https://github.com/VirtoCommerce/vc-shell/commit/808d31df475e3c29386d7742fbc5f6ee7645a9bc))
- **framework:** updated navigation, added routable config for blades ([7c538c6](https://github.com/VirtoCommerce/vc-shell/commit/7c538c6dfab70cc6c85dd453e516d84395e1166c))
- **framework:** updated localization setup, i18n locales config, dynamic modules localization ([209b92f](https://github.com/VirtoCommerce/vc-shell/commit/209b92fe2bf95379d908064d553ab59e16928569))

### Bug Fixes

- **framework:** fix ui styling issues in multiple components ([61f56d6](https://github.com/VirtoCommerce/vc-shell/commit/61f56d603b15f385c32d0270c939d539b606b37c))
- **dynamic:** fixed overrides remove order ([a3e5980](https://github.com/VirtoCommerce/vc-shell/commit/a3e59801c1d8fd963cb5f4fe4e445dab0e2d5d32))

## [1.0.148](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.147...v1.0.148) (2024-01-16)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.147](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.146...v1.0.147) (2024-01-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.146](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.145...v1.0.146) (2024-01-11)

### Bug Fixes

- **dynamic:** modified as base disabled state in saveChanges method ([9895efb](https://github.com/VirtoCommerce/vc-shell/commit/9895efb16aa70f1b1d5e90359084a25c7237a56e))
- **useMenuService:** prevent duplication ([1c35bb7](https://github.com/VirtoCommerce/vc-shell/commit/1c35bb72b2c6cd2a035d8c370218b1e869f65044))

## [1.0.145](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.144...v1.0.145) (2024-01-10)

### Features

- **shell:** base navigator.language i18n locale ([8a59a63](https://github.com/VirtoCommerce/vc-shell/commit/8a59a636643f94ffac282ac37514a4f253007c7a))

## [1.0.144](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.143...v1.0.144) (2024-01-10)

### Bug Fixes

- **shell:** removed common pages locales ([e8d54e5](https://github.com/VirtoCommerce/vc-shell/commit/e8d54e5bea8746a678e17b6a79ebbdc59da6e3c3))

## [1.0.143](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.142...v1.0.143) (2024-01-10)

### Features

- **dynamic:** table columns localized titles support ([dfccb58](https://github.com/VirtoCommerce/vc-shell/commit/dfccb58492ad126402858974d84a50f3dbf09152))
- locales moved to app scope ([ee08999](https://github.com/VirtoCommerce/vc-shell/commit/ee089996fd204ada7b8320218680d47f3418dc68))

## [1.0.142](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.141...v1.0.142) (2024-01-10)

### Bug Fixes

- **shell:** navigation slash duplication fix ([370fe03](https://github.com/VirtoCommerce/vc-shell/commit/370fe0398ef6626c541a4af5b2f7895fad49b874))

## [1.0.141](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.140...v1.0.141) (2024-01-10)

### Features

- **dynamic:** using locale key as blade title ([057a188](https://github.com/VirtoCommerce/vc-shell/commit/057a188dbb9d73611e609d7fd6064502a1f95560))

## [1.0.140](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.139...v1.0.140) (2024-01-09)

### Bug Fixes

- condition in getOptions ([c363f13](https://github.com/VirtoCommerce/vc-shell/commit/c363f134da870341e4840d132f1d5d5e9a0fa2d7))

## [1.0.139](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.138...v1.0.139) (2024-01-08)

### Features

- **shell:** update optionsGetter signature in vc-dynamic-property.vue ([0c71460](https://github.com/VirtoCommerce/vc-shell/commit/0c71460d2d3c785cd5d8fe2b0b58ebc2c3020248))

## [1.0.138](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.137...v1.0.138) (2024-01-08)

### Features

- **shell:** navigation menu slot in vc-app ([fc0c185](https://github.com/VirtoCommerce/vc-shell/commit/fc0c185b42ee34f39bee0cd14c2633416ea6d0c5))

### Bug Fixes

- **shell:** base url param support, routes injection in navigation plugin ([414fe2d](https://github.com/VirtoCommerce/vc-shell/commit/414fe2d0509b0642b1afe5aac96d83f0975ddd95))

## [1.0.137](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.136...v1.0.137) (2024-01-04)

### Bug Fixes

- **dynamic:** refactored condition on route leave ([25f23e5](https://github.com/VirtoCommerce/vc-shell/commit/25f23e5311c4754e26c125f1ea717fe6d196a79b))
- **ui:** remove unused options property from vc-blade-toolbar-button.vue ([4fc462b](https://github.com/VirtoCommerce/vc-shell/commit/4fc462b28dabe384689ebd3b9a4d5f5eab114ed9))

## [1.0.136](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.135...v1.0.136) (2024-01-03)

### Bug Fixes

- **dynamic:** nested fields context reactivity fix ([9613105](https://github.com/VirtoCommerce/vc-shell/commit/9613105f6c1b4c7dc47b386203603763c75595b1))

## [1.0.135](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.134...v1.0.135) (2024-01-03)

### Bug Fixes

- **dynamic:** remove unused emitValue and emitLabel properties from MultivalueField.ts ([3edcf8b](https://github.com/VirtoCommerce/vc-shell/commit/3edcf8b3402a9379913d8f75baf815dc1c557fbe))
- **shell:** refactor vc-multivalue component to improve readability and maintainability ([e49fd74](https://github.com/VirtoCommerce/vc-shell/commit/e49fd74f23e14d252d0969773edb169a7556eddb))
- **shell:** refactor vc-label layout ([ab6ad07](https://github.com/VirtoCommerce/vc-shell/commit/ab6ad070fdf9aef2be4be10d28d3c964a50c807f))
- **shell:** replace url if blade have no url ([bb97100](https://github.com/VirtoCommerce/vc-shell/commit/bb97100aa94bdc76d0d8c1b01560d35593ce8dfa))

## [1.0.134](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.133...v1.0.134) (2023-12-29)

### Features

- **shell:** refactor vc-notification component styling to support scrolling ([93345c5](https://github.com/VirtoCommerce/vc-shell/commit/93345c59d415d27dee20e3abc6642b3f2ea07da1))
- **shell:** intercept seller load error ([9f94420](https://github.com/VirtoCommerce/vc-shell/commit/9f94420aad2aaac02ca4efc56c5e22c885662c93))

## [1.0.133](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.132...v1.0.133) (2023-12-28)

### Features

- **shell:** useMenuService permissions ([73ca465](https://github.com/VirtoCommerce/vc-shell/commit/73ca4650e2b4458e47b78c2a99e50003ce02c6bd))

## [1.0.132](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.131...v1.0.132) (2023-12-28)

### Features

- **shell:** added exposed component to toolbar:user-dropdown slot ([f136903](https://github.com/VirtoCommerce/vc-shell/commit/f1369035b3be01e11a167a1a29b6aa968913d130))

### Bug Fixes

- **shell:** vc-select fixed generic ([b1f9f88](https://github.com/VirtoCommerce/vc-shell/commit/b1f9f88adde894dbbb7dc766179c3c95a8c22ce3))

### Code Refactoring

- **shell:** refactor Vue imports and some types ([cf2617c](https://github.com/VirtoCommerce/vc-shell/commit/cf2617c22c96ba43448d46120f02731be7fddcd6))

## [1.0.131](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.130...v1.0.131) (2023-12-28)

### Bug Fixes

- **shell:** interceptor method name fix ([293ba14](https://github.com/VirtoCommerce/vc-shell/commit/293ba14952c779141b6be417653e317afd2e98e9))

## [1.0.130](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.129...v1.0.130) (2023-12-27)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.129](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.128...v1.0.129) (2023-12-27)

### Features

- **shell:** vc-card/vc-blade css update ([3f59f36](https://github.com/VirtoCommerce/vc-shell/commit/3f59f363b09777591f5d99a13127c7aab7142234))
- **shell:** new navigation menu css styles ([d6acd52](https://github.com/VirtoCommerce/vc-shell/commit/d6acd529fdeb57f47f91a982039edc8ece9cab4e))
- **shell:** Add postcss.config.cjs and notification components ([03418b8](https://github.com/VirtoCommerce/vc-shell/commit/03418b81b224d5a324698208f18160c9a309066d))
- **shell:** auto global components ([5f40f38](https://github.com/VirtoCommerce/vc-shell/commit/5f40f385ba0d291af633de0e89b0c97d84059446))
- **shell:** add router guards and HTTP interceptors to shell init file ([986148b](https://github.com/VirtoCommerce/vc-shell/commit/986148b44591417abcc397245a8259aa6e2af632))
- **shell:** add usepopupinternal function and destroy method in usepopup composable ([119d15b](https://github.com/VirtoCommerce/vc-shell/commit/119d15bfd1d926336de44f3f0fd24672f337c7f1))
- **shell:** add format fallback messages option to i18n plugin ([fe1135e](https://github.com/VirtoCommerce/vc-shell/commit/fe1135e7da33e080b25f3afe8c0d1190b8784af5))
- **shell:** notifications templates improvements ([1a74a07](https://github.com/VirtoCommerce/vc-shell/commit/1a74a078df0ad004c90cdfec351644cb622d221d))
- **dynamic:** added new validation methods from vee-validate, dynamic pages errors prevent, fixes ([931440b](https://github.com/VirtoCommerce/vc-shell/commit/931440bc5ad218328274a6a832babdf9ae3fba74))
- **shell:** update common pages to new auth flow ([99364c2](https://github.com/VirtoCommerce/vc-shell/commit/99364c2db150c0496414c9215858a5653a7d938b))
- **shell:** signalR connecting only when user authorized ([f9572de](https://github.com/VirtoCommerce/vc-shell/commit/f9572de42a4d38c3da858c6117804742f3cd37db))
- **shell:** refactored useUser composable, 401 interceptor, get rid of tokens in some composables ([967626b](https://github.com/VirtoCommerce/vc-shell/commit/967626b4266b5b6271f4bc9f2b1eea8d6d7075e1))
- **shell:** useMenuService, auto add modules to navigation menu ([d3ff217](https://github.com/VirtoCommerce/vc-shell/commit/d3ff21717bc272414bfbcd9c5c8a5cc1a18ddb6d))
- **shell:** improved blade navigation, based on Vue router ([841fa0b](https://github.com/VirtoCommerce/vc-shell/commit/841fa0bbf233ec785f97764752f14cb41b438345))
- **shell:** useBeforeUnload composable for onbeforeunload event handling ([129a109](https://github.com/VirtoCommerce/vc-shell/commit/129a1092ed54ea1277c42afac332446d4b55c65b))

### Bug Fixes

- **dynamic:** small calculateColumns fix ([38a5d76](https://github.com/VirtoCommerce/vc-shell/commit/38a5d764711386e6a18458f54dfe5f7f93a23e23))
- **shell:** navigation glitch fix ([bc9d784](https://github.com/VirtoCommerce/vc-shell/commit/bc9d78406630fab1d7e31d649a1b04c32bac9ac3))
- **shell:** update offset values in showActions function in vc-table ([3ecf218](https://github.com/VirtoCommerce/vc-shell/commit/3ecf218692fd64f6e6d220a2b9dca8dfc8145214))
- **shell:** fix vc-blade expandable property ([29697d7](https://github.com/VirtoCommerce/vc-shell/commit/29697d7ae36b8a34dcf23b057d079bb61c229b3c))
- **shell:** fix loading issue in assetmanager component, component names ([2d3f483](https://github.com/VirtoCommerce/vc-shell/commit/2d3f4831a2087478f1a7392b82f6ea2622084563))
- **shell:** update button shadow color in vc-button.vue ([dd60721](https://github.com/VirtoCommerce/vc-shell/commit/dd60721bd490fe28b0f98392fcaa901c7dd2a99e))
- **shell:** app-switcher fixes ([05bb4d7](https://github.com/VirtoCommerce/vc-shell/commit/05bb4d787329c42832ced9ca1afee95bf6e03977))

### Code Refactoring

- **shell:** update language selector component ([39538d3](https://github.com/VirtoCommerce/vc-shell/commit/39538d3e5f5965b7e78f7011f2be2b5ff6c6faf5))
- **shell:** refactor user-dropdown-button component ([e9fd92d](https://github.com/VirtoCommerce/vc-shell/commit/e9fd92ddc68ad271e5388f68b2bb47dc849a3345))
- **shell:** refactor vc-icon component to support variant prop ([cdf2249](https://github.com/VirtoCommerce/vc-shell/commit/cdf22495e7156a851761aae440322abc9805f524))
- **shell:** refactor vc-container styles for scrollbar appearance ([bf6672f](https://github.com/VirtoCommerce/vc-shell/commit/bf6672fe96685ef9ccdd9ae3fd68c7ddcc0d2edc))
- **shell:** updated vc-app ([c5bb74f](https://github.com/VirtoCommerce/vc-shell/commit/c5bb74f747cc161db1f8764a9f411a1bee0f7bd8))
- **shell:** useSettings composable refactor ([d23cd97](https://github.com/VirtoCommerce/vc-shell/commit/d23cd97071448d51ea12b0ea68008b9cd43cd961))

## [1.0.128](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.127...v1.0.128) (2023-12-14)

### Features

- **dynamic:** ability to add custom visibility method to columns schema ([68922fd](https://github.com/VirtoCommerce/vc-shell/commit/68922fda60310f1f85d5c34122248693897354e4))

## [1.0.127](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.126...v1.0.127) (2023-12-13)

### Bug Fixes

- **dynamic:** props pass to created component instance ([29331fb](https://github.com/VirtoCommerce/vc-shell/commit/29331fb60bacf142d48eccc1af117a0b8fc299dd))

## [1.0.126](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.125...v1.0.126) (2023-11-28)

### Bug Fixes

- **dynamic:** multivalueschema emitValue emitLabel type ([ecd5f61](https://github.com/VirtoCommerce/vc-shell/commit/ecd5f61fe3afbfc9c9685d6596223936f20e7e4c))

## [1.0.125](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.124...v1.0.125) (2023-11-27)

### Features

- **dynamic:** vc-multivalue component for dynamic views ([9b9befc](https://github.com/VirtoCommerce/vc-shell/commit/9b9befc7b2caa3413c6af317322394e79f0cc9ad))

## [1.0.124](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.123...v1.0.124) (2023-11-27)

### Bug Fixes

- **framework:** Fix defaultValue assignment in vc-select.vue ([516a749](https://github.com/VirtoCommerce/vc-shell/commit/516a74980fb3c52ec1a322f19233fc5298a0f0fd))

## [1.0.123](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.122...v1.0.123) (2023-11-24)

### Features

- **dynamic:** blade as dashboard widget ([fa660f5](https://github.com/VirtoCommerce/vc-shell/commit/fa660f5a1dd16e9fa805c6a4ae0bb2a9dc7e6a7b))

### Bug Fixes

- **dynamic:** nodeBuilder modelValue fix to prevent unnecessary updates ([63cfe00](https://github.com/VirtoCommerce/vc-shell/commit/63cfe00395f1ad69d3406d636448b7cf25fd6183))
- **dynamic:** toSpliced polyfill ([4aaf109](https://github.com/VirtoCommerce/vc-shell/commit/4aaf1091613f51be52531fbdffa1ad066c21cf2a))
- **framework:** vc-card redundant css class fix ([10d4cc1](https://github.com/VirtoCommerce/vc-shell/commit/10d4cc172e7daae41fbe7ea8d89ffde5f9f70795))
- **framework:** vc-table pullToReload fix ([10007c5](https://github.com/VirtoCommerce/vc-shell/commit/10007c53f2a278a629efc780243c2abadb642cfa))

### Code Refactoring

- **framework:** types change ([364fc8b](https://github.com/VirtoCommerce/vc-shell/commit/364fc8b1bccd888247daba8bfc98432fba12676f))
- useAssets composable, assets-\* components, gallery components ([1e83bf4](https://github.com/VirtoCommerce/vc-shell/commit/1e83bf4ae0570ed7afbe2323641cdd738d31dc88))

## [1.0.122](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.121...v1.0.122) (2023-11-14)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.121](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.120...v1.0.121) (2023-11-14)

### Features

- strict type check in framework custom property binding in dynamic views Textfield dynamic component dynamic blade mounted state pass to composables ([4e46e67](https://github.com/VirtoCommerce/vc-shell/commit/4e46e679154da42b4f0194c193708ee581be2f1b))

## [1.0.120](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.119...v1.0.120) (2023-11-09)

### Reverts

- vc-table TableItem type ([6b09d1f](https://github.com/VirtoCommerce/vc-shell/commit/6b09d1f5387fb26f34d1fdd7b3715c1404f54c9d))

### Code Refactoring

- **framework:** dynamic interfaces rework ([3068fe9](https://github.com/VirtoCommerce/vc-shell/commit/3068fe95a52677d324d953e64a9ab507e9e04d82))

## [1.0.119](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.118...v1.0.119) (2023-11-07)

### Features

- **framework:** vc-label truncate css ([78e34d3](https://github.com/VirtoCommerce/vc-shell/commit/78e34d30dbed8432ff5717d3e02df6c9a4f1eaa9))
- **framework:** aspectRatio in dynamic fieldset ([11436cc](https://github.com/VirtoCommerce/vc-shell/commit/11436cc4fe5266ff4b5b346ae49a469da00af2d0))
- **framework:** append, append-inner, prepend, prepend-inner slots in dynamic vc-input component ([f7d58cf](https://github.com/VirtoCommerce/vc-shell/commit/f7d58cf4a4949b675f11e957a4cbf09c0cfed95a))

### Bug Fixes

- **framewrok:** vc-field removed redundant div wrapper ([1b35c20](https://github.com/VirtoCommerce/vc-shell/commit/1b35c2066bfe9b28060d672fdbd7429010d62ffc))
- **framework:** dynamic view reactivity loss fix ([9cea9f0](https://github.com/VirtoCommerce/vc-shell/commit/9cea9f09a5ff6ada715d2e37d1bf13253dbbb1ca))
- **framework:** vc-popup error/warning binding ([d380ae1](https://github.com/VirtoCommerce/vc-shell/commit/d380ae12d2df1a16476fa25654ff40ce17b0cf1f))

### Code Refactoring

- **framework:** vc-image css refactor ([8af0f7b](https://github.com/VirtoCommerce/vc-shell/commit/8af0f7bf1f882f0f48ba31b7713cb19c85588462))
- **framework:** small refactor of vc-col/vc-row ([c37a828](https://github.com/VirtoCommerce/vc-shell/commit/c37a8288cfbbbeaf31e2a11934250c9f5ac1672b))

## [1.0.118](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.117...v1.0.118) (2023-11-06)

### Features

- **@vc-shell/framework:** reorderable table in dynamic views ([eae2236](https://github.com/VirtoCommerce/vc-shell/commit/eae2236119cac231ed846bb32d0b9f6e50a7cc11))
- **@vc-shell/framework:** dynamic vc-image ([a04dc2f](https://github.com/VirtoCommerce/vc-shell/commit/a04dc2f0d8a53ad5cd797b4403d1c2f20bb07062))
- **@vc-shell/framework:** dynamic vc-video ([433384d](https://github.com/VirtoCommerce/vc-shell/commit/433384d99ba7ff78fdb143e4e64cb0eb124a4765))
- **@vc-shell/framework:** vc-field component + dynamic views vc-field field ([67d04d0](https://github.com/VirtoCommerce/vc-shell/commit/67d04d04a495c124e9490157c773eace0bef21a0))

### Bug Fixes

- **@vc-shell/framework:** refactor bladeContext in dynamic-blade-list ([1588cee](https://github.com/VirtoCommerce/vc-shell/commit/1588cee760719081b7c60d3c3fb6791bac4de17d))
- **framework:** vc-table-cell condition fix ([b96dbcc](https://github.com/VirtoCommerce/vc-shell/commit/b96dbcc9adb671542b27d285c648fafd93cd8dfb))
- nodeBuilder reactivity loss fix ([ace445e](https://github.com/VirtoCommerce/vc-shell/commit/ace445e3525355b879cb59cdac4a2876421e594c))

## [1.0.117](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.116...v1.0.117) (2023-11-06)

### Features

- **@vc-shell/framework:** isWorkspace blade option ([8647e66](https://github.com/VirtoCommerce/vc-shell/commit/8647e66ab6eed51efbfcb1e8f01323fba5dd7579))

## [1.0.116](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.115...v1.0.116) (2023-11-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.115](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.114...v1.0.115) (2023-11-02)

### Features

- **@vc-shell/framework:** updated tsconfigs ([921d000](https://github.com/VirtoCommerce/vc-shell/commit/921d000de8a0ca1b3eed4712eb5cc87e6d6a6616))
- **@vc-shell/create-vc-app:** changed boilerplate ([740915b](https://github.com/VirtoCommerce/vc-shell/commit/740915baea40f4ac25375679dac9e9a209ae1937))

### Bug Fixes

- **@vc-shell/framework:** vc-select slot fix ([62953b9](https://github.com/VirtoCommerce/vc-shell/commit/62953b94bbbb7e081c813177c45e8ae49183b1c8))

## [1.0.114](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.113...v1.0.114) (2023-10-25)

### Features

- vm-1215 expose in dynamic blade ([58cf7ef](https://github.com/VirtoCommerce/vc-shell/commit/58cf7effba8b48865373ce444fc2c7902ae16669))

## [1.0.113](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.111...v1.0.113) (2023-10-25)

### Features

- **@vc-shell/api-client:** Replace .env variables to command line args ([4bcfade](https://github.com/VirtoCommerce/vc-shell/commit/4bcfade6f0eee7f6e2b74ed898d5b90da1198da8))

### Bug Fixes

- add searchable prop to dynamic select ([9cfc810](https://github.com/VirtoCommerce/vc-shell/commit/9cfc810a7b7d30eef65581ece7a7c309fba53bb1))

## [1.0.111](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.110...v1.0.111) (2023-10-17)

### Features

- dynamic modules ([ed4af3a](https://github.com/VirtoCommerce/vc-shell/commit/ed4af3ad65e47b0d633d6e2eb23e9c90d73ff50d))
- status type dynamic component ([95f0472](https://github.com/VirtoCommerce/vc-shell/commit/95f0472cd79cb117a94fe467cf4094cdff29373e))
- dynamic app modules samples ([2af411f](https://github.com/VirtoCommerce/vc-shell/commit/2af411fb14c61d9e98da4612057fd157263de397))
- dynamic modules ([200dcde](https://github.com/VirtoCommerce/vc-shell/commit/200dcde3d127f45267f2d259967839d11ea5d01e))
- improved createAppModule ([3752415](https://github.com/VirtoCommerce/vc-shell/commit/3752415eeae183b8dcfe3f23e47f3bcb07faf136))

### Bug Fixes

- open blade on mount fix in import-module ([6644e03](https://github.com/VirtoCommerce/vc-shell/commit/6644e03bcac5b1298db160f3b749c8a44bb8c9c7))
- override ts-ignore toSpliced ([c360888](https://github.com/VirtoCommerce/vc-shell/commit/c3608889c4bc987f475f9d25a9149aad4b59bac6))

## [1.0.110](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.109...v1.0.110) (2023-10-16)

### Features

- vm-1215 vc-video ([52680f6](https://github.com/VirtoCommerce/vc-shell/commit/52680f6f2bd649d7226818f6432e605502ab9eab))

### Bug Fixes

- code review improvements ([5c6c6dc](https://github.com/VirtoCommerce/vc-shell/commit/5c6c6dc7a60c1212e4c23e0ddbbc42611f16303b))
- code review improvements ([5453ba0](https://github.com/VirtoCommerce/vc-shell/commit/5453ba0388a51b2946408b980e119a0ad20f7647))
- delete index.ts from framework api ([8cc2fee](https://github.com/VirtoCommerce/vc-shell/commit/8cc2feef30ac38bcf229234456cac78c8e23f158))

## [1.0.109](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.108...v1.0.109) (2023-10-13)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.108](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.107...v1.0.108) (2023-10-13)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.107](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.106...v1.0.107) (2023-10-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.106](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.105...v1.0.106) (2023-10-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.105](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.104...v1.0.105) (2023-10-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.104](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.103...v1.0.104) (2023-10-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.103](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.102...v1.0.103) (2023-09-29)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.102](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.101...v1.0.102) (2023-09-29)

### Bug Fixes

- escape images url ([7bc4f95](https://github.com/VirtoCommerce/vc-shell/commit/7bc4f95a6718300d0fa158d17c08ef6bc3b61429))

## [1.0.101](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.100...v1.0.101) (2023-09-28)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.100](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.99...v1.0.100) (2023-09-22)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.99](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.98...v1.0.99) (2023-09-22)

### Bug Fixes

- encode/decode image url ([d0b32b1](https://github.com/VirtoCommerce/vc-shell/commit/d0b32b1d46a58eb3814ce0086244375df90c5f24))

## [1.0.98](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.97...v1.0.98) (2023-09-21)

### Bug Fixes

- decode image url ([8ce7dbf](https://github.com/VirtoCommerce/vc-shell/commit/8ce7dbfeb9c8c675fe971a134736743357cdc9b7))

## [1.0.97](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.96...v1.0.97) (2023-09-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.96](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.95...v1.0.96) (2023-08-28)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.95](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.94...v1.0.95) (2023-08-28)

### Features

- controls for multilang properties ([b07940d](https://github.com/VirtoCommerce/vc-shell/commit/b07940d02f97387929c0081b033f87185fa375b9))

## [1.0.94](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.93...v1.0.94) (2023-08-04)

### Features

- mltilang label, remove mltilang in vc-editor ([f3411bd](https://github.com/VirtoCommerce/vc-shell/commit/f3411bdde6bb61751a89ffa253c038aadfe22e36))
- vc-editor multilang ([b494b9c](https://github.com/VirtoCommerce/vc-shell/commit/b494b9c3439e2d52d4be80616712b86b8126f799))

### Bug Fixes

- dynamic properties fix ([1f2738a](https://github.com/VirtoCommerce/vc-shell/commit/1f2738a95c1da6fc83ea9086aafab935f4f79bfe))
- component registration ([07f829f](https://github.com/VirtoCommerce/vc-shell/commit/07f829f731b9a84b1b223b98a97ac299814ea62c))
- temporary ([65d7a58](https://github.com/VirtoCommerce/vc-shell/commit/65d7a58e159a4f5a06581710156a533790437f4b))

## [1.0.93](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.92...v1.0.93) (2023-08-04)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.92](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.91...v1.0.92) (2023-07-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.91](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.90...v1.0.91) (2023-07-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.90](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.89...v1.0.90) (2023-07-12)

### Bug Fixes

- editor update on status change/val rule fix ([ad269a4](https://github.com/VirtoCommerce/vc-shell/commit/ad269a4a74a5d5539aa08d353367b11ecbf6b99b))

## [1.0.89](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.88...v1.0.89) (2023-07-07)

### Code Refactoring

- api (#188) ([139a9f4](https://github.com/VirtoCommerce/vc-shell/commit/139a9f4509df648dbd21c42f3247b94c03c745fc))

## [1.0.88](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.87...v1.0.88) (2023-06-27)

### Bug Fixes

- azure ([419830f](https://github.com/VirtoCommerce/vc-shell/commit/419830f01ea3e8d0c93779ebfb8725a7af551e9e))
- vc-select search ([3aaf55e](https://github.com/VirtoCommerce/vc-shell/commit/3aaf55ec5fb0b6a311f332ab5b0d4e3a227e525d))

## [1.0.87](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.86...v1.0.87) (2023-06-26)

### Bug Fixes

- navigation exact blade ([7a20053](https://github.com/VirtoCommerce/vc-shell/commit/7a20053705a5e98eeb9bdf3768ab45be113ba66a))

## [1.0.86](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.85...v1.0.86) (2023-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.85](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.84...v1.0.85) (2023-06-23)

### Bug Fixes

- check permissions plugin ([cc65272](https://github.com/VirtoCommerce/vc-shell/commit/cc65272d933e29f427b1403df2bdd627b15dd1e6))

## [1.0.84](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.83...v1.0.84) (2023-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.83](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.82...v1.0.83) (2023-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.82](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.81...v1.0.82) (2023-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.81](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.80...v1.0.81) (2023-06-23)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.80](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.79...v1.0.80) (2023-06-22)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.79](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.78...v1.0.79) (2023-06-22)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.78](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.77...v1.0.78) (2023-06-22)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.77](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.76...v1.0.77) (2023-06-22)

### Bug Fixes

- base url ([848feb7](https://github.com/VirtoCommerce/vc-shell/commit/848feb7e607cdfc6eb230e3c392ed4ca92457596))

## [1.0.76](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.75...v1.0.76) (2023-06-22)

### Bug Fixes

- azure login ([bd2d822](https://github.com/VirtoCommerce/vc-shell/commit/bd2d8221f0e3a286fa944da4c7be7eda81786588))
- base app path ([146b01b](https://github.com/VirtoCommerce/vc-shell/commit/146b01b2e9001ab170dce1c4758d46761ab5e21f))

## [1.0.75](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.74...v1.0.75) (2023-06-21)

### Bug Fixes

- forgotPassword condition ([428a339](https://github.com/VirtoCommerce/vc-shell/commit/428a33950bd2aa43b04a5112682032e6fddd7d2e))

## [1.0.74](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.73...v1.0.74) (2023-06-21)

### Bug Fixes

- pass platformUrl to shell ([6265790](https://github.com/VirtoCommerce/vc-shell/commit/62657901ae6738883ed785e4f54507db85ba7d66))
- azure base env ([b511031](https://github.com/VirtoCommerce/vc-shell/commit/b511031c302be5f2ae251eddeb09f5f3fbf2f2bb))

## [1.0.73](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.72...v1.0.73) (2023-06-08)

### Bug Fixes

- vc-select generic ([8aca326](https://github.com/VirtoCommerce/vc-shell/commit/8aca3260cc1d5912f5c8063314d820b14078373e))

## [1.0.72](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.71...v1.0.72) (2023-06-08)

### Features

- blade nav last state, permissions ([d98144a](https://github.com/VirtoCommerce/vc-shell/commit/d98144a2e5f2b4241543f7624fc7d811aa3f951f))

### Bug Fixes

- vc-app-bar mobile styles ([75955d4](https://github.com/VirtoCommerce/vc-shell/commit/75955d4cb9692a3430395f8dbf5943b5c2eb8f36))
- vc-select dropdown closing ([ecde06f](https://github.com/VirtoCommerce/vc-shell/commit/ecde06ffd679d06f7d8f75304437510f4e46063c))
- authData length check ([bd04284](https://github.com/VirtoCommerce/vc-shell/commit/bd04284fd91887a41ba99f52bd37d844a13c2e8a))

## [1.0.71](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.70...v1.0.71) (2023-06-02)

### Features

- error slot removed from blades ([9135daa](https://github.com/VirtoCommerce/vc-shell/commit/9135daa186236c6ee9b95ebe786b4fc532828bfb))
- azure active directory signin ([46cee05](https://github.com/VirtoCommerce/vc-shell/commit/46cee052064434bdd143d744ca7557f5c0fd7e84))
- refactored vc-button ([b66d081](https://github.com/VirtoCommerce/vc-shell/commit/b66d081b79c32fd9a726bf686ec94070debd7f63))
- common pages moved to shell ([fca5967](https://github.com/VirtoCommerce/vc-shell/commit/fca5967bfa8fdfee09c043dfc565e8aa2534ada1))
- select-all ([3e30fef](https://github.com/VirtoCommerce/vc-shell/commit/3e30fefb71f0e5319724f0487c4c01f049ae19ff))

### Bug Fixes

- _ui_ vc-popup condition fix ([f0a3866](https://github.com/VirtoCommerce/vc-shell/commit/f0a3866325b12bf4fbc7d68eb83d1692d4cb7cca))
- navigation prevention fix ([fd94904](https://github.com/VirtoCommerce/vc-shell/commit/fd94904dc94d076dd690c41c18417e5e80dd2cc5))
- _ui_ vc-button text style ([58545cc](https://github.com/VirtoCommerce/vc-shell/commit/58545cc7955549a877e48cb8451e751490c564b3))
- required blade in IBladeEvent interface ([b5197b2](https://github.com/VirtoCommerce/vc-shell/commit/b5197b26994291cb3cb8955626e7fff5154e2e73))

### Reverts

- required blade in IBladeEvent ([61b1223](https://github.com/VirtoCommerce/vc-shell/commit/61b1223a3b4ce8a131a0ac58ec6c65ca18a053e8))

### Code Refactoring

- login page props ([9cb49f0](https://github.com/VirtoCommerce/vc-shell/commit/9cb49f07e8a9185b20d3bc9052965431b0edfefe))
- defineOptions instead of defineComponent ([fbbc42d](https://github.com/VirtoCommerce/vc-shell/commit/fbbc42dba586ddc4ccefad9f959087380f1c859d))

## [1.0.70](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.69...v1.0.70) (2023-05-18)

### Features

- notifications template ([1af7c34](https://github.com/VirtoCommerce/vc-shell/commit/1af7c34e228a8c7f8f0cdffd4edce4ff00b5882c))
- vc-select generic component ([c71c8da](https://github.com/VirtoCommerce/vc-shell/commit/c71c8daead1ba5c5ece2a0eb4e15a52d01b1666e))
- vc-select generic component ([17639b2](https://github.com/VirtoCommerce/vc-shell/commit/17639b21dbac0022876e81c955a7d072e733d57b))
- vc-table refactored to generic component ([bcc8ea2](https://github.com/VirtoCommerce/vc-shell/commit/bcc8ea2777cec3b796373d2a34f2c2108f949f76))
- eslint vue3-recommended/deps up ([b695f9b](https://github.com/VirtoCommerce/vc-shell/commit/b695f9b40e53ea73fdf0b672956e11c29f8c5de7))
- updated boilerplate ([9f686cc](https://github.com/VirtoCommerce/vc-shell/commit/9f686cca9361a1070b09d4763f6c5b3ace1a47ce))
- make menu hidden if there is no items ([b704c12](https://github.com/VirtoCommerce/vc-shell/commit/b704c123fd34bc75cfd17ee7954383f48b2bdae0))
- v-click-outside changed to vueUse directive ([26d764f](https://github.com/VirtoCommerce/vc-shell/commit/26d764f83c9b53e667a85684b424a91de8e06a29))
- menu and toolbar composer for better typing ([a46dca9](https://github.com/VirtoCommerce/vc-shell/commit/a46dca9cf398a91d75f5114c5ab6ff9b0220123b))
- refactored blade navigation BREAKING CHANGE: openBlade method has changed ([6fdd427](https://github.com/VirtoCommerce/vc-shell/commit/6fdd4273d3060a1c7eca955f4c3eba0f5d34905e))
- popup handler/updated variant templates ([eae6366](https://github.com/VirtoCommerce/vc-shell/commit/eae6366839a2ab2e0c0dccfc14cf7c6bab5731f6))
- navigation refactoring BREAKING CHANGE: changed navigation props names ([2421e50](https://github.com/VirtoCommerce/vc-shell/commit/2421e5057760f42ac491e2d236018d8e064fea78))
- refactored notifications ([84fda40](https://github.com/VirtoCommerce/vc-shell/commit/84fda4097a3afc7bb8e4a9f99da574885b872d7c))

### Bug Fixes

- notification template render condition ([3b5857f](https://github.com/VirtoCommerce/vc-shell/commit/3b5857fa22584a3717ef96b448da747f9a2f4613))
- blade navigation fix ([1a5ed69](https://github.com/VirtoCommerce/vc-shell/commit/1a5ed69640113e6b17acdbebafe65f4f4a33f75e))
- other fixes/refactors and types updated ([46ebd82](https://github.com/VirtoCommerce/vc-shell/commit/46ebd823234741b1e0f8c987b5bcdd65808dbd7a))
- packages mistakes & yarn warnings ([fdc39d2](https://github.com/VirtoCommerce/vc-shell/commit/fdc39d2f25f5a75318c33c82c7eedc4ed479cc1d))

### BREAKING CHANGES

- refactored blade navigation BREAKING CHANGE: openBlade method has changed
- navigation refactoring BREAKING CHANGE: changed navigation props names

## [1.0.69](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.68...v1.0.69) (2023-04-26)

### Features

- transition to yarn berry monorepo ([73a4da7](https://github.com/VirtoCommerce/vc-shell/commit/73a4da7905fffa030501175d76aeaa0f4caae99a))

## [1.0.68](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.67...v1.0.68) (2023-04-24)

### Features

- blade error popup ([2ba0140](https://github.com/VirtoCommerce/vc-shell/commit/2ba0140bd2f79b5848ee5c5b096b02908135cdbe))
- bigint validation rule ([e91f7da](https://github.com/VirtoCommerce/vc-shell/commit/e91f7dab477762ab66ebd8c98ec0ad1e35ac596e))
- error handling ([10ab19a](https://github.com/VirtoCommerce/vc-shell/commit/10ab19a372e247551f16466cf3edfa2b3a7ff82b))
- updated notifications ([0c0a078](https://github.com/VirtoCommerce/vc-shell/commit/0c0a078c8e1ff1e2ca6fd063c60bd3dc0bbe2ef5))

### Bug Fixes

- immediate timeout start in notification ([e91b7ff](https://github.com/VirtoCommerce/vc-shell/commit/e91b7ffc8db231882e5a8f59770e21d2c6d4553b))
- error handling fixes ([594ca20](https://github.com/VirtoCommerce/vc-shell/commit/594ca20b35cc3b8dfd24aa06b6835e48fb36c4c6))
- errors in console ([32d3a68](https://github.com/VirtoCommerce/vc-shell/commit/32d3a688d0c9ef7cbaff7c736cd3c7863f16e567))
- update state of updated columns list props ([89e5bb2](https://github.com/VirtoCommerce/vc-shell/commit/89e5bb28251f9a6c672e6e4f960075f83a5f9b62))
- notification update on timeout change ([1e1643f](https://github.com/VirtoCommerce/vc-shell/commit/1e1643fb18f6d30ee98103575d2b6cfb40e7e099))

### Reverts

- version ([9c36dfd](https://github.com/VirtoCommerce/vc-shell/commit/9c36dfd1b91d391763ae7576be6c2eedd65a4828))

### Code Refactoring

- error interceptor ([5973936](https://github.com/VirtoCommerce/vc-shell/commit/5973936e1d85d8678e73a5e695fd91d0d77b9331))

## [1.0.67](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.66...v1.0.67) (2023-04-18)

### Bug Fixes

- base prop in app-switcher ([b797317](https://github.com/VirtoCommerce/vc-shell/commit/b797317c72b89fca50814c5c84ca472640e3bf04))

## [1.0.66](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.65...v1.0.66) (2023-04-17)

### Bug Fixes

- navigation fix ([5a0fd23](https://github.com/VirtoCommerce/vc-shell/commit/5a0fd23969922026b9fad467004dca89d4a9d105))

## [1.0.65](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.64...v1.0.65) (2023-04-17)

### Bug Fixes

- navigation fix ([7e062d9](https://github.com/VirtoCommerce/vc-shell/commit/7e062d9cab016faa2a6341961f0c857d930d016b))

## [1.0.64](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.63...v1.0.64) (2023-04-14)

### Bug Fixes

- querystring alias ([723bc10](https://github.com/VirtoCommerce/vc-shell/commit/723bc103687d07c350dd4a9720fe674a50e0e131))

## [1.0.63](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.62...v1.0.63) (2023-04-14)

### Features

- bulk delete in vc-table ([56e8a43](https://github.com/VirtoCommerce/vc-shell/commit/56e8a43dd079654a6ee6d45c1a543b9bbb591f36))

## [1.0.62](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.61...v1.0.62) (2023-04-13)

### Reverts

- vc-table without bulk delete ([ca2865b](https://github.com/VirtoCommerce/vc-shell/commit/ca2865bea4c5b9b72fc7b704dfc229f0762fa149))

## [1.0.61](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.60...v1.0.61) (2023-04-13)

### Features

- updated lerna and scripts ([0c73bc7](https://github.com/VirtoCommerce/vc-shell/commit/0c73bc70ed62932baf03d9e028f3d59dad056bf5))
- improved api generation ([58f2ff6](https://github.com/VirtoCommerce/vc-shell/commit/58f2ff66155bc7d58a043bea13d9a46817c4f844))
- ready for blade expanding ([e1e81ab](https://github.com/VirtoCommerce/vc-shell/commit/e1e81ab04742889179396cab4da1b1df2c3afcd3))
- get rid of tsconfig.build ([722f4ce](https://github.com/VirtoCommerce/vc-shell/commit/722f4cef4cf022e2a18bc244392f208572679240))
- components localization files ([5f3c881](https://github.com/VirtoCommerce/vc-shell/commit/5f3c881c910fd5bfab586204c4e1f29a5bb91de9))
- some routing refactoring and fixes ([feb15d7](https://github.com/VirtoCommerce/vc-shell/commit/feb15d72258c48b14803c5f6ee9ef18afc13ff6d))
- asset manager fix, table improvement, other fixes ([90425d5](https://github.com/VirtoCommerce/vc-shell/commit/90425d514714eac8e30712e8d61561d739a0b89d))

### Bug Fixes

- storybook deps ([a61b6b7](https://github.com/VirtoCommerce/vc-shell/commit/a61b6b70cdc19151f7ed472e3f263bee7192a9fe))
- removed console.log ([3040520](https://github.com/VirtoCommerce/vc-shell/commit/304052015aaa8917ba7f0119cdd9c0abf4435c69))
- fixed modified state ([cae1e3d](https://github.com/VirtoCommerce/vc-shell/commit/cae1e3d62cb4528ec93572e67850b58c2c8fef76))
- tailwind warning fix ([7d8d9c5](https://github.com/VirtoCommerce/vc-shell/commit/7d8d9c546a6440c89aac8328de90030d1a78e235))
- deps revert ([6068096](https://github.com/VirtoCommerce/vc-shell/commit/6068096bdef9a3021208399a048e36d027304e89))

### Code Refactoring

- changed logo event ([8a7e17d](https://github.com/VirtoCommerce/vc-shell/commit/8a7e17db7dddfb1c03e48231a3157bfe899ccf4c))

## [1.0.60](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.59...v1.0.60) (2023-03-30)

### Bug Fixes

- pk-223 ([c93149c](https://github.com/VirtoCommerce/vc-shell/commit/c93149c4bf65d3a536d4a69b8905671b2a80eb30))
- vm-1134 ([3413aec](https://github.com/VirtoCommerce/vc-shell/commit/3413aec15023581cd77e32d71d4adc89c2ef3289))
- assets disable save, vc-select improvement ([cc8858f](https://github.com/VirtoCommerce/vc-shell/commit/cc8858f2d933e4210c5125620706673ca6505995))

## [1.0.59](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.58...v1.0.59) (2023-03-29)

### Features

- pk-217 ([198e733](https://github.com/VirtoCommerce/vc-shell/commit/198e733b4e3fb91082a1fd74d65dacabe7305f82))
- table drag'n'drop cols and rows indication ([5e5fde4](https://github.com/VirtoCommerce/vc-shell/commit/5e5fde4c1df98cfe81573e8c476dfd3c6ba8fec9))
- vm-1127 vm-1128 vc-1121 vm-119 ([7c23ecc](https://github.com/VirtoCommerce/vc-shell/commit/7c23ecc699ef4851a2068b172f5871e18a94808c))
- vm-1129 ([44c332e](https://github.com/VirtoCommerce/vc-shell/commit/44c332e28a6b1ab98e50c0957e74ec0d42fe48f5))

### Bug Fixes

- pk-216 pk-215 ([d800f0c](https://github.com/VirtoCommerce/vc-shell/commit/d800f0c39fc7c0b8b211d3e8690139e0678dcc35))
- checkbox click disable ([d29c64b](https://github.com/VirtoCommerce/vc-shell/commit/d29c64b7ce924e52a03f403df1fe6b93076605a2))
- disabled click on table checkbox and actions ([c7a22c1](https://github.com/VirtoCommerce/vc-shell/commit/c7a22c1b6820b6b013347686537c254b5f918112))
- fixed some bugs ([5aa4964](https://github.com/VirtoCommerce/vc-shell/commit/5aa4964e8f8081e0a2c790277ba5db4b0d99ec22))
- vm-1121 ([26a8ce3](https://github.com/VirtoCommerce/vc-shell/commit/26a8ce3857c9bb3864d24c6a890af5ef7bf42bcd))

## [1.0.58](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.57...v1.0.58) (2023-03-24)

### Features

- assets manager/assets module, table fix ([e0d7e57](https://github.com/VirtoCommerce/vc-shell/commit/e0d7e572b2b8fa979895a4d6ab411cd82562e90f))

### Bug Fixes

- fixed closing child blades ([8c3f853](https://github.com/VirtoCommerce/vc-shell/commit/8c3f853370f30b5c35fb2c3bcc03c59bab032838))

## [1.0.57](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.56...v1.0.57) (2023-03-22)

### Features

- added row reordering to vc-table ([85188f7](https://github.com/VirtoCommerce/vc-shell/commit/85188f75270386d577210df077d479a678ecafe6))
- better define global components ([c34e37f](https://github.com/VirtoCommerce/vc-shell/commit/c34e37f9d1aa3a41fdc3a312ee24093569a61d03))
- some types refactoring ([4c039ea](https://github.com/VirtoCommerce/vc-shell/commit/4c039ea4d304e76e3dacb960eaf65dd8700ea5d5))

### Bug Fixes

- some fixes and up version ([ee3d33f](https://github.com/VirtoCommerce/vc-shell/commit/ee3d33f68015cf13cc250346a89c538a0218361b))
- added code-editor export ([783c742](https://github.com/VirtoCommerce/vc-shell/commit/783c742fae9cceb6fb5f68218ad15e25e820fa5e))

## [1.0.56](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.55...v1.0.56) (2023-03-20)

### Features

- new toolbar in vc-editor, image-loader ([72a48fe](https://github.com/VirtoCommerce/vc-shell/commit/72a48fe6372851cff0e73ee73dca715dbca04539))
- edit columns ([43fd8db](https://github.com/VirtoCommerce/vc-shell/commit/43fd8db02d2474a29768e961eb78e98d77c5814b))
- improved table layout ([8011d16](https://github.com/VirtoCommerce/vc-shell/commit/8011d16041e610333ee8395676abbd98720489fe))
- bugfixes and new editor component ([59ef67a](https://github.com/VirtoCommerce/vc-shell/commit/59ef67a2636099d622dad419e14acbc0aef17dca))
- validation and refactoring ([ffc714a](https://github.com/VirtoCommerce/vc-shell/commit/ffc714a7f11afbf2b453686e41d0769243b9ff7a))

### Bug Fixes

- actions fix ([0e9d133](https://github.com/VirtoCommerce/vc-shell/commit/0e9d1336953581f8ce34fc496b8de91a27cdacca))
- return removed methods ([04aee29](https://github.com/VirtoCommerce/vc-shell/commit/04aee299011da8118f6fe089a8a2a7650ee7e124))
- added placement update ([d31a60e](https://github.com/VirtoCommerce/vc-shell/commit/d31a60e97d0ef663107b20acb1371ad79aeb36ec))
- new yarn.lock ([e7492af](https://github.com/VirtoCommerce/vc-shell/commit/e7492afe894926b839bef1ea9a58b86fd83ce1d1))

## [1.0.55](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.54...v1.0.55) (2023-03-15)

### Features

- table sorting/drag'n'drop/column edit ([e542e5c](https://github.com/VirtoCommerce/vc-shell/commit/e542e5c62f589d6d6a4e5d011289a0845bf1326b))

## [1.0.54](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.53...v1.0.54) (2023-03-07)

### Features

- global components refactoring, removed logger, new development flow, removed unnecessary deps ([e50bf7b](https://github.com/VirtoCommerce/vc-shell/commit/e50bf7b7b12287d278432a705971c761f847e16a))
- deps new versions, vc-shell as ES module, config builder refactoring, new logger ([2cee26c](https://github.com/VirtoCommerce/vc-shell/commit/2cee26c6017b449481dd5c3562043b116a95387f))

### Bug Fixes

- increase allowed line length to 120 ([28ac0d7](https://github.com/VirtoCommerce/vc-shell/commit/28ac0d7f77d64ea980666468d4ee194c7f3ffffb))

## [1.0.53](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.52...v1.0.53) (2023-03-02)

### Bug Fixes

- types fix/revert unwanted changes ([bf00500](https://github.com/VirtoCommerce/vc-shell/commit/bf00500be7ecdfea1f190556f2d933c2173e66c9))

## [1.0.52](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.51...v1.0.52) (2023-03-02)

### Features

- fully typed components ([8776b3c](https://github.com/VirtoCommerce/vc-shell/commit/8776b3cae31c4014a7e12167ba345c1c2a2bdceb))

### Bug Fixes

- routing fix ([86f38c6](https://github.com/VirtoCommerce/vc-shell/commit/86f38c6a3c0ce2461fd0c49bd446f5c94c359d61))

## [1.0.51](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.50...v1.0.51) (2023-03-02)

### Bug Fixes

- shared tailwind styles ([9f9be99](https://github.com/VirtoCommerce/vc-shell/commit/9f9be99aa0709d7f5e3a056e7298cb64af8940ef))

## [1.0.50](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.49...v1.0.50) (2023-03-01)

### Features

- fully typed components ([8776b3c](https://github.com/VirtoCommerce/vc-shell/commit/8776b3cae31c4014a7e12167ba345c1c2a2bdceb))

## [1.0.49](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.48...v1.0.49) (2023-02-27)

### Bug Fixes

- removed peer deps ([87312c4](https://github.com/VirtoCommerce/vc-shell/commit/87312c4f11ca4009e17e1f60793a63eed9142b59))
- typings ([b123505](https://github.com/VirtoCommerce/vc-shell/commit/b123505d6dd9e0b9f740ccd354ee760397454745))
- build fix ([f0eea9e](https://github.com/VirtoCommerce/vc-shell/commit/f0eea9e0a5a42bc36b8aaf057e9f476372eb7f50))
- unused var fix ([b0f62e9](https://github.com/VirtoCommerce/vc-shell/commit/b0f62e93adceb10d8c34ce61d18bb6a5622417c1))
- attempt to fix type checking ([59e5874](https://github.com/VirtoCommerce/vc-shell/commit/59e5874a91f0cdbaae84db0608a8577e6eb5911f))
- temporary disable checker ([bad403c](https://github.com/VirtoCommerce/vc-shell/commit/bad403c50a890749039c5b02828f6e28878427a5))
- typeRoots ([24321ca](https://github.com/VirtoCommerce/vc-shell/commit/24321ca2cc3b83a358e06880e4c9ff416d1cd950))
- typo ([ebb4f20](https://github.com/VirtoCommerce/vc-shell/commit/ebb4f207d714c42051626e600f883b4f87aa293c))
- types in tsconfig ([c436813](https://github.com/VirtoCommerce/vc-shell/commit/c4368138e809d272c87ea2c264204ca2e716b3be))
- typings ([b41d7ca](https://github.com/VirtoCommerce/vc-shell/commit/b41d7ca4b7a7967bc83c52a0810cfde77077747c))

## [1.0.48](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.47...v1.0.48) (2023-02-27)

### Features

- **moment:** add precise duration formatting (#156) ([ab24d01](https://github.com/VirtoCommerce/vc-shell/commit/ab24d01380605a2c55b243853395574c1e4cf111))

### Bug Fixes

- slider fix ([52586c4](https://github.com/VirtoCommerce/vc-shell/commit/52586c45a2afccad5d9d4afa4e830389ec3b192f))

## [1.0.47](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.46...v1.0.47) (2023-02-22)

### Bug Fixes

- fixed types ([88c89e2](https://github.com/VirtoCommerce/vc-shell/commit/88c89e20430bbd727827ba82ca3427f11aff0c1c))

## [1.0.46](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.45...v1.0.46) (2023-02-16)

### Bug Fixes

- tailwind blade fix ([ffdbf5a](https://github.com/VirtoCommerce/vc-shell/commit/ffdbf5a8ee00d4fb2a77d185b271dfbf048e9961))

## [1.0.45](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.44...v1.0.45) (2023-02-15)

### Features

- version up ([dd20390](https://github.com/VirtoCommerce/vc-shell/commit/dd203905f203990f31e1dd57c16ed6fe43ac0b4b))

### Bug Fixes

- list price column in offers ([e03af66](https://github.com/VirtoCommerce/vc-shell/commit/e03af662dfcff71b2cd1a98fdd2a684baa922317))

## [1.0.44](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.43...v1.0.44) (2023-02-08)

### Bug Fixes

- version (#153) ([2a9b571](https://github.com/VirtoCommerce/vc-shell/commit/2a9b57151e66df6608e13dd101ce0844fe315f7e))

## [1.0.43](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.42...v1.0.43) (2023-02-02)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.42](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.41...v1.0.42) (2023-02-02)

### Features

- add composables for popular code duplicates (#152) ([da9d3f3](https://github.com/VirtoCommerce/vc-shell/commit/da9d3f300e43d536c563bb5ca1214ec8b54fefa3))

## [1.0.41](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.40...v1.0.41) (2023-01-20)

### Features

- extended customization ([07275b8](https://github.com/VirtoCommerce/vc-shell/commit/07275b862e8fddfe01ab9ceabca85f4e1449cace))

## [1.0.40](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.39...v1.0.40) (2023-01-17)

### Features

- extended customization ([f67cefc](https://github.com/VirtoCommerce/vc-shell/commit/f67cefcd836868cf2e24df3313eb3edc3bfd2635))
- extended customization ([38183ee](https://github.com/VirtoCommerce/vc-shell/commit/38183ee829836e44644864f7036c7eb18653d291))
- completed UI inputs refactoring ([c1a3f17](https://github.com/VirtoCommerce/vc-shell/commit/c1a3f17525f3287a76426fcf065aae674ad808ce))
- new input and select component ([c5b9bc4](https://github.com/VirtoCommerce/vc-shell/commit/c5b9bc4657a33eb0a141c7ed113b53815df91338))

### Bug Fixes

- components refactoring ([3eccded](https://github.com/VirtoCommerce/vc-shell/commit/3eccdeddaa04d208793a3408847aca298be95ee9))
- useBladeNavigation parent routing error fix ([7e03eff](https://github.com/VirtoCommerce/vc-shell/commit/7e03effef5961aa0e23d5db337eda6b36563922e))

## [1.0.39](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.38...v1.0.39) (2022-12-12)

### Features

- completed validation refactoring ([5d673fc](https://github.com/VirtoCommerce/vc-shell/commit/5d673fc2a3fdf8cc239171bf94b70ca621268a8e))
- validation draft ([ed7c743](https://github.com/VirtoCommerce/vc-shell/commit/ed7c7439147d9cd37a08cd8097891cc889c1f592))

### Bug Fixes

- refactored aliases, main blade expanded fix/param fix, eslint config in framework ([673b714](https://github.com/VirtoCommerce/vc-shell/commit/673b7144abb98aa66cf4c13f54d457a78213dcf4))
- removed console.log ([f5c6001](https://github.com/VirtoCommerce/vc-shell/commit/f5c60017d72c115cfd8b83624175fcd8b0180cf7))

## [1.0.38](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.37...v1.0.38) (2022-12-05)

### Features

- navigation and component types, fixes and improvements ([de303e0](https://github.com/VirtoCommerce/vc-shell/commit/de303e0519e9212e692501132257903e88572d4f))
- merged framework library ([46a2691](https://github.com/VirtoCommerce/vc-shell/commit/46a26910b5c437fddec8d280445209999ff77240))
- app switcher ([dd7f478](https://github.com/VirtoCommerce/vc-shell/commit/dd7f4789849f6a8a39c95672246140e607c7e287))
- app switcher ([a214461](https://github.com/VirtoCommerce/vc-shell/commit/a21446130ca7def12cd4aef9a4feb0aa66e813b1))
- small refactoring ([721448f](https://github.com/VirtoCommerce/vc-shell/commit/721448f4398a179a77b70e1992873771c13ff3c8))
- combined vue router + custom ([6d1b6d3](https://github.com/VirtoCommerce/vc-shell/commit/6d1b6d31defe685253dc53f3e761784208f1e92b))
- combined vue router + custom ([762edea](https://github.com/VirtoCommerce/vc-shell/commit/762edeaa3cef2d80e68c53ce5605b4e2d3aedf63))
- app switcher component, tailwind classes refactoring ([1f25176](https://github.com/VirtoCommerce/vc-shell/commit/1f25176ee0594af1f44ec17268af704c4c1da03f))

### Bug Fixes

- navigation fix w/o navigationCB ([66f27e3](https://github.com/VirtoCommerce/vc-shell/commit/66f27e306011d994bb2f0eb31d4cf54383b92c0a))
- removed app switcher item description ([dc4ce9c](https://github.com/VirtoCommerce/vc-shell/commit/dc4ce9c3114a86bec23a18941c31351198f3e2c5))
- switcher width ([6ee568c](https://github.com/VirtoCommerce/vc-shell/commit/6ee568c4a23182dc47cb27e8f94e6ff6c8fff972))
- removed api factories ([bb54dc1](https://github.com/VirtoCommerce/vc-shell/commit/bb54dc10a0e004cc22ed9f66686c41cedd0c14a5))
- some fixes ([7f17c63](https://github.com/VirtoCommerce/vc-shell/commit/7f17c63592180532ac21ee62dd327bda37d5eb29))

## [1.0.37](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.36...v1.0.37) (2022-11-22)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.36](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.35...v1.0.36) (2022-11-21)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.35](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.34...v1.0.35) (2022-11-15)

### Bug Fixes

- remove unwanted gitHead ([3ec4f11](https://github.com/VirtoCommerce/vc-shell/commit/3ec4f115d030375da0b1675be645bad43ee9c544))

## [1.0.34](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.33...v1.0.34) (2022-11-15)

### Features

- request refactoring ([415131a](https://github.com/VirtoCommerce/vc-shell/commit/415131a5874ed14886ffb6398e2cad9606162fbf))

### Bug Fixes

- vc-input validation rules (#141) ([666441b](https://github.com/VirtoCommerce/vc-shell/commit/666441be57c177b49d7fb5094198e2e13039d4b2))
- vuedraggable fix ([e5a78c1](https://github.com/VirtoCommerce/vc-shell/commit/e5a78c19a6581c7e545163731a13b16b7bbf104d))
- vuedraggable fix ([f449489](https://github.com/VirtoCommerce/vc-shell/commit/f4494896149c50c2ef27bca82f87b45266e36807))

## [1.0.33](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.32...v1.0.33) (2022-10-24)

### Bug Fixes

- vuedraggable fix ([cbeeaae](https://github.com/VirtoCommerce/vc-shell/commit/cbeeaae13805b4b933b1bdb696585eb208aed445))
- vuedraggable fix ([cac509c](https://github.com/VirtoCommerce/vc-shell/commit/cac509c2a3fa5cfbd1cf532e5cc8ec0e0d85ea15))

## [1.0.32](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.31...v1.0.32) (2022-10-20)

### Bug Fixes

- api client generation ([a8919a0](https://github.com/VirtoCommerce/vc-shell/commit/a8919a014f17bd1a737b6f4ff151fbdb4ced3ebb))

## [1.0.31](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.30...v1.0.31) (2022-10-14)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.30](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.29...v1.0.30) (2022-10-14)

### Features

- full lib content to npm ([28cc487](https://github.com/VirtoCommerce/vc-shell/commit/28cc4874abb7806e073c976cd12baf1f8bd22f1a))

## [1.0.29](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.28...v1.0.29) (2022-10-14)

### Features

- rating component (#136) ([f3ea347](https://github.com/VirtoCommerce/vc-shell/commit/f3ea3478eecd2e5f4bcc058c9569597b6c5c77ff))
- pseudo-monorepo ([a7f7a4a](https://github.com/VirtoCommerce/vc-shell/commit/a7f7a4a8b09739e1755d0cf065fd798c9d66f3aa))

## [1.0.28](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.27...v1.0.28) (2022-10-10)

### Features

- merge autosave ([8cb20db](https://github.com/VirtoCommerce/vc-shell/commit/8cb20dbd45e990cadcf8eb3b28e4bf463135c397))

### Bug Fixes

- signIn issue ([c54ae9a](https://github.com/VirtoCommerce/vc-shell/commit/c54ae9aacbab57b5c650304bb2aa9bbb40b85227))

## [1.0.27](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.26...v1.0.27) (2022-10-07)

### Bug Fixes

- fix sharing auth data ([6493fc1](https://github.com/VirtoCommerce/vc-shell/commit/6493fc1691925e9dc91061428f42c3e8fbfbe35a))

## [1.0.26](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.25...v1.0.26) (2022-10-07)

### Bug Fixes

- local storage auth key ([5d999d6](https://github.com/VirtoCommerce/vc-shell/commit/5d999d60cf465bca29db559a9ea9312857f9ecb2))

## [1.0.25](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.24...v1.0.25) (2022-10-07)

### Features

- share auth data between platform manager and custom apps ([c466d00](https://github.com/VirtoCommerce/vc-shell/commit/c466d00b341e8e3d9dc7d6861449daad64d9b1c7))

## [1.0.24](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.23...v1.0.24) (2022-10-06)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.23](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.22...v1.0.23) (2022-10-06)

### Bug Fixes

- rename virto-shell -> virtocommerce ([ba74f8f](https://github.com/VirtoCommerce/vc-shell/commit/ba74f8fb7fcb61744f2348e8521dfae77775418b))
- build ([6be999b](https://github.com/VirtoCommerce/vc-shell/commit/6be999b2f13aa8a040374f668b8b71450e7c8c6b))

## [1.0.22](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.21...v1.0.22) (2022-09-29)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.21](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.20...v1.0.21) (2022-09-14)

### Features

- vm-801 1042 800 569 1043 914 814 1054 920 1019 ([8bf48a3](https://github.com/VirtoCommerce/vc-shell/commit/8bf48a32989c1b64b2aac4a5bc96b9bdcf7f995a))
- vm-741 893 1005 1019 1021 513 978 914 920 828 963 755 ([b8b2cda](https://github.com/VirtoCommerce/vc-shell/commit/b8b2cdaedf32128b35c04d85689eb3203057b7d0))

## [1.0.20](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.19...v1.0.20) (2022-09-06)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.19](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.17...v1.0.19) (2022-08-30)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.17](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.16...v1.0.17) (2022-08-05)

### Bug Fixes

- permissions fix ([d53c3c3](https://github.com/VirtoCommerce/vc-shell/commit/d53c3c39196e9a8aa5dac6b223bbfb81b5a5f54c))

## [1.0.16](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.14...v1.0.16) (2022-08-05)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.14](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.13...v1.0.14) (2022-08-04)

### Features

- version up ([85d5ab5](https://github.com/VirtoCommerce/vc-shell/commit/85d5ab59926cc4fe8c2e6464a0d6cb1e849c975d))
- vm-902 ([0f2fea6](https://github.com/VirtoCommerce/vc-shell/commit/0f2fea663a12fcd393a9b5567e69cf15bc42583f))
- vm-679, vm-814, vm-807, vc-selector refactoring ([d3426f2](https://github.com/VirtoCommerce/vc-shell/commit/d3426f2bd034e5971d6cc33af5e8f22ce65e27c0))
- new selector ([0880668](https://github.com/VirtoCommerce/vc-shell/commit/0880668fab57925296fd6b4725d9c50157da3b08))
- new selector ([07ce374](https://github.com/VirtoCommerce/vc-shell/commit/07ce3748aa03cedb2a7d25e2a0b1f798374fed94))
- new selector ([d600bb9](https://github.com/VirtoCommerce/vc-shell/commit/d600bb9b6aadf1b1716decd6ba3a0c9fef4e5ec7))
- generate API clients from command line ([d8c1870](https://github.com/VirtoCommerce/vc-shell/commit/d8c1870aa38f4376181a584c3259aae3f547d792))

### Bug Fixes

- refactoring ([d20e1cd](https://github.com/VirtoCommerce/vc-shell/commit/d20e1cd36cf7e85e4dc7ca89a1599194619d353a))
- baseUrl ([7306cf9](https://github.com/VirtoCommerce/vc-shell/commit/7306cf9f3218f6cbab639a460b982e4bd7e1220c))
- shorter human-readable names ([23033f7](https://github.com/VirtoCommerce/vc-shell/commit/23033f77aa6f6788b4e2ef1353a3c14cc6fe7392))
- merge main branch ([2af0145](https://github.com/VirtoCommerce/vc-shell/commit/2af0145f565a1fefd9d55995bb7d4793a666e33a))

## [1.0.13](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.12...v1.0.13) (2022-07-14)

### Features

- product details improvements (#120) ([199455c](https://github.com/VirtoCommerce/vc-shell/commit/199455c88ff1b932d2ab5e79a0f40485cdb5e181))
- npm publish configuration ([41e3ff8](https://github.com/VirtoCommerce/vc-shell/commit/41e3ff8c04eccff1ed9a934c5a3457aec26a32dc))

## [1.0.12](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.11...v1.0.12) (2022-07-12)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.11](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.10...v1.0.11) (2022-07-08)

### Features

- org page ([9aa669f](https://github.com/VirtoCommerce/vc-shell/commit/9aa669f2430857f1d599e8b57425ad2ba7d8758a))
- org page ([d058bfc](https://github.com/VirtoCommerce/vc-shell/commit/d058bfcf414550707db7c2a39d76fa5a513a1350))

## [1.0.10](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.9...v1.0.10) (2022-06-29)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.9](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.8...v1.0.9) (2022-06-21)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.8](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.7...v1.0.8) (2022-06-16)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.7](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.6...v1.0.7) (2022-06-09)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.6](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.5...v1.0.6) (2022-06-09)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.5](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.4...v1.0.5) (2022-06-07)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.4](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.3...v1.0.4) (2022-06-03)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.3](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.2...v1.0.3) (2022-05-30)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.2](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.1...v1.0.2) (2022-05-25)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.1](https://github.com/VirtoCommerce/vc-shell/compare/v1.0.0...v1.0.1) (2022-05-24)

**Note:** Version bump only for package @vc-shell/framework

## [1.0.0](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.20...v1.0.0) (2022-05-13)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.20](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.19...v0.1.20) (2022-04-27)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.19](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.18...v0.1.19) (2022-04-19)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.18](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.17...v0.1.18) (2022-04-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.17](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.16...v0.1.17) (2022-04-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.16](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.15...v0.1.16) (2022-04-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.15](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.14...v0.1.15) (2022-04-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.14](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.13...v0.1.14) (2022-04-15)

### Features

- cli config generation lib ([4630d4f](https://github.com/VirtoCommerce/vc-shell/commit/4630d4f055e8300eaf69d8e0f5ac94fa31c91703))
- new order notification ([1503ced](https://github.com/VirtoCommerce/vc-shell/commit/1503ced87cf3dc972b6a54a10cd593ff28ff92ea))
- multivalue dictionary, bugfixes, removed import profile name ([13067e6](https://github.com/VirtoCommerce/vc-shell/commit/13067e603d8f24b60a85a98b1232b7f4d35002e1))

### Bug Fixes

- template fix ([07b1fd3](https://github.com/VirtoCommerce/vc-shell/commit/07b1fd3f75022ac9b7e130774b1475d4e9239649))
- ws while dev, push fix ([ec86b1e](https://github.com/VirtoCommerce/vc-shell/commit/ec86b1e9376e6030fad59cf97b44d845a486f5e1))

## [0.1.13](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.12...v0.1.13) (2022-04-14)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.12](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.11...v0.1.12) (2022-04-07)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.11](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.10...v0.1.11) (2022-04-05)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.10](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.9...v0.1.10) (2022-04-04)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.9](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.8...v0.1.9) (2022-04-01)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.8](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.7...v0.1.8) (2022-03-29)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.7](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.6...v0.1.7) (2022-03-17)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.6](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.5...v0.1.6) (2022-03-16)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.5](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.4...v0.1.5) (2022-03-16)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.4](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.3...v0.1.4) (2022-03-16)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.3](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.2...v0.1.3) (2022-03-14)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.2](https://github.com/VirtoCommerce/vc-shell/compare/v0.1.1...v0.1.2) (2022-03-10)

**Note:** Version bump only for package @vc-shell/framework

## [0.1.1](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.123...v0.1.1) (2022-03-10)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.123](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.122...v0.0.123) (2022-03-04)

### Bug Fixes

- dynamic name fix ([b083495](https://github.com/VirtoCommerce/vc-shell/commit/b0834951087f720562f28fc78a28a69ea0e65cb9))
- required key change ([5de380f](https://github.com/VirtoCommerce/vc-shell/commit/5de380f3a2f1493a3a45b1f1199aaa9cb224df76))
- dictionary ([65127f9](https://github.com/VirtoCommerce/vc-shell/commit/65127f97d597e4dc7224c70c04902399b0c05adf))

## [0.0.122](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.121...v0.0.122) (2022-02-28)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.121](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.120...v0.0.121) (2022-02-24)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.120](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.119...v0.0.120) (2022-02-17)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.119](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.117...v0.0.119) (2022-02-16)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.117](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.116...v0.0.117) (2022-02-16)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.116](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.115...v0.0.116) (2022-02-14)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.115](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.114...v0.0.115) (2022-02-04)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.114](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.113...v0.0.114) (2022-02-03)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.113](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.112...v0.0.113) (2022-02-03)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.112](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.111...v0.0.112) (2022-02-03)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.111](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.110...v0.0.111) (2022-01-31)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.110](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.109...v0.0.110) (2022-01-31)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.109](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.108...v0.0.109) (2022-01-28)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.108](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.107...v0.0.108) (2022-01-24)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.107](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.106...v0.0.107) (2022-01-20)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.106](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.105...v0.0.106) (2022-01-10)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.105](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.104...v0.0.105) (2021-12-30)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.104](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.103...v0.0.104) (2021-12-29)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.103](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.102...v0.0.103) (2021-12-28)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.102](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.101...v0.0.102) (2021-12-27)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.101](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.100...v0.0.101) (2021-12-24)

### Bug Fixes

- **ui:** deps ([3b5a375](https://github.com/VirtoCommerce/vc-shell/commit/3b5a375f5794cf1c87d042f0e541f3badfe66f47))

## [0.0.100](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.99...v0.0.100) (2021-12-24)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.99](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.98...v0.0.99) (2021-12-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.98](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.97...v0.0.98) (2021-12-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.97](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.96...v0.0.97) (2021-12-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.96](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.95...v0.0.96) (2021-12-13)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.95](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.94...v0.0.95) (2021-12-07)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.94](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.93...v0.0.94) (2021-12-07)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.93](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.92...v0.0.93) (2021-12-07)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.92](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.91...v0.0.92) (2021-12-04)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.91](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.90...v0.0.91) (2021-12-03)

### Features

- vm-271 removed currency sign ([579257b](https://github.com/VirtoCommerce/vc-shell/commit/579257bab5ba9b44cb59590f6c989cbb81c16444))
- vm-271 fixes ([62c75ee](https://github.com/VirtoCommerce/vc-shell/commit/62c75ee93f85c86f9d9eb9c1fd17aeacf197aade))
- vm-271 fixes ([3eb887d](https://github.com/VirtoCommerce/vc-shell/commit/3eb887d3f416977cfd1f1e0ba2f106f1dae3b60a))
- vm-271 input fix ([0b1b538](https://github.com/VirtoCommerce/vc-shell/commit/0b1b5388560a7f9346c8ab666f0303247c74f2a3))
- vm-271 ([3f9dd6d](https://github.com/VirtoCommerce/vc-shell/commit/3f9dd6d443ea16fbba61e1efb2da2244abd4bc10))

## [0.0.90](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.89...v0.0.90) (2021-12-02)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.89](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.88...v0.0.89) (2021-12-02)

### Bug Fixes

- vm-100 tooltip disabled state ([f7c5527](https://github.com/VirtoCommerce/vc-shell/commit/f7c55271dafb439a44a59683389c007a92f7ae2b))

## [0.0.88](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.87...v0.0.88) (2021-12-02)

### Features

- vm-100 fix: vm-336 ([3533d23](https://github.com/VirtoCommerce/vc-shell/commit/3533d234d4ded877fb3eecaa3046d2738fda2d8c))

### Bug Fixes

- vm-100 tooltip disabled state ([0775fee](https://github.com/VirtoCommerce/vc-shell/commit/0775fee621febcd2ab735204672eb53fb4153319))
- vm-100 tooltip positioning on scroll ([5a46ced](https://github.com/VirtoCommerce/vc-shell/commit/5a46ceda3ec24b23200e0e5c4d3f6e13deb7c87f))
- vm-100 tooltip positioning on scroll ([a262292](https://github.com/VirtoCommerce/vc-shell/commit/a26229246f9a2ada8d35e0767f6c2bd5c3d3d22e))
- vm-100 tooltip positioning on scroll ([5db55b9](https://github.com/VirtoCommerce/vc-shell/commit/5db55b998576cee79e0b81d48005a36b044fca90))
- vm-336 toolbar init value ([fc921fc](https://github.com/VirtoCommerce/vc-shell/commit/fc921fcb1be877a514685e36e433abcf7a7b22fb))
- vm-346, vm-280, vm-267 ([29c74a1](https://github.com/VirtoCommerce/vc-shell/commit/29c74a1f51dba58b61c46e14076592488322d1d8))
- vm-346, vm-280, vm-267 ([96061ce](https://github.com/VirtoCommerce/vc-shell/commit/96061ce6195ced76ec1e543ef09754ce49e6b5f1))

## [0.0.87](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.86...v0.0.87) (2021-12-01)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.86](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.85...v0.0.86) (2021-12-01)

### Bug Fixes

- build failure ([9911a30](https://github.com/VirtoCommerce/vc-shell/commit/9911a307973c6a55b324f857a577afec4c54a669))

## [0.0.85](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.84...v0.0.85) (2021-12-01)

### Bug Fixes

- vm-346, vm-280, vm-267 ([5859b36](https://github.com/VirtoCommerce/vc-shell/commit/5859b36b1e88414e83a36589b3ae0c4f95763d93))
- vm-346, vm-280, vm-267 ([803c581](https://github.com/VirtoCommerce/vc-shell/commit/803c581e723feed4a8430d078b27b3e70db2a763))

## [0.0.84](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.83...v0.0.84) (2021-11-26)

### Features

- signalr push notifications ([3a4e327](https://github.com/VirtoCommerce/vc-shell/commit/3a4e32707147ae36f91648242d7db12d83ee367e))

## [0.0.83](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.82...v0.0.83) (2021-11-24)

### Features

- dynamic property select search ([02b7726](https://github.com/VirtoCommerce/vc-shell/commit/02b77266eed60282fe2cb6591344d77439f287ce))

## [0.0.82](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.81...v0.0.82) (2021-11-24)

### Features

- signalr integration (WIP) ([1db00e8](https://github.com/VirtoCommerce/vc-shell/commit/1db00e835c2a6a62338d62934da317aa8c1ddf98))

## [0.0.81](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.80...v0.0.81) (2021-11-23)

### Bug Fixes

- vm-320, 330, 331, 332, 333 ([21a8fa5](https://github.com/VirtoCommerce/vc-shell/commit/21a8fa54ec28a854b3ad039a47340f058ed52706))

## [0.0.80](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.79...v0.0.80) (2021-11-22)

### Features

- vc-widget disabled state, vc-gallery disabled state, vc-table row highlight ([a87dc75](https://github.com/VirtoCommerce/vc-shell/commit/a87dc7544d89cec7bc7f6de50d2c9d5185db0fe7))

## [0.0.79](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.78...v0.0.79) (2021-11-22)

### Features

- download invoice + some minor UI bug fixes ([bbb6cca](https://github.com/VirtoCommerce/vc-shell/commit/bbb6cca09895d24420d7184354efaf8f7db7722f))

## [0.0.78](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.77...v0.0.78) (2021-11-22)

### Features

- multivalue fields, table cell templates ([0096eda](https://github.com/VirtoCommerce/vc-shell/commit/0096eda8c565db8d69255d0c7232469dce5a658e))

## [0.0.77](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.76...v0.0.77) (2021-11-18)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.76](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.75...v0.0.76) (2021-11-18)

### Features

- offer tier prices ([f19f6e9](https://github.com/VirtoCommerce/vc-shell/commit/f19f6e9ce2a9927f2a6b5b4d64f9dfd9b8ee93a0))

## [0.0.75](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.74...v0.0.75) (2021-11-18)

### Features

- properties validation ([6ae2d66](https://github.com/VirtoCommerce/vc-shell/commit/6ae2d668814ea02ee81d459b75e218a9a18f8e4b))
- properties validation (WIP) ([9d021d0](https://github.com/VirtoCommerce/vc-shell/commit/9d021d062ea32b1ab945b88134641a98bf7f10b9))
- properties validation (WIP) ([1180217](https://github.com/VirtoCommerce/vc-shell/commit/11802175cf15b4bf66b593c125c9b7b04a392269))

## [0.0.74](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.73...v0.0.74) (2021-11-12)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.73](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.71...v0.0.73) (2021-11-11)

### Features

- tier prices for offer ([1531a61](https://github.com/VirtoCommerce/vc-shell/commit/1531a6152ff1023a41c92f84ceb6cf01e8d1b115))

## [0.0.71](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.70...v0.0.71) (2021-11-11)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.70](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.69...v0.0.70) (2021-11-08)

### Features

- vm-283, vm-284, vm-285, vm-286, vm-287, vm-288, vm-289, vm-290, vm-291, vm-292, vm-293 ([55541a8](https://github.com/VirtoCommerce/vc-shell/commit/55541a8fa355999cdc9a222d2e79723e387b618e))

## [0.0.69](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.68...v0.0.69) (2021-11-03)

### Features

- dynamic select properties ([b19e44e](https://github.com/VirtoCommerce/vc-shell/commit/b19e44e09cb7ddb430d31069ffb1d6d9b78e6822))

## [0.0.68](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.67...v0.0.68) (2021-11-02)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.67](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.66...v0.0.67) (2021-11-02)

### Features

- mobile dashboard, image dnd upload ([eae8508](https://github.com/VirtoCommerce/vc-shell/commit/eae85084a41dad38dc2d5dea26aedc53ebd5a2e1))

## [0.0.66](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.65...v0.0.66) (2021-11-02)

### Features

- new product details ui, vc-card collapsable ([3f2d1b4](https://github.com/VirtoCommerce/vc-shell/commit/3f2d1b4eaeacfb032399b7fd8abedf252d7693a7))

## [0.0.65](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.64...v0.0.65) (2021-11-01)

### Features

- new dashboard ([28c7d82](https://github.com/VirtoCommerce/vc-shell/commit/28c7d824b49147be20215301f091253467e35b16))

## [0.0.64](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.63...v0.0.64) (2021-10-28)

### Features

- active row highlight ([cc4f7f9](https://github.com/VirtoCommerce/vc-shell/commit/cc4f7f90d0aad690aa9cac5f1e52b5c027964ed4))

## [0.0.63](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.62...v0.0.63) (2021-10-28)

### Features

- filter counter ([15c6bab](https://github.com/VirtoCommerce/vc-shell/commit/15c6babdf294591c627ad27df570507a3585f57b))

## [0.0.62](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.61...v0.0.62) (2021-10-28)

### Features

- filters ([2a89cf8](https://github.com/VirtoCommerce/vc-shell/commit/2a89cf872729667cbaa1c9457eadb0fbee2a0018))
- filters (WIP) ([b25ad3a](https://github.com/VirtoCommerce/vc-shell/commit/b25ad3a23a0f08cd9b3d3837d5223dc045eb8b55))

## [0.0.61](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.60...v0.0.61) (2021-10-26)

### Features

- dashboard ([683f65a](https://github.com/VirtoCommerce/vc-shell/commit/683f65ac6d01b974dc05d931f62277891688ef1f))

## [0.0.60](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.59...v0.0.60) (2021-10-22)

### Features

- order details page ([b8fe53d](https://github.com/VirtoCommerce/vc-shell/commit/b8fe53d7282a6e0381af5eedbf272001a63b3ba9))

## [0.0.59](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.58...v0.0.59) (2021-10-20)

### Features

- seller accept invitation form ([8f5d5b9](https://github.com/VirtoCommerce/vc-shell/commit/8f5d5b9cae6a0c057b1831a48fc41fae13792f00))

## [0.0.58](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.57...v0.0.58) (2021-10-20)

### Features

- orders edit and additional components ([e8cf8a3](https://github.com/VirtoCommerce/vc-shell/commit/e8cf8a3333664c8d326fdd5df28a2fd9981c550a))
- additional fields (WIP) ([27596bd](https://github.com/VirtoCommerce/vc-shell/commit/27596bdcdf30790c56e8c2d571309fb9dd05f9b4))

## [0.0.57](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.56...v0.0.57) (2021-10-15)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.56](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.55...v0.0.56) (2021-10-13)

### Features

- password field unhide ([2e6deb0](https://github.com/VirtoCommerce/vc-shell/commit/2e6deb01657515c3128ec62c287ecbda5ef92e9e))

## [0.0.55](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.54...v0.0.55) (2021-10-13)

### Features

- new icons, ptr improvements, offers list ptr ([fe0438b](https://github.com/VirtoCommerce/vc-shell/commit/fe0438b6c43b9a0d4baa52293e619c645c2f6f8d))

## [0.0.54](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.53...v0.0.54) (2021-10-13)

### Features

- some smooth animations ([79f2aad](https://github.com/VirtoCommerce/vc-shell/commit/79f2aadac40f91ef76f9efc484d37184a47c2b95))

### Bug Fixes

- ptr overscroll height ([88f3a1e](https://github.com/VirtoCommerce/vc-shell/commit/88f3a1e356fcf0f7e4855c9b77d8db28bbcdd607))

## [0.0.53](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.52...v0.0.53) (2021-10-13)

### Features

- scroll ptr, menu styling ([4eff9a0](https://github.com/VirtoCommerce/vc-shell/commit/4eff9a0fffc9feef8dbad433d210f0537702efd2))

## [0.0.52](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.51...v0.0.52) (2021-10-13)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.51](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.50...v0.0.51) (2021-10-13)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.50](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.49...v0.0.50) (2021-10-12)

### Features

- list mobile actions ([c269a88](https://github.com/VirtoCommerce/vc-shell/commit/c269a88b9ca304520b9157a51ccd4c602fd0059b))
- mobile swipe transition ([8fdccb1](https://github.com/VirtoCommerce/vc-shell/commit/8fdccb1345ba3f2d495a6f9344503f1c50b27a7b))

## [0.0.49](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.48...v0.0.49) (2021-10-12)

### Features

- mobile extended actions, vendor-portal detached ([c92a317](https://github.com/VirtoCommerce/vc-shell/commit/c92a31743ded9788c939641ccff9922328b6f2f6))

## [0.0.48](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.47...v0.0.48) (2021-10-06)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.47](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.46...v0.0.47) (2021-10-06)

### Features

- filters and swipe actions ([a463ad5](https://github.com/VirtoCommerce/vc-shell/commit/a463ad59519925ea5fd1ee2f90d45e85d5ef2008))

## [0.0.46](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.45...v0.0.46) (2021-09-30)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.45](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.44...v0.0.45) (2021-09-30)

### Features

- validation ([43a7ab9](https://github.com/VirtoCommerce/vc-shell/commit/43a7ab96c5dd302f5960a6b2e55f5460a547d82c))

### Bug Fixes

- minor refactoring ([a0c287c](https://github.com/VirtoCommerce/vc-shell/commit/a0c287ccf4678a315737c98961d1ea51394f24a8))

## [0.0.44](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.43...v0.0.44) (2021-09-29)

### Features

- vc-select update ([5188c4b](https://github.com/VirtoCommerce/vc-shell/commit/5188c4bc60df3cac4a446d95d70d384903090171))
- blade navigation improvements ([5dd0a7e](https://github.com/VirtoCommerce/vc-shell/commit/5dd0a7e745c04684de702e780e978e580800d476))
- mobile table, menu and toolbar isVisible handling ([948d655](https://github.com/VirtoCommerce/vc-shell/commit/948d655dd106ddd08d161879a78b8a5aa2adf896))
- vc-app update, login form improvements ([3618289](https://github.com/VirtoCommerce/vc-shell/commit/36182892ae2496b6a693aaa9ad3cea5e13d5a55f))
- vc-select/autocomplete keyProperty and displayProperty props ([da380ab](https://github.com/VirtoCommerce/vc-shell/commit/da380ab9729bd48b0b2a869535bf01f95b51e9cd))

### Bug Fixes

- deepClone for product ([d587e39](https://github.com/VirtoCommerce/vc-shell/commit/d587e39345fcca9a28f8290ba9761e0325e933de))
- build failure fix ([d9cd4e7](https://github.com/VirtoCommerce/vc-shell/commit/d9cd4e76378d328527f46f91930ee352fe8f811c))

## [0.0.43](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.42...v0.0.43) (2021-09-24)

### Features

- product list update on changes ([198731f](https://github.com/VirtoCommerce/vc-shell/commit/198731ff5b8b5a0539ccca5c4998bb02f2d5b4fb))
- autocomplete and select v-models ([775c913](https://github.com/VirtoCommerce/vc-shell/commit/775c91388c7fc05db08b82663310ba3153187245))
- basic mobile UI/UX ([77be3a4](https://github.com/VirtoCommerce/vc-shell/commit/77be3a414e842500e6ca9fded1ffadd4eccb68ed))
- routing update ([d7ec6ef](https://github.com/VirtoCommerce/vc-shell/commit/d7ec6effd07aa5c5156a7f36cf652dbe024803c7))
- gallery upload, table width, label updates ([596ec14](https://github.com/VirtoCommerce/vc-shell/commit/596ec1451d7f4c57abc5b336737b40d79773000d))

## [0.0.42](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.41...v0.0.42) (2021-09-23)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.41](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.40...v0.0.41) (2021-09-23)

### Features

- apply new statuses matrix ([31f2ab0](https://github.com/VirtoCommerce/vc-shell/commit/31f2ab0fa9ee28491cb43d993a56be2a86ff835e))

## [0.0.40](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.39...v0.0.40) (2021-09-23)

### Features

- product list connect to Api ([53bb711](https://github.com/VirtoCommerce/vc-shell/commit/53bb7119dd0603cb136024a35ff66cb47cfd8248))

## [0.0.39](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.38...v0.0.39) (2021-09-13)

### Features

- vm-94 - gallery component ([ee288e2](https://github.com/VirtoCommerce/vc-shell/commit/ee288e2107771e8ae6787fbd3bdbf03fd4ef3b4a))
- gallery component ([ecb9219](https://github.com/VirtoCommerce/vc-shell/commit/ecb9219d376035a9e16f221bcb961f50b1443179))
- vm-26 - form components improvements ([2ffc621](https://github.com/VirtoCommerce/vc-shell/commit/2ffc62184f436c2e029e529975c5f1c379ce8c3a))

## [0.0.38](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.37...v0.0.38) (2021-09-09)

### Features

- repository-level storybook ([436addd](https://github.com/VirtoCommerce/vc-shell/commit/436addda5f2b546e780ae895f9316b52447b5fc1))
- naming standarts ([45a4eae](https://github.com/VirtoCommerce/vc-shell/commit/45a4eae642d1f7d67efe8551ea7e3a37d6d47abb))

## [0.0.37](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.36...v0.0.37) (2021-09-07)

### Features

- vm-20 offers list ([ebafb36](https://github.com/VirtoCommerce/vc-shell/commit/ebafb36bb151f28f4415e5ebb4223d029514e90a))

## [0.0.36](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.35...v0.0.36) (2021-09-07)

### Features

- vm-97 extended products ([496db62](https://github.com/VirtoCommerce/vc-shell/commit/496db62414726df80561945f80d8957c543c00c3))

## [0.0.35](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.34...v0.0.35) (2021-09-07)

### Features

- vm-97 extended products ([cab5998](https://github.com/VirtoCommerce/vc-shell/commit/cab5998e2254a2c5d810e3e0e28dc3dc4b8ed8e0))

## [0.0.34](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.33...v0.0.34) (2021-09-07)

### Features

- vm-97 extended products ([b617328](https://github.com/VirtoCommerce/vc-shell/commit/b617328ccac90cf84b59d7f31f901b51ad2f41ff))
- vm-97 extended products ([1b6e54a](https://github.com/VirtoCommerce/vc-shell/commit/1b6e54a2ecddc95944b5885b1c4821a939b8c038))
- vm-33 loading indicator ([a8241c1](https://github.com/VirtoCommerce/vc-shell/commit/a8241c1577663961bed735779d4c5efddb92c3a3))
- vm-26 - app style improvements ([50becc0](https://github.com/VirtoCommerce/vc-shell/commit/50becc09fe4afe1e4e21e1f45c4727ba1b473e19))

## [0.0.33](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.32...v0.0.33) (2021-09-02)

### Features

- vm-14 - multiple components improved ([41cd1a3](https://github.com/VirtoCommerce/vc-shell/commit/41cd1a305740d9dafa5e621c607583e0f18c6e48))
- vm-14 - table improvements ([9184acf](https://github.com/VirtoCommerce/vc-shell/commit/9184acfc1e86b1f151d69d836466b6f0e07c2ce2))

## [0.0.32](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.31...v0.0.32) (2021-08-31)

### Features

- vm-35 table sorting ([e26abf5](https://github.com/VirtoCommerce/vc-shell/commit/e26abf5eb21fe928d379282c1df5269c82b9b877))
- vm-31 - table styling ([8cf26a1](https://github.com/VirtoCommerce/vc-shell/commit/8cf26a1cc76c881ffb9b9f1ee74be578d009ee26))
- vm-66 - product list search component ([8abc12d](https://github.com/VirtoCommerce/vc-shell/commit/8abc12d66ba3c56f9bc426af3efc1564218f51c0))
- vm-14 - product total count ([b51e2c0](https://github.com/VirtoCommerce/vc-shell/commit/b51e2c00ac1f3d6d2aa05f580378deff0fc2cd7a))
- vm-32 - pagination component ([91d2463](https://github.com/VirtoCommerce/vc-shell/commit/91d246385083597fbaaed9c1ce02ec287830309d))
- vm-32 - pagination component ([e6691cf](https://github.com/VirtoCommerce/vc-shell/commit/e6691cff79e9b93c9788eff78291e84c46711e90))

## [0.0.31](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.30...v0.0.31) (2021-08-30)

### Features

- vm-31 table display ([ebb2924](https://github.com/VirtoCommerce/vc-shell/commit/ebb292476ddf010d69fac361eef9ffb8045fdc0a))

## [0.0.30](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.29...v0.0.30) (2021-08-26)

### Features

- **ui:** component relocation ([54caaea](https://github.com/VirtoCommerce/vc-shell/commit/54caaeaf105a6582917db29fa5d8bb34a0f16f62))
- yarn migration and cleanup ([5c0fc1b](https://github.com/VirtoCommerce/vc-shell/commit/5c0fc1b02515fada99be5c2e5d4db8ce3c47a36e))
- typescript watching ([dc6a43a](https://github.com/VirtoCommerce/vc-shell/commit/dc6a43a4ce9c3cc5b0ab694ad8b637d86849b3c6))
- **core:** routing update (WIP) ([47a8ab2](https://github.com/VirtoCommerce/vc-shell/commit/47a8ab274f610820a1e91f63d99995601e898961))
- signIn/signOut ([3493066](https://github.com/VirtoCommerce/vc-shell/commit/3493066c28b34359c1c89c695c33c6a264d10398))
- **core:** webpack config for @vueuse submodules ([79aeef7](https://github.com/VirtoCommerce/vc-shell/commit/79aeef71c838bbe46eacdeaf37a079756a2e2c41))
- store access toke in cookies (does not compile) ([fd75285](https://github.com/VirtoCommerce/vc-shell/commit/fd75285c62f9b9136f77ac4f79d2ae388682ae54))

### Bug Fixes

- watching fix ([a7da180](https://github.com/VirtoCommerce/vc-shell/commit/a7da180682a15b9dedf206067df70000ff869c9d))
- watching fix ([f65ba67](https://github.com/VirtoCommerce/vc-shell/commit/f65ba67b68d6082d22bb00885ac4ef82baca6ce1))
- **ui:** storybook build issues ([484acc5](https://github.com/VirtoCommerce/vc-shell/commit/484acc52ab9623fa5db9c2650846fde268083d9f))

### Code Refactoring

- code polish ([5947283](https://github.com/VirtoCommerce/vc-shell/commit/5947283c8037c98c28f63bc4463c014fa0bcdf6b))

## [0.0.29](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.28...v0.0.29) (2021-08-20)

### Features

- **core:** additional dependencies for API connecton ([6d77562](https://github.com/VirtoCommerce/vc-shell/commit/6d77562d0509544248e2d9494f89ec4960b6d52a))
- **app-demo-manager:** connect to platform api ([9198c70](https://github.com/VirtoCommerce/vc-shell/commit/9198c700acafa4ad233c62f59539c476bb89a2ca))

### Bug Fixes

- **app-demo-manager:** add missed changes after merging ([2d6be5e](https://github.com/VirtoCommerce/vc-shell/commit/2d6be5e40526d3dccb1933384f5fb86cde4ce4b1))

## [0.0.28](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.27...v0.0.28) (2021-08-19)

### Features

- **app-demo-manager:** order blade ([72e2efe](https://github.com/VirtoCommerce/vc-shell/commit/72e2efe64aea0fdecf7ddfcd9cfc6766eafa89c0))

## [0.0.27](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.26...v0.0.27) (2021-08-19)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.26](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.25...v0.0.26) (2021-08-19)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.25](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.24...v0.0.25) (2021-08-12)

### Features

- sample workspace with blade ([1c772fc](https://github.com/VirtoCommerce/vc-shell/commit/1c772fcfa09311f38dfb68c4c16345caf2372d38))

## [0.0.24](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.23...v0.0.24) (2021-08-12)

### Features

- **ui:** some codestyle improvements ([443fcc4](https://github.com/VirtoCommerce/vc-shell/commit/443fcc4b4e0e9030365cf0eb5d0325358cd88f1d))

## [0.0.23](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.22...v0.0.23) (2021-08-12)

### Features

- **ui:** vc-icon component update ([1c7d84f](https://github.com/VirtoCommerce/vc-shell/commit/1c7d84f01dbe782d7709779becb9bd3ae646ef31))

## [0.0.22](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.21...v0.0.22) (2021-08-11)

### Features

- **ui:** vc-tooltip component ([82face9](https://github.com/VirtoCommerce/vc-shell/commit/82face9ce96889aad8dfc83cba4db059997c76c0))
- **ui:** vc-progressbar component ([5dbb3f0](https://github.com/VirtoCommerce/vc-shell/commit/5dbb3f0e3ae4fb36804bc68e89768b43a3d25bcf))
- **ui:** remove vc-spacer component ([3038110](https://github.com/VirtoCommerce/vc-shell/commit/30381106d9b570690a8d9a47377ff536c2c5eec5))
- **ui:** vc-image component ([1ee7cc3](https://github.com/VirtoCommerce/vc-shell/commit/1ee7cc3ac8293e7d4beba5cbfed715b95a21ce7a))
- **ui:** vc-container component ([ebdaa41](https://github.com/VirtoCommerce/vc-shell/commit/ebdaa4164b15bdb79a1acd0b3d119e54fcaabb6a))
- **ui:** vc-container component ([6bca4d6](https://github.com/VirtoCommerce/vc-shell/commit/6bca4d66a47b694ece70a0af9594c06c3dc3c3d3))

## [0.0.21](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.20...v0.0.21) (2021-08-11)

### Features

- **ui:** storybook static assets ([6794188](https://github.com/VirtoCommerce/vc-shell/commit/679418826ba785a817e0c5b33950564ed64cc73f))

## [0.0.20](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.19...v0.0.20) (2021-08-11)

### Features

- **ui:** vc-breadcrumbs-item component ([062d653](https://github.com/VirtoCommerce/vc-shell/commit/062d6532c8bfd07bf170d63e7224ea606b92e637))
- **ui:** vc-breadcrumbs component update ([dea9e89](https://github.com/VirtoCommerce/vc-shell/commit/dea9e8940c18daaefb743fc8df0e0dc50f25d28a))
- **ui:** vc-blade-toolbar-button component update ([5d3c586](https://github.com/VirtoCommerce/vc-shell/commit/5d3c586d4c7a310767cf16fe32620d86ec8a8151))
- **ui:** vc-blade component update ([615676e](https://github.com/VirtoCommerce/vc-shell/commit/615676e17cacf52c5cfa7f8f57efa0c0a4210465))
- **ui:** vc-blade-toolbar component update ([9a71287](https://github.com/VirtoCommerce/vc-shell/commit/9a712871cd60f8c11cec3bf612230e4e3d036082))
- **ui:** vc-blade-header component update ([48a18ce](https://github.com/VirtoCommerce/vc-shell/commit/48a18cea84ffd5fc2db3b62e06ccf2525907ac16))
- **ui:** vc-blade component update ([2c3fe2b](https://github.com/VirtoCommerce/vc-shell/commit/2c3fe2bf56a70dff938b496d6ec50353bda06ce4))
- **ui:** vc-blade-toolbar-button component ([83d2af7](https://github.com/VirtoCommerce/vc-shell/commit/83d2af760e13985c417e4c92ac6927afd51737fe))
- **ui:** vc-blade-toolbar component ([dd61fea](https://github.com/VirtoCommerce/vc-shell/commit/dd61fea8499d0d226d007a154d6476036ba21297))

## [0.0.19](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.18...v0.0.19) (2021-08-11)

### Features

- **ui:** vc-blade-header component ([80207b2](https://github.com/VirtoCommerce/vc-shell/commit/80207b2a2f7c417cbf572230f4eaf36513ec7f40))

## [0.0.18](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.17...v0.0.18) (2021-08-11)

### Features

- **ui:** vc-thumbnail component ([fa00029](https://github.com/VirtoCommerce/vc-shell/commit/fa00029729c20ec4c5e73862f13df6200e7cfb02))
- **ui:** vc-thumbnail component ([f83e401](https://github.com/VirtoCommerce/vc-shell/commit/f83e40195ec401a0eaf31ae527f9cd0b8dd9b3a6))
- **ui:** vc-icon component ([ae06601](https://github.com/VirtoCommerce/vc-shell/commit/ae06601c1798601a73cafaf7d4355e5542df7ad5))

## [0.0.17](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.16...v0.0.17) (2021-08-10)

### Features

- login component style minor update ([244e147](https://github.com/VirtoCommerce/vc-shell/commit/244e1476f610dc28ceb5d7582573a33491fbb2c5))

## [0.0.16](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.15...v0.0.16) (2021-08-10)

### Features

- **ui:** vc-button component ([98fa9c3](https://github.com/VirtoCommerce/vc-shell/commit/98fa9c35309ff80a8c8f190bba1e73b7edd22e85))
- **ui:** storybook icons and fonts ([7685968](https://github.com/VirtoCommerce/vc-shell/commit/76859687c28053a77129872d009b5d7a59f5a773))
- **ui:** vc-link component ([83e62c5](https://github.com/VirtoCommerce/vc-shell/commit/83e62c578d6b36ba1b4b649998e2f750e0c1f7d6))
- **ui:** vc-bubble component ([1f242ba](https://github.com/VirtoCommerce/vc-shell/commit/1f242ba76511c7e7678a3712d07a1a5cdd5c29ac))
- **ui:** vc-badge component ([7d02109](https://github.com/VirtoCommerce/vc-shell/commit/7d021095f32ecf3be49fdaf5e08bf7d2f85f41f7))
- profile menu item clickable ([bcfbd15](https://github.com/VirtoCommerce/vc-shell/commit/bcfbd15aa410a2e5c739ec5a7da3ea7b0a5aba96))
- minor style improvements ([b588956](https://github.com/VirtoCommerce/vc-shell/commit/b58895667a89085647d728d77f835bc62d866273))

## [0.0.15](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.14...v0.0.15) (2021-08-09)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.14](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.13...v0.0.14) (2021-08-05)

### Features

- workspace layout WIP ([1edc014](https://github.com/VirtoCommerce/vc-shell/commit/1edc014b320c1f57b7a83d2bc7150f3a834d7724))

## [0.0.13](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.12...v0.0.13) (2021-08-05)

### Features

- login form ([8acb2c6](https://github.com/VirtoCommerce/vc-shell/commit/8acb2c6bc58c1c9355293a1c514a0a777e7fc65c))

## [0.0.12](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.11...v0.0.12) (2021-08-05)

### Bug Fixes

- storybook build pipeline ([c27dba0](https://github.com/VirtoCommerce/vc-shell/commit/c27dba0e054e85a8a7f5539d2e09f864cd3dfd50))

## [0.0.11](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.10...v0.0.11) (2021-08-05)

### Features

- login form and route guarding ([78813af](https://github.com/VirtoCommerce/vc-shell/commit/78813afc10753f4972d2e120c3ea48295131b2ed))
- ui component structure aligned with docs ([2001f40](https://github.com/VirtoCommerce/vc-shell/commit/2001f404583a385531d1395591f16a251ee41f95))

## [0.0.10](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.9...v0.0.10) (2021-08-04)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.9](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.8...v0.0.9) (2021-08-04)

### Features

- demo manager version display and locale ([674dc7e](https://github.com/VirtoCommerce/vc-shell/commit/674dc7e4a993f12477764ef3e1ad1c4b5f2f7a3b))
- core composables ([57d84af](https://github.com/VirtoCommerce/vc-shell/commit/57d84afae7eeaab6c501346150f18ce49f7c27b7))
- core composables ([7713230](https://github.com/VirtoCommerce/vc-shell/commit/771323097efd7aef41fc77d320e153e589c2f0e0))

## [0.0.8](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.7...v0.0.8) (2021-08-02)

### Features

- new folder structure ([caa6712](https://github.com/VirtoCommerce/vc-shell/commit/caa67129423a8cde15212961ee0cbfed9ac08b53))

## [0.0.7](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.6...v0.0.7) (2021-07-29)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.6](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.5...v0.0.6) (2021-07-28)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.5](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.4...v0.0.5) (2021-07-22)

**Note:** Version bump only for package @vc-shell/framework

## [0.0.4](https://github.com/VirtoCommerce/vc-shell/compare/v0.0.3...v0.0.4) (2021-07-21)

**Note:** Version bump only for package @vc-shell/framework

## 0.0.3 (2021-07-20)

**Note:** Version bump only for package @vc-shell/framework

# Migration Guide: @vc-shell/framework v1.x → v2.0.0

This document indexes all the migration work needed to upgrade an application from `@vc-shell/framework` v1.2.3 (or any v1.x) to v2.0.0. Each guide is self-contained — work through them in phase order.

## Before You Start

- **Backward compatibility**: Many deprecated APIs still work via adapter layers. You can migrate incrementally — one module at a time.
- **Runtime warnings**: In development mode, deprecated APIs log console warnings with links to migration docs.
- **Automated migration**: Where available, codemods are provided via `npx @vc-shell/migrate`. Run `npx @vc-shell/migrate --list` to see all available transforms.
- **Comprehensive audit**: See [docs/migration-2.0.0/audit-report.md](./docs/migration-2.0.0/audit-report.md) for a full change catalog.

## Migration Strategy

1. **Phase 1 — Project setup** (blocks build): dependencies, icons, styles, type shims
2. **Phase 2 — Architecture** (if used): modules, blades, widgets, notifications, extensions
3. **Phase 3 — UI components** (if used): login, app bar, dashboard, generic table
4. **Phase 4 — Tooling**: Vue 3.5, Router 5, vue-tsc 3, injection keys, platform URL
5. **Phase 5 — API cleanup & new patterns**: deprecated APIs, optional new composables

## Phase 1 — Project Setup (do first)

| #   | Guide                                              | Severity     | Description                                                                                   |
| --- | -------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| 01  | [package.json](./migration/01-package-json.md)     | **Required** | Update deps, peerDeps, remove obsolete packages, wildcard exports removed                     |
| 03  | [moment.js → date-fns](./migration/03-moment-to-datefns.md) | **Required** | Replace moment.js with date-fns utilities                                                     |
| 04  | [Window Globals Removed](./migration/04-window-globals.md) | **Required** | `window.Vue`, `window.moment`, etc. no longer set                                             |
| 05  | [Icon Migration](./migration/05-icons.md)          | **Required** | Font Awesome → Lucide / Material Symbols / Bootstrap Icons                                    |
| 06  | [Styles & SCSS](./migration/06-styles-scss.md)     | **Required** | `@import` → `@use`, dark theme, scrollbar tokens, Tailwind color mapping, z-index scale       |
| 07  | [shims-vue.d.ts](./migration/07-shims-vue-dts.md)  | **Required** | Update TypeScript declarations for Vue 3.5 + vue-i18n                                         |

## Phase 2 — Architecture (if you use these features)

| #   | Guide                                                                           | Severity     | Description                                                                     |
| --- | ------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| 08  | [Dynamic Views Removal](./migration/08-dynamic-views-removal.md)                | **Breaking** | `createDynamicAppModule` and JSON schemas removed                               |
| 09  | [defineAppModule](./migration/09-define-app-module.md)                          | Deprecated   | `createAppModule()` → `defineAppModule()`                                       |
| 10  | [useBlade](./migration/10-use-blade.md)                                         | Deprecated   | `useBladeNavigation()` → `useBlade()`                                           |
| 11  | [Blade Props Simplification](./migration/11-blade-props.md)                     | Deprecated   | Remove boilerplate props/emits from blade pages                                 |
| 12  | [replaceWith / coverWith](./migration/12-replace-cover.md)                      | **Changed**  | `replaceWith` behavior changed; new `coverWith` method                          |
| 13  | [Widgets](./migration/13-widgets.md)                                            | Deprecated   | `registerWidget()` → `useBladeWidgets()`                                        |
| 14  | [Notifications](./migration/14-notifications.md)                                | Deprecated   | `useNotifications()` → `useBladeNotifications()`                                |
| 15  | [Extension Points](./migration/15-extension-points.md)                          | **Breaking** | `useExtensionSlot` → `defineExtensionPoint`                                     |
| 43  | [getModulesLibraryConfiguration](./migration/43-modules-library-config.md)      | **Breaking** | `getDynamicModuleConfiguration` → `getModulesLibraryConfiguration` (ES library) |
| 44  | [createModule() Removal](./migration/44-create-module-removal.md)               | **Breaking** | Lightweight `createModule()` helper removed — use `defineAppModule()`           |
| 45  | [useDynamicModules() Removal](./migration/45-dynamic-module-loader-removal.md)  | **Breaking** | Custom CDN-based runtime module loader removed — use `@vc-shell/mf-host`/`mf-module` for runtime federation, or static imports |

## Phase 3 — UI Components (if you use these features)

| #   | Guide                                                          | Severity     | Description                                                          |
| --- | -------------------------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| 16  | [VcLoginForm → VcAuthLayout](./migration/16-login-form.md)     | **Breaking** | `VcLoginForm` removed, replaced by `VcAuthLayout`                    |
| 17  | [App Bar & Settings Menu](./migration/17-app-bar-settings.md)  | Deprecated   | Slots → `useAppBarWidget()` / `useSettingsMenu()`                    |
| 18  | [Dashboard](./migration/18-dashboard.md)                       | **Breaking** | Static grid → `DraggableDashboard` with widget registration          |
| 19  | [Generic Components](./migration/19-generic-components.md)     | Optional     | `@vue-generic` directive for type-safe VcTable                       |

## Phase 4 — Tooling

| #   | Guide                                                             | Severity     | Description                                                          |
| --- | ----------------------------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| 20  | [Vue 3.5, Router 5, vue-tsc 3](./migration/20-vue-router-vuetsc.md) | **Required** | Dependency upgrades and breaking changes                             |
| 21  | [Injection Keys](./migration/21-injection-keys.md)                | Deprecated   | Renamed Symbol keys with backward-compat string shims                |
| 22  | [platformUrl Removal](./migration/22-platform-url.md)             | **Breaking** | Use `APP_PLATFORM_URL` env variable instead                          |

## Phase 5 — Deprecated API Cleanup & New Patterns

| #   | Guide                                                                        | Severity        | Description                                                                                             |
| --- | ---------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| 23  | [Composable Return Types](./migration/23-composable-return-types.md)         | Deprecated      | `IUsePermissions` → `UsePermissionsReturn` and 19 other type aliases                                    |
| 24  | [VcBanner Variants](./migration/24-vc-banner-variants.md)                    | Deprecated      | `"light-danger"` → `"danger"`, `"info-dark"`/`"primary"` → `"info"`                                     |
| 25  | [VcSwitch Tooltip](./migration/25-vc-switch-tooltip.md)                      | Deprecated      | `tooltip` prop → `hint` / `labelTooltip`                                                                |
| 26  | [VcIcon Container](./migration/26-vc-icon-container.md)                      | Deprecated      | `useContainer` prop deprecated (no-op)                                                                  |
| 27  | [Menu Group Config](./migration/27-menu-group-config.md)                     | Deprecated      | `group`/`groupIcon`/`inGroupPriority` → `groupConfig` object                                            |
| 28  | [Shared Components](./migration/28-shared-components.md)                     | Deprecated      | Shared `VcSidebar`/`VcDropdown` → UI component versions                                                 |
| 29  | [VcTable → VcDataTable](./migration/29-vc-table-to-data-table.md)            | **Breaking**    | Old VcTable removed; `VcTableAdapter` provides backward compat                                          |
| 30  | [Type Shims → Globals](./migration/30-shims-to-globals.md)                   | Deprecated      | Manual `shims-vue.d.ts` / `vue-i18n.d.ts` → `@vc-shell/framework/globals`                               |
| 31  | [useDataTableSort](./migration/31-use-data-table-sort.md)                    | Optional        | Replace manual sort boilerplate with `useDataTableSort` composable                                      |
| 32  | [useAssets → useAssetsManager](./migration/32-use-assets-manager.md)         | Deprecated      | `useAssets()` handler bundle → `useAssetsManager()` ref-mutating composable                             |
| 33  | [Locale Exports](./migration/33-locale-exports.md)                           | **Breaking**    | `dist/locales/*.json` wildcard → named `@vc-shell/framework/locales/<lang>` exports                     |
| 34  | [App Hub Rename](./migration/34-app-hub-rename.md)                           | **Breaking**    | `disableAppSwitcher` → `disableAppHub`, `#app-switcher` → `#app-hub`, `useAppSwitcher` → `useAppHub`    |
| 35  | [defineBlade](./migration/35-define-blade.md)                                | Deprecated      | `defineOptions()` with blade fields → `defineBlade()` macro                                             |
| 36  | [useResponsive](./migration/36-use-responsive.md)                            | Deprecated      | `$isMobile.value` / `inject(IsMobileKey)` → `useResponsive()` composable                                |
| 37  | [useBladeForm](./migration/37-use-blade-form.md)                             | Optional        | Replace manual `useForm` + `useModificationTracker` + `useBeforeUnload` with `useBladeForm`             |
| 38  | [Dynamic Properties Refactor](./migration/38-dynamic-properties-refactor.md) | **Breaking**    | `useDynamicProperties`: remove generics/constructors, options-based API                                 |
| 39  | [Transparent Blade Skeletons](./migration/39-blade-skeleton.md)              | Informational   | Layout-aware skeleton loading via `useBladeLoading()` composable                                        |
| 40  | [Remove Global Component Registration](./migration/40-remove-global-components.md) | **Breaking** | Explicit imports required for all `Vc*` components and directives (no more `app.component()` auto-registration) |
| 41  | [useDataTablePagination](./migration/41-use-data-table-pagination.md)        | Optional        | Replace manual `totalCount`/`pages`/`currentPage` + `onPaginationClick` with `useDataTablePagination`   |
| 42  | [Broadcast Filter](./migration/42-broadcast-filter.md)                       | **Breaking**    | `updateSignalRCreator` → `useBroadcastFilter()` composable                                              |
| 46  | [CSS BEM Class Migration](./migration/46-css-bem-class-migration.md)         | **Breaking**    | Component modifier classes renamed from `_modifier` → `--modifier` (strict BEM)                         |
| 47  | [VcButton Props](./migration/47-vc-button-props.md)                          | **Breaking**    | `small`/`outline`/`raised` props removed; `size="base"/"xs"` aliases replaced by `"default"`/`"sm"`     |
| 48  | [Menu Icon Type Change](./migration/48-menu-icon-type-change.md)             | **Breaking**    | `MenuItemConfig.icon` narrowed from `string \| Component` to `string` only; `ToolbarMenu<T>` removed    |
| 49  | [Component Prop Removals](./migration/49-component-props-removals.md)        | **Breaking**    | VcContainer `usePtr`, VcStatus `outline`, VcEditor `extensions`, VcField `modelValue` removed/changed   |

## Miscellaneous One-Liners

These minor changes are noted inline in the referenced guides but are listed here for quick scanning:

- `files` field in `package.json` shrunk — source-directory deep imports via npm no longer work (see [#01](./migration/01-package-json.md)).
- Script names changed: `type-check` → `check:types`, `check-locales` → `check:locales`.
- Loading animation keyframes (`tw-animate-loadingMarker`) removed from Tailwind config.
- Form molecules now share `IFormFieldProps` interface — adopt for consistency.
- `useWidgets()` no longer re-exported from the main barrel — use per-module imports.
- `useUser()` gains `getAccessToken()` method (additive, no action required).
- `addAppBarWidget` / `addSettingsMenuItem` standalone exports moved — use the composable-based API (see [#17](./migration/17-app-bar-settings.md)).

## Severity Legend

| Label            | Meaning                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------- |
| **Required**     | Must do before the app will build/run                                                   |
| **Breaking**     | Feature removed — code using it will fail at runtime                                    |
| **Changed**      | Same API name but different behavior                                                    |
| **Deprecated**   | Old API works via adapter with console warnings; migrate at your pace                   |
| **Optional**     | New capability, no action needed unless you want the improvement                        |
| **Informational** | Background context only — no action required                                           |

## See Also

- [WHATS_NEW.md](./WHATS_NEW.md) — full feature overview for v2.0
- [migration/README.md](./migration/README.md) — detailed migration index (mirror of this document)
- [docs/migration-2.0.0/audit-report.md](./docs/migration-2.0.0/audit-report.md) — audit report with coverage analysis

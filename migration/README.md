# Migration Guide: @vc-shell/framework v1.x → v2.0.0

This guide covers all changes required when upgrading from `@vc-shell/framework` v1.2.3 (or any v1.x) to v2.0.0.

## Before You Start

- **Backward compatibility**: Many deprecated APIs still work via adapter layers. You can migrate incrementally — one module at a time.
- **Runtime warnings**: In development mode, deprecated APIs log console warnings with links to migration docs.
- **Automated migration**: Where available, codemods are provided: `npx @vc-shell/codemod`

## Migration Steps

Work through these guides in order. Each is self-contained with before/after examples.

### Phase 1 — Project Setup (do first)

| # | Guide | Severity | Description |
|---|-------|----------|-------------|
| 01 | [package.json](./01-package-json.md) | **Required** | Update dependencies, add peer deps, remove obsolete packages |
| 03 | [moment.js → date-fns](./03-moment-to-datefns.md) | **Required** | Replace moment.js usage with date-fns utilities |
| 04 | [Window Globals Removed](./04-window-globals.md) | **Required** | `window.Vue`, `window.moment`, etc. no longer set |
| 05 | [Icon Migration](./05-icons.md) | **Required** | Font Awesome → Lucide / Material Symbols / Bootstrap Icons |
| 06 | [Styles & SCSS](./06-styles-scss.md) | **Required** | `@import` → `@use`, remove base.scss/colors.scss |
| 07 | [shims-vue.d.ts](./07-shims-vue-dts.md) | **Required** | Update TypeScript declarations for Vue 3.5 + vue-i18n |

### Phase 2 — Architecture (if you use these features)

| # | Guide | Severity | Description |
|---|-------|----------|-------------|
| 08 | [Dynamic Views Removal](./08-dynamic-views-removal.md) | **Breaking** | `createDynamicAppModule` and JSON schemas removed |
| 09 | [defineAppModule](./09-define-app-module.md) | Deprecated | `createAppModule()` → `defineAppModule()` |
| 10 | [useBlade](./10-use-blade.md) | Deprecated | `useBladeNavigation()` → `useBlade()` |
| 11 | [Blade Props Simplification](./11-blade-props.md) | Deprecated | Remove boilerplate props/emits from blade pages |
| 12 | [replaceWith / coverWith](./12-replace-cover.md) | **Changed** | `replaceWith` behavior changed; new `coverWith` method |
| 13 | [Widgets](./13-widgets.md) | Deprecated | `registerWidget()` → `useBladeWidgets()` |
| 14 | [Notifications](./14-notifications.md) | Deprecated | `useNotifications()` → `useBladeNotifications()` |
| 15 | [Extension Points](./15-extension-points.md) | **Breaking** | `useExtensionSlot` → `defineExtensionPoint` |

### Phase 3 — UI Components (if you use these features)

| # | Guide | Severity | Description |
|---|-------|----------|-------------|
| 16 | [VcLoginForm → VcAuthLayout](./16-login-form.md) | **Breaking** | `VcLoginForm` removed, replaced by `VcAuthLayout` |
| 17 | [App Bar & Settings Menu](./17-app-bar-settings.md) | Deprecated | Slots → `useAppBarWidget()` / `useSettingsMenu()` |
| 18 | [Dashboard](./18-dashboard.md) | **Breaking** | Static grid → `DraggableDashboard` with widget registration |
| 19 | [Generic Components](./19-generic-components.md) | Optional | `@vue-generic` directive for type-safe VcTable |

### Phase 4 — Tooling

| # | Guide | Severity | Description |
|---|-------|----------|-------------|
| 20 | [Vue 3.5, Router 5, vue-tsc 3](./20-vue-router-vuetsc.md) | **Required** | Dependency upgrades and breaking changes |
| 21 | [Injection Keys](./21-injection-keys.md) | Deprecated | Renamed Symbol keys with backward-compat string shims |
| 22 | [platformUrl Removal](./22-platform-url.md) | **Breaking** | Use `APP_PLATFORM_URL` env variable instead |

### Phase 5 — Deprecated API Cleanup

| # | Guide | Severity | Description |
|---|-------|----------|-------------|
| 23 | [Composable Return Types](./23-composable-return-types.md) | Deprecated | `IUsePermissions` → `UsePermissionsReturn` and 19 other type aliases |
| 24 | [VcBanner Variants](./24-vc-banner-variants.md) | Deprecated | `"light-danger"` → `"danger"`, `"info-dark"`/`"primary"` → `"info"` |
| 25 | [VcSwitch Tooltip](./25-vc-switch-tooltip.md) | Deprecated | `tooltip` prop → `hint` / `labelTooltip` |
| 26 | [VcIcon Container](./26-vc-icon-container.md) | Deprecated | `useContainer` prop deprecated (no-op) |
| 27 | [Menu Group Config](./27-menu-group-config.md) | Deprecated | `group`/`groupIcon`/`inGroupPriority` → `groupConfig` object |
| 28 | [Shared Components](./28-shared-components.md) | Deprecated | Shared `VcSidebar`/`VcDropdown` → UI component versions |
| 29 | [VcTable → VcDataTable](./29-vc-table-to-data-table.md) | **Breaking** | Old VcTable removed; `VcTableAdapter` provides backward compat |
| 30 | [Type Shims → Globals](./30-shims-to-globals.md) | Deprecated | Manual `shims-vue.d.ts` / `vue-i18n.d.ts` → `@vc-shell/framework/globals` |
| 31 | [useDataTableSort](./31-use-data-table-sort.md) | Optional | Replace manual sort boilerplate with `useDataTableSort` composable |
| 33 | [Locale Exports](./33-locale-exports.md) | **Breaking** | `dist/locales/*.json` wildcard → named `@vc-shell/framework/locales/<lang>` exports |
| 34 | [App Hub Rename](./34-app-hub-rename.md) | **Breaking** | `disableAppSwitcher` → `disableAppHub`, `#app-switcher` → `#app-hub`, `useAppSwitcher` → `useAppHub` |

## Severity Legend

| Label | Meaning |
|-------|---------|
| **Required** | Must do before the app will build/run |
| **Breaking** | Feature removed — code using it will fail at runtime |
| **Changed** | Same API name but different behavior |
| **Deprecated** | Old API works via adapter with console warnings; migrate at your pace |
| **Optional** | New capability, no action needed unless you want the improvement |

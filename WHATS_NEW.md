# What's New in @vc-shell/framework v2.0.0

This document summarizes the major features and improvements introduced in v2.0.0 of `@vc-shell/framework`. For migration instructions from previous versions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

---

## Blade System

- **`useBlade()` unified composable** — Replaces the separate `useBladeNavigation()`, `useBladeContext()`, and legacy `useBlade()` APIs with a single composable covering all blade operations: `openBlade`, `closeSelf`, `closeChildren`, `callParent`, `replaceWith`, and `coverWith`.

- **Auto-injection of blade props** — VcBlade now reads `expanded` and `closable` directly from the BladeDescriptor; blade pages no longer need to declare these as props or wire up the corresponding emits as boilerplate.

- **`defineBlade()` macro** — New compile-time macro replacing `defineOptions()` for blade pages. Separates blade metadata (url, permissions, menuItem) from Vue component options. The Vite plugin splits it at build time: `name` goes to `defineOptions`, everything else registers in a global blade config registry available before component mount. Automated codemod: `npx @vc-shell/migrate --transform define-options-to-blade`. See [migration guide #35](./migration/35-define-blade.md).

- **Typed options** — `useBlade<MyOptions>()` accepts a generic type parameter so that `options.value` is fully typed, eliminating the need for manual type assertions on blade option objects.

- **`onActivated` / `onDeactivated` lifecycle hooks** — New hooks that fire when a blade gains or loses "active" (rightmost visible) status, enabling blade-level focus management and lazy data loading.

- **`replaceWith` / `coverWith`** — Two distinct navigation methods with different semantics: `replaceWith` destroys the old blade immediately, while `coverWith` hides it so that closing the new blade restores the original.

- **VcBlade loading skeleton** — VcBlade now renders a built-in skeleton placeholder while blade content is loading, replacing ad-hoc spinner implementations in blade pages.

### Transparent Blade Skeletons

VcBlade now provides layout-aware skeleton loading. When `loading=true`, every child UI component (VcInput, VcSelect, VcCard, etc.) automatically renders a skeleton placeholder matching its exact shape — no generic skeleton, no layout jumps. Zero changes to existing blade pages.

Custom components can opt in via `useBladeLoading()` composable.

See [migration/39-blade-skeleton.md](./migration/39-blade-skeleton.md) for details.

---

## Table System

- **`VcDataTable`** — New compositional table component with a declarative `<VcColumn>` slot-based API, replacing the prop-array approach of the legacy `VcTable`. See [`VcDataTable` docs](./framework/ui/components/organisms/vc-table/vc-table.docs.md).

- **`VcTableAdapter`** — Backward-compatible wrapper exported under the familiar `VcTable` name, mapping the old prop-based API to the new `VcDataTable` internals with no breaking changes for existing consumers.

- **Column switcher** — Enable the `column-switcher` prop to give users a UI control for toggling individual column visibility at runtime.

- **Global filters** — A configurable filter bar is available via the `global-filters` prop, providing a consistent filtering UI above the table without custom toolbar wiring.

- **Pull-to-refresh** — On mobile, users can swipe down on the table to trigger a data reload, matching native mobile list conventions.

- **`activeItemId`** — Highlight a specific row as "active" (e.g., the currently open detail blade) without enabling full selection mode.

- **Empty / not-found states** — Built-in configurable states via `emptyText` and `notFoundText` props, with dedicated empty-state illustrations for zero-data and zero-search-results scenarios.

- **Virtual scroll** — Efficient DOM rendering for large datasets; only visible rows are rendered, keeping the table performant at thousands of rows.

- **Inline cell editing** — Cells can be made editable directly within the table row without opening a separate blade or modal.

- **Column resize and reorder with state persistence** — Users can resize and reorder columns; layout is automatically persisted to localStorage or sessionStorage using the `stateKey` prop.

- **Row drag-and-drop reorder** — Rows can be reordered via drag-and-drop when the `reorderable-rows` prop is enabled, emitting the new order for the parent to persist.

- **`useDataTableSort()` composable** — Page-level composable for VcDataTable sort state. Provides `sortField` and `sortOrder` refs for `v-model` binding, plus a `sortExpression` string for API calls, eliminating manual sort boilerplate in list pages.

- **`useDataTablePagination()` composable** — Page-level composable for VcDataTable pagination state. Derives `pages`, `skip`, and a ready-made `paginationProps` object from a reactive `totalCount`, and fires an optional `onPageChange` event callback for data fetching. Eliminates `Math.ceil`/`Math.floor` boilerplate from data composables and `onPaginationClick` handlers from list blades. Follows the VueUse `useOffsetPagination` event-callback pattern.

---

## Notifications

- **`NotificationStore`** — Centralized Pinia-based store for notification state, replacing scattered reactive refs and providing a single source of truth for all notification data.

- **`useBladeNotifications()`** — Subscribe to specific notification types within a blade's lifecycle context; subscriptions are automatically cleaned up when the blade is closed.

- **Toast modes** — Three toast display modes: `auto` (show then auto-dismiss), `progress` (track long-running operations with a progress indicator), and `silent` (store-only, no toast displayed).

- **Severity-based timeouts** — Standardized auto-dismiss durations by severity: `info` dismisses after 5 s, `warning` after 8 s, while `error` and `critical` notifications remain persistent until manually dismissed.

- **`useNotificationContext()`** — New composable for accessing notification data inside custom templates. Replaces implicit props with an explicit pull-based API. Custom templates no longer need `defineProps` or `inheritAttrs: false`.

---

## Widgets

- **`useBladeWidgets()`** — Declare widgets in a headless composable style with automatic registration on blade mount and unregistration on blade unmount, eliminating manual lifecycle management.

- **`defineBladeContext()` / `injectBladeContext()`** — Typed helpers for sharing a blade's internal context (data, actions) with external widgets and child components, replacing untyped `provide`/`inject` calls.

---

## Modules

- **`defineAppModule()`** — New named-options API for defining application modules, replacing the positional-argument `createAppModule()` call with a more readable and extensible object format.

- **Module Federation support** — Two new packages, `@vc-shell/mf-config` and `@vc-shell/mf-host`, provide first-class Vite Module Federation configuration for micro-frontend architectures.

---

## App Hub

- **App Switcher → App Hub** — The "App Switcher" has been renamed to "App Hub" across the framework, reflecting its expanded role as a unified panel combining application switching and app bar widgets (notifications, background tasks, etc.). The `disableAppSwitcher` prop is now `disableAppHub`, the `#app-switcher` slot is now `#app-hub`, and `useAppSwitcher()` is now `useAppHub()`. See [migration guide #34](./migration/34-app-hub-rename.md).

- **Sidebar Search** — New `showSearch` and `searchPlaceholder` props on `VcApp` add a real-time search input to the sidebar that filters menu items by translated title. Works on both desktop (expanded sidebar) and mobile (slide-out navigation panel).

---

## UI Components

- **`VcEditor`** — Rich-text editor with preview, source, and split-pane modes; supports `maxlength`, a customizable toolbar, and fullscreen editing. See [`VcEditor` docs](./framework/ui/components/molecules/vc-editor/vc-editor.docs.md).

- **`VcAuthLayout`** — Replaces the narrower `VcLoginForm` with a flexible authentication layout component that supports custom branding, logos, and supplementary content slots.

- **`DraggableDashboard`** — A drag-and-drop dashboard container with programmatic widget registration via `registerDashboardWidget()`, enabling modules to contribute dashboard tiles without modifying the host app.

- **New design tokens** — Four new CSS custom property groups added to the theme: `overlay` (backdrop colors), `shadow` (elevation shadows), `surface` (card/panel backgrounds), and `glass` (frosted-glass effect values).

---

## New Composables

- **`useConnectionStatus`** — Tracks SignalR hub connection state, exposing reactive status for UI indicators and automatic reconnection logic.

- **`useKeyboardNavigation`** — Provides keyboard navigation (arrow keys, Home/End, Enter) for list and table components, improving accessibility without custom event handling.

- **`useWebVitals`** — Collects Core Web Vitals metrics (LCP, FID, CLS, etc.) and exposes them for reporting to analytics or monitoring services.

- **`useBeforeUnload`** — Registers a browser unload guard that prompts the user when there are unsaved changes, preventing accidental data loss on page navigation or close.

- **`useLoading`** — Centralized loading state manager for coordinating multiple async operations, replacing ad-hoc `ref(false)` loading flags scattered across composables.

- **`useErrorHandler`** — Composable interface to the global error handler, allowing components and composables to report errors consistently without direct coupling to the error service.

- **`useResponsive()`** — Unified composable for reactive breakpoint state (`isMobile`, `isDesktop`, `isPhone`, `isTablet`, `isTouch`). Replaces the awkward `$isMobile.value` global properties in templates and `inject(IsMobileKey)` in script setup. Vue auto-unwraps the refs in templates, so no `.value` is needed. See [migration guide #36](./migration/36-use-responsive.md).

- **`useAppBarWidget`** — Programmatic App Bar widget registration, replacing reliance on named toolbar slots and enabling modules to contribute App Bar items at runtime.

- **`useAppBarMobileButtons`** — Register mobile-specific action buttons in the App Bar, providing a dedicated API for the mobile App Bar button area separate from desktop toolbar items.

- **`useSettingsMenu`** — Programmatic registration of settings menu items, replacing the user-dropdown slot approach and allowing modules to contribute settings entries without modifying the host template.

### Asset Management — `useAssetsManager()`

New high-level composable that eliminates boilerplate when working with assets (images, files). Pass a reactive ref and options — the composable handles upload, remove, reorder, and metadata updates by mutating the ref directly.

- **Zero wiring** — no more manual `assetsHandler` objects
- **Built-in confirmation** — optional `confirmRemove` callback
- **No type casting** — works with any `AssetLike` compatible type (Image, ProductImage, etc.)
- **Nullable source** — accepts `Ref<AssetLike[] | undefined | null>`, so `toRef(entity.value, 'images')` works even when the property is initially `undefined`. No need for `computed({ get, set })` in simple cases.
- **Internal ref with two-way sync** — the composable owns an internal `Ref<AssetLike[]>` and syncs both ways: source → internal on data reload, mutations → source after every operation. This avoids reactivity issues with `WritableComputed` wrapping deeply nested properties.
- **AssetsManager blade** — now accepts `manager: UseAssetsManagerReturn` in options instead of 3 separate handler functions. **Breaking:** old `assets`/`assetsUploadHandler`/`assetsEditHandler`/`assetsRemoveHandler` options are removed. Pass `markRaw(manager)` to prevent Vue reactive proxy unwrap.
- **AssetsManager internals** — the blade now uses `VcDataTable` with declarative `<VcColumn>` API internally, replacing the legacy `VcTable` with `:columns` prop array.
- `useAssets()` and `ICommonAsset` are deprecated but continue to work. See [migration guide #32](./migration/32-use-assets-manager.md)

---

## Form & Validation

- **`useBladeForm()` composable** — Unified form state management for detail blades. Replaces the manual combination of `useForm` (vee-validate), `useModificationTracker`, `useBeforeUnload`, and `onBeforeClose` with a single composable call. Returns `canSave`, `isModified`, `setBaseline()`, `revert()`, `setFieldError`, and `errorBag`. VcBlade auto-detects modification state via provide/inject, eliminating the `:modified` prop. Supports `canSaveOverride` for custom disabled logic and `closeConfirmMessage` for custom unsaved-changes dialogs. Automated codemod: `npx @vc-shell/migrate --transform use-blade-form`. See [migration guide #37](./migration/37-use-blade-form.md).

- **`useDynamicProperties()` refactor** — Rewritten from a monolithic function with five generic type parameters and class constructors to a clean options-based API using the strategy pattern internally. Factory classes (`PropertyValueFactory`, `PropertyDictionaryItemFactory`) are no longer needed. New `cleanEmptyValues()` helper strips empty property values before save. No getter side-effects — dictionary loading is explicit. Automated codemod: `npx @vc-shell/migrate --transform dynamic-properties-refactor`. See [migration guide #38](./migration/38-dynamic-properties-refactor.md).

---

## Localization

- **Typed locale exports** — Framework locales are now available as typed ES module exports: `import en from '@vc-shell/framework/locales/en'`. Each export is fully typed with the `VcShellLocale` interface, providing IDE autocomplete for all ~430 translation keys. Use `VcShellLocalePartial` for partial overrides.

- **Dev-mode missing key warnings** — In development mode, accessing a translation key that has no value for the current locale logs a console warning with the exact key path, helping catch untranslated strings early.

- **`vc-check-locales` CLI** — New bin command to validate custom locale files against the framework's English baseline. Run `npx vc-check-locales ./locales/fr.json` to see missing and extra keys. Integrates into CI pipelines via non-zero exit code on failure.

---

## Infrastructure

- **Global Error Handler** — Three-layer error capture (Vue component errors, async promise rejections, unhandled window errors) with a deduplication window and automatic toast notification on unhandled errors.

- **ARIA / Accessibility** — Comprehensive `role` and `aria-*` attributes added across blades, popups, tables, and menu items, bringing the framework closer to WCAG 2.1 AA compliance.

- **Typed Symbol injection keys** — All framework injection keys (`BladeInstanceKey`, `ToolbarKey`, etc.) are now typed Symbols defined in `framework/injection-keys.ts`. Legacy string keys remain as `@deprecated` shims to ease migration.

## Package Structure

- **Multi-entry build** — The framework package now exposes sub-entry points: `@vc-shell/framework/ui` (standalone UI kit), `@vc-shell/framework/ai-agent`, and `@vc-shell/framework/extensions`. The main entry still re-exports everything.

- **Framework globals** — `@vc-shell/framework/globals` provides all type augmentations (`*.vue` module, `$t`, `$hasAccess`, `$isMobile`, etc.) via a single tsconfig `types` entry, replacing manual `shims-vue.d.ts` and `vue-i18n.d.ts` files.

- **`shared/` dissolved** — The `shared/` directory has been removed. Its contents moved to domain-appropriate locations: `core/` (logic), `ui/` (components), `shell/` (app chrome: auth, sidebar, dashboard, settings), and `modules/` (built-in modules). Public API imports from `@vc-shell/framework` are unchanged.

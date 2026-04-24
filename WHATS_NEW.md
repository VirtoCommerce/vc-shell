# What's New in @vc-shell/framework v2.0.0

This document summarizes the major features and improvements introduced in v2.0.0 of `@vc-shell/framework`. For migration instructions from previous versions, see [migration/README.md](./migration/README.md).

---

## Blade System

- **`useBlade()` unified composable** — Replaces the separate `useBladeNavigation()`, `useBladeContext()`, and legacy `useBlade()` APIs with a single composable covering all blade operations: `openBlade`, `closeSelf`, `closeChildren`, `callParent`, `replaceWith`, and `coverWith`. See [migration guide #10](./migration/10-use-blade.md).

- **`defineBlade()` macro** — New compile-time macro replacing `defineOptions()` for blade pages. Separates blade metadata (url, permissions, menuItem) from Vue component options. The Vite plugin splits it at build time: `name` goes to `defineOptions`, everything else registers in a global blade config registry available before component mount. Automated codemod: `npx @vc-shell/migrate --transform define-options-to-blade`. See [migration guide #35](./migration/35-define-blade.md).

- **Auto-injection of blade props** — VcBlade now reads `expanded` and `closable` directly from the `BladeDescriptor`; blade pages no longer need to declare these as props or wire up `@close` / `@expand` / `@collapse` emits. Use the `blade-props-simplification` codemod to strip legacy boilerplate. See [migration guide #11](./migration/11-blade-props.md).

- **VcBlade auto-wiring** — `close`, `expand`, and `collapse` are now handled by the blade system automatically. The `expandable` prop no longer defaults to `true`; set it explicitly where needed. The `reset:error` event has been removed in favor of the global error handler.

- **Typed options** — `useBlade<MyOptions>()` accepts a generic type parameter so that `options.value` is fully typed, eliminating the need for manual type assertions on blade option objects.

- **`onActivated` / `onDeactivated` lifecycle hooks** — New hooks that fire when a blade gains or loses "active" (rightmost visible) status, enabling blade-level focus management and lazy data loading.

- **`replaceWith` / `coverWith`** — Two distinct navigation methods with different semantics: `replaceWith` destroys the old blade immediately, while `coverWith` hides it so that closing the new blade restores the original. See [migration guide #12](./migration/12-replace-cover.md).

- **`onBeforeClose` guard inversion** — Guards now return **`true`** to **prevent** close (previously returned `false`). The inversion makes the semantic "reject close" consistent with standard event-like callbacks. See [migration guide #10](./migration/10-use-blade.md).

- **`BladeDescriptor` replaces `IBladeInstance`** — The blade stack now surfaces a lighter descriptor object. Toolbar callback signatures (`IBladeToolbar.isVisible`, `IBladeToolbar.clickHandler`) receive a `BladeDescriptor` instead of the old instance type.

### Transparent Blade Skeletons

VcBlade now provides layout-aware skeleton loading. When `loading=true`, every child UI component (VcInput, VcSelect, VcCard, VcButton, VcBanner, VcSwitch, etc.) automatically renders a skeleton placeholder matching its exact shape — no generic skeleton, no layout jumps. Zero changes to existing blade pages.

Custom components can opt in via the `useBladeLoading()` composable. See [migration guide #39](./migration/39-blade-skeleton.md).

---

## Table System (VcDataTable)

- **`VcDataTable`** — New compositional table component with a declarative `<VcColumn>` slot-based API, replacing the prop-array approach of the legacy `VcTable`. See [migration guide #29](./migration/29-vc-table-to-data-table.md).

- **`VcTableAdapter`** — Backward-compatible wrapper exported under the familiar `VcTable` name, mapping the old prop-based API (including the `"date-time"` column type) to the new `VcDataTable` internals with no breaking changes for existing consumers.

- **Column switcher** — Enable the `column-switcher` prop to give users a UI control for toggling individual column visibility at runtime.

- **Global filters** — A configurable filter bar is available via the `global-filters` prop, providing a consistent filtering UI above the table without custom toolbar wiring. New supporting types: `IFilterOption`, `IColumnFilterConfig`.

- **Pull-to-refresh** — On mobile, users can swipe down on the table to trigger a data reload, matching native mobile list conventions.

- **`activeItemId`** — Highlight a specific row as "active" (e.g., the currently open detail blade) without enabling full selection mode.

- **Empty / not-found states** — Built-in configurable states via `emptyText` and `notFoundText` props, with dedicated empty-state illustrations for zero-data and zero-search-results scenarios.

- **Virtual scroll** — Efficient DOM rendering for large datasets; only visible rows are rendered, keeping the table performant at thousands of rows.

- **Inline cell editing** — Cells can be made editable directly within the table row without opening a separate blade or modal.

- **Column resize and reorder with state persistence** — Users can resize and reorder columns; layout is automatically persisted to localStorage or sessionStorage using the `stateKey` prop. Storage key format: `VC_DATATABLE_${stateKey.toUpperCase()}`.

- **Row drag-and-drop reorder** — Rows can be reordered via drag-and-drop when the `reorderable-rows` prop is enabled, emitting the new order for the parent to persist.

- **`useDataTableSort()` composable** — Page-level composable for VcDataTable sort state. Provides `sortField` and `sortOrder` refs for `v-model` binding, plus a `sortExpression` string for API calls, eliminating manual sort boilerplate in list pages. See [migration guide #31](./migration/31-use-data-table-sort.md).

- **`useDataTablePagination()` composable** — Page-level composable for VcDataTable pagination state. Returns a `reactive()` object with `currentPage`, `pages`, `skip`, `totalCount`, `goToPage`, and `reset` — passable directly as the VcDataTable `:pagination` prop without intermediate conversion. Fires an optional `onPageChange` event callback for data fetching. Eliminates `Math.ceil` / `Math.floor` boilerplate from data composables and `onPaginationClick` handlers from list blades. See [migration guide #41](./migration/41-use-data-table-pagination.md).

- **`ITableColumnsBase.filter`** — Legacy column descriptors gain a `filter` property so existing VcTable consumers can opt into the new global-filter UI without migrating to VcColumn slots first.

---

## Notifications

- **`NotificationStore`** — Centralized Pinia-based store for notification state, replacing scattered reactive refs and providing a single source of truth for all notification data.

- **`useBladeNotifications()`** — Subscribe to specific notification types within a blade's lifecycle context; subscriptions are automatically cleaned up when the blade is closed. See [migration guide #14](./migration/14-notifications.md).

- **Toast modes** — Three toast display modes: `auto` (show then auto-dismiss), `progress` (track long-running operations with a progress indicator), and `silent` (store-only, no toast displayed).

- **Severity-based timeouts** — Standardized auto-dismiss durations by severity: `info` dismisses after 5 s, `warning` after 8 s, while `error` and `critical` notifications remain persistent until manually dismissed.

- **`useNotificationContext()`** — New composable for accessing notification data inside custom templates. Replaces implicit props with an explicit pull-based API. Custom templates no longer need `defineProps` or `inheritAttrs: false`.

- **`useBroadcastFilter()`** — New composable for filtering broadcast push notifications (`SendSystemEvents`). Replaces the error-prone `signalR: { creator }` / `updateSignalRCreator` pattern. The SignalR plugin now always listens to both channels; apps set a filter function to control which broadcast messages are accepted. Dev-mode warning appears if broadcast messages arrive without a filter configured. See [migration guide #42](./migration/42-broadcast-filter.md).

---

## Widgets

- **`useBladeWidgets()`** — Declare widgets in a headless composable style with automatic registration on blade mount and unregistration on blade unmount, eliminating manual lifecycle management. See [migration guide #13](./migration/13-widgets.md).

- **`defineBladeContext()` / `injectBladeContext()`** — Typed helpers for sharing a blade's internal context (data, actions) with external widgets and child components, replacing untyped `provide`/`inject` calls.

- **`VcWidget` explicit `widgetId`** — Widget identity is now an explicit prop; the component no longer calls `setActiveWidget` internally.

---

## Modules

- **`defineAppModule()`** — New named-options API for defining application modules, replacing the positional-argument `createAppModule(pages, locales, templates, components)` call with a readable object format (`{ blades, locales, notifications }`). Automated codemod: `npx @vc-shell/migrate --transform define-app-module`. See [migration guide #09](./migration/09-define-app-module.md).

- **`createModule` helper removed** — The positional factory used by internal modules (app-switcher, popup-handler, auth pages) has been removed. Use `defineAppModule({...})` instead. See [migration guide #44](./migration/44-create-module-removal.md).

- **`createDynamicAppModule` / dynamic-views subsystem removed** — The JSON-schema-driven UI module system (`DynamicBladeForm`, dynamic-views blades) is removed. Rewrite dynamic/JSON-schema modules as explicit Vue components under `defineAppModule`. See [migration guide #08](./migration/08-dynamic-views-removal.md).

- **`useDynamicModules()` CDN loader removed** — The custom runtime loader that fetched module bundles from a CDN via `apps.json` → `manifest.json` has been removed. For runtime loading of remote deployments use `@vc-shell/mf-host` + `@vc-shell/mf-module` (proper Vite Module Federation); for a single-deployment app use static imports with `app.use(...)`. This is independent from dynamic views. See [migration guide #45](./migration/45-dynamic-module-loader-removal.md).

- **Module Federation support** — Two new packages, `@vc-shell/mf-config` and `@vc-shell/mf-host`, provide first-class Vite Module Federation configuration for micro-frontend architectures.

- **`getModulesLibraryConfiguration()`** — Replaces the removed `getDynamicModuleConfiguration()` helper. `DynamicModuleOptions` and `CompatibilityOptions` types are no longer exported. See [migration guide #43](./migration/43-modules-library-config.md).

---

## App Hub

- **App Switcher → App Hub** — The "App Switcher" has been renamed to "App Hub" across the framework, reflecting its expanded role as a unified panel combining application switching and app bar widgets (notifications, background tasks, etc.). The `disableAppSwitcher` prop is now `disableAppHub`, the `#app-switcher` slot is now `#app-hub`, and `useAppSwitcher()` is now `useAppHub()`. Automated codemod: `npx @vc-shell/migrate --transform app-hub-rename`. See [migration guide #34](./migration/34-app-hub-rename.md).

- **Sidebar Search** — New `showSearch` and `searchPlaceholder` props on `VcApp` add a real-time search input to the sidebar that filters menu items by translated title. Works on both desktop (expanded sidebar) and mobile (slide-out navigation panel).

- **`useAppBarWidget`** — Programmatic App Bar widget registration, replacing reliance on named toolbar slots and enabling modules to contribute App Bar items at runtime.

- **`useAppBarMobileButtons`** — Register mobile-specific action buttons in the App Bar, providing a dedicated API for the mobile App Bar button area separate from desktop toolbar items.

- **`useSettingsMenu`** — Programmatic registration of settings menu items, replacing the user-dropdown slot approach and allowing modules to contribute settings entries without modifying the host template.

---

## UI Components

### New Components

- **`VcAuthLayout`** — Replaces the narrower `VcLoginForm` with a flexible authentication layout component that supports custom branding, logos, and supplementary content slots. See [migration guide #16](./migration/16-login-form.md).

- **`VcDataTable` / `VcColumn`** — See the Table System section above.

- **`VcEditor`** — Rich-text editor with preview, source, and split-pane modes; supports `maxlength`, a customizable toolbar, and fullscreen editing. Accepts a typed `extensions` array, where custom extensions override base extensions with the same name.

- **`VcSidebar`** — Standalone sidebar organism that powers the shell navigation and is also consumable by apps that need a custom layout.

- **`VcImageUpload`** — Dedicated organism for image upload flows, complementing `VcImage` and `VcFileUpload`.

- **`VcButtonGroup`** — Visually-joined group of `VcButton` elements for segmented control / toolbar use cases.

- **`VcScrollableContainer`** — Atom that adds horizontal/vertical scroll with scroll-arrow chrome (wraps the `useScrollArrows()` composable).

- **`VcCheckboxGroup`** — Multi-checkbox input with array `v-model`, shared label, and validation integration.

- **`VcRadioGroup`** — Radio input group with built-in layout and validation.

- **`VcColorInput`** — Form-field-compliant color picker molecule.

- **`VcDatePicker`** — Date/time picker built on `date-fns` (replaces the old `moment`-based implementation).

- **`VcDropdown` / `VcDropdownPanel`** — Generic dropdown primitives used internally by menus, column filters, and custom popovers.

- **`VcMenu` / `VcMenuItem` / `VcMenuGroup`** — Composable menu primitives for building sidebars, context menus, and settings panels.

- **`VcInputGroup`** — Horizontal grouping of inputs/buttons (search + submit, prefix + value + suffix, etc.).

- **`VcImageTile`** — Image tile with overlay actions, used by galleries and upload surfaces.

- **`MultilanguageSelector`** — Molecule for switching edited language in multi-locale detail blades.

### Component Enhancements

- **`VcButton`** — Extended `variant` union (`primary`, `secondary`, `danger`, `warning`, `ghost`, `link`, etc.), new `type`, `loading`, and `ariaLabel` props. Automatically disabled during `loading`. Primary color tuned for WCAG AA contrast. Legacy `small`, `outline`, `raised` boolean props are removed — use `variant` and `size` instead. See [migration guide #47](./migration/47-vc-button-props.md).

- **`VcPopup`** — Now supports `v-model` for visibility, plus `closeOnOverlay` and `closeOnEscape` props for declarative dismissal behavior. `usePopup()` is a public composable (previously lived in `shared/`).

- **`VcGallery`** — New `layout` prop (`"filmstrip"` default or `"grid"`), plus `size`, `gap`, `imagefit`, and `loading` props. `images` now accepts `AssetLike[]`, aligning with `useAssetsManager()`.

- **`VcTooltip`** — New `arrow`, `variant`, `maxWidth`, and `disabled` props; keyboard focus activation for accessibility.

- **`VcBanner`** — Legacy variants (`light-danger`, etc.) deprecated in favor of semantic names. New `collapsedHeight` prop, typed `trigger` slot, and `useBladeLoading()` integration. See [migration guide #24](./migration/24-vc-banner-variants.md).

- **`VcSwitch`** — `tooltip` prop deprecated; use `hint` (or the new `labelTooltip`) instead. New `error` slot. Integrates `useBladeLoading()`. See [migration guide #25](./migration/25-vc-switch-tooltip.md).

- **`VcIcon`** — `useContainer` prop deprecated (no-op); remove via the `icon-container-prop` codemod. Default icons switched to Lucide. See [migration guides #05](./migration/05-icons.md) and [#26](./migration/26-vc-icon-container.md).

- **`VcSkeleton`** — New `variant`, `width`, `height`, and `ariaLabel` props with ARIA wiring; `animated` default changed.

- **`VcMultivalue`** — New `clearable` prop and `prepend` / `append` slots; `option` slot receives an `index` payload.

- **`VcTextarea`** — New `hint` prop and slot.

- **`VcSlider`** — New `ariaLabel` prop.

- **`VcLabel`** — New `htmlFor` prop.

- **`VcImage`** — New `alt` and `thumbnailSize` props.

- **`VcField`** — `modelValue` narrowed to `string | number | Date`; new `displayValue` prop for formatted read-only rendering.

- **`VcCard`** — New `header` slot; collapse icon switched to Lucide; integrates `useBladeLoading()`.

- **`VcAccordion`** — New `"ghost"` variant.

- **`VcBreadcrumbs`** — New `collapsed` prop for mobile / narrow contexts.

- **`VcStatus`** — `outline` prop removed; dot size reduced for alignment.

- **`VcLink`** — Rendered as a `<button>` (previously `<div>`); label text wrapped in `<span>` for independent styling.

- **`VcContainer`** — `usePtr` prop and `scroll:ptr` event removed — pull-to-refresh now lives in `VcDataTable`.

### Cross-Cutting UI Changes

- **`IFormFieldProps` standardization** — All form molecules (`VcInput`, `VcInputCurrency`, `VcSelect`, `VcTextarea`, `VcSwitch`, `VcFileUpload`, `VcEditor`, `VcMultivalue`, `VcColorInput`, `VcDatePicker`) now share the common `IFormFieldProps` / `ITextFieldProps` interface for `label`, `hint`, `error`, `required`, `disabled`, `readonly`, `placeholder`, and related props.

- **BEM class rename** — All framework components migrated CSS class suffix conventions from `_element` to `--element` (e.g. `vc-button_primary` → `vc-button--primary`). Apps that target framework class names in custom CSS must update selectors. See [migration guide #46](./migration/46-css-bem-class-migration.md).

- **ARIA / accessibility** — Comprehensive `role` and `aria-*` attributes added across blades, popups, tables, menu items, forms, and focus-visible styling, bringing the framework closer to WCAG 2.1 AA compliance.

- **Lucide icons** — Material icon and Font Awesome references migrated to Lucide (`lucide-*`) across all framework components. See [migration guide #05](./migration/05-icons.md).

- **No global component registration** — The framework no longer calls `app.component()` or `app.directive()` during plugin installation. Import components and directives explicitly from `@vc-shell/framework/ui` for proper tree-shaking. Automated codemod: `npx @vc-shell/migrate --transform remove-global-components`. See [migration guide #40](./migration/40-remove-global-components.md).

### VcApp Layout Customization

- **New slots** — `layout`, `menu`, `workspace`, `sidebar-header`, and `sidebar-footer` allow host apps to replace whole chrome regions without forking the shell.

- **`@logo-click` event removed** — Bind a click handler inside the `sidebar-header` slot instead.

- **CSS class rename** — `_mobile` responsive class suffixes renamed to `--mobile`.

### Dashboard

- **`DraggableDashboard`** — Drag-and-drop dashboard container with programmatic widget registration via `registerDashboardWidget()`, enabling modules to contribute dashboard tiles without modifying the host app. See [migration guide #18](./migration/18-dashboard.md).

---

## New Composables

### Blade & UI lifecycle

- **`useBladeLoading()`** — Provides reactive loading state from the enclosing `VcBlade`; enables custom components to render skeletons consistently. See [migration guide #39](./migration/39-blade-skeleton.md).

- **`useResponsive()`** — Unified reactive breakpoint state (`isMobile`, `isDesktop`, `isPhone`, `isTablet`, `isTouch`). Replaces the awkward `$isMobile.value` global property and string-key `inject("isMobile")`. See [migration guide #36](./migration/36-use-responsive.md).

- **`useBladeForm()`** — Unified form state management for detail blades. Replaces the manual combination of `useForm` (vee-validate), `useModificationTracker`, `useBeforeUnload`, and `onBeforeClose` with a single composable. Returns `canSave`, `isModified`, `setBaseline()`, `revert()`, `setFieldError`, and `errorBag`. VcBlade auto-detects modification state via provide/inject, eliminating the `:modified` prop. Supports `canSaveOverride` and `closeConfirmMessage`. See [migration guide #37](./migration/37-use-blade-form.md).

### Form / input primitives

- **`useFormField()`** — Internal-turned-public composable powering `IFormFieldProps` wiring: label binding, `htmlFor`, error state, and validation integration. Use it to build custom form molecules that behave consistently with the built-in set.

- **`useCollapsible()`** — Generic collapse/expand state with animation hooks; used by VcAccordion, VcBanner, and VcCard.

- **`useFloatingPosition()`** — Wraps Floating UI for dropdowns, tooltips, popovers — handles placement, flip, shift, and anchor tracking.

- **`useScrollArrows()`** — Shows/hides scroll-direction arrows on an overflowing container; powers `VcScrollableContainer`.

- **`useTeleportTarget()`** — Manages a stable teleport target element (for popups, dropdowns) that survives HMR and nested routing.

### Data / state

- **`useAssetsManager()`** — High-level composable for assets (images, files). Pass a reactive ref and options — the composable handles upload, remove, reorder, and metadata updates by mutating the ref directly. See [migration guide #32](./migration/32-use-assets-manager.md).
  - Zero wiring — no more manual `assetsHandler` objects.
  - Built-in `confirmRemove` callback.
  - Works with any `AssetLike` compatible type.
  - Accepts `Ref<AssetLike[] | undefined | null>`, so `toRef(entity.value, 'images')` works even when the property is initially `undefined`.
  - Internal ref with two-way sync — mutations propagate to source after every operation.
  - The built-in AssetsManager blade takes `manager: UseAssetsManagerReturn` in options (pass `markRaw(manager)` to prevent Vue proxy unwrap); old `assetsUploadHandler` / `assetsEditHandler` / `assetsRemoveHandler` options are removed.
  - `useAssets()` and `ICommonAsset` are deprecated shims but continue to work.

- **`useModificationTracker()`** — Baseline-vs-current diff tracker, moved out of `shared/` and integrated with `useBladeForm()`.

- **`useBeforeUnload()`** — Registers a browser unload guard that prompts the user when there are unsaved changes.

- **`useLoading()`** — Centralized loading state manager for coordinating multiple async operations.

- **`useErrorHandler()`** — Composable interface to the global error handler.

- **`useConnectionStatus()`** — Tracks SignalR hub connection state, exposing reactive status for UI indicators and automatic reconnection logic.

- **`useSlowNetworkDetection()`** — Detects slow network conditions (via the Network Information API and latency heuristics) and exposes a reactive flag so UIs can swap in skeletons or lower-fidelity assets.

- **`useKeyboardNavigation()`** — Keyboard navigation (arrow keys, Home/End, Enter) for list and table components.

- **`useWebVitals()`** — Collects Core Web Vitals metrics (LCP, FID, CLS, etc.) for reporting to analytics.

- **`useDataTableSort()` / `useDataTablePagination()`** — See the Table System section above.

### Sidebar / shell

- **`useSidebarState()` / `provideSidebarState()`** — Reactive sidebar expanded/collapsed/pinned state, shared across the shell via provide/inject.

- **`useMenuExpanded()`** — Tracks expanded menu groups, moved from `shared/`.

- **`useAppBarWidget()` / `useAppBarMobileButtons()` / `useSettingsMenu()`** — Programmatic registration for App Bar / settings entries (see App Hub section).

### Localization

- **`usePlatformLocaleSync()`** — Syncs the active vue-i18n locale with the VirtoCommerce platform user-profile locale (bidirectional), replacing ad-hoc watcher boilerplate.

### Table utilities (moved from `shared/`)

- **`useTableSelection()`** — Generic row-selection state (single/multi) used by VcDataTable and custom list components.

- **`useTableSort()`** — Lightweight client-side sort helper for list views without the full VcDataTable integration.

---

## Forms & Validation

- **`useBladeForm()` composable** — See the New Composables section above. Unified form composable for detail blades; automated codemod available. See [migration guide #37](./migration/37-use-blade-form.md).

- **`useDynamicProperties()` refactor** — Rewritten from a monolithic function with five generic type parameters and class constructors to a clean options-based API using the strategy pattern internally. Factory classes (`PropertyValueFactory`, `PropertyDictionaryItemFactory`) are no longer needed. New `cleanEmptyValues()` helper strips empty property values before save. No getter side-effects — dictionary loading is explicit. Automated codemod: `npx @vc-shell/migrate --transform dynamic-properties-refactor`. See [migration guide #38](./migration/38-dynamic-properties-refactor.md).

- **`IFormFieldProps` / `ITextFieldProps`** — Standardized interfaces consumed by every form molecule. Apps building custom form components can extend these for a consistent prop surface.

---

## Localization

- **Typed locale exports** — Framework locales are now available as typed ES module exports: `import en from '@vc-shell/framework/locales/en'`. Each export is fully typed with the `VcShellLocale` interface, providing IDE autocomplete for all translation keys. Use `VcShellLocalePartial` for partial overrides. See [migration guide #33](./migration/33-locale-exports.md).

- **Dev-mode missing-key warnings** — In development mode, accessing a translation key with no value for the current locale logs a console warning with the exact key path, helping catch untranslated strings early.

- **`vc-check-locales` CLI** — New bin command to validate custom locale files against the framework's English baseline. Run `npx vc-check-locales ./locales/fr.json` to see missing and extra keys. Integrates into CI via non-zero exit code on failure.

- **Platform locale sync** — `usePlatformLocaleSync()` keeps the framework and VirtoCommerce platform user profile in sync automatically.

---

## Extensions System

- **New API** — `defineExtensionPoint()`, `useExtensionPoint()`, and the `<ExtensionPoint>` component replace the old `useExtensionSlot()` / `ExtensionSlot` surface. Extensions now have typed contracts and deterministic ordering. See [migration guide #15](./migration/15-extension-points.md).

- **`useExtensionData()` removed** — For cross-extension data sharing, use `provide/inject` or a Pinia store. No direct replacement is provided because the old API implicitly encouraged tight coupling.

---

## Infrastructure

- **Global Error Handler plugin** — Three-layer error capture (Vue component errors, async promise rejections, unhandled window errors) with a deduplication window and automatic toast notification on unhandled errors.

- **AI Agent plugin** — New `aiAgent` install option and `@vc-shell/framework/ai-agent` sub-entry for embedding AI-assisted workflows into apps. Surfaced via the `AiAgentServiceKey` injection key.

- **Typed Symbol injection keys** — All framework injection keys (`BladeDescriptorKey`, `ToolbarServiceKey`, `BladeBackButtonKey`, `EmbeddedModeKey`, `IsMobileKey`, etc.) are now typed Symbols defined in `framework/injection-keys.ts`. String-based keys have been removed. See [migration guide #21](./migration/21-injection-keys.md).

- **New injection keys** — `ModulesReadyKey`, `ModulesLoadErrorKey`, `AppRootElementKey`, `ShellIndicatorsKey`, `BladeRoutesKey`, `InternalRoutesKey`, `CloseSettingsMenuKey`, `BladeContextKey`, `WidgetScopeKey`, `BladeFormKey`, `BladeLoadingKey`, `AiAgentServiceKey`.

- **`window` globals removed** — `window.Vue`, `window.VueRouter`, `window.moment`, and peers are no longer assigned by the framework. Import from the corresponding packages instead. See [migration guide #04](./migration/04-window-globals.md).

- **`moment` → `date-fns`** — The `moment` dependency, plugin, and re-exports are removed. Apps using `moment.humanize()` or the `@/plugins/moment` re-export must migrate to `date-fns`. See [migration guide #03](./migration/03-moment-to-datefns.md).

- **`platformUrl` install option removed** — Platform URL is now configured via the API-client layer. See [migration guide #22](./migration/22-platform-url.md).

- **Composable return-type renames** — 17 composable return types were renamed (e.g. `INotifications` → `UseNotificationsReturn`). Automated codemod available. See [migration guide #23](./migration/23-composable-return-types.md).

### Build / Config

- **`viteBladePlugin`** — Auto-included Vite plugin that powers `defineBlade()` compile-time transformation.

- **`vc-remove-empty-chunks` plugin** — Cleans up empty Rollup chunks after tree-shaking.

- **Circular dependency detection** — Vite config enables madge-based circular-dependency detection in development builds.

- **Preloader HTML** — The app scaffold injects a minimal loading indicator into `index.html` so users see feedback before the SPA bundle executes.

- **Server warmup** — Vite config warms up key framework entry points at dev-server start, reducing first-route latency in monorepo setups.

- **Aliases in all modes** — Project aliases resolve consistently in dev and build (previously differed), aligning behavior between `vite dev` and `vite build`.

- **Script renames** — `type-check` → `check:types`, `check-locales` → `check:locales`. Update your CI pipelines accordingly.

---

## Package Structure

- **Multi-entry build** — The framework package now exposes sub-entry points: `@vc-shell/framework/ui` (standalone UI kit), `@vc-shell/framework/ai-agent`, `@vc-shell/framework/extensions`, and `@vc-shell/framework/globals` (types-only). The main entry still re-exports everything.

- **Framework globals** — `@vc-shell/framework/globals` provides all type augmentations (`*.vue` module, `$t`, `$hasAccess`, `$isMobile`, etc.) via a single tsconfig `types` entry, replacing manual `shims-vue.d.ts` and `vue-i18n.d.ts` files. See [migration guide #30](./migration/30-shims-to-globals.md).

- **Wildcard export removed** — The `"./*"` wildcard export is removed; deep imports like `@vc-shell/framework/core/...` no longer work in published npm packages. Import from the documented sub-entries or the root. See [migration guide #01](./migration/01-package-json.md).

- **Locale sub-entries** — Locales use explicit named exports rather than wildcards; see [migration guide #33](./migration/33-locale-exports.md).

- **`sideEffects` narrowed** — Changed from `["index.ts"]` to `["**/*.vue"]`, enabling more aggressive tree-shaking of unused composables / utilities.

- **`shared/` dissolved** — The `shared/` directory has been removed. Its contents moved to domain-appropriate locations: `core/` (logic), `ui/` (components), `shell/` (app chrome: auth, sidebar, dashboard, settings), and `modules/` (built-in modules). Public API imports from `@vc-shell/framework` are unchanged. See [migration guide #28](./migration/28-shared-components.md).

- **No global component registration** — See UI Components section above. See [migration guide #40](./migration/40-remove-global-components.md).

- **Peer dependencies** — `vue` and `vue-router` are now peerDependencies (floor `vue-router >= 4.2.0`, `vue >= 3.5`). Ensure your app declares them. See [migration guide #01](./migration/01-package-json.md).

---

## Styles & Theme

- **Dark theme** — A `data-theme="dark"` palette ships alongside the existing `data-theme="light"` palette in `framework/assets/styles/theme/colors.scss`. Use `useTheme()` to register, switch, or persist themes; the composable also supports sequential switching via `next()`. Apps can register custom themes at runtime.

- **Z-index token scale** — A single source of truth for layering in `framework/assets/styles/theme/_z-index.scss`. Tokens group by scope: `--z-local-*` (inside component), `--z-layout-*` (page chrome), `--z-overlay-*` (popups, dropdowns), `--z-critical-*` (teleported modals). Consumers should use tokens instead of bare z-index numbers.

- **Tailwind colors bound to CSS custom properties** — Tailwind utilities like `tw-bg-primary-500`, `tw-text-neutral-700` now read directly from the theme CSS variables, so palette overrides cascade to utility classes without a rebuild.

- **Lato font family** — Bundled via `@fontsource/lato` (weights 300–900) and exposed as the default `lato` Tailwind font family.

- **Scrollbar restyle** — Native scrollbars are restyled to match the theme; the related CSS custom property was renamed (`--scroll-color` → `--scroll-thumb`).

- **New semantic tokens** — Four CSS custom property groups: `overlay` (backdrop colors), `shadow` (elevation shadows), `surface` (card/panel backgrounds), and `glass` (frosted-glass effect values).

- **New transitions and offline utility** — Shared transition tokens (duration/easing) and an `.offline` utility class for offline banners.

- **SCSS `@import` → `@use`** — Framework auto-includes `colors` and `base`; consumer SCSS should use `@use` instead of `@import`. Automated codemod: `npx @vc-shell/migrate --transform scss-safe-use`. See [migration guide #06](./migration/06-styles-scss.md).

- **BEM class rename** — All framework component class suffixes migrated from `_element` to `--element`. See [migration guide #46](./migration/46-css-bem-class-migration.md).

- **`v-loading` directive** — Default z-index lowered from `9999` to `9000`, and now uses a CSS custom property so apps can override it without `!important`.

- **Loading animation keyframes removed** — Tailwind utilities like `tw-animate-loadingMarker` are gone; use `VcSkeleton` or the new transitions instead.

---

## Migration Summary

The comprehensive migration guide index is at [migration/README.md](./migration/README.md). 48 dedicated guides cover breaking changes, with automated codemods available under `@vc-shell/migrate` for the most common transformations. Run the full suite with:

```bash
npx @vc-shell/migrate
```

See each migration guide for targeted transforms.

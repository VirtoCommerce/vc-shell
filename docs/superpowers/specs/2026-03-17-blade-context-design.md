# Blade Context — Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Package:** `@vc-shell/framework`

## Problem

External widgets receive blade data through `provideBladeData` + `config.requiredData` — string-based keys, no type safety, non-obvious DX. The blade must call `provideBladeData` from `useBlade()` (a composable that does many unrelated things), while the widget declares string keys in `config.requiredData` or a `propsResolver` callback. The connection between the two is implicit and hard to document.

## Solution

Two composables — `defineBladeContext` / `injectBladeContext` — implementing the standard Vue provide/inject pattern with a framework-managed injection key.

## API

### `defineBladeContext(data)`

Called in blade `<script setup>`. Provides reactive data under a framework-managed `BladeContextKey`.

```ts
// ProductDetailsBase.vue
const item = ref<Product>();
const disabled = computed(() => !item.value);

defineBladeContext({ item, disabled });
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Record<string, unknown>` | Reactive data to expose |

**Behavior:**
- Calls `provide(BladeContextKey, data)` under the hood
- Must be called during component setup (standard Vue provide constraint)
- One call per blade — last call wins if called multiple times

### `injectBladeContext()`

Called in widget/extension/nested component `<script setup>`. Injects blade context from the nearest ancestor blade.

```ts
// MessageWidget.vue (external module)
const ctx = injectBladeContext();
const item = ctx.item as Ref<Product>;
```

**Returns:** `Record<string, unknown>` — the data provided by the blade.

**Behavior:**
- Calls `inject(BladeContextKey)` under the hood
- Throws `InjectionError` if no context found — missing context is a developer error
- No type safety at the boundary (modules are isolated, cannot share types). Consumer casts to expected shape.

### Injection key

```ts
// framework/injection-keys.ts
export const BladeContextKey: InjectionKey<Record<string, unknown>> = Symbol("BladeContext");
```

## Usage

### Blade side

```ts
// ProductDetailsBase.vue — <script setup>
const item = ref<Product>();
const disabled = computed(() => !item.value);
const loading = ref(false);

// Headless widgets (blade-local, use closures)
useBladeWidgets([
  { id: "Offers", icon: "lucide-tag", title: "OFFERS.TITLE", badge: offersCount },
]);

// Expose data for external widgets / extensions
defineBladeContext({ item, disabled, loading });
```

### External widget side

```ts
// messenger/widgets/MessageWidget.vue — <script setup>
const ctx = injectBladeContext();
const item = ctx.item as Ref<Product>;

// Use item reactively
const messageCount = computed(() => /* ... */);
```

### External widget registration

```ts
// messenger/index.ts
registerExternalWidget({
  id: "messenger-widget",
  component: MessageWidget,
  targetBlades: ["ProductDetails"],
  // No config, no requiredData, no propsResolver
  // Widget injects data internally via injectBladeContext()
});
```

## What gets removed

| Removed | Reason |
|---------|--------|
| `provideBladeData` from `useBlade()` | Replaced by `defineBladeContext` |
| `config.requiredData` | Widget injects data directly |
| `config.optionalData` | Widget injects data directly |
| `config.fieldMapping` | No longer needed |
| `config.propsResolver` | Widget handles own data |
| `resolveWidgetProps` in widget-service | No longer needed |
| Props resolution logic in `useExternalWidgets` | Widget injects instead |

## What stays

| Kept | Reason |
|------|--------|
| `registerExternalWidget` | Still needed for widget registration, but without `config` |
| `IWidgetConfig` | Deprecated, removed in next major |

## Type safety

Modules are isolated — widget cannot import types from the blade's module. Type safety at the boundary is impossible (same as Salesforce LMS, micro-frontends). The contract is held by convention, not by the compiler.

Widget authors cast to their expected shape:

```ts
const ctx = injectBladeContext();
const item = ctx.item as Ref<SellerProduct>; // SellerProduct from widget's own API client
```

## Architecture notes

- **Pattern:** Azure Portal inputs/outputs — blade declares its public data contract, consumers access it
- **Scope:** `defineBladeContext` is not limited to widgets. Extensions, deeply nested components, and any code running inside blade scope can use `injectBladeContext`
- **Vue-idiomatic:** `define*` naming follows Vue conventions (`defineProps`, `defineEmits`, `defineExpose`)

## Files

| Action | File |
|--------|------|
| Create | `framework/shared/composables/useBladeContext.ts` |
| Create | `framework/shared/composables/useBladeContext.test.ts` |
| Modify | `framework/shared/composables/index.ts` |
| Modify | `framework/injection-keys.ts` |
| Modify | `framework/shared/composables/useExternalWidgets.ts` |
| Deprecate | `IWidgetConfig.requiredData`, `optionalData`, `fieldMapping`, `propsResolver` |

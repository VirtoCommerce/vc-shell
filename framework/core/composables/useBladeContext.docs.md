# useBladeContext (defineBladeContext / injectBladeContext)

Exposes blade-level data to descendant widgets, extensions, and nested components via Vue's provide/inject mechanism. This pair of functions eliminates the need for prop drilling when child widgets or extension points need access to the parent blade's entity data, loading flags, or other shared state.

The pattern follows a "define once, inject anywhere" approach: the blade component calls `defineBladeContext` during setup, and any descendant (no matter how deeply nested) can call `injectBladeContext` to read that data reactively.

## When to Use

- Share blade state (current entity, loading flags, disabled state) with child widgets without prop drilling
- Access parent blade data from an extension or widget component
- Expose selective fields to widgets (e.g., only the entity ID) via a computed getter
- When NOT to use: for cross-blade communication between sibling blades (use `useBlade` / blade messaging instead)

## Basic Usage

```typescript
// In a blade's <script setup>
import { defineBladeContext, injectBladeContext } from '@vc-shell/framework';

// Provide context (blade component)
defineBladeContext({ item, disabled, loading });

// Or with a computed for selective exposure
defineBladeContext(computed(() => ({ id: item.value?.id })));
```

```typescript
// In a widget or nested component
import { injectBladeContext } from '@vc-shell/framework';

const ctx = injectBladeContext();
const entityId = computed(() => ctx.value.id as string);
```

## API

### defineBladeContext

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | `MaybeRefOrGetter<Record<string, unknown>>` | Yes | Plain object, ref, or getter to expose |

Returns `void`. Must be called in the blade's `<script setup>`.

### injectBladeContext

Takes no parameters. Returns `ComputedRef<Record<string, unknown>>`.

Throws `InjectionError` if no ancestor blade has called `defineBladeContext`.

## Recipe: Widget Consuming Blade Context

A typical pattern is a sidebar widget that needs to load related data based on the current blade entity. The widget does not receive any props from the blade -- it reads the entity ID from the blade context:

```vue
<script setup lang="ts">
// widgets/RelatedOrdersWidget.vue
import { computed, watch } from "vue";
import { injectBladeContext } from "@vc-shell/framework";

const ctx = injectBladeContext();
const customerId = computed(() => ctx.value.id as string | undefined);

// Reload orders whenever the customer changes
watch(customerId, async (id) => {
  if (id) {
    await loadOrders(id);
  }
});
</script>
```

```vue
<script setup lang="ts">
// blades/CustomerDetailBlade.vue
import { ref, computed } from "vue";
import { defineBladeContext } from "@vc-shell/framework";

const customer = ref({ id: "cust-1", name: "Acme Corp" });
const loading = ref(false);

// Expose the customer data to all descendant widgets
defineBladeContext(computed(() => ({
  id: customer.value?.id,
  name: customer.value?.name,
  loading: loading.value,
})));
</script>
```

## Details

- **Reactivity**: The provided context is always wrapped in a `computed`, so consumers receive a `ComputedRef` regardless of whether the provider passed a plain object, a ref, or a getter. Changes propagate automatically.
- **Injection key**: Uses `BladeContextKey` from `framework/injection-keys.ts`. This is a framework-level Symbol, so there is no risk of key collision with application code.
- **Error handling**: `injectBladeContext` throws an `InjectionError` with a descriptive message if called outside a blade component tree. This fails fast during development rather than silently returning `undefined`.
- **Scope**: The context is scoped to the Vue component subtree. Each blade in the stack has its own context, so nested blades do not leak data upward or sideways.

## Tips

- Prefer exposing a computed getter rather than the full reactive object when only a subset of fields is needed. This minimizes unnecessary re-renders in consuming widgets.
- The context value is untyped (`Record<string, unknown>`). Use type assertions or a typed wrapper in your module if you need type safety (e.g., `ctx.value.id as string`).
- If a blade does not call `defineBladeContext`, any descendant calling `injectBladeContext` will throw. Make sure all blades that host widgets define their context.

## Related

- `BladeContextKey` in `framework/injection-keys.ts`
- `useBladeWidgets` -- widgets that consume blade context
- `useBladeStack` -- manages the blade navigation stack

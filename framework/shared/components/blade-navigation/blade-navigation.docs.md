# BladeNavigation

The core navigation system for the vc-shell admin UI. Manages a horizontal stack of blade panels (similar to the Azure Portal pattern) with routing, breadcrumbs, and parent-child messaging. BladeNavigation is the centerpiece of the vc-shell architecture -- every admin screen is rendered as a blade within this system, and all navigation happens by pushing, popping, replacing, or covering blades in the stack.

## Quick Start

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

// No need to declare expanded/closable props or close:blade/parent:call emits —
// VcBlade reads them from BladeDescriptor automatically (Smart VcBlade pattern).
const { param, options, openBlade, closeSelf, callParent, exposeToChildren, onBeforeClose } = useBlade();

// param and options come from useBlade() — no props needed
// param.value → entity ID passed via openBlade({ param })
// options.value → data passed via openBlade({ options })

// Open a child blade
openBlade({ name: "OrderDetails", param: "ORD-001", options: { source: "list" } });

// Expose methods for child blades to call
exposeToChildren({ reload: () => fetchData() });

// Call a method on the parent blade
const result = await callParent<string>("reload", { id: "123" });

// Close the current blade
await closeSelf();
</script>
```

## When to Use

- Automatically used as the top-level navigation container in every vc-shell application
- You do not instantiate this directly; it is installed as a plugin and rendered by the app shell
- Interact with the blade stack through `useBlade()` (preferred) or `useBladeStack()` (low-level)

## Architecture

```
VcBladeNavigation
  +-- VcBladeSlot (per blade in stack)
       +-- VcBlade (the actual blade chrome: toolbar, header, content)
            +-- Widgets sidebar
            +-- Content area (your blade component)
```

### Key Composables

| Composable | Purpose |
|------------|---------|
| `useBlade` | **Primary API** -- identity, navigation, communication, guards, error management |
| `useBladeStack` | Low-level stack state machine (inject via `BladeStackKey`) |
| `useBladeMessaging` | Low-level inter-blade messaging (inject via `BladeMessagingKey`) |
| `defineBladeContext` / `injectBladeContext` | Share blade data with descendant widgets and extensions |
| `useBladeNavigation` | Legacy adapter -- maps old index-based API onto the new stack. Use `useBlade()` for new code |

### Key Components

| Component | Description |
|-----------|-------------|
| `VcBladeNavigation` | Root container rendering the blade stack with mobile back-button support |
| `VcBladeSlot` | Wrapper for each blade handling visibility, expand/collapse, and breadcrumbs. Provides `BladeDescriptorKey` injection so VcBlade can read `expanded`/`closable` automatically — blade pages no longer need to declare these as props. |
| `VcBladeView` | Render function resolving a blade component from the blade registry |

---

## API Reference: `useBlade()`

The primary composable for blade developers. Works **everywhere** -- inside blades (full API) and outside blades like dashboard cards (navigation-only).

```ts
import { useBlade } from "@vc-shell/framework";
const {
  // Identity (read-only, requires blade context)
  id, param, options, query, closable, expanded, name,
  // Navigation (works everywhere)
  openBlade,
  // Actions (requires blade context)
  closeSelf, closeChildren, replaceWith, coverWith,
  // Communication (requires blade context)
  callParent, exposeToChildren,
  // Guards (requires blade context)
  onBeforeClose,
  // Error management (requires blade context)
  setError, clearError,
  // Data sharing (requires blade context, deprecated -- use defineBladeContext)
  provideBladeData,
} = useBlade();
```

### Identity Properties

Reactive read-only computed refs exposing the current blade's descriptor fields.

| Property | Type | Description |
|----------|------|-------------|
| `id` | `ComputedRef<string>` | Unique instance ID of this blade |
| `param` | `ComputedRef<string \| undefined>` | Entity ID passed when opening (e.g., order ID) |
| `options` | `ComputedRef<Record<string, unknown> \| undefined>` | Arbitrary context data passed when opening |
| `query` | `ComputedRef<Record<string, string> \| undefined>` | URL query parameters |
| `closable` | `ComputedRef<boolean>` | `true` if blade has a parent (workspace blades are not closable) |
| `expanded` | `ComputedRef<boolean>` | `true` if this is the active (rightmost visible) blade |
| `name` | `ComputedRef<string>` | Registered component name (e.g. `"OrderDetails"`) |

### Navigation

| Method | Signature | Description |
|--------|-----------|-------------|
| `openBlade` | `(event: BladeOpenEvent & { isWorkspace?: boolean }) => Promise<void>` | Open a child blade (or workspace if `isWorkspace: true`). Auto-sets `parentId` to the current blade when called inside blade context. Works outside blades too (dashboard cards, notifications). |

### Actions

| Method | Signature | Description |
|--------|-----------|-------------|
| `closeSelf` | `() => Promise<boolean>` | Close the current blade. Returns `true` if a guard prevented closing. |
| `closeChildren` | `() => Promise<void>` | Close all child blades of the current blade (deepest first, respecting guards). |
| `replaceWith` | `(event: BladeOpenEvent) => Promise<void>` | **True replacement**: destroys the current blade and creates a new one at the same stack index with the same `parentId`. URL is replaced in-place (no new history entry). |
| `coverWith` | `(event: BladeOpenEvent) => Promise<void>` | **Cover**: hides the current blade (`visible: false`) and opens a new blade on top. Closing the covering blade restores the hidden one. Creates a new browser history entry. |

### Communication

| Method | Signature | Description |
|--------|-----------|-------------|
| `exposeToChildren` | `(methods: Record<string, Function>) => void` | Register methods that child blades can call via `callParent`. Call once in `setup()`. |
| `callParent` | `<T = unknown>(method: string, args?: unknown) => Promise<T>` | Call a method exposed by the parent blade. Returns the method's return value. |

### Guards

| Method | Signature | Description |
|--------|-----------|-------------|
| `onBeforeClose` | `(guard: () => Promise<boolean>) => void` | Register a close guard. Return `true` to **prevent** closing, `false` to **allow**. |

### Error Management

| Method | Signature | Description |
|--------|-----------|-------------|
| `setError` | `(error: unknown) => void` | Set an error on the current blade (displayed as error banner in VcBlade). |
| `clearError` | `() => void` | Clear the current blade's error state. |

### Data Sharing (Deprecated)

| Method | Signature | Description |
|--------|-----------|-------------|
| `provideBladeData` | `(data: MaybeRef<Record<string, unknown>>) => void` | **Deprecated** -- use `defineBladeContext()` instead. Provides data via `BladeDataKey` injection. |

---

## API Reference: `defineBladeContext()` / `injectBladeContext()`

Share reactive data from a blade to its descendant widgets and extensions.

```ts
import { defineBladeContext, injectBladeContext } from "@vc-shell/framework";

// In the blade component (setup):
defineBladeContext({ item, disabled, permissions });

// In a widget or nested component:
const ctx = injectBladeContext();
const entityId = computed(() => ctx.value.id as string);
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `defineBladeContext` | `(data: MaybeRefOrGetter<Record<string, unknown>>) => void` | Provide blade data. Accepts plain object, ref, or computed. Call once per blade in `setup()`. |
| `injectBladeContext` | `() => ComputedRef<Record<string, unknown>>` | Inject blade data from nearest ancestor blade. Throws if no context found. |

---

## API Reference: `IBladeStack` (Low-Level)

The blade stack state machine. Accessed via `inject(BladeStackKey)` or `useBladeStack()`. Most developers should use `useBlade()` instead.

### Computed Properties

| Property | Type | Description |
|----------|------|-------------|
| `workspace` | `ComputedRef<BladeDescriptor \| undefined>` | The root blade (index 0) |
| `blades` | `ComputedRef<readonly BladeDescriptor[]>` | Full ordered stack (including hidden blades) |
| `activeBlade` | `ComputedRef<BladeDescriptor \| undefined>` | The last visible blade |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `openWorkspace` | `(event: BladeOpenEvent) => Promise<void>` | Set the root blade. Closes all existing blades unconditionally. |
| `openBlade` | `(event: BladeOpenEvent & { parentId?: string }) => Promise<void>` | Open a child blade after a parent. Closes any blades deeper than the parent (with guard checks). |
| `closeBlade` | `(bladeId: string) => Promise<boolean>` | Close a blade and all its children. Returns `true` if a guard prevented closing. |
| `closeChildren` | `(parentId: string) => Promise<void>` | Close all blades after the given parent (deepest first). |
| `replaceCurrentBlade` | `(event: BladeOpenEvent & { parentId?: string }) => Promise<void>` | Destroy the active blade and create a new one at the same index with the same `parentId`. |
| `coverCurrentBlade` | `(event: BladeOpenEvent & { parentId?: string }) => Promise<void>` | Hide the active blade (`visible: false`) and open a new blade on top. Closing the new blade restores the hidden one. |
| `registerBeforeClose` | `(bladeId: string, guard: () => Promise<boolean>) => void` | Register a close guard. Return `true` to **prevent**, `false` to **allow**. |
| `unregisterBeforeClose` | `(bladeId: string) => void` | Remove a close guard. |
| `setBladeError` | `(bladeId: string, error: unknown) => void` | Set an error on a blade descriptor. |
| `clearBladeError` | `(bladeId: string) => void` | Clear a blade's error. |
| `setBladeTitle` | `(bladeId: string, title: string \| undefined) => void` | Update a blade's title in the descriptor. |

---

## API Reference: `IBladeMessaging` (Low-Level)

Inter-blade communication. Accessed via `inject(BladeMessagingKey)` or `useBladeMessaging()`. Most developers should use `useBlade()` — its `exposeToChildren` and `callParent` wrap this interface.

| Method | Signature | Description |
|--------|-----------|-------------|
| `exposeToChildren` | `(bladeId: string, methods: Record<string, Function>) => void` | Register methods that child blades can call. Keyed by blade ID. |
| `callParent` | `<T = unknown>(callerBladeId: string, method: string, args?: unknown) => Promise<T>` | Call a method exposed by the caller's parent blade (resolved via `parentId`). Returns the method's result, or `undefined` if the parent has no such method. |
| `cleanup` | `(bladeId: string) => void` | Remove exposed methods for a blade. Called automatically on blade close. |

---

## Types

### `BladeDescriptor`

Plain data object stored in the stack for each blade.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique instance ID (auto-generated at open time) |
| `name` | `string` | Registered component name (e.g. `"OrderDetails"`) |
| `url` | `string?` | URL segment for address bar sync (e.g. `"/order"`) |
| `param` | `string?` | Entity ID — appears in URL path |
| `query` | `Record<string, string>?` | Small key-value pairs — serialized to URL query params |
| `options` | `Record<string, unknown>?` | Large context data — stored in `history.state` only, not in URL |
| `parentId` | `string?` | ID of the blade that opened this one (`undefined` for workspace) |
| `visible` | `boolean` | Whether the blade is rendered (`false` when covered via `coverWith`) |
| `error` | `unknown?` | Error state for the error banner |
| `title` | `string?` | Dynamic title — populated from `defineExpose({ title })` |

### `BladeOpenEvent`

Event object for opening a blade.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Registered component name — resolved via blade registry |
| `param` | `string?` | Entity ID for the blade |
| `query` | `Record<string, string>?` | Small key-value pairs for URL query |
| `options` | `Record<string, unknown>?` | Large context data — stored in `history.state` only |
| `onOpen` | `() => void` | Called after the blade is opened |
| `onClose` | `() => void` | Called after the blade is closed |

### Injection Keys

| Key | Type | Description |
|-----|------|-------------|
| `BladeStackKey` | `InjectionKey<IBladeStack>` | The blade stack state machine |
| `BladeMessagingKey` | `InjectionKey<IBladeMessaging>` | Inter-blade messaging |
| `BladeDescriptorKey` | `InjectionKey<ComputedRef<BladeDescriptor>>` | Current blade's descriptor (provided by VcBladeSlot) |
| `BladeDataKey` | `InjectionKey<ComputedRef<Record>>` | Blade data (deprecated — use `BladeContextKey`) |
| `BladeContextKey` | `InjectionKey<ComputedRef<Record>>` | Blade context from `defineBladeContext` |

---

## Recipes

### Opening a Child Blade

The most common navigation pattern — opening a detail blade from a list:

```vue
<script setup lang="ts">
// ListBlade.vue
import { useBlade } from "@vc-shell/framework";

const { openBlade, exposeToChildren } = useBlade();

function openDetail(itemId: string) {
  openBlade({
    name: "ItemDetail",
    param: itemId,
    options: { source: "list" },
    onOpen: () => { selectedId.value = itemId; },
    onClose: () => { selectedId.value = undefined; reload(); },
  });
}

// Expose reload so child can call it
exposeToChildren({ reload: () => fetchData() });
</script>
```

### Calling Parent Methods from a Child Blade

```vue
<script setup lang="ts">
// DetailBlade.vue
import { useBlade } from "@vc-shell/framework";

const { callParent, closeSelf } = useBlade();

async function saveAndClose() {
  await api.save(item.value);
  // Tell parent to refresh its data
  await callParent("reload");
  await closeSelf();
}
</script>
```

### Exposing Methods to Children

Register methods that child blades can call. Call once in `setup()`.

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

const { exposeToChildren } = useBlade();

async function reload() { /* ... */ }
async function save() { /* ... */ }

exposeToChildren({ reload, save });

// title still needs defineExpose for VcBladeSlot propagation
defineExpose({ title: computed(() => `Order: ${param.value}`) });
</script>
```

### Before-Close Guard

Prevent a blade from closing when there are unsaved changes:

```vue
<script setup lang="ts">
import { useBlade, usePopup } from "@vc-shell/framework";

const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

onBeforeClose(async () => {
  if (isModified.value) {
    const confirmed = await showConfirmation("Discard unsaved changes?");
    return !confirmed; // true = PREVENT close, false = allow
  }
  return false; // allow close
});
</script>
```

### Replace vs Cover

Two ways to substitute the active blade:

**Replace** — destroy old blade, create new at same position. Use to "reload" with fresh data:

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
const { replaceWith } = useBlade();

await replaceWith({
  name: "OfferDetails",
  param: newId,
  options: { sellerProduct: currentProduct.value },
});
</script>
```

**Cover** — hide old blade, open new on top. Closing the new blade reveals the hidden one:

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
const { coverWith } = useBlade();

await coverWith({
  name: "ItemEditBlade",
  param: itemId,
});
</script>
```

| Method | Old blade | Stack size | Parent of new | URL | Use case |
|--------|-----------|------------|---------------|-----|----------|
| `replaceWith()` | Destroyed | Same | Same as old blade's parent | Replace (no history entry) | Reload / refresh |
| `coverWith()` | Hidden (`visible: false`) | +1 | The hidden blade | Push (new history entry) | Drill-down with back |

> **Legacy**: `openBlade({ replaceCurrentBlade: true })` maps to `coverWith` for backward compatibility.

### Error Management

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
const { setError, clearError } = useBlade();

try {
  await api.save(item.value);
  clearError();
} catch (e) {
  setError(e); // displays error banner in VcBlade header
}
</script>
```

### Sharing Data with Widgets (defineBladeContext)

```vue
<script setup lang="ts">
// In the blade:
import { defineBladeContext } from "@vc-shell/framework";

const item = ref<Order>();
const disabled = computed(() => !hasPermission.value);

defineBladeContext({ item, disabled });
</script>
```

```vue
<script setup lang="ts">
// In a widget rendered inside that blade:
import { injectBladeContext } from "@vc-shell/framework";

const ctx = injectBladeContext();
const order = computed(() => ctx.value.item as Order);
const isDisabled = computed(() => ctx.value.disabled as boolean);
</script>
```

### Opening a Blade from Outside (Dashboard, Notifications)

`useBlade()` works outside blade context — only navigation methods are available:

```vue
<script setup lang="ts">
// DashboardCard.vue — NOT inside a blade
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();

function goToOrder(orderId: string) {
  openBlade({ name: "OrderDetails", param: orderId });
}
</script>
```

---

## Features

- **Stacked panel navigation** with expand/collapse -- each blade can be expanded to full width or collapsed to show only its title
- **URL synchronization** -- blade state is reflected in the URL, supporting browser back/forward and deep linking
- **Breadcrumb trail** for navigating back through the stack (hidden blades excluded from breadcrumbs)
- **Mobile-responsive** with back-button navigation replacing the horizontal stack on small screens
- **Before-close guards** to prevent unsaved data loss (return `true` to prevent, `false` to allow)
- **Parent-child messaging** via `exposeToChildren` / `callParent` with typed return values
- **Blade registry** -- blades are registered by name and resolved dynamically, enabling lazy loading
- **Replace vs Cover** -- `replaceWith()` destroys and recreates; `coverWith()` hides and stacks on top
- **Error management** -- `setError()` / `clearError()` display error banners per blade
- **Blade data sharing** -- `defineBladeContext()` / `injectBladeContext()` for widgets and extensions

## Details

- **Stack model**: Blades form a linear stack. Opening a child pushes it; closing pops it. Only the rightmost blade is fully interactive; earlier blades are collapsed but stay mounted.
- **Hidden blades**: `coverWith()` sets `visible: false` on the covered blade. It remains in the stack with preserved state but is not rendered. Closing the covering blade restores visibility. Hidden blades are excluded from breadcrumbs.
- **Routing**: The stack is serialized into the URL. `replaceWith()` uses URL replace (no history entry); `coverWith()` pushes a new history entry.
- **Mobile**: On mobile, only one blade is visible. A back button replaces the breadcrumb trail.
- **Context requirement**: Identity, actions, communication, guards, and error methods require blade context (the component must be rendered by VcBladeSlot). Only `openBlade()` works outside blade context.

## Tips

- Use `useBlade()` for new code. The legacy `useBladeNavigation()` adapter is maintained for backward compatibility only.
- **Smart VcBlade**: Blade page components no longer need to declare `expanded`/`closable` props or `close:blade`/`expand:blade`/`collapse:blade`/`parent:call` emits. VcBlade reads these from `BladeDescriptor` automatically. Access `param` and `options` via `useBlade()` instead of props. The old pattern is still supported for existing blades.
- `exposeToChildren()` and `defineExpose()` serve different purposes: `exposeToChildren` registers methods for `callParent` messaging; `defineExpose` exposes `title` for VcBladeSlot propagation. Use both when needed.
- Guard convention: return `true` to **prevent** close, `false` to **allow**. This is the opposite of the legacy convention (where `false` prevented close). The adapter handles inversion automatically.
- `callParent` returns `undefined` silently if the parent hasn't exposed the requested method — no error is thrown.
- For cross-blade communication beyond parent-child, use `defineBladeContext` / `injectBladeContext` or a shared service rather than deeply nesting `callParent` chains.

## Related

- [VcBlade](../../ui/components/organisms/vc-blade/) -- individual blade panel (toolbar, header, content)
- [useBlade](../../../core/composables/useBlade/) -- primary blade composable
- [blade-nav composables](./composables/blade-nav-composables.docs.md) -- low-level stack & messaging docs
- [MIGRATION.md](./MIGRATION.md) -- migration guide from legacy API to `useBlade()`
- [COOKBOOK.md](./COOKBOOK.md) -- advanced patterns and recipes
- [ARCHITECTURE.md](./ARCHITECTURE.md) -- internal architecture details

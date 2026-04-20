# useBlade

Unified composable for blade navigation, identity, communication, guards, and error management in VC-Shell applications. This is the primary API for working with the blade navigation system -- the stacked panel paradigm (similar to Azure Portal) that drives every screen in a VC-Shell app.

`useBlade()` works **everywhere**: inside blades it provides the full API (identity, navigation, communication, guards, errors); outside blades (dashboard cards, notification templates, composables) it provides navigation only (`openBlade`). Blade-specific methods throw a descriptive runtime error if called outside blade context.

## When to Use

- Open, close, replace, or cover blades from any component (blade, dashboard widget, toolbar handler)
- Read blade identity (`param`, `options`, `id`) or register close guards inside a blade
- Communicate between parent and child blades via `callParent` / `exposeToChildren`
- When NOT to use: for low-level stack manipulation or custom navigation plugins -- use the blade-navigation composables (`useBladeStack`, `useBladeMessaging`) directly

## Quick Start

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

// Inside a blade -- full API is available
const { openBlade, closeSelf, param, onBeforeClose } = useBlade();

// Open a child blade
await openBlade({ name: "OrderDetails", param: "order-123" });

// Read the parameter passed when this blade was opened
console.log(param.value); // "order-123"
</script>
```

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

// Outside a blade (e.g. dashboard widget) -- only navigation works
const { openBlade } = useBlade();

openBlade({ name: "OrderDetails", param: "order-123" });
</script>
```

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

// Typed options — no manual casting needed
interface BladeOptions {
  sellerProduct?: SellerProduct;
}
const { param, options, callParent } = useBlade<BladeOptions>();

console.log(options.value?.sellerProduct); // typed as SellerProduct | undefined
</script>
```

## API Reference

### Import

```typescript
import { useBlade } from "@vc-shell/framework";

const blade = useBlade();
```

### Parameters

`useBlade()` takes no parameters. Context is resolved automatically via Vue's provide/inject system.

### Type Parameter

`useBlade<TOptions>()` accepts an optional generic to type the `options` computed ref:

```typescript
interface MyOptions {
  productId: string;
  mode: "edit" | "create";
}
const { options } = useBlade<MyOptions>();
// options.value is MyOptions | undefined — no manual casting needed
```

Without the generic, `options.value` defaults to `Record<string, unknown> | undefined`.

### Returns: `UseBladeReturn`

#### Identity Properties (blade context required)

These are reactive `ComputedRef` values that reflect the current blade's state. Accessing them outside blade context throws a runtime error.

| Property   | Type                                               | Description                                                                                                                                                |
| ---------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | `ComputedRef<string>`                              | The current blade's unique ID within the blade stack                                                                                                       |
| `param`    | `ComputedRef<string \| undefined>`                 | Route parameter passed when the blade was opened                                                                                                           |
| `options`  | `ComputedRef<TOptions \| undefined>`               | Additional options object passed to the blade. Type is `Record<string, unknown>` by default; provide a generic to get a typed ref: `useBlade<MyOptions>()` |
| `query`    | `ComputedRef<Record<string, string> \| undefined>` | URL query parameters scoped to this blade                                                                                                                  |
| `closable` | `ComputedRef<boolean>`                             | `true` when this blade has a parent (i.e., can be closed)                                                                                                  |
| `expanded` | `ComputedRef<boolean>`                             | `true` when this blade is the active (rightmost) blade                                                                                                     |
| `name`     | `ComputedRef<string>`                              | The blade's registered component name                                                                                                                      |

#### Navigation Methods (work everywhere)

| Method      | Signature                                                              | Description                                                                                 |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `openBlade` | `(event: BladeOpenEvent & { isWorkspace?: boolean }) => Promise<void>` | Open a blade as a child of the current blade, or as a workspace root if `isWorkspace: true` |

#### Action Methods (blade context required)

| Method          | Signature                                  | Description                                                                                                    |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `closeSelf`     | `() => Promise<boolean>`                   | Close the current blade. Returns `true` if a guard prevented closure. Respects `onBeforeClose` guards.         |
| `closeChildren` | `() => Promise<void>`                      | Close all child blades of the current blade                                                                    |
| `replaceWith`   | `(event: BladeOpenEvent) => Promise<void>` | Replace the current blade with a different one in the same position (destroys the old blade)                   |
| `coverWith`     | `(event: BladeOpenEvent) => Promise<void>` | Cover the current blade — hides it and opens a new blade on top. Closing the new blade reveals the hidden one. |

#### Communication Methods (blade context required)

| Method             | Signature                                                            | Description                                                |
| ------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `callParent`       | `<T = unknown>(method: string, args?: unknown) => Promise<T>`        | Invoke a method exposed by the parent blade                |
| `exposeToChildren` | `(methods: Record<string, (...args: unknown[]) => unknown>) => void` | Expose methods that child blades can call via `callParent` |

#### Guards and Errors (blade context required)

| Method          | Signature                                 | Description                                     |
| --------------- | ----------------------------------------- | ----------------------------------------------- |
| `onBeforeClose` | `(guard: () => Promise<boolean>) => void` | Register a guard that can prevent blade closure |
| `setError`      | `(error: unknown) => void`                | Display an error banner on the blade            |
| `clearError`    | `() => void`                              | Clear the blade error banner                    |

#### Banner Management (blade context required)

| Method         | Signature                                                    | Description                                                             |
| -------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `addBanner`    | `(options: Omit<IBladeBanner, "id" \| "_system">) => string` | Add a custom banner to the blade. Returns the banner's unique ID.       |
| `removeBanner` | `(id: string) => void`                                       | Remove a specific banner by its ID                                      |
| `clearBanners` | `() => void`                                                 | Remove all custom banners (system error/modified banners are preserved) |

#### Lifecycle Hooks (blade context required)

| Method          | Signature                        | Description                                                                                                                      |
| --------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `onActivated`   | `(callback: () => void) => void` | Register a callback fired when this blade becomes the active (rightmost) blade. Only fires on transitions, not on initial mount. |
| `onDeactivated` | `(callback: () => void) => void` | Register a callback fired when this blade loses active status (another blade opens on top).                                      |

> **Note:** Each hook can only be registered once per `useBlade()` call. A second registration logs a warning and is ignored. Use `onMounted` for initial-mount logic — `onActivated` only fires on subsequent activations.

#### Deprecated

| Method             | Signature                                           | Description                                         |
| ------------------ | --------------------------------------------------- | --------------------------------------------------- |
| `provideBladeData` | `(data: MaybeRef<Record<string, unknown>>) => void` | **Deprecated.** Use `defineBladeContext()` instead. |

### BladeOpenEvent

The object passed to `openBlade`, `replaceWith`, and `coverWith`:

```typescript
interface BladeOpenEvent {
  /** Registered component name -- resolved via BladeRegistry */
  name: string;
  /** Entity ID for the blade (e.g., order ID, product ID) */
  param?: string;
  /** Small key-value pairs persisted in the URL query string */
  query?: Record<string, string>;
  /** Large context data -- stored in history.state only, not in URL */
  options?: Record<string, unknown>;
  /** Called after the blade finishes opening */
  onOpen?: () => void;
  /** Called after the blade is closed */
  onClose?: () => void;
}
```

---

## Features

### Opening Blades

Use `openBlade` to navigate to a new blade. Inside a blade, the new blade opens as a child; outside, it opens relative to the currently active blade.

```typescript
const { openBlade } = useBlade();

// Open by registered name with param
await openBlade({ name: "OrderDetails", param: "order-123" });

// With options and lifecycle callbacks
openBlade({
  name: "FulfillmentCenterDetails",
  param: centerId,
  options: { mode: "edit" },
  onOpen() {
    selectedItemId.value = centerId;
  },
  onClose() {
    selectedItemId.value = undefined;
  },
});

// Open as workspace (replaces entire blade stack)
await openBlade({ name: "SettingsWorkspace", isWorkspace: true });
```

### Closing Blades

```vue
<script setup lang="ts">
const { closeSelf, closeChildren } = useBlade();

// Close the current blade
await closeSelf();

// Close all children before doing something
await closeChildren();
</script>
```

> **Tip:** `closeSelf()` returns `true` if a close guard prevented the blade from closing, and `false` if the blade was successfully closed. Always check the return value when you need to take action after closure.

### Replacing the Current Blade

Replace the current blade with a different one, keeping the same position in the stack:

```vue
<script setup lang="ts">
const { replaceWith, coverWith } = useBlade();

// Switch from "create" mode to "edit" mode after saving (destroys the old blade)
async function onSaveNew(createdId: string) {
  await replaceWith({
    name: "ProductDetails",
    param: createdId,
  });
}

// Open a "preview" blade on top — closing it returns to the current blade
async function onPreview() {
  await coverWith({
    name: "ProductPreview",
    param: product.value.id,
  });
}
</script>
```

### Passing Data: `param` and `options`

Blades receive data through two channels:

- **`param`** -- A single string value, typically an entity ID. Appears in the URL for deep-linking support.
- **`options`** -- A key-value object for larger or structured data. Stored in `history.state`, not in the URL.

```vue
<!-- Parent blade (list) -->
<script setup lang="ts">
const { openBlade } = useBlade();

function onRowClick(orderId: string) {
  openBlade({
    name: "OrderDetails",
    param: orderId,
    options: { preloadedName: "My Order" },
  });
}
</script>
```

```vue
<!-- Child blade (details) -->
<script setup lang="ts">
const { param, options } = useBlade();

onMounted(async () => {
  // param.value === "order-123"
  if (param.value) {
    await loadOrder(param.value);
  }

  // options.value === { preloadedName: "My Order" }
  const preloaded = options.value?.preloadedName as string;
});
</script>
```

### Parent-Child Communication

The blade messaging system allows child blades to invoke methods exposed by their parent. This is the standard pattern for refreshing a list after saving in a details blade.

**Parent blade -- expose methods:**

```vue
<script setup lang="ts">
const { exposeToChildren } = useBlade();

async function reload() {
  await searchProducts(searchQuery.value);
}

function onItemClick(item: Product) {
  selectedItemId.value = item.id;
}

// Expose methods to children
exposeToChildren({ reload, onItemClick });
</script>
```

**Child blade -- call parent:**

```vue
<script setup lang="ts">
const { callParent, closeSelf } = useBlade();

async function onSave() {
  await saveProduct(product.value);

  // Tell parent to refresh its list
  await callParent("reload");

  // Close self after successful save
  await closeSelf();
}
</script>
```

> **Tip:** `callParent` is generic. If the parent method returns a value, you can type it:
>
> ```typescript
> const count = await callParent<number>("getOffersCount");
> ```

### Blade Guards and Lifecycle

Register a guard that runs before the blade closes. Return `true` to **prevent** closure, `false` to **allow** it.

```vue
<script setup lang="ts">
import { useBlade, usePopup } from "@vc-shell/framework";

const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

onBeforeClose(async () => {
  if (isModified.value) {
    // showConfirmation returns true if user confirms, false if cancelled
    const confirmed = await showConfirmation("Discard unsaved changes?");
    return !confirmed; // true = prevent close, false = allow close
  }
  return false; // allow close
});
</script>
```

> **Important:** The return value semantics are: `true` means "prevent closure" and `false` means "allow closure". This matches the convention used by Vue Router's `beforeRouteLeave`.

### Blade Identity

```typescript
const { id, name, param, expanded, closable, onActivated, onDeactivated } = useBlade();

useWidgets(id.value, widgetDefs); // blade ID for scoped operations

// React to blade activation/deactivation (transitions only, not initial mount)
onActivated(() => {
  // blade became the rightmost (active) blade — e.g., refresh data
});

onDeactivated(() => {
  // another blade opened on top — e.g., pause polling
});
```

### Error Management

Display or clear error banners on the blade:

```vue
<script setup lang="ts">
const { setError, clearError } = useBlade();

async function loadData() {
  try {
    clearError();
    await fetchData();
  } catch (e) {
    setError(e); // Shows error banner on the blade
  }
}
</script>
```

### Banner Management

Add custom banners (info, warning, danger, success) to the top of a blade. Banners appear between the header and toolbar, sorted by severity: danger > warning > info > success.

```vue
<script setup lang="ts">
import { h } from "vue";
import { useBlade } from "@vc-shell/framework";

const { addBanner, removeBanner, clearBanners } = useBlade();

// Simple text banner
const bannerId = addBanner({
  variant: "info",
  message: "This record is in read-only mode",
});

// Warning with dismiss button
addBanner({
  variant: "warning",
  message: "License expires in 7 days",
  dismissible: true,
});

// Banner with an action button
addBanner({
  variant: "success",
  message: "Import completed (42 items)",
  dismissible: true,
  action: {
    label: "View report",
    handler: () => openReport(),
  },
});

// Banner with custom render function
addBanner({
  variant: "info",
  render: () => h("span", ["Data synced from ", h("b", "Warehouse A"), " at 14:32"]),
});

// Remove a specific banner
removeBanner(bannerId);

// Clear all custom banners (system error/modified banners are preserved)
clearBanners();
</script>
```

#### IBladeBanner

The options object passed to `addBanner`:

| Property      | Type                                           | Default  | Description                                          |
| ------------- | ---------------------------------------------- | -------- | ---------------------------------------------------- |
| `variant`     | `"danger" \| "warning" \| "info" \| "success"` | required | Color scheme and default icon                        |
| `message`     | `string`                                       | --       | Plain text message                                   |
| `render`      | `() => VNode`                                  | --       | Custom render function (takes priority over message) |
| `dismissible` | `boolean`                                      | `false`  | Show a close button to dismiss the banner            |
| `icon`        | `string`                                       | --       | Override the default variant icon (lucide icon name) |
| `action`      | `{ label: string; handler: () => void }`       | --       | Action button displayed on the right side            |

> **Note:** `addBanner` returns a unique string ID. Use it with `removeBanner(id)` to programmatically remove a specific banner. `clearBanners()` removes all custom banners but preserves system banners (error and unsaved changes).

---

## Blade Context: defineBladeContext / injectBladeContext

For sharing reactive data from a blade to its descendant widgets, extensions, and nested components, use the `defineBladeContext` / `injectBladeContext` pair. This replaces the deprecated `provideBladeData`.

### defineBladeContext (in blade component)

Call in a blade's `<script setup>` to expose reactive data to all descendant components:

```vue
<script setup lang="ts">
import { defineBladeContext } from "@vc-shell/framework";

const item = ref<Order | undefined>();
const loading = ref(false);

// Expose to widgets and nested components
defineBladeContext({ item, loading });

// Or selectively expose via computed
defineBladeContext(computed(() => ({ id: item.value?.id })));
</script>
```

### injectBladeContext (in widget / nested component)

```vue
<script setup lang="ts">
import { injectBladeContext } from "@vc-shell/framework";

const ctx = injectBladeContext();
// Returns ComputedRef<Record<string, unknown>>

const orderId = computed(() => ctx.value.id as string);
const isLoading = computed(() => ctx.value.loading as boolean);
</script>
```

> **When to use which:**
>
> - `defineBladeContext` / `injectBladeContext` -- for sharing data with **child widgets and nested components** within the same blade's component tree (via provide/inject).
> - `callParent` / `exposeToChildren` -- for **cross-blade communication** between parent and child blades in the blade stack.

---

## Recipes

### Recipe 1: List-to-Details Navigation

The most common pattern: a list workspace that opens a details blade on row click.

```vue
<!-- ProductsList.vue -->
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

defineOptions({ name: "ProductsList", url: "/products", isWorkspace: true });

const { openBlade } = useBlade();
const selectedItemId = ref<string>();

function onRowClick(event: { data: { id?: string } }) {
  openBlade({
    name: "ProductDetails",
    param: event.data.id,
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

async function reload() {
  await searchProducts();
}

// Expose reload so child blades can callParent("reload")
defineExpose({ reload, title: "Products" });
</script>
```

### Recipe 2: Details Blade That Refreshes Parent on Save

```vue
<!-- ProductDetails.vue -->
<script setup lang="ts">
import { useBlade, usePopup } from "@vc-shell/framework";

defineOptions({ name: "ProductDetails", url: "/product-details" });

const { param, onBeforeClose, closeSelf, callParent } = useBlade();
const { showConfirmation } = usePopup();

onMounted(async () => {
  if (param.value) await loadProduct(param.value);
});

async function onSave() {
  await saveProduct(product.value);
  await callParent("reload");
  await closeSelf();
}

onBeforeClose(async () => {
  if (isModified.value) {
    return !(await showConfirmation("Discard unsaved changes?"));
  }
  return false;
});

defineExpose({ title });
</script>
```

> **Note:** The key change vs. the old pattern is removing `defineProps<{ expanded?: boolean; closable?: boolean; param?: string }>()` and reading `param` from `useBlade()` instead.

### Recipe 3: Multi-Level Blade Chain (List -> Details -> Sub-Details)

A "middle" blade that is both a child (calls parent) and a parent (exposes methods to its own children):

```vue
<!-- OrderDetails.vue -->
<script setup lang="ts">
import { useBlade, defineBladeContext } from "@vc-shell/framework";

const { openBlade, callParent, exposeToChildren, closeSelf } = useBlade();
const item = ref<Order>();

defineBladeContext({ item }); // share with widgets

async function reload() {
  await loadOrder(props.param!);
}
exposeToChildren({ reload }); // child ShipmentDetails can callParent("reload")

function openShipment(id: string) {
  openBlade({ name: "ShipmentDetails", param: id });
}

async function onDelete() {
  await deleteOrder(props.param!);
  await callParent("reload"); // tell grandparent list to refresh
  await closeSelf();
}
</script>
```

### Recipe 4: Toolbar Action and Dashboard Card

```vue
<!-- Toolbar: opening blade from a toolbar button -->
<script setup lang="ts">
const { openBlade } = useBlade();

const toolbar = ref<IBladeToolbar[]>([
  {
    id: "addItem",
    title: "Add Item",
    icon: "lucide-plus",
    clickHandler() {
      openBlade({ name: "ItemDetails" }); // no param = create mode
    },
  },
]);
</script>
```

```vue
<!-- Dashboard card: no blade context, only openBlade works -->
<script setup lang="ts">
const { openBlade } = useBlade();

function viewOrder(orderId: string) {
  openBlade({ name: "OrderDetails", param: orderId });
}

function goToOrders() {
  openBlade({ name: "OrdersList", isWorkspace: true });
}
</script>
```

---

## Common Mistakes

### Calling blade-specific methods outside blade context

```typescript
// BAD -- throws at runtime
const { closeSelf } = useBlade();
// Called from a dashboard widget (no blade context)
closeSelf(); // Error: closeSelf() requires blade context
```

```typescript
// GOOD -- only use methods that work everywhere
const { openBlade } = useBlade();
openBlade({ name: "OrderDetails", param: orderId });
```

### Forgetting to expose reload to children

```vue
<!-- BAD -- child calls callParent("reload") but parent never exposed it -->
<script setup lang="ts">
async function reload() {
  /* ... */
}
// Missing: exposeToChildren({ reload })
// or: defineExpose({ reload })
</script>
```

```vue
<!-- GOOD -- explicitly expose methods for children -->
<script setup lang="ts">
async function reload() {
  /* ... */
}
exposeToChildren({ reload });
// Also expose title for breadcrumbs
defineExpose({ reload, title });
</script>
```

### Wrong return value in onBeforeClose guard

```typescript
// BAD -- returns true when you want to ALLOW closing
onBeforeClose(async () => {
  if (isDirty.value) {
    const userWantsToLeave = await showConfirmation("Discard?");
    return userWantsToLeave; // true means PREVENT close!
  }
  return true; // This prevents closing even when not dirty!
});
```

```typescript
// GOOD -- return false to allow, true to prevent
onBeforeClose(async () => {
  if (isDirty.value) {
    const userWantsToLeave = await showConfirmation("Discard?");
    return !userWantsToLeave; // negate: true=prevent, false=allow
  }
  return false; // not dirty, allow close
});
```

### Using provideBladeData instead of defineBladeContext

```typescript
// BAD -- deprecated API
const { provideBladeData } = useBlade();
provideBladeData({ item, loading });
```

```typescript
// GOOD -- use the dedicated function
import { defineBladeContext } from "@vc-shell/framework";
defineBladeContext({ item, loading });
```

### Accessing identity properties reactively without .value

```typescript
// BAD -- accesses the ComputedRef object, not the value
if (param) {
  /* always truthy -- it's a ComputedRef object */
}
```

```typescript
// GOOD -- access the reactive value
if (param.value) {
  /* correct -- checks the actual string */
}
```

---

## How It Works Under the Hood

1. **Plugin setup:** `BladeNavigationPlugin` (plugin-v2) installs a `BladeStack` and `BladeMessaging` singleton and provides them via Vue's dependency injection.
2. **Inside a blade:** `VcBladeSlot` provides a `BladeDescriptor` ref for each blade instance. `useBlade()` injects this descriptor to access identity, register guards, and set errors.
3. **Outside a blade:** `useBlade()` falls back to the singleton instances. Only `openBlade` works because it does not need a blade descriptor.
4. **URL sync:** When blades with a `url` property are opened or closed, `useBlade()` synchronizes the browser URL via `createUrlSync`, enabling deep linking and back/forward navigation.

---

## Related

| Resource                                                                  | Description                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`defineBladeContext` / `injectBladeContext`](../useBladeContext.docs.md) | Share reactive blade data with descendant widgets            |
| [`useBladeRegistry`](../useBladeRegistry/)                                | Look up registered blade components by name                  |
| [`VcBlade`](../../../ui/components/organisms/vc-blade/)                   | The blade UI shell component (header, toolbar, content area) |
| [`VcBladeNavigation`](../../../shared/components/blade-navigation/)       | The container component that renders the blade stack         |
| [`useToolbar`](../../../shared/composables/useToolbar/)                   | Dynamic toolbar management for blades                        |
| [`usePopup`](../../../shared/composables/usePopup/)                       | Confirmation dialogs, commonly used in close guards          |

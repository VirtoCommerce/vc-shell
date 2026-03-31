# VcBlade

The foundational container component of the VirtoCommerce admin shell. Blades are stacked panels -- inspired by the Azure Portal -- that form the primary navigation paradigm. Every screen in a vc-shell application is a blade.

## Why Blades?

Traditional admin panels use page-based routing: click a link, the entire viewport changes. Context is lost. Blades solve this by **stacking panels horizontally**. When a user clicks an item in a list, a details blade slides in from the right while the list remains visible. This preserves context, enables comparison, and supports deep drill-down workflows without losing your place.

```
+----------------+-------------------+---------------------+
|                |                   |                     |
|  Products      |  Product Details  |  Edit Variant       |
|  (workspace)   |  (child blade)    |  (grandchild blade) |
|                |                   |                     |
|  [list...]     |  Name: Widget     |  Color: Red         |
|  [list...]     |  SKU: WDG-001     |  Size: Large        |
|                |                   |                     |
+----------------+-------------------+---------------------+
```

| Aspect | Pages/Routes | Blades |
|--------|-------------|--------|
| Context | Lost on navigate | Parent remains visible |
| Data flow | Query params / store | `param`, `options`, `callParent` |
| Layout | Full viewport | Side-by-side panels |
| Depth | Flat (1 level) | Unlimited nesting |

## When to Use

| Scenario | Component |
|----------|-----------|
| Stacked panel with toolbar, header, and lifecycle | **VcBlade** |
| One-off confirmation or input dialog | [VcPopup](../../molecules/vc-popup/) |
| Full-page route without blade stack | Vue Router view |
| Scrollable content section inside a blade | [VcContainer](../../molecules/vc-container/) |

Use VcBlade for every screen in a vc-shell application -- it is the standard container that integrates with the navigation system, toolbar, breadcrumbs, and unsaved-changes guards. **Do not use** VcBlade for transient dialogs (use `VcPopup` / `usePopup()`) or for content areas that do not need their own header and close button.

## Quick Start

```vue
<template>
  <VcBlade title="My First Blade" icon="lucide-box" @close="$emit('close:blade')">
    <div class="tw-p-4">Hello from a blade!</div>
  </VcBlade>
</template>

<script setup lang="ts">
defineOptions({ name: "MyFirstBlade", url: "/my-first-blade" });
</script>
```

> **Tip:** Every blade needs a `name` in `defineOptions`. This is how other blades reference it: `openBlade({ name: "MyFirstBlade" })`. The `url` is optional and controls the URL segment.

## Blade Anatomy

A blade has four visual zones, rendered top-to-bottom:

```
+--------------------------------------+
|  [icon] Title / Subtitle     [close] |  <-- Header
|--------------------------------------|
|  [Save] [Delete] [Refresh]  [More >] |  <-- Toolbar
|--------------------------------------|
|  ** Status banners (stacked) **      |  <-- Status Banners
|--------------------------------------|
|                                      |
|         Content (default slot)       |  <-- Content Area
|                                      |
+--------------------------------------+
```

**Header** -- Displays `icon`, `title`, `subtitle`, close button, and expand/collapse controls. The `#actions` slot injects custom elements next to the title. On mobile, the header is hidden when only one blade is in the stack.

**Toolbar** -- Action buttons from the `toolbarItems` prop. Overflow items automatically collapse into a "More" dropdown (via `ResizeObserver`).

**Status Banners** -- Unified, priority-sorted banner area. System banners: yellow when `modified` is `true`, red when the blade has an error (via `setError()`). Custom banners can be added programmatically via `useBlade().addBanner()` — see [useBlade docs](../../../core/composables/useBlade/useBlade.docs.md#banner-management).

**Content Area** -- The `default` slot. Scrolls independently of header and toolbar.

## Creating a Blade Component

```vue
<template>
  <VcBlade
    :title="title"
    icon="lucide-tag"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="toolbar"
    :modified="hasChanges"
    :loading="isLoading"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Your content here -->
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBlade, type IBladeToolbar } from "@vc-shell/framework";

// Registration metadata
defineOptions({
  name: "OfferDetails",       // Required: unique blade name
  url: "/offer",              // Optional: URL segment
  routable: false,            // Optional: exclude from direct URL access
});

// Standard props injected by the navigation system
export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;             // Entity ID
  options?: { sellerProduct?: object };
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

export interface Emits {
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}
const emit = defineEmits<Emits>();

const { openBlade, closeSelf, callParent, onBeforeClose } = useBlade();

const title = computed(() => props.param ? "Edit Offer" : "New Offer");
const isLoading = ref(false);
const hasChanges = ref(false);

const toolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    clickHandler: () => save(),
    disabled: computed(() => !hasChanges.value),
  },
]);

// Expose title for breadcrumbs
defineExpose({ title });
</script>
```

### defineOptions Reference

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | **Required.** Unique blade identifier for `openBlade({ name: "..." })`. |
| `url` | `string` | URL path segment (e.g., `"/offers"` produces `/#/.../offers`). |
| `isWorkspace` | `boolean` | Marks blade as a workspace (root-level, not closable). |
| `routable` | `boolean` | When `false`, blade cannot be opened via direct URL navigation. |
| `menuItem` | `object` | Registers a sidebar menu entry: `{ id, title, icon, priority }`. |

### defineExpose

Always expose a `title` computed. The navigation system reads it for breadcrumbs. You can also expose methods that children call via `callParent`:

```ts
defineExpose({
  title,
  reload: () => loadData(),
});
```

## Opening Blades

```ts
const { openBlade } = useBlade();

// Basic
openBlade({ name: "ProductDetails", param: "product-123" });

// With options (not encoded in URL)
openBlade({
  name: "ProductDetails",
  param: "product-123",
  options: { mode: "edit", category: selectedCategory.value },
});

// With lifecycle hooks
openBlade({
  name: "ProductDetails",
  param: item.id,
  onOpen()  { selectedItemId.value = item.id; },
  onClose() { selectedItemId.value = undefined; },
});

// Open a workspace (replaces entire blade stack)
openBlade({ name: "SettingsWorkspace", isWorkspace: true });
```

> **Tip:** `openBlade` works everywhere -- inside blades, dashboard cards, notification templates. Inside a blade it opens a child; outside it opens relative to the active blade.

### Replacing the Current Blade

After creating an entity, replace the "New" blade with the "Edit" blade:

```ts
const { replaceWith } = useBlade();

async function save() {
  const newId = await createProduct(data);
  await replaceWith({ name: "ProductDetails", param: newId });
}
```

## Passing Data Between Blades

### param -- Entity Identifier

A single string (typically an entity ID), encoded in the URL:

```ts
openBlade({ name: "OrderDetails", param: order.id });

// In child blade
onMounted(async () => {
  if (props.param) await loadOrder(props.param);   // Existing
  else initNewOrder();                               // New
});
```

### options -- Rich Context Data

Arbitrary data stored in `history.state` only (NOT in URL). Use for large objects:

```ts
openBlade({
  name: "OfferDetails",
  param: offer.id,
  options: { sellerProduct: currentProduct.value, readOnly: true },
});
```

### query -- URL Query Parameters

Bookmarkable key-value pairs:

```ts
openBlade({ name: "ProductsList", query: { category: "electronics" } });

const { query } = useBlade();
const category = computed(() => query.value?.category);
```

## Parent-Child Communication

### Child Calls Parent

`callParent` invokes methods the parent exposed via `defineExpose`:

```ts
// Parent blade
defineExpose({ title: bladeTitle, reload: async () => loadProducts() });

// Child blade -- after saving
const { callParent } = useBlade();
await callParent("reload");

// callParent returns the method's return value
const count = await callParent<number>("getItemCount");
```

### Blade Context (for Widgets and Extensions)

Share reactive data with widgets rendered inside the blade:

```ts
import { defineBladeContext, injectBladeContext } from "@vc-shell/framework";

// In blade setup
defineBladeContext({ item: offer });

// In widget or nested component
const ctx = injectBladeContext();
const entityId = computed(() => ctx.value.item?.id);
```

## Blade Lifecycle

### Expanded / Collapsed

`expanded` indicates whether this blade is the active (rightmost) one. The navigation system manages it -- just pass through:

```vue
<VcBlade :expanded="expanded" @expand="$emit('expand:blade')" @collapse="$emit('collapse:blade')">
```

### Closing

```ts
const { closeSelf, closeChildren } = useBlade();

await closeSelf();         // Close this blade
await closeChildren();     // Close all children, keep this blade
```

### Preventing Close (Unsaved Changes Guard)

Return `true` to **prevent** closing, `false` to **allow** it:

```ts
const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

onBeforeClose(async () => {
  if (hasUnsavedChanges.value) {
    const confirmed = await showConfirmation("Discard unsaved changes?");
    return !confirmed;  // true = prevent close, false = allow
  }
  return false;
});
```

> **Important:** The semantics are "should we prevent closing?" -- `true` keeps the blade open, `false` allows it to close.

## Toolbar Integration

```ts
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("TOOLBAR.SAVE")),
    icon: "lucide-save",
    clickHandler: () => save(),
    disabled: computed(() => !modified.value),
  },
  {
    id: "delete",
    title: "Delete",
    icon: "lucide-trash-2",
    clickHandler: () => confirmDelete(),
    isVisible: computed(() => !!props.param),  // Only for existing entities
  },
]);
```

### IBladeToolbar Interface

```ts
interface IBladeToolbar {
  id?: string;
  title?: string | Ref<string> | ComputedRef<string>;
  icon?: string | (() => string);
  clickHandler?(): void;
  disabled?: boolean | ComputedRef<boolean>;
  isVisible?: boolean | Ref<boolean> | ComputedRef<boolean>
             | ((blade?: BladeDescriptor) => boolean);
  separator?: "left" | "right" | "both";
}
```

- `title`, `disabled`, and `isVisible` accept reactive values for dynamic toolbar behavior.
- Overflow items are moved to a "More" dropdown automatically.
- Use `separator` for visual dividers between toolbar groups.

## Loading State and Skeleton

`loading` shows skeleton placeholders for header, toolbar, and content:

```vue
<VcBlade title="Product Details" :loading="isLoading" :toolbar-items="toolbar">
  <ProductForm :data="product" />
</VcBlade>
```

> **Tip:** Content is hidden (not unmounted) while loading, so `onMounted` hooks still fire.

Merge multiple loading sources with `useLoading`:

```ts
import { useLoading } from "@vc-shell/framework";

const allLoading = useLoading(dataLoading, settingsLoading, languagesLoading);
```

## Unsaved Changes Indicator

`modified` shows a yellow dot in the header and a status banner:

```vue
<VcBlade title="Edit Product" :modified="hasChanges">
```

Combine with `onBeforeClose` and `useBeforeUnload` for full protection:

```ts
import { useBeforeUnload } from "@vc-shell/framework";
useBeforeUnload(hasChanges);  // Browser tab close warning
```

## Custom Banners

Add informational, warning, or success banners to a blade programmatically. Banners appear between the header and toolbar, sorted by severity.

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

const { addBanner, removeBanner, clearBanners } = useBlade();

// Info banner (e.g. read-only mode)
addBanner({ variant: "info", message: "This record is read-only" });

// Dismissible warning with action
addBanner({
  variant: "warning",
  message: "License expires in 7 days",
  dismissible: true,
  action: { label: "Renew", handler: () => openRenewal() },
});
</script>
```

Four variants are available: `danger`, `warning`, `info`, `success`. System banners (error and unsaved changes) are always present and cannot be removed by `clearBanners()`. For the full API reference, see [useBlade — Banner Management](../../../core/composables/useBlade/useBlade.docs.md#banner-management).

## Blade Width Control

```vue
<VcBlade :width="350">          <!-- Pixels (number) -->
<VcBlade width="50%">           <!-- CSS value (string) -->
<VcBlade>                       <!-- Default: "30%" -->
```

On mobile, width is forced to `100%`. When `expanded` is `true`, the blade fills all available space.

## Recipes

### Master-Detail (List + Details)

The most common vc-shell pattern. Key points from real-world usage (see `offers-list.vue` and `offers-details.vue`):

**List blade** -- Opens a details blade on row click, tracks selected item:
```ts
defineOptions({ name: "Offers", url: "/offers", isWorkspace: true });

const { openBlade } = useBlade();
const selectedItemId = ref<string>();

const onItemClick = (event: { data: Offer }) => {
  openBlade({
    name: "Offer",
    param: event.data.id,
    onOpen()  { selectedItemId.value = event.data.id; },
    onClose() { selectedItemId.value = undefined; },
  });
};

// Expose reload for child to call after save
defineExpose({ title: bladeTitle, reload });
```

**Details blade** -- Loads entity, saves, notifies parent, replaces self on create:
```ts
defineOptions({ name: "Offer", url: "/offer", routable: false });

const { callParent, replaceWith, onBeforeClose } = useBlade();

async function save() {
  if (props.param) {
    await updateOffer(offer.value);
  } else {
    await createOffer(offer.value);
    await replaceWith({ name: "Offer", param: offer.value.id });
  }
  await callParent("reload");
}

onBeforeClose(async () => {
  if (modified.value) return !(await showConfirmation("Discard?"));
  return false;
});

defineBladeContext({ item: offer });
useBeforeUnload(modified);
defineExpose({ title });
```

### Blade with Form Validation

Using `vee-validate` with `Field` components:

```vue
<VcBlade title="Create Offer" :toolbar-items="toolbar" :modified="modified">
  <VcContainer :no-padding="true">
    <VcForm class="tw-p-4 tw-space-y-4">
      <Field v-slot="{ errorMessage, handleChange, errors }"
        :model-value="offer.name" name="name" rules="required">
        <VcInput v-model="offer.name" label="Name" required
          :error="!!errors.length" :error-message="errorMessage"
          @update:model-value="handleChange" />
      </Field>
    </VcForm>
  </VcContainer>
</VcBlade>
```

```ts
const { meta } = useForm({ validateOnMount: false });

const toolbar = ref([{
  id: "save",
  title: "Save",
  icon: "lucide-save",
  clickHandler: () => meta.value.valid ? save() : showError("Fix validation errors."),
  disabled: computed(() => !meta.value.valid || !modified.value),
}]);
```

### Blade with Data Table

```vue
<VcBlade :title="$t('ORDERS.LIST.TITLE')" icon="lucide-file-text" width="50%"
  :expanded="expanded" :closable="closable" :toolbar-items="toolbar">
  <VcDataTable
    v-model:sort-field="sortField" v-model:sort-order="sortOrder"
    v-model:search-value="searchValue" v-model:active-item-id="selectedItemId"
    :items="orders" :loading="loading" :searchable="true"
    :pagination="{ currentPage, pages }" :total-count="totalCount"
    state-key="orders_list" @row-click="onItemClick">
    <VcColumn id="number" title="Order #" :sortable="true" :always-visible="true" />
    <VcColumn id="customerName" title="Customer" :sortable="true" />
    <VcColumn id="createdDate" title="Date" type="date-ago" :sortable="true" />
    <VcColumn id="status" title="Status" type="status-icon" :always-visible="true" />
  </VcDataTable>
</VcBlade>
```

## Common Mistakes

### Missing blade name

```ts
// WRONG -- openBlade({ name: "ProductDetails" }) will fail
defineOptions({});

// CORRECT
defineOptions({ name: "ProductDetails", url: "/product" });
```

### Forgetting to expose the title

```ts
// WRONG -- Breadcrumbs show nothing
const title = computed(() => product.value?.name);

// CORRECT
defineExpose({ title });
```

### Wrong onBeforeClose return value

```ts
// WRONG -- true from showConfirmation PREVENTS close
onBeforeClose(async () => await showConfirmation("Discard?"));

// CORRECT -- negate confirmation result
onBeforeClose(async () => !(await showConfirmation("Discard?")));
```

### Using blade-specific methods outside a blade

```ts
// WRONG -- closeSelf() throws outside blade context
const { closeSelf } = useBlade();
closeSelf();

// CORRECT -- only openBlade works everywhere
const { openBlade } = useBlade();
openBlade({ name: "ProductsList" });
```

### Not passing expanded/closable through

```vue
<!-- WRONG -- hardcoded, ignores navigation system -->
<VcBlade :expanded="true" :closable="true">

<!-- CORRECT -- pass props from navigation -->
<VcBlade :expanded="expanded" :closable="closable">
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Title text in the blade header. |
| `subtitle` | `string` | `undefined` | Secondary text below the title. |
| `icon` | `string` | `undefined` | Icon name (e.g., `"lucide-box"`) displayed before the title. |
| `width` | `number \| string` | `"30%"` | Blade width. Numbers are pixels; strings are CSS values. |
| `expanded` | `boolean` | `false` | Whether the blade fills all available width. |
| `closable` | `boolean` | `true` | Whether the close button is shown. |
| `toolbarItems` | `IBladeToolbar[]` | `[]` | Action buttons in the toolbar zone. |
| `modified` | `boolean` | `undefined` | Shows unsaved changes indicator and banner. |
| `loading` | `boolean` | `false` | Shows skeleton placeholders for all blade zones. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | -- | Close button clicked. Re-emit as `close:blade`. |
| `expand` | -- | Blade expanded. Re-emit as `expand:blade`. |
| `collapse` | -- | Blade collapsed. Re-emit as `collapse:blade`. |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main scrollable content area. |
| `actions` | Custom elements in the header, right of the title. |

## CSS Custom Properties

```css
:root {
  --blade-background-color: var(--additional-50);
  --blade-border-color: var(--neutrals-200);
  --blade-shadow-color: var(--primary-700);
  --blade-shadow: 2px 2px 8px rgb(from var(--blade-shadow-color) r g b / 14%);
  --blade-color-error: var(--danger-500);
  --blade-color-unsaved-changes: var(--secondary-600);
  --blade-text-color: var(--additional-50);
}
```

## Accessibility

- `role="region"` with `aria-labelledby` pointing to the title element.
- `aria-label` fallback when title is unavailable (during loading).
- Close button is keyboard-accessible.
- Unique `blade-title-{uid}` ID for ARIA labeling.

## Mobile Behavior

- Width forced to `100%` regardless of prop value.
- Header hidden when only one blade is in the stack.
- Toolbar rendered as a floating pill at the bottom.
- Back button replaces close button for stack navigation.

## Related

| Resource | Description |
|----------|-------------|
| `useBlade()` | Unified composable: identity, navigation, communication, guards, error management. |
| `defineBladeContext()` / `injectBladeContext()` | Provide/inject reactive data for widgets and extensions. |
| `VcBladeNavigation` | Manages blade stack and horizontal scroll (part of `vc-app.vue`). |
| `IBladeToolbar` | TypeScript interface for toolbar button definitions. |
| `useBeforeUnload()` | Browser tab close warning for unsaved changes. |
| `useLoading()` | Merges multiple loading refs into a single boolean. |
| `usePopup()` | Confirmation dialogs and error messages. |
| `useBladeWidgets()` | Register contextual widgets for the blade widget area. |

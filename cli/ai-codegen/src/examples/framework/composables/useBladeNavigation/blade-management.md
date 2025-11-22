---
id: useBladeNavigation-blade-management
type: FRAMEWORK_API
category: composable
tags: [composable, blade-navigation, workspace, routing]
title: "useBladeNavigation - Blade Management"
description: "Open, close, and manage blade navigation programmatically"
---

# useBladeNavigation - Blade Management

The `useBladeNavigation` composable provides the primary API for programmatic control over VC-Shell's blade-based navigation system, enabling hierarchical UI where screens open side-by-side.

## Overview

- Open blades programmatically
- Manage workspace blades
- Close blades with lifecycle hooks
- Prevent blade closure (unsaved changes)
- Navigate with URL query parameters
- Deep linking support
- Resolve blades by name

## Basic Blade Opening

```vue
<template>
  <VcBlade title="Product List">
    <VcTable
      :items="products"
      :columns="columns"
      @item-click="viewProductDetails"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";
import ProductDetailsBlade from "./ProductDetailsBlade.vue";

const { openBlade } = useBladeNavigation();

const products = ref([
  { id: "prod-1", name: "Laptop", price: 999 },
  { id: "prod-2", name: "Mouse", price: 29 }
]);

const columns = [
  { id: "name", field: "name", title: "Product" },
  { id: "price", field: "price", title: "Price" }
];

function viewProductDetails(product: any) {
  openBlade({
    blade: ProductDetailsBlade,
    param: product.id,
    options: {
      productName: product.name,
      readonly: false
    },
    onOpen: () => {
      console.log(`Details blade opened for: ${product.name}`);
    },
    onClose: () => {
      console.log(`Details blade closed for: ${product.name}`);
    }
  });
}
</script>
```

## Open Blade by Registered Name

```vue
<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";

const { openBlade } = useBladeNavigation();

// Open blade using its registered name
function openOfferDetails(offerId: string) {
  openBlade({
    blade: { name: "OfferDetailsBlade" },
    param: offerId,
    options: {
      mode: "edit"
    }
  });
}

// Open workspace by name
function openSettingsWorkspace() {
  openBlade({
    blade: { name: "SettingsWorkspace" }
  }, true); // Second argument = true indicates workspace
}
</script>
```

## Workspace Management

```vue
<template>
  <div class="tw-flex tw-gap-2">
    <VcButton @click="openDashboard">Dashboard</VcButton>
    <VcButton @click="openProducts">Products</VcButton>
    <VcButton @click="openOrders">Orders</VcButton>
    <VcButton @click="openSettings">Settings</VcButton>
  </div>
</template>

<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";

const { openBlade } = useBladeNavigation();

// Open different workspaces
// Opening a workspace closes all other blades and becomes the new root

function openDashboard() {
  openBlade({
    blade: { name: "DashboardWorkspace" }
  }, true);
}

function openProducts() {
  openBlade({
    blade: { name: "ProductsWorkspace" },
    options: { initialView: "grid" }
  }, true);
}

function openOrders() {
  openBlade({
    blade: { name: "OrdersWorkspace" }
  }, true);
}

function openSettings() {
  openBlade({
    blade: { name: "SettingsWorkspace" }
  }, true);
}
</script>
```

## Blade Component Definition

```vue
<!-- ProductDetailsBlade.vue -->
<template>
  <VcBlade
    :title="bladeTitle"
    :toolbar-items="toolbarItems"
  >
    <div class="tw-p-4">
      <div v-if="loading">Loading...</div>

      <div v-else-if="product">
        <h2>{{ product.name }}</h2>
        <p>Price: ${{ product.price }}</p>
        <p>Stock: {{ product.stock }}</p>

        <VcButton @click="openEditMode">Edit Product</VcButton>
      </div>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useBladeNavigation, VcBlade, VcButton } from "@vc-shell/framework";
import ProductEditBlade from "./ProductEditBlade.vue";

// Standard blade props
interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string; // Product ID
  options?: {
    productName?: string;
    readonly?: boolean;
  };
}

const props = defineProps<Props>();

// Blade metadata
defineOptions({
  name: "ProductDetailsBlade",
  url: "/product-details"
});

const { openBlade } = useBladeNavigation();

const loading = ref(false);
const product = ref<any>(null);

const bladeTitle = computed(() =>
  product.value
    ? `Product: ${product.value.name}`
    : "Product Details"
);

const toolbarItems = ref([
  {
    id: "refresh",
    title: "Refresh",
    icon: "material-refresh",
    clickHandler: () => loadProduct()
  }
]);

async function loadProduct() {
  if (!props.param) return;

  loading.value = true;

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  product.value = {
    id: props.param,
    name: props.options?.productName || `Product ${props.param}`,
    price: 299.99,
    stock: 50
  };

  loading.value = false;
}

function openEditMode() {
  openBlade({
    blade: ProductEditBlade,
    param: props.param,
    options: {
      product: product.value
    }
  });
}

onMounted(() => {
  loadProduct();
});
</script>
```

## Close Blades Programmatically

```vue
<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";

const { closeBlade, blades } = useBladeNavigation();

// Close the last blade
function closeLastBlade() {
  if (blades.value.length > 0) {
    closeBlade(blades.value.length - 1);
  }
}

// Close all blades after workspace (index 0)
function closeAllChildBlades() {
  if (blades.value.length > 1) {
    closeBlade(1); // Closes from index 1 onwards
  }
}

// Close blade at specific index
async function closeBladeAt(index: number) {
  const prevented = await closeBlade(index);

  if (prevented) {
    console.log("Blade closure was prevented (unsaved changes?)");
  } else {
    console.log("Blade closed successfully");
  }
}
</script>
```

## Prevent Blade Closure

```vue
<!-- ProductEditorBlade.vue -->
<template>
  <VcBlade
    title="Edit Product"
    :toolbar-items="toolbarItems"
  >
    <div class="tw-p-4">
      <VcInput
        v-model="productName"
        label="Product Name"
        @input="markModified"
      />

      <VcInput
        v-model="productPrice"
        label="Price"
        type="number"
        @input="markModified"
      />

      <div v-if="isModified" class="tw-mt-4 tw-text-yellow-600">
        You have unsaved changes
      </div>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  useBladeNavigation,
  usePopup,
  VcBlade,
  VcInput
} from "@vc-shell/framework";

const { onBeforeClose, closeBlade, currentBladeNavigationData } = useBladeNavigation();
const { showConfirmation } = usePopup();

const productName = ref("Laptop");
const productPrice = ref("999");
const isModified = ref(false);

const toolbarItems = computed(() => [
  {
    id: "save",
    title: "Save",
    icon: "material-save",
    isDisabled: !isModified.value,
    clickHandler: () => saveChanges()
  },
  {
    id: "cancel",
    title: "Cancel",
    icon: "material-close",
    clickHandler: () => requestClose()
  }
]);

function markModified() {
  isModified.value = true;
}

async function saveChanges() {
  console.log("Saving:", { productName: productName.value, productPrice: productPrice.value });

  // Simulate save
  await new Promise(resolve => setTimeout(resolve, 500));

  isModified.value = false;
  console.log("Saved successfully");
}

async function requestClose() {
  if (currentBladeNavigationData.value) {
    await closeBlade(currentBladeNavigationData.value.idx);
  }
}

// Prevent closure if unsaved changes
onBeforeClose(async () => {
  if (isModified.value) {
    const confirmed = await showConfirmation(
      "Unsaved Changes",
      "You have unsaved changes. Are you sure you want to close without saving?"
    );

    // Return true to PREVENT closing, false to ALLOW
    return !confirmed;
  }

  return false; // No unsaved changes, allow closing
});
</script>
```

## Navigation Query Parameters

```vue
<template>
  <VcBlade title="Product List">
    <div class="tw-p-4 tw-space-y-4">
      <div class="tw-flex tw-gap-4">
        <VcInput
          v-model="filters.searchTerm"
          placeholder="Search products..."
          @input="updateQueryAndFetch"
        />

        <VcSelect
          v-model="filters.category"
          :options="categoryOptions"
          placeholder="Category"
          @update:model-value="updateQueryAndFetch"
        />

        <VcSelect
          v-model="filters.sortBy"
          :options="sortOptions"
          placeholder="Sort by"
          @update:model-value="updateQueryAndFetch"
        />
      </div>

      <VcTable :items="products" :columns="columns" />
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";

const { setNavigationQuery, getNavigationQuery } = useBladeNavigation();

const filters = reactive({
  searchTerm: "",
  category: null as string | null,
  sortBy: "name"
});

const categoryOptions = [
  { value: null, label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" }
];

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "date", label: "Date Added" }
];

const products = ref([]);
const columns = [
  { id: "name", field: "name", title: "Product" },
  { id: "category", field: "category", title: "Category" },
  { id: "price", field: "price", title: "Price" }
];

// Load filters from URL on mount
onMounted(() => {
  const query = getNavigationQuery();

  if (query) {
    filters.searchTerm = String(query.searchTerm || "");
    filters.category = query.category ? String(query.category) : null;
    filters.sortBy = query.sortBy ? String(query.sortBy) : "name";
  }

  fetchProducts();
});

function updateQueryAndFetch() {
  // Update URL query parameters
  const queryToSet: Record<string, string | number> = {
    sortBy: filters.sortBy
  };

  if (filters.searchTerm) {
    queryToSet.searchTerm = filters.searchTerm;
  }

  if (filters.category) {
    queryToSet.category = filters.category;
  }

  setNavigationQuery(queryToSet);

  // Fetch products with new filters
  fetchProducts();
}

async function fetchProducts() {
  console.log("Fetching products with filters:", filters);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));

  products.value = [
    { id: "1", name: "Laptop", category: "electronics", price: 999 },
    { id: "2", name: "Book", category: "books", price: 19 }
  ].filter(p => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.searchTerm && !p.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });
}
</script>
```

## Resolve Blade by Name

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";

const { resolveBladeByName, openBlade } = useBladeNavigation();

const availableBlades = ref<string[]>([]);

onMounted(() => {
  // Check which blades are available
  const bladeNames = [
    "ProductDetailsBlade",
    "OfferDetailsBlade",
    "OrderDetailsBlade",
    "SettingsWorkspace"
  ];

  availableBlades.value = bladeNames.filter(name => {
    const blade = resolveBladeByName(name);
    return blade !== undefined;
  });

  console.log("Available blades:", availableBlades.value);
});

function openBladeByName(bladeName: string, param?: string) {
  const bladeComponent = resolveBladeByName(bladeName);

  if (bladeComponent) {
    openBlade({
      blade: bladeComponent,
      param
    });
  } else {
    console.error(`Blade not found: ${bladeName}`);
  }
}
</script>
```

## Replace Current Blade

```vue
<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";
import AlternativeViewBlade from "./AlternativeViewBlade.vue";

const { openBlade } = useBladeNavigation();

// Replace current blade with a new one
function switchToAlternativeView() {
  openBlade({
    blade: AlternativeViewBlade,
    param: "same-item-id",
    options: {
      viewMode: "alternative"
    },
    replaceCurrentBlade: true // Replaces instead of stacking
  });
}
</script>
```

## Access Current Blade Data

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";

const { currentBladeNavigationData, blades } = useBladeNavigation();

// Access current blade information
const currentBladeIndex = computed(() =>
  currentBladeNavigationData.value?.idx
);

const isCurrentBladeVisible = computed(() =>
  currentBladeNavigationData.value?.isVisible
);

const totalBlades = computed(() => blades.value.length);

// Log blade information
function logBladeInfo() {
  console.log("Current blade index:", currentBladeIndex.value);
  console.log("Is visible:", isCurrentBladeVisible.value);
  console.log("Total blades:", totalBlades.value);
}
</script>
```

## Navigate to Root

```vue
<script setup lang="ts">
import { useRouter } from "vue-router";
import { useBladeNavigation } from "@vc-shell/framework";

const router = useRouter();
const { goToRoot } = useBladeNavigation();

// Navigate to application root
function navigateHome() {
  const rootRoute = goToRoot();
  router.push(rootRoute);
}
</script>
```

## Lifecycle Hooks

```vue
<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";
import DetailsBlade from "./DetailsBlade.vue";

const { openBlade } = useBladeNavigation();

function openWithLifecycleHooks(itemId: string) {
  openBlade({
    blade: DetailsBlade,
    param: itemId,

    // Called after blade is mounted
    onOpen: () => {
      console.log("Blade opened and mounted");
      // Track analytics, initialize timers, etc.
    },

    // Called after blade is unmounted
    onClose: () => {
      console.log("Blade closed and unmounted");
      // Cleanup, save state, etc.
    },

    // Called before blade closes (can prevent closure)
    onBeforeClose: async () => {
      console.log("Blade is about to close");
      // Check for unsaved changes
      const hasChanges = checkForUnsavedChanges();

      if (hasChanges) {
        const confirmed = await confirmClose();
        return !confirmed; // true = prevent, false = allow
      }

      return false; // Allow closing
    }
  });
}
</script>
```

## API Reference

```typescript
interface IBladeEvent<T extends Component = Component> {
  // Component definition or registered name
  blade: Component | { name: string } | undefined;

  // Custom data for the blade
  options?: Record<string, any>;

  // URL parameter for the blade
  param?: string;

  // Hook called after blade is opened and mounted
  onOpen?: () => void;

  // Hook called after blade is closed and unmounted
  onClose?: () => void;

  // Hook called before blade closes (return true to prevent)
  onBeforeClose?: () => Promise<boolean | undefined>;

  // Replace current blade instead of stacking
  replaceCurrentBlade?: boolean;
}

interface IUseBladeNavigation {
  // Reactive array of all blades
  blades: ComputedRef<BladeVNode[]>;

  // Current workspace blade
  activeWorkspace: ComputedRef<BladeVNode | undefined>;

  // Current blade's navigation data
  currentBladeNavigationData: ComputedRef<any>;

  // Open a blade or workspace
  openBlade: <T extends Component>(
    args: IBladeEvent<T>,
    isWorkspace?: boolean
  ) => Promise<void | NavigationFailure>;

  // Close blades from index onwards
  closeBlade: (index: number) => Promise<boolean>;

  // Navigate to root route
  goToRoot: () => RouteLocationRaw;

  // Register onBeforeClose hook for current blade
  onBeforeClose: (cb: () => Promise<boolean | undefined>) => void;

  // Resolve blade component by name
  resolveBladeByName: (name: string) => Component | undefined;

  // Set workspace-scoped query parameters
  setNavigationQuery: (query: Record<string, string | number>) => void;

  // Get workspace-scoped query parameters
  getNavigationQuery: () => Record<string, string | number> | undefined;

  // Handle parent:call event from child blade
  onParentCall: (args: IParentCallArgs, currentBladeIndex?: number) => void;

  // Set error state for a blade
  setBladeError: (bladeIdx: number, error: unknown) => void;

  // Clear error state for a blade
  clearBladeError: (bladeIdx: number) => void;

  // Route resolver for deep linking
  routeResolver: (to: RouteLocationNormalized) => Promise<RouteLocationRaw | undefined> | RouteLocationRaw | undefined;
}
```

## Important Notes

### ✅ DO

- Use blade names registered via `createAppModule`
- Define `url` property for routable blades
- Use `onBeforeClose` for unsaved changes confirmation
- Clean up resources in `onClose` hooks
- Use workspace blades for main app sections
- Define standard blade props (expanded, closable, param, options)
- Emit standard blade events (close:blade, parent:call)

### ❌ DON'T

- Don't forget to register blades in module definition
- Don't open blades without proper error handling
- Don't ignore `onBeforeClose` return value
- Don't forget to clean up side effects
- Don't use global event buses instead of parent:call
- Don't create deeply nested blade hierarchies

## Common Patterns

### Open Detail Blade from List
```typescript
function viewItem(itemId: string) {
  openBlade({
    blade: { name: "ItemDetailsBlade" },
    param: itemId,
    onClose: () => refreshList()
  });
}
```

### Workspace Navigation
```typescript
function switchWorkspace(workspaceName: string) {
  openBlade({
    blade: { name: workspaceName }
  }, true);
}
```

### Unsaved Changes Protection
```typescript
onBeforeClose(async () => {
  if (isModified.value) {
    return !await confirmClose();
  }
  return false;
});
```

## See Also

- [parent-child-communication.md](./parent-child-communication.md) - Blade communication patterns
- [VcBlade Component](../../ui-components/vc-blade.md) - Blade UI component
- [useBreadcrumbs](../useBreadcrumbs/breadcrumb-navigation.md) - Breadcrumb navigation

**Reference:** [Official VC-Shell Documentation - useBladeNavigation](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/shared/components/blade-navigation/)

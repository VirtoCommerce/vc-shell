---
id: useBreadcrumbs-breadcrumb-navigation
type: FRAMEWORK_API
category: composable
tags: [composable, breadcrumbs, navigation, hierarchy]
title: "useBreadcrumbs - Breadcrumb Navigation"
description: "Create and manage navigational breadcrumb trails"
---

# useBreadcrumbs - Breadcrumb Navigation

The `useBreadcrumbs` composable manages breadcrumb navigation trails, providing users with a clear understanding of their location in the application hierarchy.

## Overview

- Create breadcrumb trails
- Navigate hierarchical data
- Dynamic breadcrumb updates
- Reactive titles with i18n
- Integration with VcTable
- Automatic duplicate prevention

## ⚠️ Important: Data-Driven Navigation Pattern

**Breadcrumbs in VC-Shell should NOT use `router.push()` for navigation.** Instead:

✅ **DO:** Use `clickHandler` to call data loading functions
```typescript
push({
  id: "catalog",
  title: computed(() => t("BREADCRUMBS.CATALOG")),
  clickHandler: async () => {
    await loadCategoryList({ catalogId: sellerId }, sellerId);
    return true;
  }
});
```

❌ **DON'T:** Use router navigation
```typescript
// WRONG - Don't do this!
clickHandler: () => {
  router.push({ name: "CategoryList" });
  return true;
}
```

This pattern ensures that breadcrumb navigation updates the view's data state rather than performing full page navigation.

## Basic Breadcrumb Setup

```vue
<template>
  <div>
    <VcBlade title="Content">
      <VcBreadcrumbs :items="breadcrumbs" class="tw-mb-4" />
      <div class="tw-p-4">
        <p>Current view content</p>
      </div>
    </VcBlade>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, VcBreadcrumbs, VcBlade } from "@vc-shell/framework";

const { t } = useI18n({ useScope: "global" });
const { breadcrumbs, push } = useBreadcrumbs();

async function loadHomeData() {
  console.log("Loading home data");
  // Load home view data
}

async function loadOffersData() {
  console.log("Loading offers data");
  // Load offers view data
}

onMounted(() => {
  // Initialize base breadcrumb
  push({
    id: "home",
    title: computed(() => t("BREADCRUMBS.HOME")),
    icon: "material-home",
    clickHandler: async () => {
      await loadHomeData();
      return true; // Remove subsequent breadcrumbs
    }
  });

  // Add current page breadcrumb
  push({
    id: "offers",
    title: computed(() => t("BREADCRUMBS.OFFERS")),
    icon: "material-local_offer",
    clickHandler: async () => {
      await loadOffersData();
      return true;
    }
  });
});
</script>
```

## Manual Breadcrumb Management

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useBreadcrumbs } from "@vc-shell/framework";

const { breadcrumbs, push, remove } = useBreadcrumbs();
const currentSection = ref<string | null>(null);

function navigateToSection(sectionId: string, sectionTitle: string) {
  currentSection.value = sectionId;

  push({
    id: sectionId,
    title: sectionTitle,
    clickHandler: () => {
      console.log(`Navigating to ${sectionId}`);

      // Find this breadcrumb's index
      const currentIndex = breadcrumbs.value.findIndex(b => b.id === sectionId);

      // Remove all breadcrumbs after it
      if (currentIndex !== -1 && currentIndex < breadcrumbs.value.length - 1) {
        const idsToRemove = breadcrumbs.value
          .slice(currentIndex + 1)
          .map(b => b.id);
        remove(idsToRemove);
      }

      return false;
    }
  });
}

// Navigate to specific sections
function goToDetails() {
  navigateToSection("details", "Details");
}

function goToSettings() {
  navigateToSection("settings", "Settings");
}
</script>

<template>
  <div>
    <VcBreadcrumbs :items="breadcrumbs" />

    <div class="tw-p-4 tw-space-x-2">
      <VcButton @click="goToDetails">View Details</VcButton>
      <VcButton @click="goToSettings">Open Settings</VcButton>
    </div>
  </div>
</template>
```

## Hierarchical Table Navigation

```vue
<template>
  <div>
    <VcBreadcrumbs :items="breadcrumbs" class="tw-mb-4" />

    <!-- @vue-generic {IItem} -->
    <VcTable
      :items="tableItems"
      :columns="columns"
      :loading="isLoading"
      @item-click="handleTableItemClick"
    >
      <template #item_name="{ item }">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon
            v-if="item.isNavigable"
            icon="material-folder"
            class="tw-text-blue-500"
          />
          <span>{{ item.name }}</span>
          <span v-if="item.isNavigable" class="tw-text-sm tw-text-gray-500">
            (Click to open)
          </span>
        </div>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  useBreadcrumbs,
  VcBreadcrumbs,
  VcTable,
  VcIcon,
  type ITableColumns
} from "@vc-shell/framework";

interface HierarchicalItem {
  id: string;
  name: string;
  isNavigable: boolean;
  parentId: string | null;
}

const { breadcrumbs, push } = useBreadcrumbs();

const isLoading = ref(false);
const tableItems = ref<HierarchicalItem[]>([]);
const currentLevelId = ref<string | null>(null);

const columns: ITableColumns[] = [
  {
    id: "name",
    field: "name",
    title: "Name",
    type: "slot",
    slotName: "item_name"
  }
];

// Load data for specific hierarchy level
async function loadDataForLevel(levelId: string | null): Promise<void> {
  isLoading.value = true;

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock hierarchical data
  if (levelId === null) {
    // Root level
    tableItems.value = [
      { id: "cat1", name: "Electronics", isNavigable: true, parentId: null },
      { id: "cat2", name: "Clothing", isNavigable: true, parentId: null }
    ];
  } else if (levelId === "cat1") {
    // Electronics category
    tableItems.value = [
      { id: "sub1", name: "Computers", isNavigable: true, parentId: "cat1" },
      { id: "sub2", name: "Phones", isNavigable: true, parentId: "cat1" }
    ];
  } else if (levelId === "sub1") {
    // Computers subcategory
    tableItems.value = [
      { id: "item1", name: "Laptop A", isNavigable: false, parentId: "sub1" },
      { id: "item2", name: "Desktop B", isNavigable: false, parentId: "sub1" }
    ];
  } else {
    tableItems.value = [];
  }

  isLoading.value = false;
}

// Navigate to specific level
async function navigateToLevel(levelId: string | null): Promise<void> {
  currentLevelId.value = levelId;
  await loadDataForLevel(levelId);
}

// Handle drilling down into navigable items
async function drillDownTo(item: HierarchicalItem): Promise<void> {
  if (!item.isNavigable) return;

  currentLevelId.value = item.id;

  push({
    id: item.id,
    title: item.name,
    clickHandler: async () => {
      await navigateToLevel(item.id);
      return true; // Remove subsequent breadcrumbs
    }
  });

  await loadDataForLevel(item.id);
}

function handleTableItemClick(item: HierarchicalItem) {
  if (item.isNavigable) {
    drillDownTo(item);
  }
}

onMounted(async () => {
  // Setup root breadcrumb
  push({
    id: "root",
    title: "All Categories",
    icon: "material-home",
    clickHandler: async () => {
      await navigateToLevel(null);
      return true;
    }
  });

  await loadDataForLevel(null);
});
</script>
```

## Dynamic Breadcrumbs with Data

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@vc-shell/framework";
import { useApiClient } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { t } = useI18n({ useScope: "global" });
const { breadcrumbs, push } = useBreadcrumbs();
const { getApiClient } = useApiClient(OffersClient);

const currentOffer = ref<any>(null);
const currentCategory = ref<any>(null);

async function loadOffersList() {
  console.log("Loading all offers");
  // Load offers list view
}

async function loadCategoryData(categoryId: string) {
  const client = await getApiClient();
  currentCategory.value = await client.getCategory(categoryId);
  console.log("Loading category data:", categoryId);
  // Load category view
}

async function loadOfferDetails(offerId: string) {
  const client = await getApiClient();
  currentOffer.value = await client.getOffer(offerId);
  console.log("Loading offer details:", offerId);
  // Load offer details view
}

async function loadOfferAndSetBreadcrumbs(offerId: string) {
  try {
    const client = await getApiClient();

    // Fetch offer data
    currentOffer.value = await client.getOffer(offerId);

    // Ensure base breadcrumbs exist
    if (!breadcrumbs.value.find(b => b.id === "offers")) {
      push({
        id: "offers",
        title: computed(() => t("OFFERS.BREADCRUMBS.ALL_OFFERS")),
        icon: "material-local_offer",
        clickHandler: async () => {
          await loadOffersList();
          return true;
        }
      });
    }

    // Add category breadcrumb if available
    if (currentOffer.value.categoryId) {
      currentCategory.value = await client.getCategory(
        currentOffer.value.categoryId
      );

      if (!breadcrumbs.value.find(b => b.id === currentCategory.value.id)) {
        push({
          id: currentCategory.value.id,
          title: computed(() => currentCategory.value?.name || t("OFFERS.BREADCRUMBS.CATEGORY")),
          clickHandler: async () => {
            await loadCategoryData(currentCategory.value.id);
            return true;
          }
        });
      }
    }

    // Add offer breadcrumb
    push({
      id: `offer-${currentOffer.value.id}`,
      title: computed(() => currentOffer.value?.name || t("OFFERS.BREADCRUMBS.OFFER")),
      icon: "material-description",
      clickHandler: async () => {
        await loadOfferDetails(currentOffer.value.id);
        return true;
      }
    });
  } catch (error) {
    console.error("Failed to load offer:", error);
  }
}

onMounted(() => {
  const offerId = "offer-123"; // In real app, get from props or route
  if (offerId) {
    loadOfferAndSetBreadcrumbs(offerId);
  }
});
</script>
```

## Breadcrumbs with i18n

```vue
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@vc-shell/framework";

const { t } = useI18n({ useScope: "global" });
const { push } = useBreadcrumbs();

async function loadHomePage() {
  console.log("Loading home page");
  // Load home page data
}

async function loadOffersList() {
  console.log("Loading offers list");
  // Load offers list data
}

onMounted(() => {
  // Home breadcrumb with i18n
  push({
    id: "home",
    title: computed(() => t("BREADCRUMBS.HOME")),
    icon: "material-home",
    clickHandler: async () => {
      await loadHomePage();
      return true;
    }
  });

  // Offers breadcrumb with i18n
  push({
    id: "offers",
    title: computed(() => t("BREADCRUMBS.OFFERS")),
    icon: "material-local_offer",
    clickHandler: async () => {
      await loadOffersList();
      return true;
    }
  });

  // Details breadcrumb with i18n
  push({
    id: "offer-details",
    title: computed(() => t("BREADCRUMBS.OFFER_DETAILS")),
    clickHandler: () => {
      return false; // Current page, don't clear
    }
  });
});
</script>
```

## Breadcrumb Navigation with Category Hierarchy

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@vc-shell/framework";

const { t } = useI18n({ useScope: "global" });
const { breadcrumbs, push } = useBreadcrumbs();

const currentView = ref<string>("catalog");

async function loadCatalogView() {
  currentView.value = "catalog";
  console.log("Loading catalog view");
  // Load catalog data
}

async function loadCategoryView(categoryId: string) {
  currentView.value = `category-${categoryId}`;
  console.log("Loading category:", categoryId);
  // Load category data
}

async function loadProductView(productId: string) {
  currentView.value = `product-${productId}`;
  console.log("Loading product:", productId);
  // Load product data
}

function setupCatalogBreadcrumb() {
  if (!breadcrumbs.value.find(b => b.id === "catalog")) {
    push({
      id: "catalog",
      title: computed(() => t("PRODUCTS.BREADCRUMBS.CATALOG")),
      icon: "material-folder",
      clickHandler: async () => {
        await loadCatalogView();
        return true; // Remove subsequent breadcrumbs
      }
    });
  }
}

function addCategoryBreadcrumb(categoryId: string, categoryName: string) {
  push({
    id: categoryId,
    title: categoryName,
    clickHandler: async () => {
      await loadCategoryView(categoryId);
      return true;
    }
  });
}

onMounted(() => {
  setupCatalogBreadcrumb();
});
</script>
```

## Conditional Breadcrumb Visibility

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePermissions } from "@vc-shell/framework";

const { t } = useI18n({ useScope: "global" });
const { push } = useBreadcrumbs();
const { hasAccess } = usePermissions();

const isAdmin = ref(false);

async function loadDashboard() {
  console.log("Loading dashboard");
  // Load dashboard data
}

async function loadAdminPanel() {
  console.log("Loading admin panel");
  // Load admin panel data
}

async function loadSettings() {
  console.log("Loading settings");
  // Load settings data
}

onMounted(() => {
  // Base breadcrumb
  push({
    id: "dashboard",
    title: computed(() => t("BREADCRUMBS.DASHBOARD")),
    clickHandler: async () => {
      await loadDashboard();
      return true;
    }
  });

  // Admin-only breadcrumb
  if (hasAccess("admin")) {
    push({
      id: "admin",
      title: computed(() => t("BREADCRUMBS.ADMIN_PANEL")),
      icon: "material-admin_panel_settings",
      clickHandler: async () => {
        await loadAdminPanel();
        return true;
      }
    });
  }

  // Conditional breadcrumb based on state
  if (isAdmin.value) {
    push({
      id: "settings",
      title: computed(() => t("BREADCRUMBS.SETTINGS")),
      icon: "material-settings",
      clickHandler: async () => {
        await loadSettings();
        return true;
      }
    });
  }
});
</script>
```

## Multi-level Navigation

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useBreadcrumbs } from "@vc-shell/framework";

const { breadcrumbs, push, remove } = useBreadcrumbs();

interface NavigationLevel {
  id: string;
  title: string;
  children?: NavigationLevel[];
}

const navigationTree: NavigationLevel[] = [
  {
    id: "products",
    title: "Products",
    children: [
      {
        id: "electronics",
        title: "Electronics",
        children: [
          { id: "computers", title: "Computers" },
          { id: "phones", title: "Phones" }
        ]
      },
      {
        id: "clothing",
        title: "Clothing"
      }
    ]
  }
];

function buildBreadcrumbPath(
  levelId: string,
  tree: NavigationLevel[] = navigationTree
): NavigationLevel[] {
  for (const node of tree) {
    if (node.id === levelId) {
      return [node];
    }

    if (node.children) {
      const childPath = buildBreadcrumbPath(levelId, node.children);
      if (childPath.length > 0) {
        return [node, ...childPath];
      }
    }
  }

  return [];
}

async function navigateToLevel(levelId: string): Promise<void> {
  // Clear all breadcrumbs after root
  const rootIndex = breadcrumbs.value.findIndex(b => b.id === "root");
  if (rootIndex !== -1) {
    const idsToRemove = breadcrumbs.value
      .slice(rootIndex + 1)
      .map(b => b.id);
    remove(idsToRemove);
  }

  // Build breadcrumb path
  const path = buildBreadcrumbPath(levelId);

  // Add breadcrumbs for each level in path
  for (const level of path) {
    push({
      id: level.id,
      title: level.title,
      clickHandler: async () => {
        await navigateToLevel(level.id);
        return true;
      }
    });
  }

  // Load data for this level
  console.log(`Loading data for: ${levelId}`);
}

onMounted(async () => {
  // Root breadcrumb
  push({
    id: "root",
    title: "Home",
    icon: "material-home",
    clickHandler: async () => {
      remove(breadcrumbs.value.slice(1).map(b => b.id));
      return true;
    }
  });

  // Navigate to default level
  await navigateToLevel("electronics");
});
</script>
```

## Breadcrumb State Persistence

```vue
<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@vc-shell/framework";

const { t } = useI18n({ useScope: "global" });
const { breadcrumbs, push } = useBreadcrumbs();

const BREADCRUMB_STORAGE_KEY = "app-breadcrumbs";

// Map of breadcrumb IDs to their data loading functions
const breadcrumbHandlers: Record<string, () => Promise<void>> = {
  catalog: async () => await loadCatalogData(),
  category1: async () => await loadCategoryData("category1"),
  category2: async () => await loadCategoryData("category2"),
};

async function loadCatalogData() {
  console.log("Loading catalog data");
  // Load catalog data
}

async function loadCategoryData(categoryId: string) {
  console.log(`Loading category: ${categoryId}`);
  // Load category data
}

// Save breadcrumbs to localStorage
function saveBreadcrumbs() {
  const serialized = breadcrumbs.value.map(b => ({
    id: b.id,
    title: typeof b.title === "string" ? b.title : b.title.value,
    icon: b.icon
  }));

  localStorage.setItem(BREADCRUMB_STORAGE_KEY, JSON.stringify(serialized));
}

// Restore breadcrumbs from localStorage
function restoreBreadcrumbs() {
  const saved = localStorage.getItem(BREADCRUMB_STORAGE_KEY);

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    for (const item of parsed) {
      push({
        id: item.id,
        title: item.title,
        icon: item.icon,
        clickHandler: async () => {
          const handler = breadcrumbHandlers[item.id];
          if (handler) {
            await handler();
          }
          return true;
        }
      });
    }
  } catch (error) {
    console.error("Failed to restore breadcrumbs:", error);
  }
}

// Watch for breadcrumb changes
watch(breadcrumbs, saveBreadcrumbs, { deep: true });

onMounted(() => {
  restoreBreadcrumbs();
});
</script>
```

## API Reference

```typescript
interface Breadcrumbs {
  // Unique identifier (required)
  id: string;

  // Display title (required) - can be reactive
  title: string | ComputedRef<string>;

  // Icon name or component (optional)
  icon?: string | Component;

  // Click handler (optional)
  clickHandler?: (id: string) => Promise<boolean | void> | boolean | void;
}

interface IUseBreadcrumbs {
  // Reactive breadcrumb array
  breadcrumbs: ComputedRef<Breadcrumbs[]>;

  // Add breadcrumb (prevents duplicates by id/title)
  push: (breadcrumb: Breadcrumbs) => void;

  // Remove breadcrumbs by IDs
  remove: (ids: string[]) => void;
}
```

## Important Notes

### ✅ DO

- Use unique IDs for each breadcrumb
- Return `true` from clickHandler to remove subsequent breadcrumbs
- Use `computed(() => t("KEY"))` for reactive i18n titles
- Use async `clickHandler` functions to load data instead of router navigation
- Clean up breadcrumbs when switching views or navigating away
- Integrate with VcBreadcrumbs component for display
- Build breadcrumb paths from hierarchical data
- Call data loading functions (like `loadCategoryList`, `loadProducts`) in clickHandlers
- Use `async/await` pattern in clickHandlers for data fetching

### ❌ DON'T

- ❌ Don't use `router.push()` in breadcrumb clickHandlers
- ❌ Don't use duplicate IDs
- ❌ Don't hardcode titles - always use i18n with `computed(() => t("KEY"))`
- ❌ Don't leave stale breadcrumbs in the trail
- ❌ Don't forget to return `true` for truncation when you want to remove subsequent breadcrumbs
- ❌ Don't push breadcrumbs without clickHandlers in navigation contexts
- ❌ Don't use plain strings for titles - use computed refs for reactivity

## Common Patterns

### Simple Navigation Trail
```typescript
// Use async functions to load data instead of router navigation
push({
  id: "home",
  title: computed(() => t("BREADCRUMBS.HOME")),
  clickHandler: async () => {
    await loadHomeData();
    return true;
  }
});

push({
  id: "offers",
  title: computed(() => t("BREADCRUMBS.OFFERS")),
  clickHandler: async () => {
    await loadOffersData();
    return true;
  }
});
```

### Dynamic Title with i18n
```typescript
push({
  id: "product-123",
  title: computed(() => product.value?.name || t("PRODUCTS.DEFAULT_NAME")),
  clickHandler: async () => {
    await loadProductData(product.value.id);
    return true;
  }
});
```

### Hierarchical Drill-down (Category Navigation)
```typescript
// Setup base catalog breadcrumb
function setupCatalogBreadcrumbs(sellerId?: string) {
  push({
    id: sellerId ?? "catalog",
    title: computed(() => t("PRODUCTS.BREADCRUMBS.CATALOG")),
    clickHandler: async () => {
      await loadCategoryList({ catalogId: sellerId }, sellerId);
      return true; // Remove subsequent breadcrumbs
    },
  });
}

// Add category breadcrumb when navigating into a category
async function openCategory(item: IListEntryBase) {
  if (item.id) {
    push({
      id: item.id,
      title: item.name,
      clickHandler: async () => {
        await loadCategoryList({ id: item.id });
        return true;
      },
    });

    await loadCategoryList({ id: item.id });
  }
}
```

## Real-World Example: Product Catalog Navigation

Here's a complete example from a production VC-Shell application showing proper breadcrumb usage:

```typescript
import { useBreadcrumbs } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n({ useScope: "global" });
const { breadcrumbs, push: pushBc } = useBreadcrumbs();

// Setup base catalog breadcrumb
function setupCatalogBreadcrumbs(sellerId?: string) {
  pushBc({
    id: sellerId ?? "catalog",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.BREADCRUMBS.CATALOG")),
    clickHandler: async () => {
      await loadCategoryList({ catalogId: sellerId }, sellerId);
    },
  });
}

// Navigate to a category
async function openCategory(item: IListEntryBase) {
  if (item.id) {
    pushBc({
      id: item.id,
      title: item.name,
      clickHandler: async () => {
        await loadCategoryList({ ...query.value, id: item.id });
      },
    });

    await loadCategoryList({ ...query.value, id: item.id });
  }
}

// Setup breadcrumbs for nested category path
async function setupCategoryBreadcrumbs(ids: string[], names: string[]) {
  const lastIndex = ids.length - 1;

  // Add breadcrumbs for parent categories
  for (let i = 0; i < lastIndex; i++) {
    const id = ids[i];
    const name = names[i];
    pushBc({
      id,
      title: name,
      clickHandler: async () => {
        await loadCategoryList({ ...query.value, id });
      },
    });
  }

  // Navigate to the final category
  await openCategory({
    id: ids[lastIndex],
    name: names[lastIndex],
  });
}
```

## See Also

- [VcBreadcrumbs Component](../../ui-components/vc-breadcrumbs.md) - Breadcrumb display component
- [useI18n](../useLanguages/basic-usage.md) - Internationalization for breadcrumb titles
- [useBladeNavigation](../useBladeNavigation/blade-management.md) - Blade navigation and state management

**Reference:** [Official VC-Shell Documentation - useBreadcrumbs](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useBreadcrumbs/)

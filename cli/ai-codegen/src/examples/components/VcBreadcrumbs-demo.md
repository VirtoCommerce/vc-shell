---
id: component-VcBreadcrumbs-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: [component]
title: "VcBreadcrumbs Demo"
description: "VcBreadcrumbs Demo component example"
---

# VcBreadcrumbs Demo

Real-world breadcrumb navigation examples for hierarchical page structure.

## Basic Breadcrumbs

```vue
<template>
  <div class="tw-space-y-4">
    <VcBreadcrumbs :items="breadcrumbItems" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumbItems = ref([
  { text: t("NAVIGATION.HOME"), href: "/" },
  { text: t("NAVIGATION.PRODUCTS"), href: "/products" },
  { text: "Wireless Headphones", href: "/products/123" },
]);
</script>
```

## Breadcrumbs with Icons

```vue
<template>
  <div class="tw-space-y-4">
    <VcBreadcrumbs :items="breadcrumbsWithIcons" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumbsWithIcons = ref([
  {
    text: t("NAVIGATION.HOME"),
    href: "/",
    icon: "material-home",
  },
  {
    text: t("NAVIGATION.CATALOG"),
    href: "/catalog",
    icon: "material-inventory",
  },
  {
    text: t("NAVIGATION.ELECTRONICS"),
    href: "/catalog/electronics",
    icon: "material-devices",
  },
  {
    text: "Laptops",
    href: "/catalog/electronics/laptops",
  },
]);
</script>
```

## Dynamic Breadcrumbs Based on Route

```vue
<template>
  <div class="tw-space-y-4">
    <VcBreadcrumbs :items="dynamicBreadcrumbs" />

    <!-- Page content -->
    <VcCard :header="currentPageTitle">
      <p>{{ $t("PRODUCTS.CURRENT_PAGE_DESCRIPTION") }}</p>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { VcBreadcrumbs, VcCard } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();

const currentPageTitle = ref("Product Details");

const dynamicBreadcrumbs = computed(() => {
  const crumbs = [
    { text: t("NAVIGATION.HOME"), href: "/" },
  ];

  // Build breadcrumbs from route path
  const pathSegments = route.path.split("/").filter(Boolean);

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Last segment is current page (no link)
    const isLast = index === pathSegments.length - 1;

    crumbs.push({
      text: getBreadcrumbText(segment),
      href: isLast ? undefined : currentPath,
    });
  });

  return crumbs;
});

function getBreadcrumbText(segment: string): string {
  // Map route segments to readable names
  const segmentMap: Record<string, string> = {
    products: t("NAVIGATION.PRODUCTS"),
    vendors: t("NAVIGATION.VENDORS"),
    orders: t("NAVIGATION.ORDERS"),
    settings: t("NAVIGATION.SETTINGS"),
  };

  return segmentMap[segment] || segment;
}
</script>
```

## Breadcrumbs with Actions

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-items-center tw-justify-between">
      <VcBreadcrumbs :items="breadcrumbs" />

      <div class="tw-flex tw-gap-2">
        <VcButton
          size="s"
          outlined
          @click="goBack"
        >
          <VcIcon icon="material-arrow_back" size="s" class="tw-mr-1" />
          {{ $t("COMMON.BACK") }}
        </VcButton>
        <VcButton
          size="s"
          variant="primary"
          @click="saveProduct"
        >
          <VcIcon icon="material-save" size="s" class="tw-mr-1" />
          {{ $t("COMMON.SAVE") }}
        </VcButton>
      </div>
    </div>

    <VcBlade
      :title="$t('PRODUCTS.DETAILS')"
      :modified="isModified"
    >
      <!-- Product form -->
    </VcBlade>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { VcBreadcrumbs, VcButton, VcIcon, VcBlade } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();

const breadcrumbs = ref([
  { text: t("NAVIGATION.HOME"), href: "/" },
  { text: t("NAVIGATION.PRODUCTS"), href: "/products" },
  { text: t("PRODUCTS.EDIT"), href: undefined },
]);

const isModified = ref(false);

function goBack() {
  router.back();
}

function saveProduct() {
  console.log("Saving product");
  isModified.value = false;
}
</script>
```

## Breadcrumbs with Dropdown Menu

```vue
<template>
  <div class="tw-space-y-4">
    <VcBreadcrumbs :items="breadcrumbsWithMenu" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumbsWithMenu = ref([
  {
    text: t("NAVIGATION.HOME"),
    href: "/",
  },
  {
    text: t("NAVIGATION.CATALOG"),
    href: "/catalog",
    // Submenu for collapsed items
    menu: [
      { text: t("NAVIGATION.ALL_PRODUCTS"), href: "/catalog/all" },
      { text: t("NAVIGATION.FEATURED"), href: "/catalog/featured" },
      { text: t("NAVIGATION.ON_SALE"), href: "/catalog/sale" },
    ],
  },
  {
    text: t("NAVIGATION.ELECTRONICS"),
    href: "/catalog/electronics",
  },
  {
    text: "Laptops",
    href: "/catalog/electronics/laptops",
  },
]);
</script>
```

## Breadcrumbs in Different Layouts

```vue
<template>
  <div class="tw-space-y-6">
    <!-- In page header -->
    <div class="tw-bg-[var(--neutrals-50)] tw-p-4 tw-rounded-lg">
      <VcBreadcrumbs :items="breadcrumbs" />
      <h1 class="tw-text-2xl tw-font-bold tw-mt-2">
        {{ $t("PRODUCTS.PAGE_TITLE") }}
      </h1>
    </div>

    <!-- Above content -->
    <div>
      <VcBreadcrumbs :items="breadcrumbs" class="tw-mb-4" />
      <VcCard :header="$t('PRODUCTS.DETAILS')">
        <p>{{ $t("PRODUCTS.CONTENT") }}</p>
      </VcCard>
    </div>

    <!-- In blade header -->
    <VcBlade :title="$t('PRODUCTS.DETAILS')">
      <template #toolbar>
        <VcBreadcrumbs :items="breadcrumbs" />
      </template>

      <!-- Blade content -->
    </VcBlade>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs, VcCard, VcBlade } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumbs = ref([
  { text: t("NAVIGATION.HOME"), href: "/" },
  { text: t("NAVIGATION.PRODUCTS"), href: "/products" },
  { text: "Product Name", href: undefined },
]);
</script>
```

## Breadcrumbs with Custom Separator

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Default separator (/) -->
    <VcBreadcrumbs :items="breadcrumbs" />

    <!-- Custom separator -->
    <VcBreadcrumbs
      :items="breadcrumbs"
      separator=">"
    />

    <!-- Icon separator -->
    <VcBreadcrumbs
      :items="breadcrumbs"
      :separator-icon="'material-chevron_right'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumbs = ref([
  { text: t("NAVIGATION.HOME"), href: "/" },
  { text: t("NAVIGATION.PRODUCTS"), href: "/products" },
  { text: "Details", href: undefined },
]);
</script>
```

## Breadcrumbs with Loading State

```vue
<template>
  <div class="tw-space-y-4">
    <VcBreadcrumbs
      v-if="!loading"
      :items="breadcrumbs"
    />

    <div v-else class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-[var(--neutrals-500)]">
      <VcIcon icon="material-more_horiz" size="s" class="tw-animate-pulse" />
      <span>{{ $t("COMMON.LOADING") }}</span>
    </div>

    <VcCard :header="pageTitle" v-loading="loading">
      <p v-if="!loading">{{ pageContent }}</p>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VcBreadcrumbs, VcCard, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const loading = ref(true);
const breadcrumbs = ref<Array<{ text: string; href?: string }>>([]);
const pageTitle = ref("");
const pageContent = ref("");

onMounted(async () => {
  // Simulate loading page data
  await new Promise(resolve => setTimeout(resolve, 1000));

  breadcrumbs.value = [
    { text: t("NAVIGATION.HOME"), href: "/" },
    { text: t("NAVIGATION.PRODUCTS"), href: "/products" },
    { text: "Wireless Headphones", href: undefined },
  ];

  pageTitle.value = "Wireless Headphones";
  pageContent.value = "Product details...";
  loading.value = false;
});
</script>
```

## Breadcrumbs with Tooltips

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-items-center tw-gap-2">
      <VcBreadcrumbs :items="simpleBreadcrumbs" />
      
      <VcTooltip>
        <template #trigger>
          <VcIcon
            icon="material-info"
            size="s"
            class="tw-text-[var(--info-500)] tw-cursor-help"
          />
        </template>
        <template #content>
          <div class="tw-space-y-1">
            <div class="tw-font-medium">{{ $t("NAVIGATION.PATH_INFO") }}</div>
            <div class="tw-text-xs">
              {{ $t("NAVIGATION.PATH_DESCRIPTION") }}
            </div>
          </div>
        </template>
      </VcTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBreadcrumbs, VcTooltip, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const simpleBreadcrumbs = ref([
  { text: t("NAVIGATION.HOME"), href: "/" },
  { text: t("NAVIGATION.PRODUCTS"), href: "/products" },
  { text: "Details", href: undefined },
]);
</script>
```

## Key Points

### Items Structure
Each breadcrumb item should have:
```typescript
{
  text: string;      // Display text (required)
  href?: string;     // URL (optional for current page)
  icon?: string;     // Icon name (optional)
  menu?: Array<{    // Dropdown menu (optional)
    text: string;
    href: string;
  }>;
}
```

### Props
- `items` - Array of breadcrumb items (required)
- `separator` - Custom separator character (default: "/")
- `separator-icon` - Icon to use as separator

### Common Use Cases

1. **Simple Navigation**: Basic hierarchical path
```vue
<VcBreadcrumbs
  :items="[
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Current', href: undefined }
  ]"
/>
```

2. **With Icons**: Add visual context
```vue
<VcBreadcrumbs
  :items="[
    { text: 'Home', href: '/', icon: 'material-home' },
    { text: 'Products', href: '/products' }
  ]"
/>
```

3. **Dynamic from Route**: Build from current route
```vue
const breadcrumbs = computed(() => 
  buildBreadcrumbsFromRoute(route.path)
);
```

### Best Practices

- Always include "Home" or root level as first item
- Last item should be current page (no `href`)
- Use icons sparingly (usually only for home)
- Keep breadcrumb text short and descriptive
- Use i18n for all text
- Build dynamically from route structure
- Show loading state when fetching page data
- Don't show breadcrumbs for top-level pages
- Truncate very long paths with dropdown menu
- Place at top of page content
- Use consistent separator across application
- Make all items except last one clickable


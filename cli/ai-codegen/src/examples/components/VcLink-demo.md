---
id: component-VcLink-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","link","navigation"]
title: "VcLink Demo"
description: "Link component for navigation"
componentRole: navigation
bladeContext: ["details","list","general"]
---

# VcLink Demo

Real-world link examples for navigation, external resources, and interactive text.

## Basic Links

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("LINKS.TYPES") }}</h3>

    <div class="tw-space-y-3">
      <!-- Internal link -->
      <div>
        <VcLink href="/products">
          {{ $t("NAVIGATION.PRODUCTS") }}
        </VcLink>
      </div>

      <!-- External link -->
      <div>
        <VcLink
          href="https://docs.example.com"
          target="_blank"
        >
          {{ $t("LINKS.DOCUMENTATION") }}
          <VcIcon icon="material-open_in_new" size="xs" class="tw-ml-1" />
        </VcLink>
      </div>

      <!-- Email link -->
      <div>
        <VcLink href="mailto:support@example.com">
          {{ $t("LINKS.CONTACT_SUPPORT") }}
        </VcLink>
      </div>

      <!-- Phone link -->
      <div>
        <VcLink href="tel:+15551234567">
          +1 (555) 123-4567
        </VcLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcLink, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Links in Navigation

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Breadcrumb navigation -->
    <div class="tw-flex tw-items-center tw-gap-2 tw-text-sm">
      <VcLink href="/">{{ $t("NAVIGATION.HOME") }}</VcLink>
      <span class="tw-text-[var(--neutrals-400)]">/</span>
      <VcLink href="/products">{{ $t("NAVIGATION.PRODUCTS") }}</VcLink>
      <span class="tw-text-[var(--neutrals-400)]">/</span>
      <span class="tw-text-[var(--neutrals-600)]">{{ productName }}</span>
    </div>

    <!-- Sidebar navigation -->
    <div class="tw-space-y-2">
      <VcLink
        v-for="item in navItems"
        :key="item.id"
        :href="item.href"
        :active="currentRoute === item.href"
        class="tw-block tw-p-3 tw-rounded hover:tw-bg-[var(--neutrals-100)]"
      >
        <div class="tw-flex tw-items-center tw-gap-3">
          <VcIcon :icon="item.icon" size="m" />
          <span>{{ item.label }}</span>
          <VcBadge
            v-if="item.badge"
            :content="item.badge"
            variant="primary"
            size="s"
            class="tw-ml-auto"
          />
        </div>
      </VcLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLink, VcIcon, VcBadge } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const productName = "Wireless Headphones";
const currentRoute = "/orders";

const navItems = ref([
  {
    id: "dashboard",
    label: t("NAVIGATION.DASHBOARD"),
    href: "/dashboard",
    icon: "material-dashboard",
    badge: null,
  },
  {
    id: "orders",
    label: t("NAVIGATION.ORDERS"),
    href: "/orders",
    icon: "material-shopping_cart",
    badge: 5,
  },
  {
    id: "products",
    label: t("NAVIGATION.PRODUCTS"),
    href: "/products",
    icon: "material-inventory",
    badge: null,
  },
  {
    id: "customers",
    label: t("NAVIGATION.CUSTOMERS"),
    href: "/customers",
    icon: "material-people",
    badge: null,
  },
]);
</script>
```

## Links with States

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("LINKS.STATES") }}</h3>

    <div class="tw-space-y-3">
      <!-- Normal link -->
      <div>
        <VcLink href="/normal">
          {{ $t("LINKS.NORMAL") }}
        </VcLink>
      </div>

      <!-- Active link -->
      <div>
        <VcLink href="/active" :active="true">
          {{ $t("LINKS.ACTIVE") }}
        </VcLink>
      </div>

      <!-- Disabled link -->
      <div>
        <VcLink href="/disabled" :disabled="true">
          {{ $t("LINKS.DISABLED") }}
        </VcLink>
      </div>

      <!-- Link with hover state -->
      <div>
        <VcLink href="/hover" class="hover:tw-underline">
          {{ $t("LINKS.HOVER_UNDERLINE") }}
        </VcLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcLink } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Links in Content

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard :header="$t('ARTICLES.LATEST')">
      <div class="tw-space-y-4">
        <!-- Article with inline links -->
        <div>
          <h3 class="tw-font-bold tw-mb-2">{{ article.title }}</h3>
          <p class="tw-text-sm tw-text-[var(--neutrals-600)] tw-mb-3">
            {{ article.excerpt }}
            <VcLink :href="`/articles/${article.id}`">
              {{ $t("COMMON.READ_MORE") }}
            </VcLink>
          </p>
          <div class="tw-flex tw-items-center tw-gap-4 tw-text-xs tw-text-[var(--neutrals-500)]">
            <div class="tw-flex tw-items-center tw-gap-2">
              <VcIcon icon="material-person" size="xs" />
              <VcLink :href="`/authors/${article.authorId}`">
                {{ article.author }}
              </VcLink>
            </div>
            <div class="tw-flex tw-items-center tw-gap-2">
              <VcIcon icon="material-label" size="xs" />
              <VcLink
                v-for="tag in article.tags"
                :key="tag"
                :href="`/tags/${tag}`"
              >
                #{{ tag }}
              </VcLink>
            </div>
          </div>
        </div>

        <!-- Related articles -->
        <div>
          <h4 class="tw-font-medium tw-mb-2">{{ $t("ARTICLES.RELATED") }}</h4>
          <ul class="tw-space-y-2 tw-text-sm">
            <li v-for="related in relatedArticles" :key="related.id">
              <VcLink :href="`/articles/${related.id}`">
                {{ related.title }}
              </VcLink>
            </li>
          </ul>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcLink, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const article = ref({
  id: "1",
  title: "Getting Started with VC-Shell",
  excerpt: "Learn how to build modern e-commerce applications with Vue 3 and TypeScript...",
  author: "John Doe",
  authorId: "author-1",
  tags: ["vue", "typescript", "tutorial"],
});

const relatedArticles = ref([
  { id: "2", title: "Advanced Component Patterns" },
  { id: "3", title: "State Management Best Practices" },
  { id: "4", title: "Building Reusable Composables" },
]);
</script>
```

## Action Links

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Quick actions -->
    <div class="tw-flex tw-flex-wrap tw-gap-4">
      <VcLink
        href="#"
        @click.prevent="handleAction('download')"
      >
        <VcIcon icon="material-download" size="s" class="tw-mr-2" />
        {{ $t("ACTIONS.DOWNLOAD") }}
      </VcLink>

      <VcLink
        href="#"
        @click.prevent="handleAction('share')"
      >
        <VcIcon icon="material-share" size="s" class="tw-mr-2" />
        {{ $t("ACTIONS.SHARE") }}
      </VcLink>

      <VcLink
        href="#"
        @click.prevent="handleAction('export')"
      >
        <VcIcon icon="material-upload" size="s" class="tw-mr-2" />
        {{ $t("ACTIONS.EXPORT") }}
      </VcLink>
    </div>

    <!-- Footer links -->
    <div class="tw-border-t tw-pt-4">
      <div class="tw-flex tw-flex-wrap tw-gap-4 tw-text-sm">
        <VcLink href="/privacy">{{ $t("FOOTER.PRIVACY") }}</VcLink>
        <VcLink href="/terms">{{ $t("FOOTER.TERMS") }}</VcLink>
        <VcLink href="/contact">{{ $t("FOOTER.CONTACT") }}</VcLink>
        <VcLink href="https://status.example.com" target="_blank">
          {{ $t("FOOTER.STATUS") }}
          <VcIcon icon="material-open_in_new" size="xs" class="tw-ml-1" />
        </VcLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcLink, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function handleAction(action: string) {
  console.log("Action:", action);
}
</script>
```

## Link in Empty States

```vue
<template>
  <div class="tw-space-y-4">
    <!-- @vue-generic {IItem} -->
    <VcTable
      :items="items"
      :columns="columns"
    >
      <template #empty>
        <div class="tw-text-center tw-py-12">
          <VcIcon icon="material-inbox" size="xxl" class="tw-text-[var(--neutrals-300)] tw-mb-4" />
          <h3 class="tw-font-bold tw-mb-2">{{ $t("PRODUCTS.EMPTY.TITLE") }}</h3>
          <p class="tw-text-sm tw-text-[var(--neutrals-500)] tw-mb-4">
            {{ $t("PRODUCTS.EMPTY.DESCRIPTION") }}
          </p>
          <VcLink href="/products/new">
            <VcButton variant="primary">
              <VcIcon icon="material-add" class="tw-mr-2" />
              {{ $t("PRODUCTS.ADD_FIRST") }}
            </VcButton>
          </VcLink>
          <div class="tw-mt-4">
            <VcLink href="/docs/products" target="_blank">
              {{ $t("COMMON.LEARN_MORE") }}
              <VcIcon icon="material-open_in_new" size="xs" class="tw-ml-1" />
            </VcLink>
          </div>
        </div>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcLink, VcIcon, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const items = ref([]);

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME") },
  { id: "price", title: t("PRODUCTS.PRICE") },
]);
</script>
```

## Key Points

### Props
- `href` - URL to navigate to
- `target` - `_blank` for new tab, `_self` for same tab (default)
- `active` - Boolean for active state styling
- `disabled` - Boolean to disable link
- `rel` - Relationship attribute (auto-added for external links)

### Common Use Cases

1. **Navigation Links**: Internal routing
```vue
<VcLink href="/products">Products</VcLink>
```

2. **External Links**: Documentation, resources
```vue
<VcLink href="https://docs.example.com" target="_blank">
  Docs <VcIcon icon="material-open_in_new" />
</VcLink>
```

3. **Action Links**: Trigger functions
```vue
<VcLink href="#" @click.prevent="handleAction">Action</VcLink>
```

4. **Breadcrumbs**: Navigation path
```vue
<VcLink href="/">Home</VcLink> /
<VcLink href="/products">Products</VcLink> /
<span>Current Item</span>
```

### Best Practices

- Always add external link indicator (`open_in_new` icon) for `target="_blank"`
- Use `:active="true"` for current page in navigation
- Prevent default with `@click.prevent` for action links without navigation
- Extract domain name for cleaner display of long URLs
- Use semantic `href` values (`mailto:`, `tel:`, `https://`)
- Add `:disabled="true"` for conditionally unavailable links
- Combine with icons for visual context
- Keep link text descriptive (avoid "click here")
- Use consistent styling for internal vs external links
- Test keyboard navigation (Tab, Enter) for accessibility


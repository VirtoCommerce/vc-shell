---
id: component-VcStatus-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","status","badge","display"]
title: "VcStatus Demo"
description: "Status badge component"
componentRole: display
bladeContext: ["details","list"]
---

# VcStatus Demo

Real-world status badge examples for orders, products, services, and workflows.

## Order Status Badges

```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable
    :items="orders"
    :columns="columns"
    @item-click="onItemClick"
  >
    <template #item_status="{ item }">
      <VcStatus :variant="getStatusVariant(item.status)">
        {{ $t(`ORDERS.STATUS.${item.status.toUpperCase()}`) }}
      </VcStatus>
    </template>

    <template #item_paymentStatus="{ item }">
      <VcStatus :variant="getPaymentVariant(item.paymentStatus)">
        {{ $t(`ORDERS.PAYMENT.${item.paymentStatus.toUpperCase()}`) }}
      </VcStatus>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcStatus } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const orders = ref([
  { id: "1", orderNumber: "#1001", status: "completed", paymentStatus: "paid" },
  { id: "2", orderNumber: "#1002", status: "pending", paymentStatus: "pending" },
  { id: "3", orderNumber: "#1003", status: "processing", paymentStatus: "paid" },
  { id: "4", orderNumber: "#1004", status: "cancelled", paymentStatus: "refunded" },
  { id: "5", orderNumber: "#1005", status: "shipped", paymentStatus: "paid" },
]);

const columns = computed(() => [
  { id: "orderNumber", title: t("ORDERS.NUMBER"), sortable: true },
  { id: "status", title: t("ORDERS.STATUS") },
  { id: "paymentStatus", title: t("ORDERS.PAYMENT_STATUS") },
]);

function getStatusVariant(status: string): string {
  const variants: Record<string, string> = {
    completed: "success",
    pending: "warning",
    processing: "info",
    cancelled: "danger",
    shipped: "success",
    returned: "danger",
  };
  return variants[status] || "secondary";
}

function getPaymentVariant(status: string): string {
  const variants: Record<string, string> = {
    paid: "success",
    pending: "warning",
    failed: "danger",
    refunded: "info",
  };
  return variants[status] || "secondary";
}

function onItemClick(item: any) {
  console.log("Order clicked:", item.id);
}
</script>
```

## Product Status

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard
      v-for="product in products"
      :key="product.id"
      :header="product.name"
    >
      <div class="tw-space-y-3">
        <!-- Availability -->
        <div class="tw-flex tw-justify-between tw-items-center">
          <span class="tw-text-sm tw-text-[var(--neutrals-500)]">
            {{ $t("PRODUCTS.AVAILABILITY") }}:
          </span>
          <VcStatus :variant="product.inStock ? 'success' : 'danger'">
            {{ product.inStock ? $t("PRODUCTS.IN_STOCK") : $t("PRODUCTS.OUT_OF_STOCK") }}
          </VcStatus>
        </div>

        <!-- Publication status -->
        <div class="tw-flex tw-justify-between tw-items-center">
          <span class="tw-text-sm tw-text-[var(--neutrals-500)]">
            {{ $t("PRODUCTS.PUBLICATION") }}:
          </span>
          <VcStatus :variant="product.published ? 'success' : 'secondary'">
            {{ product.published ? $t("PRODUCTS.PUBLISHED") : $t("PRODUCTS.DRAFT") }}
          </VcStatus>
        </div>

        <!-- Visibility -->
        <div class="tw-flex tw-justify-between tw-items-center">
          <span class="tw-text-sm tw-text-[var(--neutrals-500)]">
            {{ $t("PRODUCTS.VISIBILITY") }}:
          </span>
          <VcStatus :variant="getVisibilityVariant(product.visibility)">
            {{ $t(`PRODUCTS.VISIBILITY_${product.visibility.toUpperCase()}`) }}
          </VcStatus>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcStatus } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const products = ref([
  {
    id: "1",
    name: "Wireless Headphones",
    inStock: true,
    published: true,
    visibility: "public",
  },
  {
    id: "2",
    name: "Leather Backpack",
    inStock: false,
    published: true,
    visibility: "private",
  },
  {
    id: "3",
    name: "Smart Watch",
    inStock: true,
    published: false,
    visibility: "hidden",
  },
]);

function getVisibilityVariant(visibility: string): string {
  const variants: Record<string, string> = {
    public: "success",
    private: "warning",
    hidden: "secondary",
  };
  return variants[visibility] || "secondary";
}
</script>
```

## Service Status

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("SERVICES.SYSTEM_STATUS") }}</h3>

    <div class="tw-space-y-3">
      <div
        v-for="service in services"
        :key="service.name"
        class="tw-flex tw-items-center tw-justify-between tw-p-4 tw-border tw-rounded-lg"
      >
        <div class="tw-flex tw-items-center tw-gap-3">
          <VcIcon :icon="service.icon" size="l" />
          <div>
            <div class="tw-font-medium">{{ service.name }}</div>
            <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
              {{ service.description }}
            </div>
          </div>
        </div>
        <VcStatus :variant="service.variant">
          {{ $t(`SERVICES.STATUS.${service.status.toUpperCase()}`) }}
        </VcStatus>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcIcon, VcStatus } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const services = ref([
  {
    name: "API Server",
    description: "Main application API",
    icon: "material-cloud",
    status: "operational",
    variant: "success",
  },
  {
    name: "Database",
    description: "PostgreSQL primary",
    icon: "material-storage",
    status: "operational",
    variant: "success",
  },
  {
    name: "Payment Gateway",
    description: "Stripe integration",
    icon: "material-payment",
    status: "degraded",
    variant: "warning",
  },
  {
    name: "Email Service",
    description: "SMTP mail sender",
    icon: "material-email",
    status: "outage",
    variant: "danger",
  },
  {
    name: "CDN",
    description: "Content delivery network",
    icon: "material-language",
    status: "maintenance",
    variant: "info",
  },
]);
</script>
```

## User Status

```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable
    :items="users"
    :columns="columns"
  >
    <template #item_name="{ item }">
      <div class="tw-flex tw-items-center tw-gap-3">
        <VcImage
          :src="item.avatar"
          size="xs"
          aspect="1x1"
          bordered
          rounded
        />
        <div>
          <div class="tw-font-medium">{{ item.name }}</div>
          <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
            {{ item.email }}
          </div>
        </div>
      </div>
    </template>

    <template #item_status="{ item }">
      <VcStatus :variant="getUserStatusVariant(item.status)">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span
            v-if="item.status === 'online'"
            class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-[var(--success-500)] tw-animate-pulse"
          />
          {{ $t(`USER.STATUS.${item.status.toUpperCase()}`) }}
        </div>
      </VcStatus>
    </template>

    <template #item_role="{ item }">
      <VcStatus :variant="getRoleVariant(item.role)">
        {{ $t(`USER.ROLE.${item.role.toUpperCase()}`) }}
      </VcStatus>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcImage, VcStatus } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const users = ref([
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://placehold.co/64x64/9C27B0/FFFFFF/png?text=JD",
    status: "online",
    role: "admin",
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@example.com",
    avatar: "https://placehold.co/64x64/F44336/FFFFFF/png?text=AS",
    status: "away",
    role: "manager",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "https://placehold.co/64x64/4CAF50/FFFFFF/png?text=BJ",
    status: "offline",
    role: "user",
  },
]);

const columns = computed(() => [
  { id: "name", title: t("USER.NAME") },
  { id: "status", title: t("USER.STATUS") },
  { id: "role", title: t("USER.ROLE") },
]);

function getUserStatusVariant(status: string): string {
  const variants: Record<string, string> = {
    online: "success",
    away: "warning",
    offline: "secondary",
    busy: "danger",
  };
  return variants[status] || "secondary";
}

function getRoleVariant(role: string): string {
  const variants: Record<string, string> = {
    admin: "danger",
    manager: "warning",
    user: "info",
    guest: "secondary",
  };
  return variants[role] || "secondary";
}
</script>
```

## Workflow Status

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("WORKFLOW.APPROVAL_PROCESS") }}</h3>

    <div class="tw-space-y-3">
      <div
        v-for="(step, index) in workflowSteps"
        :key="step.id"
        class="tw-flex tw-items-start tw-gap-4"
      >
        <!-- Step number -->
        <div
          class="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-bg-[var(--neutrals-100)] tw-flex-shrink-0"
        >
          <span class="tw-text-sm tw-font-bold">{{ index + 1 }}</span>
        </div>

        <!-- Step info -->
        <div class="tw-flex-1 tw-border tw-rounded-lg tw-p-4">
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
            <div class="tw-font-medium">{{ step.name }}</div>
            <VcStatus :variant="step.variant">
              {{ $t(`WORKFLOW.STATUS.${step.status.toUpperCase()}`) }}
            </VcStatus>
          </div>

          <div class="tw-text-sm tw-text-[var(--neutrals-500)] tw-mb-2">
            {{ step.assignee }}
          </div>

          <div v-if="step.completedAt" class="tw-text-xs tw-text-[var(--neutrals-400)]">
            {{ $t("WORKFLOW.COMPLETED") }}: {{ formatDate(step.completedAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcStatus } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const workflowSteps = ref([
  {
    id: "1",
    name: "Submit Request",
    assignee: "John Doe",
    status: "completed",
    variant: "success",
    completedAt: new Date("2025-01-10"),
  },
  {
    id: "2",
    name: "Manager Review",
    assignee: "Alice Smith",
    status: "completed",
    variant: "success",
    completedAt: new Date("2025-01-11"),
  },
  {
    id: "3",
    name: "Finance Approval",
    assignee: "Bob Johnson",
    status: "in_progress",
    variant: "info",
    completedAt: null,
  },
  {
    id: "4",
    name: "Final Sign-off",
    assignee: "Carol White",
    status: "pending",
    variant: "secondary",
    completedAt: null,
  },
]);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
</script>
```

## All Status Variants

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("STATUS.ALL_VARIANTS") }}</h3>

    <div class="tw-grid tw-grid-cols-2 tw-gap-4">
      <div class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded">
        <span class="tw-text-sm">Success</span>
        <VcStatus variant="success">Active</VcStatus>
      </div>

      <div class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded">
        <span class="tw-text-sm">Warning</span>
        <VcStatus variant="warning">Pending</VcStatus>
      </div>

      <div class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded">
        <span class="tw-text-sm">Danger</span>
        <VcStatus variant="danger">Failed</VcStatus>
      </div>

      <div class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded">
        <span class="tw-text-sm">Info</span>
        <VcStatus variant="info">Processing</VcStatus>
      </div>

      <div class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded">
        <span class="tw-text-sm">Primary</span>
        <VcStatus variant="primary">New</VcStatus>
      </div>

      <div class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded">
        <span class="tw-text-sm">Secondary</span>
        <VcStatus variant="secondary">Inactive</VcStatus>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcStatus } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Key Points

### Variants
- `success` - Green, for completed, active, operational states
- `warning` - Yellow/Orange, for pending, degraded, attention needed
- `danger` - Red, for failed, error, cancelled, critical states
- `info` - Light blue, for processing, in-progress, informational
- `primary` - Blue, for new, default, highlighted items
- `secondary` - Gray, for inactive, draft, disabled states

### Common Use Cases

1. **Order Status**: Show order lifecycle
```vue
<VcStatus :variant="getOrderVariant(order.status)">
  {{ order.status }}
</VcStatus>
```

2. **Product Availability**: Stock and publication status
```vue
<VcStatus :variant="product.inStock ? 'success' : 'danger'">
  {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
</VcStatus>
```

3. **Service Health**: System status monitoring
```vue
<VcStatus :variant="service.healthy ? 'success' : 'danger'">
  {{ service.healthy ? 'Operational' : 'Outage' }}
</VcStatus>
```

4. **User Presence**: Online/offline indicators
```vue
<VcStatus :variant="user.online ? 'success' : 'secondary'">
  {{ user.online ? 'Online' : 'Offline' }}
</VcStatus>
```

5. **Workflow Steps**: Process tracking
```vue
<VcStatus :variant="step.completed ? 'success' : 'info'">
  {{ step.status }}
</VcStatus>
```

### Best Practices

- Use semantic variant names that match meaning (success=completed, danger=failed)
- Always translate status text with i18n (`$t()`)
- Create helper functions for consistent variant mapping
- Combine with icons for visual clarity
- Add animations (pulse) for real-time statuses
- Group related statuses in tables or cards
- Use in table columns for quick scanning
- Keep status text short (1-2 words)
- Consider color-blind users (use icons alongside colors)
- Document status meanings in tooltips for complex workflows


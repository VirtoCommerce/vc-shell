# VcStatusIcon Demo

Real-world status icon examples for quick visual indicators.

## Basic Status Icons

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("STATUS.ICONS") }}</h3>

    <div class="tw-grid tw-grid-cols-2 tw-gap-4">
      <div class="tw-flex tw-items-center tw-gap-3">
        <VcStatusIcon variant="success" />
        <span>{{ $t("STATUS.SUCCESS") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-3">
        <VcStatusIcon variant="warning" />
        <span>{{ $t("STATUS.WARNING") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-3">
        <VcStatusIcon variant="danger" />
        <span>{{ $t("STATUS.ERROR") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-3">
        <VcStatusIcon variant="info" />
        <span>{{ $t("STATUS.INFO") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-3">
        <VcStatusIcon variant="primary" />
        <span>{{ $t("STATUS.PRIMARY") }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-3">
        <VcStatusIcon variant="secondary" />
        <span>{{ $t("STATUS.INACTIVE") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcStatusIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Status Icons in Table

```vue
<template>
  <VcTable
    :items="items"
    :columns="columns"
    @item-click="onItemClick"
  >
    <template #item_status="{ item }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcStatusIcon :variant="getStatusVariant(item.status)" />
        <span>{{ $t(`SYNC.STATUS.${item.status.toUpperCase()}`) }}</span>
      </div>
    </template>

    <template #item_validated="{ item }">
      <VcStatusIcon :variant="item.validated ? 'success' : 'secondary'" />
    </template>

    <template #item_published="{ item }">
      <VcStatusIcon :variant="item.published ? 'success' : 'danger'" />
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcStatusIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const items = ref([
  {
    id: "1",
    name: "Product A",
    status: "synced",
    validated: true,
    published: true,
  },
  {
    id: "2",
    name: "Product B",
    status: "pending",
    validated: false,
    published: false,
  },
  {
    id: "3",
    name: "Product C",
    status: "error",
    validated: true,
    published: false,
  },
  {
    id: "4",
    name: "Product D",
    status: "syncing",
    validated: true,
    published: true,
  },
]);

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME"), sortable: true },
  { id: "status", title: t("SYNC.STATUS.TITLE") },
  { id: "validated", title: t("PRODUCTS.VALIDATED"), align: "center" },
  { id: "published", title: t("PRODUCTS.PUBLISHED"), align: "center" },
]);

function getStatusVariant(status: string): string {
  const variants: Record<string, string> = {
    synced: "success",
    syncing: "info",
    pending: "warning",
    error: "danger",
  };
  return variants[status] || "secondary";
}

function onItemClick(item: any) {
  console.log("Item clicked:", item.id);
}
</script>
```

## Validation Status

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard :header="$t('VALIDATION.RESULTS')">
      <div class="tw-space-y-3">
        <div
          v-for="check in validationChecks"
          :key="check.id"
          class="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-border tw-rounded"
        >
          <VcStatusIcon :variant="check.passed ? 'success' : 'danger'" />
          <div class="tw-flex-1">
            <div class="tw-font-medium">{{ check.name }}</div>
            <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
              {{ check.description }}
            </div>
          </div>
          <span
            v-if="!check.passed"
            class="tw-text-xs tw-text-[var(--danger-500)]"
          >
            {{ check.error }}
          </span>
        </div>
      </div>
    </VcCard>

    <div class="tw-flex tw-items-center tw-gap-2">
      <VcStatusIcon :variant="allValid ? 'success' : 'danger'" />
      <span class="tw-font-medium">
        {{ allValid ? $t("VALIDATION.ALL_PASSED") : $t("VALIDATION.SOME_FAILED") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcCard, VcStatusIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const validationChecks = ref([
  {
    id: "1",
    name: "Email format",
    description: "Valid email address",
    passed: true,
    error: null,
  },
  {
    id: "2",
    name: "Password strength",
    description: "At least 8 characters with special char",
    passed: false,
    error: "Password too weak",
  },
  {
    id: "3",
    name: "Phone number",
    description: "Valid phone format",
    passed: true,
    error: null,
  },
  {
    id: "4",
    name: "Required fields",
    description: "All required fields filled",
    passed: false,
    error: "Missing 2 required fields",
  },
]);

const allValid = computed(() => validationChecks.value.every(check => check.passed));
</script>
```

## Feature Availability Matrix

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("PLANS.FEATURES") }}</h3>

    <table class="tw-w-full tw-border-collapse">
      <thead>
        <tr class="tw-bg-[var(--neutrals-100)]">
          <th class="tw-p-3 tw-text-left tw-border">{{ $t("PLANS.FEATURE") }}</th>
          <th class="tw-p-3 tw-text-center tw-border">{{ $t("PLANS.FREE") }}</th>
          <th class="tw-p-3 tw-text-center tw-border">{{ $t("PLANS.PRO") }}</th>
          <th class="tw-p-3 tw-text-center tw-border">{{ $t("PLANS.ENTERPRISE") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in features" :key="feature.name">
          <td class="tw-p-3 tw-border">{{ feature.name }}</td>
          <td class="tw-p-3 tw-border tw-text-center">
            <VcStatusIcon
              :variant="feature.free ? 'success' : 'secondary'"
            />
          </td>
          <td class="tw-p-3 tw-border tw-text-center">
            <VcStatusIcon
              :variant="feature.pro ? 'success' : 'secondary'"
            />
          </td>
          <td class="tw-p-3 tw-border tw-text-center">
            <VcStatusIcon
              :variant="feature.enterprise ? 'success' : 'secondary'"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcStatusIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const features = ref([
  { name: "Basic Dashboard", free: true, pro: true, enterprise: true },
  { name: "API Access", free: false, pro: true, enterprise: true },
  { name: "Advanced Analytics", free: false, pro: true, enterprise: true },
  { name: "Custom Integrations", free: false, pro: false, enterprise: true },
  { name: "Priority Support", free: false, pro: true, enterprise: true },
  { name: "White Label", free: false, pro: false, enterprise: true },
]);
</script>
```

## Sync Status Real-time

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard :header="$t('SYNC.TITLE')">
      <div class="tw-space-y-3">
        <div
          v-for="resource in resources"
          :key="resource.id"
          class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded"
        >
          <div class="tw-flex tw-items-center tw-gap-3">
            <VcIcon :icon="resource.icon" size="l" />
            <div>
              <div class="tw-font-medium">{{ resource.name }}</div>
              <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
                {{ $t("SYNC.LAST_SYNC") }}: {{ formatTime(resource.lastSync) }}
              </div>
            </div>
          </div>

          <div class="tw-flex tw-items-center tw-gap-2">
            <VcStatusIcon :variant="resource.variant">
              <div
                v-if="resource.status === 'syncing'"
                class="tw-animate-spin"
              >
                <VcIcon icon="material-sync" size="m" />
              </div>
            </VcStatusIcon>
            <span class="tw-text-sm">
              {{ $t(`SYNC.STATUS.${resource.status.toUpperCase()}`) }}
            </span>
          </div>
        </div>
      </div>
    </VcCard>

    <VcButton
      :disabled="isSyncing"
      @click="syncAll"
    >
      <VcIcon
        icon="material-sync"
        :class="{ 'tw-animate-spin': isSyncing }"
        class="tw-mr-2"
      />
      {{ isSyncing ? $t("SYNC.SYNCING") : $t("SYNC.SYNC_ALL") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcCard, VcIcon, VcStatusIcon, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const resources = ref([
  {
    id: "products",
    name: "Products",
    icon: "material-inventory",
    status: "synced",
    variant: "success",
    lastSync: new Date(),
  },
  {
    id: "orders",
    name: "Orders",
    icon: "material-shopping_cart",
    status: "syncing",
    variant: "info",
    lastSync: new Date(Date.now() - 120000),
  },
  {
    id: "customers",
    name: "Customers",
    icon: "material-people",
    status: "error",
    variant: "danger",
    lastSync: new Date(Date.now() - 300000),
  },
]);

const isSyncing = computed(() => 
  resources.value.some(r => r.status === "syncing")
);

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return t("SYNC.JUST_NOW");
  if (minutes === 1) return t("SYNC.ONE_MINUTE_AGO");
  return t("SYNC.MINUTES_AGO", { minutes });
}

function syncAll() {
  console.log("Syncing all resources...");
  resources.value.forEach(resource => {
    resource.status = "syncing";
    resource.variant = "info";
  });
}
</script>
```

## Checklist with Status Icons

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("ONBOARDING.CHECKLIST") }}</h3>

    <div class="tw-space-y-2">
      <div
        v-for="step in onboardingSteps"
        :key="step.id"
        class="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-border tw-rounded hover:tw-bg-[var(--neutrals-50)] tw-cursor-pointer"
        @click="toggleStep(step.id)"
      >
        <VcStatusIcon :variant="step.completed ? 'success' : 'secondary'" />
        <div class="tw-flex-1">
          <div
            :class="[
              'tw-font-medium',
              step.completed && 'tw-line-through tw-text-[var(--neutrals-400)]'
            ]"
          >
            {{ step.title }}
          </div>
          <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
            {{ step.description }}
          </div>
        </div>
        <VcButton
          v-if="!step.completed"
          size="s"
          outlined
          @click.stop="startStep(step.id)"
        >
          {{ $t("ONBOARDING.START") }}
        </VcButton>
      </div>
    </div>

    <div class="tw-flex tw-items-center tw-gap-2 tw-p-4 tw-bg-[var(--success-50)] tw-rounded">
      <VcStatusIcon variant="success" />
      <span class="tw-font-medium">
        {{ completedCount }} {{ $t("ONBOARDING.OF") }} {{ totalSteps }} {{ $t("ONBOARDING.COMPLETED") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcStatusIcon, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const onboardingSteps = ref([
  {
    id: "1",
    title: "Create your account",
    description: "Set up your profile and preferences",
    completed: true,
  },
  {
    id: "2",
    title: "Add your first product",
    description: "Upload product details and images",
    completed: true,
  },
  {
    id: "3",
    title: "Configure payment",
    description: "Connect your payment gateway",
    completed: false,
  },
  {
    id: "4",
    title: "Customize your store",
    description: "Choose theme and branding",
    completed: false,
  },
  {
    id: "5",
    title: "Launch your store",
    description: "Go live and start selling",
    completed: false,
  },
]);

const completedCount = computed(() => 
  onboardingSteps.value.filter(step => step.completed).length
);

const totalSteps = computed(() => onboardingSteps.value.length);

function toggleStep(id: string) {
  const step = onboardingSteps.value.find(s => s.id === id);
  if (step) {
    step.completed = !step.completed;
  }
}

function startStep(id: string) {
  console.log("Starting step:", id);
}
</script>
```

## Key Points

### Variants
- `success` - Green checkmark icon
- `danger` - Red X or error icon
- `warning` - Yellow warning icon
- `info` - Blue info icon
- `primary` - Blue default icon
- `secondary` - Gray inactive icon

### Common Use Cases

1. **Table Status**: Quick visual indicator in columns
```vue
<template #item_active="{ item }">
  <VcStatusIcon :variant="item.active ? 'success' : 'secondary'" />
</template>
```

2. **Validation Results**: Show pass/fail status
```vue
<VcStatusIcon :variant="validation.passed ? 'success' : 'danger'" />
```

3. **Feature Availability**: Feature comparison tables
```vue
<VcStatusIcon :variant="plan.hasFeature ? 'success' : 'secondary'" />
```

4. **Sync Status**: Real-time sync indicators
```vue
<VcStatusIcon :variant="item.synced ? 'success' : 'warning'" />
```

5. **Checklist Items**: Progress tracking
```vue
<VcStatusIcon :variant="task.completed ? 'success' : 'secondary'" />
```

### Best Practices

- Use for boolean states (yes/no, true/false, active/inactive)
- Pair with text labels for clarity
- Center-align in table columns
- Combine with animations for in-progress states
- Use in compact spaces where full status badges don't fit
- Keep semantic meaning (green=success, red=error)
- Add tooltips for additional context
- Use consistently across similar UI patterns
- Consider accessibility (icons alone may not be clear to all users)


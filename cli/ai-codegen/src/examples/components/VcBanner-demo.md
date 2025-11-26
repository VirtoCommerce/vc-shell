---
id: component-VcBanner-demo
type: COMPONENT
complexity: SIMPLE
category: component
componentRole: display
bladeContext: ["general"]
tags: ["component","banner","alert","notification"]
title: "VcBanner Demo"
description: "Banner component for important messages"
---

# VcBanner Demo

Real-world banner examples for alerts, notifications, and system messages.

## Info Banner with Action

```vue
<template>
  <div class="tw-space-y-4">
    <VcBanner
      variant="info"
      :closable="true"
      @close="onInfoClose"
    >
      <template #default>
        <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
          <span>{{ $t("BANNERS.NEW_FEATURES") }}</span>
          <VcButton
            size="s"
            outlined
            @click="learnMore"
          >
            {{ $t("COMMON.LEARN_MORE") }}
          </VcButton>
        </div>
      </template>
    </VcBanner>
  </div>
</template>

<script setup lang="ts">
import { VcBanner, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function onInfoClose() {
  console.log("Info banner closed");
  // Save to localStorage that user dismissed this banner
  localStorage.setItem("info-banner-dismissed", "true");
}

function learnMore() {
  // Navigate to documentation
  window.open("https://docs.example.com/new-features", "_blank");
}
</script>
```

## Warning Banner for Validation

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Show warning if form has errors -->
    <VcBanner
      v-if="hasErrors"
      variant="warning"
      :closable="false"
    >
      <div class="tw-flex tw-flex-col tw-gap-2">
        <div class="tw-font-medium">
          {{ $t("VALIDATION.ERRORS_FOUND") }}
        </div>
        <ul class="tw-list-disc tw-pl-5 tw-text-sm">
          <li v-for="error in errorMessages" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </VcBanner>

    <VcForm @submit="onSubmit">
      <!-- Form fields -->
      <Field v-slot="{ field, errorMessage }" name="email" :rules="emailRules">
        <VcInput
          v-bind="field"
          :label="$t('VENDOR.EMAIL')"
          :error-message="errorMessage"
        />
      </Field>
    </VcForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcBanner, VcForm, VcInput } from "@vc-shell/framework";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { errors } = useForm();

const hasErrors = computed(() => Object.keys(errors.value).length > 0);

const errorMessages = computed(() => Object.values(errors.value));

function emailRules(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  if (!value.includes("@")) return t("VALIDATION.INVALID_EMAIL");
  return true;
}

function onSubmit() {
  console.log("Form submitted");
}
</script>
```

## Error Banner for API Failures

```vue
<template>
  <div class="tw-space-y-4">
    <VcBanner
      v-if="error"
      variant="danger"
      :closable="true"
      @close="clearError"
    >
      <div class="tw-flex tw-items-start tw-gap-3">
        <VcIcon icon="material-error" size="l" />
        <div class="tw-flex-1">
          <div class="tw-font-bold tw-mb-1">
            {{ $t("ERRORS.API_ERROR") }}
          </div>
          <div class="tw-text-sm">
            {{ error.message }}
          </div>
          <VcButton
            class="tw-mt-2"
            size="s"
            @click="retry"
          >
            {{ $t("COMMON.RETRY") }}
          </VcButton>
        </div>
      </div>
    </VcBanner>

    <!-- @vue-generic {IItem} -->
    <VcTable
      :items="items"
      :columns="columns"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBanner, VcIcon, VcButton, VcTable } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const error = ref<{ message: string } | null>(null);
const loading = ref(false);
const items = ref([]);
const columns = ref([
  { id: "name", title: t("PRODUCTS.NAME") },
  { id: "price", title: t("PRODUCTS.PRICE") },
]);

async function loadData() {
  try {
    loading.value = true;
    error.value = null;
    // Simulate API call
    await new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("Network error")), 1000);
    });
  } catch (e: any) {
    error.value = { message: e.message };
  } finally {
    loading.value = false;
  }
}

function clearError() {
  error.value = null;
}

function retry() {
  loadData();
}
</script>
```

## Success Banner for Saved Changes

```vue
<template>
  <div class="tw-space-y-4">
    <Transition name="fade">
      <VcBanner
        v-if="showSuccessBanner"
        variant="success"
        :closable="true"
        @close="hideSuccess"
      >
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="material-check_circle" />
          <span>{{ successMessage }}</span>
        </div>
      </VcBanner>
    </Transition>

    <VcBlade
      :title="$t('VENDOR.DETAILS')"
      :modified="isModified"
      @save="onSave"
      @cancel="onCancel"
    >
      <!-- Blade content -->
    </VcBlade>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBanner, VcIcon, VcBlade } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const showSuccessBanner = ref(false);
const successMessage = ref("");
const isModified = ref(false);

async function onSave() {
  try {
    // Save data
    await new Promise(resolve => setTimeout(resolve, 500));

    successMessage.value = t("COMMON.SAVED_SUCCESSFULLY");
    showSuccessBanner.value = true;
    isModified.value = false;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      showSuccessBanner.value = false;
    }, 3000);
  } catch (error) {
    console.error("Save failed:", error);
  }
}

function onCancel() {
  isModified.value = false;
}

function hideSuccess() {
  showSuccessBanner.value = false;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Multiple Banners Stack

```vue
<template>
  <div class="tw-space-y-3">
    <!-- System maintenance banner -->
    <VcBanner
      v-if="showMaintenance"
      variant="warning"
      :closable="false"
    >
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon icon="material-build" />
        <span>
          {{ $t("BANNERS.MAINTENANCE_SCHEDULED") }}
          <strong>{{ maintenanceDate }}</strong>
        </span>
      </div>
    </VcBanner>

    <!-- Trial expiration banner -->
    <VcBanner
      v-if="daysLeft <= 7"
      variant="info"
      :closable="true"
      @close="dismissTrial"
    >
      <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
        <span>
          {{ $t("BANNERS.TRIAL_EXPIRES", { days: daysLeft }) }}
        </span>
        <VcButton
          size="s"
          @click="upgradePlan"
        >
          {{ $t("COMMON.UPGRADE") }}
        </VcButton>
      </div>
    </VcBanner>

    <!-- Payment failed banner -->
    <VcBanner
      v-if="paymentFailed"
      variant="danger"
      :closable="false"
    >
      <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="material-payment" />
          <span>{{ $t("BANNERS.PAYMENT_FAILED") }}</span>
        </div>
        <VcButton
          size="s"
          outlined
          @click="updatePayment"
        >
          {{ $t("COMMON.UPDATE_PAYMENT") }}
        </VcButton>
      </div>
    </VcBanner>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBanner, VcIcon, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const showMaintenance = ref(true);
const maintenanceDate = ref("Jan 15, 2025 at 2:00 AM");
const daysLeft = ref(5);
const paymentFailed = ref(false);

function dismissTrial() {
  console.log("Trial banner dismissed");
}

function upgradePlan() {
  // Navigate to upgrade page
  console.log("Upgrade plan");
}

function updatePayment() {
  // Navigate to payment settings
  console.log("Update payment");
}
</script>
```

## Key Points

### Variants
- `info` - Blue, for general information and updates
- `success` - Green, for successful operations
- `warning` - Yellow/Orange, for warnings and important notices
- `danger` - Red, for errors and critical issues

### Closable Behavior
- Use `closable` prop to allow users to dismiss banners
- Persist dismissal state in localStorage for permanent dismissals
- Use `:closable="false"` for critical messages that must be seen

### Common Use Cases

1. **System Notifications**: Show maintenance, updates, new features
```vue
<VcBanner variant="info" :closable="true">
  New features available! Click to learn more.
</VcBanner>
```

2. **Form Validation**: Display validation errors at form top
```vue
<VcBanner v-if="hasErrors" variant="warning" :closable="false">
  Please fix {{ errorCount }} errors before submitting
</VcBanner>
```

3. **API Errors**: Show error messages with retry action
```vue
<VcBanner variant="danger" :closable="true" @close="clearError">
  <div class="tw-flex tw-justify-between">
    <span>{{ error.message }}</span>
    <VcButton @click="retry">Retry</VcButton>
  </div>
</VcBanner>
```

4. **Success Confirmations**: Temporary success messages
```vue
<Transition name="fade">
  <VcBanner v-if="showSuccessBanner" variant="success">
    Changes saved successfully!
  </VcBanner>
</Transition>
```

### Best Practices

- Stack multiple banners vertically with `tw-space-y-3`
- Use icons for visual context (`VcIcon` component)
- Add actions (buttons) for interactive banners
- Auto-hide success banners after 3-5 seconds
- Persist dismissal of informational banners
- Never make error banners closable until issue is resolved
- Use transitions for smooth show/hide animations
- Keep banner text concise and actionable
- Place banners at the top of their context (form, page, blade)


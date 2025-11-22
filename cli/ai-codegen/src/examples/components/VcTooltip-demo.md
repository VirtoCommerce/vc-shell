---
id: component-VcTooltip-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","tooltip","help","display"]
title: "VcTooltip Demo"
description: "Tooltip component for additional information"
componentRole: display
bladeContext: ["details","list","general"]
---

# VcTooltip Demo

Real-world tooltip examples for contextual help, information, and interactive elements.

## Basic Tooltips

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("TOOLTIPS.BASIC") }}</h3>

    <div class="tw-flex tw-flex-wrap tw-gap-4">
      <!-- Simple text tooltip -->
      <VcTooltip>
        <template #trigger>
          <VcButton>{{ $t("COMMON.HOVER_ME") }}</VcButton>
        </template>
        <template #content>
          {{ $t("TOOLTIPS.SIMPLE_TEXT") }}
        </template>
      </VcTooltip>

      <!-- Icon with tooltip -->
      <VcTooltip>
        <template #trigger>
          <VcIcon
            icon="material-info"
            size="l"
            class="tw-text-[var(--info-500)] tw-cursor-help"
          />
        </template>
        <template #content>
          {{ $t("TOOLTIPS.INFO_TEXT") }}
        </template>
      </VcTooltip>

      <!-- Badge with tooltip -->
      <VcTooltip>
        <template #trigger>
          <VcBadge content="NEW" variant="success" />
        </template>
        <template #content>
          {{ $t("TOOLTIPS.NEW_FEATURE") }}
        </template>
      </VcTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcTooltip, VcButton, VcIcon, VcBadge } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Tooltip Placements

```vue
<template>
  <div class="tw-space-y-6">
    <h3 class="tw-font-bold">{{ $t("TOOLTIPS.PLACEMENTS") }}</h3>

    <!-- Top placement -->
    <div class="tw-flex tw-justify-center tw-gap-4">
      <VcTooltip placement="top-start">
        <template #trigger>
          <VcButton size="s">Top Start</VcButton>
        </template>
        <template #content>Top Start Tooltip</template>
      </VcTooltip>

      <VcTooltip placement="top">
        <template #trigger>
          <VcButton size="s">Top</VcButton>
        </template>
        <template #content>Top Tooltip</template>
      </VcTooltip>

      <VcTooltip placement="top-end">
        <template #trigger>
          <VcButton size="s">Top End</VcButton>
        </template>
        <template #content>Top End Tooltip</template>
      </VcTooltip>
    </div>

    <!-- Left and Right -->
    <div class="tw-flex tw-justify-center tw-gap-32">
      <VcTooltip placement="left">
        <template #trigger>
          <VcButton size="s">Left</VcButton>
        </template>
        <template #content>Left Tooltip</template>
      </VcTooltip>

      <VcTooltip placement="right">
        <template #trigger>
          <VcButton size="s">Right</VcButton>
        </template>
        <template #content>Right Tooltip</template>
      </VcTooltip>
    </div>

    <!-- Bottom placement -->
    <div class="tw-flex tw-justify-center tw-gap-4">
      <VcTooltip placement="bottom-start">
        <template #trigger>
          <VcButton size="s">Bottom Start</VcButton>
        </template>
        <template #content>Bottom Start Tooltip</template>
      </VcTooltip>

      <VcTooltip placement="bottom">
        <template #trigger>
          <VcButton size="s">Bottom</VcButton>
        </template>
        <template #content>Bottom Tooltip</template>
      </VcTooltip>

      <VcTooltip placement="bottom-end">
        <template #trigger>
          <VcButton size="s">Bottom End</VcButton>
        </template>
        <template #content>Bottom End Tooltip</template>
      </VcTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcTooltip, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Tooltips in Forms

```vue
<template>
  <VcForm @submit="onSubmit">
    <div class="tw-space-y-4">
      <!-- Field with tooltip -->
      <div>
        <VcLabel :required="true">
          <div class="tw-flex tw-items-center tw-gap-2">
            <span>{{ $t("PRODUCTS.SKU") }}</span>
            <VcTooltip placement="right">
              <template #trigger>
                <VcIcon
                  icon="material-help"
                  size="s"
                  class="tw-text-[var(--neutrals-400)] tw-cursor-help"
                />
              </template>
              <template #content>
                <div class="tw-space-y-1">
                  <div class="tw-font-medium">{{ $t("PRODUCTS.SKU_TOOLTIP.TITLE") }}</div>
                  <div class="tw-text-xs">{{ $t("PRODUCTS.SKU_TOOLTIP.DESCRIPTION") }}</div>
                  <div class="tw-text-xs tw-italic">{{ $t("PRODUCTS.SKU_TOOLTIP.EXAMPLE") }}: PROD-001</div>
                </div>
              </template>
            </VcTooltip>
          </div>
        </VcLabel>
        <VcInput v-model="sku" placeholder="PROD-001" />
      </div>

      <!-- Disabled field with tooltip explaining why -->
      <div>
        <VcLabel>
          <div class="tw-flex tw-items-center tw-gap-2">
            <span>{{ $t("PRODUCTS.INTERNAL_ID") }}</span>
            <VcTooltip>
              <template #trigger>
                <VcIcon
                  icon="material-lock"
                  size="s"
                  class="tw-text-[var(--warning-500)] tw-cursor-help"
                />
              </template>
              <template #content>
                {{ $t("PRODUCTS.INTERNAL_ID_LOCKED") }}
              </template>
            </VcTooltip>
          </div>
        </VcLabel>
        <VcInput v-model="internalId" :disabled="true" />
      </div>

      <!-- Advanced field with detailed tooltip -->
      <div>
        <VcLabel>
          <div class="tw-flex tw-items-center tw-gap-2">
            <span>{{ $t("PRODUCTS.STOCK_THRESHOLD") }}</span>
            <VcTooltip placement="right">
              <template #trigger>
                <VcIcon
                  icon="material-info"
                  size="s"
                  class="tw-text-[var(--info-500)] tw-cursor-help"
                />
              </template>
              <template #content>
                <div class="tw-max-w-xs tw-space-y-2">
                  <div class="tw-font-medium">{{ $t("PRODUCTS.STOCK_THRESHOLD_TOOLTIP.TITLE") }}</div>
                  <ul class="tw-list-disc tw-pl-4 tw-text-xs tw-space-y-1">
                    <li>{{ $t("PRODUCTS.STOCK_THRESHOLD_TOOLTIP.POINT1") }}</li>
                    <li>{{ $t("PRODUCTS.STOCK_THRESHOLD_TOOLTIP.POINT2") }}</li>
                    <li>{{ $t("PRODUCTS.STOCK_THRESHOLD_TOOLTIP.POINT3") }}</li>
                  </ul>
                </div>
              </template>
            </VcTooltip>
          </div>
        </VcLabel>
        <VcInput v-model="stockThreshold" type="number" placeholder="10" />
      </div>
    </div>

    <div class="tw-flex tw-justify-end tw-mt-6">
      <VcButton type="submit" variant="primary">
        {{ $t("COMMON.SAVE") }}
      </VcButton>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcLabel,
  VcInput,
  VcTooltip,
  VcIcon,
  VcForm,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const sku = ref("");
const internalId = ref("AUTO-GENERATED-123");
const stockThreshold = ref(10);

function onSubmit() {
  console.log("Form submitted");
}
</script>
```

## Tooltips in Tables

```vue
<template>
  <VcTable
    :items="items"
    :columns="columns"
  >
    <!-- Status with tooltip -->
    <template #item_status="{ item }">
      <VcTooltip>
        <template #trigger>
          <VcStatus :variant="getStatusVariant(item.status)">
            {{ item.status }}
          </VcStatus>
        </template>
        <template #content>
          <div class="tw-space-y-1">
            <div class="tw-font-medium">{{ $t(`STATUS.${item.status.toUpperCase()}.TITLE`) }}</div>
            <div class="tw-text-xs">{{ $t(`STATUS.${item.status.toUpperCase()}.DESCRIPTION`) }}</div>
            <div class="tw-text-xs tw-text-[var(--neutrals-400)]">
              {{ $t("COMMON.LAST_UPDATED") }}: {{ formatDate(item.lastUpdated) }}
            </div>
          </div>
        </template>
      </VcTooltip>
    </template>

    <!-- Name with truncation tooltip -->
    <template #item_name="{ item }">
      <VcTooltip v-if="item.name.length > 30">
        <template #trigger>
          <span class="tw-truncate tw-max-w-xs tw-block">{{ item.name }}</span>
        </template>
        <template #content>
          {{ item.name }}
        </template>
      </VcTooltip>
      <span v-else>{{ item.name }}</span>
    </template>

    <!-- Actions with tooltips -->
    <template #item_actions="{ item }">
      <div class="tw-flex tw-gap-2">
        <VcTooltip>
          <template #trigger>
            <VcButton
              icon="material-visibility"
              size="s"
              text
              @click="onView(item)"
            />
          </template>
          <template #content>{{ $t("COMMON.VIEW") }}</template>
        </VcTooltip>

        <VcTooltip>
          <template #trigger>
            <VcButton
              icon="material-edit"
              size="s"
              text
              @click="onEdit(item)"
            />
          </template>
          <template #content>{{ $t("COMMON.EDIT") }}</template>
        </VcTooltip>

        <VcTooltip>
          <template #trigger>
            <VcButton
              icon="material-delete"
              size="s"
              text
              variant="danger"
              :disabled="!item.canDelete"
              @click="onDelete(item)"
            />
          </template>
          <template #content>
            {{ item.canDelete ? $t("COMMON.DELETE") : $t("ERRORS.CANNOT_DELETE") }}
          </template>
        </VcTooltip>
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  VcTable,
  VcTooltip,
  VcStatus,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const items = ref([
  {
    id: "1",
    name: "Product A with a very long name that should be truncated in the table",
    status: "active",
    lastUpdated: new Date(),
    canDelete: true,
  },
  {
    id: "2",
    name: "Product B",
    status: "inactive",
    lastUpdated: new Date(),
    canDelete: false,
  },
]);

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME") },
  { id: "status", title: t("PRODUCTS.STATUS") },
  { id: "actions", title: t("COMMON.ACTIONS"), align: "center" },
]);

function getStatusVariant(status: string): string {
  return status === "active" ? "success" : "secondary";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function onView(item: any) {
  console.log("View:", item.id);
}

function onEdit(item: any) {
  console.log("Edit:", item.id);
}

function onDelete(item: any) {
  console.log("Delete:", item.id);
}
</script>
```

## Interactive Tooltips with Actions

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("TOOLTIPS.INTERACTIVE") }}</h3>

    <div class="tw-flex tw-flex-wrap tw-gap-4">
      <!-- Tooltip with link -->
      <VcTooltip>
        <template #trigger>
          <VcBadge content="API" variant="info" clickable />
        </template>
        <template #content>
          <div class="tw-space-y-2">
            <div class="tw-font-medium">{{ $t("API.STATUS") }}</div>
            <div class="tw-text-xs">{{ $t("API.VERSION") }}: v2.1.0</div>
            <VcLink
              href="https://docs.example.com/api"
              target="_blank"
              class="tw-text-xs"
            >
              {{ $t("COMMON.VIEW_DOCS") }}
              <VcIcon icon="material-open_in_new" size="xs" />
            </VcLink>
          </div>
        </template>
      </VcTooltip>

      <!-- Tooltip with actions -->
      <VcTooltip>
        <template #trigger>
          <VcButton>
            {{ $t("SETTINGS.PREFERENCES") }}
            <VcIcon icon="material-settings" size="s" class="tw-ml-2" />
          </VcButton>
        </template>
        <template #content>
          <div class="tw-space-y-2 tw-min-w-[200px]">
            <div class="tw-font-medium tw-mb-2">{{ $t("SETTINGS.QUICK_ACTIONS") }}</div>
            <VcButton
              size="s"
              outlined
              class="tw-w-full tw-justify-start"
              @click="clearCache"
            >
              <VcIcon icon="material-delete_sweep" size="s" class="tw-mr-2" />
              {{ $t("SETTINGS.CLEAR_CACHE") }}
            </VcButton>
            <VcButton
              size="s"
              outlined
              class="tw-w-full tw-justify-start"
              @click="resetSettings"
            >
              <VcIcon icon="material-refresh" size="s" class="tw-mr-2" />
              {{ $t("SETTINGS.RESET") }}
            </VcButton>
          </div>
        </template>
      </VcTooltip>

      <!-- Tooltip with preview -->
      <VcTooltip>
        <template #trigger>
          <VcButton>
            {{ $t("PRODUCTS.PREVIEW") }}
            <VcIcon icon="material-visibility" size="s" class="tw-ml-2" />
          </VcButton>
        </template>
        <template #content>
          <div class="tw-space-y-2">
            <VcImage
              src="https://placehold.co/300x200/2196F3/FFFFFF/png?text=Preview"
              size="l"
              aspect="16x9"
            />
            <div class="tw-text-xs">
              <div class="tw-font-medium">Product Preview</div>
              <div class="tw-text-[var(--neutrals-500)]">Click to view full size</div>
            </div>
          </div>
        </template>
      </VcTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  VcTooltip,
  VcBadge,
  VcButton,
  VcLink,
  VcIcon,
  VcImage,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function clearCache() {
  console.log("Cache cleared");
}

function resetSettings() {
  console.log("Settings reset");
}
</script>
```

## Conditional Tooltips

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("TOOLTIPS.CONDITIONAL") }}</h3>

    <div class="tw-flex tw-flex-wrap tw-gap-4">
      <!-- Show tooltip only if condition is met -->
      <VcTooltip v-if="hasError">
        <template #trigger>
          <VcButton variant="danger">
            <VcIcon icon="material-error" class="tw-mr-2" />
            {{ $t("COMMON.ERROR") }}
          </VcButton>
        </template>
        <template #content>
          <div class="tw-space-y-1">
            <div class="tw-font-medium tw-text-[var(--danger-500)]">
              {{ errorMessage }}
            </div>
            <div class="tw-text-xs">{{ $t("ERRORS.CLICK_FOR_DETAILS") }}</div>
          </div>
        </template>
      </VcTooltip>

      <!-- Show different tooltip based on state -->
      <VcTooltip>
        <template #trigger>
          <VcButton
            :variant="isEnabled ? 'primary' : 'secondary'"
            @click="toggleEnabled"
          >
            {{ isEnabled ? $t("COMMON.ENABLED") : $t("COMMON.DISABLED") }}
          </VcButton>
        </template>
        <template #content>
          {{
            isEnabled
              ? $t("TOOLTIPS.CLICK_TO_DISABLE")
              : $t("TOOLTIPS.CLICK_TO_ENABLE")
          }}
        </template>
      </VcTooltip>

      <!-- Disabled button with explanation tooltip -->
      <VcTooltip>
        <template #trigger>
          <VcButton :disabled="!canSave">
            {{ $t("COMMON.SAVE") }}
          </VcButton>
        </template>
        <template #content>
          {{ canSave ? $t("COMMON.SAVE") : $t("ERRORS.FORM_INVALID") }}
        </template>
      </VcTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTooltip, VcButton, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const hasError = ref(true);
const errorMessage = ref("Connection timeout");
const isEnabled = ref(true);
const canSave = ref(false);

function toggleEnabled() {
  isEnabled.value = !isEnabled.value;
}
</script>
```

## Key Points

### Slots
- `#trigger` - Element that triggers the tooltip (required)
- `#content` - Tooltip content (required)

### Props
- `placement` - Tooltip position: top, bottom, left, right (with -start/-end variants)
- `disabled` - Disable tooltip
- `delay` - Show delay in milliseconds

### Common Use Cases

1. **Help Icons**: Contextual help in forms
```vue
<VcTooltip>
  <template #trigger>
    <VcIcon icon="material-help" class="tw-cursor-help" />
  </template>
  <template #content>Help text here</template>
</VcTooltip>
```

2. **Truncated Text**: Show full text on hover
```vue
<VcTooltip>
  <template #trigger>
    <span class="tw-truncate">{{ longText }}</span>
  </template>
  <template #content>{{ longText }}</template>
</VcTooltip>
```

3. **Action Buttons**: Explain button purpose
```vue
<VcTooltip>
  <template #trigger>
    <VcButton icon="material-delete" />
  </template>
  <template #content>Delete item</template>
</VcTooltip>
```

4. **Disabled Elements**: Explain why disabled
```vue
<VcTooltip>
  <template #trigger>
    <VcButton :disabled="true">Save</VcButton>
  </template>
  <template #content>Form has errors</template>
</VcTooltip>
```

### Best Practices

- Keep tooltip content concise (1-3 sentences)
- Use `placement` to avoid overflow
- Add icons to trigger elements for visual cue
- Use rich content sparingly (images, links, actions)
- Show tooltips on hover for help icons
- Explain disabled states
- Don't repeat visible text in tooltips
- Use for supplementary information only
- Ensure tooltip doesn't cover interactive elements
- Test with keyboard navigation (tooltips should appear on focus)


---
id: composition-details-widgets-registration
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, details, details]
title: "Widgets Registration"
description: "Widgets Registration composition for details blades"
---

# Widgets Registration Pattern

Adds widget lifecycle management for blades.

## Description
Provides:
- useWidgets() composable integration
- Widget registration/unregistration
- Widget props with computed values
- Conditional visibility

## Usage
Combine with form-basic pattern. Adds sidebar widgets to details blades.

## Code

```typescript
import { computed, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";

// Widget components (import your custom widgets)
import EntityRelationsWidget from "./widgets/EntityRelationsWidget.vue";
import EntityHistoryWidget from "./widgets/EntityHistoryWidget.vue";
import EntityStatsWidget from "./widgets/EntityStatsWidget.vue";

// Widgets composable
const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

// Register widgets
function registerWidgets() {
  // Relations widget
  registerWidget(
    {
      id: "entity-relations-widget",
      component: EntityRelationsWidget, // NO markRaw for blade widgets!
      props: {
        entityId: computed(() => entity.value?.id),
        entityType: "product",
      },
      isVisible: computed(() => !!props.param), // Only show for existing items
    },
    blade.value.id
  );

  // History widget
  registerWidget(
    {
      id: "entity-history-widget",
      component: EntityHistoryWidget,
      props: {
        entityId: computed(() => entity.value?.id),
      },
      isVisible: computed(() => !!props.param && entity.value?.createdDate),
    },
    blade.value.id
  );

  // Stats widget
  registerWidget(
    {
      id: "entity-stats-widget",
      component: EntityStatsWidget,
      props: {
        entityId: computed(() => entity.value?.id),
        refresh: computed(() => !modified.value), // Refresh when saved
      },
      isVisible: computed(() => !!entity.value?.id),
    },
    blade.value.id
  );
}

// Cleanup on unmount
onBeforeUnmount(() => {
  unregisterWidget("entity-relations-widget", blade.value.id);
  unregisterWidget("entity-history-widget", blade.value.id);
  unregisterWidget("entity-stats-widget", blade.value.id);
});
```

```typescript
// Call registerWidgets in onMounted
onMounted(async () => {
  if (props.param) {
    await load(props.param);
  }
  registerWidgets();
});
```

```vue
<!-- Example widget component -->
<!-- EntityRelationsWidget.vue -->
<template>
  <VcWidget title="Related Items" icon="lucide-link">
    <VcList :items="relatedItems" :loading="loading">
      <template #item="{ item }">
        <div class="tw-flex tw-justify-between tw-p-2">
          <span>{{ item.name }}</span>
          <VcButton size="xs" @click="removeRelation(item.id)">
            Remove
          </VcButton>
        </div>
      </template>
    </VcList>

    <template #footer>
      <VcButton @click="addRelation" size="sm" block>
        Add Relation
      </VcButton>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { VcWidget, VcList, VcButton } from "@vc-shell/framework";

interface Props {
  entityId?: string;
  entityType: string;
}

const props = defineProps<Props>();

const relatedItems = ref([]);
const loading = ref(false);

async function loadRelations() {
  if (!props.entityId) return;

  loading.value = true;
  try {
    relatedItems.value = await fetchRelations(props.entityId, props.entityType);
  } finally {
    loading.value = false;
  }
}

watch(() => props.entityId, loadRelations, { immediate: true });
</script>
```

# Form Basic Pattern

Core structure for details blades with VcForm and basic save/cancel operations.

## Description
Provides the fundamental structure for a details blade including:
- VcBlade container with toolbar
- VcForm with fields
- Composable for data loading and saving
- Modified state tracking

## Usage
Use this as the foundation for all details blades. Combine with validation, gallery, widgets, etc.

## Code

```vue
<template>
  <VcBlade
    :title="title"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    width="50%"
    @expand="$emit('expand', $event)"
    @close="$emit('close', $event)"
  >
    <VcForm>
      <VcCard :header="$t('GENERAL')">
        <VcInput
          v-model="entity.name"
          :label="$t('NAME')"
          :placeholder="$t('NAME_PLACEHOLDER')"
          required
          @update:model-value="onModified"
        />

        <VcTextarea
          v-model="entity.description"
          :label="$t('DESCRIPTION')"
          :placeholder="$t('DESCRIPTION_PLACEHOLDER')"
          @update:model-value="onModified"
        />

        <VcSwitch
          v-model="entity.isActive"
          :label="$t('ACTIVE')"
          @update:model-value="onModified"
        />
      </VcCard>
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { VcBlade, VcForm, VcCard, VcInput, VcTextarea, VcSwitch } from "@vc-shell/framework";
import type { IBladeToolbar } from "@vc-shell/framework";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<{
  (event: "close", args: unknown): void;
  (event: "expand", args: unknown): void;
}>();

// Composable
const { entity, loading, load, save } = useEntityDetails();

// State
const modified = ref(false);

// Computed
const title = computed(() => (props.param ? entity.value?.name || "Loading..." : "New Item"));

// Toolbar
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "fas fa-save",
    clickHandler: onSave,
    disabled: computed(() => !modified.value || loading.value),
  },
  {
    id: "save-and-close",
    title: "Save & Close",
    icon: "fas fa-check",
    clickHandler: onSaveAndClose,
    disabled: computed(() => !modified.value || loading.value),
  },
  {
    id: "cancel",
    title: "Cancel",
    icon: "fas fa-times",
    clickHandler: onCancel,
  },
]);

// Handlers
function onModified() {
  modified.value = true;
}

async function onSave() {
  loading.value = true;
  try {
    await save(entity.value);
    modified.value = false;
  } catch (error) {
    console.error("Failed to save:", error);
  } finally {
    loading.value = false;
  }
}

async function onSaveAndClose() {
  await onSave();
  if (!loading.value) {
    emit("close", { isSaved: true });
  }
}

function onCancel() {
  if (modified.value) {
    const confirmed = confirm("Discard changes?", "You have unsaved changes.");
    if (confirmed) {
      emit("close", { isSaved: false });
    }
  } else {
    emit("close", { isSaved: false });
  }
}

// Lifecycle
onMounted(async () => {
  if (props.param) {
    await load(props.param);
  }
});
</script>
```

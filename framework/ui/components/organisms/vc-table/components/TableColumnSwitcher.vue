<template>
  <VcDropdownPanel
    :show="show"
    :anchor-ref="anchorRef"
    :title="$t('COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_SWITCHER.TITLE')"
    width="240px"
    max-width="320px"
    @update:show="emit('update:show', $event)"
  >
    <!-- Columns list -->
    <div class="vc-column-switcher-panel__content">
      <label
        v-for="column in columns"
        :key="column.id"
        class="vc-column-switcher-panel__item"
      >
        <input
          type="checkbox"
          :checked="isColumnVisible(column.id)"
          class="vc-column-switcher-panel__checkbox"
          @change="toggleColumn(column.id)"
        />
        <span class="vc-column-switcher-panel__label">
          {{ column.label || column.id }}
        </span>
      </label>
    </div>

    <!-- Actions -->
    <template #footer>
      <VcButton
        variant="outline"
        size="sm"
        @click="handleShowAll"
      >
        {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_SWITCHER.SHOW_ALL") }}
      </VcButton>
      <VcButton
        variant="primary"
        size="sm"
        @click="handleReset"
      >
        {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_SWITCHER.RESET") }}
      </VcButton>
    </template>
  </VcDropdownPanel>
</template>

<script setup lang="ts">
/**
 * TableColumnSwitcher - Panel for toggling column visibility
 *
 * Displays a list of columns with checkboxes to show/hide them.
 * Uses VcDropdownPanel for positioning and backdrop.
 */
import { VcDropdownPanel } from "@ui/components/molecules";
import { VcButton } from "@ui/components/atoms";

interface Column {
  id: string;
  label?: string;
  visible?: boolean;
  /** Initial/default visibility (used by Reset button) */
  defaultVisible?: boolean;
}

interface Props {
  /** Array of columns with id, label, and visibility state */
  columns: Column[];
  /** Array of visible column IDs (controlled mode) */
  visibleColumns?: string[];
  /** Whether panel is visible */
  show: boolean;
  /** Anchor element for positioning the floating panel */
  anchorRef?: HTMLElement | null;
}

const props = withDefaults(defineProps<Props>(), {
  anchorRef: null,
  visibleColumns: undefined,
});

const emit = defineEmits<{
  /** Emitted when visible columns change */
  "update:visibleColumns": [columnIds: string[]];
  /** Emitted to close panel */
  "update:show": [boolean];
}>();

const isColumnVisible = (columnId: string): boolean => {
  if (props.visibleColumns) {
    return props.visibleColumns.includes(columnId);
  }
  const column = props.columns.find((c) => c.id === columnId);
  return column?.visible !== false;
};

const toggleColumn = (columnId: string) => {
  const currentVisible =
    props.visibleColumns ||
    props.columns.filter((c) => c.visible !== false).map((c) => c.id);

  const newVisible = isColumnVisible(columnId)
    ? currentVisible.filter((id) => id !== columnId)
    : [...currentVisible, columnId];

  emit("update:visibleColumns", newVisible);
};

const handleShowAll = () => {
  emit(
    "update:visibleColumns",
    props.columns.map((c) => c.id),
  );
};

const handleReset = () => {
  const defaultVisible = props.columns
    .filter((c) => (c.defaultVisible ?? c.visible) !== false)
    .map((c) => c.id);
  emit("update:visibleColumns", defaultVisible);
};
</script>

<style lang="scss">
.vc-column-switcher-panel {
  &__content {
    @apply tw-p-2;
  }

  &__item {
    @apply tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2 tw-rounded tw-cursor-pointer;
    @apply tw-transition-colors tw-duration-150;

    &:hover {
      @apply tw-bg-neutrals-50;
    }
  }

  &__checkbox {
    @apply tw-cursor-pointer;
    accent-color: var(--primary-500);
  }

  &__label {
    @apply tw-flex-1 tw-text-sm tw-text-neutrals-900;
  }

}
</style>

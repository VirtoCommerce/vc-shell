<template>
  <Transition name="select-bar">
    <div
      v-if="visible"
      class="vc-table-select-all-bar"
    >
      <span class="vc-table-select-all-bar__text">
        <!-- State 1: Select all active (all items across all pages) -->
        <template v-if="allSelected">
          <strong>{{ allSelectedText }}</strong>
        </template>

        <!-- State 2: All items on current page selected, more exist -->
        <template v-else-if="showSelectAllPrompt">
          {{ currentPageSelectedText }}
          <VcButton
            variant="link"
            size="sm"
            class="vc-table-select-all-bar__select-all-link"
            @click="emit('selectAll')"
          >
            {{ selectAllItemsText }}
          </VcButton>
        </template>

      </span>

      <VcButton
        variant="link"
        size="sm"
        class="vc-table-select-all-bar__clear"
        @click="emit('cancel')"
      >
        {{ cancelText }}
      </VcButton>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton } from "@ui/components/atoms";

const props = withDefaults(
  defineProps<{
    /** Number of selected items on the current page */
    selectionCount: number;
    /** Total number of items across all pages */
    totalCount: number;
    /** Whether "select all" mode is active (all items across all pages) */
    allSelected?: boolean;
    /** Whether to show the "Select all X items" prompt */
    showSelectAllPrompt?: boolean;
    /** Custom "Selected" label override */
    selectedLabel?: string;
    /** Custom "Select all X items" label override */
    selectAllLabel?: string;
    /** Custom "Clear selection" label override */
    cancelLabel?: string;
  }>(),
  {
    allSelected: false,
    showSelectAllPrompt: false,
  },
);

const emit = defineEmits<{
  /** Emitted when "Select all items" is clicked */
  selectAll: [];
  /** Emitted when "Clear selection" is clicked */
  cancel: [];
}>();

const { t } = useI18n({ useScope: "global" });

const visible = computed(() => {
  return props.allSelected || props.showSelectAllPrompt;
});

const allSelectedText = computed(() => {
  return t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_SELECTED_COUNT", { count: props.totalCount }, `All ${props.totalCount} items selected`);
});

const currentPageSelectedText = computed(() => {
  return t("COMPONENTS.ORGANISMS.VC_TABLE.CURRENT_PAGE_SELECTED", `All ${props.selectionCount} items on this page are selected.`);
});

const selectAllItemsText = computed(() => {
  if (props.selectAllLabel) return props.selectAllLabel;
  return t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL_COUNT", { count: props.totalCount }, `Select all ${props.totalCount} items`);
});

const cancelText = computed(() => {
  return props.cancelLabel || t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL", "Clear selection");
});
</script>

<style lang="scss">
.vc-table-select-all-bar {
  @apply tw-flex tw-items-center tw-justify-between tw-flex-wrap tw-gap-2 tw-px-4 tw-py-2.5;
  background-color: var(--table-select-bar-bg, var(--warning-50, #fef3c7));
  border-bottom: 1px solid var(--table-select-bar-border, var(--warning-300, #fcd34d));

  &__text {
    @apply tw-text-sm;
    color: var(--table-select-bar-text, var(--warning-800, #92400e));
  }

  &__select-all-link {
    @apply tw-underline;
    color: var(--table-select-bar-link, var(--primary-700, #0369a1));
  }

  &__clear {
    color: var(--table-select-bar-clear, var(--danger-600, #dc2626));
  }
}

// Transition
.select-bar-enter-active,
.select-bar-leave-active {
  @apply tw-transition-all tw-duration-200 tw-ease-in-out;
}

.select-bar-enter-from,
.select-bar-leave-to {
  @apply tw-opacity-0 tw-transform tw--translate-y-2;
}

.select-bar-enter-to,
.select-bar-leave-from {
  @apply tw-opacity-100 tw-transform tw-translate-y-0;
}
</style>

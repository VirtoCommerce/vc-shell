<template>
  <div class="vc-table-add-row">
    <VcButton
      variant="link"
      :icon="icon"
      icon-size="s"
      @click="$emit('add')"
    >
      {{ displayLabel }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
/**
 * TableAddRowButton - Button component for adding new rows to the table
 *
 * Can be placed in header or footer position via VcDataTable's `addRow` prop.
 * Emits 'add' event when clicked.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton } from "../../../atoms";

const { t } = useI18n({ useScope: "global" });

const props = withDefaults(
  defineProps<{
    /** Button label (overrides i18n default) */
    label?: string;
    /** Button icon */
    icon?: string;
  }>(),
  {
    label: undefined,
    icon: "fas fa-plus",
  }
);

defineEmits<{
  /** Emitted when button is clicked */
  add: [];
}>();

const displayLabel = computed(() =>
  props.label ?? t("COMPONENTS.ORGANISMS.VC_TABLE.ADD_ROW")
);
</script>

<style lang="scss">
.vc-table-add-row {
  @apply tw-py-3 tw-px-4 tw-border-t;
  border-color: var(--table-border-color);
}
</style>

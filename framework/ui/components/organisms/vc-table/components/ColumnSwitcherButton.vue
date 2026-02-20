<template>
  <VcButton
    variant="secondary"
    size="sm"
    icon="fas fa-columns"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <span class="vc-column-switcher-button__label">{{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_SWITCHER.BUTTON") }}</span>
  </VcButton>
</template>

<script setup lang="ts">
/**
 * ColumnSwitcherButton - Button to open column switcher panel
 *
 * Shows a columns icon. Uses VcButton with secondary variant.
 */
import { VcButton } from "@ui/components/atoms";

withDefaults(
  defineProps<{
    /** Whether button is disabled */
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

defineEmits<{
  /** Emitted when button is clicked */
  click: [event: Event];
}>();
</script>

<style lang="scss">
.vc-column-switcher-button {
  &__label {
    @apply tw-hidden sm:tw-inline;
  }
}
</style>

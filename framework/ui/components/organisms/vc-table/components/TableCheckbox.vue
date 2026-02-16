<template>
  <div
    class="vc-table-composition__checkbox"
    :class="{ 'vc-table-composition__checkbox--disabled': disabled }"
    @click.stop
  >
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      :indeterminate.prop="indeterminate"
      @change="handleChange"
      class="vc-table-composition__checkbox-input"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  /**
   * Whether the checkbox is checked (v-model support)
   */
  modelValue?: boolean;
  /**
   * Whether the checkbox is checked (alternative prop for non-v-model usage)
   */
  checked?: boolean;
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  /**
   * Indeterminate state (for "Select All" with partial selection)
   */
  indeterminate?: boolean;
}>();

const emit = defineEmits<{
  /** Emitted for v-model support when checkbox state changes */
  "update:modelValue": [value: boolean];
  /** Emitted when checkbox state changes */
  "change": [value: boolean];
}>();

// Support both modelValue and checked props
const isChecked = computed(() => props.modelValue ?? props.checked ?? false);

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
  emit("change", target.checked);
};
</script>

<style lang="scss">
.vc-table-composition__checkbox {
  @apply tw-flex tw-items-center tw-justify-center;

  &--disabled {
    @apply tw-opacity-50 tw-cursor-not-allowed;
  }

  &-input {
    @apply tw-w-4 tw-h-4 tw-cursor-pointer;
    @apply tw-rounded tw-border-2 tw-border-[color:var(--neutrals-300)];
    @apply tw-text-[color:var(--primary-500)];
    @apply focus:tw-ring-2 focus:tw-ring-[color:var(--primary-500)] focus:tw-ring-offset-1;
    @apply checked:tw-bg-[color:var(--primary-500)] checked:tw-border-[color:var(--primary-500)];
    @apply disabled:tw-cursor-not-allowed;

    &:indeterminate {
      @apply tw-bg-[color:var(--primary-500)] tw-border-[color:var(--primary-500)];
    }
  }
}
</style>

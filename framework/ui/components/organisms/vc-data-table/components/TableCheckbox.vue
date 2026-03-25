<template>
  <div
    class="vc-table-composition__checkbox"
    @click.stop
  >
    <VcCheckbox
      :model-value="isChecked"
      :disabled="disabled"
      :indeterminate="indeterminate"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcCheckbox } from "@ui/components/molecules/vc-checkbox";

const props = defineProps<{
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  change: [value: boolean];
}>();

const isChecked = computed(() => props.modelValue ?? props.checked ?? false);

const handleChange = (value: boolean | unknown[]) => {
  const boolValue = typeof value === "boolean" ? value : value.length > 0;
  emit("update:modelValue", boolValue);
  emit("change", boolValue);
};
</script>

<style lang="scss">
.vc-table-composition__checkbox {
  @apply tw-flex tw-items-center tw-justify-center;
}
</style>

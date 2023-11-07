<template>
  <div>
    <!-- Field label -->
    <VcLabel v-if="label">
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      ></VcLabel
    >
    <!-- <div> -->
    <VcFieldType
      :value="modelValue"
      :type="type"
    >
      <VcButton
        v-if="copyable"
        icon="far fa-copy"
        size="m"
        class="tw-ml-2"
        text
        @click="copy(modelValue)"
      ></VcButton>
    </VcFieldType>
  </div>
  <!-- </div> -->
</template>

<script lang="ts" setup>
import { VcLabel } from "./../../";
import VcFieldType from "./_internal/vc-field-type/vc-field-type.vue";

export interface Props {
  /**
   * Field label text
   */
  label?: string;
  /**
   * Field tooltip information
   */
  tooltip?: string;
  /**
   * Field type
   */
  type?: "text" | "date" | "date-ago" | "link";
  /**
   * Field content
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue?: any;
  /**
   * Add button for field content copying
   */
  copyable?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: "text",
});

function copy(value: string) {
  navigator.clipboard?.writeText(value);
}
</script>

<style lang="scss" scoped></style>

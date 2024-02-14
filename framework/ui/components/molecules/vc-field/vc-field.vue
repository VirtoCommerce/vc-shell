<template>
  <div
    :class="[
      {
        'tw-flex-col': orientation === 'vertical',
        'tw-flex-row tw-items-center': orientation === 'horizontal',
      },
      'tw-flex ',
    ]"
  >
    <VcCol :size="aspectRatio[0]">
      <!-- Field label -->
      <VcLabel v-if="label">
        <span>{{ label }}</span>
        <template
          v-if="tooltip"
          #tooltip
          >{{ tooltip }}</template
        ></VcLabel
      >
    </VcCol>
    <VcCol :size="aspectRatio[1]">
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
    </VcCol>
  </div>
</template>

<script lang="ts" setup>
import { VcLabel, VcCol } from "./../../";
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
  type?: "text" | "date" | "date-ago" | "link" | "email";
  /**
   * Field content
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue?: any;
  /**
   * Add button for field content copying
   */
  copyable?: boolean;
  /**
   * Field orientation
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Aspect ratio for columns
   */
  aspectRatio?: [number, number];
}

withDefaults(defineProps<Props>(), {
  type: "text",
  orientation: "vertical",
  aspectRatio: () => [1, 1],
});

function copy(value: string) {
  navigator.clipboard?.writeText(value);
}
</script>

<style lang="scss" scoped></style>

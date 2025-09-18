<template>
  <div
    class="vc-field"
    :class="{
      'vc-field--vertical': orientation === 'vertical',
      'vc-field--horizontal': orientation === 'horizontal',
    }"
  >
    <VcCol :size="aspectRatio[0]">
      <!-- Field label -->
      <VcLabel
        v-if="label"
      >
        <span>{{ label }}</span>
        <template
          v-if="tooltip"
          #tooltip
        >
          {{ tooltip }}
        </template>
      </VcLabel>
    </VcCol>
    <VcCol :size="aspectRatio[1]">
      <VcFieldType
        :value="modelValue"
        :type="type"
        class="vc-field__field-type"
      >
        <VcButton
          v-if="copyable"
          :icon="copyIcon"
          icon-size="m"
          class="vc-field__copy-button"
          text
          @click="copy(modelValue)"
        ></VcButton>
      </VcFieldType>
    </VcCol>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
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

const copyIcon = ref("material-content_copy");

function copy(value: string) {
  navigator.clipboard?.writeText(value);
  copyIcon.value = "material-check";
  setTimeout(() => {
    copyIcon.value = "material-content_copy";
  }, 1000);
}
</script>

<style lang="scss">
.vc-field {
  @apply tw-flex;

  &--vertical {
    @apply tw-flex-col tw-gap-2;
  }

  &--horizontal {
    @apply tw-flex-row tw-items-center;
  }

  &__copy-button {
    @apply tw-ml-2;
  }
}
</style>

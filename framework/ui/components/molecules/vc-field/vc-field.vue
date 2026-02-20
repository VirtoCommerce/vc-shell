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
          aria-label="Copy to clipboard"
          @click="copy(modelValue)"
        ></VcButton>
      </VcFieldType>
    </VcCol>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VcLabel, VcCol } from "@ui/components";
import VcFieldType from "@ui/components/molecules/vc-field/_internal/vc-field-type/vc-field-type.vue";

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

const copyIcon = ref("lucide-copy");

function copy(value: string) {
  navigator.clipboard?.writeText(value);
  copyIcon.value = "lucide-check";
  setTimeout(() => {
    copyIcon.value = "lucide-copy";
  }, 1000);
}
</script>

<style lang="scss">
:root {
  --field-gap: 0.5rem;
}

.vc-field {
  @apply tw-flex;

  &--vertical {
    @apply tw-flex-col;
    gap: var(--field-gap);
  }

  &--horizontal {
    @apply tw-flex-row tw-items-center;
  }

  &__copy-button {
    @apply tw-ml-2;
  }
}
</style>

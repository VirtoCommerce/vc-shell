<template>
  <div class="vc-rating">
    <!-- Rating label -->
    <VcLabel
      v-if="label"
      class="vc-rating__label"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Rating icon -->
    <template v-if="modelValue">
      <template v-if="variant === 'stars'">
        <VcIcon
          v-for="index in modelValue"
          :key="index"
          icon="fas fa-star"
          class="vc-rating__icon"
        ></VcIcon>
        <VcIcon
          v-for="index in max - modelValue"
          :key="index"
          icon="far fa-star"
          class="vc-rating__icon"
        ></VcIcon>
      </template>
      <template v-else>
        <VcIcon
          v-if="variant === 'star-and-text'"
          icon="fas fa-star"
          class="vc-rating__icon"
        ></VcIcon>
        <span class="vc-rating__rating">{{ modelValue }}/{{ max }}</span>
        <slot name="details"></slot>
      </template>
    </template>
    <template v-else>
      <span class="vc-rating__placeholder">{{ placeholder }}</span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { VNode } from "vue";
import { VcLabel, VcIcon } from "./../../";

export interface Props {
  label?: string;
  placeholder?: string;
  tooltip?: string;
  modelValue: number;
  max?: number;
  variant?: "stars" | "star-and-text" | "text";
}

withDefaults(defineProps<Props>(), { max: 5, variant: "stars" });

defineSlots<{
  details: VNode[];
}>();
</script>

<style lang="scss">
:root {
  --rating-placeholder-color: var(--neutrals-400);

  --rating-special-color: var(--warning-500);
  --rating-special-color-hover: var(--warning-600);
  --rating-special-color-disabled: var(--warning-200);
}

.vc-rating {
  @apply tw-align-middle;

  &__placeholder {
    @apply tw-text-[color:var(--rating-placeholder-color)];
  }
  &__icon {
    @apply tw-text-[color:var(--rating-special-color)] tw-mr-1;
    font-size: inherit;
  }
  &__rating {
    @apply tw-mr-1;
  }
}
</style>

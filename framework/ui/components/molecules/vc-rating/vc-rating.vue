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
        <span>{{ tooltip }}</span>
      </template>
    </VcLabel>

    <!-- Rating display -->
    <div
      class="vc-rating__content"
      role="img"
      :aria-label="modelValue ? `Rating: ${modelValue} out of ${max}` : placeholder || 'No rating'"
    >
      <template v-if="modelValue">
        <template v-if="variant === 'stars'">
          <div class="vc-rating__stars">
            <VcIcon
              v-for="index in modelValue"
              :key="index"
              icon="lucide-star"
              class="vc-rating__icon"
            ></VcIcon>
            <VcIcon
              v-for="index in max - modelValue"
              :key="index"
              icon="lucide-star"
              class="vc-rating__icon vc-rating__icon--empty"
            ></VcIcon>
          </div>
        </template>
        <template v-else>
          <div class="vc-rating__text-container">
            <VcIcon
              v-if="variant === 'star-and-text'"
              icon="lucide-star"
              class="vc-rating__icon"
            ></VcIcon>
            <span class="vc-rating__rating">{{ modelValue }}/{{ max }}</span>
            <slot name="details"></slot>
          </div>
        </template>
      </template>
      <template v-else>
        <span class="vc-rating__placeholder">{{ placeholder }}</span>
      </template>
    </div>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { VNode } from "vue";
import { VcLabel, VcIcon } from "@ui/components";

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
  details: (props: any) => VNode[];
}>();
</script>

<style lang="scss">
:root {
  --rating-placeholder-color: var(--neutrals-400);
  --rating-star-size: 1em;
  --rating-gap: 2px;

  --rating-special-color: var(--warning-500);
  --rating-special-color-hover: var(--warning-600);
  --rating-special-color-disabled: var(--warning-200);
}

.vc-rating {
  @apply tw-flex tw-flex-col tw-align-middle;

  &__content {
    @apply tw-flex tw-flex-row tw-items-center;
  }

  &__stars {
    @apply tw-flex tw-flex-row tw-items-center;
    gap: var(--rating-gap);
  }

  &__text-container {
    @apply tw-flex tw-flex-row tw-items-center;
  }

  &__placeholder {
    @apply tw-text-[color:var(--rating-placeholder-color)];
  }

  &__icon {
    @apply tw-text-[color:var(--rating-special-color)];
    font-size: var(--rating-star-size);

    &--empty {
      @apply tw-opacity-40;
    }
  }

  &__rating {
    @apply tw-mr-1;
  }

  &__label {
    @apply tw-mb-1;
  }
}
</style>

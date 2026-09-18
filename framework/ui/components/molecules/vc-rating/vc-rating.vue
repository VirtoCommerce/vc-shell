<template>
  <div
    v-if="bladeLoading"
    class="vc-rating vc-rating--skeleton"
  >
    <VcSkeleton
      v-for="i in 5"
      :key="i"
      variant="circle"
      :width="20"
      :height="20"
    />
  </div>
  <div
    v-else
    class="vc-rating"
  >
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
      :aria-invalid="invalid || undefined"
      :aria-describedby="ariaDescribedBy"
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

    <!-- Validation error, referenced by the control through aria-describedby -->
    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-rating__error"
            :error="true"
          >
            {{ errorMessage }}
          </VcHint>
        </slot>
      </div>
    </Transition>
  </div>
</template>
<script lang="ts" setup>
import type { VNode } from "vue";
import { useBladeLoading } from "@ui/composables/useBladeLoading";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";

const bladeLoading = useBladeLoading();
import { VcLabel } from "@ui/components/atoms/vc-label";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { useFormField } from "@ui/composables/useFormField";
import type { IFormFieldProps } from "@ui/types/form-field";

export interface VcRatingProps extends IFormFieldProps {
  placeholder?: string;
  modelValue?: number;
  max?: number;
  variant?: "stars" | "star-and-text" | "text";
}

const props = withDefaults(defineProps<VcRatingProps>(), { max: 5, variant: "stars" });

// The same source of ids and invalid state every other form control uses, so a
// group-level invalid reaches the rating and the error element can be referenced.
const { errorId, invalid, ariaDescribedBy } = useFormField(props);

defineSlots<{
  details: (props: Record<string, never>) => VNode[];
  error: (props: Record<string, never>) => VNode[];
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

  &--skeleton {
    @apply tw-flex tw-flex-row tw-gap-1;
  }

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

  &__error {
    @apply tw-mt-1;
  }
}
</style>

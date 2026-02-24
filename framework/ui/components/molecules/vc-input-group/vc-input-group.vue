<template>
  <fieldset
    class="vc-input-group"
    :class="[
      {
        'vc-input-group--horizontal': orientation === 'horizontal',
        'vc-input-group--vertical': orientation === 'vertical',
        'vc-input-group--error': invalid,
        'vc-input-group--disabled': disabled,
      },
    ]"
    :disabled="disabled"
    :role="role"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedBy"
    :aria-labelledby="ariaLabelledBy"
    :aria-label="ariaLabel"
  >
    <legend
      v-if="label"
      :id="labelId"
      class="vc-input-group__legend"
    >
      <VcLabel
        :required="required"
        :error="invalid"
      >
        <span>{{ label }}</span>
        <template
          v-if="tooltip"
          #tooltip
          >{{ tooltip }}</template
        >
      </VcLabel>
    </legend>

    <div class="vc-input-group__controls">
      <slot />
    </div>

    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-input-group__error"
            :error="true"
          >
            {{ errorMessage }}
          </VcHint>
        </slot>
      </div>
      <div v-else-if="hint">
        <slot name="hint">
          <VcHint
            :id="hintId"
            class="vc-input-group__hint"
          >
            {{ hint }}
          </VcHint>
        </slot>
      </div>
    </Transition>
  </fieldset>
</template>

<script lang="ts" setup>
import { computed, provide, toRef, useId } from "vue";
import { VcHint, VcLabel } from "@ui/components";
import { InputGroupContextKey } from "@ui/components/molecules/vc-input-group/context";

export interface Props {
  label?: string;
  tooltip?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  role?: "group" | "radiogroup";
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: "vertical",
  role: "group",
});

const uid = useId();
const labelId = computed(() => `vc-input-group-${uid}-label`);
const hintId = computed(() => `vc-input-group-${uid}-hint`);
const errorId = computed(() => `vc-input-group-${uid}-error`);

const invalid = computed(() => !!props.error || !!props.errorMessage);

const describedBy = computed(() => {
  if (invalid.value && props.errorMessage) {
    return errorId.value;
  }

  if (props.hint) {
    return hintId.value;
  }

  return undefined;
});

const ariaLabelledBy = computed(() => {
  if (props.label) {
    return labelId.value;
  }

  return props.ariaLabelledby;
});

provide(InputGroupContextKey, {
  name: toRef(props, "name"),
  disabled: computed(() => !!props.disabled),
  invalid,
  describedBy,
});
</script>

<style lang="scss">
:root {
  --input-group-gap: 0.5rem;
  --input-group-horizontal-gap: 1rem;
  --input-group-legend-spacing: 0.375rem;
}

.vc-input-group {
  @apply tw-flex tw-flex-col tw-gap-[var(--input-group-gap)] tw-min-w-0;

  border: 0;
  margin: 0;
  padding: 0;

  &__legend {
    @apply tw-p-0 tw-m-0 tw-mb-[var(--input-group-legend-spacing)];
  }

  &__controls {
    @apply tw-flex tw-flex-col tw-gap-[var(--input-group-gap)];
  }

  &__hint,
  &__error {
    @apply tw-mt-1;
  }

  &__error {
    @apply [--hint-error-color:var(--danger-500)];
  }

  &--horizontal {
    .vc-input-group__controls {
      @apply tw-flex-row tw-flex-wrap tw-items-start tw-gap-[var(--input-group-horizontal-gap)];
    }
  }

  &--disabled {
    @apply tw-opacity-50;
  }

}
</style>

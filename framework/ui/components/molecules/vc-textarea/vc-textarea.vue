<template>
  <div
    class="vc-textarea"
    :class="{
      'vc-textarea--error': invalid,
      'vc-textarea--disabled': resolvedDisabled,
      'vc-textarea--focus': isFocused,
    }"
  >
    <!-- Textarea label -->
    <VcLabel
      v-if="label"
      :id="labelId"
      :html-for="textareaId"
      class="vc-textarea__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
      :error="invalid"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        <span>{{ tooltip }}</span>
      </template>
    </VcLabel>

    <!-- Textarea field -->
    <div class="vc-textarea__field-wrapper">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        class="vc-textarea__field"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="resolvedDisabled"
        :maxlength="maxlength"
        :aria-invalid="invalid || undefined"
        :aria-required="ariaRequired"
        :aria-describedby="ariaDescribedBy"
        :aria-labelledby="label ? labelId : undefined"
        tabindex="0"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      ></textarea>
    </div>

    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <slot name="error">
          <VcHint
            v-if="errorMessage"
            :id="errorId"
            class="vc-textarea__hint-error"
            :error="true"
          >
            {{ errorMessage }}
          </VcHint>
        </slot>
      </div>
      <div v-else>
        <slot name="hint">
          <VcHint
            v-if="hint"
            :id="hintId"
            class="vc-textarea__desc"
          >
            {{ hint }}
          </VcHint>
        </slot>
      </div>
    </Transition>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref } from "vue";
import { VcHint, VcLabel } from "@ui/components";
import { useFormField } from "@ui/composables/useFormField";
import type { IFormFieldProps } from "@ui/types";

export interface Props extends IFormFieldProps {
  placeholder?: string;
  modelValue?: string;
  /** Helper text displayed below the textarea */
  hint?: string;
  maxlength?: string;
  multilanguage?: boolean;
  currentLanguage?: string;
}

export interface Emits {
  (event: "update:modelValue", value: string | undefined): void;
}

defineSlots<{
  error: (props: any) => any;
  hint: (props: any) => any;
}>();

const props = withDefaults(defineProps<Props>(), {
  name: "Field",
  maxlength: "1024",
});

const emit = defineEmits<Emits>();

const { fieldId: textareaId, labelId, errorId, hintId, invalid, resolvedDisabled, ariaRequired, ariaDescribedBy } =
  useFormField(props);

const textareaRef = ref<HTMLTextAreaElement>();
const isFocused = ref(false);

function onInput(e: Event) {
  const newValue = (e.target as HTMLInputElement).value;
  emit("update:modelValue", newValue);
}

defineExpose({
  focus: () => textareaRef.value?.focus(),
});
</script>

<style lang="scss">
:root {
  --textarea-height: 120px;
  --textarea-border-color: var(--neutrals-300);
  --textarea-text-color: var(--neutrals-800);
  --textarea-border-radius: 6px;
  --textarea-background-color: transparent;
  --textarea-placeholder-color: var(--neutrals-400);

  // Error
  --textarea-text-color-error: var(--danger-500);
  --textarea-border-color-error: var(--danger-500);
  --textarea-error-ring-color: var(--danger-100);

  // Focus
  --textarea-border-color-focus: var(--primary-500);
  --textarea-focus-ring-color: var(--primary-100);

  // Disabled
  --textarea-disabled-text-color: var(--neutrals-500);
}

.vc-textarea {
  &__label {
    @apply tw-mb-2;
  }

  &__field-wrapper {
    @apply tw-border tw-border-solid
      tw-border-[color:var(--textarea-border-color)]
      tw-rounded-[var(--textarea-border-radius)] tw-box-border
      tw-bg-[color:var(--textarea-background-color)] tw-flex tw-items-stretch
      tw-shadow-sm tw-transition-[color,box-shadow] tw-duration-150 tw-ease-in-out
      tw-outline-none;

    textarea {
      @apply tw-text-[color:var(--textarea-text-color)];
    }
  }

  &--error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--textarea-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--textarea-error-ring-color)];
  }

  &--error &__field-wrapper textarea {
    @apply tw-text-[color:var(--textarea-text-color-error)];
  }

  &__hint-error {
    @apply tw-mt-1 [--hint-error-color:var(--textarea-text-color-error)];
  }

  &__desc {
    @apply tw-text-[color:var(--textarea-placeholder-color)] tw-text-sm tw-mt-1;
  }

  &__field {
    @apply tw-w-full tw-resize-y tw-box-border tw-border-none tw-outline-none
      tw-min-h-32
      placeholder:tw-text-[color:var(--textarea-placeholder-color)]
      tw-px-3 tw-py-2 tw-bg-[color:var(--textarea-background-color)] tw-text-sm tw-rounded-[var(--textarea-border-radius)];

    &::-webkit-input-placeholder {
      @apply tw-text-[color:var(--textarea-placeholder-color)];
    }

    &::-moz-placeholder {
      @apply tw-text-[color:var(--textarea-placeholder-color)];
    }

    &::-ms-placeholder {
      @apply tw-text-[color:var(--textarea-placeholder-color)];
    }
  }

  &--disabled &__field-wrapper {
    @apply tw-opacity-50;
  }

  &--disabled &__field-wrapper,
  &--disabled &__field {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
  }

  &--focus &__field-wrapper {
    @apply tw-border-[color:var(--textarea-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--textarea-focus-ring-color)]
      tw-outline-none;
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    @apply tw-transition-all tw-duration-[250ms] tw-ease-out;
  }

  .slide-up-enter-from {
    @apply tw-opacity-0 tw-translate-y-[5px];
  }

  .slide-up-leave-to {
    @apply tw-opacity-0 tw--translate-y-[5px];
  }
}
</style>

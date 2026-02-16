<template>
  <div
    class="vc-textarea"
    :class="{
      'vc-textarea_error': error || !!errorMessage,
      'vc-textarea_disabled': disabled,
      'vc-textarea_focus': isFocused,
    }"
  >
    <!-- Textarea label -->
    <VcLabel
      v-if="label"
      :id="labelId"
      class="vc-textarea__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
      :error="error || !!errorMessage"
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
        :disabled="disabled"
        :maxlength="maxlength"
        :aria-invalid="(error || !!errorMessage) || undefined"
        :aria-describedby="ariaDescribedBy"
        :aria-labelledby="label ? labelId : undefined"
        tabindex="0"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      ></textarea>
    </div>

    <slot
      v-if="error || !!errorMessage"
      name="error"
    >
      <VcHint
        :id="errorId"
        class="vc-textarea__error"
      >
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, ref, useId } from "vue";
import { VcHint, VcLabel } from "./../../";

export interface Props {
  placeholder?: string;
  modelValue?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  name?: string;
  maxlength?: string;
  error?: boolean;
  errorMessage?: string;
  multilanguage?: boolean;
  currentLanguage?: string;
}

export interface Emits {
  (event: "update:modelValue", value: string | undefined): void;
}

defineSlots<{
  error: (props: any) => any;
}>();

const props = withDefaults(defineProps<Props>(), {
  name: "Field",
  maxlength: "1024",
});

const emit = defineEmits<Emits>();

const textareaRef = ref<HTMLTextAreaElement>();
const isFocused = ref(false);

// Accessibility IDs
const uid = useId();
const textareaId = computed(() => `vc-textarea-${uid}`);
const labelId = computed(() => `vc-textarea-${uid}-label`);
const errorId = computed(() => `vc-textarea-${uid}-error`);

const ariaDescribedBy = computed(() => {
  const ids: string[] = [];
  if ((props.error || props.errorMessage) && props.errorMessage) ids.push(errorId.value);
  return ids.length ? ids.join(" ") : undefined;
});

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
  --textarea-error-ring-color: rgba(239, 68, 68, 0.2);

  // Focus
  --textarea-border-color-focus: var(--primary-500);
  --textarea-focus-ring-color: rgba(59, 130, 246, 0.3);

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

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--textarea-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--textarea-error-ring-color)];
  }

  &_error &__field-wrapper textarea {
    @apply tw-text-[color:var(--textarea-text-color-error)];
  }

  &__error {
    @apply tw-text-[color:var(--textarea-border-color-error)] tw-mt-1;
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

  &_disabled &__field-wrapper {
    @apply tw-opacity-50;
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
  }

  &_focus &__field-wrapper {
    @apply tw-border-[color:var(--textarea-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--textarea-focus-ring-color)]
      tw-outline-none;
  }
}
</style>

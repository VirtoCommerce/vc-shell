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
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Textarea field -->
    <div class="vc-textarea__field-wrapper">
      <textarea
        ref="textareaRef"
        class="vc-textarea__field"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :maxlength="maxlength"
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
      <VcHint class="vc-textarea__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
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
  error: void;
}>();

withDefaults(defineProps<Props>(), {
  name: "Field",
  maxlength: "1024",
});

const emit = defineEmits<Emits>();

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
  --textarea-border-color: var(--neutrals-200);
  --textarea-text-color: var(--neutrals-800);

  --textarea-border-radius: 4px;
  --textarea-background-color: var(--additional-50);
  --textarea-placeholder-color: var(--neutrals-400);

  // Error
  --textarea-text-color-error: var(--danger-500);
  --textarea-border-color-error: var(--danger-500);

  // Focus
  --textarea-border-color-focus: var(--primary-50);

  // Disabled
  --textarea-disabled-background-color: var(--neutrals-50);
  --textarea-disabled-text-color: var(--neutrals-400);
}

.vc-textarea {
  &__label {
    @apply tw-mb-2;
  }

  &__field-wrapper {
    @apply tw-border tw-border-solid
      tw-border-[color:var(--textarea-border-color)]
      tw-rounded-[var(--textarea-border-radius)] tw-box-border
      tw-bg-[color:var(--textarea-background-color)] tw-flex tw-items-stretch;

    textarea {
      @apply tw-text-[color:var(--textarea-text-color)];
    }
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--textarea-border-color-error)];
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
      tw-px-3 tw-py-2 tw-bg-[color:var(--textarea-background-color)] tw-text-sm;

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

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[var(--textarea-disabled-background-color)] tw-text-[var(--textarea-disabled-text-color)];
  }

  &_focus &__field-wrapper {
    @apply tw-outline-2 tw-outline tw-outline-[color:var(--textarea-border-color-focus)] tw-outline-offset-[0px];
  }
}
</style>

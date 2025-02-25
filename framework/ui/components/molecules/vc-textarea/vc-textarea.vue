<template>
  <div
    class="vc-textarea"
    :class="{
      'vc-textarea_error': errorMessage,
      'vc-textarea_disabled': disabled,
    }"
  >
    <!-- Textarea label -->
    <VcLabel
      v-if="label"
      class="vc-textarea__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
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
        @input="onInput"
      ></textarea>
    </div>

    <slot
      v-if="errorMessage"
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
  --textarea-border-color: var(--secondary-200);
  --textarea-border-color-error: var(--base-error-color, var(--danger-500));
  --textarea-border-radius: 3px;
  --textarea-background-color: var(--additional-50);
  --textarea-placeholder-color: var(--neutrals-400);
  --textarea-disabled-background-color: var(--neutrals-100);
  --textarea-disabled-text-color: var(--neutrals-700);
}

.vc-textarea {
  &__label {
    @apply tw-mb-2;
  }

  &__field-wrapper {
    @apply tw-border tw-border-solid
      tw-border-[color:var(--textarea-border-color)]
      tw-rounded-sm tw-box-border
      tw-bg-[color:var(--textarea-background-color)] tw-flex tw-items-stretch;
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--textarea-border-color-error)];
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
}
</style>

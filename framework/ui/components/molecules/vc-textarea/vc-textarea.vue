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
      class="tw-mb-2"
      :required="required"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        v-slot:tooltip
      >
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Textarea field -->
    <div class="vc-textarea__field-wrapper">
      <textarea
        class="vc-textarea__field"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
        :maxlength="maxchars"
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
import { watch } from "vue";
import { VcLabel } from "./../../../components";

export interface Props {
  placeholder?: string;
  modelValue?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  name?: string;
  maxchars?: string;
  errorMessage?: string;
}

export interface Emits {
  (event: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  name: "Field",
  maxchars: "1024",
});

const emit = defineEmits<Emits>();

watch(
  () => props.modelValue,
  (value) => {
    emit("update:modelValue", value);
  }
);

// Handle input event to propertly validate value and emit changes
function onInput(e: Event) {
  const newValue = (e.target as HTMLInputElement).value;
  emit("update:modelValue", newValue);
}
</script>

<style lang="scss">
:root {
  --textarea-height: 120px;
  --textarea-border-color: #d3dbe9;
  --textarea-border-color-error: #f14e4e;
  --textarea-border-radius: 3px;
  --textarea-background-color: #ffffff;
  --textarea-placeholder-color: #a5a5a5;
}

.vc-textarea {
  &__field-wrapper {
    @apply tw-border tw-border-solid
      tw-border-[color:var(--textarea-border-color)]
      tw-rounded-[var(--textarea-border-radius)]
      tw-box-border
      tw-bg-[color:var(--textarea-background-color)] tw-flex tw-items-stretch;
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--textarea-border-color-error)];
  }

  &__error {
    @apply tw-text-[color:var(--textarea-border-color-error)] tw-mt-1 #{!important};
  }

  &__field {
    @apply tw-w-full tw-resize-y tw-box-border tw-border-none tw-outline-none
    tw-min-h-[var(--textarea-height)]
    placeholder:tw-text-[color:var(--textarea-placeholder-color)]
    tw-px-3 tw-py-2;

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
    @apply tw-bg-[#fafafa] tw-text-[#424242];
  }
}
</style>

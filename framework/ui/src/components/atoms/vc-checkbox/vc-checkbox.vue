<template>
  <div class="vc-checkbox" :class="{ 'vc-checkbox_disabled': disabled }">
    <label class="vc-checkbox__label">
      <input
        type="checkbox"
        class="vc-checkbox__input"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      />
      <span class="vc-checkbox__checkmark"></span>
      <div v-if="$slots['default']" class="ml-2">
        <slot></slot>
      </div>
      <span
        v-if="required"
        class="text-[color:var(--checkbox-required-color)] ml-1"
        >*</span
      >
    </label>

    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-checkbox__error mt-1">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { useField } from "vee-validate";
import { watch, getCurrentInstance } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  required: {
    type: Boolean,
    default: false,
  },

  name: {
    type: String,
    default: "Field",
  },
});
const emit = defineEmits(["update:modelValue"]);
const instance = getCurrentInstance();

// Prepare field-level validation
const { errorMessage, handleChange } = useField(
  `${instance?.uid || props.name}`,
  props.required ? "required" : "",
  {
    initialValue: props.modelValue,
  }
);

watch(
  () => props.modelValue,
  (value) => {
    handleChange(value);
  }
);

// Handle input event to propertly validate value and emit changes
function onChange(e: InputEvent) {
  const newValue = (e.target as HTMLInputElement).checked;
  emit("update:modelValue", newValue);
}
</script>

<style lang="scss">
:root {
  --checkbox-size: 14px;
  --checkbox-border-radius: 2px;
  --checkbox-background-color: #ffffff;
  --checkbox-image: url("data:image/svg+xml;utf8,<svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='0.8' y='0.8' width='12.4' height='12.4' rx='1.7' stroke='%23ABC0D3' stroke-width='1.6'/></svg>");
  --checkbox-image-checked: url("data:image/svg+xml;utf8,<svg width='15' height='14' viewBox='0 0 15 14' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M11.91 2.49661C12.4736 1.9331 13.3872 1.9331 13.9507 2.49661C14.5142 3.06011 14.5142 3.97374 13.9507 4.53725L7.7195 10.7684C7.52877 10.9592 7.29793 11.0853 7.05413 11.147C6.56096 11.2966 6.00345 11.1765 5.61355 10.7866L3.27419 8.44723C2.71069 7.88372 2.71069 6.97009 3.27419 6.40659C3.8377 5.84308 4.75133 5.84308 5.31484 6.40658L6.65745 7.7492L11.91 2.49661Z' fill='%23ABC0D3'/><path fill-rule='evenodd' clip-rule='evenodd' d='M2.85185 0C1.27682 0 0 1.27682 0 2.85185V11.1481C0 12.7232 1.27682 14 2.85185 14H11.1481C12.7232 14 14 12.7232 14 11.1481V7.25926H12.4444V11.1481C12.4444 11.8641 11.8641 12.4444 11.1481 12.4444H2.85185C2.13593 12.4444 1.55556 11.8641 1.55556 11.1481V2.85185C1.55556 2.13593 2.13593 1.55556 2.85185 1.55556H11.1481C11.474 1.55556 11.7718 1.6758 11.9996 1.87434L13.3636 1.05592C12.8407 0.411698 12.0425 0 11.1481 0H2.85185Z' fill='%23ABC0D3'/></svg>");
  --checkbox-color-error: #f14e4e;
  --checkbox-required-color: #f14e4e;
}

.vc-checkbox {
  &__label {
    @apply inline-flex select-none cursor-pointer text-base items-center;
  }

  &__input {
    @apply absolute opacity-0 z-[-1] m-0;
  }

  &__error {
    --hint-color: var(--checkbox-color-error);
  }

  &__checkmark {
    @apply h-[var(--checkbox-size)];

    &:before {
      @apply inline-block box-border
      w-[var(--checkbox-size)]
      h-[var(--checkbox-size)]
      shrink-0
      grow-0
      rounded-[var(--checkbox-border-radius)]
      bg-no-repeat
      bg-left-top
      bg-[length:auto_var(--checkbox-size)]
      bg-[color:var(--checkbox-background-color)]
      bg-[image:var(--checkbox-image)]
      content-[""];
    }
  }

  &__input:checked ~ &__checkmark:before {
    @apply bg-[image:var(--checkbox-image-checked)];
  }

  &_disabled &__checkmark:before {
    @apply bg-[#fafafa];
  }

  &_disabled &__label {
    @apply cursor-auto;
  }
}
</style>

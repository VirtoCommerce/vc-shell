<template>
  <div
    class="vc-input"
    :class="[
      `vc-input_${type}`,
      {
        'vc-input_clearable': clearable,
        'vc-input_error': errorMessage,
        'vc-input_disabled': disabled,
      },
    ]"
  >
    <!-- Input label -->
    <VcLabel v-if="label" class="mb-2" :required="isRequired">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <!-- Input field -->
    <div class="vc-input__field-wrapper">
      <input
        class="vc-input__field"
        :placeholder="placeholder"
        :type="internalType"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
        @change="onInput"
        @blur="$emit('blur')"
        :max="max"
        :name="name"
        :maxlength="maxchars"
      />

      <!-- Input clear button -->
      <div
        v-if="clearable && modelValue && !disabled && type !== 'password'"
        class="vc-input__clear"
        @click="onReset"
      >
        <VcIcon size="s" icon="fas fa-times"></VcIcon>
      </div>

      <div
        class="vc-input__showhide"
        v-if="type === 'password' && internalType === 'password'"
        @click="internalType = 'text'"
      >
        <VcIcon size="s" icon="fas fa-eye-slash"></VcIcon>
      </div>

      <div
        class="vc-input__showhide"
        v-if="type === 'password' && internalType === 'text'"
        @click="internalType = 'password'"
      >
        <VcIcon size="s" icon="fas fa-eye"></VcIcon>
      </div>
    </div>

    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-input__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
    <slot v-if="fieldDescription" name="error">
      <VcHint class="vc-input__desc">
        {{ fieldDescription }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import {
  getCurrentInstance,
  ref,
  unref,
} from "vue";
import { VcIcon, VcLabel } from "@components";
import {useField} from "vee-validate";

export type ValueType = string | number | null;

export interface Props {
  placeholder?: string;
  modelValue?: ValueType;
  clearable?: boolean;
  isRequired?: boolean;
  disabled?: boolean;
  type?: "url" | "text" | "password" | "email" | "search";
  label?: string;
  tooltip?: string;
  name: string;
  fieldDescription?: string;
  maxchars?: string;
  max?: string | number;
  errorMessage?: string
}

export interface Emits {
  (event: "update:modelValue", value: ValueType): void;
  (event: 'blur'): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
  modelValue: null,
  clearable: false,
  isRequired: false,
  disabled: false,
  type: "text",
  name: "Field",
  fieldDescription: "",
  maxchars: "1024",
});

const emit = defineEmits<Emits>();

const internalType = ref(unref(props.type));
const instance = getCurrentInstance();
const search = ref("");
const searchInput = ref();

// Handle input event to properly validate value and emit changes
function onInput(e: Event) {
  const newValue = (e.target as HTMLInputElement).value;
  if (newValue) {
    emit("update:modelValue", newValue);
  } else {
    emit("update:modelValue", null);
  }
}

// Handle input event to propertly reset value and emit changes
function onReset() {
  emit("update:modelValue", null);
}
</script>

<style lang="scss">
:root {
  --input-height: 38px;
  --input-border-radius: 3px;
  --input-border-color: #d3dbe9;
  --input-border-color-error: #f14e4e;
  --input-background-color: #ffffff;
  --input-placeholder-color: #a5a5a5;
  --input-clear-color: #43b0e6;
  --input-clear-color-hover: #319ed4;
}

.vc-input {
  @apply overflow-hidden;

  &__field-wrapper {
    @apply border border-solid border-[color:var(--input-border-color)]
    rounded-[var(--input-border-radius)]
    bg-[color:var(--input-background-color)] flex items-stretch;
  }

  &_error &__field-wrapper {
    @apply border border-solid border-[color:var(--input-border-color-error)];
  }

  &__error {
    @apply mt-1 [--hint-color:var(--input-border-color-error)];
  }

  &__desc {
    @apply text-[color:var(--multivalue-placeholder-color)] mt-1 break-words p-0;
  }

  &__field {
    @apply border-none outline-none h-[var(--input-height)] min-w-0 box-border grow pl-3;

    &::-webkit-input-placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::-moz-placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::-ms-placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::-ms-reveal,
    &::-ms-clear {
      @apply hidden;
    }
  }

  &__clear {
    @apply cursor-pointer text-[color:var(--input-clear-color)] hover:text-[color:var(--input-clear-color-hover)] px-3 flex items-center;
  }

  &__showhide {
    @apply cursor-pointer text-[color:var(--input-placeholder-color)] hover:text-[color:var(--input-clear-color-hover)] px-3 flex items-center;
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply bg-[#fafafa] text-[#424242];
  }
}
</style>

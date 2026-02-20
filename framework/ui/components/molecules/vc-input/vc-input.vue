<template>
  <!-- Backward compat delegation: date types -->
  <VcDatePicker
    v-if="type === 'date' || type === 'datetime-local'"
    v-bind="$props"
    @update:model-value="(v: any) => emit('update:modelValue', v)"
    @blur="(v: any) => emit('blur', v)"
    @focus="emit('focus')"
  />
  <!-- Backward compat delegation: color type -->
  <VcColorInput
    v-else-if="type === 'color'"
    :model-value="(modelValue as string) ?? null"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :disabled="disabled"
    :error="error"
    :error-message="errorMessage"
    :required="required"
    :clearable="clearable"
    :loading="loading"
    :autofocus="autofocus"
    :size="size"
    :tooltip="tooltip"
    :multilanguage="multilanguage"
    :current-language="currentLanguage"
    :name="name"
    @update:model-value="(v: any) => emit('update:modelValue', v)"
    @blur="(v: any) => emit('blur', v)"
    @focus="emit('focus')"
  />

  <!-- Clean text input -->
  <div
    v-else
    class="vc-input"
    :class="[
      `vc-input_${type}`,
      {
        'vc-input_clearable': clearable,
        'vc-input_error': invalid,
        'vc-input_disabled': resolvedDisabled,
        'vc-input_focused': isFocused,
      },
    ]"
  >
    <!-- Input label -->
    <VcLabel
      v-if="label"
      :id="labelId"
      :html-for="inputId"
      class="vc-input__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
      :error="invalid"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <div class="vc-input__container">
      <div
        v-if="$slots['prepend']"
        class="vc-input__prepend"
      >
        <slot
          name="prepend"
          :focus="focus"
        ></slot>
      </div>

      <div
        class="vc-input__field-wrapper"
        :class="{
          'vc-input__field-wrapper--default': size === 'default',
          'vc-input__field-wrapper--small': size === 'small',
        }"
      >
        <div class="vc-input__field-container">
          <div
            v-if="$slots['prepend-inner']"
            class="vc-input__prepend-inner"
          >
            <slot
              name="prepend-inner"
              :focus="focus"
            ></slot>
          </div>

          <div class="vc-input__field">
            <div
              v-if="prefix"
              class="vc-input__prefix"
            >
              {{ prefix }}
            </div>

            <slot
              name="control"
              :editable="resolvedDisabled"
              :focused="autofocus"
              :model-value="handleValue"
              :emit-value="emitValue"
              :placeholder="placeholder"
            >
              <input
                :id="inputId"
                ref="inputRef"
                v-model="handleValue"
                :placeholder="placeholder"
                :type="internalTypeComputed"
                :disabled="resolvedDisabled"
                :name="resolvedName"
                :maxlength="maxlength"
                :autofocus="autofocus"
                :aria-invalid="invalid || undefined"
                :aria-required="ariaRequired"
                :aria-describedby="ariaDescribedBy"
                :aria-labelledby="label ? labelId : undefined"
                class="vc-input__input"
                tabindex="0"
                @keydown="onKeyDown"
                @blur="handleBlur"
                @focus="handleFocus"
              />
            </slot>

            <div
              v-if="suffix"
              class="vc-input__suffix"
            >
              {{ suffix }}
            </div>

            <button
              v-if="clearable && mutatedModel && !resolvedDisabled && type !== 'password'"
              type="button"
              class="vc-input__clear"
              aria-label="Clear"
              @click="onReset"
            >
              <VcIcon
                size="xs"
                icon="lucide-x"
              ></VcIcon>
            </button>

            <button
              v-if="type === 'password' && internalType === 'password'"
              type="button"
              class="vc-input__showhide"
              aria-label="Show password"
              @click="internalType = 'text'"
            >
              <VcIcon
                size="s"
                icon="lucide-eye-off"
              ></VcIcon>
            </button>

            <button
              v-if="type === 'password' && internalType === 'text'"
              type="button"
              class="vc-input__showhide"
              aria-label="Hide password"
              @click="internalType = 'password'"
            >
              <VcIcon
                size="s"
                icon="lucide-eye"
              ></VcIcon>
            </button>
          </div>

          <div
            v-if="$slots['append-inner']"
            class="vc-input__append-inner"
          >
            <slot
              name="append-inner"
              :focus="focus"
            ></slot>
          </div>

          <div
            v-if="loading"
            class="vc-input__loading"
          >
            <VcIcon
              icon="lucide-loader-2"
              class="vc-input__loading-icon"
              size="m"
            ></VcIcon>
          </div>
        </div>
      </div>

      <div
        v-if="$slots['append']"
        class="vc-input__append"
      >
        <slot
          name="append"
          :focus="focus"
        ></slot>
      </div>
    </div>

    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-input__hint-error"
            >{{ errorMessage }}</VcHint
          >
        </slot>
      </div>
      <div v-else>
        <slot name="hint">
          <VcHint
            v-if="hint"
            :id="hintId"
            class="vc-input__desc"
            >{{ hint }}</VcHint
          >
        </slot>
      </div>
    </Transition>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, ref, unref, watch } from "vue";
import { VcLabel, VcIcon, VcHint } from "@ui/components";
import { VcDatePicker } from "@ui/components/molecules/vc-date-picker";
import { VcColorInput } from "@ui/components/molecules/vc-color-input";
import { useFormField } from "@ui/composables/useFormField";
import type { VueDatePickerProps, ModelValue } from "@vuepic/vue-datepicker";
import type { ITextFieldProps } from "@ui/types";

/**
 * Base props for VcInput
 */
interface VcInputBaseProps extends ITextFieldProps {
  /**
   * Prefix
   */
  prefix?: string;
  /**
   * Suffix
   */
  suffix?: string;
  /**
   * Debounce amount (in milliseconds) when updating model
   */
  debounce?: string | number;
  /**
   * Specify a max length of model
   * Default value: 1024
   */
  maxlength?: string | number;
  /**
   * The step attribute is a number that specifies the granularity that the value must adhere to.
   */
  step?: string;
}

/**
 * Props for string-based inputs
 */
interface VcInputStringProps extends VcInputBaseProps {
  /**
   * Model of the component; Use with a listener for 'update:model-value' event OR use v-model directive
   */
  modelValue?: string | null;
  /**
   * Input type
   * Default value: text
   */
  type?: "text" | "password" | "email" | "tel" | "url" | "time" | "color";
  datePickerOptions?: never;
}

/**
 * Props for number-based inputs
 */
interface VcInputNumberProps extends VcInputBaseProps {
  /**
   * Model of the component; Use with a listener for 'update:model-value' event OR use v-model directive
   */
  modelValue?: number | null;
  /**
   * Input type
   */
  type: "number" | "integer";
  datePickerOptions?: never;
}

/**
 * Props for date-based inputs
 */
interface VcInputDateProps extends VcInputBaseProps {
  /**
   * Model of the component; Use with a listener for 'update:model-value' event OR use v-model directive
   */
  modelValue?: ModelValue;
  /**
   * Input type
   */
  type: "date" | "datetime-local";
  /**
   * VueDatePicker options
   *
   * Used only when type is 'date' or 'datetime-local'
   *
   * @see https://vue3datepicker.com/
   */
  datePickerOptions?: VueDatePickerProps;
}

export type Props = VcInputStringProps | VcInputNumberProps | VcInputDateProps;

export interface Emits {
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   * Type of value depends on input type:
   * - string inputs: string | null
   * - number inputs: number | null
   * - date inputs: ModelValue
   */
  (event: "update:modelValue", value: string | number | ModelValue | null | undefined): void;
  (event: "blur", value: Event): void;
  (event: "focus"): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  name: "Field",
  maxlength: "1024",
  step: "1",
  size: "default",
});

const emit = defineEmits<Emits>();

defineSlots<{
  /**
   * Slot for controls
   * @param scope
   */
  control: (scope: {
    /**
     * Field is editable
     */
    editable: boolean | undefined;
    /**
     * Field has focus
     */
    focused: boolean | undefined;
    /**
     * Field's value - type depends on input type
     */
    modelValue: string | number | ModelValue | null;
    /**
     * Function that emits an @input event in the context of the field
     * @param value Value to be emitted - type depends on input type
     */
    emitValue: (value: string | number | ModelValue | null) => void;
    /**
     * Field placeholder text
     */
    placeholder: string | undefined;
  }) => any;
  /**
   * Prepend outer field
   */
  prepend: (props: { focus: () => void }) => any;
  /**
   * Prepend inner field
   */
  "prepend-inner": (props: { focus: () => void }) => any;
  /**
   * Append to inner field
   */
  "append-inner": (props: { focus: () => void }) => any;
  /**
   * Append outer field
   */
  append: (props: { focus: () => void }) => any;
  /**
   * Slot for errors
   */
  error: (props: any) => any;
  /**
   * Slot for hint text
   */
  hint: (props: any) => any;
}>();

const { fieldId: inputId, labelId, errorId, hintId, invalid, resolvedDisabled, resolvedName, ariaRequired, ariaDescribedBy } =
  useFormField(props);

let emitTimer: NodeJS.Timeout;
let emitValueFn;
const temp = ref();
const inputRef = ref();
const internalType = ref(unref(props.type));
const isFocused = ref(false);
const mutatedModel = ref();

const internalTypeComputed = computed({
  get() {
    if (internalType.value === "integer") {
      return "number";
    }

    return internalType.value;
  },
  set(value) {
    internalType.value = value;
  },
});

const rawModel = computed(() => unref(props.modelValue));
const handleValue = computed({
  get() {
    return props.type === "integer" || props.type === "number" ? (isNaN(temp.value) ? "" : temp.value) : temp.value;
  },
  set(value) {
    if (props.type === "number" || props.type === "integer") {
      if (value < 0) {
        temp.value = Math.abs(value);
      } else {
        temp.value = value;
      }
    } else {
      temp.value = value;
    }

    onInput(temp.value);
  },
});

watch(
  rawModel,
  (newVal) => {
    if (props.type === "number" && newVal !== null) {
      mutatedModel.value = parseFloat(newVal as string);
    } else if (props.type === "integer" && newVal !== null) {
      mutatedModel.value = Math.trunc(newVal as number);
    } else {
      mutatedModel.value = newVal;
    }

    if (temp.value !== mutatedModel.value) {
      temp.value = mutatedModel.value;
    }
  },
  { immediate: true },
);

function onKeyDown(e: KeyboardEvent) {
  const allowedKeys = ["Backspace", "Delete", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  const keypressed = e.key;

  if (props.type === "number" || props.type === "integer") {
    if (keypressed === "-" || keypressed === "e" || keypressed === "+") {
      e.preventDefault();
    }
  }
  if (props.type === "integer") {
    if (!/^\d$/.test(keypressed) && !allowedKeys.includes(keypressed)) {
      e.preventDefault();
      return;
    }
  }
}

function onInput(value: string | number | ModelValue | null) {
  emitValue(value);
}

function emitValue(val: string | number | ModelValue | null) {
  emitValueFn = () => {
    if (mutatedModel.value !== val) {
      let value;
      if (props.type === "number" && val !== null && val !== undefined) {
        value = val !== "" ? parseFloat(val as string) : null;
      } else if (props.type === "integer" && val !== null && val !== undefined) {
        value = val !== "" ? Math.trunc(parseInt(val as string)) : null;
      } else {
        value = val;
      }

      emit("update:modelValue", value);
    }
    emitValueFn = undefined;
  };

  if (props.debounce !== undefined) {
    clearTimeout(emitTimer);
    emitTimer = setTimeout(emitValueFn, +props.debounce);
  } else {
    emitValueFn();
  }
}

function onReset() {
  temp.value = null;
  emit("update:modelValue", null);
}

function handleBlur(e: Event) {
  isFocused.value = false;
  emit("blur", e);
}

function focus() {
  inputRef.value?.focus();
}

function handleFocus() {
  isFocused.value = true;
  emit("focus");
}
</script>

<style lang="scss">
:root {
  --input-height: 36px;
  --input-height-small: 32px;
  --input-border-radius: 6px;
  --input-border-color: var(--neutrals-300);

  --input-padding: 12px;

  --input-background-color: var(--additional-50);
  --input-placeholder-color: var(--neutrals-400);
  --input-clear-color: var(--neutrals-400);
  --input-clear-color-hover: var(--neutrals-600);
  --input-text-color: var(--neutrals-800);

  // Disabled
  --input-disabled-text-color: var(--neutrals-500);
  --input-disabled-bg-color: var(--neutrals-200);

  // Error
  --input-text-color-error: var(--danger-500);
  --input-border-color-error: var(--danger-500);

  // Focus
  --input-border-color-focus: var(--primary-500);

  // Ring colors
  --input-focus-ring-color: var(--primary-100);
  --input-error-ring-color: var(--danger-100);
}

.vc-input {
  &__label {
    @apply tw-mb-2;
  }

  &__container {
    @apply tw-flex tw-flex-nowrap tw-items-start;
  }

  &__prepend,
  &__append {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pr-3 tw-pl-3;
  }

  &__field-wrapper {
    @apply tw-px-[var(--input-padding)] tw-relative tw-flex tw-flex-nowrap tw-w-full tw-min-w-0 tw-box-border tw-grow
      tw-border tw-border-solid tw-border-[color:var(--input-border-color)]
      tw-rounded-[var(--input-border-radius)] tw-bg-[color:var(--input-background-color)]
      tw-shadow-sm tw-transition-[color,box-shadow] tw-duration-150 tw-ease-in-out
      tw-outline-none;

    &--default {
      @apply tw-h-[var(--input-height)];
    }

    &--small {
      @apply tw-h-[var(--input-height-small)];
    }
  }

  &__field-container {
    @apply tw-flex tw-flex-nowrap tw-flex-auto tw-h-full;
  }

  &__prepend-inner,
  &__append-inner {
    @apply tw-flex tw-items-center tw-flex-nowrap;
  }

  &__append-inner {
    @apply tw-pl-3;
  }

  &__prepend-inner {
    @apply tw-pr-3;
  }

  &__field {
    @apply tw-flex tw-flex-row tw-flex-auto tw-w-full tw-min-w-0;
  }

  &__prefix,
  &__suffix {
    @apply tw-flex tw-items-center tw-flex-wrap tw-pointer-events-none;
  }

  &__prefix {
    @apply tw-pr-3;
  }

  &__suffix {
    @apply tw-pl-3;
  }

  &__clear,
  &__showhide {
    @apply tw-cursor-pointer tw-pl-3;
  }

  &__clear {
    @apply tw-border-none tw-bg-transparent tw-outline-none tw-p-0 tw-cursor-pointer
      tw-text-[color:var(--input-clear-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-flex tw-items-center;
  }

  &__showhide {
    @apply tw-border-none tw-bg-transparent tw-outline-none tw-p-0 tw-cursor-pointer
      tw-text-[color:var(--input-clear-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-flex tw-items-center;
  }

  &__loading {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pl-3;
  }

  &__loading-icon {
    @apply tw-animate-spin tw-text-[color:var(--input-clear-color)];
  }

  &__input {
    background: transparent;
    &:-webkit-autofill,
    &:-webkit-autofill:focus {
      transition:
        background-color 600000s 0s,
        color 600000s 0s;
    }
    &[data-autocompleted] {
      background-color: transparent !important;
    }
  }

  &__field {
    @apply tw-w-auto tw-min-w-0 tw-max-w-full tw-relative tw-flex tw-flex-row tw-flex-auto tw-flex-nowrap [height:inherit];
    input {
      @apply tw-border-none tw-outline-none tw-h-full tw-min-w-0 tw-w-full tw-box-border tw-grow tw-text-sm tw-text-[color:var(--input-text-color)];

      &::-webkit-input-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm;
      }

      &::-moz-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm;
      }

      &::-ms-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm;
      }

      &::placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm;
      }

      &::-ms-reveal,
      &::-ms-clear {
        @apply tw-hidden;
      }
    }
  }

  &__hint-error {
    @apply tw-mt-1 [--hint-color:var(--input-text-color-error)];
  }

  &__desc {
    @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm tw-mt-1;
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--input-error-ring-color)];
  }

  &_error &__field input {
    @apply tw-text-[color:var(--input-text-color-error)];
  }

  &_disabled input {
    @apply tw-text-[color:var(--input-disabled-text-color)] tw-pointer-events-none;
  }

  &_disabled &__field-wrapper {
    @apply tw-opacity-50;
  }

  &_disabled &__field-wrapper,
  &_disabled &__field,
  &_disabled input {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
  }

  &_focused &__field-wrapper {
    @apply tw-border-[color:var(--input-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--input-focus-ring-color)]
      tw-outline-none;
  }

  /* Respond to aria-invalid on child input (future-proof for form systems) */
  &__field-wrapper:has(input[aria-invalid="true"]) {
    @apply tw-border-[color:var(--input-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--input-error-ring-color)];
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.25s ease-out;
  }

  .slide-up-enter-from {
    opacity: 0;
    transform: translateY(5px);
  }

  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }
}
</style>

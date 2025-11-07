<template>
  <div
    class="vc-input"
    :class="[
      `vc-input_${type}`,
      {
        'vc-input_clearable': clearable,
        'vc-input_error': error,
        'vc-input_disabled': disabled,
        'vc-input_focused': isFocused,
      },
    ]"
  >
    <!-- Input label -->
    <VcLabel
      v-if="label"
      class="vc-input__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
      :error="error"
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
              :editable="disabled"
              :focused="autofocus"
              :model-value="handleValue"
              :emit-value="emitValue"
              :placeholder="placeholder"
            >
              <template v-if="type === 'datetime-local' || type === 'date'">
                <VueDatePicker
                  v-model="handleValue"
                  :placeholder="
                    placeholder ||
                    (type === 'datetime-local'
                      ? $t('COMPONENTS.MOLECULES.VC_INPUT.DATE_TIME_PLACEHOLDER')
                      : $t('COMPONENTS.MOLECULES.VC_INPUT.DATE_PLACEHOLDER'))
                  "
                  :disabled="disabled"
                  :name="name"
                  :maxlength="maxlength"
                  :autofocus="autofocus"
                  :max-date="maxDate"
                  time-picker-inline
                  :enable-time-picker="type === 'datetime-local'"
                  :format="formatDateWithLocale"
                  :locale="locale"
                  :start-time="{ hours: 0, minutes: 0 }"
                  :clearable="false"
                  :config="{ closeOnAutoApply: false }"
                  auto-apply
                  :teleport-center="$isMobile.value"
                  :is24="isBrowserLocale24h"
                  v-bind="datePickerOptions"
                  :teleport="$isDesktop.value ? 'body' : undefined"
                  class="vc-input__input"
                  tabindex="0"
                  @keydown="onKeyDown"
                  @focus="handleFocus"
                  @closed="handleBlur"
                  @tooltip-open="handleFocus"
                  @tooltip-close="handleBlur"
                />
              </template>
              <template v-else>
                <input
                  ref="inputRef"
                  v-model="handleValue"
                  :placeholder="placeholder"
                  :type="internalTypeComputed"
                  :disabled="disabled"
                  :name="name"
                  :maxlength="maxlength"
                  :autofocus="autofocus"
                  :max="maxDate"
                  class="vc-input__input"
                  tabindex="0"
                  @keydown="onKeyDown"
                  @blur="handleBlur"
                  @focus="handleFocus"
                />
              </template>
            </slot>

            <div
              v-if="suffix"
              class="vc-input__suffix"
            >
              {{ suffix }}
            </div>

            <!-- Color picker square for color type -->
            <div
              class="vc-input__color-container"
              v-if="type === 'color'"
            >
              <div
                class="vc-input__color-square"
                :style="{ backgroundColor: colorValue || '#ffffff' }"
                tabindex="0"
                @click="openColorPicker"
                @keydown.enter="openColorPicker"
                @keydown.space="openColorPicker"
              >
                <!-- Hidden native color input -->
                <input
                  ref="colorPickerRef"
                  type="color"
                  :value="colorValue"
                  class="vc-input__color-picker-hidden"
                  @change="handleColorPickerChange"
                />
              </div>
            </div>

            <div
              v-if="clearable && mutatedModel && !disabled && type !== 'password'"
              class="vc-input__clear"
              tabindex="0"
              @click="onReset"
              @keydown.enter="onReset"
              @keydown.space="onReset"
            >
              <VcIcon
                size="m"
                icon="material-close"
              ></VcIcon>
            </div>

            <div
              v-if="type === 'password' && internalType === 'password'"
              class="vc-input__showhide"
              tabindex="0"
              @click="internalType = 'text'"
              @keydown.enter="internalType = 'text'"
              @keydown.space="internalType = 'text'"
            >
              <VcIcon
                size="s"
                icon="material-visibility_off"
              ></VcIcon>
            </div>

            <div
              v-if="type === 'password' && internalType === 'text'"
              class="vc-input__showhide"
              tabindex="0"
              @click="internalType = 'password'"
              @keydown.enter="internalType = 'password'"
              @keydown.space="internalType = 'password'"
            >
              <VcIcon
                size="s"
                icon="material-visibility"
              ></VcIcon>
            </div>
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
              icon="lucide-loader"
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
      <div v-if="error">
        <slot name="error">
          <VcHint
            v-if="errorMessage"
            class="vc-input__hint-error"
            >{{ errorMessage }}</VcHint
          >
        </slot>
      </div>
      <div v-else>
        <slot name="hint">
          <VcHint
            v-if="hint"
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
import { computed, ref, unref, watch, nextTick } from "vue";
import { VcLabel, VcIcon, VcHint } from "./../../";
import VueDatePicker, { VueDatePickerProps, ModelValue } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {
  convertColorNameToHex,
  convertHexToColorName,
  isValidHexColor,
  normalizeHexColor,
} from "../../../../shared/utilities";

/**
 * Base props for VcInput
 */
interface VcInputBaseProps {
  /**
   * Input label text
   */
  label?: string;
  /**
   * Input placeholder text
   */
  placeholder?: string;
  /**
   * Input description (hint) text below input component
   */
  hint?: string;
  /**
   * Appends clearable icon when a value is set;
   * When clicked, model becomes null
   */
  clearable?: boolean;
  /**
   * Prefix
   */
  prefix?: string;
  /**
   * Suffix
   */
  suffix?: string;
  /**
   * Used to specify the name of the control; If not specified, it takes the value 'Field'
   */
  name?: string;
  /**
   * Signals the user a process is in progress by displaying a spinner
   */
  loading?: boolean;
  /**
   * Debounce amount (in milliseconds) when updating model
   */
  debounce?: string | number;
  /**
   * Put component in disabled mode
   */
  disabled?: boolean;
  /**
   * Focus field on initial component render
   */
  autofocus?: boolean;
  /**
   * Does field have validation errors?
   */
  error?: boolean;
  /**
   * Validation error message (gets displayed only if 'error' is set to 'true')
   */
  errorMessage?: string;
  /**
   * Specify a max length of model
   * Default value: 1024
   */
  maxlength?: string | number;
  /**
   * Input tooltip information
   */
  tooltip?: string;
  /**
   * Input required state
   */
  required?: boolean;
  /**
   * Input multilanguage state
   */
  multilanguage?: boolean;
  /**
   * Input current language
   */
  currentLanguage?: string;
  /**
   * The step attribute is a number that specifies the granularity that the value must adhere to.
   */
  step?: string;
  size?: "default" | "small";
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

let emitTimer: NodeJS.Timeout;
let emitValueFn;
const temp = ref();
const inputRef = ref();
const locale = window.navigator.language;
const internalType = ref(unref(props.type));
const isFocused = ref(false);
const colorPickerRef = ref();
const colorValue = ref("");

const internalTypeComputed = computed({
  get() {
    if (internalType.value === "integer") {
      return "number";
    }

    if (internalType.value === "color") {
      return "text";
    }

    return internalType.value;
  },
  set(value) {
    internalType.value = value;
  },
});

const maxDate = computed(() => (props.type === "date" && "9999-12-31") || undefined);

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

    // Color type synchronization is handled by watcher

    onInput(temp.value);
  },
});
const mutatedModel = ref();

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

    // Color type initialization is handled by watcher
  },
  { immediate: true },
);

// Watch colorValue changes to sync with text input
watch(
  colorValue,
  (newColorValue) => {
    if (props.type === "color" && newColorValue) {
      // Update the hidden color picker input
      if (colorPickerRef.value) {
        colorPickerRef.value.value = newColorValue;
      }
    }
  },
  { immediate: true },
);

// Watch text input changes to sync with color picker
watch(
  () => temp.value,
  (newValue) => {
    if (props.type === "color" && newValue) {
      // Use nextTick to avoid infinite loops
      nextTick(() => {
        handleColorTextChange(newValue as string);
      });
    }
  },
  { immediate: true },
);

const isBrowserLocale24h = (() => {
  const hr = new Intl.DateTimeFormat(locale, { hour: "numeric" }).format();
  return Number.isInteger(Number(hr));
})();

const formatDateWithLocale = (date: Date | Date[]) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  if (props.type === "datetime-local") {
    options.hour = "numeric";
    options.minute = "numeric";
    options.hour12 = !isBrowserLocale24h;
  }

  const formatSingleDate = (date: Date) => new Intl.DateTimeFormat(locale, options).format(date);

  if (Array.isArray(date)) {
    return date.map(formatSingleDate).join(",");
  } else {
    return formatSingleDate(date);
  }
};

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

// Handle input event and emit changes
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

// Handle input event to properly reset value and emit changes
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

// Color handling functions
function handleColorTextChange(value: string) {
  if (!value || typeof value !== "string") {
    return;
  }

  const trimmedValue = value.trim();

  // If it's already a valid hex, use it directly
  if (isValidHexColor(trimmedValue)) {
    const normalizedHex = normalizeHexColor(trimmedValue);
    colorValue.value = normalizedHex;
    return;
  }

  // Try to convert color name to hex
  const hexColor = convertColorNameToHex(trimmedValue);
  if (hexColor) {
    colorValue.value = hexColor;
  }
}

function handleColorPickerChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target && target.value) {
    const hexColor = normalizeHexColor(target.value);
    colorValue.value = hexColor;
  }
}

function openColorPicker() {
  colorPickerRef.value?.click();
}
</script>

<style lang="scss">
:root {
  --input-height: 36px;
  --input-height-small: 30px;
  --input-border-radius: 4px;
  --input-border-color: var(--neutrals-300);

  --input-padding: 10px;

  --input-background-color: var(--additional-50);
  --input-placeholder-color: var(--neutrals-400);
  --input-clear-color: var(--primary-500);
  --input-clear-color-hover: var(--primary-600);
  --input-text-color: var(--neutrals-800);

  // Disabled
  --input-disabled-text-color: var(--neutrals-500);
  --input-disabled-bg-color: var(--neutrals-200);

  // Error
  --input-text-color-error: var(--danger-500);
  --input-border-color-error: var(--danger-500);

  // Focus
  --input-border-color-focus: var(--primary-100);
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
    @apply tw-px-[var(--input-padding)] tw-relative tw-flex tw-flex-nowrap tw-w-full tw-min-w-0 tw-box-border tw-grow tw-border tw-border-solid tw-border-[color:var(--input-border-color)] tw-rounded-[var(--input-border-radius)] tw-bg-[color:var(--input-background-color)] tw-outline-none;

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
    @apply tw-text-[color:var(--input-clear-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-flex tw-items-center;
  }

  &__showhide {
    @apply tw-text-[color:var(--input-placeholder-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-flex tw-items-center;
  }

  &__loading {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pl-3;
  }

  &__loading-icon {
    @apply tw-animate-spin tw-text-[color:var(--input-clear-color)];
  }

  &__color-container {
    @apply tw-relative tw-flex tw-items-center;
  }
  &__color-square {
    @apply tw-w-5 tw-h-5 tw-rounded tw-border tw-border-solid tw-border-gray-300 tw-cursor-pointer tw-flex tw-items-center tw-justify-center tw-ml-2;

    &:hover {
      @apply tw-border-gray-400;
    }

    &:focus {
      @apply tw-outline-2 tw-outline tw-outline-blue-500 tw-outline-offset-1;
    }
  }

  &__color-picker-hidden {
    @apply tw-opacity-0 tw-absolute tw-pointer-events-none tw-w-0 tw-h-0;
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
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)];
  }

  &_error &__field input {
    @apply tw-text-[color:var(--input-text-color-error)];
  }

  &_disabled input {
    @apply tw-text-[color:var(--input-disabled-text-color)];
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[color:var(--input-disabled-bg-color)] tw-text-[color:var(--input-disabled-text-color)];
  }

  &_focused &__field-wrapper {
    @apply tw-outline-2 tw-outline tw-outline-[color:var(--input-border-color-focus)] tw-outline-offset-[0px];
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

.dp__main {
  @apply tw-flex tw-items-center;

  & > div {
    @apply tw-w-full tw-h-full tw-flex tw-items-center;
  }

  .vc-app_mobile & {
    & > div {
      @apply tw-w-auto tw-h-auto tw-flex-auto tw-items-center;
    }
  }
}

.dp__pm_am_button {
  background: var(--dp-primary-color) !important;
  color: var(--dp-primary-text-color) !important;
  border: none !important;
  padding: var(--dp-common-padding) !important;
  border-radius: var(--dp-border-radius) !important;
  cursor: pointer !important;
}

.dp__input_icons {
  padding: 6px 0 !important;
}

.dp__input {
  @apply tw-font-jakarta !important;

  --dp-input-padding: 6px 12px 6px 12px;

  &::-ms-reveal,
  &::-ms-clear {
    @apply tw-hidden;
  }
}

input.dp__input {
  background-color: var(--input-background-color);
  height: auto;
}

input.dp__input::placeholder {
  color: var(--input-placeholder-color) !important;
  opacity: 1;
}

input.dp__input:disabled {
  background-color: var(--input-disabled-bg-color);
}

.dp__menu_inner {
  @apply tw-font-jakarta tw-text-[14px] !important;
}

.dp--tp-wrap {
  min-width: var(--dp-menu-min-width);
  max-width: 100% !important;
}

.dp__theme_light {
  --dp-background-color: var(--additional-50);
  --dp-text-color: var(--neutrals-800);
  --dp-hover-color: var(--neutrals-200);
  --dp-hover-text-color: var(--neutrals-800);
  --dp-hover-icon-color: var(--neutrals-400);
  --dp-primary-color: var(--primary-500);
  --dp-primary-disabled-color: var(--secondary-400);
  --dp-primary-text-color: var(--neutrals-50);
  --dp-secondary-color: var(--secondary-300);
  --dp-border-color: var(--neutrals-300);
  --dp-menu-border-color: var(--neutrals-300);
  --dp-border-color-hover: var(--neutrals-400);
  --dp-border-color-focus: var(--neutrals-400);
  --dp-disabled-color: var(--input-disabled-bg-color);
  --dp-disabled-color-text: var(--input-disabled-text-color);
  --dp-scroll-bar-background: var(--neutrals-200);
  --dp-scroll-bar-color: var(--neutrals-400);
  --dp-success-color: var(--success-500);
  --dp-success-color-disabled: var(--success-200);
  --dp-icon-color: var(--neutrals-400);
  --dp-danger-color: var(--danger-500);
  --dp-marker-color: var(--danger-500);
  --dp-tooltip-color: var(--additional-50);
  --dp-disabled-color-text: var(--neutrals-400);
  --dp-highlight-color: rgba(25, 118, 210, 0.1);
  --dp-range-between-dates-background-color: var(--dp-hover-color);
  --dp-range-between-dates-text-color: var(--dp-hover-text-color);
  --dp-range-between-border-color: var(--dp-hover-color);
}
</style>

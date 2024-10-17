<template>
  <div
    class="vc-input"
    :class="[
      `vc-input_${type}`,
      {
        'vc-input_clearable': clearable,
        'vc-input_error': error,
        'vc-input_disabled': disabled,
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
                  @keydown="onKeyDown"
                  @blur="handleBlur"
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
                  @keydown="onKeyDown"
                  @blur="handleBlur"
                />
              </template>
            </slot>

            <div
              v-if="suffix"
              class="vc-input__suffix"
            >
              {{ suffix }}
            </div>

            <div
              v-if="clearable && mutatedModel && !disabled && type !== 'password'"
              class="vc-input__clear"
              @click="onReset"
            >
              <VcIcon
                size="s"
                icon="fas fa-times"
              ></VcIcon>
            </div>

            <div
              v-if="type === 'password' && internalType === 'password'"
              class="vc-input__showhide"
              @click="internalType = 'text'"
            >
              <VcIcon
                size="s"
                icon="fas fa-eye-slash"
              ></VcIcon>
            </div>

            <div
              v-if="type === 'password' && internalType === 'text'"
              class="vc-input__showhide"
              @click="internalType = 'password'"
            >
              <VcIcon
                size="s"
                icon="fas fa-eye"
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
              icon="fas fa-circle-notch"
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
            class="vc-input__error"
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
import { computed, ref, unref, watch } from "vue";
import { VcLabel, VcIcon, VcHint } from "./../../";
import VueDatePicker, { VueDatePickerProps } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export interface Props {
  /**
   * Model of the component; Use with a listener for 'update:model-value' event OR use v-model directive
   */
  modelValue?: string | number | Date | null | undefined;
  /**
   * Input label text
   */
  label?: string;
  /**
   * Input placeholder text
   */
  placeholder?: string;
  /**
   * Input type
   * Default value: text
   */
  type?: "text" | "password" | "email" | "tel" | "number" | "integer" | "url" | "time" | "date" | "datetime-local";
  /**
   * The step attribute is a number that specifies the granularity that the value must adhere to.
   */
  step?: string;
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
   * VueDatePicker options
   *
   * Used only when type is 'date' or 'datetime-local'
   *
   * @see https://vue3datepicker.com/
   */
  datePickerOptions?: VueDatePickerProps;
  size?: "default" | "small";
}

export interface Emits {
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   */
  (event: "update:modelValue", value: string | number | Date | null | undefined): void;
  (event: "blur", value: Event): void;
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
     * Field's value
     */
    modelValue: string | number | Date | null;
    /**
     * Function that emits an @input event in the context of the field
     * @param value Value to be emitted
     */
    emitValue: (value: string | number | Date | null) => void;
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
function onInput(value: string | number | Date | null) {
  emitValue(value);
}

function emitValue(val: string | number | Date | null) {
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
  emit("blur", e);
}

function focus() {
  inputRef.value?.focus();
}
</script>

<style lang="scss">
:root {
  --input-height: 38px;
  --input-height-small: 30px;
  --input-border-radius: 3px;
  --input-border-color: var(--secondary-200);
  --input-border-color-error: var(--base-error-color, var(--danger-500));
  --input-background-color: var(--additional-50);
  --input-placeholder-color: var(--neutrals-400);
  --input-clear-color: var(--primary-500);
  --input-clear-color-hover: var(--primary-600);
  --input-disabled-text-color: var(--neutrals-400);
  --input-disabled-bg-color: var(--neutrals-50);
  --input-text-color: var(--base-text-color, var(--neutrals-950));
}

.vc-input {
  @apply tw-overflow-hidden;

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
    @apply tw-px-3 tw-relative tw-flex tw-flex-nowrap tw-w-full tw-outline-none  tw-min-w-0 tw-box-border tw-grow tw-border tw-border-solid tw-border-[color:var(--input-border-color)] tw-rounded-[var(--input-border-radius)] tw-bg-[color:var(--input-background-color)];

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

  &__error {
    @apply tw-mt-1 [--hint-color:var(--input-border-color-error)];
  }

  &__desc {
    @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm tw-mt-1;
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)];
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[color:var(--input-disabled-bg-color)] tw-text-[color:var(--input-disabled-text-color)];
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
  --dp-disabled-color: var(--neutrals-100);
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

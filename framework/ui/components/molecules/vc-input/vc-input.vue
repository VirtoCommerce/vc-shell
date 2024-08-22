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
      class="tw-mb-2"
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

    <div class="tw-flex tw-flex-nowrap tw-items-start">
      <div class="tw-relative tw-flex tw-flex-auto tw-text-left">
        <div
          v-if="$slots['prepend']"
          class="tw-flex tw-items-center tw-flex-nowrap tw-pr-3"
        >
          <slot
            name="prepend"
            :focus="focus"
          ></slot>
        </div>
        <div class="tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-relative">
          <div
            class="vc-input__field-wrapper"
            :class="{
              'tw-h-[var(--input-height)]': size === 'default',
              'tw-h-[var(--input-height-small)]': size === 'small',
            }"
          >
            <div class="tw-flex tw-flex-nowrap tw-flex-auto tw-h-full">
              <div
                v-if="$slots['prepend-inner']"
                class="tw-flex tw-items-center tw-flex-nowrap tw-pr-3"
              >
                <slot
                  name="prepend-inner"
                  :focus="focus"
                ></slot>
              </div>
              <div class="vc-input__field">
                <div
                  v-if="prefix"
                  class="tw-flex tw-items-center tw-flex-wrap tw-pr-3 tw-pointer-events-none"
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
                        placeholder || type === 'datetime-local'
                          ? $t('COMPONENTS.MOLECULES.VC_INPUT.DATE_TIME_PLACEHOLDER')
                          : $t('COMPONENTS.MOLECULES.VC_INPUT.DATE_PLACEHOLDER')
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
                      :start-time="{
                        hours: 0,
                        minutes: 0,
                      }"
                      :clearable="false"
                      :config="{
                        closeOnAutoApply: false,
                      }"
                      auto-apply
                      :teleport-center="$isMobile.value"
                      :is24="isBrowserLocale24h"
                      v-bind="datePickerOptions"
                      :teleport="$isDesktop.value ? 'body' : undefined"
                      class="vc-input__input"
                      @keydown="onKeyDown"
                      @blur="handleBlur"
                    ></VueDatePicker>
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
                  class="tw-flex tw-items-center tw-flex-wrap tw-pl-3 tw-pointer-events-none"
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
                class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
              >
                <slot
                  name="append-inner"
                  :focus="focus"
                ></slot>
              </div>
              <div
                v-if="loading"
                class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
              >
                <VcIcon
                  icon="fas fa-spinner tw-animate-spin"
                  class="tw-text-[var(--input-clear-color)]"
                  size="m"
                ></VcIcon>
              </div>
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
                >
                  {{ errorMessage }}
                </VcHint>
              </slot>
            </div>
            <div v-else>
              <slot name="hint">
                <VcHint
                  v-if="hint"
                  class="vc-input__desc"
                >
                  {{ hint }}
                </VcHint>
              </slot>
            </div>
          </Transition>
        </div>

        <div
          v-if="$slots['append']"
          class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
        >
          <slot
            name="append"
            :focus="focus"
          ></slot>
        </div>
      </div>
    </div>
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
    if (keypressed === "-" || keypressed === "e") {
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
      if (props.type === "number" && val !== null) {
        value = parseFloat(val as string);
      } else if (props.type === "integer" && val !== null) {
        value = Math.trunc(parseInt(val as string));
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
  --input-border-color: #d3dbe9;
  --input-border-color-error: #f14e4e;
  --input-background-color: #ffffff;
  --input-placeholder-color: #a5a5a5;
  --input-clear-color: #43b0e6;
  --input-clear-color-hover: #319ed4;
  --dp-input-padding: 10px 0px 10px 10px;
  --dp-input-icon-padding: 25px;
  --dp-font-size: 13px;
  --dp-font-family: "Roboto", sans-serif;
}

.vc-input {
  @apply tw-overflow-hidden;

  &_date,
  &_datetime-local {
    .vc-app_mobile & {
      @apply tw-max-w-full;
    }
  }

  &__field-wrapper {
    @apply tw-px-3 tw-relative tw-flex tw-flex-nowrap tw-w-full tw-outline-none  tw-min-w-0 tw-box-border tw-grow tw-border tw-border-solid tw-border-[color:var(--input-border-color)] tw-rounded-[var(--input-border-radius)] tw-bg-[color:var(--input-background-color)];
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)];
  }

  &__error {
    @apply tw-mt-1 [--hint-color:var(--input-border-color-error)];
  }

  &__desc {
    @apply tw-text-[color:var(--input-placeholder-color)] tw-mt-1 tw-break-words tw-p-0;
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
      @apply tw-border-none tw-outline-none tw-h-full tw-min-w-0 tw-w-full tw-box-border tw-grow;

      &::-webkit-input-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::-moz-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::-ms-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::-ms-reveal,
      &::-ms-clear {
        @apply tw-hidden;
      }
    }
  }

  &__clear {
    @apply tw-cursor-pointer tw-text-[color:var(--input-clear-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-flex tw-items-center tw-pl-3;
  }

  &__showhide {
    @apply tw-cursor-pointer tw-text-[color:var(--input-placeholder-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-pl-3 tw-flex tw-items-center;
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[#fafafa] tw-text-[#424242];
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

input.dp__input::placeholder {
  color: #818181 !important;
}

.dp--tp-wrap {
  min-width: var(--dp-menu-min-width);
  max-width: 100% !important;
}
</style>

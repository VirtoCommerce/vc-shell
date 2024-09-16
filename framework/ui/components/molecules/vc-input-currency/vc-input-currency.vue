<template>
  <VcSelect
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :searchable="true"
    :debounce="debounce"
    :disabled="disabled"
    :label="label"
    :required="required"
    :model-value="option"
    :tooltip="tooltip"
    @update:model-value="$emit('update:option', $event)"
  >
    <template #control="{ toggleHandler }">
      <VcInput
        :placeholder="placeholder"
        :hint="hint"
        :clearable="clearable"
        :prefix="prefix"
        :suffix="suffix"
        :name="name"
        :model-value="numberValue"
        :loading="loading"
        :disabled="disabled"
        :autofocus="autofocus"
        :error="error"
        :error-message="errorMessage"
        :maxlength="maxlength"
        class="tw-w-full"
        type="number"
        @update:model-value="updateModel"
        @blur="handleBlur"
      >
        <template #append-inner>
          <slot
            name="button"
            :toggle-handler="toggleHandler"
          >
            <template v-if="options && options.length">
              <button
                class="tw-text-[--input-curr-toggle-color] tw-not-italic tw-font-medium tw-text-[13px] tw-leading-[20px] tw-cursor-pointer"
                @click.stop.prevent="toggleHandler"
              >
                {{ unref(option) }}
              </button>
            </template>
          </slot>
          <slot
            v-if="$slots['append-inner']"
            name="append-inner"
          ></slot>
        </template>
        <template #control="{ placeholder: holder }">
          <input
            ref="inputRef"
            type="text"
            :disabled="disabled"
            :placeholder="holder"
            @blur="handleBlur"
            @keydown="handleKeyDown"
            @paste="handlePaste"
          />
        </template>
        <template
          v-if="$slots['prepend-inner']"
          #prepend-inner
        >
          <slot name="prepend-inner"></slot>
        </template>
        <template
          v-if="$slots['append']"
          #append
        >
          <slot name="append"></slot>
        </template>
        <template
          v-if="$slots['prepend']"
          #prepend
        >
          <slot name="prepend"></slot>
        </template>
      </VcInput>
    </template>
  </VcSelect>
</template>

<script lang="ts" setup>
import { useCurrencyInput, CurrencyDisplay } from "vue-currency-input";
import { unref, watch } from "vue";
import { VcSelect, VcInput } from "./../../";
import { OptionProp } from "../vc-select/vc-select.vue";

export interface Props {
  /**
   * Model of the currency component; Use with a listener for 'update:price' event OR use v-model:price directive
   */
  modelValue: number | null | undefined;
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
   * Debounce amount (in milliseconds) for search input
   * Default: 0
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
   * Option label
   */
  option?: string;
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  options?: unknown[];
  /**
   * Property of option which holds the 'value'
   * Default value: id
   * @param option The current option being processed
   * @returns Value of the current option
   */
  optionValue?: OptionProp<unknown>;
  /**
   * Property of option which holds the 'label'
   * Default value: title
   * @param option The current option being processed
   * @returns Label of the current option
   */
  optionLabel?: OptionProp<unknown>;
  /**
   * Currency sign display settings
   */
  currencyDisplay?: `${CurrencyDisplay}`;
  precision?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
}

export interface Emits {
  (event: "update:model-value", value: string | number | null): void;
  (event: "update:option", value: unknown): void;
  (event: "change", value: string | number | null): void;
  (event: "blur", value: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  debounce: 0,
  currencyDisplay: CurrencyDisplay.hidden,
  precision: 2,
});

defineSlots<{
  /**
   * Slot for custom dropdown open handler
   */
  button: (scope: {
    /**
     * Dropdown open/close handler
     */
    toggleHandler: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => any;
  /**
   * Slot for custom append-inner content
   */
  "append-inner": void;
  /**
   * Slot for custom prepend-inner content
   */
  "prepend-inner": void;
  /**
   * Slot for custom append content
   */
  append: void;
  /**
   * Slot for custom prepend content
   */
  prepend: void;
}>();

const emit = defineEmits<Emits>();

const { inputRef, setOptions, numberValue, setValue } = useCurrencyInput(
  {
    locale: navigator.language,
    currency: props.option || "USD",
    currencyDisplay: props.currencyDisplay as CurrencyDisplay,
    hideGroupingSeparatorOnFocus: false,
    precision: props.precision,
    hideCurrencySymbolOnFocus: false,
    hideNegligibleDecimalDigitsOnFocus: false,
  },
  false,
);

// Change currency settings
watch(
  () => props.option,
  (newVal) => {
    if (newVal)
      setOptions({
        locale: navigator.language,
        currency: newVal,
        currencyDisplay: props.currencyDisplay as CurrencyDisplay,
        hideGroupingSeparatorOnFocus: false,
        precision: props.precision,
        hideCurrencySymbolOnFocus: false,
        hideNegligibleDecimalDigitsOnFocus: false,
      });
  },
);

watch(
  () => props.modelValue,
  (value) => {
    setValue(value as number | null);
  },
);

watch(numberValue, (value) => {
  emit("update:model-value", value);
});

function updateModel(value: string | number | Date | null | undefined) {
  inputRef.value.value = value as string;
  numberValue.value = value as number | null;
  emit("update:model-value", value as number);
}

function handleBlur(event: Event) {
  emit("blur", event);
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "-" || e.key === "e") {
    e.preventDefault();
  }
}

function handlePaste(e: ClipboardEvent) {
  const pasteData = e.clipboardData?.getData("text/plain");
  if (typeof pasteData !== "undefined" && parseInt(pasteData) < 0) {
    e.preventDefault();
  }
}
</script>

<style lang="scss">
:root {
  --input-curr-toggle-color: var(--primary-500);
}
</style>

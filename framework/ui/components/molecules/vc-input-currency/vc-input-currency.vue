<template>
  <VcInputDropdown
    class="vc-input-currency"
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :searchable="searchable"
    :debounce="debounce"
    :disabled="disabled"
    :label="label"
    :required="required"
    :option="option"
    :model-value="numberValue"
    :tooltip="tooltip"
    :placeholder="placeholder"
    :hint="hint"
    :clearable="clearable"
    :prefix="prefix"
    :suffix="suffix"
    :name="name"
    :loading="loading"
    :autofocus="autofocus"
    :error="error"
    :error-message="errorMessage"
    :maxlength="maxlength"
    input-type="number"
    @update:model-value="updateModel"
    @update:option="$emit('update:option', $event)"
    @blur="handleBlur"
  >
    <template #control="{ placeholder: holder }">
      <input
        ref="inputRef"
        type="text"
        :disabled="disabled"
        :placeholder="holder"
        class="vc-input-currency__control"
        tabindex="0"
        @blur="handleBlur"
        @keydown="handleKeyDown"
        @paste="handlePaste"
      />
    </template>
  </VcInputDropdown>
</template>

<script lang="ts" setup>
import { useCurrencyInput, CurrencyDisplay } from "vue-currency-input";
import { unref, watch } from "vue";
import { VcInputDropdown } from "./../../molecules/vc-input-dropdown";
import { type OptionProp } from "../vc-select";

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
  /**
   * Enable search in dropdown
   */
  searchable?: boolean;
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
  searchable: false,
});

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
  if (inputRef.value) {
    inputRef.value.value = value as string;
  }
  numberValue.value = typeof value === "number" ? value : value === null ? null : parseFloat(String(value)) || null;
  emit("update:model-value", numberValue.value);
}

function handleBlur(event: Event) {
  emit("blur", event);
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "-" || e.key === "e") {
    e.preventDefault();
  }

  // Navigation with Tab and Enter
  if (e.key === "Tab") {
    // Standard behavior of tabulation
  } else if (e.key === "Enter") {
    // Complete editing and go to the next field
    e.target && (e.target as HTMLElement).blur();

    // Find all tabindex elements and go to the next one
    const allElements = Array.from(document.querySelectorAll('[tabindex="0"]:not(:disabled)'));
    const currentIndex = allElements.indexOf(e.target as HTMLElement);

    if (currentIndex >= 0 && currentIndex < allElements.length - 1) {
      (allElements[currentIndex + 1] as HTMLElement).focus();
    }
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

.vc-input-currency {
  &__control {
    @apply tw-border tw-border-solid tw-px-2 tw-py-1 tw-text-sm tw-outline-none tw-bg-transparent;
  }
}
</style>

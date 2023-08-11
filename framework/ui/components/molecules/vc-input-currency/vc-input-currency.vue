<template>
  <VcSelect
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :searchable="true"
    :debounce="debounce"
    :label="label"
    :required="required"
    :model-value="option"
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
        :loading="loading"
        :disabled="disabled"
        :autofocus="autofocus"
        :error="error"
        :error-message="errorMessage"
        :maxlength="maxlength"
        :tooltip="tooltip"
        class="tw-w-full"
        type="number"
      >
        <template #append-inner>
          <slot
            name="button"
            :toggle-handler="toggleHandler"
          >
            <button
              class="tw-text-[#43b0e6] tw-not-italic tw-font-medium tw-text-[13px] tw-leading-[20px] tw-cursor-pointer"
              @click.stop.prevent="toggleHandler"
            >
              {{ unref(option) }}
            </button>
          </slot>
        </template>
        <template #control="{ placeholder: holder }">
          <input
            ref="inputRef"
            type="text"
            :placeholder="holder"
          />
        </template>
      </VcInput>
    </template>
  </VcSelect>
</template>

<script lang="ts" setup>
import { useCurrencyInput, CurrencyDisplay } from "vue-currency-input";
import { MaybeRef, unref, watch } from "vue";
import { VcSelect, VcInput } from "./../../";

export type OptionProp = ((option: string | Record<string, unknown>) => string) | string | undefined;

export interface Props {
  /**
   * Model of the currency component; Use with a listener for 'update:price' event OR use v-model:price directive
   */
  modelValue: MaybeRef<number | null | undefined>;
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
  option?: MaybeRef<string>;
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  options: unknown[];
  /**
   * Property of option which holds the 'value'
   * Default value: id
   * @param option The current option being processed
   * @returns Value of the current option
   */
  optionValue?: OptionProp;
  /**
   * Property of option which holds the 'label'
   * Default value: title
   * @param option The current option being processed
   * @returns Label of the current option
   */
  optionLabel?: OptionProp;
}

export interface Emits {
  (event: "update:model-value", value: string | number | null): void;
  (event: "update:option", value: string | number | null): void;
  (event: "change", value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  debounce: 0,
});

const emit = defineEmits<Emits>();

const { inputRef, setOptions, numberValue } = useCurrencyInput(
  {
    locale: navigator.language,
    currency: unref(props.option) || "USD",
    currencyDisplay: CurrencyDisplay.hidden,
    hideGroupingSeparatorOnFocus: false,
  },
  false
);

// Change currency settings
watch(
  () => props.option,
  (newVal) => {
    setOptions({
      locale: navigator.language,
      currency: unref(newVal),
      currencyDisplay: CurrencyDisplay.hidden,
      hideGroupingSeparatorOnFocus: false,
    });
  }
);

watch(numberValue, (value) => {
  emit("update:model-value", value);
});
</script>

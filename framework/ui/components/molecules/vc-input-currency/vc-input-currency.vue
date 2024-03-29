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
            :disabled="disabled"
            :placeholder="holder"
          />
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
  options: unknown[];
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
}

export interface Emits {
  (event: "update:model-value", value: string | number | null): void;
  (event: "update:option", value: unknown): void;
  (event: "change", value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  debounce: 0,
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
}>();

const emit = defineEmits<Emits>();

const { inputRef, setOptions, numberValue } = useCurrencyInput(
  {
    locale: navigator.language,
    currency: props.option || "USD",
    currencyDisplay: CurrencyDisplay.hidden,
    hideGroupingSeparatorOnFocus: false,
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
        currencyDisplay: CurrencyDisplay.hidden,
        hideGroupingSeparatorOnFocus: false,
      });
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
</script>

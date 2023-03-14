import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isString, isNumber } from "./../../../utils";

export type OptionProp = ((option: string | Record<string, unknown>) => string) | string | undefined;

export const inputCurrencyProps = {
  /**
   * Model of the currency component; Use with a listener for 'update:price' event OR use v-model:price directive
   */
  modelValue: [String, Number, Date],
  /**
   * Input label text
   */
  label: String,
  /**
   * Input placeholder text
   */
  placeholder: String,
  /**
   * Input description (hint) text below input component
   */
  hint: String,
  /**
   * Appends clearable icon when a value is set;
   * When clicked, model becomes null
   */
  clearable: Boolean,
  /**
   * Prefix
   */
  prefix: String,
  /**
   * Suffix
   */
  suffix: String,
  /**
   * Used to specify the name of the control; If not specified, it takes the value 'Field'
   */
  name: String,
  /**
   * Signals the user a process is in progress by displaying a spinner
   */
  loading: Boolean,
  /**
   * Debounce amount (in milliseconds) for search input
   * Default: 0
   */
  debounce: {
    type: [String, Number],
    default: 0,
  },
  /**
   * Put component in disabled mode
   */
  disabled: Boolean,
  /**
   * Focus field on initial component render
   */
  autofocus: Boolean,
  /**
   * Does field have validation errors?
   */
  error: Boolean,
  /**
   * Validation error message (gets displayed only if 'error' is set to 'true')
   */
  errorMessage: String,
  /**
   * Specify a max length of model
   * Default value: 1024
   */
  maxlength: [String, Number],
  /**
   * Input tooltip information
   */
  tooltip: String,
  /**
   * Input required state
   */
  required: Boolean,
  /**
   * Option label
   */
  option: String,
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Array as PropType<any[]>,
  /**
   * Property of option which holds the 'value'
   * Default value: id
   * @param option The current option being processed
   * @returns Value of the current option
   */
  optionValue: [Function, String] as PropType<OptionProp>,
  /**
   * Property of option which holds the 'label'
   * Default value: title
   * @param option The current option being processed
   * @returns Label of the current option
   */
  optionLabel: [Function, String] as PropType<OptionProp>,
};

export const inputCurrencyEmits = {
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   */
  "update:modelValue": (value: string | number | null) => isString(value) || isNumber(value) || value === null,
  /**
   * Emitted when the component needs to change the options model; Is also used by v-model:option
   */
  "update:option": (value: string | number | null) => isString(value) || isNumber(value) || value === null,
  change: (value: string | number | null) => isString(value) || isNumber(value) || value === null,
};

export type VcInputCurrencyProps = ExtractTypes<typeof inputCurrencyProps>;
export type VcInputCurrencyEmits = typeof inputCurrencyEmits;

export interface VcInputCurrencySlots {
  /**
   * Slot for custom dropdown open handler
   */
  button: (scope: {
    /**
     * Dropdown open/close handler
     */
    toggleHandler: () => void;
  }) => VNode[];
}

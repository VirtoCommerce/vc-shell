import { VNode } from "vue";

export type OptionProp = ((option: string | Record<string, unknown>) => string) | string | undefined;

export interface VcInputCurrencyProps {
  /**
   * Model of the currency component; Use with a listener for 'update:price' event OR use v-model:price directive
   */
  modelValue?: string | number | Date | null;
  /**
   * Input label text
   */
  label?: string | undefined;
  /**
   * Input placeholder text
   */
  placeholder?: string | undefined;
  /**
   * Input description (hint) text below input component
   */
  hint?: string | undefined;
  /**
   * Appends clearable icon when a value is set;
   * When clicked, model becomes null
   */
  clearable?: boolean | undefined;
  /**
   * Prefix
   */
  prefix?: string | undefined;
  /**
   * Suffix
   */
  suffix?: string | undefined;
  /**
   * Used to specify the name of the control; If not specified, it takes the value 'Field'
   */
  name?: string | undefined;
  /**
   * Signals the user a process is in progress by displaying a spinner
   */
  loading?: boolean | undefined;
  /**
   * Debounce amount (in milliseconds) for search input
   * Default: 0
   */
  debounce?: string | number | undefined;
  /**
   * Put component in disabled mode
   */
  disabled?: boolean | undefined;
  /**
   * Focus field on initial component render
   */
  autofocus?: boolean | undefined;
  /**
   * Does field have validation errors?
   */
  error?: boolean | undefined;
  /**
   * Validation error message (gets displayed only if 'error' is set to 'true')
   */
  errorMessage?: string | undefined;
  /**
   * Specify a max length of model
   * Default value: 1024
   */
  maxlength?: string | number | undefined;
  /**
   * Input tooltip information
   */
  tooltip?: string | undefined;
  /**
   * Input required state
   */
  required?: boolean | undefined;
  /**
   * Option label
   */
  option?: string | undefined;
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  options?: any[] | undefined;
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
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   */
  "onUpdate:modelValue"?: (value: string | number | null) => void;
  /**
   * Emitted when the component needs to change the options model; Is also used by v-model:option
   */
  "onUpdate:option"?: (value: string | number | null) => void;
}
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

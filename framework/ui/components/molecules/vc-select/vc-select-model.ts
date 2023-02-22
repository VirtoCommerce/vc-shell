import { VNode } from "vue";

export type OptionProp =
  | ((option: string | Record<string, unknown>) => string)
  | string
  | undefined;

export interface VcSelectProps {
  /**
   * Name of select
   */
  name?: string | undefined;
  /**
   * Model of the component; Must be Array if using 'multiple' prop; Use this property with a listener for 'update:modelValue' event OR use v-model directive
   */
  modelValue: any;
  /**
   * Try to map labels of model from 'options' Array; If you are using emit-value you will probably need to use map-options to display the label text in the select field rather than the value;
   * Default value: true
   */
  mapOptions?: boolean | undefined;
  /**
   * Does field have validation errors?
   */
  error?: boolean | undefined;
  /**
   * Validation error message (gets displayed only if 'error' is set to 'true')
   */
  errorMessage?: string | undefined;
  /**
   * Select label
   */
  label?: string | undefined;
  /**
   * Select description (hint) text below input component
   */
  hint?: string | undefined;
  /**
   * Prefix
   */
  prefix?: string | undefined;
  /**
   * Suffix
   */
  suffix?: string | undefined;
  /**
   * Signals the user a process is in progress by displaying a spinner
   */
  loading?: boolean | undefined;
  /**
   * Appends clearable icon when a value is set;
   * When clicked, model becomes null
   */
  clearable?: boolean | undefined;
  /**
   * Put component in disabled mode
   */
  disabled?: boolean | undefined;
  /**
   * Allow multiple selection; Model must be Array
   */
  multiple?: boolean | undefined;
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  options?:
  | ((
    keyword?: string,
    skip?: number,
    ids?: string[]
  ) => Promise<{
    results?: object[];
    totalCount?: number;
  }>)
  | any[]
  | undefined;
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
   * Update model with the value of the selected option instead of the whole option
   */
  emitValue?: boolean | undefined;
  /**
   * Debounce the search input update with an amount of milliseconds
   * Default value: 500
   */
  debounce?: number | string | undefined;
  /**
   * Input placeholder text
   */
  placeholder?: string | undefined;
  /**
   * Input tooltip information
   */
  tooltip?: string | undefined;
  /**
   * Input required state
   */
  required?: boolean | undefined;
  /**
   * Input search activation
   */
  searchable?: boolean | undefined;
  /**
  * Emitted when the component needs to change the model; Is also used by v-model
  */
  "onUpdate:modelValue"?: (inputValue: any) => void;
  /**
   * Emitted when user wants to filter a value
   */
  onSearch?: (inputValue: string) => void;
  /**
   * Emitted when the select options list is hidden
   */
  onClose?: () => void;
}

export interface VcSelectSlots {
  /**
   * Custom select control
   */
  control: (scope: { toggleHandler: () => void }) => VNode[];
  /**
   * Prepend inner field
   */
  "prepend-inner": () => VNode[];
  /**
   * Append to inner field
   */
  "append-inner": () => VNode[];
  /**
   * Prepend outer field
   */
  prepend: () => VNode[];
  /**
   * Append outer field
   */
  append: () => VNode[];
  /**
   * What should the menu display after filtering options and none are left to be displayed
   * @param scope
   */
  "no-option": () => VNode[];
  /**
   * Slot for errors
   */
  error: () => VNode[];
  /**
   * Slot for hint text
   */
  hint: () => VNode[];
  /**
   * Override default selection slot
   * @param scope
   */
  "selected-item": (scope: {
    /**
     * Selection index
     */
    index: number;
    /**
     * Selected option -- its value is taken from model
     */
    opt: any;
    /**
     * Always true -- passed as prop
     */
    selected: boolean;
    /**
     * Remove selected option located at specific index
     * @param index Index at which to remove selection
     */
    removeAtIndex: (index: number) => void;
  }) => VNode[];
  /**
   * Override default selection slot;
   */
  option: (scope: {
    /**
     * Option index
     */
    index: number;
    /**
     * Option -- its value is taken from 'options' prop
     */
    opt: any;
    /**
     * Is option selected?
     */
    selected: boolean;
    /**
     * Add/remove option from model
     * @param opt Option to add to model
     */
    toggleOption: (opt: any) => void;
  }) => VNode[];
}

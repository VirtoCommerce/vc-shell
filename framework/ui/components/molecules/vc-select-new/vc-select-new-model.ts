import { VNode } from "vue";

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
   * Put component in readonly mode
   */
  readonly?: boolean | undefined;
  /**
   * Allow multiple selection; Model must be Array
   */
  multiple?: boolean | undefined;
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  options?: readonly any[] | undefined;
  /**
   * Property of option which holds the 'value'
   * Default value: id
   * @param option The current option being processed
   * @returns Value of the current option
   */
  optionValue?: ((option: string | any) => any) | string | undefined;
  /**
   * Property of option which holds the 'label'
   * Default value: title
   * @param option The current option being processed
   * @returns Label of the current option
   */
  optionLabel?: ((option: string | any) => string) | string | undefined;
  /**
   * Hides selection;
   */
  hideSelected?: boolean | undefined;
  /**
   * Use chip to show what is currently selected
   */
  useChips?: boolean | undefined;
  /**
   * Update model with the value of the selected option instead of the whole option
   */
  emitValue?: boolean | undefined;
  /**
   * Debounce the filter update with an amount of milliseconds
   * Default value: 500
   */
  filterDebounce?: number | string | undefined;
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
}
export interface VcSelectEmits {
  /**
   * Emitted when scrolled to bottom of options list
   * @param event Emitted event name
   */
  (event: "scroll"): void;
  /**
   * When using the 'clearable' property, this event is emitted when the clear icon is clicked
   * @param event Emitted event name
   * @param value The previous value before clearing it
   */
  (event: "click:clear", value: any): void;
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   * @param event Emitted event name
   * @param value New model value
   */
  (event: "update:modelValue", value: any): void;
  /**
   * Emitted when an option is removed from selection
   * @param event Emitted event name
   * @param details Removal details
   */
  (
    event: "remove",
    details: {
      /**
       * Model index at which removal took place
       */
      index: number;
      /**
       * The actual value that was removed
       */
      value: any;
    }
  ): void;
  /**
   * Emitted when an option is added to the selection
   * @param event Emitted event name
   * @param details Addition details
   */
  (
    event: "add",
    details: {
      /**
       * Model index at which addition took place
       */
      index: number;
      /**
       * The actual value that was added
       */
      value: any;
    }
  ): void;
  /**
   * Emitted when user wants to filter a value
   * @param event Emitted event name
   * @param inputValue What the user typed
   */
  (event: "filter", inputValue: string): void;
  /**
   * Emitted when the select options menu or dialog is shown.
   * @param event Emitted event name
   */
  (event: "open"): void;
  /**
   * Emitted when the select options menu or dialog is hidden.
   * @param event Emitted event name
   */
  (event: "close");
  void;
}
export interface VcSelectSlots {
  /**
   * Prepend inner field; Suggestions: QIcon, QBtn
   */
  "prepend-inner": () => VNode[];
  /**
   * Append to inner field; Suggestions: QIcon, QBtn
   */
  "append-inner": () => VNode[];
  /**
   * Prepend outer field; Suggestions: QIcon, QBtn
   */
  prepend: () => VNode[];
  /**
   * Append outer field; Suggestions: QIcon, QBtn
   */
  append: () => VNode[];
  /**
   * What should the menu display after filtering options and none are left to be displayed; Suggestion: <div>
   * @param scope
   */
  "no-option": (scope: {
    /**
     * Input textfield value, if any (not QSelect model)
     */
    inputValue: string;
  }) => VNode[];
  /**
   * Slot for errors; Enabled only if 'bottom-slots' prop is used; Suggestion: <div>
   */
  error: () => VNode[];
  /**
   * Slot for hint text; Enabled only if 'bottom-slots' prop is used; Suggestion: <div>
   */
  hint: () => VNode[];
  /**
   * Override default selection slot; Suggestion: QChip
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
     * Always true -- passed down as prop to QItem (when using QItem)
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

import { VNode } from "vue";

export interface VcInputProps {
  /**
   * Model of the component; Use with a listener for 'update:model-value' event OR use v-model directive
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
   * Input type
   * Default value: text
   */
  type?:
    | "text"
    | "password"
    | "email"
    | "tel"
    | "number"
    | "url"
    | "time"
    | "date"
    | "datetime-local"
    | undefined;
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
   * Debounce amount (in milliseconds) when updating model
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
   * Emitted when the component needs to change the model; Is also used by v-model
   */
  "onUpdate:modelValue"?: (value: string | number | Date | null) => void;
}

export interface VcInputSlots {
  /**
   * Slot for controls
   * @param scope
   */
  control: (scope: {
    /**
     * Field is editable
     */
    editable: boolean;
    /**
     * Field has focus
     */
    focused: boolean;
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
    placeholder?: string | undefined;
  }) => VNode[];
  /**
   * Prepend outer field
   */
  prepend: () => VNode[];
  /**
   * Prepend inner field
   */
  "prepend-inner": () => VNode[];
  /**
   * Append to inner field
   */
  "append-inner": () => VNode[];
  /**
   * Append outer field
   */
  append: () => VNode[];
  /**
   * Slot for errors
   */
  error: () => VNode[];
  /**
   * Slot for hint text
   */
  hint: () => VNode[];
}

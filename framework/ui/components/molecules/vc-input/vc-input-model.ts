import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isString, isNumber, isDate } from "./../../../utils";

export const inputProps = {
  /**
   * Model of the component; Use with a listener for 'update:model-value' event OR use v-model directive
   */
  modelValue: {
    type: [String, Number, Date],
    default: null,
  },
  /**
   * Input label text
   */
  label: String,
  /**
   * Input placeholder text
   */
  placeholder: String,
  /**
   * Input type
   * Default value: text
   */
  type: {
    type: String as PropType<
      "text" | "password" | "email" | "tel" | "number" | "url" | "time" | "date" | "datetime-local"
    >,
    default: "text",
  },
  /**
   * Input description (hint) text below input component
   */
  hint: String,
  /**
   * Appends clearable icon when a value is set;
   * When clicked, model becomes null
   */
  clearable: {
    type: Boolean,
    default: false,
  },
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
  name: {
    type: String,
    default: "Field",
  },
  /**
   * Signals the user a process is in progress by displaying a spinner
   */
  loading: Boolean,
  /**
   * Debounce amount (in milliseconds) when updating model
   */
  debounce: [String, Number],
  /**
   * Put component in disabled mode
   */
  disabled: {
    type: Boolean,
    default: false,
  },
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
  maxlength: {
    type: [String, Number],
    default: "1024",
  },
  /**
   * Input tooltip information
   */
  tooltip: String,
  /**
   * Input required state
   */
  required: {
    type: Boolean,
    default: false,
  },
};

export const inputEmits = {
  "update:modelValue": (value: string | number | Date | null) => isString(value) || isNumber(value) || isDate(value) || value === null,
};

export type VcInputProps = ExtractTypes<typeof inputProps>;
export type VcInputEmits = typeof inputEmits;

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

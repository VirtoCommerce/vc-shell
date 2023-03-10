/* eslint-disable @typescript-eslint/no-explicit-any */
import { VNode, PropType } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isString } from "./../../../utils";

export type OptionProp = ((option: string | Record<string, unknown>) => string) | string | undefined;

export const selectProps = {
  /**
   * Name of select
   */
  name: {
    type: String,
    default: "Field",
  },
  /**
   * Model of the component; Must be Array if using 'multiple' prop; Use this property with a listener for 'update:modelValue' event OR use v-model directive
   */
  modelValue: null,
  /**
   * Try to map labels of model from 'options' Array; If you are using emit-value you will probably need to use map-options to display the label text in the select field rather than the value;
   * Default value: true
   */
  mapOptions: {
    type: Boolean,
    default: true,
  },
  /**
   * Does field have validation errors?
   */
  error: Boolean,
  /**
   * Validation error message (gets displayed only if 'error' is set to 'true')
   */
  errorMessage: String,
  /**
   * Select label
   */
  label: String,
  /**
   * Select description (hint) text below input component
   */
  hint: String,
  /**
   * Prefix
   */
  prefix: String,
  /**
   * Suffix
   */
  suffix: String,
  /**
   * Signals the user a process is in progress by displaying a spinner
   */
  loading: Boolean,
  /**
   * Appends clearable icon when a value is set;
   * When clicked, model becomes null
   */
  clearable: {
    type: Boolean,
    default: true,
  },
  /**
   * Put component in disabled mode
   */
  disabled: Boolean,
  /**
   * Allow multiple selection; Model must be Array
   */
  multiple: Boolean,
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  options: {
    type: [Function, Array] as PropType<
      | ((
          keyword?: string,
          skip?: number,
          ids?: string[]
        ) => Promise<{
          results?: object[];
          totalCount?: number;
        }>)
      | any[]
    >,
    default: () => [],
  },
  /**
   * Property of option which holds the 'value'
   * Default value: id
   * @param option The current option being processed
   * @returns Value of the current option
   */
  optionValue: { type: [Function, String] as PropType<OptionProp>, default: "id" },
  /**
   * Property of option which holds the 'label'
   * Default value: title
   * @param option The current option being processed
   * @returns Label of the current option
   */
  optionLabel: { type: [Function, String] as PropType<OptionProp>, default: "title" },
  /**
   * Update model with the value of the selected option instead of the whole option
   */
  emitValue: {
    type: Boolean,
    default: true,
  },
  /**
   * Debounce the search input update with an amount of milliseconds
   * Default value: 500
   */
  debounce: {
    type: [Number, String],
    default: 500,
  },
  /**
   * Input placeholder text
   */
  placeholder: String,
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
  /**
   * Input search activation
   */
  searchable: {
    type: Boolean,
    default: false,
  },
};

export const selectEmits = {
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   */
  "update:modelValue": (inputValue: any) => !!inputValue,
  /**
   * Emitted when user wants to filter a value
   */
  search: (inputValue: string) => isString(inputValue),
  /**
   * Emitted when the select options list is hidden
   */
  close: () => true,
};

export type VcSelectProps = ExtractTypes<typeof selectProps>;
export type VcSelectEmits = typeof selectEmits;

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

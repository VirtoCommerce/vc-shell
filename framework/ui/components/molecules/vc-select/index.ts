/* eslint-disable @typescript-eslint/no-explicit-any */
import { VNode } from "vue";
import Select from "./vc-select.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcSelectSlots = {
  /**
   * Custom select control
   */
  control?: (scope: { toggleHandler: () => void }) => VNode[];
  /**
   * Prepend inner field
   */
  "prepend-inner"?: () => VNode[];
  /**
   * Append to inner field
   */
  "append-inner"?: () => VNode[];
  /**
   * Prepend outer field
   */
  prepend?: () => VNode[];
  /**
   * Append outer field
   */
  append?: () => VNode[];
  /**
   * What should the menu display after filtering options and none are left to be displayed
   * @param scope
   */
  "no-option"?: () => VNode[];
  /**
   * Slot for errors
   */
  error?: () => VNode[];
  /**
   * Slot for hint text
   */
  hint?: () => VNode[];
  /**
   * Override default selection slot
   * @param scope
   */
  "selected-item"?: (scope: {
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
  option?: (scope: {
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
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcSelect: GlobalComponentConstructor<typeof Select, VcSelectSlots> = Select;

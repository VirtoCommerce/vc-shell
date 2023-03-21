import { VNode } from "vue";
import Input from "./vc-input.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcInputSlots = {
  /**
   * Slot for controls
   * @param scope
   */
  control?: (scope: {
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
  prepend?: () => VNode[];
  /**
   * Prepend inner field
   */
  "prepend-inner"?: () => VNode[];
  /**
   * Append to inner field
   */
  "append-inner"?: () => VNode[];
  /**
   * Append outer field
   */
  append?: () => VNode[];
  /**
   * Slot for errors
   */
  error?: () => VNode[];
  /**
   * Slot for hint text
   */
  hint?: () => VNode[];
};

export const VcInput: GlobalComponentConstructor<InstanceType<typeof Input>, VcInputSlots> = Input;

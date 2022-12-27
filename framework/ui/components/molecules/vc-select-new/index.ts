import { ComponentPublicInstance } from "vue";
import { VcSelectProps } from "./vc-select-new-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import VcSelect from "./vc-select-new.vue";

export interface IVcSelectNew extends ComponentPublicInstance<VcSelectProps> {
  /**
   * Remove selected option located at specific index
   * @param index Index at which to remove selection
   */
  removeAtIndex: (index: number) => void;
  /**
   * Add/remove option from model
   * @param opt Option to add to model
   */
  toggleOption: (opt: any) => void;
  /**
   * Tells if an option is selected
   * @param opt Option entry
   * @returns Option is selected or not
   */
  isOptionSelected: (opt: any) => boolean;
  /**
   * Get the model value that would be emitted by select when selecting an option
   * @param opt Option entry
   * @returns Emitting model value of selected option
   */
  getEmittingOptionValue: (opt: any) => any;
  /**
   * Get the model value of an option
   * @param opt Option entry
   * @returns Model value of said option
   */
  getOptionValue: (opt: any) => any;
  /**
   * Get the label of an option
   * @param opt Option entry
   * @returns Label of said option
   */
  getOptionLabel: (opt: any) => any;
}

export const VcSelectNew: ComponentConstructor<IVcSelectNew> = VcSelect;

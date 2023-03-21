import { VNode } from "vue";
import InputCurrency from "./vc-input-currency.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcInputCurrencySlots = {
  /**
   * Slot for custom dropdown open handler
   */
  button?: (scope: {
    /**
     * Dropdown open/close handler
     */
    toggleHandler: () => void;
  }) => VNode[];
};

export const VcInputCurrency: GlobalComponentConstructor<
  InstanceType<typeof InputCurrency>,
  VcInputCurrencySlots
> = InputCurrency;

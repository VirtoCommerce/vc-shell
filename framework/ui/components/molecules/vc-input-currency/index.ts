import { VNode } from "vue";
import _InputCurrency from "./vc-input-currency.vue";

export const VcInputCurrency = _InputCurrency as typeof _InputCurrency & {
  new (): {
    $slots: {
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
  };
};

import { ComponentPublicInstance } from "vue";
import { VcInputCurrencyEmits, VcInputCurrencyProps } from "./vc-input-currency-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import InputCurrency from "./vc-input-currency.vue";

export const VcInputCurrency: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcInputCurrencyProps, any, any, any, any, VcInputCurrencyEmits>
> = InputCurrency;

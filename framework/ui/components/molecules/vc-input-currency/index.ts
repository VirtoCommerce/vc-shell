import { ComponentPublicInstance } from "vue";
import { VcInputCurrencyProps } from "./vc-input-currency-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import InputCurrency from "./vc-input-currency.vue";

export const VcInputCurrency: ComponentConstructor<ComponentPublicInstance<VcInputCurrencyProps>> = InputCurrency;

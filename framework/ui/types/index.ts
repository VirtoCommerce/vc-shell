import { GlobalComponentConstructor } from "./ts-helpers";
import {
  VcInputProps,
  VcInputSlots,
} from "../components/molecules/vc-input/vc-input-model";
import {
  VcSelectProps,
  VcSelectSlots,
} from "../components/molecules/vc-select/vc-select-model";
import {
  VcInputCurrencyProps,
  VcInputCurrencySlots,
} from "../components/molecules/vc-input-currency/vc-input-currency-model";

declare module "@vue/runtime-core" {
  interface GlobalComponents {
    VcInput: GlobalComponentConstructor<VcInputProps, VcInputSlots>;
    VcInputCurrency: GlobalComponentConstructor<
      VcInputCurrencyProps,
      VcInputCurrencySlots
    >;
    VcSelect: GlobalComponentConstructor<VcSelectProps, VcSelectSlots>;
  }
}

export { };

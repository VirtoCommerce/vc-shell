import { GlobalComponentConstructor } from "./ts-helpers";
import {
  VcInputEmits,
  VcInputProps,
  VcInputSlots,
} from "../components/molecules/vc-input/vc-input-model";
import {
  VcSelectEmits,
  VcSelectProps,
  VcSelectSlots,
} from "../components/molecules/vc-select/vc-select-model";
import {
  VcInputCurrencyProps,
  VcInputCurrencyEmits,
  VcInputCurrencySlots,
} from "@/ui/components/molecules/vc-input-currency/vc-input-currency-model";

declare module "@vue/runtime-core" {
  interface GlobalComponents {
    VcInput: GlobalComponentConstructor<
      VcInputProps,
      VcInputSlots,
      VcInputEmits
    >;
    VcInputCurrency: GlobalComponentConstructor<
      VcInputCurrencyProps,
      VcInputCurrencySlots,
      VcInputCurrencyEmits
    >;
    VcSelect: GlobalComponentConstructor<
      VcSelectProps,
      VcSelectSlots,
      VcSelectEmits
    >;
  }
}

export {};

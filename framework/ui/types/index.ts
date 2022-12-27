import { GlobalComponentConstructor } from "./ts-helpers";
import {
  VcInputEmits,
  VcInputProps,
  VcInputSlots,
} from "../components/molecules/vc-input-new/vc-input-new-model";
import {
  VcSelectEmits,
  VcSelectProps,
  VcSelectSlots,
} from "../components/molecules/vc-select-new/vc-select-new-model";

declare module "@vue/runtime-core" {
  interface GlobalComponents {
    VcInputNew: GlobalComponentConstructor<
      VcInputProps,
      VcInputSlots,
      VcInputEmits
    >;
    VcSelectNew: GlobalComponentConstructor<
      VcSelectProps,
      VcSelectSlots,
      VcSelectEmits
    >;
  }
}

export {};

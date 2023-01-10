import { ComponentPublicInstance } from "vue";
import { VcInputProps } from "./vc-input-new-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import VcInput from "./vc-input-new.vue";

interface IVcInputNew extends ComponentPublicInstance<VcInputProps> {
  /**
   * Focus underlying input tag
   */
  focus: () => void;
}

export const VcInputNew: ComponentConstructor<IVcInputNew> = VcInput;

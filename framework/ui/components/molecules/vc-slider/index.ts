import { ComponentPublicInstance } from "vue";
import { VcSliderProps } from "./vc-slider-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Slider from "./vc-slider.vue";
export const VcSlider: ComponentConstructor<
  ComponentPublicInstance<VcSliderProps>
> = Slider;

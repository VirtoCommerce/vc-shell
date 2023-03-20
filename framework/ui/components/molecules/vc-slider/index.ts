import { VNode } from "vue";
import Slider from "./vc-slider.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcSliderSlots = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (args: { slide: Record<string, unknown> | any }) => VNode[];
  prevBtn?: () => VNode[];
  nextBtn?: () => VNode[];
};

export const VcSlider: GlobalComponentConstructor<typeof Slider, VcSliderSlots> = Slider;

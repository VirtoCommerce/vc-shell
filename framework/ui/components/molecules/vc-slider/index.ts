import { VNode } from "vue";
import _Slider from "@ui/components/molecules/vc-slider/vc-slider.vue";

export const VcSlider = _Slider as typeof _Slider & {
  new (): {
    $slots: {
      default: (args: { slide: Record<string, unknown> }) => VNode[];
      prevBtn: () => VNode[];
      nextBtn: () => VNode[];
    };
  };
};

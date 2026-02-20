import { VNode } from "vue";
import _Slider from "@ui/components/molecules/vc-slider/vc-slider.vue";

export const VcSlider = _Slider as typeof _Slider & {
  new (): {
    $slots: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      default: (args: { slide: Record<string, unknown> | any }) => VNode[];
      prevBtn: () => VNode[];
      nextBtn: () => VNode[];
    };
  };
};

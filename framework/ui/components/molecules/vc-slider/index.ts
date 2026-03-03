import { defineAsyncComponent, type VNode } from "vue";

type VcSliderComponent = typeof import("./vc-slider.vue")["default"];

type VcSliderSlots = {
  new (): {
    $slots: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      default: (args: { slide: Record<string, unknown> | any }) => VNode[];
      prevBtn: () => VNode[];
      nextBtn: () => VNode[];
    };
  };
};

export const VcSlider = defineAsyncComponent({
  loader: () => import("./vc-slider.vue"),
  delay: 200,
  timeout: 10000,
  suspensible: false,
}) as VcSliderComponent & VcSliderSlots;

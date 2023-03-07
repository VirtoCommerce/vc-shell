/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const sliderProps = {
  slides: {
    type: Array as PropType<Record<string, unknown>[] | any[]>,
    default: () => [],
  },
  navigation: {
    type: Boolean,
    default: false,
  },
  overflow: {
    type: Boolean,
    default: false,
  },
  slidesPerView: {
    type: String as PropType<string | "auto">,
    default: "auto",
  },
  spaceBetweenSlides: {
    type: Number,
    default: 10,
  },
};

export type VcSliderProps = ExtractTypes<typeof sliderProps>;

export interface VcSliderSlots {
  default: (args: { slide: Record<string, unknown> | any }) => VNode[];
  prevBtn: () => VNode[];
  nextBtn: () => VNode[];
}

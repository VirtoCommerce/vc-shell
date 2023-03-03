import { VNode } from "vue";

export interface VcSliderProps {
  slides?: Record<string, unknown>[] | any[];
  navigation?: boolean | undefined;
  overflow?: boolean | undefined;
  slidesPerView?: string | "auto" | undefined;
  spaceBetweenSlides?: number | undefined;
}

export interface VcSliderSlots {
  default: (args: { slide: Record<string, unknown> | any }) => VNode[];
  prevBtn: () => VNode[];
  nextBtn: () => VNode[];
}

import { VNode } from "vue";

export interface VcImageProps {
  aspect?: string | undefined;
  rounded?: boolean | undefined;
  bordered?: boolean | undefined;
  clickable?: boolean | undefined;
  src?: string | undefined;
  size?: "auto" | "1x1" | "16x9" | "4x3" | "3x2" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  background?: "cover" | "contain" | "auto";
  onClick?: () => void;
}

export interface VcImageSlots {
  default: () => VNode[];
}

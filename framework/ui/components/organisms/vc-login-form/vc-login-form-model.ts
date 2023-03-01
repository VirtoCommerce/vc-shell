import { VNode } from "vue";

export interface VcLoginFormProps {
  logo?: string | undefined;
  background?: string | undefined;
  title?: string | undefined;
}

export interface VcLoginFormSlots {
  default: () => VNode[];
}

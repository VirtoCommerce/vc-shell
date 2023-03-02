import {VNode} from "vue";

export interface VcIconProps {
   icon?: string | undefined
    size?: "xs" | "s" | "m" | "l" | "xl" | "xxl"
}

export interface VcIconSlots {
    default: () => VNode[];
}

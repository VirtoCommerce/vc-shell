import {VNode} from "vue";

export interface VcContainerProps {
    shadow?: boolean | undefined
    noPadding?: boolean | undefined
    usePtr?: boolean | undefined
    "onScroll:ptr"?: () => void
}

export interface VcContainerSlots {
    default: () => VNode[];
}

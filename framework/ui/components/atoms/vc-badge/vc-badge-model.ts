import {VNode} from "vue";

export interface VcBadgeProps {
    /**
     * Badge active state
     * */
    active?: boolean | undefined,
    /**
     * Put component in disabled state
     * */
    disabled?: boolean | undefined,
    /**
     * Is badge clickable?
     * */
    clickable?: boolean | undefined
}

export interface VcBadgeEmits {
    /**
     * Emitted when component is clicked
     * */
    (event: 'click'): void;
}

export interface VcBadgeSlots {
    /**
     * Slot for component content
     * */
    default: () => VNode[];
}


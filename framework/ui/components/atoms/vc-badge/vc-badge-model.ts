import { VNode } from "vue";

export interface VcBadgeProps {
  /**
   * Badge active state
   * */
  active?: boolean | undefined;
  /**
   * Put component in disabled state
   * */
  disabled?: boolean | undefined;
  /**
   * Is badge clickable?
   * */
  clickable?: boolean | undefined;
  onClick?: (event: "click") => void;
}

export interface VcBadgeSlots {
  /**
   * Slot for component content
   * */
  default: () => VNode[];
}

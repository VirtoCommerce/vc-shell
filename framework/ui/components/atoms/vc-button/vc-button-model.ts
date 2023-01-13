import { VNode } from "vue";

export interface VcButtonProps {
  /**
   * Badge active state
   * */
  icon?: string | undefined;
  /**
   * Put component in disabled state
   * */
  disabled?: boolean | undefined;
  /**
   * Is badge clickable?
   * */
  clickable?: boolean | undefined;
}

export interface VcButtonEmits {
  /**
   * Emitted when component is clicked
   * */
  (event: "click"): void;
}

export interface VcButtonSlots {
  /**
   * Slot for component content
   * */
  default: () => VNode[];
}

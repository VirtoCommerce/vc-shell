/**
 * Icon types supported by the component
 */
export type IconType = "fontawesome" | "material" | "bootstrap" | "lucide" | "custom" | "svg";

/**
 * Icon sizes
 */
export type IconSize = "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";

/**
 * Icon color variants
 */
export type IconVariant = "warning" | "danger" | "success";

export interface IconProps {
  /**
   * Icon to display
   */
  icon: string;

  /**
   * Icon size
   */
  size?: IconSize;

  /**
   * Icon color variant
   */
  variant?: IconVariant;

  /**
   * Custom size in pixels
   */
  customSize?: number;
}

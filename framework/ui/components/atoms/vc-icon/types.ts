/**
 * Icon types supported by the component.
 *
 * "lucide" — the standard icon type. Use the "lucide-*" prefix (e.g. "lucide-home").
 * "svg" — SVG sprite icons via "svg:path" prefix.
 * "custom" — direct Vue component instances.
 *
 * @deprecated The following types are deprecated and will be removed in a future version:
 * - "fontawesome" — use Lucide equivalents instead
 * - "material" — use Lucide equivalents instead
 * - "bootstrap" — use Lucide equivalents instead
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
   * Icon to display.
   * Standard format: "lucide-{name}" (e.g. "lucide-home", "lucide-settings").
   *
   * @deprecated Legacy formats "fa-*", "bi-*", "material-*" are deprecated.
   * Migrate to Lucide: see https://lucide.dev/icons
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

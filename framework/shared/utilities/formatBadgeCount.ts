/**
 * Formats a badge count value, truncating numbers > 99 to "99+".
 * Used by VcWidget and WidgetDropdownItem for consistent badge display.
 */
export function formatBadgeCount(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;

  const num = typeof value === "string" ? parseInt(value) : value;

  if (!isNaN(num) && num > 99) {
    return "99+";
  }

  return String(value);
}

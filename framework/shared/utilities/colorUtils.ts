/**
 * Convert CSS color name to hex code using Canvas API
 * @param colorName - CSS color name (e.g., "red", "blue", "lime")
 * @returns Hex code or null if not found
 */
export function convertColorNameToHex(colorName: string): string | null {
  if (!colorName || typeof colorName !== "string") {
    return null;
  }

  try {
    // Create temporary canvas to use browser's color parsing
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Try to set the color
    ctx.fillStyle = colorName.trim();

    // If browser doesn't recognize it, fillStyle stays as default
    if (ctx.fillStyle === "#000000" && colorName.trim().toLowerCase() !== "black") {
      return null;
    }

    return ctx.fillStyle; // Returns hex format
  } catch (error) {
    console.warn("Error converting color name to hex:", error);
    return null;
  }
}

/**
 * Convert hex code to human-readable color name
 * @param hex - Hex color code (e.g., "#ff0000", "ff0000")
 * @returns Always returns null - don't auto-fill color names
 */
export function convertHexToColorName(hex: string): string | null {
  // Always return null - don't auto-fill
  // User should enter custom color name manually
  return null;
}

/**
 * Check if a string is a valid hex color
 * @param value - String to check
 * @returns True if valid hex color
 */
export function isValidHexColor(value: string): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }

  const normalizedValue = value.startsWith("#") ? value : `#${value}`;
  return /^#[0-9A-Fa-f]{6}$/.test(normalizedValue);
}

/**
 * Normalize hex color format (ensure it starts with #)
 * @param hex - Hex color code
 * @returns Normalized hex color
 */
export function normalizeHexColor(hex: string): string {
  if (!hex || typeof hex !== "string") {
    return "";
  }

  return hex.startsWith("#") ? hex : `#${hex}`;
}

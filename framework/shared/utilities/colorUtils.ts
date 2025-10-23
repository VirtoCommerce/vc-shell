import namer from "color-namer";

/**
 * Convert color name to hex code
 * @param colorName - Color name (e.g., "red", "blue", "dark green")
 * @returns Hex code or null if not found
 */
export function convertColorNameToHex(colorName: string): string | null {
  if (!colorName || typeof colorName !== "string") {
    return null;
  }

  const trimmedName = colorName.trim().toLowerCase();

  // Try to get color from different dictionaries
  const result = namer(trimmedName);

  // Check basic colors first (most common)
  if (result.basic && result.basic.length > 0) {
    return result.basic[0].hex;
  }

  // Check HTML colors
  if (result.html && result.html.length > 0) {
    return result.html[0].hex;
  }

  // Check NTC colors
  if (result.ntc && result.ntc.length > 0) {
    return result.ntc[0].hex;
  }

  return null;
}

/**
 * Convert hex code to human-readable color name
 * @param hex - Hex color code (e.g., "#ff0000", "ff0000")
 * @returns Color name or null if not found
 */
export function convertHexToColorName(hex: string): string | null {
  if (!hex || typeof hex !== "string") {
    return null;
  }

  // Normalize hex format
  const normalizedHex = hex.startsWith("#") ? hex : `#${hex}`;

  // Validate hex format
  if (!/^#[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
    return null;
  }

  try {
    const result = namer(normalizedHex);

    // Try to get the most accurate name
    if (result.basic && result.basic.length > 0) {
      return result.basic[0].name;
    }

    if (result.html && result.html.length > 0) {
      return result.html[0].name;
    }

    if (result.ntc && result.ntc.length > 0) {
      return result.ntc[0].name;
    }

    return null;
  } catch (error) {
    console.warn("Error converting hex to color name:", error);
    return null;
  }
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

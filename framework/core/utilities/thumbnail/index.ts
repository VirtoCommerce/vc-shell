/**
 * Thumbnail URL utility.
 *
 * VirtoCommerce backend generates image thumbnails with suffixes appended
 * before the file extension:
 *   - Named presets: `_sm`, `_md`, `_lg`
 *   - Pixel sizes: `_64x64`, `_128x128`, `_168x168`, `_216x216`, `_348x348`
 *
 * This utility transforms a full-size image URL into a thumbnail URL
 * by inserting the appropriate suffix.
 *
 * @example
 * getThumbnailUrl("https://cdn.example.com/photo.jpg", "sm")
 * // → "https://cdn.example.com/photo_sm.jpg"
 *
 * getThumbnailUrl("https://cdn.example.com/photo.jpg", "128x128")
 * // → "https://cdn.example.com/photo_128x128.jpg"
 *
 * getThumbnailUrl("https://cdn.example.com/photo.jpg")
 * // → "https://cdn.example.com/photo.jpg" (no change)
 */

export type ThumbnailPreset = "sm" | "md" | "lg";
export type ThumbnailPixelSize = "64x64" | "128x128" | "168x168" | "216x216" | "348x348";
export type ThumbnailSize = ThumbnailPreset | ThumbnailPixelSize;

/**
 * Transforms an image URL to its thumbnail variant by appending a size suffix
 * before the file extension.
 *
 * @param url - Original image URL
 * @param size - Thumbnail size (preset name or pixel dimensions). If undefined, returns original URL.
 * @returns Thumbnail URL with suffix, or original URL if size is not specified or URL has no extension.
 */
export function getThumbnailUrl(url: string | undefined, size?: ThumbnailSize): string | undefined {
  if (!url || !size) return url;

  // Already has this suffix — don't double-apply
  if (url.includes(`_${size}`)) return url;

  // Find the filename portion (after last slash)
  const lastSlash = url.lastIndexOf("/");
  const queryIndex = url.indexOf("?", lastSlash);
  const filename = queryIndex > -1 ? url.slice(lastSlash + 1, queryIndex) : url.slice(lastSlash + 1);
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex <= 0) {
    // No extension in filename — return as-is
    return url;
  }

  // Position of the dot in the full URL
  const extensionDot = lastSlash + 1 + dotIndex;
  const base = url.slice(0, extensionDot);
  const rest = url.slice(extensionDot);

  return `${base}_${size}${rest}`;
}

/**
 * Maps a display size in pixels to the best-fit thumbnail preset.
 * Picks the smallest thumbnail that is >= the display size.
 *
 * @param displaySize - The display size in CSS pixels (width or height, whichever is larger)
 * @returns The best thumbnail size to use
 */
export function getBestThumbnailSize(displaySize: number): ThumbnailSize {
  if (displaySize <= 64) return "64x64";
  if (displaySize <= 128) return "128x128";
  if (displaySize <= 168) return "168x168";
  if (displaySize <= 216) return "216x216";
  if (displaySize <= 348) return "348x348";
  // For larger sizes, use "lg" preset or return undefined for full-size
  return "lg";
}

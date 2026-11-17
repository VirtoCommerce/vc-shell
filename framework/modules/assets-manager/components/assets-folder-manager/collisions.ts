export type CollisionDecision = { action: "overwrite" } | { action: "rename"; name: string } | { action: "skip" };

export interface UploadResult {
  uploaded: number;
  failed: number;
  skipped: number;
}

export function hasNameCollision(name: string, taken: Iterable<string>): boolean {
  const lower = name.toLowerCase();
  for (const t of taken) if (t.toLowerCase() === lower) return true;
  return false;
}

/**
 * A single folder or file name: not blank, not "." or "..", no path separators and no control
 * characters. Anything else could address a path outside the current folder.
 */
export function isValidEntryName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") return false;
  return !/[/\\\u0000-\u001f\u007f]/.test(trimmed);
}

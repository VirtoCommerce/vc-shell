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

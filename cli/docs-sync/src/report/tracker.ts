import type { SyncReport, SyncEntry, SkippedEntry, OrphanEntry, ErrorEntry } from "../types.js";

export class ReportTracker {
  private changes: SyncEntry[] = [];
  private skipped: SkippedEntry[] = [];
  private orphans: OrphanEntry[] = [];
  private errors: ErrorEntry[] = [];

  recordChange(entry: SyncEntry): void {
    this.changes.push(entry);
  }
  recordSkip(entry: SkippedEntry): void {
    this.skipped.push(entry);
  }
  recordError(entry: ErrorEntry): void {
    this.errors.push(entry);
  }
  setOrphans(orphans: OrphanEntry[]): void {
    this.orphans = orphans;
  }
  build(meta: { vcShellVersion: string; timestamp: string }): SyncReport {
    return {
      ...meta,
      changes: this.changes,
      skipped: this.skipped,
      orphans: this.orphans,
      errors: this.errors,
    };
  }
}

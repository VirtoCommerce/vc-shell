import type { API, FileInfo, Options } from "jscodeshift";

export type Transform = (
  fileInfo: FileInfo,
  api: API,
  options: Options & { cwd?: string; dryRun?: boolean },
) => string | null;

export interface TransformModule {
  default: Transform;
  parser?: string;
}

export interface VersionedTransform {
  name: string;
  description: string;
  introducedIn: string;
  migrationGuideSection?: string;
  diagnosticOnly?: boolean;
  /** "file" = called once per file (default), "project" = called once with cwd */
  scope?: "file" | "project";
  /** Absolute path to transform file for dynamic import */
  transformPath: string;
}

export interface TransformReport {
  name: string;
  filesModified: string[];
  filesSkipped: string[];
  filesErrored: Array<{ path: string; error: string }>;
  reports: string[];
}

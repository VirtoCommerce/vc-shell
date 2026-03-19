import type { Project } from "ts-morph";

export interface TransformOptions {
  dryRun: boolean;
  cwd: string;
}

export interface TransformResult {
  filesModified: string[];
  filesSkipped: string[];
  warnings: string[];
  errors: string[];
}

export interface VersionedTransform {
  name: string;
  description: string;
  /** The version that introduced the breaking change this transform fixes. */
  introducedIn: string;
  /** Migration guide section reference */
  migrationGuideSection?: string;
  /** Whether this transform is diagnostic-only (reports but doesn't modify) */
  diagnosticOnly?: boolean;
  run(project: Project, options: TransformOptions): TransformResult;
}

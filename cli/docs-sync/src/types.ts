export type { Category } from "./config.js";
import type { Category } from "./config.js";

export interface Frontmatter {
  title: string;
  category: Category;
  group: string;
  slug?: string;
  placement?: "index";
  internal?: boolean;
}

export interface ParsedDoc {
  sourcePath: string; // absolute path to source *.docs.md
  frontmatter: Frontmatter;
  body: string; // body without frontmatter
  imageRefs: string[]; // relative image paths found in body
}

export interface SyncContext {
  frameworkRoot: string; // absolute path to vc-shell
  targetRoot: string; // absolute path to vc-docs
  storybookUrl: string; // e.g. https://vc-shell-storybook.govirto.com
  storybookIds: Set<string>; // populated from index.json
  vcShellVersion: string; // read from framework/package.json
}

export type ChangeKind = "created" | "updated" | "unchanged";

export interface SyncEntry {
  source: string; // relative path inside vc-shell
  target: string; // relative path inside vc-docs
  kind: ChangeKind;
}

export interface SkippedEntry {
  source: string;
  reason: "no-frontmatter" | "internal" | "invalid-frontmatter";
  detail?: string;
}

export interface OrphanEntry {
  target: string; // path in vc-docs that has no source
}

export interface ErrorEntry {
  source: string;
  message: string;
}

export interface SyncReport {
  vcShellVersion: string;
  timestamp: string;
  changes: SyncEntry[];
  skipped: SkippedEntry[];
  orphans: OrphanEntry[];
  errors: ErrorEntry[];
}

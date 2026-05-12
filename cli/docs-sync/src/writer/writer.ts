import fs from "node:fs/promises";
import path from "node:path";
import { writeAtomic } from "./atomic.js";
import type { Frontmatter, ChangeKind } from "../types.js";

export function computeTargetPath(fm: Frontmatter, sourceFilename: string): string {
  const slug = fm.slug ?? sourceFilename.replace(/\.docs\.md$/, "");
  const groupPart = fm.group === "root" ? "" : fm.group;
  const filename = fm.placement === "index" ? "index.md" : `${slug}.md`;
  return [fm.category, groupPart, filename].filter(Boolean).join("/");
}

export interface WriteResult {
  kind: ChangeKind;
}

export async function writeMarkdown(targetRoot: string, relPath: string, content: string): Promise<WriteResult> {
  const abs = path.join(targetRoot, relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });

  let existing: string | null = null;
  try {
    existing = await fs.readFile(abs, "utf8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  if (existing === content) {
    return { kind: "unchanged" };
  }
  await writeAtomic(abs, content);
  return { kind: existing == null ? "created" : "updated" };
}

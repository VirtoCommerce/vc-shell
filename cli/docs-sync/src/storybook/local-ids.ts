import fs from "node:fs/promises";
import { globby } from "globby";

// Story ids of the repo's own *.stories.ts files, so docs can embed a story
// that is added in the same change, before the published Storybook has it.
// Mirrors Storybook's toId(title, storyNameFromExport(exportName)).

const sanitize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

// startCase: "PhoneFiltersSheetTest" -> "Phone Filters Sheet Test", "Step2" -> "Step 2"
const startCase = (s: string) =>
  s
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2");

export function storyIdsFromSource(source: string): string[] {
  const metaStart = source.search(/const\s+meta\b|export\s+default\s*\{/);
  if (metaStart < 0) return [];
  const title = source.slice(metaStart).match(/\btitle:\s*["'`]([^"'`]+)["'`]/)?.[1];
  if (!title) return [];
  const component = sanitize(title);
  const ids: string[] = [];
  for (const m of source.matchAll(/^export\s+const\s+([A-Za-z_$][\w$]*)/gm)) {
    ids.push(`${component}--${sanitize(startCase(m[1]))}`);
  }
  return ids;
}

export async function collectLocalStoryIds(dir: string): Promise<Set<string>> {
  const files = await globby(["**/*.stories.ts"], {
    cwd: dir,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**"],
  });
  const ids = new Set<string>();
  for (const file of files) {
    for (const id of storyIdsFromSource(await fs.readFile(file, "utf8"))) ids.add(id);
  }
  return ids;
}

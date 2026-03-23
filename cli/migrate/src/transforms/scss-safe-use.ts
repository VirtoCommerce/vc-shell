import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const SAFE_IMPORT_PATTERN = /^@import\s+['"]tailwind['"]/m;

function collectScssFiles(dir: string): string[] {
  const files: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir, { encoding: "utf-8" });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      files.push(...collectScssFiles(full));
    } else if (entry.endsWith(".scss")) {
      files.push(full);
    }
  }
  return files;
}

const transform: Transform = (_fileInfo: FileInfo, api: API, options: Options): string | null => {
  const cwd = (options as any).cwd ?? ".";
  const srcDir = join(cwd, "src");
  const scssFiles = collectScssFiles(srcDir);

  for (const filePath of scssFiles) {
    const content = readFileSync(filePath, "utf-8");
    const importLines = content.split("\n").filter((line) => /^@import\s/.test(line.trim()));

    for (const line of importLines) {
      if (SAFE_IMPORT_PATTERN.test(line)) continue;
      api.report(`${filePath}: ${line.trim()} — consider @use/@forward migration`);
    }
  }

  return null; // Never modify
};

export default transform;
export const parser = "tsx";

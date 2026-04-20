import { join } from "node:path";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { parse as parseSFC } from "@vue/compiler-sfc";

export const DEFAULT_EXCLUDES = ["api_client", "*.generated.ts", "*.d.ts"];

export function findFiles(dir: string, extensions: string[], excludes: string[]): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir, { encoding: "utf-8" });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry.startsWith(".") || entry === "dist") continue;
    if (excludes.includes(entry)) continue;
    const full = join(dir, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        results.push(...findFiles(full, extensions, excludes));
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        const excluded = excludes.some((pattern) => {
          if (pattern.startsWith("*")) {
            return entry.endsWith(pattern.slice(1));
          }
          return entry === pattern;
        });
        if (!excluded) {
          results.push(full);
        }
      }
    } catch {
      continue;
    }
  }
  return results;
}

// Scan src/modules/{module}/components/notifications/{file}.vue to build a mapping
// of notifyType event names to file names, keyed by module directory.
export function collectNotifyTypeMap(srcDir: string): Map<string, Record<string, Record<string, string>>> {
  const result = new Map<string, Record<string, Record<string, string>>>();
  const modulesDir = join(srcDir, "modules");
  if (!existsSync(modulesDir)) return result;

  let moduleEntries: string[];
  try {
    moduleEntries = readdirSync(modulesDir, { encoding: "utf-8" });
  } catch {
    return result;
  }

  for (const moduleEntry of moduleEntries) {
    const moduleDir = join(modulesDir, moduleEntry);
    try {
      if (!statSync(moduleDir).isDirectory()) continue;
    } catch {
      continue;
    }

    const notifDir = join(moduleDir, "components", "notifications");
    if (!existsSync(notifDir)) continue;

    const notifications: Record<string, string> = {};
    let files: string[];
    try {
      files = readdirSync(notifDir, { encoding: "utf-8" });
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".vue")) continue;
      try {
        const filePath = join(notifDir, file);
        const source = readFileSync(filePath, "utf-8");
        const { descriptor } = parseSFC(source, { filename: filePath });
        const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
        if (!scriptBlock) continue;

        const match = scriptBlock.content.match(
          /(?:defineOptions|defineBlade)\s*\(\s*\{[^}]*notifyType\s*:\s*["']([^"']+)["']/s,
        );
        if (match) {
          notifications[match[1]] = file;
        }
      } catch {
        continue;
      }
    }

    if (Object.keys(notifications).length > 0) {
      result.set(moduleDir, { "./components/notifications": notifications });
    }
  }

  return result;
}

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

// Scan src/modules/{module}/ to build a mapping of notifyType event names
// to notification template file names, keyed by module directory.
//
// Discovery strategy (in order):
// 1. Scan notification template .vue files for notifyType in defineOptions/defineBlade
// 2. Scan blade pages for notifyType and cross-reference with notification barrel
// 3. Fall back to barrel export names as event names (convention: export name = event name)
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
    let notifFiles: string[];
    try {
      notifFiles = readdirSync(notifDir, { encoding: "utf-8" });
    } catch {
      continue;
    }

    // Strategy 1: scan notification templates for notifyType
    for (const file of notifFiles) {
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

    // Strategy 2: scan blade pages for notifyType
    if (Object.keys(notifications).length === 0) {
      const pagesDir = join(moduleDir, "pages");
      const notifyTypes = collectNotifyTypesFromBlades(pagesDir);
      const barrelExports = parseBarrelExports(join(notifDir, "index.ts"));

      for (const eventName of notifyTypes) {
        const barrelFile = barrelExports.get(eventName);
        if (barrelFile) {
          notifications[eventName] = barrelFile;
        } else {
          const candidate = notifFiles.find((f) => f.endsWith(".vue") && f.replace(".vue", "") === eventName);
          if (candidate) {
            notifications[eventName] = candidate;
          }
        }
      }
    }

    // Strategy 3: fall back to barrel export names = event names
    if (Object.keys(notifications).length === 0) {
      const barrelExports = parseBarrelExports(join(notifDir, "index.ts"));
      for (const [exportName, fileName] of barrelExports) {
        notifications[exportName] = fileName;
      }
    }

    if (Object.keys(notifications).length > 0) {
      result.set(moduleDir, { "./components/notifications": notifications });
    }
  }

  return result;
}

function collectNotifyTypesFromBlades(pagesDir: string): string[] {
  const types: string[] = [];
  if (!existsSync(pagesDir)) return types;

  let files: string[];
  try {
    files = readdirSync(pagesDir, { encoding: "utf-8" });
  } catch {
    return types;
  }

  for (const file of files) {
    if (!file.endsWith(".vue")) continue;
    try {
      const source = readFileSync(join(pagesDir, file), "utf-8");
      const { descriptor } = parseSFC(source, { filename: file });
      const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
      if (!scriptBlock) continue;

      const match = scriptBlock.content.match(
        /(?:defineOptions|defineBlade)\s*\(\s*\{[^}]*notifyType\s*:\s*["']([^"']+)["']/s,
      );
      if (match && !types.includes(match[1])) {
        types.push(match[1]);
      }
    } catch {
      continue;
    }
  }

  return types;
}

function parseBarrelExports(barrelPath: string): Map<string, string> {
  const exports = new Map<string, string>();
  if (!existsSync(barrelPath)) return exports;

  try {
    const source = readFileSync(barrelPath, "utf-8");
    const re = /export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*["']\.\/([^"']+)["']/g;
    let m;
    while ((m = re.exec(source))) {
      const exportName = m[1];
      const importPath = m[2];
      const fileName = importPath.endsWith(".vue") ? importPath : `${importPath}.vue`;
      exports.set(exportName, fileName);
    }
  } catch {
    // ignore
  }

  return exports;
}

import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import writeFileAtomic from "write-file-atomic";

export function updateDependencyVersions(cwd: string, targetVersion: string, dryRun: boolean): string[] {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return [];

  const pkgRaw = readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw);
  const changes: string[] = [];

  for (const depType of ["dependencies", "devDependencies"] as const) {
    const deps = pkg[depType];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (name.startsWith("@vc-shell/")) {
        const oldVersion = deps[name];
        const newVersion = `^${targetVersion}`;
        if (oldVersion !== newVersion) {
          changes.push(`${name}: ${oldVersion} → ${newVersion}`);
          deps[name] = newVersion;
        }
      }
    }
  }

  if (changes.length > 0 && !dryRun) {
    writeFileAtomic.sync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  return changes;
}

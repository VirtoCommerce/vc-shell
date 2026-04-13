# @vc-shell/migrate v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the vc-shell migration tool production-quality: clean module structure, explicit transform ordering, idempotent re-runs, actionable report output, and 4 new transforms.

**Architecture:** First split the monolithic `runner.ts` (~400 lines) into focused modules (file-scanner, sfc-processor, report-generator, dep-updater). Then add `after` dependency field + topological sort, idempotency guards, `MIGRATION_REPORT.md` generation, and 4 new simple transforms.

**Tech Stack:** TypeScript, jscodeshift, semver, vitest

**Spec:** `docs/superpowers/specs/2026-04-06-migrate-tool-v2-design.md`

---

### Task 0: Refactor runner.ts into focused modules

**Files:**
- Create: `cli/migrate/src/file-scanner.ts`
- Create: `cli/migrate/src/sfc-processor.ts`
- Create: `cli/migrate/src/report-generator.ts`
- Create: `cli/migrate/src/dep-updater.ts`
- Modify: `cli/migrate/src/runner.ts`

- [ ] **Step 1: Extract file-scanner.ts**

Create `cli/migrate/src/file-scanner.ts` — move `findFiles()` and `collectNotifyTypeMap()` from runner.ts:

```ts
import { join, existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { parse as parseSFC } from "@vue/compiler-sfc";

const DEFAULT_EXCLUDES = ["api_client", "*.generated.ts", "*.d.ts"];

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

export function collectNotifyTypeMap(srcDir: string): Map<string, Record<string, Record<string, string>>> {
  // ... move existing collectNotifyTypeMap from runner.ts verbatim
}

export { DEFAULT_EXCLUDES };
```

- [ ] **Step 2: Extract sfc-processor.ts**

Create `cli/migrate/src/sfc-processor.ts` — move `preDedupSource()`, `collapseMultiLineImports()`, and `parseValidate()`:

```ts
import { parse as parseSFC } from "@vue/compiler-sfc";
import jscodeshift from "jscodeshift";
import { deduplicateImportSpecifiers } from "./utils/import-dedup.js";

export function collapseMultiLineImports(script: string): string {
  return script.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/gs, (match) =>
    match.replace(/\s*\n\s*/g, " "),
  );
}

export function preDedupSource(source: string, filePath: string, j: any): string {
  if (filePath.endsWith(".vue")) {
    const { descriptor } = parseSFC(source, { filename: filePath });
    const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
    if (!scriptBlock) return source;
    const collapsed = collapseMultiLineImports(scriptBlock.content);
    const deduped = deduplicateImportSpecifiers(collapsed, j);
    if (deduped === scriptBlock.content) return source;
    const start = scriptBlock.loc.start.offset;
    const end = scriptBlock.loc.end.offset;
    return source.substring(0, start) + deduped + source.substring(end);
  }
  return deduplicateImportSpecifiers(source, j);
}

export function parseValidate(filePath: string, source: string, parser: string): string | null {
  try {
    if (filePath.endsWith(".vue")) {
      const { descriptor, errors } = parseSFC(source, { filename: filePath });
      if (errors.length > 0) {
        return `SFC parse error: ${errors[0].message}`;
      }
      const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
      if (scriptBlock) {
        jscodeshift.withParser(parser)(scriptBlock.content);
      }
    } else {
      jscodeshift.withParser(parser)(source);
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}
```

- [ ] **Step 3: Extract dep-updater.ts**

Create `cli/migrate/src/dep-updater.ts` — move `updateDependencyVersions()`:

```ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
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
```

- [ ] **Step 4: Slim down runner.ts**

Replace the moved functions in `runner.ts` with imports. The runner should only contain:
- `RunOptions` interface
- `detectLatestFrameworkVersion()`
- `run()` — the orchestration function
- `listTransforms()`

```ts
import chalk from "chalk";
import { resolve, join, dirname } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import writeFileAtomic from "write-file-atomic";
import jscodeshift from "jscodeshift";
import { detectFrameworkVersion } from "./version-detector.js";
import { selectTransforms, transforms } from "./transforms/registry.js";
import type { TransformModule, TransformReport } from "./transforms/types.js";
import { deduplicateImportSpecifiers } from "./utils/import-dedup.js";
import { findFiles, collectNotifyTypeMap, DEFAULT_EXCLUDES } from "./file-scanner.js";
import { preDedupSource, parseValidate } from "./sfc-processor.js";
import { updateDependencyVersions } from "./dep-updater.js";

// ... RunOptions, detectLatestFrameworkVersion, run(), listTransforms()
// run() body stays the same but is now ~120 lines instead of ~250
```

- [ ] **Step 5: Standardize diagnostic output — replace console.log with api.report()**

Search all transforms for direct `console.log` calls and replace with `api.report()`. Files to check:
- `use-assets-migration.ts` — has `console.log(formatDiagnostic(...))` → change to `api.report()`
- `dynamic-properties-refactor.ts` — has `console.log(...)` → change to `api.report()`
- `use-blade-form.ts` — has `console.log(...)` → change to `api.report()`

- [ ] **Step 6: Run all tests to verify refactor is behavior-preserving**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all 142 tests pass, zero behavior change

- [ ] **Step 7: Commit**

```
refactor(migrate): split runner.ts into focused modules (file-scanner, sfc-processor, dep-updater)
```

---

### Task 1: Add `after` field to VersionedTransform type

**Files:**
- Modify: `cli/migrate/src/transforms/types.ts`

- [ ] **Step 1: Add `after` to interface**

In `cli/migrate/src/transforms/types.ts`, add to `VersionedTransform`:

```ts
export interface VersionedTransform {
  name: string;
  description: string;
  introducedIn: string;
  migrationGuideSection?: string;
  diagnosticOnly?: boolean;
  scope?: "file" | "project";
  transformPath: string;
  excludeFiles?: string[];
  fileExtensions?: string[];
  /** Transform names that must complete before this one runs */
  after?: string[];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd cli/migrate && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```
feat(migrate): add after field to VersionedTransform for dependency ordering
```

---

### Task 2: Implement topological sort in runner

**Files:**
- Modify: `cli/migrate/src/runner.ts`
- Create: `cli/migrate/tests/runner/topological-sort.test.ts`

- [ ] **Step 1: Write failing test for topological sort**

Create `cli/migrate/tests/runner/topological-sort.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { topologicalSort } from "../../src/runner";
import type { VersionedTransform } from "../../src/transforms/types";

function stub(name: string, after?: string[]): VersionedTransform {
  return {
    name,
    description: "",
    introducedIn: "2.0.0",
    transformPath: "",
    after,
  };
}

describe("topologicalSort", () => {
  it("preserves order when no dependencies", () => {
    const input = [stub("a"), stub("b"), stub("c")];
    const result = topologicalSort(input);
    expect(result.map((t) => t.name)).toEqual(["a", "b", "c"]);
  });

  it("reorders based on after dependency", () => {
    const input = [stub("blade-props", ["define-options"]), stub("define-options"), stub("other")];
    const result = topologicalSort(input);
    const names = result.map((t) => t.name);
    expect(names.indexOf("define-options")).toBeLessThan(names.indexOf("blade-props"));
  });

  it("handles transitive dependencies", () => {
    const input = [stub("c", ["b"]), stub("b", ["a"]), stub("a")];
    const result = topologicalSort(input);
    expect(result.map((t) => t.name)).toEqual(["a", "b", "c"]);
  });

  it("preserves relative order of unrelated transforms", () => {
    const input = [stub("x"), stub("c", ["a"]), stub("y"), stub("a")];
    const result = topologicalSort(input);
    const names = result.map((t) => t.name);
    expect(names.indexOf("a")).toBeLessThan(names.indexOf("c"));
    // x and y keep relative order among themselves
    expect(names.indexOf("x")).toBeLessThan(names.indexOf("y"));
  });

  it("throws on cycle", () => {
    const input = [stub("a", ["b"]), stub("b", ["a"])];
    expect(() => topologicalSort(input)).toThrow(/cycle/i);
  });

  it("ignores after references to transforms not in the selected set", () => {
    const input = [stub("b", ["not-selected"]), stub("a")];
    const result = topologicalSort(input);
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli/migrate && npx vitest run tests/runner/topological-sort.test.ts`
Expected: FAIL — `topologicalSort` not exported

- [ ] **Step 3: Implement topologicalSort in runner.ts**

Add to `cli/migrate/src/runner.ts` (export it for testing):

```ts
/**
 * Kahn's algorithm: topological sort with stable ordering for unrelated nodes.
 * Transforms without `after` (or whose `after` targets aren't in the set) have
 * no incoming edges and retain their original relative order.
 */
export function topologicalSort(transforms: VersionedTransform[]): VersionedTransform[] {
  const nameToIndex = new Map<string, number>();
  transforms.forEach((t, i) => nameToIndex.set(t.name, i));

  // Build adjacency: after[i] → i (i depends on after[i])
  const inDegree = new Array(transforms.length).fill(0);
  const dependents = new Map<number, number[]>(); // prerequisite index → dependent indices

  for (let i = 0; i < transforms.length; i++) {
    for (const dep of transforms[i].after ?? []) {
      const depIdx = nameToIndex.get(dep);
      if (depIdx === undefined) continue; // dependency not in selected set — skip
      inDegree[i]++;
      if (!dependents.has(depIdx)) dependents.set(depIdx, []);
      dependents.get(depIdx)!.push(i);
    }
  }

  // Seed queue with zero-indegree nodes, preserving original order
  const queue: number[] = [];
  for (let i = 0; i < transforms.length; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result: VersionedTransform[] = [];
  while (queue.length > 0) {
    const idx = queue.shift()!;
    result.push(transforms[idx]);
    for (const dep of dependents.get(idx) ?? []) {
      inDegree[dep]--;
      if (inDegree[dep] === 0) queue.push(dep);
    }
  }

  if (result.length !== transforms.length) {
    const missing = transforms.filter((_, i) => !result.includes(transforms[i])).map((t) => t.name);
    throw new Error(`Cycle detected in transform dependencies: ${missing.join(", ")}`);
  }

  return result;
}
```

- [ ] **Step 4: Wire topologicalSort into runner**

In `cli/migrate/src/runner.ts`, replace `let selected = selectTransforms(...)` block:

```ts
  let selected = selectTransforms(currentVersion, targetVersion);

  if (options.transform) {
    selected = selected.filter((t) => t.name === options.transform);
    if (selected.length === 0) {
      console.log(chalk.yellow(`Transform "${options.transform}" not found or not applicable for this version range.`));
      return;
    }
  }

  // Topological sort by after dependencies
  selected = topologicalSort(selected);
```

- [ ] **Step 5: Run all tests**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all pass

- [ ] **Step 6: Commit**

```
feat(migrate): topological sort for transform dependency ordering
```

---

### Task 3: Declare `after` dependencies in registry

**Files:**
- Modify: `cli/migrate/src/transforms/registry.ts`

- [ ] **Step 1: Add after fields**

In `cli/migrate/src/transforms/registry.ts`:

For `blade-props-simplification`:
```ts
  {
    name: "blade-props-simplification",
    // ...existing fields...
    after: ["define-options-to-blade"],
  },
```

For `define-options-to-blade`:
```ts
  {
    name: "define-options-to-blade",
    // ...existing fields...
    after: ["use-blade-migration"],
  },
```

For `remove-pathmatch-route`:
```ts
  {
    name: "remove-pathmatch-route",
    // ...existing fields...
    after: ["use-blade-migration"],
  },
```

- [ ] **Step 2: Run tests**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all pass. Check that `select-transforms.test.ts` still passes — topological sort should preserve the expected order for transforms without `after`.

- [ ] **Step 3: Commit**

```
feat(migrate): declare after dependencies for blade-props, define-options, remove-pathmatch
```

---

### Task 4: Idempotency — dedup guard and integration test

**Files:**
- Modify: `cli/migrate/src/runner.ts`
- Create: `cli/migrate/tests/integration/idempotency.test.ts`

- [ ] **Step 1: Write failing idempotency integration test**

Create `cli/migrate/tests/integration/idempotency.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { run } from "../../src/runner";

function createFixtureProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "migrate-idem-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "test-app",
      dependencies: { "@vc-shell/framework": "^1.0.0" },
    }),
  );
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "module.ts"),
    `import { createAppModule } from "@vc-shell/framework";\nexport default createAppModule(pages, locales);\n`,
  );
  return dir;
}

describe("idempotency", () => {
  it("second run produces zero modifications", async () => {
    const dir = createFixtureProject();

    // First run
    await run({ cwd: dir, dryRun: false, list: false, noReport: true });

    // Read all files after first run
    const moduleAfterFirst = readFileSync(join(dir, "src", "module.ts"), "utf-8");

    // Second run
    await run({ cwd: dir, dryRun: false, list: false, noReport: true });

    // Files should be unchanged
    const moduleAfterSecond = readFileSync(join(dir, "src", "module.ts"), "utf-8");
    expect(moduleAfterSecond).toBe(moduleAfterFirst);
  });
});
```

- [ ] **Step 2: Run test to verify it fails (or passes — dedup may already be ok)**

Run: `cd cli/migrate && npx vitest run tests/integration/idempotency.test.ts`

- [ ] **Step 3: Add `noReport` to RunOptions and guard dedup**

In `cli/migrate/src/runner.ts`, add `noReport?: boolean` to `RunOptions`.

Fix dedup guard — after the transform result check, compare dedup output before writing:

```ts
          if (result != null && result !== source) {
            try {
              const deduped = deduplicateImportSpecifiers(result, j);
              // Only use deduped if it actually changed something
              if (deduped !== result) {
                result = deduped;
              }
            } catch {
              // Dedup failed — use result as-is
            }

            // Final idempotency check: if after dedup the result equals the original, skip
            if (result === source) {
              report.filesSkipped.push(filePath);
              continue;
            }

            const validationError = parseValidate(filePath, result, parser);
```

Note: add `continue` to skip the remaining write logic when result equals source after dedup.

- [ ] **Step 4: Run all tests**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all pass including idempotency test

- [ ] **Step 5: Commit**

```
feat(migrate): idempotency guard — second run produces zero modifications
```

---

### Task 5: Migration report generation

**Files:**
- Modify: `cli/migrate/src/runner.ts`
- Modify: `cli/migrate/src/cli.ts`
- Create: `cli/migrate/tests/integration/migration-report.test.ts`

- [ ] **Step 1: Write failing test for report generation**

Create `cli/migrate/tests/integration/migration-report.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { run } from "../../src/runner";

function createFixtureProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "migrate-report-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "test-app",
      dependencies: { "@vc-shell/framework": "^1.0.0" },
    }),
  );
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "module.ts"),
    `import { createAppModule } from "@vc-shell/framework";\nexport default createAppModule(pages, locales);\n`,
  );
  return dir;
}

describe("migration report", () => {
  it("generates MIGRATION_REPORT.md after migration", async () => {
    const dir = createFixtureProject();
    await run({ cwd: dir, dryRun: false, list: false });

    const reportPath = join(dir, "MIGRATION_REPORT.md");
    expect(existsSync(reportPath)).toBe(true);

    const content = readFileSync(reportPath, "utf-8");
    expect(content).toContain("Migration Report");
    expect(content).toContain("Automated Changes");
    expect(content).toContain("define-app-module");
  });

  it("skips report in dry-run mode", async () => {
    const dir = createFixtureProject();
    await run({ cwd: dir, dryRun: true, list: false });

    const reportPath = join(dir, "MIGRATION_REPORT.md");
    expect(existsSync(reportPath)).toBe(false);
  });

  it("skips report with noReport option", async () => {
    const dir = createFixtureProject();
    await run({ cwd: dir, dryRun: false, list: false, noReport: true });

    const reportPath = join(dir, "MIGRATION_REPORT.md");
    expect(existsSync(reportPath)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli/migrate && npx vitest run tests/integration/migration-report.test.ts`
Expected: FAIL — no MIGRATION_REPORT.md generated

- [ ] **Step 3: Implement report generation**

Add to `cli/migrate/src/runner.ts`:

```ts
// List of migration guides without automated transforms — for "Not Covered" section
const UNCOVERED_GUIDES = [
  { guide: "03-moment-to-datefns", grep: "moment", description: "moment.js → date-fns migration" },
  { guide: "08-dynamic-views-removal", grep: "DynamicBladeList\\|DynamicBladeForm", description: "Remove DynamicBladeList/DynamicBladeForm" },
  { guide: "16-login-form", grep: "useLogin", description: "useLogin composable API changes" },
  { guide: "29-vc-table-to-data-table", grep: "VcTable\\b", description: "Old VcTable → VcDataTable migration" },
];

function generateMigrationReport(
  cwd: string,
  currentVersion: string,
  targetVersion: string,
  allReports: TransformReport[],
  depChanges: string[],
  sourceFiles: string[],
): void {
  const lines: string[] = [];
  const date = new Date().toISOString().split("T")[0];
  lines.push(`# Migration Report: ${currentVersion} → ${targetVersion}`);
  lines.push(`Generated: ${date}\n`);

  // Automated changes
  const modified = allReports.filter((r) => r.filesModified.length > 0);
  const totalModified = allReports.reduce((sum, r) => sum + r.filesModified.length, 0);
  lines.push(`## Automated Changes (${totalModified} files)\n`);
  for (const r of modified) {
    lines.push(`- ✅ **${r.name}** — ${r.filesModified.length} file(s)`);
  }
  if (modified.length === 0) lines.push("_No automated changes applied._");

  // Manual migration required
  const manualItems = allReports.flatMap((r) => r.reports.map((msg) => ({ transform: r.name, message: msg })));
  if (manualItems.length > 0) {
    lines.push(`\n## Manual Migration Required (${manualItems.length} items)\n`);
    for (const item of manualItems) {
      lines.push(`- ⚠ **${item.transform}** — ${item.message}`);
    }
  }

  // Rolled back
  const rolledBack = allReports.flatMap((r) => r.filesRolledBack.map((f) => ({ transform: r.name, ...f })));
  if (rolledBack.length > 0) {
    lines.push(`\n## Rolled Back (parse errors)\n`);
    for (const item of rolledBack) {
      lines.push(`- ⟲ **${item.transform}** — \`${item.path}\`: ${item.error}`);
    }
  }

  // Dependencies updated
  if (depChanges.length > 0) {
    lines.push(`\n## Dependencies Updated\n`);
    for (const c of depChanges) {
      lines.push(`- ${c}`);
    }
  }

  // Not covered by migrator — scan source files for relevance
  const allSource = sourceFiles.map((f) => readFileSync(f, "utf-8")).join("\n");
  const relevant = UNCOVERED_GUIDES.filter((g) => new RegExp(g.grep).test(allSource));
  if (relevant.length > 0) {
    lines.push(`\n## Not Covered by Migrator\n`);
    lines.push("_These migration guides may be relevant — check manually:_\n");
    for (const g of relevant) {
      lines.push(`- **${g.guide}** — ${g.description}`);
      lines.push(`  Check: \`grep -rn "${g.grep}" src/\``);
    }
  }

  writeFileAtomic.sync(join(cwd, "MIGRATION_REPORT.md"), lines.join("\n") + "\n");
  console.log(chalk.blue(`\n📄 Migration report written to MIGRATION_REPORT.md`));
}
```

- [ ] **Step 4: Wire into run() function**

In `runner.ts`, collect `allReports` array during the transform loop and call `generateMigrationReport` after the summary:

```ts
  const allReports: TransformReport[] = [];

  for (const t of selected) {
    // ... existing transform loop ...
    allReports.push(report);
    // ... existing reporting ...
  }

  // After summary, generate report
  if (!options.dryRun && !options.noReport) {
    generateMigrationReport(cwd, currentVersion, targetVersion, allReports, depChanges, sourceFiles);
  }
```

- [ ] **Step 5: Add `--no-report` flag to CLI**

In `cli/migrate/src/cli.ts`, add option:

```ts
  .option("--no-report", "Skip MIGRATION_REPORT.md generation", false)
```

And pass to `run()`:

```ts
    await run({
      // ...existing options...
      noReport: options.noReport ?? false,
    });
```

- [ ] **Step 6: Run all tests**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all pass

- [ ] **Step 7: Commit**

```
feat(migrate): generate MIGRATION_REPORT.md with automated/manual/uncovered sections
```

---

### Task 6: Complete injection-keys rename map (guide 21)

**Files:**
- Modify: `cli/migrate/src/transforms/remove-deprecated-aliases.ts`
- Modify: `cli/migrate/tests/transforms/remove-deprecated-aliases/transform.test.ts`

- [ ] **Step 1: Write failing test**

Add to `tests/transforms/remove-deprecated-aliases/transform.test.ts`:

```ts
  it("renames NotificationTemplatesSymbol to NotificationTemplatesKey", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { NotificationTemplatesSymbol } from "@vc-shell/framework";\nconst tpl = inject(NotificationTemplatesSymbol);`,
    });
    expect(result).toContain("NotificationTemplatesKey");
    expect(result).not.toContain("NotificationTemplatesSymbol");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli/migrate && npx vitest run tests/transforms/remove-deprecated-aliases/transform.test.ts`
Expected: FAIL

- [ ] **Step 3: Add to rename map**

In `cli/migrate/src/transforms/remove-deprecated-aliases.ts`, add to `RENAME_MAP`:

```ts
const RENAME_MAP: Record<string, string> = {
  navigationViewLocation: "NavigationViewLocationKey",
  BLADE_BACK_BUTTON: "BladeBackButtonKey",
  TOOLBAR_SERVICE: "ToolbarServiceKey",
  EMBEDDED_MODE: "EmbeddedModeKey",
  NotificationTemplatesSymbol: "NotificationTemplatesKey",
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli/migrate && npx vitest run tests/transforms/remove-deprecated-aliases/transform.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```
feat(migrate): add NotificationTemplatesSymbol → NotificationTemplatesKey rename
```

---

### Task 7: `replace-cover-method` diagnostic transform (guide 12)

**Files:**
- Create: `cli/migrate/src/transforms/replace-cover-method.ts`
- Modify: `cli/migrate/src/transforms/registry.ts`
- Create: `cli/migrate/tests/transforms/replace-cover-method/transform.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/migrate/tests/transforms/replace-cover-method/transform.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/replace-cover-method";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("replace-cover-method (diagnostic)", () => {
  it("emits diagnostic for replaceWith usage", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";\nconst { replaceWith } = useBlade();\nreplaceWith({ name: "Details" });`,
    });
    expect(result).toBeNull(); // diagnostic-only
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("replaceWith");
    expect(reports[0]).toContain("coverWith");
  });

  it("skips files without replaceWith", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";\nconst { openBlade } = useBlade();`,
    });
    expect(result).toBeNull();
    expect(reports).toHaveLength(0);
  });

  it("skips files without framework import", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const x = 1;`,
    });
    expect(result).toBeNull();
    expect(reports).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Create transform**

Create `cli/migrate/src/transforms/replace-cover-method.ts`:

```ts
import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Diagnostic-only: detect replaceWith() usage and warn about semantics change.
 * replaceWith() now truly destroys the old blade. If the caller relied on
 * the old blade staying alive, they should use coverWith() instead.
 */
function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  const hasReplaceWith = root.find(j.Identifier, { name: "replaceWith" }).size() > 0;
  if (!hasReplaceWith) return null;

  api.report(
    `${fileInfo.path}: replaceWith() semantics changed — now truly replaces (destroys old blade). ` +
      `If you relied on the old blade staying alive underneath, use coverWith() instead. See migration guide #12.`,
  );

  return null;
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
```

- [ ] **Step 3: Register in registry**

Add to `cli/migrate/src/transforms/registry.ts` (after `use-assets-migration`):

```ts
  {
    name: "replace-cover-method",
    description: "Detect replaceWith() usage — semantics changed, may need coverWith()",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "Guide 12",
    transformPath: t("replace-cover-method"),
  },
```

- [ ] **Step 4: Update test counts**

In `tests/runner/select-transforms.test.ts`, add `"replace-cover-method"` to the expected array.
In `tests/integration/full-migration.test.ts`, increment count to 26.

- [ ] **Step 5: Run all tests**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all pass

- [ ] **Step 6: Commit**

```
feat(migrate): add replace-cover-method diagnostic (guide 12)
```

---

### Task 8: `locale-imports` transform (guide 33)

**Files:**
- Create: `cli/migrate/src/transforms/locale-imports.ts`
- Modify: `cli/migrate/src/transforms/registry.ts`
- Create: `cli/migrate/tests/transforms/locale-imports/transform.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/migrate/tests/transforms/locale-imports/transform.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/locale-imports";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("locale-imports", () => {
  it("rewrites framework dist locale import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import en from "@vc-shell/framework/dist/locales/en.json";`,
    });
    expect(result).toContain(`from "@vc-shell/framework/locales/en"`);
    expect(result).not.toContain("dist/locales");
    expect(result).not.toContain(".json");
  });

  it("handles other locale names", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import de from "@vc-shell/framework/dist/locales/de.json";`,
    });
    expect(result).toContain(`from "@vc-shell/framework/locales/de"`);
  });

  it("skips non-framework locale imports", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import en from "./locales/en.json";`,
    });
    expect(result).toBeNull();
  });

  it("skips already-migrated imports", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import en from "@vc-shell/framework/locales/en";`,
    });
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Create transform**

Create `cli/migrate/src/transforms/locale-imports.ts`:

```ts
import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Rewrite framework locale imports from dist path to new entry point.
 * Before: import en from "@vc-shell/framework/dist/locales/en.json"
 * After:  import en from "@vc-shell/framework/locales/en"
 */

const OLD_PREFIX = "@vc-shell/framework/dist/locales/";

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;

  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    if (typeof source !== "string") return;
    if (!source.startsWith(OLD_PREFIX)) return;

    // Extract locale name: "en.json" → "en"
    const filename = source.slice(OLD_PREFIX.length);
    const localeName = filename.replace(/\.json$/, "");

    path.node.source.value = `@vc-shell/framework/locales/${localeName}`;
    modified = true;
  });

  if (!modified) return null;
  return root.toSource();
};

export default transform;
export const parser = "tsx";
```

- [ ] **Step 3: Register in registry**

```ts
  {
    name: "locale-imports",
    description: "@vc-shell/framework/dist/locales/*.json → @vc-shell/framework/locales/*",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 33",
    transformPath: t("locale-imports"),
    fileExtensions: [".ts"],
  },
```

- [ ] **Step 4: Update test counts and run all tests**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all pass

- [ ] **Step 5: Commit**

```
feat(migrate): add locale-imports transform (guide 33)
```

---

### Task 9: `window-globals` diagnostic transform (guide 04)

**Files:**
- Create: `cli/migrate/src/transforms/window-globals.ts`
- Modify: `cli/migrate/src/transforms/registry.ts`
- Create: `cli/migrate/tests/transforms/window-globals/transform.test.ts`

- [ ] **Step 1: Write failing test**

Create `cli/migrate/tests/transforms/window-globals/transform.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/window-globals";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("window-globals (diagnostic)", () => {
  it("reports window._ usage", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const items = window._.uniq(list);`,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("window._");
  });

  it("reports window.Vue usage", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const app = window.Vue.createApp({});`,
    });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("window.Vue");
  });

  it("reports window.moment usage", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const date = window.moment().format("LLL");`,
    });
    expect(reports.length).toBeGreaterThan(0);
  });

  it("skips files without window globals", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(reports).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Create transform**

Create `cli/migrate/src/transforms/window-globals.ts`:

```ts
import type { FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Diagnostic-only: detect removed window globals (window.Vue, window._, window.moment, etc.)
 * and report with migration guidance.
 */

const WINDOW_GLOBALS: Record<string, string> = {
  "window.Vue": "Use `import { createApp } from 'vue'` instead",
  "window.VueRouter": "Use `import { createRouter } from 'vue-router'` instead",
  "window.moment": "Use `import { formatDateWithPattern } from '@vc-shell/framework'` — see guide 03",
  "window._": "Use `import { uniq, debounce, ... } from 'lodash-es'` instead",
  "window.VcShellFramework": "Use named imports from '@vc-shell/framework' instead",
  "window.VeeValidate": "Use `import { useForm, Field } from 'vee-validate'` instead",
  "window.VueUse": "Use `import { ... } from '@vueuse/core'` instead",
  "window.VueI18n": "Use `import { useI18n } from 'vue-i18n'` instead",
};

const transform: Transform = (fileInfo: FileInfo, _api: unknown, _options: Options): string | null => {
  const source = fileInfo.source;

  for (const [global, advice] of Object.entries(WINDOW_GLOBALS)) {
    // Use word boundary after the global name to avoid false matches
    const escaped = global.replace(".", "\\.");
    const re = new RegExp(`\\b${escaped}\\b`);
    if (re.test(source)) {
      const api = _api as { report: (msg: string) => void };
      api.report(`${fileInfo.path}: ${global} is removed in v2. ${advice}`);
    }
  }

  return null; // diagnostic-only
};

export default transform;
export const parser = "tsx";
```

- [ ] **Step 3: Register in registry**

```ts
  {
    name: "window-globals",
    description: "Detect removed window.Vue/window._/window.moment globals",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "Guide 04",
    transformPath: t("window-globals"),
  },
```

- [ ] **Step 4: Update test counts and run all tests**

Run: `cd cli/migrate && npx tsc && npx vitest run`
Expected: all pass

- [ ] **Step 5: Commit**

```
feat(migrate): add window-globals diagnostic (guide 04)
```

---

### Task 10: Final validation on real apps

**Files:** none (verification only)

- [ ] **Step 1: Build migrator**

Run: `cd cli/migrate && npx tsc`

- [ ] **Step 2: Run on push-messages (first run)**

```bash
node cli/migrate/dist/cli.js --cwd /Users/symbot/DEV/vc-module-push-messages/src/VirtoCommerce.PushMessages.Web/App --update-deps
```

Verify: MIGRATION_REPORT.md generated, `blade-props-simplification` runs AFTER `define-options-to-blade` in output.

- [ ] **Step 3: Run on push-messages (second run — idempotency)**

```bash
node cli/migrate/dist/cli.js --cwd /Users/symbot/DEV/vc-module-push-messages/src/VirtoCommerce.PushMessages.Web/App --update-deps
```

Expected: `Files modified: 0` — all transforms skip already-migrated code.

- [ ] **Step 4: Run on remaining 3 apps**

```bash
node cli/migrate/dist/cli.js --cwd /Users/symbot/DEV/vc-module-news/src/VirtoCommerce.News.Web/App --update-deps
node cli/migrate/dist/cli.js --cwd /Users/symbot/DEV/vc-module-pagebuilder/src/VirtoCommerce.PageBuilderModule.Web/Apps/page-builder-shell --update-deps
node cli/migrate/dist/cli.js --cwd /Users/symbot/DEV/vc-module-task-management/src/VirtoCommerce.TaskManagement.Web/App --update-deps
```

Verify: no errors, MIGRATION_REPORT.md in each app, no blade pages with leftover Props interface.

- [ ] **Step 5: Verify no blade pages with leftover Props**

```bash
for app in push-messages news pagebuilder task-management; do
  find /path/to/$app -name "*.vue" -path "*/pages/*" -exec grep -l "interface Props" {} \; | while read f; do
    grep -q "defineBlade" "$f" && echo "WARN: $f has Props + defineBlade"
  done
done
```

Expected: zero warnings.

- [ ] **Step 6: Commit any test fixture updates needed**

```
test(migrate): validate on 4 real apps — idempotent, report generated, correct ordering
```

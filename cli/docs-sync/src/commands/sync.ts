import path from "node:path";
import fs from "node:fs/promises";
import { globby } from "globby";
import chalk from "chalk";
import { FRAMEWORK_DIR, STORYBOOK_URL, VC_DOCS_RELATIVE_BASE } from "../config.js";
import { parseDocFile, FrontmatterError } from "../parser/parser.js";
import { runTransformPipeline } from "../transformer/pipeline.js";
import { fetchStorybookIds } from "../storybook/index-fetcher.js";
import { computeTargetPath, writeMarkdown } from "../writer/writer.js";
import { copyImageAssets } from "../writer/assets.js";
import { writePagesFiles } from "../writer/pages.js";
import { findOrphans } from "../report/orphans.js";
import { ReportTracker } from "../report/tracker.js";
import { formatReport } from "../report/formatter.js";
import type { Frontmatter } from "../types.js";

export interface SyncArgs {
  target: string; // path to vc-docs root
  frameworkDir?: string; // override: defaults to FRAMEWORK_DIR (vc-shell/framework)
  dryRun?: boolean;
  reportPath?: string; // optional override for report output
}

export async function runSync(args: SyncArgs): Promise<{ exitCode: number }> {
  const frameworkDir = args.frameworkDir ?? FRAMEWORK_DIR;
  const targetAbs = path.resolve(args.target);
  const targetSection = path.join(targetAbs, VC_DOCS_RELATIVE_BASE);

  // Read framework version.
  const fwPkg = JSON.parse(await fs.readFile(path.join(frameworkDir, "package.json"), "utf8"));
  const vcShellVersion = `v${fwPkg.version}`;

  // Fetch Storybook story IDs.
  const knownStoryIds = await fetchStorybookIds(STORYBOOK_URL);

  // Discover all *.docs.md.
  const sources = await globby(["**/*.docs.md"], { cwd: frameworkDir, absolute: true });

  const tracker = new ReportTracker();

  // First pass: parse all docs to build a path map for cross-doc link resolution.
  const parsed = new Map<string, { fm: Frontmatter; rel: string; target: string }>();
  for (const abs of sources) {
    const rel = path.relative(frameworkDir, abs);
    try {
      const doc = await parseDocFile(abs);
      if (doc.frontmatter.internal) {
        tracker.recordSkip({ source: rel, reason: "internal" });
        continue;
      }
      const target = computeTargetPath(doc.frontmatter, path.basename(abs));
      parsed.set(abs, { fm: doc.frontmatter, rel, target });
    } catch (err) {
      if (err instanceof FrontmatterError) {
        // Distinguish "no frontmatter at all" from "invalid frontmatter" by checking the source.
        const raw = await fs.readFile(abs, "utf8");
        if (!raw.startsWith("---")) {
          tracker.recordSkip({ source: rel, reason: "no-frontmatter" });
        } else {
          tracker.recordSkip({ source: rel, reason: "invalid-frontmatter", detail: err.message });
        }
      } else {
        tracker.recordError({ source: rel, message: (err as Error).message });
      }
    }
  }

  // Build resolveTarget: map (sourcePath, href) → target path.
  // Strategy: for any link href, resolve absolutely from sourceDir, normalize to .docs.md
  // suffix, and look up in `parsed`.
  const sourceToTarget = new Map<string, string>();
  for (const [absSrc, info] of parsed) {
    sourceToTarget.set(absSrc, info.target);
  }
  const resolveTarget = (sourceRel: string, href: string): string | null => {
    const sourceAbs = path.join(frameworkDir, sourceRel);
    const sourceDir = path.dirname(sourceAbs);
    // Try a few common patterns: `../foo`, `../foo/foo`, `../foo/foo.docs.md`.
    const candidates = [
      path.resolve(sourceDir, href),
      path.resolve(sourceDir, href + ".docs.md"),
      path.resolve(sourceDir, href, path.basename(href) + ".docs.md"),
    ];
    for (const cand of candidates) {
      const found = sourceToTarget.get(cand);
      if (found) return found;
    }
    return null;
  };

  // Second pass: transform and write.
  const synced: { target: string; title: string }[] = [];
  for (const [abs, info] of parsed) {
    try {
      const doc = await parseDocFile(abs);
      const transformed = runTransformPipeline(doc.body, {
        sourceRelPath: info.rel,
        sourcePath: info.rel,
        targetPath: info.target,
        storybookUrl: STORYBOOK_URL,
        knownStoryIds,
        resolveTarget,
      });

      if (args.dryRun) {
        tracker.recordChange({ source: info.rel, target: info.target, kind: "created" });
        synced.push({ target: info.target, title: info.fm.title });
        continue;
      }

      const writeRes = await writeMarkdown(targetSection, info.target, transformed);
      tracker.recordChange({ source: info.rel, target: info.target, kind: writeRes.kind });
      synced.push({ target: info.target, title: info.fm.title });

      if (doc.imageRefs.length > 0) {
        await copyImageAssets({
          sourceFile: abs,
          targetFile: path.join(targetSection, info.target),
          imageRefs: doc.imageRefs,
        });
      }
    } catch (err) {
      tracker.recordError({ source: info.rel, message: (err as Error).message });
    }
  }

  // Emit .nav.yml files.
  if (!args.dryRun) {
    await writePagesFiles(targetSection, { synced });
  }

  // Detect orphans.
  const syncedSet = new Set(synced.map((s) => s.target));
  const orphans = await findOrphans(targetSection, syncedSet);
  tracker.setOrphans(orphans);

  // Build and write report.
  const report = tracker.build({
    vcShellVersion,
    timestamp: new Date().toISOString(),
  });
  const md = formatReport(report);
  const reportPath = args.reportPath ?? path.join(process.cwd(), "sync-report.md");
  await fs.writeFile(reportPath, md, "utf8");

  // Print summary to stdout.
  console.log(chalk.bold(`vc-shell@${vcShellVersion} → ${args.target}`));
  console.log(`  changes: ${report.changes.length}`);
  console.log(`  skipped: ${report.skipped.length}`);
  console.log(`  orphans: ${orphans.length}`);
  console.log(`  errors:  ${report.errors.length}`);
  console.log(`  report:  ${reportPath}`);

  return { exitCode: report.errors.length > 0 ? 1 : 0 };
}

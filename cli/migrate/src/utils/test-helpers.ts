import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import jscodeshift from "jscodeshift";
import type { Transform } from "../transforms/types.js";

/**
 * Apply a jscodeshift transform to source code and return the result.
 */
export function applyTransform(
  transform: Transform,
  input: { path: string; source: string },
  options: Record<string, unknown> = {},
): string | null {
  const j = jscodeshift.withParser("tsx");
  const api = {
    jscodeshift: j,
    j,
    stats: () => {},
    report: () => {},
  };
  return transform({ path: input.path, source: input.source }, api as any, { ...options } as any);
}

/**
 * Apply a transform and also capture api.report() messages.
 */
export function applyTransformWithReports(
  transform: Transform,
  input: { path: string; source: string },
  options: Record<string, unknown> = {},
): { result: string | null; reports: string[] } {
  const reports: string[] = [];
  const j = jscodeshift.withParser("tsx");
  const api = {
    jscodeshift: j,
    j,
    stats: () => {},
    report: (msg: string) => reports.push(msg),
  };
  const result = transform({ path: input.path, source: input.source }, api as any, { ...options } as any);
  return { result, reports };
}

/**
 * Run a fixture-based test: read input file, apply transform, compare with output file.
 * If no output file exists, expects transform to return null (no changes).
 * @param ext - file extension, default "ts". Use "vue" for SFC fixtures.
 */
export function defineFixtureTest(transform: Transform, fixturesDir: string, fixtureName: string, ext: string = "ts") {
  const inputPath = join(fixturesDir, `${fixtureName}.input.${ext}`);
  const outputPath = join(fixturesDir, `${fixtureName}.output.${ext}`);
  const input = readFileSync(inputPath, "utf8");
  const hasOutput = existsSync(outputPath);
  const expected = hasOutput ? readFileSync(outputPath, "utf8") : null;

  const result = applyTransform(transform, { path: inputPath, source: input });

  if (expected === null) {
    return { result, expected: null, match: result === null };
  }
  return { result, expected, match: result === expected };
}

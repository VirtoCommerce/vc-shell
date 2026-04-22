// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import transform from "../../../src/transforms/shims-to-globals";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";
import { tmpdir } from "node:os";

describe("shims-to-globals (jscodeshift)", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `shims-test-${Date.now()}`);
    mkdirSync(join(testDir, "src"), { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("adds globals to tsconfig types", () => {
    writeFileSync(
      join(testDir, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { types: ["vite/client"] } }, null, 2),
    );
    const { reports } = applyTransformWithReports(
      transform,
      {
        path: testDir,
        source: "",
      },
      { cwd: testDir },
    );
    expect(reports[0]).toContain("@vc-shell/framework/globals");
    const tsconfig = JSON.parse(readFileSync(join(testDir, "tsconfig.json"), "utf-8"));
    expect(tsconfig.compilerOptions.types).toContain("@vc-shell/framework/globals");
  });

  it("deletes standard boilerplate shims", () => {
    writeFileSync(join(testDir, "tsconfig.json"), JSON.stringify({ compilerOptions: {} }));
    writeFileSync(
      join(testDir, "src", "shims-vue.d.ts"),
      `declare module "*.vue" { }\ninterface CoreBladeAdditionalSettings {}`,
    );
    const { reports } = applyTransformWithReports(
      transform,
      {
        path: testDir,
        source: "",
      },
      { cwd: testDir },
    );
    expect(existsSync(join(testDir, "src", "shims-vue.d.ts"))).toBe(false);
    expect(reports.some((r) => r.includes("deleted"))).toBe(true);
  });

  it("warns on custom shims without deleting", () => {
    writeFileSync(join(testDir, "tsconfig.json"), JSON.stringify({ compilerOptions: {} }));
    writeFileSync(join(testDir, "src", "shims-vue.d.ts"), `declare module "*.custom" { export const x: string; }`);
    const { reports } = applyTransformWithReports(
      transform,
      {
        path: testDir,
        source: "",
      },
      { cwd: testDir },
    );
    expect(existsSync(join(testDir, "src", "shims-vue.d.ts"))).toBe(true);
    expect(reports.some((r) => r.includes("review manually"))).toBe(true);
  });

  it("prefers tsconfig.app.json over tsconfig.json", () => {
    writeFileSync(join(testDir, "tsconfig.json"), JSON.stringify({ compilerOptions: {} }));
    writeFileSync(join(testDir, "tsconfig.app.json"), JSON.stringify({ compilerOptions: { types: [] } }));
    applyTransformWithReports(transform, { path: testDir, source: "" }, { cwd: testDir });
    const appTsconfig = JSON.parse(readFileSync(join(testDir, "tsconfig.app.json"), "utf-8"));
    expect(appTsconfig.compilerOptions.types).toContain("@vc-shell/framework/globals");
    // tsconfig.json should be untouched
    const baseTsconfig = JSON.parse(readFileSync(join(testDir, "tsconfig.json"), "utf-8"));
    expect(baseTsconfig.compilerOptions.types).toBeUndefined();
  });
});

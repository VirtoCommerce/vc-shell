import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import transform from "../../../src/transforms/remove-release-config";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("remove-release-config", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "migrate-test-"));
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it("removes release-config from devDependencies and release script from package.json", () => {
    const pkg = {
      name: "test",
      scripts: { serve: "vite", release: "tsx scripts/release.ts --dry" },
      devDependencies: { "@vc-shell/release-config": "^1.1.61", typescript: "^5.0.0" },
    };
    writeFileSync(join(cwd, "package.json"), JSON.stringify(pkg, null, 2));
    mkdirSync(join(cwd, "scripts"));
    writeFileSync(join(cwd, "scripts", "release.ts"), 'import { release } from "@vc-shell/release-config";');

    const { reports } = applyTransformWithReports(transform, { path: "package.json", source: "" }, { cwd });

    const updatedPkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
    expect(updatedPkg.devDependencies["@vc-shell/release-config"]).toBeUndefined();
    expect(updatedPkg.scripts.release).toBeUndefined();
    expect(updatedPkg.scripts.serve).toBe("vite");
    expect(existsSync(join(cwd, "scripts"))).toBe(false);
    expect(reports.length).toBeGreaterThan(0);
  });

  it("keeps scripts/ dir if it has non-release files", () => {
    const pkg = {
      name: "test",
      scripts: { release: "tsx scripts/release.ts" },
      devDependencies: { "@vc-shell/release-config": "^1.1.61" },
    };
    writeFileSync(join(cwd, "package.json"), JSON.stringify(pkg, null, 2));
    mkdirSync(join(cwd, "scripts"));
    writeFileSync(join(cwd, "scripts", "release.ts"), 'import { release } from "@vc-shell/release-config";');
    writeFileSync(join(cwd, "scripts", "custom.ts"), "export const x = 1;");

    applyTransformWithReports(transform, { path: "package.json", source: "" }, { cwd });

    expect(existsSync(join(cwd, "scripts", "custom.ts"))).toBe(true);
    expect(existsSync(join(cwd, "scripts", "release.ts"))).toBe(false);
  });

  it("does nothing if release-config is not present", () => {
    const pkg = {
      name: "test",
      scripts: { serve: "vite" },
      devDependencies: { typescript: "^5.0.0" },
    };
    writeFileSync(join(cwd, "package.json"), JSON.stringify(pkg, null, 2));

    const { reports } = applyTransformWithReports(transform, { path: "package.json", source: "" }, { cwd });

    expect(reports).toHaveLength(0);
  });
});

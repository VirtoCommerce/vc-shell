// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { updateDependencyVersions } from "../../src/dep-updater";

vi.mock("../../src/baseline-versions", () => ({
  BASELINE_VERSIONS: {
    eslint: "^9.35.0",
    vite: "^6.3.3",
  },
}));

function writePackage(dir: string, pkg: unknown): string {
  const path = join(dir, "package.json");
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
  return path;
}

function readPackage(path: string): {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [k: string]: unknown;
} {
  return JSON.parse(readFileSync(path, "utf-8"));
}

describe("updateDependencyVersions", () => {
  it("applies both @vc-shell/* bump and baseline alignment in a single write", () => {
    const dir = mkdtempSync(join(tmpdir(), "dep-updater-test-"));
    const pkgPath = writePackage(dir, {
      dependencies: { "@vc-shell/framework": "^1.0.0" },
      devDependencies: { "@vc-shell/ts-config": "^1.0.0", eslint: "^8.0.0", vite: "^5.0.0" },
    });

    const changes = updateDependencyVersions(dir, "2.0.0-alpha.33", false);

    expect(changes).toContain("@vc-shell/framework: ^1.0.0 → ^2.0.0-alpha.33");
    expect(changes).toContain("@vc-shell/ts-config: ^1.0.0 → ^2.0.0-alpha.33");
    expect(changes).toContain("eslint: ^8.0.0 → ^9.35.0");
    expect(changes).toContain("vite: ^5.0.0 → ^6.3.3");

    const written = readPackage(pkgPath);
    expect(written.dependencies!["@vc-shell/framework"]).toBe("^2.0.0-alpha.33");
    expect(written.devDependencies!["@vc-shell/ts-config"]).toBe("^2.0.0-alpha.33");
    expect(written.devDependencies!.eslint).toBe("^9.35.0");
    expect(written.devDependencies!.vite).toBe("^6.3.3");
  });

  it("does not write the file when dryRun is true", () => {
    const dir = mkdtempSync(join(tmpdir(), "dep-updater-test-"));
    const original = {
      dependencies: { "@vc-shell/framework": "^1.0.0" },
      devDependencies: { eslint: "^8.0.0" },
    };
    const pkgPath = writePackage(dir, original);

    const changes = updateDependencyVersions(dir, "2.0.0-alpha.33", true);

    expect(changes.length).toBeGreaterThan(0);
    expect(readPackage(pkgPath)).toEqual(original);
  });

  it("returns empty array when there is no package.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "dep-updater-test-"));
    const changes = updateDependencyVersions(dir, "2.0.0-alpha.33", false);
    expect(changes).toEqual([]);
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  it("preserves resolutions and packageManager fields", () => {
    const dir = mkdtempSync(join(tmpdir(), "dep-updater-test-"));
    const pkgPath = writePackage(dir, {
      dependencies: { "@vc-shell/framework": "^1.0.0" },
      devDependencies: { eslint: "^8.0.0" },
      resolutions: { "conventional-changelog-angular": "^8.3.0" },
      packageManager: "yarn@4.9.1",
    });

    updateDependencyVersions(dir, "2.0.0-alpha.33", false);

    const written = readPackage(pkgPath);
    expect(written.resolutions).toEqual({ "conventional-changelog-angular": "^8.3.0" });
    expect(written.packageManager).toBe("yarn@4.9.1");
  });

  it("propagates JSON.parse errors on malformed package.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "dep-updater-test-"));
    writeFileSync(join(dir, "package.json"), "{ not valid json");
    expect(() => updateDependencyVersions(dir, "2.0.0-alpha.33", false)).toThrow();
  });
});

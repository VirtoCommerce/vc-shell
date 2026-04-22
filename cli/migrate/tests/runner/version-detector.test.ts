// @vitest-environment node
import { describe, it, expect } from "vitest";
import { detectFrameworkVersion } from "../../src/version-detector";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("detectFrameworkVersion", () => {
  it("reads version from package.json dependency", () => {
    const dir = mkdtempSync(join(tmpdir(), "codemod-test-"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        dependencies: { "@vc-shell/framework": "^1.5.0" },
      }),
    );
    expect(detectFrameworkVersion(dir)).toBe("1.5.0");
  });

  it("reads version from devDependencies", () => {
    const dir = mkdtempSync(join(tmpdir(), "codemod-test-"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        devDependencies: { "@vc-shell/framework": "2.0.0-alpha.8" },
      }),
    );
    expect(detectFrameworkVersion(dir)).toBe("2.0.0-alpha.8");
  });

  it("falls back to node_modules for workspace:*", () => {
    const dir = mkdtempSync(join(tmpdir(), "codemod-test-"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        dependencies: { "@vc-shell/framework": "workspace:*" },
      }),
    );
    const nmDir = join(dir, "node_modules", "@vc-shell", "framework");
    mkdirSync(nmDir, { recursive: true });
    writeFileSync(join(nmDir, "package.json"), JSON.stringify({ version: "2.0.0-alpha.11" }));
    expect(detectFrameworkVersion(dir)).toBe("2.0.0-alpha.11");
  });

  it("returns null when framework not found", () => {
    const dir = mkdtempSync(join(tmpdir(), "codemod-test-"));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ dependencies: {} }));
    expect(detectFrameworkVersion(dir)).toBeNull();
  });
});

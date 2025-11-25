/**
 * App Detector Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { detectVcShellApp, validateCwdForGeneration } from "../utils/app-detector";

describe("App Detector", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vcshell-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("detectVcShellApp", () => {
    it("should return invalid for non-existent directory", () => {
      const result = detectVcShellApp("/non/existent/path");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should return invalid when no package.json exists", () => {
      const result = detectVcShellApp(tempDir);
      expect(result.isValid).toBe(false);
      expect(result.hasPackageJson).toBe(false);
    });

    it("should return invalid when no @vc-shell dependencies", () => {
      fs.writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "test", dependencies: { vue: "^3.0.0" } }),
      );
      const result = detectVcShellApp(tempDir);
      expect(result.isValid).toBe(false);
      expect(result.hasVcShellDependencies).toBe(false);
    });

    it("should return valid for VC-Shell project", () => {
      fs.writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "test-app",
          dependencies: { "@vc-shell/framework": "^1.0.0" },
        }),
      );
      const result = detectVcShellApp(tempDir);
      expect(result.isValid).toBe(true);
      expect(result.isVcShellApp).toBe(true);
      expect(result.projectName).toBe("test-app");
    });

    it("should detect @vc-shell in devDependencies", () => {
      fs.writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "test",
          devDependencies: { "@vc-shell/create-vc-app": "^1.0.0" },
        }),
      );
      const result = detectVcShellApp(tempDir);
      expect(result.isValid).toBe(true);
      expect(result.hasVcShellDependencies).toBe(true);
    });
  });

  describe("validateCwdForGeneration", () => {
    it("should return invalid when cwd not provided", () => {
      const result = validateCwdForGeneration(undefined);
      expect(result.valid).toBe(false);
    });

    it("should return valid for VC-Shell project", () => {
      fs.writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "test",
          dependencies: { "@vc-shell/framework": "^1.0.0" },
        }),
      );
      const result = validateCwdForGeneration(tempDir);
      expect(result.valid).toBe(true);
      expect(path.isAbsolute(result.cwd)).toBe(true);
    });
  });
});

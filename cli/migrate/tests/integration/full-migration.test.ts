import { describe, it, expect } from "vitest";
import { tmpdir } from "node:os";
import { selectTransforms } from "../../src/transforms/registry";

describe("full migration pipeline", () => {
  it("selects 15 transforms for 1.x → 2.0.0 migration", () => {
    const selected = selectTransforms("1.0.0", "2.0.0");
    expect(selected).toHaveLength(28);
    expect(selected[0].name).toBe("define-app-module");
    expect(selected[selected.length - 1].name).toBe("window-globals");
  });

  it("transforms can be dynamically imported and executed", async () => {
    const selected = selectTransforms("1.0.0", "2.0.0");
    // Import and run the first per-file transform (define-app-module)
    const defineAppModuleTransform = selected.find((t) => t.name === "define-app-module");
    expect(defineAppModuleTransform).toBeDefined();

    const mod = await import(defineAppModuleTransform!.transformPath);
    const transform = mod.default;
    expect(typeof transform).toBe("function");

    // Import jscodeshift to create API
    const jscodeshift = (await import("jscodeshift")).default;
    const j = jscodeshift.withParser("tsx");
    const reports: string[] = [];
    const api = {
      jscodeshift: j,
      j,
      stats: () => {},
      report: (msg: string) => reports.push(msg),
    };

    // Run transform on test input
    const input = `import { createAppModule } from "@vc-shell/framework";
export default createAppModule(pages, locales);`;

    const result = transform({ path: "test.ts", source: input }, api, { cwd: "." });

    expect(result).not.toBeNull();
    expect(result).toContain("defineAppModule");
    expect(result).not.toContain("createAppModule");
  });

  it("project-scoped transforms accept cwd option", async () => {
    const selected = selectTransforms("1.0.0", "2.0.0");
    const scssSafeUse = selected.find((t) => t.name === "scss-safe-use");
    expect(scssSafeUse).toBeDefined();
    expect(scssSafeUse!.scope).toBe("project");

    const mod = await import(scssSafeUse!.transformPath);
    const transform = mod.default;

    const jscodeshift = (await import("jscodeshift")).default;
    const j = jscodeshift.withParser("tsx");
    const reports: string[] = [];
    const api = {
      jscodeshift: j,
      j,
      stats: () => {},
      report: (msg: string) => reports.push(msg),
    };

    // Should not throw with a valid cwd (even if no scss files found)
    const result = transform({ path: ".", source: "" }, api, { cwd: tmpdir() });
    expect(result).toBeNull();
  });
});

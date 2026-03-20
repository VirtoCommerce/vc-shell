import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/rewrite-imports";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("rewrite-imports (jscodeshift)", () => {
  it("moves aiAgentPlugin to sub-entry", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { aiAgentPlugin, useBlade } from "@vc-shell/framework";`,
    });
    expect(result).toContain('from "@vc-shell/framework/ai-agent"');
    expect(result).toContain('from "@vc-shell/framework"');
    expect(result).toContain("useBlade");
    expect(result).not.toMatch(/aiAgentPlugin.*@vc-shell\/framework"/);
  });

  it("removes original import when all specifiers moved", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { aiAgentPlugin, useAiAgent } from "@vc-shell/framework";`,
    });
    expect(result).toContain('from "@vc-shell/framework/ai-agent"');
    expect(result).not.toContain('"@vc-shell/framework"');
  });

  it("moves extension symbols to /extensions", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { defineExtensionPoint } from "@vc-shell/framework";`,
    });
    expect(result).toContain('from "@vc-shell/framework/extensions"');
  });

  it("preserves aliases", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { aiAgentPlugin as aap } from "@vc-shell/framework";`,
    });
    expect(result).toContain("aiAgentPlugin as aap");
    expect(result).toContain("@vc-shell/framework/ai-agent");
  });

  it("skips files without framework import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";`,
    });
    expect(result).toBeNull();
  });

  it("skips files with no moveable symbols", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";`,
    });
    expect(result).toBeNull();
  });
});

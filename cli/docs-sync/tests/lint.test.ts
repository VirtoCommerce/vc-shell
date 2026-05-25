import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { runLint } from "../src/lint/runner.js";

describe("runLint", () => {
  it("returns errors for files without frontmatter", async () => {
    const result = await runLint({
      sources: [{ absPath: "/abs/x.docs.md", relPath: "framework/x.docs.md", raw: "# no frontmatter" }],
      knownStoryIds: new Set(),
    });
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].rule).toBe("frontmatter-required");
  });

  it("passes for valid files", async () => {
    const valid = `---\ntitle: Foo\ncategory: components\ngroup: misc\n---\n\n# Foo\n`;
    const result = await runLint({
      sources: [{ absPath: "/abs/x.docs.md", relPath: "framework/x.docs.md", raw: valid }],
      knownStoryIds: new Set(),
    });
    expect(result.errors).toEqual([]);
  });

  it("flags unknown ::storybook id", async () => {
    const raw = `---\ntitle: X\ncategory: components\ngroup: misc\n---\n\n::storybook id="bogus"\n`;
    const result = await runLint({
      sources: [{ absPath: "/x.docs.md", relPath: "x.docs.md", raw }],
      knownStoryIds: new Set(["real-id"]),
    });
    expect(result.errors.find((e) => e.rule === "storybook-id-valid")).toBeTruthy();
  });

  it("rejects blade metadata in defineOptions", async () => {
    const raw = `---\ntitle: X\ncategory: components\ngroup: misc\n---\n\n\`\`\`vue\n<script setup lang="ts">\ndefineOptions({ name: "Orders", url: "/orders", isWorkspace: true });\n</script>\n\`\`\`\n`;
    const result = await runLint({
      sources: [{ absPath: "/x.docs.md", relPath: "x.docs.md", raw }],
      knownStoryIds: new Set(),
    });
    expect(result.errors.find((e) => e.rule === "blade-metadata-define-options")).toBeTruthy();
  });

  it("requires pseudo-code marker for fictional client imports", async () => {
    const raw = `---\ntitle: X\ncategory: composables\ngroup: data\n---\n\n\`\`\`ts\nimport { OrdersClient } from "@api/orders";\n\`\`\`\n`;
    const result = await runLint({
      sources: [{ absPath: "/x.docs.md", relPath: "x.docs.md", raw }],
      knownStoryIds: new Set(),
    });
    expect(result.errors.find((e) => e.rule === "pseudo-code-client-marker")).toBeTruthy();
  });

  it("checks all client imports in a code block", async () => {
    const raw = `---\ntitle: X\ncategory: composables\ngroup: data\n---\n\n\`\`\`ts\nimport { SecurityClient } from "@vc-shell/framework";\nimport { OrdersClient } from "@api/orders";\n\`\`\`\n`;
    const result = await runLint({
      sources: [{ absPath: "/x.docs.md", relPath: "x.docs.md", raw }],
      knownStoryIds: new Set(),
    });
    expect(result.errors.find((e) => e.rule === "pseudo-code-client-marker")).toBeTruthy();
  });

  it("allows client imports with pseudo-code marker", async () => {
    const raw = `---\ntitle: X\ncategory: composables\ngroup: data\n---\n\n\`\`\`ts\n// pseudo-code: replace OrdersClient with your generated API client\nimport { OrdersClient } from "@api/orders";\n\`\`\`\n`;
    const result = await runLint({
      sources: [{ absPath: "/x.docs.md", relPath: "x.docs.md", raw }],
      knownStoryIds: new Set(),
    });
    expect(result.errors.find((e) => e.rule === "pseudo-code-client-marker")).toBeFalsy();
  });

  it("tracks the public vc-app command list", async () => {
    const runtimePath = resolve(process.cwd(), "../../cli/vc-app-skill/runtime/vc-app.md");
    const raw = readFileSync(runtimePath, "utf8");
    const result = await runLint({
      sources: [{ absPath: runtimePath, relPath: "cli/vc-app-skill/runtime/vc-app.md", raw }],
      knownStoryIds: new Set(),
    });
    expect(result.warnings.find((e) => e.rule === "vc-app-command-drift")).toBeFalsy();
  });
});

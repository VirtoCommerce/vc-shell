import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { computeTargetPath, writeMarkdown } from "../src/writer/writer.js";
import type { Frontmatter } from "../src/types.js";

describe("computeTargetPath", () => {
  it("uses category/group/slug.md when slug is provided", () => {
    const fm: Frontmatter = {
      title: "VcDataTable",
      category: "components",
      group: "data-display",
      slug: "vc-data-table",
    };
    expect(computeTargetPath(fm, "vc-data-table.docs.md")).toBe("components/data-display/vc-data-table.md");
  });

  it("falls back to source filename without .docs.md", () => {
    const fm: Frontmatter = { title: "VcButton", category: "components", group: "misc" };
    expect(computeTargetPath(fm, "vc-button.docs.md")).toBe("components/misc/vc-button.md");
  });

  it("treats group=root as no group folder for concepts", () => {
    const fm: Frontmatter = { title: "Services", category: "concepts", group: "root", slug: "services" };
    expect(computeTargetPath(fm, "services.docs.md")).toBe("concepts/services.md");
  });

  it("supports nested groups (reference/api/directives)", () => {
    const fm: Frontmatter = { title: "v-loading", category: "reference", group: "api/directives", slug: "v-loading" };
    expect(computeTargetPath(fm, "loading.docs.md")).toBe("reference/api/directives/v-loading.md");
  });
});

describe("writeMarkdown", () => {
  let tmp: string;
  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "docs-sync-"));
  });
  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("creates the file and parent directories", async () => {
    const result = await writeMarkdown(tmp, "components/misc/x.md", "# x");
    expect(result.kind).toBe("created");
    const onDisk = await fs.readFile(path.join(tmp, "components/misc/x.md"), "utf8");
    expect(onDisk).toBe("# x");
  });

  it("returns 'unchanged' when content is identical", async () => {
    await writeMarkdown(tmp, "x.md", "same");
    const result = await writeMarkdown(tmp, "x.md", "same");
    expect(result.kind).toBe("unchanged");
  });

  it("returns 'updated' when content differs", async () => {
    await writeMarkdown(tmp, "x.md", "v1");
    const result = await writeMarkdown(tmp, "x.md", "v2");
    expect(result.kind).toBe("updated");
  });
});
